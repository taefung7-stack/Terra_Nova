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
 *   node _oneoff-봉영여중2-추가지문/build-memorize.mjs EX
 * =================================================================== */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* qSplit — 문제면의 페이지별 문항 수를 손으로 지정한다(사용자 요청).
   합이 원문 문장 수와 다르면 빌드를 중단한다(문항 유실 방지).
   지정하지 않으면 기존대로 MAX_PER_PAGE 그리디 분배를 쓴다. */
/* 봉영여중2 판(2026-11-24): 지문 5편이 서로 독립이라 **지문별로 페이지를 나누고 번호도 지문마다 1번부터**.
   qSplitByCh — 지문(챕터 no)별 문제면 페이지당 문항 수. 합이 지문 문장 수와 다르면 중단(유실 방지).
   정답면은 지문 제목 행을 끼워 같은 번호로 대조한다. */
const LESSONS = {
  EX: {
    out: '봉영여중2_영어B_기말추가지문_본문암기.pdf',
    /* 2026-11-25 사용자 요청: 15문장 이하 지문은 한 페이지에. 16문장인 8번만 2장. */
    qSplitByCh: { 7: [13], 8: [8, 8], 9: [11], 10: [13], 11: [13] },
  },
};

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ── 한 과 빌드 ───────────────────────────────────────────────── */
async function buildOne(lessonId) {
  const LESSON = LESSONS[lessonId];
  if (!LESSON) { console.error(`알 수 없는 과: ${lessonId} (EX)`); process.exit(2); }

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
      items.push({ no: i + 1, en, ko: ko[i], ch: ch.no, title: ch.title, total: ch.sentences.length,
        /* 머리글용 짧은 이름 — 긴 제목은 머리글이 두 줄로 깨진다(영상 스크립트 실측) */
        short: /^\d+ · /.test(ch.title) ? `${ch.title.split(' · ')[0]}번 · ${ch.title.split(' · ')[1]}` : ch.title.split(' · ')[0] });
    });
  }

  const cssHref = (path.relative(DIST, path.join(__dirname, 'styles', 'workbook.css')) || '')
    .replace(/\\/g, '/');

  /* ── 페이지 조립 헬퍼 ── */
  const pageHead = (subtitle) => `  <header class="page-head">
    <span class="exam-tag">봉영여중 2학년 · 영어B 기말 추가지문</span>
    <span class="sep">|</span>
    <span class="grade-tag">2학년</span>
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

  const qPage = (chunk, banner, chHead) => `<section class="page" data-mem="q">
${pageHead(`본문 암기 — ${chunk[0].short}`)}
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
` : ''}${chHead ? `    <div class="section-bar alt">${esc(chunk[0].title)}<span class="bar-sub">원문 ${chunk[0].total}문장</span></div>
` : ''}    <div class="trans-list auto-fit">
${chunk.map(qItem).join('\n')}
    </div>
  </div>
  <footer class="page-foot"><span class="brand"></span><span class="pageno">0</span></footer>
</section>`;

  const aRow = (it) => it.head ? `        <div class="al-head">${esc(it.head)}</div>` : `        <div class="al-row"><div class="al-no">${it.no}</div><div class="al-body"><span class="en">${esc(it.en)}</span></div></div>`;

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
    <div class="cover-title">봉영여중 2학년<br>영어B 기말 추가지문</div>
    <div class="cover-sub">추가지문 7 · 8 · 9 · 10<br>영상 스크립트 · Wenger Patagonian Expedition Race</div>
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
  /* 지문 제목 — 문제면 첫 장의 막대 아래 여백, 정답면 단 안의 제목 행 */
  .page-body > .section-bar.alt { margin-bottom: 6px; }
  .mem-answer .al-head {
    break-inside: avoid; break-after: avoid;
    font-weight: 800; font-size: 9.4pt; color: var(--c-step);
    border-bottom: 1px solid var(--c-line); padding: 6px 0 3px; margin: 4px 0 5px;
  }
  .mem-answer .al-head:first-child { padding-top: 0; margin-top: 0; }
`;

  const html = (pagesHtml) => `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>봉영여중 2학년 영어B 기말 추가지문 본문암기 — Terra Nova</title>
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
     ★ '들어가는 최대'로 채우면 답란이 손글씨를 쓰기엔 너무 좁아진다(중3 대상).
       한 장당 문항 수에 상한(MAX_PER_PAGE)을 두고, 남는 세로 공간은
       .trans-list 의 space-between 이 답란 간격으로 고르게 분배하게 한다. */
  const MAX_PER_PAGE = 12;
  const qPages = [];
  let rest = [...items], firstQ = true;

  for (const chNo of [...new Set(items.map(it => it.ch))]) {
    const chItems = items.filter(it => it.ch === chNo);
    const split = LESSON.qSplitByCh?.[chNo];
    if (!split) { console.error(`✗ ${lessonId}: Ch${chNo} qSplitByCh 없음 — 중단`); await browser.close(); process.exit(1); }
    const sum = split.reduce((a, b) => a + b, 0);
    if (sum !== chItems.length) {
      console.error(`✗ ${lessonId}/Ch${chNo}: qSplit 합계 ${sum} ≠ 문항 ${chItems.length} — 중단`);
      await browser.close();
      process.exit(1);
    }
    let r = [...chItems], firstCh = true;
    for (const n of split) {
      const sec = qPage(r.slice(0, n), firstQ, firstCh);
      /* 지정 분배도 반드시 실측한다 — 넘치면 잘린 채 인쇄되므로 차단. */
      if (!(await fits(sec))) {
        console.error(`✗ ${lessonId}/Ch${chNo}: ${n}문항이 한 페이지에 넘침 — 중단(qSplitByCh 조정 필요)`);
        await browser.close();
        process.exit(1);
      }
      qPages.push(sec);
      r = r.slice(n);
      firstQ = false; firstCh = false;
    }
  }
  rest = [];

  /* 정답 페이지 그리디 분배 */
  const aPages = [];
  /* 정답 목록 — 지문이 바뀔 때마다 제목 행을 끼운다(번호가 지문마다 1부터라서). */
  rest = items.flatMap(it => (it.no === 1 ? [{ head: it.title }, it] : [it]));
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
const targets = arg ? [arg] : ['EX'];
console.log('📝 본문암기 워크북 빌드\n');
for (const t of targets) await buildOne(t);
