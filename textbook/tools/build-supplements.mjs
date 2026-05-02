#!/usr/bin/env node
/**
 * Build Terra Nova supplementary PDFs.
 *
 * Usage:
 *   node tools/build-supplements.mjs --month 2026-06 --type answers --passage 01
 *   node tools/build-supplements.mjs --month 2026-06 --type wordbook --scope w1
 *   node tools/build-supplements.mjs --month 2026-06 --type wordtest --scope w1 [--key]
 *   node tools/build-supplements.mjs --month 2026-06 --type wordpack
 *   node tools/build-supplements.mjs --month 2026-06 --type all --passage 01
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

function buildUrl(port, type, month, opts = {}) {
  const p = new URLSearchParams({ type, month });
  if (opts.passage) p.set('passage', opts.passage);
  if (opts.scope) p.set('scope', opts.scope);
  if (opts.key) p.set('key', '1');
  if (opts.startPage) p.set('startPage', String(opts.startPage));
  return `http://127.0.0.1:${port}/supplements.html?${p.toString()}`;
}

async function renderPdf(browser, url, outPath) {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForSelector('.page,.cover', { timeout: 15000 });
  await page.pdf({
    path: outPath,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: 0, bottom: 0, left: 0, right: 0 }
  });
  await page.close();
  return outPath;
}

async function main() {
  const { values } = parseArgs({
    options: {
      month: { type: 'string' },
      type:  { type: 'string' },
      passage: { type: 'string' },
      scope: { type: 'string' },
      key:   { type: 'boolean', default: false },
      outDir: { type: 'string' }
    }
  });
  if (!values.month || !values.type) {
    console.error('usage: --month YYYY-MM --type [answers|wordbook|wordtest|wordpack|all] [--passage NN] [--scope w1..w4] [--key]');
    process.exit(2);
  }

  const month = values.month;
  const outDir = values.outDir ? resolve(values.outDir) : join(root, 'dist', `${month}-samples`);
  mkdirSync(outDir, { recursive: true });

  const port = 4182;
  const server = spawn('npx', ['sirv', '.', '--port', String(port), '--host', '127.0.0.1', '--quiet'], {
    cwd: root, stdio: 'pipe', shell: process.platform === 'win32'
  });
  await waitFor(`http://127.0.0.1:${port}/supplements.html?type=wordpack&month=${month}`);

  const browser = await puppeteer.launch({ headless: 'new' });
  try {
    const tasks = [];
    const type = values.type;

    if (type === 'answers' || type === 'all') {
      const passages = values.passage ? [values.passage.padStart(2, '0')] : ['01'];
      for (const seq of passages) {
        const dataPath = join(root, 'content', 'passages', month, `${seq}.json`);
        if (!existsSync(dataPath)) { console.warn(`SKIP passage ${seq} (no JSON)`); continue; }
        tasks.push({
          url: buildUrl(port, 'answers', month, { passage: seq }),
          out: join(outDir, `${seq}-answers.pdf`)
        });
      }
    }
    if (type === 'answers-all') {
      tasks.push({
        url: buildUrl(port, 'answers-all', month),
        out: join(outDir, `${month}-answers.pdf`)
      });
    }
    if (type === 'wordbook') {
      const scope = values.scope || 'w1';
      tasks.push({ url: buildUrl(port, 'wordbook', month, { scope }), out: join(outDir, `${scope}-wordbook.pdf`) });
    }
    if (type === 'wordtest') {
      const scope = values.scope || 'w1';
      tasks.push({ url: buildUrl(port, 'wordtest', month, { scope }), out: join(outDir, `${scope}-wordtest.pdf`) });
      tasks.push({ url: buildUrl(port, 'wordtest', month, { scope, key: true }), out: join(outDir, `${scope}-wordtest-key.pdf`) });
    }
    if (type === 'wordpack' || type === 'all') {
      tasks.push({
        url: buildUrl(port, 'wordpack', month),
        out: join(outDir, `${month}-wordbook.pdf`)
      });
    }

    for (const t of tasks) {
      console.log(`→ ${t.url}`);
      await renderPdf(browser, t.url, t.out);
      console.log(`  WROTE ${t.out}`);
    }
  } finally {
    await browser.close();
    server.kill();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
