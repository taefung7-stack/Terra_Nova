#!/usr/bin/env node
/**
 * 2026-07 Jupiter(고2) 완성본에 백지 3장 삽입 (1회용).
 *
 * Jupiter 는 fullbook 소스가 폴더에 없고 이미 완성본(137p)만 존재하므로,
 * Saturn/Sun 처럼 재합본하지 않고 기존 137p 완성본에 백지만 끼워 넣는다.
 *
 * 기존 137p 구조: 앞표지(p1) + 판권(p2) + 본문(p3~136) + 뒷표지(p137)
 * 결과 140p 구조: 앞표지 + [백지] + 판권 + [백지] + 본문 + [백지] + 뒷표지
 *   → 표지 뒤 / 판권 뒤 / 뒷표지 앞 에 각각 백지 1장.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument } from 'pdf-lib';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const A4_W = 595.28, A4_H = 841.89;

const src = join(root, 'dist', '2026-07', '2026-07-Jupiter (고2)', '2026-07-Jupiter.pdf');
const srcDoc = await PDFDocument.load(readFileSync(src), { ignoreEncryption: true });
const total = srcDoc.getPageCount();
if (total !== 137) {
  console.error(`예상치 못한 페이지 수: ${total}p (137p 가정). 중단.`);
  process.exit(1);
}

const out = await PDFDocument.create();
const addBlank = () => out.addPage([A4_W, A4_H]);
const copy = async (idx) => {
  const [p] = await out.copyPages(srcDoc, [idx]);
  out.addPage(p);
};

await copy(0);            // 앞표지
addBlank();              // 백지 (표지 뒤)
await copy(1);            // 판권
addBlank();              // 백지 (판권 뒤)
for (let i = 2; i <= 135; i++) await copy(i);  // 본문 134p (p3~p136 = idx 2~135)
addBlank();              // 백지 (뒷표지 앞)
await copy(136);         // 뒷표지

out.setTitle('Terra Nova · 고2 JUPITER 2026년 7월호');
out.setAuthor('Terra Nova English');
out.setSubject('Monthly English Textbook · 2026-07');
out.setCreator('Terra Nova Textbook Builder');
out.setProducer('Terra Nova / pdf-lib');

const bytes = await out.save({ useObjectStreams: true });
let target = src;
try {
  writeFileSync(src, bytes);
} catch (e) {
  if (e.code === 'EBUSY' || e.code === 'EPERM') {
    target = src.replace(/\.pdf$/, '.NEW.pdf');
    writeFileSync(target, bytes);
    console.log(`⚠️ 원본이 열려 있어 잠김 — 임시본으로 저장: ${target}`);
    console.log('   PDF 뷰어를 닫은 뒤 이 파일을 원본 이름으로 교체하세요.');
  } else throw e;
}
const sz = (readFileSync(target).length / 1024 / 1024).toFixed(1);
console.log(`✓ Jupiter 백지 삽입 완료: ${out.getPageCount()}p (앞표지1 + 백지1 + 판권1 + 백지1 + 본문134 + 백지1 + 뒷표지1), ${sz}MB`);
