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
import { SOURCE as SOURCE_EX } from './_SOURCE-EX.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LESSONS = [
  { id: 'L1', title: 'Lesson 1 — The Story of Hip-Hop Music', source: SOURCE_L1 },
  { id: 'L2', title: 'Lesson 2 — The Subscription Economy',   source: SOURCE_L2 },
  /* EX — 부교재 어법 유닛. Lesson 이 아니므로 heading 을 따로 준다. */
  { id: 'EX', title: '부교재 · 05 수식어는 괄호로 묶어라', source: SOURCE_EX,
    heading: '신서고 부교재 05 수식어는 괄호로 묶어라 — 지문별 삽화 프롬프트' },
];

const only = (process.argv[2] || '').toUpperCase();
const targets = only ? LESSONS.filter(l => l.id === only) : LESSONS;
if (!targets.length) { console.error(`알 수 없는 과: ${only}`); process.exit(2); }

/* 과별 톤 노트 — 2026-08-16 L1·L2 둘 다 실사(포토리얼)로 전환.
 * 공통 규칙은 같고, 시대 배경만 다르다(L1 1970~80년대 / L2 현대). */
const TONE_COMMON = `> 밝기는 \`bright\` 같은 형용사가 아니라 **조명 조건**으로 지정한다 —
> \`overcast daylight\` \`soft diffused light\` \`high-key\` \`airy\` \`low contrast\`.
> \`cinematic\` \`golden hour\` \`sunlit\` \`dramatic lighting\` \`chiaroscuro\` \`moody\`
> \`neon\` \`night\` 는 **금지**(미드저니가 어두운 고대비 저녁 장면으로 해석해 역효과).
> 단 \`NO ~\` 배제절 안에서는 오히려 명시해 밀어낸다.
> 인물은 얼굴 클로즈업 대신 손·실루엣·뒷모습 위주로 — 교재 삽화이므로 특정인 초상 회피.`;

const TONE_NOTE = {
  L1: `> 톤: **실사 사진(포토리얼)** — 1970~80년대 브롱스, 밝고 부드러운 자연광. (2026-08-16 전환)
${TONE_COMMON}`,
  L2: `> 톤: **실사 사진(포토리얼)** — 현대 생활 장면, 큰 창의 실내 자연광. (2026-08-16 전환)
${TONE_COMMON}
> 화면·제품에 **브랜드 로고와 판독 가능한 텍스트를 넣지 않는다**
> (\`NO brand logos, NO readable screen text\`) — 상표권 회피 + 교재 중립성.`,
  EX: `> 톤: **실사 사진(포토리얼)** — 과학·자연 다큐멘터리 톤, 흐린 날 확산광.
${TONE_COMMON}
> 네 지문의 소재가 완전히 다르므로(식충식물 / 배관·수도 / 달력·계절 / 펭귄과 바다)
> 챕터마다 \`NO ~\` 로 나머지 셋의 소재를 배제해 4장이 서로 닮지 않게 한다.`,
};

const HEADER = (title, id, heading) => `# ${heading ?? `신서고 YBM 영어II ${title} — 챕터별 삽화 프롬프트`}

> 규격: **\`--ar 16:5 --v 8.1\`**
${TONE_NOTE[id] ?? TONE_NOTE.L2}
> 각 챕터는 **소재를 겹치지 않게** 분리하고, 프롬프트에 \`NO ...\` 배제 조건을 넣는다.
> 생성한 이미지를 \`dist/{과}/assets/illust-{N}.png\` 로 저장하면 PDF 재렌더 시 자동 반영됩니다.

`;

for (const lesson of targets) {
  let md = HEADER(lesson.title, lesson.id, lesson.heading);
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
