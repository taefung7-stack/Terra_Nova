# 천재(조수경) 영어II · Lesson 3 워크북 — 일회성 산출물

> ⚠️ **테라노바 정식 회차와 무관한 1회성 작업물입니다.**
> 판매·구독 파이프라인(Storage 업로드, dispatch, 합본)에 절대 연결하지 마세요.
> `package.json` 에 스크립트를 추가하지 않았습니다 (정식 회차 목록 오염 방지).

## 무엇인가

교과서 **천재(조수경) 영어II Lesson 3 — Seeds as the Best Survival Strategy** 본문을
테라노바 **모의고사 워크북 v1.0** 디자인 그대로 제작한 학습 워크북입니다.
빌더(`builder/build-workbook.mjs`)와 9-STEP 구성은 **수정하지 않고 그대로 재사용**했습니다.

## 구성

본문을 교과서 소제목 기준으로 나눠 각각 독립 산출물로 제작.

| # | 섹션 | 문장 | 워크북 |
|---|------|------|--------|
| 1 | 도입 + Help Yourself and Help Me | 11 | `dist/workbook-1.pdf` |
| 2 | The Worst Free Rider | 11 | `dist/workbook-2.pdf` |
| 3 | Deceptive Seeds | 11 | `dist/workbook-3.pdf` |
| 4 | The Wind Beneath My Wings | 11 | `dist/workbook-4.pdf` |
| 5 | Rising from the Ashes | 11 | `dist/workbook-5.pdf` |
| 6 | **READ MORE · The Tallest Tree on Earth** | 15 | (분석지·변형만) |

> **6번(READ MORE)은 2026-08-17 추가.** 워크북 제작 당시에는 본문 5개 소제목만
> 다뤄 55문장이었는데, 원문 PDF 대조 결과 부록 READ MORE 15문장이 통째로
> 빠져 있었다. 분석지·변형문제에는 포함했고 **워크북은 기존 5부 그대로** 둔다
> (기존 산출물 무변경). 총 원문 **70문장**.

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

원문 **70문장(본문 55 + READ MORE 15)** 으로 **본문 분석지**와 **변형문제 책**을
추가 제작했다. 디자인은 모의고사 분석지/변형문제 포맷 그대로이고 데이터만 이 폴더 것을 쓴다.

| 산출물 | 파일 | 분량 |
|--------|------|------|
| 본문 분석지 | `dist/{1..6}.{html,pdf}` | 6·7·6·6·6·7p (총 38p) |
| 변형문제 책 | `dist/variant-book.{html,pdf}` | **56p · 102문항** |
| 워크북(기존) | `dist/workbook-{1..5}.{html,pdf}` | 10p × 5 (READ MORE 미포함) |

변형문제 구성 — 객관식 11유형(주제/요지/제목/함축/어법/어휘/빈칸/무관/순서/삽입/요약)
× 6개 지문 = 66문항 + 서술형 6 × 6 = 36문항 → **총 102문항**, 문항 번호 1~102 연속.

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

## 삽화 프롬프트

`_ILLUSTRATION_PROMPTS.md` (생성: `node _oneoff-천재영어2-L3/collect-prompts.mjs`).
프롬프트 원본은 각 챕터 JSON 의 `illustration.prompt`.

- 규격 **`--ar 16:5 --v 8.1`**, 톤 **실사(포토리얼)** 자연 다큐.
- **밝기는 형용사가 아니라 조명 조건으로 지정** — `natural soft diffused daylight`
  `bright overcast sky` `high-key exposure` `low contrast` `airy`.
  `bright` 만 던지면 미드저니가 황금빛 저녁+고대비로 해석해 **오히려 어두워진다**.
- `cinematic` `golden hour` `sunlit` `sunbeams` `dramatic lighting` `moody` `neon`
  `night` 은 지시부에서 배제하고 **`NO ~` 절로 명시적으로 밀어낸다**.
  (검증 시 단순 grep 은 배제절까지 잡아 오탐하므로 `NO xxx,` 를 제거한 지시부만 볼 것.
  `dark brown seeds` 처럼 **색 묘사**는 조명 키워드가 아니므로 정상이다.)
- 교재 삽화라 **사람 미등장**(`NO people`) — 식물·씨앗 자체가 주인공.
- 챕터별 소재 분리: 1 잭프루트 / 2 갈고리 열매 / 3 쇠똥구리와 위장 씨앗 /
  4 회전하는 단풍 씨앗 / 5 산불 후 재와 캡슐 / 6 올려다본 레드우드 숲.
  Ch6 은 "주변 나무와 높이가 비슷해 구분이 안 된다"는 본문 반전을 그림에 담았다.

## 검수 결과 (2026-08-17)

**원문 대조** — `verify.mjs` 는 `_SOURCE.js` 를 JSON 에서 생성하므로 순환 검증이다.
그래서 원문 PDF 텍스트를 따로 옮겨 **독립 대조**를 돌렸고, 그 결과
**READ MORE 15문장 통째 누락**을 발견해 6번 챕터로 추가했다.

- 독립 대조: 원문 **70문장 = JSON 70문장**, 누락 0 · 창작/오타 0 · **순서까지 완전 일치**
- `verify.mjs` **오류 0 · 경고 0** — 70문장 전수 커버, 분석 카드 en_html 이
  원문과 verbatim 일치(태그 제거 후 대조)
- `verify-variant.mjs` **오류 0** — 6파일 전부 "객관식 11유형 · 서술형 6"
- 분석지 overflow **6/6 전부 0**
- 변형문제 잘림 **0건** · 카드가 푸터를 넘는 페이지 **0개**
- 문항 번호 **1~102 연속**(문항·정답지 양쪽)
- 시각 QC: 청크 구분선·하이라이트·PARAPHRASING 배지, `115 m`/`114 m` 수치 정상 렌더

> ⚠️ **교훈**: 정본(`_SOURCE.js`)을 데이터에서 생성하면 검증이 순환한다.
> 새 교재를 받으면 **원문에서 직접 옮긴 텍스트와 한 번은 대조**할 것.

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
