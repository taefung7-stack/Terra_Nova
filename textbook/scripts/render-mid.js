/* Renderer for Terra Nova MID-school passages (TERRA / NEPTUNE / URANUS).
   Same XSS-safe pattern as scripts/render.js: escapeHTML + a tiny markup
   whitelist (<u>, <mark>, <blank>) before assigning into the DOM. Inputs
   come from a static JSON authored in-repo. */

const params = new URLSearchParams(location.search);
const month = params.get('month') || '2026-06-N';
const passage = params.get('passage') || '01';
const startPage = parseInt(params.get('startPage') || '1', 10);

const stage = document.getElementById('stage');
const tpl = document.getElementById('tpl-passage-mid');

function setText(root, slot, value) {
  const el = root.querySelector(`[data-slot="${slot}"]`);
  if (!el) return;
  el.textContent = value ?? '';
}
function setSafe(root, slot, html) {
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

const Q_LABEL = ['Q1.', 'Q2.', 'Q3.', 'Q4.'];

function renderQuestion(q, i) {
  const qNum = Q_LABEL[i];
  const styleTag = q.style ? `<span class="q-style">${escapeHTML(q.style)}</span>` : '';
  const head = `<div class="stem"><span class="q-num">${qNum}</span><span class="stem-rest">${styleTag}${renderRichInline(q.stem)}</span></div>`;

  if (q.type === 'tf_evidence') {
    const rows = q.statements.map((s, idx) => `
      <tr>
        <td class="tf-no">(${idx + 1})</td>
        <td class="tf-text">${renderRichInline(s.text)}</td>
        <td class="tf-cell"><span class="tf-pill">T / F</span></td>
        <td class="tf-line">근거 단락 ____</td>
      </tr>`).join('');
    return `<div class="question mid-q tf">${head}
      <table class="tf-table"><tbody>${rows}</tbody></table>
    </div>`;
  }

  if (q.type === 'match') {
    const left = q.words.map((w, idx) => `
      <li><span class="m-no">(${idx + 1})</span> <span class="m-word">${renderRichInline(w.text)}</span> <span class="m-kind">${w.kind === 'SYN' ? '≈' : '↔'}</span> <span class="m-blank">_____</span></li>
    `).join('');
    const ROMAN = ['①','②','③','④','⑤','⑥'];
    const right = q.pool.map((p, idx) => `<li><span class="m-roman">${ROMAN[idx] || `(${idx+1})`}</span> ${renderRichInline(p)}</li>`).join('');
    return `<div class="question mid-q match">${head}
      <div class="match-grid">
        <ol class="match-words">${left}</ol>
        <ul class="match-pool">${right}</ul>
      </div>
    </div>`;
  }

  if (q.type === 'short_translate') {
    const items = q.items.map((it, idx) => {
      const dirLabel = it.direction === 'en2ko' ? 'EN → KO' : 'KO → EN';
      return `<div class="tr-item">
        <div class="tr-head">(${idx + 1}) <span class="tr-dir">${dirLabel}</span></div>
        <div class="tr-source">${renderRichInline(it.text)}</div>
        <div class="tr-blank"></div>
      </div>`;
    }).join('');
    return `<div class="question mid-q translate">${head}
      <div class="tr-grid">${items}</div>
    </div>`;
  }

  if (q.type === 'short_answer') {
    return `<div class="question mid-q short">${head}
      <div class="short-meta">⊙ 답안: 영어 <strong>${q.max_words}</strong>단어 이내</div>
      <div class="short-blank"></div>
    </div>`;
  }

  return '';
}

function renderQuestions(list) {
  return list.map(renderQuestion).join('');
}

function renderTags(tags) {
  return tags.map(t => `<span class="tag">#${escapeHTML(t)}</span>`).join('');
}

function renderStrategies(list) {
  return list.map((s, i) => `
    <div class="strategy-card">
      <div class="strategy-num">0${i + 1}</div>
      <div class="strategy-body">
        <div class="strategy-title">${escapeHTML(s.title)}</div>
        <div class="strategy-tip">${renderRichInline(s.tip)}</div>
        <div class="strategy-source">📌 ${escapeHTML(s.source)}</div>
      </div>
    </div>
  `).join('');
}

function renderMindMap(mm) {
  if (!mm) return '';
  const branches = mm.branches.map((b, i) => `
    <div class="branch branch-${i + 1}">
      <div class="branch-label">${escapeHTML(b.label)}</div>
      <div class="branch-summary">${escapeHTML(b.summary)}</div>
    </div>
  `).join('');
  return `<div class="mindmap">
    <div class="mm-central">${escapeHTML(mm.central)}</div>
    <div class="mm-branches">${branches}</div>
  </div>`;
}

function renderTranslation(text) {
  const safe = escapeHTML(text);
  return safe.replace(/\[(\d+)\]/g, (_, n) => `<span class="tr-num">[${n}]</span>`);
}

function renderCollocations(list) {
  return list.map(c => {
    const examples = (c.examples || []).map(ex =>
      `<div class="example-item">
        <div class="en">📘 ${escapeHTML(ex.en)}</div>
        <div class="ko">${escapeHTML(ex.ko)}</div>
      </div>`
    ).join('');
    return `<div class="collocation-card">
      <div class="head">
        <span class="phrase">${escapeHTML(c.phrase)}</span>
        <span class="pattern">${escapeHTML(c.pattern)}</span>
      </div>
      <div class="meaning">${escapeHTML(c.meaning_ko)}</div>
      <div class="examples">${examples}</div>
    </div>`;
  }).join('');
}

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
      console.warn('[render-mid] overflow on page', p.dataset.page, 'by', overflowBy, 'px');
    }
  });
}

async function main() {
  const path = `content/passages/${month}/${passage}.json`;
  const res = await fetch(path);
  if (!res.ok) {
    stage.innerHTML = `<pre>Missing data: ${path}</pre>`;
    return;
  }
  const data = await res.json();

  const frag = tpl.content.cloneNode(true);
  const root = frag.querySelector('[data-slot="root"]');

  root.dataset.month = data.meta.month;
  document.body.setAttribute('data-month', data.meta.month);

  const unitClean = data.meta.linked_unit.replace(/^[IVX]+(-\d+)?\s+/, '').replace(/^\d+(-\d+)?\s+/, '');
  const chapterLabel = escapeHTML(unitClean);
  ['chapter-tag', 'chapter-tag-2', 'chapter-tag-3', 'chapter-tag-4'].forEach(s => setSafe(root, s, chapterLabel));

  setText(root, 'subject', data.meta.subject);
  setSafe(root, 'part', escapeHTML(data.meta.part_ko));
  setSafe(root, 'lexile', `<span class="lvl-label">Lexile</span>${escapeHTML(data.meta.lexile)}`);
  setSafe(root, 'ar', `<span class="lvl-label">AR</span>${escapeHTML(String(data.meta.ar_level.toFixed(1)))}`);
  if (data.meta.grade) setSafe(root, 'grade', escapeHTML(data.meta.grade));
  setText(root, 'title', data.page1.title);
  setText(root, 'subtitle', data.page1.subtitle);
  setSafe(root, 'body', renderParagraphs(data.page1.body));
  setAttr(root, 'illustration', 'src', data.page1.illustration);
  setAttr(root, 'illustration', 'alt', data.page1.illustration_caption);
  setText(root, 'illustration-caption', data.page1.illustration_caption);

  const imgEl = root.querySelector('[data-slot="illustration"]');
  if (imgEl) {
    imgEl.addEventListener('error', () => {
      const wrap = imgEl.parentElement;
      wrap.classList.add('illustration-empty');
      wrap.dataset.placeholderId = data.id;
      imgEl.style.display = 'none';
    });
  }

  setSafe(root, 'questions', renderQuestions(data.page2.questions));
  setText(root, 'tieback-unit', data.page2.textbook_tieback.unit_label);
  setText(root, 'tieback-body', data.page2.textbook_tieback.body_ko);
  setSafe(root, 'tieback-tags', renderTags(data.page2.textbook_tieback.tags));

  setSafe(root, 'strategies', renderStrategies(data.page3.strategies));
  setSafe(root, 'mindmap', renderMindMap(data.page3.mindmap));
  setSafe(root, 'translation', renderTranslation(data.page3.translation_compact));

  setSafe(root, 'collocations', renderCollocations(data.page4.collocations));

  const dayLabel = `DAY ${String(parseInt(passage, 10)).padStart(2, '0')}`;
  const pageEls = root.querySelectorAll('.page');
  pageEls.forEach((pEl, idx) => {
    const bookPage = startPage + idx;
    const isLeft = idx % 2 === 0;
    pEl.classList.add(isLeft ? 'left-page' : 'right-page');
    const numEl = pEl.querySelector('.page-num');
    if (numEl) numEl.textContent = String(bookPage);
    const dayEl = pEl.querySelector('.foot-day');
    if (dayEl) dayEl.textContent = dayLabel;
  });

  stage.innerHTML = '';
  stage.appendChild(frag);

  requestAnimationFrame(() => detectOverflow(stage));
}

main().catch(err => {
  stage.innerHTML = `<pre>Render error: ${err.message}</pre>`;
  console.error(err);
});
