// mypage 6탭 자동 검증
// 1) 로그인 (link-test-001@gmail.com)
// 2) 각 탭 클릭 → 콘솔 에러 + 네트워크 4xx/5xx 수집 + 스크린샷
// 3) 결과 요약 stdout

import puppeteer from 'puppeteer';
import { mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

const outDir = resolve('../dist/mypage-audit');
mkdirSync(outDir, { recursive: true });

const EMAIL = 'link-test-001@gmail.com';
const PW    = 'pokl2528~!@';
const SITE  = 'https://terra-nova.kr';

const TABS = [
  { key: 'dashboard', label: 'DASHBOARD', nth: 1 },
  { key: 'level',     label: 'LEVEL',     nth: 2 },
  { key: 'delivery',  label: 'DELIVERY',  nth: 3 },
  { key: 'history',   label: 'PAYMENT',   nth: 4 },
  { key: 'reviews',   label: 'REVIEWS',   nth: 5 },
  { key: 'account',   label: 'ACCOUNT',   nth: 6 },
];

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });

const consoleErrors = [];
const netErrors = [];
const pageErrors = [];

page.on('console', msg => {
  if (msg.type() === 'error' || msg.type() === 'warning') {
    consoleErrors.push({ type: msg.type(), text: msg.text() });
  }
});
page.on('pageerror', err => pageErrors.push(err.message));
page.on('response', res => {
  if (res.status() >= 400) {
    netErrors.push({ status: res.status(), url: res.url().substring(0, 150) });
  }
});

const errorsByTab = {};
function snapshotErrors(tabKey) {
  errorsByTab[tabKey] = {
    console: [...consoleErrors],
    network: [...netErrors],
    page:    [...pageErrors],
  };
  consoleErrors.length = 0;
  netErrors.length     = 0;
  pageErrors.length    = 0;
}

try {
  // 로그인
  console.log('▶ Login...');
  await page.goto(SITE + '/login.html', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.waitForSelector('#login-email', { timeout: 10000 });
  await page.type('#login-email', EMAIL);
  await page.type('#login-password', PW);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 }).catch(() => null),
    page.click('button[type="submit"], .btn-login'),
  ]);
  await new Promise(r => setTimeout(r, 2500));

  const currentUrl = page.url();
  console.log('  → after login:', currentUrl);
  if (!currentUrl.includes('mypage') && !currentUrl.includes('index')) {
    // 명시적 mypage 이동
    await page.goto(SITE + '/mypage.html', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));
  } else if (!currentUrl.includes('mypage')) {
    await page.goto(SITE + '/mypage.html', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));
  }

  // 초기 dashboard 로딩 대기
  await new Promise(r => setTimeout(r, 2000));
  snapshotErrors('_login');
  await page.screenshot({ path: join(outDir, '00-dashboard-initial.png'), fullPage: true });

  // 각 탭 순회
  for (const t of TABS) {
    console.log('▶ Tab:', t.label);
    // 좌측 메뉴 nth-child 클릭
    const clicked = await page.evaluate((nth, key) => {
      const items = document.querySelectorAll('.nav-menu-item');
      const target = [...items].find(el => el.getAttribute('onclick')?.includes("switchTab('" + key + "',"));
      if (target) { target.click(); return true; }
      if (items[nth - 1]) { items[nth - 1].click(); return true; }
      return false;
    }, t.nth, t.key);
    console.log('  clicked:', clicked);
    await new Promise(r => setTimeout(r, 2200));
    snapshotErrors(t.key);
    await page.screenshot({ path: join(outDir, `${String(TABS.indexOf(t) + 1).padStart(2, '0')}-${t.key}.png`), fullPage: true });
  }
} finally {
  await browser.close();
}

// === 결과 요약 ===
console.log('\n========= MYPAGE AUDIT RESULT =========\n');
for (const key of Object.keys(errorsByTab)) {
  const e = errorsByTab[key];
  const total = e.console.length + e.network.length + e.page.length;
  if (total === 0) {
    console.log(`[${key}] ✅ No issues`);
    continue;
  }
  console.log(`[${key}] ⚠️ ${total} issue(s)`);
  e.console.forEach(c => console.log(`  console.${c.type}: ${c.text.substring(0, 180)}`));
  e.network.forEach(n => console.log(`  HTTP ${n.status}: ${n.url}`));
  e.page.forEach(p => console.log(`  page.error: ${p.substring(0, 180)}`));
  console.log('');
}
console.log('\nScreenshots in:', outDir);
