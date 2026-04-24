const params = new URLSearchParams(location.search);
const mode = params.get('mode') || 'toc';      // 'toc' | 'week'
const month = params.get('month') || '2026-06';
const week = parseInt(params.get('week') || '1', 10);   // 1..4

const stage = document.getElementById('stage');

function escapeHTML(s) {
  return String(s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/* ---- Page-number layout (TOC = 2 pages) ----
   Pages per week block = 2 divider + 5 passages × 4 pages = 22.
   Passage N (1..20), W = ceil(N/5):
     before    = 2 (TOC) + (W-1)*22 + 2 (week divider) = 4 + (W-1)*22
     startPage = before + ((N-1) % 5) * 4 + 1  */
function pageOfPassage(n) {
  const w = Math.ceil(n / 5);
  const before = 4 + (w - 1) * 22;
  const inWeekIdx = (n - 1) % 5;
  return before + inWeekIdx * 4 + 1;
}

function pageOfWeekDivider(w) {
  return 2 + (w - 1) * 22 + 1;
}

async function loadCurriculum(month) {
  const all = await fetch('content/curriculum.json').then(r => r.json());
  return all.filter(e => e.month === month).sort((a, b) => a.sequence - b.sequence);
}

/* ---- TOC mode (2 pages, big WEEK headers, no dates) ---- */
function buildWeekTOCBlock(w, entries) {
  const weekStart = (w - 1) * 5 + 1;
  const weekEnd = w * 5;
  const rows = [];
  for (let n = weekStart; n <= weekEnd; n++) {
    const e = entries.find(x => x.sequence === n);
    if (!e) continue;
    rows.push(`<div class="toc-row">
      <span class="seq">${String(n).padStart(2, '0')}</span>
      <div class="titles">
        <span class="en">${escapeHTML(e.passage_topic_en)}</span>
        <span class="ko">${escapeHTML(e.passage_topic_ko)}</span>
      </div>
      <span class="subject">${escapeHTML(e.subject)}</span>
      <span class="pg">p.${pageOfPassage(n)}</span>
    </div>`);
  }
  return `<section class="toc-week-block">
    <header class="toc-week-headline">
      <span class="tw-label">WEEK</span>
      <span class="tw-num">${String(w).padStart(2, '0')}</span>
      <span class="tw-pg">p.${pageOfWeekDivider(w)}</span>
    </header>
    <div class="toc-week-rows">${rows.join('')}</div>
  </section>`;
}

async function renderTOC(entries) {
  const tpl = document.getElementById('tpl-toc');
  const frag = tpl.content.cloneNode(true);

  const setH = (sel, html) => { const el = frag.querySelector(sel); if (el) el.innerHTML = html; };

  setH('[data-slot="toc-rows-left"]',  buildWeekTOCBlock(1, entries) + buildWeekTOCBlock(2, entries));
  setH('[data-slot="toc-rows-right"]', buildWeekTOCBlock(3, entries) + buildWeekTOCBlock(4, entries));

  document.body.setAttribute('data-month', month);
  document.body.setAttribute('data-mode', 'toc');
  /* Also set on html so the [data-month="..."] CSS variable override
     reaches the html canvas (used as the print page background). */
  document.documentElement.setAttribute('data-month', month);
  document.documentElement.setAttribute('data-mode', 'toc');
  stage.innerHTML = '';
  stage.appendChild(frag);
}

/* ---- WEEK divider mode (no dates, solid color) ---- */
async function renderWeek(entries, w) {
  const weekStart = (w - 1) * 5 + 1;
  const weekEnd = w * 5;
  const weekEntries = entries.filter(e => e.sequence >= weekStart && e.sequence <= weekEnd);

  const tpl = document.getElementById('tpl-week');
  const frag = tpl.content.cloneNode(true);

  const subjects = [...new Set(weekEntries.map(e => e.subject))];
  const meta = `5 PASSAGES · ${subjects.join(' / ')}`;

  const setT = (sel, txt) => { const el = frag.querySelector(sel); if (el) el.textContent = txt; };
  const setH = (sel, html) => { const el = frag.querySelector(sel); if (el) el.innerHTML = html; };

  setT('[data-slot="week-num"]', String(w).padStart(2, '0'));
  setT('[data-slot="week-meta"]', meta);

  const cards = weekEntries.map(e => {
    return `<article class="week-passage-card">
      <span class="pc-num">${String(e.sequence).padStart(2, '0')}</span>
      <div class="pc-body">
        <span class="pc-en">${escapeHTML(e.passage_topic_en)}</span>
        <span class="pc-ko">${escapeHTML(e.passage_topic_ko)} · ${escapeHTML(e.linked_unit.replace(/^[IVX]+(-\d+)?\s+/, '').replace(/^\d+(-\d+)?\s+/, ''))}</span>
      </div>
      <span class="pc-subject">${escapeHTML(e.subject)}</span>
    </article>`;
  }).join('');
  setH('[data-slot="week-passages"]', cards);

  document.body.setAttribute('data-month', month);
  document.body.setAttribute('data-mode', 'week');
  /* Also set on html so the [data-month="..."] CSS variable override
     reaches the html canvas (used as the print page background) — without
     this, html falls back to the :root default theme (green) and a green
     strip leaks at the page bottom. */
  document.documentElement.setAttribute('data-month', month);
  document.documentElement.setAttribute('data-mode', 'week');
  stage.innerHTML = '';
  stage.appendChild(frag);
}

async function main() {
  const entries = await loadCurriculum(month);
  if (mode === 'toc') {
    await renderTOC(entries);
  } else if (mode === 'week') {
    await renderWeek(entries, week);
  } else {
    stage.innerHTML = `<pre>Unknown mode: ${mode}</pre>`;
  }
}

main().catch(err => {
  stage.innerHTML = `<pre>Cover render error: ${err.message}</pre>`;
  console.error(err);
});
