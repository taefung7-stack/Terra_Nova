#!/usr/bin/env node
/**
 * 2026-07 초등(Mars 초5 / Venus 초6) + 중1(Terra) 완성본 만들기.
 * 사용자 제공 검수수정 최종본(*_fullbook_final_complete.pdf)을 body 로 받아
 * 앞표지 + 백지 + 판권 + 백지 + 본문 + 백지 + 뒷표지 로 합본. (백지 3장 규칙)
 * 참조: tools/_finalize-2026-07-highschool.mjs
 *
 * 사용: node tools/_finalize-2026-07-elementary-mid.mjs [--levels mars,venus,terra]
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
const MONTH = '2026-07';

const ALL_BOOKS = [
  { dir: '2026-07-Mars (초5)',  level: 'mars',  cover: '7월 mars 앞표지 (초5).png',  body: 'mars_fullbook_final_complete.pdf',  out: '2026-07-Mars.pdf',  title: '초5 MARS' },
  { dir: '2026-07-Venus (초6)', level: 'venus', cover: '7월 venus 앞표지 (초6).png', body: 'venus_fullbook_final_complete.pdf', out: '2026-07-Venus.pdf', title: '초6 VENUS' },
  { dir: '2026-07-Terra (중1)', level: 'terra', cover: '7월 terra 앞표지 (중1).png', body: 'terra_fullbook_final_complete.pdf', out: '2026-07-Terra.pdf', title: '중1 TERRA' },
];
const _levelArg = process.argv.find(a => a.startsWith('--levels='))?.split('=')[1]
  || (process.argv.includes('--levels') ? process.argv[process.argv.indexOf('--levels') + 1] : '');
const _want = _levelArg ? _levelArg.split(',').map(s => s.trim().toLowerCase()).filter(Boolean) : null;
const BOOKS = _want ? ALL_BOOKS.filter(b => _want.includes(b.level)) : ALL_BOOKS;

const BACK_COVER = join(root, 'dist', MONTH, '7월 뒷표지.png');
const A4_W = 595.28, A4_H = 841.89;

async function startStaticServer(port = 4533) {
  const proc = spawn(process.execPath, [
    resolve(root, 'node_modules', 'sirv-cli', 'bin.js'),
    '.', '--port', String(port), '--host', '127.0.0.1', '--single', 'false', '--quiet'
  ], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
  proc.stdout.on('data', () => {}); proc.stderr.on('data', () => {});
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(`http://127.0.0.1:${port}/colophon.html`); if (r.ok) return { proc, port }; } catch {}
    await wait(150);
  }
  proc.kill('SIGTERM'); throw new Error('static server failed to start');
}

async function renderColophon(browser, port, level, outPath) {
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}/colophon.html?level=${level}&month=${MONTH}`, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.pdf({ path: outPath, format: 'A4', printBackground: true, margin: { top: '0', bottom: '0', left: '0', right: '0' }, preferCSSPageSize: true });
  await page.close();
}

const tmpDir = join(root, 'dist', '_finalize-elemid-tmp');
if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

console.log('=== 2026-07 초등+중1 완성본 (앞표지+백지+판권+백지+본문+백지+뒷표지) ===\n');
if (!existsSync(BACK_COVER)) { console.error(`뒷표지 없음: ${BACK_COVER}`); process.exit(1); }

const { proc: srvProc, port: srvPort } = await startStaticServer();
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });

try {
  for (const b of BOOKS) {
    const distDir = join(root, 'dist', MONTH, b.dir);
    const coverPath = join(distDir, b.cover);
    const bodyPath  = join(distDir, b.body);
    const outPath   = join(distDir, b.out);
    const colophonPath = join(tmpDir, `${b.level}-colophon.pdf`);

    if (!existsSync(coverPath)) { console.log(`[${b.level}] SKIP: 표지 없음 ${coverPath}`); continue; }
    if (!existsSync(bodyPath))  { console.log(`[${b.level}] SKIP: 본문 없음 ${bodyPath}`); continue; }
    console.log(`[${b.level}]  (${b.dir})`);

    await renderColophon(browser, srvPort, b.level, colophonPath);
    console.log(`  1/2 판권(colophon) 렌더 완료`);

    const merged = await PDFDocument.create();
    const addBlank = () => merged.addPage([A4_W, A4_H]);

    // 앞표지
    const coverImg = await merged.embedPng(readFileSync(coverPath));
    merged.addPage([A4_W, A4_H]).drawImage(coverImg, { x: 0, y: 0, width: A4_W, height: A4_H });
    addBlank(); // 표지 뒤

    // 판권
    const colDoc = await PDFDocument.load(readFileSync(colophonPath));
    (await merged.copyPages(colDoc, colDoc.getPageIndices())).forEach(p => merged.addPage(p));
    addBlank(); // 판권 뒤

    // 본문
    const bodyDoc = await PDFDocument.load(readFileSync(bodyPath), { ignoreEncryption: true });
    (await merged.copyPages(bodyDoc, bodyDoc.getPageIndices())).forEach(p => merged.addPage(p));
    addBlank(); // 뒷표지 앞

    // 뒷표지
    const backImg = await merged.embedPng(readFileSync(BACK_COVER));
    merged.addPage([A4_W, A4_H]).drawImage(backImg, { x: 0, y: 0, width: A4_W, height: A4_H });

    merged.setTitle(`Terra Nova · ${b.title} 2026년 7월호`);
    merged.setAuthor('Terra Nova English');
    merged.setSubject('Monthly English Textbook · 2026-07');
    merged.setCreator('Terra Nova Textbook Builder');
    merged.setProducer('Terra Nova / pdf-lib');

    writeFileSync(outPath, await merged.save({ useObjectStreams: true }));
    const sz = (readFileSync(outPath).length / 1024 / 1024).toFixed(1);
    console.log(`  2/2 ✓ ${b.out}  ${merged.getPageCount()}p (앞표지1+백지1+판권1+백지1+본문${bodyDoc.getPageCount()}+백지1+뒷표지1)  ${sz}MB\n`);
  }
} finally {
  await browser.close().catch(() => {});
  srvProc.kill('SIGTERM');
}
console.log('완료.');
