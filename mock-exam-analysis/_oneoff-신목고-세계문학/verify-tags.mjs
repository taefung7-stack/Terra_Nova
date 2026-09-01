#!/usr/bin/env node
/* ===================================================================
 * HTML 태그 균형 검증 — verify.mjs 가 못 잡는 사각지대
 * ===================================================================
 * verify.mjs 는 en_html 의 태그를 '벗겨서' 원문과 대조하므로,
 *   <span style="font-family:Inter">...</strong>
 * 처럼 **여는 태그와 닫는 태그가 다른** 실수를 통과시킨다.
 * 데이터는 정상으로 보이는데 렌더만 깨지는 조용한 실패다.
 * (2026-09-01 신목고 U1 검수에서 실제로 5건 발견 — note/points 필드)
 *
 * 사용법: node _oneoff-신목고-세계문학/verify-tags.mjs
 * =================================================================== */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const VOID_TAGS = new Set(['br', 'img', 'hr', 'input', 'meta', 'link']);

let errors = 0;

/** 문자열 하나의 태그 균형을 본다. 여는 수 ≠ 닫는 수면 불균형. */
function checkString(s, where) {
  if (typeof s !== 'string' || !s.includes('<')) return;
  const opens = [...s.matchAll(/<([a-zA-Z]+)(?:\s[^>]*)?>/g)].map(m => m[1].toLowerCase());
  const closes = [...s.matchAll(/<\/([a-zA-Z]+)>/g)].map(m => m[1].toLowerCase());
  const count = (arr) => arr.reduce((m, t) => m.set(t, (m.get(t) || 0) + 1), new Map());
  const co = count(opens), cc = count(closes);
  for (const tag of new Set([...co.keys(), ...cc.keys()])) {
    if (VOID_TAGS.has(tag)) continue;
    const o = co.get(tag) || 0, c = cc.get(tag) || 0;
    if (o !== c) {
      console.error(`  ❌ ${where}: <${tag}> 여는 태그 ${o}개 / 닫는 태그 ${c}개`);
      console.error(`     ${s.slice(0, 160)}`);
      errors++;
    }
  }
}

function walk(node, where) {
  if (typeof node === 'string') checkString(node, where);
  else if (Array.isArray(node)) node.forEach((v, i) => walk(v, `${where}[${i}]`));
  else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) walk(v, where ? `${where}.${k}` : k);
  }
}

const dataDir = path.join(HERE, 'data');
const units = fs.readdirSync(dataDir).filter(d => fs.statSync(path.join(dataDir, d)).isDirectory());

console.log('🔍 HTML 태그 균형 검증\n');
for (const unit of units) {
  const dir = path.join(dataDir, unit);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
  console.log(`── ${unit} (${files.length}개 파일) ──`);
  for (const f of files) {
    walk(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')), f);
  }
}

if (errors) {
  console.error(`\n❌ 태그 불균형 ${errors}건 — 렌더가 깨지므로 빌드 금지`);
  process.exit(1);
}
console.log('\n✅ 태그 균형 정상 — 0건');
