#!/usr/bin/env node
/* 2026-09 고2 데이터 정합성 검사 — 빌드 전 게이트
 * 사용: node 2026-sep-grade2/_qa-check.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DATA = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'data');
const NOS = [18,19,20,21,22,23,24,26,29,30,31,32,33,34,35,36,37,38,39,40,41,43];
const EXAM = '[2026] 9월 모의고사 2학년';

let err = 0, warn = 0;
const E = (n, m) => { console.log(`  \x1b[31mERROR\x1b[0m [${n}] ${m}`); err++; };
const W = (n, m) => { console.log(`  \x1b[33mWARN \x1b[0m [${n}] ${m}`); warn++; };

function load(f) {
  const p = path.join(DATA, f);
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) { return { __parse_error: e.message }; }
}

/* build-workbook.mjs 의 buildProperNounSet 과 동일한 로직.
 * 이 집합에 든 단어가 정답이면 빌더가 그 문항을 '에러 없이' 삭제한다. */
function buildProperNounSet(data) {
  const set = new Set();
  for (const sent of (data.passage || [])) {
    const clean = String(sent).replace(/\([a-e]\)/g, '');
    const tokens = clean.match(/[A-Za-z][A-Za-z.'-]*/g) || [];
    tokens.forEach((tok, idx) => {
      const bare = tok.replace(/[.''-]+$/g, '');
      if (!bare) return;
      const isCap = /^[A-Z]/.test(bare);
      const isAllCaps = /^[A-Z]{2,}$/.test(bare);
      if (isCap && (idx > 0 || isAllCaps)) set.add(bare.toLowerCase());
    });
  }
  const cap = {}, low = {};
  for (const sent of (data.passage || [])) {
    const clean = String(sent).replace(/\([a-e]\)/g, '');
    for (const tok of (clean.match(/[A-Za-z][A-Za-z.'-]*/g) || [])) {
      const bare = tok.replace(/[.''-]+$/g, '');
      if (!bare) continue;
      if (/^[A-Z]/.test(bare)) cap[bare.toLowerCase()] = (cap[bare.toLowerCase()] || 0) + 1;
      else low[bare.toLowerCase()] = (low[bare.toLowerCase()] || 0) + 1;
    }
  }
  for (const w of Object.keys(cap)) if (cap[w] >= 1 && !low[w]) set.add(w);
  return set;
}

console.log('\n=== 분석지 ===');
for (const n of NOS) {
  const d = load(`${n}.json`);
  if (!d) { E(n, `${n}.json 없음`); continue; }
  if (d.__parse_error) { E(n, `JSON 파싱 실패 — ${d.__parse_error}`); continue; }

  if (d.exam !== EXAM) E(n, `exam 필드 불일치: "${d.exam}"`);
  if (d.question_no !== n) E(n, `question_no=${d.question_no} (파일명과 불일치)`);

  const P = d.passage?.length, K = d.passage_ko?.length, S = d.sentences?.length;
  if (!P) E(n, 'passage 비어 있음');
  if (P !== K) E(n, `passage(${P}) ≠ passage_ko(${K})`);
  if (P !== S) E(n, `passage(${P}) ≠ sentences(${S})`);

  if (d.vocab?.length !== 25) E(n, `vocab ${d.vocab?.length}개 (25개여야 함)`);
  if (d.flow?.length !== 4) E(n, `flow ${d.flow?.length}개 (4개여야 함)`);

  const cor = (d.choices || []).filter(c => c.correct);
  if (d.choices?.length !== 5) E(n, `choices ${d.choices?.length}개 (5개여야 함)`);
  if (cor.length !== 1) E(n, `정답 ${cor.length}개 (정확히 1개여야 함)`);

  // 정답 길이 균형 (한국어 보기 유형은 ko 기준)
  if (cor.length === 1 && d.choices?.length === 5) {
    const len = c => String(c.en || '').length || String(c.ko || '').length;
    const cl = len(cor[0]);
    const wrongs = d.choices.filter(c => !c.correct).map(len);
    const avg = wrongs.reduce((a, b) => a + b, 0) / wrongs.length;
    if (avg > 0 && cl > avg * 1.4) W(n, `정답이 오답 평균의 ${(cl / avg).toFixed(2)}배 — 길이로 찍힘`);
  }

  // 삽화
  const pr = d.illustration?.prompt || '';
  if (!pr) E(n, 'illustration.prompt 없음');
  else {
    if (!pr.includes('--ar 16:5')) E(n, '프롬프트에 --ar 16:5 없음');
    if (!pr.includes('--v 8.1')) E(n, '프롬프트에 --v 8.1 없음');
    if (/\bNO\s+[a-z]/.test(pr)) E(n, '프롬프트 본문에 인라인 "NO xxx" — --no 파라미터로 옮길 것');
    if (!/--no\s/.test(pr)) W(n, '프롬프트에 --no 파라미터 없음 (글자 차단 권장)');
  }

  // 각 문장 필수 키
  (d.sentences || []).forEach((s, i) => {
    if (!s.en_html) E(n, `sentences[${i}] en_html 없음`);
    if (!s.ko_full) E(n, `sentences[${i}] ko_full 없음`);
    if (!Array.isArray(s.points) || !s.points.length) W(n, `sentences[${i}] points 비어 있음`);
  });

  // 한글 띄어쓰기
  const koBlob = JSON.stringify(d.passage_ko || []) + JSON.stringify(d.flow || []);
  if (/ {2,}/.test(koBlob)) W(n, '한글 필드에 이중 공백');
}

console.log('\n=== 워크북 ===');
for (const n of NOS) {
  const w = load(`${n}-workbook.json`);
  const d = load(`${n}.json`);
  if (!w) { E(n, `${n}-workbook.json 없음`); continue; }
  if (w.__parse_error) { E(n, `워크북 JSON 파싱 실패 — ${w.__parse_error}`); continue; }
  if (w.$ref_source !== `${n}.json`) W(n, `워크북 $ref_source="${w.$ref_source}"`);

  const vc = w.voca_check || {};
  if ((vc.en_to_ko || []).length < 8) W(n, `en_to_ko ${(vc.en_to_ko || []).length}개 (10개 권장)`);
  if ((vc.ko_to_en || []).length < 8) W(n, `ko_to_en ${(vc.ko_to_en || []).length}개 (10개 권장)`);

  const pn = (d && !d.__parse_error) ? buildProperNounSet(d) : new Set();
  for (const k of ['grammar_choice', 'vocab_choice']) {
    for (const q of (w[k] || [])) {
      const toks = [...String(q.en_template || '').matchAll(/\{\{(\d+):([^/}]+)\/([^}]+)\}\}/g)];
      if (toks.length !== (q.answers || []).length) {
        E(n, `${k} #${q.no}: 토큰 ${toks.length}개 vs answers ${(q.answers || []).length}개`);
      }
      // 고유명사 오탐 함정 — 빌더가 이 문항을 에러 없이 통째로 삭제한다.
      const ansBare = (q.answers || []).map(a => String(a).toLowerCase().replace(/[^a-z'-]/g, ''));
      const hit = ansBare.find(a => pn.has(a));
      if (hit) {
        E(n, `${k} #${q.no}: 정답 "${hit}" 이 고유명사로 오판됨 — 빌더가 문항을 조용히 삭제함`);
      }
      for (const [, , a, b] of toks) {
        if (!(q.answers || []).includes(a.trim()) && !(q.answers || []).includes(b.trim())) {
          W(n, `${k} #${q.no}: 정답이 보기(${a}/${b})에 없음`);
        }
      }
    }
  }
  if (d && !d.__parse_error) {
    const sn = d.sentences?.length || 0;
    const gc = (w.grammar_choice || []).length;
    if (gc < sn * 0.7) W(n, `grammar_choice ${gc}개 / 본문 ${sn}문장 — 커버리지 부족`);
  }
}

console.log('\n=== 변형문제 ===');
const answerDist = {};
for (const n of NOS) {
  const v = load(`${n}-variant.json`);
  if (!v) { E(n, `${n}-variant.json 없음`); continue; }
  if (v.__parse_error) { E(n, `변형 JSON 파싱 실패 — ${v.__parse_error}`); continue; }
  if (v.passage_id !== n) W(n, `passage_id=${v.passage_id}`);

  const bt = v.by_type || {};
  const keys = Object.keys(bt);
  if (!keys.length) E(n, 'by_type 비어 있음');

  for (const k of keys) {
    if (k === 'writing') continue;
    const t = bt[k];
    if (!t) continue;
    const ans = t.answer;
    if (ans == null) { E(n, `${k}: answer 없음`); continue; }
    // 위치 종속 유형은 분포 집계 제외
    if (!['grammar', 'vocab', 'irrelevant', 'insert'].includes(k)) {
      answerDist[ans] = (answerDist[ans] || 0) + 1;
    }
    // 본문 내 문자열 일치 검사
    const body = (t.passage || []).join(' ');
    if (t.underlined && body && !body.includes(t.underlined)) {
      E(n, `${k}.underlined "${String(t.underlined).slice(0, 40)}..." 가 passage 에 글자 그대로 없음`);
    }

    /* 빈칸 렌더 가능성 검사 — 빌더(renderBlank)는 blank_sentence_index 문장에서만
     * ___ 또는 blank_target 을 찾아 빈칸으로 바꾼다. 둘 다 없으면 빈칸이
     * '조용히' 렌더되지 않아 정답이 그대로 노출된다. */
    if (k === 'blank') {
      const bi = t.blank_sentence_index;
      const target = t.blank_target;
      if (bi == null || !Array.isArray(t.passage) || !t.passage[bi]) {
        E(n, `blank: blank_sentence_index=${bi} 가 passage 범위 밖`);
      } else {
        const sent = String(t.passage[bi]);
        const hasUnderscore = /_{3,}/.test(sent);
        const hasTarget = target && sent.includes(target);
        if (!hasUnderscore && !hasTarget) {
          E(n, `blank: index ${bi} 문장에 "___" 도 blank_target 도 없음 — 빈칸이 렌더되지 않아 정답 노출`);
        }
        // ___ 가 다른 문장에 박혀 있는데 인덱스가 어긋난 경우
        const realIdx = t.passage.findIndex(s => /_{3,}/.test(String(s)));
        if (realIdx >= 0 && realIdx !== bi) {
          E(n, `blank: "___" 는 문장 ${realIdx} 에 있는데 blank_sentence_index=${bi}`);
        }
      }
    }
    if (k === 'grammar' || k === 'vocab') {
      const us = t.underlines || [];
      const bad = us.filter(u => u.correct === false);
      if (us.length !== 5) W(n, `${k}: underlines ${us.length}개 (5개여야 함)`);
      if (bad.length !== 1) E(n, `${k}: correct:false 가 ${bad.length}개 (1개여야 함)`);
      if (bad.length === 1 && !bad[0].fix) W(n, `${k}: 오류 항목에 fix 없음`);
      for (const u of us) {
        if (u.text && body && !body.includes(u.text)) {
          E(n, `${k}: underline "${String(u.text).slice(0, 30)}..." 가 passage 에 없음`);
        }
      }
    }
  }
}

console.log('\n=== 변형 정답 분포 (위치 종속 유형 제외) ===');
const total = Object.values(answerDist).reduce((a, b) => a + b, 0);
for (const k of ['1', '2', '3', '4', '5']) {
  const c = answerDist[k] || 0;
  const pct = total ? (c / total * 100) : 0;
  const bar = '█'.repeat(Math.round(pct / 2));
  console.log(`  ${k}: ${String(c).padStart(3)} (${pct.toFixed(1).padStart(5)}%) ${bar}`);
  if (pct > 35) W('변형', `정답 ${k}번 쏠림 ${pct.toFixed(1)}% — _rebalance 필요`);
}

console.log(`\n${'='.repeat(50)}`);
console.log(err ? `\x1b[31m✗ ERROR ${err}건\x1b[0m / WARN ${warn}건` : `\x1b[32m✓ ERROR 0건\x1b[0m / WARN ${warn}건`);
process.exit(err ? 1 : 0);
