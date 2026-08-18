# 천재(강상구) 영어II · Lesson 2 — 일회성 산출물

> ⚠️ **테라노바 정식 회차와 무관한 1회성 작업물입니다.**
> 판매·구독 파이프라인(Storage 업로드, dispatch, 합본)에 절대 연결하지 마세요.
> `package.json` 에 스크립트를 추가하지 않았습니다 (정식 회차 목록 오염 방지).

## 무엇인가

교과서 **2022 개정 천재(강상구) 영어II Lesson 2 — Nudge** 본문으로
**본문 분석지 · 워크북 · 변형문제** 3종을 제작했다.
디자인은 테라노바 모의고사 포맷 그대로이고 데이터만 이 폴더 것을 쓴다.

## 구성

원문 PDF(`천재강 2과.pdf`)는 본문(Nudge)과 본문 외 지문(Dark Patterns)을 함께 싣고 있다.
교과서 소제목 기준으로 **6개 챕터**로 나눴다.

| # | 섹션 | 문장 |
|---|------|------|
| 1 | 넛지란 무엇인가 (도입) | 7 |
| 2 | Through Designs — 디자인 활용 | 14 |
| 3 | Through Peer Pressure — 동조 압력 활용 | 11 |
| 4 | Through Defaults — 디폴트 활용 | 16 |
| 5 | 본문 외 지문 · Dark Patterns (도입 + Forced Continuity) | 7 |
| 6 | 본문 외 지문 · Artificial Scarcity + Hidden Information | 14 |
| | **합계** | **69** |

> 원문 PDF 는 `1)~40)` / `1)~15)` 로 번호를 매기지만 **한 항목에 2문장이 든 경우가 많다**
> (2·10·14·20·22·29·35·38번 등). 정본(`_SOURCE.js`)은 **실제 문장 단위**로 쪼갰다.
> 그래서 "40+15=55항목"이 아니라 **69문장**이다.

## 산출물

| 종류 | 파일 | 분량 |
|------|------|------|
| 본문 분석지 | `dist/{1..6}.{html,pdf}` | 6·7·7·7·5·6p (총 38p) |
| 워크북 | `dist/workbook-{1..6}.{html,pdf}` | 10·11·11·11·10·11p (총 64p) |
| 변형문제 | `dist/variant-book.{html,pdf}` | **56p · 102문항** |

변형문제 구성 — 객관식 11유형 × 6지문 = 66문항 + 서술형 6 × 6 = 36문항
→ **총 102문항**, 문항 번호 1~102 연속.

## 빌드 방법

```bash
cd mock-exam-analysis

# 0) 검증 — 반드시 먼저 (실패 시 빌드 금지)
node "_oneoff-천재강상구-L2/verify.mjs"           # 분석지: 문장 누락 0 강제
node "_oneoff-천재강상구-L2/verify-workbook.mjs"  # 워크북: 정답 실재성
node "_oneoff-천재강상구-L2/verify-variant.mjs"   # 변형문제: 유형·정답 정합

# 1) 본문 분석지 (★ --styles 필수)
node builder/build.mjs "_oneoff-천재강상구-L2/data" "_oneoff-천재강상구-L2/dist" \
  --styles="_oneoff-천재강상구-L2/styles/analysis.css"
for n in 1 2 3 4 5 6; do node builder/check-overflow.mjs "_oneoff-천재강상구-L2/dist/$n.html"; done
node builder/pdf-image.mjs "_oneoff-천재강상구-L2/dist" --match='^[1-6]\.html$'

# 2) 워크북
node builder/build-workbook.mjs "_oneoff-천재강상구-L2/data" "_oneoff-천재강상구-L2/dist" \
  --styles="_oneoff-천재강상구-L2/styles/workbook.css"
node builder/pdf-image.mjs "_oneoff-천재강상구-L2/dist" --match='^workbook-\d+\.html$'

# 3) 변형문제 (★ --styles + --shared-writing-passage 필수)
node builder/build-variant.mjs "_oneoff-천재강상구-L2/data" "_oneoff-천재강상구-L2/dist" \
  --styles="_oneoff-천재강상구-L2/styles/variant.css" --shared-writing-passage
node "_oneoff-천재강상구-L2/_measure-clip.mjs"  "_oneoff-천재강상구-L2/dist/variant-book.html"
node "_oneoff-천재강상구-L2/_measure-pages.mjs" "_oneoff-천재강상구-L2/dist/variant-book.html"
node "_oneoff-천재강상구-L2/render-variant-pdf.mjs" "_oneoff-천재강상구-L2/dist/variant-book.html"
```

> ⚠️ PDF 는 `pdf-image.mjs`(스크린샷 합성)로 뽑는다. `page.pdf()` 인쇄 경로는
> Pretendard 한글런 안의 `[ ] ' -` 를 `☰` 로 깨뜨린다.
> **`--match` 를 반드시 지정**할 것 — 안 그러면 dist 안의 다른 산출물까지 다시 만든다.

## 원문 대조 (전사 검증)

`verify.mjs` 의 기준인 `_SOURCE.js` 를 데이터에서 생성하면 **순환 검증**이 된다.
그래서 이 폴더는 정본을 **원문 PDF 에서 직접 전사**한 뒤, 원문 텍스트와
substring 대조하는 일회성 스크립트로 검증했다.

- 결과: 정본 **69문장 전부가 원문에 그대로 존재**(전사 오류 0) ·
  **원문에 정본이 안 담은 문장 없음**(누락 0)

## 재사용한 규칙 (앞선 폴더에서 확인된 함정)

- **paraphrasing.level 은 `high`/`mid`/`low`** — `상/중/하` 로 쓰면 `class="lv-상"` 이 되어
  색 배지가 통째로 빠진다(빌드는 통과하므로 눈으로만 잡힘).
- **변형문제 `writing` 은 `subtype`(머신 키) 필수** — `subtype_label` 만 있으면
  카드가 빈칸으로 렌더된다. 서브타입별 필드:
  `word_order`→`ko_prompt`+`words` / `conditioned_write`·`topic_write`→`ko_prompt`+`conditions` /
  `fill_blank`→`context` / `translate_ko`→`en_prompt` / `summary_word`→`summary`+`answer_a`+`answer_b`.
- **워크북 정답에 문두 단어를 쓰지 말 것** — 빌더의 `buildProperNounSet` 이
  "문두에만 등장하는 대문자 단어"를 고유명사로 오판해 그 문항을 **에러 없이 삭제**한다.
  (이 과에서는 `Having`, `Likewise`, `Chicago`, `However`, `Furthermore`, `Setting`,
  `Dark`, `Artificial` 등이 위험)
- **삽화 프롬프트**: 밝기는 형용사가 아니라 조명 조건(`overcast`·`diffused`·`high-key`)으로
  지정하고 `golden hour` 계열은 `NO ~` 절로 배제. 현대 도시 소재라 브랜드 로고·
  판독 가능한 화면 텍스트도 배제(`NO brand logos, NO readable screen text`).
  프롬프트는 `_ILLUSTRATION_PROMPTS.md`(생성: `collect-prompts.mjs`).
  이미지를 `dist/assets/illust-{N}.png` 로 넣으면 재렌더 시 자동 반영된다.

## 이번에 새로 확인된 함정 (2026-08-18)

### ① 워크북 고유명사 오탐은 **인용문 안 단어까지** 번진다

`buildProperNounSet` 은 "본문에서 항상 대문자로만 등장하는 토큰"을 고유명사로 본다.
그래서 Ch3 의 표지판 인용문 `"Take your trash home. Other people do."` 안에서
문두에 오는 `Take` `Other` 가, Ch4 의 `For` 같은 평범한 단어까지 차단 대상이 된다.
→ 저작 전에 **빌더의 `buildProperNounSet` 을 실제로 재현해 차단 집합을 뽑고**
그 집합을 피하는 것이 안전하다(단어 목록을 눈으로 추정하지 말 것).

### ② 빈칸 힌트는 `isEasyWord()` 로 **개별 삭제**된다 — 5자 단어도 안전하지 않다

문항 전체가 아니라 **힌트 하나만** 조용히 사라진다. `EASY_STOPWORDS` 에는
`small` `water` `train` `woman` `about` 처럼 **5자 이상 흔한 단어**가 들어 있어
"4자 이하 금지"만 지켜서는 부족하다. 실제로 Ch6 의 `small` 이 이 경로로 유실됐다
(3힌트 → 2힌트, 검증기는 정상 보고).
→ 빌드 후 **저작 힌트 수 = 렌더 힌트 수**까지 대조할 것.

### ③ `points`/`note` 의 태그 불균형은 검증기가 못 잡는다

`verify.mjs` 는 `en_html` 만 태그를 벗겨 대조하므로, `<span ...>` 를 `</strong>` 로
닫는 실수가 통과된다(렌더는 깨진다). 이번에 Ch2 카드3 에서 1건 발견·수정했다.
→ `note`/`points`/`flow`/`choices` 의 태그 균형을 별도 스크립트로 확인할 것.

## 검수 결과 (2026-08-18)

- **원문 대조(독립)**: 정본 69문장 = 원문 69문장 · 전사 오류 0 · 누락 0
- `verify.mjs` **오류 0 · 경고 0** — 69문장 전수 커버, 분석 카드 en_html verbatim 일치
- `verify-workbook.mjs` **오류 0 · 경고 0** — 6부 전부 본문 전 문장 커버
- `verify-variant.mjs` **오류 0** — 6파일 전부 "객관식 11유형 · 서술형 6"
- 분석지 overflow **6/6 전부 0** · 워크북 overflow **6/6 전부 0**
- 변형문제 잘림 **0건** · 카드가 푸터를 넘는 페이지 **0개**
- 워크북 **문항 유실 0**(저작 수 = 렌더 정답지 수 대조)
- 변형문제 문항 번호 **1~102 연속**(문항·정답지 양쪽)
- 태그 균형 검사 **0건**(위 함정 ③ 수정 후)
