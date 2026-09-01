# 신목고 세계문학 Unit 1 — 저작 스펙 (에이전트 공용)

참조 구현: `mock-exam-analysis/_oneoff-신서고-YBM-L1/data/L1/{1,1-workbook,1-variant}.json`
**반드시 위 3개 파일을 먼저 읽고 같은 스키마·같은 밀도로 쓸 것.**

## 산출물 (챕터 N당 3개)

| 파일 | 내용 |
|------|------|
| `data/U1/N.json` | 본문 분석지 |
| `data/U1/N-workbook.json` | 워크북(9-STEP) |
| `data/U1/N-variant.json` | 변형문제(11유형 + 서술형 6) |

## 절대 규칙

1. **`passage` 는 `_SOURCE-U1.js` 와 verbatim 일치.** 게시글 문장 다음에 댓글 문장을
   순서대로 이어붙인 하나의 배열이다(댓글도 본문의 일부로 취급). 구두점·따옴표까지 동일.
   한 글자라도 바꾸면 `verify.mjs` 가 차단한다.
2. `passage_ko.length === passage.length` — 해석 누락 0.
3. 분석 카드(`sentences`)의 `en_html` 을 이어붙이면 `passage` 전문과 일치해야 하고,
   `covers` 가 1..N 을 빠짐없이 1회씩 오름차순 커버해야 한다. 짧은 문장 병합은 허용.
4. `choices` 는 정확히 5개, `correct: true` 는 정확히 1개, 모든 보기에 `comment` 필수.
5. **정답 길이 균형** — 정답 보기가 오답보다 눈에 띄게 길면 안 된다(길이로 찍힘).
6. `vocab` 는 **본문에 실제 등장하는 단어**만. 학년 수준 이상의 어휘를 고른다.
7. 한글은 표준 띄어쓰기. 이중 공백·구두점 앞 공백 금지.

## 워크북 함정 (반드시 준수)

`build-workbook.mjs` 의 `buildProperNounSet` 은 **문두에만 나오는 대문자 단어**를
고유명사로 오판해, 그 단어가 정답인 양자택일 문항을 **에러 없이 삭제**한다.
→ **문두 단어를 `{{n:A/B}}` 정답 슬롯으로 쓰지 말 것.** 토큰은 문장 중반으로 옮긴다.
예: `{{1:Although/Despite}} ... offers` (✗) → `Although ... {{1:offers/offer}}` (○)

`grammar_choice` / `vocab_choice` 의 `en_template` 은 **정답 A 를 넣어 복원하면
본문 원문과 구두점까지 정확히 일치**해야 한다(verify-workbook 이 강제).

## 변형문제 함정 (반드시 준수)

빌더는 밑줄·빈칸을 **passage 안에서 문자열을 찾아 치환**한다.
`underlines[].text` / `blank_target` / `underlined` 가 그 유형의 `passage` 에
**문자 그대로 없으면 에러 없이 조용히 사라진다.**
→ 패러프레이즈 문장을 다듬은 뒤 반드시 대상 문자열이 그대로 살아 있는지 확인할 것.

- 어법·어휘 유형: 밑줄 정확히 5개, 그중 틀린 것 정확히 1개(`correct:false` + `fix`).
- 삽입 유형: 슬롯 1~5.
- 요약 유형: `summary_template` 에 `__(A)__` / `__(B)__` 표기(언더스코어 2개+괄호).
- 각 유형의 `passage` 는 **원문 그대로가 아니라 패러프레이즈**(변형문제이므로).

## 삽화

`illustration.prompt` — `--ar 16:5 --v 8.1` 고정.
톤: **실사 포토리얼**. 밝기는 형용사가 아니라 조명 조건으로 지정
(`natural soft diffused daylight`, `bright overcast sky`, `high-key exposure`, `low contrast`).
금지어: `cinematic` `golden hour` `sunlit` `dramatic lighting` `moody` `neon` `night`
— 단 `NO ~` 배제절 안에서는 써야 한다. 인물은 `NO visible face`(손·뒷모습·실루엣).
챕터마다 `NO ...` 로 다른 챕터 소재를 배제해 4장이 비슷해 보이지 않게 한다.

## 공통 메타 (분석지 JSON 상단)

```json
"$schema_version": "1.0",
"exam": "신목고 2-2 중간 · 세계문학",
"question_no": <챕터번호>,
"subtitle": "<소제목>",
"hide_answer": true,
"hide_brand": true,
"hide_head_no": true,
"type": "주제",
"score": 3
```
