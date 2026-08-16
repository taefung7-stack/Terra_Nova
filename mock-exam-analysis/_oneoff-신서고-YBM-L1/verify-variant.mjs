#!/usr/bin/env node
/* ===================================================================
 * 신서고 YBM 영어II — 변형문제 무결성 검증 (L1·L2)
 * ===================================================================
 * build-variant.mjs 는 밑줄/빈칸 대상을 passage 안에서 문자열 치환으로 찾는다.
 * 대상 문자열이 passage 에 정확히 없으면 **에러 없이 조용히** 밑줄·빈칸이
 * 사라진 채로 빌드된다(빈 문항 사고). 그래서 빌드 전에 이 스크립트로 강제 검증한다.
 *
 * 검사 항목
 *   1. underlines[].text 가 passage[sent_index] 안에 문자 그대로 존재
 *   2. implication.underlined / blank.blank_target 이 지정 문장 안에 존재
 *   3. 어법·어휘: 밑줄 5개 + correct:false 정확히 1개 + answer 가 그 번호
 *   4. 객관식 보기 5개, answer 1~5
 *   5. insert.passage_marked 의 slot_after 가 1..5 로 빠짐없이
 *   6. order.blocks 는 A·B·C 3개, 보기 5개
 *   7. summary.options 5개 + A/B 필드, writing 4개 이상
 *   8. 원문 지문 대비 패러프레이즈 여부(유형 passage 가 원문과 100% 동일하면 경고)
 *
 * 사용법:  node _oneoff-신서고-YBM-L1/verify-variant.mjs [L1|L2]
 * =================================================================== */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LESSONS = process.argv[2] ? [process.argv[2].toUpperCase()] : ['L1', 'L2'];

const OBJECTIVE_KEYS = [
  'theme', 'claim', 'gist', 'title', 'implication',
  'grammar', 'vocab', 'blank', 'irrelevant', 'order', 'insert', 'summary',
];

let errors = 0;
let warns = 0;

function err(file, type, msg) {
  console.log(`   ❌ ${file} · ${type}: ${msg}`);
  errors++;
}
function warn(file, type, msg) {
  console.log(`   ⚠️  ${file} · ${type}: ${msg}`);
  warns++;
}

function norm(s) {
  return String(s ?? '').replace(/\s+/g, ' ').trim();
}

for (const lesson of LESSONS) {
  const dataDir = path.join(__dirname, 'data', lesson);
  let files;
  try {
    files = (await fs.readdir(dataDir)).filter(f => /^\d+-variant\.json$/.test(f))
      .sort((a, b) => parseInt(a) - parseInt(b));
  } catch {
    console.log(`\n⏭️  ${lesson}: data 폴더 없음 — 건너뜀`);
    continue;
  }

  console.log(`\n${'='.repeat(60)}\n${lesson} — 변형문제 ${files.length}개 파일\n${'='.repeat(60)}`);

  for (const f of files) {
    const fp = path.join(dataDir, f);
    let d;
    try {
      d = JSON.parse(await fs.readFile(fp, 'utf8'));
    } catch (e) {
      err(f, 'JSON', `파싱 실패 — ${e.message}`);
      continue;
    }
    const bt = d.by_type || {};

    // 원문(패러프레이즈 확인용)
    let orig = [];
    try {
      const src = JSON.parse(await fs.readFile(path.join(dataDir, `${d.passage_id}.json`), 'utf8'));
      orig = (src.passage || []).map(norm);
    } catch { /* 원문 없으면 패러프레이즈 검사 생략 */ }

    const typeCount = Object.keys(bt).filter(k => k !== 'writing').length;

    for (const key of OBJECTIVE_KEYS) {
      const v = bt[key];
      if (!v) continue;
      const psg = v.passage || [];

      // 1) 밑줄 대상이 지정 문장 안에 실제로 있는가
      for (const u of v.underlines || []) {
        const si = u.sent_index;
        if (si == null || si >= psg.length) {
          err(f, key, `underline#${u.no} sent_index ${si} 범위 밖(passage ${psg.length}문장)`);
        } else if (!psg[si].includes(u.text)) {
          err(f, key, `underline#${u.no} "${u.text}" 가 passage[${si}] 에 없음 → 밑줄 유실`);
        }
      }

      // 2) implication / blank 대상
      if (v.underlined && !psg.join(' ').includes(v.underlined)) {
        err(f, key, `underlined "${v.underlined.slice(0, 40)}..." 가 passage 에 없음`);
      }
      if (v.blank_target != null) {
        const si = v.blank_sentence_index;
        if (si == null || si >= psg.length) {
          err(f, key, `blank_sentence_index ${si} 범위 밖`);
        } else if (!psg[si].includes(v.blank_target)) {
          err(f, key, `blank_target 이 passage[${si}] 에 없음 → 빈칸 유실`);
        }
      }

      // 3) 어법·어휘 정합
      if (key === 'grammar' || key === 'vocab') {
        const uls = v.underlines || [];
        if (uls.length !== 5) err(f, key, `밑줄 ${uls.length}개 (5개여야 함)`);
        const wrong = uls.filter(u => u.correct === false);
        if (wrong.length !== 1) {
          err(f, key, `오답 밑줄 ${wrong.length}개 (정확히 1개여야 함)`);
        } else {
          if (wrong[0].no !== v.answer) err(f, key, `answer(${v.answer}) 가 오답 밑줄 번호(${wrong[0].no})와 불일치`);
          if (!wrong[0].fix) warn(f, key, `오답 밑줄에 fix 필드 없음`);
        }
      }

      // 4) 보기·정답 범위
      if (v.choices && v.choices.length !== 5) err(f, key, `보기 ${v.choices.length}개 (5개여야 함)`);
      if (v.answer != null && !(v.answer >= 1 && v.answer <= 5)) err(f, key, `answer ${v.answer} 범위 밖`);
      if (!v.explanation_ko) warn(f, key, `explanation_ko 없음`);

      // 5) 삽입 슬롯
      if (key === 'insert') {
        const slots = (v.passage_marked || []).map(s => s.slot_after).sort((a, b) => a - b);
        if (slots.join(',') !== '1,2,3,4,5') err(f, key, `slot_after 가 1~5 가 아님: [${slots}]`);
        if (!v.insert_sentence) err(f, key, `insert_sentence 없음`);
      }

      // 6) 순서배열
      if (key === 'order') {
        const bk = Object.keys(v.blocks || {}).sort().join('');
        if (bk !== 'ABC') err(f, key, `blocks 가 A·B·C 가 아님: [${bk}]`);
        if (!v.given) err(f, key, `given 없음`);
      }

      // 7) 요약문
      if (key === 'summary') {
        const opts = v.options || [];
        if (opts.length !== 5) err(f, key, `options ${opts.length}개 (5개여야 함)`);
        for (const o of opts) if (!o.A || !o.B) err(f, key, `option ${o.no} 에 A 또는 B 없음`);
        if (!/__\(A\)__/.test(v.summary_template || '') || !/__\(B\)__/.test(v.summary_template || '')) {
          err(f, key, `summary_template 에 __(A)__ / __(B)__ 자리표시자 누락`);
        }
      }

      // 8) 패러프레이즈 확인 — 원문 문장을 그대로 복사했으면 경고
      if (orig.length && psg.length) {
        const verbatim = psg.filter(s => orig.includes(norm(s))).length;
        // implication 은 밑줄 문장을 원문 그대로 두는 것이 허용된다
        const limit = key === 'implication' ? 2 : 1;
        if (verbatim > limit) {
          warn(f, key, `원문과 동일한 문장 ${verbatim}개 — 패러프레이즈 부족`);
        }
      }
    }

    // 서술형
    const w = bt.writing || [];
    if (w.length < 4) err(f, 'writing', `서술형 ${w.length}개 (4개 이상 권장)`);
    for (const item of w) {
      if (!item.subtype) err(f, 'writing', `subtype 없는 항목`);
      // summary_word 는 스펙상 answer 대신 answer_a / answer_b 를 쓴다.
      if (item.subtype === 'summary_word') {
        if (!item.answer_a || !item.answer_b) err(f, 'writing', `summary_word: answer_a/answer_b 없음`);
      } else if (!item.answer) {
        err(f, 'writing', `${item.subtype}: answer 없음`);
      }
    }

    console.log(`   ${errors === 0 ? '✓' : '·'} ${f}  객관식 ${typeCount}유형 · 서술형 ${w.length}`);
  }
}

console.log(`\n${'─'.repeat(60)}`);
if (errors === 0) {
  console.log(`✅ 변형문제 검증 통과 — 오류 0건${warns ? `, 경고 ${warns}건` : ''}`);
} else {
  console.log(`❌ 오류 ${errors}건${warns ? `, 경고 ${warns}건` : ''} — 빌드 전에 수정 필요`);
  process.exit(1);
}
