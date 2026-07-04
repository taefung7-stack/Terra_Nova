# 2026-07 초등(Mars 초5 · Venus 초6) 전수 검수 리포트

- 검수일: 2026-06-29
- 대상: `content/mars/passages/2026-07/01~20.json` (20) + `content/venus/passages/2026-07/01~20.json` (20) = **40지문**
- 방법: 멀티에이전트 4관점(언어·해설·번역·정답) 통합 검수 → 원시 결함 **26건** → **소스 대조 수작업 적대검증**으로 REAL/FALSE 분류
  - (주의) `validate-content.mjs --profile elementary`는 고등 스키마 파생이라 40지문 전부 FAIL이 뜨지만 이는 스키마 불일치이지 내용 결함 아님 — 내용 검수는 본 리포트 기준.
  - 검증은 외부제보 intake 원칙대로 진행: `<blank>` cloze는 정상, PDF 아닌 **소스 JSON**으로 대조.

## 요약

| 구분 | 차단 | 권고 | 경미 | 합계(REAL) |
|---|---|---|---|---|
| Mars(초5) | 1 | 4 | 6 | 11 |
| Venus(초6) | 0 | 0 | 5 | 5 |
| **합계** | **1** | **4** | **11** | **16** |

- 원시 26건 중 **REAL 16 / FALSE 1 / 등급강등·중복 통합 9**.
- **FALSE 1건**: venus-02 크로스워드 "plains 칸 부족" → 실제 그리드는 6×6이고 down-1 plains(6글자)에 세로 6칸 정확히 존재. 오탐(검수자 칸 누락 오독).

---

## 🔴 차단 (판매 전 반드시 수정) — 1건

### MARS-09 · page3 문장/번역 2개 누락 (번역)
- 본문 page1.body는 **18문장**인데 `page3.sentences`는 16개, `translation_ko`도 `[1]~[16]`뿐.
- 누락 문장:
  1. `Mina felt better.` (B15)
  2. `When we respect others, they feel safe with us.` (B17)
- 특히 (2)는 **Q4(school_descriptive) (B) `respect`의 정답 근거 문장**(template: "When we ___ others, they feel safe with us")인데 구문분석·번역에 없음.
- 규칙 위반: `[n] 마커 개수 = 본문 문장 수`.
- **수정**: page3.sentences에 두 문장 segments+translation_partial 추가, translation_ko를 `[1]~[18]`로 재번호.

---

## 🟡 권고 (품질 저하, 판매는 가능) — 4건

### MARS-02 · fill_blank_bank items[3] "rule" → 비문 (정답/해설)
- `"Another country ___ the land for many years." + "rule"` → "Another country **rule** the land"(주어-동사 시제 불일치). 본문은 `ruled`.
- **수정**: word_bank·answer를 `ruled`로, 또는 문장을 시제 없는 형태로.

### MARS-07 · fill_blank_bank items[3] "soldier" → 수 불일치 (정답)
- `"___ fell, and many homes burned." + "soldier"` → "**Soldier** fell". 본문은 `Soldiers fell`.
- **수정**: 문장을 `A ___ fell...`(단수표제어 유지) 또는 본문대로 복수 `Soldiers`.

### MARS-17 · fill_blank_bank items[0] "skyscraper" → 수 불일치 (정답)
- `"Today, tall ___ fill the cities." + "skyscraper"` → "tall **skyscraper** fill"(주어-동사 불일치). 본문은 `skyscrapers fill`.
- **수정**: word_bank·answer를 `skyscrapers`로, 또는 문장을 단수 `a tall ___ fills the city`로.

### MARS-12 · school_descriptive (B) 정답 비유일 (정답)
- template: "In 1960, the unfair ___ (B) made students raise their voices" / model_answer `(B) vote`.
- 그러나 본문엔 `the unfair **leader** had to step down`이 실제 등장(="unfair vote"는 본문에 없음). 학생이 `leader`를 써도 정답이 되어 유일정답 아님.
- **수정**: 문장을 vote가 유일정답이 되게 특정(예: "the unfair vote in the election") 하거나 leader 허용 명시 + blank_breakdown 근거 교체.

---

## 🟢 경미 (사소 — 시간 되면 정리) — 11건

| ID | 위치 | 내용 |
|---|---|---|
| MARS-02 | fbb items[2] | `"bell" → "bell rang"` 단수+무관사 비문(본문 `Bells rang`). 문두 소문자 `bell`도 부적절 |
| MARS-03 | Q2 explanation | 본문 인용 부정확: "Now both bottoms" → 실제 "and now both bottoms" (정답은 옳음) |
| MARS-03 | page3 s[2] | 의문사구 `How much`를 M으로 태깅(엄밀히 목적량). 초5 단순화로 허용 가능 |
| MARS-09 | page3 s[11] | `care about other people` 번역 '다른 사람을' → '다른 사람에게'가 자연스러움 |
| MARS-09 | page3 s[14] | `still`을 목적어 뒤 M으로 배치(어순 `he still tried`와 불일치) |
| MARS-09 | Q1/Q3 | 두 객관식이 같은 표현 `walk in someone's shoes` 의미를 중복 평가 |
| MARS-11 | Q-sd / Q1 / vocab heat | 본문 인용에서 `sweet`/`tiny` 누락("a sweet solution"→"a solution", "the tiny bits"→"the bits") |
| MARS-11 | vocab drop synonyms | `drop(방울)`의 동의어 `bit(조각)` 의미 상이 — 교체/삭제 권장 |
| MARS-12 | page3 s[4] | be동사 `were`를 '했어'로 번역(다른 be동사 문장 '~였어/이었어'와 불일치) |
| MARS-14 | vocab member synonyms | `member(구성원)` 동의어 `part(부분/역할)` 의미 상이 — 교체/삭제 권장 |
| MARS-14 | page3 s[13] | 본문 `must also take care of`의 `also`가 segments에서 누락(번역엔 '또한' 있음) |

### Venus 경미 (5건)
| ID | 위치 | 내용 |
|---|---|---|
| VENUS-01 | page3 s[10] | `can also make`의 `also` 세그먼트 위치가 본문 어순과 어긋남 |
| VENUS-06 | page3 s[7] | `and that is how a lens works` 독립절을 앞 절 보어(C)로 태깅 |
| VENUS-06 | page3 s[3] | `plays a trick`를 통째로 V 태깅(V+O 미분리) |
| VENUS-08 | page3 s[5] | 존재구문 `There are`의 동사를 M으로 태깅 |
| VENUS-12 | page3 [4]/[13] | `huge`를 '넓은'으로(vocab는 '거대한'과 불일치), `grow together`를 '자라'로 직역 |

> VENUS-04(hints에 정답 truth·trust 노출)는 빈칸완성형 규칙상 정상이므로 결함 제외(난도 조정 권장 수준).

---

## 패턴 메모 (다음 달 저작 시 예방)
1. **fill_blank_bank 수/시제 일치**: word_bank 표제어(단수·원형)를 본문 복수·과거 문장 빈칸에 넣으면 비문. 문장을 표제어형에 맞추거나 정답을 본문 굴절형으로.
2. **page3 문장 수 = 본문 문장 수 = [n] 마커 수**: 본문 문장을 빠뜨리지 말 것(특히 서술형 정답 근거 문장).
3. **해설 직접인용은 본문 글자그대로**: sweet/tiny/and 등 단어 누락 금지(의역이면 따옴표 빼기).
4. **vocab synonyms 의미 정합**: drop≠bit, member≠part 등 표제어와 동의관계 아닌 단어 금지.
5. **서술형 빈칸 유일정답**: 본문에 정답 후보가 둘 이상이면(leader vs vote) 문장을 특정하거나 복수정답 허용 명시.
