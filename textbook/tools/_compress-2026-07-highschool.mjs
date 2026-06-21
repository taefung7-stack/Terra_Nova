#!/usr/bin/env node
/**
 * 2026-07 고등부(Saturn 고1 / Jupiter 고2 / Sun 고3) fullbook PDF 압축.
 *
 * 왜 필요한가:
 *   고등 7월호는 와이드 배너 삽화(16:5, 180mm 전폭)가 무손실로 다수 들어가
 *   합본이 176~192MB대 → Supabase 프로젝트 전역 업로드 제한(~50MB) 초과.
 *
 * 해결:
 *   ghostscript 로 이미지만 DCT(JPEG) 재인코딩. 본문은 텍스트라 손상 없음.
 *   ⚠️ 반드시 -dColorConversionStrategy=/LeaveColorUnchanged 사용.
 *     /ebook·/printer 프리셋은 색공간을 강제 변환하며 본문 텍스트를 뭉갬 — 금지.
 *     (메모리: project_terra_nova_elementary_pdf_compress)
 *
 * 입력/출력: dist/2026-07/2026-07-{Level} (학년)/2026-07-{Level}-fullbook.pdf  (in-place 교체)
 *   - 압축본은 임시파일로 만든 뒤, 페이지수(134p)·크기(<50MB) 검증 후 원본 교체.
 *   - 보안/업로드는 이후 단계(C). 여기서는 압축만.
 *
 * 사용: node tools/_compress-2026-07-highschool.mjs           (전부)
 *        node tools/_compress-2026-07-highschool.mjs --dpi 150 (DPI 조정)
 */
import { execFileSync } from 'node:child_process';
import { statSync, existsSync, mkdirSync, rmSync, renameSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { PDFDocument } from 'pdf-lib';
import { readFileSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const MONTH = '2026-07';
const LEVELS = [
  { level: 'Saturn', dir: '2026-07-Saturn (고1)' },
  { level: 'Jupiter', dir: '2026-07-Jupiter (고2)' },
  { level: 'Sun', dir: '2026-07-Sun (고3)' },
];
const EXPECT_PAGES = 134;
const LIMIT_MB = 50;

const { values } = parseArgs({ options: { dpi: { type: 'string', default: '170' } } });
const DPI = Number(values.dpi);
const GS = process.env.GS_BIN || 'gswin64c';

const tmpDir = join(root, 'dist', '_compress-tmp');
if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

function gsCompress(src, out, dpi) {
  execFileSync(GS, [
    '-sDEVICE=pdfwrite', '-dCompatibilityLevel=1.7', '-dNOPAUSE', '-dQUIET', '-dBATCH',
    '-dDownsampleColorImages=true', `-dColorImageResolution=${dpi}`, '-dColorImageDownsampleType=/Bicubic',
    '-dDownsampleGrayImages=true', `-dGrayImageResolution=${dpi}`, '-dGrayImageDownsampleType=/Bicubic',
    '-dAutoFilterColorImages=false', '-dColorImageFilter=/DCTEncode',
    '-dAutoFilterGrayImages=false', '-dGrayImageFilter=/DCTEncode',
    '-dEncodeColorImages=true', '-dEncodeGrayImages=true',
    '-dColorConversionStrategy=/LeaveColorUnchanged', // ★ 텍스트 보존의 핵심
    '-dPreserveOverprintSettings=true', '-dPreserveHalftoneInfo=true',
    '-dAutoRotatePages=/None', '-dDetectDuplicateImages=true',
    `-sOutputFile=${out}`, src,
  ], { stdio: ['ignore', 'ignore', 'inherit'] });
}

async function pageCount(p) {
  const doc = await PDFDocument.load(readFileSync(p), { ignoreEncryption: true });
  return doc.getPageCount();
}

const mb = (p) => (statSync(p).size / 1024 / 1024);

console.log(`=== 2026-07 고등부 fullbook 압축 (DPI=${DPI}, 목표 <${LIMIT_MB}MB) ===\n`);
let allOk = true;
for (const { level, dir } of LEVELS) {
  const full = join(root, 'dist', MONTH, dir, `${MONTH}-${level}-fullbook.pdf`);
  if (!existsSync(full)) { console.log(`[${level}] SKIP: ${full} 없음`); allOk = false; continue; }
  const before = mb(full);
  const tmp = join(tmpDir, `${level.toLowerCase()}-c.pdf`);
  gsCompress(full, tmp, DPI);
  const after = mb(tmp);
  const pages = await pageCount(tmp);
  const okPages = pages === EXPECT_PAGES;
  const okSize = after < LIMIT_MB;
  if (okPages && okSize) {
    renameSync(tmp, full); // in-place 교체
    console.log(`[${level}] ${before.toFixed(1)}MB → ${after.toFixed(1)}MB  (${pages}p) ✅`);
  } else {
    allOk = false;
    console.log(`[${level}] ${before.toFixed(1)}MB → ${after.toFixed(1)}MB  (${pages}p) ❌ ` +
      `${!okPages ? `페이지 ${pages}≠${EXPECT_PAGES} ` : ''}${!okSize ? `크기 ${after.toFixed(1)}≥${LIMIT_MB}MB` : ''}` +
      `  — 원본 유지(교체 안 함), 임시파일: ${tmp}`);
  }
}
if (allOk) rmSync(tmpDir, { recursive: true, force: true });
console.log(`\n${allOk ? '완료. 3종 모두 <50MB 압축 + 134p 보존.' : '일부 실패 — 위 메시지 확인(DPI 낮춰 재시도 가능).'}`);
process.exit(allOk ? 0 : 1);
