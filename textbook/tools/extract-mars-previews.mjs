/**
 * Extract MARS preview JPGs directly from the printed book PDF.
 * Pulls pages 5-8 (P1 Passage / P2 Practice / P3 Syntax / P4 Vocab of passage 01)
 * from dist/2026-06/2026-06-Mars/2026-06-Mars.pdf and writes them to
 * ../assets/textbook-previews/mars-p[1-4].jpg
 *
 * Uses Artifex MuPDF (npm: mupdf) — correctly rasterizes gradients,
 * transparency, and patterns. pdfjs-dist canvas backend mis-rendered
 * the page background as dark purple, hence this rewrite.
 *
 * Output is PNG from mupdf, then re-encoded to JPEG via node-canvas
 * with white background flattening.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import * as mupdf from 'mupdf';
import { createCanvas, loadImage } from 'canvas';

const pdfPath = resolve('./dist/2026-06/2026-06-Mars/2026-06-Mars.pdf');
const outDir = resolve('../assets/textbook-previews');
await mkdir(outDir, { recursive: true });

const pageNumbers = [5, 6, 7, 8]; // P1..P4 of passage 01 (1-indexed)
const targetWidth = 1500; // long-edge pixels

const data = await readFile(pdfPath);
const doc = mupdf.Document.openDocument(new Uint8Array(data), 'application/pdf');
console.log(`pdf loaded: ${doc.countPages()} pages`);

for (let i = 0; i < pageNumbers.length; i++) {
  const pageIdx = pageNumbers[i] - 1; // mupdf is 0-indexed
  const page = doc.loadPage(pageIdx);
  const bbox = page.getBounds(); // PDF user units (1pt = 1/72 inch)
  const pageWidth = bbox[2] - bbox[0];
  const pageHeight = bbox[3] - bbox[1];
  const zoom = targetWidth / pageWidth;
  const matrix = mupdf.Matrix.scale(zoom, zoom);

  // White background flatten — mupdf.toPixmap supports alpha=false
  // which produces an RGB pixmap. ColorSpace.DeviceRGB gives us 8-bit RGB.
  const pixmap = page.toPixmap(matrix, mupdf.ColorSpace.DeviceRGB, false, true);
  const pngBytes = pixmap.asPNG();
  pixmap.destroy();
  page.destroy();

  // Re-encode PNG → JPEG with node-canvas for size control.
  const img = await loadImage(Buffer.from(pngBytes));
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
  const jpg = canvas.toBuffer('image/jpeg', { quality: 0.88, progressive: true });

  const outPath = join(outDir, `mars-p${i + 1}.jpg`);
  await writeFile(outPath, jpg);
  console.log(`wrote ${outPath}  page=${pageNumbers[i]}  ${img.width}x${img.height}  ${(jpg.length / 1024).toFixed(0)}KB`);
}

console.log('done');
