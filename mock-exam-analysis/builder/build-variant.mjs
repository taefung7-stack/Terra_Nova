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
${choices.map((c, i) => `      <div class="vq-choice"><span class="ch-no">${CIRCLED[i]}</span><span class="${cls}">${esc(c)}</span></div>`).join('\n')}
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
    const ctx = esc(p.summary)
      .replace(/\(A\)_{3,}/, '<span class="blank-inline" style="min-width:54px"></span>(A)')
      .replace(/\(B\)_{3,}/, '<span class="blank-inline" style="min-width:54px"></span>(B)');
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
// 좌측 열에 짝수 인덱스(0,2,4,6), 우측 열에 홀수 인덱스(1,3,5,7)를 배치.
function paginateWriting8up(cards, headOptsFor, startPage) {
  const pages = [];
  let pageNum = startPage;
  const PER = 8;
  for (let i = 0; i < cards.length; i += PER) {
    const slice = cards.slice(i, i + PER);
    const leftCol = [slice[0], slice[2], slice[4], slice[6]].filter(Boolean).join('\n');
    const rightCol = [slice[1], slice[3], slice[5], slice[7]].filter(Boolean).join('\n');
    const bodyInner = `    <div class="vq-cols vq-cols-write">
      <div class="vq-col">${leftCol}</div>
      <div class="vq-col">${rightCol}</div>
    </div>`;
    pages.push(pageWrap({ headOpts: headOptsFor(), pageNum, bodyInner }));
    pageNum++;
  }
  return { pages, nextPage: pageNum };
}

async function buildHtml({ variants, examMeta, cssContent }) {
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
  const writingFullCards = []; // show_passage:true → 2-up
  const writingShortCards = []; // 짧은 → 6-up
  const writingAnswerCards = [];
  for (const v of variants) {
    const list = (v.by_type && v.by_type.writing) || [];
    // 본문포함 서술형은 원본 8문장 전문을 주입 (paraphrase 아닌 원본 passage)
    const origPassage = v._orig_passage || (v.by_type.theme && v.by_type.theme.passage) || [];
    for (const w of list) {
      const p = { ...w, kind: 'writing', no: no, source_no: v.passage_id, type_label: w.subtype_label || '서술형',
        full_passage: w.show_passage ? origPassage : null };
      const card = renderWriting(p);
      if (w.show_passage) writingFullCards.push(card);
      else writingShortCards.push(card);
      writingAnswerCards.push(renderAnswerCard(p));
      no++;
    }
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
<link rel="stylesheet" href="../styles/variant.css">
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
  const dataArg = process.argv[2];
  const distArg = process.argv[3];
  if (!dataArg) {
    console.error('Usage: node builder/build-variant.mjs <data-dir> [<dist-dir>]');
    process.exit(1);
  }
  const dataDir = path.resolve(process.cwd(), dataArg);
  const distDir = path.resolve(process.cwd(), distArg || path.join(dataArg, '..', 'dist'));
  await fs.mkdir(distDir, { recursive: true });

  const cssAbsPath = path.resolve(path.dirname(dataDir), 'styles', 'variant.css');
  const cssContent = await fs.readFile(cssAbsPath, 'utf8');

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

  const html = await buildHtml({ variants, examMeta, cssContent });
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
    existing = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>Terra Nova 변형문제</title><link rel="stylesheet" href="../styles/variant.css"></head><body>\n${vSection}\n</body></html>`;
  }
  await fs.writeFile(indexPath, existing, 'utf8');

  console.log('✅ Done.');
}

main().catch(err => { console.error(err); process.exit(1); });
