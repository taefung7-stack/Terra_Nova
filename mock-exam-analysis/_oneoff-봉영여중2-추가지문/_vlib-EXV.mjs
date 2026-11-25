/* ===================================================================
 * 봉영여중2 영어B 추가지문 — 변형문제 저작 공통 헬퍼 (_oneoff-봉영여중3-비상김/_author-EX4V-variant.mjs 에서 분리)
 * ===================================================================
 * write(n, topic, by_type) 가
 *   ① data/EX/{n}.json(분석지)을 data/EXV/{n}.json 으로 복사하며 exam 만 바꾸고
 *      (build-variant 가 exam 끝의 "N학년"을 떼어 머리글에 다시 붙인다)
 *   ② data/EXV/{n}-variant.json 을 쓴다.
 * 스키마: variant-v0.3-type-grouped
 * ⚠️ summary.options[].no = 배열 위치 / blank_sentence_index 0-based + 그 문장에 ___ /
 *    따옴표·아포스트로피는 곱슬형만 / 배열 영작 <보기>는 scramble() 로 섞는다.
 * =================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.join(HERE, 'data', 'EX');
const DIR = path.join(HERE, 'data', 'EXV');
export const EXAM_V = '봉영여중 영어B 추가지문 2학년';
export const NUM = ['①', '②', '③', '④', '⑤'];
export const ORDER = ['(A) - (B) - (C)', '(A) - (C) - (B)', '(B) - (A) - (C)', '(B) - (C) - (A)', '(C) - (A) - (B)'];
export const BLANK = '______________________';

export const ul = (list) => list.map(([sent_index, text, fix], i) => (fix
  ? { no: i + 1, sent_index, text, correct: false, fix }
  : { no: i + 1, sent_index, text, correct: true }));
export const summaryOpts = (pairs) => pairs.map(([A, B], i) => ({ no: i + 1, A, B }));

const hash = (str) => { let h = 2166136261; for (const c of str) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const rngOf = (seed) => { let t = seed; return () => { t = (t + 0x6D2B79F5) >>> 0; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; };
/* 배열 영작 <보기> 섞기 — 결정적. 원문 이웃 단어쌍이 남지 않고 첫 단어도 원래 첫 단어가 아니도록. */
function scramble(words, seedKey) {
  const k = (w) => w.toLowerCase();
  const adj = new Set(words.slice(1).map((w, i) => `${k(words[i])} ${k(w)}`));
  let best = null, bestScore = Infinity;
  for (let attempt = 0; attempt < 2000 && bestScore > 0; attempt++) {
    const rng = rngOf(hash(`${seedKey}#${attempt}`));
    const arr = words.slice();
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    const kept = arr.slice(1).filter((w, i) => adj.has(`${k(arr[i])} ${k(w)}`)).length;
    const score = kept * 2 + (k(arr[0]) === k(words[0]) ? 1 : 0);
    if (score < bestScore) { best = arr; bestScore = score; }
  }
  return best;
}

export function write(n, topic_ko, bt) {
  const data = JSON.parse(fs.readFileSync(path.join(SRC_DIR, `${n}.json`), 'utf8'));
  fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(path.join(DIR, `${n}.json`), JSON.stringify({ ...data, exam: EXAM_V }, null, 2) + '\n', 'utf8');
  const ko = (r) => data.passage_ko[r - 1];
  const en = (r) => data.passage[r - 1];
  for (const w of bt.writing) {
    if (!w.ref) continue;
    if (w.subtype === 'word_order') {
      w.answer = en(w.ref);
      w.ko_prompt = ko(w.ref);
      w.words = scramble(en(w.ref).split(/\s+/).map(t => t.replace(/[,.!?:;”“]/g, '')).filter(Boolean)
        .map((t, i) => (i === 0 && !/^(Mr|I)$/.test(t) ? t.toLowerCase() : t)), `EXV|${n}|${w.ref}`);
    } else if (w.subtype === 'translate_ko') {
      w.en_prompt = en(w.ref);
      w.answer = ko(w.ref);
    } else if (w.subtype === 'conditioned_write') {
      w.answer = en(w.ref);
      w.ko_prompt = ko(w.ref);
    }
    delete w.ref;
  }
  const out = { $schema_version: 'variant-v0.3-type-grouped', $ref_source: `${n}.json`, passage_id: n, topic_ko, by_type: bt };
  fs.writeFileSync(path.join(DIR, `${n}-variant.json`), JSON.stringify(out, null, 2) + '\n', 'utf8');
  const ans = Object.entries(bt).filter(([kk]) => kk !== 'writing').map(([kk, v]) => `${kk}${NUM[v.answer - 1]}`);
  console.log(`✓ ${n}-variant.json  ${ans.join(' ')} · 서술형 ${bt.writing.length}`);
}
