# Terra Nova 지문 작성 가이드 (Schema v2.1)

이 문서는 **앞으로 239개 지문을 만들 때 포맷이 깨지지 않도록** 틀을 고정합니다.
JSON 하나만 규격대로 작성하면 HTML + PDF 레이아웃은 자동으로 맞춰집니다.

> **Canonical 샘플**: `content/passages/2026-06/01.json`
> **Blank 스캐폴드**: `templates/passage.scaffold.json` (복사해서 채우세요)
> **스키마 원본**: `schemas/passage.schema.json`

---

## 1. 파일 & 폴더 규칙

| 항목 | 규칙 |
|------|------|
| 지문 JSON | `content/passages/{YYYY-MM}/{NN}.json` — `NN`은 01~20 두 자리 |
| 삽화 이미지 | `assets/illustrations/{YYYY-MM}/{NN}.svg` (또는 `.png`/`.jpg`/`.webp`) |
| `page1.illustration` 경로 | 반드시 `"../../assets/illustrations/YYYY-MM/NN.확장자"` (상대경로 고정) |
| 파일 인코딩 | UTF-8, LF or CRLF 둘 다 허용 |

## 2. 빠른 작성 워크플로

```bash
# 1) 샘플을 복사
cp content/passages/2026-06/01.json content/passages/2026-06/02.json

# 2) 에디터로 아래 필드만 고침 (meta / page1 / page2 / page3 / page4)

# 3) 검증 — JSON 스키마 + 단어 수 + 문제 구성 체크
npm run validate -- --file content/passages/2026-06/02.json

# 4) 미리보기 — 브라우저에서 확인
npm run preview
# → http://127.0.0.1:4173/textbook.html?month=2026-06&passage=02

# 5) PDF 빌드
npm run build -- --month 2026-06 --only 02
```

검증이 실패하면 **빌드 자체가 시작되지 않습니다** — 포맷 불변성이 유지됩니다.

---

## 3. 필드 명세 (한 페이지 요약)

### 3.1 최상위

| 필드 | 타입 | 값 | 비고 |
|------|------|-----|------|
| `schema_version` | string | `"2.1"` | 고정값 |
| `id` | string | `"YYYY-MM-NN"` | 패턴 고정 |
| `meta` | object | 아래 참조 | |
| `page1` ~ `page4` | object | 아래 참조 | |

### 3.2 `meta`

| 필드 | 타입 | 규칙 / 예 |
|------|------|-----------|
| `month` | string | `"YYYY-MM"` (예: `"2026-06"`) |
| `sequence` | int | 1~20 |
| `subject` | enum | `통합과학` / `통합사회` / `수학` / `국어` / `한국사` / `예체능·정보` |
| `linked_unit` | string | 교과서 단원 표기 (앞의 로마자·숫자는 자동 제거됨). 예: `"I-2 생명의 진화와 탄소"` |
| `part_ko` | string | 지문의 **짧은 한글 파트명** (교재 우측 상단 표시). 2~24자. 예: `"원소·화합물과 생명"` |
| `achievement_standard` | string | 패턴: `10[한글 2~3자][숫자 2자]-[숫자 2자]`. 예: `"10통과01-04"` |
| `difficulty` | enum | `쉬움` / `중간` / `어려움` / `도전` |
| `cognitive_skill` | string | 인지 유형. 예: `요지`, `빈칸추론`, `함의`, `문장삽입` 등 (자유 입력, 2~30자) |
| `lexile` | string | `숫자+L` 패턴. 예: `"1020L"` |
| `ar_level` | number | 3.0 ~ 12.0 |
| `key_concepts` | string[] | 2~5개, 각 1~30자 |

**Lexile / AR 가이드 (고1 권장 범위)**

| 난이도 | Lexile | AR |
|--------|--------|-----|
| 쉬움 | 900L ~ 1000L | 6.0 ~ 6.5 |
| 중간 | 1000L ~ 1100L | 6.5 ~ 7.0 |
| 어려움 | 1100L ~ 1200L | 7.0 ~ 7.5 |
| 도전 | 1200L ~ 1300L | 7.5 ~ 8.5 |

(실제 Lexile 계산기 없이 문장 길이 + 어휘 빈도 기반 추정값입니다. 출판 전 검수 권장.)

### 3.3 `page1` — 본문 페이지

| 필드 | 규칙 |
|------|------|
| `title` | 3~80자, 영어. 서체 Playfair |
| `subtitle` | 3~110자, 영어. italic |
| `body` | **영어 단어 수 290~315, 글자 수 1400~3200**. (315 초과 시 페이지 3 구문 분석 영역이 넘침 — validator가 거부) 단락은 `\n\n`로 구분. 3~4단락 권장 |
| `illustration` | 경로 패턴 엄수 (§1) |
| `illustration_caption` | 3~100자 |

**`body` 안에 쓸 수 있는 인라인 마커** (render.js가 자동으로 스타일 적용)

| 마커 | 용도 | 예 |
|------|------|-----|
| `<u>단어</u>` | 밑줄 강조 — 주로 문제의 밑줄 친 부분 표시용 | `...the same surprising element: <u>carbon</u>.` |
| `<mark>구절</mark>` | 배경 하이라이트 — 함의·어휘 추론 문제용 | `...shapes <mark>the entire story of biology</mark>.` |
| `<blank>` | 빈칸(가로 밑줄) — 빈칸 추론 문제용 | `...life chose carbon because carbon is <blank>.` |

→ 이 마커들은 HTML로 escape된 뒤 다시 복원되므로 **`<`, `>` 기호 자체를 넣고 싶으면 이스케이프가 필요**합니다.

### 3.4 `page2` — 문제 + 교과 연계

#### 문제 4개 필수 (정확히 이 구성)

- `mock_objective` × 3 + `school_descriptive` × 1
- 순서는 자유지만 **어긋나면 validator가 거부**

##### mock_objective

```jsonc
{
  "type": "mock_objective",
  "style": "빈칸 추론",   // 라벨 텍스트, 2~30자
  "stem": "다음 ...?",    // 한글 발문. <u> 사용 가능
  "choices": [
    "…", "…", "…", "…", "…"   // 정확히 5개, 각 1~220자, 영어 권장
  ],
  "answer_index": 1       // 0~4
}
```

- 발문은 **한글**이 표준. 보기는 **영어 문장 전체** (단어 하나가 아니라 구·절·문장 수준)
- 밑줄 친 부분을 묻는다면 `page1.body`에도 `<u>…</u>`가 있어야 보기가 정합

##### school_descriptive

```jsonc
{
  "type": "school_descriptive",
  "style": "요약문 빈칸 완성",   // enum: 아래 참조
  "prompt": "다음은 본문의 요약문이다 ...",
  "hints": ["four", "shapes", "bonds"],        // 0~12개, 선택
  "summary_template": "... <blank> (A) ... <blank> (B) ...",   // 선택
  "model_answer": "(A) bonds  (B) shapes"
}
```

**허용된 `style` 값 (enum)**

| style | 권장 포맷 |
|-------|----------|
| `요약문 빈칸 완성` | `summary_template` 필수, `<blank>` 2개가 일반적 |
| `주제문 작성(조건제시)` | `hints`에 조건 단어, `prompt`에 "다음 조건을 만족하여..." |
| `단어 순서 배열` | `hints`에 단어 조각들, `prompt`에 "주어진 단어를 순서대로 배열" |
| `빈칸 어휘` | 본문 `<blank>` 와 연계, 빈칸에 들어갈 어휘 쓰기 |
| `한줄 요약` | 가장 단순한 형태 |

#### 교과 연계 (`textbook_tieback`)

```jsonc
{
  "unit_label": "통합과학 I-2 · 생명의 진화와 탄소",   // 3~80자
  "body_ko": "고1 통합과학에서 탄소는 ...",                // 200~600자 한글
  "tags": ["공유결합", "탄소화합물"],                        // 2~5개
  "visual_aid": {
    "type": "emoji_flow",                                     // enum
    "title": "탄소가 만드는 구조",
    "steps": [
      { "emoji": "⚛️", "label": "탄소 원자", "note": "원자가 전자 4개" },
      ... (2~6개)
    ]
  }
}
```

**`visual_aid.type` 선택 가이드**

| 타입 | 언제 쓰는가 |
|------|-----------|
| `emoji_flow` | A → B → C 단계·과정·흐름 (가로 플로우, 화살표 자동) |
| `compare` | 두 개념 비교 (2칼럼) — 예: 선형 vs 지수 |
| `mindmap` | 중심 주제에서 뻗어나가는 서브 개념 3~6개 |
| `timeline` | 시간순 사건 나열 (emoji_flow와 비슷하지만 의미 구분용) |

→ `steps[i].emoji` 는 이모지 1~2자, `label` 0~30자, `note` 0~60자 (생략 가능)

### 3.5 `page3` — 구문 분석

#### `sentences` — 본문의 **모든 문장**을 빠짐없이 분석

> 누락 금지! page1의 문장 수와 page3의 `sentences.length`가 일치해야 합니다.

```jsonc
{
  "index": 1,
  "segments": [
    { "role": "S", "text": "Every atom in your body" },
    { "role": "V", "text": "is assembled", "note": "be + p.p. 수동태" },
    { "role": "M", "text": "from the same surprising element: carbon" }
  ],
  "grammar_note": "수동태, 전치사구 수식"   // 선택 (문장 전체에 대한 한 줄 코멘트)
}
```

**Role 코드 (segments[].role)**

| 코드 | 역할 | 색상 | 표시 |
|------|------|------|------|
| `S` | 주어 | 분홍 | `S` |
| `V` | 동사 | 하늘 | `V` |
| `O` | 목적어 | 주황 | `O` |
| `C` | 보어 | 연두 | `C` |
| `M` | 수식어 (부사·전치사구·시간·장소) | 연보라 | `M` |
| `CONJ` | 접속사 (and, but, because, if …) | 연노랑 | `접` |
| `REL` | 관계사 (that, which, who …) | 연산호 | `관` |
| `""` (빈 문자열) | 색칠 없이 일반 텍스트로 표시 | 없음 | 없음 |

**`segments[].note` (per-segment 문법 메모)**
- 1~50자 짧은 주석
- 해당 영어 덩어리 바로 **밑**에 작은 루비 주석으로 렌더링 (`ruby-position: under`)
- 예: `"be + p.p. 수동태"`, `"계속적 용법 which"`, `"allow O to-V 5형식"`
- 모든 segment에 붙일 필요 없음 — 핵심 1~3개만 붙여도 됨

#### `translation_ko` — 연속된 단일 문자열 (줄바꿈 금지)

```
"translation_ko": "[1] 당신 몸을 이루는 모든 원자는 ... [2] 빅뱅 직후 ... [3] 중력이 ..."
```

- 문장 번호 `[n]`이 자동으로 테마 색상으로 강조됩니다
- `sentences`의 index와 정확히 일치해야 합니다

### 3.6 `page4` — 어휘 카드

```jsonc
{
  "word": "forge",
  "pos": "v.",
  "meaning_ko": "(금속을) 벼리다; 만들어내다",
  "synonyms": ["create", "shape"],       // 0~4개
  "antonyms": ["destroy"],               // 0~4개
  "examples": [
    { "en": "The blacksmith forged a sword from iron.",
      "ko": "대장장이가 철로 검을 벼렸다." },
    { "en": "Stars forge heavier elements inside their cores.",
      "ko": "별들은 중심부에서 더 무거운 원소를 만들어낸다." }
  ]                                      // 정확히 2개 필수
}
```

- `page4.vocab` 은 **10~14개 사이** (페이지 여백에 따라 조절)
- 각 카드마다 예문 2개 — 하나는 본문 문맥, 다른 하나는 일상/다른 주제로 **용법 범위**를 보여주도록 권장
- `exam_source` 필드는 스키마상 존재하지만 **현재 렌더링되지 않음** (넣어도 화면에 안 보임)

---

## 4. 삽화 워크플로 (Midjourney / 외부 이미지)

**작가 서브에이전트는 SVG를 만들지 않습니다.** 다음 흐름으로 처리됩니다:

1. JSON에는 `page1.illustration` 경로만 기록 — 예: `"../../assets/illustrations/2026-07/01.png"`
2. 실제 파일은 **나중에** Midjourney(또는 다른 도구)로 생성한 뒤 `assets/illustrations/{YYYY-MM}/{NN}.png` 경로에 떨어뜨림
3. 파일이 없으면 렌더러가 자동으로 보라색 dotted placeholder + "🎨 Illustration · 2026-07-01" 라벨로 대체 → 미리보기·PDF 빌드 모두 깨지지 않음
4. PDF 인쇄 직전에만 진짜 이미지를 넣으면 됨

### 권장 이미지 사양

| 항목 | 규칙 |
|------|------|
| 형식 | `png` / `jpg` / `webp` (스키마 패턴이 모두 허용) |
| 비율 | **16:7 권장** (대략 1600 × 700) — 슬롯이 `height: 52mm`고 `object-fit: cover` |
| 해상도 | 인쇄 시 300 DPI 기준 최소 1600 × 700 px |
| 색감 | 해당 월 테마 팔레트와 어울리도록 MJ 프롬프트에 색상 키워드 명시 권장 |
| 파일명 | `NN.확장자` (sequence 두 자리 + 점 + 확장자) |

### Midjourney 프롬프트 팁

`page1.title` + `illustration_caption` + 월 테마 색상을 합치면 좋습니다. 예:

```
"Where Do Atoms Come From?", elegant editorial illustration,
stars forging elements inside us, deep purple and majorelle blue palette,
clean line-art style, 16:7 aspect, soft glow --ar 16:7 --v 6
```

### Placeholder 동작

이미지 파일이 없거나 경로가 틀리면 페이지 1에 다음과 같이 표시됩니다:

- 보라색 사선 패턴 배경 + 점선 테두리
- 가운데 🎨 이모지 + `Illustration · 2026-07-01` 텍스트
- 캡션은 정상 표시

따라서 콘텐츠 작가 / Midjourney 작업자가 완전히 분리되어 일할 수 있습니다.

---

## 5. 실전 작성 제약 (스키마보다 엄격 — 오버플로우 예방)

스키마가 허용하는 값보다 **실제 레이아웃이 요구하는 안전 범위**는 좁습니다.
기준 범위를 넘기면 Puppeteer 렌더에서 페이지가 넘치고 `build-pdf`가 스킵합니다.

| 필드 | 스키마 허용 | **실전 안전 범위** |
|------|------------|------------------|
| `page1.body` 단어 수 | 290–315 | **290–300** (295 권장) |
| 개별 문장 단어 수 | 제한 없음 | **≤ 28 단어** (30+ 금지) |
| 문장 수 | 4–20 | **12–14** |
| `textbook_tieback.body_ko` | 200–600 | **200–260** |
| `visual_aid.steps` | 2–6 | **3** 권장 (4 이상 시 페이지 2 빠듯) |
| `mock_objective.choices[]` | 각 1–220자 | **각 ≤ 100자** |
| `school_descriptive.summary_template` | ≤ 500자 | **≤ 200자** |
| `vocab[].examples[].en` | ≤ 200자 | **≤ 60자** |
| `vocab[].examples[].ko` | ≤ 140자 | **≤ 40자** |
| `vocab` 개수 | 10–14 | **12** (기본값) |

위 범위를 지키면 **첫 시도에 0 오버플로우**로 통과합니다 (04번 지문이 증거).

## 6. 자주 생기는 함정 & 해결

| 증상 | 원인 | 해결 |
|------|------|------|
| `word count X is outside 290–360` | 본문 단어 수 초과/부족 | `body` 길이 조정 |
| `must have 3 mock_objective + 1 school_descriptive` | 문제 구성 어긋남 | 문제 4개 중 3:1 비율 맞춤 |
| `must match pattern` on `achievement_standard` | `10XX NN-NN` 패턴 어긋남 | 한글 2~3자 + 두 자리 숫자 쌍 확인 |
| Page 2 또는 3 오버플로우 | 본문·문장 수 과다, tieback 글자 초과 | 문장 수 줄이거나 tieback `body_ko` 단축 |
| Page 4 하단 큰 여백 | vocab 10개 정도일 때 발생 | 12~14개로 늘리기 |
| 삽화가 잘려 보임 | aspect ratio 극단 | viewBox 16:7 ~ 2:1 범위 유지 |

---

## 6. 자동화 파이프라인 요약

```
JSON 작성
  ↓
validate-content.mjs (AJV + 커스텀 체크)
  ├── 필드 패턴·길이·enum
  ├── 본문 영어 단어 수 290~360
  └── 문제 3 mock + 1 desc 구성
  ↓
브라우저 미리보기 (sirv + render.js)
  ├── 슬롯 주입
  ├── `<u>` `<blank>` `<mark>` 마커 복원
  ├── 루비 문법 주석 배치
  └── 오버플로우 감지 (`.page-body.scrollHeight > clientHeight`)
  ↓
build-pdf.mjs (Puppeteer)
  ├── 오버플로우 감지된 지문 자동 SKIP
  └── `dist/{YYYY-MM}/{NN}.pdf` 생성
```

---

## 7. 브랜드·디자인 불변성 (수정 금지)

이 항목들은 **모든 지문에서 동일**합니다. JSON에서 바꾸려 하지 마세요:

- 페이지 크기 A4 (210 × 297mm)
- 상단 그라데이션 바 1cm
- 페이지 구성 4페이지 (Passage / Practice / Syntax / Vocab)
- 좌하단 원형 페이지 번호 · 우하단 `TERRA·NOVA`
- S/V/O/C/M 색상 코드 (학습 시그널 일관성 위해 월별로도 동일)
- 해석 블록 배경은 월별 테마 soft 색

월별 컬러 변경은 `styles/tokens.css` 의 `[data-month="YYYY-MM"]` 섹션에서만 합니다.

---

## 8. 커리큘럼 매핑 참고

`content/curriculum.json`에 240개 지문의 메타가 다 잡혀 있습니다.
새 지문을 쓸 때 그 달/순서 엔트리를 먼저 찾아서 복사해 쓰면 됩니다.

```bash
node -e "
const d = JSON.parse(require('fs').readFileSync('content/curriculum.json','utf8'));
const e = d.find(x => x.id === '2026-06-02');
console.log(JSON.stringify(e, null, 2));
"
```

---

**질문이나 추가 필드가 필요하면 스키마부터 업데이트합니다 (`schemas/passage.schema.json` → validator → render.js → layout.css → 가이드 순).** 스키마 없이 데이터만 고치면 나중에 반드시 깨집니다.
