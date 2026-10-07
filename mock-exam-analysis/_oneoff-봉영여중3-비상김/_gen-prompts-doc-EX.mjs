/* data/EX/*.json 의 illustration.prompt → _ILLUSTRATION_PROMPTS-EX.md (추가지문 11장)
 * 프롬프트 원본은 _author-EX-{1,2,3}.mjs. 문서를 직접 고치지 말고 원고 수정 → node _author-EX.mjs → 이 스크립트.
 * 사용법: node _gen-prompts-doc-EX.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SOURCE } from './_SOURCE-EX.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let md = `# 봉영여중3 추가지문 — 삽화 미드저니 프롬프트 (11장)

> 규격 **\`--ar 16:5 --v 8.1\`** 고정, 실사 포토리얼. 사람·글자는 \`--no\` 로 배제(인라인 NO 금지).
> 생성 후 원본을 \`dist/EX/{N}.png\` 로 받고, 가로 2000px 축소본을 \`dist/EX/assets/illust-{N}.png\` 로 넣은 뒤
> 분석지 재빌드(README 「추가지문」 절). 이미지가 없으면 INTRO 면에 placeholder 가 찍힌다.
> ⚠️ 이 문서는 \`_gen-prompts-doc-EX.mjs\` 가 생성한다. 직접 고치지 말 것.

`;
for (const ch of SOURCE) {
  const d = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'EX', `${ch.no}.json`), 'utf8'));
  md += `## ${ch.no}. ${ch.title}\n\n\`\`\`\n${d.illustration.prompt}\n\`\`\`\n\n`;
}
fs.writeFileSync(path.join(__dirname, '_ILLUSTRATION_PROMPTS-EX.md'), md, 'utf8');
console.log('✅ _ILLUSTRATION_PROMPTS-EX.md —', SOURCE.length, '장');
