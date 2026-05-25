#!/usr/bin/env node
/**
 * HTML → PDF 변환 (puppeteer 사용)
 *
 * 사용법:
 *   node builder/pdf.mjs <dist-dir>
 *   node builder/pdf.mjs 2026-march-grade2/dist
 *
 * dist 안의 모든 *.html(index.html 제외)을 같은 이름의 *.pdf 로 변환합니다.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

async function loadPuppeteer() {
  try {
    return (await import('puppeteer')).default;
  } catch {
    console.error('❌ puppeteer가 설치되어 있지 않습니다.');
    console.error('   설치: cd mock-exam-analysis && npm install puppeteer');
    process.exit(1);
  }
}

async function main() {
  const distArg = process.argv[2];
  if (!distArg) {
    console.error('Usage: node builder/pdf.mjs <dist-dir>');
    process.exit(1);
  }
  const distDir = path.resolve(process.cwd(), distArg);
  const files = (await fs.readdir(distDir))
    .filter(f => f.endsWith('.html') && f !== 'index.html')
    .sort();

  if (!files.length) {
    console.error(`No HTML files in ${distDir}`);
    process.exit(1);
  }

  const puppeteer = await loadPuppeteer();
  const browser = await puppeteer.launch({ headless: 'new' });

  console.log(`🖨️  Converting ${files.length} HTML(s) to PDF...`);
  for (const f of files) {
    const htmlPath = path.join(distDir, f);
    const pdfPath = path.join(distDir, f.replace(/\.html$/, '.pdf'));

    const page = await browser.newPage();
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '0', bottom: '0', left: '0', right: '0' },
      preferCSSPageSize: true
    });
    await page.close();
    console.log(`   ✓ ${f}  →  ${path.basename(pdfPath)}`);
  }

  await browser.close();
  console.log('✅ Done.');
}

main().catch(err => { console.error(err); process.exit(1); });
