import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
const data = new Uint8Array(await readFile(resolve('./dist/2026-06-Mars/2026-06-Mars.pdf')));
const doc = await (pdfjs.getDocument({ data })).promise;
for (const n of [5, 6]) {
  const p = await doc.getPage(n);
  const tc = await p.getTextContent();
  console.log(`\n===== PAGE ${n} =====`);
  console.log(tc.items.map(i => i.str).join(' | '));
}
await doc.destroy();
