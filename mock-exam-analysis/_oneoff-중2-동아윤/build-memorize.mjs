#!/usr/bin/env node
/* ===================================================================
 * 중등부 본문암기 워크북 빌더
 * ===================================================================
 * 요청(2026-08-29): "중등부 워크북은 step7의 본문 암기만 있으면 될 것 같다.
 * 워크북을 새롭게 구성해서 본문암기만 할 수 있는 PDF를 만들어 달라."
 *
 * 기존 9-STEP 워크북(build-workbook.mjs)은 v1.0 LOCKED 이고 정식 회차가
 * 의존하므로 **건드리지 않는다**. 이 폴더 전용 빌더를 따로 둔다.
 *
 * 구성 — 한 과가 한 권:
 *   표지 1p → 본문암기 문제 Np → 정답지 Mp
 *   · 문제면: 한글 문장만 제시 + 영작 답란(밑줄). 챕터 구분 없이 1번부터 연속.
 *   · 정답면: 영어 원문을 같은 번호로 뒤에 몰아서 배치.
 *
 * 문장 범위: 원문 정본(_SOURCE-*.js)의 **전 문장**
 *   (기존 STEP7 은 챕터당 5문장만 뽑아 일부가 누락됐다 — 암기용이므로 전수 커버)
 *
 * 페이지 분배는 puppeteer 실측으로 한다. .page-body 가 overflow:hidden 이라
 * 넘쳐도 에러 없이 잘리므로, 추정으로 나누면 조용히 문항이 사라진다.
 *
 * 사용법:
 *   node _oneoff-중2-동아윤/build-memorize.mjs L5
 *   node _oneoff-중2-동아윤/build-memorize.mjs        # L5·L6 전부
 * =================================================================== */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LESSONS = {
  L5: {
    lessonNo: 5,
    titleEn: 'Street Art in London',
    out: '중2_동아윤정미_Lesson5_본문암기.pdf',
  },
  L6: {
    lessonNo: 6,
    titleEn: 'Dr. Schofield, a Foreigner Who Loved Korea',
    out: '중2_동아윤정미_Lesson6_본문암기.pdf',
  },
};

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ── 한 과 빌드 ───────────────────────────────────────────────── */
async function buildOne(lessonId) {
  const LESSON = LESSONS[lessonId];
  if (!LESSON) { console.error(`알 수 없는 과: ${lessonId} (L5 / L6)`); process.exit(2); }

  const { SOURCE } = await import(`./_SOURCE-${lessonId}.js`);
  const DIST = path.join(__dirname, 'dist', lessonId);

  /* 정본의 영어 + 챕터 JSON 의 해석을 짝지어 전 문장을 모은다.
     해석이 하나라도 비면 암기장이 성립하지 않으므로 즉시 중단한다. */
  const items = [];
  for (const ch of SOURCE) {
    const d = JSON.parse(await fs.readFile(path.join(__dirname, 'data', lessonId, `${ch.no}.json`), 'utf8'));
    const ko = d.passage_ko || [];
    if (ko.length !== ch.sentences.length) {
      console.error(`✗ ${lessonId}/Ch${ch.no}: 해석 ${ko.length} ≠ 원문 ${ch.sentences.length}`);
      process.exit(1);
    }
    ch.sentences.forEach((en, i) => {
      if (!String(ko[i] ?? '').trim()) {
        console.error(`✗ ${lessonId}/Ch${ch.no}: ${i + 1}번 해석이 비어 있다`);
        process.exit(1);
      }
      items.push({ no: items.length + 1, en, ko: ko[i], ch: ch.no });
    });
  }

  const cssHref = (path.relative(DIST, path.join(__dirname, 'styles', 'workbook.css')) || '')
    .replace(/\\/g, '/');

  /* ── 페이지 조립 헬퍼 ── */
  const pageHead = (subtitle) => `  <header class="page-head">
    <span class="exam-tag">중2 · 동아(윤정미)</span>
    <span class="sep">|</span>
    <span class="grade-tag">Lesson ${LESSON.lessonNo}</span>
    <span class="sep">·</span>
    <span class="step-subtitle">${esc(subtitle)}</span>
    <span class="wb-chip">본문암기</span>
  </header>`;

  const qItem = (it) => `      <div class="trans-item">
        <div class="ti-no">${it.no}.</div>
        <div>
          <div class="ti-given ko">${esc(it.ko)}</div>
          <div class="mem-line"></div>
        </div>
      </div>`;

  const qPage = (chunk, banner) => `<section class="page" data-mem="q">
${pageHead('본문 암기 — 영작')}
  <div class="page-body">
${banner ? `    <div class="step-banner">
      <div class="step-left">
        <div class="step-tag">MEMORIZE</div>
        <div class="step-num">✎</div>
      </div>
      <div class="step-right">
        <div class="step-title">본문 암기</div>
        <div class="step-desc">주어진 한글을 보고 본문 영어 문장을 그대로 써 보세요.</div>
      </div>
    </div>
` : ''}    <div class="trans-list auto-fit">
${chunk.map(qItem).join('\n')}
    </div>
  </div>
  <footer class="page-foot"><span class="brand"></span><span class="pageno">0</span></footer>
</section>`;

  const aRow = (it) => `        <div class="al-row"><div class="al-no">${it.no}</div><div class="al-body"><span class="en">${esc(it.en)}</span></div></div>`;

  const aPage = (chunk, first) => `<section class="page" data-mem="a">
${pageHead('본문 암기 — 정답')}
  <div class="page-body">
${first ? `    <div class="section-bar">ANSWER · 본문 암기 정답<span class="bar-sub">원문 ${items.length}문장</span></div>
` : ''}    <div class="answer-list mem-answer">
${chunk.map(aRow).join('\n')}
    </div>
  </div>
  <footer class="page-foot"><span class="brand"></span><span class="pageno">0</span></footer>
</section>`;

  const cover = `<section class="page cover-page">
  <div class="cover-wrap">
    <div class="cover-brand">Terra Nova</div>
    <div class="cover-title">중학교 2학년<br>동아 영어 2</div>
    <div class="cover-sub">Lesson ${LESSON.lessonNo} · ${esc(LESSON.titleEn)}</div>
    <div class="cover-meta">본문 암기 · 원문 ${items.length}문장 전수</div>
  </div>
</section>`;

  const extraCss = `
  @page { size: A4; margin: 0; }
  html, body { margin: 0; padding: 0; }
  .page { box-sizing: border-box; margin: 0 auto; box-shadow: none; }
  .page-body { overflow: hidden; }

  .cover-page { align-items:center; justify-content:center; text-align:center; padding:14mm; }
  .cover-wrap { max-width: 82%; margin: auto; }
  .cover-brand { font-family:'Inter'; font-size:17pt; font-weight:800; letter-spacing:.08em; color:var(--c-step); margin-bottom:22px; }
  .cover-title { font-size:29pt; font-weight:800; color:var(--c-text); line-height:1.3; margin-bottom:18px; }
  .cover-sub   { font-size:14pt; font-weight:700; color:var(--c-text-soft); line-height:1.6; margin-bottom:26px; }
  .cover-meta  { font-size:10.5pt; color:var(--c-muted); letter-spacing:.02em; }

  /* 영작 답란 — 기본 워크북은 .ti-answer-line 을 숨기고 여백만 두지만,
     암기장은 '쓰는 책'이므로 실제 줄을 그어 준다. */
  .mem-line {
    margin-top: 7px;
    border-bottom: 1px solid var(--c-line);
    height: 15px;
  }
  /* 남는 세로 공간을 문항 사이에 고르게 나눠 답란을 넉넉하게 만든다.
     (문항 수 상한 MAX_PER_PAGE 와 짝을 이루는 장치) */
  .trans-list.auto-fit { justify-content: space-between; gap: 0; }
  .trans-item { padding-top: 4px; padding-bottom: 2px; border-top: none; }
  .trans-item .ti-given.ko { font-size: 10pt; }

  /* 정답면 — 문제면과 같은 번호로 대조하기 쉽게 2단 */
  .mem-answer {
    column-count: 2;
    column-gap: 16px;
    column-rule: 1px dashed var(--c-line);
    display: block;
  }
  .mem-answer .al-row { break-inside: avoid; margin-bottom: 3px; }
  .section-bar .bar-sub { float: right; font-weight: 600; }
`;

  const html = (pagesHtml) => `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>중2 · 동아(윤정미) Lesson ${LESSON.lessonNo} 본문암기 — Terra Nova</title>
<link rel="stylesheet" href="${cssHref}">
<style>${extraCss}</style>
</head>
<body>
${pagesHtml}
</body>
</html>`;

  /* ── 페이지 분배: puppeteer 실측 그리디 ──────────────────────
     한 페이지에 넣을 수 있는 최대 문항 수를 실제로 재서 정한다.
     .page-body 가 overflow:hidden 이라 추정으로 나누면 조용히 잘린다. */
  const puppeteer = (await import('puppeteer')).default;
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  const probePath = path.join(DIST, '_mem-probe.html');

  async function fits(pageHtml) {
    await fs.writeFile(probePath, html(pageHtml), 'utf8');
    await page.goto(pathToFileURL(probePath).href, { waitUntil: 'networkidle0' });
    return page.evaluate(() => {
      const b = document.querySelector('.page-body');
      return b.scrollHeight <= b.clientHeight;
    });
  }

  /* 문제 페이지 분배
     ★ '들어가는 최대'로 채우면 답란이 손글씨를 쓰기엔 너무 좁아진다(중2 대상).
       한 장당 문항 수에 상한(MAX_PER_PAGE)을 두고, 남는 세로 공간은
       .trans-list 의 space-between 이 답란 간격으로 고르게 분배하게 한다. */
  const MAX_PER_PAGE = 12;
  const qPages = [];
  let rest = [...items], firstQ = true;
  while (rest.length) {
    let lo = 1, hi = Math.min(rest.length, MAX_PER_PAGE);
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (await fits(qPage(rest.slice(0, mid), firstQ))) lo = mid; else hi = mid - 1;
    }
    qPages.push(qPage(rest.slice(0, lo), firstQ));
    rest = rest.slice(lo);
    firstQ = false;
  }

  /* 정답 페이지 그리디 분배 */
  const aPages = [];
  rest = [...items];
  let firstA = true;
  while (rest.length) {
    let lo = 1, hi = rest.length;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (await fits(aPage(rest.slice(0, mid), firstA))) lo = mid; else hi = mid - 1;
    }
    aPages.push(aPage(rest.slice(0, lo), firstA));
    rest = rest.slice(lo);
    firstA = false;
  }

  /* 페이지 번호 부여(표지 제외, 본문 1부터) */
  let pageNo = 0;
  const numbered = [...qPages, ...aPages].map(sec => {
    pageNo += 1;
    return sec.replace('<span class="pageno">0</span>', `<span class="pageno">${pageNo}</span>`);
  });

  const finalHtml = html([cover, ...numbered].join('\n'));
  const htmlPath = path.join(DIST, 'memorize.html');
  await fs.writeFile(htmlPath, finalHtml, 'utf8');

  /* 넘침 최종 확인 — 한 페이지라도 넘치면 실패로 본다 */
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle0' });
  const overflow = await page.evaluate(() =>
    [...document.querySelectorAll('.page-body')]
      .filter(b => b.scrollHeight > b.clientHeight).length);
  if (overflow) {
    console.error(`✗ ${lessonId}: 넘치는 페이지 ${overflow}개 — 중단`);
    await browser.close();
    process.exit(1);
  }

  const outPath = path.join(DIST, LESSON.out);
  await page.pdf({
    path: outPath, format: 'A4', printBackground: true,
    margin: { top: '0', bottom: '0', left: '0', right: '0' },
    preferCSSPageSize: true,
  });
  await browser.close();
  await fs.rm(probePath, { force: true });

  console.log(`  ${lessonId}: 문항 ${items.length} · 표지1 + 문제${qPages.length}p + 정답${aPages.length}p = 총 ${pageNo + 1}p`);
  console.log(`  ✅ → ${path.relative(process.cwd(), outPath)}`);
}

const arg = (process.argv[2] || '').toUpperCase();
const targets = arg ? [arg] : ['L5', 'L6'];
console.log('📝 본문암기 워크북 빌드\n');
for (const t of targets) await buildOne(t);
