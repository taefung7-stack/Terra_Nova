# 2026-07 구문(page3) 빈칸 문장 = 정답 채운 완전 문장 분석 계약 (서브에이전트용)

당신은 **단일 passage JSON 하나**의 page3에서 **빈칸(`____`)이 들어간 문장**을,
**정답 단어를 채운 완전한 문장**으로 바꿔 분석한다.

## 배경
- `page1.body`에는 빈칸 추론용 `<blank>`이 하나 있다(문장 중간/끝).
- page3의 대응 문장 segment 중 하나에 리터럴 `____`(또는 `<blank>`)가 들어 있다.
- 구문 분석은 학습용이므로 **빈칸이 아니라 정답이 채워진 완전한 문장**을 보여야 한다.

## 정답 단어 찾기
1. `<blank>`이 묻는 빈칸의 정답을 찾는다. 보통 `page2.questions` 중 **빈칸 추론**
   (style "빈칸 추론" 또는 stem에 "빈칸") 문제의 정답:
   `choices[answer_index]`. (그 문제의 `answers.explanations[].correct`와 일치)
2. 본문 `<blank>` 자리에 그 정답 단어(구)를 넣었을 때 자연스러운 완전한 문장이 되는지 확인.

## page3 수정
- `____`(또는 `<blank>`)가 든 segment에서 **`____`를 정답 단어로 치환**하고,
  필요하면 segment를 쪼개 **정답 단어의 문법 역할**(보통 목적어 O 또는 보어 C)을 보이게 한다.
  예) 전: `{ "role":"V", "text":"turning the empty boxes on a simple chart into a map of future ____.", "note":"분사구문 turn A into B + 빈칸" }`
      후(2개): `{ "role":"V", "text":"turning the empty boxes on a simple chart into a map of future", "note":"분사구문 turn A into B" }`,
              `{ "role":"O", "text":"discoveries.", "note":"전치사 into의 목적어" }`
  (역할·분해 방식은 문장 구조에 맞게. 핵심은 '빈칸' 표기를 없애고 정답 단어를 자연스럽게 분석.)
- 그 문장의 `grammar_note`(문장 요약)에서 '빈칸' 언급이 있으면 정답 반영해 자연스럽게 수정.

## translation_ko도 동기화
- `translation_ko`에서 그 문장의 `[n]` 해석이 `____`/'빈칸'/공란으로 끝나면,
  **정답에 해당하는 한국어**를 넣어 완전한 해석으로 만든다.
  예) `...미래의 ____의 지도로 바꾼다.` → `...미래의 발견의 지도로 바꾼다.`
- 다른 문장 `[n]`은 건드리지 말 것. `[n]` 개수=문장 수 유지.

## 절대 규칙
- **page1.body의 `<blank>`은 그대로 둔다**(본문은 빈칸 유지 — 문제로 풀어야 하므로).
- page2 문제·정답·page4 단어장은 건드리지 말 것.
- page3 segment를 이어붙이면 '정답이 채워진 완전한 영어 문장'이 되어야 한다(자연스러운 영어).
- 정답 단어는 본문 맥락·문제 정답과 정확히 일치.

## 검증 (끝나고 반드시)
```
node tools/validate-content.mjs --file content/passages/<MONTH>/<NN>.json
```
- `OK` 유지. page3 sentences 수 동일. `____`/`<blank>` 가 page3에 **남아있지 않아야** 한다.
- 자가확인: page3에서 `____` grep → 0건.
