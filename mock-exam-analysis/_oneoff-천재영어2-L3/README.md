# 천재(조수경) 영어II · Lesson 3 워크북 — 일회성 산출물

> ⚠️ **테라노바 정식 회차와 무관한 1회성 작업물입니다.**
> 판매·구독 파이프라인(Storage 업로드, dispatch, 합본)에 절대 연결하지 마세요.
> `package.json` 에 스크립트를 추가하지 않았습니다 (정식 회차 목록 오염 방지).

## 무엇인가

교과서 **천재(조수경) 영어II Lesson 3 — Seeds as the Best Survival Strategy** 본문을
테라노바 **모의고사 워크북 v1.0** 디자인 그대로 제작한 학습 워크북입니다.
빌더(`builder/build-workbook.mjs`)와 9-STEP 구성은 **수정하지 않고 그대로 재사용**했습니다.

## 구성

본문 55문장을 교과서 소제목 기준 **5개 섹션**으로 나눠 각각 독립 워크북(10p)으로 제작.

| # | 섹션 | 문장 | 산출물 |
|---|------|------|--------|
| 1 | 도입 + Help Yourself and Help Me | 11 | `dist/workbook-1.pdf` |
| 2 | The Worst Free Rider | 11 | `dist/workbook-2.pdf` |
| 3 | Deceptive Seeds | 11 | `dist/workbook-3.pdf` |
| 4 | The Wind Beneath My Wings | 11 | `dist/workbook-4.pdf` |
| 5 | Rising from the Ashes | 11 | `dist/workbook-5.pdf` |

각 워크북 9-STEP (정답지 분할로 실제 10페이지):
STEP 1 본문·해석·어휘 → 2 어법 양자택일 → 3 어휘 양자택일 → 4 빈칸 첫글자 →
5 한글 해석 → 6 영문 배열 → 7 통문장 영작 → 8 종합 → 9 정답·해설

## 빌드 방법

```bash
cd mock-exam-analysis
node builder/build-workbook.mjs "_oneoff-천재영어2-L3/data" "_oneoff-천재영어2-L3/dist"
node builder/pdf.mjs "_oneoff-천재영어2-L3/dist"

# 검증 (overflow 0 이 절대 조건)
node builder/check-overflow.mjs "_oneoff-천재영어2-L3/dist/workbook-1.html"
```

## 이 폴더만의 특이사항

- **`styles/workbook.css` 는 로컬 사본**입니다. 원본(`2026-june-grade2/styles/workbook.css`)을
  복사한 뒤 **PretendardTN 글리프 보정**(`@font-face` + `unicode-range`)을 추가했습니다.
  이 보정이 없으면 Chromium PDF 렌더에서 `[형]` 대괄호·아포스트로피(`Let's`)·하이픈이
  `☰` 박스로 깨지거나 사라집니다. (textbook/styles/tokens.css 의 검증된 보정과 동일 방식)
- 원본 공용 CSS와 v1.0 LOCKED 빌더는 **건드리지 않았습니다.**

## 검수 결과 (2026-08-10)

- 본문 55문장 원문 PDF와 **verbatim 일치** 확인
- overflow: **5개 전부 0** (총 50페이지)
- 구조 검증 통과: 빈칸 정답의 본문 실제 등장·첫글자 일치, 양자택일 정답 우선 배치,
  배열 정답의 본문 일치, 해석 전 문장 커버, 종합문제 참조 유효성
- 시각 QC: 글리프 깨짐 없음(수정 후 재렌더 확인)
