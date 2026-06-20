#!/usr/bin/env node
// 잘렸을 수 있는 Workflow output 파일에서 완전한 최상위 결과 객체만 균형괄호로 복구해 저장.
// 사용: node tools/audit-recover.mjs <output.txt>
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const inPath = process.argv[2];
const raw = readFileSync(inPath, 'utf8');

// 전체가 정상 JSON이면 그대로, 아니면 "result": [ 이후를 균형괄호로 복구
let whole = null;
try { whole = JSON.parse(raw); } catch { /* truncated */ }
if (whole && Array.isArray(whole.result)) {
  let n0 = 0;
  for (const r of whole.result) {
    if (r && r.grade && r.seq) {
      const nn = String(r.seq).padStart(2, '0');
      mkdirSync(resolve(root, 'audit/2026-07', r.grade), { recursive: true });
      writeFileSync(join(resolve(root, 'audit/2026-07', r.grade), `${nn}.json`), JSON.stringify(r, null, 2));
      n0++;
    }
  }
  console.log(`clean parse: ${whole.result.length} results, saved ${n0}`);
  console.log('seqs:', whole.result.filter(o => o && o.seq).map(o => `${o.grade}#${o.seq}`).join(', '));
  process.exit(0);
}

const rk = raw.indexOf('"result"');
const start = rk >= 0 ? raw.indexOf('[', rk) : raw.indexOf('[{');
if (start < 0) { console.error('no result array start'); process.exit(2); }
const s = raw.slice(start + 1); // '[' 다음부터

let depth = 0, inStr = false, esc = false, cur = '';
const objs = [];
for (let p = 0; p < s.length; p++) {
  const ch = s[p];
  if (depth > 0) cur += ch;
  else if (ch === '{') cur += ch;
  if (esc) { esc = false; continue; }
  if (ch === '\\') { esc = true; continue; }
  if (ch === '"') { inStr = !inStr; continue; }
  if (inStr) continue;
  if (ch === '{') depth++;
  else if (ch === '}') {
    depth--;
    if (depth === 0) {
      try { objs.push(JSON.parse(cur.trim())); } catch { /* skip partial */ }
      cur = '';
    }
  }
}

let n = 0;
for (const r of objs) {
  if (r && r.grade && r.seq) {
    const nn = String(r.seq).padStart(2, '0');
    mkdirSync(resolve(root, 'audit/2026-07', r.grade), { recursive: true });
    writeFileSync(join(resolve(root, 'audit/2026-07', r.grade), `${nn}.json`), JSON.stringify(r, null, 2));
    n++;
  }
}
console.log(`recovered ${objs.length} objects, saved ${n}`);
console.log('seqs:', objs.filter(o => o && o.seq).map(o => `${o.grade}#${o.seq}`).join(', '));
