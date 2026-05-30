#!/usr/bin/env node
/**
 * Terra Nova · 표지 + 본문 합본 + 보안 PDF 빌더
 *
 * 입력: textbook/dist/{month}-{Level}/
 *   - {LEVEL} 6월 표지.pdf   (예: "SATURN 6월 표지.pdf")
 *   - {month}-{Level}.pdf    (본문 풀북)
 *
 * 출력: textbook/dist/{month}-{Level}/
 *   - {month}-{Level}-fullbook.pdf       (표지+본문 합본, paid용, 인쇄 허용/복사 차단)
 *   - {month}-{Level}-sample.pdf         (합본 1~12p, 무료 샘플, 인쇄·복사 전부 차단)
 *
 * 보안 (muhammara native PDF encryption):
 *   - Owner password로 권한 잠금 (TN_PDF_OWNER_PW 환경변수, 기본값: 자동 생성된 강력한 값)
 *   - User password 없음 → 사용자는 비번 입력 없이 열어 읽을 수 있음
 *   - userProtectionFlag:
 *       fullbook: 4   → print only (복사/추출/편집/주석 차단)
 *       sample:   0   → 전부 차단 (인쇄도 차단)
 *
 * 사용법:
 *   node tools/build-protected.mjs --month 2026-06                    (Saturn/Sun/Jupiter 전부)
 *   node tools/build-protected.mjs --month 2026-06 --levels Saturn    (특정 레벨만)
 *
 * 환경변수:
 *   TN_PDF_OWNER_PW   owner password (없으면 기본 고정값 사용 — 운영에서는 반드시 설정)
 */
import muhammara from 'muhammara';
import { PDFDocument } from 'pdf-lib';
import puppeteer from 'puppeteer';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { setTimeout as wait } from 'node:timers/promises';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const { values } = parseArgs({
  options: {
    month:  { type: 'string' },
    levels: { type: 'string' },
  },
});
if (!values.month || !/^\d{4}-\d{2}$/.test(values.month)) {
  console.error('--month YYYY-MM 필수 (예: --month 2026-06)');
  process.exit(2);
}

const month = values.month;
const DEFAULT_LEVELS = ['Saturn', 'Sun', 'Jupiter'];
const levels = values.levels
  ? values.levels.split(',').map(s => s.trim())
  : DEFAULT_LEVELS;

const OWNER_PW = process.env.TN_PDF_OWNER_PW || 'tn-2026-owner-DO-NOT-SHARE-9f4a2c';
if (!process.env.TN_PDF_OWNER_PW) {
  console.warn('⚠  TN_PDF_OWNER_PW 환경변수가 없어 기본값을 사용합니다.');
  console.warn('   운영 환경에서는 반드시 강력한 비밀번호로 설정하세요.');
}

const SAMPLE_PAGES = 12; // 샘플: cover(1) + colophon(1) + body p1..p10 = 12p

// ─── Static-file server for puppeteer ────────────────────────
async function startStaticServer(port = 4527) {
  // sirv-cli is already a dependency; run it as child process serving textbook/ root
  const proc = spawn(process.execPath, [
    resolve(root, 'node_modules', 'sirv-cli', 'bin.js'),
    '.', '--port', String(port), '--host', '127.0.0.1', '--single', 'false', '--quiet'
  ], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
  proc.stdout.on('data', () => {});
  proc.stderr.on('data', () => {});
  // wait a moment for server to bind
  for (let i = 0; i < 30; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/colophon.html`);
      if (r.ok) return { proc, port };
    } catch { /* not ready */ }
    await wait(150);
  }
  proc.kill('SIGTERM');
  throw new Error('static server failed to start');
}

async function renderColophonPdf(browser, port, level, outPath) {
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}/colophon.html?level=${level}&month=${month}`, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: outPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '0', bottom: '0', left: '0', right: '0' },
    preferCSSPageSize: true,
  });
  await page.close();
}

async function mergeCoverColophonAndBody(coverPath, colophonPath, bodyPath, outPath) {
  const merged = await PDFDocument.create();
  const cover     = await PDFDocument.load(readFileSync(coverPath));
  const colophon  = await PDFDocument.load(readFileSync(colophonPath));
  const body      = await PDFDocument.load(readFileSync(bodyPath));

  const cp1 = await merged.copyPages(cover, cover.getPageIndices());
  cp1.forEach(p => merged.addPage(p));
  const cp2 = await merged.copyPages(colophon, colophon.getPageIndices());
  cp2.forEach(p => merged.addPage(p));
  const cp3 = await merged.copyPages(body, body.getPageIndices());
  cp3.forEach(p => merged.addPage(p));

  merged.setTitle(`Terra Nova ${month}`);
  merged.setProducer('Terra Nova English');
  merged.setCreator('Terra Nova Build Pipeline');

  writeFileSync(outPath, await merged.save());
  return merged.getPageCount();
}

async function mergeSample(coverPath, colophonPath, bodyPath, bodyPageLimit, outPath) {
  // Sample = cover + colophon + first N pages of body
  const merged = await PDFDocument.create();
  const cover    = await PDFDocument.load(readFileSync(coverPath));
  const colophon = await PDFDocument.load(readFileSync(colophonPath));
  const body     = await PDFDocument.load(readFileSync(bodyPath));

  const cp1 = await merged.copyPages(cover, cover.getPageIndices());
  cp1.forEach(p => merged.addPage(p));
  const cp2 = await merged.copyPages(colophon, colophon.getPageIndices());
  cp2.forEach(p => merged.addPage(p));
  const limit = Math.min(bodyPageLimit, body.getPageCount());
  const indices = Array.from({ length: limit }, (_, i) => i);
  const cp3 = await merged.copyPages(body, indices);
  cp3.forEach(p => merged.addPage(p));

  merged.setTitle(`Terra Nova ${month} Sample`);
  merged.setProducer('Terra Nova English');
  merged.setCreator('Terra Nova Build Pipeline');

  writeFileSync(outPath, await merged.save());
  return merged.getPageCount();
}

function protectPdf(srcPath, outPath, { ownerPassword, allowPrint }) {
  // userProtectionFlag bits (allow flags):
  //   4  = print
  //   8  = modify
  //   16 = copy/extract text+graphics
  //   32 = annotation
  //   ...
  // We only set "print" when allowPrint=true. Otherwise 0 = block everything.
  const writer = muhammara.createWriter(outPath, {
    userPassword: '',                // empty user password → can open without prompt
    ownerPassword,
    userProtectionFlag: allowPrint ? 4 : 0,
  });
  const cpy = writer.createPDFCopyingContext(srcPath);
  const total = cpy.getSourceDocumentParser().getPagesCount();
  for (let i = 0; i < total; i++) cpy.appendPDFPageFromPDF(i);
  writer.end();
  return total;
}

const distDir = resolve(root, 'dist');
const tmpDir  = resolve(root, 'dist', '_protected-tmp');
if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

// Start static server + headless browser for colophon rendering
const { proc: srvProc, port: srvPort } = await startStaticServer();
// proxy-bypass args: headless Chrome otherwise routes 127.0.0.1 through an
// auto-detected system proxy and times out connecting to the local sirv server.
const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--proxy-server=direct://', '--proxy-bypass-list=*', '--disable-gpu'],
});

const results = [];
try {
  for (const lvl of levels) {
    const dir = resolve(distDir, `${month}-${lvl}`);
    const bodyPath  = resolve(dir, `${month}-${lvl}.pdf`);
    const coverPath = resolve(dir, `${lvl.toUpperCase()} 6월 표지.pdf`);
    if (!existsSync(bodyPath)) {
      console.error(`  [${lvl}] 본문 없음: ${bodyPath} — skip`);
      continue;
    }
    if (!existsSync(coverPath)) {
      console.error(`  [${lvl}] 표지 없음: ${coverPath} — skip`);
      continue;
    }

    console.log(`\n=== ${lvl} ===`);
    const tmpColophon = resolve(tmpDir, `${month}-${lvl}-colophon.pdf`);
    const tmpMerged   = resolve(tmpDir, `${month}-${lvl}-merged.pdf`);
    const tmpSample   = resolve(tmpDir, `${month}-${lvl}-sample-plain.pdf`);
    const outFull     = resolve(dir, `${month}-${lvl}-fullbook.pdf`);
    const outSample   = resolve(dir, `${month}-${lvl}-sample.pdf`);

    // 0. Render colophon page (level-specific) via puppeteer
    await renderColophonPdf(browser, srvPort, lvl.toLowerCase(), tmpColophon);
    console.log(`  0/4 colophon rendered: ${tmpColophon}`);

    // 1. Fullbook merge: cover + colophon + body  (unencrypted, intermediate)
    const mergedPages = await mergeCoverColophonAndBody(coverPath, tmpColophon, bodyPath, tmpMerged);
    console.log(`  1/4 fullbook merge done (${mergedPages}p)`);

    // 2. Sample merge: cover + colophon + first 10 pages of body = 12 pages
    const bodyInSample = SAMPLE_PAGES - 2;
    const sampPlainPages = await mergeSample(coverPath, tmpColophon, bodyPath, bodyInSample, tmpSample);
    console.log(`  2/4 sample merge done (${sampPlainPages}p, cover + colophon + body 1..${bodyInSample})`);

    // 3. Protect fullbook (print allowed, copy/extract blocked)
    const fullPages = protectPdf(tmpMerged, outFull, {
      ownerPassword: OWNER_PW,
      allowPrint: true,
    });
    console.log(`  3/4 fullbook protected (${fullPages}p, print=allow): ${outFull}`);

    // 4. Protect sample (all blocked)
    const sampPages = protectPdf(tmpSample, outSample, {
      ownerPassword: OWNER_PW,
      allowPrint: false,
    });
    console.log(`  4/4 sample protected (${sampPages}p, print=block): ${outSample}`);

    results.push({ level: lvl, fullbook: outFull, sample: outSample, fullPages, samplePages: sampPages });
  }
} finally {
  await browser.close().catch(() => {});
  srvProc.kill('SIGTERM');
}

console.log('\n=== Summary ===');
for (const r of results) {
  console.log(`${r.level}: fullbook ${r.fullPages}p | sample ${r.samplePages}p`);
}
console.log(`\n임시 파일 위치: ${tmpDir} (필요 시 삭제 가능)`);
console.log(`\n다음 단계:`);
console.log(`  node tools/upload-protected-pdfs.mjs --month ${month}`);
