#!/usr/bin/env node
/**
 * Terra Nova OG 썸네일 PNG 렌더 (1200×630).
 * 하양 배경 + 검정 큰 "TERRA NOVA" + "영어로 전과목 학습". Pretendard(CDN) 임베드.
 * 카카오/SNS 는 og:image 로 SVG 미지원 → PNG 필요. Pretendard fallback 방지 위해 브라우저 렌더.
 *
 * 출력: 사이트 루트 og-cover.png (index/login/mypage/sitemap/signup og:image)
 * 사용: node textbook/tools/_render-og-cover.mjs
 */
import puppeteer from 'puppeteer';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(here, '..', '..'); // Terra Nova/
const OUT = resolve(siteRoot, 'og-cover-v3.png');

const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { width:1200px; height:630px; }
  .card {
    width:1200px; height:630px; background:#E9FBF4;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    font-family:'Pretendard','Noto Sans KR',Arial,sans-serif; color:#111111;
  }
  .brand { font-size:150px; font-weight:800; letter-spacing:2px; line-height:1; }
  .sub   { font-size:52px;  font-weight:600; letter-spacing:1px; margin-top:34px; }
</style></head>
<body>
  <div class="card">
    <div class="brand">TERRA NOVA</div>
    <div class="sub">영어로 전과목 학습</div>
  </div>
</body></html>`;

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
  // 폰트 완전 로드 대기
  await page.evaluate(async () => { await document.fonts.ready; });
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: OUT, type: 'png', clip: { x: 0, y: 0, width: 1200, height: 630 } });
  console.log(`✓ ${OUT}`);
} finally {
  await browser.close().catch(() => {});
}
