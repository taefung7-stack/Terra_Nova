#!/usr/bin/env node
/* ===================================================================
 * 분석지 부분 합본 빌더 — 지정한 번호만 골라 1개 PDF로 합본
 * ===================================================================
 * combine.mjs 는 dist 의 {N}.html 을 "전부" 합치지만, 이 스크립트는
 * 사용자가 지정한 번호만 골라 합친다. (수업용 발췌본 등)
 *
 * combine.mjs 와 동일하게 각 분석지의 <section class="page"> 를 그대로
 * 이어 붙이므로 페이지 분할·디자인·글리프 보정이 원본과 동일하다.
 *
 * 표지는 기본적으로 붙이지 않는다(--cover 로 켤 수 있음).
 *
 * 사용법:
 *   node builder/combine-subset.mjs <dist-dir> <out.pdf> <번호,콤마구분> [--cover]
 *   node builder/combine-subset.mjs 2026-june-grade2/dist 발췌.pdf 30,31,34,36,37,38,39,40
 * =================================================================== */
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

function esc(s){return String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

async function main(){
  const [distArg, outArg, numsArg] = process.argv.slice(2);
  const withCover = process.argv.includes('--cover');
  if(!distArg || !outArg || !numsArg){
    console.error('Usage: node builder/combine-subset.mjs <dist-dir> <out.pdf> <30,31,34> [--cover]');
    process.exit(1);
  }
  const distDir = path.resolve(process.cwd(), distArg);
  const cssHref = '../styles/analysis.css';

  const want = numsArg.split(',').map(s=>parseInt(s.trim(),10)).filter(n=>!Number.isNaN(n));
  if(!want.length){ console.error('번호 목록이 비었습니다.'); process.exit(1); }

  // 요청한 번호의 파일이 실제로 있는지 먼저 전부 확인 (조용한 누락 방지)
  const missing = [];
  for(const n of want){
    try { await fs.access(path.join(distDir, `${n}.html`)); }
    catch { missing.push(n); }
  }
  if(missing.length){
    console.error(`❌ dist 에 없는 번호: ${missing.join(', ')}`);
    console.error('   먼저 build 를 돌렸는지 확인하세요.');
    process.exit(1);
  }

  let allPages = '';
  let examLabel = '';
  let pageCount = 0;
  for(const no of want){
    const html = await fs.readFile(path.join(distDir, `${no}.html`), 'utf8');
    if(!examLabel){
      const m = html.match(/<div class="head-title">([^<]+)<\/div>/);
      if(m) examLabel = m[1].replace(/\s*·\s*\d+번.*/,'');
    }
    const m = html.match(/<body>([\s\S]*?)<\/body>/i);
    const body = m ? m[1] : html;
    const sections = body.match(/<section class="page">[\s\S]*?<\/section>/g) || [];
    if(!sections.length){ console.error(`❌ ${no}.html 에서 .page 섹션을 찾지 못했습니다.`); process.exit(1); }
    pageCount += sections.length;
    allPages += `\n<!-- ===== ${no}번 (${sections.length}p) ===== -->\n` + sections.join('\n');
    console.log(`   ${String(no).padStart(2)}번 · ${sections.length}p`);
  }

  const lbl = (examLabel || '모의고사').trim();
  const gm = lbl.match(/^(.*?)(\s*\d+학년)\s*$/);
  const titleLine1 = gm ? gm[1].trim() : lbl;
  const titleLine2 = (gm ? gm[2].trim() + ' ' : '') + '영어 영역';

  const cover = withCover ? `<section class="page cover-page">
  <div class="cover-wrap">
    <div class="cover-brand">Terra Nova</div>
    <div class="cover-title">${esc(titleLine1)}<br>${esc(titleLine2)}</div>
    <div class="cover-sub">본문분석지 발췌본 · ${want.length}개 지문</div>
    <div class="cover-list">${want.join(' · ')}</div>
  </div>
</section>` : '';

  // combine.mjs 와 동일한 페이지 박스 고정(하단 절단 드리프트 방지)
  const extraCss = `
  @page { size: A4; margin: 0; }
  html, body { margin: 0; padding: 0; }
  .page { box-sizing: border-box; }
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
<title>${esc(examLabel)} 분석지 발췌본 (${want.join('·')}) — Terra Nova</title>
<link rel="stylesheet" href="${cssHref}">
<style>${extraCss}</style>
</head>
<body>
${cover}
${allPages}
</body>
</html>`;

  const htmlName = path.basename(outArg, '.pdf') + '.html';
  const combinedHtmlPath = path.join(distDir, htmlName);
  await fs.writeFile(combinedHtmlPath, combinedHtml, 'utf8');
  console.log(`📄 ${htmlName} (${want.length}개 지문 / 본문 ${pageCount}p) → ${path.relative(process.cwd(), combinedHtmlPath)}`);

  const puppeteer = (await import('puppeteer')).default;
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(pathToFileURL(combinedHtmlPath).href, { waitUntil: 'networkidle0' });
  const outPath = path.join(distDir, outArg);
  await page.pdf({ path: outPath, format: 'A4', printBackground: true, margin:{top:'0',bottom:'0',left:'0',right:'0'}, preferCSSPageSize: true });
  await browser.close();
  console.log(`✅ 발췌본 PDF → ${path.relative(process.cwd(), outPath)}`);
}
main().catch(e=>{console.error(e);process.exit(1);});
