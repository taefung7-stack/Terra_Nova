#!/usr/bin/env node
/* 각 챕터 JSON 의 illustration.prompt 를 모아 _ILLUSTRATION_PROMPTS.md 생성.
 * 사용법: node _oneoff-천재강상구-L2/collect-prompts.mjs */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SOURCE } from './_SOURCE.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const HEADER = `# 천재(강상구) 영어II Lesson 2 — Nudge — 챕터별 삽화 프롬프트

> 규격: **\`--ar 16:5 --v 8.1\`**
> 톤: **실사 사진(포토리얼)** — 자연 다큐 톤, 흐린 날 야외 자연광. (2026-08-17)
> 밝기는 \`bright\` 같은 형용사가 아니라 **조명 조건**으로 지정한다 —
> \`overcast daylight\` \`soft diffused light\` \`high-key\` \`airy\` \`low contrast\`.
> \`cinematic\` \`golden hour\` \`sunlit\` \`sunbeams\` \`dramatic lighting\` \`moody\`
> \`neon\` \`night\` 은 **금지**(미드저니가 어두운 고대비 저녁 장면으로 해석해 역효과).
> 단 \`NO ~\` 배제절 안에서는 오히려 명시해 밀어낸다.
> 교재 삽화이므로 **사람은 넣지 않는다**(\`NO people\`) — 식물·씨앗 자체가 주인공.
> 각 챕터는 **소재를 겹치지 않게** 분리하고, 프롬프트에 \`NO ...\` 배제 조건을 넣는다.
> 생성한 이미지를 \`dist/assets/illust-{N}.png\` 로 저장하면 PDF 재렌더 시 자동 반영됩니다.

`;

let md = HEADER;
let found = 0;

for (const ch of SOURCE) {
  const p = path.join(__dirname, 'data', `${ch.no}.json`);
  let data;
  try { data = JSON.parse(await fs.readFile(p, 'utf8')); }
  catch { console.warn(`   skip ${ch.no}.json (없음)`); continue; }
  found++;

  md += `---\n\n## Chapter ${ch.no} — ${ch.subtitle}\n\n`;
  md += `- 저장 경로: \`${data.illustration?.file ?? `assets/illust-${ch.no}.png`}\`\n`;
  md += `- 문장 수: ${(data.passage || []).length}\n\n`;
  md += '```\n' + (data.illustration?.prompt || '(프롬프트 없음)') + '\n```\n\n';
}

const out = path.join(__dirname, '_ILLUSTRATION_PROMPTS.md');
await fs.writeFile(out, md, 'utf8');
console.log(`✅ _ILLUSTRATION_PROMPTS.md 생성 (${found}개 챕터)`);
