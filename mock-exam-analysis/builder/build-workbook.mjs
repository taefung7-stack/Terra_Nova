#!/usr/bin/env node
/* ===================================================================
 * Terra Nova 모의고사 워크북 빌더 — v1.0 LOCKED (2026-05-26)
 * ===================================================================
 *
 * 이 빌더의 디자인 시스템은 사용자 검수를 거쳐 v1.0으로 확정됨.
 * 회차별 데이터(JSON)만 교체하면 동일 디자인으로 무한 확장.
 *
 * ── 설계 원칙 (변경 금지) ─────────────────────────────────────────
 *   1. 9-STEP 구성 고정 (Passage → Grammar → Vocab → Fill →
 *      Ko-Trans → Arrange → Sent-Trans → Mixed → Answers)
 *   2. STEP별 컬러 코딩 — 페이지마다 다른 파스텔 톤
 *      (1·9 Mint / 2·6 Sky / 3·8 Butter / 4·7 Coral / 5 Sage)
 *   3. A4 297mm 절대 초과 금지 — auto-fit으로 항목 자율 분배
 *      (justify-content: space-around: 첫 항목 위·마지막 아래 여백 보장)
 *   4. 폰트 전부 Pretendard 통일 (Inter 사용 금지)
 *   5. 푸터: 좌측 "Terra Nova · Workbook" / 우측 동그라미 페이지번호
 *   6. 분석지와 동일한 패턴: page-head 컬러 보더 + 페이지번호 동그라미
 *   7. 학습 페이지(2~8): 각 문항 위에 STEP 컬러 1px 가로선 구분
 *      (border-top, :first-child 제외)
 *   8. 답란은 컬러 박스 대신 항목 사이 auto-fit 여백으로 자연 확보
 *   9. STEP 9 정답지: 2단 컬럼(column-count: 2)으로 한 페이지 수용
 *
 * ── 빌드 검증 ──────────────────────────────────────────────────────
 *   node builder/check-overflow.mjs <html-file>
 *   → 9/9 페이지 overflow=NO, hits_foot=NO 확인 후 배포
 *
 * ── 회차 확장 절차 ─────────────────────────────────────────────────
 *   1) {새회차폴더}/data/{N}.json + {N}-workbook.json 작성
 *   2) npm run workbook:{회차}  (package.json scripts에 1줄 추가)
 *   3) check-overflow.mjs 로 9/9 통과 검증
 *
 * 사용법:
 *   node builder/build-workbook.mjs <data-dir> [<dist-dir>]
 *   node builder/build-workbook.mjs 2026-march-grade2/data
 * =================================================================== */

import fs from 'node:fs/promises';
import path from 'node:path';

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

// ─────────────────────────────────────────────────────────────
// 결정적(deterministic) 셔플 — 같은 시드면 항상 같은 순서.
// 빌드를 반복해도 워크북 단어 배열이 흔들리지 않도록 시드 고정.
// (mulberry32 PRNG + Fisher–Yates)
// ─────────────────────────────────────────────────────────────
function seededRng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function strSeed(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// 단어 배열을 결정적으로 섞되, 원래 순서와 동일하면 한 번 더 섞어 보장.
function shuffleWords(words, seedKey) {
  if (!Array.isArray(words) || words.length < 2) return words.slice();
  const orig = words.join('');
  for (let attempt = 0; attempt < 4; attempt++) {
    const rng = seededRng(strSeed(seedKey + '#' + attempt));
    const arr = words.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    if (arr.join('') !== orig) return arr; // 원본과 달라야 '섞인' 것
  }
  // 단어가 전부 동일한 극단적 경우 — 원본 그대로
  return words.slice();
}

// ─────────────────────────────────────────────────────────────
// 고유명사 판별 — 정답으로 출제하면 안 되는 토큰.
// 문장 첫 단어가 아니면서 대문자로 시작하거나, 알려진 인명/지명/서명.
// ─────────────────────────────────────────────────────────────
function buildProperNounSet(data) {
  const set = new Set();
  const sents = [...(data.passage || []), ...(data.passage_ko ? [] : [])];
  for (const sent of (data.passage || [])) {
    const clean = String(sent).replace(/\([a-e]\)/g, '');
    const tokens = clean.match(/[A-Za-z][A-Za-z.'-]*/g) || [];
    tokens.forEach((tok, idx) => {
      const bare = tok.replace(/[.''-]+$/g, '');
      if (!bare) return;
      // 첫 글자 대문자 + (문장 첫 토큰이 아님 OR 전부 대문자 약어)
      const isCap = /^[A-Z]/.test(bare);
      const isAllCaps = /^[A-Z]{2,}$/.test(bare);
      if (isCap && (idx > 0 || isAllCaps)) {
        set.add(bare.toLowerCase());
      }
    });
  }
  // 문장 맨 앞에 와서 놓친 고유명사 보강: 2회 이상 등장하며 항상 대문자인 토큰
  const capCount = {}, lowCount = {};
  for (const sent of (data.passage || [])) {
    const clean = String(sent).replace(/\([a-e]\)/g, '');
    for (const tok of (clean.match(/[A-Za-z][A-Za-z.'-]*/g) || [])) {
      const bare = tok.replace(/[.''-]+$/g, '');
      if (!bare) continue;
      if (/^[A-Z]/.test(bare)) capCount[bare.toLowerCase()] = (capCount[bare.toLowerCase()] || 0) + 1;
      else lowCount[bare.toLowerCase()] = (lowCount[bare.toLowerCase()] || 0) + 1;
    }
  }
  for (const w of Object.keys(capCount)) {
    if (capCount[w] >= 1 && !lowCount[w]) set.add(w);
  }
  return set;
}

// 빈칸/정답 출제 제외 — 너무 쉬운 기초 단어 스톱리스트(길이+빈도 휴리스틱 보조).
const EASY_STOPWORDS = new Set([
  // 기능어
  'the','a','an','and','or','but','so','if','of','to','in','on','at','by','for','with','from',
  'as','is','are','was','were','be','been','being','am','do','does','did','have','has','had',
  'i','you','he','she','it','we','they','this','that','these','those','my','your','his','her',
  'its','our','their','me','him','them','us','not','no','yes','can','will','would','could',
  'should','may','might','must','than','then','too','very','more','most','some','any','all',
  'one','two','out','up','down','off','over','about','into','also',
  // 쉬운 기초 명사/동사
  'bus','taxi','car','train','go','goes','went','get','got','put','say','said','see','saw',
  'day','time','man','woman','boy','girl','home','school','book','food','water','tree','dog',
  'cat','run','ran','eat','ate','big','small','good','bad','new','old','hot','cold','red','blue'
]);

function isEasyWord(answer) {
  const w = String(answer || '').toLowerCase().replace(/[^a-z'-]/g, '');
  if (!w) return true;
  if (EASY_STOPWORDS.has(w)) return true;
  if (w.length <= 4) return true; // 4자 이하 — 핵심어 가능성 낮음
  return false;
}

const STEP_META = {
  1: { title: '본문과 해석',         desc: '본문 + 해석 + 핵심 어휘 정리',                    color: 'mint'   },
  2: { title: '어법 양자택일',       desc: '둘 중 어법상 알맞은 것을 고르시오.',                color: 'sky'    },
  3: { title: '어휘 양자택일',       desc: '둘 중 문맥상 알맞은 것을 고르시오.',                color: 'butter' },
  4: { title: '빈칸 첫글자 쓰기',    desc: '빈칸에 알맞은 단어를 첫 글자를 참고하여 쓰시오.',   color: 'coral'  },
  5: { title: '한글 해석 연습',      desc: '주어진 영문을 한글로 해석하시오.',                  color: 'sage'   },
  6: { title: '영문 배열 연습',      desc: '주어진 단어를 배열하여 문장을 완성하시오.',         color: 'sky'    },
  7: { title: '통문장 영작',         desc: '주어진 한글을 영어 문장으로 옮겨 쓰시오.',          color: 'coral'  },
  8: { title: '종합 문제',           desc: 'STEP 2~7 유형을 모두 섞은 종합 점검입니다.',        color: 'butter' },
  9: { title: '정답 · 해설',         desc: '워크북 전체 정답과 핵심 해설입니다.',               color: 'mint'   }
};

// ─────────────────────────────────────────────────────────────
// 공통 컴포넌트
// ─────────────────────────────────────────────────────────────

/* 교재용(비판매) 데이터가 켜는 표시 옵션 — 분석지 빌더와 동일한 규약.
 *  - hideBrand:  푸터 좌측 "Terra Nova · Workbook" 숨김
 *  - hideHeadNo: 헤더의 "N번" 칩 숨김 (학년 칩이 비면 그 구분자도 함께 정리)
 * 플래그가 없으면 전부 false → 정식 회차는 기존 동작 그대로(회귀 0). */
let WB_OPT = { hideBrand: false, hideHeadNo: false };

/* workbook.css 절대경로. 기본은 <dist>/../styles/workbook.css 이고,
 * --styles= 가 주어지면 그 값으로 덮어쓴다.
 * ★ href 는 하드코딩하지 말고 distDir 기준 상대경로로 계산할 것 —
 *   dist/{L1,L2} 처럼 한 단계 깊어지면 '../styles/...' 가 깨지고, CSS 가 없으면
 *   A4 페이지 고정이 풀려 페이지가 재배치된다(합본 페이지 유실 사고와 동일 원인). */
let WB_CSS_ABS = null;
function wbCssAbs(distDir) {
  return WB_CSS_ABS || path.resolve(distDir, '..', 'styles', 'workbook.css');
}
function wbCssHref(distDir) {
  return path.relative(distDir, wbCssAbs(distDir)).replace(/\\/g, '/');
}

function pageHead({ exam, grade, qno, stepNum }) {
  const meta = STEP_META[stepNum];
  // 빈 칩(학년 없음 / 번호 숨김)은 구분자까지 같이 빼야 "| |" 가 남지 않는다.
  const parts = [`<span class="exam-tag">${esc(exam)}</span>`];
  if (grade) parts.push(`<span class="grade-tag">${esc(grade)}</span>`);
  if (!WB_OPT.hideHeadNo && qno !== '' && qno != null) parts.push(`<span class="qno">${esc(qno)}번</span>`);
  return `  <header class="page-head">
    ${parts.join('\n    <span class="sep">|</span>\n    ')}
    <span class="sep">·</span>
    <span class="step-subtitle">${esc(meta.title)}</span>
    <span class="wb-chip">WORKBOOK</span>
  </header>`;
}

function stepBanner(stepNum) {
  const meta = STEP_META[stepNum];
  return `    <div class="step-banner">
      <div class="step-left">
        <div class="step-tag">STEP ${String(stepNum).padStart(2, '0')}</div>
        <div class="step-num">${stepNum}</div>
      </div>
      <div class="step-right">
        <div class="step-title">${esc(meta.title)}</div>
        <div class="step-desc">${esc(meta.desc)}</div>
      </div>
    </div>`;
}

function directive(label, text) {
  return `    <div class="directive">
      <span class="di-mark"></span>
      <span class="di-label">${esc(label)}</span>
      <span class="di-text">${esc(text)}</span>
    </div>`;
}

function pageFoot(pageNum, brand = 'Terra Nova · Workbook') {
  const label = WB_OPT.hideBrand ? '' : brand;
  return `  <footer class="page-foot">
    <span class="brand">${esc(label)}</span>
    <span class="pageno">${pageNum}</span>
  </footer>`;
}

function pageWrap({ stepNum, headOpts, pageNum, body }) {
  return `<section class="page" data-step="${stepNum}">
${pageHead(headOpts)}
  <div class="page-body">
${stepBanner(stepNum)}
${body}
  </div>
${pageFoot(pageNum)}
</section>`;
}

// ─────────────────────────────────────────────────────────────
// STEP 1 — 본문 + 해석 + 단어 정리
// ─────────────────────────────────────────────────────────────

function renderStep1({ data, wb, headOpts, pageNum }) {
  const enLines = data.passage.map((s, i) =>
    `<span class="sent-mark">${i + 1}</span>${esc(s)}`
  ).join(' ');
  const koLines = (data.passage_ko || []).map((s, i) =>
    `<span class="sent-mark">${i + 1}</span>${esc(s)}`
  ).join(' ');

  const vocabPrimary = data.vocab.slice(0, 20);
  const vocaItems = vocabPrimary.map((v, i) => `
        <div class="v-item">
          <span class="v-no">${i + 1}.</span>
          <span><span class="v-word">${esc(v.word)}</span><span class="v-pos">[${esc(v.pos)}]</span><span class="v-meaning">${esc(v.meaning)}</span></span>
        </div>`).join('');

  // 동의어 / 반의어 — 본문 vocab에서 상위 5개씩
  const synList = vocabPrimary.filter(v => v.syn).slice(0, 5);
  const antList = vocabPrimary.filter(v => v.ant).slice(0, 5);
  // 영영풀이 / 핵심 표현 — wb 데이터에서 가져오기
  const defs = wb.voca_check.definitions || [];
  const exprs = wb.voca_check.expressions || [];

  const synHtml = synList.map((v, i) =>
    `<div class="v-item"><span class="v-no">${i + 1}.</span><span><span class="v-word">${esc(v.word)}</span> = ${esc(v.syn)}</span></div>`
  ).join('');
  const antHtml = antList.map((v, i) =>
    `<div class="v-item"><span class="v-no">${i + 1}.</span><span><span class="v-word">${esc(v.word)}</span> ↔ ${esc(v.ant)}</span></div>`
  ).join('');
  const defHtml = defs.map((d, i) =>
    `<div class="v-item"><span class="v-no">${i + 1}.</span><span><span class="v-word">${esc(d.answer)}</span>: ${esc(d.def)}</span></div>`
  ).join('');
  const exprHtml = exprs.map((e, i) =>
    `<div class="v-item"><span class="v-no">${i + 1}.</span><span><span class="v-word">${esc(e.answer)}</span>: ${esc(e.ko)}</span></div>`
  ).join('');

  const body = `    <div class="passage-grid">
      <div class="passage-box">
        <div class="pb-label">원문 PASSAGE</div>
        <div class="pb-body">${enLines}</div>
      </div>
      <div class="passage-box ko">
        <div class="pb-label">전체 해석</div>
        <div class="pb-body">${koLines}</div>
      </div>
    </div>

    <div class="voca-block">
      <div class="vb-head">필수 단어</div>
      <div class="voca-grid">${vocaItems}
      </div>
    </div>

    <div class="voca-2col">
      <div class="voca-block">
        <div class="vb-head">동의어 ≈</div>
        <div class="voca-grid">${synHtml}</div>
      </div>
      <div class="voca-block">
        <div class="vb-head">반의어 ↔</div>
        <div class="voca-grid">${antHtml}</div>
      </div>
    </div>

    <div class="voca-2col">
      <div class="voca-block">
        <div class="vb-head">영영풀이</div>
        <div class="voca-grid">${defHtml}</div>
      </div>
      <div class="voca-block">
        <div class="vb-head">필수 표현</div>
        <div class="voca-grid">${exprHtml}</div>
      </div>
    </div>`;

  return pageWrap({ stepNum: 1, headOpts, pageNum, body });
}

// ─────────────────────────────────────────────────────────────
// 양자택일 토큰 변환 — {{N:A/B}} → <span class="alt">A <span class="slash">/</span> B</span>
// ─────────────────────────────────────────────────────────────

function renderChoiceTemplate(tmpl) {
  return esc(tmpl).replace(/\{\{(\d+):([^\/]+)\/([^}]+)\}\}/g, (_, n, a, b) => {
    return `<span class="alt"><sup class="alt-idx">${n}</sup>${a.trim()} <span class="slash">/</span> ${b.trim()}</span>`;
  });
}

// ─────────────────────────────────────────────────────────────
// STEP 2 — 어법 양자택일
// ─────────────────────────────────────────────────────────────

function renderStep2({ wb, headOpts, pageNum }) {
  const items = wb.grammar_choice.map(g => `
      <div class="qa-item">
        <div class="qa-no">${g.no}.</div>
        <div class="qa-body">
          <div class="qa-en">${renderChoiceTemplate(g.en_template)}</div>
          <div class="qa-ko">${esc(g.ko_full)}</div>
          <div class="qa-answer-line"></div>
        </div>
      </div>`).join('');

  const body = `    <div class="qa-list auto-fit">${items}
    </div>`;

  return pageWrap({ stepNum: 2, headOpts, pageNum, body });
}

// ─────────────────────────────────────────────────────────────
// STEP 3 — 어휘 양자택일
// ─────────────────────────────────────────────────────────────

function renderStep3({ wb, headOpts, pageNum }) {
  const items = wb.vocab_choice.map(g => `
      <div class="qa-item">
        <div class="qa-no">${g.no}.</div>
        <div class="qa-body">
          <div class="qa-en">${renderChoiceTemplate(g.en_template)}</div>
          <div class="qa-ko">${esc(g.ko_full)}</div>
          <div class="qa-answer-line"></div>
        </div>
      </div>`).join('');

  const body = `    <div class="qa-list auto-fit">${items}
    </div>`;

  return pageWrap({ stepNum: 3, headOpts, pageNum, body });
}

// ─────────────────────────────────────────────────────────────
// STEP 4 — 빈칸 첫글자 쓰기
// ─────────────────────────────────────────────────────────────

function renderStep4({ data, wb, headOpts, pageNum }) {
  const items = wb.fill_first_letter.map(f => {
    const sentEn = data.passage[f.ref_sentence - 1] || '';
    let rendered = esc(sentEn);
    f.hints.forEach((h, idx) => {
      const re = new RegExp(`\\b${h.answer}\\b`, 'i');
      const replacement = `<span class="first-hint"><span class="fh-num">${idx + 1})</span><span class="fh-letter">${h.letter}</span></span> <span class="blank-line short"></span>`;
      rendered = rendered.replace(re, replacement);
    });
    return `
      <div class="qa-item">
        <div class="qa-no">${f.no}.</div>
        <div class="qa-body">
          <div class="qa-en">${rendered}</div>
          <div class="qa-ko">${esc(f.ko_full)}</div>
          <div class="qa-answer-line"></div>
        </div>
      </div>`;
  }).join('');

  const body = `    <div class="qa-list auto-fit">${items}
    </div>`;

  return pageWrap({ stepNum: 4, headOpts, pageNum, body });
}

// ─────────────────────────────────────────────────────────────
// STEP 5 — 한글 해석 연습 (영문 → 한글)
// ─────────────────────────────────────────────────────────────

function renderStep5({ data, wb, headOpts, pageNum }) {
  const items = wb.ko_translation.map(t => {
    const en = data.passage[t.ref_sentence - 1] || '';
    return `
      <div class="trans-item">
        <div class="ti-no">${t.no}.</div>
        <div>
          <div class="ti-given">${esc(en)}</div>
          <div class="ti-answer-line"></div>
        </div>
      </div>`;
  }).join('');

  const body = `    <div class="trans-list auto-fit">${items}
    </div>`;

  return pageWrap({ stepNum: 5, headOpts, pageNum, body });
}

// ─────────────────────────────────────────────────────────────
// STEP 6 — 영문 배열 (jumble)
// ─────────────────────────────────────────────────────────────

function renderStep6({ wb, headOpts, pageNum }) {
  const items = wb.jumble.map(j => `
      <div class="jumble-item">
        <div class="ji-no">${j.no}.</div>
        <div>
          <div class="ji-words">[ ${j.words.map(esc).join(' <span class="sep">/</span> ')} ]</div>
          <div class="ji-ko">${esc(wb._refs?.[j.ref_sentence]?.ko || '')}</div>
          <div class="ji-answer-line"></div>
        </div>
      </div>`).join('');

  const body = `    <div class="jumble-list auto-fit">${items}
    </div>`;

  return pageWrap({ stepNum: 6, headOpts, pageNum, body });
}

// ─────────────────────────────────────────────────────────────
// STEP 7 — 통문장 영작 (한글 → 영문)
// ─────────────────────────────────────────────────────────────

function renderStep7({ data, wb, headOpts, pageNum }) {
  const items = wb.sentence_translation.map(t => {
    const ko = data.passage_ko[t.ref_sentence - 1] || '';
    return `
      <div class="trans-item">
        <div class="ti-no">${t.no}.</div>
        <div>
          <div class="ti-given ko">${esc(ko)}</div>
          <div class="ti-answer-line"></div>
        </div>
      </div>`;
  }).join('');

  const body = `    <div class="trans-list auto-fit">${items}
    </div>`;

  return pageWrap({ stepNum: 7, headOpts, pageNum, body });
}

// ─────────────────────────────────────────────────────────────
// STEP 8 — 종합 문제 (mixed)
// ─────────────────────────────────────────────────────────────

function renderStep8({ data, wb, headOpts, pageNum }) {
  const lookup = {
    grammar: id => wb.grammar_choice.find(x => x.no === id),
    vocab:   id => wb.vocab_choice.find(x => x.no === id),
    fill:    id => wb.fill_first_letter.find(x => x.no === id),
    ko:      id => wb.ko_translation.find(x => x.no === id),
    jumble:  id => wb.jumble.find(x => x.no === id),
    sent:    id => wb.sentence_translation.find(x => x.no === id),
  };

  const KIND_LABEL = {
    grammar: '어법', vocab: '어휘', fill: '빈칸',
    ko: '해석', jumble: '배열', sent: '영작'
  };

  const items = wb.mixed.map(m => {
    const src = lookup[m.kind](m.ref);
    if (!src) return '';
    const kindLabel = `<span class="alt" style="margin-right:8px;font-size:7.5pt;padding:1px 7px">${KIND_LABEL[m.kind]}</span>`;

    if (m.kind === 'grammar' || m.kind === 'vocab') {
      return `
      <div class="qa-item">
        <div class="qa-no">${m.no}.</div>
        <div class="qa-body">
          <div class="qa-en">${kindLabel}${renderChoiceTemplate(src.en_template)}</div>
          <div class="qa-ko">${esc(src.ko_full)}</div>
          <div class="qa-answer-line"></div>
        </div>
      </div>`;
    }
    if (m.kind === 'fill') {
      const sentEn = data.passage[src.ref_sentence - 1] || '';
      let rendered = esc(sentEn);
      src.hints.forEach((h, idx) => {
        const re = new RegExp(`\\b${h.answer}\\b`, 'i');
        rendered = rendered.replace(re, `<span class="first-hint"><span class="fh-num">${idx + 1})</span><span class="fh-letter">${h.letter}</span></span> <span class="blank-line short"></span>`);
      });
      return `
      <div class="qa-item">
        <div class="qa-no">${m.no}.</div>
        <div class="qa-body">
          <div class="qa-en">${kindLabel}${rendered}</div>
          <div class="qa-ko">${esc(src.ko_full)}</div>
          <div class="qa-answer-line"></div>
        </div>
      </div>`;
    }
    if (m.kind === 'ko') {
      const en = data.passage[src.ref_sentence - 1] || '';
      return `
      <div class="trans-item">
        <div class="ti-no">${m.no}.</div>
        <div>
          <div class="ti-given">${kindLabel}${esc(en)}</div>
          <div class="ti-answer-line"></div>
        </div>
      </div>`;
    }
    if (m.kind === 'jumble') {
      return `
      <div class="jumble-item">
        <div class="ji-no">${m.no}.</div>
        <div>
          <div class="qa-en" style="margin-bottom:6px">${kindLabel}</div>
          <div class="ji-words">[ ${src.words.map(esc).join(' <span class="sep">/</span> ')} ]</div>
          <div class="ji-answer-line"></div>
        </div>
      </div>`;
    }
    if (m.kind === 'sent') {
      const ko = data.passage_ko[src.ref_sentence - 1] || '';
      return `
      <div class="trans-item">
        <div class="ti-no">${m.no}.</div>
        <div>
          <div class="ti-given ko">${kindLabel}${esc(ko)}</div>
          <div class="ti-answer-line"></div>
        </div>
      </div>`;
    }
    return '';
  }).join('');

  const body = `    <div class="mixed-list auto-fit">${items}
    </div>`;

  return pageWrap({ stepNum: 8, headOpts, pageNum, body });
}

// ─────────────────────────────────────────────────────────────
// STEP 9 — 정답지
// ─────────────────────────────────────────────────────────────

function renderStep9({ data, wb, headOpts, pageNum }) {
  // 어법/어휘 정답 — 해설 생략(공간 절약), 정답만 표시
  const grammarAns = wb.grammar_choice.map(g =>
    `<div class="al-row"><div class="al-no">${g.no}</div><div class="al-body">${g.answers.map(a => `<span class="ans-hl">${esc(a)}</span>`).join(' / ')}</div></div>`
  ).join('');

  const vocabAns = wb.vocab_choice.map(g =>
    `<div class="al-row"><div class="al-no">${g.no}</div><div class="al-body">${g.answers.map(a => `<span class="ans-hl">${esc(a)}</span>`).join(' / ')}</div></div>`
  ).join('');

  const fillAns = wb.fill_first_letter.map(f =>
    `<div class="al-row"><div class="al-no">${f.no}</div><div class="al-body">${f.hints.map(h => `<span class="ans-hl">${esc(h.answer)}</span>`).join(' · ')}</div></div>`
  ).join('');

  // 한글 해석 정답
  const koAns = wb.ko_translation.map(t =>
    `<div class="al-row"><div class="al-no">${t.no}</div><div class="al-body">${esc(data.passage_ko[t.ref_sentence - 1])}</div></div>`
  ).join('');

  // 배열/영작 정답 — 영문 원문 그대로
  const jumbleAns = wb.jumble.map(j =>
    `<div class="al-row"><div class="al-no">${j.no}</div><div class="al-body"><span class="en">${esc(j.answer)}</span></div></div>`
  ).join('');

  const sentAns = wb.sentence_translation.map(t =>
    `<div class="al-row"><div class="al-no">${t.no}</div><div class="al-body"><span class="en">${esc(data.passage[t.ref_sentence - 1])}</span></div></div>`
  ).join('');

  // STEP 8 종합 문제 정답 — mixed 각 항목을 원 유형에서 조회해 정답 산출.
  const KIND_SHORT = { grammar: '어법', vocab: '어휘', fill: '빈칸', ko: '해석', jumble: '배열', sent: '영작' };
  const mixedAns = (wb.mixed || []).map(m => {
    let ans = '';
    if (m.kind === 'grammar') {
      const s = (wb.grammar_choice || []).find(x => x.no === m.ref);
      ans = s ? s.answers.map(a => `<span class="ans-hl">${esc(a)}</span>`).join(' / ') : '';
    } else if (m.kind === 'vocab') {
      const s = (wb.vocab_choice || []).find(x => x.no === m.ref);
      ans = s ? s.answers.map(a => `<span class="ans-hl">${esc(a)}</span>`).join(' / ') : '';
    } else if (m.kind === 'fill') {
      const s = (wb.fill_first_letter || []).find(x => x.no === m.ref);
      ans = s ? s.hints.map(h => `<span class="ans-hl">${esc(h.answer)}</span>`).join(' · ') : '';
    } else if (m.kind === 'ko') {
      const s = (wb.ko_translation || []).find(x => x.no === m.ref);
      ans = s ? esc(data.passage_ko[s.ref_sentence - 1] || '') : '';
    } else if (m.kind === 'jumble') {
      const s = (wb.jumble || []).find(x => x.no === m.ref);
      ans = s ? `<span class="en">${esc(s.answer)}</span>` : '';
    } else if (m.kind === 'sent') {
      const s = (wb.sentence_translation || []).find(x => x.no === m.ref);
      ans = s ? `<span class="en">${esc(data.passage[s.ref_sentence - 1] || '')}</span>` : '';
    }
    return `<div class="al-row"><div class="al-no">${m.no}</div><div class="al-body"><span class="alt" style="font-size:7pt;padding:0 6px;margin-right:6px">${KIND_SHORT[m.kind] || ''}</span>${ans}</div></div>`;
  }).join('');

  const body = `    <div class="answer-2col">
      <div class="answer-section">
        <div class="as-head">
          <span class="as-tag">STEP 2</span>
          <span class="as-title">어법 양자택일</span>
          <span class="as-sub">${wb.grammar_choice.length}문항</span>
        </div>
        <div class="answer-list">${grammarAns}</div>
      </div>

      <div class="answer-section">
        <div class="as-head">
          <span class="as-tag">STEP 3</span>
          <span class="as-title">어휘 양자택일</span>
          <span class="as-sub">${wb.vocab_choice.length}문항</span>
        </div>
        <div class="answer-list">${vocabAns}</div>
      </div>

      <div class="answer-section">
        <div class="as-head">
          <span class="as-tag">STEP 4</span>
          <span class="as-title">빈칸 첫글자 쓰기</span>
          <span class="as-sub">${wb.fill_first_letter.length}문항</span>
        </div>
        <div class="answer-list">${fillAns}</div>
      </div>

      <div class="answer-section">
        <div class="as-head">
          <span class="as-tag">STEP 5</span>
          <span class="as-title">한글 해석</span>
          <span class="as-sub">${wb.ko_translation.length}문항</span>
        </div>
        <div class="answer-list">${koAns}</div>
      </div>

      <div class="answer-section">
        <div class="as-head">
          <span class="as-tag">STEP 6</span>
          <span class="as-title">영문 배열</span>
          <span class="as-sub">${wb.jumble.length}문항</span>
        </div>
        <div class="answer-list">${jumbleAns}</div>
      </div>

      <div class="answer-section">
        <div class="as-head">
          <span class="as-tag">STEP 7</span>
          <span class="as-title">통문장 영작</span>
          <span class="as-sub">${wb.sentence_translation.length}문항</span>
        </div>
        <div class="answer-list">${sentAns}</div>
      </div>

      <div class="answer-section">
        <div class="as-head">
          <span class="as-tag">STEP 8</span>
          <span class="as-title">종합 문제</span>
          <span class="as-sub">${(wb.mixed || []).length}문항</span>
        </div>
        <div class="answer-list">${mixedAns}</div>
      </div>
    </div>`;

  return pageWrap({ stepNum: 9, headOpts, pageNum, body });
}

// ─────────────────────────────────────────────────────────────
// 문서 빌드
// ─────────────────────────────────────────────────────────────

// 어법/어휘/지칭 유형 원본 지문에 박힌 보기 표식 (a)~(e) 제거.
// 분석지(build.mjs)는 이 표식이 필요하지만 워크북 본문에는 깨끗한 문장이 들어가야 함.
// (사용자 결정 2026-06-06: 워크북은 전부 제거 = 깨끗한 본문)
function stripChoiceMarkers(s) {
  return String(s ?? '').replace(/\(\s*[a-e]\s*\)/g, '');
}

function buildHtml({ data, wb, cssHref = '../styles/workbook.css' }) {
  // 본문·해석에서 문제지 보기 표식 (a)~(e) 제거 (원본 객체는 보존, 얕은 복제)
  data = {
    ...data,
    passage: (data.passage || []).map(stripChoiceMarkers),
    passage_ko: (data.passage_ko || []).map(stripChoiceMarkers)
  };

  // 워크북 데이터의 표시 텍스트(en_template / ko_full / jumble)에서도 (a)~(e) 제거.
  // (어법·어휘·지칭 유형은 ko_full·en_template 에 표식이 섞여 들어옴 — 렌더 전 정제)
  const cleanField = (obj, key) => { if (obj && typeof obj[key] === 'string') obj[key] = stripChoiceMarkers(obj[key]); };
  for (const it of (wb.grammar_choice || [])) { cleanField(it, 'en_template'); cleanField(it, 'ko_full'); }
  for (const it of (wb.vocab_choice   || [])) { cleanField(it, 'en_template'); cleanField(it, 'ko_full'); }
  for (const it of (wb.fill_first_letter || [])) cleanField(it, 'ko_full');
  for (const it of (wb.jumble || [])) {
    cleanField(it, 'answer');
    if (Array.isArray(it.words)) it.words = it.words.map(stripChoiceMarkers);
  }

  // ── 정답 출제 품질 보정 (사용자 정책 2026-06-09) ──────────────────
  // 1) 고유명사는 어떤 유형에서도 정답으로 출제하지 않는다.
  // 2) STEP4 빈칸 첫글자는 너무 쉬운 기초 단어(bus/taxi 등)를 배제한다.
  // 3) STEP6/8 영문 배열은 단어 순서를 결정적으로 섞는다.
  const properNouns = buildProperNounSet(data);
  const qno = data.question_no || '';

  // STEP6 배열 — words 결정적 셔플 (시드: 회차+문항+문장번호)
  for (const it of (wb.jumble || [])) {
    if (Array.isArray(it.words)) {
      it.words = shuffleWords(it.words, `${data.exam || ''}|${qno}|j${it.ref_sentence ?? it.no}`);
    }
  }

  // STEP4 빈칸 — 고유명사·쉬운 단어를 정답에서 제외 (hints 필터링).
  // 필터 후 힌트가 0개가 되면, 원본에서 가장 긴 단어 1개는 남겨 빈칸이 비지 않게 함.
  for (const it of (wb.fill_first_letter || [])) {
    if (!Array.isArray(it.hints)) continue;
    const kept = it.hints.filter(h => {
      const bare = String(h.answer || '').toLowerCase().replace(/[^a-z'-]/g, '');
      if (properNouns.has(bare)) return false;
      if (isEasyWord(h.answer)) return false;
      return true;
    });
    if (kept.length === 0) {
      const best = it.hints
        .filter(h => !properNouns.has(String(h.answer || '').toLowerCase().replace(/[^a-z'-]/g, '')))
        .sort((a, b) => String(b.answer || '').length - String(a.answer || '').length)[0];
      it.hints = best ? [best] : [];
    } else {
      it.hints = kept;
    }
  }

  // STEP2/3 양자택일 — 정답이 고유명사인 문항은 제외 (예: 18번 #8 Trixie).
  const dropProperChoice = (arr) => (arr || []).filter(it => {
    const ans = (it.answers || []).map(a => String(a).toLowerCase().replace(/[^a-z'-]/g, ''));
    return !ans.some(a => properNouns.has(a));
  });
  wb.grammar_choice = dropProperChoice(wb.grammar_choice);
  wb.vocab_choice   = dropProperChoice(wb.vocab_choice);

  // 제외 후 no 재부여 (1..n 연속) — 표시 번호 정합성
  const renumber = (arr) => (arr || []).forEach((it, i) => { it.no = i + 1; });
  renumber(wb.grammar_choice);
  renumber(wb.vocab_choice);

  // mixed(STEP8)가 제거된 문항을 참조하면 정합성 깨짐 → 유효 참조만 유지하고 재번호.
  if (Array.isArray(wb.mixed)) {
    const validRef = {
      grammar: new Set((wb.grammar_choice || []).map(x => x.no)),
      vocab:   new Set((wb.vocab_choice   || []).map(x => x.no)),
      fill:    new Set((wb.fill_first_letter || []).filter(x => x.hints && x.hints.length).map(x => x.no)),
      ko:      new Set((wb.ko_translation || []).map(x => x.no)),
      jumble:  new Set((wb.jumble || []).map(x => x.no)),
      sent:    new Set((wb.sentence_translation || []).map(x => x.no)),
    };
    // 재번호 전에 mixed가 가리키던 grammar/vocab no는 이미 바뀌었을 수 있으나,
    // 본 데이터셋의 mixed.ref는 ref_sentence 기준이 아닌 no 기준이므로
    // 존재하지 않는 ref는 제외(품질 안전). 존재 항목만 통과.
    wb.mixed = wb.mixed.filter(m => validRef[m.kind] && validRef[m.kind].has(m.ref));
    wb.mixed.forEach((m, i) => { m.no = i + 1; });
  }

  // 교재용 표시 옵션을 이 문서 기준으로 갱신 (플래그 없으면 기존 동작).
  WB_OPT = {
    hideBrand:  !!data.hide_brand,
    hideHeadNo: !!data.hide_head_no,
  };

  const exam = data.exam || '';
  // exam 형식: "[2026] 3월 모의고사 2학년" → 학년 분리
  const gradeMatch = exam.match(/(\d학년)/);
  const grade = gradeMatch ? gradeMatch[1] : '';
  const examShort = exam.replace(/\s*\d학년\s*$/, '').trim();

  const headOpts = { exam: examShort, grade, qno: data.question_no, stepNum: 1 };

  // jumble의 ko 힌트 — 본문 한글 해석에서 가져옴
  wb._refs = {};
  wb.jumble.forEach(j => {
    wb._refs[j.ref_sentence] = { ko: data.passage_ko[j.ref_sentence - 1] || '' };
  });

  const pages = [
    renderStep1({ data, wb, headOpts: { ...headOpts, stepNum: 1 }, pageNum: 1 }),
    renderStep2({ wb,        headOpts: { ...headOpts, stepNum: 2 }, pageNum: 2 }),
    renderStep3({ wb,        headOpts: { ...headOpts, stepNum: 3 }, pageNum: 3 }),
    renderStep4({ data, wb, headOpts: { ...headOpts, stepNum: 4 }, pageNum: 4 }),
    renderStep5({ data, wb, headOpts: { ...headOpts, stepNum: 5 }, pageNum: 5 }),
    renderStep6({ wb,        headOpts: { ...headOpts, stepNum: 6 }, pageNum: 6 }),
    renderStep7({ data, wb, headOpts: { ...headOpts, stepNum: 7 }, pageNum: 7 }),
    renderStep8({ data, wb, headOpts: { ...headOpts, stepNum: 8 }, pageNum: 8 }),
    renderStep9({ data, wb, headOpts: { ...headOpts, stepNum: 9 }, pageNum: 9 })
  ];

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>${esc(exam)} · ${esc(data.question_no)}번 워크북 — Terra Nova</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="${cssHref}">
</head>
<body>

${pages.join('\n\n')}

</body>
</html>
`;
}

// ─────────────────────────────────────────────────────────────
// 측정 기반 페이지 분할 (v1.1 — 긴 지문 전용, 짧은 지문 동작 불변)
// ─────────────────────────────────────────────────────────────
//
// build.mjs 의 measureAndChunk 와 동일한 철학: puppeteer 로 각 항목의
// 실제 높이를 측정해 본문 가용 높이를 넘는 STEP 만 연속 페이지로 분할.
// 6~10문장 워크북은 모든 STEP 이 1페이지에 들어가므로 분할이 발생하지 않아
// v1.0 LOCKED 산출물과 100% 동일. 13·25문장 같은 긴 지문에서만 STEP 이
// "9 → 9 / 9-2" 식으로 늘어난다 (CSS 무수정, 동일 마크업 재사용).
//
// 동작:
//   - 각 .page 의 .page-body 안쪽 "리스트 컨테이너"(.qa-list/.trans-list/
//     .jumble-list/.mixed-list/.answer-2col)의 직계 항목 높이를 측정.
//   - step-banner + 가용 높이를 계산해 그리디로 항목을 페이지에 분배.
//   - 넘칠 때만 같은 헤더/배너로 연속 페이지 생성, 푸터 페이지번호 재계산.

async function paginateOverflow(html, stylesHref, distDir) {
  const puppeteer = (await import('puppeteer')).default;
  const cssAbsPath = wbCssAbs(distDir);
  let cssContent = '';
  try { cssContent = await fs.readFile(cssAbsPath, 'utf8'); } catch {}

  const tmpPath = path.join(process.cwd(), `.tmp-wb-measure-${process.pid}-${Math.abs(hashStr(html))}.html`);
  const measureDoc = html.replace(
    /<link rel="stylesheet"[^>]*>/,
    `<style>${cssContent}</style>`
  );
  await fs.writeFile(tmpPath, measureDoc, 'utf8');

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 794, height: 1123 });
  await page.goto('file://' + tmpPath.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });

  const plan = await page.evaluate(() => {
    const LIST_SEL = '.qa-list, .trans-list, .jumble-list, .mixed-list, .answer-2col';
    const outerH = (c) => {
      const r = c.getBoundingClientRect();
      const cs = getComputedStyle(c);
      return r.height + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom);
    };
    const pages = [...document.querySelectorAll('.page')];
    return pages.map((p, idx) => {
      const body = p.querySelector('.page-body');
      const banner = p.querySelector('.step-banner');
      const list = p.querySelector(LIST_SEL);
      const bodyH = body.getBoundingClientRect().height;
      const bannerH = banner ? outerH(banner) : 0;
      const avail = Math.floor(bodyH - bannerH - 8);
      let contentH = 0;
      [...body.children].forEach(c => { contentH += outerH(c); });
      const overflow = contentH > bodyH + 1;

      const isAnswer = list && list.classList.contains('answer-2col');
      // STEP 1 (passage page) 은 list 컨테이너가 없다 — 본문 블록을 분할 대상으로
      const isPassage = !list && body.querySelector('.passage-grid');

      let itemHeights = [];
      if (list) {
        itemHeights = [...list.children].map(outerH);
      } else if (isPassage) {
        // page-body 직계 블록들(passage-grid, voca-block, voca-2col)을 분할 단위로
        itemHeights = [...body.children]
          .filter(c => !c.classList.contains('step-banner'))
          .map(outerH);
      }
      return {
        idx, overflow, avail,
        listClass: list ? list.getAttribute('class') : null,
        isAnswer, isPassage, itemHeights
      };
    });
  });

  await browser.close();
  try { await fs.unlink(tmpPath); } catch {}

  // overflow 페이지가 없으면 원본 그대로 반환 (짧은 워크북 = 변경 없음)
  if (!plan.some(p => p.overflow)) return html;

  // ── 항목 단위로 페이지 분할 ──
  // 정규식으로 각 <section class="page" ...> ... </section> 추출
  const sectionRe = /<section class="page"[\s\S]*?<\/section>/g;
  const sections = html.match(sectionRe) || [];

  const GAP = 6;       // auto-fit 항목 간 최소 간격 추정(여유분)
  const COLS = 2;      // answer-2col 컬럼 수
  const SAFETY = 0.94; // 가용 높이 안전 계수 (auto-fit space-around 여백 흡수)
  /* NOTE (2026-08-16): STEP 1 페이지는 2페이지째가 30~60% 만 차는 경우가 있다.
   * 분할 단위가 passage-grid / voca-block / voca-2col 같은 '큰 덩어리'라
   * 마지막 블록이 통째로 안 들어가면 그대로 다음 장으로 밀리기 때문이다.
   * 두 가지를 시도했다가 모두 폐기했으니 다시 시도하지 말 것:
   *   ① SAFETY 를 0.995 로 상향 → L1/2 만 개선, 나머지 동일(블록이 안 들어가는 게
   *      원인이라 계수로는 해소 안 됨).
   *   ② voca-2col 을 좌/우 반쪽으로 쪼개 끼워넣기 → 채움률은 올랐으나 반쪽 높이를
   *      절반으로 근사한 탓에 L1/1·L1/5·L2/2 가 104~117% 로 **넘침**.
   * overflow 0 이 절대 조건이므로 여백을 남기는 현재 동작을 유지한다.
   * 정말 고치려면 반쪽 높이를 puppeteer 로 '실측'해야 한다(measureAndChunk 방식). */
  const newSections = [];

  // 항목 배열을 capacity 기준 그리디 분배
  function greedy(items, heights, capacity) {
    const groups = [];
    let cur = [], curH = 0;
    for (let k = 0; k < items.length; k++) {
      const h = heights[k];
      const addH = cur.length === 0 ? h : h + GAP;
      if (cur.length > 0 && curH + addH > capacity) { groups.push(cur); cur = []; curH = 0; }
      cur.push(items[k]);
      curH += (cur.length === 1 ? h : h + GAP);
    }
    if (cur.length) groups.push(cur);
    return groups;
  }
  function withContNote(head, gi) {
    if (gi === 0) return head;
    return head.replace(/(<span class="step-subtitle">[^<]*)(<\/span>)/,
      `$1 <span style="font-size:8pt;color:var(--c-muted)">(이어서 ${gi + 1})</span>$2`);
  }
  // CSS column-count:2 모사 — 섹션들을 순서대로 두 컬럼에 채울 때
  // 더 높은 컬럼의 높이를 추정 (col1 을 sum/2 직전까지 채우고 나머지 col2).
  function tallerColumnHeight(heights) {
    const total = heights.reduce((a, c) => a + c + GAP, 0);
    const half = total / 2;
    let col1 = 0, idx = 0;
    for (; idx < heights.length; idx++) {
      if (col1 + heights[idx] + GAP > half && col1 > 0) break;
      col1 += heights[idx] + GAP;
    }
    let col2 = 0;
    for (let k = idx; k < heights.length; k++) col2 += heights[k] + GAP;
    return Math.max(col1, col2);
  }
  // answer-2col 전용: 더 높은 컬럼이 avail 을 넘지 않도록 섹션을 페이지에 분배
  function greedyColumns(items, heights, avail) {
    const groups = [];
    let cur = [], curHs = [];
    for (let k = 0; k < items.length; k++) {
      const trial = [...curHs, heights[k]];
      if (curHs.length > 0 && tallerColumnHeight(trial) > avail) {
        groups.push(cur); cur = []; curHs = [];
      }
      cur.push(items[k]); curHs.push(heights[k]);
    }
    if (cur.length) groups.push(cur);
    return groups;
  }

  sections.forEach((sec, i) => {
    const info = plan[i];
    if (!info || !info.overflow) { newSections.push(sec); return; }

    // ── CASE A: STEP 1 passage 페이지 (리스트 컨테이너 없음) ──
    if (info.isPassage && !info.listClass) {
      // page-body 직계 블록(배너 제외)을 분할 단위로
      const pbOpenRe = /<div class="page-body">/;
      const pbm = sec.match(pbOpenRe);
      const footRe = /<footer class="page-foot">[\s\S]*?<\/footer>/;
      const fm = sec.match(footRe);
      if (!pbm || !fm) { newSections.push(sec); return; }
      const headTop = sec.slice(0, pbm.index + pbm[0].length); // <section..><header..><div page-body>
      const pbInner = sec.slice(pbm.index + pbm[0].length, sec.lastIndexOf('</div>', fm.index));
      const footer = fm[0];
      // 배너 분리
      const bannerRe = /<div class="step-banner">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
      // 배너는 3중 div — 안전하게 splitTopDivs 로 첫 블록 취득
      const blocks = splitTopDivs(pbInner, null);
      if (blocks.length < 2) { newSections.push(sec); return; }
      const banner = blocks[0];
      const contentBlocks = blocks.slice(1);
      if (contentBlocks.length !== info.itemHeights.length) { newSections.push(sec); return; }
      const cap = Math.floor(info.avail * SAFETY);
      const groups = greedy(contentBlocks, info.itemHeights, cap);
      const sectOpen = sec.slice(0, sec.indexOf('<header'));
      const header = sec.slice(sec.indexOf('<header'), sec.indexOf('<div class="page-body">'));
      groups.forEach((grp, gi) => {
        const head = withContNote(`${sectOpen}${header}<div class="page-body">\n${banner}\n`, gi);
        newSections.push(`${head}${grp.join('\n')}\n  </div>\n${footer}\n</section>`);
      });
      return;
    }

    if (!info.listClass) { newSections.push(sec); return; }

    // ── CASE B: 리스트 기반 STEP (2~9) ──
    const listOpenRe = new RegExp(`<div class="${escapeReg(info.listClass)}">`);
    const openMatch = sec.match(listOpenRe);
    if (!openMatch) { newSections.push(sec); return; }
    const listOpen = openMatch[0];
    const beforeList = sec.slice(0, openMatch.index);
    const afterOpenIdx = openMatch.index + listOpen.length;
    const listInnerAndRest = sec.slice(afterOpenIdx);
    const bodyCloseRe = /\s*<\/div>\s*<\/div>\s*<footer/;
    const bodyCloseMatch = listInnerAndRest.match(bodyCloseRe);
    if (!bodyCloseMatch) { newSections.push(sec); return; }
    const listInner = listInnerAndRest.slice(0, bodyCloseMatch.index);
    const tail = listInnerAndRest.slice(bodyCloseMatch.index);

    const items = splitTopDivs(listInner, null);
    if (items.length !== info.itemHeights.length) { newSections.push(sec); return; }

    // answer-2col 은 2단 컬럼 → 더 높은 컬럼이 avail 안에 들도록 컬럼 인지 분배.
    // 그 외 STEP 은 단일 컬럼 그리디.
    const groups = info.isAnswer
      ? greedyColumns(items, info.itemHeights, Math.floor(info.avail * SAFETY))
      : greedy(items, info.itemHeights, Math.floor(info.avail * SAFETY));

    groups.forEach((grp, gi) => {
      const head = withContNote(beforeList, gi);
      newSections.push(`${head}${listOpen}${grp.join('')}${tail}`);
    });
  });

  // 푸터 페이지 번호 재계산 (전체 순번)
  let pageNum = 0;
  const renumbered = newSections.map(sec => {
    pageNum += 1;
    return sec.replace(/<span class="pageno">\d+<\/span>/, `<span class="pageno">${pageNum}</span>`);
  });

  // 문서 재조립
  const firstSecIdx = html.indexOf(sections[0]);
  const docHead = html.slice(0, firstSecIdx);
  const lastSec = sections[sections.length - 1];
  const docTail = html.slice(html.indexOf(lastSec) + lastSec.length);
  return docHead + renumbered.join('\n\n') + docTail;
}

// 최상위 <div ...> 블록들을 균형 괄호로 분리
function splitTopDivs(htmlFrag, classHint) {
  const divs = [];
  let i = 0;
  const openTag = /<div\b[^>]*>/g;
  const s = htmlFrag;
  while (i < s.length) {
    openTag.lastIndex = i;
    const m = openTag.exec(s);
    if (!m) break;
    // 균형 맞는 닫기 찾기
    let depth = 0, j = m.index;
    const tagRe = /<\/?div\b[^>]*>/g;
    tagRe.lastIndex = m.index;
    let t;
    while ((t = tagRe.exec(s))) {
      if (t[0].startsWith('</')) { depth--; } else { depth++; }
      if (depth === 0) { j = tagRe.lastIndex; break; }
    }
    divs.push(s.slice(m.index, j));
    i = j;
  }
  return divs.filter(d => d.trim());
}

function escapeReg(str) { return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function hashStr(str) { let h = 0; for (let i = 0; i < str.length; i++) { h = (h * 31 + str.charCodeAt(i)) | 0; } return h; }

// ─────────────────────────────────────────────────────────────
// 메인
// ─────────────────────────────────────────────────────────────

async function main() {
  const argv = process.argv.slice(2);
  // --styles= 옵션은 위치 인자에서 제외 (data 가 L1/L2 처럼 중첩된 경우용)
  const stylesArg = argv.find(a => a.startsWith('--styles='));
  const pos = argv.filter(a => !a.startsWith('--'));
  const dataArg = pos[0];
  const distArg = pos[1];
  if (!dataArg) {
    console.error('Usage: node builder/build-workbook.mjs <data-dir> [<dist-dir>] [--styles=<css>]');
    process.exit(1);
  }
  const dataDir = path.resolve(process.cwd(), dataArg);
  const distDir = path.resolve(process.cwd(), distArg || path.join(dataArg, '..', 'dist'));
  // 기본값은 기존 규칙(<dist>/../styles/workbook.css) — 플래그 없으면 회귀 0
  if (stylesArg) WB_CSS_ABS = path.resolve(process.cwd(), stylesArg.slice('--styles='.length));

  await fs.mkdir(distDir, { recursive: true });

  // workbook json만 처리 (-workbook.json 접미사)
  const all = await fs.readdir(dataDir);
  const wbFiles = all.filter(f => /-workbook\.json$/.test(f)).sort();

  if (!wbFiles.length) {
    console.error(`No *-workbook.json files in ${dataDir}`);
    process.exit(1);
  }

  console.log(`📚 Building ${wbFiles.length} workbook(s)...`);

  const indexLinks = [];
  for (const wbFile of wbFiles) {
    const qno = wbFile.replace(/-workbook\.json$/, '');
    const dataFile = path.join(dataDir, `${qno}.json`);
    const wb   = JSON.parse(await fs.readFile(path.join(dataDir, wbFile), 'utf8'));
    const data = JSON.parse(await fs.readFile(dataFile, 'utf8'));

    let html = buildHtml({ data, wb, cssHref: wbCssHref(distDir) });
    // 긴 지문(STEP overflow)만 연속 페이지로 분할 — 짧은 워크북은 변화 없음
    try {
      html = await paginateOverflow(html, wbCssHref(distDir), distDir);
    } catch (err) {
      console.warn(`   ⚠️  paginate skipped for ${qno}: ${err.message}`);
    }
    const outName = `workbook-${qno}.html`;
    await fs.writeFile(path.join(distDir, outName), html, 'utf8');
    indexLinks.push(`<a href="${outName}">${esc(data.exam)} · ${esc(data.question_no)}번 워크북</a>`);
    console.log(`   ✓ ${wbFile}  →  ${outName}`);
  }

  // 인덱스 — 기존 index.html이 있으면 워크북 섹션만 병합/생성
  const indexPath = path.join(distDir, 'index.html');
  let existing = '';
  try { existing = await fs.readFile(indexPath, 'utf8'); } catch {}

  const wbSection = `<div class="index-wrap" data-section="workbook">
  <h1>📚 워크북</h1>
  ${indexLinks.join('\n  ')}
</div>`;

  if (existing && existing.includes('data-section="workbook"')) {
    // 기존 워크북 섹션 교체
    existing = existing.replace(/<div class="index-wrap" data-section="workbook">[\s\S]*?<\/div>/, wbSection);
  } else if (existing) {
    // 분석지 index 끝에 워크북 섹션 추가
    existing = existing.replace(/<\/body>/, `\n${wbSection}\n</body>`);
  } else {
    existing = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>Terra Nova 워크북</title><link rel="stylesheet" href="../styles/workbook.css"></head><body>\n${wbSection}\n</body></html>`;
  }
  await fs.writeFile(indexPath, existing, 'utf8');

  console.log('✅ Done.');
}

main().catch(err => { console.error(err); process.exit(1); });
