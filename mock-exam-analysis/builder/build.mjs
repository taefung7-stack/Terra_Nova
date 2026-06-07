#!/usr/bin/env node
/* ===================================================================
 * Terra Nova 모의고사 분석지 빌더 — v1.0 LOCKED (2026-05-27)
 * ===================================================================
 *
 * 이 빌더의 디자인·분배 로직은 사용자 검수를 거쳐 v1.0으로 확정됨.
 * 회차별 JSON만 추가하면 동일 디자인으로 자동 생성됨.
 *
 * ── 설계 원칙 (변경 금지) ─────────────────────────────────────────
 *   1. 4단 구조 고정 (Intro → Passage → Analysis × N → ...)
 *      p1: 인트로 + 삽화 + 단어 25개
 *      p2: 본문 전문 + 정답·오답 + 4단 논리흐름
 *         └ v1.1: 본문이 길어 1페이지를 넘기는 묶음 지문(41-42·43-45 등)은
 *           measurePassageBlocks가 실측해 본문→자체 페이지, 정답+흐름→다음
 *           페이지로 자동 분할. 짧은 단문은 기존대로 1페이지(회귀 없음).
 *      p3~: 모든 본문 문장의 어법·어휘·리딩 분석 (필요시 패러프레이징)
 *   2. 컬러 시스템 — Mint(메인) / Sky(부) / Sage / Coral / Butter
 *   3. 폰트 — Pretendard(본문) + Inter(영문·숫자)
 *   4. A4 297mm 절대 초과 금지 — puppeteer 실측 기반 페이지 분배
 *      (chunkSentences는 폴백, 실제 분배는 measureAndChunk가 수행)
 *   5. AVAIL=920px, GAP=9px — page-body 가용 영역 실측 기준
 *   6. .sent { break-inside: avoid } 로 카드 자체는 절대 분할 X
 *   7. 카드는 위에서부터 빼곡히 쌓임 (justify-content 사용 X)
 *   8. -workbook.json 등 다른 빌더용 데이터는 자동 스킵
 *
 * ── 빌드 검증 ──────────────────────────────────────────────────────
 *   node builder/check-overflow.mjs <html-file>
 *   → 전 페이지 overflow=NO, hits_foot=NO 확인 후 배포
 *
 * ── 새 회차 추가 절차 ──────────────────────────────────────────────
 *   1) {새회차폴더}/data/{N}.json 작성 (21.json을 템플릿으로)
 *   2) package.json scripts에 build:{회차} 1줄 추가
 *   3) npm run build:{회차} → puppeteer가 카드 실측 후 자동 분배
 *   4) check-overflow.mjs로 전 회차 검증
 *
 * 사용법:
 *   node builder/build.mjs <data-dir> [<dist-dir>]
 *   node builder/build.mjs 2026-march-grade2/data
 * =================================================================== */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─────────────────────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────────────────────

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** JSON에서 en_html / ko_chunks / note / points[].text / paraphrasing은 HTML 그대로 신뢰. 그 외 텍스트는 escape. */
function raw(s) { return s ?? ''; }

const TAG_LABEL = {
  title:  { cls: 'title-q',  emoji: '⭐', label: '제목·요지' },
  write:  { cls: 'write-q',  emoji: '✍',  label: '서술형' },
  order:  { cls: 'order-q',  emoji: '🔀', label: '순서배열' },
  insert: { cls: 'insert-q', emoji: '📌', label: '문장삽입' },
};

const POINT_LABEL = {
  grammar: '어법 P.',
  vocab:   '어휘 P.',
  reading: '리딩 P.',
};

const LV_LABEL = { high: '상', mid: '중', low: '하' };

// ─────────────────────────────────────────────────────────────
// 페이지 빌더
// ─────────────────────────────────────────────────────────────

function buildHeader(headTitle, tagText, tagColor) {
  const style = tagColor ? ` style="background:${tagColor.bg};color:${tagColor.fg};border-color:${tagColor.bd}"` : '';
  return `  <header class="page-head">
    <div class="head-title">${esc(headTitle)}</div>
    <div class="head-tag"${style}>${esc(tagText)}</div>
  </header>`;
}

function buildFooter(pageNo) {
  return `  <footer class="page-foot">
    <span class="brand">Terra Nova · 모의고사 분석지</span>
    <span class="pageno">${pageNo}</span>
  </footer>`;
}

function buildExerciseBlock(data) {
  return `    <div class="exercise">
      <div class="ex-badge">
        <div class="ex-label">Exercise</div>
        <div class="ex-num">${esc(data.question_no)}</div>
      </div>
      <div class="ex-meta">
        <div class="meta-row">
          <div class="k">요약</div>
          <div class="v">${esc(data.summary_ko)}</div>
        </div>
        <div class="meta-row">
          <div class="k">요지</div>
          <div class="v en">${esc(data.main_idea_en)}</div>
        </div>
        <div class="meta-row">
          <div class="k">제목</div>
          <div class="v en">${esc(data.title_en)}</div>
        </div>
      </div>
    </div>`;
}

function buildIllustration(data) {
  const file = data.illustration?.file || `assets/illust-${data.question_no}.png`;
  return `    <figure class="illust">
      <img src="${esc(file)}" alt="${esc(data.title_en || '삽화')}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
      <div class="placeholder" style="display:none">[삽화 영역] ${esc(file)} · 미드저니 16:5 --v 7</div>
    </figure>`;
}

function buildVocabTable(vocab, limit) {
  const list = (typeof limit === 'number') ? vocab.slice(0, limit) : vocab;
  const rows = list.map((v, i) => `        <tr>
          <td class="col-no">${i + 1}</td>
          <td class="col-word">${esc(v.word)}</td>
          <td class="col-pos">${esc(v.pos)}</td>
          <td class="col-meaning">${esc(v.meaning)}</td>
          <td class="col-syn"><span class="tag-syn">${esc(v.syn)}</span></td>
          <td class="col-ant"><span class="tag-ant">${esc(v.ant)}</span></td>
          <td class="col-deriv"><span class="tag-der">${esc(v.deriv)}</span></td>
        </tr>`).join('\n');

  return `    <div class="section-bar">
      VOCABULARY · 단어 정리
      <span class="bar-sub">동의어 ≈ · 반의어 ↔ · 파생어 →</span>
    </div>

    <table class="voca-table">
      <thead>
        <tr>
          <th>No.</th><th>단어</th><th>품사</th><th>뜻</th>
          <th>동의어 ≈</th><th>반의어 ↔</th><th>파생어 →</th>
        </tr>
      </thead>
      <tbody>
${rows}
      </tbody>
    </table>`;
}

// ─────────────────────────────────────────────────────────────
// PAGE 1 — 인트로 + 삽화(16:5 고정) + 단어표
//   삽화가 단어표에 밀려 찌그러지지 않도록, 삽화의 자연 높이(폭×5/16)를
//   확보한 뒤 남는 공간에 들어가는 단어 행만 표시(나머지는 자동 축소).
//   vocabLimit는 measurePage1Vocab가 실측으로 결정.
// ─────────────────────────────────────────────────────────────
function buildPage1(data, vocabLimit) {
  return `<section class="page">
${buildHeader(data.exam, 'INTRO')}
  <div class="page-body">
${buildExerciseBlock(data)}
${buildIllustration(data)}
${buildVocabTable(data.vocab || [], vocabLimit)}
  </div>
${buildFooter(1)}
</section>`;
}

// ─────────────────────────────────────────────────────────────
// PAGE 2 — 본문 전문 + 정답·오답 분석 + 논리흐름
// ─────────────────────────────────────────────────────────────
function buildFulltext(passage, passageKo) {
  const lines = passage.map((en, i) => `      <div class="line">
        <span class="num">${i + 1}</span>
        <div class="ft-en">${esc(en)}</div>
        <div class="ft-ko">${esc(passageKo?.[i] || '')}</div>
      </div>`).join('\n');

  return `    <div class="section-bar alt">
      PASSAGE · 본문 전문 (문장별 해석)
      <span class="bar-sub">${data => data}</span>
    </div>

    <div class="fulltext">
${lines}
    </div>`;
}

function buildAnswerBlock(data) {
  const ansNo = data.choices?.find(c => c.correct)?.no ?? '?';
  const ansCircled = ['①','②','③','④','⑤'][ansNo - 1] || ansNo;

  const items = (data.choices || []).map(c => {
    const cls = c.correct ? ' correct' : '';
    const circled = ['①','②','③','④','⑤'][c.no - 1] || c.no;
    return `        <div class="wb-item${cls}">
          <span class="wb-no">${circled}</span>
          <div class="wb-body">
            <div class="wb-en">${esc(c.en)}</div>
            <div class="wb-ko">${esc(c.ko)} — ${raw(c.comment)}</div>
          </div>
        </div>`;
  }).join('\n');

  return `    <div class="section-bar" style="background:var(--c-coral-soft);color:var(--c-coral-deep);border-color:var(--c-coral)">
      ANSWER · 정답 & 오답 분석
      <span class="bar-sub">정답 ${ansCircled} · ${esc(data.type || '')} [${esc(data.score)}점]</span>
    </div>

    <div class="wrong-box">
      <div class="wb-list">
${items}
      </div>
    </div>`;
}

function buildFlow(flow) {
  const steps = (flow || []).map((s, i) => `      <div class="step">
        <span class="emoji">${esc(s.emoji)}</span>
        <div class="num">STEP ${i + 1}</div>
        <div class="title">${esc(s.title)}</div>
        <div class="body">${raw(s.body)}</div>
      </div>`).join('\n');

  return `    <div class="section-bar">
      LOGIC FLOW · 쉽게 이해하기
      <span class="bar-sub">4단계 흐름</span>
    </div>

    <div class="flow-h">
${steps}
    </div>`;
}

/**
 * 본문 전문 블록. range=[start,end] (반열림)이면 해당 문장만 렌더(긴 본문 분할용).
 * cont=true면 헤더 라벨에 "(이어서)" 표기. 문장 번호는 원본 인덱스 유지.
 */
function buildFulltextBlock(data, range = null, cont = false) {
  const passage = data.passage || [];
  const passageKo = data.passage_ko || [];
  const [s, e] = range || [0, passage.length];
  const lines = passage.slice(s, e).map((en, k) => {
    const i = s + k;
    return `      <div class="line">
        <span class="num">${i + 1}</span>
        <div class="ft-en">${esc(en)}</div>
        <div class="ft-ko">${esc(passageKo[i] || '')}</div>
      </div>`;
  }).join('\n');

  const label = cont ? 'PASSAGE · 본문 전문 (이어서)' : 'PASSAGE · 본문 전문 (문장별 해석)';
  const sub = cont ? '' : esc(data.question_text || '');

  return `    <div class="section-bar alt">
      ${label}
      <span class="bar-sub">${sub}</span>
    </div>

    <div class="fulltext">
${lines}
    </div>`;
}

/**
 * PASSAGE 페이지 빌드 — fulltext / answer / flow 3블록을 실측 후 자동 분배.
 * 짧은 본문(기존 단문)은 1페이지에 그대로(회귀 없음), 긴 묶음 지문(41/43 등)은
 * 본문→자체 페이지, 정답+흐름→다음 페이지로 자동 분할.
 *
 * @returns {string[]} 1개 이상의 <section class="page"> HTML. 페이지 번호는
 *   호출부에서 startPageNo 기준으로 부여됨.
 */
/**
 * blockGroups: 페이지별 블록 배열. 각 블록은
 *   'answer' | 'flow' | { type:'fulltext', range:[s,e], cont:bool }
 * @returns {string[]}
 */
function buildPassagePages(data, blockGroups, startPageNo) {
  const render = (blk) => {
    if (blk === 'answer') return buildAnswerBlock(data);
    if (blk === 'flow') return buildFlow(data.flow || []);
    if (blk && blk.type === 'fulltext') return buildFulltextBlock(data, blk.range, blk.cont);
    return '';
  };
  return blockGroups.map((group, i) => {
    const body = group.map(render).join('\n');
    return `<section class="page">
${buildHeader(data.exam + ' · ' + data.question_no + '번', 'PASSAGE')}
  <div class="page-body passage-layout">
${body}
  </div>
${buildFooter(startPageNo + i)}
</section>`;
  });
}

// ─────────────────────────────────────────────────────────────
// PAGE 3, 4 — 문장별 분석
// ─────────────────────────────────────────────────────────────
/**
 * 분석 카드. 여백을 빼곡히 채우기 위해 여러 분할 형태를 지원한다.
 *   'full' : 전체 (헤드 + 포인트 + paraphrasing)
 *   'top'  : paraphrasing 제외 (헤드 + 포인트), 끝에 "para 다음장" 안내
 *   'head' : 헤드만 (영문 + 끊어읽기 + 해석 + note), 끝에 "분석 다음장" 안내
 *   'rest' : 포인트 + paraphrasing (head 다음 이어쓰기)
 *   'para' : paraphrasing 박스만 (top 다음 이어쓰기)
 */
function buildSentenceCard(s, part = 'full') {
  const tags = (s.tags || []).map(t => {
    const tt = TAG_LABEL[t];
    if (!tt) return '';
    return `<span class="tag ${tt.cls}">${tt.emoji} ${tt.label}</span>`;
  }).join('\n        ');

  const pointsHtml = (s.points || []).map(p => {
    const tagText = POINT_LABEL[p.kind] || '포인트';
    return `        <div class="point ${esc(p.kind)}"><span class="pt-tag">${tagText}</span><span class="pt-text">${raw(p.text)}</span></div>`;
  }).join('\n');
  const pointGrid = (s.points && s.points.length) ? `      <div class="point-grid">
${pointsHtml}
      </div>` : '';

  const noteHtml = s.note ? `      <div class="note">${raw(s.note)}</div>` : '';

  const hasPara = s.paraphrasing && s.paraphrasing.length;
  let paraHtml = '';
  if (hasPara) {
    const rows = s.paraphrasing.map(p => `        <div class="para-row lv-${esc(p.level)}">
          <span class="lv">${LV_LABEL[p.level] || p.level}</span>
          <span class="txt">
            <span class="en">${esc(p.en)}</span>
            ${esc(p.ko)}
          </span>
        </div>`).join('\n');
    paraHtml = `      <div class="para-box">
        <div class="para-title">PARAPHRASING — 상/중/하</div>
${rows}
      </div>`;
  }

  const headInner = `      <div class="sent-head">
        <span class="sent-no">SENT ${s.no}</span>
        ${tags}
      </div>
      <div class="en">
        ${raw(s.en_html)}
      </div>
      <div class="ko">${raw(s.ko_chunks)}</div>
      <div class="ko-bold">${esc(s.ko_full)}</div>
${noteHtml}`;

  // 이어쓰기 헤더(헤드 없이 바로 이어지는 part)
  const contHead = (label) => `      <div class="sent-head">
        <span class="sent-no">SENT ${s.no}</span>
        <span class="cont-label">${label}</span>
      </div>`;

  if (part === 'para') {
    return `    <div class="sent sent-cont">
${contHead('(이어서) PARAPHRASING')}
${paraHtml}
    </div>`;
  }
  if (part === 'rest') {
    return `    <div class="sent sent-cont">
${contHead('(이어서) 포인트 분석')}
${pointGrid}
${hasPara ? '\n' + paraHtml : ''}
    </div>`;
  }
  if (part === 'head') {
    return `    <div class="sent">
${headInner}
      <div class="para-more">▶ 분석 다음 페이지에서 계속</div>
    </div>`;
  }
  if (part === 'top') {
    return `    <div class="sent">
${headInner}
${pointGrid}${hasPara ? '\n      <div class="para-more">▶ PARAPHRASING 다음 페이지에서 계속</div>' : ''}
    </div>`;
  }
  // full
  return `    <div class="sent">
${headInner}
${pointGrid}${hasPara ? '\n' + paraHtml : ''}
    </div>`;
}

function buildAnalysisPage(data, items, pageNo, label) {
  // items: 문장 객체(s) 또는 {s, part:'top'|'para'|'full'}
  const cards = items.map(it => (it && it.s) ? buildSentenceCard(it.s, it.part || 'full') : buildSentenceCard(it)).join('\n\n');

  return `<section class="page">
${buildHeader(data.exam + ' · ' + data.question_no + '번', label)}
  <div class="page-body">
    <div class="section-bar">
      SENTENCE ANALYSIS · 문장별 분석
      <span class="bar-sub">📝 어법 · 📚 어휘 · 🎯 리딩</span>
    </div>

    <div class="sent-list">
${cards}
    </div>
  </div>
${buildFooter(pageNo)}
</section>`;
}

// ─────────────────────────────────────────────────────────────
// 자동 페이지 분배: 분석 문장을 페이지 3, 4, 5...에 나눠 담기
//
// 정밀 가중치 기반: en/ko_chunks/note/points/paraphrasing 분량을
// 실측 비례 계수로 환산해 카드 높이를 추정. 한 페이지 가용 영역
// (978px ≒ 가중치 2.20)을 넘기지 않도록 안전 마진 포함 분배.
// 잘림이 의심되면 다음 페이지로 넘김.
// ─────────────────────────────────────────────────────────────
function estimateCardWeight(s) {
  // 카드 기본 패딩/헤드: 0.18
  let w = 0.18;

  // 영어 본문 라인 (50자당 0.06)
  const enLen = (s.en_html || '').replace(/<[^>]+>/g, '').length;
  w += Math.ceil(enLen / 50) * 0.06;

  // 한글 끊어읽기 (60자당 0.04)
  const koChunkLen = (s.ko_chunks || '').replace(/<[^>]+>/g, '').length;
  w += Math.ceil(koChunkLen / 60) * 0.04;

  // 한글 매끄러운 해석 (50자당 0.05) + 박스 패딩
  const koFullLen = (s.ko_full || '').length;
  w += 0.08 + Math.ceil(koFullLen / 50) * 0.05;

  // note 박스
  if (s.note) {
    const noteLen = s.note.replace(/<[^>]+>/g, '').length;
    w += 0.10 + Math.ceil(noteLen / 70) * 0.05;
  }

  // points (각 0.10 + 텍스트 길이당 0.03/60자)
  for (const p of (s.points || [])) {
    const pLen = (p.text || '').replace(/<[^>]+>/g, '').length;
    w += 0.10 + Math.ceil(pLen / 60) * 0.03;
  }

  // paraphrasing 박스 (헤드 0.18 + 각 row 0.18)
  if (s.paraphrasing?.length) {
    w += 0.18;
    for (const p of s.paraphrasing) {
      const len = (p.en?.length || 0) + (p.ko?.length || 0);
      w += 0.14 + Math.ceil(len / 80) * 0.04;
    }
  }

  return w;
}

function chunkSentences(sentences) {
  // weight는 임시 — measureCardHeights()가 실측값으로 교체
  return [sentences]; // 일단 전체를 한 페이지에 (build 단계에서 실측 후 재분배)
}

// 측정 함수 — buildHtml 후 puppeteer로 각 .sent 카드 실제 높이를 측정해 페이지 분배
async function measureAndChunk(stylesHref, data, dataDir, startIdx = 0) {
  const puppeteer = (await import('puppeteer')).default;
  // CSS 파일을 인라인으로 포함 (file:// 상대경로 문제 우회)
  const cssAbsPath = path.resolve(path.dirname(dataDir), 'styles', 'analysis.css');
  const cssContent = await fs.readFile(cssAbsPath, 'utf8');
  const sents = data.sentences || [];
  // 각 문장의 5형태(full·top·head·rest·para) 실측 — 여백 채우기용 분할 후보
  const blocks = [];
  sents.forEach((s, i) => {
    const hasP = s.paraphrasing && s.paraphrasing.length;
    const hasPts = s.points && s.points.length;
    blocks.push(`<div data-k="full" data-i="${i}">${buildSentenceCard(s, 'full')}</div>`);
    // top: para 분리 (para 있을 때만 의미)
    if (hasP) blocks.push(`<div data-k="top" data-i="${i}">${buildSentenceCard(s, 'top')}</div>`);
    if (hasP) blocks.push(`<div data-k="para" data-i="${i}">${buildSentenceCard(s, 'para')}</div>`);
    // head/rest: 포인트가 있을 때만 의미(헤드만 앞장, 포인트+para 다음장)
    if (hasPts) {
      blocks.push(`<div data-k="head" data-i="${i}">${buildSentenceCard(s, 'head')}</div>`);
      blocks.push(`<div data-k="rest" data-i="${i}">${buildSentenceCard(s, 'rest')}</div>`);
    }
  });
  const allOnOne = `<!doctype html><html><head><meta charset="utf-8"><style>${cssContent}</style></head><body>
<section class="page"><div class="page-body">
<div class="section-bar">SENTENCE ANALYSIS · 문장별 분석<span class="bar-sub">📝 어법 · 📚 어휘 · 🎯 리딩</span></div>
<div class="sent-list">
${blocks.join('\n')}
</div>
</div></section></body></html>`;

  const tmpPath = path.join(process.cwd(), `.tmp-measure-${process.pid}-${data.question_no}.html`);
  await fs.writeFile(tmpPath, allOnOne, 'utf8');

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 794, height: 1123 });
  await page.goto('file://' + tmpPath.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  const measured = await page.evaluate(() => {
    const out = {};
    document.querySelectorAll('[data-k]').forEach(w => {
      const c = w.querySelector('.sent'); if (!c) return;
      const r = c.getBoundingClientRect(); const cs = getComputedStyle(c);
      out[w.getAttribute('data-k') + ':' + w.getAttribute('data-i')] = r.height + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom);
    });
    return out;
  });
  await browser.close();
  try { await fs.unlink(tmpPath); } catch {}

  // sent-list 실가용 높이 934px(=bodyH 976 − section-bar 42). 안전 2px 마진.
  const AVAIL = 932;
  const GAP = 9;
  const SPLIT_MIN_GAIN = 60; // 앞장에 분할 조각을 넣을 최소 이득(작으면 분리 안 함)
  const H = (k, i) => measured[k + ':' + i];
  const fullH = i => H('full', i) || 0;
  const hasPara = i => (sents[i].paraphrasing && sents[i].paraphrasing.length) > 0;
  const hasPts = i => (sents[i].points && sents[i].points.length) > 0;

  // 그리디 분배 + 여백 시 카드 분할(빼곡 채우기 최우선)
  const pages = [];
  let cur = [];
  let curH = 0;
  const pushPage = () => { if (cur.length) { pages.push(cur); cur = []; curH = 0; } };

  for (let i = startIdx; i < sents.length; i++) {
    const h = fullH(i);
    const addH = cur.length === 0 ? h : h + GAP;
    if (cur.length === 0 || curH + addH <= AVAIL) {
      // 통째로 들어감
      cur.push({ s: sents[i], part: 'full' });
      curH += (cur.length === 1 ? h : h + GAP);
      continue;
    }

    // 통째로 안 들어감 → 앞장 여백에 가능한 가장 큰 조각을 넣어 채운다.
    const remain = AVAIL - curH - GAP; // 앞장에 더 쓸 수 있는 높이
    // 분할 후보(앞장 조각 → 다음장 나머지), 큰 조각 우선
    const cands = [];
    if (hasPara(i)) cands.push({ frontK: 'top', front: H('top', i), nextPart: 'para' });   // 헤드+포인트 / para
    if (hasPts(i))  cands.push({ frontK: 'head', front: H('head', i), nextPart: 'rest' });  // 헤드 / 포인트+para
    // 앞장에 들어가는 가장 큰 조각 선택
    let chosen = null;
    for (const c of cands) {
      if (c.front != null && c.front <= remain && c.front >= SPLIT_MIN_GAIN) {
        if (!chosen || c.front > chosen.front) chosen = c;
      }
    }
    if (chosen) {
      cur.push({ s: sents[i], part: chosen.frontK });
      pushPage();
      cur.push({ s: sents[i], part: chosen.nextPart });
      curH = (H(chosen.nextPart, i) || 0);
      continue;
    }
    // 분할 불가(여백 부족) → 통째로 다음 장
    pushPage();
    cur.push({ s: sents[i], part: 'full' });
    curH += h;
  }
  pushPage();
  return pages;
}

// 측정 함수 — PASSAGE 페이지(fulltext/answer/flow 3블록) 실제 높이를 측정해
// 1페이지에 다 들어가면 [['fulltext','answer','flow']], 넘치면 자동으로 페이지를
// 쪼갠 블록 그룹 배열을 반환. 짧은 단문은 항상 1페이지(기존 동작 유지).
async function measurePassageBlocks(data, dataDir) {
  const puppeteer = (await import('puppeteer')).default;
  const cssAbsPath = path.resolve(path.dirname(dataDir), 'styles', 'analysis.css');
  const cssContent = await fs.readFile(cssAbsPath, 'utf8');

  // 실제 .page 컨텍스트(헤더·푸터·패딩·flex)에서 측정 — check-overflow와 동일 조건.
  // page-body 가용 높이(bodyH)와, 각 후보 본문 청크/answer/flow의 콘텐츠 높이를
  // 같은 방식(realContentHeight)으로 잰다.
  const header = buildHeader(data.exam + ' · ' + data.question_no + '번', 'PASSAGE');
  const footer = buildFooter(2);
  const wrap = (inner, id) => `<section class="page">${header}<div class="page-body passage-layout" data-m="${id}">${inner}</div>${footer}</section>`;

  const nLines = (data.passage || []).length;
  // 측정용 후보들: fulltext 전체, 각 라인 단독(barH 추정용으로 1줄/2줄 비교), answer, flow.
  // 라인별 정확 높이를 위해 "헤더만" 과 "헤더+i번째 라인 1개"를 비교하기보다,
  // 본문 전체를 한 번 렌더해 .line 들의 실측 높이 + section-bar 높이를 직접 읽는다.
  // 'all' = 3블록을 한 page-body에 함께 렌더 → 결합 실측 높이(check-overflow와 동일).
  // 개별 블록(fulltext/answer/flow)은 청크 분할용 라인 높이 측정에만 사용.
  const allInner = buildFulltextBlock(data) + buildAnswerBlock(data) + buildFlow(data.flow || []);
  const candidates = [
    wrap(allInner, 'all'),
    wrap(buildFulltextBlock(data), 'fulltext'),
    wrap(buildAnswerBlock(data), 'answer'),
    wrap(buildFlow(data.flow || []), 'flow'),
  ];
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${cssContent}</style></head><body>
${candidates.join('\n')}
</body></html>`;

  const tmpPath = path.join(process.cwd(), `.tmp-measure-p2-${process.pid}-${data.question_no}.html`);
  await fs.writeFile(tmpPath, html, 'utf8');

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 794, height: 1123 });
  await page.goto('file://' + tmpPath.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  const measured = await page.evaluate(() => {
    const sumChildren = (el) => {
      let t = 0;
      [...el.children].forEach(c => {
        const r = c.getBoundingClientRect();
        const cs = getComputedStyle(c);
        t += r.height + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom);
      });
      return t;
    };
    const byId = id => document.querySelector(`.page-body[data-m="${id}"]`);
    const bodyH = Math.round(byId('all').getBoundingClientRect().height); // 실제 가용 본문 높이
    const combinedH = sumChildren(byId('all'));                           // 3블록 결합 실측 높이
    const ft = byId('fulltext');
    const bar = ft.querySelector('.section-bar');
    const barCs = getComputedStyle(bar);
    const barH = bar.getBoundingClientRect().height + parseFloat(barCs.marginTop) + parseFloat(barCs.marginBottom);
    const lineHs = [...ft.querySelectorAll('.fulltext .line')].map(l => {
      const r = l.getBoundingClientRect();
      const cs = getComputedStyle(l);
      return r.height + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom);
    });
    return {
      bodyH,
      combinedH,
      barH,
      lineHs,
      fulltext: sumChildren(ft),
      answer: sumChildren(byId('answer')),
      flow: sumChildren(byId('flow')),
    };
  });
  await browser.close();
  try { await fs.unlink(tmpPath); } catch {}

  const { bodyH, combinedH, barH, lineHs, fulltext: fulltextH, answer: answerH, flow: flowH } = measured;
  const GAP = 6; // passage-layout gap
  // 'all' 결합 측정은 실제 .page 렌더와 동일(검증: march21=905, june38=978).
  // 단일 페이지 유지 판정은 정확한 결합 높이로(회귀 0).
  const LIMIT = bodyH - 6;

  // 3블록이 한 페이지에 들어가면 분할하지 않음 (기존 단문·march 동작 보존)
  if (combinedH <= LIMIT) {
    return [[{ type: 'fulltext', range: [0, nLines], cont: false }, 'answer', 'flow']];
  }

  // ── 분할 경로 ──
  // 두 종류의 한계를 분리한다:
  //  · PACK_LINE: 단일 블록(fulltext)을 라인 단위로 쪼갤 때 — 그 페이지 자체가 꽉 차므로
  //    결합 margin 누락이 없어 0.86으로 보수적 유지(묶음지문 overflow 0 보장).
  //  · PACK_BLOCK: 서로 다른 블록(fulltext+answer+flow)을 한 페이지에 합칠 때 —
  //    sibling margin·gap이 누락돼 단독합이 실제보다 작게 나오지만, 여백을 빼곡히
  //    채우려고 0.90까지 허용(Q36 fulltext+answer 합침. 871/976 안전).
  const PACK_LINE = Math.round(bodyH * 0.86);
  const PACK_BLOCK = Math.round(bodyH * 0.90);

  // 본문이 단독으로 PACK_LINE 을 넘으면 라인 단위 청크.
  const fulltextBlocks = [];
  if (fulltextH <= PACK_LINE) {
    fulltextBlocks.push({ type: 'fulltext', range: [0, nLines], cont: false, h: fulltextH });
  } else {
    let s = 0, curH = barH, e = 0, cont = false;
    for (let i = 0; i < lineHs.length; i++) {
      const lh = lineHs[i];
      if (e > s && curH + lh > PACK_LINE) {
        fulltextBlocks.push({ type: 'fulltext', range: [s, e], cont, h: curH });
        s = e; curH = barH; cont = true;
      }
      curH += lh; e = i + 1;
    }
    if (e > s) fulltextBlocks.push({ type: 'fulltext', range: [s, e], cont, h: curH });
  }
  if (!fulltextBlocks.length) fulltextBlocks.push({ type: 'fulltext', range: [0, nLines], cont: false, h: barH });

  const seq = [
    ...fulltextBlocks,
    { type: 'answer', h: answerH },
    { type: 'flow', h: flowH },
  ];

  // 그리디 패킹 — 블록 결합 한계(PACK_BLOCK). 단, fulltext 라인블록끼리 이어붙으면
  // 결합 누락이 없으므로 그 경우만 보수적 한계(PACK_LINE)로 검사해 overflow 방지.
  const groups = [];
  let cur = [];
  let curH = 0;
  for (const blk of seq) {
    const addH = cur.length === 0 ? blk.h : blk.h + GAP;
    // 직전 블록과 현재 블록이 모두 fulltext면 라인 한계, 아니면 블록 한계.
    const prevType = cur.length ? (cur[cur.length - 1].type === 'fulltext' ? 'fulltext' : cur[cur.length - 1]) : null;
    const limit = (prevType === 'fulltext' && blk.type === 'fulltext') ? PACK_LINE : PACK_BLOCK;
    if (cur.length > 0 && curH + addH > limit) {
      groups.push(cur); cur = []; curH = 0;
    }
    cur.push(blk.type === 'fulltext' ? { type: 'fulltext', range: blk.range, cont: blk.cont } : blk.type);
    curH += (cur.length === 1 ? blk.h : blk.h + GAP);
  }
  if (cur.length) groups.push(cur);
  return groups;
}

// 측정 함수 — PAGE 1 단어 행 자동 축소.
// 삽화(16:5)의 자연 높이를 확보한 뒤 남는 공간에 들어가는 단어 행 수를 반환.
// 25개가 다 들어가면 25, 삽화가 밀릴 정도면 행 수를 줄여 삽화 높이를 지킨다.
async function measurePage1Vocab(data, dataDir) {
  const vocab = data.vocab || [];
  if (!vocab.length) return 0;
  const puppeteer = (await import('puppeteer')).default;
  const cssAbsPath = path.resolve(path.dirname(dataDir), 'styles', 'analysis.css');
  const cssContent = await fs.readFile(cssAbsPath, 'utf8');

  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${cssContent}</style></head><body>
${buildPage1(data)}
</body></html>`;
  const tmpPath = path.join(process.cwd(), `.tmp-measure-p1-${process.pid}-${data.question_no}.html`);
  await fs.writeFile(tmpPath, html, 'utf8');

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 794, height: 1123 });
  await page.goto('file://' + tmpPath.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  const m = await page.evaluate(() => {
    const body = document.querySelector('.page-body');
    const bodyH = body.getBoundingClientRect().height;
    const fig = body.querySelector('.illust');
    const rows = [...body.querySelectorAll('.voca-table tbody tr')];
    // page-body 직속 자식들의 실제 콘텐츠 합 (check-overflow와 동일 방식)
    let content = 0;
    [...body.children].forEach(c => {
      const r = c.getBoundingClientRect(); const cs = getComputedStyle(c);
      content += r.height + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom);
    });
    // 삽화 자연 높이(16:5): 폭 × 5/16. flex 압축 여부 판단 기준.
    const figW = fig ? fig.getBoundingClientRect().width : 0;
    const figH = fig ? fig.getBoundingClientRect().height : 0;
    const illustNatural = figW * 5 / 16;
    return {
      bodyH,
      content: Math.round(content),
      figH: Math.round(figH),
      illustNatural: Math.round(illustNatural),
      rowHs: rows.map(r => r.getBoundingClientRect().height),
    };
  });
  await browser.close();
  try { await fs.unlink(tmpPath); } catch {}

  const n = m.rowHs.length;
  // 삽화가 자연높이를 유지(=눌리지 않음)하고 내용이 본문에 들어가면 그대로 유지.
  // illustNatural(폭×5/16)은 반올림 오차로 실측 figH보다 몇 px 클 수 있으므로
  // 12px 여유를 둔다. 실제 압축은 수십~수백 px 차이라 오탐 없음.
  // (march 커밋본 content==bodyH==976, 삽화 215px 정상 → 25개 유지, 회귀 0)
  const squished = m.figH < m.illustNatural - 12;
  // check-overflow 와 동일하게 1px 허용오차(소수점 bodyH 975.7 vs content 976 대응).
  const TOL = 1;
  if (!squished && m.content <= m.bodyH + TOL) return n;

  // 넘치거나 삽화가 눌린 경우에만 축소: 초과분 + 삽화 복원분을 행 단위로 제거
  const overflow = Math.max(0, m.content - (m.bodyH + TOL));
  const squeezeBack = Math.max(0, m.illustNatural - m.figH);
  let need = overflow + squeezeBack + 2; // +2 안전 마진
  let fit = n;
  for (let i = n - 1; i >= 0 && need > 0; i--) {
    need -= m.rowHs[i];
    fit--;
  }
  if (fit < 1) fit = n;
  return fit;
}

// 마지막 PASSAGE 페이지(주로 flow)에 여백이 크면, 분석 첫 카드들을 그 밑에 채워
// "쉽게 이해하기" 뒤부터 문장분석이 이어지도록 병합한다(여백 최소화 — 요구 #3).
// 넘치지 않는 선에서만 카드를 끌어올리고, 남은 카드/그룹은 그대로 둔다.
// @returns { lastPassageHtml, leadCards } — 병합된 마지막 passage 페이지 HTML과
//           끌어올린 카드 수(분석 그룹에서 제거할 개수). 끌어올림 불가 시 null.
async function measureFlowMerge(data, dataDir, lastGroup, firstAnalysisGroup, lastPageNo) {
  if (!firstAnalysisGroup || !firstAnalysisGroup.length) return null;
  const puppeteer = (await import('puppeteer')).default;
  const cssAbsPath = path.resolve(path.dirname(dataDir), 'styles', 'analysis.css');
  const cssContent = await fs.readFile(cssAbsPath, 'utf8');

  const renderBlk = (blk) => {
    if (blk === 'answer') return buildAnswerBlock(data);
    if (blk === 'flow') return buildFlow(data.flow || []);
    if (blk && blk.type === 'fulltext') return buildFulltextBlock(data, blk.range, blk.cont);
    return '';
  };
  const passageInner = lastGroup.map(renderBlk).join('\n');
  const ANALYSIS_BAR = `<div class="section-bar">SENTENCE ANALYSIS · 문장별 분석<span class="bar-sub">📝 어법 · 📚 어휘 · 🎯 리딩</span></div>`;

  // group 항목은 sentence 객체 또는 {s, part}. 렌더 헬퍼로 정규화.
  const renderItem = (it) => (it && it.s) ? buildSentenceCard(it.s, it.part || 'full') : buildSentenceCard(it);
  // 측정: 마지막 passage 페이지 본문 + 분석 bar + 각 후보 카드
  const cards = firstAnalysisGroup.map((it, i) => `<div data-c="${i}">${renderItem(it)}</div>`).join('\n');
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${cssContent}</style></head><body>
<section class="page"><div class="page-body passage-layout" data-zone="passage">${passageInner}</div></section>
<section class="page"><div class="page-body" data-zone="probe"><div data-c="bar">${ANALYSIS_BAR}</div>${cards}</div></section>
</body></html>`;
  const tmpPath = path.join(process.cwd(), `.tmp-merge-${process.pid}-${data.question_no}.html`);
  await fs.writeFile(tmpPath, html, 'utf8');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 794, height: 1123 });
  await page.goto('file://' + tmpPath.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  const m = await page.evaluate(() => {
    const sum = el => { let t = 0; [...el.children].forEach(c => { const r = c.getBoundingClientRect(); const cs = getComputedStyle(c); t += r.height + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom); }); return t; };
    const pz = document.querySelector('[data-zone="passage"]');
    const bodyH = Math.round(pz.getBoundingClientRect().height);
    const passageH = sum(pz);
    const probe = document.querySelector('[data-zone="probe"]');
    const barEl = probe.querySelector('[data-c="bar"] .section-bar');
    const bcs = getComputedStyle(barEl);
    const barH = barEl.getBoundingClientRect().height + parseFloat(bcs.marginTop) + parseFloat(bcs.marginBottom);
    const cardHs = [...probe.querySelectorAll('[data-c]:not([data-c="bar"])')].map(w => { const e = w.firstElementChild; const cs = getComputedStyle(e); return e.getBoundingClientRect().height + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom); });
    return { bodyH, passageH: Math.round(passageH), barH, cardHs };
  });
  await browser.close();
  try { await fs.unlink(tmpPath); } catch {}

  // 마지막 passage 페이지에 남는 공간이 충분해야(카드 1개+bar 들어갈 만큼) 병합 의미 있음
  const GAP = 9;
  const SAFE = 46; // 보수 마진(병합 카드 결합 렌더 과소측정 보정 — grade1 #19 980/976 잡기 위해 42→46)
  let avail = m.bodyH - m.passageH - GAP - m.barH - SAFE;
  if (avail < (m.cardHs[0] || Infinity)) return null; // 카드 1개도 못 넣으면 병합 안 함

  let used = 0, n = 0;
  for (let i = 0; i < m.cardHs.length; i++) {
    const add = (n === 0 ? m.cardHs[i] : m.cardHs[i] + GAP);
    if (used + add > avail) break;
    used += add; n++;
  }
  if (n < 1) return null;

  const leadHtml = firstAnalysisGroup.slice(0, n).map(renderItem).join('\n\n');
  const lastPassageHtml = `<section class="page">
${buildHeader(data.exam + ' · ' + data.question_no + '번', 'PASSAGE')}
  <div class="page-body passage-layout">
${passageInner}
    <div class="section-bar">
      SENTENCE ANALYSIS · 문장별 분석
      <span class="bar-sub">📝 어법 · 📚 어휘 · 🎯 리딩</span>
    </div>
    <div class="sent-list">
${leadHtml}
    </div>
  </div>
${buildFooter(lastPageNo)}
</section>`;
  return { lastPassageHtml, leadCards: n };
}

// ─────────────────────────────────────────────────────────────
// 메인 빌드 함수
// ─────────────────────────────────────────────────────────────
async function buildHtml(data, opts = {}) {
  const stylesHref = opts.stylesHref || '../styles/analysis.css';

  // PAGE 1 — 삽화 자리 보호: 단어 행 자동 축소
  let vocabLimit;
  try {
    vocabLimit = await measurePage1Vocab(data, opts.dataDir);
  } catch (err) {
    console.warn(`   ⚠️  measurePage1Vocab failed for ${data.question_no}, using all vocab:`, err.message);
    vocabLimit = (data.vocab || []).length;
  }
  const droppedVocab = (data.vocab || []).length - vocabLimit;
  if (droppedVocab > 0) console.log(`   ℹ️  ${data.question_no}: 단어 ${(data.vocab||[]).length}→${vocabLimit} (삽화 자리 보호로 ${droppedVocab}개 축소)`);
  const pages = [buildPage1(data, vocabLimit)];

  // PASSAGE 페이지 — 실측 후 1페이지 또는 자동 분할 (긴 묶음 지문 대응)
  let blockGroups;
  try {
    blockGroups = await measurePassageBlocks(data, opts.dataDir);
  } catch (err) {
    console.warn(`   ⚠️  measurePassageBlocks failed for ${data.question_no}, using single page:`, err.message);
    blockGroups = [[{ type: 'fulltext', range: [0, (data.passage || []).length], cont: false }, 'answer', 'flow']];
  }
  const passagePages = buildPassagePages(data, blockGroups, 2);

  // 실측 기반 분석 페이지 분배 (puppeteer 사용)
  let groups;
  try {
    groups = await measureAndChunk(stylesHref, data, opts.dataDir);
  } catch (err) {
    console.warn(`   ⚠️  measureAndChunk failed for ${data.question_no}, falling back to estimate:`, err.message);
    groups = chunkSentences(data.sentences || []);
  }

  // 요구 #3: 마지막 passage 페이지(주로 flow)에 여백이 크면 분석 첫 문장들을 그 밑에 병합.
  // 끌어올림 대상은 "온전한 문장(full)" — 분할 조각을 끌어올리면 이어쓰기가 깨지므로
  // 원본 sentences 앞부분(full)을 후보로 넘긴다.
  let mergedLast = null;
  const sentsAll = data.sentences || [];
  const fullCandidates = sentsAll.map(s => ({ s, part: 'full' }));
  try {
    const lastGroup = blockGroups[blockGroups.length - 1];
    const lastPageNo = 2 + passagePages.length - 1;
    mergedLast = await measureFlowMerge(data, opts.dataDir, lastGroup, fullCandidates, lastPageNo);
  } catch (err) {
    console.warn(`   ⚠️  measureFlowMerge failed for ${data.question_no}:`, err.message);
  }

  if (mergedLast && mergedLast.leadCards > 0) {
    // 마지막 passage 페이지를 병합본으로 교체
    pages.push(...passagePages.slice(0, -1), mergedLast.lastPassageHtml);
    // 끌어올린 문장 수만큼 건너뛰고 나머지를 처음부터 다시 청킹(빼곡 채우기 보장).
    // (기존: groups[0].slice 만으로는 병합 후 첫 페이지가 듬성해지는 회귀 — 재청킹으로 해결)
    let remGroups;
    try {
      remGroups = await measureAndChunk(stylesHref, data, opts.dataDir, mergedLast.leadCards);
    } catch (err) {
      console.warn(`   ⚠️  re-chunk after merge failed for ${data.question_no}, using slice:`, err.message);
      const remainingFirst = (groups[0] || []).slice(mergedLast.leadCards);
      remGroups = remainingFirst.length ? [remainingFirst, ...groups.slice(1)] : groups.slice(1);
    }
    const analysisStart = 2 + passagePages.length; // 병합으로 passage 페이지 수 동일
    remGroups.forEach((group, i) => {
      pages.push(buildAnalysisPage(data, group, analysisStart + i, `ANALYSIS · ${i + 2}/${remGroups.length + 1}`));
    });
  } else {
    pages.push(...passagePages);
    const analysisStart = 2 + passagePages.length;
    groups.forEach((group, i) => {
      pages.push(buildAnalysisPage(data, group, analysisStart + i, `ANALYSIS · ${i + 1}/${groups.length}`));
    });
  }

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>${esc(data.exam)} · ${esc(data.question_no)}번 분석지 — Terra Nova</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="${esc(stylesHref)}">
</head>
<body>

${pages.join('\n\n')}

</body>
</html>
`;
}

// ─────────────────────────────────────────────────────────────
// CLI
// ─────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: node builder/build.mjs <data-dir> [<dist-dir>]');
    process.exit(1);
  }

  const cwd = process.cwd();
  const dataDir = path.resolve(cwd, args[0]);
  const distDir = path.resolve(cwd, args[1] || path.join(path.dirname(dataDir), 'dist'));

  // 상대 경로 stylesHref 결정 (dist에서 styles까지)
  const stylesAbs = path.resolve(path.dirname(dataDir), 'styles', 'analysis.css');
  let stylesHref = path.relative(distDir, stylesAbs).replace(/\\/g, '/');
  if (!stylesHref.startsWith('.')) stylesHref = './' + stylesHref;

  await fs.mkdir(distDir, { recursive: true });

  // 분석지 빌더는 {N}.json만 처리 — {N}-workbook.json 등 다른 빌더용 데이터는 스킵
  const files = (await fs.readdir(dataDir))
    .filter(f => f.endsWith('.json') && !f.includes('-'))
    .sort((a, b) => parseInt(a) - parseInt(b));
  if (!files.length) {
    console.error(`No JSON files in ${dataDir}`);
    process.exit(1);
  }

  console.log(`📚 Building ${files.length} analysis page(s)...`);
  console.log(`   data:   ${dataDir}`);
  console.log(`   dist:   ${distDir}`);
  console.log(`   styles: ${stylesHref}\n`);

  const built = [];
  for (const f of files) {
    const jsonPath = path.join(dataDir, f);
    const data = JSON.parse(await fs.readFile(jsonPath, 'utf8'));
    const html = await buildHtml(data, { stylesHref, dataDir });
    const outPath = path.join(distDir, f.replace(/\.json$/, '.html'));
    await fs.writeFile(outPath, html, 'utf8');
    console.log(`   ✓ ${f}  →  ${path.relative(cwd, outPath)}`);
    built.push({ file: f, html: outPath, data });
  }

  // index.html (모든 분석지 링크 모음)
  const indexHtml = buildIndex(built, stylesHref);
  await fs.writeFile(path.join(distDir, 'index.html'), indexHtml, 'utf8');
  console.log(`\n📄 index.html generated at ${path.relative(cwd, path.join(distDir, 'index.html'))}`);
  console.log('✅ Done.');
}

function buildIndex(built, stylesHref) {
  const examLabel = built[0]?.data?.exam || '모의고사 분석지';
  const items = built.map(({ file, data }) => {
    const href = file.replace(/\.json$/, '.html');
    return `      <li>
        <a class="card" href="${esc(href)}">
          <div class="num">${esc(data.question_no)}</div>
          <div class="meta">
            <div class="type">${esc(data.type || '')}</div>
            <div class="title">${esc(data.title_en || '')}</div>
            <div class="ko">${esc(data.summary_ko || '')}</div>
          </div>
        </a>
      </li>`;
  }).join('\n');

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>${esc(examLabel)} — 분석지 목차</title>
<link rel="stylesheet" href="${esc(stylesHref)}">
<style>
  body { padding: 40px 24px; }
  .wrap { max-width: 920px; margin: 0 auto; }
  h1 { color: var(--c-mint-deep); border-bottom: 2px solid var(--c-mint); padding-bottom: 10px; margin: 0 0 24px; }
  .list { list-style: none; padding: 0; display: grid; gap: 10px; }
  .card { display: grid; grid-template-columns: 60px 1fr; gap: 14px; padding: 14px; background: #fff; border: 1px solid var(--c-mint); border-radius: 8px; text-decoration: none; color: inherit; transition: transform .12s; }
  .card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
  .num { font-family: 'Inter'; font-size: 24pt; font-weight: 800; color: var(--c-mint-deep); text-align: center; }
  .type { font-size: 9pt; font-weight: 700; color: var(--c-coral-deep); }
  .title { font-family: 'Inter'; font-weight: 600; color: var(--c-text); margin-top: 2px; }
  .ko { font-size: 9pt; color: var(--c-text-soft); margin-top: 3px; }
</style>
</head>
<body>
  <div class="wrap">
    <h1>${esc(examLabel)} · 분석지 목차</h1>
    <ul class="list">
${items}
    </ul>
  </div>
</body>
</html>
`;
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
