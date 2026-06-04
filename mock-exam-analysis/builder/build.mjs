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

function buildVocabTable(vocab) {
  const rows = vocab.map((v, i) => `        <tr>
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
// PAGE 1
// ─────────────────────────────────────────────────────────────
function buildPage1(data) {
  return `<section class="page">
${buildHeader(data.exam, 'INTRO')}
  <div class="page-body">
${buildExerciseBlock(data)}
${buildIllustration(data)}
${buildVocabTable(data.vocab || [])}
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
function buildSentenceCard(s) {
  const tags = (s.tags || []).map(t => {
    const tt = TAG_LABEL[t];
    if (!tt) return '';
    return `<span class="tag ${tt.cls}">${tt.emoji} ${tt.label}</span>`;
  }).join('\n        ');

  const points = (s.points || []).map(p => {
    const tagText = POINT_LABEL[p.kind] || '포인트';
    return `        <div class="point ${esc(p.kind)}"><span class="pt-tag">${tagText}</span><span class="pt-text">${raw(p.text)}</span></div>`;
  }).join('\n');

  const noteHtml = s.note ? `      <div class="note">${raw(s.note)}</div>` : '';

  let paraHtml = '';
  if (s.paraphrasing && s.paraphrasing.length) {
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

  return `    <div class="sent">
      <div class="sent-head">
        <span class="sent-no">SENT ${s.no}</span>
        ${tags}
      </div>
      <div class="en">
        ${raw(s.en_html)}
      </div>
      <div class="ko">${raw(s.ko_chunks)}</div>
      <div class="ko-bold">${esc(s.ko_full)}</div>
${noteHtml}
      <div class="point-grid">
${points}
      </div>
${paraHtml}
    </div>`;
}

function buildAnalysisPage(data, sentences, pageNo, label) {
  const cards = sentences.map(buildSentenceCard).join('\n\n');

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
async function measureAndChunk(stylesHref, data, dataDir) {
  const puppeteer = (await import('puppeteer')).default;
  // CSS 파일을 인라인으로 포함 (file:// 상대경로 문제 우회)
  const cssAbsPath = path.resolve(path.dirname(dataDir), 'styles', 'analysis.css');
  const cssContent = await fs.readFile(cssAbsPath, 'utf8');
  const allOnOne = `<!doctype html><html><head><meta charset="utf-8"><style>${cssContent}</style></head><body>
<section class="page"><div class="page-body">
<div class="section-bar">SENTENCE ANALYSIS · 문장별 분석<span class="bar-sub">📝 어법 · 📚 어휘 · 🎯 리딩</span></div>
<div class="sent-list">
${(data.sentences || []).map(buildSentenceCard).join('\n')}
</div>
</div></section></body></html>`;

  const tmpPath = path.join(process.cwd(), '.tmp-measure.html');
  await fs.writeFile(tmpPath, allOnOne, 'utf8');

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 794, height: 1123 });
  await page.goto('file://' + tmpPath.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  const heights = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.sent')];
    return cards.map(c => {
      const r = c.getBoundingClientRect();
      const cs = getComputedStyle(c);
      return r.height + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom);
    });
  });
  // section-bar + gap 등을 고려한 가용 본문 높이 (헤더 30px·section-bar 38px·footer 50px·body padding 60px 차감 → 약 940px)
  const AVAIL = 920;
  const GAP = 9;
  await browser.close();
  try { await fs.unlink(tmpPath); } catch {}

  // 그리디 분배: 다음 카드 + gap 추가 시 AVAIL 초과면 새 페이지
  const pages = [];
  let cur = [];
  let curH = 0;
  for (let i = 0; i < data.sentences.length; i++) {
    const h = heights[i];
    const addH = cur.length === 0 ? h : h + GAP;
    if (cur.length > 0 && curH + addH > AVAIL) {
      pages.push(cur);
      cur = [];
      curH = 0;
    }
    cur.push(data.sentences[i]);
    curH += (cur.length === 1 ? h : h + GAP);
  }
  if (cur.length) pages.push(cur);
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
  const candidates = [
    wrap(buildFulltextBlock(data), 'fulltext'),
    wrap(buildAnswerBlock(data), 'answer'),
    wrap(buildFlow(data.flow || []), 'flow'),
  ];
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${cssContent}</style></head><body>
${candidates.join('\n')}
</body></html>`;

  const tmpPath = path.join(process.cwd(), '.tmp-measure-p2.html');
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
    const bodyH = Math.round(byId('fulltext').getBoundingClientRect().height); // 실제 가용 본문 높이
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
      barH,
      lineHs,
      answer: sumChildren(byId('answer')),
      flow: sumChildren(byId('flow')),
    };
  });
  await browser.close();
  try { await fs.unlink(tmpPath); } catch {}

  const { bodyH, barH, lineHs, answer: answerH, flow: flowH } = measured;
  // 측정값은 결합 렌더보다 ~10% 가볍게 나온다(검증: 38번 측정 932 vs 실측 978,
  // 43번 25줄 본문 청크). bodyH의 88%를 가용 한계로 잡아 안전 마진 확보.
  const AVAIL = Math.round(bodyH * 0.88);
  const GAP = 6; // passage-layout gap

  // 본문을 가용 높이에 맞춰 [s,e) 청크로 분할 (각 청크 = section-bar barH + 라인들)
  const fulltextBlocks = [];
  {
    let s = 0, curH = barH, e = 0, cont = false;
    for (let i = 0; i < lineHs.length; i++) {
      const lh = lineHs[i];
      if (e > s && curH + lh > AVAIL) {
        fulltextBlocks.push({ type: 'fulltext', range: [s, e], cont, h: curH });
        s = e; curH = barH; cont = true;
      }
      curH += lh; e = i + 1;
    }
    if (e > s) fulltextBlocks.push({ type: 'fulltext', range: [s, e], cont, h: curH });
  }
  if (!fulltextBlocks.length) fulltextBlocks.push({ type: 'fulltext', range: [0, nLines], cont: false, h: barH });

  // 전체 블록 시퀀스: 본문 청크들 → answer → flow
  const seq = [
    ...fulltextBlocks,
    { type: 'answer', h: answerH },
    { type: 'flow', h: flowH },
  ];

  // 그리디 패킹 (실측 높이 기반)
  const groups = [];
  let cur = [];
  let curH = 0;
  for (const blk of seq) {
    const addH = cur.length === 0 ? blk.h : blk.h + GAP;
    if (cur.length > 0 && curH + addH > AVAIL) {
      groups.push(cur); cur = []; curH = 0;
    }
    cur.push(blk.type === 'fulltext' ? { type: 'fulltext', range: blk.range, cont: blk.cont } : blk.type);
    curH += (cur.length === 1 ? blk.h : blk.h + GAP);
  }
  if (cur.length) groups.push(cur);
  return groups;
}

// ─────────────────────────────────────────────────────────────
// 메인 빌드 함수
// ─────────────────────────────────────────────────────────────
async function buildHtml(data, opts = {}) {
  const stylesHref = opts.stylesHref || '../styles/analysis.css';

  const pages = [buildPage1(data)];

  // PASSAGE 페이지 — 실측 후 1페이지 또는 자동 분할 (긴 묶음 지문 대응)
  let blockGroups;
  try {
    blockGroups = await measurePassageBlocks(data, opts.dataDir);
  } catch (err) {
    console.warn(`   ⚠️  measurePassageBlocks failed for ${data.question_no}, using single page:`, err.message);
    blockGroups = [[{ type: 'fulltext', range: [0, (data.passage || []).length], cont: false }, 'answer', 'flow']];
  }
  const passagePages = buildPassagePages(data, blockGroups, 2);
  pages.push(...passagePages);

  // 분석 페이지 시작 번호 = 1(인트로) + passage 페이지 수 + 1
  const analysisStart = 2 + passagePages.length;

  // 실측 기반 페이지 분배 (puppeteer 사용)
  let groups;
  try {
    groups = await measureAndChunk(stylesHref, data, opts.dataDir);
  } catch (err) {
    console.warn(`   ⚠️  measureAndChunk failed for ${data.question_no}, falling back to estimate:`, err.message);
    groups = chunkSentences(data.sentences || []);
  }
  groups.forEach((group, i) => {
    const pageNo = analysisStart + i;
    const label = `ANALYSIS · ${i + 1}/${groups.length}`;
    pages.push(buildAnalysisPage(data, group, pageNo, label));
  });

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
