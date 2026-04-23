const params = new URLSearchParams(location.search);
const month = params.get('month') || '2026-06';
const passage = params.get('passage') || '01';

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
      ? `<div class="summary-template">${renderRichInline(q.summary_template)}</div>`
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

function renderSentences(list) {
  return list.map(s => {
    const segs = s.segments.map(renderSegment).join(' ');
    return `<div class="p3-sentence">
      <div class="en-row"><span class="num">[${s.index}]</span>${segs}</div>
    </div>`;
  }).join('');
}

/* ---------- Page 3: Translation (continuous, with inline [n] markers) ---------- */
function renderTranslation(text) {
  // Keep text continuous. Convert [1] [2] markers to colored spans.
  const safe = escapeHTML(text);
  const marked = safe.replace(/\[(\d+)\]/g, (_, n) => `<span class="tr-num">[${n}]</span>`);
  return marked;
}

/* ---------- Page 4: Vocab ---------- */
function renderVocab(list) {
  return list.map(v => {
    const syn = v.synonyms && v.synonyms.length ? `<span class="syn-ant-label">≈</span>${v.synonyms.map(escapeHTML).join(', ')}` : '';
    const ant = v.antonyms && v.antonyms.length ? `<span class="syn-ant-label">↔</span>${v.antonyms.map(escapeHTML).join(', ')}` : '';
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
  const path = `content/passages/${month}/${passage}.json`;
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

  // Page 3
  setHTML(root, 'sentences', renderSentences(data.page3.sentences));
  setHTML(root, 'translation', renderTranslation(data.page3.translation_ko));

  // Page 4
  setHTML(root, 'vocab', renderVocab(data.page4.vocab));

  stage.innerHTML = '';
  stage.appendChild(frag);

  requestAnimationFrame(() => detectOverflow(stage));
}

main().catch(err => {
  stage.innerHTML = `<pre>Render error: ${err.message}</pre>`;
  console.error(err);
});
