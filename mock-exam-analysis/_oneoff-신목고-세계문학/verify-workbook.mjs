#!/usr/bin/env node
/* ===================================================================
 * 워크북 데이터 무결성 검증 — 신목고 세계문학 (U1)
 * ===================================================================
 *
 * 분석지의 verify.mjs 가 "문장 누락 0" 을 강제하듯, 워크북은
 * "출제 항목이 전부 본문에 실재하는가" 를 강제한다.
 * 워크북 문항은 본문을 변형해 만들기 때문에, 검증 없이는
 * 원문에 없는 문장/단어를 지어낸 문항이 조용히 섞여 들어간다.
 *
 * 강제 항목:
 *   1. ref_sentence 가 본문 범위 안 (1..passage.length)
 *   2. en_template 의 {{n:A/B}} 에서 정답(A)을 넣어 복원한 문장이
 *      본문 원문과 정확히 일치 (구두점까지)
 *   3. answers 배열이 {{}} 토큰 수와 일치, 각 정답이 A 슬롯과 일치
 *   4. fill_first_letter 의 answer 가 해당 문장에 실제 등장 +
 *      letter 가 answer 의 첫 글자와 일치
 *   5. jumble.words 를 정렬-비교했을 때 answer 의 토큰 집합과 일치,
 *      answer 가 본문 문장과 일치
 *   6. mixed.ref 가 각 유형에 실재하는 no
 *   7. voca_check 의 answer 가 전부 본문에 등장
 *   8. no 가 1..n 연속
 *
 * 사용법:
 *   node _oneoff-신목고-세계문학/verify-workbook.mjs        # 전체
 *   node _oneoff-신목고-세계문학/verify-workbook.mjs U1
 * =================================================================== */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

let errors = 0;
let warns = 0;
const fail = (where, msg) => { errors++; console.error(`  ❌ [${where}] ${msg}`); };
const warn = (where, msg) => { warns++;  console.warn(`  ⚠️  [${where}] ${msg}`); };

/* 비교용 정규화 — 따옴표/대시 변종과 공백 흔들림만 흡수하고
 * 단어·구두점 자체는 보존한다(내용 변조는 잡아야 하므로). */
function norm(s) {
  return String(s ?? '')
    .replace(/\(\s*[a-e]\s*\)/g, '')      // 분석지 보기 표식 (a)~(e)
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[‐-―]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

/* {{n:A/B}} 에서 A(정답)를 채워 원문을 복원 */
function restoreTemplate(tmpl) {
  return String(tmpl).replace(/\{\{(\d+):([^\/]+)\/([^}]+)\}\}/g, (_, n, a) => a.trim());
}
function templateSlots(tmpl) {
  const out = [];
  const re = /\{\{(\d+):([^\/]+)\/([^}]+)\}\}/g;
  let m;
  while ((m = re.exec(String(tmpl)))) out.push({ idx: +m[1], a: m[2].trim(), b: m[3].trim() });
  return out;
}

/* 어형 변화를 흡수한 본문 등장 검사 (분석지 verify.mjs 와 같은 철학) */
function appearsInPassage(word, passageText) {
  const w = String(word).toLowerCase().trim();
  if (!w) return false;
  const hay = passageText.toLowerCase();
  if (hay.includes(w)) return true;
  // 구(phrase)는 그대로만 인정
  if (/\s/.test(w)) return false;
  const stem = w
    .replace(/(ing|ed|es|s|ly|er|est)$/, '')
    .replace(/([^aeiou])\1$/, '$1');   // running → run
  if (stem.length >= 4 && hay.includes(stem)) return true;
  // -e 탈락형 (create → creating)
  if (stem.length >= 3 && hay.includes(stem + 'e')) return true;
  return false;
}

function checkNoSequence(where, arr, label) {
  arr.forEach((it, i) => {
    if (it.no !== i + 1) fail(where, `${label}[${i}].no=${it.no} — 1..n 연속이어야 함`);
  });
}

function verifyOne(lesson, n) {
  const where = `${lesson}/${n}`;
  const dataPath = path.join(HERE, 'data', lesson, `${n}.json`);
  const wbPath   = path.join(HERE, 'data', lesson, `${n}-workbook.json`);

  if (!fs.existsSync(wbPath)) { fail(where, `${n}-workbook.json 없음`); return; }

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const wb   = JSON.parse(fs.readFileSync(wbPath, 'utf8'));

  const passage = (data.passage || []).map(norm);
  const N = passage.length;
  const passageText = passage.join(' ');

  const inRange = (r) => Number.isInteger(r) && r >= 1 && r <= N;

  // ── 1·2·3. 양자택일 (어법/어휘) ──
  for (const [key, label] of [['grammar_choice', '어법'], ['vocab_choice', '어휘']]) {
    const arr = wb[key] || [];
    if (!arr.length) fail(where, `${key} 비어 있음`);
    checkNoSequence(where, arr, key);
    for (const it of arr) {
      if (!inRange(it.ref_sentence)) {
        fail(where, `${label} #${it.no} ref_sentence=${it.ref_sentence} 범위 밖 (1..${N})`);
        continue;
      }
      const src = passage[it.ref_sentence - 1];
      const restored = norm(restoreTemplate(it.en_template));
      if (restored !== src) {
        fail(where, `${label} #${it.no} 정답 복원문이 본문과 불일치\n      본문: ${src}\n      복원: ${restored}`);
      }
      const slots = templateSlots(it.en_template);
      if (!slots.length) fail(where, `${label} #${it.no} {{n:A/B}} 토큰 없음`);
      if ((it.answers || []).length !== slots.length) {
        fail(where, `${label} #${it.no} answers(${(it.answers || []).length}) ≠ 토큰(${slots.length})`);
      } else {
        slots.forEach((s, i) => {
          if (norm(s.a) !== norm(it.answers[i])) {
            fail(where, `${label} #${it.no} 슬롯${i + 1} 정답 불일치: 템플릿 A="${s.a}" vs answers="${it.answers[i]}"`);
          }
          if (norm(s.a) === norm(s.b)) {
            fail(where, `${label} #${it.no} 슬롯${i + 1} 정답/오답이 동일 ("${s.a}")`);
          }
        });
      }
      if ((it.explain || []).length !== slots.length) {
        warn(where, `${label} #${it.no} explain(${(it.explain || []).length}) ≠ 토큰(${slots.length})`);
      }
      if (!it.ko_full) warn(where, `${label} #${it.no} ko_full 없음`);
    }
  }

  // ── 4. 빈칸 첫글자 ──
  {
    const arr = wb.fill_first_letter || [];
    if (!arr.length) fail(where, 'fill_first_letter 비어 있음');
    checkNoSequence(where, arr, 'fill_first_letter');
    for (const it of arr) {
      if (!inRange(it.ref_sentence)) {
        fail(where, `빈칸 #${it.no} ref_sentence=${it.ref_sentence} 범위 밖`);
        continue;
      }
      const src = passage[it.ref_sentence - 1];
      if (!(it.hints || []).length) fail(where, `빈칸 #${it.no} hints 없음`);
      for (const h of (it.hints || [])) {
        const ans = String(h.answer || '');
        // 빌더가 \b<answer>\b 로 치환하므로 그 정규식이 실제로 맞아야 함
        const re = new RegExp(`\\b${ans.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (!re.test(src)) {
          fail(where, `빈칸 #${it.no} answer="${ans}" 가 문장 ${it.ref_sentence} 에 없음\n      문장: ${src}`);
        }
        if (!h.letter || h.letter[0].toLowerCase() !== ans[0]?.toLowerCase()) {
          fail(where, `빈칸 #${it.no} letter="${h.letter}" 가 answer="${ans}" 첫 글자와 불일치`);
        }
      }
      if (!it.ko_full) warn(where, `빈칸 #${it.no} ko_full 없음`);
    }
  }

  // ── 5. 한글 해석 / 통문장 영작 ──
  for (const [key, label] of [['ko_translation', '해석'], ['sentence_translation', '영작']]) {
    const arr = wb[key] || [];
    if (!arr.length) fail(where, `${key} 비어 있음`);
    checkNoSequence(where, arr, key);
    for (const it of arr) {
      if (!inRange(it.ref_sentence)) fail(where, `${label} #${it.no} ref_sentence=${it.ref_sentence} 범위 밖`);
    }
  }

  // ── 6. 영문 배열 ──
  {
    const arr = wb.jumble || [];
    if (!arr.length) fail(where, 'jumble 비어 있음');
    checkNoSequence(where, arr, 'jumble');
    for (const it of arr) {
      if (!inRange(it.ref_sentence)) {
        fail(where, `배열 #${it.no} ref_sentence=${it.ref_sentence} 범위 밖`);
        continue;
      }
      const src = passage[it.ref_sentence - 1];
      if (norm(it.answer) !== src) {
        fail(where, `배열 #${it.no} answer 가 본문과 불일치\n      본문: ${src}\n      answer: ${norm(it.answer)}`);
      }
      // words 를 이어붙인 것이 answer 의 토큰과 같아야 함(구두점 제외)
      const bare = (s) => norm(s).replace(/[.,!?;:"']/g, '').split(/\s+/).filter(Boolean).sort().join(' ');
      if (bare(it.words.join(' ')) !== bare(it.answer)) {
        fail(where, `배열 #${it.no} words 가 answer 의 단어 집합과 불일치\n      words:  ${bare(it.words.join(' '))}\n      answer: ${bare(it.answer)}`);
      }
    }
  }

  // ── 7. mixed 참조 정합 ──
  {
    const arr = wb.mixed || [];
    if (!arr.length) fail(where, 'mixed 비어 있음');
    checkNoSequence(where, arr, 'mixed');
    const pool = {
      grammar: new Set((wb.grammar_choice || []).map(x => x.no)),
      vocab:   new Set((wb.vocab_choice || []).map(x => x.no)),
      fill:    new Set((wb.fill_first_letter || []).map(x => x.no)),
      ko:      new Set((wb.ko_translation || []).map(x => x.no)),
      jumble:  new Set((wb.jumble || []).map(x => x.no)),
      sent:    new Set((wb.sentence_translation || []).map(x => x.no)),
    };
    for (const m of arr) {
      if (!pool[m.kind]) { fail(where, `mixed #${m.no} kind="${m.kind}" 알 수 없음`); continue; }
      if (!pool[m.kind].has(m.ref)) fail(where, `mixed #${m.no} ${m.kind} no=${m.ref} 존재하지 않음`);
    }
  }

  // ── 8. voca_check 본문 등장 ──
  {
    const vc = wb.voca_check || {};
    for (const key of ['en_to_ko', 'ko_to_en', 'definitions', 'expressions']) {
      if (!(vc[key] || []).length) warn(where, `voca_check.${key} 비어 있음`);
    }
    for (const it of (vc.en_to_ko || [])) {
      if (!appearsInPassage(it.word, passageText)) warn(where, `voca_check.en_to_ko "${it.word}" 본문 미등장`);
    }
    for (const key of ['ko_to_en', 'definitions', 'expressions']) {
      for (const it of (vc[key] || [])) {
        if (!appearsInPassage(it.answer, passageText)) warn(where, `voca_check.${key} "${it.answer}" 본문 미등장`);
      }
    }
  }

  // ── 9. 커버리지 리포트 (본문 문장이 어떤 유형에도 안 걸리면 경고) ──
  {
    const covered = new Set();
    for (const key of ['grammar_choice', 'vocab_choice', 'fill_first_letter',
                       'ko_translation', 'jumble', 'sentence_translation']) {
      for (const it of (wb[key] || [])) covered.add(it.ref_sentence);
    }
    const missing = [];
    for (let i = 1; i <= N; i++) if (!covered.has(i)) missing.push(i);
    if (missing.length) warn(where, `본문 ${N}문장 중 미출제 문장: ${missing.join(', ')}`);
    console.log(`  ℹ️  ${where}: 본문 ${N}문장 · 커버 ${covered.size} · ` +
      `어법 ${(wb.grammar_choice || []).length} 어휘 ${(wb.vocab_choice || []).length} ` +
      `빈칸 ${(wb.fill_first_letter || []).length} 해석 ${(wb.ko_translation || []).length} ` +
      `배열 ${(wb.jumble || []).length} 영작 ${(wb.sentence_translation || []).length} ` +
      `종합 ${(wb.mixed || []).length}`);
  }
}

const arg = process.argv[2];
const lessons = arg ? [arg] : ['U1'];

console.log('🔍 워크북 무결성 검증\n');
for (const lesson of lessons) {
  console.log(`── ${lesson} ──`);
  // 챕터 수는 디스크에서 탐지한다 — 지문이 추가돼도 스크립트를 고칠 필요가 없다.
  const chapters = fs.readdirSync(path.join(HERE, 'data', lesson))
    .map(f => /^(\d+)-workbook\.json$/.exec(f))
    .filter(Boolean)
    .map(m => +m[1])
    .sort((a, b) => a - b);
  if (!chapters.length) { fail(lesson, `data/${lesson} 에 *-workbook.json 이 없음`); }
  for (const n of chapters) verifyOne(lesson, n);
  console.log('');
}

if (errors) {
  console.error(`\n❌ 실패: 오류 ${errors}건 · 경고 ${warns}건 — 빌드 금지`);
  process.exit(1);
}
console.log(`\n✅ 통과: 오류 0건 · 경고 ${warns}건`);
