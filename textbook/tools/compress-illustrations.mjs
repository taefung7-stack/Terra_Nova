#!/usr/bin/env node
/**
 * Convert per-month illustration PNGs to WebP for distribution PDF.
 * Originals are kept (PNG remains as the print/archive master).
 *
 * Usage:
 *   node tools/compress-illustrations.mjs --month 2026-06
 *   node tools/compress-illustrations.mjs --month 2026-06 --quality 88 --effort 6
 *   node tools/compress-illustrations.mjs --month 2026-06 --update-json
 *
 * Notes:
 *   - sharp WebP, quality 88 + effort 6 typically gives 60–80% size cut
 *     while remaining visually indistinguishable from the painterly 3D
 *     art style used by the monthly book.
 *   - PNG originals stay in place. JSONs continue to point at .png unless
 *     you pass --update-json (which rewrites the path extension).
 */
import sharp from 'sharp';
import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const { values } = parseArgs({
  options: {
    month:        { type: 'string' },
    quality:      { type: 'string', default: '88' },
    effort:       { type: 'string', default: '6' },
    'update-json':{ type: 'boolean', default: false },
  }
});

if (!values.month) {
  console.error('--month YYYY-MM required');
  process.exit(2);
}

const quality = Number(values.quality);
const effort  = Number(values.effort);
const ill     = join(root, 'assets', 'illustrations', values.month);
const passDir = join(root, 'content', 'passages', values.month);

const pngs = readdirSync(ill)
  .filter(n => /^\d{2}\.png$/.test(n))
  .sort();

if (pngs.length === 0) {
  console.error(`no PNG illustrations under ${ill}`);
  process.exit(1);
}

console.log(`compressing ${pngs.length} illustrations  (quality=${quality}, effort=${effort})`);
let totalIn = 0, totalOut = 0;

for (const name of pngs) {
  const src = join(ill, name);
  const dst = join(ill, name.replace(/\.png$/, '.webp'));
  const inSize = statSync(src).size;
  await sharp(src)
    .webp({ quality, effort, smartSubsample: true })
    .toFile(dst);
  const outSize = statSync(dst).size;
  totalIn  += inSize;
  totalOut += outSize;
  const pct = ((1 - outSize / inSize) * 100).toFixed(1);
  console.log(`  ${name}  ${(inSize/1024/1024).toFixed(2)}MB → ${(outSize/1024/1024).toFixed(2)}MB  (-${pct}%)`);
}

const totalPct = ((1 - totalOut / totalIn) * 100).toFixed(1);
console.log(`TOTAL  ${(totalIn/1024/1024).toFixed(1)}MB → ${(totalOut/1024/1024).toFixed(1)}MB  (-${totalPct}%)`);

if (values['update-json']) {
  const jsonFiles = readdirSync(passDir).filter(n => /^\d{2}\.json$/.test(n)).sort();
  let touched = 0;
  for (const name of jsonFiles) {
    const p = join(passDir, name);
    const before = readFileSync(p, 'utf8');
    const after = before.replace(
      /(assets\/illustrations\/\d{4}-\d{2}\/\d{2})\.png/g,
      '$1.webp'
    );
    if (after !== before) {
      writeFileSync(p, after);
      touched++;
    }
  }
  console.log(`updated ${touched} passage JSONs (.png → .webp)`);
}
