#!/usr/bin/env node
/**
 * Terra Nova · 월간 PDF Storage 업로드
 *
 * 사용법:
 *   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... node tools/upload-monthly-pdfs.mjs --month 2026-06
 *
 *   --month YYYY-MM   업로드할 월 (필수)
 *   --levels MARS,VENUS,...   특정 레벨만 (생략 시 dist 안의 모든 레벨)
 *   --dry-run         실제 업로드 없이 어떤 파일이 올라갈지만 출력
 *
 * 동작:
 *   1. textbook/dist/{month}-{Level}/{month}-{Level}.pdf 파일 검색
 *   2. Supabase Storage 'textbook-pdfs' 버킷에 {month}/{month}-{LEVEL}.pdf 로 업로드
 *   3. 이미 있으면 덮어씀 (upsert)
 *
 * SUPABASE_SERVICE_ROLE_KEY 는 Studio > Project Settings > API > service_role secret 에서 복사.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://betkydmxrnlhgmnprbca.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'textbook-pdfs';
const VALID_LEVELS = ['MARS', 'VENUS', 'TERRA', 'NEPTUNE', 'URANUS', 'SATURN', 'JUPITER', 'SUN'];

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY 환경변수가 필요합니다.');
  console.error('Studio > Project Settings > API > service_role(secret)에서 복사하세요.');
  process.exit(2);
}

const { values } = parseArgs({
  options: {
    month:   { type: 'string' },
    levels:  { type: 'string' },
    'dry-run': { type: 'boolean', default: false },
  },
});
if (!values.month || !/^\d{4}-\d{2}$/.test(values.month)) {
  console.error('--month YYYY-MM 형식 필수 (예: --month 2026-06)');
  process.exit(2);
}
const month = values.month;
const requestedLevels = values.levels ? values.levels.split(',').map(s => s.trim().toUpperCase()) : null;
const dryRun = values['dry-run'];

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

// dist 안의 month 디렉토리 검색
const distDir = resolve(root, 'dist');
if (!existsSync(distDir)) {
  console.error(`dist 폴더가 없습니다: ${distDir}`);
  process.exit(1);
}

// 신규 레이아웃: dist/{month}/{month}-{Level}/ . 구 레이아웃(dist/{month}-{Level}/) 도 호환.
const monthDir = resolve(distDir, month);
const searchDir = existsSync(monthDir) && statSync(monthDir).isDirectory() ? monthDir : distDir;

const dirs = readdirSync(searchDir).filter(d => {
  const p = resolve(searchDir, d);
  if (!statSync(p).isDirectory()) return false;
  return d.startsWith(month + '-');
});

if (dirs.length === 0) {
  console.error(`${month} 으로 시작하는 디렉토리가 dist에 없습니다.`);
  console.error('먼저 다음을 실행하세요: node tools/build-fullbook.mjs --month ' + month + '-Mars  (각 레벨별)');
  process.exit(1);
}

console.log(`[upload-monthly-pdfs] ${month}, ${dirs.length}개 디렉토리 발견`);

let uploaded = 0, skipped = 0, failed = 0;
for (const dir of dirs) {
  // 폴더명 끝의 선택적 학년 접미사 " (초5)" 등을 무시하고 레벨을 파싱.
  const levelMatch = dir.match(/-([A-Z][a-z]+)(?:\s*\(.*\))?$/);
  if (!levelMatch) { console.warn('  - skip (level 파싱 실패):', dir); skipped++; continue; }
  const level = levelMatch[1].toUpperCase();
  if (!VALID_LEVELS.includes(level)) { console.warn('  - skip (invalid level):', level); skipped++; continue; }
  if (requestedLevels && !requestedLevels.includes(level)) { skipped++; continue; }

  // 내부 PDF 파일명은 접미사 없는 {month}-{Level}.pdf (예: 2026-06-Mars.pdf).
  const base = `${month}-${levelMatch[1]}`;
  const pdfPath = resolve(searchDir, dir, `${base}.pdf`);
  if (!existsSync(pdfPath)) { console.warn('  - skip (PDF 없음):', pdfPath); skipped++; continue; }

  const objectPath = `${month}/${month}-${level}.pdf`;
  const sizeMb = (statSync(pdfPath).size / 1024 / 1024).toFixed(1);
  console.log(`  ${dryRun ? '[DRY]' : '↑'} ${level}: ${pdfPath} → ${BUCKET}/${objectPath}  (${sizeMb}MB)`);
  if (dryRun) { uploaded++; continue; }

  const buf = readFileSync(pdfPath);
  const { error } = await sb.storage.from(BUCKET).upload(objectPath, buf, {
    contentType: 'application/pdf',
    cacheControl: '3600',
    upsert: true,
  });
  if (error) {
    console.error(`     FAIL: ${error.message}`);
    failed++;
  } else {
    uploaded++;
  }
}

console.log(`\n결과: 업로드 ${uploaded}개 · skip ${skipped}개 · 실패 ${failed}개`);
process.exit(failed > 0 ? 1 : 0);
