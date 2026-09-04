# 2026-09 고2 분석지 저작 브리프 (전 에이전트 공통)

작업 폴더: `mock-exam-analysis/2026-sep-grade2/data/`
참조 템플릿: `mock-exam-analysis/2026-june-grade2/data/21.json` (분석지),
`21-workbook.json` (워크북), `_VARIANT_SPEC.md` (변형).
**작성 전 반드시 위 3개 파일을 읽고 구조를 그대로 따를 것.**

`exam` 필드 값은 반드시 `"[2026] 9월 모의고사 2학년"`.

---

## A. 분석지 `{N}.json` — 필수 키 (순서 유지)

`$schema_version`("1.0"), `exam`, `question_no`, `type`, `score`,
`question_text`, `summary_ko`, `main_idea_en`, `title_en`,
`illustration{file,prompt}`, `passage[]`, `passage_ko[]`,
`choices[5]`, `vocab[25]`, `flow[4]`, `sentences[]`

### passage / passage_ko
- `passage[]` = 시험지 **원문 문장을 그대로** 한 문장씩 분리. 임의 수정·요약 금지.
- `passage_ko[]` = 같은 인덱스의 자연스러운 한국어 번역. **길이 반드시 일치.**

### choices[5]
`{no, en, ko, comment, correct}`.
- 한국어 보기 유형(목적·요지·주장·심경·내용일치)은 `en`에 원문 보기(한국어), `ko`는 부연 또는 동일.
- `comment`: 정답은 근거 문장 인용, 오답은 **왜 틀렸는지** 명시. `<strong>` 강조 사용.
- 정답 1개만 `correct:true`.

### vocab — 정확히 25개
`{word, pos, meaning, syn, ant, deriv}`. pos는 동/명/형/부/구/명구 등 한글 약어.
본문에 **실제 등장**하는 단어만. 고2 수준 이상 (중학 기초어 금지).
없으면 `"—"`.

### flow — 정확히 4개
`{emoji, title, body}`. 지문 논리 전개 4단계. body에 `<strong>` 강조.

### sentences[] — 본문 전 문장 (passage와 1:1)
`{no, tags[], en_html, ko_chunks, ko_full, note, points[], paraphrasing[]}`
- `en_html`: 원문에 의미 단위 슬래시 `<span class="slash">/</span>` 삽입 +
  핵심어 강조 `<span class="hl">`, `<span class="hl-g">`, `<span class="hl-r">`, `<span class="key">`.
  **원문 단어를 바꾸지 말 것** — 태그만 감쌈.
- `ko_chunks`: 같은 슬래시 단위로 끊어 읽는 한국어.
- `ko_full`: 매끄러운 완역.
- `note`: 어려운 문장만. `<strong>해석 도움</strong> — ...` 형식. 쉬우면 `null`.
- `points[]`: `{kind:"grammar"|"vocab"|"reading", text}` 문장당 2~3개.
- `paraphrasing[]`: **주제문·핵심문장만** `[{level:"high"|"mid"|"low", en, ko}]` 3개 세트.
  평범한 문장은 `[]`.
- `tags[]`: 해당 문장이 어떤 문제 유형에 쓰일 수 있는지.
  `"title"`(제목·요지) `"write"`(서술형) `"order"`(순서) `"insert"`(삽입). 없으면 `[]`.

### illustration.prompt — 미드저니
- **반드시** 끝에 `--ar 16:5 --v 8.1`
- 톤: 밝은 vivid, 시네마틱 에디토리얼 + 페인터리 3D 혼합. 다크 키워드 금지.
- **문장 속에 `NO xxx` 쓰지 말 것** (오히려 그 물체를 부름). 부정은 `--no a,b,c` 파라미터로.
- 글자/텍스트 차단: `--no text,letters,words,watermark,signature`
- 사람은 되도록 빼거나 원경으로 (손가락 뭉개짐).
- `file`은 `"assets/illust-{N}.png"`.

---

## B. 워크북 `{N}-workbook.json`

`21-workbook.json`과 동일 구조. 키:
`$schema_version`("1.0"), `$ref_source`("{N}.json"), `_note`,
`voca_check{en_to_ko[10], ko_to_en[10], expressions[5], definitions[5]}`,
`grammar_choice[]`, `vocab_choice[]`, `fill_first_letter[]`,
`ko_translation[]`, `jumble[]`, `sentence_translation[]`, `mixed[]`

- `grammar_choice`/`vocab_choice`: **본문 전 문장** 커버.
  `en_template`의 `{{1:A/B}}` = 양자택일. `answers[]`, `explain[]` 길이 일치.
- **⚠️ 고유명사 오탐 함정**: 빌더의 buildProperNounSet이 문두 대문자어
  (Although/While/Despite/However/Whoever 등)를 고유명사로 오판해 그 문항을
  **에러 없이 통째로 삭제**한다. 정답 토큰이 문장 맨 앞에 오지 않게 할 것.
- `fill_first_letter`: 문장당 hints 3개 `{pos, letter, answer, after}`.
- `jumble.words`: 정답 문장의 단어 배열(셔플하지 말 것, 빌더가 처리).
- `ko_translation`/`sentence_translation`: `{no, ref_sentence}` / `{no, ref_sentence, given:"ko"}`.
- `mixed`: `{kind, ref, no}` 문장 수만큼.

## C. 변형문제 `{N}-variant.json`
`_VARIANT_SPEC.md`를 **그대로** 따를 것 (경로: `2026-june-grade2/data/_VARIANT_SPEC.md`).
`$ref_source`는 `"{N}.json"`, `passage_id`는 숫자 N.

- **narrative/실용문**(18 목적, 19 심경, 26 내용일치, 43 story)은 억지 학술유형
  (주제/주장/빈칸)을 만들지 말고 **맞는 유형만** 작성.
- **⚠️ 정답 ① 쏠림 금지**: 저작하면 정답이 ①에 몰린다(실측 54.5%).
  각 유형의 `answer`를 ①~⑤에 **고르게 분산**시킬 것.
  단 grammar/vocab/irrelevant/insert는 위치가 내용에 종속되므로 예외.
- passage의 문장·underlined·blank_target·insert text는 **글자 그대로 일치**해야
  빌더가 밑줄/빈칸을 정확히 친다.

---

## 공통 품질 규칙
1. **정답 길이 균형** — 5개 보기를 비슷한 길이로. 정답만 길면 학생이 길이로 찍는다.
2. **한글 띄어쓰기** 표준 준수. 이중 공백·구두점 앞 공백 금지.
3. JSON 유효성 — 마지막 콤마 금지, 따옴표 이스케이프. 작성 후
   `node -e "JSON.parse(require('fs').readFileSync('FILE','utf8'))"` 로 검증.
4. 원문 영어는 시험지 그대로. 오탈자 교정도 하지 말 것.
