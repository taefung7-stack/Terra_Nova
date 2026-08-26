# EX 본문분석지 4지문 — 정답·해설 정확성 검수

- 대상: `data/EX/{1,2,3,4}.json` (본문분석지)
- 정본: `_SOURCE-EX.js`
- 관점: 정답 타당성 / 오답 해설 / sentences.note·points / summary·main_idea·title·flow / vocab
- 검수일: 2026-08-26

## 집계

| 등급 | 건수 |
|---|---|
| 차단 (BLOCKER) | 3 |
| 권고 (MAJOR) | 5 |
| 경미 (MINOR) | 4 |
| 합계 | 12 |

구조 무결성(`verify-EX.mjs`)은 **오류 0 / 경고 0** 통과 — 본문 verbatim 일치, 해석 누락 0, covers 전수 커버, vocab·flow 존재는 모두 정상. 아래 결함은 그 검증이 잡지 못하는 **내용 층위**의 문제다.

---

## ⚠️ 검수 전제 — 이 4개 JSON은 "제목 문제" 데이터다

먼저 반드시 짚어야 할 대전제가 있다. **의뢰서에 적힌 예상 정답(①어휘 meaningful / ②문장삽입 4번 / ③요지 ⑤ / ④순서 (C)-(A)-(B)=④)은 이 JSON 파일들 안에 아예 존재하지 않는다.**

4개 파일 전부 `choices[]`가 원문 유형의 선택지가 아니라 **영어 제목 5개**로 채워져 있다.

| 파일 | `type` | `question_text` | 실제 `choices` 내용 | `correct:true` |
|---|---|---|---|---|
| 1.json | 어휘 | 밑줄 친 부분 중 낱말의 쓰임이 적절하지 않은 것은? | 영어 제목 5개 | ③ The Plant That Counts Before It Eats |
| 2.json | 문장삽입 | 주어진 문장이 들어가기에 가장 적절한 곳은? | 영어 제목 5개 | ① Negative Pressure: A Safeguard and a Hidden Risk |
| 3.json | 요지 | 다음 글의 요지로 가장 적절한 것은? | 영어 제목 5개 | ④ Leap Day Keeps the Calendar in Step with the Seasons |
| 4.json | 순서 | 이어질 글의 순서로 가장 적절한 것은? | 영어 제목 5개 | ② A Rescued Penguin That Keeps Coming Back |

동시에 **4개 파일 모두 `hide_answer: true`** 이고, `builder/build.mjs`의 `buildAnswerBlock()`은 첫 줄에서 이렇게 끊는다.

```js
if (data.hide_answer) return '';
```

실제 산출물로 확인했다. `dist/EX/{1,2,3,4}.html` 에서 `ANSWER · 정답` 문자열은 **4개 파일 모두 0회** 등장한다. 즉 `choices[]` 배열은 **렌더되지 않는 죽은 데이터(dead data)** 다. 1.html 에 보이는 "The Plant That Counts…"는 `choices[2].en`이 아니라 별도 필드인 `title_en` 이 출력된 것이다(`build.mjs:135`, `:1143`).

**이 사실이 등급 판정을 좌우한다.**

- 제목 선택지의 정답성 자체는 학생에게 **노출되지 않으므로**, 그것만으로는 "학생이 틀리게 배운다"에 해당하지 않는다 → 차단이 아니라 **권고**.
- 반면 `passage_ko` · `sentences.ko_full` · `note` · `paraphrasing` 처럼 **실제로 렌더되는** 필드의 오류는 그대로 학생에게 전달된다 → **차단**.

참고로, 제목 5지선다 자체의 내적 타당성은 4개 모두 **정답이 유일하고 오답 4개가 모두 배제 가능**하도록 잘 설계되어 있다(지엽/확대/반대/무관의 4유형 배치). 정답 선택 자체는 오류가 없다. 문제는 그 문항이 **원문 유형과 다르다**는 점과 **렌더되지 않는다**는 점이다.

---

# 차단 (BLOCKER) — 3건

## [차단 1] 1.json · `passage_ko[6]`, `sentences[5].ko_full` / `ko_chunks` / `paraphrasing[]` — 어휘 문제의 오답 단어 `meaningful` 을 정상 어휘로 번역·강화

**현재값**

- `passage[6]` (원문 그대로, 정상):
  `Thanks to this process, the Venus flytrap doesn't make meaningful efforts trying to trap and digest raindrops or fallen leaves.`
- `passage_ko[6]`:
  「이 과정 덕분에, 파리지옥풀은 빗방울이나 떨어진 나뭇잎을 가두고 소화하려 애쓰며 **의미 있는 노력**을 낭비하지 않는다.」
- `sentences[5].ko_full`: 위와 동일
- `sentences[5].ko_chunks`: 「… 파리지옥풀은 **의미 있는 노력**을 들이지 않는다 …」
- `sentences[5].en_html`: `meaningful` 에 `hl-r` 강조 span
- `sentences[5].paraphrasing`:
  - high: `avoids squandering genuine energy in a futile attempt…`
  - mid: `does not waste real effort trying to catch and digest…`
- `vocab`: `{"word":"meaningful", "meaning":"의미 있는, 유의미한", "syn":"significant, worthwhile", "ant":"meaningless, pointless"}`

**무엇이 틀렸는지**

이 지문은 `type: "어휘"` — 원문에서 **`meaningful` 이 바로 정답(문맥상 부적절한 낱말)** 이며 `meaningless` 로 고쳐야 하는 자리다. 의뢰서에도 「⑤meaningful 이 정답(→meaningless 여야 함)」으로 명시되어 있다.

그런데 이 JSON은 `meaningful` 을 **정상적인 어휘로 간주하고 그대로 번역**했다. 그 결과 학생이 읽게 되는 문장은 논리적으로 **무너져 있다**.

> 「파리지옥풀은 … **의미 있는 노력**을 낭비하지 않는다」

원문의 논리는 "빗방울·낙엽 따위를 잡으려는 **헛된**(meaningless) 노력을 하지 않는다"이다. 그런데 위 번역은 "**의미 있는** 노력을 하지 않는다"가 되어, 이 식물이 가치 있는 일을 안 한다는 **정반대의 뜻**으로 읽힌다. 게다가 영어 `doesn't make ... efforts`(노력을 하지 않는다)를 한국어에서는 「노력을 **낭비하지** 않는다」로 옮겨, 원문에 없는 '낭비'를 끼워 넣어 어색함을 봉합하려 한 흔적까지 있다.

더 심각한 것은 `paraphrasing` 이다. high/mid 패러프레이즈가 `meaningful` 을 각각 **`genuine energy`**, **`real effort`** 로 바꿔 쓰면서, "진짜 에너지를 낭비하지 않는다"라는 **틀린 독해를 영어로 다시 한번 확정**해 준다. 학생은 이 오독을 세 번(본문해석·문장카드·패러프레이즈) 반복 학습하게 된다.

`hide_answer:true` 라 정답이 안 나오는 자료라 해도, **본문 해석은 그대로 렌더된다.** 즉 이 오류는 100% 학생에게 도달한다.

**원문 근거**

`_SOURCE-EX.js` 지문 1:

```
type: '어휘',
question: '다음 글의 밑줄 친 부분 중, 문맥상 낱말의 쓰임이 적절하지 않은 것은?',
...
"Thanks to this process, the Venus flytrap doesn't make meaningful efforts trying to trap and digest raindrops or fallen leaves.",
```

`Thanks to this process`(이 계수 과정 덕분에)라는 **긍정적 인과**로 문장이 열리는데, 결론이 "의미 있는 노력을 안 한다"라면 앞의 `Thanks to` 와 충돌한다. 문맥상 성립하는 유일한 독해는 `meaningless`(헛된) 이다. 앞 문장들(20초 내 2회, 3회 초과 자극 요구)이 모두 **헛수고 방지 장치**를 설명하고 있으므로 논리적으로 확정된다.

**수정 제안**

이 지문이 어휘 문제임을 자료에 반영하되, 본문 영어는 원문 verbatim(`meaningful`)을 유지해야 `verify-EX.mjs` 를 통과한다. 따라서 **해석과 해설 쪽에서** 처리한다.

1. `passage_ko[6]` / `sentences[5].ko_full` / `ko_chunks` 를 원문의 의도된 정답 기준으로 옮기고, 밑줄 단어가 오답임을 밝힌다.
   → 「이 과정 덕분에, 파리지옥풀은 빗방울이나 떨어진 나뭇잎을 가두고 소화하려 애쓰는 **헛된 노력**을 하지 않는다.」
   (＋ 각주/해설: 「원문 밑줄 `meaningful` 은 문맥상 부적절하며 **`meaningless`(헛된)** 가 맞다 — 이것이 어휘 문제의 정답 자리다.」)
2. `sentences[5].paraphrasing` high/mid 의 `genuine energy` · `real effort` 를 `futile efforts` · `pointless effort` 로 교체.
   - high 예: `…the Venus flytrap avoids futile efforts to capture and break down raindrops or falling leaves.`
   - mid 예: `…the Venus flytrap does not make pointless efforts trying to catch and digest raindrops or fallen leaves.`
3. `sentences[5].points` 에 어휘 포인트를 1개 추가:
   「**meaningful ↔ meaningless** — 이 자리는 `Thanks to this process`(긍정적 인과)를 받으므로 '헛된 노력을 하지 않는다'가 되어야 논리가 성립한다. `meaningful`(의미 있는)을 그대로 두면 '가치 있는 일을 안 한다'는 정반대 뜻이 된다.」
4. `vocab` 의 `meaningful` 항목에 「본문 밑줄 → 문맥상 `meaningless` 가 옳다」는 단서를 덧붙인다.

---

## [차단 2] 2.json · `passage[]` / `passage_ko[]` 전체 — 원문의 삽입 문장(`insertSentence`)이 자료에서 완전히 누락, 그 결과 5번 문장이 논리적으로 붕 뜸

**현재값**

`2.json` 의 `passage` 는 6문장이며, 원문 `sentences[]` 6개와만 일치한다. 파일 전체를 문자열 검색한 결과 다음이 **모두 부재**했다.

```
'not always beneficial' → False
'drinking water'        → False
'However, negative'     → False
```

즉 원문의 `insertSentence` 인
`"However, negative pressure is not always beneficial, such as in the case of pipes carrying drinking water to a city."`
가 `passage` · `passage_ko` · `sentences` · `flow` · `vocab` 어디에도 **한 번도 등장하지 않는다**.

**무엇이 틀렸는지**

이 지문은 `type: "문장삽입"` 이고, 저 문장은 **문제의 핵심이자 지문의 필수 구성 요소**다. 그것이 빠지면서 본문 자체에 **논리 공백**이 생겼다. 렌더된 본문을 순서대로 읽으면 이렇게 된다.

- 3번: 해저 **송유관**은 음압 상태다
- 4번: 이것이 기름이 유출되는 반대 상황보다 낫다
- 5번: **"만약 이 상수도관들이(these municipal waterlines) 손상되면…"**

**상수도관은 그 전에 한 번도 언급된 적이 없다.** 그런데 5번 문장은 `these`(이 ~들)라는 **전방조응 지시어**로 시작한다. 선행사가 없는 `these` 가 되어 본문이 비문에 가까워진다. 학생은 "이 상수도관들"이 뭘 가리키는지 찾을 수 없다.

그리고 이 결함은 **해설이 스스로 자백하고 있다.** `sentences[4].note` 와 `points[2]` 는 다음과 같이 적혀 있다.

> `note`: 「`these municipal waterlines` 의 `these` 는 **앞에 이미 상수도관이 언급되었음**을 알려 주는 단서이므로, 문장삽입 문제에서 결정적 근거가 된다.」
>
> `points[2]` (reading): 「**지시어 these의 힘** — 앞 문장까지는 **송유관**만 다뤘으므로, 상수도관을 처음 소개하는 문장이 **바로 앞에 있어야** these가 성립한다. 논리 공백을 짚는 핵심 단서.」

해설은 "상수도관을 처음 소개하는 문장이 바로 앞에 있어야 한다"고 정확히 지적하는데, **정작 그 문장이 자료에 없다.** 학생은 해설이 가리키는 대상을 본문에서 찾을 수 없어 해설 자체가 이해 불가능해진다. 이는 단순 누락이 아니라 **본문과 해설이 서로 모순**되는 상태다.

**원문 근거**

`_SOURCE-EX.js` 지문 2:

```js
type: '문장삽입',
insertSentence: "However, negative pressure is not always beneficial, such as in the case of pipes carrying drinking water to a city.",
sentences: [ ... 6문장 ... ]
```

`insertSentence` 가 `sentences` 와 **별도 필드**로 분리되어 있어 `passage` 생성 시 누락된 것으로 보인다. 의뢰서의 판단(「municipal waterlines 를 처음 도입하므로 ④번 앞이 정답」)과 정확히 일치하며, 원문 4번(`This is much better than the opposite scenario…`)과 5번(`If these municipal waterlines…`) **사이**가 그 자리다.

**수정 제안**

본문분석지는 "완성된 지문"을 읽히는 자료이므로, **삽입 문장을 제자리(4번과 5번 사이)에 넣어 7문장 지문으로 복원**하는 것이 옳다.

1. `passage` 를 7문장으로: `[1,2,3,4, insertSentence, 5, 6]` 순서.
   - 새 5번: `However, negative pressure is not always beneficial, such as in the case of pipes carrying drinking water to a city.`
2. `passage_ko` 에 대응 해석 추가:
   「하지만 음압이 늘 이로운 것은 아닌데, 도시로 식수를 나르는 관의 경우가 그렇다.」
3. `sentences` 에 이 문장 카드를 신설하거나 기존 5번 카드의 `covers` 를 확장. 문법 포인트로 `such as in the case of`(~의 경우처럼), `carrying`(현재분사 후치수식), 역접 `However` 를 다룰 수 있다.
4. `covers` 인덱스 전체를 7문장 기준으로 재배열.
5. `verify-EX.mjs` 는 `SOURCE[].sentences` 와만 대조하므로, 삽입 후에도 통과하려면 **정본 측에서도 `insertSentence` 를 포함해 비교**하도록 검증기를 손보거나, 해당 지문만 예외 처리해야 한다. (검증기 수정 없이 넣으면 문장 수 불일치로 ERROR 가 난다 — 반드시 함께 처리할 것.)
6. `flow[3]` 의 본문도 「같은 원리가 상수도관에서는 위험으로 바뀐다」 앞에 **역접 전환(However)** 이 있음을 반영해 다듬는다.

---

## [차단 3] 1.json / 2.json / 4.json · `type` · `question_text` ↔ `choices` 불일치 (3지문 공통)

**현재값**

| 파일 | `type` | `question_text` | `choices` 실제 내용 |
|---|---|---|---|
| 1.json | `"어휘"` | 「밑줄 친 부분 중, 문맥상 낱말의 쓰임이 적절하지 않은 것은?」 | 영어 **제목** 5개 |
| 2.json | `"문장삽입"` | 「주어진 문장이 들어가기에 가장 적절한 곳은?」 | 영어 **제목** 5개 |
| 4.json | `"순서"` | 「이어질 글의 순서로 가장 적절한 것은?」 | 영어 **제목** 5개 |

**무엇이 틀렸는지**

발문과 선택지가 **서로 다른 문제**를 가리킨다. 예컨대 1.json 은 "밑줄 친 낱말 중 부적절한 것"을 물어 놓고, 선택지로 `How Insects Escape from Carnivorous Plants` 같은 **제목**을 제시한다. 발문에 맞는 선택지(①act ②trapping ③knew ④producing ⑤meaningful)는 어디에도 없다.

부수적으로, 발문이 요구하는 **밑줄 표시(`<u>`)** 도 `passage` 에 전혀 없다. 1.json 의 밑줄 5개, 2.json 의 삽입 위치 표시 ①~⑤, 4.json 의 (A)/(B)/(C) 단락 구분이 모두 부재하다(`(A)`·`(B)`·`(C)` 문자열 검색 결과 4.json 에서 **전부 False**). 즉 세 파일 모두 **원문 유형의 문제를 풀 수 있는 형태가 아니다.**

**왜 차단인가 — 근거를 나눠서**

렌더 관점만 보면 `hide_answer:true` 라 선택지는 출력되지 않으므로 당장 학생이 틀린 선택지를 보지는 않는다. 그럼에도 차단으로 올리는 이유는 **`type` 필드는 렌더된다**는 점이다.

`build.mjs:1142`:

```js
<div class="type">${esc(data.type || '')}</div>
```

인덱스/표지 카드에 `type` 이 그대로 노출된다. 학생과 교사는 이 자료를 **"어휘 지문", "문장삽입 지문", "순서 지문"** 으로 인지하고 펼치는데, 정작 안에는 그 유형을 연습할 장치(밑줄·①~⑤ 슬롯·(A)(B)(C))가 하나도 없다. 특히 2.json 은 [차단 2]와 겹쳐, **삽입할 문장조차 없는 "문장삽입" 자료**가 된다. 라벨과 내용물의 불일치가 학습 자체를 오도한다.

3.json 은 예외다. `type: "요지"` 인데 선택지가 제목이라 엄밀히는 요지≠제목이지만, 이 지문의 정답 제목 `Leap Day Keeps the Calendar in Step with the Seasons` 는 의뢰서의 예상 요지 「윤년은 시간을 계절과 일치시켜 … 유지하는 데 필요하다」와 **내용상 일치**하고, 요지와 제목은 인접 유형이라 오도 정도가 낮다 → 아래 **권고 3**으로 분류.

**원문 근거**

`_SOURCE-EX.js` 는 각 지문의 유형을 명시하고 헤더 주석에 못을 박아 두었다.

```
* 각 지문은 원문의 문제 유형을 그대로 유지한다(어휘 / 문장삽입 / 요지 / 순서).
```

즉 유형 보존은 **정본이 명시한 요구사항**이며, 현재 데이터는 이를 위반한다.

**수정 제안**

둘 중 하나를 **일관되게** 택한다.

- **(A) 유형 복원 (정본 취지에 부합, 권장)**
  - 1.json: `passage` 에 `<u>act</u>` … `<u>meaningful</u>` 5곳 밑줄 삽입, `choices` 를 ①act ②trapping ③knew ④producing ⑤meaningful 로 교체하고 ⑤를 `correct:true` 로. → [차단 1]도 동시에 해소된다.
  - 2.json: [차단 2]로 삽입 문장을 복원하면서 본문에 ①~⑤ 슬롯 표시, `choices` 를 위치 5개로 교체하고 ④를 `correct:true` 로.
  - 4.json: `passage` 를 주어진 글 + (A)(B)(C) 단락으로 재구성, `choices` 를 순서 조합 5개로 교체하고 (C)-(A)-(B) = ④를 `correct:true` 로.
  - 이 경우 `hide_answer` 를 `false` 로 바꿔야 ANSWER 블록이 실제로 렌더된다.
- **(B) 제목 문제로 확정 (현 데이터 유지, 최소 수정)**
  - `type` 을 `"제목"` 으로, `question_text` 를 「다음 글의 제목으로 가장 적절한 것은?」으로 세 파일 모두 교체.
  - 단 이때도 [차단 1]의 `meaningful` 오역과 [차단 2]의 삽입 문장 누락은 **별도로 반드시 수정**해야 한다(유형과 무관한 독립 결함).

어느 쪽이든 `dist/EX/*.html` 및 합본 PDF **재빌드 필수**.

---

# 권고 (MAJOR) — 5건

## [권고 1] 2.json · `sentences[4].note` / `points[2]` — 본문에 없는 상태를 전제한 해설 (날조 인용은 아니나 검증 불가)

**현재값**

- `note`: 「`these` 는 **앞에 이미 상수도관이 언급되었음**을 알려 주는 단서이므로, 문장삽입 문제에서 결정적 근거가 된다.」
- `points[2]`: 「앞 문장까지는 송유관만 다뤘으므로, 상수도관을 처음 소개하는 문장이 **바로 앞에 있어야** these가 성립한다.」

**무엇이 틀렸는지**

해설 내용 자체는 **원문 기준으로 완전히 정확**하다(실제로 삽입 문장이 상수도관을 처음 도입한다). 문제는 그 해설이 참조하는 문장이 자료에 없어, **학생이 검증할 수 없는 해설**이 되었다는 점이다. 또 「문장삽입 문제에서 결정적 근거」라는 서술은 이 자료에 삽입 문제가 없으므로 붕 뜬다.

**원문 근거**

`insertSentence` 가 `…pipes carrying drinking water to a city` 로 상수도관을 처음 도입 → `these municipal waterlines` 의 선행사. 해설의 논리는 옳다.

**수정 제안**

[차단 2]를 수정해 삽입 문장을 본문에 복원하면 이 해설은 **그대로 두어도 자동으로 정합**해진다. 만약 (B)안(제목 문제로 확정)을 택한다면 「문장삽입 문제에서 결정적 근거가 된다」 문구만 「지시어의 선행사를 앞 문장에서 찾아야 한다」 정도로 중립화한다.

---

## [권고 2] 1.json · `choices[]` 전체 — 발문과 무관한 제목 선택지 (렌더 안 됨)

**현재값** `choices` 5개가 모두 영어 제목. `correct:true` = ③ `The Plant That Counts Before It Eats`.

**무엇이 틀렸는지**

[차단 3]의 데이터 측면. 제목 문항 **자체의 품질은 높다** — ①탈출(무관) ②효소(지엽) ④광합성(확대) ⑤부주의한 사냥꾼(반대)으로 오답 4유형이 고르게 배치되고 정답 ③이 유일하다. `comment` 들도 본문 인용이 모두 실재한다(`the leaves close, trapping the insect` = passage[1], `the enzymes that digest the trapped insect` = passage[5], `doesn't make meaningful efforts…` = passage[6] — **전부 원문에 존재, 날조 인용 없음**). 다만 발문이 어휘 문제라 문항이 발문과 어긋나고, `hide_answer` 로 출력되지도 않는다.

**수정 제안** [차단 3]의 (A) 또는 (B)와 함께 일괄 처리. 제목 문항을 살릴 경우 `comment` 는 손댈 필요 없다.

---

## [권고 3] 3.json · `type: "요지"` ↔ 제목 선택지 — 유형 라벨 불일치

**현재값** `type: "요지"`, `question_text` 「요지로 가장 적절한 것은?」, `choices` 는 영어 제목 5개, `correct:true` = ④ `Leap Day Keeps the Calendar in Step with the Seasons`.

**무엇이 틀렸는지**

요지(문장 형태의 주장)와 제목(명사구 형태의 표제)은 다른 유형이다. 다만 정답 ④의 내용은 의뢰서 예상 요지 ⑤「윤년은 시간을 계절과 일치시켜 사회·문화 전통을 유지하는 데 필요하다」와 **실질적으로 동일**하며, `comment` 의 인용 `to ensure that our calendar and our seasons stay in line with each other` 도 `passage[1]` 에 **실재**한다. 오답 4개(2월/농부/축제 기원/365일)도 각각 지엽·지엽·무관·반대로 정확히 기능하고 인용도 모두 실재한다. 따라서 오도 위험이 낮아 차단이 아닌 권고.

**원문 근거** `_SOURCE-EX.js` 지문 3 `type: '요지'`.

**수정 제안** `type` 을 `"제목"` 으로 바꾸고 `question_text` 를 「다음 글의 제목으로 가장 적절한 것은?」으로 교체하거나, 반대로 선택지를 한국어 요지문 5개로 재작성한다. 4개 파일의 처리 방침을 [차단 3]과 통일할 것.

---

## [권고 4] 4.json · `passage[]` — 순서 문제의 (A)(B)(C) 단락 구분 부재, `givenSentence` 가 본문에 흡수됨

**현재값** `passage` 7문장이 (A)(B)(C) 구분 없이 **정답 순서대로 평문 나열**되어 있다. 원문의 `givenSentence`(주어진 글)는 `sentences[0]` 과 동일한 문장인데, `passage[0]` 에 그대로 들어가 **주어진 글과 본문의 경계가 사라졌다**.

**무엇이 틀렸는지**

`type: "순서"` 인데 학생이 순서를 배열해 볼 대상이 없다. 이미 정답 순서로 배열된 완성문만 제시되므로 순서 문제로서 기능하지 않는다. 다만 본문분석지의 목적이 "완성된 지문 읽히기"라면 이 배열 자체는 **내용상 옳다** — 원문 `sentences[]` 순서와 일치하고, 이는 의뢰서 예상 정답 (C)-(A)-(B)=④를 적용한 최종 형태와 부합한다. 그래서 차단이 아닌 권고.

**원문 근거**

```js
type: '순서',
givenSentence: "In 2011, Joao Pereira de Souza, ... found a penguin struggling on the beach.",
sentences: [ 동일 문장 + 6문장 ]
```

`givenSentence` 와 `sentences[0]` 이 **중복**된 구조라, `passage` 생성 시 자연스럽게 합쳐진 것으로 보인다.

**수정 제안** [차단 3]의 (A)안을 택하면 `passage` 를 주어진 글 / (A) / (B) / (C) 로 재구성하고 `choices` 를 순서 조합으로 교체. (B)안이면 `type` 만 `"제목"` 으로 바꾸고 현 배열을 유지한다(내용은 이미 정확).

---

## [권고 5] 1.json · `sentences[0].points[0]` — 관계사절 수 일치 설명의 선행사 지정이 부정확

**현재값**

> 「**주격 관계대명사 + 수 일치** — 선행사가 `a pair of leaves` 의 **leaves(복수)** 이므로 관계사절의 동사가 acts가 아니라 **act** 이다. 바로 앞의 `a pair` 에 끌려 단수로 쓰지 않도록 주의한다.」

**무엇이 틀렸는지**

결론(`act` 가 맞다)은 옳지만 **설명의 위치 관계가 사실과 다르다.** 어순상 `that` 의 **바로 앞**에 있는 것은 `a pair` 가 아니라 `leaves` 다(`a pair of leaves that act…`). 즉 "바로 앞의 `a pair` 에 끌려"라는 서술은 문장의 실제 어순과 어긋난다. 학생이 `a pair` 가 `that` 바로 앞에 있다고 오인하면 선행사 판별 자체를 잘못 배우게 된다.

더해서, **같은 카드의 `points[1]` 이 정반대 원칙을 말한다.**

> `points[1]`: 「동격 삽입구 — 주어–동사 수 일치는 삽입구가 아니라 `The Venus flytrap`(단수)에 맞춘다.」

한 카드 안에서 `points[0]` 은 "가까운 명사에 끌리지 말라", `points[1]` 은 "가까운 삽입구에 끌리지 말고 핵에 맞춰라"라고 하여, 학생이 **어느 원칙을 언제 적용할지** 판단할 수 없다. 두 문법 현상(주어-동사 일치 vs 관계사절-선행사 일치)이 구분 없이 섞였다.

**원문 근거**

`passage[0]`: `The Venus flytrap, a meat-eating plant, has a pair of leaves that act as jaws and a stomach.`

- 주절: 주어 `The Venus flytrap`(단수) → `has` (단수) ✔
- 관계사절: 선행사 `leaves`(복수, `that` 바로 앞) → `act` (복수) ✔

두 일치가 **서로 다른 층위**임이 문장 안에서 확인된다.

**수정 제안**

`points[0]` 을 다음 취지로 수정:

> 「**주격 관계대명사의 선행사 찾기** — `that act as jaws and a stomach` 는 `a pair` 가 아니라 **바로 앞의 `leaves`(복수)** 를 꾸미므로 동사가 `act` 이다. 같은 문장에서 주절 동사가 `has`(단수)인 것은 주어가 `The Venus flytrap`(단수)이기 때문 — **관계사절은 선행사에, 주절 동사는 주어의 핵에** 각각 맞춘다는 점을 구분하자.」

---

# 경미 (MINOR) — 4건

## [경미 1] 1.json · `sentences[4].points[0]` — 맥락에 불필요한 `of` 언급

**현재값** 「to부정사의 의미상 주어 for + 목적격 — … **사람의 성질을 평가하는 형용사 뒤에서만 of를 쓴다.**」

**무엇이 틀렸는지** 서술 자체는 문법적으로 옳다(`It is kind of you to…`). 다만 해당 문장 `more than three stimuli were required for the plant to begin producing…` 은 `It is + 형용사` 구문이 **아니어서** `of` 가 애초에 후보가 아니다. 그 문장에 대한 설명이 아니라 일반 지식을 덧붙인 것으로, 학생에게 불필요한 혼선을 준다.

**수정 제안** 해당 문장을 삭제하거나, 「`It is kind of you to help.` 처럼 **`It is + 사람의 성질 형용사`** 구문에서만 of를 쓴다」로 조건을 명시해 현 문장과 구분되게 한다.

---

## [경미 2] 1.json · `passage_ko[6]` / `sentences[5].ko_full` — 원문에 없는 '낭비'의 삽입

**현재값** 「… 의미 있는 노력을 **낭비하지** 않는다」

**무엇이 틀렸는지** 영어는 `doesn't make ... efforts`(노력을 **하지** 않는다)이지 `doesn't waste`(낭비하지 않는다)가 아니다. `meaningful` 오역([차단 1])이 만든 비문을 자연스럽게 보이려고 동사를 바꾼 것으로 보인다. `ko_chunks` 는 같은 자리를 「노력을 **들이지** 않는다」로 옮겨 **한 카드 안에서 표현이 불일치**하기도 한다.

**수정 제안** [차단 1] 수정 시 함께 「헛된 노력을 **하지** 않는다」로 통일하고 `ko_full` · `ko_chunks` · `passage_ko` 3자를 동기화한다.

---

## [경미 3] 3.json · `sentences[4].points[0]` — 문장 번호 오지정

**현재값** 「**가정법 Without 반복** — **5번 문장**과 같은 구조를 반복해 두 번째 근거를 제시한다.」

**무엇이 틀렸는지** 이 point 는 `sentences[4]`(카드 5번, `covers:[6,7]`)에 달려 있다. 여기서 가리키는 "5번 문장"은 **원문 passage 기준 5번**(`Without the addition of a leap day, winter would occur earlier…`)으로, 카드 번호로는 `sentences[3]`(카드 4번)이다. 즉 **카드 번호와 본문 문장 번호가 혼용**되어 학생이 어느 것을 찾아야 할지 모호하다. 실제 내용(두 문장이 모두 `Without` 가정법)은 **정확**하므로 경미로 분류.

**원문 근거** `passage[4]` = `Without the addition of a leap day, …` / `passage[6]` = `Without leap years to keep the calendar in check, …` — 두 `Without` 구문이 실재한다.

**수정 제안** 「**앞 문장**(`Without the addition of a leap day …`)과 같은 구조를 반복해」처럼 인용구로 특정하거나 「본문 5번 문장」으로 기준을 명시한다. 4개 파일 전체에서 숫자 지시는 인용구 병기를 원칙으로 삼기를 권한다.

---

## [경미 4] 4.json · `vocab` — `only to V` 의 뜻풀이가 원문 용법과 어긋남

**현재값** `{"word":"only to V", "meaning":"(결국) ~하고 말다, ~하게 되다", "syn":"ending up doing"}`

**무엇이 틀렸는지** `only to V` 는 통상 **실망스러운/뜻밖의 부정적 결과**('~했지만 결국 …하고 말았다')에 쓰인다. 그런데 원문 `he goes on his annual migration …, only to return once again` 은 **긍정적 반전**(떠났다가 다시 돌아온다)이다. 사전적 뜻풀이만 제시하면 학생이 이 문장을 부정적으로 오독할 수 있다.

다만 같은 파일의 `sentences[4].points[0]` 은 이 점을 **정확히 보완**하고 있다 — 「앞 내용과 대비되는 결말을 나타낸다. 여기서는 떠났는데도 **돌아온다**는 반전을 만든다」. 해설이 이미 교정하므로 경미.

**원문 근거** `passage[6]`: `…he goes on his annual migration for his breeding routine, only to return once again.` — 문맥은 감동적 귀환이다.

**수정 제안** `meaning` 에 중립적 표현을 병기: 「(예상과 달리) 결국 ~하게 되다 — 부정적 결과가 일반적이나, 여기서는 **뜻밖의 긍정적 반전**에 쓰였다」.

---

# 정상 확인 항목 (오탐 방지 기록)

검수 과정에서 확인했으나 **결함이 아닌** 항목들이다.

- **본문 verbatim 일치** — 4개 파일 `passage` 가 `_SOURCE-EX.js` 와 완전 일치. `verify-EX.mjs` 오류 0 / 경고 0.
- **`comment` 의 본문 인용** — 4개 파일 20개 선택지의 `comment` 에 등장하는 영어 인용을 전수 대조한 결과 **날조 인용 0건**. 모두 `passage` 에 실재하는 표현이다.
- **`summary_ko` / `main_idea_en` / `title_en`** — 4개 파일 모두 지문 내용과 정확히 일치. 특히 2.json 의 `main_idea_en` 은 삽입 문장이 없는데도 "oil leaks ↔ contaminated groundwater"의 양면 구조를 정확히 포착했다(다만 이는 본문에 없는 정보를 반영한 것이므로, [차단 2] 수정으로 본문을 복원하면 정합해진다).
- **`flow[]`** — 4개 파일 16개 STEP 전부 지문 전개와 일치. 인용된 신호어(`Amazingly`, `For example`, `Additionally`, `Amazingly, though`, `Thanks to this process`)가 모두 본문에 실재.
- **`vocab[]`** — 105개 항목 전수 점검. 표제어가 본문에 모두 등장(`be linked to` 는 `are linked to` 로 등장). 품사·뜻·유의어·반의어·파생어에 [경미 4] 외 오류 없음. `stimuli`(복수형 표기), `once`(접속사), `used to` 의 3용법 구분 등 까다로운 항목이 정확하다.
- **`covers` 커버리지** — 27개 원문 문장을 22개 카드가 빠짐없이 1회씩 오름차순 커버.
- **문법 설명 정확성** — [권고 5]·[경미 1]·[경미 3] 외 60여 개 `points` 는 모두 해당 문장에 대한 정확한 설명. 특히 `used to V` 3용법(2.json s3), `It takes A 시간 to V`(3.json s2), `find + O + 현재분사`(4.json s1), `be named + 명사`(4.json s2), 비교급 강조 `much`(2.json s4)는 정밀하다.

---

# 수정 우선순위

1. **[차단 1]** 1.json `meaningful` 오역 — 학생 도달률 100%, 논리가 정반대로 뒤집힘. **최우선.**
2. **[차단 2]** 2.json 삽입 문장 누락 — 본문에 선행사 없는 `these` 가 남고 해설이 자기모순. 검증기 동시 수정 필요.
3. **[차단 3]** 유형 라벨 ↔ 내용 불일치 — (A)/(B) 방침을 4개 파일에 **일관** 적용.
4. **[권고 5]** 1.json 수 일치 설명 뒤집힘.
5. 나머지 권고·경미.

수정 후 `node _oneoff-신서고-YBM-L1/verify-EX.mjs` 재실행 + `dist/EX/*.html` 재빌드 + `builder/check-overflow.mjs` 로 **overflow 0** 확인.
