/**
 * MARS 미리보기 JPG 추출 (2026-06 업데이트본).
 *
 * 완성본 dist/2026-06-Mars/2026-06-Mars.pdf (156p = 표지1 + 저작권1 + 본문154) 에서
 * passage 01 의 4페이지를 뽑아 ../assets/textbook-previews/mars-p[1-4].jpg 로 저장.
 *
 * 페이지 매핑 (표지+colophon 삽입으로 기존 p5-8 → p7-10 로 +2 이동):
 *   p7  P1 Passage
 *   p8  P2 Practice
 *   p9  P3 Syntax
 *   p10 P4 Vocab
 *
 * mupdf 로 래스터화(그라데이션/투명도 정확) → node-canvas 로 흰 배경 flatten + JPEG.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import * as mupdf from 'mupdf';
import { createCanvas, loadImage } from 'canvas';

const pdfPath = resolve('./dist/2026-06-Mars/2026-06-Mars.pdf');
const outDir = resolve('../assets/textbook-previews');
await mkdir(outDir, { recursive: true });

const pageNumbers = [7, 8, 9, 10]; // P1..P4 of passage 01 (1-indexed, 표지+colophon 반영)
const targetWidth = 1500;

const data = await readFile(pdfPath);
const doc = mupdf.Document.openDocument(new Uint8Array(data), 'application/pdf');
console.log(`pdf loaded: ${doc.countPages()} pages`);

for (let i = 0; i < pageNumbers.length; i++) {
  const pageIdx = pageNumbers[i] - 1;
  const page = doc.loadPage(pageIdx);
  const bbox = page.getBounds();
  const pageWidth = bbox[2] - bbox[0];
  const zoom = targetWidth / pageWidth;
  const pixmap = page.toPixmap(mupdf.Matrix.scale(zoom, zoom), mupdf.ColorSpace.DeviceRGB, false, true);
  const pngBytes = pixmap.asPNG();
  pixmap.destroy();
  page.destroy();

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
