#!/usr/bin/env node
/* ===================================================================
 * 분석지 합본 빌더 — 회차 전체 분석지를 1개 PDF로 합본
 * ===================================================================
 * dist 의 {N}.html 들을 번호순으로 합쳐 단일 HTML → 단일 PDF 생성.
 * 각 분석지의 .page 섹션을 그대로 이어 붙이므로 페이지 분할·디자인 동일.
 * 표지(cover) 1장 + 본문 순으로 구성.
 *
 * 사용법:
 *   node builder/combine.mjs <dist-dir> [<출력파일명.pdf>]
 *   node builder/combine.mjs 2026-june-grade2/dist 2026-6월-고2-영어-분석지-합본.pdf
 * =================================================================== */
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

function esc(s){return String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

async function main(){
  const distArg = process.argv[2];
  if(!distArg){ console.error('Usage: node builder/combine.mjs <dist-dir> [out.pdf]'); process.exit(1); }
  const distDir = path.resolve(process.cwd(), distArg);
  const roundDir = path.dirname(distDir);
  const cssAbs = path.resolve(roundDir, 'styles', 'analysis.css');
  const cssHref = pathToFileURL(cssAbs).href;
  const outName = process.argv[3] || 'combined.pdf';

  // {N}.html 만, 번호순
  const files = (await fs.readdir(distDir))
    .filter(f => /^\d+\.html$/.test(f))
    .sort((a,b)=>parseInt(a)-parseInt(b));
  if(!files.length){ console.error('No {N}.html in '+distDir); process.exit(1); }

  // 각 파일에서 <section class="page">...</section> 블록만 추출해 이어붙임
  let allPages = '';
  let examLabel = '';
  const nums = [];
  for(const f of files){
    const no = parseInt(f);
    nums.push(no);
    const html = await fs.readFile(path.join(distDir, f), 'utf8');
    if(!examLabel){ const m = html.match(/<div class="head-title">([^<]+)<\/div>/); if(m) examLabel = m[1].replace(/\s*·\s*\d+번.*/,''); }
    const m = html.match(/<body>([\s\S]*?)<\/body>/i);
    const body = m ? m[1] : html;
    // <section class="page"> ... </section> 만 추출 (다른 래퍼 무시)
    const sections = body.match(/<section class="page">[\s\S]*?<\/section>/g) || [];
    allPages += `\n<!-- ===== ${no}번 ===== -->\n` + sections.join('\n');
  }

  // 표지 1장
  const cover = `<section class="page cover-page">
  <div class="cover-wrap">
    <div class="cover-brand">Terra Nova</div>
    <div class="cover-title">${esc(examLabel || '모의고사')} 영어 영역</div>
    <div class="cover-sub">본문분석지 합본 · 18~45번 (25·27·28 제외)</div>
    <div class="cover-list">${nums.join(' · ')}</div>
  </div>
</section>`;

  const coverCss = `
  .cover-page{display:flex;align-items:center;justify-content:center;text-align:center;}
  .cover-wrap{max-width:80%;}
  .cover-brand{font-family:'Inter';font-size:18pt;font-weight:800;letter-spacing:.08em;color:var(--c-mint-deep);margin-bottom:18px;}
  .cover-title{font-size:30pt;font-weight:800;color:var(--c-text);line-height:1.25;margin-bottom:14px;}
  .cover-sub{font-size:13pt;color:var(--c-text-soft);margin-bottom:28px;}
  .cover-list{font-family:'Inter';font-size:10.5pt;color:var(--c-mint-deep);line-height:1.8;letter-spacing:.02em;}
  `;

  const combinedHtml = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>${esc(examLabel)} 분석지 합본 — Terra Nova</title>
<link rel="stylesheet" href="${cssHref}">
<style>${coverCss}</style>
</head>
<body>
${cover}
${allPages}
</body>
</html>`;

  const combinedHtmlPath = path.join(distDir, 'combined.html');
  await fs.writeFile(combinedHtmlPath, combinedHtml, 'utf8');
  console.log(`📄 combined.html (${nums.length}개 분석지) → ${path.relative(process.cwd(), combinedHtmlPath)}`);

  // PDF 렌더
  const puppeteer = (await import('puppeteer')).default;
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(pathToFileURL(combinedHtmlPath).href, { waitUntil: 'networkidle0' });
  const outPath = path.join(distDir, outName);
  await page.pdf({ path: outPath, format: 'A4', printBackground: true, margin:{top:'0',bottom:'0',left:'0',right:'0'}, preferCSSPageSize: true });
  await browser.close();
  console.log(`✅ 합본 PDF → ${path.relative(process.cwd(), outPath)}`);
}
main().catch(e=>{console.error(e);process.exit(1);});
