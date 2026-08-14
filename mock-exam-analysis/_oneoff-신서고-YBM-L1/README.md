# 신서고 2학년 2학기 중간고사 — YBM(박준언) 영어II 본문 분석지 (Lesson 1·2)

> ⚠️ **개인 용도 1회성 산출물입니다. 테라노바 판매용이 아닙니다.**
> 판매·구독 파이프라인(Supabase Storage 업로드, dispatch-order-pdf, 합본, market)에
> **절대 연결하지 마세요.** `package.json` 에도 스크립트를 등록하지 않았습니다
> (정식 회차 목록 오염 방지 — `_oneoff-천재영어2-L3` 와 동일 정책).
> 폴더명은 최초 생성 시점 이름(`_oneoff-신서고-YBM-L1`)을 유지하지만 **L1·L2 둘 다** 들어 있습니다.

## 무엇인가

교과서 **2022 개정 YBM(박준언) 영어II** 본문을 테라노바 **모의고사 분석지 v1.0**
디자인 그대로 제작한 본문 분석지입니다.

- **Lesson 1** — The Story of Hip-Hop Music
- **Lesson 2** — The Subscription Economy: From Ownership to Access

## 폴더 구조 (과별 분리)

```
data/L1/1~5.json      dist/L1/1~5.{html,pdf} + 합본     _SOURCE.js      (L1 원문 정본)
data/L2/1~5.json      dist/L2/1~5.{html,pdf} + 합본     _SOURCE-L2.js   (L2 원문 정본)
styles/analysis.css   ← 두 과 공용 (빌더에 --styles= 로 지정)
```

## 원본 포맷과의 차이 (요청 반영)

정식 모의고사 분석지는 "1지문 = 1분석지" 구조라 삽화가 1장입니다.
교재는 본문이 길어 **교과서 소제목 5개 기준으로 5개 챕터로 분할**했고,
**각 챕터가 독립 분석지 1부**가 되어 **챕터마다 첫 페이지 상단에 삽화 1장**이 들어갑니다.
→ 과마다 **삽화 5장**, 각 챕터 시작 지점에 배치됩니다.

### Lesson 1 — The Story of Hip-Hop Music

| Ch | 교과서 소제목 | 원문 문장 | 분석 카드 | 페이지 |
|----|---------------|-----------|-----------|--------|
| 1 | The Story of Hip-Hop Music (도입) | 18 | 10 | 7p |
| 2 | DJing, Breakdancing, and MCing | 19 | 13 | 7p |
| 3 | The Origin of the Word Hip-Hop | 11 | 8 | 6p |
| 4 | The Messages of Hip-Hop | 16 | 13 | 7p |
| 5 | Hip-Hop in the 21st Century | 6 | 6 | 5p |
| | **합계** | **70** | **50** | **32p** |

### Lesson 2 — The Subscription Economy

| Ch | 교과서 소제목 | 원문 문장 | 분석 카드 | 페이지 |
|----|---------------|-----------|-----------|--------|
| 1 | The Subscription Economy (도입) | 6 | 6 | 5p |
| 2 | Subscriptions are everywhere | 11 | 8 | 6p |
| 3 | People love the subscriptions | 19 | 12 | 7p |
| 4 | Online platforms drive the subscription economy | 7 | 7 | 6p |
| 5 | Limitations of the subscription economy | 15 | 11 | 7p |
| | **합계** | **58** | **44** | **31p** |

**전체: 원문 128문장 · 분석 카드 94 · 본문 63p**

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

- `_SOURCE.js` / `_SOURCE-L2.js` — 원문 PDF에서 verbatim 전사한 **기계 판독용 정본**
  (L1 70문장 / L2 58문장). 임의 수정 금지.
- `_SOURCE_MANIFEST.md` — 사람이 읽는 L1 원문 대조표.
- `verify.mjs` — 정본과 각 챕터 JSON을 대조. 다음을 **강제**합니다.
  1. `passage` 가 원문과 verbatim 일치 (문장 수·순서·구두점까지)
  2. `passage_ko.length` === `passage.length` (해석 누락 0)
  3. **분석 카드를 이어붙인 영어가 원문 전문과 일치** + `covers` 가 원문 문장을
     빠짐없이 1회씩 오름차순 커버 (짧은 문장 병합은 허용, 누락·순서변경은 차단)
  4. 어휘 본문 등장 여부 (불규칙·`-e` 탈락 활용형까지 흡수)

## 빌드 방법

```bash
cd mock-exam-analysis
L=L1   # 또는 L2

# 0) 무결성 검증 — 반드시 먼저 (실패 시 빌드 금지)
node "_oneoff-신서고-YBM-L1/verify.mjs"          # 인자 없으면 L1·L2 전부

# 1) HTML 빌드 (puppeteer 실측 페이지 분배)
#    ★ data 가 L1/L2 로 한 단계 깊어져 --styles 로 CSS 위치를 명시해야 한다
node builder/build.mjs "_oneoff-신서고-YBM-L1/data/$L" "_oneoff-신서고-YBM-L1/dist/$L" \
  --styles="_oneoff-신서고-YBM-L1/styles/analysis.css"

# 2) PDF 렌더
node builder/pdf.mjs "_oneoff-신서고-YBM-L1/dist/$L"

# 3) 넘침 검사 — overflow 0 이 절대 조건
for n in 1 2 3 4 5; do
  node builder/check-overflow.mjs "_oneoff-신서고-YBM-L1/dist/$L/$n.html"
done

# 4) 합본 — 5개 챕터를 1개 PDF 로, 페이지 번호 연속 재부여
node "_oneoff-신서고-YBM-L1/combine.mjs" $L
```

## 합본 (`combine.mjs`)

5개 챕터 PDF 를 하나로 합치되, **페이지 번호를 합본 전체 기준 1부터 다시 매긴다.**
(챕터별 PDF 는 각자 1부터 시작하므로 그대로 이으면 1-7, 1-7, 1-6… 이 되어 못 씀)

- 각 `.page` 의 `<span class="pageno">` 를 누적 카운터로 치환
- **표지 + 목차**를 앞에 붙임 (이 두 장은 번호를 매기지 않음 → 본문 첫 장이 1p)
- 목차의 챕터 시작 페이지는 실제 누적값으로 자동 계산

| 과 | 산출물 | 구성 |
|----|--------|------|
| L1 | `dist/L1/신서고2-2중간_YBM영어II_Lesson1_본문분석_합본.pdf` | 표지1+목차1+본문32 = **34p** |
| L2 | `dist/L2/신서고2-2중간_YBM영어II_Lesson2_본문분석_합본.pdf` | 표지1+목차1+본문31 = **33p** |

챕터 시작 페이지 — L1: 1 / 8 / 15 / 21 / 28 · L2: 1 / 6 / 12 / 19 / 25

> 공용 `builder/combine.mjs` 는 모의고사 표지("18~45번" 등)가 하드코딩돼 있고 페이지
> 번호를 재부여하지 않으므로, 이 폴더 전용 `combine.mjs` 를 따로 두었다.
>
> ⚠️ **함정(2026-08-14 사고)**: `combined.html` 의 CSS 경로를 `../styles/...` 로
> 하드코딩했더니 `dist/{L1,L2}/` 로 한 단계 깊어지면서 링크가 깨졌고, CSS 가 없으니
> `.page` 의 A4 고정 높이가 사라져 **34섹션이 28페이지로 재배치**됐다(페이지 유실).
> 지금은 `path.relative` 로 계산한다. 합본 후 **PDF 페이지 수 = .page 섹션 수**를
> 반드시 대조할 것.

## 삽화

미드저니 프롬프트는 각 챕터 JSON 의 `illustration.prompt` 에 들어 있고,
`_ILLUSTRATION_PROMPTS-L1.md` / `-L2.md` 에 과별로 모아 두었습니다.
(`node "_oneoff-신서고-YBM-L1/collect-prompts.mjs"` 로 재생성)

- 규격: **`--ar 16:5 --v 8.1`**
- 톤: **플랫 벡터 에디토리얼** — 흰 배경 + high key + 그라데이션 없음
  - 2026-08-14 변경: 기존 "시네마틱 + 페인터리 3D" 는 결과물이 **어둡게** 나와 폐기.
    `cinematic` `painterly` `3D` `sunlit` `glowing` `golden` `saturated` 등 **어둠 유발
    키워드 금지**. 밝기를 조명(`bright`)으로 요청하면 미드저니가 황금빛 저녁+강한 대비로
    해석해 오히려 어두워지므로, **그림 재질 자체**(flat·no gradients)를 지정한다.
  - 5장이 다 비슷해 보이던 문제는 **소재 분리**로 해결. 프롬프트마다 `NO ...` 배제 조건을
    넣어 군중·벽돌벽 같은 공통 소재가 여러 챕터에 겹치지 않게 한다. 팔레트도 챕터별로 분리.
- 생성한 이미지를 `dist/{L1,L2}/assets/illust-{1..5}.png` 로 저장하면 PDF 재렌더 시 자동 반영.
- 이미지가 없으면 해당 자리에 `[삽화 영역]` placeholder 가 표시됩니다(빌드는 정상 통과).

## 이 폴더만의 특이사항

- `styles/analysis.css` 는 `2026-june-grade3/styles/analysis.css` 의 **로컬 사본**입니다.
  (PretendardTN 글리프 보정 포함) + 문장 태그 칩 가운데 정렬 보정만 추가.
- **공용 빌더(`builder/build.mjs`)에 추가한 것은 전부 옵트인 플래그**이며, 플래그가 없는
  정식 회차는 기존 동작 그대로입니다(2026-june-grade3 재빌드 diff 로 회귀 0 확인).
  - 데이터 플래그: `hide_answer`(ANSWER 블록 숨김) / `hide_brand`(푸터 브랜드 숨김) /
    `hide_head_no`(헤더 "· N번" 숨김)
  - CLI 옵션: `--styles=<경로>` (data 가 L1/L2 로 중첩돼 기본 경로 규칙이 안 맞을 때)
- `exam` 필드는 `"신서고 2-2 중간 · YBM(박준언)"` — 페이지 헤더에 표기됩니다.
