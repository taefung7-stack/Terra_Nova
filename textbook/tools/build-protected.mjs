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
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

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

const SAMPLE_PAGES = 12; // 표지 포함 1~12p

async function mergeCoverAndBody(coverPath, bodyPath, outPath) {
  const coverBytes = readFileSync(coverPath);
  const bodyBytes = readFileSync(bodyPath);

  const merged = await PDFDocument.create();
  const cover = await PDFDocument.load(coverBytes);
  const body  = await PDFDocument.load(bodyBytes);

  const coverPages = await merged.copyPages(cover, cover.getPageIndices());
  coverPages.forEach(p => merged.addPage(p));
  const bodyPages = await merged.copyPages(body, body.getPageIndices());
  bodyPages.forEach(p => merged.addPage(p));

  // Set metadata
  merged.setTitle(`Terra Nova ${month} ${outPath.includes('sample') ? 'Sample' : 'Fullbook'}`);
  merged.setProducer('Terra Nova English');
  merged.setCreator('Terra Nova Build Pipeline');

  const out = await merged.save();
  writeFileSync(outPath, out);
  return merged.getPageCount();
}

function extractFirstNPages(srcPath, outPath, n) {
  // Use muhammara low-level to extract first N pages (kept unencrypted; encrypt step follows)
  const writer = muhammara.createWriter(outPath);
  const cpy = writer.createPDFCopyingContext(srcPath);
  const total = cpy.getSourceDocumentParser().getPagesCount();
  const limit = Math.min(n, total);
  for (let i = 0; i < limit; i++) cpy.appendPDFPageFromPDF(i);
  writer.end();
  return limit;
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

const results = [];
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
  const tmpMerged = resolve(tmpDir, `${month}-${lvl}-merged.pdf`);
  const tmpSample = resolve(tmpDir, `${month}-${lvl}-sample-plain.pdf`);
  const outFull   = resolve(dir, `${month}-${lvl}-fullbook.pdf`);
  const outSample = resolve(dir, `${month}-${lvl}-sample.pdf`);

  // 1. Merge cover + body (unencrypted, intermediate)
  const mergedPages = await mergeCoverAndBody(coverPath, bodyPath, tmpMerged);
  console.log(`  1/3 merge done (${mergedPages}p): ${tmpMerged}`);

  // 2. Extract first 12 pages for sample (unencrypted)
  const samplePages = extractFirstNPages(tmpMerged, tmpSample, SAMPLE_PAGES);
  console.log(`  2/3 sample extract done (${samplePages}p): ${tmpSample}`);

  // 3a. Protect fullbook (print allowed)
  const fullPages = protectPdf(tmpMerged, outFull, {
    ownerPassword: OWNER_PW,
    allowPrint: true,
  });
  console.log(`  3a/3 fullbook protected (${fullPages}p, print=allow): ${outFull}`);

  // 3b. Protect sample (all blocked)
  const sampPages = protectPdf(tmpSample, outSample, {
    ownerPassword: OWNER_PW,
    allowPrint: false,
  });
  console.log(`  3b/3 sample protected (${sampPages}p, print=block): ${outSample}`);

  results.push({ level: lvl, fullbook: outFull, sample: outSample, fullPages, samplePages });
}

console.log('\n=== Summary ===');
for (const r of results) {
  console.log(`${r.level}: fullbook ${r.fullPages}p | sample ${r.samplePages}p`);
}
console.log(`\n임시 파일 위치: ${tmpDir} (필요 시 삭제 가능)`);
console.log(`\n다음 단계:`);
console.log(`  node tools/upload-protected-pdfs.mjs --month ${month}`);
