#!/usr/bin/env node
/**
 * Flip `meta.achievement_verified` to true on a per-passage basis after
 * NCIC 1:1 cross-check. Touches only the boolean — no other fields move.
 *
 * Usage:
 *   node tools/mark-verified.mjs --month 2026-06 --seq 15
 *   node tools/mark-verified.mjs --month 2026-06 --seq 15,18,20
 *   node tools/mark-verified.mjs --month 2026-06 --all
 *
 * Output: per-file before/after status. Exit code 0 if all targets exist.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const { values } = parseArgs({
  options: {
    month: { type: 'string' },
    seq:   { type: 'string' },
    all:   { type: 'boolean', default: false },
  }
});

if (!values.month) {
  console.error('--month YYYY-MM required');
  process.exit(2);
}
if (!values.all && !values.seq) {
  console.error('--seq <NN[,NN…]> or --all required');
  process.exit(2);
}

const passDir = join(root, 'content', 'passages', values.month);
const all = readdirSync(passDir).filter(n => /^\d{2}\.json$/.test(n)).sort();

const targets = values.all
  ? all
  : values.seq.split(',').map(s => s.trim().padStart(2, '0') + '.json');

let touched = 0, alreadyTrue = 0, missing = 0;

for (const name of targets) {
  const p = join(passDir, name);
  let raw;
  try { raw = readFileSync(p, 'utf8'); }
  catch { console.warn(`SKIP ${name} — file not found`); missing++; continue; }
  const j = JSON.parse(raw);
  const before = j.meta?.achievement_verified;
  if (before === true) {
    console.log(`-- ${name}  already verified (${j.meta.achievement_standard})`);
    alreadyTrue++;
    continue;
  }
  j.meta.achievement_verified = true;
  // re-serialize preserving 2-space indent (validator uses ajv on parsed object, indent doesn't matter)
  writeFileSync(p, JSON.stringify(j, null, 2) + '\n');
  console.log(`✓  ${name}  ${j.meta.achievement_standard}  → verified`);
  touched++;
}

console.log();
console.log(`updated: ${touched}  · already-true: ${alreadyTrue}  · missing: ${missing}`);
if (missing > 0) process.exit(1);
