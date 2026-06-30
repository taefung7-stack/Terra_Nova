import { resolveContent, passagePath, applyLevelTheme } from './level-content.js';

const params = new URLSearchParams(location.search);
const month = params.get('month') || '2026-06';
const passage = params.get('passage') || '01';

/* Book page number of passage page 1.
   If the URL provides ?startPage=N, use that; otherwise compute from the
   passage sequence using the same formula as cover-render.js.
   Book layout: TOC = 2, each week = 2 divider + 5×4 passages = 22 pages. */
function computeStartPage(seqStr) {
  const n = parseInt(seqStr, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  const w = Math.ceil(n / 5);
  const before = 4 + (w - 1) * 22;
  const inWeekIdx = (n - 1) % 5;
  return before + inWeekIdx * 4 + 1;
}
const startPage = parseInt(params.get('startPage') || String(computeStartPage(passage)), 10);

const stage = document.getElementById('stage');
const tpl = document.getElementById('tpl-passage');

/* ---------- Slot helpers ---------- */
function setText(root, slot, value) {
  const el = root.querySelector(`[data-slot="${slot}"]`);
  if (!el) return;
  el.textContent = value ?? '';
}
function setHTML(root, slot, html) {
  const el = root.querySelector(`[data-slot="${slot}"]`);
  if (!el) return;
  el.innerHTML = html ?? '';
}
function setAttr(root, slot, attr, value) {
  const el = root.querySelector(`[data-slot="${slot}"]`);
  if (!el) return;
  el.setAttribute(attr, value ?? '');
}

function escapeHTML(s) {
  return String(s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/* Allow a small whitelist of markup in body/stems so authors can mark underlines and blanks.
   After escapeHTML, we re-enable:
     &lt;u&gt;text&lt;/u&gt;      → <u>text</u>
     &lt;blank&gt;               → <span class="blank"></span>
     &lt;mark&gt;text&lt;/mark&gt; → <mark>text</mark>
*/
function allowMarkup(escaped) {
  return escaped
    .replaceAll('&lt;u&gt;', '<u>').replaceAll('&lt;/u&gt;', '</u>')
    .replaceAll('&lt;mark&gt;', '<mark>').replaceAll('&lt;/mark&gt;', '</mark>')
    .replaceAll('&lt;blank&gt;', '<span class="blank"></span>')
    .replaceAll('&lt;/blank&gt;', '');
}

function renderParagraphs(text) {
  const safe = allowMarkup(escapeHTML(text));
  return safe.split(/\n\s*\n/).map(p => `<p>${p.trim().replace(/\n/g, '<br/>')}</p>`).join('');
}

function renderRichInline(text) {
  return allowMarkup(escapeHTML(text));
}

/* Summary-template blanks: turn "<blank> (A)" / "<blank> (B)" into a single
   centered, underlined fill-in box that carries the (A)/(B) label INSIDE it.
   Without this the label drifts to one side and there is no line to write on.
   Runs AFTER allowMarkup has produced <span class="blank"></span>; we then
   merge each blank-span with the trailing "(X)" label. Falls back to a plain
   labelled blank for any leftover <blank> with no following label. */
function renderSummaryTemplate(text) {
  let html = renderRichInline(text);
  // <span class="blank"></span> optionally followed by whitespace then (A)/(B)/(C)…
  html = html.replace(
    /<span class="blank"><\/span>\s*\(([A-Z])\)/g,
    (_, lab) => `<span class="sum-blank"><span class="sum-lab">${lab}</span></span>`
  );
  // any remaining bare blank → labelless fill box
  html = html.replace(/<span class="blank"><\/span>/g, '<span class="sum-blank"></span>');
  return html;
}

const TERM_ALIASES = {
  'chemical changes': 'chemical change',
  'culture zones': 'culture zone',
  'media': 'medium',
  'top predators': 'top predator',
  'sounds': 'sound',
  'rational choice': 'rational choice'
};

const TERM_MEANINGS = {
  'carbon': '탄소',
  'rna': 'RNA, 리보핵산',
  'hydrogen bond': '수소 결합',
  'normal distribution': '정규분포',
  'digital divide': '디지털 격차',
  'le chatelier s principle': '르샤틀리에 원리',
  'le chatelier principle': '르샤틀리에 원리',
  'oxidation reduction': '산화-환원',
  'crispr cas9': '크리스퍼-Cas9',
  'photoelectric effect': '광전 효과',
  'nucleus': '핵',
  'cell wall': '세포벽',
  'chloroplast': '엽록체',
  'earthquake': '지진',
  'ulysses': '『율리시스』',
  'stream of consciousness': '의식의 흐름',
  'basic rights': '기본권',
  'top predator': '최상위 포식자',
  'rational choice': '합리적 선택'
};
const MAX_PAGE1_GLOSSARY_TERMS = 4;

function normalizeTerm(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/<\/?[^>]+>/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function singularTerm(text) {
  const words = normalizeTerm(text).split(' ').filter(Boolean);
  if (!words.length) return '';
  const last = words[words.length - 1];
  if (last.endsWith('ies') && last.length > 4) words[words.length - 1] = `${last.slice(0, -3)}y`;
  else if (last.endsWith('es') && last.length > 3) words[words.length - 1] = last.slice(0, -2);
  else if (last.endsWith('s') && last.length > 3) words[words.length - 1] = last.slice(0, -1);
  return words.join(' ');
}

function findTermMeaning(term, vocab) {
  const rawKey = normalizeTerm(term);
  const alias = TERM_ALIASES[rawKey] || rawKey;
  const keys = [rawKey, alias, singularTerm(rawKey), singularTerm(alias)].filter(Boolean);
  for (const key of keys) {
    if (TERM_MEANINGS[key]) return { key, meaning: TERM_MEANINGS[key] };
  }

  const entries = (vocab || []).map(v => ({
    key: normalizeTerm(v.word),
    singular: singularTerm(v.word),
    meaning: v.meaning_ko
  }));
  for (const key of keys) {
    const exact = entries.find(v => v.key === key || v.singular === key);
    if (exact) return { key: exact.key, meaning: exact.meaning };
  }
  for (const key of keys) {
    const partial = entries.find(v => key.includes(v.key) || key.includes(v.singular));
    if (partial && partial.key.length >= 5) return { key: partial.key, meaning: partial.meaning };
  }
  return null;
}

function renderPage1Glossary(data) {
  const body = data.page1?.body || '';
  const markedTerms = [...body.matchAll(/<(u|mark)>(.*?)<\/\1>/g)].map(m => m[2]);
  const seen = new Set();
  const notes = [];
  // Author-supplied glosses come FIRST: page1.gloss_extra = [{ term, ko }, ...].
  // These are the curated "difficult / technical word" notes. Putting them ahead of
  // the auto-detected <u>/<mark> terms guarantees the hard words win the limited
  // slots, so easy auto-marked words (e.g. proper nouns highlighted in the body for
  // emphasis) never crowd them out.
  for (const extra of (data.page1?.gloss_extra || [])) {
    if (notes.length >= MAX_PAGE1_GLOSSARY_TERMS) break;
    const term = extra?.term;
    const meaning = extra?.ko;
    if (!term || !meaning) continue;
    const key = normalizeTerm(term);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    notes.push({ term, meaning });
  }
  // Then top up from auto-detected <u>/<mark> terms (deduped) until the cap.
  for (const term of markedTerms) {
    if (notes.length >= MAX_PAGE1_GLOSSARY_TERMS) break;
    const found = findTermMeaning(term, data.page4?.vocab || []);
    if (!found || seen.has(found.key)) continue;
    seen.add(found.key);
    notes.push({ term, meaning: found.meaning });
  }
  if (!notes.length) return '';
  return notes.map(n => `<span class="term-note"><span class="term">${escapeHTML(n.term)}</span>: <span class="meaning">${escapeHTML(n.meaning)}</span></span>`).join('');
}

/* ---------- Page 2: Questions ---------- */
function renderQuestions(list) {
  return list.map((q, i) => {
    const qNum = `Q${i + 1}.`;
    if (q.type === 'mock_objective') {
      const styleTag = q.style ? `<span class="q-style">${escapeHTML(q.style)}</span>` : '';
      const choices = q.choices.map(c => `<li>${renderRichInline(c)}</li>`).join('');
      return `<div class="question mock">
        <div class="stem">
          <span class="q-num">${qNum}</span>
          <span class="stem-rest">${styleTag}${renderRichInline(q.stem)}</span>
        </div>
        <ol class="choices">${choices}</ol>
      </div>`;
    }
    // school_descriptive
    const styleTag = q.style ? `<span class="q-style">${escapeHTML(q.style)}</span>` : '';
    const hints = (q.hints && q.hints.length)
      ? `<div class="hints">${q.hints.map(h => `<span class="hint">${escapeHTML(h)}</span>`).join('')}</div>`
      : '';
    const template = q.summary_template
      ? `<div class="summary-template">${renderSummaryTemplate(q.summary_template)}</div>`
      : '';
    return `<div class="question descriptive">
      <div class="stem">
        <span class="q-num">${qNum}</span>
        <span class="stem-rest">${styleTag}${renderRichInline(q.prompt)}</span>
      </div>
      ${template}
      ${hints}
      <div class="answer-slot" aria-hidden="true"></div>
    </div>`;
  }).join('');
}

/* ---------- Page 2: Tieback tags + visual aid ---------- */
function renderTags(tags) {
  return tags.map(t => `<span class="tag">#${escapeHTML(t)}</span>`).join('');
}

function renderVisualAid(va) {
  if (!va) return '';
  const type = va.type;
  const safeTitle = escapeHTML(va.title || '');
  if (type === 'emoji_flow' || type === 'timeline') {
    const parts = [];
    va.steps.forEach((s, i) => {
      parts.push(
        `<div class="va-step">
          <span class="va-emoji">${escapeHTML(s.emoji)}</span>
          <span class="va-label">${escapeHTML(s.label || '')}</span>
          ${s.note ? `<span class="va-note">${escapeHTML(s.note)}</span>` : ''}
        </div>`
      );
      if (i < va.steps.length - 1) {
        parts.push(`<span class="va-arrow">➜</span>`);
      }
    });
    return `<div class="visual-aid ${type}">
      <div class="va-title">🧭 ${safeTitle}</div>
      <div class="va-steps">${parts.join('')}</div>
    </div>`;
  }
  if (type === 'compare') {
    const cells = va.steps.map(s =>
      `<div class="va-step">
        <div class="va-emoji">${escapeHTML(s.emoji)}</div>
        <div class="va-label">${escapeHTML(s.label || '')}</div>
        ${s.note ? `<div class="va-note">${escapeHTML(s.note)}</div>` : ''}
      </div>`
    ).join('');
    return `<div class="visual-aid compare">
      <div class="va-title">⚖️ ${safeTitle}</div>
      <div class="va-steps">${cells}</div>
    </div>`;
  }
  if (type === 'mindmap') {
    const cells = va.steps.map(s =>
      `<div class="va-step"><span class="va-emoji">${escapeHTML(s.emoji)}</span> <strong>${escapeHTML(s.label || '')}</strong>${s.note ? ` — ${escapeHTML(s.note)}` : ''}</div>`
    ).join('');
    return `<div class="visual-aid mindmap">
      <div class="va-title">🧠 ${safeTitle}</div>
      <div class="va-steps">${cells}</div>
    </div>`;
  }
  return '';
}

/* ---------- Page 3: Sentences ---------- */
const ROLE_TAG = { S: 'S', V: 'V', O: 'O', C: 'C', M: 'M', CONJ: '접', REL: '관', '': '' };

function renderSegment(seg) {
  const role = seg.role || '';
  const tag = ROLE_TAG[role] || '';
  const tagHtml = tag ? `<span class="seg-tag">${tag}</span>` : '';
  const safeText = renderRichInline(seg.text);
  if (seg.note) {
    // Render per-segment grammar note as ruby under the segment.
    // The note is wrapped in <span class="rt-note"> with display:inline-block
    // so Chromium treats it as one indivisible annotation block instead of
    // splitting the note words across the rb word boundaries.
    return `<span class="seg" data-role="${role}"><ruby><rb>${safeText}${tagHtml}</rb><rt><span class="rt-note">${escapeHTML(seg.note)}</span></rt></ruby></span>`;
  }
  return `<span class="seg" data-role="${role}">${safeText}${tagHtml}</span>`;
}

/* Parse the combined translation_ko ("[1] ... [2] ... [n] ...") into a
   { sentenceIndex -> 한국어 한 문장 } map. The combined string already carries
   per-sentence [n] markers, so we split on them and reuse the text verbatim —
   no data rewrite needed. Returns a Map keyed by integer sentence index. */
function parseTranslationByIndex(text) {
  const map = new Map();
  const src = String(text ?? '');
  const re = /\[(\d+)\]\s*([\s\S]*?)(?=\s*\[\d+\]|$)/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const idx = parseInt(m[1], 10);
    const ko = m[2].trim();
    if (Number.isFinite(idx) && ko) map.set(idx, ko);
  }
  return map;
}

function renderSentences(list, translationMap) {
  const missing = [];
  const html = list.map(s => {
    const segs = s.segments.map(renderSegment).join(' ');
    const ko = translationMap.get(s.index);
    if (!ko) missing.push(s.index);
    const koRow = ko
      ? `<div class="ko-row"><span class="ko-text">${escapeHTML(ko)}</span></div>`
      : '';
    return `<div class="p3-sentence">
      <div class="en-row"><span class="num">[${s.index}]</span>${segs}</div>
      ${koRow}
    </div>`;
  }).join('');
  if (missing.length) {
    console.warn('[render] page3 인라인 해석 누락 문장:', missing.join(', '),
      `(문장 ${list.length}개 vs 해석 ${translationMap.size}개 — translation_ko의 [n] 마커 확인)`);
  }
  return html;
}

/* ---------- Page 4: Vocab ---------- */
function renderVocab(list) {
  return list.map(v => {
    const syn = v.synonyms && v.synonyms.length ? `<span class="syn-ant-label sa-syn"><span class="sa-sym">=</span>동의어</span>${v.synonyms.map(escapeHTML).join(', ')}` : '';
    const ant = v.antonyms && v.antonyms.length ? `<span class="syn-ant-label sa-ant"><span class="sa-sym">&ne;</span>반의어</span>${v.antonyms.map(escapeHTML).join(', ')}` : '';
    const synAnt = [syn, ant].filter(Boolean).join(' &nbsp;·&nbsp; ');
    const examples = (v.examples || []).map(ex =>
      `<div class="example-item">
        <div class="en">📘 ${escapeHTML(ex.en)}</div>
        <div class="ko">${escapeHTML(ex.ko)}</div>
      </div>`
    ).join('');
    return `<div class="vocab-card">
      <div class="head">
        <div class="word-block">
          <span class="word">${escapeHTML(v.word)}</span>
          <span class="pos">${escapeHTML(v.pos)}</span>
        </div>
      </div>
      <div class="meaning">${escapeHTML(v.meaning_ko)}</div>
      ${synAnt ? `<div class="syn-ant">${synAnt}</div>` : ''}
      <div class="examples">${examples}</div>
    </div>`;
  }).join('');
}

/* ---------- Overflow detection ---------- */
function detectOverflow(root) {
  root.querySelectorAll('.page').forEach(p => {
    const body = p.querySelector('.page-body');
    const target = body || p;
    const overflowBy = target.scrollHeight - target.clientHeight;
    if (overflowBy > 2) {
      p.classList.add('overflow');
      const warn = document.createElement('div');
      warn.className = 'overflow-warning';
      warn.textContent = `OVERFLOW p${p.dataset.page} (+${overflowBy}px)`;
      p.appendChild(warn);
      console.warn('[render] overflow detected on page', p.dataset.page, 'by', overflowBy, 'px');
    }
  });
}

/* ---------- Main ---------- */
async function main() {
  // Elementary (mars/venus) books live under content/<level>/passages/<month>/
  // and carry per-level design CSS gated on [data-level]. No-op for highschool.
  await applyLevelTheme(month);
  const path = passagePath(month, passage);
  const res = await fetch(path);
  if (!res.ok) {
    stage.innerHTML = `<pre>Missing data: ${path}</pre>`;
    return;
  }
  const data = await res.json();

  const frag = tpl.content.cloneNode(true);
  const root = frag.querySelector('[data-slot="root"]');

  // Theme per month
  root.dataset.month = data.meta.month;
  document.body.setAttribute('data-month', data.meta.month);

  // Chapter tag: strip leading unit number (e.g. "I-2 생명의 진화와 탄소" → "생명의 진화와 탄소")
  const unitClean = data.meta.linked_unit.replace(/^[IVX]+(-\d+)?\s+/, '').replace(/^\d+(-\d+)?\s+/, '');
  const chapterLabel = escapeHTML(unitClean);
  ['chapter-tag', 'chapter-tag-2', 'chapter-tag-3', 'chapter-tag-4'].forEach(s => {
    setHTML(root, s, chapterLabel);
  });

  // Page 1 — new meta chips: subject / part / Lexile / AR
  setText(root, 'subject', data.meta.subject);
  setHTML(root, 'part', escapeHTML(data.meta.part_ko));
  setHTML(root, 'lexile', `<span class="lvl-label">Lexile</span>${escapeHTML(data.meta.lexile)}`);
  setHTML(root, 'ar', `<span class="lvl-label">AR</span>${escapeHTML(String(data.meta.ar_level.toFixed(1)))}`);
  setText(root, 'title', data.page1.title);
  setText(root, 'subtitle', data.page1.subtitle);
  setHTML(root, 'body', renderParagraphs(data.page1.body));
  setHTML(root, 'page1-glossary', renderPage1Glossary(data));
  setAttr(root, 'illustration', 'src', data.page1.illustration);
  setAttr(root, 'illustration', 'alt', data.page1.illustration_caption);
  setText(root, 'illustration-caption', data.page1.illustration_caption);
  // If the actual image file is missing (e.g. waiting for Midjourney drop-in),
  // swap to a styled placeholder so layout stays clean.
  const imgEl = root.querySelector('[data-slot="illustration"]');
  if (imgEl) {
    imgEl.addEventListener('error', () => {
      const wrap = imgEl.parentElement;
      wrap.classList.add('illustration-empty');
      wrap.dataset.placeholderId = data.id;
      imgEl.style.display = 'none';
    });
  }

  // Page 2
  setHTML(root, 'questions', renderQuestions(data.page2.questions));
  setText(root, 'tieback-unit', data.page2.textbook_tieback.unit_label);
  setText(root, 'tieback-body', data.page2.textbook_tieback.body_ko);
  setHTML(root, 'tieback-tags', renderTags(data.page2.textbook_tieback.tags));
  setHTML(root, 'tieback-visual', renderVisualAid(data.page2.textbook_tieback.visual_aid));

  // Page 3 — inline per-sentence translation (each English sentence gets its
  // Korean line directly beneath it; no separate bottom block).
  const translationMap = parseTranslationByIndex(data.page3.translation_ko);
  setHTML(root, 'sentences', renderSentences(data.page3.sentences, translationMap));

  // Page 4
  setHTML(root, 'vocab', renderVocab(data.page4.vocab));

  /* ---- Book-level page numbering + left/right page side + DAY label ----
     startPage is the book page of this passage's page 1.
     Within a passage: p1 LEFT, p2 RIGHT, p3 LEFT, p4 RIGHT.
     (Passages always start on an odd page in our layout.)
     Right pages show DAY NN (where NN = passage sequence). */
  const dayLabel = `DAY ${String(parseInt(passage, 10)).padStart(2, '0')}`;
  const pageEls = root.querySelectorAll('.page');
  pageEls.forEach((pEl, idx) => {
    const bookPage = startPage + idx;
    const isLeft = idx % 2 === 0;              // p1/p3 = left, p2/p4 = right
    pEl.classList.add(isLeft ? 'left-page' : 'right-page');
    const numEl = pEl.querySelector('.page-num');
    if (numEl) numEl.textContent = String(bookPage);
    const dayEl = pEl.querySelector('.foot-day');
    if (dayEl) dayEl.textContent = dayLabel;
  });

  stage.innerHTML = '';
  stage.appendChild(frag);
  document.body.dataset.renderReady = '1';

  requestAnimationFrame(() => detectOverflow(stage));
}

main().catch(err => {
  stage.innerHTML = `<pre>Render error: ${err.message}</pre>`;
  console.error(err);
});
