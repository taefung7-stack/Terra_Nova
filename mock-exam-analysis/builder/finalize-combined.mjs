#!/usr/bin/env node
/* 합본 최종화: 표지(벡터 PDF) + 본문분석(고해상도 image) 병합 + 압축.
 * 한글 파일명 gs 접근 문제 회피 위해 ASCII 임시명 사용.
 *
 * 사용: node builder/finalize-combined.mjs <dist-dir> <cover.pdf> <combined.pdf-경로(이미 생성됨)> <out.pdf>
 *  - combined.pdf 는 pdf-image.mjs 로 이미 만든 본문 합본(표지 없음)
 *  - cover.pdf 를 맨 앞에 붙이고 gs 로 150dpi 압축
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const [distDir, coverPath, combinedPath, outName] = process.argv.slice(2);
if (!distDir || !coverPath || !combinedPath || !outName) {
  console.error('Usage: finalize-combined.mjs <dist> <cover.pdf> <combined.pdf> <out.pdf>');
  process.exit(1);
}
const dist = path.resolve(process.cwd(), distDir);
const cover = path.resolve(process.cwd(), coverPath);
const combined = path.resolve(process.cwd(), combinedPath);

// ASCII 임시 파일로 복사 (gs 한글경로 회피)
const tmpCover = path.join(dist, '_cover.pdf');
const tmpBody = path.join(dist, '_body.pdf');
const tmpOut = path.join(dist, '_merged.pdf');
fs.copyFileSync(cover, tmpCover);
fs.copyFileSync(combined, tmpBody);

const gs = 'gswin64c';
// 병합 + 150dpi 압축(텍스트 선명도↑), 표지 벡터 보존
execFileSync(gs, [
  '-sDEVICE=pdfwrite', '-dCompatibilityLevel=1.5',
  '-dColorConversionStrategy=/LeaveColorUnchanged',
  '-dDownsampleColorImages=true', '-dColorImageResolution=150', '-dColorImageDownsampleType=/Bicubic',
  '-dDownsampleGrayImages=true', '-dGrayImageResolution=150',
  '-dDetectDuplicateImages=true', '-dCompressFonts=true', '-dSubsetFonts=true',
  '-dNOPAUSE', '-dBATCH', '-dQUIET',
  '-sOutputFile=' + tmpOut, tmpCover, tmpBody,
], { stdio: 'inherit' });

const outAbs = path.join(dist, outName);
fs.renameSync(tmpOut, outAbs);
fs.unlinkSync(tmpCover); fs.unlinkSync(tmpBody);
const mb = (fs.statSync(outAbs).size / 1024 / 1024).toFixed(1);
console.log('표지+본문 병합 완료: ' + outName + ' (' + mb + ' MB)');
