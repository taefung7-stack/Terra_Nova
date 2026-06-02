#!/usr/bin/env node
/**
 * 2026-06 초등부(Mars / Venus) 검수용 실제 렌더.
 *
 * Mars: 소스(content/passages/2026-06-Mars)가 있으므로 textbook.html 직접 렌더.
 * Venus: 소스 폴더 미확인 → 완성 PDF(venus_fullbook_final_complete.pdf)를
 *        Chromium 내장 PDF 뷰어로 file:// 열어 페이지 스크린샷.
 *
 * 출력: dist/_qa-renders/junem/{book}-{tag}.png
 */
import puppeteer from 'puppeteer';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { setTimeout as wait } from 'node:timers/promises';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const outDir = join(root, 'dist', '_qa-renders', 'junem');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

async function startServer(port = 4577) {
  const proc = spawn(process.execPath, [
    resolve(root, 'node_modules', 'sirv-cli', 'bin.js'),
    '.', '--port', String(port), '--host', '127.0.0.1', '--single', 'false', '--quiet'
  ], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/textbook.html`);
      if (r.ok) return { proc, port };
    } catch {}
    await wait(150);
  }
  proc.kill('SIGTERM');
  throw new Error('server failed');
}

const { proc: srv, port } = await startServer();
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });

try {
  // ---- Mars: source HTML render (passages 01,05,11,17 = first of each week) ----
  for (const seq of ['01', '05', '11', '17', '20']) {
    const page = await browser.newPage();
    await page.emulateMediaType('print');
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
    await page.goto(
      `http://127.0.0.1:${port}/textbook.html?month=2026-06-Mars&passage=${seq}&startPage=6`,
      { waitUntil: 'networkidle0', timeout: 30000 }
    );
    await page.waitForSelector('.page', { timeout: 30000 });
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    const dims = await page.$$eval('.page', els => els.map(e => {
      const r = e.getBoundingClientRect();
      return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height };
    }));
    for (let i = 0; i < dims.length; i++) {
      const d = dims[i];
      await page.screenshot({
        path: join(outDir, `mars-src-${seq}-p${i + 1}.png`),
        clip: { x: d.x, y: d.y, width: Math.round(d.w), height: Math.round(d.h) }
      });
    }
    console.log(`Mars src passage ${seq}: ${dims.length} pages rendered`);
    await page.close();
  }

  // ---- Venus: render PDF pages via Chromium PDF viewer ----
  const venusPdf = join(root, 'dist', '2026-06-Venus', 'venus_fullbook_final_complete.pdf');
  const fileUrl = pathToFileURL(venusPdf).href;
  for (const p of [1, 6, 7, 8, 9, 50]) {
    const page = await browser.newPage();
    await page.goto(`${fileUrl}#page=${p}&zoom=125`, { waitUntil: 'networkidle0', timeout: 45000 });
    await wait(2500);
    await page.setViewport({ width: 1000, height: 1300, deviceScaleFactor: 1.5 });
    await wait(800);
    await page.screenshot({ path: join(outDir, `venus-pdf-p${p}.png`) });
    console.log(`Venus pdf p${p} captured`);
    await page.close();
  }
} finally {
  await browser.close().catch(() => {});
  srv.kill('SIGTERM');
}
console.log('done →', outDir.replace(root + '/', '').replace(/\\/g, '/'));
