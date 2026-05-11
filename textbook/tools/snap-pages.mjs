import puppeteer from 'puppeteer';
import { spawn } from 'node:child_process';

async function waitFor(url, ms = 15000) {
  const t = Date.now();
  while (Date.now() - t < ms) {
    try { const r = await fetch(url); if (r.ok) return; } catch {}
    await new Promise(r => setTimeout(r, 150));
  }
}

const port = 4188;
const server = spawn('npx', ['sirv', '.', '--port', String(port), '--host', '127.0.0.1', '--quiet'], {
  cwd: '.', stdio: 'pipe', shell: process.platform === 'win32'
});
await waitFor('http://127.0.0.1:' + port + '/textbook-mid.html');

const browser = await puppeteer.launch({ headless: 'new' });
try {
  const page = await browser.newPage();
  // Emulate print media so styles match the PDF output.
  await page.emulateMediaType('print');
  // A4 portrait at 96 DPI = 794×1123 px. Use deviceScaleFactor 2 for sharpness.
  await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
  await page.goto('http://127.0.0.1:' + port + '/textbook-mid.html?month=2026-06-N&passage=01&startPage=1', { waitUntil: 'networkidle0' });
  await page.waitForSelector('.page');

  // Each .page is sized at 210mm × 297mm (= 794×1123 px). Scroll into view + clip-screenshot.
  const dims = await page.$$eval('.page', els =>
    els.map(e => {
      const r = e.getBoundingClientRect();
      return { x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height };
    })
  );

  for (let i = 0; i < dims.length; i++) {
    const d = dims[i];
    await page.screenshot({
      path: 'dist/2026-06-N/sample-01-p' + (i+1) + '.png',
      clip: { x: d.x, y: d.y, width: d.w, height: d.h }
    });
    console.log('p' + (i+1) + ' clipped at', JSON.stringify(d));
  }
} finally {
  await browser.close();
  server.kill();
  setTimeout(() => process.exit(0), 500);
}