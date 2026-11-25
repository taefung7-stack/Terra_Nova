/* data/EX/*.json 의 illustration.prompt → _ILLUSTRATION_PROMPTS-EX.md (봉영여중2 영어B 추가지문 5장)
 * 프롬프트 원본은 _author-EX-{1,2}.mjs. 문서를 직접 고치지 말고 원고 수정 → node _author-EX.mjs → 이 스크립트.
 * 사용법: node _gen-prompts-doc-EX.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SOURCE } from './_SOURCE-EX.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* 장면 설명(한국어) — 무엇을 그리는지 한눈에 확인용 */
const SCENE = {
  7: '여름 들판 — 보라색 백리향 꽃송이에 앉은 연푸른 점박이 나비(라지 블루), 아래 풀줄기를 따라 개미집으로 가는 붉은 개미 몇 마리',
  8: '밝은 커피숍 — 나란히 선 셀프 주문 키오스크 두 대와 바닥에 일정 간격으로 붙은 원형 대기 스티커(개인 공간)',
  9: '수족관 수조 — 왼쪽의 창꼬치와 오른쪽 고등어 떼 사이 빈 공간, 희미한 세로 빛줄기로 이제는 없는 유리판 암시',
  10: '텅 빈 공항 탑승구 — 문 옆에 홀로 선 캐리어, 유리창 너머 막 활주로로 움직이는 비행기(아깝게 놓침)',
  11: '칠레 파타고니아 — 화강암 봉우리 사이 깊은 피오르, 물가로 흘러내린 거대한 빙하, 울창한 숲',
};

let md = `# 봉영여중2 영어B 기말 추가지문 — 삽화 미드저니 프롬프트 (7·8·9·10·영상 스크립트, 5장)

> 규격 **\`--ar 16:5 --v 8.1\`** 고정, 실사 포토리얼.
> 생성 후 원본을 \`dist/EX/{N}.png\` 로 받고, 가로 2000px 축소본을 \`dist/EX/assets/illust-{N}.png\` 로 넣은 뒤
> 분석지 재빌드(README 빌드 절). 이미지가 없으면 INTRO 면에 placeholder 가 찍힌다.
> ⚠️ 이 문서는 \`_gen-prompts-doc-EX.mjs\` 가 생성한다. 직접 고치지 말 것.

## 공통 규칙

1. **밝기는 조명 조건으로** — \`natural soft diffused daylight, bright overcast sky, high-key exposure\`.
2. **사람은 뺀다** — 공항·커피숍·경주도 사물·장소로 암시했다.
3. **배제는 \`--no\` 파라미터로** — 문장 속 \`NO xxx\` 는 오히려 그 물건을 불러온다.
4. **글자 차단** — 키오스크 화면·출발 안내판에 글자가 생기기 쉬워 \`text, letters, words, numbers, signage\` 를 늘 \`--no\` 에 넣었다.
5. **5장이 서로 닮지 않게** — 서로의 소재(나비·개미·수조·키오스크·비행기)를 \`--no\` 에 넣었다.

---

`;
for (const ch of SOURCE) {
  const d = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'EX', `${ch.no}.json`), 'utf8'));
  md += `## ${ch.no}. ${ch.title}\n\n\`dist/EX/assets/illust-${ch.no}.png\` — ${SCENE[ch.no]}\n\n\`\`\`\n${d.illustration.prompt}\n\`\`\`\n\n`;
}
fs.writeFileSync(path.join(__dirname, '_ILLUSTRATION_PROMPTS-EX.md'), md, 'utf8');
console.log('✅ _ILLUSTRATION_PROMPTS-EX.md —', SOURCE.length, '장');
