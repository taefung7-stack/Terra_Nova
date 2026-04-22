#!/usr/bin/env node
import puppeteer from 'puppeteer';
import { spawn } from 'node:child_process';
import { mkdirSync, readdirSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

async function waitFor(url, timeoutMs = 15000) {
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
  const server = spawn('npx', ['sirv', '.', '--port', String(port), '--host', '127.0.0.1', '--quiet'], {
    cwd: root,
    stdio: 'pipe',
    shell: process.platform === 'win32'
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
