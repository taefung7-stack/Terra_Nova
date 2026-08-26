# 변형문제 검수 보고서 — 신서고 부교재 EX / EX2

- **관점**: 변형문제 정답 유일성 · 해설 정확성
- **대상**: `data/EX/{1,2,3,4}-variant.json`, `data/EX2/{1,2,3,4}-variant.json` (8파일)
- **원문 정본**: `_SOURCE-EX.js`, `_SOURCE-EX2.js`
- **범위**: 8파일 × (객관식 11유형 + 서술형 6) = **136문항 전수**
- **검수일**: 2026-08-26

## 요약

| 등급 | 건수 |
|---|---|
| 차단 (BLOCKER) | **1** |
| 권고 (MAJOR) | **3** |
| 경미 (MINOR) | **2** |
| **합계** | **6** |

객관식 88문항의 정답 키는 **1건(EX/3 implication)을 제외하고 모두 유일**하게 성립한다.
서술형 48문항은 전량 이상 없음.

---

## 차단 (BLOCKER)

### B-1. `data/EX/3-variant.json` · `by_type.implication` · 현재 answer=1

**문제** — 밑줄 문장의 지시사 `these events` 가 가리킬 선행사가 밑줄 시점에 아직 등장하지 않는다.
변형 지문이 원문의 문장 순서를 뒤집어, **문제를 푸는 근거 자체가 밑줄보다 뒤에 놓였다.**

**근거** — 변형 지문 배열:

```
(2) A year seems to hold 365 days, but Earth takes about 365.2421 days to orbit the sun.
(3) Without leap years to keep the calendar in check, these events would gradually drift away
    from their intended time of celebration.        ← 밑줄 문장. "these events" 선행사 없음
(4) Holidays and cultural celebrations are often tied to a specific season or date.
                                                     ← 선행사가 여기서야 나옴
```

원문(`_SOURCE-EX.js`)은 순서가 정반대다.

```
"Additionally, many holidays and cultural celebrations are linked to specific seasons or dates.",
"Without leap years to keep the calendar in check, these events would gradually drift away
 from their intended time of celebration.",
```

정답 ① "Festivals would slowly fall on dates that no longer match their original season." 은
`these events` = 명절·문화 행사라는 연결에 전적으로 의존한다. 그 연결이 끊겨 있으므로
학생은 밑줄 시점에서 ①을 근거로 고를 수 없다(뒤 문장을 먼저 읽어야만 풀린다).

**수정안** — `passage` 의 인덱스 3 과 4 를 맞바꿔 원문 순서를 복원한다.

```json
"passage": [
  "Every four years, a twenty-ninth day is added to February.",
  "This day, called Leap Day, keeps our calendar and our seasons in line with each other.",
  "A year seems to hold 365 days, but Earth takes about 365.2421 days to orbit the sun.",
  "Holidays and cultural celebrations are often tied to a specific season or date.",
  "Without leap years to keep the calendar in check, these events would gradually drift away from their intended time of celebration.",
  "A harvest festival could slowly slide toward the middle of summer.",
  ...
]
```

`underlined` 값은 그대로 두면 된다(문자열 일치는 유지됨).

---

## 권고 (MAJOR)

### M-1. `data/EX/3-variant.json` · `by_type.order` · 현재 answer=4 — 해설 날조 인용

**문제** — `explanation_ko` 와 `distractor_ko` 가 블록 (A)의 연결사로 **`Additionally`** 를 인용하는데,
문항 어디에도 그 단어가 없다. 블록 (A)의 실제 첫 단어는 `Besides that` 이다.

**근거**

```
BLOCK A: "Besides that, countless holidays and cultural celebrations are linked to
          specific seasons or dates. ..."
EXP:  "... → 'Additionally' 로 이어지는 두 번째 문제인 명절(A) 순이 자연스럽다."
DIS:  "... (A)의 'Additionally' 는 앞에 이미 하나의 문제가 제시되어야 성립하므로 ..."
```

문항 전체 문자열에 `Additionally` 는 **0회** 등장(원문 `_SOURCE-EX.js` 의 표현이 해설에만
그대로 남은 것). 학생이 해설이 지목한 단서를 지문에서 찾을 수 없다.

**정답 키 자체는 정상** — ④ (B)-(C)-(A) 는 유일하게 성립한다.
(C)의 `that addition` 이 (B)의 "하루 추가"를 받고, (A)의 추가 연결사는 앞선 문제 제시를 요구한다.

**수정안** — 해설의 `'Additionally'` 두 곳을 모두 `'Besides that'` 으로 교체.

---

### M-2. `data/EX/2-variant.json` · `by_type.title` · 현재 answer=1 — 정답 길이 과다

**문제** — 정답 ①만 60자, 오답 4개는 41–45자(평균 42.5자). **비율 1.41배.**
학생이 내용을 읽지 않고 "가장 긴 것"으로 찍을 수 있다.

**근거**

```
1. (60자) One Rule, Two Outcomes: The Double Life of Negative Pressure   ← 정답
2. (41자) Cleaning Up Oil Spills on the Ocean Floor
3. (45자) How Cities Find Fresh Groundwater Underground
4. (42자) Why Every Pipe Should Be Sealed Completely
5. (42자) The Invention of the Modern Pressure Gauge
```

정답만 콜론(`:`)을 포함한 2부 구조라 시각적으로도 혼자 튄다.

**수정안** — 정답을 오답 길이대(40자대)로 간결화. 예:
`"The Two Faces of Negative Pressure"` 또는 `"Negative Pressure: Helper and Hazard"`.

---

### M-3. `data/EX/4-variant.json` · `by_type.gist` · 현재 answer=1 — 정답 길이 과다

**문제** — 정답 ①만 43자, 오답 4개는 29–30자(평균 29.8자). **비율 1.45배.**

**근거**

```
1. (43자) 구조된 야생 동물이 은인에게 놀라울 만큼 오래 이어지는 유대를 보이기도 한다.   ← 정답
2. (29자) 펭귄은 인간의 도움 없이는 야생에서 살아남기 어렵다.
3. (30자) 야생 동물은 한번 사람 손을 타면 이주 능력을 잃는다.
4. (30자) 해양 오염을 막으려면 어민들의 협조가 반드시 필요하다.
5. (30자) 번식기의 펭귄은 무리를 떠나 홀로 지내는 습성이 있다.
```

**수정안** — 수식어(`놀라울 만큼 오래 이어지는`)를 줄여 30자대로 맞춘다. 예:
`"구조된 야생 동물이 은인에게 오래 이어지는 유대를 보이기도 한다."` (33자)

---

## 경미 (MINOR)

### N-1. `data/EX2/4-variant.json` · `by_type.vocab` · 현재 answer=5 — 변형 지문의 원문 왜곡

**문제** — 어휘 문항을 만들려고 원문에 없던 동사 자리를 새로 만들었다.

**근거** — 원문(`_SOURCE-EX2.js`)은 `predict` 하나가 `as well as` 로 두 목적어를 지배한다.

```
"The engineers believe plants have the ability to predict upcoming droughts,
 as well as more subtle changes in soil and water, as they grow."
```

변형 지문은 이를 등위 동사 2개로 쪼갰다.

```
(5) "The engineers believe plants can predict droughts and conceal subtle changes in soil and water."
```

`fix: "reveal"` 은 원문에 존재하지 않는 동사를 복원하는 셈이다.
**정답 키는 유효**(`conceal` 이 문맥상 유일하게 부적절하고 ①~④는 모두 적절)하므로
정답 오류가 아니라 원문 충실도 문제다.

**수정안** — `as well as` 구조를 살리고 다른 단어를 출제하거나,
쪼갠 구조를 유지하되 두 번째 동사를 원문 의미에 맞게 `reveal` 로 확정한 뒤 다른 밑줄을 정답으로 삼는다.

---

### N-2. `data/EX/3-variant.json` · `by_type.writing[0]` (word_order) — 토큰 분리 주의

**문제** — `words[]` 에 `"365.2421"` 이 한 덩어리로 들어 있다. 렌더러나 채점 스크립트가
마침표를 토큰 경계로 처리하면 `365` / `2421` 두 조각으로 깨질 수 있다.

**근거**

```json
"words": ["it","actually","takes","Earth","about","365.2421","days","to","orbit","the","sun"]
"answer": "It actually takes Earth about 365.2421 days to orbit the sun."
```

배열 자체는 정확히 일치한다(단어 과부족 없음). 렌더링 단계의 잠재 위험만 해당.

**수정안** — 현행 유지 가능. 배열 카드 렌더링 시 `365.2421` 이 한 카드로 나오는지 육안 확인.

---

## 이상 없음으로 확인된 항목

- **정답 유일성** — 위 B-1 을 제외한 객관식 87문항 전부 정답이 유일하게 성립.
- **어법(grammar) 8문항** — 파일마다 밑줄 5개를 하나씩 개별 검증한 결과,
  `correct:false` 로 표시된 것 **하나만** 어법상 틀리고 나머지 4개는 모두 정상.
  주요 확인: EX/1 ④ `for the plant beginning`→`to begin` (나머지 `act`/`trapping`/간접의문문/`wastes` 정상),
  EX/2 ⑤ `a system ... are used`→`is used` (주어 핵 `a system` 단수),
  EX/3 ③ `will occur`→`would occur` (Without 가정법; 7번 문장 `would ... drift` 와 병행),
  EX/4 ⑤ `only returning`→`only to return` (결과의 to부정사),
  EX2/1 ④ `makes`→`make` (`both A and B` 복수 취급, 원문도 `make`),
  EX2/2 ③ `taking`→`to take` (목적의 to부정사),
  EX2/3 ⑤ `testing`→`test` (`allow ... to conduct and test` 병렬),
  EX2/4 ④ `send`→`to send` (`cause + O + to V`).
- **어휘(vocab) 8문항** — 키 단어만 문맥상 부적절, 나머지 4개 적절성 확인.
- **순서(order) 8문항** — 대명사·지시어·연결사 사슬로 키가 유일하게 결정됨을 역순 검증으로 확인.
  EX2 4파일이 모두 answer=1 인 것은 **설계 결과이지 결함이 아님** —
  각 파일에서 (A)-(B)-(C) 가 조응 관계로 강제된다.
- **문장삽입(insert) 8문항** — `slot_after` 1~5 정상, 주어진 문장의 지시어가 받는 대상으로 키 확정.
- **요약(summary) 8문항** — `options[answer-1]` 의 (A)/(B) 쌍이 `summary_template` 에 정확히 대응하고,
  나머지 4쌍은 최소 한 칸에서 탈락하는 정상 2×격자 구성. 중복 쌍 없음.
- **해설 날조·문장번호 오지정** — 전 문항의 `explanation_ko`/`distractor_ko` 를 각 문항 지문과
  기계 대조. **M-1(EX/3 order) 1건 외에 날조 인용 없음**, 문장·선택지 번호 오지정 **0건**.
- **서술형 48문항** — `word_order` 8문항은 `words[]` 다중집합과 `answer` 토큰이 정확히 일치
  (과부족 0). `conditioned_write` 의 `conditions` 는 모두 `answer` 가 충족.
  `fill_blank`/`translate_ko`/`summary_word`/`topic_write` 의 프롬프트–정답 대응 정상.
- **정답 길이 균형** — M-2·M-3 외에 1.4배를 넘는 문항 없음.

## 검수 방법

기계 대조(스크립트 전수): `underlines[].text` 의 지문 실재 여부 및 `sent_index` 정합,
`implication.underlined` 실재 여부, `blank_sentence_index` 범위·빈칸 마커 유일성,
`order.blocks` 키/선택지 순열 유효성·중복, `insert.passage_marked[].slot_after` 연속성,
`summary_template` 의 `__(A)__`/`__(B)__` 마커 및 옵션 쌍 중복, 5지 선다 길이비(정답/오답평균),
`writing.word_order` 의 `words[]`↔`answer` 다중집합 일치,
해설 내 영어 인용구의 지문 실재 여부.
이후 136문항을 실제로 풀어 정답 유일성을 사람이 판정.
