#!/usr/bin/env node
/* ===================================================================
 * 워크북 합본 빌더 — 회차 전체 워크북을 1개 PDF로 합본
 * ===================================================================
 * dist 의 workbook-{N}.html 들을 번호순으로 합쳐 단일 HTML → 단일 PDF.
 * 각 워크북의 .page 섹션(9-STEP, 긴 지문은 연속 페이지 포함)을 그대로
 * 이어 붙이므로 디자인·페이지 분할 100% 동일. 표지(cover) 1장 + 본문.
 *
 * 분석지 합본(combine.mjs)과 동일 철학이나 대상이 workbook-*.html 이고
 * 스타일은 workbook.css 를 사용. 각 워크북 내부 페이지번호(1~9/N)는
 * 그대로 유지(워크북별 독립 교재 단위) — 합본 전체 통번호로 바꾸지 않음.
 *
 * 사용법:
 *   node builder/combine-workbook.mjs <dist-dir> [<출력파일명.pdf>]
 *   node builder/combine-workbook.mjs 2026-june-grade2/dist 2026-6월-고2-영어-워크북-합본.pdf
 * =================================================================== */
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

function esc(s){return String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

async function main(){
  const distArg = process.argv[2];
  if(!distArg){ console.error('Usage: node builder/combine-workbook.mjs <dist-dir> [out.pdf]'); process.exit(1); }
  const distDir = path.resolve(process.cwd(), distArg);
  const roundDir = path.dirname(distDir);
  const cssAbs = path.resolve(roundDir, 'styles', 'workbook.css');
  const cssHref = pathToFileURL(cssAbs).href;
  const outName = process.argv[3] || 'workbook-combined.pdf';

  // workbook-{N}.html 만, 번호순
  const files = (await fs.readdir(distDir))
    .filter(f => /^workbook-\d+\.html$/.test(f))
    .sort((a,b)=>parseInt(a.match(/\d+/))-parseInt(b.match(/\d+/)));
  if(!files.length){ console.error('No workbook-{N}.html in '+distDir); process.exit(1); }

  let allPages = '';
  let examLabel = '';
  const nums = [];
  for(const f of files){
    const no = parseInt(f.match(/\d+/));
    nums.push(no);
    const html = await fs.readFile(path.join(distDir, f), 'utf8');
    if(!examLabel){ const m = html.match(/<title>([^<·]+)/); if(m) examLabel = m[1].trim(); }
    const m = html.match(/<body>([\s\S]*?)<\/body>/i);
    const body = m ? m[1] : html;
    // <section class="page" ...> ... </section> 추출 (data-step 속성 포함)
    const sections = body.match(/<section class="page"[\s\S]*?<\/section>/g) || [];
    allPages += `\n<!-- ===== ${no}번 워크북 ===== -->\n` + sections.join('\n');
  }

  // 표지 제목: "[2026] 6월 모의고사" 다음 줄바꿈 → "N학년 영어 영역"
  const fullTitle = `${examLabel || '모의고사'} 영어 영역`;
  const titleHtml = fullTitle.includes('모의고사 ')
    ? `${esc(fullTitle.split('모의고사 ')[0])}모의고사<br>${esc(fullTitle.split('모의고사 ').slice(1).join('모의고사 '))}`
    : esc(fullTitle);

  // 번호 목록: 31번 다음 줄바꿈 → 32~43번 두 번째 줄
  const splitAt = nums.indexOf(32) > -1 ? nums.indexOf(32) : Math.ceil(nums.length / 2);
  const numLine1 = nums.slice(0, splitAt).join(' · ');
  const numLine2 = nums.slice(splitAt).join(' · ');
  const numHtml = numLine2 ? `${numLine1}<br>${numLine2}` : numLine1;

  // 표지 1장 — 워크북 mint 테마
  const cover = `<section class="page cover-page" data-step="1">
  <div class="cover-wrap">
    <div class="cover-brand">Terra Nova</div>
    <div class="cover-chip">WORKBOOK</div>
    <div class="cover-title">${titleHtml}</div>
    <div class="cover-sub">본문 워크북 합본 · 18~45번 (25·27·28 제외)</div>
    <div class="cover-steps">STEP 1 본문·해석 · 2 어법 · 3 어휘 · 4 빈칸 · 5 해석 · 6 배열 · 7 영작 · 8 종합 · 9 정답</div>
    <div class="cover-list">${numHtml}</div>
  </div>
</section>`;

  const coverCss = `
  .cover-page{display:flex;align-items:center;justify-content:center;text-align:center;}
  .cover-page .page-body{display:flex;align-items:center;justify-content:center;}
  .cover-wrap{max-width:80%;}
  .cover-brand{font-family:'Pretendard';font-size:18pt;font-weight:800;letter-spacing:.08em;color:var(--c-mint-deep);margin-bottom:10px;}
  .cover-chip{display:inline-block;background:var(--c-mint-soft);color:var(--c-mint-deep);border:1px solid var(--c-mint);font-size:9pt;font-weight:700;padding:3px 14px;border-radius:999px;letter-spacing:.06em;margin-bottom:22px;}
  .cover-title{font-size:30pt;font-weight:800;color:var(--c-text);line-height:1.25;margin-bottom:14px;}
  .cover-sub{font-size:13pt;color:var(--c-text-soft);margin-bottom:22px;}
  .cover-steps{font-size:9.5pt;color:var(--c-mint-deep);line-height:1.7;margin-bottom:24px;}
  .cover-list{font-family:'Pretendard';font-size:10.5pt;color:var(--c-mint-deep);line-height:1.8;letter-spacing:.02em;}
  `;

  const combinedHtml = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>${esc(examLabel)} 워크북 합본 — Terra Nova</title>
<link rel="stylesheet" href="${cssHref}">
<style>${coverCss}</style>
</head>
<body>
${cover}
${allPages}
</body>
</html>`;

  const combinedHtmlPath = path.join(distDir, 'workbook-combined.html');
  await fs.writeFile(combinedHtmlPath, combinedHtml, 'utf8');
  console.log(`📄 workbook-combined.html (${nums.length}개 워크북) → ${path.relative(process.cwd(), combinedHtmlPath)}`);

  const puppeteer = (await import('puppeteer')).default;
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(pathToFileURL(combinedHtmlPath).href, { waitUntil: 'networkidle0' });
  const outPath = path.join(distDir, outName);
  await page.pdf({ path: outPath, format: 'A4', printBackground: true, margin:{top:'0',bottom:'0',left:'0',right:'0'}, preferCSSPageSize: true });
  await browser.close();
  console.log(`✅ 워크북 합본 PDF → ${path.relative(process.cwd(), outPath)}`);
}
main().catch(e=>{console.error(e);process.exit(1);});
