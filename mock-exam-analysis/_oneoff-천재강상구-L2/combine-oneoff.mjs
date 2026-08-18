#!/usr/bin/env node
/* ===================================================================
 * 천재(강상구) 영어II · Lesson 2 — 합본 빌더 (워크북 / 본문분석)
 * ===================================================================
 * dist 의 챕터별 HTML 을 이어 붙여 표지 1장 + 본문 N장 단일 HTML 을 만든다.
 * 페이지 번호는 챕터별 번호를 버리고 **합본 전체 통번호**로 다시 매긴다.
 *
 * 공용 builder/combine-workbook.mjs 를 쓰지 않은 이유:
 *   1) 공용본은 워크북별 페이지번호를 그대로 유지(설계상 의도)하지만
 *      여기서는 합본 통번호가 필요하다.
 *   2) 공용본 표지 문구가 모의고사 전용("18~45번 (25·27·28 제외)")으로 하드코딩.
 *   3) 이 폴더는 분석지(analysis.css)와 워크북(workbook.css) 두 종을 모두 합쳐야 한다.
 * v1.0 LOCKED 빌더와 공용 combine 스크립트는 건드리지 않는다.
 *
 * 페이지 번호:
 *   - 표지에는 번호를 넣지 않는다(표지에 .page-foot 을 두지 않음).
 *   - 본문은 1..N 연속. <span class="pageno">N</span> 치환.
 *   - 개별 산출물이 hide_brand 로 푸터 브랜드를 비워 둔 경우 합본에서 복원한다.
 *
 * 사용법:
 *   node _oneoff-천재강상구-L2/combine-oneoff.mjs workbook
 *   node _oneoff-천재강상구-L2/combine-oneoff.mjs analysis
 *   node _oneoff-천재강상구-L2/combine-oneoff.mjs both
 * =================================================================== */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(HERE, 'dist');

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// 챕터 라벨 — _SOURCE.js 의 subtitle 과 동일(교과서 소제목 기준)
const CHAPTERS = [
  { no: 1, label: '① 넛지란 무엇인가 (도입)' },
  { no: 2, label: '② Through Designs — 디자인 활용' },
  { no: 3, label: '③ Through Peer Pressure — 동조 압력 활용' },
  { no: 4, label: '④ Through Defaults — 디폴트 활용' },
  { no: 5, label: '⑤ Dark Patterns (도입 + Forced Continuity)' },
  { no: 6, label: '⑥ Artificial Scarcity + Hidden Information' },
];

const KINDS = {
  workbook: {
    file: n => `workbook-${n}.html`,
    css: '../styles/workbook.css',
    out: '천재강상구-L2-워크북-합본',
    chip: 'WORKBOOK',
    title: '워크북 합본',
    brand: 'Terra Nova · Workbook',
    steps: 'STEP 1 본문·해석 · 2 어법 · 3 어휘 · 4 빈칸 · 5 해석 · 6 배열 · 7 영작 · 8 종합 · 9 정답',
    // 워크북 머리표는 <span class="exam-tag">, 라벨을 그 뒤에 삽입
    injectLabel: (sec, label) => sec.replace(
      /(<span class="exam-tag">)([^<]*)(<\/span>)/,
      (_m, a, tag, b) => `${a}${tag}${b}`
        + `\n    <span class="sep">|</span>`
        + `\n    <span class="qno">${esc(label)}</span>`,
    ),
  },
  analysis: {
    file: n => `${n}.html`,
    css: '../styles/analysis.css',
    out: '천재강상구-L2-본문분석-합본',
    chip: 'ANALYSIS',
    title: '본문 분석 합본',
    brand: 'Terra Nova · 본문분석',
    steps: '어휘 정리 · 원문 · 문장 구조 분석 · 패러프레이징',
    // 분석지 머리표는 <div class="head-title"> / 우측 <div class="head-tag">
    // 라벨을 head-title 뒤에 별도 div 로 삽입(그래야 head-tag 의 ANALYSIS 표기가 유지됨)
    injectLabel: (sec, label) => sec.replace(
      /(<div class="head-title">)([^<]*)(<\/div>)/,
      (_m, a, t, b) => `${a}${t}${b}\n    <div class="head-chapter">${esc(label)}</div>`,
    ),
  },
};

async function build(kindName) {
  const K = KINDS[kindName];
  if (!K) throw new Error(`unknown kind: ${kindName}`);

  let pageNo = 0;
  const toc = [];
  const chunks = [];

  for (const ch of CHAPTERS) {
    const p = path.join(DIST, K.file(ch.no));
    let html;
    try {
      html = await fs.readFile(p, 'utf8');
    } catch {
      throw new Error(`없는 파일: ${path.relative(process.cwd(), p)}`);
    }
    const bodyM = html.match(/<body>([\s\S]*?)<\/body>/i);
    const body = bodyM ? bodyM[1] : html;
    const sections = body.match(/<section class="page"[\s\S]*?<\/section>/g) || [];
    if (!sections.length) throw new Error(`.page 섹션 없음: ${K.file(ch.no)}`);

    const start = pageNo + 1;
    const renumbered = sections.map(sec => {
      pageNo += 1;
      // 1) 푸터 페이지번호 → 합본 통번호
      let out = sec.replace(/(<span class="pageno">)\d+(<\/span>)/, `$1${pageNo}$2`);
      // 2) 비어 있는 푸터 브랜드 복원 (개별 산출물은 hide_brand 로 비움)
      out = out.replace(/(<span class="brand">)\s*(<\/span>)/, `$1${esc(K.brand)}$2`);
      // 3) 헤더에 챕터 라벨 삽입 — 합본에서 어느 챕터인지 식별 가능하게
      out = K.injectLabel(out, ch.label);
      return out;
    });

    toc.push({ label: ch.label, start, end: pageNo });
    chunks.push(`\n<!-- ===== ${ch.label} (p.${start}~${pageNo}) ===== -->\n`
      + renumbered.join('\n'));
  }

  const total = pageNo;
  const cover = `<section class="page cover-page">
  <div class="page-body">
  <div class="cover-wrap">
    <div class="cover-brand">Terra Nova</div>
    <div class="cover-chip">${esc(K.chip)}</div>
    <div class="cover-title">천재(강상구) 영어II · Lesson 2<br>${esc(K.title)}</div>
    <div class="cover-sub">Nudge — Guiding Choices Without Forcing Them</div>
    <div class="cover-steps">${esc(K.steps)}</div>
    <div class="cover-toc">
      ${toc.map(t => `<div class="toc-row"><span class="toc-label">${esc(t.label)}</span><span class="toc-dots"></span><span class="toc-page">${t.start}</span></div>`).join('\n      ')}
    </div>
    <div class="cover-total">본문 ${total}페이지 · ${CHAPTERS.length}개 챕터</div>
  </div>
  </div>
</section>`;

  const coverCss = `
  /* 합본 N페이지 누적 시 Chromium 페이지 경계 드리프트로 하단이 잘리는 것 방지 */
  @page { size: A4; margin: 0; }
  html, body { margin: 0; padding: 0; }
  .page { box-sizing: border-box; }
  .cover-page{display:flex;align-items:center;justify-content:center;text-align:center;}
  .cover-page .page-body{display:flex;align-items:center;justify-content:center;}
  .cover-wrap{max-width:80%;}
  .cover-brand{font-size:18pt;font-weight:800;letter-spacing:.08em;margin-bottom:10px;}
  .cover-chip{display:inline-block;font-size:9pt;font-weight:700;padding:3px 14px;
    border-radius:999px;letter-spacing:.06em;margin-bottom:22px;border:1px solid currentColor;}
  .cover-title{font-size:24pt;font-weight:800;line-height:1.3;margin-bottom:12px;}
  .cover-sub{font-size:12pt;margin-bottom:20px;font-style:italic;opacity:.75;}
  .cover-steps{font-size:9.5pt;line-height:1.7;margin-bottom:26px;opacity:.85;}
  .cover-toc{text-align:left;margin:0 auto 20px;max-width:460px;}
  .toc-row{display:flex;align-items:baseline;gap:8px;font-size:10.5pt;line-height:2.0;}
  .toc-label{white-space:nowrap;}
  .toc-dots{flex:1;border-bottom:1px dotted currentColor;opacity:.35;transform:translateY(-3px);}
  .toc-page{font-weight:700;}
  .cover-total{font-size:10pt;opacity:.7;}
  /* 분석지 헤더에 삽입한 챕터 라벨 */
  .head-chapter{font-size:8.5pt;font-weight:700;opacity:.8;margin-left:10px;}
  `;

  const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>천재(강상구) 영어II · Lesson 2 ${esc(K.title)} — Terra Nova</title>
<link rel="stylesheet" href="${K.css}">
<style>${coverCss}</style>
</head>
<body>
${cover}
${chunks.join('\n')}
</body>
</html>`;

  const outHtml = path.join(DIST, `${K.out}.html`);
  await fs.writeFile(outHtml, html, 'utf8');
  console.log(`📄 ${K.out}.html — 표지 1p + 본문 ${total}p (총 ${total + 1}p)`);
  toc.forEach(t => console.log(`   ${t.label}: p.${t.start}~${t.end}`));
  console.log(`   → PDF: node builder/pdf-image.mjs "${path.relative(process.cwd(), outHtml)}" "${path.relative(process.cwd(), path.join(DIST, K.out + '.pdf'))}" --footer="${K.brand}"`);
  return outHtml;
}

const kind = process.argv[2] || 'both';
const list = kind === 'both' ? ['workbook', 'analysis'] : [kind];
for (const k of list) {
  await build(k);
  console.log();
}
