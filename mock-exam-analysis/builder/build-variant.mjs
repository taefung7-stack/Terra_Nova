#!/usr/bin/env node
/* ===================================================================
 * Terra Nova 모의고사 변형문제 빌더 — v0.1 DRAFT (2026-05-29)
 * ===================================================================
 *
 * ★ 포맷 확정 전 초안. 분석지(measureAndChunk 실측 분배) +
 *   워크북(공통 컴포넌트) 패턴을 결합.
 *
 * ── 설계 ───────────────────────────────────────────────────────────
 *   - 한 지문당 12유형(주제/주장/요지/제목/빈칸/순서/삽입/함축/무관/
 *     어법/어휘/요약) + 서술형. 객관식 5지선다, 발문 한글 / 보기 영어.
 *   - 본문 문장은 약간 paraphrasing (학교내신 변형 스타일).
 *   - 문제 카드(.vq)는 puppeteer 실측 후 A4에 그리디 분배.
 *   - 정답·해설은 맨 뒤 답지 섹션에 몰아서 배치.
 *
 * 사용법:
 *   node builder/build-variant.mjs <data-dir> [<dist-dir>]
 *   node builder/build-variant.mjs 2026-march-grade2/data
 * =================================================================== */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const CIRCLED = ['①', '②', '③', '④', '⑤'];

// 유형 순서(모의고사 순) + 한글 라벨(헤더 묶음명) + 문항 발문.
// 빌더는 이 순서대로 섹션을 만들고, 각 섹션에 모든 지문의 해당 유형 문제를 모은다.
const TYPE_ORDER = [
  { key: 'theme',       label: '주제찾기',   question: '다음 글의 주제로 가장 적절한 것은?' },
  { key: 'claim',       label: '주장찾기',   question: '다음 글에서 필자가 주장하는 바로 가장 적절한 것은?' },
  { key: 'gist',        label: '요지찾기',   question: '다음 글의 요지로 가장 적절한 것은?' },
  { key: 'title',       label: '제목찾기',   question: '다음 글의 제목으로 가장 적절한 것은?' },
  { key: 'implication', label: '함축의미',   question: '밑줄 친 부분이 다음 글에서 의미하는 바로 가장 적절한 것은?' },
  { key: 'grammar',     label: '어법',       question: '다음 글의 밑줄 친 부분 중, 어법상 틀린 것은?' },
  { key: 'vocab',       label: '어휘',       question: '다음 글의 밑줄 친 부분 중, 문맥상 낱말의 쓰임이 적절하지 않은 것은?' },
  { key: 'blank',       label: '빈칸추론',   question: '다음 글의 빈칸에 들어갈 말로 가장 적절한 것은?' },
  { key: 'irrelevant',  label: '무관한 문장', question: '다음 글에서 전체 흐름과 관계 없는 문장은?' },
  { key: 'order',       label: '순서배열',   question: '주어진 글 다음에 이어질 글의 순서로 가장 적절한 것은?' },
  { key: 'insert',      label: '문장삽입',   question: '글의 흐름으로 보아, 주어진 문장이 들어가기에 가장 적절한 곳은?' },
  { key: 'summary',     label: '요약문',     question: '다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A), (B)에 들어갈 말로 가장 적절한 것은?' },
];

// ─────────────────────────────────────────────────────────────
// 공통 컴포넌트
// ─────────────────────────────────────────────────────────────

function pageHead({ examShort, grade, kindTag }) {
  return `  <header class="page-head">
    <div class="head-title">${esc(examShort)}${grade ? ' - ' + esc(grade) : ''}</div>
    <div class="head-tag">${esc(kindTag)}</div>
  </header>`;
}

function pageFoot(pageNum) {
  return `  <footer class="page-foot">
    <span class="brand">Terra Nova · 변형문제</span>
    <span class="pageno">${pageNum}</span>
  </footer>`;
}

function pageWrap({ headOpts, pageNum, bodyInner }) {
  return `<section class="page">
${pageHead(headOpts)}
  <div class="page-body">
${bodyInner}
  </div>
${pageFoot(pageNum)}
</section>`;
}

// ─────────────────────────────────────────────────────────────
// 유형별 문제 카드 렌더러 — 모두 .vq 카드 하나를 반환
// ─────────────────────────────────────────────────────────────

// 유형 묶음 구조: 페이지 헤더에 유형명이 있으므로, 카드 헤더는 문항 일련번호 +
// 출처 지문(원본 모의고사 번호) + 발문을 보여준다.
function cardHead(p) {
  const src = p.source_no ? `<span class="vq-src">${esc(p.source_no)}번</span>` : '';
  return `    <div class="vq-head">
      <span class="vq-no">${p.no}</span>
      ${src}
      <span class="vq-q">${esc(p.question)}</span>
    </div>`;
}

function choicesHtml(choices, { en = true } = {}) {
  const cls = en ? 'ch-txt en' : 'ch-txt';
  return `    <div class="vq-choices">
${choices.map((c, i) => {
    const marker = CIRCLED[i];
    const text = String(c ?? '').trim() === marker ? '' : `<span class="${cls}">${esc(c)}</span>`;
    return `      <div class="vq-choice"><span class="ch-no">${marker}</span>${text}</div>`;
  }).join('\n')}
    </div>`;
}

function passageBox(sentences) {
  const txt = sentences.map(esc).join(' ');
  return `    <div class="vq-passage">${txt}</div>`;
}

// 모든 일반 유형이 공유하는 전문(paraphrase 8문장). 문제별로 잘리지 않도록
// 항상 passage_full 전체를 출력한다. 문제 데이터에 개별 지문을 두지 않는다.
function fullPassage(full) {
  return passageBox(full);
}

// 주제·주장·요지·제목 — 전문 + 5지선다 (보기 언어는 데이터에 따름)
function renderSimple(p, full, { choicesEn }) {
  return `<div class="vq">
${cardHead(p)}
${fullPassage(full)}
${choicesHtml(p.choices, { en: choicesEn })}
</div>`;
}

// 빈칸 — 전문에서 지정 어구를 빈칸 처리, 5지선다(영어 단어)
// 데이터는 두 방식 지원: (1) blank_target 어구를 본문에서 찾아 가림,
// (2) 본문 문장에 이미 ___ 가 박혀 있음(긴 정답을 단어로 가릴 수 없을 때).
const BLANK_SPAN = '<span class="blank-inline" style="min-width:120px"></span>';
function renderBlank(p, full) {
  const target = p.blank_target; // 전문 중 빈칸으로 가릴 어구(문자열)
  const sents = full.map((s, i) => {
    let out = esc(s);
    if (i === p.blank_sentence_index) {
      if (/_{3,}/.test(out)) {
        out = out.replace(/_{3,}/, BLANK_SPAN);
      } else if (target) {
        out = out.replace(esc(target), BLANK_SPAN);
      }
    }
    return out;
  });
  return `<div class="vq">
${cardHead(p)}
    <div class="vq-passage">${sents.join(' ')}</div>
${choicesHtml(p.choices, { en: true })}
</div>`;
}

// 순서배열 — 주어진 글 + (A)(B)(C) 블록 + 순서 보기
function renderOrder(p) {
  const blocks = Object.entries(p.blocks).map(([k, v]) =>
    `      <div class="vq-block"><span class="blk-label">(${k})</span><span>${esc(v)}</span></div>`
  ).join('\n');
  return `<div class="vq">
${cardHead(p)}
    <div class="vq-given">${esc(p.given)}</div>
    <div class="vq-blocks">
${blocks}
    </div>
${choicesHtml(p.choices, { en: true })}
</div>`;
}

// 문장삽입 — 삽입문장 + 슬롯(①~⑤) 표시된 지문
function renderInsert(p) {
  const inner = p.passage_marked.map(seg =>
    `${esc(seg.text)} <span class="slot">( ${CIRCLED[seg.slot_after - 1]} )</span>`
  ).join(' ');
  return `<div class="vq">
${cardHead(p)}
    <div class="vq-given">${esc(p.insert_sentence)}</div>
    <div class="vq-passage">${inner}</div>
${choicesHtml(p.choices, { en: true })}
</div>`;
}

// 함축의미 — 전문(지정 어구 밑줄 강조) + 5지선다
function renderImplication(p, full) {
  const txt = full.map(s => {
    if (p.underlined && s.includes(p.underlined)) {
      return esc(s).replace(esc(p.underlined), `<span class="vq-underline">${esc(p.underlined)}</span>`);
    }
    return esc(s);
  }).join(' ');
  return `<div class="vq">
${cardHead(p)}
    <div class="vq-passage">${txt}</div>
${choicesHtml(p.choices, { en: true })}
</div>`;
}

// 무관한 문장 — intro + 번호매김 문장들
function renderIrrelevant(p) {
  const body = p.sentences.map((s, i) =>
    `<span class="sent-mk">${CIRCLED[i]}</span>${esc(s)}`
  ).join(' ');
  return `<div class="vq">
${cardHead(p)}
    <div class="vq-given">${esc(p.intro)}</div>
    <div class="vq-passage">${body}</div>
${choicesHtml(p.choices, { en: true })}
</div>`;
}

// 어법·어휘 — 전문 8문장 전체 출력. 각 밑줄은 {sent_index, text, no}로 지정,
// 해당 문장의 어구에 번호+밑줄을 입힌다. 전문이 잘리지 않는다.
function renderUnderlineChoice(p, full) {
  const byIndex = {};
  p.underlines.forEach(u => {
    (byIndex[u.sent_index] = byIndex[u.sent_index] || []).push(u);
  });
  const sents = full.map((s, i) => {
    let out = esc(s);
    (byIndex[i] || []).forEach(u => {
      const marker = CIRCLED[u.no - 1];
      const repl = `<span class="ul-no">${marker}</span><span class="ul">${esc(u.text)}</span>`;
      out = out.replace(esc(u.text), repl);
    });
    return out;
  });
  return `<div class="vq">
${cardHead(p)}
    <div class="vq-passage">${sents.join(' ')}</div>
${choicesHtml(p.choices, { en: true })}
</div>`;
}

// 요약문 — 전문 + 요약 템플릿(빈칸 A/B) + (A)(B) 표
function renderSummary(p, full) {
  const tpl = esc(p.summary_template)
    .replace('__(A)__', '<span class="blank-inline" style="min-width:60px"></span>(A)')
    .replace('__(B)__', '<span class="blank-inline" style="min-width:60px"></span>(B)');
  const rows = p.options.map(o =>
    `      <tr><td class="opt-no">${CIRCLED[o.no - 1]}</td><td class="opt-ab">${esc(o.A)}</td><td class="opt-ab">${esc(o.B)}</td></tr>`
  ).join('\n');
  return `<div class="vq">
${cardHead(p)}
    <div class="vq-passage">${full.map(esc).join(' ')}</div>
    <div class="vq-summary-box">${tpl}</div>
    <table class="summary-opts">
      <thead><tr><th></th><th>(A)</th><th>(B)</th></tr></thead>
      <tbody>
${rows}
      </tbody>
    </table>
</div>`;
}

// 서술형 — subtype 별 본문(보기/조건/문맥 등) + 답란.
// show_passage:true 면 본문 전체(p.full_passage)를 카드 상단에 넣고 2-up 큰 카드로 배치.
function renderWriting(p) {
  const head = `    <div class="vq-head">
      <span class="vq-no">${p.no}</span>
      ${p.source_no ? `<span class="vq-src">${esc(p.source_no)}번</span>` : ''}
      <span class="vq-wtype">${esc(p.subtype_label || '서술형')}</span>
    </div>
    <div class="vq-writing-q">${esc(p.question)}</div>`;

  // 본문 전체가 필요한 서술형은 전문 박스를 발문 아래에 출력
  const passageBlock = (p.show_passage && p.full_passage && p.full_passage.length)
    ? `    <div class="vq-passage">${p.full_passage.map(esc).join(' ')}</div>`
    : '';

  let body = '';
  if (p.subtype === 'word_order') {
    const words = p.words.map(esc).join(' <span class="sep">/</span> ');
    body = `    <div class="vq-writing-ko">${esc(p.ko_prompt)}</div>
    <div class="vq-words"><span class="wb-label">&lt;보기&gt;</span>[ ${words} ]</div>
    <div class="vq-answer-box sm"></div>`;
  } else if (p.subtype === 'conditioned_write') {
    const conds = (p.conditions || []).map(c => `<li>${esc(c)}</li>`).join('');
    body = `    <div class="vq-writing-ko">${esc(p.ko_prompt)}</div>
    <div class="vq-conditions"><span class="wb-label">&lt;조건&gt;</span><ul>${conds}</ul></div>
    <div class="vq-answer-box sm"></div>`;
  } else if (p.subtype === 'fill_blank') {
    body = `    <div class="vq-given">${esc(p.context).replace(/_{3,}/, '<span class="blank-inline"></span>')}</div>
    <div class="vq-answer-box xs"></div>`;
  } else if (p.subtype === 'translate_ko') {
    body = `    <div class="vq-given">${esc(p.en_prompt)}</div>
    <div class="vq-answer-box sm"></div>`;
  } else if (p.subtype === 'summary_word') {
    // 두 표기 모두 지원: "(A)___" (기존) 와 "__(A)__" (요약문 유형 스펙 표기).
    // 지원하지 않으면 밑줄이 빈칸 박스로 바뀌지 않고 언더스코어가 그대로 인쇄된다.
    const blankFor = (L) => `<span class="blank-inline" style="min-width:54px"></span>(${L})`;
    const ctx = esc(p.summary)
      .replace(/_{2,}\(A\)_{2,}/, blankFor('A'))
      .replace(/_{2,}\(B\)_{2,}/, blankFor('B'))
      .replace(/\(A\)_{3,}/, blankFor('A'))
      .replace(/\(B\)_{3,}/, blankFor('B'));
    body = `    <div class="vq-summary-box">${ctx}</div>
    <div class="vq-answer-box xs"></div>`;
  } else if (p.subtype === 'topic_write') {
    const conds = (p.conditions || []).map(c => `<li>${esc(c)}</li>`).join('');
    body = `    <div class="vq-writing-ko">${esc(p.ko_prompt)}</div>
    <div class="vq-conditions"><span class="wb-label">&lt;조건&gt;</span><ul>${conds}</ul></div>
    <div class="vq-answer-box sm"></div>`;
  } else {
    body = `    <div class="vq-answer-box sm"></div>`;
  }

  // 본문 포함 카드는 답란을 키움(sm/xs → 기본)
  if (passageBlock) body = body.replace(/vq-answer-box (sm|xs)/, 'vq-answer-box');

  const cls = passageBlock ? 'vq vq-write vq-write-full' : 'vq vq-write';
  return `<div class="${cls}">
${head}
${passageBlock}
${body}
</div>`;
}

// full = paraphrase 전문 8문장 (variant.passage_full). 일반 유형은 항상 전문 출력.
// order/insert/irrelevant/writing 은 유형 특성상 지문을 분할·변형하므로 예외.
function renderProblemCard(p, full) {
  switch (p.kind) {
    case 'theme':
    case 'claim':
    case 'title':
      return renderSimple(p, full, { choicesEn: true });
    case 'gist':
      return renderSimple(p, full, { choicesEn: /[가-힣]/.test(p.choices[0]) ? false : true });
    case 'blank':       return renderBlank(p, full);
    case 'order':       return renderOrder(p);
    case 'insert':      return renderInsert(p);
    case 'implication': return renderImplication(p, full);
    case 'irrelevant':  return renderIrrelevant(p);
    case 'grammar':
    case 'vocab':       return renderUnderlineChoice(p, full);
    case 'summary':     return renderSummary(p, full);
    case 'writing':     return renderWriting(p);
    default:            return '';
  }
}

// ─────────────────────────────────────────────────────────────
// 정답·해설 카드
// ─────────────────────────────────────────────────────────────

function renderAnswerCard(p) {
  const isWriting = p.kind === 'writing';
  let correct, expBlock;
  if (isWriting) {
    const ans = p.answer || (p.answer_a ? `(A) ${p.answer_a} / (B) ${p.answer_b}` : '');
    correct = '서술형';
    expBlock = `      <div class="ans-exp"><span class="label">정답:</span> <span class="ans-writing-en">${esc(ans)}</span></div>` +
      (p.explanation_ko ? `\n      <div class="ans-distractor">${esc(p.explanation_ko)}</div>` : '');
  } else {
    correct = CIRCLED[p.answer - 1];
    expBlock = `      <div class="ans-exp"><span class="label">해설:</span> ${esc(p.explanation_ko)}</div>` +
      (p.distractor_ko ? `\n      <div class="ans-distractor">${esc(p.distractor_ko)}</div>` : '');
  }
  return `    <div class="ans-item">
      <div class="ans-row-head">
        <span class="ans-no">${p.no}</span>
        ${p.source_no ? `<span class="ans-src">${esc(p.source_no)}번</span>` : ''}
        <span class="ans-type">${esc(p.type_label)}</span>
        <span class="ans-correct">정답 ${correct}</span>
      </div>
${expBlock}
    </div>`;
}

// ─────────────────────────────────────────────────────────────
// puppeteer 실측 기반 페이지 분배
// ─────────────────────────────────────────────────────────────

async function measureAndChunk({ cards, cssContent, listClass, AVAIL = 940, GAP = 11 }) {
  const puppeteer = (await import('puppeteer')).default;
  const allOnOne = `<!doctype html><html><head><meta charset="utf-8"><style>${cssContent}</style></head><body>
<section class="page"><div class="page-body">
<div class="${listClass}">
${cards.join('\n')}
</div>
</div></section></body></html>`;

  const tmpPath = path.join(process.cwd(), '.tmp-variant-measure.html');
  await fs.writeFile(tmpPath, allOnOne, 'utf8');

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 794, height: 1123 });
  await page.goto('file://' + tmpPath.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  const sel = listClass === 'ans-list' ? '.ans-item' : '.vq';
  const heights = await page.evaluate((s) => {
    return [...document.querySelectorAll(s)].map(c => {
      const r = c.getBoundingClientRect();
      const cs = getComputedStyle(c);
      return r.height + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom);
    });
  }, sel);
  await browser.close();
  try { await fs.unlink(tmpPath); } catch {}

  const pages = [];
  let cur = [], curH = 0;
  for (let i = 0; i < cards.length; i++) {
    const h = heights[i] || 200;
    const addH = cur.length === 0 ? h : h + GAP;
    if (cur.length > 0 && curH + addH > AVAIL) { pages.push(cur); cur = []; curH = 0; }
    cur.push(cards[i]);
    curH += (cur.length === 1 ? h : h + GAP);
  }
  if (cur.length) pages.push(cur);
  return pages;
}

// ─────────────────────────────────────────────────────────────
// 문서 빌드
// ─────────────────────────────────────────────────────────────

/* 좌/우 2단 페이지를 **실측 기반**으로 분배한다.
 *
 * paginate2col 은 높이를 보지 않고 무조건 2장씩 넣으므로, 본문 전문을 포함한
 * 서술형처럼 카드가 길면 카드 아래쪽(발문·답란)이 페이지 밖으로 밀려
 * **PDF 에서 잘린 채** 렌더된다(HTML 에는 있는데 PDF 에 없는 사고).
 * 여기서는 카드를 실제 단 너비로 렌더해 높이를 잰 뒤,
 *   - 한 단에 들어가는 카드 → 좌·우 2장
 *   - 한 단을 넘는 큰 카드   → 그 카드만 단독 페이지(1장)
 * 로 배치한다. AVAIL 은 page-body 의 사용 가능 높이(px).
 */
async function measure2col(cards, cssContent, { AVAIL = 940, COL_W = 353 } = {}) {
  const puppeteer = (await import('puppeteer')).default;
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${cssContent}
    .__m{width:${COL_W}px}</style></head><body>
${cards.map(c => `<div class="__m">${c}</div>`).join('\n')}
</body></html>`;
  const tmpPath = path.join(process.cwd(), '.tmp-variant-2col.html');
  await fs.writeFile(tmpPath, html, 'utf8');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 794, height: 1123 });
  await page.goto('file://' + tmpPath.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  const heights = await page.evaluate(() =>
    [...document.querySelectorAll('.__m > .vq')].map(c => c.getBoundingClientRect().height));
  await browser.close();
  try { await fs.unlink(tmpPath); } catch {}

  // 한 페이지에 [좌, 우] 또는 [단독] 로 묶는다.
  const groups = [];
  let pend = null;                       // 좌측에 대기 중인 카드
  for (let i = 0; i < cards.length; i++) {
    const tall = (heights[i] || 0) > AVAIL;
    if (tall) {                          // 큰 카드는 단독 페이지
      if (pend !== null) { groups.push([pend]); pend = null; }
      groups.push([cards[i]]);
    } else if (pend === null) {
      pend = cards[i];
    } else {
      groups.push([pend, cards[i]]); pend = null;
    }
  }
  if (pend !== null) groups.push([pend]);
  return groups;
}

function paginateGroups(groups, headOptsFor, startPage) {
  const pages = [];
  let pageNum = startPage;
  for (const g of groups) {
    const bodyInner = `    <div class="vq-cols">
      <div class="vq-col">${g[0]}</div>
      <div class="vq-col">${g[1] || ''}</div>
    </div>`;
    pages.push(pageWrap({ headOpts: headOptsFor(), pageNum, bodyInner }));
    pageNum++;
  }
  return { pages, nextPage: pageNum };
}

// 좌/우 2단 페이지(객관식: 한 단 1문제). cards 를 2개씩 묶어 페이지 생성.
function paginate2col(cards, headOptsFor, startPage) {
  const pages = [];
  let pageNum = startPage;
  for (let i = 0; i < cards.length; i += 2) {
    const bodyInner = `    <div class="vq-cols">
      <div class="vq-col">${cards[i]}</div>
      <div class="vq-col">${cards[i + 1] || ''}</div>
    </div>`;
    pages.push(pageWrap({ headOpts: headOptsFor(), pageNum, bodyInner }));
    pageNum++;
  }
  return { pages, nextPage: pageNum };
}

// 서술형 8-up: 좌4·우4. cards 를 8개씩 묶어 페이지 생성(세로 여백 최소화).
// ★ 좌측 열에 0~3, 우측 열에 4~7 (2026-08-17 수정).
//   예전에는 짝수(0,2,4,6)/홀수(1,3,5,7)로 갈랐는데, 그러면 좌측을 세로로 읽을 때
//   번호가 66 → 68 → 70 → 72 로 건너뛴다. 학생은 단을 세로로 읽으므로
//   각 단이 연속 번호가 되도록 앞 절반/뒤 절반으로 나눈다.
function paginateWriting8up(cards, headOptsFor, startPage) {
  const pages = [];
  let pageNum = startPage;
  const PER = 8;
  for (let i = 0; i < cards.length; i += PER) {
    const slice = cards.slice(i, i + PER);
    const half = Math.ceil(slice.length / 2);
    const leftCol = slice.slice(0, half).filter(Boolean).join('\n');
    const rightCol = slice.slice(half).filter(Boolean).join('\n');
    const bodyInner = `    <div class="vq-cols vq-cols-write">
      <div class="vq-col">${leftCol}</div>
      <div class="vq-col">${rightCol}</div>
    </div>`;
    pages.push(pageWrap({ headOpts: headOptsFor(), pageNum, bodyInner }));
    pageNum++;
  }
  return { pages, nextPage: pageNum };
}

async function buildHtml({ variants, examMeta, cssContent, cssHref = '../styles/variant.css', sharedWritingPassage = false }) {
  const { examShort, grade } = examMeta;
  let no = 1; // 문항 일련번호 (유형 묶음 전체에 걸쳐 증가)

  const objectiveSections = []; // { label, cards: [] }
  const answerCardsByType = []; // 정답도 유형 순서대로

  // 1) 객관식 유형: TYPE_ORDER 순서대로, 각 유형에 모든 지문(31,32...)의 문제를 모음
  for (const t of TYPE_ORDER) {
    const cards = [];
    const ansCards = [];
    for (const v of variants) {
      const bt = v.by_type && v.by_type[t.key];
      if (!bt) continue;
      const p = {
        ...bt,
        kind: t.key,
        no: no,
        source_no: v.passage_id,
        type_label: t.label,
        question: bt.question || t.question
      };
      // 전문은 유형별 paraphrase passage (없으면 원본 폴백)
      const full = bt.passage || [];
      cards.push(renderProblemCard(p, full));
      ansCards.push(renderAnswerCard(p));
      no++;
    }
    if (cards.length) {
      objectiveSections.push({ label: t.label, cards });
      answerCardsByType.push(...ansCards);
    }
  }

  // 2) 서술형: 본문포함(2-up 큰 카드) / 짧은(6-up) 두 그룹으로 분리
  //
  // ★ 번호는 "인쇄되는 순서"대로 매긴다 (2026-08-17 수정).
  //   예전에는 지문 순회 중 만나는 대로 no 를 증가시켰는데, 실제 인쇄는
  //   본문제시 그룹을 전부 찍고 그 다음 짧은 그룹을 찍으므로 번호가
  //   55 → 58 → 60 → 64 … 처럼 튀었다(짧은 문항 번호가 뒤로 밀림).
  //   → 먼저 그룹별로 항목만 모으고(1단계), 인쇄 순서대로 번호를 부여한 뒤
  //     카드를 렌더한다(2단계).
  const writingFullCards = []; // show_passage:true → 2-up (기존 동작)
  const sharedWritingGroups = []; // --shared-writing-passage 일 때: 지문당 1페이지
  const writingShortCards = []; // 짧은 → 6-up
  const writingAnswerCards = [];

  // ── 1단계: 렌더 없이 그룹별로 항목만 수집 ──
  const pendingFull = [];    // {w, origPassage, source_no}
  const pendingShared = [];  // {passage, source_no, items:[{w, origPassage, source_no}]}
  const pendingShort = [];
  for (const v of variants) {
    const list = (v.by_type && v.by_type.writing) || [];
    // 본문포함 서술형은 원본 전문을 주입하되, 원본이 어법 문항용 오류를 포함하는 경우
    // variant JSON의 writing_passage로 교정 지문을 별도 지정할 수 있다.
    const origPassage = v.writing_passage || v._orig_passage || (v.by_type.theme && v.by_type.theme.passage) || [];
    const sharedItems = [];
    for (const w of list) {
      const item = { w, origPassage, source_no: v.passage_id };
      if (w.show_passage && sharedWritingPassage) sharedItems.push(item);
      else if (w.show_passage) pendingFull.push(item);
      else pendingShort.push(item);
    }
    if (sharedItems.length) {
      pendingShared.push({ passage: origPassage, source_no: v.passage_id, items: sharedItems });
    }
  }

  // ── 2단계: 인쇄 순서(본문포함 → 공유지문 → 짧은)대로 번호 부여 + 렌더 ──
  const mkP = (item) => ({
    ...item.w, kind: 'writing', no: no, source_no: item.source_no,
    type_label: item.w.subtype_label || '서술형',
    full_passage: item.w.show_passage ? item.origPassage : null,
  });
  for (const item of pendingFull) {
    const p = mkP(item);
    writingFullCards.push(renderWriting(p));   // 기존 동작(카드마다 전문)
    writingAnswerCards.push(renderAnswerCard(p));
    no++;
  }
  for (const grp of pendingShared) {
    const cards = [];
    for (const item of grp.items) {
      const p = mkP(item);
      // 카드별로 전문을 반복 출력하면 카드 하나가 A4 한 장을 넘겨 PDF 에서 잘린다.
      // → 전문은 페이지 상단에 한 번만 두고, 문항은 그 아래에 나란히 배치한다.
      cards.push(renderWriting({ ...p, full_passage: null }));
      writingAnswerCards.push(renderAnswerCard(p));
      no++;
    }
    sharedWritingGroups.push({ passage: grp.passage, source_no: grp.source_no, cards });
  }
  for (const item of pendingShort) {
    const p = mkP(item);
    writingShortCards.push(renderWriting(p));
    writingAnswerCards.push(renderAnswerCard(p));
    no++;
  }

  // 페이지 조립
  const pages = [];
  let pageNum = 1;

  // 객관식 — 유형별 섹션, 헤더에 유형명. 각 섹션은 2-up 페이지.
  for (const sec of objectiveSections) {
    const headOptsFor = () => ({ examShort, grade, kindTag: sec.label });
    const r = paginate2col(sec.cards, headOptsFor, pageNum);
    pages.push(...r.pages);
    pageNum = r.nextPage;
  }

  // 서술형(본문포함) — 2-up 큰 카드
  if (writingFullCards.length) {
    const headOptsFor = () => ({ examShort, grade, kindTag: '서술형 (본문 제시)' });
    const r = paginate2col(writingFullCards, headOptsFor, pageNum);
    pages.push(...r.pages);
    pageNum = r.nextPage;
  }

  // 서술형(본문 제시) — 공유 지문 모드: 지문 1개당 페이지 1장.
  // 상단에 본문 전문을 한 번만 두고, 하단 2단에 그 지문의 문항들을 배치한다.
  if (sharedWritingGroups.length) {
    for (const grp of sharedWritingGroups) {
      const bodyInner = `    <div class="vq-passage vq-passage-shared">${grp.passage.map(esc).join(' ')}</div>
    <div class="vq-cols vq-cols-underpassage">
      <div class="vq-col">${grp.cards[0] || ''}</div>
      <div class="vq-col">${grp.cards[1] || ''}</div>
    </div>`;
      pages.push(pageWrap({
        headOpts: { examShort, grade, kindTag: `서술형 (본문 제시) · ${grp.source_no}번` },
        pageNum, bodyInner,
      }));
      pageNum++;
    }
  }

  // 서술형(짧은) — 8-up 페이지(좌4·우4)
  if (writingShortCards.length) {
    const headOptsFor = () => ({ examShort, grade, kindTag: '서술형' });
    const r = paginateWriting8up(writingShortCards, headOptsFor, pageNum);
    pages.push(...r.pages);
    pageNum = r.nextPage;
  }

  // 정답·해설 — 1단 세로 스택, 실측 분배
  const allAnswerCards = [...answerCardsByType, ...writingAnswerCards];
  let answerGroups;
  try {
    answerGroups = await measureAndChunk({ cards: allAnswerCards, cssContent, listClass: 'ans-list' });
  } catch (err) {
    console.warn(`   ⚠️  answer measure failed: ${err.message}`);
    answerGroups = [allAnswerCards];
  }
  answerGroups.forEach((group, gi) => {
    const banner = gi === 0
      ? `    <div class="answer-head-banner"><span class="ah-title">정답 · 해설</span><span class="ah-sub">${no - 1}문항</span></div>`
      : '';
    const bodyInner = `${banner}\n    <div class="ans-list">\n${group.join('\n')}\n    </div>`;
    pages.push(pageWrap({ headOpts: { examShort, grade, kindTag: '정답 · 해설' }, pageNum, bodyInner }));
    pageNum++;
  });

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>${esc(examShort)} ${esc(grade)} 변형문제 — Terra Nova</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="${esc(cssHref)}">
</head>
<body>

${pages.join('\n\n')}

</body>
</html>
`;
}

// ─────────────────────────────────────────────────────────────
// 메인
// ─────────────────────────────────────────────────────────────

async function main() {
  // --styles=<경로> 는 옵트인. 지정하지 않으면 기존 규칙(<data 의 부모>/styles/variant.css)
  // 그대로라 정식 회차 동작은 바뀌지 않는다.
  const argv = process.argv.slice(2);
  const stylesArg = (argv.find(a => a.startsWith('--styles=')) || '').replace('--styles=', '');
  // 본문 제시 서술형을 '지문 1회 + 문항 2단' 으로 배치(옵트인).
  // 기본값 false — 기존 회차는 카드마다 전문을 반복하는 종전 레이아웃 그대로.
  const sharedWritingPassage = argv.includes('--shared-writing-passage');
  const positional = argv.filter(a => !a.startsWith('--'));
  const dataArg = positional[0];
  const distArg = positional[1];
  if (!dataArg) {
    console.error('Usage: node builder/build-variant.mjs <data-dir> [<dist-dir>] [--styles=<variant.css>]');
    process.exit(1);
  }
  const dataDir = path.resolve(process.cwd(), dataArg);
  const distDir = path.resolve(process.cwd(), distArg || path.join(dataArg, '..', 'dist'));
  await fs.mkdir(distDir, { recursive: true });

  const cssAbsPath = stylesArg
    ? path.resolve(process.cwd(), stylesArg)
    : path.resolve(path.dirname(dataDir), 'styles', 'variant.css');
  const cssContent = await fs.readFile(cssAbsPath, 'utf8');
  // dist 가 한 단계 깊어져도(dist/L1) 링크가 깨지지 않도록 실제 상대경로를 계산한다.
  // (하드코딩 '../styles/...' 로 CSS 가 유실되면 A4 고정 높이가 사라져 페이지가 재배치된다)
  const cssHref = (path.relative(distDir, cssAbsPath) || '').replace(/\\/g, '/');

  const all = await fs.readdir(dataDir);
  const vFiles = all.filter(f => /-variant\.json$/.test(f)).sort((a, b) =>
    parseInt(a) - parseInt(b)
  );
  if (!vFiles.length) {
    console.error(`No *-variant.json files in ${dataDir}`);
    process.exit(1);
  }

  // 모든 지문 변형 데이터를 모아 유형별로 묶은 단일 문서를 생성.
  const variants = [];
  let examMeta = { examShort: '변형문제', grade: '' };
  for (const vFile of vFiles) {
    const qno = vFile.replace(/-variant\.json$/, '');
    const variant = JSON.parse(await fs.readFile(path.join(dataDir, vFile), 'utf8'));
    if (!variant.passage_id) variant.passage_id = parseInt(qno);
    // 원본 {N}.json 에서 본문 전문 + exam 메타 추출 (본문포함 서술형이 사용)
    try {
      const data = JSON.parse(await fs.readFile(path.join(dataDir, `${qno}.json`), 'utf8'));
      variant._orig_passage = data.passage || [];
      if (examMeta.examShort === '변형문제') {
        const exam = data.exam || '';
        const gm = exam.match(/(\d학년)/);
        examMeta = { examShort: exam.replace(/\s*\d학년\s*$/, '').trim(), grade: gm ? gm[1] : '' };
      }
    } catch {}
    variants.push(variant);
  }

  console.log(`🧩 Building type-grouped variant book from ${variants.length} passage(s): ${variants.map(v => v.passage_id).join(', ')}`);

  const html = await buildHtml({ variants, examMeta, cssContent, cssHref, sharedWritingPassage });
  const outName = 'variant-book.html';
  await fs.writeFile(path.join(distDir, outName), html, 'utf8');
  const pageCount = (html.match(/class="page"/g) || []).length;
  console.log(`   ✓ → ${outName}  (${pageCount} pages)`);

  // 인덱스 병합
  const indexPath = path.join(distDir, 'index.html');
  let existing = '';
  try { existing = await fs.readFile(indexPath, 'utf8'); } catch {}
  const vSection = `<div class="index-wrap" data-section="variant">
  <h1>🧩 변형문제</h1>
  <a href="${outName}">${esc(examMeta.examShort)} ${esc(examMeta.grade)} 변형문제 (유형별 묶음)</a>
</div>`;
  if (existing && existing.includes('data-section="variant"')) {
    existing = existing.replace(/<div class="index-wrap" data-section="variant">[\s\S]*?<\/div>/, vSection);
  } else if (existing) {
    existing = existing.replace(/<\/body>/, `\n${vSection}\n</body>`);
  } else {
    existing = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>Terra Nova 변형문제</title><link rel="stylesheet" href="${esc(cssHref)}"></head><body>\n${vSection}\n</body></html>`;
  }
  await fs.writeFile(indexPath, existing, 'utf8');

  console.log('✅ Done.');
}

main().catch(err => { console.error(err); process.exit(1); });
