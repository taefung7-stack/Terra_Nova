#!/usr/bin/env node
// prepass를 읽어 Workflow args용 _tasks.json(경로+번호+lexNote)을 만든다.
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..').replace(/\\/g, '/');
const MONTH = process.env.AUDIT_MONTH || '2026-07';
const pp = JSON.parse(readFileSync(resolve(root, `audit/${MONTH}/_prepass.json`), 'utf8'));
const DIRS = {
  'saturn-g1': `content/passages/${MONTH}`,
  'jupiter-g2': `content/passages/${MONTH}-J`,
  'sun-g3': `content/passages/${MONTH}-Sun`,
};
const tasks = pp.passages.map(p => {
  const nn = String(p.seq).padStart(2, '0');
  const file = `${root}/${DIRS[p.grade]}/${nn}.json`;
  let lexNote = '';
  if (p.l2.lexile_mismatch) {
    lexNote = `[난이도 신호] 라벨 ${p.l2.lexile_declared}L 이나 실측 ${p.l2.lexile_measured}L (델타 ${p.l2.lexile_delta}). 라벨 과대표기 — 본문이 라벨만큼 어려운지 참고만(이것만으로 blocker 금지).`;
  }
  return { grade: p.grade, seq: p.seq, file, lexNote };
});
writeFileSync(resolve(root, `audit/${MONTH}/_tasks.json`), JSON.stringify(tasks));
console.log(`tasks ${tasks.length} | size ${(statSync(resolve(root, `audit/${MONTH}/_tasks.json`)).size / 1024).toFixed(1)}KB`);
console.log('sample', JSON.stringify(tasks[0]));
