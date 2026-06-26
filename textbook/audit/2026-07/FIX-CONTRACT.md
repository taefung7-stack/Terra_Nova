# 2026-07 고등 교재 검수 결함 수정 계약 (서브에이전트용)

당신은 **단일 passage JSON 파일 하나**를 수정한다. 아래 4가지를 모두 적용하고,
끝나면 반드시 검증기를 돌려 ERROR 0 을 확인한다.

## 절대 규칙
- **정답 위치(answer_index)·정답 의미는 절대 바꾸지 않는다.** 길이만 손본다.
- 본문(`page1.body`)의 **사실·내용·단어 수(290~360)** 는 유지. 밑줄 태그만 추가/이동 가능.
- JSON 구조·스키마 유지. `answers.explanations`의 `q_index`/`correct`는 그대로.
- 작업 후 `node tools/validate-content.mjs --file <그 파일>` 를 **직접 실행**해서
  `FAIL`/`ERROR`가 없어야 한다. 있으면 고칠 때까지 반복.

## 이슈 1 — 정답 보기 길이 균형
- 각 `mock_objective`에서 정답 보기가 오답보다 눈에 띄게 길면, **정답을 오답들과
  비슷한 길이로 자연스럽게 줄여 재작성**한다. 의미·정답성은 유지.
- 오답을 억지로 늘리지 말 것(어색해짐). 정답을 간결화하는 방향이 우선.
- 목표: 정답 길이가 오답 평균의 1.4배 미만, 그리고 "혼자만 최장"이 아니게.
- 5개 보기의 길이가 서로 비슷한 밴드에 오도록.

## 이슈 3 — 한글 띄어쓰기 전수 교정
- `translation_ko`, `page2.textbook_tieback.body_ko`, 모든 `examples[].ko`,
  `meaning_ko`, descriptive `prompt`, `evidence`, `rationales` 등 **모든 한글**을
  맞춤법·띄어쓰기 검수. 이중 공백, 구두점 앞 공백, 괄호 안쪽 공백, 가운뎃점(·)
  주변 공백, 조사 띄어쓰기 오류 등을 바로잡는다.
- 자연스러운 표준 한국어로. 의미는 유지.

## 이슈 4 — 본문↔문제 밑줄 정합
- stem이 **"밑줄 친 …"** 으로 본문 표현을 인용하는 문제(주로 함의 추론)는:
  1) stem에 인용된 영어 구를 **본문에 실제로 있는 표현과 정확히 일치**시킨다.
     (예: 본문이 "left empty gaps on purpose"인데 stem이 "left deliberate gaps"면
      → stem을 본문 표현으로 고치거나, 본문을 stem 표현으로 자연스럽게 통일.
      둘 중 더 자연스러운 쪽. 보통 본문 표현 기준으로 stem을 맞춘다.)
  2) 본문 `page1.body`의 그 표현을 `<u>…</u>` 로 감싼다.
  3) 해당 `answers.explanations[].evidence`의 인용도 본문과 동기화.
- 본문에는 `<u>` 가 **문제에서 인용하는 표현마다** 빠짐없이 있어야 한다.

## 이슈 6 — 단어장(page4.vocab) 고급어휘 교체
- 단어장 각 단어는 **본문(page1.body)에 실제 등장**하고 **고2 이상 난이도**여야 한다.
- `element`, `column`, `bond`, `property`, `predict` 같은 중학 기초어는 빼고,
  본문에서 가장 어렵거나 학술적·저빈도인 단어로 교체한다(예: vigorously, inert,
  deliberate, periodicity, vigorous, backbone 등 본문에 실재하는 어려운 단어).
- 각 카드: `word`(본문 등장), `pos`, `meaning_ko`, `synonyms`(0~4), `antonyms`(0~4),
  `examples` **정확히 2개**(en+ko, 하나는 본문 문맥). 개수는 **10~14개** 유지.
- 새로 넣은 단어의 예문 en은 가능하면 본문 문장 또는 그 변형을 사용.

## 검증 명령 (작업 끝나고 반드시)
```
node tools/validate-content.mjs --file content/passages/<MONTH>/<NN>.json
```
- `OK` 가 떠야 완료. `WARN`은 일부 남아도 되지만(특히 vocab 다단어 어구 오탐),
  **답 길이 WARN과 밑줄 ERROR는 0** 을 목표로 한다.
- 단어 수(290~360) 깨지지 않게 주의.
