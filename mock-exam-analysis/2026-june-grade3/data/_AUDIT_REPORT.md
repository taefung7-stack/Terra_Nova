# 고3 6월 모의고사 전수 검수 리포트 (2026-06-23)

21지문 × (분석지+워크북+변형) 제작물 전수 검수. 기계 검수 + 4관점 멀티에이전트 적대 검수.

## 검수 방식
1. **기계 검수**: 정답표 대조, passage 글자일치, sentences/passage_ko 정합, 변형 단일정답, 밑줄/빈칸 존재성, jumble 재구성 가능성, workbook 빈칸=answers.
2. **의미 검수(4관점 병렬, 88 에이전트)**: 정답·해설 정확성 / 한국어 번역 / 변형 품질(복수정답·논리) / 본문 충실도·스키마.

## 결과 요약
- 기계 검수: 진짜 차단결함 2종 31건 수정(jumble words 누락 7, 43 vocab_choice 빈답 24).
- 의미 검수: 총 330건(CRITICAL 19 / MAJOR 84 / MINOR 227).
  - CRITICAL 19 triage → **REAL 12 수정 완료**, FALSE 7 기각.
  - MAJOR 고가치(오역·정답논리) 일부 수정, 나머지는 baseline 허용범위로 판정.

## 수정 완료 (REAL CRITICAL)
| # | 결함 | 조치 |
|---|------|------|
| 18 | variant `grammar_error` 비표준 중복 키 | 블록 삭제 |
| 20 | order 무정답 구조 | 블록 재배치, 단일정답화 |
| 21 | vocab 'hallowed' 오답 오판 | 다른 어휘로 오답 교체, hallowed correct:true |
| 21 | implication 밑줄 'give up the ghost' | 'the ghost'(명사)로 좁혀 원시험 유형 복원 |
| 24 | order 복수정답 | 연결어로 순서 강제 |
| 24 | workbook ref_sentence:10 날조문장 | 6개 섹션+mixed에서 제거(원문 9문장) |
| 29 | variant blank 정답-문장 부정합 | 문장·정답 호응 정리 |
| 29 | workbook jumble3 어법오류 'what' | 'that'으로 교정(grammar_choice와 일관) |
| 30 | blank 정답삽입 이중절 비문 | 문장 종결 정리, 완전문장화 |
| 32 | order 복수정답(B↔C) | 'Given this reality' 연결어로 (C)-(B)-(A) 확정 |
| 32/33 | summary_word 정답 위치 | 빌더가 _orig_passage(원문) 노출 확인 — 실재 |
| 38 | order/insert 정답논리 | 블록·슬롯 재정비 |
| 39 | workbook fill 순서역전 | 등장순 재정렬 |
| 22/38/40 | summary_word 정답 비실재 | use/disturb/neglected 등 원문 실재어로 교체 |

## 기각된 오탐 (FALSE POSITIVE — 빌더/스펙 대조로 확인)
- **variant blank `___` 내장문장** (#23·#33·#34·#39): 빌더가 문장 내 `___`를 `/_{3,}/`로 별도 치환(`build-variant.mjs` L133), `blank_target` 미사용. 118개 blank-inline 정상 렌더 확인.
- **fill `after`에 정답 노출** (88건): 빌더가 `after` 필드를 렌더하지 않음(`build-workbook.mjs` Step4는 실제 문장에서 정답 단어를 regex로 가림). 고2 판매본 동일.
- **summary_word 정답 비실재(패러프레이즈)**: 빌더가 `_orig_passage`(원문 분석지 passage) 노출(L482·L594). 고2 판매본도 24건 중 4건 패러프레이즈 정답 — baseline 허용.
- **#36 grammar/vocab 의도적 오류 주입**: 스펙 규칙("한 곳을 비문법/오어휘로").
- **#43 order answer 인덱싱**: 빌더 1-based(`CIRCLED[answer-1]`).

## 검증 산출물
- 전 분석지(22)·워크북(22)·변형(163p) **overflow 0** 재확인.
- JSON 전수 유효. 정답표 일치(분석지 정답 변동 없음).

## 미수정(허용/낮은우선순위)
- MAJOR 중 변형 design 미세사항(연결어 보강 권고 등) 및 MINOR 227건: 판매 차단성 아님. 필요 시 후속 라운드.
- 일부 번역 표현 개선 여지(예 #21 'After all', #22 'power' 뉘앙스) — 의미 왜곡 아닌 표현 다듬기 수준.
