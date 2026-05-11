/* Renderer for Terra Nova MID-school passages (TERRA / NEPTUNE / URANUS).
   Same XSS-safe pattern as scripts/render.js: escapeHTML + a tiny markup
   whitelist (<u>, <mark>, <blank>) before assigning into the DOM. Inputs
   come from static JSON authored in-repo. */

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

  if (q.type === 'mock_objective') {
    const choices = q.choices.map(c => `<li>${renderRichInline(c)}</li>`).join('');
    return `<div class="question mid-q mock">${head}
      <ol class="choices">${choices}</ol>
    </div>`;
  }

  if (q.type === 'tf_evidence') {
    const rows = q.statements.map((s, idx) => `
      <tr>
        <td class="tf-no">(${idx + 1})</td>
        <td class="tf-text">${renderRichInline(s.text)}</td>
        <td class="tf-cell"><span class="tf-pill">T / F</span></td>
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

function renderVisualAid(va) {
  if (!va) return '';
  const type = va.type;
  const safeTitle = escapeHTML(va.title || '');
  const stepIcon = type === 'compare' ? '⚖️' : type === 'timeline' ? '⏳' : type === 'mindmap' ? '🧠' : '🧭';
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
      <div class="va-title">${stepIcon} ${safeTitle}</div>
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
      <div class="va-title">${stepIcon} ${safeTitle}</div>
      <div class="va-steps">${cells}</div>
    </div>`;
  }
  if (type === 'mindmap') {
    const cells = va.steps.map(s =>
      `<div class="va-step"><span class="va-emoji">${escapeHTML(s.emoji)}</span> <strong>${escapeHTML(s.label || '')}</strong>${s.note ? ` — ${escapeHTML(s.note)}` : ''}</div>`
    ).join('');
    return `<div class="visual-aid mindmap">
      <div class="va-title">${stepIcon} ${safeTitle}</div>
      <div class="va-steps">${cells}</div>
    </div>`;
  }
  return '';
}

/* ---------- Page 3: Sentence syntax breakdown (same as standard) ---------- */
const ROLE_TAG = { S: 'S', V: 'V', O: 'O', C: 'C', M: 'M', CONJ: '접', REL: '관', '': '' };

function renderSegment(seg) {
  const role = seg.role || '';
  const tag = ROLE_TAG[role] || '';
  const tagHtml = tag ? `<span class="seg-tag">${tag}</span>` : '';
  const safeText = renderRichInline(seg.text);
  if (seg.note) {
    return `<span class="seg" data-role="${role}"><ruby><rb>${safeText}${tagHtml}</rb><rt><span class="rt-note">${escapeHTML(seg.note)}</span></rt></ruby></span>`;
  }
  return `<span class="seg" data-role="${role}">${safeText}${tagHtml}</span>`;
}

function renderHighlights(list, sentenceIndex) {
  if (!list || !list.length) return '';
  const ROLE_LABEL = { S: 'S', V: 'V', O: 'O', C: 'C', M: 'M', CONJ: '접', REL: '관' };
  const chips = list.map(h => {
    const label = ROLE_LABEL[h.role] || h.role;
    return `<span class="hl-chip" data-role="${h.role}"><span class="hl-tag">${label}</span><span class="hl-ko">${renderRichInline(h.ko)}</span></span>`;
  }).join('');
  const lead = sentenceIndex != null
    ? `<span class="hl-lead">[${sentenceIndex}]</span>`
    : '';
  return `<div class="mid-sent-explain">${lead}${chips}</div>`;
}

function renderSentences(list) {
  return list.map(s => {
    const segs = s.segments.map(renderSegment).join(' ');
    return `<div class="p3-sentence">
      <div class="en-row"><span class="num">[${s.index}]</span>${segs}</div>
      ${renderHighlights(s.highlights, s.index)}
    </div>`;
  }).join('');
}

function renderTranslation(text) {
  const safe = escapeHTML(text);
  return safe.replace(/\[(\d+)\]/g, (_, n) => `<span class="tr-num">[${n}]</span>`);
}

/* ---------- Page 4: 3-type vocab (collocation / word_root / word) ---------- */
function renderVocabCard(v) {
  if (v.card_type === 'collocation') {
    const examples = (v.examples || []).map(ex =>
      `<div class="example-item">
        <div class="en">📘 ${escapeHTML(ex.en)}</div>
        <div class="ko">${escapeHTML(ex.ko)}</div>
      </div>`
    ).join('');
    return `<div class="vocab-card mid-vc collocation">
      <div class="vc-tag">콜로케이션</div>
      <div class="head">
        <span class="phrase">${escapeHTML(v.phrase)}</span>
        <span class="pattern">${escapeHTML(v.pattern)}</span>
      </div>
      <div class="meaning">${escapeHTML(v.meaning_ko)}</div>
      <div class="examples">${examples}</div>
    </div>`;
  }
  if (v.card_type === 'word_root') {
    const kin = (v.kin || []).map(k =>
      `<span class="kin-item"><strong>${escapeHTML(k.en)}</strong> <span class="kin-ko">${escapeHTML(k.ko)}</span></span>`
    ).join('');
    const example = v.example
      ? `<div class="example-item">
          <div class="en">📘 ${escapeHTML(v.example.en)}</div>
          <div class="ko">${escapeHTML(v.example.ko)}</div>
        </div>`
      : '';
    return `<div class="vocab-card mid-vc word-root">
      <div class="vc-tag">어근 분석</div>
      <div class="head">
        <span class="phrase">${escapeHTML(v.word)}</span>
        <span class="pattern">root: ${escapeHTML(v.root)} · ${escapeHTML(v.root_meaning)}</span>
      </div>
      <div class="meaning">${escapeHTML(v.meaning_ko)}</div>
      <div class="kin-row">${kin}</div>
      <div class="examples">${example}</div>
    </div>`;
  }
  // word (regular)
  const examples = (v.examples || []).map(ex =>
    `<div class="example-item">
      <div class="en">📘 ${escapeHTML(ex.en)}</div>
      <div class="ko">${escapeHTML(ex.ko)}</div>
    </div>`
  ).join('');
  const syn = v.synonyms && v.synonyms.length ? `<span class="sa-label">≈</span>${v.synonyms.map(escapeHTML).join(', ')}` : '';
  const ant = v.antonyms && v.antonyms.length ? `<span class="sa-label">↔</span>${v.antonyms.map(escapeHTML).join(', ')}` : '';
  const synAnt = [syn, ant].filter(Boolean).join(' &nbsp;·&nbsp; ');
  return `<div class="vocab-card mid-vc word">
    <div class="vc-tag">단어</div>
    <div class="head">
      <span class="phrase">${escapeHTML(v.word)}</span>
      <span class="pattern">${escapeHTML(v.pos)}</span>
    </div>
    <div class="meaning">${escapeHTML(v.meaning_ko)}</div>
    ${synAnt ? `<div class="syn-ant">${synAnt}</div>` : ''}
    <div class="examples">${examples}</div>
  </div>`;
}

function renderVocab(list) {
  return list.map(renderVocabCard).join('');
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
  setSafe(root, 'tieback-visual', renderVisualAid(data.page2.textbook_tieback.visual_aid));

  setSafe(root, 'sentences', renderSentences(data.page3.sentences));
  setSafe(root, 'translation', renderTranslation(data.page3.translation_ko));

  setSafe(root, 'vocab', renderVocab(data.page4.vocab));

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