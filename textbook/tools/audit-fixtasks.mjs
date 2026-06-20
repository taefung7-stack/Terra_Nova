#!/usr/bin/env node
// 검수 결과(audit/2026-07/<grade>/<NN>.json)에서 지문별 수정대상 findings를 모아
// 수정 워크플로 args용 _fixtasks.json 생성. 결함 0건 지문은 제외.
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
const tasks = [];
let totalFindings = 0;
for (const grade of Object.keys(DIRS)) {
  const gdir = join(base, grade);
  for (const f of readdirSync(gdir).filter(f => /^\d{2}\.json$/.test(f)).sort()) {
    const r = JSON.parse(readFileSync(join(gdir, f), 'utf8'));
    // confirmed(차단+권고, 적대검증 통과) + minors(경미) 전부
    const fixes = [
      ...(r.confirmed || []).map(x => ({ severity: x.severity, lens: x.lens, location: x.location, issue: x.issue, evidence: x.evidence, suggestion: x.suggestion || '' })),
      ...(r.minors || []).map(x => ({ severity: x.severity, lens: x.lens, location: x.location, issue: x.issue, evidence: x.evidence, suggestion: x.suggestion || '' })),
    ];
    if (fixes.length === 0) continue;
    const nn = String(r.seq).padStart(2, '0');
    tasks.push({ grade, seq: r.seq, file: `${root}/${DIRS[grade]}/${nn}.json`, fixes });
    totalFindings += fixes.length;
  }
}
writeFileSync(join(base, '_fixtasks.json'), JSON.stringify(tasks));
console.log(`[audit-fixtasks] ${tasks.length} passages need fixes, ${totalFindings} findings total → _fixtasks.json`);
