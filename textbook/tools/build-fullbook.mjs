#!/usr/bin/env node
/**
 * Terra Nova full-month book merger.
 *
 * Layout (continuous page numbering 1..N):
 *   1) Textbook (TOC + 4 weeks × (divider + 5 passages × 4)) = 90 pages → 1..90
 *   2) Answers section divider (2-page spread)                =  2 pages → 91..92
 *   3) Answer book (20 passages × 1 page)                     = 20 pages → 93..112
 *   4) Wordbook section divider (2-page spread)               =  2 pages → 113..114
 *   5) Wordpack (4 weeks × (wordbook + wordtest) + 4 keys)    = 20 pages → 115..134
 *   Total: 134 pages
 *
 * Page numbers are baked into each rendered page via startPage params, so the
 * footer page-num pill shows the global book number. L/R alternation follows
 * page parity.
 *
 * Usage:
 *   node tools/build-fullbook.mjs --month 2026-06
 *   node tools/build-fullbook.mjs --month 2026-06 --out custom/path.pdf
 */
import puppeteer from 'puppeteer';
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync, unlinkSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { PDFDocument } from 'pdf-lib';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

async function waitFor(url, ms = 15000) {
  const t = Date.now();
  while (Date.now() - t < ms) {
    try { const r = await fetch(url); if (r.ok) return; } catch {}
    await new Promise(r => setTimeout(r, 150));
  }
  throw new Error(`server did not start at ${url}`);
}

async function renderPdf(browser, url, outPath) {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 90000 });
  await page.waitForSelector('.page,.cover', { timeout: 15000 });
  await page.pdf({
    path: outPath,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: 0, bottom: 0, left: 0, right: 0 }
  });
  await page.close();
}

async function main() {
  const { values } = parseArgs({
    options: {
      month: { type: 'string' },
      out:   { type: 'string' }
    }
  });
  if (!values.month) {
    console.error('usage: --month YYYY-MM [--out path]');
    process.exit(2);
  }
  const month = values.month;
  const outPath = values.out
    ? resolve(values.out)
    : join(root, 'dist', month, `${month}-fullbook.pdf`);

  const port = 4185;
  const server = spawn('npx', ['sirv', '.', '--port', String(port), '--host', '127.0.0.1', '--quiet'], {
    cwd: root, stdio: 'pipe', shell: process.platform === 'win32'
  });
  await waitFor(`http://127.0.0.1:${port}/textbook.html`);

  const browser = await puppeteer.launch({ headless: 'new' });
  const tmpDir = join(root, 'dist', '_fullbook-tmp');
  mkdirSync(tmpDir, { recursive: true });
  const collected = [];

  try {
    // === Section 1: Textbook (pages 1..90) ===
    console.log('[1/5] Textbook');
    console.log('  → TOC');
    const tocPath = join(tmpDir, 'toc.pdf');
    await renderPdf(browser, `http://127.0.0.1:${port}/cover.html?mode=toc&month=${month}`, tocPath);
    collected.push(tocPath);

    for (let w = 1; w <= 4; w++) {
      console.log(`  → WEEK ${w} divider`);
      const wPath = join(tmpDir, `week-${w}.pdf`);
      await renderPdf(browser, `http://127.0.0.1:${port}/cover.html?mode=week&month=${month}&week=${w}`, wPath);
      collected.push(wPath);

      const weekStart = (w - 1) * 5 + 1;
      for (let n = weekStart; n < weekStart + 5; n++) {
        const seq = String(n).padStart(2, '0');
        const sourcePath = join(root, 'content', 'passages', month, `${seq}.json`);
        if (!existsSync(sourcePath)) { console.warn(`  · SKIP ${seq} (no JSON)`); continue; }
        const inWeekIdx = (n - 1) % 5;
        const startPage = 4 + (w - 1) * 22 + inWeekIdx * 4 + 1;
        console.log(`  · passage ${seq} (book p.${startPage})`);
        const pPath = join(tmpDir, `p-${seq}.pdf`);
        await renderPdf(browser,
          `http://127.0.0.1:${port}/textbook.html?month=${month}&passage=${seq}&startPage=${startPage}`,
          pPath
        );
        collected.push(pPath);
      }
    }

    // === Section 2: Answers divider (pages 91..92, 2-page spread) ===
    console.log('[2/5] Answer divider (속지 spread, p.91~92)');
    const ansDivPath = join(tmpDir, 'div-answers.pdf');
    await renderPdf(browser,
      `http://127.0.0.1:${port}/supplements.html?type=divider&which=answers&month=${month}&startPage=91`,
      ansDivPath
    );
    collected.push(ansDivPath);

    // === Section 3: Answer book (pages 93..112) ===
    console.log('[3/5] Answer book (DAY 01..20, p.93~112)');
    const ansPath = join(tmpDir, 'answers-all.pdf');
    await renderPdf(browser,
      `http://127.0.0.1:${port}/supplements.html?type=answers-all&month=${month}&startPage=93`,
      ansPath
    );
    collected.push(ansPath);

    // === Section 4: Wordbook divider (pages 113..114, 2-page spread) ===
    console.log('[4/5] Wordbook divider (속지 spread, p.113~114)');
    const wbDivPath = join(tmpDir, 'div-wordbook.pdf');
    await renderPdf(browser,
      `http://127.0.0.1:${port}/supplements.html?type=divider&which=wordbook&month=${month}&startPage=113`,
      wbDivPath
    );
    collected.push(wbDivPath);

    // === Section 5: Wordpack (pages 115..134) ===
    console.log('[5/5] Wordpack (W1..W4 wordbook + test + keys, p.115~134)');
    const wpPath = join(tmpDir, 'wordpack.pdf');
    await renderPdf(browser,
      `http://127.0.0.1:${port}/supplements.html?type=wordpack&month=${month}&startPage=115`,
      wpPath
    );
    collected.push(wpPath);

  } finally {
    await browser.close();
    server.kill();
  }

  // === Merge ===
  console.log(`Merging ${collected.length} PDFs → ${outPath}`);
  const merged = await PDFDocument.create();
  for (const f of collected) {
    const bytes = readFileSync(f);
    const src = await PDFDocument.load(bytes);
    const pages = await merged.copyPages(src, src.getPageIndices());
    pages.forEach(p => merged.addPage(p));
  }

  // PDF metadata — bookmark/library/search readability
  // Month label uses optional planet suffix (e.g. "2026-06-Sun" → "2026-06 · Sun")
  const monthLabel = month.replace(/^(\d{4}-\d{2})(?:-([A-Za-z]+))?$/, (_, ym, lvl) =>
    lvl ? `${ym} · ${lvl}` : ym
  );
  merged.setTitle(`Terra Nova English · ${monthLabel}`);
  merged.setAuthor('Terra Nova English');
  merged.setSubject('월간 독해 학습지 (교과 연계)');
  merged.setKeywords(['수능영어', '독해', '교과 연계', 'Terra Nova', monthLabel]);
  merged.setCreator('Terra Nova build-fullbook.mjs');
  merged.setProducer('pdf-lib · Terra Nova');

  const out = await merged.save();
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, out);

  for (const f of collected) {
    try { unlinkSync(f); } catch {}
  }

  console.log(`WROTE ${outPath} (${merged.getPageCount()} pages, ${(out.length / 1024 / 1024).toFixed(1)} MB)`);
}

main().catch(err => { console.error(err); process.exit(1); });
