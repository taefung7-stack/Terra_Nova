#!/usr/bin/env node
// Workflow가 반환한 결과 배열(JSON, stdin 또는 파일)을 지문별 audit/2026-07/<grade>/<NN>.json 으로 저장.
// 사용: node tools/audit-save.mjs <results.json>
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const inPath = process.argv[2];
if (!inPath) { console.error('usage: audit-save.mjs <results.json>'); process.exit(1); }
const results = JSON.parse(readFileSync(inPath, 'utf8'));
let n = 0;
for (const r of results) {
  if (!r || !r.grade || !r.seq) continue;
  const dir = resolve(root, 'audit/2026-07', r.grade);
  mkdirSync(dir, { recursive: true });
  const nn = String(r.seq).padStart(2, '0');
  writeFileSync(join(dir, `${nn}.json`), JSON.stringify(r, null, 2));
  n++;
}
console.log(`[audit-save] ${n} passage results saved`);
