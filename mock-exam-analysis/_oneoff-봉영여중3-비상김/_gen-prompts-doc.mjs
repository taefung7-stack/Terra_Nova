/* 저작 원고(_author-L*.mjs)의 prompt → _ILLUSTRATION_PROMPTS.md
 * 프롬프트는 원고가 단일 소스다. 문서를 직접 고치지 말고 원고를 고친 뒤 다시 돌릴 것.
 * 사용법: node _gen-prompts-doc.mjs */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LESSONS = [
  ['L5', 'Lesson 5 — Critical Minds (Can You Spot Fake News?)'],
  ['L6', 'Lesson 6 — Words of Wisdom (A Father’s Wisdom)'],
  ['L7', 'Lesson 7 — Spend Wisely (Why We Buy What We Buy)'],
];

let md = `# 봉영여중3 비상(김진완) — 삽화 미드저니 프롬프트 (15장)

> 규격 **\`--ar 16:5 --v 8.1\`** 고정. 실사 포토리얼 톤.
> 생성 후 원본을 \`dist/{L5,L6,L7}/{N}.png\` 로 받고, 가로 2000px 축소본을 \`dist/{L}/assets/illust-{N}.png\` 로 넣은 뒤 분석지 재빌드(README 참조).
> ⚠️ 이 문서는 \`_gen-prompts-doc.mjs\` 가 \`_author-L*.mjs\` 의 \`prompt\` 필드에서 생성한다. 직접 고치지 말 것.

## 공통 규칙

1. **밝기는 조명 조건으로 지정** — \`natural soft diffused daylight\` / \`bright overcast sky\` / \`high-key exposure\` / \`low contrast\`. \`sunlit\`·\`golden\` 은 실사에서 역광·저녁빛으로 어두워진다.
2. **사람은 아예 뺀다** — 손가락·얼굴이 뭉개진다. 가짜 뉴스 독자·Puru와 Puneet·Jeff·Lisa·Nathan 모두 **사물·장소**로 암시한다(돋보기와 신문, 빈 의자 두 개, 돈주머니 두 개, 가운과 낡은 가구, 헤드폰 옆의 닻).
3. **배제는 문장 속 NO 가 아니라 \`--no\` 파라미터로** — 문장 속 \`NO xxx\` 는 오히려 그 물건을 불러온다.
4. **글자 차단** — 신문·가격표·간판에 글자가 생기기 쉬워 \`text, letters, words, numbers\` 를 늘 \`--no\` 에 넣었다. 신문은 \`blank\`·\`grey column blocks\` 로 묘사했다.
5. **폭력·공포 배제** — L5 총격·동물 탈출 기사는 **빈 탄광촌·낡은 동물원 울타리**로만 암시하고 \`guns, blood\` 를 막았다.
6. **15장이 서로 닮지 않게** 각 프롬프트의 \`--no\` 에 다른 챕터의 핵심 소재를 넣었다.

---
`;

for (const [L, title] of LESSONS) {
  const { chapters } = await import(`./_author-${L}.mjs`);
  const { SOURCE } = await import(`./_SOURCE-${L}.js`);
  md += `\n## ${title}\n`;
  for (const c of chapters) {
    const s = SOURCE.find(x => x.no === c.no);
    md += `\n### ${L} Ch${c.no} · ${s.title}\n\`dist/${L}/assets/illust-${c.no}.png\` — ${s.subtitle}\n\n\`\`\`\n${c.prompt.replace(/\s+/g, ' ').trim()}\n\`\`\`\n`;
  }
}
await fs.writeFile(path.join(__dirname, '_ILLUSTRATION_PROMPTS.md'), md, 'utf8');
console.log('✅ _ILLUSTRATION_PROMPTS.md 생성 (15장)');
