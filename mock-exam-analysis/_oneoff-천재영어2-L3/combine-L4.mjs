#!/usr/bin/env node
/* ===================================================================
 * 천재(조수경) 영어II · Lesson 4 — 합본 빌더 (워크북 / 변형문제)
 * ===================================================================
 * dist/L4 의 산출물을 이어 붙여 표지 + 목차 + 본문 단일 PDF 로 만든다.
 * 페이지 번호는 개별 산출물의 번호를 버리고 **합본 전체 통번호**로 재부여.
 *
 * 종류별 차이:
 *   workbook — dist/L4/workbook-{1..6}.html 6부를 이어 붙인다.
 *              각 워크북 헤더의 "N번" 자리에 섹션명(교과서 소제목)을 넣어
 *              합본 문맥에 맞춘다(개별본은 hide_head_no 라 qno 가 없을 수 있음).
 *   variant  — dist/L4/variant-book.html 은 이미 6지문 통합본(56p)이므로
 *              이어 붙일 것이 없다. 표지·목차만 앞에 붙이고 번호를 재부여한다.
 *
 * ★ CSS 경로는 하드코딩 금지 — path.relative 로 계산한다.
 *   CSS 가 없으면 .page 의 A4 고정이 풀려 페이지가 재배치·유실된다.
 *   합본 후 .page 섹션 수 = PDF 페이지 수를 자동 대조해 이를 막는다.
 *
 * 렌더는 builder/pdf-image.mjs(스크린샷 합성) — page.pdf() 인쇄 경로는
 * Pretendard 한글런 안의 [ ] ' - 를 tofu(☰)로 깨뜨린다.
 *
 * 사용법:
 *   node _oneoff-천재영어2-L3/combine-L4.mjs workbook
 *   node _oneoff-천재영어2-L3/combine-L4.mjs variant
 *   node _oneoff-천재영어2-L3/combine-L4.mjs both
 * =================================================================== */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { SOURCE } from './_SOURCE-L4.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(HERE, 'dist', 'L4');

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const rel = (cssName) => (path.relative(DIST, path.join(HERE, 'styles', cssName)) || '').replace(/\\/g, '/');

const KINDS = {
  workbook: {
    css: 'workbook.css',
    match: /^workbook-\d+\.html$/,
    out: '천재영어2_Lesson4_워크북_합본.pdf',
    htmlOut: 'workbook-combined.html',
    title: '워크북 합본',
    chip: 'WORKBOOK',
    footer: 'Terra Nova · 워크북',
    sub: '9-STEP · 본문·해석 → 어법 → 어휘 → 빈칸 → 해석 → 배열 → 영작 → 종합 → 정답',
  },
  variant: {
    css: 'variant.css',
    match: /^variant-book\.html$/,
    out: '천재영어2_Lesson4_변형문제_합본.pdf',
    htmlOut: 'variant-combined.html',
    title: '변형문제 합본',
    chip: 'VARIANT',
    footer: 'Terra Nova · 변형문제',
    sub: '객관식 11유형 × 6지문 + 서술형 36 · 총 102문항',
  },
};

/* 워크북 헤더의 "N번" 을 섹션명으로 교체.
 * 개별본이 hide_head_no 라 <span class="qno"> 가 없을 수 있으므로,
 * qno 치환에 의존하지 않고 exam-tag 뒤에 라벨을 새로 끼워 넣는다. */
function relabelHead(sec, label) {
  let out = sec.replace(
    /(<span class="exam-tag">[^<]*<\/span>)/,
    `$1\n    <span class="sep">|</span>\n    <span class="qno">${esc(label)}</span>`
  );
  // 기존 문항번호가 남아 있으면 제거(라벨과 중복)
  out = out.replace(/\s*<span class="sep">\|<\/span>\s*<span class="qno">\d+번<\/span>/, '');
  return out;
}

async function build(kind) {
  const K = KINDS[kind];
  if (!K) { console.error(`알 수 없는 종류: ${kind}`); process.exit(2); }

  const files = (await fs.readdir(DIST))
    .filter(f => K.match.test(f))
    .sort((a, b) => (parseInt(a.match(/\d+/)) || 0) - (parseInt(b.match(/\d+/)) || 0));
  if (!files.length) { console.error(`dist/L4 에 대상 HTML 이 없습니다 (${kind})`); process.exit(1); }

  let allPages = '';
  let pageNo = 0;
  const toc = [];

  for (const f of files) {
    const chNo = parseInt(f.match(/\d+/)) || null;
    const ch = chNo ? SOURCE.find(c => c.no === chNo) : null;
    const html = await fs.readFile(path.join(DIST, f), 'utf8');
    const body = (html.match(/<body>([\s\S]*?)<\/body>/i) || [, html])[1];
    const sections = body.match(/<section class="page"[^>]*>[\s\S]*?<\/section>/g) || [];
    if (!sections.length) { console.warn(`   ⚠️  ${f}: .page 섹션 없음 — 건너뜀`); continue; }

    const label = ch ? ch.subtitle : null;
    if (label) toc.push({ no: chNo, subtitle: label, start: pageNo + 1, pages: sections.length });

    const renumbered = sections.map(sec => {
      pageNo += 1;
      let s = sec;
      if (kind === 'workbook' && label) s = relabelHead(s, label);
      let done = false;
      return s.replace(/(<span class="pageno">)(\d+)(<\/span>)/, (m, a, _n, c) => {
        if (done) return m;
        done = true;
        return `${a}${pageNo}${c}`;
      });
    });

    allPages += `\n<!-- ===== ${f} ===== -->\n` + renumbered.join('\n');
    if (label) console.log(`   ✓ Ch${chNo} ${String(sections.length).padStart(2)}p  → 합본 ${toc[toc.length - 1].start}~${pageNo}p`);
    else console.log(`   ✓ ${f} ${sections.length}p  → 합본 1~${pageNo}p`);
  }

  // 변형문제는 지문별 파일이 아니라 통합본 1개라 목차를 유형 순서로 만든다.
  const tocRows = toc.length
    ? toc.map(t => `      <div class="toc-row">
        <span class="toc-no">${t.no}</span>
        <span class="toc-title">${esc(t.subtitle)}</span>
        <span class="toc-dots"></span>
        <span class="toc-page">${t.start}</span>
      </div>`).join('\n')
    : SOURCE.map(c => `      <div class="toc-row">
        <span class="toc-no">${c.no}</span>
        <span class="toc-title">${esc(c.subtitle)}</span>
        <span class="toc-dots"></span>
        <span class="toc-page">—</span>
      </div>`).join('\n');

  const tocNote = toc.length ? `${toc.length}개 챕터` : '유형별 묶음 · 지문 6종';

  const cover = `<section class="page cover-page">
  <div class="page-body">
  <div class="cover-wrap">
    <div class="cover-brand">Terra Nova</div>
    <div class="cover-chip">${K.chip}</div>
    <div class="cover-title">천재(조수경) 영어II<br>Lesson 4 ${esc(K.title)}</div>
    <div class="cover-sub">Flavors Without Borders</div>
    <div class="cover-steps">${esc(K.sub)}</div>
    <div class="cover-meta">전 ${pageNo}페이지 · 원문 ${SOURCE.reduce((a, c) => a + c.sentences.length, 0)}문장</div>
  </div>
  </div>
</section>

<section class="page toc-page-sec">
  <div class="page-body">
    <div class="section-bar">CONTENTS · 목차<span class="bar-sub">${tocNote}</span></div>
    <div class="toc-list">
${tocRows}
    </div>
  </div>
</section>`;

  const extraCss = `
  @page { size: A4; margin: 0; }
  html, body { margin: 0; padding: 0; }
  .page { box-sizing: border-box; margin: 0 auto; box-shadow: none; }
  .cover-page { display:flex; align-items:center; justify-content:center; text-align:center; padding:14mm; }
  .cover-page .page-body { display:flex; align-items:center; justify-content:center; }
  .cover-wrap { max-width: 82%; margin: auto; }
  .cover-brand { font-size:17pt; font-weight:800; letter-spacing:.08em; color:var(--c-mint-deep); margin-bottom:10px; }
  .cover-chip { display:inline-block; border:1px solid var(--c-line); color:var(--c-text-soft); font-size:9pt; font-weight:700; padding:3px 14px; border-radius:999px; letter-spacing:.06em; margin-bottom:22px; }
  .cover-title { font-size:26pt; font-weight:800; color:var(--c-text); line-height:1.3; margin-bottom:14px; }
  .cover-sub { font-size:13pt; font-weight:700; color:var(--c-text-soft); font-style:italic; margin-bottom:22px; }
  .cover-steps { font-size:9.5pt; color:var(--c-text-soft); line-height:1.7; margin-bottom:24px; }
  .cover-meta { font-size:10.5pt; color:var(--c-muted); letter-spacing:.02em; }
  .toc-page-sec .toc-list { margin-top:14px; display:flex; flex-direction:column; gap:10px; }
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
<title>천재(조수경) 영어II Lesson 4 ${esc(K.title)} — Terra Nova</title>
<link rel="stylesheet" href="${rel(K.css)}">
<style>${extraCss}</style>
</head>
<body>
${cover}
${allPages}
</body>
</html>
`;

  const htmlPath = path.join(DIST, K.htmlOut);
  await fs.writeFile(htmlPath, combinedHtml, 'utf8');
  const expected = pageNo + 2;   // 표지 + 목차
  console.log(`\n📄 ${K.htmlOut} — 표지1 + 목차1 + 본문 ${pageNo}p (총 ${expected}p)`);

  const outPath = path.join(DIST, K.out);
  const pdfImage = path.join(HERE, '..', 'builder', 'pdf-image.mjs');
  await new Promise((resolve, reject) => {
    const p = spawn(process.execPath, [pdfImage, htmlPath, outPath, `--footer=${K.footer}`], { stdio: 'inherit' });
    p.on('exit', c => c === 0 ? resolve() : reject(new Error('pdf-image exit ' + c)));
  });

  const buf = await fs.readFile(outPath);
  const actual = (buf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  console.log(`\n🔍 페이지 대조: .page 섹션 ${expected} vs PDF ${actual}`);
  if (actual !== expected) {
    console.error('❌ 페이지 수 불일치 — CSS 경로/페이지 재배치 확인 필요');
    process.exit(1);
  }
  console.log(`✅ ${K.title} → ${path.relative(process.cwd(), outPath)}\n`);
}

const kind = process.argv[2] || 'both';
if (kind === 'both') { await build('workbook'); await build('variant'); }
else await build(kind);
