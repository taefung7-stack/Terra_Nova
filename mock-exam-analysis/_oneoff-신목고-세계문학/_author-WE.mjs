#!/usr/bin/env node
/* ===================================================================
 * 신목고 2-2 기말 · 세계문화 World Englishes(WE) — 3종 데이터 생성기
 * ===================================================================
 * _spec-WE/ch{N}.mjs (압축 표기) → data/WE/{N}.json · {N}-workbook.json · {N}-variant.json
 * ★ data/WE/*.json 을 직접 고치지 말고 스펙을 고친 뒤 이 스크립트를 다시 돌린다.
 *
 *   node _oneoff-신목고-세계문학/_author-WE.mjs          # 전 챕터
 *   node _oneoff-신목고-세계문학/_author-WE.mjs 3        # 3번만
 *
 * ── 압축 표기 ────────────────────────────────────────────────────
 *  en (분석 카드 영문):  [h:주어] [g:동사] [r:핵심구조] [i:이탤릭]  ' / ' = 끊어읽기
 *                       (중첩 가능 — 안쪽부터 치환)
 *  chunks(직독직해):    ' / ' = 끊어읽기
 *  note/points/comment: `영문` → Inter 글꼴, **강조** → <strong>
 *
 * ── 이 생성기가 막아 주는 조용한 실패 ────────────────────────────
 *  1) 정답 위치 쏠림 — 모든 보기는 "정답을 맨 앞"에 적고, 배치는 POS 표가 정한다.
 *     오답 해설(dx)은 보기 순서대로 적으면 ①~⑤ 번호를 생성기가 붙인다(번호 재매핑 사고 0).
 *  2) 요약문 options[].no — 배열 위치로만 부여(project_terra_nova_variant_summary_optno_bug).
 *  3) 워크북 고유명사 오탐 / 4글자 이하 빈칸 — 빌더 함수를 그대로 재현해 저작 시점에 차단.
 *  4) 배열 단어 순서 유출 — 빌더 섞기를 역산해 원문 이웃쌍이 남지 않게 입력 순서를 정한다.
 *  5) 워크북 양자택일 순서 유출 — JSON 은 A=정답(verify 규약) 그대로 두고,
 *     빌드 후 _flip-wb-choices.mjs 가 HTML 에서 절반을 뒤집는다.
 * =================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { SOURCE } from './_SOURCE-WE.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'data', 'WE');
fs.mkdirSync(OUT, { recursive: true });
const EXAM = '신목고 2-2 기말 · 세계문화';
const CIRC = ['①', '②', '③', '④', '⑤'];

/* 정답 배치표 — [ch1..ch7]. 유형마다 ①~⑤가 고르게 돌도록 라틴 방진처럼 배치 */
const POS = {
  analysis:    [3, 5, 2, 4, 1, 3, 5],
  theme:       [2, 4, 1, 5, 3, 1, 4],
  gist:        [5, 1, 3, 2, 4, 2, 1],
  title:       [3, 5, 4, 1, 2, 5, 2],
  implication: [1, 3, 5, 4, 2, 4, 3],
  blank:       [4, 2, 5, 3, 1, 3, 5],
  order:       [2, 3, 1, 4, 5, 1, 3],
  summary:     [5, 1, 2, 3, 4, 2, 1],
};
const ORDER_PERMS = ['A-C-B', 'B-A-C', 'B-C-A', 'C-A-B', 'C-B-A', 'A-B-C'];

let errors = 0;
const fail = (ch, m) => { errors++; console.error(`  ❌ [ch${ch}] ${m}`); };

/* ── 마크업 ── */
const inter = (s) => String(s ?? '')
  .replace(/`([^`]+)`/g, '<span style="font-family:Inter">$1</span>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
const SLASH = ' <span class="slash">/</span> ';
function enHtml(s) {
  let out = String(s).replace(/"/g, '"');
  const re = /\[(h|g|r|i):([^\[\]]*)\]/;
  const CLS = { h: 'hl', g: 'hl-g', r: 'hl-r' };
  while (re.test(out)) {
    out = out.replace(re, (_, k, body) => k === 'i'
      ? `<span style="font-style:italic">${body}</span>`
      : `<span class="${CLS[k]}">${body}</span>`);
  }
  return out.split(' / ').join(SLASH);
}
const chunks = (s) => String(s).split(' / ').join(SLASH);
const plain = (html) => html.replace(/<span class="slash">\s*\/\s*<\/span>/g, ' ')
  .replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

/* 정답(맨 앞) → 목표 위치로 배치. 나머지 오답은 순서 유지. */
function place(arr, pos) {
  const [c, ...rest] = arr;
  const out = rest.slice();
  out.splice(pos - 1, 0, c);
  return out;
}
/* 오답 해설: dx 는 보기 순서(정답 제외)대로 → 배치 후 번호 */
function distractorText(dx, pos) {
  const nums = [1, 2, 3, 4, 5].filter(n => n !== pos);
  return dx.map((t, i) => `${CIRC[nums[i] - 1]} ${t}`).join(' ');
}
const fillA = (s, pos) => String(s).replace(/\{A\}/g, CIRC[pos - 1]);

/* ── 빌더 재현: 고유명사 집합 / 쉬운 단어 ── */
function properNounSet(passage) {
  const set = new Set();
  for (const sent of passage) {
    const toks = String(sent).match(/[A-Za-z][A-Za-z.'-]*/g) || [];
    toks.forEach((tok, idx) => {
      const bare = tok.replace(/[.''-]+$/g, '');
      if (!bare) return;
      if (/^[A-Z]/.test(bare) && (idx > 0 || /^[A-Z]{2,}$/.test(bare))) set.add(bare.toLowerCase());
    });
  }
  const cap = {}, low = {};
  for (const sent of passage) for (const tok of (String(sent).match(/[A-Za-z][A-Za-z.'-]*/g) || [])) {
    const bare = tok.replace(/[.''-]+$/g, ''); if (!bare) continue;
    const k = bare.toLowerCase();
    if (/^[A-Z]/.test(bare)) cap[k] = (cap[k] || 0) + 1; else low[k] = (low[k] || 0) + 1;
  }
  for (const w of Object.keys(cap)) if (!low[w]) set.add(w);
  return set;
}
const EASY = new Set(('the a an and or but so if of to in on at by for with from as is are was were be been being am do does did have has had ' +
  'i you he she it we they this that these those my your his her its our their me him them us not no yes can will would could ' +
  'should may might must than then too very more most some any all one two out up down off over about into also ' +
  'bus taxi car train go goes went get got put say said see saw day time man woman boy girl home school book food water tree dog ' +
  'cat run ran eat ate big small good bad new old hot cold red blue').split(' '));
const bareOf = (a) => String(a || '').toLowerCase().replace(/[^a-z'-]/g, '');
const isEasy = (a) => { const w = bareOf(a); return !w || EASY.has(w) || w.length <= 4; };

/* ── 배열 단어: 빌더 섞기 역산 (목일중3 _author-EXV-workbook.mjs 와 같은 방식) ── */
function seededRng(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function strSeed(s) { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function builderPerm(n, key) {
  const rng = seededRng(strSeed(key + '#0')); const idx = [...Array(n).keys()];
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return idx;
}
function orderScore(words, order) {
  const k = (w) => w.toLowerCase();
  const adj = new Set(words.slice(1).map((w, i) => `${k(words[i])} ${k(w)}`));
  const kept = order.slice(1).filter((p, i) => adj.has(`${k(words[order[i]])} ${k(words[p])}`)).length;
  return kept * 2 + (k(words[order[0]]) === k(words[0]) ? 1 : 0);
}
function preShuffle(words, key) {
  const n = words.length; if (n < 2) return words.slice();
  let best = null, bs = Infinity;
  for (let at = 0; at < 3000 && bs > 0; at++) {
    const rng = seededRng(strSeed(`${key}|target#${at}`)); const o = [...Array(n).keys()];
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; }
    const sc = orderScore(words, o); if (sc < bs) { best = o; bs = sc; }
  }
  const perm = builderPerm(n, key); const input = new Array(n);
  perm.forEach((src, i) => { input[src] = words[best[i]]; });
  return input;
}
/* 서술형 배열은 빌더가 섞지 않으므로 그냥 이웃쌍 최소 순서로 */
function plainShuffle(words, key) {
  const n = words.length; let best = null, bs = Infinity;
  for (let at = 0; at < 3000 && bs > 0; at++) {
    const rng = seededRng(strSeed(`${key}|w#${at}`)); const o = [...Array(n).keys()];
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; }
    const sc = orderScore(words, o); if (sc < bs) { best = o; bs = sc; }
  }
  return best.map(i => words[i]);
}
/* 배열용 토큰 — 워크북 U3 관례: 구두점은 단어에 붙인 채 둔다 */
const tokens = (s) => String(s).split(/\s+/).filter(Boolean);

const slotsOf = (t) => [...String(t).matchAll(/\{\{(\d+):([^\/]+)\/([^}]+)\}\}/g)].map(m => m[2].trim());
const restore = (t) => String(t).replace(/\{\{(\d+):([^\/]+)\/([^}]+)\}\}/g, (_, n, a) => a.trim());

/* =================================================================== */
async function buildChapter(n) {
  const src = SOURCE.find(c => c.no === n);
  const spec = (await import(pathToFileURL(path.join(HERE, '_spec-WE', `ch${n}.mjs`)).href)).default;
  const passage = src.sentences;
  const N = passage.length;
  const A = spec.analysis;

  /* ───────── 분석지 ───────── */
  if (A.ko.length !== N) fail(n, `passage_ko ${A.ko.length} ≠ ${N}`);
  const cards = A.cards.map((c, i) => {
    const html = enHtml(c.en);
    const cov = c.covers || [i + 1];
    const want = cov.map(k => passage[k - 1]).join(' ');
    if (plain(html).replace(/"/g, '"') !== want) fail(n, `카드 ${i + 1} 영문 불일치\n     카드: ${plain(html)}\n     원문: ${want}`);
    return {
      no: i + 1, covers: cov, tags: c.tags || [],
      en_html: html, ko_chunks: chunks(c.chunks),
      ko_full: cov.map(k => A.ko[k - 1]).join(' '),
      note: `<strong>해석 도움</strong> — ${inter(c.note)}`,
      points: c.points.map(([kind, head, body]) => ({ kind, text: `<strong>${head}</strong> — ${inter(body)}` })),
      paraphrasing: ['high', 'mid', 'low'].map((level, k) => {
        const [en, ko] = c.para[k].split(' || ');
        return { level, en, ko };
      }),
    };
  });
  const ap = POS.analysis[n - 1];
  const QT = { '주제': '다음 글의 주제로 가장 적절한 것은?', '요지': '다음 글의 요지로 가장 적절한 것은?',
    '내용 일치': '다음 글의 내용과 일치하는 것은?', '내용 불일치': '다음 글의 내용과 일치하지 않는 것은?' };
  const choices = place(A.choices.map((c, i) => ({ ...c, correct: i === 0 })), ap)
    .map((c, i) => ({ no: i + 1, en: c.en, ko: c.ko, comment: inter(c.comment), correct: c.correct }));
  const analysis = {
    $schema_version: '1.0', exam: EXAM, question_no: n, subtitle: src.subtitle,
    hide_answer: true, hide_brand: true, hide_head_no: true,
    type: A.type === '내용 불일치' ? '내용 일치' : A.type, score: 3, question_text: QT[A.type],
    summary_ko: A.summary_ko, main_idea_en: A.main_idea_en, title_en: A.title_en,
    illustration: { file: `assets/illust-${n}.jpg`, prompt: A.illust.prompt, scene_ko: A.illust.scene_ko },
    passage, passage_ko: A.ko, choices,
    vocab: A.vocab.map(([word, pos, meaning, syn, ant, deriv]) => ({ word, pos, meaning, syn, ant, deriv })),
    flow: A.flow.map(([emoji, title, body]) => ({ emoji, title, body })),
    sentences: cards,
  };
  fs.writeFileSync(path.join(OUT, `${n}.json`), JSON.stringify(analysis, null, 1) + '\n');

  /* ───────── 워크북 ───────── */
  const W = spec.workbook;
  const PN = properNounSet(passage);
  const ko = (r) => A.ko[r - 1];
  const choice = (label) => (arr) => arr.map(([ref, tmpl, explain], i) => {
    const answers = slotsOf(tmpl);
    if (restore(tmpl) !== passage[ref - 1]) fail(n, `${label} #${i + 1} 복원문 불일치\n     복원: ${restore(tmpl)}\n     원문: ${passage[ref - 1]}`);
    if (answers.length !== explain.length) fail(n, `${label} #${i + 1} explain 수 ≠ 슬롯 수`);
    for (const a of answers) if (PN.has(bareOf(a))) fail(n, `${label} #${i + 1} 정답 "${a}" 고유명사 오탐 → 빌더가 문항 삭제`);
    return { no: i + 1, ref_sentence: ref, en_template: tmpl, ko_full: ko(ref), answers, explain };
  });
  const fill = W.F.map(([ref, answers], i) => {
    for (const a of answers) {
      if (!new RegExp(`\\b${a}\\b`, 'i').test(passage[ref - 1])) fail(n, `빈칸 #${i + 1} "${a}" 가 ${ref}번 문장에 없음`);
      if (PN.has(bareOf(a)) || isEasy(a)) fail(n, `빈칸 #${i + 1} "${a}" 빌더가 지움(고유명사/4글자 이하/쉬운말)`);
    }
    return { no: i + 1, ref_sentence: ref, hints: answers.map((a, k) => ({ pos: k + 1, letter: a[0].toLowerCase(), answer: a, after: '' })), ko_full: ko(ref) };
  });
  const wb = {
    $schema_version: '1.0', $ref_source: `${n}.json`,
    _note: `WE Ch${n} 워크북 — _author-WE.mjs 가 _spec-WE/ch${n}.mjs 에서 생성(직접 수정 금지). 고유명사 금지 토큰: ${[...PN].sort().join(' ')}`,
    voca_check: {
      en_to_ko: W.voca.en.map(([word, pos]) => ({ word, pos })),
      ko_to_en: W.voca.ko.map(([meaning, pos, answer]) => ({ meaning, pos, answer })),
      definitions: W.voca.def.map(([def, answer]) => ({ def, answer })),
      expressions: W.voca.exp.map(([k, answer]) => ({ ko: k, answer })),
    },
    grammar_choice: choice('어법')(W.G),
    vocab_choice: choice('어휘')(W.V),
    fill_first_letter: fill,
    ko_translation: W.KO.map((ref, i) => ({ no: i + 1, ref_sentence: ref })),
    jumble: W.J.map((ref, i) => ({ no: i + 1, ref_sentence: ref,
      words: preShuffle(tokens(passage[ref - 1]), `${EXAM}|${n}|j${ref}`), answer: passage[ref - 1] })),
    sentence_translation: W.S.map((ref, i) => ({ no: i + 1, ref_sentence: ref, given: 'ko' })),
    mixed: W.M.map(([kind, ref], i) => ({ kind, ref, no: i + 1 })),
  };
  const used = new Set([...wb.grammar_choice, ...wb.vocab_choice, ...fill, ...wb.ko_translation, ...wb.jumble, ...wb.sentence_translation].map(x => x.ref_sentence));
  const miss = [...Array(N).keys()].map(k => k + 1).filter(k => !used.has(k));
  if (miss.length) fail(n, `워크북 미출제 문장: ${miss.join(', ')}`);
  fs.writeFileSync(path.join(OUT, `${n}-workbook.json`), JSON.stringify(wb, null, 1) + '\n');

  /* ───────── 변형문제 ───────── */
  const V = spec.variant;
  const P = V.P;
  const mc = (key, it, extra = {}) => {
    const pos = POS[key][n - 1];
    return { ...extra, choices: place(it.c, pos), answer: pos,
      explanation_ko: fillA(it.ex, pos), distractor_ko: distractorText(it.dx, pos) };
  };
  const withEdits = (edits = []) => {
    const p = P.slice();
    for (const [si, from, to] of edits) {
      if (!p[si].includes(from)) fail(n, `edit "${from}" 가 P[${si}] 에 없음`);
      p[si] = p[si].replace(from, to);
    }
    return p;
  };
  const ul = (key, it) => {
    const p = withEdits(it.edits);
    const underlines = it.ul.map(([si, text, correct, fix], i) => ({ no: i + 1, sent_index: si, text, correct, ...(correct ? {} : { fix }) }));
    const wrong = underlines.find(u => !u.correct);
    return { passage: p, underlines, choices: CIRC.slice(), answer: wrong.no, explanation_ko: it.ex, distractor_ko: it.dx };
  };
  const by = {};
  by.theme = { passage: P, ...mc('theme', V.theme) };
  by.gist = { passage: P, ...mc('gist', V.gist) };
  by.title = { passage: P, ...mc('title', V.title) };
  by.implication = { passage: P, underlined: V.implication.u, ...mc('implication', V.implication) };
  by.grammar = ul('grammar', V.grammar);
  by.vocab = ul('vocab', V.vocab);
  by.blank = { passage: P, blank_sentence_index: V.blank.si, blank_target: V.blank.t, ...mc('blank', V.blank) };
  by.irrelevant = { intro: V.irrelevant.intro, sentences: V.irrelevant.s, choices: CIRC.slice(), answer: V.irrelevant.a,
    explanation_ko: V.irrelevant.ex, distractor_ko: V.irrelevant.dx };
  {
    const o = V.order; const pos = POS.order[n - 1];
    const others = ORDER_PERMS.filter(x => x !== o.ans).slice(0, 4);
    others.splice(pos - 1, 0, o.ans);
    by.order = { given: o.given, blocks: o.blocks, choices: others.map(x => x.split('-').map(k => `(${k})`).join(' - ')),
      answer: pos, explanation_ko: fillA(o.ex, pos), distractor_ko: o.dx };
  }
  by.insert = { insert_sentence: V.insert.s, passage_marked: V.insert.seg.map((text, i) => ({ text, slot_after: i + 1 })),
    choices: CIRC.slice(), answer: V.insert.a, explanation_ko: V.insert.ex, distractor_ko: V.insert.dx };
  {
    const s = V.summary; const pos = POS.summary[n - 1];
    const opts = place(s.opts, pos).map(([a, b], i) => ({ no: i + 1, A: a, B: b }));
    by.summary = { passage: P, summary_template: s.tpl, options: opts, answer: pos,
      explanation_ko: fillA(s.ex, pos), distractor_ko: s.dx };
  }
  by.writing = V.writing.map((w, i) => {
    const base = { subtype: w.t };
    if (w.t === 'word_order') return { ...base, subtype_label: '배열 영작', question: '다음 우리말과 같은 뜻이 되도록 <보기>의 단어를 모두 배열하여 영작하시오.',
      ko_prompt: w.ko, words: plainShuffle(tokens(w.ans.replace(/[.?!]$/, '')), `${n}|w${i}`), answer: w.ans, explanation_ko: w.ex };
    if (w.t === 'conditioned_write') {
      const cnt = tokens(w.ans).length;
      if (cnt !== w.words) fail(n, `조건 영작 "${w.ans}" 실제 ${cnt}단어 ≠ 조건 ${w.words}단어`);
      return { ...base, subtype_label: '조건 영작', question: `다음 조건에 맞게 우리말을 영작하시오. (총 ${w.words}단어)`,
        ko_prompt: w.ko, conditions: [...w.cond, `총 ${w.words}단어`], answer: w.ans, explanation_ko: w.ex };
    }
    if (w.t === 'fill_blank') return { ...base, subtype_label: '빈칸 완성', question: '빈칸에 알맞은 말을 넣어 문장을 완성하시오.',
      ko_prompt: w.ko, context: w.ctx, template: w.ctx, answer: w.ans, explanation_ko: w.ex };
    if (w.t === 'translate_ko') return { ...base, subtype_label: '우리말 해석', question: '다음 문장을 우리말로 해석하시오.',
      en_prompt: w.en, answer: w.ans, explanation_ko: w.ex };
    if (w.t === 'summary_word') return { ...base, subtype_label: '요약문 완성', show_passage: true,
      question: '본문을 한 문장으로 요약할 때 빈칸 (A), (B)에 들어갈 단어를 본문에서 찾아 쓰시오.',
      summary: w.sum, answer_a: w.a, answer_b: w.b, explanation_ko: w.ex };
    if (w.t === 'topic_write') return { ...base, subtype_label: '주제문 영작', question: '글의 주제를 한 문장으로 영작하시오.',
      ko_prompt: w.ko, ...(w.cond ? { conditions: w.cond } : {}), answer: w.ans, explanation_ko: w.ex };
    fail(n, `writing subtype ${w.t}?`); return base;
  });
  for (const w of by.writing) if (w.subtype === 'summary_word')
    for (const x of [w.answer_a, w.answer_b]) if (!passage.join(' ').toLowerCase().includes(x.toLowerCase())) fail(n, `요약문 서술형 "${x}" 본문 미등장`);
  const variant = { $schema_version: 'variant-v0.3-type-grouped', $ref_source: `${n}.json`, passage_id: n, topic_ko: V.topic_ko,
    ...(V.writing_passage ? { writing_passage: V.writing_passage } : {}), by_type: by };
  fs.writeFileSync(path.join(OUT, `${n}-variant.json`), JSON.stringify(variant, null, 1) + '\n');

  console.log(`✓ ch${n}  분석카드 ${cards.length} · 어휘 ${analysis.vocab.length} | 워크북 어법 ${wb.grammar_choice.length}·어휘 ${wb.vocab_choice.length}·빈칸 ${fill.length}·해석 ${wb.ko_translation.length}·배열 ${wb.jumble.length}·영작 ${wb.sentence_translation.length}·종합 ${wb.mixed.length} | 변형 서술형 ${by.writing.length}`);
}

const only = process.argv[2] ? [+process.argv[2]] : SOURCE.map(c => c.no);
for (const n of only) {
  if (!fs.existsSync(path.join(HERE, '_spec-WE', `ch${n}.mjs`))) { console.log(`· ch${n} 스펙 없음 — 건너뜀`); continue; }
  await buildChapter(n);
}
if (errors) { console.error(`\n❌ 오류 ${errors}건`); process.exit(1); }
console.log('\n✅ 생성 완료 — 오류 0');
