#!/usr/bin/env node
/**
 * 2026-07 중등(Terra 중1 / Neptune 중2 / Uranus 중3) 판매용 보안 PDF 생성.
 * 참조: tools/_protect-2026-07-elemid.mjs (압축 파라미터·보안 흐름 동일).
 *
 * 입력 : dist/2026-07/2026-07-{Level} (학년)/2026-07-{Level}.pdf   (finalize 완성본 160p, raw ~140MB)
 * 출력 :
 *   - 2026-07-{Level}-fullbook.pdf  (압축 + 보호[print only], <50MB)  ← 판매본
 *   - 2026-07-{Level}-sample.pdf    (샘플 10p + 보호[전부 차단])       ← 무료 샘플
 *
 * 압축: gs 이미지만 170dpi DCT, -dColorConversionStrategy=/LeaveColorUnchanged (텍스트 보존).
 *
 * 샘플 구성(사용자 지시 2026-07-17: "Day1~Day2 이틀치까지"):
 *   중등 완성본 페이지 순서 = 앞표지(0) · 백지(1) · 판권(2) · 백지(3) ·
 *     본문[ 목차1(4) 목차2(5) WEEK01(6) 주간지문목록(7) ·
 *           Day1 PASSAGE(8) PRACTICE(9) GRAMMAR(10) VOCAB(11) ·
 *           Day2 PASSAGE(12) PRACTICE(13) GRAMMAR(14) VOCAB(15) · Day3… ]
 *   → 샘플 = 앞표지(0) + 판권(2) + 본문 12p(4..15) = 14p.  (백지 1,3 제외, Day1+Day2 각 4p 온전 포함)
 *   Day2 VOCAB(idx 15)의 인쇄 folio 는 "12"(WEEK1·TUESDAY) — 이틀치 마지막.
 *
 * 보안: fullbook print-only(flag 4) / sample 전부차단(flag 0), owner PW = TN_PDF_OWNER_PW.
 *
 * 사용: TN_PDF_OWNER_PW=... node tools/_protect-2026-07-midschool.mjs [--levels terra,neptune,uranus]
 */
import muhammara from 'muhammara';
import { PDFDocument } from 'pdf-lib';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const MONTH = '2026-07';
const DPI = 170;
const GS = process.platform === 'win32' ? 'gswin64c' : 'gs';

const ALL = [
  { level: 'Terra',   dir: '2026-07-Terra (중1)'   },
  { level: 'Neptune', dir: '2026-07-Neptune (중2)' },
  { level: 'Uranus',  dir: '2026-07-Uranus (중3)'  },
];
const _arg = process.argv.find(a => a.startsWith('--levels='))?.split('=')[1]
  || (process.argv.includes('--levels') ? process.argv[process.argv.indexOf('--levels') + 1] : '');
const _want = _arg ? _arg.split(',').map(s => s.trim().toLowerCase()) : null;
const BOOKS = _want ? ALL.filter(b => _want.includes(b.level.toLowerCase())) : ALL;

// 앞표지(0)+판권(2)+본문 12p(4..15) = 14p. Day1+Day2 각 4p(PASSAGE·PRACTICE·GRAMMAR·VOCAB) 온전 포함.
const SAMPLE_INDICES = [0, 2, ...Array.from({ length: 12 }, (_, i) => 4 + i)];
const OWNER_PW = process.env.TN_PDF_OWNER_PW || 'tn-2026-owner-DO-NOT-SHARE-9f4a2c';
if (!process.env.TN_PDF_OWNER_PW) console.warn('⚠  TN_PDF_OWNER_PW 미설정 — 기본값 사용(운영 일관성).');

const mb = p => (statSync(p).size / 1024 / 1024).toFixed(1);

function compress(src, out) {
  execFileSync(GS, [
    '-sDEVICE=pdfwrite', '-dCompatibilityLevel=1.7', '-dNOPAUSE', '-dQUIET', '-dBATCH',
    '-dDownsampleColorImages=true', `-dColorImageResolution=${DPI}`, '-dColorImageDownsampleType=/Bicubic',
    '-dDownsampleGrayImages=true', `-dGrayImageResolution=${DPI}`, '-dGrayImageDownsampleType=/Bicubic',
    '-dAutoFilterColorImages=false', '-dColorImageFilter=/DCTEncode',
    '-dAutoFilterGrayImages=false', '-dGrayImageFilter=/DCTEncode',
    '-dEncodeColorImages=true', '-dEncodeGrayImages=true',
    '-dColorConversionStrategy=/LeaveColorUnchanged',
    '-dPreserveOverprintSettings=true', '-dPreserveHalftoneInfo=true',
    '-dAutoRotatePages=/None', '-dDetectDuplicateImages=true',
    `-sOutputFile=${out}`, src,
  ], { stdio: ['ignore', 'ignore', 'inherit'] });
}

function protect(src, out, allowPrint) {
  const w = muhammara.createWriter(out, { userPassword: '', ownerPassword: OWNER_PW, userProtectionFlag: allowPrint ? 4 : 0 });
  const c = w.createPDFCopyingContext(src);
  const n = c.getSourceDocumentParser().getPagesCount();
  for (let i = 0; i < n; i++) c.appendPDFPageFromPDF(i);
  w.end();
  return n;
}

for (const b of BOOKS) {
  const distDir = resolve(root, 'dist', MONTH, b.dir);
  const srcPath = join(distDir, `${MONTH}-${b.level}.pdf`);
  const outFull = join(distDir, `${MONTH}-${b.level}-fullbook.pdf`);
  const outSample = join(distDir, `${MONTH}-${b.level}-sample.pdf`);
  const tmpDir = join(root, 'dist', `_protect-${b.level.toLowerCase()}-tmp`);
  mkdirSync(tmpDir, { recursive: true });

  if (!existsSync(srcPath)) { console.error(`[${b.level}] 입력 없음: ${srcPath}`); continue; }
  console.log(`\n=== ${MONTH} ${b.level} 보안 PDF ===`);

  const tmpC = join(tmpDir, 'c.pdf');
  console.log(`[1/4] 압축: ${mb(srcPath)}MB → ...`);
  compress(srcPath, tmpC);
  console.log(`      압축본 ${mb(tmpC)}MB`);

  const fp = protect(tmpC, outFull, true);
  console.log(`[2/4] fullbook 보호(print only) ${fp}p, ${mb(outFull)}MB`);

  const cdoc = await PDFDocument.load(readFileSync(tmpC), { ignoreEncryption: true });
  const total = cdoc.getPageCount();
  const sdoc = await PDFDocument.create();
  const idx = SAMPLE_INDICES.filter(i => i < total);
  (await sdoc.copyPages(cdoc, idx)).forEach(p => sdoc.addPage(p));
  sdoc.setTitle(`Terra Nova ${MONTH} ${b.level} Sample`);
  sdoc.setAuthor('Terra Nova English'); sdoc.setProducer('Terra Nova English'); sdoc.setCreator('Terra Nova Build Pipeline');
  const tmpS = join(tmpDir, 's.pdf');
  writeFileSync(tmpS, await sdoc.save({ useObjectStreams: false }));
  console.log(`[3/4] 샘플 추출 ${idx.length}p (idx ${idx.join(',')})`);

  const sp = protect(tmpS, outSample, false);
  console.log(`[4/4] sample 보호(전부 차단) ${sp}p, ${mb(outSample)}MB`);
  try { rmSync(tmpDir, { recursive: true, force: true }); } catch { /* OneDrive lock — 무해, tmp 잔여만 남음 */ }
  console.log(`✓ ${b.level}: fullbook ${fp}p(${mb(outFull)}MB) | sample ${sp}p(${mb(outSample)}MB)`);

  const over = [['fullbook', outFull], ['sample', outSample]].filter(([, p]) => Number(mb(p)) >= 50);
  if (over.length) console.error(`  ❌ 50MB 초과: ${over.map(([n]) => n).join(',')}`);
}
console.log('\n완료. 다음: textbook-pdfs/2026-07/ + sample-pdfs/2026-07/ 업로드.');
