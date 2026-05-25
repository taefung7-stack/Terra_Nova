#!/usr/bin/env node
/**
 * 6월호 신간 (Neptune / Uranus / Terra) 에러 페이지 백지화.
 *
 * 입력 (이미 표지+본문 합본된 PDF):
 *   dist/2026-06-{Level}/2026-06-{Level}.pdf  (136p)
 *
 * 출력:
 *   dist/2026-06-{Level}/2026-06-{Level}.pdf  (덮어쓰기, 에러 페이지만 흰 빈 페이지로 교체)
 *
 * 동작:
 *   1. 각 페이지를 pdftotext 로 1p씩 추출
 *   2. 텍스트가 다음 패턴이면 에러 페이지 판정:
 *      - "Missing curriculum:" / "Missing data:" / "Failed to fetch" / "Cover render error:" 만 들어 있고
 *        다른 의미 있는 콘텐츠가 없는 경우
 *   3. 에러 페이지는 같은 A4 크기의 빈 페이지(흰 배경)로 교체
 *   4. 백지화 페이지 번호와 사유를 로그로 남김
 *
 * 안전장치: 본문(passage) 페이지는 *절대* 손대지 않는다.
 *   - 페이지 텍스트 길이가 50자 초과 + 에러 토큰이 없으면 본문/정답해설로 판정.
 *   - 길이 짧고 에러 토큰만 보이는 경우만 백지화.
 */
import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { PDFDocument } from 'pdf-lib';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const ERROR_PATTERNS = [
  /Missing curriculum:/,
  /Missing data:/,
  /Failed to fetch/,
  /Cover render error:/,
  /Unknown mode:/
];

function pageText(pdfPath, page) {
  try {
    return execFileSync('pdftotext', ['-layout', '-f', String(page), '-l', String(page), pdfPath, '-'], {
      encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
  } catch {
    return '';
  }
}

function isErrorPage(text) {
  if (!text) return false;
  const hasError = ERROR_PATTERNS.some(p => p.test(text));
  if (!hasError) return false;
  // 에러 토큰이 있고, 전체 길이가 짧으면(150자 이하) 에러 페이지로 판정.
  // 본문 페이지는 일반적으로 수백~수천 자.
  return text.length <= 250;
}

const levels = ['Neptune', 'Uranus', 'Terra'];

console.log('=== 6월호 에러 페이지 백지화 ===\n');

for (const level of levels) {
  const distDir = join(root, 'dist', `2026-06-${level}`);
  const srcPath = join(distDir, `2026-06-${level}.pdf`);
  const backupPath = join(distDir, `2026-06-${level}.raw.pdf`);

  if (!existsSync(srcPath)) {
    console.log(`[${level}] SKIP: ${srcPath} 없음`);
    continue;
  }

  // 원본 백업 (raw 로 보존)
  if (!existsSync(backupPath)) {
    copyFileSync(srcPath, backupPath);
    console.log(`[${level}] backup → ${backupPath.replace(root + '/', '').replace(/\\/g, '/')}`);
  }

  const bytes = readFileSync(srcPath);
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const total = doc.getPageCount();

  // 첫 페이지의 크기(표지 기준)를 새 빈 페이지에도 적용
  // 그러나 표지와 본문의 크기가 다를 수 있으므로, 각 페이지마다 해당 페이지 자체 크기로 교체
  const errorPages = [];
  for (let i = 1; i <= total; i++) {
    const txt = pageText(srcPath, i);
    if (isErrorPage(txt)) {
      errorPages.push({ page: i, text: txt.slice(0, 80) });
    }
  }

  if (errorPages.length === 0) {
    console.log(`[${level}] 에러 페이지 없음 — 변경 없음`);
    continue;
  }

  console.log(`[${level}] 에러 페이지 ${errorPages.length}개 발견:`);
  for (const e of errorPages) {
    console.log(`  p${String(e.page).padStart(3)} → ${e.text.replace(/\n/g, ' ')}`);
  }

  // 새 PDF 만들기: 에러 페이지는 빈 페이지로 교체, 나머지는 원본 사용
  const newDoc = await PDFDocument.create();
  const errorSet = new Set(errorPages.map(e => e.page));

  for (let i = 0; i < total; i++) {
    const pageNum = i + 1;
    if (errorSet.has(pageNum)) {
      // 빈 페이지: 원본 페이지와 같은 크기로
      const origPage = doc.getPage(i);
      const { width, height } = origPage.getSize();
      newDoc.addPage([width, height]);
    } else {
      const [copied] = await newDoc.copyPages(doc, [i]);
      newDoc.addPage(copied);
    }
  }

  // 메타 보존
  newDoc.setTitle(`Terra Nova · ${level.toUpperCase()} 6월호`);
  newDoc.setAuthor('Terra Nova English');
  newDoc.setSubject('Monthly English Textbook · 2026-06');
  newDoc.setCreator('Terra Nova Textbook Builder');
  newDoc.setProducer('Terra Nova / pdf-lib');

  const outBytes = await newDoc.save({ useObjectStreams: true });
  writeFileSync(srcPath, outBytes);

  console.log(`[${level}] ✓ ${errorPages.length}p 백지화 완료 → ${srcPath.replace(root + '/', '').replace(/\\/g, '/')} (${(outBytes.length/1024/1024).toFixed(1)}MB)\n`);
}

console.log('완료. 원본은 *.raw.pdf 로 보존됨.');
