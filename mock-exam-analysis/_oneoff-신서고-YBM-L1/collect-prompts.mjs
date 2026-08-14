#!/usr/bin/env node
/* 각 챕터 JSON 의 illustration.prompt 를 모아 _ILLUSTRATION_PROMPTS.md 생성.
 * 사용법: node _oneoff-신서고-YBM-L1/collect-prompts.mjs */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SOURCE } from './_SOURCE.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let md = `# 신서고 YBM 영어II L1 — 챕터별 삽화 프롬프트

> 규격: **\`--ar 16:5 --v 8.1\`** (테라노바 삽화 공통 규칙)
> 톤: 밝고 선명한 시네마틱 에디토리얼 + 페인터리 3D
> 생성한 이미지를 \`dist/assets/illust-{N}.png\` 로 저장하면 재빌드 시 자동 반영됩니다.

`;

for (const ch of SOURCE) {
  const p = path.join(__dirname, 'data', `${ch.no}.json`);
  let data;
  try { data = JSON.parse(await fs.readFile(p, 'utf8')); }
  catch { console.warn(`skip ${ch.no}.json (없음)`); continue; }

  md += `---\n\n## Chapter ${ch.no} — ${ch.subtitle}\n\n`;
  md += `- 저장 경로: \`${data.illustration?.file ?? `assets/illust-${ch.no}.png`}\`\n`;
  md += `- 문장 수: ${(data.passage || []).length}\n\n`;
  md += '```\n' + (data.illustration?.prompt ?? '(프롬프트 없음)') + '\n```\n\n';
}

await fs.writeFile(path.join(__dirname, '_ILLUSTRATION_PROMPTS.md'), md, 'utf8');
console.log('✅ _ILLUSTRATION_PROMPTS.md 생성 완료');
