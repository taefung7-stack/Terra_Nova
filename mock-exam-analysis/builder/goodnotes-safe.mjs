#!/usr/bin/env node
/* ===================================================================
 * GoodNotes 안전화 (flatten) — 아이패드 굿노트 백지 현상 방지
 * ===================================================================
 * 증상: 굿노트에서 PDF 를 열면 페이지가 통째로 백지로 나온다.
 *
 * 원인: Chrome(Skia/PDF) 이 CSS box-shadow / linear-gradient(형광펜 .hl 등)
 *   을 **투명 소프트마스크(/SMask <</Type /Mask /S /Luminosity>>)** 로 뽑는다.
 *   굿노트의 PDFKit 렌더러는 한 페이지에 이 luminosity 마스크가 수십 개 쌓이면
 *   합성에 실패해 페이지 전체를 비워버린다(에러 없이 백지).
 *   → 원본은 정상 PDF. Acrobat·크롬·미리보기에서는 멀쩡히 보이므로 발견이 늦다.
 *
 * 판별: /SMask 개수가 0 이면 안전, 수십 개면 위험.
 *   node builder/goodnotes-safe.mjs --check <pdf...>
 *
 * 해결: ghostscript pdfwrite 로 다시 쓰면 소프트마스크가 **평탄화(flatten)** 되어
 *   /SMask 가 0 이 된다. 겉모습은 동일, 용량도 크게 줄어든다(10.5MB→1.0MB 실측).
 *   이미 이 처리를 거친 EX/EX2 합본(%PDF-1.5, ObjStm)은 굿노트에서 정상 동작 중.
 *
 * 사용:
 *   node builder/goodnotes-safe.mjs <pdf...>          # 제자리 변환
 *   node builder/goodnotes-safe.mjs --check <pdf...>  # 검사만
 * =================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';

const GS = process.platform === 'win32' ? 'gswin64c' : 'gs';

/** 굿노트 백지를 일으키는 **루미노시티** 소프트마스크 개수. 0 이어야 안전.
 *  ※ `/SMask` 총개수를 세면 안 된다 — PNG 알파 채널도 같은 키를 쓰므로 오탐한다.
 *     (변형문제 판매본의 /SMask 16~21개는 전부 이미지 알파라 백지와 무관하고,
 *      gs 어떤 모드로도 사라지지 않는다.) 백지의 원인은 /S /Luminosity 뿐이다. */
export function countSMasks(file) {
  const buf = fs.readFileSync(file).toString('latin1');
  return (buf.match(/\/S\s*\/Luminosity/g) || []).length;
}

/** ghostscript 로 소프트마스크를 평탄화한다. 한글 경로를 피해 임시 ASCII 명 사용. */
export function flatten(file) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gn-'));
  const inp = path.join(tmp, 'in.pdf');
  const out = path.join(tmp, 'out.pdf');
  fs.copyFileSync(file, inp);
  execFileSync(GS, [
    // ★ 1.5 필수 — gs 는 루미노시티 마스크를 1.5 에서만 평탄화한다.
    //   1.4 로 낮추면 마스크가 그대로 남아 굿노트 백지가 재발한다(실측 확인).
    '-sDEVICE=pdfwrite', '-dCompatibilityLevel=1.5',
    '-dColorConversionStrategy=/LeaveColorUnchanged',
    '-dDownsampleColorImages=true', '-dColorImageResolution=150',
    '-dColorImageDownsampleType=/Bicubic',
    '-dDownsampleGrayImages=true', '-dGrayImageResolution=150',
    '-dDetectDuplicateImages=true', '-dCompressFonts=true', '-dSubsetFonts=true',
    '-dNOPAUSE', '-dBATCH', '-dQUIET',
    '-sOutputFile=' + out, inp,
  ], { stdio: 'inherit' });
  fs.copyFileSync(out, file);
  fs.rmSync(tmp, { recursive: true, force: true });
}

/** 페이지 수 — 평탄화 전후가 같아야 한다(유실 방지 가드).
 *  gs 의 -dSAFER 가 -c 안의 file 접근을 막고(invalidfileaccess),
 *  압축 XRef(ObjStm) PDF 는 /Type/Page 가 스트림 안이라 grep 도 안 통한다.
 *  → bbox 디바이스로 전 페이지를 훑고 %%BoundingBox 줄 수를 센다(stderr 로 나옴). */
function pageCount(file) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gnc-'));
  const cp = path.join(tmp, 'c.pdf');
  fs.copyFileSync(file, cp);
  try {
    const r = spawnSync(GS, ['-q', '-dNOPAUSE', '-dBATCH', '-sDEVICE=bbox', cp],
      { encoding: 'utf8' });
    const t = (r.stdout || '') + (r.stderr || '');
    const n = (t.match(/^%%BoundingBox/gm) || []).length;
    if (!n) throw new Error('페이지 수를 셀 수 없음: ' + file);
    return n;
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

const args = process.argv.slice(2);
const checkOnly = args[0] === '--check';
const files = (checkOnly ? args.slice(1) : args).filter(f => f.toLowerCase().endsWith('.pdf'));
if (!files.length) {
  console.error('사용: node builder/goodnotes-safe.mjs [--check] <pdf...>');
  process.exit(2);
}

let risky = 0;
for (const f of files) {
  const before = countSMasks(f);
  const name = path.basename(f);
  if (before === 0) { console.log(`  OK    ${name}`); continue; }
  risky++;
  if (checkOnly) { console.log(`  위험  ${name}  (루미노시티 마스크 ${before}개 — 굿노트 백지)`); continue; }

  const pagesBefore = pageCount(f);
  const kbBefore = Math.round(fs.statSync(f).size / 1024);
  flatten(f);
  const after = countSMasks(f);
  const pagesAfter = pageCount(f);
  const kbAfter = Math.round(fs.statSync(f).size / 1024);
  if (pagesAfter !== pagesBefore) {
    console.error(`  ✖ ${name}: 페이지 수 변동 ${pagesBefore}→${pagesAfter} — 확인 필요!`);
    process.exitCode = 1;
    continue;
  }
  console.log(`  변환  ${name}  마스크 ${before}→${after}  ${kbBefore}KB→${kbAfter}KB  ${pagesAfter}p`);
}
if (checkOnly && risky) {
  console.log(`\n위험 파일 ${risky}개. 변환: node builder/goodnotes-safe.mjs <파일...>`);
  process.exitCode = 1;
}
