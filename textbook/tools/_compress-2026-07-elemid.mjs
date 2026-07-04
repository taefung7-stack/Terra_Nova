#!/usr/bin/env node
/* 2026-07 초등+중1 완성본 압축 (텍스트 보존, Supabase 50MB↓).
 * gs -dColorConversionStrategy=/LeaveColorUnchanged (프리셋 /ebook·/printer 금지 — 본문 텍스트 뭉갬).
 * execFileSync 로 gs 인자를 직접 넘겨 MSYS 경로 변환 회피. */
import { execFileSync } from 'node:child_process';
import { statSync, renameSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const D = join(root, 'dist', '2026-07');

const JOBS = [
  { in: join(D, '2026-07-Mars (초5)',  '2026-07-Mars.pdf'),  out: join(D, '2026-07-Mars (초5)',  '2026-07-Mars-final.pdf'),  label: 'Mars 초5' },
  { in: join(D, '2026-07-Venus (초6)', '2026-07-Venus.pdf'), out: join(D, '2026-07-Venus (초6)', '2026-07-Venus-final.pdf'), label: 'Venus 초6' },
  { in: join(D, '2026-07-Terra (중1)', '2026-07-Terra.pdf'), out: join(D, '2026-07-Terra (중1)', '2026-07-Terra-final.pdf'), label: 'Terra 중1' },
];

for (const j of JOBS) {
  if (!existsSync(j.in)) { console.log(`SKIP ${j.label}: 입력 없음 ${j.in}`); continue; }
  const tmp = j.out + '.tmp';
  execFileSync('gswin64c', [
    '-sDEVICE=pdfwrite',
    '-dCompatibilityLevel=1.4',
    '-dColorConversionStrategy=/LeaveColorUnchanged',
    '-dDownsampleColorImages=true', '-dColorImageResolution=170', '-dColorImageDownsampleType=/Bicubic',
    '-dDownsampleGrayImages=true', '-dGrayImageResolution=170',
    '-dDetectDuplicateImages=true', '-dCompressFonts=true', '-dSubsetFonts=true',
    '-dAutoRotatePages=/None', '-dNOPAUSE', '-dBATCH', '-dQUIET',
    '-sOutputFile=' + tmp, j.in,
  ], { stdio: 'inherit' });
  renameSync(tmp, j.out);
  const mb = (statSync(j.out).size / 1024 / 1024).toFixed(1);
  console.log(`${j.label}: ${mb}MB ${mb < 50 ? 'OK' : '⚠️ 50MB 초과 — 추가 압축 필요'}  → ${j.out.split(/[\\/]/).pop()}`);
}
console.log('압축 완료.');
