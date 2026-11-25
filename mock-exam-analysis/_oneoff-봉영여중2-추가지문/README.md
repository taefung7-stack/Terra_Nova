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
| `봉영여중2_영어B_기말추가지문_본문암기.pdf` | 표지 1 + 문제 6(15문장 이하 지문은 1장, 16문장인 8번만 2장 · 번호는 지문마다 1부터) + 정답 2 = **9p** |

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

## 삽화 — 2026-11-25 반영 완료

원본 5장(3952×1232, `dist/EX/{7,8,10,11}.png` · 9번은 사용자 파일명 그대로 `9..png`)을 가로 2000px 로 줄여
`dist/EX/assets/illust-{N}.png` 에 넣고 재빌드했다. 합본 INTRO 면 7·12·18·23·28쪽에 이미지, placeholder 0, overflow 0.
콘택트시트로 지문 대응(나비·키오스크·창꼬치·공항·파타고니아) 확인, 깨진 글자 없음.
⚠️ 원본은 **로컬 보관·git 추적 안 함**(`.gitignore` `**/dist/EX*/[0-9]*.png`). 2026-11-25 커밋 53f6761 에 실수로 들어갔다가 추적 해제했다(이력에는 남음).

(이전 기록) 프롬프트 5장은 `_ILLUSTRATION_PROMPTS-EX.md`(16:5, v8.1).
원본을 `dist/EX/{N}.png` 로 받아 가로 2000px 로 줄여 `dist/EX/assets/illust-{N}.png` 에 넣고 pdf → combine 을 다시 돌린다.

---

## 원본 사진 재검수 (2026-11-25) — 오류 0

사진 5장을 띠 단위로 확대해 **처음부터 다시 받아 적은** `_RAW_RECHECK-EX.txt`(11번은 인쇄 해석 포함)를 독립 기준으로 두고
`python -I _rawdiff-EX.py`(`_dump-EX.mjs` 사용)로 대조했다 — 5지문 66문장 4,683자 **오류 0**.

- [0] 기존 RAW · [1] 정본 · [2] data passage · [3] 분석 카드 → 문자 단위 일치
- [4] 합본 PDF 지문별 본문 전문 — 전 문장이 **순서대로** 있고, 제목·해석 외 잉여 영어 없음
  (PDF 추출이 `To` → `T o` 로 쪼개는 일이 있어 공백 제거 후 대조)
- [5] 합본 전 문장 ≥2회 · [6] 암기장 정답면 영어 전수, 제시 한글 66 전수 · [7] 11번 인쇄 해석 13문장 일치
- 쉼표 판독 보강: 7번 `When ready,` · 9번 `As they expected,` `Just like the barracuda,` 는 사선(/) 획 안에
  인쇄된 회색 쉼표가 비쳐 보여 **쉼표가 있음**을 확인했다(9번 `Then,` 도 같은 패턴이라 그대로 둠).
- 사진의 직선따옴표(10·11번)는 곱슬따옴표로 바꿔 실었다 — PDF 빈칸 렌더 방지용 표기 차이이며 내용 차이 아님.

## 삽화 프롬프트 보완 (2026-11-25)

7번 `--no` 의 어색한 항목 정리, 11번에 먼 능선 위 빨간 재킷의 작은 참가자 2명(뒷모습)을 넣어 ‘경주’가 보이게 했다.
지시부는 5장 모두 800자 이하. 이미지는 아직 없음 — `_ILLUSTRATION_PROMPTS-EX.md` 로 생성 후 `dist/EX/{N}.png` 에 넣으면 반영한다.

## 변형문제 (EXV, 2026-11-25)

`dist/EXV/봉영여중2_영어B_기말추가지문_변형문제.pdf` (= `variant-book.pdf`) — **52p · 85문항**
(객관식 11유형 × 5지문 = 55 + 서술형 6유형 × 5지문 = 30, 유형별 묶음, 정답·해설 포함). 형식은 봉영여중3 EX4V 와 같다.

- 객관식 정답 분포 **①11 ②11 ③11 ④11 ⑤11** — 지문 i·유형 j 의 정답 = ((2i + j) mod 5) + 1 로 미리 배치
- `data/EXV/{7..11}.json` 은 `data/EX` 사본이고 `exam` 만 `봉영여중 영어B 추가지문 2학년`(빌더가 끝의 학년을 떼어 머리글에 붙임)
- 내용 검토로 고친 것: 7 함축 ③ hide → run away(‘변장’과 겹침), 8 삽입 다음 문장을 `it`(= 주어진 문장의 the screen)으로 받아 ③ 자리 차단,
  8 어법 지문의 원문 그대로 문장 2개 패러프레이즈
- 검수: `verify-variant-EXV` 오류 0 · 잘림 0 · 푸터 침범 0 · SMask 0 ·
  `python -I _audit-EXV.py` — 문항 번호 1~85, 정답지 55개 순서까지 데이터 일치, 서술형 정답 35건 인쇄, 밑줄 55·삽입 슬롯 25·빈칸 30

```bash
cd mock-exam-analysis
D=_oneoff-봉영여중2-추가지문
(cd $D && node _author-EXV-variant.mjs && node verify-variant-EXV.mjs)      # 오류 0 이어야 빌드
node builder/build-variant.mjs "$D/data/EXV" "$D/dist/EXV" --styles="$D/styles/variant.css" --shared-writing-passage
node $D/_measure-clip.mjs "$D/dist/EXV/variant-book.html"; node $D/_measure-pages.mjs "$D/dist/EXV/variant-book.html"
node $D/render-variant-pdf.mjs "$D/dist/EXV/variant-book.html"
cp "$D/dist/EXV/variant-book.pdf" "$D/dist/EXV/봉영여중2_영어B_기말추가지문_변형문제.pdf"
(cd $D && python -I _audit-EXV.py)
```
원고: `_vlib-EXV.mjs`(헬퍼) · `_author-EXV-variant-1.mjs`(7·8) · `_author-EXV-variant-2.mjs`(9·10·11). JSON 직접 수정 금지.

## 본문암기 분배 변경 (2026-11-25)

사용자 요청 — 15문장 이하 지문은 한 페이지에. `build-memorize.mjs` `qSplitByCh` 를 `7:[13] 8:[8,8] 9:[11] 10:[13] 11:[13]` 으로 바꿨다
(빌더가 페이지마다 실측해 넘치면 중단 — 13문항 통과). 13p → **9p**. `_rawdiff-EX.py` 재대조 오류 0.
