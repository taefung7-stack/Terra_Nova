#!/usr/bin/env node
/* ===================================================================
 * 신서고 YBM 영어II L1 — 5개 챕터 분석지 합본 (일회성)
 * ===================================================================
 * dist/{1..5}.html 의 .page 섹션을 순서대로 이어붙여 단일 PDF 로 만든다.
 * 공용 builder/combine.mjs 는 모의고사 표지("18~45번" 등)가 하드코딩돼 있고
 * 페이지 번호를 챕터별 원본(1..7, 1..7, ...)그대로 두므로 이 폴더 전용으로 분리.
 *
 * 핵심: 합본 전체를 통해 **페이지 번호를 1부터 연속 재부여**한다.
 *   각 .page 의 <span class="pageno">N</span> 을 누적 카운터로 교체.
 *   표지는 번호를 매기지 않는다(표지 다음 본문이 1페이지).
 *
 * 사용법:
 *   node _oneoff-신서고-YBM-L1/combine.mjs [출력파일명.pdf]
 * =================================================================== */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { SOURCE } from './_SOURCE.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, 'dist');

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const outName = process.argv[2] || '신서고2-2중간_YBM영어II_Lesson1_본문분석_합본.pdf';

// ── 1) 챕터별 .page 섹션 수집 ────────────────────────────────────
const files = (await fs.readdir(DIST))
  .filter(f => /^\d+\.html$/.test(f))
  .sort((a, b) => parseInt(a) - parseInt(b));
if (!files.length) {
  console.error(`dist 에 {N}.html 이 없습니다: ${DIST}`);
  process.exit(1);
}

let allPages = '';
let pageNo = 0;                       // 본문 페이지 누적 카운터(표지 제외)
const toc = [];                       // 목차용: 챕터 시작 페이지

for (const f of files) {
  const chNo = parseInt(f);
  const ch = SOURCE.find(c => c.no === chNo);
  const html = await fs.readFile(path.join(DIST, f), 'utf8');
  const body = (html.match(/<body>([\s\S]*?)<\/body>/i) || [, html])[1];
  const sections = body.match(/<section class="page">[\s\S]*?<\/section>/g) || [];
  if (!sections.length) {
    console.warn(`   ⚠️  ${f}: .page 섹션을 찾지 못함 — 건너뜀`);
    continue;
  }

  toc.push({ no: chNo, subtitle: ch?.subtitle ?? `Chapter ${chNo}`, start: pageNo + 1, pages: sections.length });

  const renumbered = sections.map(sec => {
    pageNo += 1;
    // 푸터의 페이지 번호를 합본 기준 연속 번호로 교체.
    // .pageno 는 각 .page 에 정확히 1개 — 첫 번째 것만 안전하게 치환한다.
    let replaced = false;
    return sec.replace(/(<span class="pageno">)(\d+)(<\/span>)/, (m, a, _n, c) => {
      if (replaced) return m;
      replaced = true;
      return `${a}${pageNo}${c}`;
    });
  });

  allPages += `\n<!-- ===== Chapter ${chNo} · ${ch?.subtitle ?? ''} ===== -->\n` + renumbered.join('\n');
  console.log(`   ✓ Ch${chNo} ${String(sections.length).padStart(2)}p  → 합본 ${toc[toc.length - 1].start}~${pageNo}p`);
}

// ── 2) 표지 + 목차 (번호 없음) ──────────────────────────────────
const tocRows = toc.map(t => `      <div class="toc-row">
        <span class="toc-no">${t.no}</span>
        <span class="toc-title">${esc(t.subtitle)}</span>
        <span class="toc-dots"></span>
        <span class="toc-page">${t.start}</span>
      </div>`).join('\n');

const cover = `<section class="page cover-page">
  <div class="cover-wrap">
    <div class="cover-brand">Terra Nova</div>
    <div class="cover-title">신서고 2학년 2학기<br>중간고사 대비</div>
    <div class="cover-sub">YBM(박준언) 영어II · Lesson 1<br>The Story of Hip-Hop Music</div>
    <div class="cover-meta">본문 분석 합본 · 전 ${pageNo}페이지 · 원문 70문장 전수 분석</div>
  </div>
</section>

<section class="page toc-page-sec">
  <div class="page-body">
    <div class="section-bar">CONTENTS · 목차<span class="bar-sub">5개 챕터</span></div>
    <div class="toc-list">
${tocRows}
    </div>
  </div>
</section>`;

const extraCss = `
  /* 합본 N페이지 누적 시 Chromium PDF 페이지 경계 드리프트 방지 — A4 박스 고정.
     .page 의 화면용 margin(12px)·그림자는 PDF 에서 누적 오차를 만들므로 제거한다. */
  @page { size: A4; margin: 0; }
  html, body { margin: 0; padding: 0; }
  .page { box-sizing: border-box; margin: 0 auto; box-shadow: none; }

  /* .page 는 이미 display:flex; flex-direction:column 이므로 세로축이 main axis.
     표지는 위/아래 패딩이 비대칭(12mm/16mm)이라 justify-content:center 만으로는
     살짝 아래로 내려가 보인다 → 패딩을 대칭으로 잡고 wrap 을 margin:auto 로 띄운다. */
  .cover-page { align-items:center; justify-content:center; text-align:center; padding:14mm; }
  .cover-wrap { max-width: 82%; margin: auto; }
  .cover-brand { font-family:'Inter'; font-size:17pt; font-weight:800; letter-spacing:.08em; color:var(--c-mint-deep); margin-bottom:22px; }
  .cover-title { font-size:29pt; font-weight:800; color:var(--c-text); line-height:1.3; margin-bottom:18px; }
  .cover-sub   { font-size:14pt; font-weight:700; color:var(--c-text-soft); line-height:1.6; margin-bottom:26px; }
  .cover-meta  { font-size:10.5pt; color:var(--c-muted); letter-spacing:.02em; }

  .toc-page-sec .toc-list { margin-top: 14px; display: flex; flex-direction: column; gap: 10px; }
  .toc-row { display:flex; align-items:baseline; gap:10px; padding:10px 12px; border:1px solid var(--c-line); border-radius:6px; background:#fff; }
  .toc-no { font-family:'Inter'; font-size:13pt; font-weight:800; color:var(--c-mint-deep); min-width:24px; }
  .toc-title { font-family:'Inter'; font-size:11pt; font-weight:600; color:var(--c-text); }
  .toc-dots { flex:1; border-bottom:1px dotted var(--c-line); transform:translateY(-3px); }
  .toc-page { font-family:'Inter'; font-size:11pt; font-weight:700; color:var(--c-text-soft); }
`;

const combinedHtml = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>신서고 2-2 중간 · YBM 영어II Lesson 1 본문분석 합본 — Terra Nova</title>
<link rel="stylesheet" href="../styles/analysis.css">
<style>${extraCss}</style>
</head>
<body>
${cover}
${allPages}
</body>
</html>`;

const combinedHtmlPath = path.join(DIST, 'combined.html');
await fs.writeFile(combinedHtmlPath, combinedHtml, 'utf8');
console.log(`\n📄 combined.html — 표지1 + 목차1 + 본문 ${pageNo}p (총 ${pageNo + 2}p)`);

// ── 3) PDF 렌더 ────────────────────────────────────────────────
const puppeteer = (await import('puppeteer')).default;
const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.goto(pathToFileURL(combinedHtmlPath).href, { waitUntil: 'networkidle0' });
const outPath = path.join(DIST, outName);
await page.pdf({
  path: outPath, format: 'A4', printBackground: true,
  margin: { top: '0', bottom: '0', left: '0', right: '0' },
  preferCSSPageSize: true,
});
await browser.close();
console.log(`✅ 합본 PDF → ${path.relative(process.cwd(), outPath)}`);
