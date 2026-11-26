#!/usr/bin/env node
/* ===================================================================
 * 신목고 2-2 기말 · 세계문화 Culture in Idioms(WI) — 본문분석 데이터 생성기
 * ===================================================================
 * _spec-WI/part{1,2}.mjs → data/WI/{N}.json  (본문분석만 — 워크북·변형문제는 요청 없음)
 * 출력 형식은 data/WE/*.json(_author-WE.mjs) 과 같다: 카드별 paraphrasing 3단계(high/mid/low), 보기 ko.
 * ★ data/WI/*.json 을 직접 고치지 말 것.
 *
 * 압축 표기
 *   en(카드 영문): [h:주어] [g:동사] [r:핵심] [i:이탤릭]   ' / ' = 끊어읽기
 *   chunks(직독직해): ' / ' = 끊어읽기
 *   note/points/comment/flow: {english} → Inter 글꼴, **강조** → <strong>
 *
 * 생성기가 막는 것
 *   1) 카드 영문(태그·끊어읽기 제거) ≠ 정본 문장 이어붙임 → 오류
 *   2) covers 가 전 문장을 빠짐없이 1회 오름차순으로 덮지 않으면 오류
 *   3) 보기는 정답을 맨 앞에 적고 ans 위치로 옮긴다(정답 위치 쏠림 방지)
 *   4) 해석 수 ≠ 문장 수, 품사 표기 이상 → 오류
 * =================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SOURCE } from './_SOURCE-WI.js';
import { chapters as P1 } from './_spec-WI/part1.mjs';
import { chapters as P2 } from './_spec-WI/part2.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'data', 'WI');
fs.mkdirSync(OUT, { recursive: true });
const EXAM = '신목고 2-2 기말 · 세계문화';
const POS_OK = new Set(['동', '명', '형', '부', '숙', '전', '접', '대']);

let errors = 0;
const fail = (ch, m) => { errors++; console.error(`  ❌ [ch${ch}] ${m}`); };

const inter = (s) => String(s ?? '')
  .replace(/\{([^{}]+)\}/g, '<span style="font-family:Inter">$1</span>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
const SLASH = ' <span class="slash">/</span> ';
function enHtml(s) {
  let out = String(s);
  const re = /\[(h|g|r|i):([^\[\]]*)\]/;
  const CLS = { h: 'hl', g: 'hl-g', r: 'hl-r' };
  while (re.test(out)) {
    out = out.replace(re, (_, k, body) => k === 'i'
      ? `<span style="font-style:italic">${body}</span>`
      : `<span class="${CLS[k]}">${body}</span>`);
  }
  return out.split(' / ').join(SLASH);
}
const plain = (html) => html.replace(/<span class="slash">\s*\/\s*<\/span>/g, ' ')
  .replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

const only = process.argv[2] ? Number(process.argv[2]) : null;
for (const c of [...P1, ...P2]) {
  if (only && c.no !== only) continue;
  const ch = SOURCE.find(x => x.no === c.no);
  if (!ch) { fail(c.no, '정본에 없음'); continue; }
  const S = ch.sentences;
  if (c.ko.length !== S.length) fail(c.no, `해석 ${c.ko.length} ≠ 문장 ${S.length}`);

  // covers 전수·오름차순
  const cov = c.cards.flatMap(k => k.covers);
  if (cov.join(',') !== S.map((_, i) => i + 1).join(',')) fail(c.no, `covers [${cov}] 가 1..${S.length} 를 정확히 덮지 않음`);

  const sentences = c.cards.map(k => {
    const html = enHtml(k.en);
    const want = k.covers.map(n => S[n - 1]).join(' ');
    if (plain(html) !== want) {
      const a = plain(html); let i = 0; while (i < a.length && a[i] === want[i]) i++;
      fail(c.no, `카드 ${k.covers} 영문 ≠ 정본 @${i}\n       카드: …${a.slice(Math.max(0, i - 30), i + 30)}\n       정본: …${want.slice(Math.max(0, i - 30), i + 30)}`);
    }
    if ((k.para || []).length !== 3) fail(c.no, `카드 ${k.covers} paraphrasing 3단계가 아님`);
    return {
      no: k.covers[0],
      covers: k.covers,
      tags: k.tags ?? ['grammar'],
      en_html: html,
      ko_chunks: String(k.chunks).split(' / ').join(SLASH),
      ko_full: k.covers.map(n => c.ko[n - 1]).join(' '),
      note: inter(k.note),
      points: k.points.map(([kind, text]) => ({ kind, text: inter(text) })),
      paraphrasing: (k.para || []).map(([en, ko], i) => ({ level: ['high', 'mid', 'low'][i], en, ko })),
    };
  });

  if (c.choices.length !== 5) fail(c.no, `보기 ${c.choices.length}개`);
  const [right, ...rest] = c.choices;
  const ordered = rest.slice(); ordered.splice(c.ans - 1, 0, right);
  const choices = ordered.map(([en, ko, comment], i) => ({
    no: i + 1, en, ko, comment: inter(comment), correct: i + 1 === c.ans,
  }));

  const vocab = c.vocab.map(line => {
    const [word, pos, meaning, syn = '—', ant = '—', deriv = '—'] = line.split('|').map(s => s.trim());
    if (!POS_OK.has(pos)) fail(c.no, `품사 표기 이상: ${line}`);
    return { word, pos, meaning, syn, ant, deriv };
  });

  const data = {
    $schema_version: '1.0',
    exam: EXAM,
    question_no: c.no,
    subtitle: ch.subtitle,
    hide_answer: true,
    hide_brand: true,
    hide_head_no: true,
    type: c.type,
    score: 3,
    question_text: c.question,
    summary_ko: c.summary,
    main_idea_en: c.mainIdea,
    title_en: c.titleEn,
    illustration: { file: `assets/illust-${c.no}.jpg`, prompt: c.prompt, scene_ko: c.scene },
    passage: S,
    passage_ko: c.ko,
    choices,
    vocab,
    flow: c.flow.map(([emoji, title, body]) => ({ emoji, title, body: inter(body) })),
    sentences,
  };
  fs.writeFileSync(path.join(OUT, `${c.no}.json`), JSON.stringify(data, null, 1) + '\n', 'utf8');
  console.log(`  WI/${c.no}.json  문장 ${S.length} · 카드 ${sentences.length} · 어휘 ${vocab.length} · 정답 ${'①②③④⑤'[c.ans - 1]}`);
}
if (errors) { console.error(`\n❌ 오류 ${errors}건 — JSON 일부가 잘못 생성됐을 수 있다. 스펙을 고칠 것`); process.exit(1); }
console.log('\n✅ WI 생성 완료');
