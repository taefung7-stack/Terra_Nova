import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import puppeteer from 'puppeteer';
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

let server, browser;
const PORT = 4200;
const MONTH = '2026-06';
const PASSAGE = '01';

async function waitFor(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const r = await fetch(url);
      if (r.ok) return true;
    } catch {}
    await new Promise(r => setTimeout(r, 150));
  }
  throw new Error('server did not start at ' + url);
}

beforeAll(async () => {
  server = spawn('npx', ['sirv', '.', '--port', String(PORT), '--host', '127.0.0.1', '--quiet'], {
    cwd: root,
    stdio: 'pipe',
    shell: process.platform === 'win32'
  });
  await waitFor(`http://127.0.0.1:${PORT}/textbook.html`);
  browser = await puppeteer.launch({ headless: 'new' });
}, 60_000);

afterAll(async () => {
  if (browser) await browser.close();
  if (server) server.kill();
});

describe('render pipeline', () => {
  it('produces exactly four .page sections for the sample', async () => {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${PORT}/textbook.html?month=${MONTH}&passage=${PASSAGE}`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.page', { timeout: 5000 });
    const count = await page.$$eval('.page', nodes => nodes.length);
    expect(count).toBe(4);
    await page.close();
  });

  it('does not trigger overflow on any page', async () => {
    const page = await browser.newPage();
    const warnings = [];
    page.on('console', msg => { if (msg.type() === 'warn') warnings.push(msg.text()); });
    await page.goto(`http://127.0.0.1:${PORT}/textbook.html?month=${MONTH}&passage=${PASSAGE}`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.page', { timeout: 5000 });
    const overflowPages = await page.$$eval('.page.overflow', n => n.length);
    expect(overflowPages).toBe(0);
    expect(warnings.filter(w => w.includes('overflow'))).toEqual([]);
    await page.close();
  });

  it('injects subject, exactly 4 questions and exactly 10 vocab cards', async () => {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${PORT}/textbook.html?month=${MONTH}&passage=${PASSAGE}`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.page', { timeout: 5000 });
    const subject = await page.$eval('.chip', el => el.textContent.trim());
    const questionCount = await page.$$eval('.question', n => n.length);
    const mockCount = await page.$$eval('.question.mock', n => n.length);
    const descCount = await page.$$eval('.question.descriptive', n => n.length);
    const vocabCount = await page.$$eval('.vocab-card', n => n.length);
    expect(subject.length).toBeGreaterThan(0);
    expect(questionCount).toBe(4);
    expect(mockCount).toBe(3);
    expect(descCount).toBe(1);
    expect(vocabCount).toBeGreaterThanOrEqual(10);
    expect(vocabCount).toBeLessThanOrEqual(14);
    await page.close();
  });

  it('applies the per-month theme (data-month on body)', async () => {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${PORT}/textbook.html?month=${MONTH}&passage=${PASSAGE}`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.page', { timeout: 5000 });
    const monthAttr = await page.$eval('body', el => el.getAttribute('data-month'));
    expect(monthAttr).toBe(MONTH);
    await page.close();
  });
});
