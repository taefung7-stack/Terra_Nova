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
data/L1/1~5.json              dist/L1/1~5.{html,pdf} + 합본     _SOURCE.js      (L1 원문 정본)
data/L1/1~5-variant.json      dist/L1/variant-book.{html,pdf}   ← 변형문제
data/L2/1~5.json              dist/L2/1~5.{html,pdf} + 합본     _SOURCE-L2.js   (L2 원문 정본)
data/L2/1~5-variant.json      dist/L2/variant-book.{html,pdf}   ← 변형문제
styles/analysis.css           ← 분석지용 (빌더에 --styles= 로 지정)
styles/variant.css            ← 변형문제용
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

## 변형문제 (2026-08-16 추가)

분석지와 별개로 **유형별 변형문제집**을 같은 폴더에 만든다. 공용 빌더
`builder/build-variant.mjs` 를 쓰되, data 가 `L1/L2` 로 한 단계 깊어 **`--styles=` 필수**.

| 과 | 산출물 | 구성 |
|----|--------|------|
| L1 | `dist/L1/variant-book.{html,pdf}` | 52p · 객관식 55 + 서술형 30 = **85문항** |
| L2 | `dist/L2/variant-book.{html,pdf}` | 52p · 객관식 55 + 서술형 30 = **85문항** |

챕터(5개)마다 **객관식 11유형**(주제·요지·제목·함축·어법·어휘·빈칸·무관문장·순서·삽입·요약)과
**서술형 6개**(배열영작·조건영작·빈칸완성·해석·요약완성·주제문). 정답·해설은 책 뒤에 몰아 배치.

```bash
cd mock-exam-analysis
L=L1   # 또는 L2

# 0) 변형문제 무결성 검증 — 반드시 먼저 (실패 시 빌드 금지)
node "_oneoff-신서고-YBM-L1/verify-variant.mjs"        # 인자 없으면 L1·L2 전부

# 1) HTML 빌드 (★ --styles 필수)
node builder/build-variant.mjs "_oneoff-신서고-YBM-L1/data/$L" "_oneoff-신서고-YBM-L1/dist/$L" \
  --styles="_oneoff-신서고-YBM-L1/styles/variant.css"

# 2) 넘침 검사 — overflow 0 이 절대 조건
node builder/check-overflow.mjs "_oneoff-신서고-YBM-L1/dist/$L/variant-book.html"

# 3) PDF 렌더 (변형문제 책만 — builder/pdf.mjs 는 dist 안 모든 html 을 다시 만든다)
node "_oneoff-신서고-YBM-L1/render-variant-pdf.mjs" "_oneoff-신서고-YBM-L1/dist/$L/variant-book.html"
```

### ⚠️ 변형문제의 조용한 실패 (verify-variant.mjs 를 반드시 돌릴 것)

빌더는 밑줄·빈칸을 **passage 안에서 문자열을 찾아 치환**하는 방식이다.
`underlines[].text` / `blank_target` / `underlined` 가 그 유형의 `passage` 에 **문자 그대로
없으면 에러 없이 조용히 밑줄·빈칸이 사라진 채** 빌드된다(문제가 성립하지 않는 사고).
`verify-variant.mjs` 가 이걸 강제 검사한다 — 대상 문자열 존재, 어법·어휘 밑줄 5개 +
오답 정확히 1개 + `answer` 일치, 삽입 슬롯 1~5, 요약 `__(A)__`/`__(B)__`, 원문 패러프레이즈 여부.

> 실제로 이 검사가 사고를 잡았다: 패러프레이즈를 다듬다가 `that is fast becoming` 을
> `that is fast turning` 으로 바꿔 밑줄 대상이 사라진 것을 빌드 전에 검출했다.

### 공용 빌더에 추가한 옵트인 (회귀 0)

`build-variant.mjs` 의 CSS 경로가 `../styles/variant.css` 로 하드코딩돼 있어
`data/L1` 처럼 한 단계 깊은 구조에서 깨졌다. **`--styles=<경로>` 플래그를 옵트인으로 추가**하고,
지정 시 `path.relative` 로 dist 기준 상대경로를 계산한다. 플래그가 없으면 기존 규칙 그대로.

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

## 워크북 (2026-08-16 추가)

분석지와 같은 5개 챕터 구성으로 **워크북**을 함께 만들었다.
디자인은 정식 회차 워크북 v1.0(9-STEP) 그대로이며, 데이터만 이 폴더 것을 쓴다.

| 과 | 챕터별 | 합본 |
|----|--------|------|
| L1 | `dist/L1/workbook-{1..5}.{html,pdf}` (11·11·9·11·11p) | `신서고2-2중간_YBM영어II_Lesson1_워크북_합본.pdf` — 표지1+목차1+본문53 = **55p** |
| L2 | `dist/L2/workbook-{1..5}.{html,pdf}` (9·11·11·10·11p) | `신서고2-2중간_YBM영어II_Lesson2_워크북_합본.pdf` — 표지1+목차1+본문52 = **54p** |

9-STEP: 본문·해석 → 어법 양자택일 → 어휘 양자택일 → 빈칸 첫글자 → 한글 해석 →
영문 배열 → 통문장 영작 → 종합 → 정답·해설.
챕터 시작 페이지 — L1: 1 / 12 / 23 / 32 / 43 · L2: 1 / 10 / 21 / 32 / 42

### 빌드 방법

```bash
cd mock-exam-analysis
L=L1   # 또는 L2

# 0) 워크북 무결성 검증 — 반드시 먼저 (실패 시 빌드 금지)
node "_oneoff-신서고-YBM-L1/verify-workbook.mjs"        # 인자 없으면 L1·L2 전부

# 1) HTML 빌드 (★ --styles 필수 — data 가 L1/L2 로 한 단계 깊다)
node builder/build-workbook.mjs "_oneoff-신서고-YBM-L1/data/$L" "_oneoff-신서고-YBM-L1/dist/$L" \
  --styles="_oneoff-신서고-YBM-L1/styles/workbook.css"

# 2) 넘침 검사 — overflow 0 이 절대 조건
for n in 1 2 3 4 5; do
  node builder/check-overflow.mjs "_oneoff-신서고-YBM-L1/dist/$L/workbook-$n.html"
done

# 3) PDF — 글리프 안전한 이미지 합성 경로 사용(분석지 PDF 는 건드리지 않도록 --match)
node builder/pdf-image.mjs "_oneoff-신서고-YBM-L1/dist/$L" --match='^workbook-\d+\.html$'

# 4) 합본 (표지+목차, 페이지 번호 연속 재부여, 페이지 수 자동 대조)
node "_oneoff-신서고-YBM-L1/combine-workbook.mjs" $L
```

### `verify-workbook.mjs` — 워크북 전용 무결성 검증

워크북 문항은 본문을 **변형**해 만들기 때문에, 검증이 없으면 원문에 없는 문장·단어를
지어낸 문항이 조용히 섞인다. 다음을 **강제**한다(위반 시 exit 1).

1. `en_template` 의 `{{n:A/B}}` 에 **정답 A 를 넣어 복원한 문장 = 본문 원문**(구두점까지)
2. `answers` 가 토큰 수와 일치 + 각 정답이 A 슬롯과 동일, 정답≠오답
3. 빈칸 `answer` 가 **빌더가 쓰는 `\banswer\b` 정규식으로 실제 매칭** + `letter` 가 첫 글자
4. `jumble.answer` = 본문 원문, `words` 의 단어 집합 = answer 의 단어 집합
5. `mixed.ref` 가 실재하는 `no`, 모든 `no` 가 1..n 연속
6. `voca_check` 정답이 본문에 등장 / 본문 문장 커버리지 리포트

### ⚠️ 함정 — 빌더의 고유명사 오탐 (2026-08-16)

`build-workbook.mjs` 의 `buildProperNounSet` 은 **"문두에만 등장하는 대문자 단어"를
고유명사로 간주**한다. 그래서 `Although` `While` `Despite` `Related` `Whoever`
`Imagine` `Unemployment` `Abandoned` `Despair` 같은 **평범한 접속사·부사·일반명사가
고유명사로 오판**되고, 그 단어가 정답인 양자택일 문항은 `dropProperChoice` 로
**조용히 삭제**된다(에러 없음 — 정답지 "N문항" 숫자만 줄어든다).

- 실제로 초안에서 L2/5 어법이 9→5 로 잘리는 등 9문항이 유실됐다.
- **대응: 문두 단어를 정답 슬롯으로 쓰지 말 것.** 문법 포인트는 유지하되 토큰을
  문장 중반 요소로 옮긴다. (예: `{{1:Although/Despite}} ... offers` →
  `Although ... {{1:offers/offer}}`)
- 검증: 저작 문항 수와 렌더된 정답지 "N문항" 이 일치하는지 반드시 대조.
  (`verify-workbook.mjs` 는 데이터 정합성만 보므로 이 유실은 잡지 못한다)

> 빌더는 v1.0 LOCKED 이고 정식 회차가 이 휴리스틱에 의존하므로 **빌더를 고치지 않고**
> 데이터 쪽에서 회피했다. 정식 회차 재빌드 diff 0 으로 회귀 없음 확인.

### STEP 1 2페이지 여백 (알려진 한계)

STEP 1 은 분할 단위가 `passage-grid` / `voca-block` / `voca-2col` 같은 큰 덩어리라,
마지막 블록이 안 들어가면 통째로 다음 장으로 밀려 2페이지가 27~60% 만 차는 챕터가 있다.
`SAFETY` 상향(0.995)과 `voca-2col` 반쪽 분할을 둘 다 시도했으나 전자는 효과가 거의 없고
후자는 **넘침(104~117%)** 을 유발해 폐기했다. overflow 0 이 절대 조건이므로 현재 동작을
유지한다. 고치려면 반쪽 높이를 puppeteer 로 실측해야 한다(빌더 주석에 기록).

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
