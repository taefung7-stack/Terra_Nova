#!/usr/bin/env node
/**
 * 6월호 신간 (Neptune / Uranus / Terra) fullbook PDF에서
 * 페이지 수와 페이지 1(title) 텍스트를 추출하여 검수와 프롬프트 작성에 사용.
 * pdf-lib 만으로 페이지 수, pdfjs-dist 가 없으므로 텍스트는 외부 도구가 필요해
 * 일단 페이지 수와 PDF 메타데이터만 dump 한다.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument } from 'pdf-lib';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const targets = [
  { level: 'Neptune', file: 'dist/2026-06-Neptune/2026-06-Neptune-fullbook.pdf', cover: 'dist/2026-06-Neptune/NEPTUNE 6월 표지.pdf' },
  { level: 'Uranus',  file: 'dist/2026-06-Uranus/2026-06-Uranus-fullbook.pdf',   cover: 'dist/2026-06-Uranus/URANUS 6월 표지.pdf'   },
  { level: 'Terra',   file: 'dist/2026-06-Terra/2026-06-Terra-fullbook.pdf',     cover: 'dist/2026-06-Terra/TERRA 6월 표지.pdf'     }
];

for (const t of targets) {
  const bytes = readFileSync(join(root, t.file));
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const cover = await PDFDocument.load(readFileSync(join(root, t.cover)), { ignoreEncryption: true });
  console.log(`${t.level}: fullbook=${doc.getPageCount()}p, cover=${cover.getPageCount()}p, size=${(bytes.length/1024/1024).toFixed(1)}MB`);
}
