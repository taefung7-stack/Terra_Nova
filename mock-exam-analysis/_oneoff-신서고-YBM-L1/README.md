# 신서고 2학년 2학기 중간고사 — YBM(박준언) 영어II Lesson 1 본문 분석지

> ⚠️ **개인 용도 1회성 산출물입니다. 테라노바 판매용이 아닙니다.**
> 판매·구독 파이프라인(Supabase Storage 업로드, dispatch-order-pdf, 합본, market)에
> **절대 연결하지 마세요.** `package.json` 에도 스크립트를 등록하지 않았습니다
> (정식 회차 목록 오염 방지 — `_oneoff-천재영어2-L3` 와 동일 정책).

## 무엇인가

교과서 **2022 개정 YBM(박준언) 영어II · Lesson 1 — The Story of Hip-Hop Music** 본문을
테라노바 **모의고사 분석지 v1.0** 디자인 그대로 제작한 본문 분석지입니다.
빌더(`builder/build.mjs`)는 **수정하지 않고 그대로 재사용**했습니다.

## 원본 포맷과의 차이 (요청 반영)

정식 모의고사 분석지는 "1지문 = 1분석지" 구조라 삽화가 1장입니다.
이 교재는 본문이 길어 **교과서 소제목 5개 기준으로 5개 챕터로 분할**했고,
**각 챕터가 독립 분석지 1부**가 되어 **챕터마다 첫 페이지 상단에 삽화 1장**이 들어갑니다.
→ 결과적으로 **삽화 5장, 각 챕터 시작 지점에 배치**됩니다.

| Ch | 교과서 소제목 | 원문 문장 | 분석 카드 | 페이지 | 삽화 | 산출물 |
|----|---------------|-----------|-----------|--------|------|--------|
| 1 | The Story of Hip-Hop Music (도입) | 18 | 10 | 7p | `assets/illust-1.png` | `dist/1.pdf` |
| 2 | DJing, Breakdancing, and MCing | 19 | 13 | 7p | `assets/illust-2.png` | `dist/2.pdf` |
| 3 | The Origin of the Word Hip-Hop | 11 | 8 | 6p | `assets/illust-3.png` | `dist/3.pdf` |
| 4 | The Messages of Hip-Hop | 16 | 13 | 7p | `assets/illust-4.png` | `dist/4.pdf` |
| 5 | Hip-Hop in the 21st Century | 6 | 6 | 5p | `assets/illust-5.png` | `dist/5.pdf` |
| | **합계** | **70** | **50** | **32p** | 5장 | |

각 챕터 분석지 구성:
1. **INTRO** — 요약·요지·제목 + **삽화(16:5)** + 단어표
2. **PASSAGE** — 본문 전문(문장별 해석) + 4단 논리흐름
3. **SENTENCE ANALYSIS** — 전 문장 어법·어휘·리딩 분석 (+ 핵심 문장 패러프레이징 상/중/하)

### 정식 회차 포맷과 다른 점 (2026-08-14 사용자 요청)

- **ANSWER(정답·오답 분석) 블록 없음** — 문제를 푸는 교재가 아니라 순수 본문 분석이므로
  제거했다. 데이터의 `hide_answer: true` 플래그로 제어하며, 플래그가 없는 정식 회차는
  기존 동작 그대로(회귀 0, 2026-june-grade3 재빌드 diff 로 확인).
  PASSAGE 헤더 우측에는 발문 대신 `subtitle`(챕터 소제목)이 표시된다.
- **짧은 문장은 분석 카드를 병합** — 한 문장씩 카드를 만들면 분량이 과도해져,
  인접한 짧은 문장(특히 Ch1 의 인용 대사 9~13번)을 한 카드로 묶었다.
  카드의 `covers: [원문 문장번호...]` 가 어떤 문장을 묶었는지 기록한다.
  **본문 전문(PASSAGE) 페이지는 원문 70문장을 그대로 1문장씩 보여준다** — 병합은
  분석 카드에만 적용된다.

## 문장 누락 0 보장 장치

교재 분석에서 문장이 빠지는 사고를 막기 위해 **원문 정본 + 자동 검증**을 두었습니다.

- `_SOURCE.js` — 원문 PDF에서 verbatim 전사한 **기계 판독용 정본** (70문장). 임의 수정 금지.
- `_SOURCE_MANIFEST.md` — 사람이 읽는 원문 대조표.
- `verify.mjs` — 정본과 각 챕터 JSON을 대조. 다음을 **강제**합니다.
  1. `passage` 가 원문과 verbatim 일치 (문장 수·순서·구두점까지)
  2. `passage_ko.length` === `passage.length` (해석 누락 0)
  3. `sentences.length` === `passage.length` (문장분석 누락 0)
  4. `sentences[i].en_html` 의 태그 제거 결과 === `passage[i]`
  5. 정답 정확히 1개 · 오답 해설 전부 존재 · 어휘 본문 등장 여부

## 빌드 방법

```bash
cd mock-exam-analysis

# 0) 무결성 검증 — 반드시 먼저 (실패 시 빌드 금지)
node "_oneoff-신서고-YBM-L1/verify.mjs"

# 1) HTML 빌드 (puppeteer 실측 페이지 분배)
node builder/build.mjs "_oneoff-신서고-YBM-L1/data" "_oneoff-신서고-YBM-L1/dist"

# 2) PDF 렌더
node builder/pdf.mjs "_oneoff-신서고-YBM-L1/dist"

# 3) 넘침 검사 — overflow 0 이 절대 조건
for n in 1 2 3 4 5; do
  node builder/check-overflow.mjs "_oneoff-신서고-YBM-L1/dist/$n.html"
done
```

## 삽화

미드저니 프롬프트는 각 챕터 JSON 의 `illustration.prompt` 에 들어 있고,
`_ILLUSTRATION_PROMPTS.md` 에 5개를 모아 두었습니다.

- 규격: **`--ar 16:5 --v 8.1`** (테라노바 삽화 공통 규칙)
- 톤: 밝고 선명한 시네마틱 에디토리얼 + 페인터리 3D
- 생성한 이미지를 `dist/assets/illust-{1..5}.png` 로 저장하면 재빌드 시 자동 반영됩니다.
- 이미지가 없으면 해당 자리에 `[삽화 영역]` placeholder 가 표시됩니다(빌드는 정상 통과).

## 이 폴더만의 특이사항

- `styles/analysis.css` 는 `2026-june-grade3/styles/analysis.css` 의 **로컬 사본**입니다.
  (PretendardTN 글리프 보정 포함 — 원본에 이미 적용돼 있어 추가 수정 없음)
- 원본 공용 CSS 와 v1.0 LOCKED 빌더는 **건드리지 않았습니다.**
- `exam` 필드는 `"신서고 2-2 중간 · YBM(박준언) 영어II"` — 페이지 헤더에 표기됩니다.
