#!/usr/bin/env node
/* 각 챕터 JSON 의 illustration.prompt 를 모아 _ILLUSTRATION_PROMPTS.md 생성.
 * 사용법: node _oneoff-신서고-YBM-L1/collect-prompts.mjs */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SOURCE } from './_SOURCE.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let md = `# 신서고 YBM 영어II L1 — 챕터별 삽화 프롬프트

> 규격: **\`--ar 16:5 --v 8.1\`**
> 톤: **플랫 벡터 에디토리얼 일러스트** — 흰 배경 + high key + 그라데이션 없음.
> (2026-08-14 변경: 기존 "시네마틱 + 페인터리 3D" 는 결과물이 어둡게 나와 폐기.
>  \`cinematic\` \`painterly\` \`sunlit\` \`glowing\` \`golden\` 등 어둠 유발 키워드 사용 금지.)
> 각 챕터는 **소재를 겹치지 않게** 분리 — 그래피티·벽돌벽·군중·무대를 한 챕터에만 쓴다.
> 생성한 이미지를 \`dist/assets/illust-{N}.png\` 로 저장하면 PDF 재렌더 시 자동 반영됩니다.

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
