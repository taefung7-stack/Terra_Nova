#!/usr/bin/env node
/* ===================================================================
 * 변형문제 합본 — variant-book.html 앞에 표지를 붙여 합본 PDF 로 만든다.
 * ===================================================================
 * combine.mjs / combine-workbook.mjs 와 같은 표지 양식을 쓴다.
 * variant-book.html 은 이미 유형별로 묶인 한 권이므로 본문은 그대로 두고
 * 표지 1장만 앞에 덧붙인 뒤 페이지 번호를 다시 매긴다(표지는 번호 없음).
 *
 * 사용법: node _oneoff-신서고-YBM-L1/combine-variant.mjs <EX|EX2>
 * =================================================================== */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const LESSONS = {
  EX: {
    titleEn: '05 수식어는 괄호로 묶어라',
    coverSub: '신서고 부교재 · 어법 유닛<br>05 수식어는 괄호로 묶어라',
    docTitle: '신서고 부교재 · 05 수식어는 괄호로 묶어라 변형문제 합본 — Terra Nova',
    out: '신서고2-2중간_부교재_05수식어는괄호로묶어라_변형문제_합본.pdf',
  },
  EX2: {
    titleEn: '상관접속사와 병렬',
    coverSub: '신서고 부교재 · 어법 유닛<br>상관접속사와 병렬',
    docTitle: '신서고 부교재 · 상관접속사와 병렬 변형문제 합본 — Terra Nova',
    out: '신서고2-2중간_부교재_상관접속사와병렬_변형문제_합본.pdf',
  },
};

const lessonId = (process.argv[2] || '').toUpperCase();
const LESSON = LESSONS[lessonId];
if (!LESSON) { console.error(`알 수 없는 과: ${lessonId} (EX / EX2)`); process.exit(2); }

const DIST = path.join(__dirname, 'dist', lessonId);
const srcHtml = path.join(DIST, 'variant-book.html');
const raw = await fs.readFile(srcHtml, 'utf8');

/* 본문 .page 섹션 수 = 합본 본문 페이지 수 */
const bodyPages = (raw.match(/<section class="page"/g) || []).length;
if (!bodyPages) { console.error('variant-book.html 에서 .page 를 찾지 못했다'); process.exit(1); }

const cover = `<section class="page cover-page">
  <div class="cover-wrap">
    <div class="cover-brand">Terra Nova</div>
    <div class="cover-title">신서고 2학년 2학기<br>중간고사 대비</div>
    <div class="cover-sub">${LESSON.coverSub}</div>
    <div class="cover-meta">변형문제 합본 · 전 ${bodyPages}페이지</div>
  </div>
</section>`;

const extraCss = `
  @page { size: A4; margin: 0; }
  html, body { margin: 0; padding: 0; }
  .page { box-sizing: border-box; margin: 0 auto; box-shadow: none; }
  .cover-page { align-items:center; justify-content:center; text-align:center; padding:14mm;
                display:flex; flex-direction:column; }
  .cover-page .page-head, .cover-page .page-foot { display:none; }
  .cover-wrap { max-width: 82%; margin: auto; }
  .cover-brand { font-family:'Inter'; font-size:17pt; font-weight:800; letter-spacing:.08em; color:var(--c-mint-deep); margin-bottom:22px; }
  .cover-title { font-size:29pt; font-weight:800; color:var(--c-text); line-height:1.3; margin-bottom:18px; }
  .cover-sub   { font-size:14pt; font-weight:700; color:var(--c-text-soft); line-height:1.6; margin-bottom:26px; }
  .cover-meta  { font-size:10.5pt; color:var(--c-muted); letter-spacing:.02em; }
`;

/* 표지를 body 맨 앞에 삽입 + 추가 CSS 를 </head> 앞에 삽입 */
let html = raw.replace('</head>', `<style>${extraCss}</style>\n</head>`);
html = html.replace(/(<body[^>]*>)/, `$1\n${cover}`);
html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(LESSON.docTitle)}</title>`);

const outHtml = path.join(DIST, 'variant-combined.html');
await fs.writeFile(outHtml, html, 'utf8');

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.goto(pathToFileURL(outHtml).href, { waitUntil: 'networkidle0' });
const outPdf = path.join(DIST, LESSON.out);
await page.pdf({
  path: outPdf, format: 'A4', printBackground: true,
  margin: { top: '0', bottom: '0', left: '0', right: '0' },
  preferCSSPageSize: true,
});
await browser.close();

/* 페이지 수 대조 */
const { PDFDocument } = await import('pdf-lib').catch(() => ({}));
console.log(`📄 variant-combined.html — 표지1 + 본문 ${bodyPages}p (총 ${bodyPages + 1}p)`);
console.log(`✅ 변형문제 합본 → ${path.relative(process.cwd(), outPdf)}`);
