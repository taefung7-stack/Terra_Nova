# 신서중 2학년 — 2022 개정 미래엔(문영인) 중2 본문분석 + 워크북 (Lesson 5·6 + More Reading) · Lesson 7·8 본문분석 + 본문암기

> ⚠️ **개인 용도 1회성 산출물입니다. 테라노바 판매용이 아닙니다.**
> 판매·구독 파이프라인(Supabase Storage 업로드, dispatch-order-pdf, market)에
> **절대 연결하지 마세요.** `package.json` 에도 스크립트를 등록하지 않았습니다
> (`_oneoff-신서고-YBM-L1` / `_oneoff-천재영어2-L3` 와 동일 정책).

## 무엇인가

교과서 **2022 개정 미래엔(문영인) 중학교 영어 2** 본문을 테라노바 모의고사
분석지·워크북 v1.0 디자인 그대로 제작한 **본문 분석지 + 워크북**입니다.

- **Lesson 5** — My Hometown, Chuncheon (춘천 소개 블로그 / 에티오피아 참전 기념관)
- **Lesson 6** — My First Skateboarding Lesson (첫 스케이트보드 수업)
- **Lesson 5-⑦ More Reading (MR5)** — Maemiseong: A Special Place with an Interesting Story (거제 메미성, 16문장·2026-09-21 추가)
- **Lesson 6-⑥ More Reading (MR6)** — A New Challenge on the Climbing Wall (실내 클라이밍 수업, 22문장·2026-09-21 추가)

> 요청 범위는 **본문분석 + 워크북 2종**입니다. 변형문제는 만들지 않았습니다.
> More Reading(MR5·MR6)은 **본문분석 + 본문암기**만 요청받아 제작했습니다(9-STEP 워크북 없음).

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

| 과 | 본문분석 합본 | 워크북 합본 | 본문암기 |
|----|---------------|-------------|----------|
| L5 | `…Lesson5_본문분석_합본.pdf` — 표지1+**본문전문1**+본문12 = **14p** | `…Lesson5_워크북_합본.pdf` — **29p** | `…Lesson5_본문암기.pdf` — **4p** |
| L6 | `…Lesson6_본문분석_합본.pdf` — 표지1+**본문전문1**+본문14 = **16p** | `…Lesson6_워크북_합본.pdf` — **38p** | `…Lesson6_본문암기.pdf` — **5p** |
| MR5 | `…Lesson5-More Reading_본문분석.pdf` — 표지1+**본문전문1**+본문5 = **7p** | (없음 — 요청 범위 아님) | `…Lesson5-More Reading_본문암기.pdf` — **4p** |
| MR6 | `…Lesson6-More Reading_본문분석.pdf` — 표지1+**본문전문1**+본문5 = **7p** | (없음 — 요청 범위 아님) | `…Lesson6-More Reading_본문암기.pdf` — **4p** |

### More Reading 추가지문 MR5·MR6 (2026-09-21 신규)

사용자가 촬영한 학교 워크시트 사진(Lesson 5-⑦ / Lesson 6-⑥ More Reading) 2장을
같은 패턴으로 추가했다. 정식 Lesson처럼 여러 챕터로 나누기엔 분량이 짧아
(각 16·22문장) **1개 챕터로만** 구성했고, 9-STEP 워크북은 요청받지 않아 만들지 않았다.

- `_SOURCE-MR5.js` / `_SOURCE-MR6.js` — 워크시트 사진에서 verbatim 전사한 원문 정본
- `data/MR5/1.json` / `data/MR6/1.json` — 분석지 데이터 (L5/L6와 동일 필드 구조)
- `combine-more.mjs` — MR5/MR6 전용 합본 스크립트(1챕터 고정, `combine.mjs` 축소판)
- `build-memorize.mjs` 에 `MR5`/`MR6` 항목 추가 — `coverSub` 필드로 "Lesson N-Nʼth More Reading"
  표지 부제를 별도 지정(기존 L5/L6는 `coverSub` 없이 `Lesson N` 그대로 사용, 영향 없음)
- MR6 원문에 학교 시험 원본 그대로 **"NOT 적절한 제목" 4지선다**가 있어(`type: "제목(부적절)"`)
  정답 comment를 "부적절한 이유"로 작성 — 다른 챕터(제목 고르기)와 반대 논리이니 재사용 시 주의

```bash
cd mock-exam-analysis
node builder/build.mjs "_oneoff-신서중2-미래엔/data/MR5" "_oneoff-신서중2-미래엔/dist/MR5" \
  --styles="_oneoff-신서중2-미래엔/styles/analysis.css"
node builder/check-overflow.mjs "_oneoff-신서중2-미래엔/dist/MR5/1.html"
node builder/pdf.mjs "_oneoff-신서중2-미래엔/dist/MR5"
node "_oneoff-신서중2-미래엔/combine-more.mjs" MR5
node "_oneoff-신서중2-미래엔/build-memorize.mjs" MR5
# MR6도 동일(경로만 MR5→MR6)
```

> ⚠️ **`builder/pdf.mjs` 는 dist 안의 모든 html 을 렌더**하므로(L5/L6와 동일 함정)
> `combined.html`/`memorize.html` 까지 텍스트 PDF 로 임시 덮어쓴다. 반드시
> `combine-more.mjs` → `build-memorize.mjs` 를 **pdf.mjs 다음에** 실행해 최종본으로 재생성할 것.

### 본문암기 워크북 (2026-08-29 신규)

사용자 요청 — "중등부 워크북은 STEP 7의 본문 암기만 있으면 될 것 같다".
9-STEP 워크북과 **별도의 얇은 책**으로 뽑는다. 빌더: `build-memorize.mjs`.

- 구성: **표지 1p → 문제 Np → 정답 1p**
- 문제면: 한글 문장 + 영작 답란(밑줄). 챕터 구분 없이 **1번부터 연속 번호**
- 정답면: 영어 원문을 같은 번호로 **책 뒤에 몰아서** 2단 배치
- **원문 전 문장 수록** — L5 24문항 / L6 31문항
  (기존 STEP 7 은 챕터당 5문장만 뽑아 일부가 빠졌다. 암기용이므로 전수 커버)
- 손글씨 여백 확보를 위해 **한 장당 12문항 상한**(`MAX_PER_PAGE`) +
  남는 세로 공간을 `space-between` 으로 답란 사이에 고르게 분배

```bash
cd mock-exam-analysis
node "_oneoff-신서중2-미래엔/build-memorize.mjs"        # L5·L6 전부
node "_oneoff-신서중2-미래엔/build-memorize.mjs" L5     # 한 과만
```

> 기존 `build-workbook.mjs` 는 **v1.0 LOCKED** 이고 정식 회차가 의존하므로
> 건드리지 않았다. 페이지 분배는 puppeteer 실측 이분 탐색이라
> `.page-body` 의 `overflow:hidden` 에 문항이 잘리는 사고가 나지 않는다
> (빌드 끝에 넘침 페이지 수를 재검사해 1개라도 있으면 exit 1).

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

## Lesson 7·8 — 본문분석 + 본문암기 (2026-11-12)

교과서 본문 PDF(`7과본문.pdf` / `8과본문.pdf`)로 만든 **본문분석 + 본문암기**. 워크북·변형문제는 요청 범위가 아니다.

| 과 | 제목 | 챕터(문장) | 본문분석 합본 | 본문암기 |
|----|------|-----------|---------------|----------|
| L7 | Animals in Cold Places | 도입6 · 북극곰9 · 북극여우6 · 고래8 · 송장개구리8 = **37** | 표지1 + 본문전문2(19·18) + 본문16 = **19p** | 표지1 + 문제3 + 정답1 = **5p** |
| L8 | Comparing Prices | 11 · 8 · 9 · 12 = **40** | 표지1 + 본문전문2(20·20) + 본문14 = **17p** | 표지1 + 문제3 + 정답1 = **5p** |

- **저작 방식이 L5·L6 와 다르다** — 미니 마크업 헬퍼 `_author.mjs`(중2 동아윤 복제) + `_author-L7.mjs`·`_author-L8.mjs` 로 JSON 을 만든다. **data/L7·L8 을 직접 고치지 말 것.**
  이 폴더의 `covers` 는 **챕터 안 번호**라, 저작 파일은 원문 전체 번호로 쓰고 맨 아래 루프에서 바꾼다.
- **L8 대화문 규칙** — 화자 표시(`Mom:` `Nick:` …)는 그 말차례의 **첫 문장 앞에만** 붙인다(금옥중3 L6 와 같음).
  관광 안내 책자 표·Nick 의 가격표는 본문 문장이 아니라 Ch1 카드 note·flow 에 내용을 적었다.
- **해석** — 교과서 PDF 오른쪽 단 우리말을 문장 단위로 옮겼다. L8 10번만 교과서가 두 문장으로 나눈 것을 한 문장으로 합쳤다.
- **본문 전문 2장 분할** — 한 장이면 배율 0.67(L7)·0.62(L8)로 글씨가 너무 작아 `combine.mjs` 에 `fulltextMaxPerPage`(동아윤 combine 에서 이식)를 넣었다.
  여러 장이면 **가장 작은 배율로 통일**하고, 하한(0.6)으로도 넘치면 빌드를 실패시킨다. L5·L6 는 설정이 없어 기존처럼 한 장(배율 1.027 / 0.801 그대로).
- **글리프 보정 확장** — L8 가격 설명에서 한글 서체 속 `$ + = ×`, L7 의 `↔` 가 **빈칸으로 렌더**됐다(텍스트 레이어엔 있어 검사로 못 잡음, 육안 발견).
  `styles/analysis.css`·`workbook.css` 의 PretendardTN unicode-range 에 `$ % + = × ÷ ↔` 를 추가했다. 🇦🇺 같은 **국기 이모지는 "AU" 글자로 렌더**되므로 쓰지 않는다.
- **원문 검수 2중** — ① `node _xcheck.mjs L7|L8`: 첨부 PDF 텍스트 레이어 영어 단(`_PDF-RAW-{L}.txt`) ↔ 정본 문자 단위 일치(L7 1,702자 / L8 1,417자).
  ② `_memaudit.mjs` 에 `TEXTBOOK.L7·L8` — 교과서 37·40문장 = 정본.
- 검수: verify 오류 0·경고 0 · overflow 9챕터 0 · `_audit` 차단 0 · `_memaudit` 정답면 37/37·40/40, 문제면 한글 전부, 번호 연속·잘림 0 · PNG 렌더 육안 확인.
- **삽화 9장 반영(2026-11-12)** — 미드저니 원본 `dist/{L7,L8}/{N}.png`(3952px, 저장소 미포함)를 가로 2000px 로 줄여 `dist/{L}/assets/illust-N.png` 에 넣고 재빌드. 합본 이미지 L7 p.4·7·11·14·17 / L8 p.4·8·11·14, `Illustration` 0건, overflow 0, `_audit` 경고 0. 프롬프트는 `_ILLUSTRATION_PROMPTS.md` Lesson 7·8 절(`_sync-prompts.mjs` 규격 검사 통과, 사람 없음, `--no` 파라미터 방식).
  이미지를 `dist/{L7,L8}/{N}.png` 로 받으면 가로 2000px 로 줄여 `dist/{L}/assets/illust-N.png` 에 넣고 재빌드.

```bash
cd mock-exam-analysis
D=_oneoff-신서중2-미래엔; L=L7   # 또는 L8
(cd $D && node _xcheck.mjs $L && node _author-$L.mjs && node verify.mjs $L)
node builder/build.mjs "$D/data/$L" "$D/dist/$L" --styles="$D/styles/analysis.css"
for f in $D/dist/$L/[0-9].html; do node builder/check-overflow.mjs $f; done
node builder/pdf.mjs "$D/dist/$L" && node $D/combine.mjs $L && node $D/build-memorize.mjs $L
(cd $D && python _memaudit-extract.py $L && node _audit.mjs $L && node _memaudit.mjs $L)
```

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

### 산출물 전수 검수 — `_audit.mjs`

`verify.mjs` 가 **데이터(JSON)** 를 본다면, `_audit.mjs` 는 **산출물(PDF)** 를 본다.
빌드된 PDF 에서 텍스트를 뽑아 원문 정본과 대조하므로 "데이터는 맞는데 PDF 에서
빠진" 사고를 잡는다.

```bash
# 먼저 PDF 텍스트를 dist/_audit/ 에 추출한 뒤 실행 (스크립트 주석 참조)
node _audit.mjs      # 차단 0 이 조건
```

검사 항목: passage 정본 일치 / passage_ko 개수·공백 / 챕터 PDF·합본 실재 /
분석카드 `covers` 전수 커버 / 카드 영어 이어붙임 = 원문 / 어휘 본문 등장 ·중복 /
flow 4단 / 보기 5개·정답 1개·번호 연속 / 제목유형 정답 = `title_en` / 삽화 파일 실재.

**2026-08-29 전수 검수 결과: 차단 0건.** 경고는 삽화 placeholder 7건뿐.

> ⚠️ **어휘 검사 오탐 주의**: 표제어는 사전형(`build`/`fight`/`fall down`)인데 본문은
> 활용형(`built`/`fought`/`fell down`)이라, 단순 문자열 비교로는 **정상 어휘가 전부
> 미등장으로 잡힌다**(실제로 10건 오탐). `_audit.mjs` 는 불규칙 변화표 + 어간 매칭으로
> 흡수한다. 새 어휘를 넣고 경고가 뜨면 **먼저 활용형을 확인**할 것.

### ⚠️ 함정 4 — 정답이 전부 ① 로 몰리는 문제 (2026-08-29 수정)

7개 챕터의 정답이 **전부 ①** 이었다(7/7). 지문을 읽지 않고 ① 만 찍어도 다 맞는 상태.
`_rebalance-answers.mjs` 로 보기를 순열 재배치해 **1/1/2/1/2** 로 분산했다.
보기 객체를 통째로 옮기므로 `en`·`comment`·`correct` 가 함께 따라가 **내용은 불변**이다.

> 새 챕터를 추가하면 정답이 또 ① 로 몰리기 쉽다(정답을 먼저 쓰는 습관 때문).
> 저작 후 반드시 분포를 확인할 것.

### ⚠️ 함정 3 — 워크북 합본은 이미지 기반

`pdf-image.mjs` 로 만든 워크북 PDF 는 텍스트가 0자 추출된다(글리프 안전 렌더링).
워크북 검수는 **JSON 대조 + 페이지 렌더 판독**으로 해야 한다.

## 삽화

`_ILLUSTRATION_PROMPTS.md` 에 **7장**(L5 3장 + L6 4장)의 미드저니 프롬프트가 있다.

- 규격 `--ar 16:5 --v 8.1`, **실사 포토리얼** 톤
- **밝기는 형용사가 아니라 조명 조건으로 지정** — `sunlit`·`luminous` 는 실사에서
  미드저니가 황금빛 저녁 + 강한 역광으로 해석해 오히려 어두워진다.
  `natural soft diffused daylight` `bright overcast sky` `high-key exposure` 를 쓴다.
- 7장이 서로 닮지 않도록 각 프롬프트에 다른 챕터의 소재를 `NO ~` 로 배제
- 얼굴 클로즈업 회피(교재 삽화이므로 특정인 초상 방지)

> ⚠️ **문서만 고치면 반영되지 않는다.** 빌드는 `data/{L}/{N}.json` 의
> `illustration.prompt` 를 읽는다. 프롬프트를 고쳤다면 반드시 아래를 실행할 것.
>
> ```bash
> node _sync-prompts.mjs   # 문서 → JSON 동기화 + 규격·금지어 검사(위반 시 exit 1)
> ```

생성한 이미지를 `dist/{L5,L6}/assets/illust-{N}.png` 로 저장하고 분석지를 재빌드하면
반영된다.

### 삽화 반영 현황 (2026-08-29)

| 과 | 상태 |
|----|------|
| **L5** | ✅ **3장 반영 완료** (`dist/L5/assets/illust-{1,2,3}.png`) |
| **L6** | ✅ **4장 반영 완료** (`dist/L6/assets/illust-{1,2,3,4}.png`) |

L5 삽화는 각 챕터 INTRO 면(합본 p.3 / p.7 / p.11)에 본문 폭 전면으로 들어간다.
챕터 내용과 1:1 대응한다.

- **L5**(합본 p.3 / p.7 / p.11) — ① 호수·산·도로의 춘천 전경 ② 기념관 내부(1층 사진 벽 +
  2층 문화 전시품) ③ **둥근 지붕 세 개**의 기념관 외관(`It has three round roofs.`)
- **L6**(합본 p.3 / p.6 / p.10 / p.14) — ① 스케이트파크의 보드와 신발(도입)
  ② **큰 보울에서 공중에 뜬 스케이터** + 야자수(`a guy skateboarding in a big bowl`)
  ③ 보호장비와 지면을 미는 발(`push-off`) ④ **더러워진 청바지·신발**로 자유롭게 타는 뒷모습
  (`My shoes and jeans got dirty, but I felt great.`)

> ⚠️ **원본 8MB PNG 를 그대로 넣지 말 것.** 미드저니 원본은 3952×1232(장당 ~8MB)라
> 그대로 넣으면 합본 PDF 가 **35MB** 로 부푼다. 인쇄 폭이 180mm 이므로
> **가로 2000px 로 축소**하면 ~280dpi 로 육안 차이가 없으면서 합본이 **10.3MB** 가 된다.
>
> ```bash
> python -c "from PIL import Image; im=Image.open('illust-1.png'); > im.resize((2000,int(2000*im.size[1]/im.size[0])), Image.LANCZOS).save('illust-1.png', optimize=True)"
> ```

> ⚠️ **삽화 반영은 눈으로 확인해야 한다.** placeholder 인 채로도 빌드는 성공한다.
> `pypdf` 로 페이지별 임베드 이미지를 세고, 텍스트에 `Illustration` 이 0건인지 볼 것
> (교재 파이프라인에서 얻은 교훈 — 삽화 누락은 스키마·overflow 검사로 안 잡힌다).
