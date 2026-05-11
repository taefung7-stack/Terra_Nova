#!/usr/bin/env node
/**
 * Single-passage PDF builder for Terra Nova MID-school textbook.
 *
 * Renders one 4-page passage (page1=Passage, page2=Practice,
 * page3=Reading Strategy + Mind Map, page4=Collocations) into a
 * standalone PDF, suitable for sample review before authoring a full
 * 20-passage month.
 *
 * Usage:
 *   node tools/build-mid-sample.mjs --month 2026-06-N --passage 01
 *   node tools/build-mid-sample.mjs --month 2026-06-N --passage 01 --out my.pdf
 */
import puppeteer from 'puppeteer';
import { createServer } from 'node:http';
import { mkdirSync, existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

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
      month:    { type: 'string' },
      passage:  { type: 'string' },
      out:      { type: 'string' },
      startPage:{ type: 'string' }
    }
  });
  if (!values.month || !values.passage) {
    console.error('usage: --month YYYY-MM-N --passage NN [--out path] [--startPage N]');
    process.exit(2);
  }
  const month = values.month;
  const passage = values.passage;
  const startPage = parseInt(values.startPage || '1', 10);
  const outPath = values.out
    ? resolve(values.out)
    : join(root, 'dist', month, `sample-${passage}.pdf`);

  mkdirSync(dirname(outPath), { recursive: true });

  const sourcePath = join(root, 'content', 'passages', month, `${passage}.json`);
  if (!existsSync(sourcePath)) {
    console.error(`Missing JSON: ${sourcePath}`);
    process.exit(2);
  }

  const port = 4186;
  // Built-in static server. Read entire file body once, send full buffer with
  // exact Content-Length. Avoids the sirv-cli truncation race on Windows.
  const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js':   'text/javascript; charset=utf-8',
    '.mjs':  'text/javascript; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg':  'image/svg+xml',
    '.webp': 'image/webp'
  };
  const server = createServer((req, res) => {
    try {
      const safe = req.url.split('?')[0].replace(/^\/+/, '');
      const filePath = join(root, safe);
      if (!filePath.startsWith(root) || !existsSync(filePath) || !statSync(filePath).isFile()) {
        res.writeHead(404); res.end('not found'); return;
      }
      const buf = readFileSync(filePath);
      const ct = MIME[extname(filePath).toLowerCase()] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': ct, 'Content-Length': buf.length, 'Cache-Control': 'no-store' });
      res.end(buf);
    } catch (e) {
      res.writeHead(500); res.end(String(e));
    }
  });
  await new Promise(r => server.listen(port, '127.0.0.1', r));

  const browser = await puppeteer.launch({ headless: 'new' });
  try {
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    page.on('pageerror', e => console.log('[browser pageerror]', e.message));
    const url = `http://127.0.0.1:${port}/textbook-mid.html?month=${month}&passage=${passage}&startPage=${startPage}`;
    console.log(`[render-mid] ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('.page', { timeout: 30000 });
    // Let layout settle (two RAFs).
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    await page.pdf({
      path: outPath,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, bottom: 0, left: 0, right: 0 }
    });
    await page.close();
  } finally {
    await browser.close();
    await new Promise(r => server.close(() => r()));
  }

  console.log(`OK: ${outPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
