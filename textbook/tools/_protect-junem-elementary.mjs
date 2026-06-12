#!/usr/bin/env node
/**
 * 2026-06 초등부(Mars / Venus) 보안 PDF 생성.
 *
 * 입력 (이미 표지+colophon+본문 합본 완료):
 *   dist/2026-06-{Level}/2026-06-{Level}.pdf   (156p = 표지 1 + 저작권 1 + 본문 154)
 *
 * 출력:
 *   dist/2026-06-{Level}/2026-06-{Level}-fullbook.pdf  (결제자, 인쇄만 허용)
 *   dist/2026-06-{Level}/2026-06-{Level}-sample.pdf    (무료 샘플 12p, 전부 차단)
 *
 * 보안 (muhammara native PDF encryption) — 타 교재(build-protected.mjs)와 동일:
 *   userProtectionFlag: fullbook=4 (print only) / sample=0 (block all)
 *   userPassword 빈 문자열(비번 없이 열람), ownerPassword=TN_PDF_OWNER_PW
 *
 * 샘플 12p = 표지 1 + 저작권 1 + 본문 첫 10p (TOC 2 + WEEK01 divider + DAY01 4p + DAY02 본문 일부)
 */
import muhammara from 'muhammara';
import { PDFDocument } from 'pdf-lib';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const MONTH = '2026-06';
const LEVELS = ['Mars', 'Venus'];
const SAMPLE_PAGES = 12; // 합본(표지+저작권 포함) 앞에서부터 12p

const OWNER_PW = process.env.TN_PDF_OWNER_PW || 'tn-2026-owner-DO-NOT-SHARE-9f4a2c';
if (!process.env.TN_PDF_OWNER_PW) {
  console.warn('⚠  TN_PDF_OWNER_PW 환경변수가 없어 기본값을 사용합니다. 운영에서는 반드시 설정하세요.\n');
}

const tmpDir = join(root, 'dist', '_protected-tmp');
if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

function protectPdf(srcPath, outPath, { ownerPassword, allowPrint }) {
  const writer = muhammara.createWriter(outPath, {
    userPassword: '', ownerPassword, userProtectionFlag: allowPrint ? 4 : 0,
  });
  const cpy = writer.createPDFCopyingContext(srcPath);
  const total = cpy.getSourceDocumentParser().getPagesCount();
  for (let i = 0; i < total; i++) cpy.appendPDFPageFromPDF(i);
  writer.end();
  return total;
}

async function makeSamplePlain(srcPath, outPath, limit) {
  const src = await PDFDocument.load(readFileSync(srcPath), { ignoreEncryption: true });
  const out = await PDFDocument.create();
  const take = Math.min(limit, src.getPageCount());
  const copied = await out.copyPages(src, Array.from({ length: take }, (_, i) => i));
  copied.forEach(p => out.addPage(p));
  out.setTitle(`Terra Nova · ${MONTH} Sample`);
  out.setAuthor('Terra Nova English');
  out.setSubject(`Monthly English Textbook · ${MONTH} · Sample`);
  writeFileSync(outPath, await out.save({ useObjectStreams: true }));
  return take;
}

console.log('=== Terra Nova 2026-06 초등부 보안 PDF 생성 ===\n');
const results = [];

for (const level of LEVELS) {
  const distDir = join(root, 'dist', MONTH, `${MONTH}-${level}`);
  const srcPath = join(distDir, `${MONTH}-${level}.pdf`);
  if (!existsSync(srcPath)) { console.log(`[${level}] SKIP: ${srcPath} 없음\n`); continue; }

  const tmpSamplePlain = join(tmpDir, `${MONTH}-${level}-sample-plain.pdf`);
  const outFull   = join(distDir, `${MONTH}-${level}-fullbook.pdf`);
  const outSample = join(distDir, `${MONTH}-${level}-sample.pdf`);

  console.log(`[${level}]`);
  const samplePages = await makeSamplePlain(srcPath, tmpSamplePlain, SAMPLE_PAGES);
  console.log(`  1/3 sample plain ${samplePages}p 추출`);

  const fullPages = protectPdf(srcPath, outFull, { ownerPassword: OWNER_PW, allowPrint: true });
  const fullSize = (readFileSync(outFull).length / 1024 / 1024).toFixed(1);
  console.log(`  2/3 fullbook ${fullPages}p (인쇄✓/복사✗/편집✗) → ${outFull.replace(root + '/', '').replace(/\\/g, '/')} (${fullSize}MB)`);

  const sampPages = protectPdf(tmpSamplePlain, outSample, { ownerPassword: OWNER_PW, allowPrint: false });
  const sampSize = (readFileSync(outSample).length / 1024 / 1024).toFixed(1);
  console.log(`  3/3 sample ${sampPages}p (전부 차단) → ${outSample.replace(root + '/', '').replace(/\\/g, '/')} (${sampSize}MB)\n`);

  results.push({ level, fullPages, samplePages: sampPages, fullSize, sampSize });
}

console.log('=== Summary ===');
console.log('| Level | Fullbook | Sample | Full MB | Samp MB |');
console.log('|-------|----------|--------|---------|---------|');
for (const r of results) {
  console.log(`| ${r.level.padEnd(5)} | ${String(r.fullPages).padEnd(8)} | ${String(r.samplePages).padEnd(6)} | ${r.fullSize.padEnd(7)} | ${r.sampSize.padEnd(7)} |`);
}
