#!/usr/bin/env node
/**
 * 2026-08 고등부 (Saturn 고1 / Jupiter 고2) 완전한 책 만들기.
 *
 * 입력:
 *   - 앞표지 JPG   (Saturn: dist/2026-08/8월 saturn 앞표지 (고1).jpg,
 *                   Jupiter: dist/2026-08/2026-08-Jupiter (고2)/8월 jupiter 앞표지 (고2).jpg)
 *   - 본문 fullbook: dist/2026-08/2026-08-{Level} (학년)/2026-08-{Level}-fullbook.pdf (134p)
 *   - 뒷표지 공통 JPG: dist/2026-08/8월 뒷표지.jpg
 *
 * 출력 (각 폴더):
 *   - 2026-08-{Level}.pdf  (140p = 앞표지1 + 백지1 + 판권1 + 백지1 + 본문134 + 백지1 + 뒷표지1)
 *
 * 절차:
 *   1. puppeteer 로 colophon.html?level={level}&month=2026-08 을 1p PDF 로 렌더
 *      (colophon 이 발행일 2026년 8월 1일 · 통권 제8호 · 초판 1쇄 발행 자동 표기 — 인쇄판호 정보)
 *   2. pdf-lib 로 앞표지(JPG→A4) + 백지 + colophon + 백지 + body + 백지 + 뒷표지(JPG→A4) 합본
 *      ※ 백지 3장 규칙(표지 뒤 / 판권 뒤 / 뒷표지 앞) — 전 교재 공통
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
const MONTH = '2026-08';

// cover: 각 레벨 폴더 안의 앞표지 PNG(8월 새 표지). full/out 도 폴더 안.
const distRoot = join(root, 'dist', MONTH);
const ALL_BOOKS = [
  { dir: '2026-08-Saturn (고1)',  level: 'saturn',  cover: join(distRoot, '2026-08-Saturn (고1)', '8월 saturn 앞표지 (고1).png'), full: '2026-08-Saturn-fullbook.pdf',  out: '2026-08-Saturn.pdf'  },
  { dir: '2026-08-Jupiter (고2)', level: 'jupiter', cover: join(distRoot, '2026-08-Jupiter (고2)', '8월 jupiter 앞표지 (고2).png'), full: '2026-08-Jupiter-fullbook.pdf', out: '2026-08-Jupiter.pdf' },
  { dir: '2026-08-Sun (고3)',     level: 'sun',     cover: join(distRoot, '2026-08-Sun (고3)', '8월 sun 앞표지 (고3).png'), full: '2026-08-Sun-fullbook.pdf', out: '2026-08-Sun.pdf' },
];
const _levelArg = process.argv.find(a => a.startsWith('--levels='))?.split('=')[1]
  || (process.argv.includes('--levels') ? process.argv[process.argv.indexOf('--levels') + 1] : '');
const _wantLevels = _levelArg ? _levelArg.split(',').map(s => s.trim().toLowerCase()).filter(Boolean) : null;
const BOOKS = _wantLevels ? ALL_BOOKS.filter(b => _wantLevels.includes(b.level)) : ALL_BOOKS;

// 뒷표지: 전 학년 공통 (dist/2026-08 루트)
const BACK_COVER = join(distRoot, '8월 뒷표지.jpg');

// JPG/PNG 자동 판별 임베드
async function embedCover(doc, path) {
  const bytes = readFileSync(path);
  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50; // \x89PNG
  return isPng ? doc.embedPng(bytes) : doc.embedJpg(bytes);
}

async function startStaticServer(port = 4533) {
  const proc = spawn(process.execPath, [
    resolve(root, 'node_modules', 'sirv-cli', 'bin.js'),
    '.', '--port', String(port), '--host', '127.0.0.1', '--single', 'false', '--quiet'
  ], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
  proc.stdout.on('data', () => {});
  proc.stderr.on('data', () => {});
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(`http://127.0.0.1:${port}/colophon.html`); if (r.ok) return { proc, port }; } catch {}
    await wait(150);
  }
  proc.kill('SIGTERM');
  throw new Error('static server failed to start');
}

async function renderColophon(browser, port, level, outPath) {
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}/colophon.html?level=${level}&month=${MONTH}`, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.pdf({ path: outPath, format: 'A4', printBackground: true, margin: { top: '0', bottom: '0', left: '0', right: '0' }, preferCSSPageSize: true });
  await page.close();
}

const A4_W = 595.28, A4_H = 841.89;
const tmpDir = join(root, 'dist', '_finalize-0808-tmp');
if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

console.log('=== 2026-08 고등부 완전한 책 만들기 (표지 + 판권 + 본문 + 백지3장) ===\n');
if (!existsSync(BACK_COVER)) { console.error(`뒷표지 없음: ${BACK_COVER}`); process.exit(1); }

const { proc: srvProc, port: srvPort } = await startStaticServer();
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });

try {
  for (const b of BOOKS) {
    const distDir = join(distRoot, b.dir);
    const fullPath = join(distDir, b.full);
    const outPath = join(distDir, b.out);
    const colophonPath = join(tmpDir, `${b.level}-colophon.pdf`);

    if (!existsSync(b.cover)) { console.log(`[${b.level}] SKIP: 앞표지 없음 ${b.cover}`); continue; }
    if (!existsSync(fullPath)) { console.log(`[${b.level}] SKIP: 본문 없음 ${fullPath}`); continue; }

    console.log(`[${b.level}]  (${b.dir})`);
    await renderColophon(browser, srvPort, b.level, colophonPath);
    console.log(`  1/3 판권(colophon) 1p 렌더 완료 (발행일 2026.8.1 · 통권 제8호 · 초판 1쇄)`);

    const merged = await PDFDocument.create();
    const addBlank = () => merged.addPage([A4_W, A4_H]);

    // 앞표지
    const coverImg = await embedCover(merged, b.cover);
    merged.addPage([A4_W, A4_H]).drawImage(coverImg, { x: 0, y: 0, width: A4_W, height: A4_H });
    addBlank(); // 표지 뒤 백지

    // 판권
    const colophonDoc = await PDFDocument.load(readFileSync(colophonPath));
    (await merged.copyPages(colophonDoc, colophonDoc.getPageIndices())).forEach(p => merged.addPage(p));
    addBlank(); // 판권 뒤 백지

    // 본문 134p
    const bodyDoc = await PDFDocument.load(readFileSync(fullPath), { ignoreEncryption: true });
    (await merged.copyPages(bodyDoc, bodyDoc.getPageIndices())).forEach(p => merged.addPage(p));
    addBlank(); // 뒷표지 앞 백지

    // 뒷표지
    const backImg = await embedCover(merged, BACK_COVER);
    merged.addPage([A4_W, A4_H]).drawImage(backImg, { x: 0, y: 0, width: A4_W, height: A4_H });

    const LEVEL_TITLE = { saturn: '고1 SATURN', jupiter: '고2 JUPITER', sun: '고3 SUN' }[b.level] || b.level;
    merged.setTitle(`Terra Nova · ${LEVEL_TITLE} 2026년 8월호`);
    merged.setAuthor('Terra Nova English');
    merged.setSubject('Monthly English Textbook · 2026-08');
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
console.log('완료. 각 폴더에 표지+판권+본문+백지3장 합본 PDF 가 생성되었습니다.');
