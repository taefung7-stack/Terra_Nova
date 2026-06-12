#!/usr/bin/env node
/**
 * 6월호 신간 (Neptune / Uranus / Terra) 에 판권(colophon) 페이지 끼워 넣기.
 *
 * 입력:
 *   dist/2026-06-{Level}/2026-06-{Level}.raw.pdf  (원본 표지+본문 합본 백업, 136p)
 *     ※ 이미 _sanitize-june.mjs 가 작업한 흔적이 있다면 .raw.pdf 가 안전한 시작점.
 *
 * 출력:
 *   dist/2026-06-{Level}/2026-06-{Level}.pdf  (덮어쓰기, 137p = 표지 + colophon + 본문 135p)
 *   에러 페이지 백지화는 다시 적용된다.
 *
 * 절차:
 *   1. puppeteer 로 colophon.html?level={level}&month=2026-06 을 1p PDF 로 렌더
 *   2. pdf-lib 로 표지(1p) + colophon(1p) + body(135p, raw 백업에서 추출) 합본
 *   3. 빌더 에러 페이지(Missing curriculum / Missing data / Failed to fetch) 다시 백지화
 *   4. dist/2026-06-{Level}/2026-06-{Level}.pdf 덮어쓰기
 */
import puppeteer from 'puppeteer';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as wait } from 'node:timers/promises';
import { execFileSync } from 'node:child_process';
import { PDFDocument } from 'pdf-lib';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const MONTH = '2026-06';
const levels = ['Neptune', 'Uranus', 'Terra'];

const ERROR_PATTERNS = [
  /Missing curriculum:/,
  /Missing data:/,
  /Failed to fetch/,
  /Cover render error:/,
  /Unknown mode:/
];

function pageText(pdfPath, page) {
  try {
    return execFileSync('pdftotext', ['-layout', '-f', String(page), '-l', String(page), pdfPath, '-'], {
      encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
  } catch {
    return '';
  }
}

function isErrorPage(text) {
  if (!text) return false;
  const hasError = ERROR_PATTERNS.some(p => p.test(text));
  if (!hasError) return false;
  return text.length <= 250;
}

async function startStaticServer(port = 4529) {
  const proc = spawn(process.execPath, [
    resolve(root, 'node_modules', 'sirv-cli', 'bin.js'),
    '.', '--port', String(port), '--host', '127.0.0.1', '--single', 'false', '--quiet'
  ], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
  proc.stdout.on('data', () => {});
  proc.stderr.on('data', () => {});
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/colophon.html`);
      if (r.ok) return { proc, port };
    } catch {}
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
    path: outPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '0', bottom: '0', left: '0', right: '0' },
    preferCSSPageSize: true
  });
  await page.close();
}

const tmpDir = join(root, 'dist', '_colophon-tmp');
if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

console.log('=== 6월호 신간 colophon 추가 ===\n');

const { proc: srvProc, port: srvPort } = await startStaticServer();
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });

try {
  for (const level of levels) {
    const distDir = join(root, 'dist', MONTH, `${MONTH}-${level}`);
    const rawPath = join(distDir, `${MONTH}-${level}.raw.pdf`);
    const outPath = join(distDir, `${MONTH}-${level}.pdf`);
    const colophonPath = join(tmpDir, `${MONTH}-${level}-colophon.pdf`);

    if (!existsSync(rawPath)) {
      console.log(`[${level}] SKIP: ${rawPath} 없음 (raw 백업이 필요합니다)`);
      continue;
    }

    console.log(`[${level}]`);

    // 1. colophon 1p 렌더
    await renderColophon(browser, srvPort, level, colophonPath);
    console.log(`  1/3 colophon 1p 렌더 완료`);

    // 2. raw 에서 표지(1p) + body(나머지) 추출 후 colophon 끼워 합본
    const rawBytes = readFileSync(rawPath);
    const rawDoc = await PDFDocument.load(rawBytes, { ignoreEncryption: true });
    const colophonDoc = await PDFDocument.load(readFileSync(colophonPath));
    const totalRaw = rawDoc.getPageCount(); // 136 (cover 1 + body 135)

    const merged = await PDFDocument.create();

    // 표지 (p1)
    const [coverPg] = await merged.copyPages(rawDoc, [0]);
    merged.addPage(coverPg);

    // colophon (1p)
    const colophonPgs = await merged.copyPages(colophonDoc, colophonDoc.getPageIndices());
    colophonPgs.forEach(p => merged.addPage(p));

    // 본문 (p2..p136 = index 1..135)
    const bodyIndices = Array.from({ length: totalRaw - 1 }, (_, i) => i + 1);
    const bodyPgs = await merged.copyPages(rawDoc, bodyIndices);
    bodyPgs.forEach(p => merged.addPage(p));

    merged.setTitle(`Terra Nova · ${level.toUpperCase()} 6월호`);
    merged.setAuthor('Terra Nova English');
    merged.setSubject('Monthly English Textbook · 2026-06');
    merged.setCreator('Terra Nova Textbook Builder');
    merged.setProducer('Terra Nova / pdf-lib');

    const intermediatePath = join(tmpDir, `${MONTH}-${level}-with-colophon.pdf`);
    writeFileSync(intermediatePath, await merged.save({ useObjectStreams: true }));
    console.log(`  2/3 합본 ${merged.getPageCount()}p (cover + colophon + body)`);

    // 3. 에러 페이지 재백지화
    const interDoc = await PDFDocument.load(readFileSync(intermediatePath), { ignoreEncryption: true });
    const interTotal = interDoc.getPageCount();

    const errorPages = [];
    for (let i = 1; i <= interTotal; i++) {
      const txt = pageText(intermediatePath, i);
      if (isErrorPage(txt)) {
        errorPages.push({ page: i, text: txt.slice(0, 60) });
      }
    }

    if (errorPages.length === 0) {
      copyFileSync(intermediatePath, outPath);
      console.log(`  3/3 에러 페이지 없음 — 그대로 저장`);
    } else {
      const finalDoc = await PDFDocument.create();
      const errorSet = new Set(errorPages.map(e => e.page));
      for (let i = 0; i < interTotal; i++) {
        const pageNum = i + 1;
        if (errorSet.has(pageNum)) {
          const orig = interDoc.getPage(i);
          const { width, height } = orig.getSize();
          finalDoc.addPage([width, height]);
        } else {
          const [copied] = await finalDoc.copyPages(interDoc, [i]);
          finalDoc.addPage(copied);
        }
      }
      finalDoc.setTitle(`Terra Nova · ${level.toUpperCase()} 6월호`);
      finalDoc.setAuthor('Terra Nova English');
      finalDoc.setSubject('Monthly English Textbook · 2026-06');
      finalDoc.setCreator('Terra Nova Textbook Builder');
      finalDoc.setProducer('Terra Nova / pdf-lib');

      writeFileSync(outPath, await finalDoc.save({ useObjectStreams: true }));
      console.log(`  3/3 에러 페이지 ${errorPages.length}개 백지화: ${errorPages.map(e => 'p' + e.page).join(', ')}`);
    }

    const finalBytes = readFileSync(outPath);
    console.log(`  ✓ ${outPath.replace(root + '/', '').replace(/\\/g, '/')} (${interTotal}p, ${(finalBytes.length / 1024 / 1024).toFixed(1)}MB)\n`);
  }
} finally {
  await browser.close().catch(() => {});
  srvProc.kill('SIGTERM');
}

console.log('완료. colophon 이 표지 바로 다음(p2)에 들어갔습니다.');
