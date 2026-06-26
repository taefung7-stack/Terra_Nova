# 2026-07 구문(page3) 문법 노트 위치 교정 계약 (서브에이전트용)

당신은 **단일 passage JSON 파일 하나**의 `page3.sentences[].segments[].note` 위치만 손본다.
문법 설명(note)이 **그 설명이 가리키는 영어 표현 바로 아래**에 오도록 한다.

## 문제
렌더러는 각 segment의 `note`를 그 segment 글자 **바로 아래**에 루비로 깐다.
그런데 note가 엉뚱한(너무 넓은) segment에 붙어 있어, 설명이 가리키는 단어와 어긋난다.
- 예 [1]: `S "a simple ... test you can use ..."` 에 note "관계절" → "관계절"이 문장 전체 아래 뜸.
  실제로는 **관계대명사가 생략된 "you can use"** 아래에 와야 함.
- 예 [3]: `S "no sudden jumps ... no spots where the curve tears apart."` 에 note "관계부사 where"
  → 실제 **"where" 부분** 아래에 와야 함.

## 해결 방법: segment 쪼개기
note가 가리키는 표현이 큰 segment 안에 묻혀 있으면, 그 segment를 **여러 segment로 분리**해서
note를 정확한 조각에만 붙인다. 분리해도 **role과 텍스트 순서·내용은 보존**(이어붙이면 원문 동일).

### 예 [1] 수정 전 → 후
```
{ "role":"S", "text":"a simple, almost childlike test you can use for a continuous function.", "note":"관계절" }
```
↓ 쪼갬 (관계대명사 생략 구간만 note)
```
{ "role":"S", "text":"a simple, almost childlike test" },
{ "role":"S", "text":"you can use", "note":"관계절(목적격 생략)" },
{ "role":"S", "text":"for a continuous function." }
```

### 예 [3] 수정 전 → 후
```
{ "role":"S", "text":"no sudden jumps, no empty holes, and no spots where the curve tears apart.", "note":"관계부사 where" }
```
↓
```
{ "role":"S", "text":"no sudden jumps, no empty holes, and no spots" },
{ "role":"M", "text":"where the curve tears apart.", "note":"관계부사 where" }
```
(관계절은 보통 수식어 M 로 분류. 역할은 문법적으로 적절히.)

## 규칙
1. **모든 문장의 모든 note**를 점검. note가 가리키는 표현과 segment 글자가 정확히 일치하도록.
2. 어긋나면 segment를 쪼개거나 note를 옳은 segment로 옮긴다.
3. segment들의 `text`를 순서대로 이으면 **원래 영어 문장과 동일**해야 한다(단어·구두점 보존,
   공백은 segment 사이 1칸). 띄어쓰기/단어를 바꾸지 말 것.
4. `role`은 S/V/O/C/M/CONJ/REL 중 문법적으로 맞게. 관계절·부사절은 보통 M(또는 REL).
5. `grammar_note`(문장 전체 요약)는 그대로 두거나 자연스럽게 유지.
6. note 텍스트는 짧고 정확하게(예: "관계대명사 목적격 생략", "관계부사 where", "분사구문",
   "to부정사 부사적용법" 등). 가리키는 대상과 위치가 맞는 게 핵심.
7. **page3 외 다른 페이지(page1/2/4·정답)는 건드리지 말 것.** 본문·문제·단어장 변경 금지.
8. `translation_ko`도 건드리지 말 것(문장 수·[n] 마커 유지).

## 검증 (작업 끝나고 반드시)
```
node tools/validate-content.mjs --file content/passages/<MONTH>/<NN>.json
```
- `OK` 유지(이 작업은 스키마/단어수에 영향 없어야 함). page3 sentences 수는 그대로,
  segment만 늘 수 있음.
- 가능하면 `node -e`로 각 문장 segments.text 이어붙여 원문과 같은지 자가확인.
