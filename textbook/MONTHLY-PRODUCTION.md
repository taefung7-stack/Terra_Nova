# Terra Nova 월간 생산 체크리스트

> 한 달 신간 1권(134페이지) 생산 가이드 — **지문만 갈아 끼워 빠르게**.
> 포맷·템플릿·CSS·렌더러는 **고정**되어 있으므로 콘텐츠와 자산만 준비하면 됩니다.

---

## 0. 사전 준비 (한 번만)

```bash
cd textbook
npm install
```

새 컴퓨터에서 PDF 빌드 시 한 번 puppeteer Chromium이 다운로드됩니다 (~150MB).

---

## 1. 산출물 한 눈에

`node tools/build-fullbook.mjs --month YYYY-MM` 한 줄이 만들어내는 것:

| 파일 | 페이지 | 내용 |
|------|--------|------|
| `dist/YYYY-MM/YYYY-MM-fullbook.pdf` | **134** | 본문(90) + 정답속지(2) + 정답해설(20) + 단어속지(2) + 단어팩(20) |

페이지 번호는 통권 1~134 연속으로 부여됩니다.

---

## 2. 새 달 만들기 — 5단계

### 2-A. 폴더·자산 준비

```bash
# 본문 JSON 폴더 생성 + 직전 달 복사 (구조만 가져오기 위해)
cp -r content/passages/2026-06 content/passages/YYYY-MM
mkdir -p assets/illustrations/YYYY-MM
```

### 2-B. 월별 컬러 등록 (필요 시)

`styles/tokens.css` 의 `[data-month="YYYY-MM"]` 섹션에 팔레트를 추가합니다. 이미 `2026-05` ~ `2027-04`까지 정의되어 있으면 건너뛰세요.

```css
[data-month="2026-08"] {
  --tn-theme:      #A06EE0;   /* 메인 보라 */
  --tn-theme-deep: #5A2E9C;   /* 짙은 보라 */
  --tn-theme-soft: #ECDEFA;   /* 연보라 (배경 톤) */
}
```

### 2-C. 지문 20개 작성

20개 JSON을 순서대로 채웁니다. 각 파일은 `templates/AUTHORING-GUIDE.md` 의 §3 필드 명세를 따릅니다.

**파일별 갈아 끼울 핵심 필드:**

```jsonc
{
  "schema_version": "2.2",
  "id": "YYYY-MM-NN",                                    // ← 새 달
  "meta": {
    "month": "YYYY-MM",                                  // ← 새 달
    "sequence": NN,                                      // ← 1~20
    "subject": "통합과학",                                // ← 과목 변경
    "linked_unit": "...",
    "part_ko": "...",
    "achievement_standard": "10통과01-04",
    "difficulty": "쉬움",
    "cognitive_skill": "요지",
    "lexile": "1020L",
    "ar_level": 6.8,
    "key_concepts": [...]
  },
  "page1": {
    "title": "...",
    "subtitle": "...",
    "body": "...",
    "illustration": "../../assets/illustrations/YYYY-MM/NN.png",   // ← 새 달
    "illustration_caption": "..."
  },
  "page2": { "questions": [...4개...], "textbook_tieback": {...} },
  "page3": { "sentences": [...], "translation_ko": "..." },
  "page4": { "vocab": [...12개...] },
  "answers": { "explanations": [...4개...] }              // ← v2.2 필수
}
```

**실전 안전 범위 (오버플로우 0% 보장):**

| 필드 | 안전 범위 |
|------|-----------|
| `page1.body` 영어 단어 수 | 290~300 (295 권장) |
| 본문 문장 수 | 12~14 |
| 개별 문장 단어 수 | ≤ 28 |
| `vocab` 개수 | **12** (기본) |
| vocab `examples[].en` | ≤ 60자 |
| vocab `examples[].ko` | ≤ 40자 |
| `answers.evidence` | ≤ 200자 |
| `answers.rationales[i]` | ≤ 80자 (1줄) |

이 범위 안에서 작성하면 **첫 시도에 0 오버플로우** (2026-06이 증거).

### 2-D. 일러스트 (Midjourney 또는 외부 도구)

20장을 `assets/illustrations/YYYY-MM/01.png ~ 20.png` 에 둡니다.

| 항목 | 규칙 |
|------|------|
| 형식 | PNG 권장 (투명도 안 씀) |
| 비율 | **3.21:1** 또는 약 16:5 (3904×1216 px 권장) |
| 해상도 | 인쇄용 300DPI, 최소 너비 3500px |
| 색감 | 해당 월 테마 색에 맞춤 (MJ 프롬프트에 색상 키워드 명시) |

> 일러스트가 없어도 빌드는 깨지지 않습니다 — placeholder가 자리를 잡아 줍니다. 인쇄 직전에만 채우면 됩니다.

### 2-E. 검증 + 빌드 + 검수

```bash
# 1. 검증 (Schema v2.2 + 비즈니스 룰 + answers ↔ answer_index 일관성)
node tools/validate-content.mjs --month YYYY-MM
# → 20개 모두 OK 떠야 함. 어긋나면 빌드 자체가 진행 안 됨.

# 2. 합본 빌드 (textbook + answers + wordpack 134p 1발 빌드)
node tools/build-fullbook.mjs --month YYYY-MM

# 3. 출력 확인
ls -lh dist/YYYY-MM/YYYY-MM-fullbook.pdf
# → ~180MB, 134p
```

---

## 3. 자주 만나는 함정

| 증상 | 원인 | 해결 |
|------|------|------|
| `must NOT have additional properties` | `schema_version: "2.1"` 인데 `answers` 추가 | `schema_version: "2.2"` 로 변경 |
| `correct=N mismatches question.answer_index=M` | rationale 본문은 정답인데 `correct` 필드만 잘못 | `answers.explanations[i].correct` 를 `page2.questions[i].answer_index` 와 일치시킴 |
| `descriptive expects 2 rationales` | 4번 문제(서술형)에 5개 rationale 작성 | (A)·(B) 풀이 2개로 축약 |
| `word count X is outside 290–315` | 본문 단어 수 초과/부족 | body 길이 조정 |
| 페이지 오버플로우로 빌드 SKIP | 본문/문제/vocab 길이 과다 | 위 §2-C 안전 범위 참조 |
| 답안 PDF 정답이 잘못 표시됨 | `correct` 와 `answer_index` 불일치 | validator가 잡아줌 |
| Wordtest 빈칸 4지선다 오답이 너무 쉬움 | 같은 지문 12단어 풀에서만 뽑음 (의도된 설계) | `--scope month` 로 바꾸려면 supplements-render 수정 필요 |
| 일러스트 자리에 보라 줄무늬 | 이미지 파일 없음 | `assets/illustrations/YYYY-MM/NN.png` 에 파일 드롭 |

---

## 4. 페이지 구성 (134p) 도해

```
┌─────────────────────────────────────────────────┐
│ Section 1: Textbook (1~90)                     │
│   p.1-2     TOC                                 │
│   p.3-4     WEEK 1 divider (left + right)      │
│   p.5-24    DAY 01~05 (각 4페이지: P/P/S/V)    │
│   p.25-26   WEEK 2 divider                      │
│   p.27-46   DAY 06~10                           │
│   p.47-48   WEEK 3 divider                      │
│   p.49-68   DAY 11~15                           │
│   p.69-70   WEEK 4 divider                      │
│   p.71-90   DAY 16~20                           │
├─────────────────────────────────────────────────┤
│ Section 2: Answer 속지 (91~92)                  │
│   p.91      "Answers / 정답·해설"               │
│   p.92      blank + TERRA·NOVA                  │
├─────────────────────────────────────────────────┤
│ Section 3: 정답·해설 (93~112)                   │
│   p.93-112  DAY 01~20 (각 1페이지에 4문항)     │
├─────────────────────────────────────────────────┤
│ Section 4: Wordbook 속지 (113~114)              │
│   p.113     "Wordbook / 단어장·시험지·정답"     │
│   p.114     blank + TERRA·NOVA                  │
├─────────────────────────────────────────────────┤
│ Section 5: 워드팩 (115~134)                     │
│   p.115-116 W1 단어장 (60단어 표)              │
│   p.117-118 W1 시험지 (Part A 60문제 / Part B 20문제) │
│   p.119-120 W2 단어장                           │
│   p.121-122 W2 시험지                           │
│   p.123-124 W3 단어장                           │
│   p.125-126 W3 시험지                           │
│   p.127-128 W4 단어장                           │
│   p.129-130 W4 시험지                           │
│   p.131-134 시험지 정답 (W1~W4 각 1p)          │
└─────────────────────────────────────────────────┘
```

---

## 5. 변경 시 영향 범위

| 무엇을 바꾸나 | 영향 |
|---------------|------|
| `meta.subject` `meta.linked_unit` | 페이지 헤더 chip + tieback 헤더 |
| `page1.body` 영어 본문 | 페이지 1 + 페이지 3 (구문 분석) + 페이지 3 (한글 해석) 모두 동기화 필수 |
| `page2.questions[i].answer_index` | **반드시** `answers.explanations[i].correct` 도 함께 변경 |
| 일러스트 파일 | 페이지 1만 |
| `styles/tokens.css` 의 월별 팔레트 | 그 달 모든 페이지 |
| `templates/passage.scaffold.json` | 다음 신규 지문 작성 시작점 |
| `schemas/passage.schema.json` | 모든 검증 — 잘못 바꾸면 모든 지문 검증 실패 |
| `supplements.html` `styles/supplements.css` `scripts/supplements-render.js` | 답안·단어장·시험지·속지 — 모든 달 공통 |

**원칙**: 데이터(JSON, 일러스트)는 매월 바뀌고, 프레임워크(HTML/CSS/JS/스키마)는 거의 안 바뀝니다. 프레임워크를 건드리려면 모든 달 PDF 영향을 검토해야 합니다.

---

## 6. 한눈에 보는 명령

```bash
# 모든 달 공통

# (1) 한 달 검증
node tools/validate-content.mjs --month YYYY-MM

# (2) 한 달 풀북 빌드 (가장 많이 씀)
node tools/build-fullbook.mjs --month YYYY-MM
node tools/build-fullbook.mjs --month YYYY-MM --out dist/custom.pdf

# (3) 부분 빌드 (디버깅·미리보기)
node tools/build-pdf.mjs        --month YYYY-MM --only NN     # 단일 지문 4p
node tools/build-month-pdf.mjs  --month YYYY-MM               # 본문 90p만
node tools/build-supplements.mjs --month YYYY-MM --type answers --passage NN
node tools/build-supplements.mjs --month YYYY-MM --type answers-all
node tools/build-supplements.mjs --month YYYY-MM --type wordpack
node tools/build-supplements.mjs --month YYYY-MM --type wordbook --scope w1
node tools/build-supplements.mjs --month YYYY-MM --type wordtest --scope w1

# (4) 미리보기 서버 (브라우저로 라이브 확인)
npm run preview
# → http://127.0.0.1:4173/textbook.html?month=YYYY-MM&passage=NN
# → http://127.0.0.1:4173/supplements.html?type=answers&month=YYYY-MM&passage=NN
```

---

## 7. 현 프레임워크 자산 인벤토리

| 종류 | 파일 | 역할 |
|------|------|------|
| **HTML 템플릿** | `textbook.html` | 본문 4페이지 (Passage / Practice / Syntax / Vocab) |
| | `cover.html` | TOC + Week divider |
| | `supplements.html` | 답안 / 단어장 / 시험지 / 시험지정답 / 속지 (5종) |
| **렌더러** | `scripts/render.js` | textbook.html ← passage JSON |
| | `scripts/cover-render.js` | cover.html ← curriculum.json |
| | `scripts/supplements-render.js` | supplements.html ← passage.answers + page4.vocab |
| **CSS** | `styles/tokens.css` | 월별 컬러 + 타이포 토큰 |
| | `styles/layout.css` | 본문 4페이지 레이아웃 |
| | `styles/cover.css` | TOC/Week 페이지 |
| | `styles/supplements.css` | 답안/단어장/시험지/속지 |
| | `styles/print.css` | A4 @page 인쇄 룰 |
| **스키마** | `schemas/passage.schema.json` | v2.2 단일 진실 (검증 + 답안 일관성) |
| **빌드** | `tools/validate-content.mjs` | AJV 검증 + 비즈니스 룰 |
| | `tools/build-pdf.mjs` | 단일 지문 PDF |
| | `tools/build-month-pdf.mjs` | 본문 90p PDF |
| | `tools/build-supplements.mjs` | 답안·단어팩 PDF |
| | `tools/build-fullbook.mjs` | **134p 합본** (메인) |
| | `tools/dev-server.mjs` | sirv 미리보기 서버 |
| **콘텐츠** | `content/curriculum.json` | 240지문 메타 인덱스 |
| | `content/passages/YYYY-MM/NN.json` | 지문 본체 (월별) |
| **자산** | `assets/illustrations/YYYY-MM/NN.png` | 본문 일러스트 |
| **문서** | `README.md` | 프로젝트 개요 |
| | `templates/AUTHORING-GUIDE.md` | 지문 작성 가이드 (Schema 명세 + 톤) |
| | `templates/passage.scaffold.json` | 빈 지문 스캐폴드 |
| | `MONTHLY-PRODUCTION.md` | (이 문서) 신간 생산 체크리스트 |
