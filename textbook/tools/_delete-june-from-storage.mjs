#!/usr/bin/env node
/**
 * Terra Nova · 6월 교재/샘플을 Supabase Storage 에서 삭제 (판매 종료분 정리).
 *
 *   - textbook-pdfs/2026-06/*            (월간 교재 전 레벨)
 *   - sample-pdfs/{level}.pdf            (구 평면 경로 샘플 — 전 레벨)
 *   - sample-pdfs/2026-06/*              (혹시 월별 경로로 올린 6월 샘플이 있으면)
 *
 * 안전장치: 먼저 list 로 대상 키를 보여주고, --apply 없으면 삭제하지 않는다(dry-run 기본).
 *
 * 사용:
 *   SUPABASE_SERVICE_ROLE_KEY=... node tools/_delete-june-from-storage.mjs            # dry-run(목록만)
 *   SUPABASE_SERVICE_ROLE_KEY=... node tools/_delete-june-from-storage.mjs --apply    # 실제 삭제
 */
import { createClient } from '@supabase/supabase-js';
import { parseArgs } from 'node:util';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://betkydmxrnlhgmnprbca.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!KEY) { console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY 필요'); process.exit(2); }

const { values } = parseArgs({ options: { apply: { type: 'boolean', default: false } } });
const apply = values.apply;

// 평면 경로 샘플 후보(현행 + 과거 전 레벨). 존재하는 것만 삭제됨.
const FLAT_SAMPLE_LEVELS = [
  'moon', 'mercury', 'mars', 'venus', 'terra',
  'neptune', 'uranus', 'saturn', 'jupiter', 'sun',
];

const sb = createClient(SUPABASE_URL, KEY, { auth: { persistSession: false } });

async function listFolder(bucket, prefix) {
  const { data, error } = await sb.storage.from(bucket).list(prefix, { limit: 1000 });
  if (error) { console.warn(`  (list 실패 ${bucket}/${prefix}: ${error.message})`); return []; }
  return (data || []).filter(o => o.id || o.name).map(o => (prefix ? `${prefix}/${o.name}` : o.name));
}

const plan = []; // {bucket, key}

// 1) textbook-pdfs/2026-06/*
for (const k of await listFolder('textbook-pdfs', '2026-06')) plan.push({ bucket: 'textbook-pdfs', key: k });

// 2) sample-pdfs/{level}.pdf (평면) — 존재 여부는 삭제 시 확인. 명시적으로 추가.
for (const lvl of FLAT_SAMPLE_LEVELS) plan.push({ bucket: 'sample-pdfs', key: `${lvl}.pdf`, maybe: true });

// 3) sample-pdfs/2026-06/* (혹시 있으면)
for (const k of await listFolder('sample-pdfs', '2026-06')) plan.push({ bucket: 'sample-pdfs', key: k });

console.log(`\n=== 삭제 대상 (${apply ? '실제 삭제' : 'DRY-RUN'}) ===`);
for (const p of plan) console.log(`  ${p.bucket}/${p.key}${p.maybe ? '  (있으면)' : ''}`);

if (!apply) {
  console.log(`\n실제로 지우려면 --apply 를 붙이세요.`);
  process.exit(0);
}

// 버킷별로 묶어서 remove
const byBucket = {};
for (const p of plan) (byBucket[p.bucket] ||= []).push(p.key);

let removed = 0, failed = 0;
for (const [bucket, keys] of Object.entries(byBucket)) {
  const { data, error } = await sb.storage.from(bucket).remove(keys);
  if (error) { console.error(`  FAIL ${bucket}: ${error.message}`); failed += keys.length; continue; }
  // remove 는 존재하지 않은 키는 조용히 건너뜀 — 실제 삭제된 것만 카운트
  const ok = (data || []).length;
  removed += ok;
  console.log(`  ${bucket}: ${ok}개 삭제`);
}

console.log(`\n결과: 삭제 ${removed}개 · 실패 ${failed}개`);
process.exit(failed > 0 ? 1 : 0);
