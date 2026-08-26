# 워크북 문항 검수 — 신서고 부교재 EX / EX2

**관점**: 워크북 문항 정답·풀이 가능성
**대상**: `data/EX/{1,2,3,4}-workbook.json`, `data/EX2/{1,2,3,4}-workbook.json` (8개 파일 / 총 587문항)
**정본 대조**: `_SOURCE-EX.js`, `_SOURCE-EX2.js`, `data/{EX,EX2}/{n}.json`
**빌더 대조**: `mock-exam-analysis/builder/build-workbook.mjs`
**검수일**: 2026-08-26

---

## 요약

| 등급 | 건수 |
|---|---|
| **차단 (BLOCKER)** | **4** |
| 권고 (MAJOR) | 3 |
| 경미 (MINOR) | 3 |

기계 검사 전수 통과 항목: jumble 단어집합 정합(30문항 전건 일치), fill_first_letter 첫글자 정합(전건 일치),
ref_sentence 인덱스 범위(전건 유효), 양자택일 템플릿 blank↔answers↔explain 개수 정합(전건 일치),
mixed kind/ref 유효성(전건 유효), **빌더 고유명사 필터에 의한 문항 삭제 0건**.

---

## 차단 (BLOCKER) — 4건

### B-1. EX2/3 · grammar_choice no=4 — 시험의 정답(어법 오류)을 워크북이 "교정"해 버려 본문과 충돌

- **파일**: `data/EX2/3-workbook.json`
- **현재값**
  - 템플릿: `As the roller coaster car climbs up the track, gravity pulls your body downward, and you feel yourself {{1:pushed/pushing}} down on your seat.`
  - `answers: ["pushed"]`
  - explain: "지각동사 feel 의 목적어 yourself 가 '눌림을 당하는' 대상이므로 과거분사 pushed"
- **문제**
  EX2/3은 **어법 문제 지문**이고, `_SOURCE-EX2.js` 주석이 명시하듯 **③ `pushing` 이 곧 원문의 정답(= 틀린 것)** 이다.
  `data/EX2/3.json`의 `passage[3]`도 원문 그대로 `pushing` 을 보존하고 있다.
  그런데 워크북은 `pushed` 를 정답으로 제시한다. 빌더 기준 학생이 보는 지면에서 정면 충돌이 발생한다:
  - STEP 1(본문)·STEP 4(빈칸)·STEP 5(해석)·STEP 7(영작) → `data.passage` 를 그대로 출력 → **`pushing`**
  - STEP 2(어법 양자택일)·STEP 9(정답지) → 워크북 `answers` 출력 → **`pushed`**

  즉 같은 책 안에서 한 문장이 서로 다른 형태로 두 번 인쇄되고, 정답지는 본문에 없는 형태를 정답이라 한다.
  또한 STEP 7 통문장 영작의 정답은 `data.passage[2]`(=`pushing`)로 렌더되므로, 학생이 STEP 2에서 배운 `pushed` 로 쓰면 정답지와 불일치한다.
- **수정안**
  이 문장은 **양자택일 출제 대상에서 제외**한다(원문이 의도적 오류를 품은 문장이므로 어법 문항으로 쓸 수 없음).
  `grammar_choice no=4` 를 삭제하고 나머지 no를 재부여하거나, 같은 문장의 다른 어법 포인트
  (예: `{{1:climbs/climb}}` 주어 the roller coaster car 수일치)로 교체할 것.
  `vocab_choice no=3` 의 템플릿에 박혀 있는 `pushed` 도 함께 `pushing` 으로 되돌려 본문과 일치시켜야 한다.

### B-2. EX2/3 · vocab_choice no=3 — 비출제 구간에 교정형 `pushed` 가 박혀 본문과 불일치

- **파일**: `data/EX2/3-workbook.json`
- **현재값**: `As the roller coaster car {{1:climbs/dives}} up the track, gravity pulls your body downward, and you feel yourself pushed down on your seat.` / `answers: ["climbs"]`
- **문제**
  출제 대상(`climbs`)은 정확하지만, **빈칸이 아닌 고정 텍스트 부분**이 원문 `pushing` 을 `pushed` 로 바꿔 인쇄한다.
  학생은 STEP 1 본문에서 `pushing` 을, STEP 3에서 `pushed` 를 보게 되어 어느 쪽이 본문인지 알 수 없다.
  (B-1과 원인은 같으나, 이쪽은 정답 자체가 아니라 **지문 재현 오류**라 별건으로 분리.)
- **수정안**: 고정 텍스트를 원문대로 `pushing` 으로 되돌린다.

### B-3. EX2/4 · vocab_choice no=5 — 어휘 문제의 정답(`hide`)을 오답 보기로 뒤집어 정답이 반대가 됨

- **파일**: `data/EX2/4-workbook.json`
- **현재값**
  - 템플릿: `The goal of this study was to find out if spinach could {{1:detect/hide}} explosives, but the technology involved has broader potential.`
  - `answers: ["detect"]`
  - explain: "…hide(숨기다)는 글 전체 방향과 정반대다."
- **문제**
  EX2/4는 **어휘 문제 지문**이며 `_SOURCE-EX2.js` 주석대로 **③ `hide` 가 원문의 정답(= 문맥상 부적절한 낱말)** 이다.
  `data/EX2/4.json` `passage[4]`도 원문 그대로 `hide` 를 보존하고, `passage_ko[4]`는 이를
  `"…폭발물을 감지할(→숨길) 수 있는지…"` 로 표기해 **원문이 `hide`임을 명시**하고 있다.

  워크북은 이 관계를 뒤집어 `detect` 를 정답이라 한다. 결과적으로:
  - STEP 1 본문 = `hide`, STEP 3 정답 = `detect` → 한 책에서 정반대 인쇄
  - STEP 5 한글해석 정답지는 `passage_ko`("감지할(→숨길)")를 그대로 출력하는데,
    이 표기 자체가 "본문은 hide 다"라고 말하므로 **정답지끼리도 서로 모순**된다.
  - STEP 7 영작 정답은 `data.passage[4]`(=`hide`)로 렌더 → STEP 3에서 배운 `detect` 와 불일치.
- **수정안**
  이 문장은 **어휘 양자택일 출제에서 제외**한다. `vocab_choice no=5` 를 삭제하거나,
  같은 문장의 다른 낱말(예: `{{1:broader/narrower}} potential`)로 교체할 것.
  아래 B-4의 고정 텍스트 교정도 함께 수행해야 한다.

### B-4. EX2/4 · grammar_choice no=5, no=6 + fill_first_letter no=4 — `hide`→`detect` 개서가 본문·해석 3곳에 전파

- **파일**: `data/EX2/4-workbook.json`
- **현재값**
  - `grammar_choice no=5`: `The goal of this study {{1:was/were}} to find out if spinach could **detect** explosives, …`
  - `grammar_choice no=6`: `The goal of this study was to find out {{1:if/that}} spinach could **detect** explosives, …`
  - 위 두 건과 `fill_first_letter no=4` 의 `ko_full`:
    `"…시금치가 폭발물을 **감지할** 수 있는지…"` (원문 `passage_ko` 는 `"감지할(→숨길)"`)
- **문제**
  출제 포인트(`was`, `if`, `technology`)는 각각 어법상 정확하다. 그러나 **빈칸이 아닌 고정 텍스트**가
  원문 `hide` 를 `detect` 로 바꾸어 인쇄하고, `ko_full` 도 원문 표기의 `(→숨길)` 을 삭제했다.
  같은 문장이 STEP 1에서는 `hide`, STEP 2·3·4에서는 `detect` 로 최소 4회 상충 인쇄된다.
- **수정안**
  `grammar_choice no=5·no=6`, `vocab_choice no=5`, `fill_first_letter no=4` 의 고정 영문을 원문 `hide` 로 되돌리고,
  네 항목의 `ko_full` 을 `passage_ko[4]` 원문(`"…감지할(→숨길) 수 있는지…"`)과 일치시킨다.

> **B-1~B-4 공통 원인 및 재발 방지**
> EX2/3(어법)·EX2/4(어휘)는 **원문 자체가 의도적 오류를 포함한 지문**이다. 워크북 저작 시 그 오류를 "고쳐야 할 실수"로 오인해
> 정답 방향을 반대로 잡았다. 이런 유형(어법/어휘 밑줄 문제) 지문은 **오류가 박힌 문장을 양자택일 출제 대상에서 제외**하는 것을
> 원칙으로 삼아야 한다. 검증 자동화로는 `en_template` 에 `answers` 를 대입한 결과가 `passage[ref_sentence-1]` 와
> **완전 일치**하는지 확인하는 규칙을 verify 스크립트에 추가하면 4건 모두 자동 검출된다.

---

## 권고 (MAJOR) — 3건

### M-1. EX2 전 4파일 — 아포스트로피 문자 불일치(곡선 `’` vs 직선 `'`)로 본문 재현이 어긋남

- **파일**: `data/EX2/{1,2,3,4}-workbook.json` (총 23개 문항)
- **현재값**: 워크북은 곡선 아포스트로피 `’`(U+2019)를, 본문 JSON `passage` 는 직선 `'`(U+0027)를 사용.
  - EX2/1: grammar 6·9, vocab 2·5·6·9, jumble 2·5
  - EX2/2: grammar 4·7·8, vocab 3·4·5·6, jumble 2
  - EX2/3: grammar 1·2, vocab 1·2
  - EX2/4: grammar 1, vocab 1, jumble 4
- **문제**
  STEP 1 본문은 직선(`joke's`, `radio's`, `planet's`, `didn't`, `you're`)으로, STEP 2/3/6/9는 곡선(`joke’s`, `radio’s`…)으로 인쇄된다.
  같은 문장이 책 안에서 두 가지 표기로 나타나며, jumble 정답지(STEP 9)는 곡선을 출력하는데
  STEP 7 영작 정답지는 `data.passage` 직선을 출력해 **정답지 내부에서도 표기가 갈린다**.
  풀이 자체는 가능하므로 차단은 아니나, 인쇄물 품질 결함이다.
  (EX 4파일은 전부 직선으로 일관되어 문제없음.)
- **수정안**: EX2 워크북 4파일의 `’` 를 일괄 `'` 로 치환해 `passage` 와 통일한다.

### M-2. EX2/1 · jumble no=5 / grammar_choice no=9 / vocab_choice no=9 — 빈칸(`____`)이 남은 문장을 출제 대상으로 사용

- **파일**: `data/EX2/1-workbook.json`
- **현재값**
  - `jumble no=5`: `answer = "This highlights laughter’s ________________ nature."`, `words` 에 `________________` 토큰 포함
  - `grammar_choice no=9`: `This highlights {{1:laughter’s/laughters}} ________________ nature.`
  - `vocab_choice no=9`: `This {{1:highlights/hides}} laughter’s ________________ nature.`
- **문제**
  EX2/1은 **빈칸추론 지문**이라 `passage[10]` 이 밑줄 빈칸을 그대로 보존한 미완성 문장이다.
  이를 배열(STEP 6) 문항으로 쓰면 학생은 `________________` 라는 의미 없는 토큰을 단어 카드처럼 배열해야 하며,
  정답 문장도 빈칸이 남은 채로 제시된다. 어법·어휘 문항 역시 빈칸이 낀 문장을 읽게 된다.
  (기계적으로는 words↔answer가 일치하므로 자동 검출되지 않음.)
- **수정안**
  `jumble no=5` 는 삭제하고 다른 문장(예: 미사용 문장 1·2·7·8·9·10 중 하나)으로 교체한다.
  grammar/vocab no=9 는 유지 가능하나, 빈칸 표시를 `(빈칸)` 같은 식자 처리로 바꾸거나 역시 다른 문장으로 옮기는 편이 안전하다.

### M-3. EX2 4파일 — 섹션별 본문 커버리지 편차가 커서 특정 문장이 전혀 연습되지 않음

- **파일**: `data/EX2/{1,2,3,4}-workbook.json`
- **현재값**(미커버 문장 번호)

  | 파일 | jumble | sentence_translation | vocab_choice |
  |---|---|---|---|
  | EX2/1 (11문장) | 1,2,7,8,9,10 미커버 | 1,3,4,6,11 미커버 | 1,2,5,9 미커버 |
  | EX2/2 (6문장) | 2,5,6 미커버 | 2,5 미커버 | 1,4 미커버 |
  | EX2/3 (7문장) | 1,3,6,7 미커버 | 1,4,6 미커버 | 2 미커버 |
  | EX2/4 (8문장) | 2,5,6,7 미커버 | 2,6,7 미커버 | 3 미커버 |

- **문제**
  EX 4파일은 `_note` 에 "본문 N문장 풀커버"라 적힌 대로 6개 섹션 전부가 전 문장을 1:1로 덮는다.
  반면 EX2는 jumble이 3~5문항에 그쳐 본문 절반 이상이 배열 연습에서 빠진다.
  풀이 불가 결함은 아니나 EX 대비 학습량·구성 일관성이 떨어진다.
- **수정안**: EX2 jumble/sentence_translation 문항을 보강해 EX와 같은 풀커버로 맞추거나,
  의도된 축소라면 각 파일 `_note` 에 커버리지 정책을 명시한다.

---

## 경미 (MINOR) — 3건

### N-1. EX/2 · fill_first_letter no=1 — `pressure` 가 문장에 2회 등장, 첫 번째만 빈칸 처리됨

- **파일**: `data/EX/2-workbook.json`
- **현재값**: ref_sentence 1 = `"Negative pressure" refers to a situation in which the pressure of an enclosed area is lower than that of the surrounding area.`
  힌트 answer 중 `pressure` 포함.
- **문제**: 빌더는 `new RegExp('\\bpressure\\b','i')` 로 **첫 매치만** 치환하므로 제목 인용부의 `"Negative pressure"` 쪽이 빈칸이 된다.
  학생이 인용 제목을 지운 문장을 보게 되어 단서가 약간 어색해지나, 뒤의 `the pressure of…` 가 그대로 남아 답 추론은 가능하다.
- **수정안**: 해당 힌트를 `surrounding` 또는 `enclosed` 등 1회만 등장하는 단어로 교체.

### N-2. EX/2 · voca_check.ko_to_en `enclosed` — 뜻풀이 어순이 본문 vocab 과 불일치

- **파일**: `data/EX/2-workbook.json`
- **현재값**: 워크북 `"밀폐된, 둘러싸인"` / `data/EX/2.json` vocab `"둘러싸인, 밀폐된"`
- **문제**: 의미는 동일하고 채점에 영향 없음. 단어장(STEP 1)과 어휘 확인 문항의 표기가 달라 보일 뿐.
- **수정안**: `data/EX/2.json` 쪽 표기로 통일.

### N-3. EX/4 · grammar_choice / vocab_choice — 4번 문장 미커버 + 7번 문장 중복 출제

- **파일**: `data/EX/4-workbook.json`
- **현재값**: 두 섹션 모두 ref_sentence = `[1,2,3,5,6,7,7]` (4번 누락, 7번 2회)
- **문제**: 4번 문장 `"Amazingly, though, Dindim returned!"` 는 4단어짜리 감탄문이라 양자택일 2개를 뽑기 어려워 건너뛴 것으로 보이며,
  대신 가장 긴 7번 문장을 두 번 활용했다. **의도된 설계로 판단**되며 풀이·정답에 문제 없음.
  다만 나머지 4개 섹션(fill/jumble/ko/sent)은 4번을 정상 커버하므로 섹션 간 문장 번호 대응이 어긋난다.
- **수정안**: 수정 불필요. `_note` 에 "4번 문장은 길이 부족으로 양자택일 제외" 를 명시하면 추후 오해를 막을 수 있다.

---

## 기계 검사 전수 통과 내역

아래 항목은 스크립트로 8개 파일 587문항 전건을 대조했고 **결함 0건**이다.

| 검사 | 방법 | 결과 |
|---|---|---|
| jumble 단어집합 정합 | `words[]` 다중집합 vs `answer` 토큰(구두점 제거) 비교 — 30문항 | 전건 일치. 누락·중복·여분 0 |
| jumble 정답 = 본문 문장 | `answer` vs `passage[ref-1]` 완전 일치 | EX 전건 일치 / EX2 3건은 아포스트로피 차이뿐(M-1) |
| fill 첫글자 정합 | `hints[].letter` 가 `answer` 첫 글자와 일치 | 전건 일치 |
| fill 정답의 본문 등장 | `answer` 가 `passage[ref-1]` 에 단어경계로 존재 | 전건 존재 |
| fill 정답 유일성 | 같은 첫글자·유사 길이 경쟁어 탐색 후 문맥 수동 판정 | 실질 중의성 0 (모두 연어·문맥으로 유일 결정) |
| ref_sentence 범위 | 1..문장수 이내 | 전건 유효 |
| mixed kind/ref | `kind` 6종 유효성 + `ref` 가 해당 섹션 `no` 에 존재 | 전건 유효 (`sent` 는 빌더 정식 kind) |
| 템플릿 정합 | blank 개수 = `answers` = `explain`, blank 번호 연속, 보기 2개, 정답이 보기에 포함 | 전건 일치 |
| **빌더 고유명사 오탐 삭제** | `buildProperNounSet` + `isEasyWord` 를 그대로 이식해 시뮬레이션 | **삭제 0건** (양자택일·빈칸 모두 무손실) |

### 빌더 고유명사 함정 — 이번 8개 파일은 안전

과거 사고(문두 대문자어를 고유명사로 오판해 문항이 조용히 삭제됨)를 재현하기 위해
`builder/build-workbook.mjs` 의 `buildProperNounSet()`·`isEasyWord()` 를 그대로 복사해 8개 파일에 적용했다.
**양자택일 삭제 0건, 빈칸 힌트 삭제 0건, 힌트 전멸(fallback) 0건**으로 전부 통과했다.

다만 구조적 위험은 남아 있다. 판정식이 `capCount[w] >= 1 && !lowCount[w]` 이므로
**본문에서 한 번이라도 대문자로 나오고 소문자로는 한 번도 안 나온 단어는 전부 고유명사로 간주**된다.
문두에만 등장하는 일반어(`Although`, `However`, `While`, `Once`, `Essentially`, `Amazingly` 등)가 여기에 해당한다.
이번 파일들이 무사한 것은 그런 단어를 **정답 토큰으로 쓰지 않았기** 때문이지, 빌더가 안전해서가 아니다.

- 관련 관찰: `EX2/4 grammar_choice no=7` 은 `{{1:It/That}}` 이 **문장 맨 앞**에 온다.
  정답 `It` 은 2자라 `isEasyWord`(4자 이하) 대상이지만 이 필터는 빈칸(fill)에만 적용되고
  양자택일에는 고유명사 필터만 걸리므로 현재는 삭제되지 않는다.
  본문에 `It` 이 문두로만 등장하고 소문자 `it` 이 함께 등장하므로 `lowCount` 덕에 살아남은 것 —
  **소문자 등장이 없었다면 이 문항은 조용히 사라졌을 것**이다.
- **권고**: 향후 저작 시 정답 토큰을 문장 첫 단어로 두지 말 것. 빌드 후 반드시
  **저작 문항 수 = 렌더 문항 수** 를 대조할 것.

---

## 검수 도구

- 기계 대조 스크립트(1회성): jumble 다중집합·fill 첫글자·ref 범위·템플릿 재구성 대조
- 빌더 필터 시뮬레이터(1회성): `buildProperNounSet` / `isEasyWord` 이식 후 삭제 문항 추적
- 의미 판정: `grammar_choice` / `vocab_choice` 전 118문항의 보기 쌍과 explain 을 수동으로 풀이 대조
