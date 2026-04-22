#!/usr/bin/env node
// Run: node tools/_check.mjs 2026-06 03
import puppeteer from 'puppeteer';
import { spawn } from 'node:child_process';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const [month, passage] = process.argv.slice(2);
if (!month || !passage) { console.error('usage: _check.mjs MONTH NN'); process.exit(2); }

const PORT = 4270 + Math.floor(Math.random() * 20);
const server = spawn('npx', ['sirv', '.', '--port', String(PORT), '--host', '127.0.0.1', '--quiet'], {
  cwd: root, stdio: 'pipe', shell: process.platform === 'win32'
});
async function waitFor(url, ms = 15000) {
  const t = Date.now();
  while (Date.now() - t < ms) {
    try { const r = await fetch(url); if (r.ok) return; } catch {}
    await new Promise(r => setTimeout(r, 150));
  }
  throw new Error('server failed');
}
await waitFor(`http://127.0.0.1:${PORT}/textbook.html`);

const b = await puppeteer.launch({ headless: 'new' });
const p = await b.newPage();
await p.goto(`http://127.0.0.1:${PORT}/textbook.html?month=${month}&passage=${passage}`, { waitUntil: 'domcontentloaded' });
await p.waitForSelector('.page', { timeout: 8000 });
await new Promise(r => setTimeout(r, 1000));

const diffs = await p.evaluate(() => [...document.querySelectorAll('.page')].map(e => {
  const body = e.querySelector('.page-body');
  return { page: e.dataset.page, diff: body.scrollHeight - body.clientHeight };
}));
const maxDiff = Math.max(...diffs.map(d => d.diff));
console.log('overflow:', JSON.stringify(diffs));

if (maxDiff === 0) {
  await p.pdf({
    path: join(root, 'dist', month, `${passage}.pdf`),
    format: 'A4', printBackground: true, preferCSSPageSize: true,
    margin: { top: 0, bottom: 0, left: 0, right: 0 }
  });
  console.log(`WROTE dist/${month}/${passage}.pdf`);
}

await b.close();
server.kill();
process.exit(maxDiff === 0 ? 0 : 1);
