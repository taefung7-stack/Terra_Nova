#!/usr/bin/env node
/* ===================================================================
 * 천재(조수경) 영어II · Lesson 3 본문분석 합본 — 일회성 스크립트
 * ===================================================================
 * dist/{1..6}.html 의 .page 섹션을 번호순으로 이어 붙여 단일 PDF 로 만든다.
 *
 * 핵심: 합본 전체 기준으로 **페이지 번호를 1부터 연속 재부여**한다.
 *   각 챕터 PDF 는 저마다 1부터 시작하므로 그대로 이으면 1-6, 1-7, 1-6…
 *   이 되어 합본으로 못 쓴다.
 *
 * ★ CSS 경로는 하드코딩하지 말 것 — path.relative 로 계산한다.
 *   CSS 가 없으면 .page 의 A4 고정 높이가 풀려 페이지가 재배치되고 장수가
 *   유실된다(신서고 폴더에서 34섹션 → 28페이지 유실 사고).
 *   합본 후 .page 섹션 수 = PDF 페이지 수를 자동 대조해 이를 막는다.
 *
 * 렌더는 builder/pdf-image.mjs(스크린샷 합성) — page.pdf() 인쇄 경로는
 * Pretendard 한글런 안의 [ ] ' - 를 tofu(☰)로 깨뜨린다.
 *
 * 사용법:
 *   node _oneoff-천재영어2-L3/combine-analysis.mjs [출력파일명.pdf]
 * =================================================================== */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { SOURCE } from './_SOURCE.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(HERE, 'dist');
const outName = process.argv[2] || '천재영어2_Lesson3_본문분석_합본.pdf';

const cssHref = (path.relative(DIST, path.join(HERE, 'styles', 'analysis.css')) || '')
  .replace(/\\/g, '/');

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ── 1) 챕터별 .page 섹션 수집 + 번호 재부여 ─────────────────────
const files = (await fs.readdir(DIST))
  .filter(f => /^\d+\.html$/.test(f))
  .sort((a, b) => parseInt(a) - parseInt(b));
if (!files.length) { console.error(`dist 에 {N}.html 이 없습니다: ${DIST}`); process.exit(1); }

let allPages = '';
let pageNo = 0;
const toc = [];

for (const f of files) {
  const chNo = parseInt(f);
  const ch = SOURCE.find(c => c.no === chNo);
  const html = await fs.readFile(path.join(DIST, f), 'utf8');
  const body = (html.match(/<body>([\s\S]*?)<\/body>/i) || [, html])[1];
  const sections = body.match(/<section class="page"[^>]*>[\s\S]*?<\/section>/g) || [];
  if (!sections.length) { console.warn(`   ⚠️  ${f}: .page 섹션 없음 — 건너뜀`); continue; }

  toc.push({ no: chNo, subtitle: ch?.subtitle ?? `Chapter ${chNo}`, start: pageNo + 1, pages: sections.length });

  const renumbered = sections.map(sec => {
    pageNo += 1;
    let done = false;
    return sec.replace(/(<span class="pageno">)(\d+)(<\/span>)/, (m, a, _n, c) => {
      if (done) return m;
      done = true;
      return `${a}${pageNo}${c}`;
    });
  });

  allPages += `\n<!-- ===== Chapter ${chNo} · ${ch?.subtitle ?? ''} ===== -->\n` + renumbered.join('\n');
  console.log(`   ✓ Ch${chNo} ${String(sections.length).padStart(2)}p  → 합본 ${toc[toc.length - 1].start}~${pageNo}p`);
}

// ── 2) 표지 + 목차 (번호 없음) ──────────────────────────────────
const totalSentences = SOURCE.reduce((a, c) => a + c.sentences.length, 0);
const tocRows = toc.map(t => `      <div class="toc-row">
        <span class="toc-no">${t.no}</span>
        <span class="toc-title">${esc(t.subtitle)}</span>
        <span class="toc-dots"></span>
        <span class="toc-page">${t.start}</span>
      </div>`).join('\n');

const cover = `<section class="page cover-page">
  <div class="page-body">
  <div class="cover-wrap">
    <div class="cover-brand">Terra Nova</div>
    <div class="cover-title">천재(조수경) 영어II<br>Lesson 3 본문 분석</div>
    <div class="cover-sub">Seeds as the Best Survival Strategy</div>
    <div class="cover-meta">본문 분석 합본 · 전 ${pageNo}페이지 · 원문 ${totalSentences}문장 전수 분석</div>
  </div>
  </div>
</section>

<section class="page toc-page-sec">
  <div class="page-body">
    <div class="section-bar">CONTENTS · 목차<span class="bar-sub">${toc.length}개 챕터</span></div>
    <div class="toc-list">
${tocRows}
    </div>
  </div>
</section>`;

const extraCss = `
  /* 합본 N페이지 누적 시 페이지 경계 드리프트 방지 — A4 박스 고정. */
  @page { size: A4; margin: 0; }
  html, body { margin: 0; padding: 0; }
  .page { box-sizing: border-box; margin: 0 auto; box-shadow: none; }

  .cover-page { align-items:center; justify-content:center; text-align:center; padding:14mm; }
  .cover-page .page-body { display:flex; align-items:center; justify-content:center; }
  .cover-wrap { max-width: 82%; margin: auto; }
  .cover-brand { font-size:17pt; font-weight:800; letter-spacing:.08em; color:var(--c-mint-deep); margin-bottom:22px; }
  .cover-title { font-size:27pt; font-weight:800; color:var(--c-text); line-height:1.3; margin-bottom:16px; }
  .cover-sub   { font-size:13.5pt; font-weight:700; color:var(--c-text-soft); line-height:1.6; margin-bottom:26px; font-style:italic; }
  .cover-meta  { font-size:10.5pt; color:var(--c-muted); letter-spacing:.02em; }

  .toc-page-sec .toc-list { margin-top: 14px; display: flex; flex-direction: column; gap: 10px; }
  .toc-row { display:flex; align-items:baseline; gap:10px; padding:10px 12px; border:1px solid var(--c-line); border-radius:6px; background:#fff; }
  .toc-no { font-size:13pt; font-weight:800; color:var(--c-mint-deep); min-width:24px; }
  .toc-title { font-size:11pt; font-weight:600; color:var(--c-text); }
  .toc-dots { flex:1; border-bottom:1px dotted var(--c-line); transform:translateY(-3px); }
  .toc-page { font-size:11pt; font-weight:700; color:var(--c-text-soft); }
`;

const combinedHtml = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>천재(조수경) 영어II Lesson 3 본문분석 합본 — Terra Nova</title>
<link rel="stylesheet" href="${cssHref}">
<style>${extraCss}</style>
</head>
<body>
${cover}
${allPages}
</body>
</html>`;

const combinedHtmlPath = path.join(DIST, 'analysis-combined.html');
await fs.writeFile(combinedHtmlPath, combinedHtml, 'utf8');
const expected = pageNo + 2;   // 표지 + 목차
console.log(`\n📄 analysis-combined.html — 표지1 + 목차1 + 본문 ${pageNo}p (총 ${expected}p)`);

// ── 3) PDF 렌더 (글리프 안전 경로) ──────────────────────────────
const outPath = path.join(DIST, outName);
const pdfImage = path.join(HERE, '..', 'builder', 'pdf-image.mjs');
await new Promise((resolve, reject) => {
  const p = spawn(process.execPath, [pdfImage, combinedHtmlPath, outPath], { stdio: 'inherit' });
  p.on('exit', code => code === 0 ? resolve() : reject(new Error('pdf-image exit ' + code)));
});

// ── 4) 페이지 수 대조 (CSS 깨짐 → 페이지 유실 방지) ─────────────
const pdfBuf = await fs.readFile(outPath);
const actual = (pdfBuf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
console.log(`\n🔍 페이지 대조: .page 섹션 ${expected} vs PDF ${actual}`);
if (actual !== expected) {
  console.error('❌ 페이지 수 불일치 — CSS 경로/페이지 재배치 확인 필요');
  process.exit(1);
}
console.log(`✅ 본문분석 합본 → ${path.relative(process.cwd(), outPath)}`);
