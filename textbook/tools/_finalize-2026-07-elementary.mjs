#!/usr/bin/env node
/**
 * 2026-07 초등부 (Mars 초5 / Venus 초6) 완전한 책 만들기.
 *
 * 입력:
 *   - 앞표지 PNG:  dist/2026-07/7월 {level} 앞표지 ({학년}).png   (1414x2000)
 *   - 본문 fullbook: dist/2026-07/2026-07-{Level} ({학년})/2026-07-{Level}-fullbook.pdf (134p)
 *   - 뒷표지: dist/2026-07/7월 뒷표지.png  (전 학년 공통)
 *
 * 출력:
 *   - dist/2026-07/2026-07-{Level} ({학년})/2026-07-{Level}.pdf
 *     (140p = 앞표지1 + 백지1 + 판권1 + 백지1 + 본문134 + 백지1 + 뒷표지1)
 *
 * 백지 3장 규칙: 표지 뒤 / 판권 뒤 / 뒷표지 앞 — 전 교재 공통 (2026-07~).
 * 참조 구현: tools/_finalize-2026-07-highschool.mjs
 */
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as wait } from 'node:timers/promises';
import { PDFDocument } from 'pdf-lib';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const MONTH = '2026-07';
// 초등 표지는 dist/2026-07 폴더 루트에 있다(고등은 레벨 폴더 안). 경로를 절대값으로 명시.
const ALL_BOOKS = [
  { dir: '2026-07-Mars (초5)',  level: 'mars',  cover: '7월 mars 앞표지 (초5).png',  full: '2026-07-Mars-fullbook.pdf',  out: '2026-07-Mars.pdf',  title: '초5 MARS'  },
  { dir: '2026-07-Venus (초6)', level: 'venus', cover: '7월 venus 앞표지 (초6).png', full: '2026-07-Venus-fullbook.pdf', out: '2026-07-Venus.pdf', title: '초6 VENUS' },
];
const _levelArg = process.argv.find(a => a.startsWith('--levels='))?.split('=')[1]
  || (process.argv.includes('--levels') ? process.argv[process.argv.indexOf('--levels') + 1] : '');
const _wantLevels = _levelArg ? _levelArg.split(',').map(s => s.trim().toLowerCase()).filter(Boolean) : null;
const BOOKS = _wantLevels ? ALL_BOOKS.filter(b => _wantLevels.includes(b.level)) : ALL_BOOKS;

const BACK_COVER = join(root, 'dist', MONTH, '7월 뒷표지.png');

const A4_W = 595.28;
const A4_H = 841.89;

async function startStaticServer(port = 4533) {
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
    `http://127.0.0.1:${port}/colophon.html?level=${level}&month=${MONTH}`,
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

const puppeteer = (await import('puppeteer')).default;

const tmpDir = join(root, 'dist', '_finalize-elem-0707-tmp');
if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

console.log('=== 2026-07 초등부 완전한 책 만들기 (표지 + 판권 + 본문 + 백지3) ===\n');

if (!existsSync(BACK_COVER)) { console.error(`뒷표지 없음: ${BACK_COVER}`); process.exit(1); }

const { proc: srvProc, port: srvPort } = await startStaticServer();
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });

try {
  for (const b of BOOKS) {
    const distDir = join(root, 'dist', MONTH, b.dir);
    const coverPath = join(root, 'dist', MONTH, b.cover);   // 표지는 월 폴더 루트
    const fullPath  = join(distDir, b.full);
    const outPath   = join(distDir, b.out);
    const colophonPath = join(tmpDir, `${b.level}-colophon.pdf`);

    if (!existsSync(coverPath)) { console.log(`[${b.level}] SKIP: 표지 없음 ${coverPath}`); continue; }
    if (!existsSync(fullPath))  { console.log(`[${b.level}] SKIP: 본문 없음 ${fullPath}`); continue; }

    console.log(`[${b.level}]  (${b.dir})`);

    // 1. colophon 1p 렌더
    await renderColophon(browser, srvPort, b.level, colophonPath);
    console.log(`  1/3 판권(colophon) 1p 렌더 완료`);

    // 2. 합본: 앞표지 + 백지 + 판권 + 백지 + 본문 + 백지 + 뒷표지
    const merged = await PDFDocument.create();
    const addBlank = () => merged.addPage([A4_W, A4_H]);

    const coverImg = await merged.embedPng(readFileSync(coverPath));
    const coverPage = merged.addPage([A4_W, A4_H]);
    coverPage.drawImage(coverImg, { x: 0, y: 0, width: A4_W, height: A4_H });

    addBlank(); // 표지 뒤

    const colophonDoc = await PDFDocument.load(readFileSync(colophonPath));
    const colophonPgs = await merged.copyPages(colophonDoc, colophonDoc.getPageIndices());
    colophonPgs.forEach(p => merged.addPage(p));

    addBlank(); // 판권 뒤

    const bodyDoc = await PDFDocument.load(readFileSync(fullPath), { ignoreEncryption: true });
    const bodyPgs = await merged.copyPages(bodyDoc, bodyDoc.getPageIndices());
    bodyPgs.forEach(p => merged.addPage(p));

    addBlank(); // 뒷표지 앞(본문 뒤)

    const backImg = await merged.embedPng(readFileSync(BACK_COVER));
    const backPage = merged.addPage([A4_W, A4_H]);
    backPage.drawImage(backImg, { x: 0, y: 0, width: A4_W, height: A4_H });

    merged.setTitle(`Terra Nova · ${b.title} 2026년 7월호`);
    merged.setAuthor('Terra Nova English');
    merged.setSubject('Monthly English Textbook · 2026-07');
    merged.setCreator('Terra Nova Textbook Builder');
    merged.setProducer('Terra Nova / pdf-lib');

    writeFileSync(outPath, await merged.save({ useObjectStreams: true }));
    const sz = (readFileSync(outPath).length / 1024 / 1024).toFixed(1);
    console.log(`  2/3 합본 완료: ${merged.getPageCount()}p (앞표지1 + 백지1 + 판권1 + 백지1 + 본문${bodyDoc.getPageCount()} + 백지1 + 뒷표지1)`);
    console.log(`  3/3 ✓ ${b.out}  (${sz}MB)\n`);
  }
} finally {
  await browser.close().catch(() => {});
  srvProc.kill('SIGTERM');
}

console.log('완료. 각 폴더에 표지+판권+본문 완성 PDF 가 생성되었습니다.');
