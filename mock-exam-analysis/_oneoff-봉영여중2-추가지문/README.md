# 봉영여중 2학년 — 영어B 기말 추가지문 본문분석 + 본문암기 (2026-11-24)

> ⚠️ **개인 용도 1회성 산출물입니다. 테라노바 판매용이 아닙니다.**
> Supabase Storage 업로드·dispatch·market 에 **절대 연결하지 마세요.**

사용자가 촬영한 프린트 사진 5장(필기 포함)으로 만들었다. 도구는 `_oneoff-봉영여중3-비상김` 의 추가지문(EX) 구성을 복제했다.

| Ch | 지문 | 문장 | 분석지 문제 형식(인쇄 안 됨) | 정답 |
|----|------|------|-----------------------------|------|
| 7 | The Large Blue Butterfly (개미를 속이는 나비) | 13 | 제목 | ③ |
| 8 | Personal Space (문화와 개인 공간) | 16 | 주제 | ⑤ |
| 9 | The Barracuda Experiment (창꼬치 실험) | 11 | 요지 | ① |
| 10 | Mr. A and Mr. B (아깝게 놓친 비행기) | 13 | 주제 | ④ |
| 11 | 영상 스크립트 · Wenger Patagonian Expedition Race | 13 | 내용일치 | ② |
| | **합계** | **66** | | |

- 7~10 은 프린트 번호 그대로. 번호가 없는 파타고니아 영상 스크립트는 11 로 붙였다.
- 11 은 프린트에 **인쇄된 한국어 해석을 그대로** 썼다(암기장 제시문도 같음). 7~10 해석은 새로 작성.
- 원본 프린트에 문제가 없어 문제 형식은 분석지 양식을 맞추려고 붙였고, `hide_answer` 라 인쇄되지 않는다.

## 산출물 (`dist/EX/`)

| 파일 | 구성 |
|------|------|
| `봉영여중2_영어B_기말추가지문_본문분석.pdf` | 표지 1 + 본문 전문 5(지문별 1장) + 분석 26 = **32p** |
| `봉영여중2_영어B_기말추가지문_본문암기.pdf` | 표지 1 + 문제 10(지문별 2장, 번호는 지문마다 1부터) + 정답 2 = **13p** |

## 필기 반영

밑줄·박스·동그라미·사선·여백 뜻·하단 문법 노트를 문장 카드에 **[수업 필기]** 로 넣었다.
- 7: play tricks on, what = ~것, 동격(=), lay 알을 낳다 + 하단 lie/lay 동사표, feast on, ordinary ↔ extraordinary, deceiver 속임꾼, that = the smell, Fooled 분사구문((Being) 생략), them = 애벌레
- 8: 필기 제목 "적당한 거리를 유지해 주세요!", 현재완료, 의문사절 주어 → 단수 depends, avoid -ing ①② 병렬, 하단 be used to -ing / be used to V / used to V 노트, depending on (전)
  - pandemic 필기 "전염성의"는 형용사 뜻이라 "(세계적) 전염병 대유행"으로 바로잡았다.
- 9: carry out, 동격, well known for, put A into B, would = will 과거형, Not noticing = As/Because it didn't notice, would ~하곤 했다 ①·병렬 ②, had been = used to be, limit = restrict ↔ allow, permit
- 10: 필기 없음
- 11: one of the + 최상급 + 복수명사, ①②③ 병렬, unexplored(-ed), play host to, (known to man), For 10 days, Constantly → changing → weather, Less than half(필기 "6"), -an 형용사(Chilean, Patagonian)

## 판독 메모

- 9번 `As they expected,` `Then,` `Just like the barracuda,` 의 쉼표 — 필기 사선이 정확히 그 자리를 덮어 사진으로 확인할 수 없어 표준 표기대로 넣었다.
- 8번 `U.S.` 는 약어, 10번 `Mr. A.` 는 6번 문장의 끝이다.
- 따옴표·아포스트로피는 곱슬형(“ ” ’)으로 쓴다(직선 `"` 는 PDF 에서 빈칸으로 렌더됨).

## 빌드

```bash
cd mock-exam-analysis
D=_oneoff-봉영여중2-추가지문
(cd $D && node _gen-textbook-EX.mjs && node _author-EX.mjs && node verify.mjs && node _xcheck-EX.mjs)   # 오류 0 필수
node builder/build.mjs "$D/data/EX" "$D/dist/EX" --styles="$D/styles/analysis.css"
for n in 7 8 9 10 11; do node builder/check-overflow.mjs "$D/dist/EX/$n.html"; done   # overflow 0
node builder/pdf.mjs "$D/dist/EX"
node $D/combine.mjs EX
node $D/build-memorize.mjs EX
(cd $D && node _gen-prompts-doc-EX.mjs)
```

- 내용 수정은 `_author-EX-1.mjs`(7·8) / `_author-EX-2.mjs`(9·10·11) 에서 하고 `node _author-EX.mjs` 로 JSON 을 다시 만든다. `data/EX/*.json` 은 직접 고치지 말 것.
- `_gen-textbook-EX.mjs` 는 봉영여중3 판에서 분할 규칙을 넓혔다: 숫자로 시작하는 문장(`56 adventurers`, `14 teams`)과 `Mr.` 로 시작하는 문장에서도 끊는다.
- `build-memorize.mjs` 는 봉영여중3 판에서 바꿨다: 지문별 `qSplitByCh`, 번호는 지문마다 1부터, 정답면에 지문 제목 행, 머리글에는 짧은 이름(7번 · … / 영상 스크립트). 긴 제목을 머리글에 넣으면 두 줄로 깨진다.

## 검수 (2026-11-24)

- 전사 경로 두 개: `_PDF-RAW-EX.txt`(인쇄 줄 그대로) → 기계 분할 vs `_SOURCE-EX.js`(손 분할). `_xcheck-EX.mjs` 로 문자 단위 대조 66문장 4,622자 오류 0
- `verify.mjs`: 오류 0, 경고 0. 분석 카드를 이어붙인 영어 = 원문, covers 전 문장
- overflow: 5지문 26페이지 전부 0
- 분석지 PDF(PyMuPDF 추출): 66문장 전부 2회 이상 수록. 암기장: 영어 66 + 한글 66 누락 0
  - ⚠️ 암기장 정답면은 2단이라 `gs txtwrite` 로 뽑으면 31건 가짜 누락이 뜬다. PyMuPDF 로 대조할 것
- 소프트마스크 0(굿노트 안전), 기호 `+ × → ①②③` 렌더 육안 확인

## 삽화 — 아직 없음

INTRO 면에 placeholder 가 찍혀 있다. 프롬프트 5장은 `_ILLUSTRATION_PROMPTS-EX.md`(16:5, v8.1).
원본을 `dist/EX/{N}.png` 로 받아 가로 2000px 로 줄여 `dist/EX/assets/illust-{N}.png` 에 넣고 pdf → combine 을 다시 돌린다.
