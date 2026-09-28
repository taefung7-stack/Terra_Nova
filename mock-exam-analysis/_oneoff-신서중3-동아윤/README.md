# 신서중 3학년 — 2022 개정 동아(윤정미) 중학교 영어 3 본문분석 + 본문암기 (Lesson 5·6·7)

> ⚠️ **개인 용도 1회성 산출물입니다. 테라노바 판매용이 아닙니다.**
> 판매·구독 파이프라인(Supabase Storage 업로드, dispatch-order-pdf, market)에
> **절대 연결하지 마세요.** `package.json` 에도 스크립트를 등록하지 않았습니다
> (`_oneoff-목일중3-동아이` 와 동일 정책 — 스크립트도 그 폴더를 복제해 왔다).

## 무엇인가

- **Lesson 5** — The Team Behind the Team (Hidden People in Sports / 페이서·피트 크루·셰르파)
- **Lesson 6** — Stories for All Time (One Lucky Sunday / Boggis 씨와 18세기 탁자)
- **Lesson 7** — Technology in Our Lives (Living with Big Data / 질병 예보·스포츠·범죄 예방)

요청 범위는 **본문분석 + 본문암기 2종 + 미드저니 삽화 프롬프트**. 9-STEP 워크북·변형문제는 없다.

## 챕터 분할 — 교과서 본문 1~4 그대로

| 과 | Ch | 제목 | 원문 | 문제 유형 | 정답 |
|----|----|------|------|-----------|------|
| L5 | 1 | Hidden People in Sports — Pacers | 8 | 주제 | ② |
| L5 | 2 | Pacers Run for Others | 7 | 요지 | ④ |
| L5 | 3 | Pit Crews in Car Racing | 8 | 제목 | ① |
| L5 | 4 | Sherpas in Mountain Climbing | 8 | 내용일치 | ⑤ |
| | | **L5 합계** | **31** | | |
| L6 | 1 | Mr. Boggis’ Secret | 8 | 내용일치 | ③ |
| L6 | 2 | A Priceless Table | 15 | 심경 | ⑤ |
| L6 | 3 | The Deal and the Saw | 22 | 내용불일치 | ② |
| L6 | 4 | The Legs Had Been Cut Off | 3 | 교훈 | ④ |
| | | **L6 합계** | **48** | | |
| L7 | 1 | What Is Big Data? | 12 | 제목 | ① |
| L7 | 2 | Disease Forecast | 9 | 요지 | ③ |
| L7 | 3 | Improving Performance in Sports | 6 | 내용일치 | ④ |
| L7 | 4 | Crime Prevention | 7 | 주제 | ② |
| | | **L7 합계** | **34** | | |

- **소제목은 본문 문장이 아니다** — `Pacers in a Marathon`, `What is big data?`,
  `Disease Forecast` 등은 정본에 싣지 않았다.
- **정답 위치는 저작 단계에서 미리 분산** — L5 2/4/1/5 · L6 3/5/2/4 · L7 1/3/4/2
  (① 쏠림 방지). 새 챕터를 넣으면 `_audit.mjs` 의 분포 검사를 다시 볼 것.

### ⚠️ L6 대화문 분할 규칙

L6 은 대화가 많아 **문장 단위로 쪼개면 `“Sure.”` 같은 한 단어짜리 암기 문항**이 생긴다.
그래서 **발화 한 턴(따옴표 + said/asked) = 1단위**로 묶고, **20단어를 넘는 턴만** 문장 경계에서
나눴다(Ch3 `He then added, “Hmm, … mine.”`, `“OK, it’s yours, … car!”`). 그래서 L6 은
‘문장’이 아니라 **48단위**다. `Mr.` 의 마침표는 문장 끝이 아니다(약어 오분할 주의).

## 산출물 (`dist/{L}/`, PDF 는 .gitignore 대상)

| 과 | 본문분석 합본 | 본문암기 |
|----|---------------|----------|
| L5 | `신서중3_동아윤정미_Lesson5_본문분석_합본.pdf` (17p) | `…_Lesson5_본문암기.pdf` (31문항, 5p) |
| L6 | `신서중3_동아윤정미_Lesson6_본문분석_합본.pdf` (20p) | `…_Lesson6_본문암기.pdf` (48문항, 6p) |
| L7 | `신서중3_동아윤정미_Lesson7_본문분석_합본.pdf` (18p) | `…_Lesson7_본문암기.pdf` (34문항, 5p) |

- 본문분석: 표지 → **본문 전문**(L6 은 2장, `fulltextPages: 2`) → 챕터별 INTRO / PASSAGE / SENTENCE ANALYSIS.
  `hide_answer: true` 라 정답·오답 분석 블록은 인쇄되지 않는다.
- 본문암기: 표지 → 문제면(qSplit L5 `[11,10,10]` · L6 `[12,12,12,12]` · L7 `[12,11,11]`) → 정답면.

## 저작 방식 — 원고 → JSON 생성

챕터 JSON 을 손으로 쓰지 않고 **압축 원고** `_author/L{5,6,7}.mjs` 를 쓴 뒤
`_gen-data.mjs` 가 `data/{L}/{N}.json`(목일중3 동아이와 같은 스키마)으로 펼친다.

- 본문(passage)·소제목은 **정본 `_SOURCE-L*.js` 에서 가져온다** — 원고에 영어 본문을 다시 쓰지 않는다.
- 카드 `ko_full` 은 `passage_ko` 에서 `covers` 로 조립 → 해석 이중 관리 없음.
- 생성 단계에서 **카드 영어 이어붙이기 = 원문 전체**를 1차 검사한다(verify 이전).
- 문법: 영어 카드 `[[hl]] {{hl-g}} ((hl-r))`, `" / "` = 끊어읽기, 설명 텍스트 `` `영어` `` → Inter, `**굵게**`.
- **JSON 을 직접 고치지 말 것** — 다음 생성 때 덮어써진다. 원고를 고치고 다시 생성.

## 빌드

```bash
cd mock-exam-analysis
N=_oneoff-신서중3-동아윤
node $N/_gen-data.mjs              # 원고 → data/*.json
node $N/verify.mjs                 # 무결성 — 실패 시 빌드 금지
for L in L5 L6 L7; do
  node builder/build.mjs "$N/data/$L" "$N/dist/$L" --styles="$N/styles/analysis.css"
  for i in 1 2 3 4; do node builder/check-overflow.mjs "$N/dist/$L/$i.html"; done   # overflow 0
  node builder/pdf.mjs "$N/dist/$L"
  node $N/combine.mjs $L
done
node $N/build-memorize.mjs
cd $N && python _memaudit-extract.py && node _memaudit.mjs && node _audit.mjs
node _gen-prompts-doc.mjs          # 원고의 삽화 프롬프트 → _ILLUSTRATION_PROMPTS.md
```

### 원본 PDF 기준 문자 단위 재검수 — `_rawdiff.mjs` (2026-09-28, 42건 오류 0)

`_TEXTBOOK.js` 도 사람이 문장을 나눠 적은 것이라 전사 판단이 개입한다. 그래서 사용자 PDF 의
영어 단을 **줄바꿈 그대로, 문장 분할 없이** `_RAW_PDF.txt` 로 다시 옮기고 기계로 대조한다.

- [1] 정본 · [2] 데이터 passage · [3] 분석 카드 → 본문(1~4)마다 **문자 단위 diff** (12본문 × 3층)
- [4] 합본 본문 전문 페이지 · [5] 암기장 정답면 → **영어 단어 빈도 완전 일치**(한 단어 누락도 검출)
- 정규화는 두 가지뿐: 연속 공백 1칸, **닫는 따옴표 앞 공백 제거**(PDF 조판의 `car! ”`, `idea! ”`).
- ⚠️ PDF 텍스트를 파이썬으로 뽑을 때 `PYTHONIOENCODING=utf-8` 필수 — cp949 로 나오면 `’` 가
  깨져 `don’t` 가 `don`+`t` 로 쪼개져 가짜 누락이 뜬다.

```bash
node _rawdiff.mjs
```

`_audit.mjs` 는 독립 전사본 `_TEXTBOOK.js` ↔ 정본 ↔ 데이터 ↔ 합본 PDF ↔ 암기장 PDF 를
전부 대조한다. 2026-09-28 기준 **통과 27 · 오류 0**(경고 3 = 삽화 placeholder).

## 이번에 고친 함정 2가지

1. **`combine.mjs` 본문 전문 넘침이 조용히 잘렸다** — L6 48단위를 1장에 넣으면 최소 배율 0.6 에서도
   114.5% 사용. `.page-body` 가 `overflow:hidden` 이라 **에러 없이 잘린 채 인쇄**된다.
   → 넘치면 **빌드 중단** 가드를 추가하고 L6 은 `fulltextPages: 2`.
2. **`+` `✗` `○` 가 PDF 에서 빈칸** — 텍스트 레이어엔 있는데 글리프가 안 찍힌다(Pretendard 구두점 깨짐 계열).
   `styles/*.css` 의 PretendardTN `unicode-range` 에 `U+002B U+00D7 U+25CB` 를 추가했고,
   Arial 에 없는 `✗`(U+2717)는 원고에서 `×`(U+00D7)로 바꿨다.

## 삽화

`_ILLUSTRATION_PROMPTS.md` — 12장(`--ar 16:5 --v 8.1`, 실사, **사람 없음**, 배제는 `--no`).
생성 이미지를 `dist/{L}/assets/illust-{N}.png` 로 **가로 2000px 축소**해 넣고 해당 과를 재빌드
(방법은 `_oneoff-목일중3-동아이/README.md` 의 축소 스크립트 참고). 이미지가 없어도 빌드는 성공하므로
반영 후 `_audit.mjs` 의 placeholder 경고가 0 이 되는지 확인할 것.
