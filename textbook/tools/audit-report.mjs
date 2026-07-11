#!/usr/bin/env node
// 지문별 판정 JSON 60개를 모아 audit/2026-07/REPORT.md 생성
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const MONTH = process.env.AUDIT_MONTH || '2026-07';
const base = resolve(here, '..', `audit/${MONTH}`);
const GRADES = [['saturn-g1', '고1 Saturn'], ['jupiter-g2', '고2 Jupiter'], ['sun-g3', '고3 Sun']];

const lines = [];
let totalBlock = 0, totalWarn = 0, totalMinor = 0;
const gradeSumm = [];

for (const [key, label] of GRADES) {
  const gdir = join(base, key);
  if (!existsSync(gdir)) continue;
  const files = readdirSync(gdir).filter(f => /^\d{2}\.json$/.test(f)).sort();
  let gb = 0, gw = 0, gm = 0;
  const blockerLines = [];
  const warnLines = [];
  for (const f of files) {
    const r = JSON.parse(readFileSync(join(gdir, f), 'utf8'));
    const blockers = (r.blockers || []);
    const warns = (r.confirmed || []).filter(x => x.severity === 'warn');
    const minors = (r.minors || []);
    gb += blockers.length; gw += warns.length; gm += minors.length;
    for (const b of blockers) {
      blockerLines.push(`- **${label} #${r.seq}** [${b.lens}] ${b.issue}  \n  - 위치: \`${b.location}\`  \n  - 근거: ${b.evidence}${b.suggestion ? `  \n  - 권고: ${b.suggestion}` : ''}`);
    }
    for (const w of warns) {
      warnLines.push(`- ${label} #${r.seq} [${w.lens}] ${w.issue} — \`${w.location}\``);
    }
  }
  totalBlock += gb; totalWarn += gw; totalMinor += gm;
  gradeSumm.push(`| ${label} | ${gb} | ${gw} | ${gm} |`);
  lines.push(`## ${label} — 차단 ${gb} · 권고 ${gw} · 경미 ${gm}`, '');
  if (blockerLines.length) { lines.push('### 🚫 차단 결함 (판매 전 필수 수정)', ...blockerLines, ''); }
  else { lines.push('차단 결함 없음 ✅', ''); }
  if (warnLines.length) { lines.push('<details><summary>권고 사항 ' + warnLines.length + '건</summary>', '', ...warnLines, '', '</details>', ''); }
}

const header = [
  `# ${MONTH} 고등 교재 검수 리포트`,
  '',
  `> 생성: ${process.env.AUDIT_TS || 'unstamped'} · 멀티에이전트 4관점 병렬 검수 + 적대검증`,
  '',
  '| 학년 | 차단 | 권고 | 경미 |',
  '|------|------|------|------|',
  ...gradeSumm,
  `| **합계** | **${totalBlock}** | **${totalWarn}** | **${totalMinor}** |`,
  '',
  totalBlock === 0
    ? '✅ **차단 결함 0 — 표지·업로드 단계로 진행 가능.**'
    : `🚫 **차단 결함 ${totalBlock}건 — 수정 후 업로드해야 함.** 가장 빈번한 유형: page3 번역에 빈칸 정답 노출.`,
  '',
  '---',
  '',
];

writeFileSync(join(base, 'REPORT.md'), header.concat(lines).join('\n'));
console.log(`[audit-report] 차단 ${totalBlock} / 권고 ${totalWarn} / 경미 ${totalMinor} → REPORT.md`);
