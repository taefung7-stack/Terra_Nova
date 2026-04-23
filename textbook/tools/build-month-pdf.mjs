#!/usr/bin/env node
/**
 * Build the entire month book as a single merged PDF.
 *
 * Sequence per month:
 *   1) TOC (1 page)
 *   2) For each week 1..4:
 *        - WEEK divider (2 pages = left + right)
 *        - 5 passages × 4 pages = 20 pages
 *
 * Total: 1 + 4 × (2 + 20) = 89 pages.
 *
 * Usage:
 *   node tools/build-month-pdf.mjs --month 2026-06
 *   node tools/build-month-pdf.mjs --month 2026-06 --out custom/2026-06-book.pdf
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

async function main() {
  const { values } = parseArgs({
    options: {
      month: { type: 'string' },
      out:   { type: 'string' }
    }
  });
  if (!values.month) {
    console.error('usage: build-month-pdf --month YYYY-MM [--out path/file.pdf]');
    process.exit(2);
  }
  const month = values.month;
  const outPath = values.out
    ? resolve(values.out)
    : join(root, 'dist', month, `${month}-book.pdf`);

  const port = 4180;
  const server = spawn('npx', ['sirv', '.', '--port', String(port), '--host', '127.0.0.1', '--quiet'], {
    cwd: root, stdio: 'pipe', shell: process.platform === 'win32'
  });
  await waitFor(`http://127.0.0.1:${port}/textbook.html`);

  const browser = await puppeteer.launch({ headless: 'new' });
  const tmpDir = join(root, 'dist', '_merge-tmp');
  mkdirSync(tmpDir, { recursive: true });

  /** Render a URL to a PDF file at given path */
  async function renderToPdf(url, file) {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.page,.cover', { timeout: 15000 });
    await new Promise(r => setTimeout(r, 800));
    await page.pdf({
      path: file,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, bottom: 0, left: 0, right: 0 }
    });
    await page.close();
  }

  const collectedPdfs = [];

  console.log('→ TOC');
  const tocPath = join(tmpDir, 'toc.pdf');
  await renderToPdf(`http://127.0.0.1:${port}/cover.html?mode=toc&month=${month}`, tocPath);
  collectedPdfs.push(tocPath);

  for (let w = 1; w <= 4; w++) {
    console.log(`→ WEEK ${w} divider`);
    const wPath = join(tmpDir, `week-${w}.pdf`);
    await renderToPdf(`http://127.0.0.1:${port}/cover.html?mode=week&month=${month}&week=${w}`, wPath);
    collectedPdfs.push(wPath);

    const weekStart = (w - 1) * 5 + 1;
    for (let n = weekStart; n < weekStart + 5; n++) {
      const seq = String(n).padStart(2, '0');
      const sourcePath = join(root, 'content', 'passages', month, `${seq}.json`);
      if (!existsSync(sourcePath)) {
        console.warn(`SKIP ${seq} (no JSON)`);
        continue;
      }
      console.log(`  · passage ${seq}`);
      const pPath = join(tmpDir, `p-${seq}.pdf`);
      await renderToPdf(`http://127.0.0.1:${port}/textbook.html?month=${month}&passage=${seq}`, pPath);
      collectedPdfs.push(pPath);
    }
  }

  await browser.close();
  server.kill();

  // Merge
  console.log(`→ merging ${collectedPdfs.length} PDFs into ${outPath}`);
  const merged = await PDFDocument.create();
  for (const f of collectedPdfs) {
    const bytes = readFileSync(f);
    const src = await PDFDocument.load(bytes);
    const pages = await merged.copyPages(src, src.getPageIndices());
    pages.forEach(p => merged.addPage(p));
  }
  const out = await merged.save();
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, out);

  // cleanup tmp
  for (const f of collectedPdfs) {
    try { unlinkSync(f); } catch {}
  }

  console.log(`WROTE ${outPath} (${merged.getPageCount()} pages, ${(out.length / 1024 / 1024).toFixed(1)} MB)`);
}

main().catch(err => { console.error(err); process.exit(1); });
