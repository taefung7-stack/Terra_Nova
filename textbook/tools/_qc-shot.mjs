#!/usr/bin/env node
// Quick visual QC: screenshot each .page of a passage to PNG.
// usage: node tools/_qc-shot.mjs --month 2026-07-J --passage 01 [--out scratch]
import puppeteer from 'puppeteer';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

async function waitFor(url, t = 15000) {
  const s = Date.now();
  while (Date.now() - s < t) { try { const r = await fetch(url); if (r.ok) return; } catch {} await new Promise(r => setTimeout(r, 150)); }
  throw new Error(`server not up: ${url}`);
}

const { values } = parseArgs({ options: {
  month: { type: 'string' }, passage: { type: 'string', default: '01' }, out: { type: 'string', default: 'scratch-qc' }
}});
const outDir = resolve(values.out);
mkdirSync(outDir, { recursive: true });

const port = 4188;
const server = spawn('npx', ['sirv', '.', '--port', String(port), '--host', '127.0.0.1', '--quiet'],
  { cwd: root, stdio: 'pipe', shell: process.platform === 'win32' });
await waitFor(`http://127.0.0.1:${port}/textbook.html`);

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 900, height: 1280, deviceScaleFactor: 2 });
const url = `http://127.0.0.1:${port}/textbook.html?month=${values.month}&passage=${values.passage}`;
const msgs = [];
page.on('console', m => msgs.push(`[${m.type()}] ${m.text()}`));
await page.goto(url, { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 400));

const pages = await page.$$('.page');
for (let i = 0; i < pages.length; i++) {
  const f = join(outDir, `${values.month}-${values.passage}-p${i + 1}.png`);
  await pages[i].screenshot({ path: f });
  console.log('WROTE', f);
}
const overflow = await page.$$eval('.page.overflow', n => n.length);
console.log('overflow pages:', overflow);
console.log('--- console ---'); msgs.forEach(m => console.log(m));
await browser.close();
server.kill();
process.exit(0);
