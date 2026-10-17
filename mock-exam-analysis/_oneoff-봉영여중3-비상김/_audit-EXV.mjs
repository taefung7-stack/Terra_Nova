#!/usr/bin/env node
/* ===================================================================
 * 봉영여중3 추가지문 9·10·11 (EXV) — 워크북·변형문제 산출물 전수 대조
 * ===================================================================
 * verify-*-EXV.mjs 는 "데이터" 정합만 본다. 여기서는 "인쇄물"을 본다.
 *   [1] 원문 3중 일치 : _SOURCE-EX.js ↔ data/EX/N.json ↔ data/EXV/N.json (passage·passage_ko)
 *   [2] 워크북 HTML   : STEP1 본문 전 문장 수록 · STEP2/3 양자택일 슬롯 수 · STEP4 첫글자 빈칸 수 ·
 *                       STEP5/7 제시문 · STEP6 배열 단어 집합 · STEP9 정답 전수 수록
 *   [3] 변형문제 PDF  : 문항 51개 연속 · 유형 passage 문장 전부 인쇄 · 밑줄/빈칸 대상 인쇄 ·
 *                       정답지 ①~⑤ 가 데이터 answer 와 순서대로 일치
 * 입력: dist/EXV/workbook-{9,10,11}.html, dist/EXV/variant-book.pdf (PyMuPDF 로 텍스트 추출)
 * 사용법: node _audit-EXV.mjs     (python + PyMuPDF 필요)
 * =================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { SOURCE } from './_SOURCE-EX.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const NS = [9, 10, 11];
const NUM = ['①', '②', '③', '④', '⑤'];
let errors = 0, checks = 0;
const ok = (cond, msg) => { checks++; if (!cond) { errors++; console.log('  ❌ ' + msg); } };
const J = (p) => JSON.parse(fs.readFileSync(path.join(HERE, p), 'utf8'));
const unesc = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const text = (html) => unesc(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');
const sq = (s) => s.replace(/\s+/g, ' ').trim();

/* ── [1] 원문 3중 일치 ── */
console.log('[1] 원문 3중 일치');
for (const n of NS) {
  const src = SOURCE[n - 1].sentences;
  const ex = J(`data/EX/${n}.json`), exv = J(`data/EXV/${n}.json`);
  ok(JSON.stringify(src) === JSON.stringify(ex.passage), `${n}: _SOURCE ↔ EX passage 불일치`);
  ok(JSON.stringify(ex.passage) === JSON.stringify(exv.passage), `${n}: EX ↔ EXV passage 불일치`);
  ok(JSON.stringify(ex.passage_ko) === JSON.stringify(exv.passage_ko), `${n}: EX ↔ EXV passage_ko 불일치`);
  const diffKeys = Object.keys(ex).filter(k => JSON.stringify(ex[k]) !== JSON.stringify(exv[k]));
  ok(diffKeys.join() === 'exam', `${n}: EX ↔ EXV 차이 필드 = [${diffKeys}] (exam 만 허용)`);
  console.log(`  ${n}: ${src.length}문장 · EXV 차이 필드 [${diffKeys}]`);
}

/* ── [2] 워크북 HTML ── */
console.log('[2] 워크북 HTML');
for (const n of NS) {
  const data = J(`data/EXV/${n}.json`), wb = J(`data/EXV/${n}-workbook.json`);
  const html = fs.readFileSync(path.join(HERE, `dist/EXV/workbook-${n}.html`), 'utf8');
  const secs = html.match(/<section class="page"[^>]*data-step="\d+"[^>]*>[\s\S]*?<\/section>/g) || [];
  const step = (k) => secs.filter(s => new RegExp(`data-step="${k}"`).test(s)).join('\n');
  const t1 = text(step(1)), t9 = text(step(9));
  data.passage.forEach((s, i) => ok(t1.includes(sq(s)), `${n} STEP1 본문 ${i + 1} 누락: ${s.slice(0, 50)}`));
  data.passage_ko.forEach((s, i) => ok(t1.includes(sq(s)), `${n} STEP1 해석 ${i + 1} 누락: ${s.slice(0, 30)}`));
  // 양자택일 슬롯: 데이터 슬롯 수 = 렌더된 A/B 쌍 수
  for (const [k, key] of [[2, 'grammar_choice'], [3, 'vocab_choice']]) {
    const want = wb[key].reduce((a, it) => a + it.answers.length, 0);
    const t = text(step(k));
    let got = 0;
    for (const it of wb[key]) for (const m of it.en_template.matchAll(/\{\{\d+:([^\/]+)\/([^}]+)\}\}/g)) {
      if (t.includes(`${m[1].trim()} / ${m[2].trim()}`) || t.includes(`${m[2].trim()} / ${m[1].trim()}`)) got++;
      else ok(false, `${n} STEP${k} 보기 "${m[1]} / ${m[2]}" 미렌더`);
    }
    ok(got === want, `${n} STEP${k} 슬롯 ${got}/${want}`);
  }
  // 빈칸 첫글자
  const want4 = wb.fill_first_letter.reduce((a, it) => a + it.hints.length, 0);
  const got4 = (step(4).match(/class="fh-letter"/g) || []).length;
  ok(got4 === want4, `${n} STEP4 첫글자 빈칸 ${got4}/${want4} (빌더가 지운 힌트 있음)`);
  // STEP5 해석 제시문 / STEP7 영작 제시 한글
  const t5 = text(step(5)), t7 = text(step(7));
  wb.ko_translation.forEach(it => ok(t5.includes(sq(data.passage[it.ref_sentence - 1])), `${n} STEP5 문장 ${it.ref_sentence} 미렌더`));
  wb.sentence_translation.forEach(it => ok(t7.includes(sq(data.passage_ko[it.ref_sentence - 1])), `${n} STEP7 한글 ${it.ref_sentence} 미렌더`));
  // STEP6 배열 단어 집합 (렌더된 단어 칩 vs 원문)
  const t6 = step(6);
  const items6 = t6.split(/class="jumble-item"/).slice(1);
  const bare = (s) => s.replace(/[’']/g, "'").replace(/[“”".,!?:;]/g, '').split(/\s+/).filter(Boolean).sort().join(' ');
  wb.jumble.forEach((it, i) => {
    const seg = items6[i] || '';
    const wm = seg.match(/class="ji-words">([\s\S]*?)<\/div>/);
    const chips = wm ? text(wm[1]).replace(/^\s*\[|\]\s*$/g, '').split(' / ').map(x => x.trim()).filter(Boolean) : [];
    if (chips.length) ok(bare(chips.join(' ')) === bare(data.passage[it.ref_sentence - 1]), `${n} STEP6 #${it.no} 단어 집합 불일치\n      ${chips.join(' ')}`);
    else ok(text(t6).includes(`${data.passage_ko[it.ref_sentence - 1].slice(0, 15)}`), `${n} STEP6 #${it.no} 단어칩 파싱 실패`);
  });
  // STEP9 정답지: 양자택일 정답, 빈칸 답, 배열 정답 문장
  for (const key of ['grammar_choice', 'vocab_choice']) for (const it of wb[key]) for (const a of it.answers)
    ok(t9.includes(a), `${n} STEP9 ${key} #${it.no} 정답 "${a}" 미수록`);
  for (const it of wb.fill_first_letter) for (const h of it.hints) ok(t9.includes(h.answer), `${n} STEP9 빈칸 "${h.answer}" 미수록`);
  for (const it of wb.jumble) ok(t9.includes(sq(data.passage[it.ref_sentence - 1])), `${n} STEP9 배열 정답 ${it.ref_sentence} 미수록`);
  console.log(`  ${n}: STEP1 ${data.passage.length}문장 · 어법/어휘 슬롯 · 첫글자 ${got4}/${want4} · 해석 ${wb.ko_translation.length} · 영작 ${wb.sentence_translation.length} · 배열 ${wb.jumble.length}`);
}

/* ── [3] 변형문제 PDF ── */
console.log('[3] 변형문제 PDF');
const py = `import fitz,sys\nd=fitz.open(sys.argv[1])\nsys.stdout.reconfigure(encoding='utf-8')\nprint('\\n'.join('=== p%d\\n'%(i+1)+p.get_text() for i,p in enumerate(d)))`;
const raw = execFileSync('python', ['-c', py, path.join(HERE, 'dist/EXV/variant-book.pdf')], { encoding: 'utf8', maxBuffer: 64 << 20 });
const flat = raw.replace(/=== p\d+\n/g, ' ').replace(/-\n/g, '-').replace(/\s+/g, ' ')
  .replace(/[①②③④⑤]\s?/g, '').replace(/\s+/g, ' ');
// 줄바꿈·하이픈 분리·한글 어절 공백 흔들림을 흡수하려고 공백을 전부 지우고 비교한다
const tight = flat.replace(/\s+/g, '');
const has = (s) => tight.includes(String(s).replace(/[①②③④⑤]/g, '').replace(/\s+/g, ''));
const TYPES = ['theme', 'gist', 'title', 'implication', 'grammar', 'vocab', 'blank', 'irrelevant', 'order', 'insert', 'summary'];
const V = Object.fromEntries(NS.map(n => [n, J(`data/EXV/${n}-variant.json`).by_type]));
const BLANK = /_{3,}/;
for (const n of NS) for (const k of TYPES) {
  const v = V[n][k];
  for (const s of (v.passage || [])) {
    const probe = BLANK.test(s) ? s.split(BLANK)[0] : s;
    ok(has(probe), `${n} ${k} 지문 문장 미인쇄: ${s.slice(0, 60)}`);
  }
  for (const s of (v.sentences || [])) ok(has(s), `${n} ${k} 문장 미인쇄: ${s.slice(0, 60)}`);
  if (v.intro) ok(has(v.intro), `${n} ${k} intro 미인쇄`);
  if (v.given) ok(has(v.given), `${n} ${k} given 미인쇄`);
  for (const b of Object.values(v.blocks || {})) ok(has(b), `${n} ${k} 블록 미인쇄: ${b.slice(0, 50)}`);
  if (v.insert_sentence) ok(has(v.insert_sentence), `${n} ${k} 삽입문 미인쇄`);
  for (const s of (v.passage_marked || [])) ok(has(s.text), `${n} ${k} 삽입 지문 미인쇄: ${s.text.slice(0, 50)}`);
  for (const c of (v.choices || [])) if (!NUM.includes(c)) ok(has(c), `${n} ${k} 보기 미인쇄: ${c}`);
  for (const o of (v.options || [])) ok(has(`${o.A} ${o.B}`), `${n} ${k} 요약 보기 ${o.no} 미인쇄`);
}
// 정답지 순서: 유형별 9→10→11, 그다음 서술형
const ansPages = raw.split(/=== p\d+\n/).filter(p => p.includes('정답 · 해설') || p.includes('정답 ·'));
const ansSeq = [...ansPages.join('\n').matchAll(/정답\s*([①②③④⑤])/g)].map(m => m[1]);
const expect = TYPES.flatMap(k => NS.map(n => NUM[V[n][k].answer - 1]));
ok(ansSeq.slice(0, 33).join('') === expect.join(''), `정답지 객관식 순서 불일치\n      PDF : ${ansSeq.slice(0, 33).join('')}\n      data: ${expect.join('')}`);
// 문항 번호 1..51
const qnos = new Set([...raw.matchAll(/^(\d{1,2})\r?$/gm)].map(m => +m[1]));
for (let i = 1; i <= 51; i++) ok(qnos.has(i), `문항 번호 ${i} 없음`);
// 서술형 정답
for (const n of NS) for (const w of V[n].writing) {
  for (const a of [w.answer, w.answer_a, w.answer_b].filter(Boolean)) ok(has(a), `${n} 서술형 ${w.subtype} 정답 미인쇄: ${a.slice(0, 50)}`);
}
console.log(`  객관식 정답 PDF ${ansSeq.slice(0, 33).join('')}`);
console.log(`  객관식 정답 data ${expect.join('')}`);

console.log(`\n${errors ? '❌' : '✅'} 검사 ${checks}건 · 오류 ${errors}건`);
process.exit(errors ? 1 : 0);
