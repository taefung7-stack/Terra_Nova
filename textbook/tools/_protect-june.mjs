#!/usr/bin/env node
/**
 * 6월호 신간 (Neptune / Uranus / Terra) 보안 PDF 생성.
 *
 * 입력 (이미 표지+본문 합본 + 에러 페이지 백지화 완료):
 *   dist/2026-06-{Level}/2026-06-{Level}.pdf  (136p)
 *
 * 출력:
 *   dist/2026-06-{Level}/2026-06-{Level}-protected.pdf  (paid 배포용, 인쇄 허용, 복사·편집·주석 차단)
 *   dist/2026-06-{Level}/2026-06-{Level}-sample.pdf     (무료 샘플 12p, 인쇄 포함 전부 차단)
 *
 * 보안 (muhammara native PDF encryption):
 *   - Owner password: TN_PDF_OWNER_PW (env) 또는 기본값
 *   - User password: 빈 문자열 → 사용자는 비번 없이 열어 읽을 수 있음
 *   - userProtectionFlag:
 *       fullbook-protected: 4   → print only
 *       sample:             0   → 전부 차단
 *
 * 샘플 구성 (12p):
 *   p1 표지 (합본 p1)
 *   p2-3 TOC 자리 (현재 빈 페이지, 직원 작업 후 자동으로 반영됨)
 *   p4-12 본문 첫 9p (DAY 01 + 일부)
 */
import muhammara from 'muhammara';
import { PDFDocument } from 'pdf-lib';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const OWNER_PW = process.env.TN_PDF_OWNER_PW || 'tn-2026-owner-DO-NOT-SHARE-9f4a2c';
if (!process.env.TN_PDF_OWNER_PW) {
  console.warn('⚠  TN_PDF_OWNER_PW 환경변수가 없어 기본값을 사용합니다.');
  console.warn('   운영 환경에서는 반드시 강력한 비밀번호로 설정하세요.\n');
}

const SAMPLE_PAGES = 12; // 표지 + TOC 2p + 본문 9p

const levels = ['Neptune', 'Uranus', 'Terra'];

const tmpDir = join(root, 'dist', '_protected-tmp');
if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

function protectPdf(srcPath, outPath, { ownerPassword, allowPrint }) {
  const writer = muhammara.createWriter(outPath, {
    userPassword: '',
    ownerPassword,
    userProtectionFlag: allowPrint ? 4 : 0
  });
  const cpy = writer.createPDFCopyingContext(srcPath);
  const total = cpy.getSourceDocumentParser().getPagesCount();
  for (let i = 0; i < total; i++) cpy.appendPDFPageFromPDF(i);
  writer.end();
  return total;
}

async function makeSamplePlain(srcPath, outPath, limit) {
  const bytes = readFileSync(srcPath);
  const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const out = await PDFDocument.create();
  const take = Math.min(limit, src.getPageCount());
  const indices = Array.from({ length: take }, (_, i) => i);
  const copied = await out.copyPages(src, indices);
  copied.forEach(p => out.addPage(p));
  out.setTitle(`Terra Nova · 2026-06 Sample`);
  out.setAuthor('Terra Nova English');
  out.setSubject('Monthly English Textbook · 2026-06 · Sample');
  writeFileSync(outPath, await out.save({ useObjectStreams: true }));
  return take;
}

console.log('=== Terra Nova 2026-06 신간 보안 PDF 생성 ===\n');

const results = [];

for (const level of levels) {
  const distDir = join(root, 'dist', `2026-06-${level}`);
  const srcPath = join(distDir, `2026-06-${level}.pdf`);

  if (!existsSync(srcPath)) {
    console.log(`[${level}] SKIP: ${srcPath} 없음\n`);
    continue;
  }

  const tmpSamplePlain = join(tmpDir, `2026-06-${level}-sample-plain.pdf`);
  const outProtected = join(distDir, `2026-06-${level}-protected.pdf`);
  const outSample = join(distDir, `2026-06-${level}-sample.pdf`);

  console.log(`[${level}]`);

  // 1. 샘플 plain (12p) 추출
  const samplePages = await makeSamplePlain(srcPath, tmpSamplePlain, SAMPLE_PAGES);
  console.log(`  1/3 sample plain ${samplePages}p 추출 → tmp`);

  // 2. fullbook protected (인쇄만 허용)
  const fullPages = protectPdf(srcPath, outProtected, {
    ownerPassword: OWNER_PW, allowPrint: true
  });
  const fullSize = (readFileSync(outProtected).length / 1024 / 1024).toFixed(1);
  console.log(`  2/3 protected ${fullPages}p (인쇄 ✓ / 복사 ✗ / 편집 ✗): ${outProtected.replace(root + '/', '').replace(/\\/g, '/')} (${fullSize}MB)`);

  // 3. sample protected (전부 차단)
  const sampProtectedPages = protectPdf(tmpSamplePlain, outSample, {
    ownerPassword: OWNER_PW, allowPrint: false
  });
  const sampSize = (readFileSync(outSample).length / 1024 / 1024).toFixed(1);
  console.log(`  3/3 sample ${sampProtectedPages}p (전부 차단): ${outSample.replace(root + '/', '').replace(/\\/g, '/')} (${sampSize}MB)\n`);

  results.push({ level, fullPages, samplePages: sampProtectedPages, fullSize, sampSize });
}

console.log('=== Summary ===');
console.log('| Level   | Protected | Sample | Protected MB | Sample MB |');
console.log('|---------|-----------|--------|--------------|-----------|');
for (const r of results) {
  console.log(
    `| ${r.level.padEnd(7)} | ${String(r.fullPages).padEnd(9)} | ${String(r.samplePages).padEnd(6)} | ` +
    `${r.fullSize.padEnd(12)} | ${r.sampSize.padEnd(9)} |`
  );
}
console.log(`\nOwner password: ${OWNER_PW.replace(/./g, c => /[a-z0-9]/.test(c) ? '*' : c)}  (env TN_PDF_OWNER_PW)`);
