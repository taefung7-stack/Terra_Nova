# 목일중 3학년 — 2022 개정 동아(이병민) 중학교 영어 3 본문분석 + 본문암기 (Lesson 6·7·8)

> ⚠️ **개인 용도 1회성 산출물입니다. 테라노바 판매용이 아닙니다.**
> 판매·구독 파이프라인(Supabase Storage 업로드, dispatch-order-pdf, market)에
> **절대 연결하지 마세요.** `package.json` 에도 스크립트를 등록하지 않았습니다
> (`_oneoff-목일중2-비상` / `_oneoff-신서중2-미래엔` 와 동일 정책).

## 무엇인가

교과서 **2022 개정 동아(이병민) 중학교 영어 3** 본문을 테라노바 분석지 v1.0 디자인으로
제작한 **본문 분석지 + 본문암기 워크북**입니다. `_oneoff-목일중2-비상` 과 같은 구성.

- **Lesson 6** — Make the World Beautiful (Nature Meets City / 자연에서 영감을 얻은 건축)
- **Lesson 7** — Feel the Wonder (Under the Sea / 바다 동물들의 놀라운 습성)
- **Lesson 8** — Up to You (How Will You Be Remembered? / Alfred Nobel 과 노벨상)

> 요청 범위는 **본문분석 + 본문암기 2종**입니다. 9-STEP 워크북·변형문제는 만들지 않았습니다.

## 챕터 분할

교과서가 **본문 1~4 로 이미 나눠 두었고 문장 수도 고르다.** 그래서 문단 재조정 없이
**교과서 구획을 그대로 4챕터**로 썼다(사용자 확인 2026-09-16).

| 과 | Ch | 제목 | 원문 문장 | 문제 유형 | 정답 |
|----|----|------|-----------|-----------|------|
| L6 | 1 | Art Imitates Nature — The Egg | 9 | 제목 | ③ |
| L6 | 2 | Sagrada Familia, Trees Indoors | 7 | 주제 | ① |
| L6 | 3 | Sydney Opera House and an Orange | 9 | 내용일치 | ⑤ |
| L6 | 4 | DDP and the Curves of Nature | 8 | 요지 | ② |
| | | **L6 합계** | **33** | | |
| L7 | 1 | Under the Sea (도입) | 4 | 주제 | ② |
| L7 | 2 | Sweet Dreams (혹등고래) | 8 | 내용일치 | ④ |
| L7 | 3 | Enjoy Your Meal (tuskfish) | 8 | 제목 | ① |
| L7 | 4 | One, Two, Three, Jump! | 8 | 내용불일치 | ③ |
| | | **L7 합계** | **28** | | |
| L8 | 1 | The Merchant of Death | 6 | 내용일치 | ④ |
| L8 | 2 | Reading His Own Obituary | 10 | 제목 | ② |
| L8 | 3 | Nobel's Resolve | 7 | 심경 | ⑤ |
| L8 | 4 | The Nobel Prize | 7 | 요지 | ① |
| | | **L8 합계** | **30** | | |

> ⚠️ **문장 수는 인용 대사 처리에 따라 달라진다.** L8 Ch3 은 Nobel 의 대사가
> 여러 문장으로 쪼개져 있어 교과서 문단 겉보기와 문장 수가 다르다. 정본
> (`_SOURCE-L8.js`)이 기준이며, 기계 분할 결과를 정본으로 삼지 말 것.

> ⚠️ **L7 각주는 본문 문장이 아니다.** `* humpback whale: …` / `* tuskfish: …` /
> `* giant trevally: …` 는 어휘 주석이므로 정본 문장에 넣지 않았다. 챕터 JSON 의
> `vocab` · `note` 에서 다룬다.

### 정답 위치 분산

저작하면 정답이 ① 로 몰리는 습성이 있다(테라노바 실측 2건 모두 54.5%).
이번에는 저작 단계에서 챕터별 정답 위치를 **미리 지정**해 분산했다 —
**L6 3/1/5/2 · L7 2/4/1/3 · L8 4/2/5/1**. 새 챕터를 추가하면 분포를 반드시 확인할 것.

## 산출물

| 과 | 본문분석 합본 | 본문암기 |
|----|---------------|----------|
| L6 | `목일중3_동아이병민_Lesson6_본문분석_합본.pdf` | `목일중3_동아이병민_Lesson6_본문암기.pdf` (33문항) |
| L7 | `목일중3_동아이병민_Lesson7_본문분석_합본.pdf` | `목일중3_동아이병민_Lesson7_본문암기.pdf` (28문항) |
| L8 | `목일중3_동아이병민_Lesson8_본문분석_합본.pdf` | `목일중3_동아이병민_Lesson8_본문암기.pdf` (30문항) |

### 본문분석

- 표지 1p → **본문 전문(FULL TEXT)** 1p → 챕터별 본문
- 각 챕터: **INTRO**(요약·요지·제목 + 삽화 + 단어표) → **PASSAGE**(본문 전문 +
  문장별 해석 + 4단 논리흐름) → **SENTENCE ANALYSIS**(문장별 어법·어휘·리딩 분석)
- **ANSWER(정답·오답 분석) 블록 없음** — 문제집이 아니라 본문 분석이므로
  `hide_answer: true` 로 제거

### 본문암기

- 구성: **표지 1p → 문제 3p → 정답 1p**
- 문제면: 한글 문장 + 영작 답란(밑줄). 챕터 구분 없이 **1번부터 연속 번호**
- 정답면: 영어 원문을 같은 번호로 **책 뒤에 몰아서** 2단 배치
- **원문 전 문장 수록** (L6 33 / L7 28 / L8 30문항)
- 페이지 분배는 `LESSONS[].qSplit` 으로 손으로 지정한다(사용자 요청 2026-09-16,
  **과당 3장 균등**): L6 `[11,11,11]` / L7 `[10,9,9]` / L8 `[10,10,10]`.
  - qSplit 합계가 문항 수와 다르거나, 지정한 문항 수가 **한 페이지에 넘치면 빌드가 중단**된다
    (`.page-body` 가 `overflow:hidden` 이라 넘치면 조용히 잘리므로 실측을 유지했다).

## 폴더 구조

```
_SOURCE-L6.js / -L7.js / -L8.js ← 원문 정본(기계 판독용). 임의 수정 금지
data/L6/{1..4}.json             분석지 데이터
data/L7/{1..4}.json
data/L8/{1..4}.json
dist/L6, dist/L7, dist/L8       빌드 산출물(html/pdf/합본)
styles/analysis.css, workbook.css
verify.mjs                      데이터 무결성 검증
combine.mjs                     분석지 합본
build-memorize.mjs              본문암기 빌더
_ILLUSTRATION_PROMPTS.md        삽화 프롬프트 12장(16:5, v8.1)
```

## 빌드 방법

```bash
cd mock-exam-analysis
L=L6   # 또는 L7 / L8

# 0) 무결성 검증 — 반드시 먼저 (실패 시 빌드 금지)
node "_oneoff-목일중3-동아이/verify.mjs"

# 1) 분석지
node builder/build.mjs "_oneoff-목일중3-동아이/data/$L" "_oneoff-목일중3-동아이/dist/$L" \
  --styles="_oneoff-목일중3-동아이/styles/analysis.css"

# 2) 넘침 검사 — overflow 0 이 절대 조건
node builder/check-overflow.mjs "_oneoff-목일중3-동아이/dist/$L/1.html"

# 3) PDF
node builder/pdf.mjs "_oneoff-목일중3-동아이/dist/$L"

# 4) 합본
node "_oneoff-목일중3-동아이/combine.mjs" $L

# 5) 본문암기
node "_oneoff-목일중3-동아이/build-memorize.mjs" $L

# 6) 산출물 전수 검수 — 텍스트 덤프를 먼저 만들어야 한다
cd _oneoff-목일중3-동아이
python _memaudit-extract.py $L   # PDF → dist/_memaudit/*.txt, dist/_audit/*.txt
node _memaudit.mjs $L            # 암기장에 원문 전 문장이 실제로 찍혔는지
```

> ⚠️ `_memaudit.mjs` 는 `dist/_memaudit/{L}.txt` 를 **읽기만 한다.** 덤프를 만드는
> `_memaudit-extract.py` 를 먼저 돌리지 않으면 ENOENT 로 죽는다.
> `_memaudit-extract.py` 는 PyMuPDF(`pip install pymupdf`)가 필요하다.

## 문장 누락 0 보장

`verify.mjs` 가 정본과 챕터 JSON 을 대조해 다음을 강제한다.

- `passage` 가 원문과 **verbatim 일치**(문장 수·순서·구두점까지)
- `passage_ko` 길이가 `passage` 와 동일(해석 누락 0)
- 분석 카드를 이어붙인 영어가 **원문 전문과 일치** + `covers` 가 전 문장을
  빠짐없이 1회씩 오름차순 커버(짧은 문장 병합 허용, 누락은 차단)
- `choices` 5개 · 정답 정확히 1개 · 모든 보기에 `comment`
- 어휘가 본문에 실제 등장하는지(어간 기준)

### ⚠️ 함정 — 곱슬따옴표

동아 교과서 본문은 `“ ” ‘ ’` 곱슬따옴표와 `Jørn Utzon` 의 `ø` 를 쓴다.
`verify.mjs` 의 `norm()` 이 곱슬/직선 따옴표 차이는 흡수하지만, **정본에 옮길 때는
교과서 표기 그대로** 두는 것이 원칙이다. 임의로 직선따옴표로 바꾸지 말 것.

## 삽화

`_ILLUSTRATION_PROMPTS.md` 에 **12장**(L6 4장 + L7 4장 + L8 4장)의 미드저니 프롬프트가 있다.

- 규격 `--ar 16:5 --v 8.1`, **실사 포토리얼** 톤
- **밝기는 형용사가 아니라 조명 조건으로 지정** — `sunlit`·`golden` 은 실사에서
  미드저니가 황금빛 저녁 + 강한 역광으로 해석해 오히려 어두워진다.
  `natural soft diffused daylight` `bright overcast sky` `high-key exposure` 를 쓴다.
- 12장이 서로 닮지 않도록 각 프롬프트에 다른 챕터의 소재를 `NO ~` 로 배제
- **Lesson 8 은 실존 인물(Alfred Nobel)을 다루므로 인물 묘사 대신 사물·장소 중심**
  정물/실내로 구성했다(초상 방지).

> ⚠️ **문장 속 `NO xxx` 는 오히려 그 물건을 불러온다**(미드저니 인라인 NO 함정).
> 확실히 빼야 하는 요소는 `--no` 파라미터를 쓰는 편이 안전하다.

### 반영 상태 (2026-09-17)

**12장 전부 생성·반영 완료.** 합본 PDF 각 12~14MB.

원본은 `dist/{L}/{N}.png`(3952×1232, 장당 ~6MB)로 받아 두었고, 빌드가 읽는
위치인 `dist/{L}/assets/illust-{N}.png` 로 **가로 2000px 축소본**을 만들어 넣었다
(75MB → 21MB). 둘 다 `.gitignore` 대상이라 **저장소에는 없다** — 다른 PC 에서
빌드하려면 원본을 다시 받아 아래 축소 절차를 거칠 것.

```bash
# 원본 dist/{L}/{N}.png → 축소본 dist/{L}/assets/illust-{N}.png
python -c "
from PIL import Image; import os
for L in ['L6','L7','L8']:
    os.makedirs(f'dist/{L}/assets', exist_ok=True)
    for n in range(1,5):
        im = Image.open(f'dist/{L}/{n}.png')
        w = 2000; h = int(round(w*im.size[1]/im.size[0]))
        im.resize((w,h), Image.LANCZOS).save(f'dist/{L}/assets/illust-{n}.png', optimize=True)
"
```

생성한 이미지를 `dist/{L6,L7,L8}/assets/illust-{N}.png` 로 저장하고 분석지를 재빌드하면
반영된다. **이미지가 없어도 빌드는 성공**하므로(placeholder), 삽화 반영 여부는
반드시 확인할 것 — 아래가 전수 QC 한 줄이다.

```bash
python -c "
import fitz
for L,f in [('L6','목일중3_동아이병민_Lesson6_본문분석_합본.pdf'),
            ('L7','목일중3_동아이병민_Lesson7_본문분석_합본.pdf'),
            ('L8','목일중3_동아이병민_Lesson8_본문분석_합본.pdf')]:
    d = fitz.open(f'dist/{L}/{f}')
    ph = sum('삽화 영역' in p.get_text() for p in d)
    im = sum(len(p.get_images(full=True)) for p in d)
    print(L, 'placeholder', ph, '(0이어야)', '| 이미지', im, '(4여야)')
"
```

> ⚠️ **원본 8MB PNG 를 그대로 넣지 말 것.** 인쇄 폭이 180mm 이므로
> **가로 2000px 로 축소**하면 ~280dpi 로 육안 차이가 없다.

## 추가지문 EX — 7 Supplementary Reading 본문분석 (2026-10-07)

사용자가 촬영한 프린트 사진 2장(필기 포함)으로 만든 **본문분석 1권**.
`dist/EX/목일중3_추가지문_7_SupplementaryReading_본문분석.pdf` — 표지 1 + 본문 전문 1 + 분석 9 = **11p**.

| Ch | 지문 | 유형(원본 1번 문제) | 정답 | 문장 |
|----|------|--------------------|------|------|
| 1 | Lee Suji’s Comedy (동조 편향 · 사회적 비교 이론) | 문단 삽입 (A)~(D) 4지선다 | ③ (C) | 18 |

- **모의고사 분석지 규칙**: 1번 문제의 주어진 문단(Although these ideas …, 3문장)을 정답 위치 **(C)** 에 복원 →
  원문 13~15번. (A)~(D) 표시는 뺐다. 보기가 4개라 `verify.mjs` 의 EX 는 `nChoices: 4`.
- **필기 반영**: 밑줄·V/O/O.C 표시·화살표·괄호·여백 노트 → `[수업 필기]`, 2쪽 단어표 13개의 손글씨 뜻과
  영영 풀이 빈칸 → `[수업 단어표]`, 2쪽 문제 2~4 → `[프린트 문제 N]`(정답 ②·③·③ 근거 포함).
  필기 "help 목적어 to V" 는 본문이 동사원형(think)이라 **help + 목적어 + (to) V** 로 바로잡았다.
- **인쇄본 표기 그대로**: 16번 `carefuliy`(인쇄 오타 — 카드 해석 도움에 바른 철자 carefully 명시).
  직선따옴표는 곱슬따옴표로, 띄어 쓴 대시(everything – even / behaviors – wasting)는 en dash 로 실었다.
- `styles/analysis.css` 에 봉영여중3 의 확장 글리프 보정(`% + = | ← × ○`, ▶ ✗)을 이식했다. ★ △ 는 쓰지 않는다(빈칸 렌더).

### 검수
- 전사 경로 2개: `_PDF-RAW-EX.txt`(인쇄 줄 그대로) → `_gen-textbook-EX.mjs` 기계 분할 vs `_SOURCE-EX.js` 손 분할.
  `_xcheck-EX.mjs` 문자 단위 대조 18문장 1,773자 오류 0, `--pdf` 로 합본에 전 문장 ≥2회 수록 확인.
- `verify.mjs EX` 오류 0(경고 2 = 단어표의 parody·consumer 가 본문에 없음 — 의도) · overflow 0.
- **삽화 반영(2026-10-07)** — 원본 `dist/EX/1.png`(3952×1232)를 가로 2000px 로 줄여 `dist/EX/assets/illust-1.png` 에 넣고 재빌드.
  placeholder 0 · 이미지 1 · overflow 0 · 합본 4.1MB. 원본·축소본 모두 gitignore(저장소에 없음).
- **원본 사진 재검수(2026-10-07)** — 사진을 구역별로 확대해 인쇄 30줄을 합본 본문과 단어·구두점 단위로 육안 재대조 — 누락·오류 0.
  자동 대조: 18문장 전부 합본에 3회(본문 전문·PASSAGE·분석 카드), 해석 전수 ≥4회.

### 본문암기 (2026-10-07)
`dist/EX/목일중3_추가지문_7_SupplementaryReading_본문암기.pdf` — 표지 1 + 문제 2(`qSplit [9, 9]`) + 정답 1 = **4p**, 18문항(주어진 문단 3문장 포함).
`build-memorize.mjs` 의 EX 는 표지·머리말 문구를 `examTag/coverTitle/coverSub/docTitle` 로 덮어쓴다.
검수: `python _memaudit-extract.py EX && node _memaudit.mjs EX` — 18문장 전수 수록(공백 외 정규화 없이도 18/18 일치).

### 빌드
```bash
cd mock-exam-analysis
D=_oneoff-목일중3-동아이
(cd $D && node _gen-textbook-EX.mjs && node _author-EX.mjs && node verify.mjs EX && node _xcheck-EX.mjs)
node builder/build.mjs "$D/data/EX" "$D/dist/EX" --styles="$D/styles/analysis.css"
node builder/check-overflow.mjs "$D/dist/EX/1.html"   # overflow 0
node builder/pdf.mjs "$D/dist/EX"
node $D/combine.mjs EX
node $D/build-memorize.mjs EX
(cd $D && python _memaudit-extract.py EX && node _memaudit.mjs EX)
```

## 추가지문 EX2 — Unit 8 Supplementary Reading 본문분석 + 본문암기 (2026-10-08)

사용자가 촬영한 프린트 사진 2장(필기 포함, 1쪽 지문·문제 1~2 / 2쪽 문제 3·단어표 14개)으로 만들었다.

| 산출물 | 구성 |
|--------|------|
| `dist/EX2/목일중3_추가지문2_Unit8_SupplementaryReading_본문분석.pdf` | 표지 1 + 본문 전문 1 + 분석 9 = **11p** |
| `dist/EX2/목일중3_추가지문2_Unit8_SupplementaryReading_본문암기.pdf` | 표지 1 + 문제 2(`qSplit [11, 10]`) + 정답 1 = **4p**, 21문항 |

- 원문 **21문장**(5문단 4·4·5·5·3), 분석 카드 15개, 어휘 30개(INTRO 표에는 삽화 자리 보호로 18개 —
  **선생님 단어표 14개를 맨 앞에** 두어 전부 노출, 나머지는 카드 어휘 Point 에 있음).
- 문제: 1번 제목 **A**(choices 에 기록, hide_answer 라 미인쇄) · 2번 **B** · 3번 요약문 빈칸 **③ challenges** →
  각각 `[프린트 문제 N]` 으로 근거 문장 카드에 실었다.
- **필기 반영**: 1쪽 형광펜·밑줄·괄호·①② 병렬 표시·여백 뜻(be woven into, engage in, free from, Consequently 등) → `[수업 필기]`,
  2쪽 단어표 손글씨 뜻·영영 풀이 빈칸 → `[수업 단어표]`. 필기 "free from: ~로부터 해방되다" 는 형용사구 뜻(~이 없는)을 함께 적었다.
- 띄어 쓴 대시(experiences – including / relationships – with)는 EX 와 같이 en dash. 인쇄 오탈자 없음.
- `_gen-textbook-EX.mjs` · `_xcheck-EX.mjs` 는 이제 **과 id 인자**를 받는다(`EX` 기본, `EX2`). EX 산출물은 변화 없음(재생성 diff 0).

### 검수
- `_xcheck-EX.mjs EX2 --pdf`: RAW 기계 분할 ↔ 손 분할 정본 문자 단위 21문장 2,212자 오류 0, 합본 전 문장 ≥2회.
- `verify.mjs EX2` 오류 0 · 경고 0 · overflow 0 · `_memaudit EX2` 21문장 전수 수록.
- 삽화: `_ILLUSTRATION_PROMPTS-EX2.md` 1장 — **아직 생성 전**(INTRO 에 placeholder).

### 빌드
```bash
cd mock-exam-analysis
D=_oneoff-목일중3-동아이
(cd $D && node _gen-textbook-EX.mjs EX2 && node _author-EX2.mjs && node verify.mjs EX2 && node _xcheck-EX.mjs EX2)
node builder/build.mjs "$D/data/EX2" "$D/dist/EX2" --styles="$D/styles/analysis.css"
node builder/check-overflow.mjs "$D/dist/EX2/1.html"
node builder/pdf.mjs "$D/dist/EX2"
node $D/combine.mjs EX2
node $D/build-memorize.mjs EX2
(cd $D && python _memaudit-extract.py EX2 && node _memaudit.mjs EX2)
```
