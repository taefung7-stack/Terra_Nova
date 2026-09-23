#!/usr/bin/env node
/* ===================================================================
 * 신남중2 추가지문 — Worksheet 5-9 More Reading 본문분석 합본
 * ===================================================================
 * _oneoff-신서중2-미래엔/combine-more.mjs 를 복제해 이 폴더용으로 조정.
 * dist/MR5/1.html 의 .page 섹션을 표지 + 본문 전문 페이지와 이어붙여
 * 단일 PDF 로 만든다. 페이지 번호는 합본 전체 기준 1부터 재부여.
 *
 * 사용법:
 *   node _oneoff-신남중2-추가지문/combine.mjs MR5
 * =================================================================== */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { SOURCE as SOURCE_MR5 } from './_SOURCE-MR5.js';
import { SOURCE as SOURCE_MR6 } from './_SOURCE-MR6.js';
import { countSMasks, flatten } from '../builder/goodnotes-safe.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LESSONS = {
  MR5: {
    source: SOURCE_MR5,
    coverTitle: '신남중 2학년<br>추가지문',
    titleEn: 'Banksy and Girl with Balloon',
    coverSub: 'Worksheet 5-9 · More Reading',
    docTitle: '신남중 2학년 · Worksheet 5-9 More Reading 본문분석 — Terra Nova',
    out: '신남중2_추가지문_Worksheet5-9_본문분석.pdf',
  },
  MR6: {
    source: SOURCE_MR6,
    coverTitle: '신남중 2학년<br>추가지문',
    titleEn: 'Homer B. Hulbert, a True Friend of Korea',
    coverSub: 'Worksheet 6-9 · More Reading',
    docTitle: '신남중 2학년 · Worksheet 6-9 More Reading 본문분석 — Terra Nova',
    out: '신남중2_추가지문_Worksheet6-9_본문분석.pdf',
  },
};

const lessonId = (process.argv[2] || 'MR5').toUpperCase();
const LESSON = LESSONS[lessonId];
if (!LESSON) {
  console.error(`알 수 없는 지문: ${lessonId} (MR5 / MR6)`);
  process.exit(2);
}
const SOURCE = LESSON.source;
const DIST = path.join(__dirname, 'dist', lessonId);

const SENTENCE_TOTAL = SOURCE.reduce((a, c) => a + (c.sentences?.length ?? 0), 0);

const cssHref = (path.relative(DIST, path.join(__dirname, 'styles', 'analysis.css')) || '')
  .replace(/\\/g, '/');

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const outName = process.argv[3] || LESSON.out;

// ── 1) 챕터별 .page 섹션 수집 (MR5/MR6는 항상 1.html 하나) ─────────
const files = (await fs.readdir(DIST))
  .filter(f => /^\d+\.html$/.test(f))
  .sort((a, b) => parseInt(a) - parseInt(b));
if (!files.length) {
  console.error(`dist 에 {N}.html 이 없습니다: ${DIST}`);
  process.exit(1);
}

let allPages = '';
let pageNo = 0;

for (const f of files) {
  const chNo = parseInt(f);
  const ch = SOURCE.find(c => c.no === chNo);
  const html = await fs.readFile(path.join(DIST, f), 'utf8');
  const body = (html.match(/<body>([\s\S]*?)<\/body>/i) || [, html])[1];
  let sections = body.match(/<section class="page">[\s\S]*?<\/section>/g) || [];
  if (!sections.length) {
    console.warn(`   ⚠️  ${f}: .page 섹션을 찾지 못함 — 건너뜀`);
    continue;
  }

  /* MR5/MR6는 항상 1챕터라 표지 다음 "FULL TEXT · 본문 전문" 페이지가 이미
     원문 전 문장 + 해석을 담는다. 챕터 HTML 안의 "PASSAGE · 본문 전문 (문장별 해석)"
     페이지는 정확히 같은 내용을 중복 렌더하므로 합본에서는 제외한다.
     (정식 L5/L6처럼 여러 챕터면 각 PASSAGE가 그 챕터 분량만 보여줘 안 겹치지만,
      1챕터짜리 More Reading은 두 페이지가 완전히 동일해진다 — 2026-09-21 발견) */
  const before = sections.length;
  sections = sections.filter(sec => !/본문\s*전문\s*\(문장별\s*해석\)/.test(sec));
  if (sections.length < before) {
    console.log(`   ↔ ${lessonId}: PASSAGE 본문전문 중복 페이지 ${before - sections.length}개 제외`);
  }

  const renumbered = sections.map(sec => {
    pageNo += 1;
    let replaced = false;
    return sec.replace(/(<span class="pageno">)(\d+)(<\/span>)/, (m, a, _n, c) => {
      if (replaced) return m;
      replaced = true;
      return `${a}${pageNo}${c}`;
    });
  });

  allPages += `\n<!-- ===== ${lessonId} · ${ch?.subtitle ?? ''} ===== -->\n` + renumbered.join('\n');
  console.log(`   ✓ ${lessonId} ${String(sections.length).padStart(2)}p`);
}

// ── 2) 표지 + 본문 전문 (목차 대신) ──────────────────────────────
const fullLines = [];
let gIdx = 0;
for (const ch of SOURCE) {
  let ko = [];
  try {
    ko = JSON.parse(await fs.readFile(path.join(__dirname, 'data', lessonId, `${ch.no}.json`), 'utf8')).passage_ko || [];
  } catch { /* 해석이 없으면 영어만 싣는다 */ }
  ch.sentences.forEach((en, i) => {
    gIdx += 1;
    fullLines.push(`      <div class="line">
        <span class="num">${gIdx}</span>
        <div class="ft-en">${esc(en)}</div>
        <div class="ft-ko">${esc(ko[i] ?? '')}</div>
      </div>`);
  });
}
const tocRows = fullLines.join('\n');

const cover = `<section class="page cover-page">
  <div class="cover-wrap">
    <div class="cover-brand">Terra Nova</div>
    <div class="cover-title">${LESSON.coverTitle}</div>
    <div class="cover-sub">${LESSON.coverSub}<br>${esc(LESSON.titleEn)}</div>
    <div class="cover-meta">본문 분석 · 전 ${pageNo}페이지 · 원문 ${SENTENCE_TOTAL}문장 전수 분석</div>
  </div>
</section>

<section class="page toc-page-sec">
  <div class="page-body">
    <div class="section-bar alt">FULL TEXT · 본문 전문<span class="bar-sub">원문 ${SENTENCE_TOTAL}문장</span></div>
    <div class="fulltext fulltext-all">
${tocRows}
    </div>
  </div>
</section>`;

const extraCss = `
  @page { size: A4; margin: 0; }
  html, body { margin: 0; padding: 0; }
  .page { box-sizing: border-box; margin: 0 auto; box-shadow: none; }

  .cover-page { align-items:center; justify-content:center; text-align:center; padding:14mm; }
  .cover-wrap { max-width: 82%; margin: auto; }
  .cover-brand { font-family:'Inter'; font-size:17pt; font-weight:800; letter-spacing:.08em; color:var(--c-mint-deep); margin-bottom:22px; }
  .cover-title { font-size:29pt; font-weight:800; color:var(--c-text); line-height:1.3; margin-bottom:18px; }
  .cover-sub   { font-size:14pt; font-weight:700; color:var(--c-text-soft); line-height:1.6; margin-bottom:26px; }
  .cover-meta  { font-size:10.5pt; color:var(--c-muted); letter-spacing:.02em; }

  .toc-page-sec .page-body { overflow: hidden; }
  .fulltext-all {
    --ft: 1;
    margin-top: calc(9px * var(--ft));
    gap: 0;
    padding: calc(8px * var(--ft)) calc(13px * var(--ft));
  }
  .fulltext-all .line {
    padding: calc(2.6px * var(--ft)) 0 calc(2.6px * var(--ft)) calc(23px * var(--ft));
  }
  .fulltext-all .num {
    width: calc(17px * var(--ft));
    height: calc(15px * var(--ft));
    line-height: calc(15px * var(--ft));
    font-size: calc(7.4pt * var(--ft));
    top: calc(2px * var(--ft));
  }
  .fulltext-all .ft-en { font-size: calc(9.1pt * var(--ft)); line-height: 1.4; }
  .fulltext-all .ft-ko { font-size: calc(8.2pt * var(--ft)); line-height: 1.38; margin-top: calc(1px * var(--ft)); }
`;

const combinedHtml = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>${LESSON.docTitle}</title>
<link rel="stylesheet" href="${cssHref}">
<style>${extraCss}</style>
</head>
<body>
${cover}
${allPages}
</body>
</html>`;

const combinedHtmlPath = path.join(DIST, 'combined.html');
await fs.writeFile(combinedHtmlPath, combinedHtml, 'utf8');
console.log(`\n📄 combined.html — 표지1 + 본문전문1 + 본문 ${pageNo}p (총 ${pageNo + 2}p)`);

// ── 3) PDF 렌더 ────────────────────────────────────────────────
const puppeteer = (await import('puppeteer')).default;
const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.goto(pathToFileURL(combinedHtmlPath).href, { waitUntil: 'networkidle0' });

const fitScale = await page.evaluate(() => {
  const list = document.querySelector('.fulltext-all');
  if (!list) return null;
  const body = list.closest('.page-body');
  const fits = (v) => {
    list.style.setProperty('--ft', String(v));
    void body.offsetHeight;
    return body.scrollHeight <= body.clientHeight;
  };
  let lo = 0.6, hi = 2.0;
  if (!fits(lo)) { list.style.setProperty('--ft', String(lo)); return lo; }
  for (let i = 0; i < 22; i++) {
    const mid = (lo + hi) / 2;
    if (fits(mid)) lo = mid; else hi = mid;
  }
  const v = Math.floor(lo * 1000) / 1000;
  list.style.setProperty('--ft', String(v));
  return v;
});

if (fitScale != null) {
  const m = await page.evaluate(() => {
    const b = document.querySelector('.fulltext-all').closest('.page-body');
    return { used: b.scrollHeight, avail: b.clientHeight };
  });
  console.log(`   ↔ 본문 전문 자동 맞춤: 배율 ${fitScale}  (${m.used}/${m.avail}px, ${(m.used / m.avail * 100).toFixed(1)}% 사용)`);
  const fixed = combinedHtml.replace('.fulltext-all {\n    --ft: 1;', `.fulltext-all {\n    --ft: ${fitScale};`);
  await fs.writeFile(combinedHtmlPath, fixed, 'utf8');
}

const outPath = path.join(DIST, outName);
await page.pdf({
  path: outPath, format: 'A4', printBackground: true,
  margin: { top: '0', bottom: '0', left: '0', right: '0' },
  preferCSSPageSize: true,
});
await browser.close();
console.log(`✅ 합본 PDF → ${path.relative(process.cwd(), outPath)}`);

const smBefore = countSMasks(outPath);
if (smBefore > 0) {
  flatten(outPath);
  console.log(`✅ 굿노트 안전화 → 소프트마스크 ${smBefore}개 제거 (/SMask 0)`);
}
