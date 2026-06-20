#!/usr/bin/env node
// 수정 워크플로 args: 결함 있는 지문의 {본문경로, 검수결과경로}. 학년별로 출력.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..').replace(/\\/g, '/');
const base = resolve(root, 'audit/2026-07');
const DIRS = {
  'saturn-g1': 'content/passages/2026-07',
  'jupiter-g2': 'content/passages/2026-07-J',
  'sun-g3': 'content/passages/2026-07-Sun',
};
const all = {};
for (const grade of Object.keys(DIRS)) {
  const gdir = join(base, grade);
  const arr = [];
  for (const f of readdirSync(gdir).filter(f => /^\d{2}\.json$/.test(f)).sort()) {
    const r = JSON.parse(readFileSync(join(gdir, f), 'utf8'));
    const n = (r.confirmed || []).length + (r.minors || []).length;
    if (n === 0) continue;
    const nn = String(r.seq).padStart(2, '0');
    arr.push({
      grade, seq: r.seq,
      file: `${root}/${DIRS[grade]}/${nn}.json`,
      auditFile: `${base.replace(/\\/g, '/')}/${grade}/${nn}.json`,
      counts: { confirmed: (r.confirmed || []).length, minors: (r.minors || []).length },
    });
  }
  all[grade] = arr;
  writeFileSync(join(base, `_fixargs-${grade}.json`), JSON.stringify(arr));
  console.log(`${grade}: ${arr.length} passages → _fixargs-${grade}.json`);
}
