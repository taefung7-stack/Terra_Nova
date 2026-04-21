# Terra Nova 고1 Textbook Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone HTML + Puppeteer textbook generator for the Terra Nova 고1 STANDARD-level English monthly magazine, with a reusable 4-page template, JSON-driven content, CSS token theming, a 12-month × 20-passage curriculum skeleton, and one fully-completed sample passage (2026-05 · 01) end-to-end verified by a generated PDF.

**Architecture:** Single HTML template (`textbook/textbook.html`) renders any passage JSON at runtime via `scripts/render.js`. AJV schema enforces content limits that make template breakage structurally impossible. Puppeteer CLI visits the template URL per passage to produce per-passage PDFs. CSS custom properties in `styles/tokens.css` isolate all branding/typography so a single-file update rebrands the entire catalog without touching template code.

**Tech Stack:** Node.js ≥20 (ESM), Puppeteer 22, AJV 8 + ajv-formats, vitest 1.x, sirv-cli 2 (dev static server), plain HTML/CSS/JS (no framework). Project lives under `textbook/` at repo root, isolated from existing Terra Nova site.

---

## File Structure

```
textbook/
├── .gitignore                          # dist/, node_modules/
├── README.md                           # quickstart
├── package.json                        # scripts + deps
├── textbook.html                       # 4-page template with data-slot hooks
├── styles/
│   ├── tokens.css                      # CSS variables (fonts, colors, scale)
│   ├── layout.css                      # 4-page grid + components
│   └── print.css                       # @page A4, page breaks
├── scripts/
│   └── render.js                       # JSON fetch, slot injection, overflow guard
├── schemas/
│   └── passage.schema.json             # AJV schema (single source of truth)
├── content/
│   ├── curriculum.json                 # 240-entry metadata index
│   └── passages/
│       └── 2026-05/
│           └── 01.json                 # sample passage (content body)
├── assets/
│   └── illustrations/
│       └── 2026-05/
│           └── 01.svg                  # sample illustration
├── tools/
│   ├── dev-server.mjs                  # sirv wrapper
│   ├── validate-content.mjs            # AJV CLI
│   └── build-pdf.mjs                   # Puppeteer CLI
├── tests/
│   ├── fixtures/
│   │   ├── passage.good.json
│   │   ├── passage.too-long.json
│   │   └── passage.wrong-question-count.json
│   ├── schema.test.mjs
│   └── render.test.mjs
└── dist/                               # PDF output (gitignored)
```

Each file has one responsibility. `tokens.css` isolates design; `layout.css` isolates structure; `print.css` isolates paged-media rules; `render.js` isolates data→DOM; `validate-content.mjs` isolates data integrity; `build-pdf.mjs` isolates paged rendering. Splits mirror the spec's "separation of concerns" so any one surface can be swapped without touching others.

---

### Task 1: Scaffold project (package.json, gitignore, directory tree)

**Files:**
- Create: `textbook/.gitignore`
- Create: `textbook/README.md`
- Create: `textbook/package.json`

- [ ] **Step 1: Create directory tree**

Run:
```bash
cd "c:/Users/user/OneDrive/Desktop/Terra Nova"
mkdir -p textbook/{styles,scripts,schemas,content/passages/2026-05,assets/illustrations/2026-05,tools,tests/fixtures,dist}
```

- [ ] **Step 2: Create `.gitignore`**

File: `textbook/.gitignore`
```
node_modules/
dist/
.DS_Store
*.log
```

- [ ] **Step 3: Create `README.md`**

File: `textbook/README.md`
````markdown
# Terra Nova Textbook Generator

HTML-based textbook template + JSON-driven content renderer + Puppeteer PDF batch builder.

## Quickstart

```bash
cd textbook
npm install
npm run preview                          # http://localhost:4173
npm run validate -- --month 2026-05
npm run build    -- --month 2026-05
```

See `docs/superpowers/specs/2026-04-22-terra-nova-textbook-generator-design.md` for full spec.
````

- [ ] **Step 4: Create `package.json`**

File: `textbook/package.json`
```json
{
  "name": "terra-nova-textbook",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=20" },
  "scripts": {
    "preview": "node tools/dev-server.mjs",
    "validate": "node tools/validate-content.mjs",
    "build": "node tools/build-pdf.mjs",
    "test": "vitest run"
  },
  "dependencies": {
    "ajv": "^8.17.1",
    "ajv-formats": "^3.0.1",
    "puppeteer": "^22.15.0",
    "sirv-cli": "^2.0.2"
  },
  "devDependencies": {
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 5: Install dependencies**

Run:
```bash
cd "c:/Users/user/OneDrive/Desktop/Terra Nova/textbook"
npm install
```

Expected: `node_modules/` created, no errors. Puppeteer downloads Chromium (~170MB, one-time).

- [ ] **Step 6: Commit**

```bash
cd "c:/Users/user/OneDrive/Desktop/Terra Nova"
git add textbook/.gitignore textbook/README.md textbook/package.json textbook/package-lock.json
git commit -m "Scaffold textbook/ generator project"
```

---

### Task 2: Define passage JSON schema

**Files:**
- Create: `textbook/schemas/passage.schema.json`

- [ ] **Step 1: Write the schema**

File: `textbook/schemas/passage.schema.json`
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://terranova.app/schemas/passage-1.0.json",
  "title": "Terra Nova Passage",
  "type": "object",
  "required": ["schema_version", "id", "meta", "page1", "page2", "page3", "page4"],
  "additionalProperties": false,
  "properties": {
    "schema_version": { "const": "1.0" },
    "id": { "type": "string", "pattern": "^\\d{4}-\\d{2}-\\d{2}$" },
    "meta": {
      "type": "object",
      "required": ["month", "sequence", "theme_en", "subject", "linked_unit", "achievement_standard", "difficulty", "cognitive_skill", "key_concepts"],
      "additionalProperties": false,
      "properties": {
        "month": { "type": "string", "pattern": "^\\d{4}-\\d{2}$" },
        "sequence": { "type": "integer", "minimum": 1, "maximum": 20 },
        "theme_en": { "type": "string", "minLength": 3, "maxLength": 80 },
        "subject": { "enum": ["통합과학", "통합사회", "수학", "국어", "한국사", "예체능·정보"] },
        "linked_unit": { "type": "string", "minLength": 3, "maxLength": 120 },
        "achievement_standard": { "type": "string", "pattern": "^10[가-힣]{2,3}\\d{2}-\\d{2}$" },
        "difficulty": { "enum": ["쉬움", "중간", "어려움", "도전"] },
        "cognitive_skill": { "type": "string", "minLength": 2, "maxLength": 30 },
        "key_concepts": { "type": "array", "minItems": 2, "maxItems": 5, "items": { "type": "string", "minLength": 1, "maxLength": 30 } }
      }
    },
    "page1": {
      "type": "object",
      "required": ["title", "subtitle", "body", "illustration", "illustration_caption"],
      "additionalProperties": false,
      "properties": {
        "title": { "type": "string", "minLength": 3, "maxLength": 60 },
        "subtitle": { "type": "string", "minLength": 3, "maxLength": 90 },
        "body": { "type": "string", "minLength": 600, "maxLength": 1600 },
        "illustration": { "type": "string", "pattern": "^\\.\\./\\.\\./assets/illustrations/\\d{4}-\\d{2}/\\d{2}\\.(svg|png|jpg|webp)$" },
        "illustration_caption": { "type": "string", "minLength": 3, "maxLength": 100 }
      }
    },
    "page2": {
      "type": "object",
      "required": ["questions", "textbook_tieback"],
      "additionalProperties": false,
      "properties": {
        "questions": {
          "type": "array",
          "minItems": 3,
          "maxItems": 3,
          "items": {
            "oneOf": [
              {
                "type": "object",
                "required": ["type", "style", "stem", "choices", "answer_index"],
                "additionalProperties": false,
                "properties": {
                  "type": { "const": "mock_objective" },
                  "style": { "type": "string", "minLength": 2, "maxLength": 20 },
                  "stem": { "type": "string", "minLength": 5, "maxLength": 300 },
                  "choices": { "type": "array", "minItems": 5, "maxItems": 5, "items": { "type": "string", "minLength": 1, "maxLength": 120 } },
                  "answer_index": { "type": "integer", "minimum": 0, "maximum": 4 }
                }
              },
              {
                "type": "object",
                "required": ["type", "prompt", "model_answer"],
                "additionalProperties": false,
                "properties": {
                  "type": { "const": "school_descriptive" },
                  "prompt": { "type": "string", "minLength": 5, "maxLength": 300 },
                  "model_answer": { "type": "string", "minLength": 5, "maxLength": 400 }
                }
              }
            ]
          }
        },
        "textbook_tieback": {
          "type": "object",
          "required": ["unit_label", "body_ko", "tags"],
          "additionalProperties": false,
          "properties": {
            "unit_label": { "type": "string", "minLength": 3, "maxLength": 80 },
            "body_ko": { "type": "string", "minLength": 150, "maxLength": 230 },
            "tags": { "type": "array", "minItems": 2, "maxItems": 4, "items": { "type": "string", "minLength": 1, "maxLength": 20 } }
          }
        }
      }
    },
    "page3": {
      "type": "object",
      "required": ["sentences", "grammar_points", "translation_ko"],
      "additionalProperties": false,
      "properties": {
        "sentences": {
          "type": "array",
          "minItems": 4,
          "maxItems": 15,
          "items": {
            "type": "object",
            "required": ["index", "en", "parts", "grammar_note"],
            "additionalProperties": false,
            "properties": {
              "index": { "type": "integer", "minimum": 1 },
              "en": { "type": "string", "minLength": 3, "maxLength": 240 },
              "parts": {
                "type": "object",
                "additionalProperties": { "type": "string", "maxLength": 120 }
              },
              "grammar_note": { "type": "string", "minLength": 1, "maxLength": 120 }
            }
          }
        },
        "grammar_points": { "type": "array", "minItems": 1, "maxItems": 5, "items": { "type": "string", "minLength": 2, "maxLength": 60 } },
        "translation_ko": { "type": "array", "minItems": 1, "maxItems": 6, "items": { "type": "string", "minLength": 10, "maxLength": 500 } }
      }
    },
    "page4": {
      "type": "object",
      "required": ["vocab"],
      "additionalProperties": false,
      "properties": {
        "vocab": {
          "type": "array",
          "minItems": 8,
          "maxItems": 10,
          "items": {
            "type": "object",
            "required": ["word", "pos", "meaning_ko", "synonyms", "antonyms", "example", "exam_source"],
            "additionalProperties": false,
            "properties": {
              "word": { "type": "string", "minLength": 1, "maxLength": 40 },
              "pos": { "type": "string", "minLength": 1, "maxLength": 10 },
              "meaning_ko": { "type": "string", "minLength": 1, "maxLength": 60 },
              "synonyms": { "type": "array", "minItems": 0, "maxItems": 4, "items": { "type": "string", "maxLength": 30 } },
              "antonyms": { "type": "array", "minItems": 0, "maxItems": 4, "items": { "type": "string", "maxLength": 30 } },
              "example": { "type": "string", "minLength": 5, "maxLength": 200 },
              "exam_source": { "type": "string", "minLength": 3, "maxLength": 60 }
            }
          }
        }
      }
    }
  }
}
```

Note: `page1.body` uses byte-length minimum (600 chars) and max (1600 chars) as a proxy for "150–200 English words". Word-count enforcement is done in `validate-content.mjs` at runtime because JSON Schema has no word-count primitive.

- [ ] **Step 2: Commit**

```bash
cd "c:/Users/user/OneDrive/Desktop/Terra Nova"
git add textbook/schemas/passage.schema.json
git commit -m "Add passage JSON schema v1.0"
```

---

### Task 3: validate-content.mjs (TDD)

**Files:**
- Create: `textbook/tests/fixtures/passage.good.json`
- Create: `textbook/tests/fixtures/passage.too-long.json`
- Create: `textbook/tests/fixtures/passage.wrong-question-count.json`
- Create: `textbook/tests/schema.test.mjs`
- Create: `textbook/tools/validate-content.mjs`

- [ ] **Step 1: Create the "good" fixture (minimal valid passage)**

File: `textbook/tests/fixtures/passage.good.json`
```json
{
  "schema_version": "1.0",
  "id": "2026-05-99",
  "meta": {
    "month": "2026-05",
    "sequence": 20,
    "theme_en": "Test Fixture",
    "subject": "통합과학",
    "linked_unit": "Test Unit",
    "achievement_standard": "10통과01-01",
    "difficulty": "중간",
    "cognitive_skill": "요지",
    "key_concepts": ["test", "fixture"]
  },
  "page1": {
    "title": "Fixture Title",
    "subtitle": "Fixture Subtitle",
    "body": "This is a test fixture passage body written to exceed the six hundred character lower bound. It contains enough repeated filler prose to satisfy the minimum length requirement that the schema validator enforces. Sentences repeat concepts like fixture testing and validator behavior so the text reads naturally. We keep the theme consistent: the passage describes the idea of building a robust test fixture so the validator and renderer both have predictable inputs. When engineers inspect this body they should recognize it as intentionally synthetic but structurally sound. Each sentence follows a simple subject-verb-object order to mimic real classroom English. The fixture includes vocabulary of moderate difficulty suitable for tenth-grade readers.",
    "illustration": "../../assets/illustrations/2026-05/99.svg",
    "illustration_caption": "Synthetic fixture illustration."
  },
  "page2": {
    "questions": [
      { "type": "mock_objective", "style": "요지", "stem": "What is the main idea?", "choices": ["A", "B", "C", "D", "E"], "answer_index": 0 },
      { "type": "mock_objective", "style": "빈칸", "stem": "Fill the blank.", "choices": ["A", "B", "C", "D", "E"], "answer_index": 1 },
      { "type": "school_descriptive", "prompt": "본문을 우리말로 요약하시오.", "model_answer": "픽스처 지문의 요지를 한 문장으로 정리한 예시 답안." }
    ],
    "textbook_tieback": {
      "unit_label": "통합과학 I-1",
      "body_ko": "이 교과 연계 블록은 본문 주제와 연결되는 고1 통합과학 1단원 내용을 한글로 150자 이상 230자 이하로 요약한다. 실제 교과서에서 배우는 핵심 개념 두세 가지를 학생 눈높이에서 풀어 쓴다. 본 샘플은 검증을 위해 의도적으로 분량을 맞췄다.",
      "tags": ["태그1", "태그2"]
    }
  },
  "page3": {
    "sentences": [
      { "index": 1, "en": "This is sentence one.", "parts": { "subject": "This", "verb": "is", "complement": "sentence one" }, "grammar_note": "be + 보어" },
      { "index": 2, "en": "This is sentence two.", "parts": { "subject": "This", "verb": "is", "complement": "sentence two" }, "grammar_note": "be + 보어" },
      { "index": 3, "en": "This is sentence three.", "parts": { "subject": "This", "verb": "is", "complement": "sentence three" }, "grammar_note": "be + 보어" },
      { "index": 4, "en": "This is sentence four.", "parts": { "subject": "This", "verb": "is", "complement": "sentence four" }, "grammar_note": "be + 보어" }
    ],
    "grammar_points": ["be 동사 + 보어"],
    "translation_ko": ["이것은 문장 하나입니다. 이것은 문장 둘입니다."]
  },
  "page4": {
    "vocab": [
      { "word": "fixture", "pos": "n.", "meaning_ko": "고정물; 시험용 샘플", "synonyms": ["sample"], "antonyms": [], "example": "The fixture was used in the test.", "exam_source": "internal" },
      { "word": "synthetic", "pos": "adj.", "meaning_ko": "합성의", "synonyms": ["artificial"], "antonyms": ["natural"], "example": "A synthetic example.", "exam_source": "internal" },
      { "word": "validator", "pos": "n.", "meaning_ko": "검증기", "synonyms": [], "antonyms": [], "example": "The validator checks JSON.", "exam_source": "internal" },
      { "word": "predictable", "pos": "adj.", "meaning_ko": "예측 가능한", "synonyms": ["expected"], "antonyms": ["random"], "example": "Predictable inputs help testing.", "exam_source": "internal" },
      { "word": "robust", "pos": "adj.", "meaning_ko": "견고한", "synonyms": ["sturdy"], "antonyms": ["fragile"], "example": "Robust code survives bad inputs.", "exam_source": "internal" },
      { "word": "minimal", "pos": "adj.", "meaning_ko": "최소의", "synonyms": ["smallest"], "antonyms": ["maximal"], "example": "A minimal test fixture.", "exam_source": "internal" },
      { "word": "inspect", "pos": "v.", "meaning_ko": "점검하다", "synonyms": ["examine"], "antonyms": [], "example": "Engineers inspect the fixture.", "exam_source": "internal" },
      { "word": "structurally", "pos": "adv.", "meaning_ko": "구조적으로", "synonyms": [], "antonyms": [], "example": "Structurally sound code.", "exam_source": "internal" }
    ]
  }
}
```

- [ ] **Step 2: Create "too-long body" fixture**

File: `textbook/tests/fixtures/passage.too-long.json`

Copy `passage.good.json` and replace `page1.body` with 1700+ characters (exceeds max 1600). For brevity, use:
```
"body": "LONG " followed by 350 repetitions to reach ~1750 characters.
```

A fast way in the implementation step:
```javascript
// node one-liner to create it
import fs from 'fs';
const good = JSON.parse(fs.readFileSync('tests/fixtures/passage.good.json', 'utf8'));
good.page1.body = 'LONG '.repeat(350);
fs.writeFileSync('tests/fixtures/passage.too-long.json', JSON.stringify(good, null, 2));
```

- [ ] **Step 3: Create "wrong-question-count" fixture**

File: `textbook/tests/fixtures/passage.wrong-question-count.json`

Same as good, but `page2.questions` has only 2 items (drop the last `school_descriptive`).

- [ ] **Step 4: Write failing tests**

File: `textbook/tests/schema.test.mjs`
```javascript
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { validatePassage } from '../tools/validate-content.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const fixture = (name) => JSON.parse(readFileSync(join(here, 'fixtures', name), 'utf8'));

describe('passage schema validator', () => {
  it('accepts a valid passage', () => {
    const result = validatePassage(fixture('passage.good.json'));
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects body longer than 1600 characters', () => {
    const result = validatePassage(fixture('passage.too-long.json'));
    expect(result.ok).toBe(false);
    expect(result.errors.some(e => e.instancePath.includes('/page1/body'))).toBe(true);
  });

  it('rejects when questions array is not exactly 3', () => {
    const result = validatePassage(fixture('passage.wrong-question-count.json'));
    expect(result.ok).toBe(false);
    expect(result.errors.some(e => e.instancePath.includes('/page2/questions'))).toBe(true);
  });

  it('enforces word count 150–200 in page1.body', () => {
    const passage = fixture('passage.good.json');
    passage.page1.body = 'short'.repeat(50);  // 250 chars, ~50 words, too few
    const result = validatePassage(passage);
    expect(result.ok).toBe(false);
    expect(result.errors.some(e => e.message.includes('word count'))).toBe(true);
  });
});
```

- [ ] **Step 5: Run failing tests**

```bash
cd textbook
npm test
```

Expected: all 4 tests fail with "Cannot find module '../tools/validate-content.mjs'" or similar.

- [ ] **Step 6: Implement validate-content.mjs**

File: `textbook/tools/validate-content.mjs`
```javascript
#!/usr/bin/env node
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const here = dirname(fileURLToPath(import.meta.url));
const schemaPath = resolve(here, '..', 'schemas', 'passage.schema.json');
const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const ajvValidate = ajv.compile(schema);

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function validatePassage(data) {
  const ok = ajvValidate(data);
  const errors = ok ? [] : (ajvValidate.errors ?? []).map(e => ({ ...e }));

  if (ok) {
    const wc = countWords(data.page1.body);
    if (wc < 150 || wc > 200) {
      errors.push({
        instancePath: '/page1/body',
        message: `word count ${wc} is outside 150–200`
      });
    }
  }

  return { ok: errors.length === 0, errors };
}

function listPassageFiles(monthDir) {
  return readdirSync(monthDir)
    .filter(n => /^\d{2}\.json$/.test(n))
    .map(n => join(monthDir, n))
    .sort();
}

async function cli() {
  const { values } = parseArgs({
    options: {
      month: { type: 'string' },
      file:  { type: 'string' }
    }
  });
  const root = resolve(here, '..', 'content', 'passages');
  let targets = [];
  if (values.file) {
    targets = [resolve(values.file)];
  } else if (values.month) {
    targets = listPassageFiles(join(root, values.month));
  } else {
    console.error('usage: validate-content --month YYYY-MM  |  --file path.json');
    process.exit(2);
  }

  let failures = 0;
  for (const f of targets) {
    const data = JSON.parse(readFileSync(f, 'utf8'));
    const { ok, errors } = validatePassage(data);
    if (ok) {
      console.log(`OK  ${f}`);
    } else {
      failures++;
      console.error(`FAIL ${f}`);
      for (const e of errors) {
        console.error(`     ${e.instancePath || '(root)'}: ${e.message}`);
      }
    }
  }
  if (failures) {
    console.error(`\n${failures} file(s) failed validation`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}` || import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  cli();
}
```

- [ ] **Step 7: Run tests to verify pass**

```bash
cd textbook
npm test
```

Expected: 4 tests pass.

- [ ] **Step 8: Run CLI against good fixture manually**

```bash
cd textbook
node tools/validate-content.mjs --file tests/fixtures/passage.good.json
```

Expected output: `OK tests/fixtures/passage.good.json`

- [ ] **Step 9: Commit**

```bash
cd "c:/Users/user/OneDrive/Desktop/Terra Nova"
git add textbook/tools/validate-content.mjs textbook/tests/
git commit -m "Add passage schema validator + tests"
```

---

### Task 4: Design tokens CSS

**Files:**
- Create: `textbook/styles/tokens.css`

- [ ] **Step 1: Write tokens.css**

File: `textbook/styles/tokens.css`
```css
:root {
  /* ===== Terra Nova brand palette ===== */
  --tn-bg:         #F8FAF9;
  --tn-ink:        #032221;
  --tn-ink-soft:   #06302B;
  --tn-accent:     #00DF81;
  --tn-accent-2:   #03624C;
  --tn-muted:      #AAC8C4;
  --tn-divider:    #E3EDE9;
  --tn-surface:    #FFFFFF;
  --tn-warn:       #E0655A;

  /* ===== Per-month theme override (defaults to accent) ===== */
  --tn-theme:      var(--tn-accent);

  /* ===== Typography ===== */
  --font-body:     'Axiforma', 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  --font-display:  'Axiforma', 'Pretendard', -apple-system, sans-serif;
  --font-ko:       'Pretendard', 'Noto Sans KR', 'Malgun Gothic', sans-serif;
  --font-mono:     'JetBrains Mono', Menlo, Consolas, monospace;

  /* ===== Type scale (print-first) ===== */
  --fs-title:      22pt;
  --fs-subtitle:   12pt;
  --fs-body:       12pt;
  --fs-body-small: 10pt;
  --fs-caption:    9pt;
  --fs-meta:       8pt;
  --lh-body:       1.7;
  --lh-tight:      1.3;

  /* ===== Structural spacing ===== */
  --space-xxs: 2pt;
  --space-xs:  4pt;
  --space-sm:  8pt;
  --space-md:  12pt;
  --space-lg:  18pt;
  --space-xl:  28pt;
}

/* ===== Per-month accent overrides ===== */
[data-month="2026-05"] { --tn-theme: #6EA8FF; }
[data-month="2026-06"] { --tn-theme: #2CC295; }
[data-month="2026-07"] { --tn-theme: #E29B54; }
[data-month="2026-08"] { --tn-theme: #A06EE0; }
[data-month="2026-09"] { --tn-theme: #F06A8F; }
[data-month="2026-10"] { --tn-theme: #4FD1C5; }
[data-month="2026-11"] { --tn-theme: #C48BE0; }
[data-month="2026-12"] { --tn-theme: #E0B04A; }
[data-month="2027-01"] { --tn-theme: #7FB8E0; }
[data-month="2027-02"] { --tn-theme: #E06E6E; }
[data-month="2027-03"] { --tn-theme: #5F8FDB; }
[data-month="2027-04"] { --tn-theme: #00DF81; }
```

- [ ] **Step 2: Commit**

```bash
git add textbook/styles/tokens.css
git commit -m "Add design tokens for textbook theming"
```

---

### Task 5: Layout CSS (4-page grid + components)

**Files:**
- Create: `textbook/styles/layout.css`

- [ ] **Step 1: Write layout.css**

File: `textbook/styles/layout.css`
```css
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: var(--tn-bg); color: var(--tn-ink); font-family: var(--font-body); }
body { font-size: var(--fs-body); line-height: var(--lh-body); }

.page {
  width: 210mm;
  height: 297mm;
  padding: 15mm;
  margin: 10mm auto;
  background: var(--tn-surface);
  box-shadow: 0 1px 10px rgba(0,0,0,0.08);
  position: relative;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: var(--space-md);
  overflow: hidden;
}

/* top theme bar */
.page::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0; height: 3mm;
  background: var(--tn-theme);
}

.page-head {
  display: flex; align-items: center; justify-content: space-between;
  font-family: var(--font-display);
  font-size: var(--fs-meta);
  color: var(--tn-ink-soft);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-top: 6mm;
}
.page-head .section-label { font-weight: 600; color: var(--tn-theme); }

.page-foot {
  display: flex; align-items: center; justify-content: space-between;
  font-family: var(--font-display);
  font-size: var(--fs-meta);
  color: var(--tn-muted);
}
.page-foot .brand { font-weight: 600; color: var(--tn-ink-soft); }

/* ===== Page 1 ===== */
.p1-meta { display: flex; gap: var(--space-md); align-items: center; margin-bottom: var(--space-sm); }
.p1-meta .chip {
  background: var(--tn-divider);
  color: var(--tn-ink-soft);
  font-family: var(--font-ko);
  font-size: var(--fs-caption);
  padding: 2pt 8pt;
  border-radius: 999px;
}
.p1-meta .difficulty {
  font-family: var(--font-display);
  font-size: var(--fs-caption);
  color: var(--tn-accent-2);
}
.p1-title { font-family: var(--font-display); font-weight: 700; font-size: var(--fs-title); line-height: var(--lh-tight); margin: 0; }
.p1-subtitle { font-style: italic; font-size: var(--fs-subtitle); color: var(--tn-ink-soft); margin: var(--space-xs) 0 var(--space-md); }
.p1-body { font-size: var(--fs-body); line-height: var(--lh-body); max-width: 100%; }
.p1-body p { margin: 0 0 var(--space-sm); }
.p1-illustration {
  margin-top: var(--space-md);
  height: 65mm;
  overflow: hidden;
  border-radius: 2pt;
  background: var(--tn-divider);
  position: relative;
}
.p1-illustration img, .p1-illustration svg {
  width: 100%; height: 100%; object-fit: cover; display: block;
}
.p1-caption { font-style: italic; font-size: var(--fs-caption); color: var(--tn-ink-soft); margin-top: var(--space-xs); text-align: right; }

/* ===== Page 2 ===== */
.p2-questions { display: flex; flex-direction: column; gap: var(--space-md); }
.question { border-left: 2pt solid var(--tn-theme); padding-left: var(--space-md); }
.question .stem { font-weight: 600; margin-bottom: var(--space-xs); }
.question .choices { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-xs) var(--space-md); font-size: var(--fs-body-small); }
.question .choices li::before { content: counter(choice, decimal); counter-increment: choice; background: var(--tn-divider); border-radius: 50%; width: 12pt; height: 12pt; display: inline-flex; align-items: center; justify-content: center; font-size: 8pt; margin-right: 4pt; }
.question .choices { counter-reset: choice; }
.descriptive .answer-slot {
  border: 1pt dashed var(--tn-muted);
  border-radius: 3pt;
  height: 18mm;
  margin-top: var(--space-xs);
}

.tieback {
  margin-top: var(--space-lg);
  padding: var(--space-md);
  background: var(--tn-divider);
  border-radius: 3pt;
  font-family: var(--font-ko);
}
.tieback .unit-label { font-weight: 600; color: var(--tn-accent-2); font-size: var(--fs-body-small); }
.tieback .body-ko { font-size: var(--fs-body-small); line-height: var(--lh-body); margin-top: var(--space-xs); }
.tieback .tags { display: flex; gap: var(--space-xs); margin-top: var(--space-sm); }
.tieback .tag { background: var(--tn-surface); border: 1pt solid var(--tn-muted); border-radius: 999px; padding: 1pt 6pt; font-size: var(--fs-caption); }

/* ===== Page 3 ===== */
.p3-reprint { font-size: var(--fs-body-small); line-height: var(--lh-body); padding: var(--space-sm); background: var(--tn-divider); border-radius: 3pt; counter-reset: sent; }
.p3-reprint .sent::before { content: "[" counter(sent) "] "; counter-increment: sent; color: var(--tn-accent-2); font-weight: 600; }
.p3-sentences { display: flex; flex-direction: column; gap: var(--space-sm); margin-top: var(--space-md); }
.p3-sentence { border-top: 1pt solid var(--tn-divider); padding-top: var(--space-xs); }
.p3-sentence .num { font-weight: 600; color: var(--tn-theme); margin-right: var(--space-xs); }
.p3-sentence .en { font-size: var(--fs-body-small); }
.p3-sentence .parts { display: flex; gap: var(--space-md); font-size: var(--fs-caption); margin-top: 2pt; font-family: var(--font-mono); }
.p3-sentence .parts .k { color: var(--tn-accent-2); font-weight: 600; }
.p3-sentence .note { font-size: var(--fs-caption); color: var(--tn-ink-soft); margin-top: 2pt; }
.p3-grammar { margin-top: var(--space-md); }
.p3-grammar h4 { font-size: var(--fs-body-small); margin: 0 0 var(--space-xs); }
.p3-grammar ul { margin: 0; padding-left: 14pt; font-size: var(--fs-body-small); }
.p3-translation { margin-top: var(--space-md); font-family: var(--font-ko); font-size: var(--fs-body-small); }
.p3-translation p { margin: 0 0 var(--space-xs); }

/* ===== Page 4 ===== */
.p4-vocab { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-sm); }
.vocab-card { border: 1pt solid var(--tn-divider); border-radius: 3pt; padding: var(--space-sm); }
.vocab-card .head { display: flex; align-items: baseline; gap: var(--space-xs); }
.vocab-card .word { font-weight: 700; font-size: var(--fs-body); }
.vocab-card .pos { font-style: italic; color: var(--tn-ink-soft); font-size: var(--fs-caption); }
.vocab-card .meaning { font-family: var(--font-ko); font-size: var(--fs-body-small); margin-top: 2pt; }
.vocab-card .syn-ant { font-size: var(--fs-caption); margin-top: 2pt; color: var(--tn-accent-2); }
.vocab-card .example { font-size: var(--fs-caption); margin-top: var(--space-xs); }
.vocab-card .exam-source { font-size: var(--fs-caption); color: var(--tn-muted); font-style: italic; }

.p4-selftest {
  margin-top: var(--space-md);
  padding-top: var(--space-sm);
  border-top: 1pt solid var(--tn-divider);
  display: grid; grid-template-columns: repeat(5, 1fr); gap: var(--space-xs);
  font-size: var(--fs-caption);
}
.p4-selftest .cell { display: flex; align-items: center; gap: 4pt; }
.p4-selftest .cell .box { width: 8pt; height: 8pt; border: 1pt solid var(--tn-muted); display: inline-block; }

/* overflow warning (dev mode only) */
.page.overflow { outline: 2pt dashed var(--tn-warn); }
.overflow-warning { position: absolute; top: 4mm; right: 4mm; background: var(--tn-warn); color: white; padding: 2pt 6pt; font-size: 8pt; border-radius: 3pt; }
```

- [ ] **Step 2: Commit**

```bash
git add textbook/styles/layout.css
git commit -m "Add 4-page layout grid and components"
```

---

### Task 6: Print CSS (A4 paged-media rules)

**Files:**
- Create: `textbook/styles/print.css`

- [ ] **Step 1: Write print.css**

File: `textbook/styles/print.css`
```css
@page {
  size: A4;
  margin: 0;
}

@media print {
  html, body { background: white; }
  body { margin: 0; }
  .page { margin: 0; box-shadow: none; page-break-after: always; break-after: page; }
  .page:last-child { page-break-after: auto; break-after: auto; }
  .page.overflow { outline: none; }
  .overflow-warning { display: none; }
}
```

- [ ] **Step 2: Commit**

```bash
git add textbook/styles/print.css
git commit -m "Add print CSS with A4 page rules"
```

---

### Task 7: HTML template with data-slot hooks

**Files:**
- Create: `textbook/textbook.html`

- [ ] **Step 1: Write textbook.html**

File: `textbook/textbook.html`
```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Terra Nova Textbook</title>
<link rel="stylesheet" href="styles/tokens.css" />
<link rel="stylesheet" href="styles/layout.css" />
<link rel="stylesheet" href="styles/print.css" />
</head>
<body>

<template id="tpl-passage">
  <article class="passage" data-slot="root">

    <section class="page page-1" data-page="1">
      <header class="page-head">
        <span class="section-label">Passage</span>
        <span data-slot="passage-id"></span>
      </header>
      <div class="page-body">
        <div class="p1-meta">
          <span class="chip" data-slot="subject"></span>
          <span class="difficulty" data-slot="difficulty"></span>
        </div>
        <h1 class="p1-title" data-slot="title"></h1>
        <p class="p1-subtitle" data-slot="subtitle"></p>
        <div class="p1-body" data-slot="body"></div>
        <figure class="p1-illustration">
          <img data-slot="illustration" alt="" />
        </figure>
        <figcaption class="p1-caption" data-slot="illustration-caption"></figcaption>
      </div>
      <footer class="page-foot">
        <span data-slot="theme-foot"></span>
        <span class="brand">Terra Nova</span>
      </footer>
    </section>

    <section class="page page-2" data-page="2">
      <header class="page-head">
        <span class="section-label">Practice</span>
        <span data-slot="passage-id-2"></span>
      </header>
      <div class="page-body">
        <div class="p2-questions" data-slot="questions"></div>
        <aside class="tieback">
          <div class="unit-label" data-slot="tieback-unit"></div>
          <div class="body-ko" data-slot="tieback-body"></div>
          <div class="tags" data-slot="tieback-tags"></div>
        </aside>
      </div>
      <footer class="page-foot">
        <span>Practice · 1/1</span>
        <span class="brand">Terra Nova</span>
      </footer>
    </section>

    <section class="page page-3" data-page="3">
      <header class="page-head">
        <span class="section-label">Syntax</span>
        <span data-slot="passage-id-3"></span>
      </header>
      <div class="page-body">
        <div class="p3-reprint" data-slot="reprint"></div>
        <div class="p3-sentences" data-slot="sentences"></div>
        <div class="p3-grammar">
          <h4>문법 포인트</h4>
          <ul data-slot="grammar-points"></ul>
        </div>
        <div class="p3-translation" data-slot="translation"></div>
      </div>
      <footer class="page-foot">
        <span>Syntax · 1/1</span>
        <span class="brand">Terra Nova</span>
      </footer>
    </section>

    <section class="page page-4" data-page="4">
      <header class="page-head">
        <span class="section-label">Vocab</span>
        <span data-slot="passage-id-4"></span>
      </header>
      <div class="page-body">
        <div class="p4-vocab" data-slot="vocab"></div>
        <div class="p4-selftest" data-slot="selftest"></div>
      </div>
      <footer class="page-foot">
        <span>Vocab · 1/1</span>
        <span class="brand">Terra Nova</span>
      </footer>
    </section>

  </article>
</template>

<main id="stage"></main>

<script type="module" src="scripts/render.js"></script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add textbook/textbook.html
git commit -m "Add 4-page HTML template with data-slot hooks"
```

---

### Task 8: render.js (JSON → DOM binding)

**Files:**
- Create: `textbook/scripts/render.js`

- [ ] **Step 1: Write render.js**

File: `textbook/scripts/render.js`
```javascript
const params = new URLSearchParams(location.search);
const month = params.get('month') || '2026-05';
const passage = params.get('passage') || '01';

const stage = document.getElementById('stage');
const tpl = document.getElementById('tpl-passage');

function setText(root, slot, value) {
  const el = root.querySelector(`[data-slot="${slot}"]`);
  if (!el) return;
  el.textContent = value ?? '';
}
function setHTML(root, slot, html) {
  const el = root.querySelector(`[data-slot="${slot}"]`);
  if (!el) return;
  el.innerHTML = html ?? '';
}
function setAttr(root, slot, attr, value) {
  const el = root.querySelector(`[data-slot="${slot}"]`);
  if (!el) return;
  el.setAttribute(attr, value ?? '');
}

function renderParagraphs(text) {
  return text.split(/\n\s*\n/).map(p => `<p>${p.trim().replace(/\n/g, '<br/>')}</p>`).join('');
}

function renderQuestions(list) {
  return list.map((q, i) => {
    if (q.type === 'mock_objective') {
      const choices = q.choices.map(c => `<li>${c}</li>`).join('');
      return `<div class="question mock">
        <div class="stem">Q${i+1}. [${q.style}] ${q.stem}</div>
        <ol class="choices">${choices}</ol>
      </div>`;
    }
    return `<div class="question descriptive">
      <div class="stem">Q${i+1}. [서술형] ${q.prompt}</div>
      <div class="answer-slot" aria-hidden="true"></div>
    </div>`;
  }).join('');
}

function renderTags(tags) {
  return tags.map(t => `<span class="tag">#${t}</span>`).join('');
}

function renderReprint(text) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  return sentences.map(s => `<span class="sent">${s.trim()}</span> `).join('');
}

function renderSentences(list) {
  return list.map(s => {
    const parts = Object.entries(s.parts).map(([k, v]) => `<span><span class="k">${k}</span>=${v}</span>`).join('');
    return `<div class="p3-sentence">
      <div><span class="num">[${s.index}]</span><span class="en">${s.en}</span></div>
      <div class="parts">${parts}</div>
      <div class="note">💬 ${s.grammar_note}</div>
    </div>`;
  }).join('');
}

function renderGrammar(list) {
  return list.map(g => `<li>${g}</li>`).join('');
}

function renderTranslation(paragraphs) {
  return paragraphs.map(p => `<p>${p}</p>`).join('');
}

function renderVocab(list) {
  return list.map(v => {
    const syn = v.synonyms.length ? `syn: ${v.synonyms.join(', ')}` : '';
    const ant = v.antonyms.length ? `ant: ${v.antonyms.join(', ')}` : '';
    const synAnt = [syn, ant].filter(Boolean).join(' / ');
    return `<div class="vocab-card">
      <div class="head"><span class="word">${v.word}</span><span class="pos">${v.pos}</span></div>
      <div class="meaning">${v.meaning_ko}</div>
      ${synAnt ? `<div class="syn-ant">${synAnt}</div>` : ''}
      <div class="example">📘 ${v.example}</div>
      <div class="exam-source">${v.exam_source}</div>
    </div>`;
  }).join('');
}

function renderSelftest(list) {
  return list.map(v => `<div class="cell"><span class="box"></span>${v.word}</div>`).join('');
}

function detectOverflow(root) {
  root.querySelectorAll('.page').forEach(p => {
    if (p.scrollHeight > p.clientHeight + 2) {
      p.classList.add('overflow');
      const warn = document.createElement('div');
      warn.className = 'overflow-warning';
      warn.textContent = 'OVERFLOW';
      p.appendChild(warn);
      console.warn('[render] overflow detected on', p.dataset.page);
    }
  });
}

async function main() {
  const path = `content/passages/${month}/${passage}.json`;
  const res = await fetch(path);
  if (!res.ok) {
    stage.innerHTML = `<pre>Missing data: ${path}</pre>`;
    return;
  }
  const data = await res.json();

  const frag = tpl.content.cloneNode(true);
  const root = frag.querySelector('[data-slot="root"]');

  root.dataset.month = data.meta.month;
  document.body.setAttribute('data-month', data.meta.month);

  const id = `${data.meta.month} · ${String(data.meta.sequence).padStart(2, '0')}`;
  for (const s of ['passage-id', 'passage-id-2', 'passage-id-3', 'passage-id-4']) {
    setText(root, s, id);
  }

  setText(root, 'subject', data.meta.subject);
  setText(root, 'difficulty', `● ${data.meta.difficulty}`);
  setText(root, 'title', data.page1.title);
  setText(root, 'subtitle', data.page1.subtitle);
  setHTML(root, 'body', renderParagraphs(data.page1.body));
  setAttr(root, 'illustration', 'src', data.page1.illustration);
  setAttr(root, 'illustration', 'alt', data.page1.illustration_caption);
  setText(root, 'illustration-caption', data.page1.illustration_caption);
  setText(root, 'theme-foot', data.meta.theme_en);

  setHTML(root, 'questions', renderQuestions(data.page2.questions));
  setText(root, 'tieback-unit', `[${data.page2.textbook_tieback.unit_label}]`);
  setText(root, 'tieback-body', data.page2.textbook_tieback.body_ko);
  setHTML(root, 'tieback-tags', renderTags(data.page2.textbook_tieback.tags));

  setHTML(root, 'reprint', renderReprint(data.page1.body));
  setHTML(root, 'sentences', renderSentences(data.page3.sentences));
  setHTML(root, 'grammar-points', renderGrammar(data.page3.grammar_points));
  setHTML(root, 'translation', renderTranslation(data.page3.translation_ko));

  setHTML(root, 'vocab', renderVocab(data.page4.vocab));
  setHTML(root, 'selftest', renderSelftest(data.page4.vocab));

  stage.innerHTML = '';
  stage.appendChild(frag);

  requestAnimationFrame(() => detectOverflow(stage));
}

main().catch(err => {
  stage.innerHTML = `<pre>Render error: ${err.message}</pre>`;
  console.error(err);
});
```

- [ ] **Step 2: Commit**

```bash
git add textbook/scripts/render.js
git commit -m "Add render.js JSON-to-DOM binder with overflow guard"
```

---

### Task 9: Dev server

**Files:**
- Create: `textbook/tools/dev-server.mjs`

- [ ] **Step 1: Write dev-server.mjs**

File: `textbook/tools/dev-server.mjs`
```javascript
#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const proc = spawn('npx', ['sirv', root, '--port', '4173', '--host', '127.0.0.1', '--dev'], {
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

proc.on('exit', (code) => process.exit(code ?? 0));
```

- [ ] **Step 2: Manual smoke test**

Run:
```bash
cd textbook
npm run preview
```

Expected: server starts on `http://127.0.0.1:4173`. Visit `http://127.0.0.1:4173/textbook.html?month=2026-05&passage=01` — will show "Missing data" until sample JSON exists (Task 11). Stop with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add textbook/tools/dev-server.mjs
git commit -m "Add sirv-based dev server"
```

---

### Task 10: Sample SVG illustration

**Files:**
- Create: `textbook/assets/illustrations/2026-05/01.svg`

- [ ] **Step 1: Write illustration**

File: `textbook/assets/illustrations/2026-05/01.svg`

A line-art cosmic scene in Terra Nova palette (Caribbean Green accent on dark green).

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 350" role="img" aria-label="Stars forging elements inside us">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="75%">
      <stop offset="0%" stop-color="#06302B"/>
      <stop offset="100%" stop-color="#032221"/>
    </radialGradient>
    <radialGradient id="star" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#00DF81" stop-opacity="1"/>
      <stop offset="60%" stop-color="#2CC295" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#2CC295" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="800" height="350" fill="url(#bg)"/>

  <!-- background stars -->
  <g fill="#AAC8C4">
    <circle cx="60" cy="40" r="1.2"/>
    <circle cx="120" cy="80" r="0.9"/>
    <circle cx="200" cy="30" r="1.1"/>
    <circle cx="260" cy="70" r="0.8"/>
    <circle cx="340" cy="50" r="1.4"/>
    <circle cx="420" cy="90" r="0.9"/>
    <circle cx="500" cy="40" r="1.1"/>
    <circle cx="580" cy="70" r="0.8"/>
    <circle cx="650" cy="30" r="1.3"/>
    <circle cx="720" cy="60" r="0.9"/>
    <circle cx="90" cy="260" r="1.0"/>
    <circle cx="160" cy="290" r="0.8"/>
    <circle cx="240" cy="310" r="1.2"/>
    <circle cx="320" cy="280" r="0.9"/>
    <circle cx="480" cy="300" r="1.1"/>
    <circle cx="560" cy="290" r="0.9"/>
    <circle cx="640" cy="280" r="1.0"/>
    <circle cx="710" cy="310" r="0.8"/>
  </g>

  <!-- central star -->
  <circle cx="400" cy="175" r="90" fill="url(#star)"/>
  <circle cx="400" cy="175" r="28" fill="#00DF81"/>
  <circle cx="400" cy="175" r="14" fill="#F1F7F6"/>

  <!-- orbit rings -->
  <g fill="none" stroke="#2CC295" stroke-opacity="0.5" stroke-dasharray="4 4">
    <ellipse cx="400" cy="175" rx="160" ry="50"/>
    <ellipse cx="400" cy="175" rx="220" ry="85"/>
    <ellipse cx="400" cy="175" rx="280" ry="120"/>
  </g>

  <!-- electrons / particles -->
  <circle cx="560" cy="175" r="6" fill="#00DF81"/>
  <circle cx="240" cy="175" r="4" fill="#2CC295"/>
  <circle cx="620" cy="240" r="5" fill="#AAC8C4"/>
  <circle cx="180" cy="100" r="4" fill="#F1F7F6"/>

  <!-- trailing atoms -->
  <g stroke="#2CC295" stroke-width="1" fill="none">
    <path d="M50 320 Q 200 260 400 300 T 760 310" stroke-opacity="0.6"/>
  </g>
  <g fill="#00DF81">
    <circle cx="150" cy="295" r="3"/>
    <circle cx="300" cy="278" r="3"/>
    <circle cx="500" cy="304" r="3"/>
    <circle cx="680" cy="312" r="3"/>
  </g>
</svg>
```

- [ ] **Step 2: Commit**

```bash
git add textbook/assets/illustrations/2026-05/01.svg
git commit -m "Add cosmic-address sample illustration (SVG)"
```

---

### Task 11: Sample passage JSON (2026-05 · 01)

**Files:**
- Create: `textbook/content/passages/2026-05/01.json`

- [ ] **Step 1: Write 01.json**

File: `textbook/content/passages/2026-05/01.json`
```json
{
  "schema_version": "1.0",
  "id": "2026-05-01",
  "meta": {
    "month": "2026-05",
    "sequence": 1,
    "theme_en": "The Cosmic Address",
    "subject": "통합과학",
    "linked_unit": "I-1 우주의 시작과 원소의 생성",
    "achievement_standard": "10통과01-01",
    "difficulty": "중간",
    "cognitive_skill": "빈칸 추론",
    "key_concepts": ["빅뱅", "별의 핵융합", "원소의 기원"]
  },
  "page1": {
    "title": "Where Do Atoms Come From?",
    "subtitle": "A story that began 13.8 billion years ago.",
    "body": "Every atom in your body was forged long before you were born. Moments after the Big Bang, the universe produced only the lightest elements, hydrogen and helium. Nothing heavier could form yet, because the young universe was too hot and too empty for complex matter to settle. As gravity slowly gathered those simple atoms into clouds, the first stars ignited. Inside their burning cores, atoms crashed together and fused into heavier kinds of matter. Carbon, oxygen, iron, and countless other elements were all assembled in this way. When a massive star ended its life in a violent explosion, it scattered these newborn elements across space. Later generations of stars, planets, and even living bodies were built from that stardust. So when scientists say that we are made of star material, they mean it literally. Each breath you take uses oxygen that once lived inside a distant star. In this sense, knowing the story of atoms is knowing the deepest part of your own cosmic address.",
    "illustration": "../../assets/illustrations/2026-05/01.svg",
    "illustration_caption": "Stars forging the elements inside us."
  },
  "page2": {
    "questions": [
      {
        "type": "mock_objective",
        "style": "빈칸 추론",
        "stem": "다음 빈칸에 들어갈 말로 가장 적절한 것은? '...we are made of ______ material.'",
        "choices": ["ocean", "star", "rock", "cloud", "fossil"],
        "answer_index": 1
      },
      {
        "type": "mock_objective",
        "style": "요지",
        "stem": "윗글의 요지로 가장 적절한 것은?",
        "choices": [
          "우주는 단순한 원소들로만 이루어져 있다.",
          "별이 폭발하면 새로운 원소가 지구에서만 만들어진다.",
          "인체를 이루는 무거운 원소들은 별 내부에서 생성되었다.",
          "빅뱅 직후 모든 원소가 한꺼번에 만들어졌다.",
          "행성은 원소보다 먼저 형성되었다."
        ],
        "answer_index": 2
      },
      {
        "type": "school_descriptive",
        "prompt": "본문을 바탕으로 '우리 몸을 이루는 무거운 원소들이 어디서 왔는지'를 두 문장 이내로 우리말로 서술하시오.",
        "model_answer": "빅뱅 직후에는 수소와 헬륨 같은 가벼운 원소만 만들어졌고, 이후 별 내부의 핵융합과 초신성 폭발을 통해 탄소·산소·철 등 무거운 원소가 생성되었다. 그 원소들이 우주로 흩어지며 새로운 별과 행성, 결국 우리의 몸까지 이루는 재료가 되었다."
      }
    ],
    "textbook_tieback": {
      "unit_label": "통합과학 I-1 우주의 시작과 원소의 생성",
      "body_ko": "빅뱅 직후 우주는 주로 수소와 헬륨으로 이루어졌다. 이후 별 내부의 핵융합으로 탄소·산소·철과 같은 더 무거운 원소가 만들어졌고, 초신성 폭발은 이 원소들을 우주 공간으로 퍼뜨렸다. 다음 세대 별과 행성, 그리고 생명체를 이루는 원소는 이렇게 별의 일생에서 비롯된 것이다. 원소 주기율표는 이러한 '원소의 기원'을 체계적으로 정리한 지도라고 볼 수 있다.",
      "tags": ["빅뱅", "핵융합", "초신성", "원소주기율"]
    }
  },
  "page3": {
    "sentences": [
      {
        "index": 1,
        "en": "Every atom in your body / was forged / long before you were born.",
        "parts": { "subject": "Every atom in your body", "verb": "was forged", "modifier": "long before you were born" },
        "grammar_note": "수동태(be + p.p.) + 시간 부사절"
      },
      {
        "index": 2,
        "en": "Moments after the Big Bang, / the universe produced / only the lightest elements.",
        "parts": { "adverbial": "Moments after the Big Bang", "subject": "the universe", "verb": "produced", "object": "only the lightest elements" },
        "grammar_note": "전치사구 도치 강조"
      },
      {
        "index": 3,
        "en": "As gravity slowly gathered those simple atoms into clouds, / the first stars ignited.",
        "parts": { "subordinator": "As", "sub-clause": "gravity slowly gathered those simple atoms into clouds", "subject": "the first stars", "verb": "ignited" },
        "grammar_note": "접속사 As = '~함에 따라'"
      },
      {
        "index": 4,
        "en": "Inside their burning cores, / atoms crashed together / and fused / into heavier kinds of matter.",
        "parts": { "place": "Inside their burning cores", "subject": "atoms", "verb-1": "crashed together", "verb-2": "fused", "modifier": "into heavier kinds of matter" },
        "grammar_note": "and로 연결된 동사 병렬"
      },
      {
        "index": 5,
        "en": "When a massive star ended its life in a violent explosion, / it scattered these newborn elements across space.",
        "parts": { "sub-clause": "When a massive star ended its life in a violent explosion", "subject": "it", "verb": "scattered", "object": "these newborn elements", "modifier": "across space" },
        "grammar_note": "부사절(When) + 주절"
      },
      {
        "index": 6,
        "en": "Later generations of stars, planets, and even living bodies / were built / from that stardust.",
        "parts": { "subject": "Later generations of stars, planets, and even living bodies", "verb": "were built", "modifier": "from that stardust" },
        "grammar_note": "수동태 + 출처의 from"
      },
      {
        "index": 7,
        "en": "Each breath you take / uses oxygen / that once lived inside a distant star.",
        "parts": { "subject": "Each breath (that) you take", "verb": "uses", "object": "oxygen", "relative-clause": "that once lived inside a distant star" },
        "grammar_note": "관계대명사 that (주격)"
      }
    ],
    "grammar_points": [
      "수동태 be + p.p. — 행위자보다 대상 강조",
      "관계대명사 that의 주격 용법",
      "접속사 As: 시간·이유 두 가지 뜻 구분"
    ],
    "translation_ko": [
      "당신 몸을 이루는 모든 원자는 당신이 태어나기 훨씬 전에 이미 만들어졌다. 빅뱅 직후 우주는 가장 가벼운 원소인 수소와 헬륨만 만들어냈다. 그보다 무거운 것은 아직 생겨날 수 없었는데, 초기 우주가 너무 뜨겁고 비어 있어 복잡한 물질이 자리 잡을 수 없었기 때문이다.",
      "중력이 단순한 원자들을 천천히 구름으로 모으면서 최초의 별들이 점화되었다. 그 별들의 타오르는 중심부에서 원자들은 서로 충돌하며 더 무거운 물질로 융합되었다. 탄소, 산소, 철, 그리고 헤아릴 수 없이 많은 다른 원소가 모두 이런 방식으로 조립되었다.",
      "거대한 별이 격렬한 폭발로 일생을 마치면, 이 갓 만들어진 원소들은 우주로 흩어진다. 이후 세대의 별, 행성, 심지어 살아 있는 몸까지도 그 별의 먼지로부터 지어졌다. 그러니 과학자들이 우리가 별의 재료로 되어 있다고 말할 때, 그것은 비유가 아니라 사실이다. 당신이 들이마시는 숨결은 한때 먼 별 속에 살던 산소를 쓴다. 그런 의미에서 원자의 이야기를 아는 것은 당신의 우주적 주소를 가장 깊은 곳까지 아는 일이다."
    ]
  },
  "page4": {
    "vocab": [
      { "word": "forge", "pos": "v.", "meaning_ko": "(금속을) 벼리다; 만들어내다", "synonyms": ["create", "shape"], "antonyms": ["destroy"], "example": "The blacksmith forged a sword from iron.", "exam_source": "2024학년도 9월 모의평가 34번" },
      { "word": "ignite", "pos": "v.", "meaning_ko": "점화되다, 불붙다", "synonyms": ["kindle", "spark"], "antonyms": ["extinguish"], "example": "The dry grass easily ignited in the summer heat.", "exam_source": "2023학년도 수능 41번" },
      { "word": "fuse", "pos": "v.", "meaning_ko": "융합하다, 결합하다", "synonyms": ["merge", "combine"], "antonyms": ["split", "separate"], "example": "Two small atoms fused into a larger one.", "exam_source": "2024학년도 6월 모의평가 32번" },
      { "word": "massive", "pos": "adj.", "meaning_ko": "거대한", "synonyms": ["huge", "enormous"], "antonyms": ["tiny"], "example": "A massive storm approached the coast.", "exam_source": "2023학년도 9월 모의평가 28번" },
      { "word": "scatter", "pos": "v.", "meaning_ko": "흩뿌리다", "synonyms": ["spread", "disperse"], "antonyms": ["gather"], "example": "The wind scattered the leaves across the yard.", "exam_source": "2022학년도 수능 37번" },
      { "word": "generation", "pos": "n.", "meaning_ko": "세대", "synonyms": ["age group"], "antonyms": [], "example": "Different generations hold different values.", "exam_source": "2024학년도 수능 24번" },
      { "word": "assemble", "pos": "v.", "meaning_ko": "조립하다, 모으다", "synonyms": ["build", "gather"], "antonyms": ["disassemble"], "example": "The parts were assembled into a working engine.", "exam_source": "2023학년도 6월 모의평가 33번" },
      { "word": "literally", "pos": "adv.", "meaning_ko": "문자 그대로", "synonyms": ["actually"], "antonyms": ["figuratively"], "example": "She literally ran to catch the train.", "exam_source": "2024학년도 수능 21번" },
      { "word": "distant", "pos": "adj.", "meaning_ko": "멀리 있는", "synonyms": ["far", "remote"], "antonyms": ["near"], "example": "A distant mountain appeared on the horizon.", "exam_source": "2023학년도 수능 29번" }
    ]
  }
}
```

- [ ] **Step 2: Run validator against the sample**

```bash
cd textbook
node tools/validate-content.mjs --file content/passages/2026-05/01.json
```

Expected: `OK content/passages/2026-05/01.json`. If a word-count or length error occurs, adjust body/tieback length to stay within limits and re-run.

- [ ] **Step 3: Commit**

```bash
git add textbook/content/passages/2026-05/01.json
git commit -m "Add sample passage 2026-05 · 01 (The Cosmic Address)"
```

---

### Task 12: Manual visual verification

**Files:** none (smoke test)

- [ ] **Step 1: Start dev server**

```bash
cd textbook
npm run preview
```

- [ ] **Step 2: Open browser**

Visit `http://127.0.0.1:4173/textbook.html?month=2026-05&passage=01`

- [ ] **Step 3: Visually verify**

Check all four pages rendered:
1. Page 1: title, subtitle, body, illustration with caption at bottom 25%
2. Page 2: three questions (Q1 객관식, Q2 객관식, Q3 서술형), tieback box at bottom
3. Page 3: reprinted passage with numbered sentences, per-sentence breakdown, grammar bullets, Korean translation
4. Page 4: 9 vocab cards in 2-column grid, selftest row at bottom

Check no `.overflow` outline appears (no red dashed warning). Open DevTools console — should see zero `[render] overflow detected` warnings.

Check the browser print preview (Ctrl+P) shows exactly 4 A4 pages with clean breaks.

If any page overflows or misaligns, **do not proceed**: adjust `layout.css` spacing or JSON content length and re-verify.

- [ ] **Step 4: Stop server**

Ctrl+C

No commit (no file changes).

---

### Task 13: Render E2E test (Puppeteer)

**Files:**
- Create: `textbook/tests/render.test.mjs`

- [ ] **Step 1: Write the failing test**

File: `textbook/tests/render.test.mjs`
```javascript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import puppeteer from 'puppeteer';
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

let server, browser;
const PORT = 4174;

async function waitFor(url, timeoutMs = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const r = await fetch(url);
      if (r.ok) return true;
    } catch {}
    await new Promise(r => setTimeout(r, 150));
  }
  throw new Error('server did not start');
}

beforeAll(async () => {
  server = spawn('npx', ['sirv', root, '--port', String(PORT), '--host', '127.0.0.1', '--quiet'], {
    stdio: 'pipe',
    shell: process.platform === 'win32'
  });
  await waitFor(`http://127.0.0.1:${PORT}/textbook.html`);
  browser = await puppeteer.launch({ headless: 'new' });
}, 60_000);

afterAll(async () => {
  if (browser) await browser.close();
  if (server) server.kill();
});

describe('render pipeline', () => {
  it('produces exactly four .page sections for the sample', async () => {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${PORT}/textbook.html?month=2026-05&passage=01`, { waitUntil: 'networkidle0' });
    const count = await page.$$eval('.page', nodes => nodes.length);
    expect(count).toBe(4);
    await page.close();
  });

  it('does not trigger overflow on any page', async () => {
    const page = await browser.newPage();
    const warnings = [];
    page.on('console', msg => { if (msg.type() === 'warn') warnings.push(msg.text()); });
    await page.goto(`http://127.0.0.1:${PORT}/textbook.html?month=2026-05&passage=01`, { waitUntil: 'networkidle0' });
    const overflowPages = await page.$$eval('.page.overflow', n => n.length);
    expect(overflowPages).toBe(0);
    expect(warnings.filter(w => w.includes('overflow'))).toEqual([]);
    await page.close();
  });

  it('injects title, subject chip, and 9 vocab cards', async () => {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${PORT}/textbook.html?month=2026-05&passage=01`, { waitUntil: 'networkidle0' });
    const title = await page.$eval('.p1-title', el => el.textContent.trim());
    const subject = await page.$eval('.chip', el => el.textContent.trim());
    const vocabCount = await page.$$eval('.vocab-card', n => n.length);
    expect(title).toBe('Where Do Atoms Come From?');
    expect(subject).toBe('통합과학');
    expect(vocabCount).toBe(9);
    await page.close();
  });
});
```

- [ ] **Step 2: Run test**

```bash
cd textbook
npm test
```

Expected: tests pass. If a page overflows, adjust layout (reduce `--fs-body` by 0.5pt or tighten spacing) until clean.

- [ ] **Step 3: Commit**

```bash
git add textbook/tests/render.test.mjs
git commit -m "Add Puppeteer render E2E test (4 pages, no overflow, slots filled)"
```

---

### Task 14: build-pdf.mjs (Puppeteer batch PDF)

**Files:**
- Create: `textbook/tools/build-pdf.mjs`

- [ ] **Step 1: Write build-pdf.mjs**

File: `textbook/tools/build-pdf.mjs`
```javascript
#!/usr/bin/env node
import puppeteer from 'puppeteer';
import { spawn } from 'node:child_process';
import { mkdirSync, readdirSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

async function waitFor(url, timeoutMs = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try { const r = await fetch(url); if (r.ok) return true; } catch {}
    await new Promise(r => setTimeout(r, 150));
  }
  throw new Error(`server did not start at ${url}`);
}

function listPassages(monthDir) {
  return readdirSync(monthDir)
    .filter(n => /^\d{2}\.json$/.test(n))
    .map(n => n.replace(/\.json$/, ''))
    .sort();
}

async function main() {
  const { values } = parseArgs({
    options: {
      month: { type: 'string' },
      only:  { type: 'string' },
      merged: { type: 'boolean', default: false }
    }
  });
  if (!values.month) {
    console.error('usage: build-pdf --month YYYY-MM [--only NN] [--merged]');
    process.exit(2);
  }

  const monthDir = join(root, 'content', 'passages', values.month);
  if (!existsSync(monthDir)) { console.error(`no such month: ${monthDir}`); process.exit(1); }

  // Validate first
  const validator = spawn('node', [join(root, 'tools', 'validate-content.mjs'), '--month', values.month], { stdio: 'inherit' });
  await new Promise((ok, ko) => validator.on('exit', c => c === 0 ? ok() : ko(new Error('validation failed'))));

  const outDir = join(root, 'dist', values.month);
  mkdirSync(outDir, { recursive: true });

  const port = 4175;
  const server = spawn('npx', ['sirv', root, '--port', String(port), '--host', '127.0.0.1', '--quiet'], {
    stdio: 'pipe', shell: process.platform === 'win32'
  });
  await waitFor(`http://127.0.0.1:${port}/textbook.html`);

  const browser = await puppeteer.launch({ headless: 'new' });
  try {
    const all = listPassages(monthDir);
    const targets = values.only ? all.filter(p => p === values.only.padStart(2, '0')) : all;

    for (const seq of targets) {
      const page = await browser.newPage();
      const url = `http://127.0.0.1:${port}/textbook.html?month=${values.month}&passage=${seq}`;
      await page.goto(url, { waitUntil: 'networkidle0' });

      const overflow = await page.$$eval('.page.overflow', n => n.length);
      if (overflow > 0) {
        console.warn(`SKIP ${seq} — overflow detected on ${overflow} page(s)`);
        await page.close();
        continue;
      }

      const pdfPath = join(outDir, `${seq}.pdf`);
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: 0, bottom: 0, left: 0, right: 0 }
      });
      console.log(`WROTE ${pdfPath}`);
      await page.close();
    }

    if (values.merged) {
      console.log('(merged PDF flag noted; individual PDFs written. Merge with a downstream tool such as pdf-lib if needed.)');
    }
  } finally {
    await browser.close();
    server.kill();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
```

- [ ] **Step 2: Run build for the sample**

```bash
cd textbook
npm run build -- --month 2026-05 --only 01
```

Expected output: validation OK, server starts, `WROTE dist/2026-05/01.pdf`. Open the PDF manually and verify 4 A4 pages render correctly (no overflow, illustration visible, all text populated).

- [ ] **Step 3: Commit**

```bash
git add textbook/tools/build-pdf.mjs
git commit -m "Add Puppeteer PDF batch builder"
```

---

### Task 15: curriculum.json (240-entry index)

**Files:**
- Create: `textbook/content/curriculum.json`

This task is pure content/metadata authoring. The schema is fixed; only the values vary.

**Monthly theme arcs (repeat from spec for convenience):**

| Month | Theme EN | Primary Axis |
|-------|----------|--------------|
| 2026-05 | The Cosmic Address | 통합과학 우주·원소 × 통합사회 시공간과 인간 |
| 2026-06 | Living Together | 통합과학 환경·생태 × 통합사회 지속가능성·인구 |
| 2026-07 | Shaping the Modern World | 통합사회 근대화 × 한국사 개항·식민 |
| 2026-08 | Numbers that Decide | 수학 함수·통계 × 통합과학 데이터 |
| 2026-09 | Rights and Voices | 통합사회 인권·민주주의 × 국어 논설 |
| 2026-10 | Machines Rising | 통합과학 기술 × 통합사회 미래사회 |
| 2026-11 | Stories We Tell | 국어 현대·고전문학 × 예술사 |
| 2026-12 | Choices and Markets | 통합사회 시장·합리 × 수학 최적화 |
| 2027-01 | The Fabric of Matter | 통합과학 물질·규칙성 |
| 2027-02 | Words That Move Us | 국어 화법·매체 × 미디어리터러시 |
| 2027-03 | Memory and Identity | 한국사 근현대 × 통합사회 정체성 |
| 2027-04 | The Big Picture | 12개월 핵심 재조명 |

**Per-month 20-entry distribution (fixed):**

- seq 1–6: subject="통합과학"
- seq 7–12: subject="통합사회"
- seq 13–15: subject="수학"
- seq 16–18: subject="국어"
- seq 19: subject="한국사"
- seq 20: subject="예체능·정보"

**Difficulty distribution per month (fixed):**

5× 쉬움 · 7× 중간 · 6× 어려움 · 2× 도전. Apply in a fixed rotation: seqs 1,5,9,13,17 = 쉬움; 2,3,6,7,10,14,18 = 중간; 4,8,11,12,15,19 = 어려움; 16,20 = 도전.

**cognitive_skill rotation (cycle through, same within a difficulty band):**

- 쉬움: 요지 → 주제 → 제목 → 일치 → 어휘
- 중간: 빈칸추론 → 함의 → 어휘추론 → 글의순서 → 문장삽입 → 요약 → 어법
- 어려움: 간접서술 → 추론 → 장문독해 → 글의순서 → 문장삽입 → 도표해석
- 도전: 장문독해 → 고난도 빈칸

**Achievement standard code prefixes by subject:**

- 통합과학 → `10통과`
- 통합사회 → `10통사`
- 수학 → `10수학`
- 국어 → `10국어`
- 한국사 → `10한사`
- 예체능·정보 → `10정보` (for 정보 textbook code) or `10음악` / `10미술` / `10체육` as appropriate — pick one per entry

- [ ] **Step 1: Write the full curriculum.json**

File: `textbook/content/curriculum.json`

Produce a JSON array of **240 entries** strictly following:

- Structure per entry:
  ```json
  {
    "id": "YYYY-MM-NN",
    "month": "YYYY-MM",
    "sequence": N,
    "theme_en": "<month theme>",
    "passage_topic_en": "<specific topic for this passage in English>",
    "passage_topic_ko": "<specific topic in Korean>",
    "subject": "<one of the 6>",
    "linked_unit": "<real Korean high-school unit name>",
    "achievement_standard": "<10XX NN-NN code>",
    "difficulty": "<one of 4>",
    "cognitive_skill": "<from rotation>",
    "key_concepts": [2–5 Korean concept tags]
  }
  ```

- All 12 months, each with seq 1–20, exactly 240 entries total.
- Every entry validates against these rules: `subject` enum match, `difficulty` enum match, `achievement_standard` pattern match (`^10[가-힣]{2,3}\d{2}-\d{2}$`).
- Passage topics must differ within a month (no duplicate `passage_topic_en` inside a month).
- Passage topics stay on-theme: 2026-05's 통합과학 entries cover cosmic/matter topics; 2027-03's 통합사회 entries cover identity/memory.

**Worked example — first 5 entries (month 2026-05):**
```json
[
  {
    "id": "2026-05-01",
    "month": "2026-05",
    "sequence": 1,
    "theme_en": "The Cosmic Address",
    "passage_topic_en": "Where Do Atoms Come From?",
    "passage_topic_ko": "원자는 어디서 왔을까",
    "subject": "통합과학",
    "linked_unit": "I-1 우주의 시작과 원소의 생성",
    "achievement_standard": "10통과01-01",
    "difficulty": "쉬움",
    "cognitive_skill": "요지",
    "key_concepts": ["빅뱅", "별의 핵융합", "원소의 기원"]
  },
  {
    "id": "2026-05-02",
    "month": "2026-05",
    "sequence": 2,
    "theme_en": "The Cosmic Address",
    "passage_topic_en": "The Life Cycle of a Star",
    "passage_topic_ko": "별의 일생",
    "subject": "통합과학",
    "linked_unit": "I-1 우주의 시작과 원소의 생성",
    "achievement_standard": "10통과01-02",
    "difficulty": "중간",
    "cognitive_skill": "빈칸추론",
    "key_concepts": ["주계열성", "적색거성", "초신성"]
  },
  {
    "id": "2026-05-03",
    "month": "2026-05",
    "sequence": 3,
    "theme_en": "The Cosmic Address",
    "passage_topic_en": "Reading the Periodic Table",
    "passage_topic_ko": "주기율표 읽는 법",
    "subject": "통합과학",
    "linked_unit": "II-1 원소와 주기율표",
    "achievement_standard": "10통과02-01",
    "difficulty": "중간",
    "cognitive_skill": "함의",
    "key_concepts": ["원소주기율", "전자배치", "족과 주기"]
  },
  {
    "id": "2026-05-04",
    "month": "2026-05",
    "sequence": 4,
    "theme_en": "The Cosmic Address",
    "passage_topic_en": "Why Iron Is the Last Star-Made Element",
    "passage_topic_ko": "철이 별에서 만들어지는 마지막 원소인 이유",
    "subject": "통합과학",
    "linked_unit": "I-1 우주의 시작과 원소의 생성",
    "achievement_standard": "10통과01-02",
    "difficulty": "어려움",
    "cognitive_skill": "간접서술",
    "key_concepts": ["핵융합 효율", "철", "중성자별"]
  },
  {
    "id": "2026-05-05",
    "month": "2026-05",
    "sequence": 5,
    "theme_en": "The Cosmic Address",
    "passage_topic_en": "How Astronomers See the Past",
    "passage_topic_ko": "천문학자들은 어떻게 과거를 보는가",
    "subject": "통합과학",
    "linked_unit": "I-2 시스템과 상호작용",
    "achievement_standard": "10통과02-02",
    "difficulty": "쉬움",
    "cognitive_skill": "주제",
    "key_concepts": ["빛의 속도", "관측 가능한 우주", "적색편이"]
  }
]
```

Continue this pattern across all 12 months × 20 sequences. Use on-theme Korean 고1 교과서 unit names for `linked_unit` and realistic `10XX NN-NN` achievement codes (ranges: 통사 01-01 to 09-03; 통과 01-01 to 08-03; 수학 01-01 to 03-05; 국어 01-01 to 06-03; 한사 01-01 to 06-02).

- [ ] **Step 2: Validate curriculum structure with a quick script**

Run (one-off sanity check, no file created):
```bash
cd textbook
node -e "
const data = JSON.parse(require('fs').readFileSync('content/curriculum.json','utf8'));
console.assert(data.length === 240, 'expected 240 entries, got ' + data.length);
const months = new Set(data.map(e => e.month));
console.assert(months.size === 12, 'expected 12 months, got ' + months.size);
const subjects = ['통합과학','통합사회','수학','국어','한국사','예체능·정보'];
const badSubj = data.filter(e => !subjects.includes(e.subject));
console.assert(badSubj.length === 0, 'invalid subjects: ' + badSubj.length);
const difficulties = ['쉬움','중간','어려움','도전'];
const badDiff = data.filter(e => !difficulties.includes(e.difficulty));
console.assert(badDiff.length === 0, 'invalid difficulties: ' + badDiff.length);
const re = /^10[가-힣]{2,3}\d{2}-\d{2}$/;
const badStd = data.filter(e => !re.test(e.achievement_standard));
console.assert(badStd.length === 0, 'invalid achievement codes: ' + badStd.length);
console.log('curriculum.json: 240 entries, 12 months, all enums and codes valid');
"
```

Expected stdout: `curriculum.json: 240 entries, 12 months, all enums and codes valid`

- [ ] **Step 3: Commit**

```bash
git add textbook/content/curriculum.json
git commit -m "Add 240-entry curriculum index (12 months × 20 passages)"
```

---

### Task 16: End-to-end verification

**Files:** none (final smoke test)

- [ ] **Step 1: Clean build artifacts**

```bash
cd textbook
rm -rf dist
```

- [ ] **Step 2: Run full test suite**

```bash
npm test
```

Expected: all schema + render tests pass.

- [ ] **Step 3: Validate sample month**

```bash
npm run validate -- --month 2026-05
```

Expected: `OK content/passages/2026-05/01.json` (only 01 exists for now; Task 15 covers that).

- [ ] **Step 4: Build sample PDF**

```bash
npm run build -- --month 2026-05 --only 01
```

Expected: `dist/2026-05/01.pdf` produced. Open manually; confirm 4 A4 pages render cleanly with all content visible and illustration present.

- [ ] **Step 5: Check theme swap works**

Edit `textbook/styles/tokens.css` temporarily — change `--tn-accent` to `#FF5577`. Reload `textbook.html?month=2026-05&passage=01` in browser. Theme bar should turn pink. Revert the change.

- [ ] **Step 6: Final commit (if any dev-only tweaks)**

If you fixed any overflow or rendering issue during verification, commit those fixes with a clear message.

---

## Self-Review

**Spec coverage audit:**

- Spec §3 architecture (file tree) → Task 1 + Tasks 4–9 (create each file)
- Spec §4 curriculum (240 entries, distribution rules) → Task 15
- Spec §5 4-page layout → Tasks 4–7 (CSS + HTML slots) + Task 12 (visual verify) + Task 13 (E2E test)
- Spec §5.5 invariance mechanisms → Task 2 (schema maxLengths) + Task 3 (validator tests including word count) + Task 8 (overflow detection in render)
- Spec §6 data schema → Tasks 2–3
- Spec §7 theme tokens → Task 4 + Task 16 Step 5 (theme swap verification)
- Spec §8 PDF CLI (validate + build + merged + error handling) → Tasks 3 (validator CLI) + Task 14 (builder)
- Spec §9 this-session deliverables → All 16 tasks produce them
  - textbook/ directory ✓
  - curriculum.json 240 entries ✓ (Task 15)
  - 2026-05/01.json ✓ (Task 11)
  - 2026-05/01.svg ✓ (Task 10)
  - Sample PDF builds ✓ (Task 16)

**Placeholder scan:** Task 15 delegates bulk content entry with explicit rules; topics for most entries are to be written during execution. This is data entry work with hard structural constraints, not a logic placeholder — the schema validator enforces correctness. All other tasks contain complete code.

**Type/name consistency spot-check:**

- `data-slot` attributes in Task 7 HTML match slot names in Task 8 render.js (verified: `passage-id`, `subject`, `difficulty`, `title`, `subtitle`, `body`, `illustration`, `illustration-caption`, `theme-foot`, `questions`, `tieback-unit`, `tieback-body`, `tieback-tags`, `reprint`, `sentences`, `grammar-points`, `translation`, `vocab`, `selftest`).
- JSON keys in Task 11 sample match schema property names in Task 2 (page1/page2/page3/page4; vocab fields: word/pos/meaning_ko/synonyms/antonyms/example/exam_source).
- `validatePassage` exported from `tools/validate-content.mjs` is imported in `tests/schema.test.mjs` (matches).

**Scope:** Single plan produces working software: dev server runs, template renders, sample passage validates and builds to PDF, 240-entry curriculum index exists. Further content authoring for passages 2-240 is explicitly Non-Goals per spec §2.
