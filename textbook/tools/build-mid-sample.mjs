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
import { spawn } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
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
  const server = spawn('npx', ['sirv', '.', '--port', String(port), '--host', '127.0.0.1', '--quiet'], {
    cwd: root, stdio: 'pipe', shell: process.platform === 'win32'
  });
  await waitFor(`http://127.0.0.1:${port}/textbook-mid.html`);

  const browser = await puppeteer.launch({ headless: 'new' });
  try {
    const page = await browser.newPage();
    const url = `http://127.0.0.1:${port}/textbook-mid.html?month=${month}&passage=${passage}&startPage=${startPage}`;
    console.log(`[render-mid] ${url}`);
    // domcontentloaded first to get script running, then wait for .page nodes that render-mid.js inserts.
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForSelector('.page', { timeout: 30000 });
    // Now let images settle.
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
    server.kill();
  }

  console.log(`OK: ${outPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
