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
 *   2) 지시부(= --no 뒷부분을 걷어낸 앞부분)에 금지어 0
 *      cinematic / golden hour / sunlit / dramatic lighting / chiaroscuro /
 *      moody / neon / night
 *      ★ --no 뒤에서는 오히려 써야 하므로, 검사 전에 그 부분을 먼저 제거한다.
 *        (단순 grep 은 네거티브까지 잡아 오탐한다 — 신서고 README 의 지적)
 *   3) --no 네거티브 파라미터 존재 + face / text 계열 포함
 *   4) 지시부 800자 상한 — 길면 주제가 희석돼 이상한 이미지가 나온다
 *
 * 사용법: node _oneoff-신목고-세계문학/collect-prompts.mjs
 * =================================================================== */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** 유닛 등록 — 새 유닛을 만들면 여기에 한 줄 추가한다.
 *  label : 문서 제목에 쓰는 유닛 이름
 *  byline: 챕터 머리 한 줄 (U1 은 게시글 작성자, U2 는 PART 이름) */
const UNITS = {
  U1: {
    file: './_SOURCE-U1.js',
    label: 'Unit 1',
    byline: (ch) => `작성자: **${ch.author}**`,
  },
  U2: {
    file: './_SOURCE-U2.js',
    label: 'Unit 2 — A French Student in Dublin',
    byline: (ch) => `**${ch.part}**`,
  },
};

const UNIT = (process.argv[2] || 'U1').toUpperCase();
if (!UNITS[UNIT]) {
  console.error(`알 수 없는 유닛: ${UNIT} (${Object.keys(UNITS).join(', ')})`);
  process.exit(2);
}
const { file: SOURCE_FILE, label: UNIT_LABEL, byline: BYLINE } = UNITS[UNIT];
const { SOURCE } = await import(SOURCE_FILE);

const BANNED = [
  'cinematic', 'golden hour', 'sunlit', 'dramatic lighting',
  'chiaroscuro', 'moody', 'neon', 'night',
];

/** 네거티브를 걷어낸 '순수 지시부'. 금지어 검사는 여기에만 적용한다.
 *  --no 파라미터 뒤쪽은 "빼 달라"는 목록이므로 금지어가 있는 것이 정상이다.
 *  (구형 인라인 'NO xxx' 표기도 남아 있을 수 있어 함께 제거) */
function directiveOnly(prompt) {
  return prompt
    .replace(/--no[\s\S]*$/i, ' ')
    .replace(/NO [^,.]+[,.]?/g, ' ');
}

const TONE_NOTE = `> 톤: **실사 사진(포토리얼)** — 현대 한국의 일상, 흐린 날 확산광.
>
> ### 2026-09-02 전면 재작성 — 왜 바꿨나
> 이전 프롬프트는 **인라인 \`NO xxx\` 를 16개**씩 달고 1000자에 육박했다. 결과가 이상했다.
> 원인 두 가지:
> 1. **미드저니는 문장 속 \`NO xxx\` 를 부정으로 신뢰성 있게 처리하지 못한다.**
>    오히려 그 명사를 *요청*으로 읽어 끌어온다 — "NO chopsticks" 가 젓가락을 부른다.
>    특히 배제 대상이 그 장면에 **자연스럽게 어울리는 물건**일 때(한식 상 + 젓가락)
>    모순이 생겨 기괴한 결과가 나온다.
>    → 진짜 네거티브 파라미터 **\`--no a, b, c\`** 로 옮겼다.
> 2. **지시부가 길수록 주제가 희석된다.** 인물·소품·감정·배경을 한 문장에 욱여넣으면
>    어느 것도 선명하지 않다. → **주어 하나, 장면 하나**로 줄였다(지시부 800자 상한, 검증기 강제).
>
> ### 규칙
> - 밝기는 형용사가 아니라 **조명 조건**으로: \`natural soft diffused daylight\`
>   \`bright overcast sky\` \`high-key exposure\` \`low contrast\`.
>   \`golden hour\` \`sunlit\` 등은 지시부 금지(황금빛 저녁 + 고대비로 해석돼 되레 어두워진다).
>   단 **\`--no\` 뒤에는 반드시 넣어** 밀어낸다.
> - **사람을 등장시키지 않는다.** 손·뒷모습도 쓰지 않는다 — 미드저니가 손가락을 뭉개
>   기괴한 결과를 만드는 주범이었다. \`--no face, portrait, distorted hands, extra fingers\`.
>   사물·공간만으로 장면을 세운다.
> - **글자를 넣지 않는다.** \`--no text, letters, words, signage, logo\` — 미드저니가 만드는
>   가짜 한글/영문은 교재에 그대로 인쇄되면 치명적이다.
> - \`--style raw\` 로 과장된 연출을 억제한다.
> - 삽화 슬롯은 **16:5 레터박스 + \`object-fit: cover\`(중앙 크롭)** 이다.
>   주제를 **화면 중앙**에 두고, 위아래가 잘려도 살아남는 구도로 잡는다.`;

const HEADER = `# 신목고 2-2 중간 · 세계문학 ${UNIT_LABEL} — 챕터별 삽화 프롬프트

> 규격: **\`--ar 16:5 --v 8.1\`** (와이드 배너, 본문 180mm 폭 전면)
${TONE_NOTE}
>
> **이 문서는 파생물입니다.** 프롬프트 원본은 \`data/${UNIT}/{N}.json\` 의
> \`illustration.prompt\` 이며, 수정 후 \`node _oneoff-신목고-세계문학/collect-prompts.mjs ${UNIT}\`
> 로 이 문서를 다시 만듭니다.
>
> 생성한 이미지는 \`dist/${UNIT}/assets/illust-{N}.png\` 로 저장한 뒤 PDF 를 다시 렌더하면
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
  if (!/--no\s/.test(prompt)) fail(`Ch${ch.no}: --no 네거티브 파라미터 없음`);
  const neg = (prompt.match(/--no([\s\S]*)$/i) || [, ''])[1];
  if (!/face/i.test(neg)) fail(`Ch${ch.no}: --no 에 face 없음(초상 회피)`);
  if (!/text|letters|words/i.test(neg)) fail(`Ch${ch.no}: --no 에 text 계열 없음`);
  /* 프롬프트가 길수록 주제가 희석돼 이상한 이미지가 나온다(2026-09-02 실사고).
     지시부 800자를 상한으로 둔다. */
  const head = prompt.split(/--ar/)[0].trim();
  if (head.length > 800) fail(`Ch${ch.no}: 지시부가 너무 김(${head.length}자 > 800)`);

  const pure = directiveOnly(prompt).toLowerCase();
  for (const b of BANNED) {
    if (pure.includes(b)) fail(`Ch${ch.no}: 지시부에 금지어 "${b}"`);
  }

  const sentences = (data.passage || []).length;
  md += `---\n\n## Chapter ${ch.no} — ${ch.subtitle}\n\n`;
  md += `- ${BYLINE(ch)} · 교과서 ${ch.page} · 본문 ${sentences}문장\n`;
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
