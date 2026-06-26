#!/usr/bin/env node
/**
 * 2026-07 고등부 finalize(표지+판권+백지+뒷표지 포함) PDF 압축.
 * _compress-2026-07-highschool.mjs 는 표지 없는 134p fullbook 만 다루므로,
 * 표지 합본된 최종본(2026-07-{Level}.pdf, 140/141p)을 같은 gs 플래그로 in-place 압축.
 * ★ -dColorConversionStrategy=/LeaveColorUnchanged (본문 텍스트 보존) 유지.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, statSync, renameSync, readFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { PDFDocument } from 'pdf-lib';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const MONTH = '2026-07';
const GS = process.platform === 'win32' ? 'gswin64c' : 'gs';
const { values } = parseArgs({ options: { dpi: { type: 'string', default: '170' } } });
const DPI = Number(values.dpi);
const LIMIT_MB = 50;

const BOOKS = [
  { dir: '2026-07-Saturn (고1)',  out: '2026-07-Saturn.pdf' },
  { dir: '2026-07-Jupiter (고2)', out: '2026-07-Jupiter.pdf' },
  { dir: '2026-07-Sun (고3)',     out: '2026-07-Sun.pdf' },
];

const tmpDir = join(root, 'dist', '_compress-final-tmp');
if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });
const mb = p => statSync(p).size / 1024 / 1024;
async function pageCount(p) { return (await PDFDocument.load(readFileSync(p), { ignoreEncryption: true })).getPageCount(); }

function gsCompress(src, out, dpi) {
  execFileSync(GS, [
    '-sDEVICE=pdfwrite', '-dCompatibilityLevel=1.7', '-dNOPAUSE', '-dQUIET', '-dBATCH',
    '-dDownsampleColorImages=true', `-dColorImageResolution=${dpi}`, '-dColorImageDownsampleType=/Bicubic',
    '-dDownsampleGrayImages=true', `-dGrayImageResolution=${dpi}`, '-dGrayImageDownsampleType=/Bicubic',
    '-dAutoFilterColorImages=false', '-dColorImageFilter=/DCTEncode',
    '-dAutoFilterGrayImages=false', '-dGrayImageFilter=/DCTEncode',
    '-dEncodeColorImages=true', '-dEncodeGrayImages=true',
    '-dColorConversionStrategy=/LeaveColorUnchanged',
    '-dPreserveOverprintSettings=true', '-dPreserveHalftoneInfo=true',
    '-dAutoRotatePages=/None', '-dDetectDuplicateImages=true',
    `-sOutputFile=${out}`, src,
  ], { stdio: ['ignore', 'ignore', 'inherit'] });
}

console.log(`=== 2026-07 고등부 최종본(표지포함) 압축 (DPI=${DPI}, 목표 <${LIMIT_MB}MB) ===\n`);
let allOk = true;
for (const { dir, out } of BOOKS) {
  const f = join(root, 'dist', MONTH, dir, out);
  if (!existsSync(f)) { console.log(`SKIP ${out} 없음`); allOk = false; continue; }
  const before = mb(f);
  const expectPages = await pageCount(f);
  const tmp = join(tmpDir, out);
  gsCompress(f, tmp, DPI);
  const after = mb(tmp);
  const pages = await pageCount(tmp);
  const okPages = pages === expectPages;
  const okSize = after < LIMIT_MB;
  if (okPages && okSize) {
    renameSync(tmp, f);
    console.log(`[${out}] ${before.toFixed(1)}MB → ${after.toFixed(1)}MB  (${pages}p) ✅`);
  } else {
    allOk = false;
    console.log(`[${out}] ${before.toFixed(1)}MB → ${after.toFixed(1)}MB  (${pages}p) ❌ ` +
      `${!okPages ? `페이지 ${pages}≠${expectPages} ` : ''}${!okSize ? `크기 ${after.toFixed(1)}≥${LIMIT_MB}MB` : ''} — 원본 유지`);
  }
}
if (allOk) rmSync(tmpDir, { recursive: true, force: true });
console.log(`\n${allOk ? '완료. 3종 모두 <50MB + 페이지 보존.' : '일부 실패 — DPI 낮춰 재시도 가능.'}`);
process.exit(allOk ? 0 : 1);
