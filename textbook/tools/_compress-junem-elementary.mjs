#!/usr/bin/env node
/**
 * 2026-06 초등부(Mars / Venus) fullbook PDF 압축 → 보안 재적용.
 *
 * 왜 필요한가:
 *   초등 교재는 와이드 배너 삽화(1721x623)가 FlateDecode 무손실로 다수 들어가
 *   합본이 90~100MB대 → Supabase 프로젝트 전역 업로드 제한(~50MB) 초과.
 *   고등/중등(22~36MB)과 달리 업로드 실패함.
 *
 * 해결:
 *   ghostscript 로 이미지만 170dpi DCT(JPEG) 재인코딩.
 *   ⚠️ 반드시 -dColorConversionStrategy=/LeaveColorUnchanged 사용.
 *     /ebook·/printer 프리셋은 색공간을 강제 변환하며 보라색 그라데이션
 *     배경 위 본문 텍스트를 뭉개버림(검증 시 본문이 안 보였음). 색변환을
 *     끄면 텍스트·삽화 모두 원본과 동일하게 선명하면서 100MB→~28MB.
 *
 * 입력:  dist/2026-06-{Level}/2026-06-{Level}.pdf            (합본 156p, 미암호화)
 * 출력:  dist/2026-06-{Level}/2026-06-{Level}-fullbook.pdf   (압축+보안, 인쇄만 허용, ~35MB)
 *
 * 사용: node tools/_compress-junem-elementary.mjs   (gswin64c 필요: scoop install ghostscript)
 *        이후 node tools/upload-protected-pdfs.mjs --month 2026-06 --levels Mars,Venus --only fullbook
 */
import muhammara from 'muhammara';
import { execFileSync } from 'node:child_process';
import { readFileSync, statSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const MONTH = '2026-06';
const LEVELS = ['Mars', 'Venus'];
const DPI = 170;

// Owner PW: 다른 보안 스크립트(build-protected.mjs 등)와 동일 값을 환경변수로 주입.
// 기본값 하드코딩 금지 — 미설정 시 그 스크립트들의 기존 기본값을 TN_PDF_OWNER_PW 로 export 후 실행.
const OWNER_PW = process.env.TN_PDF_OWNER_PW;
if (!OWNER_PW) {
  console.error('ERROR: TN_PDF_OWNER_PW 환경변수 필요 (다른 교재와 동일한 owner password).');
  process.exit(2);
}
const GS = process.env.GS_BIN || 'gswin64c';

const tmpDir = join(root, 'dist', '_compress-tmp');
if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

function gsCompress(src, out) {
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

function protect(src, out) {
  const w = muhammara.createWriter(out, { userPassword: '', ownerPassword: OWNER_PW, userProtectionFlag: 4 });
  const c = w.createPDFCopyingContext(src);
  const n = c.getSourceDocumentParser().getPagesCount();
  for (let i = 0; i < n; i++) c.appendPDFPageFromPDF(i);
  w.end();
  return n;
}

console.log('=== 2026-06 초등부 fullbook 압축 + 보안 ===\n');
for (const level of LEVELS) {
  const dir = join(root, 'dist', `${MONTH}-${level}`);
  const srcMerged = join(dir, `${MONTH}-${level}.pdf`);
  if (!existsSync(srcMerged)) { console.log(`[${level}] SKIP: ${srcMerged} 없음`); continue; }
  const tmpSafe = join(tmpDir, `${level.toLowerCase()}-safe.pdf`);
  const outFull = join(dir, `${MONTH}-${level}-fullbook.pdf`);

  const before = (statSync(srcMerged).size / 1024 / 1024).toFixed(1);
  gsCompress(srcMerged, tmpSafe);
  const mid = (statSync(tmpSafe).size / 1024 / 1024).toFixed(1);
  const n = protect(tmpSafe, outFull);
  const after = (statSync(outFull).size / 1024 / 1024).toFixed(1);
  console.log(`[${level}] ${before}MB → 압축 ${mid}MB → 보안 ${after}MB (${n}p, 인쇄✓/복사✗)`);
}
rmSync(tmpDir, { recursive: true, force: true });
console.log('\n완료. 업로드: node tools/upload-protected-pdfs.mjs --month 2026-06 --levels Mars,Venus --only fullbook');
