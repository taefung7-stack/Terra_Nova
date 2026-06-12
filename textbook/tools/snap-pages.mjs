import puppeteer from 'puppeteer';
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';

const root = resolve('.');

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
const port = 4188;
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
  const browserPage = await browser.newPage();
  await browserPage.setCacheEnabled(false);
  await browserPage.emulateMediaType('print');
  await browserPage.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
  await browserPage.goto('http://127.0.0.1:' + port + '/textbook-mid.html?month=2026-06-N&passage=01&startPage=1', { waitUntil: 'domcontentloaded' });
  await browserPage.waitForSelector('.page', { timeout: 30000 });
  await browserPage.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));

  const dims = await browserPage.$$eval('.page', els =>
    els.map(e => {
      const r = e.getBoundingClientRect();
      return { x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height };
    })
  );

  for (let i = 0; i < dims.length; i++) {
    const d = dims[i];
    await browserPage.screenshot({
      path: 'dist/2026-06/2026-06-Neptune/sample-01-p' + (i+1) + '.png',
      clip: { x: d.x, y: d.y, width: d.w, height: d.h }
    });
    console.log('p' + (i+1) + ' clipped at', JSON.stringify(d));
  }
} finally {
  await browser.close();
  await new Promise(r => server.close(() => r()));
}