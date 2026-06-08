#!/usr/bin/env node
/**
 * Terra Nova · 모의고사 회차 PDF 업로드 (Storage: textbook-pdfs/mock/{YYYY-MM}/)
 *
 * dispatch-order-pdf 의 mockPdfPaths() 매핑과 1:1 대응하는 경로로 업로드한다:
 *   고1 본문분석 → mock/{YYYY-MM}/grade1-analysis.pdf
 *   고1 워크북   → mock/{YYYY-MM}/grade1-workbook.pdf
 *   고2 본문분석 → mock/{YYYY-MM}/grade2-analysis.pdf
 *   고2 워크북   → mock/{YYYY-MM}/grade2-workbook.pdf
 *
 * ⚠️ 절대 규칙: Terra Nova 정식본만 업로드. Impact7/내부/검토용 파일 금지.
 *    파일명에 'impact'(대소문자 무관)가 들어가면 즉시 중단한다(2중 안전장치).
 *
 * 사용:
 *   SUPABASE_SERVICE_ROLE_KEY=... node tools/upload-mock-pdfs.mjs --month 2026-06
 *   옵션: --dry-run (업로드 없이 매핑만 출력)
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..'); // mock-exam-analysis/

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://betkydmxrnlhgmnprbca.supabase.co';
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'textbook-pdfs';

if (!SERVICE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY 환경변수 필요');
  console.error('Studio > Project Settings > API > service_role(secret) 에서 복사하세요.');
  process.exit(2);
}

const { values } = parseArgs({
  options: {
    month:     { type: 'string' },
    'dry-run': { type: 'boolean', default: false },
  },
});
if (!values.month || !/^\d{4}-\d{2}$/.test(values.month)) {
  console.error('--month YYYY-MM 필수 (예: 2026-06)');
  process.exit(2);
}
const month  = values.month;          // '2026-06'
const dryRun = values['dry-run'];

// 월별 로컬 파일 매핑 — Terra Nova 정식본만. 새 회차는 여기만 갱신.
const MAP = {
  '2026-06': [
    { key: `mock/2026-06/grade1-analysis.pdf`, file: '2026-june-grade1/dist/26년 6월 1학년 모의고사 본문분석 (수정본).pdf',  desc: '고1 본문분석' },
    { key: `mock/2026-06/grade1-workbook.pdf`, file: '2026-june-grade1/dist/2026-6월-고1-영어-워크북-합본.pdf',              desc: '고1 워크북' },
    { key: `mock/2026-06/grade2-analysis.pdf`, file: '2026-june-grade2/dist/26년 6월 2학년 모의고사 본문분석 (수정본3).pdf', desc: '고2 본문분석' },
    { key: `mock/2026-06/grade2-workbook.pdf`, file: '2026-june-grade2/dist/2026-6월-고2-영어-워크북-합본.pdf',              desc: '고2 워크북' },
  ],
};

const targets = MAP[month];
if (!targets) {
  console.error(`${month} 매핑이 없습니다. tools/upload-mock-pdfs.mjs 의 MAP 에 추가하세요.`);
  process.exit(1);
}

// ── 2중 안전장치: Impact7/내부본 차단 ──
for (const t of targets) {
  const fname = basename(t.file).toLowerCase();
  if (fname.includes('impact')) {
    console.error(`🚫 차단: '${t.file}' 는 Impact7/내부본으로 보입니다. 업로드 금지.`);
    process.exit(3);
  }
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

console.log(`[upload-mock-pdfs] ${month} → ${BUCKET}/mock/${month}/  (Terra Nova 정식본만)`);
let uploaded = 0, failed = 0, missing = 0;

for (const t of targets) {
  const abs = resolve(root, t.file);
  if (!existsSync(abs)) {
    console.error(`  ✗ ${t.desc}: 파일 없음 — ${t.file}`);
    missing++;
    continue;
  }
  const mb = (statSync(abs).size / 1024 / 1024).toFixed(1);
  console.log(`  ${dryRun ? '[DRY]' : '↑'} ${t.desc}: ${basename(t.file)} (${mb}MB)\n         → ${BUCKET}/${t.key}`);
  if (dryRun) { uploaded++; continue; }
  const buf = readFileSync(abs);
  const { error } = await sb.storage.from(BUCKET).upload(t.key, buf, {
    contentType: 'application/pdf',
    cacheControl: '3600',
    upsert: true,
  });
  if (error) { console.error(`     FAIL: ${error.message}`); failed++; }
  else uploaded++;
}

console.log(`\n결과: 업로드 ${uploaded} · 누락 ${missing} · 실패 ${failed}`);
process.exit(failed > 0 || missing > 0 ? 1 : 0);
