#!/usr/bin/env node
/* ===================================================================
 * 2027학년도 수능 영어 — 분석지 데이터 생성기
 * ===================================================================
 * _SOURCE.js(원문·보기·정답 정본) + _spec/{N}.mjs(해설 압축 표기) → data/{N}.json
 * ★ data/*.json 을 직접 고치지 말고 스펙을 고친 뒤 다시 돌린다.
 *
 *   node 2027-suneung/_author.mjs        # 전 지문
 *   node 2027-suneung/_author.mjs 31     # 31번만
 *
 * 압축 표기
 *  en     : [h:핵심어] [g:동사·구문] [r:중요 표현] [k:주제 어구] [i:이탤릭]  ' / ' = 끊어읽기
 *  chunks : ' / ' = 끊어읽기
 *  note·points·comment : `영문` → Inter 글꼴, **강조** → <strong>
 *  para   : ['상 en || 상 ko', '중 …', '하 …'] — 핵심 문장에만(없으면 빈 배열)
 *
 * 검사(오류면 exit 1)
 *  · 카드 수 = 본문 문장 수, 각 카드 영문(태그 제거) = 원문 문장
 *  · passage_ko·보기 해설 5개·vocab 25·flow 4
 *  · 정답은 시험지(홀수형) 순서 그대로 — 재배치하지 않는다
 * =================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { SOURCE, META } from './_SOURCE.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'data');
fs.mkdirSync(OUT, { recursive: true });

let errors = 0;
const fail = (n, m) => { errors++; console.error(`  ❌ [${n}] ${m}`); };

const inter = (s) => String(s ?? '')
  .replace(/`([^`]+)`/g, '<span style="font-family:Inter">$1</span>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
const SLASH = ' <span class="slash">/</span> ';
function enHtml(s) {
  let out = String(s);
  const re = /\[(h|g|r|k|i):([^\[\]]*)\]/;
  const CLS = { h: 'hl', g: 'hl-g', r: 'hl-r', k: 'key' };
  while (re.test(out)) {
    out = out.replace(re, (_, k, body) => k === 'i'
      ? `<span style="font-style:italic">${body}</span>`
      : `<span class="${CLS[k]}">${body}</span>`);
  }
  return out.split(' / ').join(SLASH);
}
const chunks = (s) => String(s).split(' / ').join(SLASH);
const plain = (html) => html.replace(/<span class="slash">\s*\/\s*<\/span>/g, ' ')
  .replace(/<[^>]+>/g, '')
  .replace(/[①②③④⑤]/g, '')          // 어법·어휘 문항 번호 표시는 대조에서 제외
  .replace(/\([a-e]\)\s/g, '')        // 42번 (a)~(e) 표시도 제외
  .replace(/\s+/g, ' ').trim();

async function build(n) {
  const src = SOURCE[n];
  const spec = (await import(pathToFileURL(path.join(HERE, '_spec', `${n}.mjs`)).href)).default;
  const P = src.passage;
  if (spec.ko.length !== P.length) fail(n, `passage_ko ${spec.ko.length} ≠ 본문 ${P.length}`);
  if (spec.cards.length !== P.length) fail(n, `카드 ${spec.cards.length} ≠ 본문 ${P.length}`);
  if (spec.comments.length !== 5) fail(n, `보기 해설 ${spec.comments.length}개`);
  if (spec.vocab.length !== 25) fail(n, `vocab ${spec.vocab.length}개 (25개)`);
  if (spec.flow.length !== 4) fail(n, `flow ${spec.flow.length}개 (4개)`);

  const sentences = spec.cards.map((c, i) => {
    const html = enHtml(c.en);
    if (plain(html) !== P[i]) fail(n, `카드 ${i + 1} 영문 불일치\n     카드: ${plain(html)}\n     원문: ${P[i]}`);
    return {
      no: i + 1, tags: c.tags || [],
      en_html: html, ko_chunks: chunks(c.chunks), ko_full: spec.ko[i],
      note: `<strong>해석 도움</strong> — ${inter(c.note)}`,
      points: c.points.map(([kind, head, body]) => ({ kind, text: `<strong>${head}</strong> — ${inter(body)}` })),
      paraphrasing: (c.para || []).map((s, k) => {
        const [en, ko] = s.split(' || ');
        return { level: ['high', 'mid', 'low'][k], en, ko };
      }),
    };
  });

  const data = {
    $schema_version: '1.0', exam: META.exam, question_no: n,
    type: src.type, score: src.score, question_text: src.q,
    summary_ko: spec.summary_ko, main_idea_en: spec.main_idea_en, title_en: spec.title_en,
    illustration: { file: `assets/illust-${n}.png`, prompt: spec.illust },
    passage: P, passage_ko: spec.ko,
    choices: src.choices.map((en, i) => ({
      no: i + 1, en, ko: (spec.cko || [])[i] ?? '', comment: inter(spec.comments[i]), correct: i + 1 === src.ans,
    })),
    vocab: spec.vocab.map(([word, pos, meaning, syn, ant, deriv]) => ({ word, pos, meaning, syn, ant, deriv })),
    flow: spec.flow.map(([emoji, title, body]) => ({ emoji, title, body })),
    sentences,
  };
  /* 어휘 표제어 본문 등장 검사(굴절 흡수) */
  const body = P.join(' ').toLowerCase();
  for (const [w] of spec.vocab) {
    const toks = w.toLowerCase().replace(/\(.*?\)/g, ' ').split(/[^a-z'-]+/).filter(t => t.length > 2);
    const hit = toks.some(t => [t, t.replace(/(ing|ed|es|s|e|y)$/, '')].some(s => s.length > 2 && body.includes(s)));
    if (!hit) console.warn(`  ⚠️  [${n}] vocab "${w}" 본문 미등장?`);
  }
  if (/\bNO\s+[a-z]/.test(spec.illust) || !spec.illust.includes('--ar 16:5') || !spec.illust.includes('--v 8.1') || !/--no\s/.test(spec.illust)) fail(n, '삽화 프롬프트 규격(--ar 16:5 --v 8.1, --no, 인라인 NO 금지)');
  fs.writeFileSync(path.join(OUT, `${n}.json`), JSON.stringify(data, null, 1) + '\n');
  console.log(`✓ ${n}  문장 ${P.length} · 카드 ${sentences.length} · 어휘 ${data.vocab.length} · 정답 ${'①②③④⑤'[src.ans - 1]}`);
}

const NOS = Object.keys(SOURCE).map(Number);
const only = process.argv[2] ? [+process.argv[2]] : NOS;
for (const n of only) {
  if (!fs.existsSync(path.join(HERE, '_spec', `${n}.mjs`))) { console.log(`· ${n} 스펙 없음`); continue; }
  await build(n);
}
if (errors) { console.error(`\n❌ 오류 ${errors}건`); process.exit(1); }
console.log('\n✅ 생성 완료 — 오류 0');
