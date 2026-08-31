# 목일중 2학년 — 2022 개정 비상(황종배) 중2 본문분석 + 본문암기 (Lesson 5·6)

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
| L5 | `목일중2_비상_Lesson5_본문분석_합본.pdf` — 표지1+본문전문1+본문12 = **14p** | `…Lesson5_본문암기.pdf` — **5p** (27문항) |
| L6 | `목일중2_비상_Lesson6_본문분석_합본.pdf` — 표지1+본문전문1+본문14 = **16p** | `…Lesson6_본문암기.pdf` — **6p** (37문항) |

- 분석지 각 챕터: **INTRO**(요약·요지·제목 + 삽화 + 단어표) → **PASSAGE**(본문 전문 +
  문장별 해석 + 4단 논리흐름) → **SENTENCE ANALYSIS**(문장별 어법·어휘·리딩 분석)
- 본문암기: 표지 1p → 한글 제시 + 영작 답란 Np → 영어 정답 1p(2단, 연속 번호)
- **ANSWER(정답·오답 분석) 블록 없음** — `hide_answer: true`

## 빌드 방법

```bash
cd mock-exam-analysis
L=L5   # 또는 L6

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

**나머지 5장(L5 4장 + L6 Ch1)은 아직 placeholder** 다. 각 `data/{L}/{N}.json` 의
`illustration.prompt` 에 미드저니 프롬프트(16:5, v8.1, 실사)를 넣어 두었으니,
생성한 이미지를 `dist/{L}/assets/illust-{N}.png` 로 저장하고 재빌드하면 반영된다.

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
