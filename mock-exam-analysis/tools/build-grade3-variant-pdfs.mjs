#!/usr/bin/env node
/* 표지 없는 정식 판매본 생성 (2026-06-29):
 *   - 고3 분석지/워크북 (표지 아트 미보유 → 본문 합본만)
 *   - 고1·2·3 변형문제(variant-book) (표지 아트 미보유 → 본문만)
 *
 * 처리: ghostscript 로
 *   + PDF 1.4 호환(ObjStm 제거 → GoodNotes 백지 방지)
 *   + 이미지 150dpi 다운샘플 → 50MB 이하(특히 고3 분석지 원본 266MB)
 *
 * 한글 파일명 gs 접근 문제 회피: ASCII 임시파일로 복사 후 처리, 출력은 ASCII 임시명 → 최종 한글명 rename.
 *
 * 사용: node tools/build-grade3-variant-pdfs.mjs
 * 결과 검증: node tools/inspect-mock-pdfs.mjs (또는 산출물 크기/페이지 확인)
 */
import { execFileSync } from 'node:child_process';
import { copyFileSync, renameSync, rmSync, existsSync, statSync, mkdtempSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..'); // mock-exam-analysis/
const GS = 'gswin64c';

// 표지 없이 본문(body)만 정식본으로 가공. cover 항목 없음.
const JOBS = [
  { desc: '고3 분석지', body: '2026-june-grade3/dist/2026-6월-고3-영어-분석지-합본.pdf', out: '2026-june-grade3/dist/2026-6월-고3-영어-분석지-합본-정식.pdf' },
  { desc: '고3 워크북', body: '2026-june-grade3/dist/2026-6월-고3-영어-워크북-합본.pdf', out: '2026-june-grade3/dist/2026-6월-고3-영어-워크북-합본-정식.pdf' },
  { desc: '고1 변형문제', body: '2026-june-grade1/dist/variant-book.pdf', out: '2026-june-grade1/dist/2026-6월-고1-영어-변형문제-정식.pdf' },
  { desc: '고2 변형문제', body: '2026-june-grade2/dist/variant-book.pdf', out: '2026-june-grade2/dist/2026-6월-고2-영어-변형문제-정식.pdf' },
  { desc: '고3 변형문제', body: '2026-june-grade3/dist/variant-book.pdf', out: '2026-june-grade3/dist/2026-6월-고3-영어-변형문제-정식.pdf' },
];

const tmp = mkdtempSync(join(tmpdir(), 'g3var-'));
let ok = 0, fail = 0;

for (const j of JOBS) {
  const bodyAbs = resolve(root, j.body);
  if (!existsSync(bodyAbs)) { console.error(`✗ ${j.desc}: 본문 없음 — ${j.body}`); fail++; continue; }

  const tBody = join(tmp, 'body.pdf');
  const tOut  = join(tmp, 'out.pdf');
  copyFileSync(bodyAbs, tBody);

  // 소프트마스크 평탄화(GoodNotes 호환) + 150dpi 이미지 압축. 텍스트/벡터는 보존.
  execFileSync(GS, [
    '-sDEVICE=pdfwrite',
    // ★ 1.5 필수 — 굿노트 백지의 원인인 투명 소프트마스크(/S /Luminosity)는
    //   gs 가 1.5 에서만 평탄화한다. 1.4 는 그대로 통과시켜 백지가 재발한다.
    '-dCompatibilityLevel=1.5',
    '-dColorConversionStrategy=/LeaveColorUnchanged',
    '-dAutoRotatePages=/None',
    '-dDownsampleColorImages=true', '-dColorImageResolution=150', '-dColorImageDownsampleType=/Bicubic',
    '-dDownsampleGrayImages=true', '-dGrayImageResolution=150',
    '-dDetectDuplicateImages=true', '-dCompressFonts=true', '-dSubsetFonts=true',
    '-dNOPAUSE', '-dBATCH', '-dQUIET',
    '-sOutputFile=' + tOut, tBody,
  ], { stdio: 'inherit' });

  const outAbs = resolve(root, j.out);
  if (existsSync(outAbs)) rmSync(outAbs);
  renameSync(tOut, outAbs);
  const mb = (statSync(outAbs).size / 1024 / 1024).toFixed(1);
  const warn = mb > 50 ? '  ⚠️ 50MB 초과 — 추가 압축 필요!' : '';
  console.log(`✓ ${j.desc}: → ${j.out.split('/').pop()} (${mb}MB)${warn}`);
  ok++;
}

rmSync(tmp, { recursive: true, force: true });
console.log(`\n완료: 성공 ${ok} · 실패 ${fail}`);
process.exit(fail > 0 ? 1 : 0);
