#!/usr/bin/env node
/**
 * 페이지 overflow 측정 — A4 297mm 안에서 page-body가 잘리는지 검사.
 * 사용: node builder/check-overflow.mjs <html-file>
 */
import puppeteer from 'puppeteer';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const file = process.argv[2];
if (!file) { console.error('Usage: node check-overflow.mjs <html-file>'); process.exit(1); }
const url = pathToFileURL(path.resolve(file)).href;

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 794, height: 1123 });
await page.goto(url, { waitUntil: 'networkidle0' });

const results = await page.evaluate(() => {
  // overflow:hidden + flex:1로 scrollHeight가 가려져 측정 안 됨.
  // children의 실제 합을 직접 계산.
  function realContentHeight(body) {
    let total = 0;
    [...body.children].forEach(c => {
      const r = c.getBoundingClientRect();
      const cs = getComputedStyle(c);
      total += r.height + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom);
    });
    return Math.round(total);
  }
  const pages = [...document.querySelectorAll('.page')];
  return pages.map((p, i) => {
    const body = p.querySelector('.page-body');
    const foot = p.querySelector('.page-foot');
    const bodyRect = body.getBoundingClientRect();
    const footRect = foot ? foot.getBoundingClientRect() : null;
    const contentH = realContentHeight(body);
    const bodyH = Math.round(bodyRect.height);
    return {
      step: p.getAttribute('data-step'),
      bodyH,
      contentH,
      fill: Math.round((contentH / bodyH) * 100),
      overflow: contentH > bodyH + 1,
      hitsFoot: footRect ? bodyRect.bottom > footRect.top + 2 : null
    };
  });
});

console.log('STEP | content/body |  fill | overflow | hits foot');
console.log('-----+-------------+-------+----------+----------');
results.forEach(r => {
  const mark = r.overflow ? '⚠️ OVER' : (r.fill >= 70 ? '✓ FULL' : '○ ' + r.fill + '%');
  console.log(`  ${r.step}  |  ${String(r.contentH).padStart(4)}/${r.bodyH}  |  ${String(r.fill).padStart(3)}% | ${r.overflow ? 'YES' : ' NO'}       | ${r.hitsFoot ? 'YES' : ' NO'}    ${mark}`);
});

await browser.close();
