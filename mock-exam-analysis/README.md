# Terra Nova 모의고사 분석지 빌더 — v1.0 LOCKED

> 본문(passage)만 넣으면 분석지 HTML/PDF가 자동으로 생성됩니다.
> **분석지 v1.0** + **워크북 v1.0** 두 빌더가 같은 데이터 폴더에서 공존.
> 디자인 시스템은 2026-05-27 사용자 검수 완료 → v1.0 안정판 확정.
>
> **회차 진행 상황**
> - ✅ 2026년 3월 모의고사 (고2): 18~23번 분석지 + 21번 워크북 완성
> - ⏳ 2026년 6월 모의고사 (예정)
>
> **새 회차 추가 시 JSON만 작성하면 동일 디자인으로 자동 생성**됩니다.
> CSS·빌더 코드는 수정 금지 (회차 확장 시 디자인 일관성 보장).

## 폴더 구조

```
mock-exam-analysis/
├── builder/
│   ├── build.mjs        ← JSON → HTML 분석지 빌더
│   ├── scaffold.mjs     ← 본문만 입력하면 JSON 초안 자동 생성
│   └── pdf.mjs          ← HTML → PDF 변환 (puppeteer)
├── styles/              ← (회차별 styles/ 폴더에서 공유)
└── 2026-march-grade2/   ← 회차 폴더
    ├── styles/analysis.css
    ├── assets/illust-21.png ...
    ├── data/21.json     ← 지문별 데이터 (스키마는 아래 참고)
    ├── dist/            ← 빌드 산출물 (HTML/PDF)
    ├── sample-21.html   ← 현재 디자인 기준 샘플 (참고용)
    └── TEMPLATE.md
```

## 빠른 시작 — 21번 분석지 만들기

### 1) 본문만 있는 입력 파일 준비 (`input-21.json`)

```json
{
  "exam": "[2026] 3월 모의고사 2학년",
  "question_no": 21,
  "type": "밑줄 추론",
  "score": 3,
  "question_text": "밑줄 친 having a \"blank face\"가 다음 글에서 의미하는 바로 가장 적절한 것은?",
  "passage": [
    "A first step toward establishing a respectful classroom learning community is acceptance of all ideas and answers — regardless of any obvious errors.",
    "Rich mathematical discussions cannot occur if this expectation is not in place."
  ],
  "passage_ko": [
    "존중하는 교실 학습 공동체를 확립하는 첫 단계는, 명백한 오류가 있더라도 모든 아이디어와 답변을 수용하는 것이다.",
    "이러한 기대가 마련되지 않으면 풍부한 수학적 토론은 일어날 수 없다."
  ],
  "answer_no": 2
}
```

### 2) 스캐폴드 (빈 필드를 TODO 마커로 채운 JSON 생성)

```bash
node builder/scaffold.mjs input-21.json 2026-march-grade2/data
```

→ `2026-march-grade2/data/21.json` 생성. 어휘 후보 25개도 본문에서 자동 추출.

### 3) JSON의 TODO 마커를 채우기

- `summary_ko`, `main_idea_en`, `title_en`
- `vocab[*]`: 뜻·동의어·반의어·파생어
- `flow`: 4단계 본문 요약
- `sentences[*]`: `en_html`(슬래시·형광펜), `points`, `paraphrasing(상/중/하)`
- `choices`: 영어 보기·해설
- `illustration.prompt`: 미드저니 16:5 --v 7 프롬프트

### 4) HTML 빌드

```bash
node builder/build.mjs 2026-march-grade2/data
# → 2026-march-grade2/dist/21.html + index.html 생성
```

### 5) PDF 변환 (선택)

```bash
cd mock-exam-analysis
npm install puppeteer          # 최초 1회
npm run pdf:march
# → 2026-march-grade2/dist/21.pdf
```

## JSON 데이터 스키마 (요약)

| 필드 | 타입 | 설명 |
|---|---|---|
| `exam` | string | 회차 표시 (예: `"[2026] 3월 모의고사 2학년"`) |
| `question_no` | number | 문항 번호 |
| `type` | string | 유형 (밑줄 추론·제목·요지 등) |
| `score` | number | 배점 |
| `question_text` | string | 문제 발문 |
| `summary_ko` | string | 한 줄 요약 |
| `main_idea_en` | string | 영문 요지 |
| `title_en` | string | 영문 제목 |
| `illustration.file` | string | 삽화 경로 (기본: `assets/illust-{no}.png`) |
| `illustration.prompt` | string | 미드저니 프롬프트 (16:5 --v 7) |
| `passage[]` | string[] | 본문 영어 문장 배열 |
| `passage_ko[]` | string[] | 본문 한국어 해석 (passage와 같은 길이) |
| `vocab[]` | object[] | `{word, pos, meaning, syn, ant, deriv}` |
| `choices[]` | object[] | `{no, en, ko, comment, correct}` |
| `flow[]` | object[] | `{emoji, title, body}` × 4 |
| `sentences[]` | object[] | 문장별 분석 카드 (아래 참고) |

### `sentences[]` 카드 스키마

```json
{
  "no": 5,
  "tags": ["write", "title"],
  "en_html": "It is important <span class=\"slash\">/</span> <span class=\"hl\">to model and expect</span> ...",
  "ko_chunks": "중요하다 <span class=\"slash\">/</span> 모범을 보이고 ...",
  "ko_full": "경멸하는 발언 없이 모든 아이디어를 받아들이는 것을 모범으로 보이고 기대하는 것이 중요하다.",
  "note": "<strong>해석 도움</strong> — ...",
  "points": [
    { "kind": "grammar", "text": "<strong>It-가주어 / to부정사-진주어</strong>." },
    { "kind": "vocab",   "text": "<strong>derogatory</strong>(경멸하는) ≈ insulting" },
    { "kind": "reading", "text": "..." }
  ],
  "paraphrasing": [
    { "level": "high", "en": "...", "ko": "..." },
    { "level": "mid",  "en": "...", "ko": "..." },
    { "level": "low",  "en": "...", "ko": "..." }
  ]
}
```

#### 마크업 클래스 (en_html 안에서 사용)

| 클래스 | 의미 |
|---|---|
| `slash` | 끊어읽기 슬래시(`/`) |
| `hl` | 노란 형광펜 (중요 표현) |
| `hl-r` | 빨간 형광펜 (핵심 키워드) |
| `key` | 키 구문 (밑줄+민트 색) |

#### `tags` 값 (출제 가능성 칩)

| 값 | 표시 |
|---|---|
| `title` | ⭐ 제목·요지 |
| `write` | ✍ 서술형 |
| `order` | 🔀 순서배열 |
| `insert` | 📌 문장삽입 |

#### `points[*].kind`

| 값 | 색 | 이모지 |
|---|---|---|
| `grammar` | 하늘색 | 📝 |
| `vocab` | 노랑 | 📚 |
| `reading` | 코랄 | 🎯 |

## 자동 페이지 분배

`build.mjs`는 `sentences[]`를 분량 점수에 따라 페이지 3, 4 (필요시 5...)에 자동으로 나눠 담습니다.
- 패러프레이징 있음: +1.2점
- note 있음: +0.3점
- 페이지당 적정 합: 2.6점

즉 패러프레이징 포함된 큰 카드 2개 + 작은 카드 1~2개씩 들어가도록 자동 배치됩니다.

## 회차 추가하기

새 모의고사 회차가 나오면:

1. 회차 폴더 복사
   ```bash
   cp -r 2026-march-grade2 2026-june-grade2
   rm -rf 2026-june-grade2/data/* 2026-june-grade2/dist/* 2026-june-grade2/assets/*
   ```
2. `data/`에 JSON 채우기 (스캐폴드 활용)
3. `assets/`에 미드저니 16:5 삽화 떨어뜨리기
4. `package.json`에 회차별 스크립트 추가 (선택)
5. `npm run build:june` → `npm run pdf:june`

## 3종 라인업 (분석지·워크북·변형문제)

본 빌더는 **분석지 + 워크북** 출력을 지원합니다. 변형문제는 추가 예정
(market.html의 ₩4,900 × 3 = 번들 20% 할인 ₩11,760과 연동).

### 워크북 빌드 (9-STEP) — v1.0 LOCKED

> 디자인 시스템은 2026-05-26 사용자 검수 완료 → v1.0 안정판 확정.
> 새 회차 추가 시 JSON만 작성하면 동일 디자인으로 자동 생성됩니다.
> CSS·빌더 코드는 수정 금지 (회차 확장 시 디자인 일관성 보장).

```bash
# data/{N}.json + data/{N}-workbook.json 결합 → dist/workbook-{N}.html
npm run workbook:march

# 빌드 후 반드시 overflow 검증 (9/9 페이지 모두 NO 확인 필수)
node builder/check-overflow.mjs 2026-march-grade2/dist/workbook-21.html
```

워크북 9-STEP 구성:
1. **본문 + 해석 + 단어 정리** (Mint)
2. **어법 양자택일** (Sky)
3. **어휘 양자택일** (Butter)
4. **빈칸 첫글자 쓰기** (Coral)
5. **한글 해석 연습** (Sage)
6. **영문 배열 (jumble)** (Sky)
7. **통문장 영작** (Coral)
8. **종합 점검 (Mixed)** (Butter)
9. **정답 · 해설** (Mint)

각 STEP은 Terra Nova 5색 파스텔 팔레트로 컬러 코딩되어 진도감을 시각화합니다.

#### `21-workbook.json` 스키마 요약

| 필드 | 설명 |
|---|---|
| `voca_check.{en_to_ko, ko_to_en, expressions, definitions}` | STEP 1 단어 보충 (영영풀이·핵심 표현 포함) |
| `grammar_choice[]` | STEP 2 — `en_template` 안에 `{{N:A/B}}` 토큰 사용 |
| `vocab_choice[]`   | STEP 3 — 위와 동일 토큰 |
| `fill_first_letter[]` | STEP 4 — `hints: [{pos, letter, answer, after}]` |
| `ko_translation[]` | STEP 5 — `ref_sentence`만 명시 (본문 자동 로드) |
| `jumble[]` | STEP 6 — `words[]` 배열을 셔플하지 않고 그대로 표시 (출제자 의도 유지) |
| `sentence_translation[]` | STEP 7 — `ref_sentence` 기반 |
| `mixed[]` | STEP 8 — `{kind, ref, no}` 로 다른 STEP 문항을 참조 |

`{{N:A/B}}` 토큰은 빌더가 자동으로 `<span class="alt">A / B</span>` 박스로 변환합니다.

#### 새 회차 추가 절차 (v1.0 표준)

1. **회차 폴더 복사**
   ```bash
   cp -r 2026-march-grade2 2026-june-grade2
   rm -rf 2026-june-grade2/data/* 2026-june-grade2/dist/*
   ```
2. **JSON 작성** — `data/21-workbook.json`을 템플릿으로 새 회차 작성
3. **package.json scripts**에 빌드/워크북 명령 1줄씩 추가
4. **빌드 + 검증**
   ```bash
   npm run workbook:june
   node builder/check-overflow.mjs 2026-june-grade2/dist/workbook-{N}.html
   # → 9/9 페이지 overflow=NO 확인 후 배포
   ```

#### v1.0 디자인 원칙 (잠금)

- 페이지 컨텐트가 많아도 폰트·간격은 그대로 두고 컨텐트만 컴팩트화
- 항목 사이 간격은 `auto-fit` (`justify-content: space-around`)이 자율 분배
- 각 문항 위에 STEP 컬러 1px 가로 구분선 (`border-top`, `:first-child` 제외)
- 답란 박스 없음 — 손글씨 공간은 auto-fit 분배 여백으로 자연 확보
- 전 글씨 Pretendard, 분석지와 동일한 푸터 패턴
