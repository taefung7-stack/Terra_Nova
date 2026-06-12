#!/usr/bin/env node
/**
 * 6월호 신간 (Neptune / Uranus / Terra) 표지 + fullbook 병합.
 *
 * 입력:
 *   dist/2026-06-{Level}/{LEVEL} 6월 표지.pdf  (1p)
 *   dist/2026-06-{Level}/2026-06-{Level}-fullbook.pdf  (135p, TOC placeholder 포함)
 *
 * 출력:
 *   dist/2026-06-{Level}/2026-06-{Level}.pdf  (표지 1p + 본문 135p = 136p)
 *
 * 이후 직원이 TOC 페이지(p1-p2 본문 placeholder)를 교체하면 final 이 된다.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument } from 'pdf-lib';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const levels = [
  { level: 'Neptune', coverFile: 'NEPTUNE 6월 표지.pdf' },
  { level: 'Uranus',  coverFile: 'URANUS 6월 표지.pdf'  },
  { level: 'Terra',   coverFile: 'TERRA 6월 표지.pdf'   }
];

for (const { level, coverFile } of levels) {
  const distDir = join(root, 'dist', '2026-06', `2026-06-${level}`);
  const coverPath = join(distDir, coverFile);
  const bodyPath = join(distDir, `2026-06-${level}-fullbook.pdf`);
  const outPath = join(distDir, `2026-06-${level}.pdf`);

  const coverBytes = readFileSync(coverPath);
  const bodyBytes = readFileSync(bodyPath);
  const cover = await PDFDocument.load(coverBytes, { ignoreEncryption: true });
  const body = await PDFDocument.load(bodyBytes, { ignoreEncryption: true });

  const merged = await PDFDocument.create();
  const coverPages = await merged.copyPages(cover, cover.getPageIndices());
  for (const p of coverPages) merged.addPage(p);
  const bodyPages = await merged.copyPages(body, body.getPageIndices());
  for (const p of bodyPages) merged.addPage(p);

  // 메타데이터 갱신
  merged.setTitle(`Terra Nova · ${level.toUpperCase()} 6월호`);
  merged.setAuthor('Terra Nova English');
  merged.setSubject('Monthly English Textbook · 2026-06');
  merged.setCreator('Terra Nova Textbook Builder');
  merged.setProducer('Terra Nova / pdf-lib');

  const outBytes = await merged.save({ useObjectStreams: true });
  writeFileSync(outPath, outBytes);
  console.log(
    `${level}: ${cover.getPageCount()}p (cover) + ${body.getPageCount()}p (body) ` +
    `= ${merged.getPageCount()}p, ${(outBytes.length / 1024 / 1024).toFixed(1)}MB → ${outPath.replace(root + '/', '').replace(/\\/g, '/')}`
  );
}
