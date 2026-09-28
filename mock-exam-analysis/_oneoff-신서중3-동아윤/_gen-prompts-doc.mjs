/* 저작 원고(_author/L*.mjs)의 illust 프롬프트 → _ILLUSTRATION_PROMPTS.md
 * 프롬프트는 원고가 단일 소스다. 문서를 직접 고치지 말고 원고를 고친 뒤 다시 돌릴 것.
 * 사용법: node _oneoff-신서중3-동아윤/_gen-prompts-doc.mjs */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LESSONS = [
  ['L5', 'Lesson 5 — The Team Behind the Team (Hidden People in Sports)'],
  ['L6', 'Lesson 6 — Stories for All Time (One Lucky Sunday)'],
  ['L7', 'Lesson 7 — Technology in Our Lives (Living with Big Data)'],
];

let md = `# 신서중3 동아(윤정미) — 삽화 미드저니 프롬프트 (12장)

> 규격 **\`--ar 16:5 --v 8.1\`** 고정. 실사 포토리얼 톤.
> 생성 후 \`dist/{L5,L6,L7}/assets/illust-{N}.png\` 로 저장(가로 2000px 축소) → 분석지 재빌드.
> ⚠️ 이 문서는 \`_gen-prompts-doc.mjs\` 가 \`_author/L*.mjs\` 에서 생성한다. 직접 고치지 말 것.

## 공통 규칙

1. **밝기는 조명 조건으로 지정** — \`natural soft diffused daylight\` / \`bright overcast sky\` /
   \`high-key exposure\` / \`low contrast\`. \`sunlit\`·\`golden\` 은 실사에서 역광·저녁빛으로 어두워진다.
2. **사람은 아예 뺀다** — 손가락·얼굴이 뭉개진다. 페이서·피트 크루·셰르파·Boggis 씨 모두
   **사물·장소**로 암시한다(풍선·깃발, 빈 피트 레인, 베이스캠프 텐트, 골동품 탁자).
3. **배제는 문장 속 NO 가 아니라 \`--no\` 파라미터로** — 문장 속 \`NO xxx\` 는 오히려 그 물건을 불러온다.
4. **글자 차단** — 풍선·완주 시간·가격표·지도 라벨·화면 글자가 생기기 쉬워 \`text, letters, numbers\` 를 늘 \`--no\` 에 넣었다.
5. **12장이 서로 닮지 않게** 각 프롬프트의 \`--no\` 에 다른 챕터의 핵심 소재를 넣었다.

---
`;

for (const [L, title] of LESSONS) {
  const { CHAPTERS } = await import(`./_author/${L}.mjs`);
  const { SOURCE } = await import(`./_SOURCE-${L}.js`);
  md += `\n## ${title}\n`;
  for (const c of CHAPTERS) {
    const s = SOURCE.find(x => x.no === c.no);
    md += `\n### ${L} Ch${c.no} · ${s.title}\n\`dist/${L}/assets/illust-${c.no}.png\` — ${s.subtitle}\n\n\`\`\`\n${c.illust.replace(/\s+/g, ' ').trim()}\n\`\`\`\n`;
  }
}
await fs.writeFile(path.join(__dirname, '_ILLUSTRATION_PROMPTS.md'), md);
console.log('✓ _ILLUSTRATION_PROMPTS.md');
