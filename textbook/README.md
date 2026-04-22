# Terra Nova Textbook Generator

HTML-based textbook template + JSON-driven content renderer + Puppeteer PDF batch builder.

## Quickstart

```bash
cd textbook
npm install
npm run preview                                 # http://127.0.0.1:4173
npm run validate -- --month 2026-06
npm run build    -- --month 2026-06 --only 01
npm test
```

## Authoring a new passage

1. **Read the guide:** `templates/AUTHORING-GUIDE.md`
2. **Copy a reference sample:** `content/passages/2026-06/01.json` (canonical, all fields used)
3. **Or start from the blank scaffold:** `templates/passage.scaffold.json`
4. **Save to:** `content/passages/YYYY-MM/NN.json`
5. **Validate:** `npm run validate -- --file content/passages/YYYY-MM/NN.json`
6. **Build PDF:** `npm run build -- --month YYYY-MM --only NN`

The 4-page layout is **fixed**. The template (HTML + CSS + render.js) stays identical across every passage — only JSON content changes.

## Directory map

```text
textbook/
├── textbook.html                 # Single HTML template
├── styles/
│   ├── tokens.css                # Per-month palette + typography
│   ├── layout.css                # 4-page grid, components, ruby, hanging indents
│   └── print.css                 # A4 @page rules
├── scripts/
│   └── render.js                 # JSON → DOM binder
├── schemas/
│   └── passage.schema.json       # Single source of truth (v2.1)
├── content/
│   ├── curriculum.json           # 240-entry metadata index (12 months × 20)
│   └── passages/{YYYY-MM}/{NN}.json
├── assets/illustrations/{YYYY-MM}/{NN}.svg
├── templates/
│   ├── AUTHORING-GUIDE.md        # Read this before writing any passage
│   └── passage.scaffold.json     # Blank JSON skeleton
├── tools/
│   ├── validate-content.mjs      # AJV + custom rules
│   ├── build-pdf.mjs             # Puppeteer batch PDF
│   └── dev-server.mjs            # sirv wrapper
├── tests/                        # vitest — schema + render E2E
└── dist/                         # Generated PDFs (gitignored)
```

## Design invariants (do not change per-passage)

- A4 portrait, 15mm margins
- Top gradient bar: **1cm**
- 4 pages per passage: Passage → Practice → Syntax → Vocab
- Footer: circular page number (left), `TERRA·NOVA` wordmark (right)
- S/V/O/C/M color code stays identical across months (learning consistency)

Spec: `../docs/superpowers/specs/2026-04-22-terra-nova-textbook-generator-design.md`
