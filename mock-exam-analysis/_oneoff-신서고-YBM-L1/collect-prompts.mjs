#!/usr/bin/env node
/* 각 챕터 JSON 의 illustration.prompt 를 모아 과별 _ILLUSTRATION_PROMPTS-{L1,L2}.md 생성.
 * 사용법:
 *   node _oneoff-신서고-YBM-L1/collect-prompts.mjs        # L1·L2 전부
 *   node _oneoff-신서고-YBM-L1/collect-prompts.mjs L2     # 특정 과만
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SOURCE as SOURCE_L1 } from './_SOURCE.js';
import { SOURCE as SOURCE_L2 } from './_SOURCE-L2.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LESSONS = [
  { id: 'L1', title: 'Lesson 1 — The Story of Hip-Hop Music', source: SOURCE_L1 },
  { id: 'L2', title: 'Lesson 2 — The Subscription Economy',   source: SOURCE_L2 },
];

const only = (process.argv[2] || '').toUpperCase();
const targets = only ? LESSONS.filter(l => l.id === only) : LESSONS;
if (!targets.length) { console.error(`알 수 없는 과: ${only}`); process.exit(2); }

const HEADER = (title) => `# 신서고 YBM 영어II ${title} — 챕터별 삽화 프롬프트

> 규격: **\`--ar 16:5 --v 8.1\`**
> 톤: **플랫 벡터 에디토리얼 일러스트** — 흰 배경 + high key + 그라데이션 없음.
> (2026-08-14 변경: 기존 "시네마틱 + 페인터리 3D" 는 결과물이 어둡게 나와 폐기.
>  \`cinematic\` \`painterly\` \`sunlit\` \`glowing\` \`golden\` 등 어둠 유발 키워드 사용 금지.)
> 각 챕터는 **소재를 겹치지 않게** 분리하고, 프롬프트에 \`NO ...\` 배제 조건을 넣는다.
> 생성한 이미지를 \`dist/{과}/assets/illust-{N}.png\` 로 저장하면 PDF 재렌더 시 자동 반영됩니다.

`;

for (const lesson of targets) {
  let md = HEADER(lesson.title);
  let found = 0;

  for (const ch of lesson.source) {
    const p = path.join(__dirname, 'data', lesson.id, `${ch.no}.json`);
    let data;
    try { data = JSON.parse(await fs.readFile(p, 'utf8')); }
    catch { console.warn(`   skip ${lesson.id}/${ch.no}.json (없음)`); continue; }
    found++;

    md += `---\n\n## Chapter ${ch.no} — ${ch.subtitle}\n\n`;
    md += `- 저장 경로: \`${data.illustration?.file ?? `assets/illust-${ch.no}.png`}\`\n`;
    md += `- 문장 수: ${(data.passage || []).length}\n\n`;
    md += '```\n' + (data.illustration?.prompt ?? '(프롬프트 없음)') + '\n```\n\n';
  }

  const out = path.join(__dirname, `_ILLUSTRATION_PROMPTS-${lesson.id}.md`);
  await fs.writeFile(out, md, 'utf8');
  console.log(`✅ _ILLUSTRATION_PROMPTS-${lesson.id}.md 생성 (${found}개 챕터)`);
}
