#!/usr/bin/env node
/**
 * Terra Nova · 보호된 PDF 업로드
 *
 * build-protected.mjs 가 만든 두 파일을 각각 다른 버킷에 업로드:
 *   - {month}-{Level}-fullbook.pdf  → textbook-pdfs/{month}/{month}-{LEVEL}.pdf   (결제자, 대문자)
 *   - {month}-{Level}-sample.pdf    → sample-pdfs/{month}/{level}.pdf             (무료 샘플, 월별 경로, 소문자)
 *
 * 사용:
 *   SUPABASE_SERVICE_ROLE_KEY=... node tools/upload-protected-pdfs.mjs --month 2026-06
 *   옵션:
 *     --levels Saturn,Sun           (생략 시 fullbook+sample 파일이 있는 모든 레벨)
 *     --dry-run                     (실제 업로드 없이 매핑만 출력)
 *     --only fullbook|sample        (한쪽만 업로드)
 *
 * 키 형식은 기존 dispatch-monthly-pdf / send-sample Edge Function 과 호환:
 *   - dispatch-monthly-pdf : storage.from('textbook-pdfs').createSignedUrl('{YYYY-MM}/{YYYY-MM}-{LEVEL}.pdf')
 *   - send-sample           : storage.from('sample-pdfs').createSignedUrl('{YYYY-MM}/{level}.pdf')  ← 월 게이팅
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://betkydmxrnlhgmnprbca.supabase.co';
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

const BUCKET_FULL   = 'textbook-pdfs';
const BUCKET_SAMPLE = 'sample-pdfs';
const VALID_LEVELS = ['Mars','Venus','Terra','Neptune','Uranus','Saturn','Jupiter','Sun'];

if (!SERVICE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY 환경변수 필요');
  console.error('Studio > Project Settings > API > service_role(secret) 에서 복사하세요.');
  process.exit(2);
}

const { values } = parseArgs({
  options: {
    month:    { type: 'string' },
    levels:   { type: 'string' },
    only:     { type: 'string' },
    'dry-run':{ type: 'boolean', default: false },
  },
});
if (!values.month || !/^\d{4}-\d{2}$/.test(values.month)) {
  console.error('--month YYYY-MM 필수');
  process.exit(2);
}
const month   = values.month;
const dryRun  = values['dry-run'];
const only    = (values.only || '').toLowerCase();        // '', 'fullbook', 'sample'
const reqLvls = values.levels
  ? values.levels.split(',').map(s => s.trim()).filter(Boolean)
  : null;

const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
const distDir = resolve(root, 'dist');
// 신규 레이아웃: dist/{month}/{month}-{Level}/ . 구 레이아웃(dist/{month}-{Level}/) 도 호환.
const monthDir = resolve(distDir, month);
const searchDir = existsSync(monthDir) && statSync(monthDir).isDirectory() ? monthDir : distDir;

// searchDir 안에서 "{month}-{Level}" 로 시작하는 실제 폴더를 찾는다(학년 접미사 " (초5)" 허용).
const entries = existsSync(searchDir) ? readdirSync(searchDir) : [];
const findDir = (lvl) => {
  const exact = `${month}-${lvl}`;
  const hit = entries.find(d => d === exact || d.startsWith(exact + ' '));
  return hit ? resolve(searchDir, hit) : resolve(searchDir, exact);
};

const targets = [];
const levelsToTry = reqLvls || VALID_LEVELS;
for (const lvl of levelsToTry) {
  const dir = findDir(lvl);
  const fullPath = resolve(dir, `${month}-${lvl}-fullbook.pdf`);
  const sampPath = resolve(dir, `${month}-${lvl}-sample.pdf`);
  const has = { full: existsSync(fullPath), samp: existsSync(sampPath) };
  if (!has.full && !has.samp) continue;
  targets.push({ lvl, fullPath, sampPath, has });
}

if (targets.length === 0) {
  console.error(`${month} 보호 PDF 파일을 찾지 못했습니다.`);
  console.error(`먼저: node tools/build-protected.mjs --month ${month}`);
  process.exit(1);
}

console.log(`[upload-protected-pdfs] ${month}, ${targets.length}개 레벨`);
let uploaded = 0, skipped = 0, failed = 0;

for (const t of targets) {
  const LEVEL_UP = t.lvl.toUpperCase();
  const level_lo = t.lvl.toLowerCase();

  // 1. fullbook → textbook-pdfs/{month}/{month}-{LEVEL}.pdf
  if ((only === '' || only === 'fullbook') && t.has.full) {
    const key = `${month}/${month}-${LEVEL_UP}.pdf`;
    const mb  = (statSync(t.fullPath).size / 1024 / 1024).toFixed(1);
    console.log(`  ${dryRun ? '[DRY]' : '↑'} fullbook ${t.lvl}: ${t.fullPath}\n         → ${BUCKET_FULL}/${key}  (${mb}MB)`);
    if (!dryRun) {
      const buf = readFileSync(t.fullPath);
      const { error } = await sb.storage.from(BUCKET_FULL).upload(key, buf, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: true,
      });
      if (error) { console.error(`     FAIL: ${error.message}`); failed++; }
      else uploaded++;
    } else uploaded++;
  } else if (only === '' && !t.has.full) {
    console.warn(`  - skip fullbook ${t.lvl}: 파일 없음`);
    skipped++;
  }

  // 2. sample → sample-pdfs/{month}/{level}.pdf  (월 게이팅: send-sample 이 현재 월 경로만 조회)
  if ((only === '' || only === 'sample') && t.has.samp) {
    const key = `${month}/${level_lo}.pdf`;
    const mb  = (statSync(t.sampPath).size / 1024 / 1024).toFixed(1);
    console.log(`  ${dryRun ? '[DRY]' : '↑'} sample   ${t.lvl}: ${t.sampPath}\n         → ${BUCKET_SAMPLE}/${key}  (${mb}MB)`);
    if (!dryRun) {
      const buf = readFileSync(t.sampPath);
      const { error } = await sb.storage.from(BUCKET_SAMPLE).upload(key, buf, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: true,
      });
      if (error) { console.error(`     FAIL: ${error.message}`); failed++; }
      else uploaded++;
    } else uploaded++;
  } else if (only === '' && !t.has.samp) {
    console.warn(`  - skip sample ${t.lvl}: 파일 없음`);
    skipped++;
  }
}

console.log(`\n결과: 업로드 ${uploaded}개 · skip ${skipped}개 · 실패 ${failed}개`);
process.exit(failed > 0 ? 1 : 0);
