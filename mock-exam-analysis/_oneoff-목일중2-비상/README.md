# 목일중 2학년 — 2022 개정 비상(황종배) 중2 본문분석 + 본문암기 (Lesson 5·6·7·8)

> ⚠️ **개인 용도 1회성 산출물입니다. 테라노바 판매용이 아닙니다.**
> 판매·구독 파이프라인(Supabase Storage 업로드, dispatch-order-pdf, market)에
> **절대 연결하지 마세요.** `package.json` 에도 스크립트를 등록하지 않았습니다
> (`_oneoff-신서중2-미래엔` / `_oneoff-신서고-YBM-L1` 와 동일 정책).

## 무엇인가

교과서 **2022 개정 비상(황종배) 중학교 영어 2** 본문을 테라노바 분석지 v1.0 디자인으로
제작한 **본문 분석지 + 본문암기 워크북**입니다. `_oneoff-신서중2-미래엔` 과 같은 구성.

- **Lesson 5** — The Pea Blossom (완두콩 꽃 / 안데르센 동화)
- **Lesson 6** — Science Is the Key (아빠와의 첫 캠핑, 과학으로 자연 이해하기)

> 요청 범위는 **본문분석 + 본문암기 2종**입니다. 9-STEP 워크북은 만들지 않았습니다.

## 챕터 분할

| 과 | Ch | 제목 | 원문 문장 | 분석 카드 |
|----|----|------|-----------|-----------|
| L5 | 1 | Five Little Peas in a Pod | 6 | 4 |
| L5 | 2 | A Tiny Space by the Window | 9 | 4 |
| L5 | 3 | Growing Taller, Growing Stronger | 6 | 4 |
| L5 | 4 | The Blossom and the Thing It Could Do | 6 | 4 |
| | | **L5 합계** | **27** | **16** |
| L6 | 1 | Science Is the Key | 5 | 4 |
| L6 | 2 | The Sun, the Shadow, and the Tent | 11 | 4 |
| L6 | 3 | Skipping Stones: Speed, Angle, and Shape | 11 | 4 |
| L6 | 4 | Room for Air and a Sky Full of Stars | 10 | 4 |
| | | **L6 합계** | **37** | **16** |

L5 는 교과서 5개 문단이나 2·3문단이 짧아 **6/9/6/6** 으로 균형을 맞췄다.
L6 는 대화체라 화자 전환을 문장 단위로 살렸고, **Q1/Q2/Q3 발문도 본문 흐름의 일부**이므로
정본 문장에 포함했다.

## 산출물

| 과 | 본문분석 합본 | 본문암기 |
|----|---------------|----------|
| L5 | `목일중2_비상_Lesson5_본문분석_합본.pdf` — 표지1+본문전문1+본문12 = **14p** | `…Lesson5_본문암기.pdf` — **4p** (27문항 · 14+13) |
| L6 | `목일중2_비상_Lesson6_본문분석_합본.pdf` — 표지1+본문전문1+본문14 = **16p** | `…Lesson6_본문암기.pdf` — **5p** (37문항 · 12+12+13) |

- 분석지 각 챕터: **INTRO**(요약·요지·제목 + 삽화 + 단어표) → **PASSAGE**(본문 전문 +
  문장별 해석 + 4단 논리흐름) → **SENTENCE ANALYSIS**(문장별 어법·어휘·리딩 분석)
- 본문암기: 표지 1p → 한글 제시 + 영작 답란 Np → 영어 정답 1p(2단, 연속 번호)
  - **페이지 분배는 `LESSONS[].qSplit` 으로 손으로 지정한다**(2026-08-31 사용자 요청).
    L5 `[14, 13]` / L6 `[12, 12, 13]`. 지정하지 않으면 기존 `MAX_PER_PAGE=12` 그리디.
  - qSplit 합계가 문항 수와 다르거나, 지정한 문항 수가 **한 페이지에 넘치면 빌드가 중단**된다
    (`.page-body` 가 `overflow:hidden` 이라 넘치면 조용히 잘리므로 실측을 유지했다).
- **ANSWER(정답·오답 분석) 블록 없음** — `hide_answer: true`

## 추가 지문 — Lesson 6 Extra Reading · Day of Silence (`L6X`, 2026-09-23)

학교 배부 프린트(Lesson 6 Extra Reading, 2-2)의 뉴스 기사 지문. 교과서 본문이 아니므로
별도 과 ID **`L6X`** 로 분리했다(정본 `_SOURCE-L6X.js`, 데이터 `data/L6X/`, 산출물 `dist/L6X/`).

| Ch | 제목 | 원문 문장 | 분석 카드 |
|----|------|-----------|-----------|
| 1 | A Tourist Who Broke the Silence (1문단) | 12 | 8 |
| 2 | Rules of the Day of Silence (2문단) | 10 | 8 |
| | **합계** | **22** | **16** |

- `목일중2_비상_Lesson6_ExtraReading_본문분석_합본.pdf` — 표지1+본문전문1+본문10 = **12p**
- `목일중2_비상_Lesson6_ExtraReading_본문암기.pdf` — 표지1+문제2(11+11)+정답1 = **4p**
- 프린트의 직선따옴표(`"crazy"`, `Bali's`)는 곱슬따옴표로 옮겼다(직선따옴표 PDF 빈칸 렌더 함정).
- **원본 재대조(2026-09-23)**: 프린트 사진을 독립 재전사 → 정본과 문자 단위 완전 일치(1393자·22문장·문단 경계 일치). 합본 본문전문·분석카드·암기 정답면 모두 22/22 수록.
- 분석 포인트는 학생 필기(현재완료 수동태·by+동명사·filmed himself walking·목적격 관계대명사
  생략·5형식 make·to make sure·간접의문문·관계대명사 what)를 전부 반영했다.
- **삽화 2장 반영 완료(2026-09-23)** — 미드저니 원본(3952px)을 가로 2000px 로 줄여 `dist/L6X/assets/illust-{1,2}.png` 에 넣음. 합본 12p · 7.5MB. 미드저니 프롬프트는 `_ILLUSTRATION_PROMPTS.md` L6X 절(= `data/L6X/{1,2}.json` 의
  `illustration.prompt`) — 실존 인물 사건이라 **사람을 넣지 않고** 빈 해변/빈 마을 거리로 잡았다.
  이미지 받으면 `dist/L6X/assets/illust-{1,2}.png`(가로 2000px) 로 넣고 3)·4) 재실행.

### ⚠️ 함정 6 — `+` `=` `|` `↔` 가 PDF 에서 빈칸으로 렌더 (2026-09-23 수정)

PretendardTN 보정 범위에 `U+002B U+003D U+007C U+2194` 가 없어서 문법 설명의
`have + been + p.p.`, `They = 보안 요원들`, `↔ outdoors` 가 **공백으로 인쇄**됐다
(verify·overflow 통과, 육안으로만 발견). `styles/analysis.css`·`workbook.css` 둘 다 범위에 추가했다.
**L5·L6 기존 PDF 도 같은 기호가 빈칸일 수 있으니 재빌드하면 고쳐진다.**
`✗`(U+2717)는 Arial 에도 없으므로 데이터에서 `(X)` 로 쓸 것.

## 빌드 방법

```bash
cd mock-exam-analysis
L=L5   # 또는 L6 / L6X

# 0) 무결성 검증 — 반드시 먼저 (실패 시 빌드 금지)
node "_oneoff-목일중2-비상/verify.mjs"

# 1) 분석지
node builder/build.mjs "_oneoff-목일중2-비상/data/$L" "_oneoff-목일중2-비상/dist/$L" \
  --styles="_oneoff-목일중2-비상/styles/analysis.css"

# 2) 넘침 검사 — overflow 0 이 절대 조건
node builder/check-overflow.mjs "_oneoff-목일중2-비상/dist/$L/1.html"

# 3) PDF + 합본
node builder/pdf.mjs "_oneoff-목일중2-비상/dist/$L"
node "_oneoff-목일중2-비상/combine.mjs" $L

# 4) 본문암기
node "_oneoff-목일중2-비상/build-memorize.mjs"        # L5·L6 전부
```

## 삽화

**L6 의 Q1·Q2·Q3 그림은 교과서 원본 삽화를 그대로 사용한다**(사용자 확인 — 개인 용도).
`비상황 6과.pdf` 에 JPEG 로 임베드되어 있어 `pypdf` 로 추출한 뒤,
가로 2000px 16:5 흰 배경 배너에 **비율 유지로 얹었다**(자르지 않음).

| 파일 | 원본 | 내용 |
|------|------|------|
| `dist/L6/assets/illust-2.png` | 6과 p1 `/Image2` | Q1 텐트 위치(A/B + 4 hours later) |
| `dist/L6/assets/illust-3.png` | 6과 p2 `/Image2` | Q2 물수제비 각도(20° vs 50°) |
| `dist/L6/assets/illust-4.png` | 6과 p2 `/Image3` | Q3 장작 쌓기(criss-cross vs 원뿔) |

> 이 세 그림은 **정답의 근거 자체**(A/B 선택지)를 담고 있어 AI 삽화로 대체하면
> 본문 이해가 불가능하다. 그래서 원본을 쓴다.

### 삽화 계획 (2026-08-31 개정 — 전 8장)

| 과 | Ch | 구성 |
|----|----|------|
| L5 | 1~4 | AI 단독 (수채 스토리북) |
| L6 | 1 | AI 단독 (실사) |
| L6 | 2·3·4 | **AI 배경 + 교과서 도해 합성** |

L6 2·3·4 는 처음에 **교과서 도해만** 얹었는데, 도해가 4:1~3:1 비율이라
16:5 배너에서 **좌우 흰 여백이 크게 남아**(Q1 가로점유 70% · Q3 76%)
잘린 클립아트처럼 보였고, AI 4장이 꽉 찬 L5 에 비해 **L6 이 빈약해 보였다.**
→ 배경을 AI 로 만들고 **그 위에 도해를 얹는 합성**으로 바꿨다.
도해 원본은 유지되므로 **정답 근거(A/B)는 그대로**다.

프롬프트 8장 전문과 합성 스크립트: `_ILLUSTRATION_PROMPTS.md`
(각 `data/{L}/{N}.json` 의 `illustration.prompt` 에도 동기화되어 있다.)

> ⚠️ 원본 미드저니 출력(3952px, 장당 5~8MB)을 그대로 넣지 말 것. 인쇄 폭 180mm 기준
> **가로 2000px(~280dpi)** 로 축소해야 합본이 부풀지 않는다(신서중 사례: 35MB → 10MB).

## 검수 결과 (2026-08-31)

- **교과서 원문 ↔ 정본 문자 단위 일치** — L5 1085자 / L6 1468자, 공백·구두점 제거 후
  **전체 문자열 완전 일치**(누락·변조 0)
- `verify.mjs` — **오류 0건**, 원문 64문장(27+37) 전건을 분석 카드가 빠짐없이 커버
- **최종 합본 PDF 텍스트에 원문 64문장 전건 포함(미포함 0건)**
- 본문암기 정답면 **27문항 / 37문항 전건 수록**(연속 번호) — 페이지 렌더로 확인
- **overflow 0** (L5 12면 · L6 14면 전부)

### ⚠️ 함정 1 — `styles/workbook.css` 누락 시 본문암기 페이지가 조용히 사라진다

새 폴더를 만들 때 `analysis.css` 만 복사하고 **`workbook.css` 를 빠뜨리면**,
`.page` 에 A4 높이가 안 잡혀 여러 페이지가 **한 장으로 합쳐진다**.
빌더는 자기가 만든 섹션 수만 세어 **"총 6p" 라고 출력하며 성공으로 끝나는데
실제 PDF 는 4p** 였다(이번에 실제로 발생).

- **대응**: 새 폴더에는 `analysis.css` + `workbook.css` **둘 다** 복사할 것.
- **검증 필수**: 빌드 로그의 페이지 수와 `pypdf` 로 읽은 **실제 PDF 페이지 수를 대조**한다.

```bash
python -c "from pypdf import PdfReader; print(len(PdfReader('...본문암기.pdf').pages))"
```

### ⚠️ 함정 2 — 분석 카드의 영어는 원문 verbatim 이어야 한다

가독성을 위해 생략된 관계대명사를 `the friend (that) I have waited for` 처럼
**괄호로 보충하면 `verify.mjs` 가 차단**한다(카드 이어붙임 = 원문 대조).
문법 설명은 `note`/`points` 에 쓰고 **`en_html` 은 원문 그대로** 둘 것.

### ⚠️ 함정 3 — 어휘 검사 오탐(정상)

표제어는 사전형(`blow`/`sink`/`grow`)인데 본문은 활용형(`blew`/`sank`/`grew`)이라
`verify.mjs` 가 "본문에 등장하지 않음" 경고를 낸다. **정상이며 차단 아님**
(현재 L5 5건). 새 어휘 경고가 뜨면 **먼저 활용형을 확인**할 것.

### ⚠️ 함정 4 — PDF 텍스트 추출은 다단 레이아웃에서 순서가 섞인다

본문암기 정답면(2단)·논리흐름(4단)은 추출 시 컬럼이 **교차로 섞여** 나와,
긴 문장이 잘린 것처럼 보인다. 실제로는 정상이므로 **페이지를 렌더해 눈으로 확인**할 것
(이번 검수에서 L5 2건 · L6 5건이 전부 이 오탐이었다).

### ⚠️ 함정 5 — 하드코딩된 학교·출판사명

`build-memorize.mjs` 는 `LESSONS` 설정 외에도 **헤더/표지/title 에 학교명이 하드코딩**
되어 있다. 다른 학교 폴더로 복사할 때 `LESSONS` 만 고치면 **본문에 이전 학교명이 그대로
찍힌다**(이번에 "신서중 2학년 · 미래엔(문영인)" 이 인쇄됨). 복사 후 반드시
`grep -n "신서중\|미래엔"` 로 잔여 문자열을 훑을 것.

## 폴더 구조

```
_SOURCE-L5.js / _SOURCE-L6.js   ← 원문 정본(기계 판독용). 임의 수정 금지
data/L5/{1..4}.json             분석지 데이터
data/L6/{1..4}.json
dist/L5, dist/L6                빌드 산출물(html/pdf/합본) + assets/
dist/_audit/                    PDF 텍스트 추출본(검수용)
styles/analysis.css             분석지 스타일
styles/workbook.css             본문암기 스타일 ★ 빠뜨리면 페이지 유실
verify.mjs                      무결성 검증
combine.mjs                     분석지 합본
build-memorize.mjs              본문암기 빌더
```

## Lesson 7 · Food Brings Us Together / Lesson 8 · The Last Wild Race (2026-11-05)

교과서 본문 PDF(`목일중/중2 비상황/26년 2학기 기말고사/목일중 {7,8}과.pdf`)로 만든 **본문분석 + 본문암기**.

| 과 | Ch | 제목 | 원문 문장 | 분석 카드 |
|----|----|------|-----------|-----------|
| L7 | 1 | 민찬 — 김장 | 8 | 4 |
| L7 | 2 | 에밀 — 플랫브레드 (2문단) | 11 | 5 |
| L7 | 3 | 비비안 — 호커 센터 | 6 | 4 |
| L7 | 4 | 비비안 — 호커 문화를 사랑하는 이유 | 6 | 4 |
| | | **L7 합계** | **31** | **17** |
| L8 | 1 | (도입) The Last Wild Race | 6 | 4 |
| L8 | 2 | What Is the Race Like? (2문단) | 9 | 5 |
| L8 | 3 | What Are the Rules of the Race? | 7 | 5 |
| L8 | 4 | Join Us! | 4 | 3 |
| | | **L8 합계** | **26** | **17** |

| 과 | 본문분석 합본 | 본문암기 |
|----|---------------|----------|
| L7 | `dist/L7/목일중2_비상_Lesson7_본문분석_합본.pdf` — 표지1+본문전문2(1~16 · 17~31)+본문13 = **16p** | `…Lesson7_본문암기.pdf` — **5p** (31문항 · qSplit `[11, 10, 10]`) |
| L8 | `dist/L8/목일중2_비상_Lesson8_본문분석_합본.pdf` — 표지1+본문전문1+본문14 = **16p** | `…Lesson8_본문암기.pdf` — **4p** (26문항 · qSplit `[13, 13]`) |

- **저작 방식이 바뀌었다** — L5·L6·L6X 는 JSON 을 직접 썼지만, L7·L8 은 봉영여중3 의 미니 마크업 헬퍼 `_author.mjs`
  (`{영어}`·`**굵게**`·`[g:]`/`[r:]`/`[h:]` 하이라이트·` | ` 끊어읽기)를 복제해 `_author-L7.mjs`·`_author-L8.mjs` 에서 생성한다.
  **JSON 을 직접 고치지 말고 저작 스크립트를 고친 뒤 `node _author-L{7,8}.mjs`.** 헬퍼가 직선따옴표를 곱슬로 바꾸고 낫표 「 」 를 차단한다.
- **원문**: PDF 왼쪽 단을 PyMuPDF 로 좌표 클립 추출한 `_PDF-RAW-L{7,8}.txt`(사람 손 안 거친 독립 경로) ↔ 손 분할 정본 `_SOURCE-L{7,8}.js`
  를 `node _xcheck.mjs L7|L8` 로 **문자 단위 완전 일치** 확인(L7 1538자 · L8 1539자). L8 소제목 3개는 본문 문장이 아니라 챕터 제목.
- **해석**: 교과서 PDF 오른쪽 단의 우리말을 문장 단위로 옮겼다(PDF 텍스트 추출은 구두점이 줄 끝으로 밀려 깨지므로 페이지 이미지 기준).
  인명은 한글(에밀·비비안), L8 25번 “의미도 있을 것입니다” → 원문 시제(is)에 맞춰 “의미도 있습니다”.
- 원본에 문제가 없어 각 챕터 문제 유형·보기는 형식상 새로 붙였다(`hide_answer` 라 인쇄 안 됨).
- `styles/analysis.css`·`workbook.css` 에 봉영여중3 의 확장 글리프 보정(`% × ○ ←` + ▶ ✗ Segoe UI Symbol)과 한글 제시문 어절 줄바꿈을 이식했다
  (기존 `+ = | ↔` 보정은 유지).
- **삽화 8장 반영(2026-11-05)** — 미드저니 원본 `dist/{L7,L8}/{1..4}.png`(3952×1232)를 가로 2000px 로 줄여 `dist/{L}/assets/illust-{N}.png` 에 넣고 재빌드. placeholder 0 · 이미지 4/4 · overflow 0 · 합본 각 약 13MB. 축소본 assets(8장 15MB)는 L5·L6X 와 같이 저장소에 포함, 3952px 원본은 미포함(gitignore). 프롬프트는 `_ILLUSTRATION_PROMPTS.md` 맨 아래 절.

### 빌드
```bash
cd mock-exam-analysis
D=_oneoff-목일중2-비상
(cd $D && node _xcheck.mjs L7 && node _xcheck.mjs L8 && node _author-L7.mjs && node _author-L8.mjs && node verify.mjs L7 && node verify.mjs L8)
for L in L7 L8; do
  node builder/build.mjs "$D/data/$L" "$D/dist/$L" --styles="$D/styles/analysis.css"
  for n in 1 2 3 4; do node builder/check-overflow.mjs "$D/dist/$L/$n.html"; done   # overflow 0
  node builder/pdf.mjs "$D/dist/$L" && node $D/combine.mjs $L
  node $D/build-memorize.mjs $L
done
```

### 검수 (2026-11-05)
- `_xcheck` 정본 = PDF 추출본 문자 단위 일치(L7 31문장 · L8 26문장) · `verify.mjs L7/L8` 오류 0·경고 0 · overflow 8챕터 전부 0.
- 실제 PDF 페이지 수 = 빌드 로그(분석 15·16p, 암기 5·4p — 함정 1 대조) · 분석지에 전 문장 ≥2회·해석 ≥4회 ·
  암기장에 영어 정답·한글 제시 전 문장 수록 · 글리프 깨짐 0 · PNG 렌더 육안 확인(표지·본문 전문·INTRO·PASSAGE·분석 카드·암기 문제/정답면).

## 봉영여중 2학년용 사본 — Lesson 7·8 (`L7B`·`L8B`, 2026-11-05)

목일중 L7·L8 과 **내용이 똑같고 학교명만 “봉영여중 2학년”** 인 본문분석·본문암기(사용자 요청).
머리글(왼쪽 위)·표지·문서 제목·파일명이 봉영여중으로 바뀐다.

| 과 | 본문분석 합본 | 본문암기 |
|----|---------------|----------|
| L7B | `dist/L7B/봉영여중2_비상_Lesson7_본문분석_합본.pdf` — 16p | `dist/L7B/봉영여중2_비상_Lesson7_본문암기.pdf` — 5p |
| L8B | `dist/L8B/봉영여중2_비상_Lesson8_본문분석_합본.pdf` — 16p | `dist/L8B/봉영여중2_비상_Lesson8_본문암기.pdf` — 4p |

- **data/{L7B,L8B} 를 직접 고치지 말 것** — `node _make-bongyoung.mjs` 가 data/{L7,L8} 를 복사하며 `exam` 만 바꾸고,
  삽화 축소본도 복사한다(사본 삽화는 gitignore — 중복 업로드 방지). 정본은 `_SOURCE-L{7,8}.js` 하나(`_SOURCE-L{7,8}B.js` 는 재수출).
- `build-memorize.mjs` 의 하드코딩 학교명(머리글·표지·title, 함정 5)을 `LESSONS[].school`(기본 목일중)로 바꿨다 — 기존 목일중 산출물 변화 없음(재빌드 확인).
- 검수: verify L7B·L8B 오류 0 · overflow 0 · 쪽수 목일중판과 동일 · **목일중 잔존 0** · 학교명을 맞바꾸면 전 쪽 텍스트가 목일중판과 완전 동일 · 삽화 4/4.

```bash
cd mock-exam-analysis
D=_oneoff-목일중2-비상
(cd $D && node _make-bongyoung.mjs && node verify.mjs L7B && node verify.mjs L8B)
for L in L7B L8B; do
  node builder/build.mjs "$D/data/$L" "$D/dist/$L" --styles="$D/styles/analysis.css"
  node builder/pdf.mjs "$D/dist/$L" && node $D/combine.mjs $L && node $D/build-memorize.mjs $L
done
```
