/* Terra Nova supplements renderer.
   URL params:
     ?type=answers   &month=YYYY-MM &passage=NN  [&startPage=N]
     ?type=wordbook  &month=YYYY-MM &scope=w1|w2|w3|w4   [&startPage=N]
     ?type=wordtest  &month=YYYY-MM &scope=w1|w2|w3|w4   [&startPage=N] [&key=1]
     ?type=wordpack  &month=YYYY-MM   (combined: W1..W4 wordbook + tests + 4 keys)
*/
const params = new URLSearchParams(location.search);
const type = params.get('type') || 'answers';
const month = params.get('month') || '2026-06';

const stage = document.getElementById('stage');

/* Apply per-month theme color tokens (defined in tokens.css under [data-month=...]) */
document.body.setAttribute('data-month', month);

/* ---------- helpers ---------- */
const esc = s => String(s ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const CIRCLED = ['①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩'];
function setText(r, slot, v) { const el = r.querySelector(`[data-slot="${slot}"]`); if (el) el.textContent = v ?? ''; }
function setHTML(r, slot, v) { const el = r.querySelector(`[data-slot="${slot}"]`); if (el) el.innerHTML = v ?? ''; }
async function fetchJSON(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error(`fetch failed: ${path}`);
  return r.json();
}
function passageDataPath(m, n) { return `content/passages/${m}/${n}.json`; }

/* Week → passage seqs */
function passagesForWeek(w) {
  const base = (w - 1) * 5 + 1;
  return Array.from({ length: 5 }, (_, i) => String(base + i).padStart(2, '0'));
}
function passagesForScope(scope) {
  const m = /^w([1-4])$/.exec(scope);
  if (m) return passagesForWeek(parseInt(m[1], 10));
  return Array.from({ length: 20 }, (_, i) => String(i + 1).padStart(2, '0'));
}
function scopeWeekNum(scope) {
  const m = /^w([1-4])$/.exec(scope);
  return m ? parseInt(m[1], 10) : null;
}

/* Page-side classifier: odd page = left-page, even page = right-page.
   Mirrors textbook convention in styles/layout.css. */
function applySide(root, pageNum) {
  root.classList.add(pageNum % 2 === 1 ? 'left-page' : 'right-page');
  setText(root, 'page-num', String(pageNum));
}

/* ============================================================= */
/*  ANSWERS — 2 questions per page, DAY NN identifier            */
/* ============================================================= */
function renderAnswerQuestion(a, q) {
  const isDescriptive = q?.type === 'school_descriptive';
  const correctIdx = a.correct;
  const stem = q?.stem || q?.prompt || '';
  // Preserve line breaks in stems — ordering & sentence-insertion questions
  // bundle the given paragraph and (A)/(B)/(C) blocks separated by \n in the source.
  const stemHtml = esc(stem).replace(/\n+/g, '<br>');

  let answerHTML;
  if (!isDescriptive) {
    answerHTML = `<div class="ans-correct">
      <span class="ans-correct-label">정답</span>
      <span class="ans-correct-circle">${CIRCLED[correctIdx] || '?'}</span>
      <span class="ans-correct-text">${esc(q?.choices?.[correctIdx] || '')}</span>
    </div>`;
  } else {
    answerHTML = `<div class="ans-model">
      <span class="ans-model-label">모범답안</span>
      <span class="ans-model-text">${esc(a.model_answer_en || '')}</span>
    </div>`;
  }

  const evidenceHTML = `<div class="ans-block">
    <div class="ans-block-h">정답 근거</div>
    <div class="ans-block-body">${esc(a.evidence || '')}</div>
  </div>`;

  const rationalesHTML = (a.rationales || []).map((r, idx) => {
    const mark = !isDescriptive ? CIRCLED[idx] : `(${['A','B'][idx] || String(idx + 1)})`;
    const isAnswer = !isDescriptive && idx === correctIdx;
    return `<li class="rationale${isAnswer ? ' is-correct' : ''}">
      <span class="rationale-mark">${mark}</span>
      <span class="rationale-body">${esc(r)}</span>
    </li>`;
  }).join('');
  const rationalesBlock = `<div class="ans-block">
    <div class="ans-block-h">${isDescriptive ? '빈칸 풀이' : '선지 분석'}</div>
    <ol class="ans-rationale-list">${rationalesHTML}</ol>
  </div>`;

  return `<div class="ans-q">
    <h2 class="ans-q-title">
      <span class="ans-q-num">Q${a.q_index + 1}.</span>
      <span class="ans-q-style">${esc(a.q_style || q?.style || '')}</span>
      <span class="ans-q-stem">${stemHtml}</span>
    </h2>
    ${answerHTML}
    ${evidenceHTML}
    ${rationalesBlock}
  </div>`;
}

async function renderAnswers(opts = {}) {
  const seq = (opts.passage || params.get('passage') || '01').padStart(2, '0');
  const startPage = opts.startPage ?? parseInt(params.get('startPage') || '1', 10);
  const data = await fetchJSON(passageDataPath(month, seq));
  const ans = data.answers?.explanations || [];
  const questions = data.page2?.questions || [];
  const unitClean = data.meta.linked_unit.replace(/^[IVX]+(-\d+)?\s+/, '').replace(/^\d+(-\d+)?\s+/, '');
  const dayLabel = `DAY ${String(data.meta.sequence).padStart(2, '0')}`;

  const tpl = document.getElementById('tpl-answer-page');

  // All 4 questions on a single page (DAY = 1 page)
  const frag = tpl.content.cloneNode(true);
  const root = frag.querySelector('.page');
  applySide(root, startPage);

  setHTML(root, 'chapter-tag', esc(unitClean));
  setText(root, 'subject', data.meta.subject);
  setHTML(root, 'part', esc(data.meta.part_ko));
  setText(root, 'seq', `${dayLabel} · ${data.meta.month}`);
  setText(root, 'foot-day', dayLabel);

  const html = ans.map(a => renderAnswerQuestion(a, questions[a.q_index])).join('');
  setHTML(root, 'pair', html);

  stage.appendChild(frag);
  return 1;
}

/* ============================================================= */
/*  WORDBOOK                                                     */
/* ============================================================= */
async function renderWordbook(opts = {}) {
  const scope = opts.scope || params.get('scope') || 'w1';
  const startPage = opts.startPage ?? parseInt(params.get('startPage') || '1', 10);
  const seqs = passagesForScope(scope);
  const datas = await Promise.all(seqs.map(n => fetchJSON(passageDataPath(month, n))));

  const allRows = [];
  datas.forEach(d => d.page4.vocab.forEach(v => allRows.push({ ...v, seq: d.meta.sequence })));

  const ROWS_PER_PAGE = 30;
  const tpl = document.getElementById('tpl-wordbook-page');
  const totalPages = Math.ceil(allRows.length / ROWS_PER_PAGE);

  for (let p = 0; p < totalPages; p++) {
    const pageRows = allRows.slice(p * ROWS_PER_PAGE, (p + 1) * ROWS_PER_PAGE);
    const pageNum = startPage + p;
    const frag = tpl.content.cloneNode(true);
    const root = frag.querySelector('.page');
    applySide(root, pageNum);
    setText(root, 'scope-label', scopeLabelText(scope));

    const rowsHTML = pageRows.map((v, i) => {
      const n = p * ROWS_PER_PAGE + i + 1;
      const syns = (v.synonyms || []).join(', ');
      const ants = (v.antonyms || []).join(', ');
      const synAntHtml = [
        syns ? `<span class="syn">≈ ${esc(syns)}</span>` : '',
        ants ? `<span class="ant">↔ ${esc(ants)}</span>` : ''
      ].filter(Boolean).join(' ');
      return `<tr>
        <td class="col-n">${n}</td>
        <td class="col-w"><span class="wb-word">${esc(v.word)}</span></td>
        <td class="col-p">${esc(v.pos)}</td>
        <td class="col-m">${esc(v.meaning_ko)}</td>
        <td class="col-s">${synAntHtml || '<span class="muted">—</span>'}</td>
      </tr>`;
    }).join('');
    setHTML(root, 'rows', rowsHTML);
    stage.appendChild(frag);
  }

  return totalPages;
}

function scopeLabelText(scope) {
  const w = scopeWeekNum(scope);
  return w ? `WEEK ${w}` : 'MONTH';
}

/* ============================================================= */
/*  WORDTEST                                                     */
/* ============================================================= */
function buildTestData(scope, datas) {
  // Part A: ALL 60 words for the week (12 × 5 passages) — 뜻쓰기, 1점
  // Part B: 20 vocabulary blank-fill multiple choice questions, distractors from same passage's 12-word pool, 1점
  const rng = seedRng(`${month}-${scope}`);
  const partA = [];
  const partB = [];

  // Part A: every word, in passage order
  datas.forEach(d => {
    d.page4.vocab.forEach(v => partA.push({ word: v.word, pos: v.pos, meaning_ko: v.meaning_ko }));
  });

  // Part B: pick 4 questions per passage (5 passages × 4 = 20)
  datas.forEach(d => {
    const vocab = d.page4.vocab;
    const candIdxs = pickIndices(vocab.length, 4, rng);
    candIdxs.forEach(i => {
      const v = vocab[i];
      const exampleWithWord = (v.examples || []).find(e => containsWord(e.en, v.word)) || v.examples?.[0];
      if (!exampleWithWord) return;
      const blanked = blankOutWord(exampleWithWord.en, v.word);
      const distractorIdxs = pickIndices(vocab.length, 3, rng, new Set([i]));
      const choices = [v.word, ...distractorIdxs.map(j => vocab[j].word)];
      shuffleInPlace(choices, rng);
      partB.push({
        sentence: blanked,
        choices,
        correct: choices.indexOf(v.word)
      });
    });
  });

  return { partA, partB };
}

async function renderWordtest(opts = {}) {
  const scope = opts.scope || params.get('scope') || 'w1';
  const startPage = opts.startPage ?? parseInt(params.get('startPage') || '1', 10);
  const showKey = opts.key ?? params.get('key') === '1';
  const seqs = passagesForScope(scope);
  const datas = await Promise.all(seqs.map(n => fetchJSON(passageDataPath(month, n))));
  const { partA, partB } = buildTestData(scope, datas);
  const totalScore = partA.length + partB.length;     // 60 + 20 = 80, 1 pt each
  const scopeText = scopeLabelText(scope);

  if (showKey) {
    return renderKeyPage(scope, partA, partB, startPage);
  }

  let pages = 0;
  // Part A — 1 page (60 entries, 3-col × 20-row)
  {
    const tpl = document.getElementById('tpl-wordtest-partA');
    const frag = tpl.content.cloneNode(true);
    const root = frag.querySelector('.page');
    const pageNum = startPage + pages++;
    applySide(root, pageNum);
    setText(root, 'scope-label', scopeText);
    setText(root, 'scope-full', `${scopeText} — Passages ${seqs[0]} ~ ${seqs[seqs.length - 1]}`);
    setText(root, 'total-score', String(totalScore));

    const partAHtml = partA.map((q, i) => `<li>
      <span class="wt-n">${i + 1}.</span>
      <span class="wt-word"><b>${esc(q.word)}</b></span>
      <span class="wt-answer-line"></span>
    </li>`).join('');
    setHTML(root, 'partA', partAHtml);
    stage.appendChild(frag);
  }

  // Part B — 1 page (20 questions, 2-col × 10-row)
  {
    const tpl = document.getElementById('tpl-wordtest-partB');
    const frag = tpl.content.cloneNode(true);
    const root = frag.querySelector('.page');
    const pageNum = startPage + pages++;
    applySide(root, pageNum);
    setText(root, 'scope-label', scopeText);

    const partBHtml = partB.map((q, i) => `<li>
      <div class="wt-b-stem"><span class="wt-n">${i + 1}.</span> ${esc(q.sentence)}</div>
      <ol class="wt-b-choices">
        ${q.choices.map((c, k) => `<li><span class="wt-b-mark">${CIRCLED[k]}</span> ${esc(c)}</li>`).join('')}
      </ol>
    </li>`).join('');
    setHTML(root, 'partB', partBHtml);
    stage.appendChild(frag);
  }

  return pages;
}

function renderKeyPage(scope, partA, partB, startPage) {
  const tpl = document.getElementById('tpl-wordtest-key');
  const frag = tpl.content.cloneNode(true);
  const root = frag.querySelector('.page');
  applySide(root, startPage);
  setText(root, 'scope-label', `${scopeLabelText(scope)} · KEY`);

  const keyAHtml = partA.map((q, i) =>
    `<li>
      <span class="k-n">${i + 1}.</span>
      <span class="k-word">${esc(q.word)}</span>
      <span class="k-meaning">${esc(q.meaning_ko)}</span>
    </li>`
  ).join('');
  setHTML(root, 'keyA', keyAHtml);

  const keyBHtml = partB.map((q, i) =>
    `<li>
      <span class="k-n">${i + 1}.</span>
      <span class="k-circ">${CIRCLED[q.correct]}</span>
      <b>${esc(q.choices[q.correct])}</b>
    </li>`
  ).join('');
  setHTML(root, 'keyB', keyBHtml);

  stage.appendChild(frag);
  return 1;
}

/* Helpers for word-fill */
function containsWord(sentence, word) {
  const w = word.toLowerCase();
  const re = new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(s|es|ed|d|ing|ly)?\\b`, 'i');
  return re.test(sentence);
}
const WT_BLANK = '<span class="wt-b-blank">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>';
function blankOutWord(sentence, word) {
  const re = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(s|es|ed|d|ing|ly)?\\b`, 'i');
  // Replace with a literal placeholder; renderAnswerQuestion's esc() pipeline isn't used here,
  // because the stem text is escaped first then we re-inject the underline span.
  return sentence.replace(re, '__WTBLANK__');
}

/* Override Part B sentence escaping to inject underline span */
function escapeStemWithBlank(sentence) {
  return esc(sentence).replace('__WTBLANK__', WT_BLANK);
}

/* Patch the Part B rendering to use escapeStemWithBlank instead of esc() for the stem.
   Done via a re-defined function below. */

/* Deterministic RNG */
function seedRng(seed) {
  let h = 2166136261;
  for (const c of seed) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return () => {
    h += 0x6D2B79F5; let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function pickIndices(n, k, rng, exclude = new Set()) {
  const pool = [];
  for (let i = 0; i < n; i++) if (!exclude.has(i)) pool.push(i);
  shuffleInPlace(pool, rng);
  return pool.slice(0, k).sort((a, b) => a - b);
}
function shuffleInPlace(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/* ============================================================= */
/*  WORDPACK — combined sequence: W1..W4 (book + test) + 4 keys  */
/*  Accepts optional startPage so it can be embedded in a larger */
/*  book (e.g. starting at page 111).                            */
/* ============================================================= */
async function renderWordpack(opts = {}) {
  let nextPage = opts.startPage ?? parseInt(params.get('startPage') || '1', 10);
  for (let w = 1; w <= 4; w++) {
    const scope = `w${w}`;
    nextPage += await renderWordbook({ scope, startPage: nextPage });
    nextPage += await renderWordtest({ scope, startPage: nextPage });
  }
  for (let w = 1; w <= 4; w++) {
    const scope = `w${w}`;
    const seqs = passagesForScope(scope);
    const datas = await Promise.all(seqs.map(n => fetchJSON(passageDataPath(month, n))));
    const { partA, partB } = buildTestData(scope, datas);
    nextPage += renderKeyPage(scope, partA, partB, nextPage);
  }
}

/* ============================================================= */
/*  SECTION DIVIDER — interleaf page                              */
/*    URL: ?type=divider&which=answers|wordbook&startPage=N       */
/* ============================================================= */
const DIVIDER_PRESETS = {
  answers:  { titleEn: 'Answers',  titleKo: '정답·해설' },
  wordbook: { titleEn: 'Wordbook', titleKo: '단어장 · 시험지 · 정답' }
};

function renderDivider(which, startPage) {
  const preset = DIVIDER_PRESETS[which];
  if (!preset) throw new Error(`unknown divider: ${which}`);
  const tpl = document.getElementById('tpl-divider');
  const frag = tpl.content.cloneNode(true);
  const [leftPage, rightPage] = frag.querySelectorAll('.page');

  applySide(leftPage,  startPage);       // odd → left-page class
  applySide(rightPage, startPage + 1);   // even → right-page class
  setText(leftPage, 'title-en', preset.titleEn);
  setText(leftPage, 'title-ko', preset.titleKo);

  stage.appendChild(frag);
  return 2;   // two pages produced (spread)
}

/* ============================================================= */
/*  ANSWERS-ALL — every passage's answer page, in sequence       */
/*  Each DAY = 1 page; numbered from startPage upward.           */
/* ============================================================= */
async function renderAnswersAll(opts = {}) {
  const startPage = opts.startPage ?? parseInt(params.get('startPage') || '1', 10);
  const seqs = Array.from({ length: 20 }, (_, i) => String(i + 1).padStart(2, '0'));
  for (let i = 0; i < seqs.length; i++) {
    const seq = seqs[i];
    try {
      await renderAnswers({ passage: seq, startPage: startPage + i });
    } catch (e) {
      console.warn(`skipping ${seq}: ${e.message}`);
    }
  }
}

/* ---------- dispatch ---------- */
(async () => {
  try {
    if (type === 'answers') await renderAnswers();
    else if (type === 'answers-all') await renderAnswersAll();
    else if (type === 'wordbook') await renderWordbook();
    else if (type === 'wordtest') await renderWordtest();
    else if (type === 'wordpack') await renderWordpack();
    else if (type === 'divider') {
      const which = params.get('which') || 'answers';
      const startPage = parseInt(params.get('startPage') || '1', 10);
      renderDivider(which, startPage);
    }
    else stage.innerHTML = `<pre>Unknown type: ${type}</pre>`;
    // Post-render: replace __WTBLANK__ tokens with underline spans inside Part B stems.
    document.querySelectorAll('.wt-b-stem').forEach(el => {
      el.innerHTML = el.innerHTML.replace(/__WTBLANK__/g, WT_BLANK);
    });
  } catch (e) {
    stage.innerHTML = `<pre>Error: ${e.message}</pre>`;
    console.error(e);
  }
})();
