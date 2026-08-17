#!/usr/bin/env node
/* ===================================================================
 * 천재(조수경) 영어II · Lesson 3 워크북 합본 — 일회성 스크립트
 * ===================================================================
 * dist/workbook-{1..5}.html 를 번호순으로 이어 붙여 단일 PDF 로 만든다.
 * 공용 builder/combine-workbook.mjs 를 쓰지 않은 이유:
 *   1) 공용본은 워크북별 페이지번호(1~10)를 그대로 유지하지만,
 *      여기서는 합본 전체 통번호로 다시 매겨야 한다.
 *   2) 공용본 표지 문구가 모의고사 전용("18~45번 (25·27·28 제외)")으로 하드코딩됨.
 * v1.0 LOCKED 빌더(build-workbook.mjs)와 공용 combine 스크립트는 건드리지 않는다.
 *
 * 페이지 번호 재매김:
 *   - 표지는 번호 없음(표지에는 page-foot 자체가 없음).
 *   - 본문 50페이지를 1..50 으로 연속 부여 → <span class="pageno">N</span> 치환.
 *   - 헤더의 "N번" 은 섹션명(교과서 소제목)으로 교체해 합본 문맥에 맞춘다.
 *
 * 사용법:
 *   node _oneoff-천재영어2-L3/combine-oneoff.mjs
 *   node _oneoff-천재영어2-L3/combine-oneoff.mjs "출력파일명.pdf"
 * =================================================================== */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(HERE, 'dist');

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// 섹션 라벨 — 교과서 소제목(README 구성표와 동일)
const SECTION_LABELS = {
  1: '① 도입 + Help Yourself and Help Me',
  2: '② The Worst Free Rider',
  3: '③ Deceptive Seeds',
  4: '④ The Wind Beneath My Wings',
  5: '⑤ Rising from the Ashes',
};

// 개별 워크북의 exam-tag 는 "교과서 · Lesson 3 · {섹션명}" 형태다.
// 합본에서는 qno 자리에 섹션 라벨을 넣으므로, 머리표에서는 섹션명을 떼어
// "천재(조수경) 영어II · Lesson 3" 까지만 남긴다(헤더·표지 제목 중복 방지).
function trimExamTag(tag) {
  const parts = String(tag).split('·').map(s => s.trim()).filter(Boolean);
  const cut = parts.findIndex(p => /^Lesson\s*\d+$/i.test(p));
  return (cut > -1 ? parts.slice(0, cut + 1) : parts).join(' · ');
}

async function main() {
  const outName = process.argv[2] || '천재영어2-Lesson3-워크북-합본.pdf';

  const files = (await fs.readdir(DIST))
    .filter(f => /^workbook-\d+\.html$/.test(f))
    .sort((a, b) => parseInt(a.match(/\d+/)) - parseInt(b.match(/\d+/)));
  if (!files.length) { console.error('No workbook-{N}.html in ' + DIST); process.exit(1); }

  let examLabel = '';
  const chunks = [];
  let pageNo = 0;               // 합본 통번호 카운터
  const toc = [];               // 표지 뒤 목차용 (섹션 → 시작 페이지)

  for (const f of files) {
    const no = parseInt(f.match(/\d+/));
    const html = await fs.readFile(path.join(DIST, f), 'utf8');

    // 공통 머리표(교과서/과목)는 첫 파일에서 한 번만 추출 — 섹션명은 떼어낸다
    if (!examLabel) {
      const m = html.match(/<span class="exam-tag">([^<]+)</);
      if (m) examLabel = trimExamTag(m[1]);
    }

    const bodyM = html.match(/<body>([\s\S]*?)<\/body>/i);
    const body = bodyM ? bodyM[1] : html;
    const sections = body.match(/<section class="page"[\s\S]*?<\/section>/g) || [];
    if (!sections.length) { console.error(`No .page section in ${f}`); process.exit(1); }

    const label = SECTION_LABELS[no] || `섹션 ${no}`;
    toc.push({ label, start: pageNo + 1, pages: sections.length });

    const renumbered = sections.map(sec => {
      pageNo += 1;
      // 1) 푸터 페이지번호 → 합본 통번호
      let out = sec.replace(
        /(<span class="pageno">)\d+(<\/span>)/,
        `$1${pageNo}$2`,
      );
      // 1-b) 개별 워크북이 hide_brand 옵션으로 푸터 브랜드를 비워 둔 경우 복원.
      //      합본은 한 권의 교재이므로 푸터가 비어 있으면 미완성처럼 보인다.
      out = out.replace(
        /(<span class="brand">)\s*(<\/span>)/,
        `$1Terra Nova · Workbook$2`,
      );
      // 2) 머리표를 "교과서 · Lesson 3" 까지로 정리하고 섹션 라벨을 붙인다.
      //    개별 워크북이 hide_head_no 옵션이면 <span class="qno"> 자체가 없으므로
      //    qno 치환에 의존하지 않고 exam-tag 뒤에 라벨 span 을 새로 삽입한다.
      //    (라벨이 없으면 합본에서 어느 섹션 페이지인지 구분할 수 없음)
      out = out.replace(
        /(<span class="exam-tag">)([^<]*)(<\/span>)/,
        (_m, a, tag, b) =>
          `${a}${esc(trimExamTag(tag))}${b}`
          + `\n    <span class="sep">|</span>`
          + `\n    <span class="qno">${esc(label)}</span>`,
      );
      // 3) 기존 qno(문항번호)가 남아 있으면 제거 — 라벨과 중복되므로.
      out = out.replace(
        /\s*<span class="sep">\|<\/span>\s*<span class="qno">\d+번<\/span>/,
        '',
      );
      return out;
    });

    chunks.push(`\n<!-- ===== 섹션 ${no} · ${label} (p.${toc[toc.length - 1].start}~${pageNo}) ===== -->\n`
      + renumbered.join('\n'));
  }

  const totalPages = pageNo;

  // ── 표지 ────────────────────────────────────────────────────────────
  // .page-body 로 감싼다 — check-overflow.mjs 가 모든 .page 에서 .page-body 를 요구.
  const cover = `<section class="page cover-page">
  <div class="page-body">
  <div class="cover-wrap">
    <div class="cover-brand">Terra Nova</div>
    <div class="cover-chip">WORKBOOK</div>
    <div class="cover-title">${esc(examLabel || '영어II')}<br>워크북 합본</div>
    <div class="cover-sub">Seeds as the Best Survival Strategy</div>
    <div class="cover-steps">STEP 1 본문·해석 · 2 어법 · 3 어휘 · 4 빈칸 · 5 해석 · 6 배열 · 7 영작 · 8 종합 · 9 정답</div>
    <div class="cover-toc">
      ${toc.map(t => `<div class="toc-row"><span class="toc-label">${esc(t.label)}</span><span class="toc-dots"></span><span class="toc-page">${t.start}</span></div>`).join('\n      ')}
    </div>
    <div class="cover-total">본문 ${totalPages}페이지 · 5개 섹션</div>
  </div>
  </div>
</section>`;

  const coverCss = `
  /* 합본 N페이지 297mm 누적 시 Chromium PDF 페이지 경계 드리프트로 하단 절단되는 것 방지. */
  @page { size: A4; margin: 0; }
  html, body { margin: 0; padding: 0; }
  .page { box-sizing: border-box; }
  .cover-page{display:flex;align-items:center;justify-content:center;text-align:center;}
  .cover-page .page-body{display:flex;align-items:center;justify-content:center;}
  .cover-wrap{max-width:78%;}
  .cover-brand{font-family:'Pretendard';font-size:18pt;font-weight:800;letter-spacing:.08em;color:var(--c-mint-deep);margin-bottom:10px;}
  .cover-chip{display:inline-block;background:var(--c-mint-soft);color:var(--c-mint-deep);border:1px solid var(--c-mint);font-size:9pt;font-weight:700;padding:3px 14px;border-radius:999px;letter-spacing:.06em;margin-bottom:22px;}
  .cover-title{font-size:26pt;font-weight:800;color:var(--c-text);line-height:1.3;margin-bottom:12px;}
  .cover-sub{font-size:13pt;color:var(--c-text-soft);margin-bottom:20px;font-style:italic;}
  .cover-steps{font-size:9.5pt;color:var(--c-mint-deep);line-height:1.7;margin-bottom:26px;}
  .cover-toc{text-align:left;margin:0 auto 20px;max-width:420px;}
  .toc-row{display:flex;align-items:baseline;gap:8px;font-size:11pt;color:var(--c-text);line-height:2.0;}
  .toc-label{white-space:nowrap;}
  .toc-dots{flex:1;border-bottom:1px dotted var(--c-mint);transform:translateY(-3px);}
  .toc-page{font-weight:700;color:var(--c-mint-deep);}
  .cover-total{font-size:10pt;color:var(--c-text-soft);}
  `;

  const combinedHtml = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>${esc(examLabel)} Lesson 3 워크북 합본 — Terra Nova</title>
<link rel="stylesheet" href="../styles/workbook.css">
<style>${coverCss}</style>
</head>
<body>
${cover}
${chunks.join('\n')}
</body>
</html>`;

  const combinedHtmlPath = path.join(DIST, 'workbook-combined.html');
  await fs.writeFile(combinedHtmlPath, combinedHtml, 'utf8');
  console.log(`📄 workbook-combined.html — 표지 1p + 본문 ${totalPages}p (총 ${totalPages + 1}p)`);
  toc.forEach(t => console.log(`   ${t.label}: p.${t.start}~${t.start + t.pages - 1}`));

  const puppeteer = (await import('puppeteer')).default;
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(pathToFileURL(combinedHtmlPath).href, { waitUntil: 'networkidle0' });
  const outPath = path.join(DIST, outName);
  await page.pdf({
    path: outPath, format: 'A4', printBackground: true,
    margin: { top: '0', bottom: '0', left: '0', right: '0' }, preferCSSPageSize: true,
  });
  await browser.close();
  console.log(`✅ 합본 PDF → ${path.relative(process.cwd(), outPath)}`);
}
main().catch(e => { console.error(e); process.exit(1); });
