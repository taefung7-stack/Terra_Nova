#!/usr/bin/env node
/**
 * 6월호 신간 검수 — Neptune / Uranus / Terra.
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { PDFDocument } from 'pdf-lib';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const levels = ['Neptune', 'Uranus', 'Terra'];

function pageText(pdfPath, page) {
  try {
    return execFileSync('pdftotext', ['-layout', '-f', String(page), '-l', String(page), pdfPath, '-'], {
      encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
  } catch {
    return '';
  }
}

console.log('=== Terra Nova 2026-06 신간 QA Report ===\n');

const summary = [];

for (const level of levels) {
  const distDir = join(root, 'dist', '2026-06', `2026-06-${level}`);
  const finalPath = join(distDir, `2026-06-${level}.pdf`);
  const txtPath = join(root, 'tmp', 'june-text', `${level}.txt`);

  if (!existsSync(finalPath)) {
    console.log(`[${level}] FAIL: ${finalPath} 없음`);
    continue;
  }

  const bytes = readFileSync(finalPath);
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const pageCount = doc.getPageCount();
  const sizeMB = (bytes.length / 1024 / 1024).toFixed(1);

  const txt = existsSync(txtPath) ? readFileSync(txtPath, 'utf-8') : '';
  // 헤더 매치 — 줄 시작 + (공백 허용)
  const passageCount = (txt.match(/^PASSAGE\b/gm) || []).length;
  const practiceCount = (txt.match(/^PRACTICE\b/gm) || []).length;
  const syntaxCount = (txt.match(/^SYNTAX\b/gm) || []).length;
  const vocabCount = (txt.match(/^VOCAB\b/gm) || []).length;

  // 빌더 누출
  const missingCurriculum = (txt.match(/Missing curriculum:/g) || []).length;
  const missingData = (txt.match(/Missing data:/g) || []).length;

  // 누출 위치 (페이지 추정 — 본문 첫 'PASSAGE'까지의 위치로 페이지 추정)
  const leakLines = [];
  const lines = txt.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (/Missing (curriculum|data):/.test(lines[i])) {
      leakLines.push({ line: i + 1, text: lines[i].trim() });
    }
  }

  // 페이지 1-2 (목차 placeholder)
  const p2Txt = pageText(finalPath, 2);
  const p3Txt = pageText(finalPath, 3);

  // 본문 정답 노출 (Q1~Q5 답을 PRACTICE 페이지에 직접 표기했는지)
  const spoilers = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*정답:\s*[0-9]/.test(lines[i])) spoilers.push(`line ${i + 1}`);
  }

  console.log(`[${level}]`);
  console.log(`  파일: ${finalPath.replace(root + '/', '').replace(/\\/g, '/')}`);
  console.log(`  페이지: ${pageCount}p (expected 136)`);
  console.log(`  파일 크기: ${sizeMB}MB`);
  console.log(`  PASSAGE 수: ${passageCount} ${passageCount === 20 ? '✓' : '✗'} (expected 20)`);
  console.log(`  PRACTICE 수: ${practiceCount} ${practiceCount === 20 ? '✓' : '✗'} (expected 20)`);
  console.log(`  SYNTAX 수: ${syntaxCount} ${syntaxCount === 20 ? '✓' : '✗'} (expected 20)`);
  console.log(`  VOCAB 수: ${vocabCount} ${vocabCount === 20 ? '✓' : '✗'} (expected 20)`);
  console.log(`  p2(TOC) 내용 길이: ${p2Txt.length}자 (목차 placeholder)`);
  console.log(`  p3(TOC) 내용 길이: ${p3Txt.length}자 (목차 placeholder)`);
  console.log(`  Missing curriculum 누출: ${missingCurriculum > 0 ? `✗ × ${missingCurriculum}` : '✓'}`);
  console.log(`  Missing data 누출: ${missingData > 0 ? `✗ × ${missingData}` : '✓'}`);
  console.log(`  본문 정답 노출: ${spoilers.length > 0 ? '✗ × ' + spoilers.length : '✓'}`);
  if (leakLines.length > 0) {
    console.log(`  ⚠ 빌더 경고 누출 라인:`);
    for (const l of leakLines.slice(0, 12)) {
      console.log(`     line ${l.line}: ${l.text}`);
    }
    if (leakLines.length > 12) console.log(`     ... +${leakLines.length - 12} more`);
  }
  console.log('');

  summary.push({
    level, pages: pageCount, size: sizeMB,
    passages: passageCount, practices: practiceCount,
    syntax: syntaxCount, vocab: vocabCount,
    missingCurriculum, missingData, spoilers: spoilers.length
  });
}

console.log('=== Summary ===');
console.log('| Level   | Pages | Size  | PASSAGE | PRACTICE | SYNTAX | VOCAB | Missing curr | Missing data | Spoilers |');
console.log('|---------|-------|-------|---------|----------|--------|-------|--------------|--------------|----------|');
for (const s of summary) {
  console.log(
    `| ${s.level.padEnd(7)} | ${String(s.pages).padEnd(5)} | ${(s.size + 'MB').padEnd(5)} | ` +
    `${(String(s.passages) + (s.passages === 20 ? ' ✓' : ' ✗')).padEnd(7)} | ` +
    `${(String(s.practices) + (s.practices === 20 ? ' ✓' : ' ✗')).padEnd(8)} | ` +
    `${(String(s.syntax) + (s.syntax === 20 ? ' ✓' : ' ✗')).padEnd(6)} | ` +
    `${(String(s.vocab) + (s.vocab === 20 ? ' ✓' : ' ✗')).padEnd(5)} | ` +
    `${(s.missingCurriculum > 0 ? '✗ × ' + s.missingCurriculum : '✓').padEnd(12)} | ` +
    `${(s.missingData > 0 ? '✗ × ' + s.missingData : '✓').padEnd(12)} | ` +
    `${(s.spoilers > 0 ? '✗ × ' + s.spoilers : '✓').padEnd(8)} |`
  );
}
