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
 *   node _oneoff-신서고-YBM-L1/combine.mjs <L1|L2> [출력파일명.pdf]
 * =================================================================== */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { SOURCE as SOURCE_L5 } from './_SOURCE-L5.js';
import { SOURCE as SOURCE_L6 } from './_SOURCE-L6.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LESSONS = {
  L5: {
    source: SOURCE_L5,
    lessonNo: 5,
    coverTitle: '신서중 2학년<br>미래엔 영어 2',
    titleEn: 'My Hometown, Chuncheon',
    coverSub: '미래엔(문영인) 중학교 영어 2<br>Lesson 5 · My Hometown, Chuncheon',
    docTitle: '신서중 2학년 · 미래엔 Lesson 5 본문분석 합본 — Terra Nova',
    out: '신서중2_미래엔_Lesson5_본문분석_합본.pdf',
  },
  L6: {
    source: SOURCE_L6,
    lessonNo: 6,
    coverTitle: '신서중 2학년<br>미래엔 영어 2',
    titleEn: 'My First Skateboarding Lesson',
    coverSub: '미래엔(문영인) 중학교 영어 2<br>Lesson 6 · My First Skateboarding Lesson',
    docTitle: '신서중 2학년 · 미래엔 Lesson 6 본문분석 합본 — Terra Nova',
    out: '신서중2_미래엔_Lesson6_본문분석_합본.pdf',
  },
};

const lessonId = (process.argv[2] || 'L5').toUpperCase();
const LESSON = LESSONS[lessonId];
if (!LESSON) {
  console.error(`알 수 없는 과: ${lessonId} (L5 / L6)`);
  process.exit(2);
}
const SOURCE = LESSON.source;
const DIST = path.join(__dirname, 'dist', lessonId);

/* 표지에 찍을 원문 문장 수 — 정본(_SOURCE*.js)에서 계산한다.
 * ★ 하드코딩 금지: 예전에 "Lesson 1 / 70문장" 이 표지에 박혀 있어 L2 합본에도
 *   L1 제목·문장수가 찍히는 사고가 있었다(2026-08-17 발견). */
const SENTENCE_TOTAL = SOURCE.reduce((a, c) => a + (c.sentences?.length ?? 0), 0);

/* combined.html 에서 styles/analysis.css 까지의 상대경로를 실제 위치로 계산한다.
 * ★ 하드코딩('../styles/...') 금지 — dist/{L1,L2}/ 로 한 단계 깊어지면서 경로가 깨졌고,
 *   CSS 가 없으면 .page 의 A4 고정 높이가 사라져 페이지가 재배치되며 장수가 줄어든다
 *   (34섹션 → 28페이지로 유실된 사고). */
const cssHref = (path.relative(DIST, path.join(__dirname, 'styles', 'analysis.css')) || '')
  .replace(/\\/g, '/');

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const outName = process.argv[3] || LESSON.out;

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
/* 목차 대신 '본문 전문' 한 장 — 원문 전 문장을 번호·해석과 함께 한 페이지에 싣는다.
   정본(_SOURCE-*.js)의 영어 문장과 챕터 JSON 의 passage_ko 를 짝지어 만든다.
   (사용자 요청 2026-08-29: 목차 페이지를 본문 문장 나열 페이지로 교체) */
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
    <div class="cover-title">${LESSON.coverTitle ?? '신서고 2학년 2학기<br>중간고사 대비'}</div>
    <div class="cover-sub">${LESSON.coverSub ?? `YBM(박준언) 영어II · Lesson ${LESSON.lessonNo}<br>${esc(LESSON.titleEn)}`}</div>
    <div class="cover-meta">본문 분석 합본 · 전 ${pageNo}페이지 · 원문 ${SENTENCE_TOTAL}문장 전수 분석</div>
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

  /* 본문 전문 한 장 — 원문 전 문장이 A4 한 장에 들어가야 한다.
     .fulltext 기본값(gap:4px, line-height:1.45)으로는 31문장이 1375px 가 되어
     본문 영역(1017px)을 넘겼다. gap 을 없애고 행간·폰트를 줄여 맞춘다.
     ★ .page-body 는 overflow:hidden 이라 넘쳐도 에러 없이 '잘린 채' 인쇄되므로
       문장 수를 늘릴 때는 반드시 실측(_tmp-fit 류)으로 재확인할 것. */
  .toc-page-sec .page-body { overflow: hidden; }
  .fulltext-all { margin-top: 8px; gap: 0; padding: 7px 12px; }
  .fulltext-all .line { padding: 1.2px 0 1.2px 21px; }
  .fulltext-all .num { width: 16px; height: 14px; line-height: 14px; font-size: 7pt; top: 2px; }
  .fulltext-all .ft-en { font-size: 8.45pt; line-height: 1.24; }
  .fulltext-all .ft-ko { font-size: 7.6pt; line-height: 1.22; margin-top: 0; }
`;

const combinedHtml = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>${LESSON.docTitle ?? `신서고 2-2 중간 · YBM 영어II Lesson ${LESSON.lessonNo} 본문분석 합본 — Terra Nova`}</title>
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
const outPath = path.join(DIST, outName);
await page.pdf({
  path: outPath, format: 'A4', printBackground: true,
  margin: { top: '0', bottom: '0', left: '0', right: '0' },
  preferCSSPageSize: true,
});
await browser.close();
console.log(`✅ 합본 PDF → ${path.relative(process.cwd(), outPath)}`);
