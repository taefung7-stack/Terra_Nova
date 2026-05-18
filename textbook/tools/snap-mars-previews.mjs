/**
 * Snap 4-page MARS preview JPGs for homepage textbook samples.
 * Renders textbook.html?month=2026-06-Mars&passage=01 and exports
 * each .page as a JPG into ../assets/textbook-previews/mars-p[1-4].jpg
 */
import puppeteer from 'puppeteer';
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync, mkdirSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';

const textbookRoot = resolve('.');
const outDir = resolve('../assets/textbook-previews');
mkdirSync(outDir, { recursive: true });

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

const port = 4321;
const server = createServer((req, res) => {
  try {
    const safe = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '');
    const filePath = join(textbookRoot, safe);
    if (!filePath.startsWith(textbookRoot) || !existsSync(filePath) || !statSync(filePath).isFile()) {
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
console.log(`server up: http://127.0.0.1:${port}`);

const browser = await puppeteer.launch({ headless: 'new' });
try {
  const browserPage = await browser.newPage();
  await browserPage.setCacheEnabled(false);
  await browserPage.emulateMediaType('screen');
  await browserPage.setViewport({ width: 900, height: 1300, deviceScaleFactor: 2 });

  const url = `http://127.0.0.1:${port}/textbook.html?month=2026-06-Mars&passage=01`;
  await browserPage.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
  await browserPage.waitForSelector('.page', { timeout: 30000 });
  await browserPage.evaluate(async () => {
    const imgs = Array.from(document.images);
    await Promise.all(imgs.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(res => { img.onload = img.onerror = () => res(); });
    }));
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  });

  const dims = await browserPage.$$eval('.page', els =>
    els.map(e => {
      const r = e.getBoundingClientRect();
      return { x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height };
    })
  );
  console.log(`found ${dims.length} pages`);
  if (dims.length < 4) throw new Error(`expected 4 pages, got ${dims.length}`);

  for (let i = 0; i < 4; i++) {
    const d = dims[i];
    const outPath = join(outDir, `mars-p${i + 1}.jpg`);
    await browserPage.screenshot({
      path: outPath,
      type: 'jpeg',
      quality: 88,
      clip: { x: d.x, y: d.y, width: d.w, height: d.h }
    });
    console.log(`wrote ${outPath}  (${Math.round(d.w)}x${Math.round(d.h)})`);
  }
} finally {
  await browser.close();
  await new Promise(r => server.close(() => r()));
}
