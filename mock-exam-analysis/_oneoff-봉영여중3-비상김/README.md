# 봉영여중 3학년 — 비상(김진완) 중학교 영어 3 본문분석 + 본문암기 (Lesson 5·6·7)

> ⚠️ **개인 용도 1회성 산출물입니다. 테라노바 판매용이 아닙니다.**
> 판매·구독 파이프라인(Supabase Storage 업로드, dispatch-order-pdf, market)에
> **절대 연결하지 마세요.** `package.json` 에도 스크립트를 등록하지 않았습니다
> (`_oneoff-금옥중3-능률김` 을 복제한 동일 도구 구성).

## 무엇인가

사용자 제공 교과서 본문 PDF(`봉영여중3 비상김 5과/6과/7과.pdf`, EXAM4YOU 정리본)를
테라노바 분석지 v1.0 디자인으로 만든 **본문 분석지 + 본문암기 워크북**입니다.

- **Lesson 5** — Critical Minds (Can You Spot Fake News? / 헤럴드 동물원 가짜 기사·we-fake-news·가짜 뉴스 판별법)
- **Lesson 6** — Words of Wisdom (A Father’s Wisdom / Puru와 Puneet, 아버지 유언의 두 해석)
- **Lesson 7** — Spend Wisely (Why We Buy What We Buy / 밴드왜건·디드로·앵커링 효과)

## 챕터 분할

교과서가 **본문 1~5 로 나눠 두었으므로 그대로 5챕터**로 썼다.

| 과 | Ch | 제목 | 원문 문장 | 문제 유형 | 정답 |
|----|----|------|-----------|-----------|------|
| L5 | 1 | Can You Spot Fake News? | 7 | 주제 | ③ |
| L5 | 2 | Awful Disaster (헤럴드 사) | 12 | 내용일치 | ⑤ |
| L5 | 3 | Slav Shoots a Friend in Argument | 6 | 내용불일치 | ① |
| L5 | 4 | We Fake News (데일리 텔레그램) | 6 | 요지 | ④ |
| L5 | 5 | How to Spot Fake News | 12 | 제목 | ② |
| | | **L5 합계** | **43** | | |
| L6 | 1 | The Father’s Last Words | 9 | 내용일치 | ② |
| L6 | 2 | Five Years Later | 5 | 내용불일치 | ④ |
| L6 | 3 | Puru’s Question | 11 | 내용일치 | ① |
| L6 | 4 | Puneet’s Answer | 6 | 요지 | ⑤ |
| L6 | 5 | Spend Money like a Rich Man | 6 | 주제 | ③ |
| | | **L6 합계** | **37** | | |
| L7 | 1 | Why We Buy What We Buy | 2 | 주제 | ④ |
| L7 | 2 | The Bandwagon Effect | 8 | 내용일치 | ③ |
| L7 | 3 | The Diderot Effect | 13 | 내용불일치 | ② |
| L7 | 4 | The Anchoring Effect | 11 | 내용일치 | ① |
| L7 | 5 | Think before You Buy | 3 | 요지 | ⑤ |
| | | **L7 합계** | **37** | | |

정답 위치는 저작 단계에서 과마다 ①~⑤ 한 번씩, 전체 ①3 ②3 ③3 ④3 ⑤3 으로 분산했다.
분석지는 `hide_answer: true` 라 문제 블록이 인쇄되지는 않는다.

### 본문 문장으로 치지 않은 것 (`_TEXTBOOK.js` headings)

- 기사 헤드라인 `AWFUL DISASTER` / `SLAV SHOOTS A FRIEND IN ARGUMENT`
- 목록 제목 `How to spot fake news!`

대신 **해석 앞에 괄호로 밝혀** 암기장에서도 맥락이 보이게 했다 —
예: `(기사 “끔찍한 참사”) 어젯밤, …`, `(가짜 뉴스를 찾아내는 방법!) 출처를 고려하라`.

**본문으로 넣은 것**: L5 체크리스트 항목(`CONSIDER the Source` 등 4개 + 질문 6개),
L7 효과별 질문형 소제목(`Why do I want to buy what my friends bought?` 등 3개) —
완결된 문장·명령문이고 교과서 우측 해석에도 번역돼 있어 시험·암기 대상이다.
L6 인용문은 인용 안의 문장 단위로 나눴다(따옴표는 첫·끝 문장에 그대로).

## 산출물

| 과 | 본문분석 합본 | 본문암기 |
|----|---------------|----------|
| L5 | `봉영여중3_비상김진완_Lesson5_본문분석_합본.pdf` | `봉영여중3_비상김진완_Lesson5_본문암기.pdf` (43문항, 6p) |
| L6 | `봉영여중3_비상김진완_Lesson6_본문분석_합본.pdf` | `봉영여중3_비상김진완_Lesson6_본문암기.pdf` (37문항, 6p) |
| L7 | `봉영여중3_비상김진완_Lesson7_본문분석_합본.pdf` | `봉영여중3_비상김진완_Lesson7_본문암기.pdf` (37문항, 6p) |

- 본문분석: 표지 → 본문 전문(FULL TEXT, **3과 모두 2장**) → 챕터별 INTRO / PASSAGE / SENTENCE ANALYSIS
  - L6·L7(37문장)도 한 장이면 배율 0.67(약 6pt)로 너무 작아 `fulltextPages: 2` 로 나눴다.
- 본문암기: 표지 → 문제(한글 제시 + 영작 답란) → 정답. qSplit L5 `[11,11,11,10]` /
  L6·L7 `[10,9,9,9]`. 머리글 두 번째 칸은 템플릿의 중복 "3학년" 대신 `Lesson N`.

## 폴더 구조

```
_PDF-RAW.txt                    원본 PDF 본문을 줄바꿈 그대로 옮긴 것(#H = 헤드라인) — 최종 기준
_gen-textbook.mjs → _TEXTBOOK.js  RAW 를 **기계 분할**한 검수 기준(직접 수정 금지)
_SOURCE-L5.js / -L6.js / -L7.js 원문 정본(**손 분할**, 챕터 제목·부제 포함). 임의 수정 금지
_author.mjs                     저작 헬퍼(미니 마크업 → 분석지 JSON)
_author-L5.mjs / -L6.mjs / -L7.mjs  챕터 저작 데이터(해석·분석·어휘·흐름·문제·삽화 프롬프트)
data/{L5,L6,L7}/{1..5}.json     ← _author-*.mjs 가 생성. 직접 고치지 말 것
dist/{L5,L6,L7}                 빌드 산출물
_gen-prompts-doc.mjs → _ILLUSTRATION_PROMPTS.md  삽화 프롬프트 15장(16:5, v8.1)
verify.mjs / _audit.mjs / _memaudit*. / _xcheck.py  검증·검수
combine.mjs / build-memorize.mjs 합본·암기장 빌더
```

> ★ **정본은 손 분할, 검수 기준은 기계 분할**로 경로를 분리했다. 둘이 같은 전사에서 나와
> 서로만 대조하면 전사 누락을 못 잡기 때문이다(`_oneoff-금옥중3` README 참조). 3과 117문장이
> 두 경로에서 순서·표기까지 완전히 일치함을 확인했다.
>
> ★ **내용 수정은 `_author-L*.mjs` 에서** 하고 `node _author-L5.mjs` 로 JSON 을 재생성한다.
> `_author.mjs` 는 직선따옴표를 곱슬따옴표로 바꾸고 `〔 〕` `「 」` 가 있으면 **중단**한다.

## 빌드 방법

```bash
cd mock-exam-analysis
D=_oneoff-봉영여중3-비상김

# 0) 저작 → JSON, 무결성 검증 (실패 시 빌드 금지)
(cd $D && node _gen-textbook.mjs && node _author-L5.mjs && node _author-L6.mjs && node _author-L7.mjs)
node $D/verify.mjs

for L in L5 L6 L7; do
  node builder/build.mjs "$D/data/$L" "$D/dist/$L" --styles="$D/styles/analysis.css"
  for n in 1 2 3 4 5; do node builder/check-overflow.mjs "$D/dist/$L/$n.html"; done   # overflow 0
  node builder/pdf.mjs "$D/dist/$L"
  node $D/combine.mjs $L
done
node $D/build-memorize.mjs

# 전수 검수 — 덤프 먼저(PyMuPDF 필요)
cd $D && export PYTHONIOENCODING=utf-8
python _memaudit-extract.py && node _memaudit.mjs && node _audit.mjs && python _xcheck.py
node _gen-prompts-doc.mjs
```

## 검수 결과 (2026-09-29)

- `verify.mjs`: 117문장 오류 0 · 경고 0 / overflow 15챕터 전부 0
- `_xcheck.py`: 원본 RAW ↔ 정본 ↔ JSON passage ↔ 분석 카드 15챕터 완전 일치(7,745자),
  합본 PDF 전 문장 ≥2회·암기장 ≥1회 수록, 암기장 한글 제시문 전수 수록 — 오류 0
- `_memaudit.mjs`: 3과 본문암기 문장 누락 0
- `_audit.mjs`: 정답 분포 과마다 ①~⑤ 각 1 · 삽화 반영 후 **통과 27 · 경고 0 · 오류 0**
- 육안 QC: 따옴표·말줄임표(`man... .”`)·$ 기호 정상 렌더 확인

## 삽화

`_ILLUSTRATION_PROMPTS.md` 에 15장.
원본을 `dist/{L}/{N}.png` 로 받은 뒤 가로 2000px 축소본을 `dist/{L}/assets/illust-{N}.png` 로 넣고
pdf·combine 단계를 다시 돌린다. 축소 스크립트는 `_oneoff-목일중3-동아이/README.md` 의 것을 쓰면 된다.

## 원본 대조 재검수 (2026-09-29) — 텍스트 오류 0 · 글리프 결함 수정

**1) 원문 대조 — 66건 오류 0** (`node _rawdiff.mjs`)

기존 `_PDF-RAW.txt` 는 정본과 같은 시기에 만든 것이라, 사용자 PDF 에서 영어 단을
**줄바꿈 그대로 새로** 옮긴 `_RAW_RECHECK.txt` 를 독립 기준으로 두었다.

- [0] 새 재전사 ↔ 기존 `_PDF-RAW.txt` · [1] 정본 · [2] 데이터 passage · [3] 분석 카드
  → 15본문 × 4층 **문자 단위 diff** 전부 일치
- [4] 합본 본문 전문 · [5] 암기장 정답면 → **영어 단어 빈도 완전 일치** (L5 473 · L6 439 · L7 502)
- 기존 `verify` / `_xcheck.py`(117문장 7,745자) / `_memaudit` / `_audit` 도 전부 통과

> ⚠️ `_rawdiff` 의 암기장 문항 번호 제거는 **번호 뒤가 대문자·따옴표일 때만**.
> 줄바꿈으로 `20 percent` 가 줄 머리에 오면 `20` 을 문항 번호로 오인해 가짜 누락이 뜬다(실제 발생).

**2) 글리프 결함 — 텍스트 검사로는 못 잡는 '보이는 누락'**

PDF 텍스트 레이어에는 있는데 **화면·인쇄에서 빈칸**으로 찍히던 기호:
`+`(149) `×` `○` `=` `%` `|` `←` `▶`. 예: `when it comes to + (동)명사` → `when it comes to   (동)명사`,
`20% 할인` → `20 할인`, `▶ 분석 다음 페이지에서 계속` 의 화살표 누락.

- `styles/analysis.css`·`workbook.css` 의 PretendardTN `unicode-range` 에
  `U+0025 U+002B U+003D U+007C U+00D7 U+2190 U+25CB` 추가(Arial 대체)
- Arial 에도 없는 `▶`(U+25B6, 잠긴 `build.mjs` 가 넣는 문자)·`✗` 는 같은 패밀리명의
  두 번째 `@font-face`(Segoe UI Symbol)로 대체 — 빌더는 건드리지 않았다
- 3과 전부 재빌드, overflow 0, 기호 8종 PNG 렌더로 육안 확인

**2026-09-29 반영 완료** — 15장(3952×1232 원본 `dist/{L}/{N}.png`)을 2000px 로 축소해
`assets/illust-{N}.png` 에 넣고 L5·L6·L7 재빌드. 챕터 대응은 콘택트시트로 육안 확인.
overflow 15챕터 0, `verify` 오류 0, `_xcheck` 117문장 오류 0, `_audit` 경고 0(placeholder 해소).
합본 PDF 가 과마다 ~16–17MB. ⚠️ `_audit.mjs` 전에 `_memaudit-extract.py` 로 덤프를 먼저 갱신할 것.
