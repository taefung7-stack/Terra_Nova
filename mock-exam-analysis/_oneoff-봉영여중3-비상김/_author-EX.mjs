/* 봉영여중3 추가지문(EX) 11편 — 챕터 저작 실행
 * 실행: node _author-EX.mjs  → data/EX/{1..11}.json
 * 저작 데이터: _author-EX-1.mjs(01~04) · -2.mjs(05~08) · -3.mjs(L7 추가지문 3편) */
import fs from 'node:fs';
import { writeChapter } from './_author.mjs';
import { SOURCE } from './_SOURCE-EX.js';

const parts = ['./_author-EX-1.mjs', './_author-EX-2.mjs', './_author-EX-3.mjs']
  .filter(p => fs.existsSync(new URL(p, import.meta.url)));
for (const p of parts) {
  const { chapters } = await import(p);
  for (const c of chapters) writeChapter('EX', SOURCE, c);
}
