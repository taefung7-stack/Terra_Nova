#!/usr/bin/env node
/**
 * Convert per-month illustration PNGs to a smaller distribution format
 * (JPEG by default — Chrome embeds JPEG into PDF without re-encoding,
 * so the compression carries through to final PDF size; WebP works on
 * disk but Chrome decodes+re-encodes during page.pdf(), losing the gain).
 *
 * Usage:
 *   node tools/compress-illustrations.mjs --month 2026-06
 *   node tools/compress-illustrations.mjs --month 2026-06 --quality 88
 *   node tools/compress-illustrations.mjs --month 2026-06 --format webp     # disk-only optimization
 *   node tools/compress-illustrations.mjs --month 2026-06 --update-json
 *
 * Format choice:
 *   - jpg  (default): best for distribution PDF size. Chrome embeds the
 *     JPEG bitstream as-is. 132MB PNG → ~15MB JPEG → ~15MB PDF.
 *   - webp: smaller on disk, but Chrome re-encodes during PDF generation.
 *     Disk drops 87% but PDF size barely changes vs raw PNG. Use only
 *     when you need disk savings (asset hosting) and not PDF savings.
 *
 * PNG originals stay in place as the print/archive master.
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
    format:       { type: 'string', default: 'jpg' },
    quality:      { type: 'string', default: '88' },
    effort:       { type: 'string', default: '6' },
    'update-json':{ type: 'boolean', default: false },
  }
});

if (!values.month) {
  console.error('--month YYYY-MM required');
  process.exit(2);
}
if (!['jpg', 'jpeg', 'webp'].includes(values.format)) {
  console.error(`--format must be jpg or webp (got: ${values.format})`);
  process.exit(2);
}

const ext     = values.format === 'jpeg' ? 'jpg' : values.format;
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

console.log(`compressing ${pngs.length} illustrations  format=${ext} quality=${quality}${ext === 'webp' ? ' effort=' + effort : ''}`);
let totalIn = 0, totalOut = 0;

for (const name of pngs) {
  const src = join(ill, name);
  const dst = join(ill, name.replace(/\.png$/, '.' + ext));
  const inSize = statSync(src).size;
  let pipeline = sharp(src);
  if (ext === 'webp') {
    pipeline = pipeline.webp({ quality, effort, smartSubsample: true });
  } else {
    pipeline = pipeline.jpeg({ quality, mozjpeg: true, chromaSubsampling: '4:4:4' });
  }
  await pipeline.toFile(dst);
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
    // accept either .png, .webp, or .jpg currently in the JSON and rewrite to chosen ext
    const after = before.replace(
      /(assets\/illustrations\/\d{4}-\d{2}\/\d{2})\.(png|webp|jpe?g)/g,
      `$1.${ext}`
    );
    if (after !== before) {
      writeFileSync(p, after);
      touched++;
    }
  }
  console.log(`updated ${touched} passage JSONs → .${ext}`);
}
