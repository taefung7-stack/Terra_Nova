# 변형문제 JSON 작성 스펙 (build-variant.mjs 용) — 고1 6월

각 지문마다 `{N}-variant.json` 한 개. 빌더는 `by_type` 의 유형별 객체를 읽어
유형별로 묶어 책을 만든다. 없는 유형 키는 건너뛴다.

## 최상위
```json
{
  "$schema_version": "variant-v0.3-type-grouped",
  "$ref_source": "{N}.json",
  "passage_id": {N},
  "topic_ko": "한 줄 주제",
  "by_type": { ... }
}
```

## by_type 키 (있는 것만 작성)
모든 객관식 유형의 `passage` 는 원문을 **새로 패러프레이즈한** 문장 배열(원문 문장 수에 맞춤).
유형마다 passage 를 **다르게** 패러프레이즈한다(같은 지문이라도). 보기는 영어 5개(요지/주장/목적/심경/내용일치 등 한국어 보기 유형은 한국어).

- **theme** `{passage[], choices[5] EN, answer(1-5), explanation_ko, distractor_ko}` — 주제
- **claim** 동일 구조 (한국어 보기) — 주장
- **gist** 동일 (한국어 보기) — 요지
- **title** `choices` 영어 — 제목
- **implication** `{passage[], underlined:"본문 속 정확히 일치하는 어구", choices[5] EN, answer, ...}` — 함축
- **grammar** `{passage[], underlines:[{no,sent_index,text,correct,fix?}]×5, choices:["①".."⑤"], answer, explanation_ko, distractor_ko}` — 어법
- **vocab** grammar 와 동일 구조 — 어휘
- **blank** `{passage[], blank_sentence_index, blank_target:"본문 속 가릴 어구", choices[5] EN, answer, ...}` — 빈칸
- **irrelevant** `{intro, sentences[5], choices:["①".."⑤"], answer, ...}` — 무관 문장(한 문장을 주제 이탈로)
- **order** `{given, blocks:{A,B,C}, choices:["(A) - (C) - (B)"...], answer, ...}` — 순서
- **insert** `{insert_sentence, passage_marked:[{text, slot_after}], choices:["①".."⑤"], answer, ...}` — 삽입
- **summary** `{passage[], summary_template:"... __(A)__ ... __(B)__ ...", options:[{no,A,B}]×5, answer, ...}` — 요약
- **writing** `[ {subtype, subtype_label, question, ...} ]` — 서술형 4~6개

### writing subtype 들
- `word_order` `{ko_prompt, words[], answer, explanation_ko}`
- `conditioned_write` `{ko_prompt, conditions[], answer, explanation_ko}`
- `fill_blank` `{show_passage?:true, context:"...___...", answer, explanation_ko}`
- `translate_ko` `{en_prompt, answer(한국어), explanation_ko}`
- `summary_word` `{show_passage?:true, summary:"...(A)___...(B)___...", answer_a, answer_b, explanation_ko}`

## 절대 규칙
1. **정답이 명확히 1개**. 오답은 매력적이되 분명히 틀려야 함.
2. **passage 의 문장 배열·underlined·blank_target·insert text 는 본문에 글자 그대로 존재**해야 빌더가 밑줄/빈칸을 정확히 친다(esc 후 indexOf replace). target 은 짧고 그 문장 안에서 **유일**하게.
3. **★ grammar/vocab 의 핵심**: "틀린 것 고르기"이므로 **틀린 형태(어법 비문법형 / 어휘 반의어·오답 낱말)를 passage 문장에 실제로 넣고**, 그 밑줄을 `correct:false` + `fix:"올바른 형태"` 로 표기, `answer` = 그 밑줄 no. 나머지 4개는 진짜로 옳아야 함. (정답 낱말을 본문에 그대로 노출하면 '오답 없는 문항'이 됨 — 금지.)
4. 영어는 고1 수준의 자연스러운 문장. 한국어 해설 간결·정확.
5. JSON 유효성(마지막 콤마 금지, 따옴표 이스케이프).
6. narrative/실용문(목적·심경·내용일치·story)은 억지 학술유형(주제/주장/빈칸/함축/무관) 금지, **맞는 유형만**.
   - 18(목적): grammar,vocab,order,insert,summary,writing
   - 19(심경): grammar,vocab,order,insert,summary,writing
   - 26(인물 내용일치): theme(발문을 내용일치로, 한국어 보기 5개 중 1개 거짓)+grammar,vocab,order,insert,summary,writing
   - 43(story): order,insert,grammar,vocab,summary,writing (학술유형 없음)
