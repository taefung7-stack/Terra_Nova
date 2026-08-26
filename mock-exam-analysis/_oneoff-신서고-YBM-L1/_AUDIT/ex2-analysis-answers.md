# EX2 본문분석지 4지문 — 정답·해설 정확성 검수

- 대상: `data/EX2/1.json` `2.json` `3.json` `4.json` (본문분석지)
- 정본: `_SOURCE-EX2.js` (verbatim 기준)
- 관점: 정답 타당성 / 오답 comment / sentences note·points / summary·flow / vocab
- 검수일: 2026-08-26

## 집계

| 등급 | 건수 |
|---|---|
| 차단(BLOCKER) | 1 |
| 권고(MAJOR) | 3 |
| 경미(MINOR) | 5 |
| 합계 | 9 |

## 정답 타당성 — 전건 정상 (결함 없음)

`correct: true` 플래그를 원문 `answer` 와 전수 대조한 결과 **4지문 모두 일치**하며, 각 지문에서 정답은 유일하다.

| 파일 | 유형 | 원문 answer | JSON correct | 판정 |
|---|---|---|---|---|
| 1.json | 빈칸 | 5 (social and contagious) | ⑤ | ✅ 일치 |
| 2.json | 빈칸 | 3 (more potential targets for hackers) | ③ | ✅ 일치 |
| 3.json | 어법 | 3 (pushing→pushed) | ③ | ✅ 일치 |
| 4.json | 어휘 | 3 (hide→detect) | ③ | ✅ 일치 |

### 지문3 ⑤ test 오정답 여부 — 정상 (BLOCKER 아님)

의뢰서에서 우려한 "⑤ test 를 정답으로 잡았을 가능성"은 **해당 없음**. `3.json` 은 ⑤ 를 `correct:false` 로 두고,
choices[5].comment 와 S7 grammar point 양쪽에서 `allow NASA to [conduct experiments] and [test equipment]` 병렬을
정확히 설명한다("앞의 to 가 뒤에도 걸리므로 원형 test 가 옳다. tests·testing 이면 병렬이 깨진다"). 원문 정본 주석과 동일한 판단이다.

### 지문3 ③ pushing 논쟁 — 원문 판정 유지, 단 근거 보강 필요 (아래 MAJOR-1)

원문: `you feel yourself pushing down on your seat`

- **원문·JSON 판정(pushed 가 옳다)을 유지한다.** 문제집 정본이 ③ 을 정답으로 박제했고, 바로 다음 문장
  `your body ... until it is pulled down by your safety belt` 가 같은 "몸 = 힘을 당하는 쪽" 관점을 이어가므로,
  출제 의도상 목적격보어 수동(pushed)이 정답이라는 데 이견 없다.
- **다만 능동 해석도 언어적으로 성립한다.** 롤러코스터가 상승할 때 실제 물리에서 몸은 좌석을 **누르는** 주체이고,
  전치사 `on`(눌리는 대상 = your seat)은 능동 `push down on ~`("~을 내리누르다")의 전형적 결합이다.
  수동으로 쓸 때 영어는 보통 `pushed down into/against your seat` 로 전치사를 바꾼다 — 실제로
  같은 폴더 `3-variant.json` 의 재작성 문장들은 전부 `pushed into your seat` 로 전치사를 교체해 두었다
  (`3-variant.json` line 99, 246). 즉 `passage_corrected` 의 `pushed down on your seat` 는 어색한 조합이다.
- 따라서 정답 자체는 유지하되, 해설이 "능동은 불가능"인 것처럼 단정하는 현재 서술은 근거가 과하다(MAJOR-1).

---

## BLOCKER

### [BLOCKER-1] `data/EX2/4.json` · `passage_ko[4]` 및 `sentences[3].ko_full` · 정정 화살표 방향이 반대

- **위치**: `4.json` line 34 (`passage_ko[4]`), line 446 (`sentences[3].ko_full`) — 동일 문자열 2곳
- **현재값**:
  > 이 연구의 목표는 시금치가 폭발물을 **감지할(→숨길)** 수 있는지 알아내는 것이었지만, 관련된 기술은 더 넓은 잠재력을 지니고 있다.
- **무엇이 틀렸는지**: 이 지문은 **어휘** 문제이고 ③ 밑줄어는 원문에 인쇄된 `hide`(숨기다)이며 정답 정정어가
  `detect`(감지하다)다. `A(→B)` 표기는 관례상 "A 가 인쇄된 말, B 가 고쳐야 할 말"을 뜻하므로,
  현재 표기는 **원문이 "감지"이고 "숨길"로 고쳐야 한다**는 정반대 지시가 된다. 학생이 정답을 거꾸로 외우게 되는
  치명적 오기이며, 같은 파일의 choices[3].comment(`hide → detect (정답)`)·`sentences[3].points[0]`
  (`③hide → detect — 이 문제의 정답`)·`passage_corrected[4]`(`could detect explosives`) 와도 **자기모순**이다.
- **원문 근거**: `_SOURCE-EX2.js` 지문4 문장5 — `if spinach could hide explosives`,
  underlines `{ no: 3, text: 'hide' }`, 주석 `③ hide 가 정답(문맥상 부적절: detect 여야 함)`.
- **수정 제안**: 두 곳 모두 `숨길(→감지할)` 로 교체.

  > 이 연구의 목표는 시금치가 폭발물을 숨길(→감지할) 수 있는지 알아내는 것이었지만, …

---

## MAJOR

### [MAJOR-1] `data/EX2/3.json` · `choices[2].comment` / `sentences[2].note` / `sentences[2].points[0]·[1]` · ③ 근거를 "앞 절 gravity pulls" 로만 단정

- **현재값**:
  - choices[2].comment: "바로 앞에 **gravity pulls your body downward**(중력이 몸을 아래로 당긴다)가 원인으로 제시돼 있으므로, 몸은 좌석에 **눌리는** 쪽이다."
  - sentences[2].note: "바로 앞 절이 `gravity pulls your body downward` 이므로, 몸은 중력에 의해 좌석 쪽으로 눌리는 쪽이다."
  - sentences[2].points[1]: "**판단 근거는 앞 절에 있다** — … 뒤 절에서도 몸의 입장은 그대로 유지되어야 하므로 수동이다."
- **무엇이 틀렸는지**: 논리가 성립하지 않는 구간이 있다. 앞 절 `gravity pulls your body downward` 는 **중력 → 몸**의
  관계일 뿐, 그 다음 절의 **몸 → 좌석** 관계를 수동으로 확정해 주지 못한다. 오히려 중력에 눌린 몸이 좌석을
  **누른다**(능동)는 것이 물리적으로도, `push down on ~`("~을 내리누르다")이라는 연어 관계로도 자연스럽다.
  "몸의 입장은 그대로 유지되어야 하므로 수동"이라는 서술은 **문법 규칙이 아니다**(목적격보어의 태는 목적어와
  보어 동사 사이의 관계로만 결정되며, 앞 절 태의 연속성 규칙은 존재하지 않는다). 학생이 이 "규칙"을 일반화하면
  다른 문항에서 오답을 만든다.
- **원문 근거**: `_SOURCE-EX2.js` 지문3 주석은 "중력이 몸을 '누르는' 것이므로 yourself 는 누름을 '당하는' 대상"이라고만
  적고 있으며, 문항이 논쟁 여지가 있음을 정본 자체가 명시하지 않는다. 한편 `3-variant.json` line 99·246 은 같은 내용을
  `pushed into your seat` 로 전치사를 바꿔 재작성했다 — 제작 과정에서 `pushed down on` 이 어색함을 이미 인지한 흔적.
- **수정 제안**: 근거를 "앞 절 태의 연속"이 아니라 **다음 문장과의 대비**로 옮길 것. 예:

  > `feel + O + 목적격보어`에서 태는 O 와 보어의 관계로 정한다. 이 글은 **롤러코스터에서 몸이 힘을 받는 쪽**이라는
  > 관점으로 일관되며(다음 문장 `it is pulled down by your safety belt`), 출제 의도는 **좌석에 눌리는 몸**이므로 `pushed` 다.
  > 참고: 능동 `push down on ~`("~을 내리누르다")도 존재하는 표현이라 의미만으로는 헷갈릴 수 있으니,
  > **글 전체가 몸을 수동 주체로 그리고 있다는 흐름**을 근거로 잡아야 한다.

  아울러 `passage_corrected[2]` 의 `pushed down on your seat` 는 전치사가 어색하므로
  `pushed down into your seat` 로 다듬는 것을 권한다(variant 와 표기 일치).

### [MAJOR-2] `data/EX2/1.json` · `sentences[6].points[2]` (S7 reading) · contagious↔social 대응이 뒤집힘 (같은 파일 S8 과 자기모순)

- **현재값**:
  > **두 갈래 결론** — 웃음의 효과가 **①농담을 더 웃기게(개별 효과)** + **②사람들을 이어 줌(관계 효과)** 두 가지로
  > 정리된다. 이 둘이 각각 빈칸의 **contagious** 와 **social** 에 대응한다.
- **무엇이 틀렸는지**: "농담을 더 웃기게 만든다"는 **전염성(contagious)의 근거가 아니다**. contagious 의 근거는
  9번 문장 `we get ready to smile or laugh when we hear someone else laughing`(남의 웃음이 내 웃음을 유발)이다.
  현재 서술은 ①→contagious 로 잘못 짝지어 두었다. 같은 파일 `sentences[7].points[1]`(S8)이
  "`brings people together` → social, `we get ready to laugh when we hear someone else laughing` → contagious"라고
  **정확히** 대응시키고 있어, 두 해설이 서로 충돌한다. 학생이 앞 페이지를 먼저 읽으면 근거를 잘못 학습한다.
- **원문 근거**: `_SOURCE-EX2.js` 지문1 — 문장9 `This is because we get ready to smile or laugh when we hear
  someone else laughing.` / 문장10 `laughter not only makes jokes funnier but also brings people together.`
- **수정 제안**:

  > **두 갈래 결론** — 웃음의 효과가 ①농담을 더 웃기게(평가 상승) + ②**사람들을 이어 줌**으로 정리된다.
  > ② 가 빈칸의 **social** 에 직결되고, **contagious** 의 근거는 앞 문장(남이 웃으면 따라 웃을 준비를 한다)이다.

### [MAJOR-3] `data/EX2/4.json` · `passage_ko[6]` / `sentences[5].ko_full` · `as well as` 강조 방향이 같은 파일 note 와 반대

- **위치**: `4.json` `passage_ko[6]`, `sentences[5].ko_full`
- **현재값**: "식물이 자라면서 **다가오는 가뭄뿐만 아니라** 토양과 물의 **더 미묘한 변화까지** 예측하는 능력을 갖고 있다"
- **무엇이 틀렸는지**: 원문은 `predict upcoming droughts, as well as more subtle changes in soil and water`
  (A = upcoming droughts, B = more subtle changes). `A as well as B` = "**B뿐만 아니라 A도**"이므로
  "미묘한 변화뿐만 아니라 가뭄도"가 맞다. 현재 번역은 A/B 를 뒤집어 "가뭄뿐만 아니라 변화까지"로 옮겨,
  **같은 문장의 note 가 명시한 규칙과 정면 충돌**한다:

  > note: "`A as well as B` 는 "**B뿐만 아니라 A도**"로, **무게가 A(앞쪽)에 실린다**"

  같은 문장의 `ko_chunks` 는 규칙대로("가뭄을 예측 … / 토양과 물의 더 미묘한 변화뿐만 아니라") 옮겨져 있어,
  **ko_chunks ↔ ko_full ↔ passage_ko** 3자 중 ko_full·passage_ko 만 어긋난 상태다.
- **원문 근거**: `_SOURCE-EX2.js` 지문4 문장7.
- **수정 제안**: 두 곳을 규칙에 맞게 정정.

  > 공학자들은 식물이 자라면서 **토양과 물의 더 미묘한 변화뿐만 아니라 다가오는 가뭄까지** 예측하는 능력을 갖고 있다고 믿는다.

  (문항 정답에 영향을 주지 않으므로 BLOCKER 는 아니나, `as well as` 는 이 단원의 핵심 상관어구이므로
  학습 포인트가 정반대로 전달되는 결함이다.)

---

## MINOR

### [MINOR-1] `data/EX2/4.json` · `sentences[3].ko_chunks` · 정정어를 소리 없이 반영해 밑줄 문항의 대조가 사라짐

- **현재값**: "이 연구의 목표는 ~이었다 / 알아내는 것 / 시금치가 폭발물을 **감지할** 수 있는지를, / …"
- **무엇이 틀렸는지**: 이 청크는 **원문(`hide`) 문장**의 직독직해인데 정정어 `detect` 의 뜻(감지)을 표기 없이 넣어 두었다.
  ko_full 은 `(→)` 표기를 쓰고 ko_chunks 는 무표기라 **같은 문장의 두 번역이 다른 낱말**을 보여 준다. 어휘 문항에서
  학생이 "인쇄된 말 vs 고칠 말"을 대조하는 것이 핵심인데 그 대조가 청크에서 지워진다.
- **수정 제안**: ko_full 과 동일한 표기로 통일 — "시금치가 폭발물을 **숨길(→감지할)** 수 있는지를".
  (BLOCKER-1 수정 시 함께 처리할 것.)

### [MINOR-2] `data/EX2/1.json` · `sentences[0].points[0]` · `either A or B` 의 3항 확장 설명이 규범 문법으로 오독될 소지

- **현재값**: "여기서는 **세 항목**(no laughter / fake laughter / real laughter)이 연결됐는데,
  `either ... or` 는 이렇게 **셋 이상**으로 확장돼 쓰이기도 한다."
- **판정**: **결함 아님(정상)에 가까움.** 원문이 실제로 3항을 `either ... or` 로 묶었고, 서술도 "쓰이기도 한다"는
  기술(記述)적 표현이라 날조가 아니다. 다만 규범 문법서는 `either A or B` 를 2항 대응으로 가르치고, 시험에서
  3항 연결은 원문의 느슨한 용법에 해당한다. 학생 혼동 방지를 위해 한 줄 단서를 권한다.
- **수정 제안**: "…쓰이기도 한다" 뒤에 "(단, **어법 문제에서는 A·B 두 항 대응이 기본**이며 이 글은 원문의 느슨한 용례다)" 추가.

### [MINOR-3] `data/EX2/3.json` · `vocab[0].deriv` · `astronaut` 의 파생어로 `astronomy` 제시

- **현재값**: `astronaut 우주비행사 / deriv = astronomy 천문학`
- **무엇이 틀렸는지**: `astronomy` 는 `astronaut` 의 파생어가 아니라 `astro-` 어근만 공유하는 별개 단어다.
  파생(deriv) 칸의 다른 항목들(`weightless→weightlessness`, `ascend→ascent` 등)은 모두 진짜 파생 관계여서
  이 항목만 기준이 다르다.
- **수정 제안**: `astronautics 우주항행학` 로 교체하거나, 어근 공유임을 명시("*astro- 어근: astronomy 천문학").

### [MINOR-4] `data/EX2/2.json` · `passage[2]` · 원문과 어포스트로피 문자 불일치

- **현재값**: JSON `today’s`(U+2019) ↔ 정본 `today's`(U+0027). 나머지 4지문 전 문장은 전수 일치.
- **판정**: 조판상 오히려 JSON 쪽이 바람직하나, 정본 대조 스크립트가 diff 를 뱉으므로 기록만 남긴다.
  (같은 파일 `passage[4]` 의 `radio's` 는 U+0027 로, **한 지문 안에서 표기가 혼재**한다.)
- **수정 제안**: 지문 내 어포스트로피를 한 종류로 통일(권장: 곡선 `’`).

### [MINOR-5] `data/EX2/3.json` · `passage_corrected[2]` · 정정문의 전치사가 어색

- **현재값**: `you feel yourself pushed down on your seat`
- **무엇이 틀렸는지**: 수동으로 고칠 때 영어는 `pushed down into/against your seat` 가 자연스럽다.
  `on` 은 능동 `push down on ~` 의 결합이라, 정정문이 그대로 남으면 어색한 영어가 정답 문장으로 박제된다.
  같은 폴더 `3-variant.json` 은 이미 `pushed into your seat` 로 바꿔 쓰고 있다.
- **수정 제안**: `pushed down into your seat` (원문 훼손이 우려되면 현행 유지하되 MAJOR-1 의 단서 문장으로 보완).

---

## 정상 확인 항목 (결함 없음)

- **본문 verbatim 대조**: 4지문 32문장 전수 대조 결과, MINOR-4 의 어포스트로피 1건 외 **원문과 완전 일치**.
- **정답 유일성**: 1.json ⑤ / 2.json ③ / 3.json ③ / 4.json ③ — 오답 4개가 모두 명확히 배제 가능. 복수정답 소지 없음.
- **오답 comment**: 20개 전수 점검. 본문에 없는 날조 인용·사실 오류 **없음**.
  (2.json ⑤ automobile theft 를 "장악 ≠ 절도"로 가른 서술, 1.json ② 를 "수치 등장에 낚이는 오답"으로 규정한 서술 모두 타당.)
- **문장 번호 오지정**: `sentences[].covers` 를 passage 인덱스와 전수 대조 — **4파일 모두 1..N 빠짐/중복 없이 정확**.
  각 note·point 가 지정 문장의 실제 구조를 설명하고 있으며, 다른 문장 설명이 섞인 사례 없음.
- **상관접속사·병렬 설명(단원 핵심)**: 전수 점검 결과 아래는 모두 **정확**.
  - 1.json S4 `both A and B` 주어 → 복수 취급, 동사 `make`(≠makes) 지적 — 정확
  - 1.json S5 `not just A but also B` → `to a joke's content` ↔ `to the reaction` 전치사구 병렬 — 정확
  - 1.json S7 `not only A but also B` → `makes` ↔ `brings` 3인칭 단수 동사 병렬 — 정확
  - 2.json S5 `not only A but also B` → `were able to` 대응, A 내부 `change/adjust/switch` 3중 병렬,
    B 내부 `take/stop` 2중 병렬 — 정확 (원문 구조와 일치)
  - 2.json S6 `both A and B` → 전치사 `to` 의 목적어 `the auto industry` ↔ `the government` 명사구 병렬 — 정확
  - 3.json S7 `allow NASA to [conduct] and [test]` 병렬(⑤ 오답 근거) — 정확
  - 4.json S7 `in [detecting] and [combating]` 전치사+동명사 병렬 — 정확
  - 4.json S6 `as well as` **규칙 서술은 정확**하나 ko_full 번역이 어긋남 → MAJOR-3
- **summary_ko / main_idea_en / title_en / flow[]**: 4파일 전수 대조 — 지문 내용과 일치하며 과장·날조 없음.
  4.json summary_ko 가 "시금치가 폭발물을 **감지**할 수 있는지"로 **정정어 기준** 서술한 것은 요약문 성격상 타당
  (BLOCKER-1 과 달리 정정 화살표 표기 대상이 아님).
- **vocab[]**: 4파일 109개 항목 전수 — word 가 본문에 모두 실제 등장. meaning/syn/ant 오류는
  MINOR-3 의 deriv 1건 외 발견되지 않음. `transmission 변속기; *전송`, `demonstration 시연; *시위`,
  `balance 균형을 유지하다; *상쇄하다` 처럼 다의어에 `*` 로 문맥 의미를 병기한 처리는 적절.

## 수정 우선순위

1. **BLOCKER-1** — `4.json` 화살표 방향 2곳 (line 34, 446). 출고 전 필수.
2. **MINOR-1** — 위와 같은 문장의 ko_chunks 통일 (1과 함께).
3. **MAJOR-3** — `4.json` `as well as` 번역 2곳.
4. **MAJOR-2** — `1.json` S7 contagious↔social 대응.
5. **MAJOR-1** — `3.json` ③ 근거 서술 보강 (+ MINOR-5 전치사).
6. **MINOR-2 / 3 / 4** — 여유 시 정리.
