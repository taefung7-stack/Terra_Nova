#!/usr/bin/env node
/* 변형문제 책(variant-book.html)만 골라 PDF 로 렌더한다.
 * builder/pdf.mjs 는 dist 안의 모든 html 을 렌더하므로, 이미 완성된
 * 챕터 분석지(1~5.pdf)까지 불필요하게 다시 만들지 않도록 전용 스크립트를 둔다.
 * 사용법: node _oneoff-신목고-세계문학/render-variant-pdf.mjs <html...> */
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer';

const targets = process.argv.slice(2);
if (!targets.length) {
  console.error('Usage: node render-variant-pdf.mjs <variant-book.html ...>');
  process.exit(1);
}
const browser = await puppeteer.launch({ headless: 'new' });
for (const t of targets) {
  const abs = path.resolve(t);
  const page = await browser.newPage();
  await page.goto(pathToFileURL(abs).href, { waitUntil: 'networkidle0' });
  const out = abs.replace(/\.html$/, '.pdf');
  await page.pdf({
    path: out, format: 'A4', printBackground: true,
    margin: { top: '0', bottom: '0', left: '0', right: '0' },
    preferCSSPageSize: true,
  });
  await page.close();
  console.log('✓', path.relative(process.cwd(), out));
}
await browser.close();
