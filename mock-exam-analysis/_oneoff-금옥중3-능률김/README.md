# 금옥중 3학년 — 능률(김성곤) 중학교 영어 3 본문분석 + 본문암기 (Lesson 5·6·7)

> ⚠️ **개인 용도 1회성 산출물입니다. 테라노바 판매용이 아닙니다.**
> 판매·구독 파이프라인(Supabase Storage 업로드, dispatch-order-pdf, market)에
> **절대 연결하지 마세요.** `package.json` 에도 스크립트를 등록하지 않았습니다
> (`_oneoff-목일중3-동아이` 와 동일 정책·동일 도구 구성).

## 무엇인가

사용자 제공 교과서 본문 PDF(`금옥중3 능률김 5과/6과/7과.pdf`, EXAM4YOU 정리본)를
테라노바 분석지 v1.0 디자인으로 만든 **본문 분석지 + 본문암기 워크북**입니다.

- **Lesson 5** — Environmental Innovations (Join Hands, Save the Earth / 칸쿤 수중 박물관·싱가포르 친환경 건물)
- **Lesson 6** — Take Part in the Economy (Life in the Sharing Economy / 공유 경제 앱과 후기)
- **Lesson 7** — Future Changes through Technology (Life with Robots / AI·로봇의 현재와 미래)

> 요청 당시 문구는 "신서중3 동아윤"이었으나 첨부 PDF 내용은 **능률(김성곤) 중3** 이라
> PDF 기준으로 표기했다(2026-09-28). 같은 날 만들어진 `_oneoff-신서중3-동아윤` 은
> 별개 작업 폴더다 — 섞지 말 것.

## 챕터 분할

교과서가 **본문 1~4 로 나눠 두었으므로 그대로 4챕터**로 썼다.

| 과 | Ch | 제목 | 원문 문장 | 문제 유형 | 정답 |
|----|----|------|-----------|-----------|------|
| L5 | 1 | Join Hands, Save the Earth (칸쿤의 위기) | 7 | 주제 | ② |
| L5 | 2 | An Underwater Museum | 9 | 내용일치 | ④ |
| L5 | 3 | Cool Buildings in Singapore | 8 | 제목 | ① |
| L5 | 4 | Greenery and the Future | 7 | 요지 | ⑤ |
| | | **L5 합계** | **31** | | |
| L6 | 1 | Planning a Camping Trip (대화) | 7 | 내용일치 | ③ |
| L6 | 2 | Ask Your Neighbors | 14 | 내용불일치 | ⑤ |
| L6 | 3 | Pet Sitter Finder | 13 | 내용일치 | ② |
| L6 | 4 | The Sharing Economy (대화) | 8 | 요지 | ④ |
| | | **L6 합계** | **42** | | |
| L7 | 1 | Where Do We See Robots? | 3 | 주제 | ① |
| L7 | 2 | Robots Are Becoming Smart | 8 | 내용일치 | ③ |
| L7 | 3 | Robots around Us | 10 | 내용불일치 | ④ |
| L7 | 4 | Looking toward the Future | 6 | 요지 | ② |
| | | **L7 합계** | **27** | | |

정답 위치는 저작 단계에서 미리 분산했다(①2 ②3 ③2 ④3 ⑤2). 분석지는 `hide_answer: true`
라 문제 블록이 인쇄되지는 않는다.

### 본문 문장으로 치지 않은 것 (`_TEXTBOOK.js` headings)

- 소제목(`Where Do We See Robots?`, `AI Speakers`, `Home Helper Robot` …)
- 인물 표기(`Dr. Rosa Allison / Art professor`, `Rajesh Khan / Architect`)
- 후기 작성자·날짜(`Jasmine / December 12, 2019` …)
- 사진 캡션(`- A delivery robot in the sky` …)

대신 **해석 앞에 괄호로 화자·소제목을 밝혀** 암기장에서도 맥락이 보이게 했다 —
예: `(Jasmine의 후기) 저는 보드게임을 …`, `(AI 스피커) 그들은 …`.

**본문으로 넣은 것**: 앱 광고 문구 `Borrow from your neighbors!` / `I can look after your pet!`
(완결된 문장), 대화문 화자 표기(`Son:` `Dad:` — 그 차례의 첫 문장 앞에만).

## 산출물

| 과 | 본문분석 합본 | 본문암기 |
|----|---------------|----------|
| L5 | `금옥중3_능률김성곤_Lesson5_본문분석_합본.pdf` (18p) | `금옥중3_능률김성곤_Lesson5_본문암기.pdf` (31문항, 5p) |
| L6 | `금옥중3_능률김성곤_Lesson6_본문분석_합본.pdf` (20p) | `금옥중3_능률김성곤_Lesson6_본문암기.pdf` (42문항, 6p) |
| L7 | `금옥중3_능률김성곤_Lesson7_본문분석_합본.pdf` (16p) | `금옥중3_능률김성곤_Lesson7_본문암기.pdf` (27문항, 5p) |

- 본문분석: 표지 → 본문 전문(FULL TEXT) → 챕터별 INTRO / PASSAGE / SENTENCE ANALYSIS
  - **L6 은 42문장이라 본문 전문을 2장**으로 나눴다(`combine.mjs` `fulltextPages: 2`).
    한 장이면 최소 배율 0.6 에서도 100.9% 로 넘쳐 잘린 채 인쇄됐다. 이제 넘치면
    `combine.mjs` 가 **중단**한다(원본 도구엔 없던 가드).
- 본문암기: 표지 → 문제(한글 제시 + 영작 답란) → 정답. qSplit L5 `[11,10,10]` /
  L6 `[11,11,10,10]` / L7 `[9,9,9]`.

## 폴더 구조

```
_TEXTBOOK.js                    교과서 원문 전사본(문단·headings 포함) — 검수 기준
_SOURCE-L5.js / -L6.js / -L7.js 원문 정본(챕터 제목·부제 포함). 임의 수정 금지
_author.mjs                     저작 헬퍼(미니 마크업 → 분석지 JSON)
_author-L5.mjs / -L6.mjs / -L7.mjs  챕터 저작 데이터(해석·분석·어휘·흐름·삽화 프롬프트)
data/{L5,L6,L7}/{1..4}.json     ← _author-*.mjs 가 생성. 직접 고치지 말 것
dist/{L5,L6,L7}                 빌드 산출물
_ILLUSTRATION_PROMPTS.md        삽화 프롬프트 12장(16:5, v8.1)
verify.mjs / _audit.mjs / _memaudit*.  검증·검수
combine.mjs / build-memorize.mjs 합본·암기장 빌더
```

> ★ **내용 수정은 `_author-L*.mjs` 에서** 하고 `node _author-L5.mjs` 로 JSON 을 재생성한다.
> `_author.mjs` 는 직선따옴표 `"…"` 를 곱슬따옴표로 자동 변환하고, `〔 〕` `「 」` 가
> 있으면 **중단**한다 — 셋 다 분석지 PDF 에서 **빈칸으로 렌더**되는데 verify·overflow 로는
> 못 잡는다(이번 작업에서 실제 발생, 육안 QC 로 발견).

## 빌드 방법

```bash
cd mock-exam-analysis
D=_oneoff-금옥중3-능률김

# 0) 저작 → JSON, 무결성 검증 (실패 시 빌드 금지)
(cd $D && node _author-L5.mjs && node _author-L6.mjs && node _author-L7.mjs)
node $D/verify.mjs

for L in L5 L6 L7; do
  node builder/build.mjs "$D/data/$L" "$D/dist/$L" --styles="$D/styles/analysis.css"
  for n in 1 2 3 4; do node builder/check-overflow.mjs "$D/dist/$L/$n.html"; done   # overflow 0
  node builder/pdf.mjs "$D/dist/$L"
  node $D/combine.mjs $L
done
node $D/build-memorize.mjs

# 전수 검수 — 덤프 먼저(PyMuPDF 필요)
cd $D && python _memaudit-extract.py && node _memaudit.mjs && node _audit.mjs
```

## 삽화

`_ILLUSTRATION_PROMPTS.md` 에 12장. **아직 생성 전**이라 합본에는 placeholder 가 들어가 있다
(`_audit.mjs` 경고 3건 = 과별 placeholder 4건). 원본을 `dist/{L}/{N}.png` 로 받은 뒤
가로 2000px 축소본을 `dist/{L}/assets/illust-{N}.png` 로 넣고 3·4단계(pdf·combine)를 다시 돌린다.
축소 스크립트는 `_oneoff-목일중3-동아이/README.md` 의 것을 `L5/L6/L7` 로 바꿔 쓰면 된다.
assets 는 `.gitignore` 대상이다.
