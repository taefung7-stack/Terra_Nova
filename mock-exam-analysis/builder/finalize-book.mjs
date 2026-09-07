#!/usr/bin/env node
/* ===================================================================
 * 합본 후처리 — 연속 페이지 번호 재부여 + (옵션) 브랜드 제거
 * ===================================================================
 * 합본 HTML 은 각 지문 HTML 의 .page 를 그대로 이어 붙이므로
 * 푸터 페이지 번호가 지문마다 1 로 리셋된다. 이 스크립트가 합본 전체를
 * 통산 번호(표지 다음부터 1..N)로 다시 매긴다.
 *
 * --no-brand 를 주면 푸터 좌측 브랜드("Terra Nova · …")를 비운다.
 * 표지의 cover-brand 는 건드리지 않는다(표지는 브랜드 면).
 *
 * 사용법:
 *   node builder/finalize-book.mjs <합본.html> [--out=<출력.html>] [--no-brand]
 * =================================================================== */
import fs from 'node:fs/promises';
import path from 'node:path';

function parseArgs(argv) {
  const src = argv[2];
  if (!src) {
    console.error('Usage: node builder/finalize-book.mjs <합본.html> [--out=<파일>] [--no-brand]');
    process.exit(1);
  }
  let out = null;
  let noBrand = false;
  for (const a of argv.slice(3)) {
    if (a === '--no-brand') noBrand = true;
    else if (a.startsWith('--out=')) out = a.slice(6);
    else { console.error('알 수 없는 옵션: ' + a); process.exit(1); }
  }
  return { src, out, noBrand };
}

async function main() {
  const { src, out, noBrand } = parseArgs(process.argv);
  const srcPath = path.resolve(process.cwd(), src);
  const outPath = out ? path.resolve(process.cwd(), out) : srcPath;

  let html = await fs.readFile(srcPath, 'utf8');

  // 1) 페이지 번호 통산 재부여 — 표지(cover-page)에는 푸터가 없으므로
  //    본문 푸터가 나오는 순서대로 1..N.
  let n = 0;
  html = html.replace(/(<span class="pageno">)(\d+)(<\/span>)/g,
    (_m, a, _old, c) => `${a}${++n}${c}`);

  // 2) 브랜드 제거(옵션) — 푸터 좌측 + 표지 브랜드.
  let brandCleared = 0;
  let coverCleared = 0;
  if (noBrand) {
    html = html.replace(/(<span class="brand">)([\s\S]*?)(<\/span>)/g, (m, a, body, c) => {
      if (!body.trim()) return m;
      brandCleared++;
      return `${a}${c}`;
    });
    html = html.replace(/(<div class="cover-brand">)([\s\S]*?)(<\/div>)/g, (m, a, body, c) => {
      if (!body.trim()) return m;
      coverCleared++;
      return `${a}${c}`;
    });
  }

  await fs.writeFile(outPath, html, 'utf8');
  const brandMsg = noBrand
    ? ` · 브랜드 제거(푸터 ${brandCleared}곳, 표지 ${coverCleared}곳)`
    : '';
  console.log(`✅ ${path.basename(outPath)} — 페이지 ${n}쪽 재번호${brandMsg}`);
}

main().catch(e => { console.error(e); process.exit(1); });
