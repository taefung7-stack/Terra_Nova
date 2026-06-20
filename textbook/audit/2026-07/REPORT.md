# 2026-07 고등 교재 검수 리포트

> 생성: 2026-06-20T05:10:43Z · 멀티에이전트 4관점 병렬 검수 + 적대검증

| 학년 | 차단 | 권고 | 경미 |
|------|------|------|------|
| 고1 Saturn | 10 | 42 | 22 |
| 고2 Jupiter | 7 | 49 | 35 |
| 고3 Sun | 1 | 38 | 27 |
| **합계** | **18** | **129** | **84** |

🚫 **차단 결함 18건 — 수정 후 업로드해야 함.** 가장 빈번한 유형: page3 번역에 빈칸 정답 노출.

---

## 고1 Saturn — 차단 10 · 권고 42 · 경미 22

### 🚫 차단 결함 (판매 전 필수 수정)
- **고1 Saturn #3** [translation] 빈칸 정답을 사전에 공개하여 학습자용 지문으로 부적절함  
  - 위치: `page3, 문장 19번 (translation_ko)`  
  - 근거: 원문: 'Seeing this map of zones teaches us that difference is not a problem to fix but a pattern to ____, shaped by the land each group calls home.' / 번역: '이 권의 지도를 보는 것은, 차이가 고쳐야 할 문제가 아니라 이해하고 존중해야 할 패턴, 곧 각 집단이 고향이라 부르는 땅이 빚은 패턴임을 우리에게 가르쳐 준다.' — 원문의 빈칸 공간이 한글 번역에서 '이해하고 존중해야 할'로 선택지를 미리 삽입됨  
  - 권고: 번역에서도 원문처럼 빈칸을 유지하거나, 또는 빈칸을 명시해야 함. 예: '차이가 고쳐야 할 문제가 아니라 ____할 패턴' 형태로 번역하여 학생이 직접 채우도록 유도해야 함.
- **고1 Saturn #4** [explanation] Grammar note에 본문과 무관한 텍스트 기재 — 'so 결과 (sound 형용사보어)'는 이 문장의 구조와 맞지 않음  
  - 위치: `page3 > sentences[7] (Sentence 8, index 8)`  
  - 근거: 파일 310-316줄, 문장 본문: "This happens because every single medium shapes the same plain message in its own particular way." — 이는 이유절(because)을 설명하는 문장이며, "sound 형용사보어"는 본문 어디에도 나타나지 않음. Sentence 7(index 7)과 동일한 구조인데 정상 기술됨.  
  - 권고: grammar_note를 "자동사 + because 이유절"로 수정 (Sentence 7과 동일)
- **고1 Saturn #4** [explanation] Grammar note가 실제 문장 구조를 설명하지 못함 — '동명사 주어 + mean (that)절'은 이 문장의 문법 구조가 아님  
  - 위치: `page3 > sentences[17] (Sentence 18, index 18)`  
  - 근거: 파일 567-590줄, 문장 본문: "Would the very same story feel quite different if you met it somewhere else?" — 이는 조건절(if)을 포함한 의문문이며, 동명사 주어는 없음. 이 grammar_note는 Sentence 19(index 19)의 "It simply means you stay awake..." 구조를 설명하는 것으로 보임(오배치).  
  - 권고: grammar_note를 "의문문 (feel 형용사보어 + if 조건절)"로 수정
- **고1 Saturn #4** [explanation] 구문 역할 오태깅 — '2형식'이지만 C(보어)와 M(수식어)의 구분이 모호하게 표기됨  
  - 위치: `page3 > sentences[11] (Sentence 12, index 12)`  
  - 근거: 파일 442-450줄, 문장 본문: "The medium is never a clear glass window." — "never"는 M(부사), "a clear glass window"는 C(보어)인데, 현재는 "never a clear glass window."를 통합된 M 역할로만 표기함. 2형식(SVC) 문장에서 V=is, C=a clear glass window가 명확해야 함.  
  - 권고: segments를 분리하여 "never"(M)와 "a clear glass window"(C)를 구별하여 표기
- **고1 Saturn #4** [translation] 신문의 특성에 대한 영문 원문 누락. 번역 문장 [7]과 [8]이 동일한 내용(매체가 메시지를 빚는 이유)을 반복하면서, 영문 본문의 'A newspaper has plenty of room for detail, so it sounds careful, calm, and complete.'이 번역되지 않음.  
  - 위치: `page3.translation_ko, 문장 [7]-[8]`  
  - 근거: 영문: 'This happens because every single medium shapes the same plain message in its own particular way. A newspaper has plenty of room for detail, so it sounds careful, calm, and complete.' | 번역: [7]과 [8]에서 신문에 대한 설명문이 없고, 두 문장이 같은 내용을 반복함.  
  - 권고: 번역 문장 [8]을 '신문은 세부 사항을 위한 충분한 공간이 있어서, 차분하고 차근차근하고 완벽해 보인다.'와 같이 수정하여 원문의 신문 설명을 포함시켜야 함.
- **고1 Saturn #7** [translation] The Korean translation fills in the blank with a specific word '예외' (exception), but the English source contains a blank '____?' intended for students to fill in. The blank should remain unfilled in the translation, or if clarification is needed, it should indicate that the answer is '반례'(counterexample) based on the passage content, not '예외'(exception). This compromises the reading comprehension question.  
  - 위치: `page3.translation_ko - Sentence 19`  
  - 근거: EN source: '"can you find even one honest ____?"' vs. KO translation: '"단 하나의 정직한 예외라도 찾을 수 있는가?"' The English preserves the blank for student response; the Korean prematurely supplies '예외'. The passage emphasizes '반례'(counterexample) as the key concept throughout.
- **고1 Saturn #13** [explanation] 문법 역할 태깅의 구조적 오류: 세미콜론 이후 독립절이 M으로 잘못 태깅됨  
  - 위치: `page3, sentence 18, segments line 550-567`  
  - 근거: 원문: "The deepest lesson here is that math is not really about scary symbols at all; it is about simple, trustworthy ____ you can count on, giving the same answer for the same question, every single time."

파일 태깅 (line 563-567):
- role M, text: "about simple, trustworthy ____ you can count on, giving the same answer..."

문제: 세미콜론(;) 이후 "it is about..."은 문법적으로 독립절(independent clause)이며, 이전 절과 병렬 구조임. M(수식어)이 아니라 별도의 S-V 구조를 가져야 함. "about"은 전치사이므로 C(보어)의 일부이지 M이 아님.  
  - 권고: 세미콜론 이후 내용을 올바르게 재태깅할 것:
- S("it")
- V("is")
- C("about simple, trustworthy ____ you can count on, giving the same answer for the same question, every single time.")
그리고 "giving..."은 분사구문 M으로 명시하거나 동격 표기를 추가할 것.
- **고1 Saturn #13** [translation] 빈칸 시험 정답 노출 - 번역에서 빈칸 위치에 이미 단어를 삽입하여 학생이 추론하기 전에 정답을 읽게 됨  
  - 위치: `page3.translation_ko, 문장 18`  
  - 근거: 영문: "it is about simple, trustworthy <blank> you can count on" / 한글: "그것은 네가 믿고 의지할 수 있는, 같은 질문에 매번 같은 답을 주는 단순하고 믿을 만한 연결 규칙에 관한 것이다." - 영문은 빈칸 + 관계절(you can count on) 구조인데, 한글은 빈칸에 '연결 규칙'을 직접 삽입했으므로 page2.questions[1]의 빈칸 추론 정답(rules of connection 또는 rules)이 노출됨  
  - 권고: 한글 번역을 "그것은 네가 믿고 의지할 수 있는 ____, 같은 질문에 매번 같은 답을 주는 단순하고 믿을 만한 ____에 관한 것이다" 또는 유사한 구조로 수정하여 빈칸을 명시적으로 표기
- **고1 Saturn #15** [explanation] 본문 인용 오류 — "travel together"가 본문에 없음  
  - 위치: `page3, answers.explanations[2] (Q2 - 빈칸 추론)`  
  - 근거: explanations[2].evidence: "4번은 세 목표가 \"almost never travel together\"라 하고" — 그러나 실제 본문 Sentence 4는 "almost never come together"라고 명시. "travel"이라는 단어는 본문 전체(page1, page3)에 없음.  
  - 권고: 증거 문구를 정정: "4번은 세 목표가 \"almost never come together\"라 하고"
- **고1 Saturn #17** [explanation] Incorrect structural role tagging: 'So many foreign traders' tagged as M (Modifier) but is the Subject  
  - 위치: `page3, sentence 10, segments[0]`  
  - 근거: Sentence 10 text: 'So many foreign traders sailed to its ports that the country's own name spread with them.' In the so...that structure, 'So many foreign traders' is the subject performing the action 'sailed', not a modifier. The current tagging shows role M with text 'So many foreign traders' which contradicts the canonical SVO order and the grammar_note stating 'so ~ that 결과절'.  
  - 권고: Change segments[0].role from 'M' to 'S' for 'So many foreign traders'. Remove the redundant segments[1] with role 'S' and text '(foreign traders)' since it duplicates the subject. The corrected structure should be: S='So many foreign traders', V='sailed', M='to its ports that the country's own name spread with them.'

<details><summary>권고 사항 42건</summary>

- 고1 Saturn #1 [explanation] Incorrect O (Object) role tagging — combines verb object with coordinated clause — `page3.sentences[11] (Sentence 12, index 12), lines 498-506`
- 고1 Saturn #1 [explanation] Incorrect role classification — marks complement as modifier — `page3.sentences[13] (Sentence 14, index 14), line 543`
- 고1 Saturn #3 [language] Tense inconsistency: Past tense verb in present-tense narrative — `page1.body, paragraph 2, sentence 13`
- 고1 Saturn #3 [explanation] Predicate adjectives mistagged as modifiers (M instead of C) — `page3, sentences array, sentence 18 (index: 18), segments`
- 고1 Saturn #3 [translation] 형용사 병렬 구조('loose, covering')의 의미 축약 — `page3, 문장 8번 (translation_ko)`
- 고1 Saturn #5 [explanation] 구문 역할 오태깅: 'like natural opposites,'가 M(modifier)으로 표기되어 있으나 2형식 동사 'are'의 보어이므로 C(complement)로 표기되어야 함 — `page3, sentence 4, segments`
- 고1 Saturn #5 [explanation] 구문 역할 오태깅: 'not that acids or bases are somehow bad.'가 M(modifier)으로 표기되어 있으나 2형식 동사 'is'의 보어이므로 C(complement)로 표기되어야 함 — `page3, sentence 18, segments`
- 고1 Saturn #5 [translation] '한 자밤'은 'a dab of baking soda'에 대한 부정확한 번역 — `[15]번 문장`
- 고1 Saturn #6 [explanation] 시제 불일치 구조에 대한 설명 누락 — `page3 > sentences[14] (Sentence 15) > grammar_note`
- 고1 Saturn #7 [explanation] 부정구조에서 V와 보어 역할 표기 부정확 — `page3 > sentences > index 5`
- 고1 Saturn #7 [explanation] 부사와 보어 역할의 혼재로 5형식 구조 오도 — `page3 > sentences > index 19`
- 고1 Saturn #7 [translation] Awkward word order and phrasing in translating 'reaches far past the math classroom'. The structure '수학 교실을 훨씬 넘어서까지 닿는' is unnatural Korean; the particle placement and verb relationship are strained. — `page3.translation_ko - Sentence 16`
- 고1 Saturn #8 [explanation] Role tagging error in comparative construction: 'the less energy' is incorrectly tagged as M (modifier) when it should be S (subject) of the verb 'remains' — `page3, sentence 12 (index 12) - segments tagging`
- 고1 Saturn #8 [explanation] Sentence reference error: The explanation cites sentence 9 ('9번') but the actual sentence containing the quoted text is sentence 12 — `answers.explanations[2] (q_index 2, 함의 추론)`
- 고1 Saturn #8 [translation] 'runs on'의 오역 - '돌아간다'는 부정확한 표현 — `page3, sentence 1 (translation_ko)`
- 고1 Saturn #9 [explanation] 구문 역할 오태깅: '주어(S)'를 '수식어(M)'로 잘못 표시 — `page3, sentences, index 9`
- 고1 Saturn #9 [explanation] 구문 역할 오태깅: '주어(S)'를 '수식어(M)'로 잘못 표시 — `page3, sentences, index 17`
- 고1 Saturn #10 [explanation] 분사구문(분사)을 동사 V로 잘못 태깅 및 구문 분석 오류 — `page3 > sentences > index 5`
- 고1 Saturn #10 [explanation] 보어절을 수식어(M)로 잘못 태깅 — `page3 > sentences > index 7`
- 고1 Saturn #10 [translation] "listen closely" 의역으로 원문의 정확한 의미 전달 부족 — `page3.translation_ko, 문장 [1]`
- 고1 Saturn #11 [explanation] "catching"의 구문 역할 오태깅 — 동사(V)로 표기하면 문장이 2개 술어처럼 보이나, 실제는 "acts"의 의미를 보충하는 분사구문(현재분사)임 — `page3 > sentences > index 12 (Sentence 12)`
- 고1 Saturn #11 [explanation] "to a visitor on a calm summer day."에 대한 note 오기재 — "look 형용사보어"라 했으나, 실제로는 간접 대상자를 나타내는 전치사구(부사)임 — `page3 > sentences > index 4 (Sentence 4)`
- 고1 Saturn #12 [explanation] 문장 인용 오류: (B) benefit 설명에서 '14번의 benefit과 일치'라고 했으나 실제로 '14번'은 'This way of thinking turns choosing into a kind of quiet math'이며 benefit이 없음 — `answers.explanations[3] (Q3 요약문 빈칸 완성) - evidence 및 rationales`
- 고1 Saturn #12 [explanation] 문장 인용 부정확: '합리적 선택은 편익과 잃는 것을 견주는 것(13~14번)'이라 했으나 실제 해당 내용은 sentence 16에 위치 — `answers.explanations[0] (Q1 요지) - evidence`
- 고1 Saturn #12 [translation] "shapes"의 부적절한 번역 — `page3.translation_ko, 문장 6`
- 고1 Saturn #13 [explanation] Role tagging error: 'turning'은 동사가 아닌 분사구문 — `page3, sentence 15, segments`
- 고1 Saturn #14 [explanation] 2형식 문장의 보어 구조 오태깅 — `page3 - Sentence 7 (index 7)`
- 고1 Saturn #14 [explanation] 2형식 문장의 보어 구조 오태깅 — `page3 - Sentence 15 (index 15)`
- 고1 Saturn #15 [language] Vocabulary mismatch: 'nice' is used in the passage, but page4 vocabulary section uses 'tempting' in the identical context — `page1.body, first paragraph, third sentence`
- 고1 Saturn #15 [explanation] "Suppose"의 구문 역할 오태깅 — `page3, sentences[0] (Sentence 1)`
- 고1 Saturn #15 [explanation] grammar_note의 구조 설명 불명확 — `page3, sentences[0] (Sentence 1) grammar_note`
- 고1 Saturn #15 [explanation] "to grow"의 구문 역할 오태깅 — `page3, sentences[13] (Sentence 14)`
- 고1 Saturn #15 [explanation] "not the same for everyone;"의 역할 오분류 — `page3, sentences[14] (Sentence 15) segments[1]`
- 고1 Saturn #16 [explanation] Sentence 4 문장 구문분석에서 보어(C)가 수식어(M)로 잘못 태깅됨 — `page3/sentences/index 4/segments`
- 고1 Saturn #17 [explanation] Incorrect sentence citation: References sentence 14 for 'openness can be a kind of strength' which actually appears in sentence 18 — `answers.explanations[1] (Q2 빈칙 추론), evidence field`
- 고1 Saturn #17 [explanation] Incorrect sentence citation: References sentence 14 for openness=strength concept which actually derives from sentence 18 — `answers.explanations[1] (Q2 빈칙 추론), rationales[0]`
- 고1 Saturn #18 [explanation] 부분 구조 분석 오류: "never made and never destroyed;"를 역할(role) "M"(수정자)로 표기했으나, 이는 수동태의 술어(predicate) 일부로서 보어(complement)에 가깝다. "is never made and never destroyed"는 2형식(linking verb + complement)의 보어 부분이므로 "C" 또는 명확히 수동태 술어로 표기하는 것이 더 정확하다. — `page3, sentence 4, segments (lines 217-220)`
- 고1 Saturn #18 [explanation] 역할 분석 부정확: "into light,"를 "M"(수정자)로 표기했으나, "turns into light"에서 "into light"는 prepositional phrase로서 동사의 목적어/보어 구조의 일부다. 다음 절 "turns into heat along the way"와의 평행 구조를 고려하면, 두 경우 모두 동일한 문법 역할이어야 한다. — `page3, sentence 5, segments (line 254-255)`
- 고1 Saturn #18 [translation] 문법 오류: '로 가는' 부분이 부자연스럽고 잘못된 의미 전달 — `page3.translation_ko - Sentence 3`
- 고1 Saturn #19 [explanation] 구문 역할 중복 및 혼동 — 세미콜론 대조절 분석 오류 — `page3/sentences[0] (Sentence 1)`
- 고1 Saturn #20 [explanation] 보어(C) 표기에 분사 수식구가 포함됨 — 구조 분석 오류 — `page3/sentences[4] (Sentence 5)`
- 고1 Saturn #20 [explanation] 목적어(O) 범위 오류 — with 분사구문이 목적어로 포함됨 — `page3/sentences[8] (Sentence 9)`

</details>

## 고2 Jupiter — 차단 7 · 권고 49 · 경미 35

### 🚫 차단 결함 (판매 전 필수 수정)
- **고2 Jupiter #1** [translation] 빈칸 문제가 있는 원문을 완성된 번역으로 제시함  
  - 위치: `page3.translation_ko, [17번 문장]`  
  - 근거: 원문: "turning the empty boxes on a simple chart into a map of future ____" (빈칸 표시 유지) vs 번역: "단순한 표의 빈 상자들을 미래의 발견의 지도로 바꾼다" (정답 선택지 중 하나인 'discoveries'가 이미 대입됨)

빈칙 채우기 문제(q_index: 1)의 정답이 'discoveries'인데, 번역문에서 학생들이 이를 미리 볼 수 있게 되어 학습 및 평가 목적에 위배됨.  
  - 권고: 번역 [17번]을 다음과 같이 수정: "그것은 또한 우리가 아직 보지 못한 것을 가리키며, 단순한 표의 빈 상자들을 미래의 ____의 지도로 바꾼다." (또는 원문 형식 유지하여 "미래의 [   ]의 지도"로 표기)
- **고2 Jupiter #2** [explanation] 정답 설명의 문장 번호가 오류: '9번'이라고 했으나 실제는 문장 16  
  - 위치: `answers - explanations[2] (Q2: the quiet promise) - evidence`  
  - 근거: 파일 evidence: "9번은 연속을 \"the quiet promise that lets the rest of calculus work\"라 하고..." → 그러나 본문 문장 9는 "Second, the limit as you move toward that point exists."이고, "the quiet promise" 표현은 문장 16에만 존재합니다: "Because continuity is the quiet promise that lets all the rest of calculus actually work."  
  - 권고: evidence를 "16번은 연속을 \"the quiet promise that lets all the rest of calculus actually work\"라 하고..."로 수정
- **고2 Jupiter #3** [explanation] Question asks about 'a brand-new mixture' but source text contains 'a brand-new mix' - these are different words with different meanings  
  - 위치: `page2 Q3 stem + page3 answers explanation`  
  - 근거: page1 body: 'the two halves later join to form a brand-new mix' (line 369 in sentences, confirmed in page1 body). page2 Q3 stem: 'a brand-new mixture가 의미하는 바로...' Students cannot correctly answer a comprehension question when the vocabulary word in the question does not match the text.  
  - 권고: Either: (A) change question stem to ask about 'a brand-new mix' (명사), or (B) verify if the source text should actually say 'mixture'. Currently, this creates a mismatch between what students read and what they are tested on.
- **고2 Jupiter #3** [explanation] The evidence quote misrepresents the source text - claims text says 'combine' when it says 'join', and 'mixture' when it says 'mix'  
  - 위치: `page3 answers explanation Q3 (line 637)`  
  - 근거: Explanation states: '"the two halves combine to form a brand-new mixture"라고 한다' but actual text reads: 'the two halves later join to form a brand-new mix' (page1 body, sentence 9 in page3 segments). The verb is wrong (join≠combine) and the noun is wrong (mix≠mixture).  
  - 권고: Correct the evidence quotation to match actual source text: 'the two halves later join to form a brand-new mix' and verify explanation logic still holds. If 'mixture' is intentional, update source text for consistency.
- **고2 Jupiter #5** [explanation] 구문 역할 오태깅: 'to blend, no matter how hard you shake the glass'가 C(보어)로 표시되었으나 실제로는 refuse의 O(대상/목적어)임  
  - 위치: `page3, sentences[0] (sentence 1), segments[2]`  
  - 근거: 본문: 'Pour oil into a glass of water and the two stubbornly refuse to blend, no matter how hard you shake the glass.' — 'refuse to do'는 '동사 + to 부정사'로 'to blend...'는 infinitive object이지만, 현재 구조에서 C로 표시됨. grammar_note에는 'refuse to V + no matter how'로 올바르게 기술했으나 role 할당이 모순됨  
  - 권고: 역할을 C에서 O로 변경하거나, 또는 'to blend'의 구문 역할을 infinitive object로 명시. 현재 문법 설명과 역할 할당의 불일치 해소
- **고2 Jupiter #12** [explanation] 잘못된 문장 번호 인용: 설명에서 "8번은 공정한 표본이 작지만 'a true mirror of the larger whole'이라 한다"고 했으나, 실제로는 문장 10에 이 표현이 있음.  
  - 위치: `answers.explanations[2] (Q2 함의 추론)`  
  - 근거: Page3 sentence 8 text: 'A spoonful taken carelessly from an unstirred pot, scooped all from the salty bottom, would badly mislead even the best cook.' / Page3 sentence 10 text: 'A fair sample is small, but it is a true mirror of the larger whole.' — 거울(mirror) 표현은 문장 10에만 있음.  
  - 권고: 설명의 문장 번호를 '8번'에서 '10번'으로 수정. '10번은 공정한 표본이 작지만 "a true mirror of the larger whole"이라 한다'로 정정.
- **고2 Jupiter #18** [translation] 한국어 번역이 영문의 빈칸을 채워버렸음 - 문제의 답을 미리 노출  
  - 위치: `page3.translation_ko, sentence 19`  
  - 근거: 영문: 'we first have to understand the forces that drive its endless ____.' (blank). 한국어: '우리는 먼저 그 끝없는 변동을 추동하는 힘들을 이해해야 한다.' (변동이 채워짐). page2의 question 2(빈칸 추론) 정답은 'change'인데, 번역문에 답이 미리 노출되어 학생이 해당 문제를 풀 수 없음.  
  - 권고: sentence 19를 다시 번역하여 빈칸을 유지: '그러므로 내일을 또렷이 생각하려면, 우리는 먼저 그 끝없는 ____을 추동하는 힘들을 이해해야 한다.' 또는 같은 의미로 빈칸 표시

<details><summary>권고 사항 49건</summary>

- 고2 Jupiter #1 [language] "react hard with water" is non-idiomatic and incorrect English — `page1.body - paragraph 2, sentence about sodium and potassium`
- 고2 Jupiter #1 [explanation] 구문분석 role 표기 불명확: 'more than tidy up what we already know'를 단일 O로 처리했으나, 'more than'은 V를 수식하는 부사구입니다. — `page3.sentences[15] (Sentence 16)`
- 고2 Jupiter #2 [explanation] "each"의 role 분류 오류 — `page3 - sentence 12 - segments role tagging`
- 고2 Jupiter #2 [explanation] 의문문 도치 구조의 V 분류 불명확 — `page3 - sentence 15 - segments role tagging`
- 고2 Jupiter #2 [explanation] "could"의 문법 분류가 불완전 — `page3 - sentence 18 - grammar_note`
- 고2 Jupiter #2 [explanation] 근거 인용이 부정확: "built a foundation strong enough to support"라고 했으나 실제 표현은 다름 — `answers - explanations[1] (Q1: foundation) - evidence`
- 고2 Jupiter #2 [explanation] 근거 인용의 문장 번호가 부정확: (B) limit의 근거로 "4번"을 제시했으나 극한이 언급되지 않음 — `answers - explanations[3] (Q3: summary) - evidence`
- 고2 Jupiter #3 [language] 용어 일관성 오류: 'brand-new mix' vs 'brand-new mixture' — `page1.body, paragraph 2, sentence 9`
- 고2 Jupiter #3 [explanation] Segmentation of appositive structure is misleading - 'cell division' is labeled as subject (S) in parallel with main clause, but it is actually an appositive explaining 'one act' — `page3 sentence 2 segmentation`
- 고2 Jupiter #3 [translation] 불완전한 문장 구조 - 술어동사 생략 — `page3.translation_ko, 문장 16`
- 고2 Jupiter #4 [explanation] evidence 필드의 문장 참조 번호 및 인용문이 부정확함 — `answers.explanations[2] (q_index 2, 함의 추론 - masks slip)`
- 고2 Jupiter #4 [translation] 영문에 없는 수식어 '정직하게' 삽입으로 의미 왜곡 — `page3.translation_ko, 문장 [9]`
- 고2 Jupiter #5 [explanation] 구문 역할과 설명의 모순: 'pulling'이 V(동사)로 표시되었으나 주석에는 '분사구문'으로 표시 — `page3, sentences[15] (sentence 16), segments[4]`
- 고2 Jupiter #6 [explanation] Evidence의 문장 참조 번호 오류 — `answers.explanations[1] (Q1 빈칸 추론)`
- 고2 Jupiter #6 [explanation] Evidence의 문장 참조 번호 오류 — `answers.explanations[3] (Q3 요약 빈칸)`
- 고2 Jupiter #7 [explanation] 구문분석에서 "관계부사 speed" 오류 태깅 — `page3 > sentences[0] (Sentence 1) > segments[5] > note`
- 고2 Jupiter #7 [translation] "gently churning"의 번역이 문법적으로 어색함 — `page3, 문장 5`
- 고2 Jupiter #7 [translation] "force its way up to build"의 번역이 부자연스러움 — `page3, 문장 9`
- 고2 Jupiter #9 [explanation] Sentence number reference error - 답변 근거에서 문장 번호 오류 — `answers.explanations[2] (Q3 함의 추론)`
- 고2 Jupiter #9 [explanation] Sentence range reference inaccuracy - 첫 번째 근거 범위 부정확 — `answers.explanations[0] (Q1 요지)`
- 고2 Jupiter #9 [translation] "하중벽"은 부정확한 번역. 원문의 "load-bearing wall"은 건축 용어로 "내력벽"으로 옮겨야 함 — `page3.translation_ko, 문장 14 [14]`
- 고2 Jupiter #10 [explanation] Evidence와 rationales에서 문장 번호 오류: "12번"과 "14번"으로 기재했으나, 인용된 구문은 실제로 문장 17과 20에 위치 — `answers.explanations[1] (q_index=1, 빈칙 추론)`
- 고2 Jupiter #10 [explanation] Evidence에서 문장 범위 오류: DNA 복제와 돌연변이 해롭지 않음을 설명하는 부분의 문장 범위가 부정확 — `answers.explanations[0] (q_index=0, 요지)`
- 고2 Jupiter #11 [explanation] 구문 역할(S/V/O/C) 오태깅: 'keep O C' 오기 — `page3 / sentences / index 9`
- 고2 Jupiter #12 [language] 관형사 "truly fairly"의 중복 및 어색한 표현 — `page1.body, 문단 2, 문장 "This quiet magic only works if the sample is chosen truly fairly."`
- 고2 Jupiter #13 [explanation] 동사 병렬 구조에서 'and'를 별도의 CONJ segment로 표시 — `page3 > sentences > index 2`
- 고2 Jupiter #13 [explanation] 수동태 술어를 두 개의 V로 분리하여 구조 오인 유발 — `page3 > sentences > index 9`
- 고2 Jupiter #14 [explanation] O 역할 분석 부정확 — 'feel physical and heavy'를 모두 O로 태깅하되, 실제는 O + C 관계 — `page3 > sentences[9] (Sentence 10)`
- 고2 Jupiter #14 [explanation] evidence의 문법 설명 오류 — 빈칸을 '주어'로 잘못 표현 — `answers > explanations[1] (q_index: 1, 빈칸 추론)`
- 고2 Jupiter #15 [explanation] 구문 역할 오태깅: "exactly where a government can step in, not to replace the market but to repair it." 부분이 M(Modifier)으로 태깅되었으나, 링킹동사 is의 보어절이므로 C(Complement)로 태깅되어야 함 — `page3 > sentences > sentence 13 > segments[2]`
- 고2 Jupiter #15 [explanation] 문장번호 오류: Q4(요약문) 답안 설명에서 "12번 government"이라고 잘못 인용함 — `answers > explanations > q_index 3 > evidence`
- 고2 Jupiter #15 [explanation] 문장번호 오류: Q1(요지) 답안 설명에서 "(12~13번)"이라고 인용하였으나 정부 언급은 13번에만 있음 — `answers > explanations > q_index 0 > evidence`
- 고2 Jupiter #16 [explanation] Incomplete segmentation of watch + object pattern in perceptual verb construction — `page3 sentences[0] (Sentence 1)`
- 고2 Jupiter #16 [explanation] Structural segmentation error in 'the...the' comparative correlation construction — `page3 sentences[13] (Sentence 14)`
- 고2 Jupiter #16 [explanation] Incorrect sentence reference in evidence of answer explanation — `answers.explanations[0] (Q0 요지 - main idea)`
- 고2 Jupiter #16 [explanation] Same citation error as Q0 explanation - incorrect sentence reference — `answers.explanations[1] (Q1 빈칸 추론 - blank inference)`
- 고2 Jupiter #16 [explanation] Sentence number error in evidence quotation — `answers.explanations[2] (Q2 함의 추론 - implication)`
- 고2 Jupiter #17 [language] 사역동사 구조의 모호성: 'let us follow the function rise and fall'에서 'follow'는 타동사인데 '목적어 + 원형동사' 구조가 고2 학생에게 명확하지 않을 수 있음 — `page1.body, Sentence 15 (line: 'Reading the sign of the derivative therefore lets us follow the function rise and fall without plotting every single point.')`
- 고2 Jupiter #17 [explanation] 동격 구조 표현 혼동 — `page3, sentence 11, segments (role C)`
- 고2 Jupiter #17 [explanation] 분사구문의 오태깅 — `page3, sentence 14, segments (role V for 'flattening')`
- 고2 Jupiter #17 [explanation] 명령문과 주절의 역할 구분 모호 — `page3, sentence 19, structure`
- 고2 Jupiter #17 [explanation] 문장 번호 오류 및 근거 부정확 — `answers.explanations[0], Q0 (요지)`
- 고2 Jupiter #17 [explanation] 인용 문장 번호 오류 — `answers.explanations[2], Q2 (함의 추론)`
- 고2 Jupiter #17 [explanation] 인용 문장 번호 부정확 — `answers.explanations[3], Q3 (요약문)`
- 고2 Jupiter #18 [explanation] 문법 역할 오태깅: 'much more likely'이 M(modifier)로 표기되었으나 C(complement/보어)로 표기되어야 함 — `page3.sentences[17] (sentence 18), segments role tagging`
- 고2 Jupiter #19 [explanation] Role 태깅 혼재 - leave O C 구조에서 O와 C 경계 불명확 — `page3 > sentences[4] (Sentence 5, lines 232-266)`
- 고2 Jupiter #19 [explanation] 본문 문장 번호 인용 오류 — `answers > explanations[2] (Q3 함의 추론, line 700)`
- 고2 Jupiter #20 [explanation] 가정법(conditional) 표기가 부정확함. 'Suppose' 절은 명령문 + 가정 구조이지, 전형적인 가정법(조건절)이 아님. — `page3, Sentence 1 - grammar_note`
- 고2 Jupiter #20 [explanation] 'stop -ing' 표기가 문법 현상을 정확히 반영하지 못함. 실제 문장 구조는 'stop + being'(진행형 결합)이므로, 단순 'stop -ing' 패턴과 구별 필요. — `page3, Sentence 6 - grammar_note`

</details>

## 고3 Sun — 차단 1 · 권고 38 · 경미 27

### 🚫 차단 결함 (판매 전 필수 수정)
- **고3 Sun #6** [explanation] 근거 문장 번호 오류: Evidence에서 '11번'이라고 명시했으나 실제 인용 문장은 Sentence 14  
  - 위치: `answers.explanations[2] (Q3 함의 추론)`  
  - 근거: 파일 line 661-664: 'evidence'에서 '11번은 "Because the blame is so scattered, each party finds it easy to feel personally innocent..."'라고 기술. 그러나 JSON의 page3.sentences 배열에서 해당 텍스트는 index 14 (line 454-478의 Sentence 14)에 위치. translation_ko의 [11]번 문장('[11] 하나의 무해한 목적을 위해 모은 데이터가...')과 일치하지 않음.  
  - 권고: Evidence의 문장 번호를 '11번'에서 '14번'으로 수정. 또는 번역본의 문장 번호(Sentence index)와 한국어 번역 분절 번호([] 표기)를 명확히 구분하여 혼동 방지.

<details><summary>권고 사항 38건</summary>

- 고3 Sun #1 [explanation] evidence와 rationales의 문장 참조 오류 — `answers.explanations[1] (Q1 빈칸 추론)`
- 고3 Sun #2 [explanation] Grammar note 분사구문 오태깅 — 실제 구조는 appositive 명사구(동격)이지 분사구문이 아님 — `page3 > sentences > index 10 (Sentence 11)`
- 고3 Sun #2 [explanation] 증거 문장 인용 부정확 — 벡터 정의가 4·6번이 아니라 5번에 있음 — `answers > explanations > q_index 0 (main idea answer)`
- 고3 Sun #3 [explanation] S/V/O/C/M 역할 태깅 오류: 'C(to completion ... ATP out)'로 표기된 부분은 실제로 두 개의 병렬 동사 구조로, 정확한 분석이 필요 — `page3 > sentences > index 4`
- 고3 Sun #3 [explanation] 의문문의 '주어와 목적어' 구분 오류: 'what'을 M(부사)로 표기했으나 실제로는 O(직목) — `page3 > sentences > index 10`
- 고3 Sun #4 [explanation] 보어(C) 역할이 M(수식어)으로 잘못 표기됨 — `page3, sentence 4 (index 4), segment roles`
- 고3 Sun #4 [translation] "Loyalty to the page"의 번역에서 핵심 대비 관점 누락 — `page3.translation_ko, 문장 [14]`
- 고3 Sun #5 [explanation] 사역동사 let 구문에서 보어(C) 역할 오태깅 — `page3, sentence 7, segments (lines 293-322)`
- 고3 Sun #5 [explanation] 목적어와 부사구 역할 미분리 — `page3, sentence 1, segments (lines 141-168)`
- 고3 Sun #5 [explanation] 콜론으로 도입되는 설명절 구조 표기 모호 — `page3, sentence 9, segments (lines 367-396), grammar_note (line 396)`
- 고3 Sun #6 [explanation] Evidence의 근거 제시가 부정확: '5·10번의 책임 분산 논의'라고 했으나 Sentence 10은 책임과 무관 — `answers.explanations[1] (Q2 빈칸 추론)`
- 고3 Sun #6 [translation] 부정확한 의역 '돌아가는' — `page3.translation_ko, sentence 18`
- 고3 Sun #7 [explanation] 콜론 구조의 불완전한 분석 - "a clear meaning: the source is moving away"의 관계 설명 미흡 — `page3 > sentences[2] (Sentence 3)`
- 고3 Sun #8 [explanation] Evidence citation references wrong sentence number — `answers.explanations[1] (Q_index 1, blank-filling question)`
- 고3 Sun #8 [explanation] Complement (C) incorrectly tagged as modifier (M) in linking verb sentence — `page3.sentences[11] (Sentence 12 - segment role tagging)`
- 고3 Sun #8 [explanation] Complement (C) incorrectly tagged as modifier (M) in infinitive complement — `page3.sentences[12] (Sentence 13 - segment role tagging)`
- 고3 Sun #9 [explanation] 구문 역할 태깅 오류: 부사를 목적어로 표시 — `page3, sentences[11] (Sentence 12), segments[6]`
- 고3 Sun #9 [explanation] 구문 역할 태깅 오류: 보어를 수식어로 표시 — `page3, sentences[18] (Sentence 19), segments[2]`
- 고3 Sun #9 [translation] quieter interests를 '더 조용한 이익들'로 번역하여 은유적 의미가 손실됨 — `[16]`
- 고3 Sun #10 [explanation] 구문 역할 태깅 오류: 'Hidden inside this ordinary scene'이 M(수식어)로 표시되었으나, 도치 구문에서 보어(C)로 기능함 — `page3 > sentences[2] (index 3) > segments[0]`
- 고3 Sun #11 [explanation] 구문분석 보어(C)가 수식어(M)로 오태깅됨 — `page3 > sentences > sentence 6`
- 고3 Sun #11 [explanation] 구문분석 보어(C)가 수식어(M)로 오태깅됨 — `page3 > sentences > sentence 13`
- 고3 Sun #13 [explanation] There의 구문 역할 오태깅 — `page3 > sentences[14] (Sentence 15)`
- 고3 Sun #13 [explanation] to be balanced의 역할 오설명 — `page3 > sentences[14] > grammar_note`
- 고3 Sun #14 [explanation] M(modifier) 역할 오태깅 — `page3, sentences[0] (Sentence 1)`
- 고3 Sun #14 [explanation] 부사 simply을 보어에 포함시킴 — `page3, sentences[6] (Sentence 7)`
- 고3 Sun #14 [translation] 숙어 번역의 부정확성 - 의미 전달은 되나 표현이 어색 — `page3.translation_ko, 문장 [13]`
- 고3 Sun #16 [translation] Mistranslation of 'running your phone' — `page3.translation_ko, sentence 16`
- 고3 Sun #16 [translation] Imprecise translation of 'carefully imperfect' — `page3.translation_ko, sentence 17`
- 고3 Sun #17 [explanation] 해설의 근거 제시 불완전 — "12번"만 인용하여 균형점 개념 설명이 부실 — `answers.explanations[1] (빈칸 추론, Q index 1, line 633)`
- 고3 Sun #18 [explanation] There be 구문에서 "There were"의 role 오태깅 — `page3, sentences[index: 1, 문장 2번]`
- 고3 Sun #18 [explanation] 2형식 문장에서 보어(C)를 수식어(M)로 오태깅 — `page3, sentences[index: 11, 문장 12번]`
- 고3 Sun #18 [explanation] 의문문에서 조동사 will의 구조적 오해석 — `page3, sentences[index: 12, 문장 13번]`
- 고3 Sun #18 [explanation] 2형식 문장에서 보어(C)를 수식어(M)로 오태깅 — `page3, sentences[index: 14, 문장 15번]`
- 고3 Sun #19 [explanation] 세미콜론 이후 독립절의 구조 표시 순서 부정확 — `page3.sentences[2] (Sentence 3)`
- 고3 Sun #19 [explanation] 'starve a forest of rain and its capacity to store carbon collapses'의 구조 부정확 — `page3.sentences[8] (Sentence 9)`
- 고3 Sun #20 [explanation] Sentence 5에서 '"over us, powerful"을 M(Modifier)으로 표기했으나, "powerful"은 주어보어(C)여야 함 — `page3 > sentences > index 5`
- 고3 Sun #20 [explanation] Sentence 8에서 마지막 O 표기 범위 오류 — `page3 > sentences > index 8`

</details>
