import puppeteer from 'puppeteer';
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync, mkdirSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';

const root = resolve('..');
const outDir = resolve('../dist/mobile-snap');
mkdirSync(outDir, { recursive: true });

const MIME = {
  '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg',
  '.jpeg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp','.ico':'image/x-icon','.woff':'font/woff','.woff2':'font/woff2'
};
const port = 4291;
const server = createServer((req, res) => {
  try {
    const safe = req.url.split('?')[0].replace(/^\/+/, '');
    const filePath = join(root, safe || 'index.html');
    if (!filePath.startsWith(root) || !existsSync(filePath) || !statSync(filePath).isFile()) {
      res.writeHead(404); res.end('not found'); return;
    }
    const buf = readFileSync(filePath);
    const ct = MIME[extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': ct, 'Content-Length': buf.length, 'Cache-Control': 'no-store' });
    res.end(buf);
  } catch (e) { res.writeHead(500); res.end(String(e)); }
});
await new Promise(r => server.listen(port, '127.0.0.1', r));

const targets = [
  { name: 'landing', url: 'landing.html' },
  { name: 'index', url: 'index.html' },
  { name: 'subscription', url: 'subscription_detail_complete.html' },
  { name: 'order', url: 'order.html' },
  { name: 'sample', url: 'sample.html' },
  { name: 'level_test', url: 'level_test.html' }
];

const browser = await puppeteer.launch({ headless: 'new' });
try {
  for (const t of targets) {
    const bp = await browser.newPage();
    await bp.setCacheEnabled(false);
    await bp.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await bp.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');
    const cb = '?cb=' + Date.now();
    await bp.goto('http://127.0.0.1:' + port + '/' + t.url + cb, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2500));
    const diag = await bp.evaluate(() => {
      // Walk up the DOM and find any ancestor that creates a containing block
      // for position:fixed (transform/filter/will-change/perspective).
      const tab = document.getElementById('m-tabbar');
      if (!tab) return { hasTabbar: false };
      const r = tab.getBoundingClientRect();
      const offenders = [];
      let n = tab.parentElement;
      while (n && n !== document.documentElement) {
        const cs = getComputedStyle(n);
        if (cs.transform !== 'none' || cs.filter !== 'none' || cs.perspective !== 'none' || cs.willChange !== 'auto' || cs.contain === 'paint' || cs.contain === 'layout' || cs.contain.indexOf('strict') !== -1) {
          offenders.push((n.tagName.toLowerCase()) + (n.id ? '#' + n.id : '') + (n.className ? '.' + String(n.className).split(' ').slice(0,2).join('.') : '') + ' [' + cs.transform.slice(0,30) + '|' + cs.filter.slice(0,20) + '|' + cs.willChange + ']');
        }
        n = n.parentElement;
      }
      return { top: Math.round(r.top), position: getComputedStyle(tab).position, offenders };
    });
    console.log('  tabbar:', JSON.stringify(diag));
    await bp.screenshot({ path: join(outDir, t.name + '-fold.png') });
    await bp.screenshot({ path: join(outDir, t.name + '-full.png'), fullPage: true });
    const h = await bp.evaluate(() => document.documentElement.scrollHeight);
    console.log(t.name + ': height=' + h + 'px');
    await bp.close();
  }
} finally {
  await browser.close();
  await new Promise(r => server.close(() => r()));
}