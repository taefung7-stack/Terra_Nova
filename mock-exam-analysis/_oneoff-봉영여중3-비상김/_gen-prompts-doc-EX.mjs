/* data/EX/*.json 의 illustration.prompt → _ILLUSTRATION_PROMPTS-EX.md (추가지문 11장)
 * 프롬프트 원본은 _author-EX-{1,2,3}.mjs. 문서를 직접 고치지 말고 원고 수정 → node _author-EX.mjs → 이 스크립트.
 * 사용법: node _gen-prompts-doc-EX.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SOURCE } from './_SOURCE-EX.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* 장면 설명(한국어) — 무엇을 그리는지 한눈에 확인용 */
const SCENE = {
  1: '문 닫힌 유인 매표소 창구와 나란히 선 승차권 자동판매기 — 밝은 옛 기차역 홀',
  2: '공연이 끝난 빈 소극장 무대 — 붉은 막, 의자 하나, 무대 구석의 구급상자(위기 뒤의 안도)',
  3: '밝은 초원 가장자리에서 귀를 세우고 경계하는 어린 사슴 — 생존 본능',
  4: '보청기·헤드셋·점자 키보드가 놓인 밝은 사무 책상 — 포용적인 일터',
  5: '18세기풍 음악실 — 하프 한 대와 그랜드피아노 한 대, 빈 종이, 깃펜(작곡가와 독창성)',
  6: '나란한 칸의 카푸친 원숭이 두 마리 — 한쪽은 포도, 한쪽은 오이(불공평한 보상)',
  7: '공부 책상 — 펼친 교과서, 높이 쌓인 빈 카드와 뒤집어 둔 카드 더미(복습·자기 시험)',
  8: '자연사 박물관 진열대 — 박쥐 날개뼈와 말 앞다리뼈, 유리 덮개 속 새 날개와 벌(상동·상사)',
  9: '흰 받침대 위 한정판 운동화 한 켤레와 뒤쪽 선반의 똑같은 신발 상자들(스놉 효과)',
  10: '흰 대리석 받침 위 명품 손목시계와 디자이너 핸드백 — 가격표 없는 고급 부티크(베블런 효과)',
  11: '붉은 장미 덩굴의 베로나풍 발코니와 모래가 떨어지는 작은 모래시계(사라질 것 같은 시간)',
};

let md = `# 봉영여중3 추가지문 — 삽화 미드저니 프롬프트 (11장)

> 규격 **\`--ar 16:5 --v 8.1\`** 고정, 실사 포토리얼.
> 생성 후 원본을 \`dist/EX/{N}.png\` 로 받고, 가로 2000px 축소본을 \`dist/EX/assets/illust-{N}.png\` 로 넣은 뒤
> 분석지 재빌드(README 「추가지문」 절). 이미지가 없으면 INTRO 면에 placeholder 가 찍힌다.
> ⚠️ 이 문서는 \`_gen-prompts-doc-EX.mjs\` 가 생성한다. 직접 고치지 말 것.

## 공통 규칙

1. **밝기는 조명 조건으로** — \`natural soft diffused daylight, bright overcast sky, high-key exposure\`. \`sunlit\`·\`golden\` 은 실사에서 역광·저녁빛이 된다.
2. **사람은 아예 뺀다** — 손가락·얼굴이 뭉개진다. Sarah·Jeevan·Arthur·살리에리·로미오와 줄리엣 모두 **사물·장소**로 암시했다.
3. **배제는 \`--no\` 파라미터로** — 문장 속 \`NO xxx\` 는 오히려 그 물건을 불러온다.
4. **글자 차단** — 매표기·노트북·시계 화면에 글자가 생기기 쉬워 \`text, letters, words, numbers, signage\` 를 늘 \`--no\` 에 넣었다.
5. **11장이 서로 닮지 않게** — 책상 장면(04·07), 상점 장면(09·10), 모래시계(11만)가 겹치지 않도록 서로의 소재를 \`--no\` 에 넣었다.

---

`;
for (const ch of SOURCE) {
  const d = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'EX', `${ch.no}.json`), 'utf8'));
  md += `## ${ch.no}. ${ch.title}\n\n\`dist/EX/assets/illust-${ch.no}.png\` — ${SCENE[ch.no]}\n\n\`\`\`\n${d.illustration.prompt}\n\`\`\`\n\n`;
}
fs.writeFileSync(path.join(__dirname, '_ILLUSTRATION_PROMPTS-EX.md'), md, 'utf8');
console.log('✅ _ILLUSTRATION_PROMPTS-EX.md —', SOURCE.length, '장');
