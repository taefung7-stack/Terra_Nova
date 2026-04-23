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

/* ---- Page-number layout ----
   TOC = page 1
   For each week W (1..4):
     WEEK W divider = pages [TOC + previousWeeks*(2+5*4) + 1 ... +2]
     Then 5 passages × 4 pages
   Passage N (1..20) is in week W = ceil(N/5).
*/
function pageOfPassage(n) {
  const w = Math.ceil(n / 5);
  // Pages used by TOC + previous full weeks + current week's divider
  const before = 1 + (w - 1) * (2 + 5 * 4) + 2;
  const inWeekIdx = (n - 1) % 5;     // 0..4
  return before + inWeekIdx * 4 + 1;
}

function pageOfWeekDivider(w) {
  // First page of week w divider
  return 1 + (w - 1) * (2 + 5 * 4) + 1;
}

async function loadCurriculum(month) {
  const all = await fetch('content/curriculum.json').then(r => r.json());
  return all.filter(e => e.month === month).sort((a, b) => a.sequence - b.sequence);
}

function setText(root, slot, value) {
  const el = root.querySelector(`[data-slot="${slot}"]`);
  if (el) el.textContent = value ?? '';
}
function setHTML(root, slot, html) {
  const el = root.querySelector(`[data-slot="${slot}"]`);
  if (el) el.innerHTML = html ?? '';
}

/* ---- TOC mode ---- */
async function renderTOC(entries) {
  const tpl = document.getElementById('tpl-toc');
  const frag = tpl.content.cloneNode(true);
  const root = frag.querySelector('.cover');
  setText(root, 'month-label', month);
  setText(root, 'month-label-foot', month);

  // Group by week
  const html = [];
  for (let w = 1; w <= 4; w++) {
    const weekStart = (w - 1) * 5 + 1;
    const weekEnd = w * 5;
    html.push(`<div class="toc-week-band">
      <span>WEEK ${String(w).padStart(2, '0')}</span>
      <span class="week-page">p.${pageOfWeekDivider(w)}</span>
    </div>`);
    for (let n = weekStart; n <= weekEnd; n++) {
      const e = entries.find(x => x.sequence === n);
      if (!e) continue;
      html.push(`<div class="toc-row">
        <span class="seq">${String(n).padStart(2, '0')}</span>
        <div class="titles">
          <span class="en">${escapeHTML(e.passage_topic_en)}</span>
          <span class="ko">${escapeHTML(e.passage_topic_ko)}</span>
        </div>
        <span class="subject">${escapeHTML(e.subject)}</span>
        <span class="pg">p.${pageOfPassage(n)}</span>
      </div>`);
    }
  }
  setHTML(root, 'toc-rows', html.join(''));
  document.body.setAttribute('data-month', month);
  stage.innerHTML = '';
  stage.appendChild(frag);
}

/* ---- WEEK divider mode ---- */
async function renderWeek(entries, w) {
  const weekStart = (w - 1) * 5 + 1;
  const weekEnd = w * 5;
  const weekEntries = entries.filter(e => e.sequence >= weekStart && e.sequence <= weekEnd);

  const tpl = document.getElementById('tpl-week');
  const frag = tpl.content.cloneNode(true);
  const root = frag;

  // Subjects summary for the week
  const subjects = [...new Set(weekEntries.map(e => e.subject))];
  const meta = `${month} · 5 PASSAGES · ${subjects.join(' / ')}`;

  setText(frag.querySelector('[data-slot="week-num"]'), 'week-num', '');
  // Slot setters via direct lookups (template has both pages as siblings)
  const setT = (sel, txt) => { const el = frag.querySelector(sel); if (el) el.textContent = txt; };
  const setH = (sel, html) => { const el = frag.querySelector(sel); if (el) el.innerHTML = html; };

  setT('[data-slot="week-num"]', String(w).padStart(2, '0'));
  setT('[data-slot="week-meta"]', meta);
  setT('[data-slot="month-label-w-l"]', `${month} · WEEK ${w}`);
  setT('[data-slot="month-label-w-r"]', `${month}`);
  setT('[data-slot="week-foot"]', `WEEK ${String(w).padStart(2, '0')}  ·  지문 ${weekStart}–${weekEnd}`);
  setT('[data-slot="week-right-sub"]', '한 주 동안 매일 한 지문씩 — 4페이지(본문 → 문제 → 구문 → 어휘)로 깊게.');

  // Build passage list
  const cards = weekEntries.map(e => {
    const page = pageOfPassage(e.sequence);
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
