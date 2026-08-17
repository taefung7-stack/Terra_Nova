# 천재(조수경) 영어II · Lesson 3 워크북 — 일회성 산출물

> ⚠️ **테라노바 정식 회차와 무관한 1회성 작업물입니다.**
> 판매·구독 파이프라인(Storage 업로드, dispatch, 합본)에 절대 연결하지 마세요.
> `package.json` 에 스크립트를 추가하지 않았습니다 (정식 회차 목록 오염 방지).

## 무엇인가

교과서 **천재(조수경) 영어II Lesson 3 — Seeds as the Best Survival Strategy** 본문을
테라노바 **모의고사 워크북 v1.0** 디자인 그대로 제작한 학습 워크북입니다.
빌더(`builder/build-workbook.mjs`)와 9-STEP 구성은 **수정하지 않고 그대로 재사용**했습니다.

## 구성

본문 55문장을 교과서 소제목 기준 **5개 섹션**으로 나눠 각각 독립 워크북(10p)으로 제작.

| # | 섹션 | 문장 | 산출물 |
|---|------|------|--------|
| 1 | 도입 + Help Yourself and Help Me | 11 | `dist/workbook-1.pdf` |
| 2 | The Worst Free Rider | 11 | `dist/workbook-2.pdf` |
| 3 | Deceptive Seeds | 11 | `dist/workbook-3.pdf` |
| 4 | The Wind Beneath My Wings | 11 | `dist/workbook-4.pdf` |
| 5 | Rising from the Ashes | 11 | `dist/workbook-5.pdf` |

각 워크북 9-STEP (정답지 분할로 실제 10페이지):
STEP 1 본문·해석·어휘 → 2 어법 양자택일 → 3 어휘 양자택일 → 4 빈칸 첫글자 →
5 한글 해석 → 6 영문 배열 → 7 통문장 영작 → 8 종합 → 9 정답·해설

## 빌드 방법

```bash
cd mock-exam-analysis
node builder/build-workbook.mjs "_oneoff-천재영어2-L3/data" "_oneoff-천재영어2-L3/dist"
node builder/pdf.mjs "_oneoff-천재영어2-L3/dist"

# 검증 (overflow 0 이 절대 조건)
node builder/check-overflow.mjs "_oneoff-천재영어2-L3/dist/workbook-1.html"
```

---

# 본문분석 + 변형문제 (2026-08-17 추가)

같은 55문장으로 **본문 분석지**와 **변형문제 책**을 추가 제작했다.
디자인은 모의고사 분석지/변형문제 포맷 그대로이고, 데이터만 이 폴더 것을 쓴다.

| 산출물 | 파일 | 분량 |
|--------|------|------|
| 본문 분석지 | `dist/{1..5}.{html,pdf}` | 6·7·6·6·6p (총 31p) |
| 변형문제 책 | `dist/variant-book.{html,pdf}` | **52p · 85문항** |
| 워크북(기존) | `dist/workbook-{1..5}.{html,pdf}` | 10p × 5 |

변형문제 구성 — 객관식 11유형(주제/요지/제목/함축/어법/어휘/빈칸/무관/순서/삽입/요약)
× 5개 지문 = 55문항 + 서술형 6 × 5 = 30문항 → **총 85문항**, 문항 번호 1~85 연속.

## 빌드 방법

```bash
cd mock-exam-analysis

# 0) 검증 — 반드시 먼저 (실패 시 빌드 금지)
node "_oneoff-천재영어2-L3/verify.mjs"          # 분석지: 문장 누락 0 강제
node "_oneoff-천재영어2-L3/verify-variant.mjs"  # 변형문제: 유형·정답 정합

# 1) 본문 분석지 (★ --styles 필수)
node builder/build.mjs "_oneoff-천재영어2-L3/data" "_oneoff-천재영어2-L3/dist" \
  --styles="_oneoff-천재영어2-L3/styles/analysis.css"
for n in 1 2 3 4 5; do node builder/check-overflow.mjs "_oneoff-천재영어2-L3/dist/$n.html"; done
node builder/pdf-image.mjs "_oneoff-천재영어2-L3/dist" --match='^[1-5]\.html$'

# 2) 변형문제 (★ --styles + --shared-writing-passage 필수)
node builder/build-variant.mjs "_oneoff-천재영어2-L3/data" "_oneoff-천재영어2-L3/dist" \
  --styles="_oneoff-천재영어2-L3/styles/variant.css" --shared-writing-passage
node "_oneoff-천재영어2-L3/_measure-clip.mjs"  "_oneoff-천재영어2-L3/dist/variant-book.html"
node "_oneoff-천재영어2-L3/_measure-pages.mjs" "_oneoff-천재영어2-L3/dist/variant-book.html"
node "_oneoff-천재영어2-L3/render-variant-pdf.mjs" "_oneoff-천재영어2-L3/dist/variant-book.html"
```

> ⚠️ PDF 는 `pdf-image.mjs`(스크린샷 합성)로 뽑는다. `page.pdf()` 인쇄 경로는
> Pretendard 한글런 안의 `[ ] ' -` 를 `☰` 로 깨뜨린다.
> 분석지만 뽑도록 `--match` 를 반드시 지정할 것(안 그러면 워크북 PDF 까지 다시 만든다).

## 데이터 구조

- `_SOURCE.js` — 원문 PDF verbatim 전사 **정본**(55문장). 임의 수정 금지.
- `data/{N}.json` — 분석지. `passage`/`passage_ko`/`vocab` 는 워크북 제작 때부터
  있던 것을 그대로 쓰고, 이번에 `flow`(4단계 논리 흐름)·`sentences`(분석 카드)·
  `choices`(제목 5지선다)·`illustration` 을 채웠다.
- `data/{N}-variant.json` — 변형문제. `by_type` 에 11유형 + `writing` 6문항.

### 함정 — paraphrasing.level 은 `high/mid/low`

`analysis.css` 는 `.lv-high` `.lv-mid` `.lv-low` 만 스타일링한다.
`"상"/"중"/"하"` 로 쓰면 `class="lv-상"` 이 되어 **색 배지가 통째로 빠진다**
(빌드는 정상 통과하므로 눈으로만 잡힌다). 저작 시 반드시 영문 키를 쓸 것.

### 함정 — 변형문제 서술형 필드명

`writing` 항목은 `subtype`(머신 키)이 있어야 렌더 분기가 걸린다.
`subtype_label` 만 있으면 verifier 가 막고, 통과하더라도 카드가 빈칸으로 나온다.
서브타입별 필드: `word_order`→`ko_prompt`+`words` / `conditioned_write`·`topic_write`
→`ko_prompt`+`conditions` / `fill_blank`→`context` / `translate_ko`→`en_prompt` /
`summary_word`→`summary`+`answer_a`+`answer_b`.

## 검수 결과 (2026-08-17)

- `verify.mjs` **오류 0 · 경고 0** — 55문장 전수 커버, 분석 카드 en_html 이
  원문과 verbatim 일치(태그 제거 후 대조)
- `verify-variant.mjs` **오류 0** — 5파일 전부 "객관식 11유형 · 서술형 6"
- 분석지 overflow **5/5 전부 0**
- 변형문제 잘림 **0건** · 카드가 푸터를 넘는 페이지 **0개**
- 문항 번호 **1~85 연속**(문항·정답지 양쪽)
- 시각 QC: 청크 구분선·하이라이트·PARAPHRASING 배지 정상 렌더

## 이 폴더만의 특이사항

- **`styles/workbook.css` 는 로컬 사본**입니다. 원본(`2026-june-grade2/styles/workbook.css`)을
  복사한 뒤 **PretendardTN 글리프 보정**(`@font-face` + `unicode-range`)을 추가했습니다.
  이 보정이 없으면 Chromium PDF 렌더에서 `[형]` 대괄호·아포스트로피(`Let's`)·하이픈이
  `☰` 박스로 깨지거나 사라집니다. (textbook/styles/tokens.css 의 검증된 보정과 동일 방식)
- 원본 공용 CSS와 v1.0 LOCKED 빌더는 **건드리지 않았습니다.**

## 검수 결과 (2026-08-10)

- 본문 55문장 원문 PDF와 **verbatim 일치** 확인
- overflow: **5개 전부 0** (총 50페이지)
- 구조 검증 통과: 빈칸 정답의 본문 실제 등장·첫글자 일치, 양자택일 정답 우선 배치,
  배열 정답의 본문 일치, 해석 전 문장 커버, 종합문제 참조 유효성
- 시각 QC: 글리프 깨짐 없음(수정 후 재렌더 확인)
