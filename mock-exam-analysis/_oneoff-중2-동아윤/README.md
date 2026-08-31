# 중2 — 2022 개정 동아(윤정미) 중학교 영어 2 본문분석 + 본문암기 (Lesson 5·6)

> ⚠️ **개인 용도 1회성 산출물입니다. 테라노바 판매용이 아닙니다.**
> 판매·구독 파이프라인(Supabase Storage 업로드, dispatch-order-pdf, market)에
> **절대 연결하지 마세요.** `package.json` 에도 스크립트를 등록하지 않았습니다
> (`_oneoff-신서중2-미래엔` / `_oneoff-신서고-YBM-L1` 와 동일 정책).

## 무엇인가

교과서 **2022 개정 동아(윤정미) 중학교 영어 2** 본문을 테라노바 모의고사
분석지 v1.0 디자인 그대로 제작한 **본문 분석지 + 본문암기 워크북**입니다.

- **Lesson 5** — Street Art in London (런던 거리 예술 투어: STIK · Banksy · Ben Wilson)
- **Lesson 6** — Dr. Schofield, a Foreigner Who Loved Korea (석호필, 한국을 사랑한 이방인)

> 요청 범위는 **본문분석 + 본문암기 2종**입니다. 9-STEP 워크북·변형문제는 만들지 않았습니다.

## 챕터 분할

교과서 문단을 따르되, 한 챕터가 너무 얇거나 두꺼워지지 않게 조정했습니다.

### Lesson 5 (원문 28문장 → 3챕터)

| Ch | 제목 | 원문 문장 | 문제 유형 |
|----|------|-----------|-----------|
| 1 | Street Art in London & STIK | 10 | 제목 |
| 2 | Banksy in Finsbury Park | 9 | 주제 |
| 3 | Ben Wilson's Gum Paintings | 9 | 요지 |
| | **합계** | **28** | |

교과서 문단은 4개이나 **도입이 2문장뿐**이라 Shoreditch 문단과 합쳤고,
그 결과 12문장이 된 첫 덩어리를 STIK 작품 설명이 끝나는 지점에서 잘라
**10 / 9 / 9** 로 균형을 맞췄습니다.

### Lesson 6 (원문 26문장 → 4챕터)

| Ch | 제목 | 원문 문장 | 문제 유형 |
|----|------|-----------|-----------|
| 1 | A Special Favor (극본) | 11 | 목적 |
| 2 | Seok Hopil, the Man Who Loved Korea | 7 | 내용일치 |
| 3 | Telling the World About March 1st | 5 | 주제 |
| 4 | He Never Left Again | 3 | 내용불일치 |
| | **합계** | **26** | |

Lesson 6 앞부분은 **극본(대화) 형식**입니다. 화자 라벨(`A man:` /
`Dr. Schofield:`)은 문장이 아니므로 `_SOURCE-L6.js` 의 `speakers` 배열에
따로 싣고, `passage` 에는 발화 내용만 담습니다.

## 산출물

| 과 | 본문분석 합본 | 본문암기 |
|----|---------------|----------|
| L5 | `중2_동아윤정미_Lesson5_본문분석_합본.pdf` | `중2_동아윤정미_Lesson5_본문암기.pdf` |
| L6 | `중2_동아윤정미_Lesson6_본문분석_합본.pdf` | `중2_동아윤정미_Lesson6_본문암기.pdf` |

### 본문분석

- 표지 1p → **본문 전문(FULL TEXT)** 1p → 챕터별 본문
- 각 챕터: **INTRO**(요약·요지·제목 + 삽화 + 단어표) → **PASSAGE**(본문 전문 +
  문장별 해석 + 4단 논리흐름) → **SENTENCE ANALYSIS**(문장별 어법·어휘·리딩 분석)
- **ANSWER(정답·오답 분석) 블록 없음** — 문제집이 아니라 본문 분석이므로
  `hide_answer: true` 로 제거

### 본문암기

- 구성: **표지 1p → 문제 Np → 정답 1p**
- 문제면: 한글 문장 + 영작 답란(밑줄). 챕터 구분 없이 **1번부터 연속 번호**
- 정답면: 영어 원문을 같은 번호로 **책 뒤에 몰아서** 2단 배치
- **원문 전 문장 수록** — L5 28문항 / L6 26문항
- 한 장당 12문항 상한(`MAX_PER_PAGE`)

```bash
cd mock-exam-analysis
node "_oneoff-중2-동아윤/build-memorize.mjs"        # L5·L6 전부
node "_oneoff-중2-동아윤/build-memorize.mjs" L5     # 한 과만
```

### 본문 전문 페이지

표지 다음 장은 **원문 전 문장을 한 장에 모은 "FULL TEXT · 본문 전문"** 페이지입니다.
챕터 구분 없이 1번부터 끝까지 연속 번호를 매기고 각 문장 아래에 해석을 함께 싣습니다.

> **크기는 자동으로 맞춰집니다.** 폰트·행간·여백을 `--ft` 배율 하나로 묶고,
> `combine.mjs` 가 **puppeteer 로 이분 탐색해 넘치지 않는 최대 배율**을 찾아 적용합니다
> (빌드 로그에 `↔ 본문 전문 자동 맞춤: 배율 …` 로 출력).
>
> ⚠️ **함정**: `.page-body` 는 `overflow:hidden` 이라 내용이 넘쳐도 **에러 없이 잘린 채**
> 인쇄됩니다. `.fulltext-all` 의 크기를 **손으로 바꾸지 말 것** — 반드시 자동 맞춤
> 루프를 통과시켜야 합니다.

## 폴더 구조

```
_SOURCE-L5.js / _SOURCE-L6.js   ← 원문 정본(기계 판독용). 임의 수정 금지
data/L5/{1..3}.json             분석지 데이터
data/L6/{1..4}.json
dist/L5, dist/L6                빌드 산출물(html/pdf/합본)
styles/analysis.css, workbook.css
verify.mjs                      데이터 무결성 검증
_audit.mjs / _memaudit.mjs      산출물(PDF) 전수 검수
combine.mjs                     분석지 합본
build-memorize.mjs              본문암기 빌더
_ILLUSTRATION_PROMPTS.md        삽화 프롬프트 7장(16:5, v8.1)
```

## 빌드 방법

```bash
cd mock-exam-analysis
L=L5   # 또는 L6

# 0) 무결성 검증 — 반드시 먼저 (실패 시 빌드 금지)
node "_oneoff-중2-동아윤/verify.mjs"

# 1) 분석지
node builder/build.mjs "_oneoff-중2-동아윤/data/$L" "_oneoff-중2-동아윤/dist/$L" \
  --styles="_oneoff-중2-동아윤/styles/analysis.css"

# 2) 넘침 검사 — overflow 0 이 절대 조건
node builder/check-overflow.mjs "_oneoff-중2-동아윤/dist/$L/1.html"

# 3) PDF
node builder/pdf.mjs "_oneoff-중2-동아윤/dist/$L"

# 4) 합본
node "_oneoff-중2-동아윤/combine.mjs" $L

# 5) 본문암기
node "_oneoff-중2-동아윤/build-memorize.mjs" $L
```

## 문장 누락 0 보장

- `verify.mjs` — 정본과 챕터 JSON 대조: passage verbatim 일치, `passage_ko` 길이 일치,
  분석 카드 `covers` 가 원문 전 문장을 빠짐없이 1회씩 오름차순 커버, 어휘 본문 등장
- `_memaudit.mjs` — 비교 기준을 `_SOURCE` 가 아니라 **교과서 원문 문자열**로 둔다.
  `_SOURCE` 기준으로 삼으면 전사 단계에서 이미 빠진 문장은 영원히 못 잡는다.

### ⚠️ 함정 1 — 약어의 마침표를 문장 경계로 오인 (실제로 발생)

Lesson 6 은 `Dr. Schofield`, `Frank W. Schofield`, `2 p.m.` 처럼 **약어 마침표**가
많다. 정규식 `(?<=[.?!])\s+` 로 문장을 쪼개면 **26문장이 35문장으로** 잘못 쪼개진다.
`_memaudit.mjs` 의 `splitSentences` 에 약어 예외를 넣어 해결했다.
**정본(`_SOURCE-L6.js`)이 기준**이며, 기계 분할 결과를 정본으로 삼지 말 것.

### ⚠️ 함정 2 — 전사 단계 문장 누락

L5 초안 전사에서 마지막 2문장(`For example, the one over here …` /
`Wilson's gum paintings are tiny, …`)이 **조용히 빠졌다**. 원문 28문장을
26문장으로 옮겨 적었는데, `_SOURCE` 만 보면 자체 정합성은 맞아 보인다.
그래서 `_memaudit.mjs` 가 **교과서 원문 문자열**을 별도 기준으로 들고 있다.
새 과를 추가하면 반드시 `TEXTBOOK` 블록도 함께 채울 것.

### ⚠️ 함정 3 — 정답이 한쪽 번호로 몰리는 문제

정답을 먼저 쓰는 습관 때문에 ① 로 몰리기 쉽다. 이번에는 저작 단계에서
챕터별 정답 위치를 지정해 분산했다 — **L5 2/4/5 · L6 1/3/2/5**.
새 챕터를 추가하면 분포를 반드시 확인할 것(`_audit.mjs` 가 보고한다).

### ⚠️ 함정 4 — PDF 텍스트 추출 시 영문 자간 분리

분석지 PDF 는 텍스트 레이어에서 영문이 `s c i e n t i f i c` 처럼 자간 분리되어
추출된다. **단어 단위 대조는 전부 실패**하므로, 원문 대조 시 **공백을 모두 제거하고**
비교해야 한다.

## 삽화

`_ILLUSTRATION_PROMPTS.md` 에 **7장**(L5 3장 + L6 4장)의 미드저니 프롬프트가 있다.

- 규격 `--ar 16:5 --v 8.1`, **실사 포토리얼** 톤
- **밝기는 형용사가 아니라 조명 조건으로 지정** — `sunlit`·`luminous` 는 실사에서
  미드저니가 황금빛 저녁 + 강한 역광으로 해석해 오히려 어두워진다.
  `natural soft diffused daylight` `bright overcast sky` `high-key exposure` 를 쓴다.
- 7장이 서로 닮지 않도록 각 프롬프트에 다른 챕터의 소재를 `NO ~` 로 배제
- 얼굴 클로즈업 회피(교재 삽화이므로 특정인 초상 방지).
  **Lesson 6 은 실존 인물(Frank W. Schofield)을 다루므로 인물 묘사 대신
  사물·장소 중심 정물/풍경으로 구성**했다.

> ⚠️ **문서만 고치면 반영되지 않는다.** 빌드는 `data/{L}/{N}.json` 의
> `illustration.prompt` 를 읽는다. 프롬프트를 고쳤다면 반드시 아래를 실행할 것.
>
> ```bash
> node _sync-prompts.mjs   # 문서 → JSON 동기화 + 규격·금지어 검사(위반 시 exit 1)
> ```

생성한 이미지를 `dist/{L5,L6}/assets/illust-{N}.png` 로 저장하고 분석지를 재빌드하면
반영된다.

> ⚠️ **원본 8MB PNG 를 그대로 넣지 말 것.** 미드저니 원본은 3952×1232(장당 ~8MB)라
> 그대로 넣으면 합본 PDF 가 크게 부푼다. 인쇄 폭이 180mm 이므로
> **가로 2000px 로 축소**하면 ~280dpi 로 육안 차이가 없다.
>
> ```bash
> python -c "from PIL import Image; im=Image.open('illust-1.png'); im.resize((2000,int(2000*im.size[1]/im.size[0])), Image.LANCZOS).save('illust-1.png', optimize=True)"
> ```

> ⚠️ **삽화 반영은 눈으로 확인해야 한다.** placeholder 인 채로도 빌드는 성공한다.
> `pypdf` 로 페이지별 임베드 이미지를 세고, 텍스트에 `Illustration` 이 0건인지 볼 것.
