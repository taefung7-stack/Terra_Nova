#!/usr/bin/env node
/** Rasterize specific pages of Mars/Venus fullbook PDFs for visual QA (mupdf). */
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import * as mupdf from 'mupdf';

const root = resolve('.');
const outDir = join(root, 'dist', '_qa-renders', 'junem');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const jobs = [
  ['mars', 'dist/2026-06-Mars/mars_fullbook_final_complete.pdf', [1, 2, 4, 6, 91, 103, 113, 154]],
  ['venus', 'dist/2026-06-Venus/venus_fullbook_final_complete.pdf', [1, 2, 4, 6, 7, 8, 9, 50, 91, 103, 113, 154]],
];

for (const [name, path, pages] of jobs) {
  const doc = mupdf.Document.openDocument(new Uint8Array(readFileSync(path)), 'application/pdf');
  console.log(`${name}: ${doc.countPages()} pages`);
  for (const pn of pages) {
    if (pn > doc.countPages()) continue;
    const page = doc.loadPage(pn - 1);
    const bbox = page.getBounds();
    const zoom = 1100 / (bbox[2] - bbox[0]);
    const pix = page.toPixmap(mupdf.Matrix.scale(zoom, zoom), mupdf.ColorSpace.DeviceRGB, false, true);
    writeFileSync(join(outDir, `${name}-r-p${pn}.png`), pix.asPNG());
    pix.destroy();
    page.destroy();
  }
  console.log(`  ${name} done`);
}
