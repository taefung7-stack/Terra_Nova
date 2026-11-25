import path from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer';
const file = path.resolve(process.argv[2]);
const b = await puppeteer.launch({ headless: 'new' });
const p = await b.newPage();
await p.goto(pathToFileURL(file).href, { waitUntil: 'networkidle0' });
const rows = await p.evaluate(() => {
  const out = [];
  document.querySelectorAll('section.page').forEach((sec) => {
    const pno = sec.querySelector('.pageno')?.textContent || '?';
    const tag = sec.querySelector('.head-tag')?.textContent || '';
    const foot = sec.querySelector('.page-foot');
    const limit = foot ? foot.getBoundingClientRect().top : sec.getBoundingClientRect().bottom;
    let worst = 0, who = '';
    sec.querySelectorAll('.vq').forEach((card) => {
      const r = card.getBoundingClientRect();
      const spill = r.bottom - limit;           // 푸터/페이지 경계를 넘어간 픽셀
      if (spill > worst) { worst = spill; who = (card.querySelector('.vq-no')?.textContent || '') + ' ' + (card.querySelector('.vq-wtype,.vq-q')?.textContent || '').slice(0, 28); }
    });
    out.push({ pno, tag, spill: Math.round(worst), who });
  });
  return out;
});
await b.close();
const bad = rows.filter(r => r.spill > 1);
console.log(`총 ${rows.length}페이지 · 카드가 푸터를 넘는 페이지 ${bad.length}개`);
for (const r of bad) console.log(`  p${r.pno} [${r.tag}] +${r.spill}px  ← 문항 ${r.who}`);
