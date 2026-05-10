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
  await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
  await page.goto('http://127.0.0.1:' + port + '/textbook-mid.html?month=2026-06-N&passage=01&startPage=1', { waitUntil: 'networkidle0' });
  await page.waitForSelector('.page');

  const handles = await page.$$('.page');
  for (let i = 0; i < handles.length; i++) {
    await handles[i].screenshot({ path: 'dist/2026-06-N/sample-01-p' + (i+1) + '.png' });
    console.log('p' + (i+1) + ' captured');
  }
} finally {
  await browser.close();
  server.kill();
  setTimeout(() => process.exit(0), 500);
}