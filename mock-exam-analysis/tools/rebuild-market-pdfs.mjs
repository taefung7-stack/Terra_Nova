#!/usr/bin/env node
/* market 판매본 4종 재생성:
 *   [벡터 표지 1p] + [본문 합본 전체]  →  ghostscript 병합
 *   + 투명 소프트마스크 평탄화(CompatibilityLevel 1.5 → GoodNotes 백지 방지)
 *   + 50MB 이하 유지(이미지 150dpi, 표지는 벡터라 선명)
 *
 * 한글 파일명 gs 접근 문제 회피: 각 입력을 ASCII 임시파일로 복사 후 병합.
 * 출력은 ASCII 임시명으로 만든 뒤 최종 한글명으로 rename.
 *
 * 사용: node tools/rebuild-market-pdfs.mjs
 */
import { execFileSync } from 'node:child_process';
import { copyFileSync, renameSync, rmSync, existsSync, statSync, mkdtempSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..'); // mock-exam-analysis/
const GS = 'gswin64c';

// 표지(cover) + 본문(body) + 최종 출력명
const JOBS = [
  {
    desc: '고1 분석지',
    cover: '2026-june-grade1/dist/assets/26년 6월 1학년 모의고사.pdf',
    body:  '2026-june-grade1/dist/2026-6월-고1-영어-분석지-합본.pdf',
    out:   '2026-june-grade1/dist/2026-6월-고1-영어-분석지-합본-표지포함.pdf',
  },
  {
    desc: '고1 워크북',
    cover: '2026-june-grade1/dist/assets/26년 6월 1학년 모의고사 워크북.pdf',
    body:  '2026-june-grade1/dist/2026-6월-고1-영어-워크북-합본.pdf',
    out:   '2026-june-grade1/dist/2026-6월-고1-영어-워크북-합본-표지포함.pdf',
  },
  {
    desc: '고2 분석지',
    cover: '2026-june-grade2/dist/assets/26년 6월 2학년 모의고사.pdf',
    body:  '2026-june-grade2/dist/2026-6월-고2-영어-분석지-합본.pdf',
    out:   '2026-june-grade2/dist/2026-6월-고2-영어-분석지-합본-표지포함.pdf',
  },
  {
    desc: '고2 워크북',
    cover: '2026-june-grade2/dist/assets/26년 6월 2학년 모의고사 워크북.pdf',
    body:  '2026-june-grade2/dist/2026-6월-고2-영어-워크북-합본.pdf',
    out:   '2026-june-grade2/dist/2026-6월-고2-영어-워크북-합본-표지포함.pdf',
  },
];

const tmp = mkdtempSync(join(tmpdir(), 'mktpdf-'));

for (const j of JOBS) {
  const coverAbs = resolve(root, j.cover);
  const bodyAbs  = resolve(root, j.body);
  if (!existsSync(coverAbs)) { console.error(`✗ ${j.desc}: 표지 없음 — ${j.cover}`); continue; }
  if (!existsSync(bodyAbs))  { console.error(`✗ ${j.desc}: 본문 없음 — ${j.body}`); continue; }

  const tCover = join(tmp, 'cover.pdf');
  const tBody  = join(tmp, 'body.pdf');
  const tOut   = join(tmp, 'out.pdf');
  copyFileSync(coverAbs, tCover);
  copyFileSync(bodyAbs, tBody);

  // 표지+본문 병합 + 소프트마스크 평탄화(GoodNotes 호환) + 150dpi 이미지 압축
  execFileSync(GS, [
    '-sDEVICE=pdfwrite',
    // ★ 1.5 필수 — GoodNotes 백지의 진짜 원인은 ObjStm 이 아니라
    //   Chrome 이 형광펜(linear-gradient)·box-shadow 를 뽑은 투명 소프트마스크
    //   (/SMask <</S /Luminosity>>) 다. 굿노트 PDFKit 은 한 페이지에 이게 수십 개
    //   쌓이면 합성에 실패해 페이지를 통째로 비운다(에러 없음).
    //   gs 는 1.5 에서만 이 마스크를 평탄화한다. 1.4 로 되돌리면 마스크가 그대로
    //   남아(고1 506·고2 530·고3 590개 실측) 다시 백지가 된다. 낮추지 말 것.
    '-dCompatibilityLevel=1.5',
    '-dColorConversionStrategy=/LeaveColorUnchanged',
    '-dAutoRotatePages=/None',
    '-dDownsampleColorImages=true', '-dColorImageResolution=150', '-dColorImageDownsampleType=/Bicubic',
    '-dDownsampleGrayImages=true', '-dGrayImageResolution=150',
    '-dDetectDuplicateImages=true', '-dCompressFonts=true', '-dSubsetFonts=true',
    '-dNOPAUSE', '-dBATCH', '-dQUIET',
    '-sOutputFile=' + tOut, tCover, tBody,
  ], { stdio: 'inherit' });

  const outAbs = resolve(root, j.out);
  if (existsSync(outAbs)) rmSync(outAbs);
  renameSync(tOut, outAbs);
  const mb = (statSync(outAbs).size / 1024 / 1024).toFixed(1);
  const warn = mb > 50 ? '  ⚠️ 50MB 초과!' : '';
  console.log(`✓ ${j.desc}: 표지+본문 병합 → ${j.out.split('/').pop()} (${mb}MB)${warn}`);
}

rmSync(tmp, { recursive: true, force: true });
console.log('\n완료. 다음: node tools/inspect-market-pdfs.mjs 로 검증 후 업로드.');
