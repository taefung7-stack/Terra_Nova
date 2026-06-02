#!/usr/bin/env node
/**
 * 2026-06 초등부(Mars / Venus) 완성본 생성.
 *
 * 입력:
 *   dist/2026-06-{Level}/{LEVEL} 6월 표지.pdf            (표지 1p, A4)
 *   dist/2026-06-{Level}/{level}_fullbook_final_complete.pdf  (본문 154p — canonical, 재빌드 금지)
 *
 * 출력:
 *   dist/2026-06-{Level}/2026-06-{Level}.pdf  (표지 1p + colophon 1p + 본문 154p = 156p)
 *
 * 절차:
 *   1. puppeteer 로 colophon.html?level={level}&month=2026-06 → 1p PDF 렌더
 *   2. pdf-lib 로 표지 + colophon + 본문 합본 (표지 다음장 = 저작권 페이지)
 *   3. 메타데이터 설정, 표준 파일명(2026-06-{Level}.pdf)으로 저장
 *      → extract-mars-previews / build-protected / upload-protected-pdfs 와 호환되는 이름
 */
import puppeteer from 'puppeteer';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as wait } from 'node:timers/promises';
import { PDFDocument } from 'pdf-lib';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const MONTH = '2026-06';

const LEVELS = [
  { level: 'Mars',  coverFile: 'MARS 6월 표지.pdf',  bodyFile: 'mars_fullbook_final_complete.pdf' },
  { level: 'Venus', coverFile: 'VENUS 6월 표지.pdf', bodyFile: 'venus_fullbook_final_complete.pdf' },
];

async function startServer(port = 4531) {
  const proc = spawn(process.execPath, [
    resolve(root, 'node_modules', 'sirv-cli', 'bin.js'),
    '.', '--port', String(port), '--host', '127.0.0.1', '--single', 'false', '--quiet'
  ], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(`http://127.0.0.1:${port}/colophon.html`); if (r.ok) return { proc, port }; } catch {}
    await wait(150);
  }
  proc.kill('SIGTERM');
  throw new Error('static server failed to start');
}

async function renderColophon(browser, port, level, outPath) {
  const page = await browser.newPage();
  await page.goto(
    `http://127.0.0.1:${port}/colophon.html?level=${level.toLowerCase()}&month=${MONTH}`,
    { waitUntil: 'networkidle0', timeout: 30000 }
  );
  await page.pdf({
    path: outPath, format: 'A4', printBackground: true,
    margin: { top: '0', bottom: '0', left: '0', right: '0' }, preferCSSPageSize: true
  });
  await page.close();
}

const tmpDir = join(root, 'dist', '_colophon-tmp');
if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

console.log('=== 2026-06 초등부(Mars/Venus) 완성본 생성 ===\n');
const { proc: srv, port } = await startServer();
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });

try {
  for (const { level, coverFile, bodyFile } of LEVELS) {
    const distDir = join(root, 'dist', `${MONTH}-${level}`);
    const coverPath = join(distDir, coverFile);
    const bodyPath = join(distDir, bodyFile);
    const outPath = join(distDir, `${MONTH}-${level}.pdf`);
    const colophonPath = join(tmpDir, `${MONTH}-${level}-colophon.pdf`);

    if (!existsSync(coverPath) || !existsSync(bodyPath)) {
      console.log(`[${level}] SKIP: 표지 또는 본문 PDF 없음`); continue;
    }
    console.log(`[${level}]`);

    await renderColophon(browser, port, level, colophonPath);
    console.log(`  1/3 colophon 렌더 완료`);

    const cover = await PDFDocument.load(readFileSync(coverPath), { ignoreEncryption: true });
    const colophon = await PDFDocument.load(readFileSync(colophonPath), { ignoreEncryption: true });
    const body = await PDFDocument.load(readFileSync(bodyPath), { ignoreEncryption: true });

    const merged = await PDFDocument.create();
    for (const p of await merged.copyPages(cover, cover.getPageIndices())) merged.addPage(p);
    for (const p of await merged.copyPages(colophon, colophon.getPageIndices())) merged.addPage(p);
    for (const p of await merged.copyPages(body, body.getPageIndices())) merged.addPage(p);

    merged.setTitle(`Terra Nova · ${level.toUpperCase()} 6월호`);
    merged.setAuthor('Terra Nova English');
    merged.setSubject('Monthly English Textbook · 2026-06');
    merged.setCreator('Terra Nova Textbook Builder');
    merged.setProducer('Terra Nova / pdf-lib');
    merged.setKeywords(['초등영어', '독해', '교과 연계', 'Terra Nova', `2026-06 ${level}`]);

    const bytes = await merged.save({ useObjectStreams: true });
    writeFileSync(outPath, bytes);
    console.log(`  2/3 합본 ${merged.getPageCount()}p (표지 1 + 저작권 1 + 본문 ${body.getPageCount()})`);
    console.log(`  3/3 ✓ ${outPath.replace(root + '/', '').replace(/\\/g, '/')} (${(bytes.length / 1024 / 1024).toFixed(1)}MB)\n`);
  }
} finally {
  await browser.close().catch(() => {});
  srv.kill('SIGTERM');
}
console.log('완료. 저작권 페이지가 표지 바로 다음(p2)에 삽입되었습니다.');
