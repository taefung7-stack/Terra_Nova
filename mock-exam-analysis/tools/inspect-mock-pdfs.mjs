#!/usr/bin/env node
/* 현재 Storage(textbook-pdfs/mock/{month}/)에 올라간 판매본 PDF를 다운로드해
 * GoodNotes 호환성(PDF 버전 · ObjStm 개수 · IMPACT7 흔적)을 진단한다.
 * 교체 작업 전 "실제 무엇이 팔리고 있는지"를 추측 없이 확인하기 위한 read-only 도구.
 *
 * 사용: SUPABASE_SERVICE_ROLE_KEY=... node tools/inspect-mock-pdfs.mjs --month 2026-06
 * 다운로드본은 tools/_storage-snapshot/{month}/ 에 저장(진단용, gitignore 대상).
 */
import { createClient } from '@supabase/supabase-js';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const here = dirname(fileURLToPath(import.meta.url));
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://betkydmxrnlhgmnprbca.supabase.co';
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'textbook-pdfs';

if (!SERVICE_KEY) { console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY 필요'); process.exit(2); }

const { values } = parseArgs({ options: { month: { type: 'string' } } });
if (!values.month || !/^\d{4}-\d{2}$/.test(values.month)) { console.error('--month YYYY-MM 필수'); process.exit(2); }
const month = values.month;

const keys = [
  `mock/${month}/grade1-analysis.pdf`,
  `mock/${month}/grade1-workbook.pdf`,
  `mock/${month}/grade2-analysis.pdf`,
  `mock/${month}/grade2-workbook.pdf`,
];

const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
const outDir = resolve(here, '_storage-snapshot', month);
mkdirSync(outDir, { recursive: true });

console.log(`[inspect] ${BUCKET}/mock/${month}/ 진단\n`);
for (const key of keys) {
  const { data, error } = await sb.storage.from(BUCKET).download(key);
  if (error) { console.log(`  ✗ ${key}: 없음/오류 — ${error.message}`); continue; }
  const buf = Buffer.from(await data.arrayBuffer());
  const txt = buf.toString('latin1');
  const ver = txt.slice(0, 8);
  const objstm = (txt.match(/ObjStm/g) || []).length;
  const pages  = (txt.match(/\/Type\s*\/Page[^s]/g) || []).length;
  const hasImpact = /impact7|IMPACT7/i.test(txt);
  const mb = (buf.length / 1024 / 1024).toFixed(1);
  const local = resolve(outDir, key.split('/').pop());
  writeFileSync(local, buf);
  const goodnotes = objstm === 0 ? 'OK' : `위험(ObjStm ${objstm})`;
  console.log(`  ${key.split('/').pop().padEnd(22)} ${ver} ${mb}MB pages=${pages} ObjStm=${objstm} → GoodNotes ${goodnotes}${hasImpact ? '  ⚠️IMPACT7흔적' : ''}`);
}
console.log(`\n다운로드 스냅샷: ${outDir}`);
