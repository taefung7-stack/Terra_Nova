# 신남중 2학년 — 추가지문 본문분석 + 본문암기 (Worksheet 5-9 · 6-9 More Reading)

> ⚠️ **개인 용도 1회성 산출물입니다. 테라노바 판매용이 아닙니다.**
> Supabase Storage 업로드·dispatch·market 에 **절대 연결하지 마세요.**

## 무엇인가

사용자가 촬영한 학교 워크시트 **Worksheet 5-9 (More Reading)** (p.9, 뱅크시 「Girl with Balloon」)
사진을 verbatim 전사해 `_oneoff-신서중2-미래엔` 의 More Reading(MR5·MR6)과 같은 방식으로 만들었다.
교과서 출판사는 워크시트에 표기되지 않아 "추가지문"으로만 표기한다.

| 산출물 | 구성 |
|--------|------|
| `dist/MR5/신남중2_추가지문_Worksheet5-9_본문분석.pdf` | 표지1 + 본문전문1 + INTRO1 + 문장분석3 = **6p** |
| `dist/MR5/신남중2_추가지문_Worksheet5-9_본문암기.pdf` | 표지1 + 문제2(7+7) + 정답1 = **4p** |
| `dist/MR6/신남중2_추가지문_Worksheet6-9_본문분석.pdf` | 표지1 + 본문전문1 + INTRO1 + 문장분석3 = **6p** |
| `dist/MR6/신남중2_추가지문_Worksheet6-9_본문암기.pdf` | 표지1 + 문제2(7+6) + 정답1 = **4p** |

- 원문 **14문장** 1챕터, 분석 카드 6개(covers 전수), 어휘 17개, 4단 논리흐름
- 제목 5지선다 정답 ④(① 쏠림 방지). 워크시트 원본 문제(NOT correct / those things 서술형)의
  포인트는 문장분석 카드 2·5·6 에 반영(social↔personal, stands for, those things = innocence, dreams, and hope)
- 삽화: `illustration.prompt` 에 미드저니 프롬프트(16:5, v8.1) 저장. 이미지를
  `dist/MR5/assets/illust-1.png`(가로 2000px 축소) 로 넣고 재빌드하면 반영된다. **2026-09-23 삽화 반영 완료**(원본 dist/MR5/1.png 3952px → 2000×623).

## MR6 — Worksheet 6-9 (호머 헐버트, 2026-09-23 추가)

- 원문 **13문장**(4문단) 1챕터, 분석 카드 5개, 어휘 17개, EXERCISE 2(question_no 2), 제목 정답 ②
- 8번 문장의 **U.S.** 는 약어 — 문장 분할 시 마침표 오분할 주의(정본 주석에 명시)
- 워크시트 문제 반영: 1번 오답 ⓓ(died in the U.S. ✗ → Seoul) = 카드 5 note,
  ⓒ spoke out = keep quiet 부정(카드 3), 2-(1) promoting Hangeul and Korean culture(카드 2),
  2-(2) true friendship and love can go beyond countries(카드 5)

## 빌드 (MR5 → MR6 으로 바꿔 동일)

```bash
cd mock-exam-analysis
D=_oneoff-신남중2-추가지문
node $D/verify.mjs                                   # 오류 0 필수
node builder/build.mjs "$D/data/MR5" "$D/dist/MR5" --styles="$D/styles/analysis.css"
node builder/check-overflow.mjs "$D/dist/MR5/1.html" # overflow 0
node builder/pdf.mjs "$D/dist/MR5"
node $D/combine.mjs MR5          # ★ pdf.mjs 다음에 (pdf.mjs 가 combined/memorize.html 도 덮어씀)
node $D/build-memorize.mjs MR5
```

## ⚠️ 함정 — 「」 낫표가 PDF 에서 빈칸으로 렌더

작품명을 `「풍선과 소녀」` 로 적었더니 **빌드·verify·overflow 전부 통과한 채 괄호만 공백으로** 찍혔다
(직선따옴표 `"` 빈칸 함정과 같은 계열). 작품명은 `‘풍선과 소녀’` 곱슬 작은따옴표로 표기한다.
`<풍선과 소녀>` 는 HTML 태그로 파싱돼 사라지므로 역시 금지.
