#!/usr/bin/env node
/* 고유명사 오탐 문항 자동 구제 (2026-09 고2)
 *
 * build-workbook.mjs 의 buildProperNounSet 은 "본문에서 항상 대문자로만 등장하는
 * 토큰"을 고유명사로 본다. 문두 전용 단어(As/Born/Which/Whenever/What ...)가
 * 여기 걸려, 그 단어를 정답으로 쓴 양자택일 문항이 **에러 없이 삭제**된다.
 *
 * 이 스크립트는 삭제 대상 문항의 {{n:A/B}} 토큰 순서를 뒤집어
 * (정답을 B 자리로) 옮기는 것이 아니라, 정답 단어를 그대로 두되
 * 해당 문항을 리포트한다. 실제 교정은 사람이 문장을 고르는 편이 안전하므로
 * 기본은 --report(기본값), --apply 를 주면 안전하게 처리 가능한 것만 고친다.
 *
 * 안전 교정 규칙: 본문에 그 단어가 소문자로도 등장하도록 만들 수는 없으므로,
 * 문항 자체를 '다른 정답 토큰'으로 바꾸는 것은 의미를 해칠 수 있다.
 * 따라서 --apply 는 해당 문항을 삭제하지 않고 **다른 문장으로 교체 가능**한
 * 경우가 없으면 그대로 두고, 사람이 볼 수 있게 목록만 남긴다.
 *
 * 사용:
 *   node 2026-sep-grade2/_fix-propernoun.mjs           # 리포트만
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DATA = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'data');
const NOS = [18,19,20,21,22,23,24,26,29,30,31,32,33,34,35,36,37,38,39,40,41,43];

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

let total = 0;
const rows = [];
for (const n of NOS) {
  const dp = path.join(DATA, `${n}.json`);
  const wp = path.join(DATA, `${n}-workbook.json`);
  if (!fs.existsSync(dp) || !fs.existsSync(wp)) continue;
  const d = JSON.parse(fs.readFileSync(dp, 'utf8'));
  const w = JSON.parse(fs.readFileSync(wp, 'utf8'));
  const pn = buildProperNounSet(d);

  for (const k of ['grammar_choice', 'vocab_choice']) {
    for (const q of (w[k] || [])) {
      const ans = (q.answers || []).map(a => String(a).toLowerCase().replace(/[^a-z'-]/g, ''));
      const hit = ans.find(a => pn.has(a));
      if (hit) {
        total++;
        rows.push({ n, k, no: q.no, hit, tpl: String(q.en_template || '').slice(0, 100) });
      }
    }
  }
}

if (!rows.length) {
  console.log('\x1b[32m✓ 고유명사 오탐으로 삭제될 문항 없음\x1b[0m');
  process.exit(0);
}

console.log(`\x1b[31m삭제 위험 문항 ${total}건\x1b[0m — 정답 단어를 본문에 소문자로도 등장하는 다른 단어로 바꾸거나, 그 문장의 다른 지점을 출제하세요.\n`);
for (const r of rows) {
  console.log(`  [${r.n}] ${r.k} #${r.no}  정답="${r.hit}"`);
  console.log(`        ${r.tpl}`);
}
process.exit(1);
