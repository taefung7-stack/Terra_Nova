#!/usr/bin/env node
/* ===================================================================
 * 이미지 기반 PDF 빌더 — page.pdf() 인쇄 경로의 폰트 글리프 누락
 * (Pretendard 한글런 내 [ ] ' — & 등이 tofu 로 깨짐) 우회용.
 *
 * 각 .page 를 스크린샷(2x)으로 캡처 → A4 1장당 1이미지로 PDF 합성.
 * 스크린샷 렌더는 글리프가 완벽하므로 화면과 픽셀 동일한 PDF 생성.
 *
 * 사용법:
 *   node builder/pdf-image.mjs <html-file-or-dist-dir> [out.pdf] [--footer="텍스트"]
 *   - dist 디렉터리: 모든 {N}.html 을 각각 {N}.pdf 로
 *   - 단일 html: 해당 파일 1개를 out.pdf 로 (합본 등)
 *   --footer 지정 시 좌측 하단 브랜드 문구를 해당 텍스트로 치환
 * =================================================================== */
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const SCALE = 2; // 2x = 약 192dpi 상당, 텍스트 선명

function parseArgs(argv){
  const a = { footer: null, positional: [] };
  for(const x of argv){
    if(x.startsWith('--footer=')) a.footer = x.slice('--footer='.length);
    else a.positional.push(x);
  }
  return a;
}

async function renderHtmlToPdf(browser, htmlPath, outPath, footer){
  const page = await browser.newPage();
  await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: SCALE });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle0' });
  await page.evaluate(async () => { if (document.fonts && document.fonts.ready) await document.fonts.ready; });

  // 좌측 하단 브랜드 문구 치환 (옵션)
  if (footer != null) {
    await page.evaluate((txt) => {
      document.querySelectorAll('.page-foot .brand').forEach(el => { el.textContent = txt; });
    }, footer);
  }

  // 각 .page 를 캡처
  const handles = await page.$$('.page');
  const shots = [];
  for (const h of handles) {
    const buf = await h.screenshot({ type: 'png' });
    shots.push(Buffer.from(buf).toString('base64'));
  }
  await page.close();

  // 캡처 이미지를 A4 1장당 1개로 배치한 합성 HTML → PDF
  const imgs = shots.map(b64 => `<img class="pg" src="data:image/png;base64,${b64}">`).join('\n');
  const composite = `<!doctype html><html><head><meta charset="utf-8"><style>
    @page { size: A4; margin: 0; }
    html,body{margin:0;padding:0;}
    .pg{display:block;width:210mm;height:297mm;page-break-after:always;}
    .pg:last-child{page-break-after:auto;}
  </style></head><body>${imgs}</body></html>`;

  const cpage = await browser.newPage();
  await cpage.setContent(composite, { waitUntil: 'networkidle0' });
  await cpage.pdf({ path: outPath, format: 'A4', printBackground: true, margin:{top:'0',bottom:'0',left:'0',right:'0'}, preferCSSPageSize: true });
  await cpage.close();
  return shots.length;
}

async function main(){
  const { footer, positional } = parseArgs(process.argv.slice(2));
  const target = positional[0];
  if(!target){ console.error('Usage: node builder/pdf-image.mjs <html|dist-dir> [out.pdf] [--footer="..."]'); process.exit(1); }
  const abs = path.resolve(process.cwd(), target);
  const puppeteer = (await import('puppeteer')).default;
  const browser = await puppeteer.launch({ headless: 'new' });

  const stat = await fs.stat(abs);
  if (stat.isDirectory()) {
    const files = (await fs.readdir(abs)).filter(f => /^\d+\.html$/.test(f)).sort((a,b)=>parseInt(a)-parseInt(b));
    console.log(`🖼️  이미지 기반 PDF ${files.length}개 생성 (footer=${footer ?? '기본'})...`);
    for (const f of files) {
      const out = path.join(abs, f.replace(/\.html$/, '.pdf'));
      const n = await renderHtmlToPdf(browser, path.join(abs, f), out, footer);
      console.log(`   ✓ ${f} (${n}p) → ${path.basename(out)}`);
    }
  } else {
    const out = path.resolve(process.cwd(), positional[1] || abs.replace(/\.html$/, '.pdf'));
    const n = await renderHtmlToPdf(browser, abs, out, footer);
    console.log(`   ✓ ${path.basename(abs)} (${n}p) → ${path.relative(process.cwd(), out)}`);
  }
  await browser.close();
  console.log('✅ Done.');
}
main().catch(e=>{console.error(e);process.exit(1);});
