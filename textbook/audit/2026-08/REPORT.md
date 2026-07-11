# 2026-08 고등 교재 검수 리포트

> 생성: 2026-07-11 · 멀티에이전트 4관점 병렬 검수(언어·해설·번역·정답) + 적대검증
> 대상: `2026-08-Saturn(고1)`·`2026-08-Jupiter(고2)` 풀북 각 20지문(총 40지문)

| 학년 | 차단 | 권고 | 경미 |
|------|------|------|------|
| 고1 Saturn | 0 | 16 | 17 |
| 고2 Jupiter | 1 | 42 | 28 |
| **합계** | **1** | **58** | **45** |

## 판정 요약

- 🚫 **차단(내용) 1건 → 수정 완료**: 고2 Jupiter #12 빈칸 정답(`randomness`, 불가산 단수) 대입 시 관계절 `that quiet randomness obey`가 주술 수일치 위반 비문 → `obeys`로 정정(body + page3 REL). validator 통과.
- 🖍️ **차단(시각/글리프) 1건 → 수정 완료**: 두 교재 전 지문의 아포스트로피 `'`(U+0027)가 Pretendard `.notdef`로 공백화되어 `energy's`가 `energy s`로 깨짐. `styles/tokens.css` PretendardTN unicode-range에 U+0027 추가 → 단일지문 재렌더로 정상 확인. **⚠️ 두 풀북 PDF 재빌드 필요**(현 dist PDF는 수정 전 폰트).
- 권고 58건은 대부분 **page3 해설의 문장 번호 인용 오차**(index 어긋남)와 **구문 역할 오태깅**. 정답 자체는 타당, 근거 표기 정정 권장.
- ✅ **정답 오류·빈칸 정답 노출·삽화 placeholder 굳음: 0건.** (삽화는 원래 미제작 상태 — 40지문 전부 정상적인 placeholder 박스, 레이스로 인한 굳음 아님.)

## 시각/글리프 QC (풀북 산출물)

- `gs txtwrite | grep -c Illustration` = **0 / 0** (두 교재, placeholder 텍스트 없음 → 삽화 자리 정상).
- 페이지수: Saturn 134p · Jupiter 134p (백지 3장 규칙 반영).
- 렌더 판독: p.5/6/7(삽화·PRACTICE·SYNTAX), 후반 p.83 등 표본 + 아포스트로피 든 지문 전수 대조 → 글리프 결함은 위 U+0027 1종.

---

## 고1 Saturn — 차단 0 · 권고 16 · 경미 17

차단 결함 없음 ✅

<details><summary>권고 사항 16건</summary>

- 고1 Saturn #2 [explanation] "This is why the discriminant matters so much."의 첫 요소 "This"를 role "C"(보어)로 태깅하고 note에 "보어 도치 강조"라고 달았으나, 이 문장은 도치가 없는 정상 S-V-C 어순이다. "This"는 주어(S), "is"가 동사(V), "why the discriminant matters so much"가 보어다. 주어를 보어로 오태깅하고 존재하지 않는 도치를 설명해 학습자에게 잘못된 구문 정보를 준다. — `page3.sentences[index 17], segments[0]`
- 고1 Saturn #3 [explanation] 본문 "a warm greeting from a far-away friend"의 번역이 '멀리서 태어난 친구'로 되어 있어 오역. far-away friend는 '멀리 있는(사는) 친구'를 뜻하며 '태어난'이라는 근거가 본문에 없다. — `page3.translation_ko [8]`
- 고1 Saturn #3 [translation] 'far-away friend'(멀리 있는/먼 곳의 친구)를 '멀리서 태어난 친구'로 옮겨 원문에 없는 '태어난(born)' 의미를 덧붙인 오역. — `page3.translation_ko 문장 [8]`
- 고1 Saturn #4 [explanation] 구문 역할 오태깅: 5형식 'want + O + to부정사' 구문에서 목적격보어(C)여야 할 to부정사구가 부사어(M)로 태깅되어 있다. — `page3.sentences[0] (index 1), segment "to start a recycling club."`
- 고1 Saturn #6 [explanation] 구문 역할 오태깅: 'Where you live'가 M(수식어)로 태깅되어 있으나, 실제로는 동사 'shapes'의 주어(명사절)이다. 문장에 다른 주어가 없어 S 역할이 누락된 상태다. — `page3.sentences[index=5].segments (lines 148-154)`
- 고1 Saturn #6 [explanation] 해설의 evidence가 본문에 없는 문장을 인용한다. 본문(page1 body / page3 문장 3)은 'This move to city life is called urbanization'인데, 해설은 'This shift toward city life is called urbanization'으로 잘못 인용했다(move → shift, to → toward). 정답 자체는 옳으나 근거 인용이 본문과 불일치한다. — `answers.explanations[q_index=3].evidence (line 392) 및 rationales(A)`
- 고1 Saturn #6 [answer] Q3(요약문 빈칸) 정답 근거로 인용한 본문 문장이 실제 본문과 다르게 조작 인용되어 있다. 정답 자체((A) urbanization / (B) planners)는 본문에서 도출 가능해 옳지만, 근거 인용문이 부정확하다. — `answers.explanations[q_index=3].evidence (line 392)`
- 고1 Saturn #7 [explanation] 해설이 본문에 없는 표현을 인용하고 있다. 계승의 증가 속도를 "grow shockingly fast"라고 따옴표로 직접 인용했으나, 본문(과 page3 구문분석)에는 그런 문장이 없다. — `answers.explanations[q_index=0].rationales[0] (line 350)`
- 고1 Saturn #7 [answer] 정답 해설의 오답 근거에서 본문을 잘못 인용함. 계승의 증가 속도를 "grow shockingly fast"라고 인용했으나 본문 실제 표현은 "grow very fast"임. — `answers.explanations[q_index=0].rationales[0] (line 350)`
- 고1 Saturn #9 [explanation] 구문 역할 오태깅: 'before it is finished'에서 'finished'를 M(수식어)으로 태깅했으나, 'is finished'는 be동사+과거분사 구조로 'finished'는 보어(C) 또는 'is finished' 전체가 동사(V, 수동태)여야 한다. M(부사적 수식어)이 아니다. — `page3.sentences[index=13], segment "finished"`
- 고1 Saturn #11 [explanation] 해설 evidence가 본문을 직접 인용부호로 인용하면서 본문에 없는 'either'를 삽입했다. 인용부호는 원문 그대로 인용을 뜻하는데 실제 본문·구문분석과 불일치한다. — `answers.explanations[q_index=0].evidence (line 357)`
- 고1 Saturn #11 [explanation] (B) 근거로 본문 인용 '"the reaction is endothermic"'를 제시하지만, 이 문구는 본문에 존재하지 않는다. 실제 본문 표현은 다르며, 해당 문구는 page4 vocab 예문(line 429)에만 있어 근거 출처가 잘못됐다. — `answers.explanations[q_index=3].evidence (line 397)`
- 고1 Saturn #15 [explanation] sentence 14 구문 역할 오태깅: 'governments'가 최상위 O로 태깅되어 본동사 play의 목적어처럼 표시되지만, 실제로는 분사구 안 'pushing'의 목적어다. 같은 세그먼트 나열에서 'a different part'(play의 진짜 O)와 'governments'가 동일 층위 O로 병렬 배치되어, 'governments'를 주절 목적어로 오해하게 만든다. — `page3.sentences[index=14] segments ("governments" role=O / "delivering ... and pushing" role=M note "분사구문" / "to honor their promises" note "to부정사 목적격 보어")`
- 고1 Saturn #17 [explanation] 요약문 빈칸(A) 해설의 evidence가 본문을 직접 인용한다고 하면서(본문 "...") 실제 본문과 다른 문구를 인용하고 있다. 인용된 "a system of thought that valued study, order, and moral rulers"는 본문에 존재하지 않는다. — `page3 answers.explanations[q_index=3].evidence (line 357)`
- 고1 Saturn #17 [answer] Q3 정답 근거(evidence)가 본문에 없는 문장을 인용하여 오기했다. 정답 자체(Confucianism/exam)는 타당하나, 해설의 인용 근거가 본문 문구와 불일치한다. — `answers.explanations[3].evidence (q_index 3, 요약문 빈칸 완성)`
- 고1 Saturn #18 [explanation] 구문 역할 오태깅: 'the ~, the ~' 비교급 상관구문에서 부사적 요소인 'the faster'까지 주어(S)에 묶어 태깅했다. 실제 주어는 'it'뿐이고 'the faster'는 보어/부사(M) 성분이다. — `page3.sentences[13] (index 14), segment role "S" = "the faster it"`

</details>

## 고2 Jupiter — 차단 1 · 권고 42 · 경미 28

### 🚫 차단 결함 (판매 전 필수 수정)
- **고2 Jupiter #12** [language] 주어-동사 수 일치 오류(비문). 관계절의 주어가 단수·불가산 명사 'randomness'인데 동사가 원형 'obey'로 되어 있다. 'obeys'가 되어야 한다.  
  - 위치: `page1.body, 마지막 문장 (page3 sentences index 18의 관계절)`  
  - 근거: "...more like a hidden rule that quiet <blank> obey without being told." 정답(answer_index 3)이 'randomness'(불가산 단수)이므로 관계절은 실질적으로 "that quiet randomness obey"가 되어 단수 주어에 복수형 동사가 붙는다. page3의 문장 분석에서도 { "role": "REL", "text": "that quiet randomness obey" }로 'obey'를 그대로 두고 있다.  
  - 권고: 동사를 'obeys'로 수정: "...a hidden rule that quiet randomness obeys without being told." (page3 index 18의 REL 세그먼트도 'that quiet randomness obeys'로 함께 수정)

<details><summary>권고 사항 42건</summary>

- 고2 Jupiter #1 [explanation] 부사구 앞자리 배치를 '도치(inversion)'로 잘못 태깅했다. 실제 문장은 주어-동사 어순이 그대로 유지되는 '전치(fronting/강조)'이지 도치가 아니다. — `page3.sentences[index 8], segment note "장소 부사구 도치" / grammar_note "부사구 강조 + 3형식 + 과거분사 수식"`
- 고2 Jupiter #2 [explanation] 해설이 인용하는 문장 번호가 page3.sentences의 실제 index와 전부 어긋난다. 근거로 든 'turn out to be the same idea' 문장은 index 11인데 해설은 '8번' 또는 '8~9번'이라 하고, 'two faces of one relationship'는 index 14인데 '11번', '+C가 뺄셈에서 소거'는 index 13인데 '10번'이라고 지목한다. — `answers.explanations[0] (q_index 0, 요지) evidence + rationales`
- 고2 Jupiter #2 [explanation] 빈칸이 들어있는 문장을 '13번'이라 지목하지만 실제로 'the derivative takes something apart, while the integral patiently ___'는 page3 index 18이다. 또 recover/rebuild 근거를 '12번'이라 하나 recover는 index 16, rebuild는 index 17이며 index 12는 FTC 문장이다. — `answers.explanations[1] (q_index 1, 빈칸 추론) evidence + rationales`
- 고2 Jupiter #2 [explanation] 함의 대상 표현 'these two ideas ... turn out to be the same idea wearing two masks'를 '8번'이라 하고 기본정리 연결을 '9~11번'이라 하지만, 실제 page3에서 해당 문장은 index 11, 기본정리(FTC) 문장은 index 12다. — `answers.explanations[2] (q_index 2, 함의 추론) evidence`
- 고2 Jupiter #2 [explanation] (A) area 근거를 '5번 it measures the area', (B) endpoints 근거를 '9번 subtract its values at the two endpoints'라 하지만, 실제 page3에서 'it measures the area...'는 index 7, 'subtract its values at the two endpoints'는 index 12다. — `answers.explanations[3] (q_index 3, 요약문 빈칸) evidence`
- 고2 Jupiter #2 [translation] 영문은 '과정'인 antidifferentiation과 '답들의 집합'인 the indefinite integral을 서로 다른 두 용어로 구분하는데, 번역이 둘 다 '부정적분'으로 옮겨 구분이 뭉개졌고 near-tautology(순환 정의)가 됨. 앞의 antidifferentiation은 '역미분'으로 옮겨야 함. — `page3.translation_ko 문장 [3]`
- 고2 Jupiter #2 [answer] 해설의 근거 문장 번호가 본문(page3) 실제 인덱스와 전부 어긋난다. 정답 자체는 옳으나(선지 2), 해설이 인용하는 문장 번호가 틀려 학생이 근거를 대조할 수 없다. — `answers.explanations[0] (q_index 0, 요지), evidence 및 rationales`
- 고2 Jupiter #2 [answer] 해설이 빈칸 문장을 '13번'으로, 복원 근거를 '12번(recover, rebuild)'으로 지목하나 본문 인덱스와 불일치한다. 정답(선지 1 puts it back together)은 옳다. — `answers.explanations[1] (q_index 1, 빈칸 추론), evidence 및 rationale`
- 고2 Jupiter #2 [answer] 해설이 밑줄 표현을 '8번', 연결 설명을 '9~11번'으로 인용하나 본문 인덱스와 불일치한다. 정답(선지 1)은 옳다. — `answers.explanations[2] (q_index 2, 함의 추론), evidence`
- 고2 Jupiter #2 [answer] (A)area와 (B)endpoints의 근거 문장 번호가 본문 인덱스와 어긋난다. 정답(A area / B endpoints)은 옳다. — `answers.explanations[3] (q_index 3, 요약문 빈칸 완성), evidence`
- 고2 Jupiter #3 [explanation] 해설이 인용한 문장 번호가 실제 page3.sentences 인덱스와 어긋난다. 'all or nothing' 문장을 9번으로 인용했으나 실제로는 sentence 10이며, '전위가 갑작스럽게 뒤집힌다(8번)'로 지목한 sudden flip of charge는 sentence 9다. — `answers.explanations[q_index=2] evidence / rationales (함의 추론)`
- 고2 Jupiter #3 [explanation] 근거 문장 번호가 실제 인덱스보다 앞당겨져 인용됨. threshold 문장을 '8번', myelin 문장을 '11번'으로 적었으나 각각 sentence 9, sentence 12다. — `answers.explanations[q_index=3] evidence (요약문 빈칸 완성)`
- 고2 Jupiter #3 [explanation] 오답 근거의 문장 번호 인용 오류. '전기 신호가 틈을 스스로 못 넘고 화학 물질이 필요'를 15~16번으로 지목했으나 해당 내용은 sentence 17(cannot jump this gap)과 sentence 18(chemical messengers)이다. 15~16번은 도약 속도와 '뉴런이 다음 뉴런을 만난다'는 내용으로 근거와 무관하다. — `answers.explanations[q_index=0] rationales (요지)`
- 고2 Jupiter #3 [explanation] 'chemical messengers' 방출 문장을 16번으로 인용했으나 실제로는 sentence 18이며, 빈칸이 포함된 릴레이 문장은 sentence 19다. 16번은 화학 물질과 무관한 'the neuron meets the next one' 문장이다. — `answers.explanations[q_index=1] evidence / rationales (빈칸 추론)`
- 고2 Jupiter #4 [explanation] rationale가 unreliable의 근거 문장을 '7번'이라고 지목하지만, unreliable은 page3 sentences의 14번 문장에 나온다. 7번 문장은 시점(point of view) 정의 문장이다. — `answers.explanations[q_index=3].rationales[1] (B unreliable)`
- 고2 Jupiter #4 [explanation] rationale가 narrator의 근거 문장을 '2번'이라고 지목하지만, 'This teller is the narrator'는 page3 sentences의 4번 문장이다. 2번 문장은 'a pair of eyes'를 다루는 문장이다. — `answers.explanations[q_index=3].rationales[0] (A narrator)`
- 고2 Jupiter #4 [answer] 요약문 정답 해설의 본문 문장 번호 인용이 틀림. (A) narrator 근거를 '2번 문장'이라 했으나 실제 'This teller is the narrator'는 [4]번 문장이고 [2]번은 'a pair of eyes'에 관한 문장이다. (B) unreliable 근거를 '7번 문장'이라 했으나 'critics call that voice unreliable'은 [14]번 문장이며 [7]번은 point of view를 정의하는 문장이다. 정답 자체(A=narrator, B=unreliable)는 옳으나 해설의 문장 참조가 잘못되어 있어 교사·학생이 근거 문장을 찾을 때 불일치가 발생한다. — `content/passages/2026-08-J/04.json → answers.explanations[q_index=3].rationales`
- 고2 Jupiter #5 [explanation] 오답 근거가 존재하지 않는 문장 번호를 인용한다. 'unstable'이 틀린 이유로 '반응이 잔잔한 중간에서 안정된다는 6번과 어긋난다'라고 하는데, 6번 문장은 '안정/중간'과 무관하다. — `answers.explanations[q_index=1].rationales[3] (빈칸 추론, 'unstable' 오답 근거)`
- 고2 Jupiter #5 [explanation] 오답 근거가 잘못된 문장 번호를 인용한다. 'pH가 7 근처로 측정된다는 6번과 모순된다'라고 하지만, pH가 7 근처에 자리 잡는다는 내용은 6번이 아니라 17번 문장에 있다. — `answers.explanations[q_index=2].rationales[2] (함의 추론, 'pH 척도를 지운다' 오답 근거)`
- 고2 Jupiter #6 [explanation] 해설의 evidence가 본문에 없는 문장을 인용한다. "This stubborn steadiness is called homeostasis"라고 적었으나 본문(page1.body / page3.translation)에는 'stubborn'이라는 단어가 없고 "This steadiness is called homeostasis"이다. 또한 "scientists label the mechanism negative feedback"이라고 인용했으나 본문은 "scientists call the mechanism negative feedback"으로 동사가 label이 아니라 call이다. 근거가 본문과 불일치하여 검수 신뢰성을 떨어뜨린다. — `answers.explanations[3] (q_index 3, 요약문 빈칸 완성) evidence`
- 고2 Jupiter #6 [answer] 정답 근거로 인용한 본문 문장이 실제 본문(page1.body)과 다르게 왜곡 인용되어 있다. 정답 (A)homeostasis / (B)feedback 자체는 타당하나, 해설의 근거 인용문이 존재하지 않는 문구를 본문인 것처럼 제시한다. — `answers.explanations[3].evidence (q_index 3, 요약문 빈칸 완성)`
- 고2 Jupiter #6 [answer] 어휘 예문이 본문 문장을 인용한다고 제시되나 본문에 없는 'stubborn'이 삽입되어 본문과 불일치한다. 어휘 정오답 판별에 직접 관여하진 않으나 본문 근거 일관성을 해친다. — `page4.vocab[0] homeostasis, examples[0] / page4.vocab[1] steadiness는 정상`
- 고2 Jupiter #7 [explanation] 해설 evidence가 인용하는 문장 번호가 본문의 실제 문장 번호(page3.sentences / translation_ko의 [1]~[19])와 전혀 일치하지 않는다. 세 방법의 위치를 '지층 누중(1~3번), 표준 화석(4~6번), 방사성 붕괴(7번), geologic time(8번)'으로 적었으나 실제 문장 배치는 지층 누중=1~6, 표준 화석=7~12, 방사성=13~17, 결론=18~19이다. 인용 번호가 모두 어긋나 학생이 번호를 따라가면 엉뚱한 문장에 도달한다. — `answers.explanations[q_index=0].evidence`
- 고2 Jupiter #7 [explanation] 요약문 완성 해설이 (A) 근거를 '2번', (B) 근거를 '6번'으로 인용하나, 실제 문장 번호는 (A) the oldest 근거가 [4], (B) index fossils 근거가 [12]이다. 정답(oldest/fossils)은 옳지만 근거 문장 번호가 틀렸다. — `answers.explanations[q_index=3].evidence / rationales`
- 고2 Jupiter #8 [explanation] 주격 보어를 M(수식어)로 오태깅. role은 "M"인데 note는 "부정 보어"라고 명시하여 태그와 주석이 서로 모순된다. is의 보어이므로 role은 C여야 한다. — `page3.sentences[15] (index 16), segment "not a fact"`
- 고2 Jupiter #8 [explanation] 해설의 문장 번호가 page3 sentences의 index와 불일치. 해설은 대화 비유 근거를 "9번"·"10번"(및 "9~10번")으로 지목하나, 실제 해당 내용은 page3 index 18·19이다. 구문분석에서 "9번"은 전혀 다른 문장(비평가가 설명하는 내용)이라 근거 위치를 오도한다. — `answers.explanations[1] (q_index 1, 빈칸 추론) evidence / rationales`
- 고2 Jupiter #8 [explanation] 해설이 핵심 근거 문장을 "8번"으로 지목하나 실제로는 page3 index 17이다. index 8은 초상화 무게에 관한 문장으로 함의와 무관해, 구문분석을 대조하는 학습자를 오도한다. — `answers.explanations[2] (q_index 2, 함의 추론) evidence`
- 고2 Jupiter #11 [explanation] 해설의 근거 인용 번호('2번','3번','4번','6번','8번','9번')가 학생이 볼 수 있는 유일한 번호 체계(page3 sentences 1~20)와 어긋난다. 실제로는 훨씬 뒤 문장을 가리키므로 근거 추적이 오도된다. — `answers.explanations[q_index=0].evidence / rationales, and [q_index=1].evidence, [q_index=2].evidence`
- 고2 Jupiter #11 [answer] 해설의 근거 인용에 쓰인 '~번' 문장 번호가 page3의 실제 문장 번호(1~20)와 전혀 맞지 않는다. 정답 자체는 모두 옳으나, 교사가 근거를 추적할 때 잘못된 문장을 가리켜 혼란을 준다. — `answers.explanations[*].evidence / rationales (q_index 0,1,2,3)`
- 고2 Jupiter #14 [explanation] 해설의 '본문 인용'이 실제 본문과 불일치. 해설은 One conceals its maker ... the other reveals its maker 라고 인용하지만, 본문 문장[18]은 hides 를 쓴다. conceals 는 본문에 없는 단어로, 인용을 변조한 것. — `answers.explanations[0] (q_index 0, 요지) evidence`
- 고2 Jupiter #14 [explanation] 해설이 인용한 빈칸 문장에 본문에 없는 부사 quietly 가 삽입됨. 인용 변조. — `answers.explanations[1] (q_index 1, 빈칸 추론) evidence`
- 고2 Jupiter #14 [explanation] 해설의 본문 인용에서 두 단어가 본문과 다름: particular(본문은 special), reproduce(본문은 copy). 밑줄 표현 함의 문항의 근거 인용이 변조됨. — `answers.explanations[2] (q_index 2, 함의 추론) evidence`
- 고2 Jupiter #14 [explanation] (B) 근거로 인용한 마지막 단락 표현이 본문과 불일치: a single honest voice 로 적었으나 본문은 one honest voice. 정답 voice 자체는 옳으나 인용이 변조됨. — `answers.explanations[3] (q_index 3, 요약문 빈칸) evidence`
- 고2 Jupiter #14 [answer] 정답 해설의 근거 인용이 본문과 불일치. 해설은 마지막 단락을 "One conceals its maker ... the other reveals its maker"로 인용하나, 본문(page1.body / page3 sentence 18)은 conceals가 아니라 hides를 쓴다. — `answers.explanations[0].evidence (q_index 0, 요지)`
- 고2 Jupiter #14 [answer] 정답 해설의 근거 인용이 본문과 3중으로 불일치(particular/that/reproduce). 밑줄 문항의 핵심 근거 문장을 본문과 다른 어휘로 재구성해 인용했다. — `answers.explanations[2].evidence (q_index 2, 함의 추론)`
- 고2 Jupiter #15 [explanation] 빈칸 추론 해설이 '회복/재확장'의 근거로 12번 문장을 지목하지만, 12번은 정반대(하락) 문장이다. 실제 회복 근거는 17번 문장이다. 학생이 대조 확인 시 반대 의미 문장으로 오도된다. — `answers.explanations[q_index=1] evidence 및 rationales[0],[1] (line 408, 411, 412)`
- 고2 Jupiter #15 [explanation] 함의 추론 해설이 밑줄 문장 'Fear can feed on itself here...'를 '10번'으로 인용하나, page3에서 이 문장의 index는 15번이다. 10번은 인플레이션 문장이다. — `answers.explanations[q_index=2] evidence (line 425)`
- 고2 Jupiter #15 [explanation] 요지 해설이 '정부·중앙은행이 지출·금리로 진폭을 완화한다'의 근거로 13~14번을 지목하나, 해당 내용은 18~20번이다. 13~14번은 수축/경기침체 정의 문장이다. — `answers.explanations[q_index=0] evidence (line 391)`
- 고2 Jupiter #15 [explanation] 'no trough lasts forever'를 '부분 부정'으로 표기했으나 이는 전체 부정이다. (모든 저점이 결국 끝난다 = 어떤 저점도 영원하지 않다.) 자체 번역과도 모순. — `page3.sentences[index=16] grammar_note (line 322)`
- 고2 Jupiter #16 [explanation] Q0(요지) 해설의 근거 문장 번호가 실제 본문 문장과 어긋난다. rationale[2]는 '5번에서 코일 감은 수를 늘리면 효과가 커진다'고 하지만 해당 내용은 본문 문장 10('Add more turns to the coil ... so the effect grows')이고, page3 문장 5는 'The lesson looks simple.'이다. rationale[3]은 '6번은 유도 전류가 변화를 방해하는 방향으로 흐른다'고 하지만 이는 본문 문장 13('The current that induction creates always flows in the direction that opposes the very change')이며, 문장 6은 'A still magnet is useless, but a moving one is a source of power.'다. evidence의 '이 원리로 거의 모든 발전기가 작동한다(8번)'도 실제로는 문장 18('Almost every generator on the planet uses this quiet law')이고, 문장 8은 자기 선속을 정의하는 문장이다. — `answers.explanations[q_index=0].rationales[2] and rationales[3], and evidence`
- 고2 Jupiter #16 [answer] 정답 자체는 옳으나, 해설의 문장 번호 인용이 실제 본문 문장 인덱스와 어긋난다. 정답 근거의 신뢰도를 떨어뜨린다. — `answers.explanations[0] (q_index 0) evidence 및 rationales`
- 고2 Jupiter #18 [explanation] 요지 정답 근거로 인용한 문장 번호가 틀렸다. '그 집단들이 자아를 형성한다'는 주장의 근거로 '(1번, 8번)'을 제시했으나, 8번 문장은 자아 형성과 무관하다. — `18.json page3/answers → answers.explanations[0] (q_index 0, 요지) evidence 필드`

</details>
