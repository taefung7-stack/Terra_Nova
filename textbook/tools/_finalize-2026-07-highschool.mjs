#!/usr/bin/env node
/**
 * 2026-07 고등부 (Saturn 고1 / Jupiter 고2 / Sun 고3) 완전한 책 만들기.
 *
 * 입력 (각 dist/2026-07/2026-07-{Level} ({학년}) 폴더):
 *   - {표지}.png           (1414x2000, A4 비율 표지 이미지)
 *   - 2026-07-{Level}-fullbook.pdf   (134p, 표지/판권 없이 CONTENTS 부터 시작하는 본문)
 *
 * 출력:
 *   - 2026-07-{Level}.pdf  (140p = 앞표지(1p) + 백지(1p) + 판권/colophon(1p) + 백지(1p)
 *                                  + 본문(134p) + 백지(1p) + 뒷표지(1p))
 *
 * 절차:
 *   1. puppeteer 로 colophon.html?level={level}&month=2026-07 을 1p PDF 로 렌더
 *   2. pdf-lib 로 앞표지(PNG→A4 1p) + 백지 + colophon(1p) + 백지 + body(134p) + 백지 + 뒷표지(PNG→A4 1p) 합본
 *      ※ 백지: 표지 뒤 1장 / 판권 뒤 1장 / 뒷표지 앞(본문 뒤) 1장 — 전 교재 공통 규칙
 *      ※ 뒷표지는 세 학년 공통: dist/2026-07/7월 뒷표지.png
 */
import puppeteer from 'puppeteer';
import { spawn, execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as wait } from 'node:timers/promises';
import { PDFDocument } from 'pdf-lib';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const MONTH = '2026-07';
// folder dir name → level slug + cover filename
const BOOKS = [
  { dir: '2026-07-Saturn (고1)',  level: 'saturn',  cover: '7월 saturn 앞표지 (고1).png',  full: '2026-07-Saturn-fullbook.pdf',  out: '2026-07-Saturn.pdf'  },
  { dir: '2026-07-Jupiter (고2)', level: 'jupiter', cover: '7월 jupiter 앞표지 (고2).png', full: '2026-07-Jupiter-fullbook.pdf', out: '2026-07-Jupiter.pdf' },
  { dir: '2026-07-Sun (고3)',     level: 'sun',     cover: '7월 sun 앞표지 (고3).png',     full: '2026-07-Sun-fullbook.pdf',     out: '2026-07-Sun.pdf'     },
];

// 뒷표지: 세 학년 공통 (2026-07 폴더 루트)
const BACK_COVER = join(root, 'dist', MONTH, '7월 뒷표지.png');

async function startStaticServer(port = 4531) {
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

// A4 in PDF points
const A4_W = 595.28;
const A4_H = 841.89;

const tmpDir = join(root, 'dist', '_finalize-0707-tmp');
if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

console.log('=== 2026-07 고등부 완전한 책 만들기 (표지 + 판권 + 본문) ===\n');

if (!existsSync(BACK_COVER)) { console.error(`뒷표지 없음: ${BACK_COVER}`); process.exit(1); }

const { proc: srvProc, port: srvPort } = await startStaticServer();
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });

try {
  for (const b of BOOKS) {
    const distDir = join(root, 'dist', MONTH, b.dir);
    const coverPath = join(distDir, b.cover);
    const fullPath  = join(distDir, b.full);
    const outPath   = join(distDir, b.out);
    const colophonPath = join(tmpDir, `${b.level}-colophon.pdf`);

    if (!existsSync(coverPath)) { console.log(`[${b.level}] SKIP: 표지 없음 ${coverPath}`); continue; }
    if (!existsSync(fullPath))  { console.log(`[${b.level}] SKIP: 본문 없음 ${fullPath}`); continue; }

    console.log(`[${b.level}]  (${b.dir})`);

    // 1. colophon 1p 렌더
    await renderColophon(browser, srvPort, b.level, colophonPath);
    console.log(`  1/3 판권(colophon) 1p 렌더 완료`);

    // 2. 합본: 앞표지(PNG→A4) + 백지 + colophon + 백지 + body + 백지 + 뒷표지(PNG→A4)
    const merged = await PDFDocument.create();

    // 빈 A4 백지 한 장을 추가하는 헬퍼 (전 교재 공통 규칙)
    const addBlank = () => merged.addPage([A4_W, A4_H]);

    // 앞표지: PNG 를 A4 1페이지에 가득 채워 배치
    const coverImg = await merged.embedPng(readFileSync(coverPath));
    const coverPage = merged.addPage([A4_W, A4_H]);
    coverPage.drawImage(coverImg, { x: 0, y: 0, width: A4_W, height: A4_H });

    // 백지 (표지 뒤)
    addBlank();

    // 판권
    const colophonDoc = await PDFDocument.load(readFileSync(colophonPath));
    const colophonPgs = await merged.copyPages(colophonDoc, colophonDoc.getPageIndices());
    colophonPgs.forEach(p => merged.addPage(p));

    // 백지 (판권 뒤)
    addBlank();

    // 본문 (134p 전부)
    const bodyDoc = await PDFDocument.load(readFileSync(fullPath), { ignoreEncryption: true });
    const bodyPgs = await merged.copyPages(bodyDoc, bodyDoc.getPageIndices());
    bodyPgs.forEach(p => merged.addPage(p));

    // 백지 (뒷표지 앞 = 본문 뒤)
    addBlank();

    // 뒷표지: 세 학년 공통 PNG 를 A4 1페이지에 가득 채워 맨 뒤에 배치
    const backImg = await merged.embedPng(readFileSync(BACK_COVER));
    const backPage = merged.addPage([A4_W, A4_H]);
    backPage.drawImage(backImg, { x: 0, y: 0, width: A4_W, height: A4_H });

    const LEVEL_TITLE = { saturn: '고1 SATURN', jupiter: '고2 JUPITER', sun: '고3 SUN' }[b.level] || b.level;
    merged.setTitle(`Terra Nova · ${LEVEL_TITLE} 2026년 7월호`);
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

console.log('완료. 각 폴더에 표지+판권+본문 합본 PDF 가 생성되었습니다.');
