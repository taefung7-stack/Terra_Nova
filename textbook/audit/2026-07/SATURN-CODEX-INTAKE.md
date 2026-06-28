# 2026-07 Saturn(고1) — Codex 검수본 검증 결과 (External Review Intake)

> 절차: `textbook/audit/EXTERNAL-REVIEW-INTAKE.md`. 입력=Codex 검수본(PDF 대조).
> 대상 소스: `textbook/content/passages/2026-07/NN.json` (= Saturn 고1, suffix 없는 폴더).
> 검증일: 2026-06-28.

## 판정 요약
Codex 신뢰도 **높음** — 대부분 사실. 단 "구문 정답 노출" 헤드라인은 **어제(2026-06-27) 확정된
신규 정책을 결함으로 오진**(FALSE). TOC 불일치는 **진짜 BLOCKER**.

| # | 지적 | 판정 | 근거 |
|---|---|---|---|
| 1 | 목차/주차소개 ↔ 본문 전면 불일치 | **REAL-BLOCKER** | TOC·주차divider는 `content/curriculum.json`의 `passage_topic_en`를 `month==2026-07`로 필터해 렌더(`scripts/cover-render.js` L34,49,107). 그 20개 항목은 **stale placeholder**(Hidden Force:Friction 등)로 실제 저작 본문(Why Some Reactions Warm Up…)과 무관. 레벨 구분 필드도 없음 |
| 2 | 구문 해석이 빈칸 정답 노출 (Day 03/07/13) | **FALSE** | 2026-06-27 커밋 `bf570c7` "빈칸 문장을 정답 채운 완전 문장으로 분석"이 **의도된 정책**. body `<blank>` 유지 + page3는 정답 채워 문법분석 + translation_ko 동기화. 현 PDF는 이 정책을 정확히 반영. 정책 자체를 되돌릴지는 사용자 결정 사항 |
| 3 | Day 10 구문 "system of quiet rules" — quiet 중복 | **REAL-MINOR** | body=`a quiet, elegant <blank>`, Q2 정답="system of quiet rules". 정책상 채우는 건 맞으나 "quiet…quiet" 중복은 표현 어색. 정답 텍스트를 "system"으로 줄이면 해소(단 Q2 보기 동기화 필요) |
| 4 | Day 04 Q4 정답 question 본문 미등장 | **FALSE(굴절형)** | body에 `asks questions`·`Asking these questions`·`questioning <blank>` 등장. 조건 "그대로 활용"의 굴절형 허용 케이스(intake 표 plain/plainest 패턴). 깔끔히 하려면 모범답안 (B)를 `questions`로(또는 둘 다 허용) |
| 5 | Day 17 Q4 해설 근거번호 14 → 실제 18 | **REAL-MINOR** | "openness can be a kind of strength"는 page3 sentence **18**. 정답(B=strength) 맞고 evidence 번호만 오기 |
| 6 | `<mark>` 누락 Day 02,03,04,08,09,11,14 / Day13 `<u>` 1개 | **REAL-MINOR** | 카운트 정확. 전 지문 mark=1 일관성 규칙 위반. body-only 보강 |
| 7 | 단어시험 주차내 중복 (W1 opposite·harsh / W2 steady / W3 steady) | **REAL-MINOR** | 정확. page4.vocab 집계로 확인. 한 주차 60단어 내 동일 영단어 2회 |
| 8 | 선택지 길이 편향(Day16 Q2 외 다수) | **TASTE/REAL-MINOR** | validator WARN 차원. 정답 간결화 권고 |
| 9 | Day15/20 구문 압축 | **TASTE** | 학습용 축약 허용 범위 |

## 반영 결과 (2026-06-28 완료)
사용자 결정: ①목차 즉시 수정 / ②구문 빈칸 채움 정책 유지(Codex 오진 기각) / ③경미 결함 전부 반영.

- ✅ **(BLOCKER) `content/curriculum.json` 2026-07 20개 항목 전면 재생성** — 각 passage의
  `page1.title`(en) + `meta`(part_ko·subject·linked_unit·achievement·difficulty·cognitive_skill·key_concepts)에서
  끌어와 동기화. TOC + 주차divider 페이지(`scripts/cover-render.js`가 이 파일을 읽음)가 이제 실제 본문과 일치.
  - 구조 확인: `build-fullbook.mjs`는 레벨별로 `--month 2026-07`(Saturn)/`2026-07-J`(Jupiter)/`2026-07-Sun`(Sun) 호출.
    curriculum.json에는 7월 `2026-07`만 존재 → **Saturn 수정은 격리 안전**. Jupiter/Sun은 7월 항목 자체가 없어
    TOC가 빈 줄로 렌더될 별도 결함(이번 범위 밖, 후속).
- ✅ Day17 Q4 evidence/rationale 14→18.
- ✅ Day10 구문 정답 "system of quiet rules"→"shared rules"(quiet 중복 제거 + 본문 14번 "deep, shared rules" 근거 일치).
  Q2 choice·page3 fill·evidence·rationale·translation 5곳 동기화.
- ✅ `<mark>` 7건 추가(Day02 expand·03 religion·04 message·08 food chain·09 rights·11 species·14 carbon) → 전 20지문 mark=1 일관.
- ✅ Day13 2번째 `<u>function</u>` 추가 → u=2 일관.
- ✅ 단어시험 주차내 중복 4건 제거(Day05 opposite→cancel·harsh→bitter / Day08 steady→fragile / Day15 steady→stock).
- ✅ (덤) Day16 Q2 정답길이 WARN 해소(단어형 보기 길이 균형).
- ⚪ #2(구문 정답 노출), #4(Day04 Q4 question) = FALSE → 미반영.

**검증**: `validate-content.mjs --month 2026-07` → ERROR 0 / WARN 0. 주차내 vocab 중복 0. 전 지문 mark=1·u=2.
**재빌드**: 소스만 수정(`dist/`는 gitignore). 판매본 PDF는 `build-fullbook.mjs`+`_finalize-2026-07-highschool.mjs`
재실행 시 새 TOC 반영(삽화 레이스 QC 필수).
