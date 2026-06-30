#!/usr/bin/env node
/**
 * 2026-07 Mars(초5) 판매용 보안 PDF 생성.
 *
 * 입력 : dist/2026-07/2026-07-Mars (초5)/2026-07-Mars-final.pdf
 *          (138p 완성본: 앞표지+백지+판권+백지+본문+백지+뒷표지, 미암호화, ~90MB)
 * 출력 :
 *   - 2026-07-Mars-fullbook.pdf  (압축 + 보호[print only], <50MB)   ← 판매본(textbook-pdfs 업로드)
 *   - 2026-07-Mars-sample.pdf    (샘플 + 보호[전부 차단])            ← 무료 샘플(sample-pdfs 업로드)
 *
 * 압축: ghostscript 이미지만 170dpi DCT(JPEG) 재인코딩.
 *   ⚠️ -dColorConversionStrategy=/LeaveColorUnchanged 필수(텍스트 보존).
 * 샘플 페이지: 고등 7월과 동일 인덱스 — [0(앞표지), 2(판권), 4..13(본문 첫 10p)].
 *   (백지 idx 1,3 은 제외해 12p 샘플)
 *
 * 보안(muhammara, owner password 잠금, user password 없음):
 *   fullbook userProtectionFlag 4 = print only / sample 0 = 전부 차단.
 * Owner PW: 다른 교재(고등 7월 등)와 동일 값을 TN_PDF_OWNER_PW 로 주입(미설정 시 6월 기본값).
 *
 * 사용: TN_PDF_OWNER_PW=... node tools/_protect-2026-07-mars.mjs
 *   이후 업로드: SUPABASE_SERVICE_ROLE_KEY=... node tools/upload-protected-pdfs.mjs \
 *                  --month 2026-07 --levels Mars
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
const LEVEL = 'Mars';
const DIR = '2026-07-Mars (초5)';
const DPI = 170;

// 고등 7월과 동일: 앞표지(0) + 판권(2) + 본문 첫 10p(4..13). 백지(1,3) 제외 → 12p.
const SAMPLE_INDICES = [0, 2, ...Array.from({ length: 10 }, (_, i) => 4 + i)];

const OWNER_PW = process.env.TN_PDF_OWNER_PW || 'tn-2026-owner-DO-NOT-SHARE-9f4a2c';
if (!process.env.TN_PDF_OWNER_PW) {
  console.warn('⚠  TN_PDF_OWNER_PW 미설정 — 6월/고등7월과 동일한 기본값 사용(운영 일관성).');
}

const GS = process.platform === 'win32' ? 'gswin64c' : 'gs';

const distDir = resolve(root, 'dist', MONTH, DIR);
const srcPath = join(distDir, `${MONTH}-${LEVEL}-final.pdf`);
const outFull = join(distDir, `${MONTH}-${LEVEL}-fullbook.pdf`);
const outSample = join(distDir, `${MONTH}-${LEVEL}-sample.pdf`);
const tmpDir = join(root, 'dist', '_protect-mars-0707-tmp');
mkdirSync(tmpDir, { recursive: true });

const mb = p => (statSync(p).size / 1024 / 1024).toFixed(1);

if (!existsSync(srcPath)) { console.error(`입력 없음: ${srcPath}`); process.exit(1); }

function compress(src, out) {
  execFileSync(GS, [
    '-sDEVICE=pdfwrite', '-dCompatibilityLevel=1.7', '-dNOPAUSE', '-dQUIET', '-dBATCH',
    '-dDownsampleColorImages=true', `-dColorImageResolution=${DPI}`, '-dColorImageDownsampleType=/Bicubic',
    '-dDownsampleGrayImages=true', `-dGrayImageResolution=${DPI}`, '-dGrayImageDownsampleType=/Bicubic',
    '-dAutoFilterColorImages=false', '-dColorImageFilter=/DCTEncode',
    '-dAutoFilterGrayImages=false', '-dGrayImageFilter=/DCTEncode',
    '-dEncodeColorImages=true', '-dEncodeGrayImages=true',
    '-dColorConversionStrategy=/LeaveColorUnchanged', // ★ 텍스트 보존의 핵심
    '-dPreserveOverprintSettings=true', '-dPreserveHalftoneInfo=true',
    '-dAutoRotatePages=/None', '-dDetectDuplicateImages=true',
    `-sOutputFile=${out}`, src,
  ], { stdio: ['ignore', 'ignore', 'inherit'] });
}

function protect(src, out, allowPrint) {
  const w = muhammara.createWriter(out, {
    userPassword: '', ownerPassword: OWNER_PW, userProtectionFlag: allowPrint ? 4 : 0,
  });
  const c = w.createPDFCopyingContext(src);
  const n = c.getSourceDocumentParser().getPagesCount();
  for (let i = 0; i < n; i++) c.appendPDFPageFromPDF(i);
  w.end();
  return n;
}

console.log('=== 2026-07 Mars(초5) 보안 PDF 생성 ===\n');

// 1) 압축 (이미지만 170dpi DCT, 텍스트 보존)
const tmpCompressed = join(tmpDir, 'mars-compressed.pdf');
console.log(`[1/4] 압축 (gs, LeaveColorUnchanged): ${mb(srcPath)}MB → ...`);
compress(srcPath, tmpCompressed);
console.log(`      압축본 ${mb(tmpCompressed)}MB`);

// 2) 풀북 보호 (print only) — 압축본을 입력으로
const fullPages = protect(tmpCompressed, outFull, true);
console.log(`[2/4] fullbook 보호(print only) ${fullPages}p, ${mb(outFull)}MB → ${outFull}`);

// 3) 샘플 추출 (plain) — 압축본에서 지정 인덱스만
const cdoc = await PDFDocument.load(readFileSync(tmpCompressed), { ignoreEncryption: true });
const totalPages = cdoc.getPageCount();
const sampleDoc = await PDFDocument.create();
const indices = SAMPLE_INDICES.filter(i => i < totalPages);
const copied = await sampleDoc.copyPages(cdoc, indices);
copied.forEach(p => sampleDoc.addPage(p));
sampleDoc.setTitle(`Terra Nova ${MONTH} ${LEVEL} Sample`);
sampleDoc.setAuthor('Terra Nova English');
sampleDoc.setProducer('Terra Nova English');
sampleDoc.setCreator('Terra Nova Build Pipeline');
const tmpSample = join(tmpDir, 'mars-sample-plain.pdf');
// muhammara 호환: object-stream 끄기
writeFileSync(tmpSample, await sampleDoc.save({ useObjectStreams: false }));
console.log(`[3/4] 샘플 추출 ${indices.length}p (idx ${indices.join(',')})`);

// 4) 샘플 보호 (전부 차단)
const sampPages = protect(tmpSample, outSample, false);
console.log(`[4/4] sample 보호(전부 차단) ${sampPages}p, ${mb(outSample)}MB → ${outSample}`);

rmSync(tmpDir, { recursive: true, force: true });
console.log(`\n완료. fullbook ${fullPages}p(${mb(outFull)}MB) | sample ${sampPages}p(${mb(outSample)}MB)`);
console.log('업로드: SUPABASE_SERVICE_ROLE_KEY=... node tools/upload-protected-pdfs.mjs --month 2026-07 --levels Mars');
