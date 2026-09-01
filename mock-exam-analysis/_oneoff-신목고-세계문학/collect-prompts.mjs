#!/usr/bin/env node
/* ===================================================================
 * 삽화 프롬프트 수집 + 규칙 검증
 * ===================================================================
 * 각 챕터 JSON 의 illustration.prompt 를 모아 _ILLUSTRATION_PROMPTS-U1.md 를 만든다.
 * 프롬프트의 authoritative source 는 **JSON** 이다 — 이 md 는 사람이 복붙하기 위한
 * 파생물이므로, 프롬프트를 고칠 때는 JSON 을 고치고 이 스크립트를 다시 돌린다.
 *
 * 동시에 하우스 룰을 검증한다(위반 시 exit 1):
 *   1) --ar 16:5 --v 8.1 고정
 *   2) 지시부(= NO ~ 배제절을 걷어낸 부분)에 금지어 0
 *      cinematic / golden hour / sunlit / dramatic lighting / chiaroscuro /
 *      moody / neon / night
 *      ★ 배제절 안에서는 오히려 써야 하므로, 검사 전에 'NO ...' 를 먼저 제거한다.
 *        (단순 grep 은 배제절까지 잡아 오탐한다 — 신서고 README 의 지적)
 *   3) 얼굴 차단(NO visible face 또는 NO people)
 *   4) 챕터 간 소재 배제절 존재 — 4장이 서로 닮지 않게
 *
 * 사용법: node _oneoff-신목고-세계문학/collect-prompts.mjs
 * =================================================================== */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SOURCE } from './_SOURCE-U1.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UNIT = 'U1';

const BANNED = [
  'cinematic', 'golden hour', 'sunlit', 'dramatic lighting',
  'chiaroscuro', 'moody', 'neon', 'night',
];

/** 'NO xxx' 배제절을 걷어낸 '순수 지시부'. 금지어 검사는 여기에만 적용한다. */
function directiveOnly(prompt) {
  return prompt.replace(/NO [^,.]+[,.]?/gi, ' ');
}

const TONE_NOTE = `> 톤: **실사 사진(포토리얼)** — 현대 한국의 일상 장면, 흐린 날 확산광.
> 밝기는 \`bright\` 같은 형용사가 아니라 **조명 조건**으로 지정한다 —
> \`natural soft diffused daylight\` \`bright overcast sky\` \`high-key exposure\`
> \`low contrast\` \`airy\`.
> \`cinematic\` \`golden hour\` \`sunlit\` \`dramatic lighting\` \`chiaroscuro\` \`moody\`
> \`neon\` \`night\` 는 **지시부에서 금지** — 미드저니가 황금빛 저녁 + 강한 대비로 해석해
> 오히려 어두워진다. 단 \`NO ~\` 배제절 안에서는 오히려 명시해 밀어낸다.
> 인물은 얼굴 대신 **손·뒷모습·실루엣** 위주(\`NO visible face\`) — 교재 삽화이므로
> 특정인 초상·유사인물을 피한다.
> 네 지문의 소재가 완전히 다르므로(강의실 존댓말 / 지하철 배려석 / 식당 반찬 /
> 현관 신발·밥그릇) 챕터마다 \`NO ~\` 로 나머지 셋의 소재를 배제해 4장이 서로 닮지 않게 한다.`;

const HEADER = `# 신목고 2-2 중간 · 세계문학 Unit 1 — 챕터별 삽화 프롬프트

> 규격: **\`--ar 16:5 --v 8.1\`** (와이드 배너, 본문 180mm 폭 전면)
${TONE_NOTE}
>
> **이 문서는 파생물입니다.** 프롬프트 원본은 \`data/U1/{N}.json\` 의
> \`illustration.prompt\` 이며, 수정 후 \`node _oneoff-신목고-세계문학/collect-prompts.mjs\`
> 로 이 문서를 다시 만듭니다.
>
> 생성한 이미지는 \`dist/U1/assets/illust-{N}.png\` 로 저장한 뒤 PDF 를 다시 렌더하면
> placeholder 자리에 자동으로 들어갑니다(빌드 방법은 README 참조).

`;

let md = HEADER;
let errors = 0;
const fail = (m) => { console.error(`  ❌ ${m}`); errors++; };

for (const ch of SOURCE) {
  const file = path.join(__dirname, 'data', UNIT, `${ch.no}.json`);
  let data;
  try { data = JSON.parse(await fs.readFile(file, 'utf8')); }
  catch { console.warn(`   skip ${ch.no}.json (없음)`); continue; }

  const prompt = data.illustration?.prompt ?? '';
  const dest = data.illustration?.file ?? `assets/illust-${ch.no}.png`;

  /* ── 하우스 룰 검증 ── */
  if (!prompt) fail(`Ch${ch.no}: illustration.prompt 없음`);
  if (!prompt.includes('--ar 16:5')) fail(`Ch${ch.no}: --ar 16:5 누락`);
  if (!prompt.includes('--v 8.1')) fail(`Ch${ch.no}: --v 8.1 누락`);
  if (!/NO visible face|NO people/i.test(prompt)) fail(`Ch${ch.no}: 얼굴 차단 문구 없음`);
  if (!/NO /.test(prompt)) fail(`Ch${ch.no}: 소재 배제절(NO ...) 없음`);

  const pure = directiveOnly(prompt).toLowerCase();
  for (const b of BANNED) {
    if (pure.includes(b)) fail(`Ch${ch.no}: 지시부에 금지어 "${b}"`);
  }

  const sentences = (data.passage || []).length;
  md += `---\n\n## Chapter ${ch.no} — ${ch.subtitle}\n\n`;
  md += `- 작성자: **${ch.author}** · 교과서 ${ch.page} · 본문 ${sentences}문장\n`;
  md += `- 저장 경로: \`dist/${UNIT}/${dest}\`\n`;
  md += `- 장면: ${data.illustration?.scene_ko ?? '(아래 프롬프트 참조)'}\n\n`;
  md += '```\n' + prompt + '\n```\n\n';
}

await fs.writeFile(path.join(__dirname, `_ILLUSTRATION_PROMPTS-${UNIT}.md`), md, 'utf8');

if (errors) {
  console.error(`\n❌ 프롬프트 규칙 위반 ${errors}건`);
  process.exit(1);
}
console.log(`✅ _ILLUSTRATION_PROMPTS-${UNIT}.md 생성 — 규칙 검증 통과 (${SOURCE.length}개 챕터)`);
