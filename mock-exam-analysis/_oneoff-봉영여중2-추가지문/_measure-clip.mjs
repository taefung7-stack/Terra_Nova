import path from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer';
const file = path.resolve(process.argv[2]);
const b = await puppeteer.launch({ headless: 'new' });
const p = await b.newPage();
await p.goto(pathToFileURL(file).href, { waitUntil: 'networkidle0' });
const bad = await p.evaluate(() => {
  const out = [];
  // overflow:hidden 인 컨테이너에서 내용이 잘리는지 전수 확인
  document.querySelectorAll('.page-body, .vq-col, .vq-passage-shared, .vq-passage').forEach(el => {
    const over = el.scrollHeight - el.clientHeight;
    if (over > 1) {
      const sec = el.closest('section.page');
      out.push({ pno: sec?.querySelector('.pageno')?.textContent || '?',
        cls: el.className, over, sample: (el.textContent || '').trim().slice(-60) });
    }
  });
  return out;
});
await b.close();
console.log(bad.length ? `잘림 ${bad.length}건` : '잘림 0건 — 모든 내용이 컨테이너 안에 들어감');
for (const x of bad) console.log(`  p${x.pno} .${x.cls} 초과 ${x.over}px | 끝부분: ...${x.sample}`);
