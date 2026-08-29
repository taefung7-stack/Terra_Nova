# 신서중 2학년 — 2022 개정 미래엔(문영인) 중2 본문분석 + 워크북 (Lesson 5·6)

> ⚠️ **개인 용도 1회성 산출물입니다. 테라노바 판매용이 아닙니다.**
> 판매·구독 파이프라인(Supabase Storage 업로드, dispatch-order-pdf, market)에
> **절대 연결하지 마세요.** `package.json` 에도 스크립트를 등록하지 않았습니다
> (`_oneoff-신서고-YBM-L1` / `_oneoff-천재영어2-L3` 와 동일 정책).

## 무엇인가

교과서 **2022 개정 미래엔(문영인) 중학교 영어 2** 본문을 테라노바 모의고사
분석지·워크북 v1.0 디자인 그대로 제작한 **본문 분석지 + 워크북**입니다.

- **Lesson 5** — My Hometown, Chuncheon (춘천 소개 블로그 / 에티오피아 참전 기념관)
- **Lesson 6** — My First Skateboarding Lesson (첫 스케이트보드 수업)

> 요청 범위는 **본문분석 + 워크북 2종**입니다. 변형문제는 만들지 않았습니다.

## 챕터 분할

교과서 소제목·문단을 따르되, 한 챕터가 너무 얇거나 두꺼워지지 않게 조정했습니다.

### Lesson 5 (원문 24문장 → 3챕터)

| Ch | 제목 | 원문 문장 | 분석 카드 | 분석지 |
|----|------|-----------|-----------|--------|
| 1 | Welcome to my blog, "Happy Yujin!" | 7 | 5 | 4p |
| 2 | Today's Focus & Friendship Across the World | 9 | 6 | 4p |
| 3 | Sister Cities and the Memorial Hall | 8 | 5 | 4p |
| | **합계** | **24** | **16** | **12p** |

교과서 소제목은 3개("블로그 도입" / "Today's focus" / "Chuncheon News")이나
**Chuncheon News 절이 13문장**으로 과도해, 문단 경계(`In the 2000s~`)에서 나눠
**7 / 9 / 8** 로 균형을 맞췄습니다.

### Lesson 6 (원문 31문장 → 4챕터)

| Ch | 제목 | 원문 문장 | 분석 카드 | 분석지 |
|----|------|-----------|-----------|--------|
| 1 | My First Skateboarding Lesson (도입) | 4 | 3 | 3p |
| 2 | Meeting Eric at the Skatepark | 8 | 5 | 4p |
| 3 | Safety First and the Push-off | 11 | 5 | 4p |
| 4 | More Than Just a Cool Sport | 8 | 4 | 3p |
| | **합계** | **31** | **17** | **14p** |

교과서 원문은 5개 문단이나 **3번째 문단(안전 장비)이 3문장뿐**이라 4번째 문단과
합쳐 4개 챕터로 만들었습니다.

## 산출물

| 과 | 본문분석 합본 | 워크북 합본 |
|----|---------------|-------------|
| L5 | `신서중2_미래엔_Lesson5_본문분석_합본.pdf` — 표지1+**본문전문1**+본문12 = **14p** | `신서중2_미래엔_Lesson5_워크북_합본.pdf` — **29p** |
| L6 | `신서중2_미래엔_Lesson6_본문분석_합본.pdf` — 표지1+**본문전문1**+본문14 = **16p** | `신서중2_미래엔_Lesson6_워크북_합본.pdf` — **38p** |

### 본문 전문 페이지 (2026-08-29 변경)

표지 다음 장은 **목차가 아니라 원문 전 문장을 한 장에 모은 "FULL TEXT · 본문 전문"**
페이지다(사용자 요청). 챕터 구분 없이 **1번부터 끝까지 연속 번호**를 매기고
각 문장 아래에 해석을 함께 싣는다 — L5 24문장 / L6 31문장이 각각 A4 한 장에 들어간다.

> **크기는 자동으로 맞춰진다.** 크기를 고정하면 문장이 적은 과(L5 24문장)는 아래에
> 큰 여백이 남고 많은 과(L6 31문장)는 잘린다. 그래서 폰트·행간·여백을 `--ft` 배율
> 하나로 묶고, `combine.mjs` 가 **puppeteer 로 이분 탐색해 넘치지 않는 최대 배율**을
> 찾아 적용한다(빌드 로그에 `↔ 본문 전문 자동 맞춤: 배율 …` 로 출력).
> 현재 L5 = 1.027 / L6 = 0.801, **둘 다 본문 영역 100% 사용**.
>
> ⚠️ **함정**: `.page-body` 는 `overflow:hidden` 이라 내용이 넘쳐도 **에러 없이 잘린 채**
> 인쇄된다(빌드는 성공하고 눈으로도 알아채기 어렵다). 그래서 `.fulltext-all` 의 크기를
> **손으로 바꾸지 말 것** — 반드시 자동 맞춤 루프를 통과시켜야 한다. 문장 수가
> 아주 많은 과를 추가하면 배율이 하한(0.6)에 걸릴 수 있으니 로그의 사용률을 확인할 것.

- 분석지 각 챕터: **INTRO**(요약·요지·제목 + 삽화 + 단어표) → **PASSAGE**(본문 전문 +
  문장별 해석 + 4단 논리흐름) → **SENTENCE ANALYSIS**(문장별 어법·어휘·리딩 분석)
- 워크북 9-STEP: 본문·해석 → 어법 양자택일 → 어휘 양자택일 → 빈칸 첫글자 →
  한글 해석 → 영문 배열 → 통문장 영작 → 종합 → 정답·해설
- **ANSWER(정답·오답 분석) 블록 없음** — 문제집이 아니라 본문 분석이므로
  `hide_answer: true` 로 제거(신서고 폴더와 동일 정책)

## 폴더 구조

```
_SOURCE-L5.js / _SOURCE-L6.js   ← 원문 정본(기계 판독용). 임의 수정 금지
data/L5/{1..3}.json             분석지 데이터      data/L5/{1..3}-workbook.json
data/L6/{1..4}.json                               data/L6/{1..4}-workbook.json
dist/L5, dist/L6                빌드 산출물(html/pdf/합본)
styles/analysis.css, workbook.css
verify.mjs / verify-workbook.mjs  무결성 검증
combine.mjs / combine-workbook.mjs 합본
_ILLUSTRATION_PROMPTS.md        삽화 프롬프트 7장(16:5, v8.1)
```

## 빌드 방법

```bash
cd mock-exam-analysis
L=L5   # 또는 L6

# 0) 무결성 검증 — 반드시 먼저 (실패 시 빌드 금지)
node "_oneoff-신서중2-미래엔/verify.mjs"            # L5·L6 전부
node "_oneoff-신서중2-미래엔/verify-workbook.mjs"

# 1) 분석지
node builder/build.mjs "_oneoff-신서중2-미래엔/data/$L" "_oneoff-신서중2-미래엔/dist/$L" \
  --styles="_oneoff-신서중2-미래엔/styles/analysis.css"

# 2) 워크북
node builder/build-workbook.mjs "_oneoff-신서중2-미래엔/data/$L" "_oneoff-신서중2-미래엔/dist/$L" \
  --styles="_oneoff-신서중2-미래엔/styles/workbook.css"

# 3) 넘침 검사 — overflow 0 이 절대 조건
node builder/check-overflow.mjs "_oneoff-신서중2-미래엔/dist/$L/1.html"
node builder/check-overflow.mjs "_oneoff-신서중2-미래엔/dist/$L/workbook-1.html"

# 4) PDF — ★ 분석지와 워크북의 렌더 경로가 다르다
node builder/pdf.mjs "_oneoff-신서중2-미래엔/dist/$L"                       # 분석지
node builder/pdf-image.mjs "_oneoff-신서중2-미래엔/dist/$L" --match='^workbook-\d+\.html$'   # 워크북(글리프 안전)

# 5) 합본
node "_oneoff-신서중2-미래엔/combine.mjs" $L
node "_oneoff-신서중2-미래엔/combine-workbook.mjs" $L
```

> ⚠️ `builder/pdf.mjs` 는 dist 안의 **모든 html** 을 렌더하므로 워크북까지 텍스트 PDF 로
> 덮어쓴다. 반드시 **pdf.mjs 를 먼저 돌리고 pdf-image.mjs 로 워크북을 다시 렌더**할 것.

## 문장 누락 0 보장

- `verify.mjs` — 정본과 챕터 JSON 대조: passage verbatim 일치, `passage_ko` 길이 일치,
  분석 카드 `covers` 가 원문 전 문장을 빠짐없이 1회씩 오름차순 커버, 어휘 본문 등장
- `verify-workbook.mjs` — `en_template` 복원문 = 본문 원문, 빈칸 answer 실재,
  jumble 단어 집합 일치, mixed.ref 실재, voca_check 본문 등장
- **현재 상태: 오류 0 · 경고 0 / 원문 55문장 전건 verbatim** (최종 PDF 텍스트 대조로 재확인)

### ⚠️ 함정 1 — 빌더의 고유명사 오탐 (실제로 이번에도 발생)

`build-workbook.mjs` 의 `buildProperNounSet` 은 **문두에만 등장하는 대문자 단어**를
고유명사로 간주해, 그 단어가 정답인 양자택일 문항을 **에러 없이 삭제**한다.

- 이번 사례: L6/3 어휘 문항의 정답을 인용문 첫 단어 `Safety` 로 잡았더니
  **6문항 중 1문항이 조용히 사라졌다**(저작 6 ≠ 렌더 5).
- 대응: 정답 토큰을 **문장 중반의 소문자 단어**로 옮긴다(`Safety` → `helmet`).
- **검증 필수**: 저작 문항 수와 렌더된 정답지 "N문항" 을 반드시 대조할 것.
  `verify-workbook.mjs` 는 데이터 정합성만 보므로 이 유실을 잡지 못한다.

### ⚠️ 함정 2 — PDF 텍스트 추출 시 영문 자간 분리

분석지 PDF 는 텍스트 레이어에서 영문이 `s c i e n t i f i c` 처럼 자간 분리되어
추출된다. **단어 단위 대조는 전부 실패**하므로, 원문 대조 시 **공백을 모두 제거하고
비교**해야 한다(신서고 폴더 검수에서 얻은 교훈).

### ⚠️ 함정 3 — 워크북 합본은 이미지 기반

`pdf-image.mjs` 로 만든 워크북 PDF 는 텍스트가 0자 추출된다(글리프 안전 렌더링).
워크북 검수는 **JSON 대조 + 페이지 렌더 판독**으로 해야 한다.

## 삽화

`_ILLUSTRATION_PROMPTS.md` 에 **7장**(L5 3장 + L6 4장)의 미드저니 프롬프트가 있습니다.
`--ar 16:5 --v 8.1` 고정, 중학생 대상이라 밝은 high-key 톤입니다.
생성 후 `dist/{L5,L6}/assets/illust-{N}.png` 로 저장하고 분석지를 재빌드하면 반영됩니다.
**현재 산출물은 삽화 자리가 placeholder 상태**입니다.
