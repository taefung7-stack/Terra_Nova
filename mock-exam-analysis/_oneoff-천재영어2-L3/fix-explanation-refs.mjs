#!/usr/bin/env node
/* ===================================================================
 * 해설 본문의 정답 번호 참조 교정 — fix-answer-distribution.mjs 후속
 * ===================================================================
 * 정답 위치를 재배치하면서 distractor_ko 의 ①~⑤ 마커는 remap 했지만,
 * explanation_ko 안의 "…이므로 ①이 주제이다" 같은 **정답 지칭 번호**는
 * 그대로 남아 답지에서 "정답 ③ / 해설: …①이 주제이다" 로 어긋난다.
 *
 * 재배치 대상 6유형(theme/gist/title/implication/blank/summary)의
 * explanation_ko 에 등장하는 원래 정답 번호(재배치 전에는 전부 ① 계열)를
 * 새 정답 번호로 바꾼다. 안전장치:
 *   - 해설에 나타난 마커가 '재배치 전 정답 번호' 하나뿐일 때만 치환한다.
 *     (여러 번호를 비교 설명하는 해설은 사람이 봐야 하므로 건드리지 않고 경고)
 *
 * 사용법: node _oneoff-천재영어2-L3/fix-explanation-refs.mjs <백업디렉터리> [--dry]
 *   백업디렉터리 = 재배치 전 {N}-variant.bak.json 이 있는 곳(원래 정답 번호 확인용)
 * =================================================================== */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(HERE, 'data');
const BAK = process.argv[2];
const DRY = process.argv.includes('--dry');
if (!BAK) { console.error('Usage: node fix-explanation-refs.mjs <backup-dir> [--dry]'); process.exit(1); }

const CIRCLED = ['①', '②', '③', '④', '⑤'];
const TARGET_TYPES = ['theme', 'gist', 'title', 'implication', 'blank', 'summary'];

async function main() {
  let fixed = 0, warned = 0;
  for (let i = 1; i <= 6; i++) {
    const file = path.join(DATA, `${i}-variant.json`);
    const d = JSON.parse(await fs.readFile(file, 'utf8'));
    const old = JSON.parse(await fs.readFile(path.join(BAK, `${i}-variant.bak.json`), 'utf8'));
    let touched = false;

    for (const t of TARGET_TYPES) {
      const q = d.by_type?.[t];
      const oq = old.by_type?.[t];
      if (!q || !oq) continue;
      const oldAns = oq.answer, newAns = q.answer;
      if (oldAns === newAns) continue;

      const exp = q.explanation_ko || '';
      const found = [...new Set([...exp].filter(c => CIRCLED.includes(c)))];
      if (!found.length) continue;

      if (found.length === 1 && found[0] === CIRCLED[oldAns - 1]) {
        q.explanation_ko = exp.split(CIRCLED[oldAns - 1]).join(CIRCLED[newAns - 1]);
        fixed++; touched = true;
        console.log(`  P${i} ${t}: 해설 ${CIRCLED[oldAns - 1]} → ${CIRCLED[newAns - 1]}`);
      } else {
        warned++;
        console.log(`  ⚠️  P${i} ${t}: 해설에 여러 번호 ${found.join('')} — 수동 확인 필요`);
      }
    }
    if (touched && !DRY) await fs.writeFile(file, JSON.stringify(d, null, 2) + '\n', 'utf8');
  }
  console.log(`\n${DRY ? '(dry-run) ' : '✅ '}해설 참조 교정 ${fixed}건${warned ? `, 수동확인 ${warned}건` : ''}`);
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
