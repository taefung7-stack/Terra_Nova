# 천재(조수경) 영어II · Lesson 4 — Flavors Without Borders

> ⚠️ **테라노바 정식 회차와 무관한 1회성 작업물입니다.**
> 판매·구독 파이프라인에 절대 연결하지 마세요. `package.json` 에 스크립트를 추가하지 않았습니다.

Lesson 3 과 **같은 폴더 안에서 `L4/` 하위 디렉터리로 분리**했다
(신서고 폴더의 `data/{L1,L2}` 선례와 동일). L3 파일은 하나도 건드리지 않았다.

```
data/L4/{1..6}.json            분석지 데이터
data/L4/{1..6}-workbook.json   워크북 데이터
data/L4/{1..6}-variant.json    변형문제 데이터
dist/L4/                       산출물
_SOURCE-L4.js                  원문 정본(61문장)
verify-L4.mjs / verify-workbook-L4.mjs / verify-variant-L4.mjs
```

## 구성 (61문장 · 6챕터)

| # | 섹션 | 문장 |
|---|------|------|
| 1 | An Underwater Delicacy — 도입 | 5 |
| 2 | Gim in the Past — 귀했던 시절 | 6 |
| 3 | Gim in the Past — 김을 널리 퍼뜨린 두 인물 | 11 |
| 4 | Gim in the Present — 현재의 김 | 15 |
| 5 | Gim in the Future — 미래의 김 | 11 |
| 6 | Read More · From "Black Gold" to Everyday Seasoning | 13 |
| | **합계** | **61** |

> 교과서 소제목 `Gim in the Past` 는 17문장이라 분량이 커서
> **"귀했던 시절"(6) / "두 인물"(11)** 로 나눴다. Read More(후추)도 포함한다.

## 빌드 방법

```bash
cd mock-exam-analysis

# 0) 검증 — 반드시 먼저 (실패 시 빌드 금지)
node "_oneoff-천재영어2-L3/verify-L4.mjs"
node "_oneoff-천재영어2-L3/verify-workbook-L4.mjs"
node "_oneoff-천재영어2-L3/verify-variant-L4.mjs"

# 1) 본문 분석지 (★ --styles 필수)
node builder/build.mjs "_oneoff-천재영어2-L3/data/L4" "_oneoff-천재영어2-L3/dist/L4" \
  --styles="_oneoff-천재영어2-L3/styles/analysis.css"
for n in 1 2 3 4 5 6; do node builder/check-overflow.mjs "_oneoff-천재영어2-L3/dist/L4/$n.html"; done
node builder/pdf-image.mjs "_oneoff-천재영어2-L3/dist/L4" --match='^[1-6]\.html$'

# 2) 워크북
node builder/build-workbook.mjs "_oneoff-천재영어2-L3/data/L4" "_oneoff-천재영어2-L3/dist/L4" \
  --styles="_oneoff-천재영어2-L3/styles/workbook.css"
node builder/pdf-image.mjs "_oneoff-천재영어2-L3/dist/L4" --match='^workbook-\d+\.html$'

# 3) 변형문제 (★ --styles + --shared-writing-passage 필수)
node builder/build-variant.mjs "_oneoff-천재영어2-L3/data/L4" "_oneoff-천재영어2-L3/dist/L4" \
  --styles="_oneoff-천재영어2-L3/styles/variant.css" --shared-writing-passage
node "_oneoff-천재영어2-L3/_measure-clip.mjs"  "_oneoff-천재영어2-L3/dist/L4/variant-book.html"
node "_oneoff-천재영어2-L3/_measure-pages.mjs" "_oneoff-천재영어2-L3/dist/L4/variant-book.html"
node "_oneoff-천재영어2-L3/render-variant-pdf.mjs" "_oneoff-천재영어2-L3/dist/L4/variant-book.html"
```

> ⚠️ `--styles` 는 `dist/L4` 로 한 단계 깊어졌으므로 **반드시 지정**해야 한다.
> PDF 는 `pdf-image.mjs`(스크린샷 합성)로 뽑는다 — `page.pdf()` 인쇄 경로는
> Pretendard 한글런 안의 `[ ] ' -` 를 `☰` 로 깨뜨린다.

## 원문 대조 (전사 검증)

정본을 데이터에서 생성하면 **순환 검증**이 되므로, 원문 PDF 에서 직접 전사한 뒤
원문 텍스트와 substring 대조했다.

- 결과: 정본 **61문장 전부가 원문에 그대로 존재**(전사 오류 0) ·
  **원문에 정본이 안 담은 문장 없음**(누락 0)

## 재사용한 규칙 (앞선 폴더에서 확인된 함정)

- **paraphrasing.level 은 `high`/`mid`/`low`** — `상/중/하` 로 쓰면 색 배지가 빠진다.
- **변형문제 `writing` 은 `subtype`(머신 키) 필수** — 없으면 카드가 빈칸으로 렌더된다.
- **워크북 문항 유실 2종** — ① 문두 전용 대문자어를 정답으로 쓰면 문항이 통째로
  삭제되고(인용문 안 단어까지 번진다), ② 빈칸 힌트는 `isEasyWord` 로 개별 삭제되는데
  `EASY_STOPWORDS` 에 `small` 같은 5자 단어가 있어 "4자 이하 금지"만으론 부족하다.
  → 빌더 함수를 재현해 차단 집합을 뽑고, 빌드 후 저작 수 = 렌더 수를 대조한다.
- **`points`/`note` 태그 불균형은 검증기가 못 잡는다** — `<span>` 을 `</strong>` 로 닫는
  실수가 통과되고 렌더만 깨진다. 별도 균형 검사 필요.
- **삽화 프롬프트**: 밝기는 조명 조건(`overcast`·`diffused`·`high-key`)으로 지정하고
  `golden hour`·`sunlit`·`sunbeams` 계열은 `NO ~` 절로 배제.
  (이번에도 Ch5 초안에 `sunlit surface` 가 들어가 잡아냈다 — 실사에서 역효과)

## 산출물

| 종류 | 파일 | 분량 |
|------|------|------|
| 본문 분석지 | `dist/L4/{1..6}.{html,pdf}` | 4·5·6·7·6·7p (총 35p) |
| 워크북 | `dist/L4/workbook-{1..6}.{html,pdf}` | 9·9·10·11·11·11p (총 61p) |
| 변형문제 | `dist/L4/variant-book.{html,pdf}` | **56p · 102문항** |
| **워크북 합본** | `dist/L4/천재영어2_Lesson4_워크북_합본.pdf` | **63p** (표지1+목차1+본문61) · 11.4MB |
| **변형문제 합본** | `dist/L4/천재영어2_Lesson4_변형문제_합본.pdf` | **58p** (표지1+목차1+본문56) · 12.0MB |

변형문제 구성 — 객관식 11유형 × 6지문 = 66문항 + 서술형 6 × 6 = 36문항
→ **총 102문항**, 문항 번호 1~102 연속.

## 검수 결과 (2026-08-18)

- **원문 대조(독립)**: 정본 61문장 = 원문 61문장 · 전사 오류 0 · 누락 0
- `verify-L4.mjs` **오류 0 · 경고 0** — 61문장 전수 커버, 분석 카드 en_html verbatim 일치
- `verify-workbook-L4.mjs` **오류 0 · 경고 0** — 6부 전부 본문 전 문장 커버
- `verify-variant-L4.mjs` **오류 0** — 6파일 전부 "객관식 11유형 · 서술형 6"
- 분석지 overflow **6/6 전부 0** · 워크북 overflow **6/6 전부 0**
- 변형문제 잘림 **0건** · 카드가 푸터를 넘는 페이지 **0개**
- 워크북 **문항 유실 0**(저작 수 = 렌더 정답지 수 대조)
- 변형문제 문항 번호 **1~102 연속**(문항·정답지 양쪽)
- 태그 균형 **0건** · paraphrasing level 전부 `high`/`mid`/`low`

### 이번에도 재현된 함정

- **워크북 고유명사 오탐** — Ch4 `Furthermore`, Ch6 `Having` 이 정답이던 문항 2개가
  조용히 삭제될 뻔했다(저작 중 빌더 함수 재현으로 사전 발견·수정).
  Ch3 에서는 **`gim` 자체가 차단어**였다 — 1번 문장의 인명 "Gim"(대문자) 때문에
  소문자 `gim` 이 본문에 아무리 많이 나와도 고유명사 집합에 들어간다.
- **Ch1 배열 문항은 5개가 아니라 4개** — 남은 후보가 괄호 주석 3개짜리 문장뿐이라
  `(a`, `roll)` 같은 토큰이 생겨 억지로 만들지 않고 4개로 두고 `mixed` 를 `sent` 로 채웠다.
- **`sunlit` 이 삽화 프롬프트 초안에 또 들어갔다**(Ch5) — 실사에서 역효과라 제거.
- **태그 불균형 2건**(`<span>` 을 `</strong>` 로 닫음)이 분석지 저작 중 발생했고
  검증기가 못 잡아 별도 균형 검사로 잡았다.

## 합본 (2026-08-21)

```bash
cd mock-exam-analysis
node "_oneoff-천재영어2-L3/combine-L4.mjs" workbook   # 또는 variant / both
```

`combine-L4.mjs` 는 두 종을 한 스크립트로 처리한다.

- **워크북** — `workbook-{1..6}.html` 6부를 이어 붙이고 페이지번호를 1..61 로 재부여.
  개별본 헤더의 `"N번"` 자리에 **섹션명(교과서 소제목)** 을 끼워 넣는다.
  개별본이 `hide_head_no` 라 `<span class="qno">` 자체가 없을 수 있으므로
  qno 치환에 의존하지 않고 `exam-tag` 뒤에 라벨을 새로 삽입한다.
  챕터 시작 페이지 — 1 / 10 / 19 / 29 / 40 / 51
- **변형문제** — `variant-book.html` 이 이미 6지문 통합본(56p)이라 이어 붙일 것이 없다.
  표지·목차만 앞에 붙이고 페이지번호를 1..56 으로 재부여한다.
  **문항 번호 1~102 는 그대로 보존**된다(페이지번호만 재매김).

표지·목차는 번호를 매기지 않으므로 본문 첫 장이 1p. 합본 후 **`.page` 섹션 수 =
PDF 페이지 수**를 자동 대조한다(CSS 경로가 깨지면 A4 고정이 풀려 페이지가 유실됨).

### ⚠️ 이 두 합본은 gs 압축을 하지 말 것

분석지 합본(삽화 6장 포함)은 gs 300dpi 다운샘플이 크게 이득이지만,
**워크북·변형문제 합본은 사진이 없고 텍스트·표뿐이라 JPEG 재인코딩이 역효과**다.
실제로 11.4MB→12.0MB, 12.0MB→12.6MB 로 **오히려 커졌다.** 원본을 그대로 쓴다.
