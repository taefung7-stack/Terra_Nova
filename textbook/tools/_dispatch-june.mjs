#!/usr/bin/env node
/**
 * 6월호 신간 (Neptune / Uranus / Terra) 발송 one-shot 파이프라인.
 *
 * 직원이 목차/내용 작업한 PDF (dist/2026-06-{Level}/2026-06-{Level}.pdf) 가 준비된 후
 * 이 스크립트 한 번으로 보안 PDF 생성 + Storage 업로드까지 완료.
 *
 * 사전 조건:
 *   - dist/2026-06-{Level}/2026-06-{Level}.pdf : 직원 작업 완료된 합본 PDF (덮어쓰기됨)
 *   - TN_PDF_OWNER_PW : 강력한 owner 비밀번호 (env)
 *   - SUPABASE_SERVICE_ROLE_KEY : Supabase Storage 업로드용 (env)
 *
 * 사용법:
 *   $env:TN_PDF_OWNER_PW = "tn-2026-XXXXXX"
 *   $env:SUPABASE_SERVICE_ROLE_KEY = "eyJ..."
 *   node tools/_dispatch-june.mjs                       # Neptune / Uranus / Terra 전체
 *   node tools/_dispatch-june.mjs --levels Neptune      # 일부만
 *   node tools/_dispatch-june.mjs --dry-run             # 검증만, 업로드 X
 *
 * 산출물:
 *   dist/2026-06-{Level}/2026-06-{Level}-protected.pdf   (paid 배포용)
 *   dist/2026-06-{Level}/2026-06-{Level}-sample.pdf      (무료 샘플)
 *   Storage textbook-pdfs/2026-06/2026-06-{LEVEL}.pdf    (dispatch-monthly-pdf 가 읽음)
 *   Storage sample-pdfs/{level}.pdf                       (send-sample 이 읽음)
 *
 * 후속 자동화:
 *   - dispatch-monthly-pdf Edge Function: 결제자에게 즉시/정기 발송
 *   - send-sample Edge Function: 가입자/요청자에게 무료 샘플 발송
 */
import { createClient } from '@supabase/supabase-js';
import muhammara from 'muhammara';
import { PDFDocument } from 'pdf-lib';
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { execFileSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const { values } = parseArgs({
  options: {
    levels:   { type: 'string' },
    'dry-run': { type: 'boolean', default: false }
  }
});

const ALL_LEVELS = ['Neptune', 'Uranus', 'Terra'];
const levels = values.levels
  ? values.levels.split(',').map(s => s.trim())
  : ALL_LEVELS;
const dryRun = values['dry-run'];

const OWNER_PW = process.env.TN_PDF_OWNER_PW;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://betkydmxrnlhgmnprbca.supabase.co';

if (!OWNER_PW) {
  console.error('ERROR: TN_PDF_OWNER_PW 환경변수 필요');
  process.exit(2);
}
if (!dryRun && !SERVICE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY 환경변수 필요 (또는 --dry-run)');
  process.exit(2);
}

const MONTH = '2026-06';
const SAMPLE_PAGES = 12;
const BUCKET_FULL = 'textbook-pdfs';
const BUCKET_SAMPLE = 'sample-pdfs';

const tmpDir = join(root, 'dist', '_dispatch-tmp');
if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

function pageText(pdfPath, page) {
  try {
    return execFileSync('pdftotext', ['-layout', '-f', String(page), '-l', String(page), pdfPath, '-'], {
      encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
  } catch {
    return '';
  }
}

const ERROR_PATTERNS = [
  /Missing curriculum:/, /Missing data:/, /Failed to fetch/, /Cover render error:/, /Unknown mode:/
];

async function preflightCheck(level, srcPath) {
  const issues = [];
  const bytes = readFileSync(srcPath);
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const total = doc.getPageCount();
  if (total !== 136) issues.push(`expected 136p, got ${total}p`);

  // 1-page sample to confirm not all blank
  for (let i = 1; i <= total; i++) {
    const txt = pageText(srcPath, i);
    if (txt && ERROR_PATTERNS.some(p => p.test(txt))) {
      issues.push(`p${i}: 빌더 에러 누출 — "${txt.slice(0, 60).replace(/\n/g, ' ')}"`);
    }
  }
  return { level, total, issues };
}

function protectPdf(srcPath, outPath, { ownerPassword, allowPrint }) {
  const writer = muhammara.createWriter(outPath, {
    userPassword: '',
    ownerPassword,
    userProtectionFlag: allowPrint ? 4 : 0
  });
  const cpy = writer.createPDFCopyingContext(srcPath);
  const total = cpy.getSourceDocumentParser().getPagesCount();
  for (let i = 0; i < total; i++) cpy.appendPDFPageFromPDF(i);
  writer.end();
  return total;
}

async function makeSamplePlain(srcPath, outPath, limit) {
  const bytes = readFileSync(srcPath);
  const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const out = await PDFDocument.create();
  const take = Math.min(limit, src.getPageCount());
  const indices = Array.from({ length: take }, (_, i) => i);
  const copied = await out.copyPages(src, indices);
  copied.forEach(p => out.addPage(p));
  out.setTitle(`Terra Nova · 2026-06 Sample`);
  out.setSubject('Monthly English Textbook · 2026-06 · Sample');
  writeFileSync(outPath, await out.save({ useObjectStreams: true }));
  return take;
}

console.log('=== Terra Nova 2026-06 신간 발송 파이프라인 ===');
console.log(`모드: ${dryRun ? 'DRY-RUN (업로드 X)' : '실전 (Storage 업로드 ON)'}`);
console.log(`대상 레벨: ${levels.join(', ')}\n`);

// Preflight
const preflightResults = [];
for (const level of levels) {
  const srcPath = join(root, 'dist', `${MONTH}-${level}`, `${MONTH}-${level}.pdf`);
  if (!existsSync(srcPath)) {
    console.log(`[${level}] FAIL: ${srcPath} 없음`);
    process.exit(2);
  }
  const r = await preflightCheck(level, srcPath);
  preflightResults.push(r);
  console.log(`[${level}] preflight: ${r.total}p, issues=${r.issues.length}`);
  for (const i of r.issues.slice(0, 5)) console.log(`  ✗ ${i}`);
}

const totalIssues = preflightResults.reduce((sum, r) => sum + r.issues.length, 0);
if (totalIssues > 0) {
  console.log(`\n⚠  총 ${totalIssues}건의 이슈 발견. --dry-run 으로 다시 확인하거나 PDF 수정 후 재실행하세요.`);
  if (!dryRun) {
    console.log('실전 모드에서 발견된 이슈는 발송 중단 사유입니다.');
    process.exit(3);
  }
}

console.log('\n=== Protected PDF 생성 ===\n');

const dispatchResults = [];

for (const level of levels) {
  const distDir = join(root, 'dist', `${MONTH}-${level}`);
  const srcPath = join(distDir, `${MONTH}-${level}.pdf`);
  const tmpSamplePlain = join(tmpDir, `${MONTH}-${level}-sample-plain.pdf`);
  const outProtected = join(distDir, `${MONTH}-${level}-protected.pdf`);
  const outSample = join(distDir, `${MONTH}-${level}-sample.pdf`);

  const samplePages = await makeSamplePlain(srcPath, tmpSamplePlain, SAMPLE_PAGES);
  const fullPages = protectPdf(srcPath, outProtected, {
    ownerPassword: OWNER_PW, allowPrint: true
  });
  const sampProtected = protectPdf(tmpSamplePlain, outSample, {
    ownerPassword: OWNER_PW, allowPrint: false
  });

  const fullSize = (statSync(outProtected).size / 1024 / 1024).toFixed(1);
  const sampSize = (statSync(outSample).size / 1024 / 1024).toFixed(1);

  console.log(`[${level}] protected ${fullPages}p (${fullSize}MB) / sample ${sampProtected}p (${sampSize}MB)`);
  dispatchResults.push({ level, outProtected, outSample, fullPages, sampProtected });
}

if (dryRun) {
  console.log('\n--dry-run 모드 — Storage 업로드 생략.\n');
  console.log('=== Dispatch Summary ===');
  for (const r of dispatchResults) {
    console.log(`  ${r.level}: protected.pdf ${r.fullPages}p / sample.pdf ${r.sampProtected}p`);
  }
  process.exit(0);
}

console.log('\n=== Storage 업로드 ===\n');

const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

for (const r of dispatchResults) {
  const LEVEL_UPPER = r.level.toUpperCase();
  const level_lower = r.level.toLowerCase();

  const fullKey = `${MONTH}/${MONTH}-${LEVEL_UPPER}.pdf`;
  const sampleKey = `${level_lower}.pdf`;

  // Upload protected as paid fullbook
  console.log(`[${r.level}] → ${BUCKET_FULL}/${fullKey}`);
  const fullBytes = readFileSync(r.outProtected);
  const { error: fullErr } = await sb.storage.from(BUCKET_FULL).upload(fullKey, fullBytes, {
    contentType: 'application/pdf', upsert: true
  });
  if (fullErr) {
    console.error(`  ✗ ${fullErr.message}`);
    continue;
  }
  console.log(`  ✓ ${(fullBytes.length / 1024 / 1024).toFixed(1)}MB uploaded`);

  // Upload sample
  console.log(`[${r.level}] → ${BUCKET_SAMPLE}/${sampleKey}`);
  const sampBytes = readFileSync(r.outSample);
  const { error: sampErr } = await sb.storage.from(BUCKET_SAMPLE).upload(sampleKey, sampBytes, {
    contentType: 'application/pdf', upsert: true
  });
  if (sampErr) {
    console.error(`  ✗ ${sampErr.message}`);
    continue;
  }
  console.log(`  ✓ ${(sampBytes.length / 1024 / 1024).toFixed(1)}MB uploaded`);
}

console.log('\n=== 완료 ===');
console.log('이제 결제자에게는 dispatch-monthly-pdf, 가입자에게는 send-sample Edge Function 이 자동 발송합니다.');
console.log('수동 트리거가 필요하면 Supabase 콘솔 또는 admin 페이지에서 실행하세요.');
