#!/usr/bin/env node
/**
 * Terra Nova full-month book merger.
 *
 * Layout (continuous page numbering 1..N):
 *   1) Textbook (TOC + 4 weeks × (divider + 5 passages × 4)) = 90 pages → 1..90
 *   2) Answers section divider (2-page spread)                =  2 pages → 91..92
 *   3) Answer book (20 passages × 1 page)                     = 20 pages → 93..112
 *   4) Wordbook section divider (2-page spread)               =  2 pages → 113..114
 *   5) Wordpack (4 weeks × (wordbook + wordtest) + 4 keys)    = 20 pages → 115..134
 *   Total: 134 pages
 *
 * Page numbers are baked into each rendered page via startPage params, so the
 * footer page-num pill shows the global book number. L/R alternation follows
 * page parity.
 *
 * Usage:
 *   node tools/build-fullbook.mjs --month 2026-06
 *   node tools/build-fullbook.mjs --month 2026-06 --out custom/path.pdf
 */
import puppeteer from 'puppeteer';
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync, unlinkSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { PDFDocument } from 'pdf-lib';
import { distLevelDir, parseMonthArg } from './_dist-path.mjs';
import { resolveContent } from '../scripts/level-content.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

async function waitFor(url, ms = 15000) {
  const t = Date.now();
  while (Date.now() - t < ms) {
    try { const r = await fetch(url); if (r.ok) return; } catch {}
    await new Promise(r => setTimeout(r, 150));
  }
  throw new Error(`server did not start at ${url}`);
}

async function renderPdf(browser, url, outPath, expectedPages = 1) {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForSelector('.page,.cover', { timeout: 15000 });
  await page.waitForFunction(
    () => document.body.dataset.renderReady === '1',
    { timeout: 30000 }
  );
  await page.waitForFunction(
    count => document.querySelectorAll('.page,.cover').length >= count,
    { timeout: 30000 },
    expectedPages
  );
  // ★ renderReady 는 DOM 조립 직후 세팅돼 <img> 로드를 기다리지 않는다.
  //   domcontentloaded 로 바꾼 뒤(networkidle0 제거) 삽화가 그려지기 전에
  //   PDF 가 캡처되어 placeholder 로 굳는 회귀가 있었음.
  //   img.complete 만으로는 부족하다 — src 네트워크가 시작되기 전 잠깐
  //   complete=true 로 보일 수 있어, 풀북 일괄 렌더(웜 캐시)에서 디코드 전
  //   캡처가 발생했다. src 가 있는 이미지는 naturalWidth>0(실제 픽셀 디코드)
  //   까지, 로드 실패한 것은 error 로 complete=true 가 되어 통과시킨다.
  //   await img.decode() 로 픽셀 디코드를 강제 보장한 뒤 캡처한다.
  await page.evaluate(async () => {
    const imgs = [...document.images];
    await Promise.all(imgs.map(async (img) => {
      if (!img.getAttribute('src')) return;
      try {
        if (!img.complete) {
          await new Promise((res) => {
            img.addEventListener('load', res, { once: true });
            img.addEventListener('error', res, { once: true });
          });
        }
        await img.decode().catch(() => {});
      } catch { /* 깨진 이미지는 통과 */ }
    }));
  }).catch(() => {});
  // 자가복구: 첫 본문 페이지 등에서 이미지 요청이 워밍업 레이스로 한 번
  //   error 를 내면 render.js 가 .illustration-empty placeholder 로 굳히고
  //   img 를 display:none 처리한다(이때 img 자체는 이후 정상 디코드되어
  //   naturalWidth>0 이라 단순 naturalWidth 체크로는 못 잡음).
  //   파일은 실존하므로: (1) placeholder 가 남았으면 강제로 img 를 복원하고,
  //   그래도 naturalWidth===0(진짜 실패)이면 새로고침으로 재시도(최대 3회).
  for (let retry = 0; retry < 3; retry++) {
    const state = await page.evaluate(() => {
      const out = { restored: 0, broken: 0 };
      document.querySelectorAll('.illustration-empty').forEach((wrap) => {
        const img = wrap.querySelector('img[data-slot="illustration"]');
        if (img && img.naturalWidth > 0) {
          // 이미지는 실제로 디코드됨 — placeholder 만 잘못 남은 것. 복원.
          wrap.classList.remove('illustration-empty');
          delete wrap.dataset.placeholderId;
          img.style.display = '';
          out.restored++;
        } else {
          out.broken++;
        }
      });
      return out;
    }).catch(() => ({ restored: 0, broken: 0 }));
    if (!state.broken) break;
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForSelector('.page,.cover', { timeout: 15000 });
    await page.waitForFunction(() => document.body.dataset.renderReady === '1', { timeout: 30000 });
    await page.evaluate(async () => {
      await Promise.all([...document.images].map(async (img) => {
        if (!img.getAttribute('src')) return;
        if (!img.complete) await new Promise((res) => {
          img.addEventListener('load', res, { once: true });
          img.addEventListener('error', res, { once: true });
        });
        await img.decode().catch(() => {});
      }));
    }).catch(() => {});
  }
  await page.evaluate(() => document.fonts?.ready).catch(() => {});
  await page.pdf({
    path: outPath,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: 0, bottom: 0, left: 0, right: 0 }
  });
  await page.close();
}

async function main() {
  const { values } = parseArgs({
    options: {
      month: { type: 'string' },
      out:   { type: 'string' }
    }
  });
  if (!values.month) {
    console.error('usage: --month YYYY-MM [--out path]');
    process.exit(2);
  }
  const month = values.month;
  // dist/{YYYY-MM}/{YYYY-MM}-{Level} (학년)/{YYYY-MM}-{Level}-fullbook.pdf 로 정리.
  const { month: ym, level } = parseMonthArg(month);
  const levelDir = distLevelDir(root, month);
  const fullbookName = level ? `${ym}-${level}-fullbook.pdf` : `${month}-fullbook.pdf`;
  const outPath = values.out
    ? resolve(values.out)
    : join(levelDir, fullbookName);
  mkdirSync(dirname(outPath), { recursive: true });

  const port = 4185;
  const server = spawn(process.execPath, [
    resolve(root, 'node_modules', 'sirv-cli', 'bin.js'),
    '.', '--port', String(port), '--host', '127.0.0.1', '--quiet'
  ], {
    cwd: root,
    stdio: ['ignore', 'ignore', 'ignore'],
    windowsHide: true
  });
  await waitFor(`http://127.0.0.1:${port}/textbook.html`);

  // proxy-bypass args: headless Chrome otherwise routes 127.0.0.1 through an
  // auto-detected system proxy and times out connecting to the local sirv server.
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--proxy-server=direct://', '--proxy-bypass-list=*', '--no-sandbox', '--disable-gpu']
  });
  const tmpDir = join(root, 'dist', '_fullbook-tmp');
  mkdirSync(tmpDir, { recursive: true });
  const collected = [];

  try {
    // === Section 1: Textbook (pages 1..90) ===
    console.log('[1/5] Textbook');
    console.log('  → TOC');
    const tocPath = join(tmpDir, 'toc.pdf');
    await renderPdf(browser, `http://127.0.0.1:${port}/cover.html?mode=toc&month=${month}`, tocPath, 2);
    collected.push(tocPath);

    for (let w = 1; w <= 4; w++) {
      console.log(`  → WEEK ${w} divider`);
      const wPath = join(tmpDir, `week-${w}.pdf`);
      await renderPdf(browser, `http://127.0.0.1:${port}/cover.html?mode=week&month=${month}&week=${w}`, wPath, 2);
      collected.push(wPath);

      const weekStart = (w - 1) * 5 + 1;
      for (let n = weekStart; n < weekStart + 5; n++) {
        const seq = String(n).padStart(2, '0');
        // Elementary (mars/venus) sources live under content/<level>/passages/<month>/;
        // highschool/legacy stay at content/passages/<month>/. resolveContent picks the
        // right base from the (possibly planet-suffixed) month arg.
        const sourcePath = join(root, ...resolveContent(month).base.split('/'), `${seq}.json`);
        if (!existsSync(sourcePath)) { console.warn(`  · SKIP ${seq} (no JSON)`); continue; }
        const inWeekIdx = (n - 1) % 5;
        const startPage = 4 + (w - 1) * 22 + inWeekIdx * 4 + 1;
        console.log(`  · passage ${seq} (book p.${startPage})`);
        const pPath = join(tmpDir, `p-${seq}.pdf`);
        await renderPdf(browser,
          `http://127.0.0.1:${port}/textbook.html?month=${month}&passage=${seq}&startPage=${startPage}`,
          pPath,
          4
        );
        collected.push(pPath);
      }
    }

    // === Section 2: Answers divider (pages 91..92, 2-page spread) ===
    console.log('[2/5] Answer divider (속지 spread, p.91~92)');
    const ansDivPath = join(tmpDir, 'div-answers.pdf');
    await renderPdf(browser,
      `http://127.0.0.1:${port}/supplements.html?type=divider&which=answers&month=${month}&startPage=91`,
      ansDivPath,
      2
    );
    collected.push(ansDivPath);

    // === Section 3: Answer book (pages 93..112) ===
    console.log('[3/5] Answer book (DAY 01..20, p.93~112)');
    const ansPath = join(tmpDir, 'answers-all.pdf');
    await renderPdf(browser,
      `http://127.0.0.1:${port}/supplements.html?type=answers-all&month=${month}&startPage=93`,
      ansPath,
      20
    );
    collected.push(ansPath);

    // === Section 4: Wordbook divider (pages 113..114, 2-page spread) ===
    console.log('[4/5] Wordbook divider (속지 spread, p.113~114)');
    const wbDivPath = join(tmpDir, 'div-wordbook.pdf');
    await renderPdf(browser,
      `http://127.0.0.1:${port}/supplements.html?type=divider&which=wordbook&month=${month}&startPage=113`,
      wbDivPath,
      2
    );
    collected.push(wbDivPath);

    // === Section 5: Wordpack (pages 115..134) ===
    console.log('[5/5] Wordpack (W1..W4 wordbook + test + keys, p.115~134)');
    const wpPath = join(tmpDir, 'wordpack.pdf');
    await renderPdf(browser,
      `http://127.0.0.1:${port}/supplements.html?type=wordpack&month=${month}&startPage=115`,
      wpPath,
      20
    );
    collected.push(wpPath);

  } finally {
    await browser.close();
    server.kill();
  }

  // === Merge ===
  console.log(`Merging ${collected.length} PDFs → ${outPath}`);
  const merged = await PDFDocument.create();
  for (const f of collected) {
    const bytes = readFileSync(f);
    const src = await PDFDocument.load(bytes);
    const pages = await merged.copyPages(src, src.getPageIndices());
    pages.forEach(p => merged.addPage(p));
  }

  // PDF metadata — bookmark/library/search readability
  // Month label uses optional planet suffix (e.g. "2026-06-Sun" → "2026-06 · Sun")
  const monthLabel = month.replace(/^(\d{4}-\d{2})(?:-([A-Za-z]+))?$/, (_, ym, lvl) =>
    lvl ? `${ym} · ${lvl}` : ym
  );
  merged.setTitle(`Terra Nova English · ${monthLabel}`);
  merged.setAuthor('Terra Nova English');
  merged.setSubject('월간 독해 학습지 (교과 연계)');
  merged.setKeywords(['수능영어', '독해', '교과 연계', 'Terra Nova', monthLabel]);
  merged.setCreator('Terra Nova build-fullbook.mjs');
  merged.setProducer('pdf-lib · Terra Nova');

  const out = await merged.save();
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, out);

  for (const f of collected) {
    try { unlinkSync(f); } catch {}
  }

  console.log(`WROTE ${outPath} (${merged.getPageCount()} pages, ${(out.length / 1024 / 1024).toFixed(1)} MB)`);
}

main().catch(err => { console.error(err); process.exit(1); });
