#!/usr/bin/env node
/* ===================================================================
 * 신목고 세계문학 — 5개 챕터 워크북 합본 (일회성)
 * ===================================================================
 * dist/{L1,L2}/workbook-{1..5}.html 의 .page 섹션을 순서대로 이어붙여
 * 단일 PDF 로 만든다. 분석지 합본(combine.mjs)과 같은 철학이며 대상만
 * workbook-*.html / workbook.css 로 바뀐다.
 *
 * 공용 builder/combine-workbook.mjs 를 쓰지 않는 이유:
 *   ① cssHref 가 '../styles/workbook.css' 로 하드코딩돼 있어 dist/{L1,L2}/
 *      처럼 한 단계 깊어지면 링크가 깨진다. CSS 가 없으면 .page 의 A4 고정
 *      높이가 사라져 페이지가 재배치되고 장수가 유실된다(2026-08-14 사고).
 *   ② 챕터별 페이지번호를 그대로 두므로 1..11, 1..11, ... 이 되어 합본에
 *      쓸 수 없다. 여기서는 합본 전체 기준으로 1부터 연속 재부여한다.
 *
 * 렌더는 builder/pdf-image.mjs (스크린샷 합성) 를 쓴다 — page.pdf() 인쇄
 * 경로는 Pretendard 한글런 안의 [ ] ' - · 를 tofu(☰)로 깨뜨린다.
 * 워크북은 배열 문제의 [ ... ] 와 hip-hop 하이픈이 많아 특히 취약하다.
 *
 * 사용법:
 *   node _oneoff-신목고-세계문학/combine-workbook.mjs <L1|L2> [출력파일명.pdf]
 * =================================================================== */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LESSONS = {
  U1: {
    lessonNo: null,
    titleEn: 'Cross-Cultural Encounters',
    sentences: 56,
    coverSub: '신목고 2-2 중간 · 세계문학<br>Unit 1 Cross-Cultural Encounters',
    docTitle: '신목고 2-2 중간 · 세계문학 Unit 1 워크북 합본 — Terra Nova',
    out: '신목고2-2중간_세계문학_Unit1_워크북_합본.pdf',
  },
};

const lessonId = (process.argv[2] || 'U1').toUpperCase();
const LESSON = LESSONS[lessonId];
if (!LESSON) {
  console.error(`알 수 없는 유닛: ${lessonId} (U1)`);
  process.exit(2);
}
const DIST = path.join(__dirname, 'dist', lessonId);

/* ★ 하드코딩 금지 — dist/{L1,L2}/ 깊이에 맞춰 실제 상대경로를 계산한다. */
const cssHref = (path.relative(DIST, path.join(__dirname, 'styles', 'workbook.css')) || '')
  .replace(/\\/g, '/');

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const outName = process.argv[3] || LESSON.out;

// 챕터 소제목 — 분석지 데이터(N.json)의 subtitle 을 그대로 재사용
async function chapterSubtitle(n) {
  try {
    const d = JSON.parse(await fs.readFile(path.join(__dirname, 'data', lessonId, `${n}.json`), 'utf8'));
    return d.subtitle || `Chapter ${n}`;
  } catch { return `Chapter ${n}`; }
}

// ── 1) 챕터별 .page 섹션 수집 ────────────────────────────────────
const files = (await fs.readdir(DIST))
  .filter(f => /^workbook-\d+\.html$/.test(f))
  .sort((a, b) => parseInt(a.match(/\d+/)) - parseInt(b.match(/\d+/)));
if (!files.length) {
  console.error(`dist 에 workbook-{N}.html 이 없습니다: ${DIST}`);
  process.exit(1);
}

let allPages = '';
let pageNo = 0;                       // 본문 페이지 누적 카운터(표지·목차 제외)
const toc = [];

for (const f of files) {
  const chNo = parseInt(f.match(/\d+/));
  const html = await fs.readFile(path.join(DIST, f), 'utf8');
  const body = (html.match(/<body>([\s\S]*?)<\/body>/i) || [, html])[1];
  // 워크북 섹션은 data-step 속성이 붙어 있다: <section class="page" data-step="N">
  const sections = body.match(/<section class="page"[^>]*>[\s\S]*?<\/section>/g) || [];
  if (!sections.length) {
    console.warn(`   ⚠️  ${f}: .page 섹션을 찾지 못함 — 건너뜀`);
    continue;
  }

  toc.push({ no: chNo, subtitle: await chapterSubtitle(chNo), start: pageNo + 1, pages: sections.length });

  const renumbered = sections.map(sec => {
    pageNo += 1;
    let replaced = false;
    return sec.replace(/(<span class="pageno">)(\d+)(<\/span>)/, (m, a, _n, c) => {
      if (replaced) return m;
      replaced = true;
      return `${a}${pageNo}${c}`;
    });
  });

  allPages += `\n<!-- ===== Chapter ${chNo} ===== -->\n` + renumbered.join('\n');
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
    <div class="cover-title">신목고 2학년 2학기<br>중간고사 대비</div>
    <div class="cover-sub">${LESSON.coverSub ?? `YBM(박준언) 영어II · Lesson ${LESSON.lessonNo}<br>${esc(LESSON.titleEn)}`}</div>
    <div class="cover-meta">워크북 합본 · 전 ${pageNo}페이지 · 원문 ${LESSON.sentences}문장 · 9-STEP</div>
  </div>
</section>

<section class="page toc-page-sec">
  <div class="page-body">
    <div class="step-banner">
      <div class="step-left">
        <div class="step-tag">CONTENTS</div>
        <div class="step-num">目</div>
      </div>
      <div class="step-right">
        <div class="step-title">목차</div>
        <div class="step-desc">${toc.length}개 챕터 · 챕터마다 9-STEP 구성</div>
      </div>
    </div>
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
  .cover-wrap { max-width: 82%; margin: auto; }
  .cover-brand { font-size:17pt; font-weight:800; letter-spacing:.08em; color:var(--c-mint-deep); margin-bottom:22px; }
  .cover-title { font-size:29pt; font-weight:800; color:var(--c-text); line-height:1.3; margin-bottom:18px; }
  .cover-sub   { font-size:14pt; font-weight:700; color:var(--c-text-soft); line-height:1.6; margin-bottom:26px; }
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
<title>${LESSON.docTitle ?? `신목고 2-2 중간 · 세계문학 워크북 합본 — Terra Nova`}</title>
<link rel="stylesheet" href="${cssHref}">
<style>${extraCss}</style>
</head>
<body>
${cover}
${allPages}
</body>
</html>`;

const combinedHtmlPath = path.join(DIST, 'workbook-combined.html');
await fs.writeFile(combinedHtmlPath, combinedHtml, 'utf8');
const expected = pageNo + 2;
console.log(`\n📄 workbook-combined.html — 표지1 + 목차1 + 본문 ${pageNo}p (총 ${expected}p)`);

// ── 3) PDF 렌더 — 글리프 안전한 이미지 합성 경로 사용 ───────────
const outPath = path.join(DIST, outName);
const pdfImage = path.join(__dirname, '..', 'builder', 'pdf-image.mjs');
await new Promise((resolve, reject) => {
  const p = spawn(process.execPath, [pdfImage, combinedHtmlPath, outPath], { stdio: 'inherit' });
  p.on('exit', code => code === 0 ? resolve() : reject(new Error('pdf-image exit ' + code)));
});

// ── 4) 페이지 수 대조 — .page 섹션 수 === PDF 페이지 수 ─────────
// (CSS 링크가 깨지면 A4 고정이 풀려 페이지가 유실되는 사고를 여기서 잡는다)
const pdfBuf = await fs.readFile(outPath);
const actual = (pdfBuf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
console.log(`\n🔍 페이지 대조: .page 섹션 ${expected} vs PDF ${actual}`);
if (actual !== expected) {
  console.error(`❌ 페이지 수 불일치 — CSS 경로/페이지 재배치 확인 필요`);
  process.exit(1);
}
console.log(`✅ 워크북 합본 → ${path.relative(process.cwd(), outPath)}`);
