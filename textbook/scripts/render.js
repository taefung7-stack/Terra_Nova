const params = new URLSearchParams(location.search);
const month = params.get('month') || '2026-05';
const passage = params.get('passage') || '01';

const stage = document.getElementById('stage');
const tpl = document.getElementById('tpl-passage');

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

function renderParagraphs(text) {
  return text.split(/\n\s*\n/).map(p => `<p>${escapeHTML(p.trim()).replace(/\n/g, '<br/>')}</p>`).join('');
}

function renderQuestions(list) {
  return list.map((q, i) => {
    if (q.type === 'mock_objective') {
      const choices = q.choices.map(c => `<li>${escapeHTML(c)}</li>`).join('');
      return `<div class="question mock">
        <div class="stem">Q${i+1}. [${escapeHTML(q.style)}] ${escapeHTML(q.stem)}</div>
        <ol class="choices">${choices}</ol>
      </div>`;
    }
    return `<div class="question descriptive">
      <div class="stem">Q${i+1}. [서술형] ${escapeHTML(q.prompt)}</div>
      <div class="answer-slot" aria-hidden="true"></div>
    </div>`;
  }).join('');
}

function renderTags(tags) {
  return tags.map(t => `<span class="tag">#${escapeHTML(t)}</span>`).join('');
}

function renderReprint(text) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  return sentences.map(s => `<span class="sent">${escapeHTML(s.trim())}</span> `).join('');
}

function renderSentences(list) {
  return list.map(s => {
    const parts = Object.entries(s.parts).map(([k, v]) => `<span><span class="k">${escapeHTML(k)}</span>=${escapeHTML(v)}</span>`).join('');
    return `<div class="p3-sentence">
      <div><span class="num">[${s.index}]</span><span class="en">${escapeHTML(s.en)}</span></div>
      <div class="parts">${parts}</div>
      <div class="note">💬 ${escapeHTML(s.grammar_note)}</div>
    </div>`;
  }).join('');
}

function renderGrammar(list) {
  return list.map(g => `<li>${escapeHTML(g)}</li>`).join('');
}

function renderTranslation(paragraphs) {
  return paragraphs.map(p => `<p>${escapeHTML(p)}</p>`).join('');
}

function renderVocab(list) {
  return list.map(v => {
    const syn = v.synonyms.length ? `syn: ${v.synonyms.map(escapeHTML).join(', ')}` : '';
    const ant = v.antonyms.length ? `ant: ${v.antonyms.map(escapeHTML).join(', ')}` : '';
    const synAnt = [syn, ant].filter(Boolean).join(' / ');
    return `<div class="vocab-card">
      <div class="head"><span class="word">${escapeHTML(v.word)}</span><span class="pos">${escapeHTML(v.pos)}</span></div>
      <div class="meaning">${escapeHTML(v.meaning_ko)}</div>
      ${synAnt ? `<div class="syn-ant">${synAnt}</div>` : ''}
      <div class="example">📘 ${escapeHTML(v.example)}</div>
      <div class="exam-source">${escapeHTML(v.exam_source)}</div>
    </div>`;
  }).join('');
}

function renderSelftest(list) {
  return list.map(v => `<div class="cell"><span class="box"></span>${escapeHTML(v.word)}</div>`).join('');
}

function detectOverflow(root) {
  root.querySelectorAll('.page').forEach(p => {
    if (p.scrollHeight > p.clientHeight + 2) {
      p.classList.add('overflow');
      const warn = document.createElement('div');
      warn.className = 'overflow-warning';
      warn.textContent = 'OVERFLOW';
      p.appendChild(warn);
      console.warn('[render] overflow detected on page', p.dataset.page);
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

  const id = `${data.meta.month} · ${String(data.meta.sequence).padStart(2, '0')}`;
  for (const s of ['passage-id', 'passage-id-2', 'passage-id-3', 'passage-id-4']) {
    setText(root, s, id);
  }

  setText(root, 'subject', data.meta.subject);
  setText(root, 'difficulty', `● ${data.meta.difficulty}`);
  setText(root, 'title', data.page1.title);
  setText(root, 'subtitle', data.page1.subtitle);
  setHTML(root, 'body', renderParagraphs(data.page1.body));
  setAttr(root, 'illustration', 'src', data.page1.illustration);
  setAttr(root, 'illustration', 'alt', data.page1.illustration_caption);
  setText(root, 'illustration-caption', data.page1.illustration_caption);
  setText(root, 'theme-foot', data.meta.theme_en);

  setHTML(root, 'questions', renderQuestions(data.page2.questions));
  setText(root, 'tieback-unit', `[${data.page2.textbook_tieback.unit_label}]`);
  setText(root, 'tieback-body', data.page2.textbook_tieback.body_ko);
  setHTML(root, 'tieback-tags', renderTags(data.page2.textbook_tieback.tags));

  setHTML(root, 'reprint', renderReprint(data.page1.body));
  setHTML(root, 'sentences', renderSentences(data.page3.sentences));
  setHTML(root, 'grammar-points', renderGrammar(data.page3.grammar_points));
  setHTML(root, 'translation', renderTranslation(data.page3.translation_ko));

  setHTML(root, 'vocab', renderVocab(data.page4.vocab));
  setHTML(root, 'selftest', renderSelftest(data.page4.vocab));

  stage.innerHTML = '';
  stage.appendChild(frag);

  requestAnimationFrame(() => detectOverflow(stage));
}

main().catch(err => {
  stage.innerHTML = `<pre>Render error: ${err.message}</pre>`;
  console.error(err);
});
