#!/usr/bin/env node
/* ===================================================================
 * 목일중3 동아(이병민) — 산출물 전수 검수
 * ===================================================================
 * 4단 대조를 한다.
 *   A) 교과서 원문(_TEXTBOOK.js) ↔ 정본(_SOURCE-*.js)   ← 전사 누락 검출
 *   B) 정본 ↔ 데이터 JSON(passage)                      ← 저작 누락 검출
 *   C) 데이터 ↔ 분석 합본 PDF                            ← 렌더 누락 검출
 *   D) 데이터 ↔ 암기장 PDF                               ← 잘림 검출
 * + 문제 블록 정합(정답 1개·보기 5개·분포), 해석 누락, 어휘 본문등장
 *
 * ★ _TEXTBOOK 은 _SOURCE 와 독립 전사본이어야 의미가 있다.
 *   복사해 오면 전사 누락을 영원히 못 잡는다.
 *
 * 선행: python _memaudit-extract.py   (PDF → dist/_audit, dist/_memaudit 덤프)
 *
 * 사용법: node _audit.mjs [L6|L7|L8]
 * =================================================================== */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TEXTBOOK } from './_TEXTBOOK.js';
import { SOURCE as SRC_L6 } from './_SOURCE-L6.js';
import { SOURCE as SRC_L7 } from './_SOURCE-L7.js';
import { SOURCE as SRC_L8 } from './_SOURCE-L8.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCES = { L6: SRC_L6, L7: SRC_L7, L8: SRC_L8 };
const COMBINED = {
  L6: '목일중3_동아이병민_Lesson6_본문분석_합본.pdf',
  L7: '목일중3_동아이병민_Lesson7_본문분석_합본.pdf',
  L8: '목일중3_동아이병민_Lesson8_본문분석_합본.pdf',
};

/* 비교용 정규화.
   ★ 분석지 PDF 는 영문이 자간 분리("s c i e n t i f i c")되어 추출되므로
     공백을 전부 제거하고 비교한다. 곱슬/직선 따옴표·대시 변형도 흡수. */
const squash = (s) => String(s ?? '')
  .replace(/<span class="slash">\s*\/\s*<\/span>/g, ' ')
  .replace(/<[^>]+>/g, '')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/[‘’ʼ']/g, "'")
  .replace(/[“”"]/g, '"')
  .replace(/[‐-―–—]/g, '-')
  .replace(/\s+/g, '')
  .toLowerCase();

let ERR = 0, WARN = 0, OK = 0;
const err  = (m) => { console.log(`   ❌ ${m}`); ERR++; };
const warn = (m) => { console.log(`   ⚠️  ${m}`); WARN++; };
const ok   = (m) => { console.log(`   ✅ ${m}`); OK++; };

const only = (process.argv[2] || '').toUpperCase();
const TARGETS = only ? [only] : ['L6', 'L7', 'L8'];
if (only && !SOURCES[only]) { console.error(`알 수 없는 과: ${only}`); process.exit(2); }

console.log('🔍 목일중3 동아(이병민) — 산출물 전수 검수');
console.log('   기준: 교과서 원문 독립 전사본(_TEXTBOOK.js)\n');

for (const L of TARGETS) {
  const tb = TEXTBOOK[L];
  const src = SOURCES[L];
  console.log('═'.repeat(64));
  console.log(`${L} — ${tb.title}`);
  console.log('═'.repeat(64));

  /* ── A) 교과서 원문 ↔ 정본 ───────────────────────────────── */
  console.log('\n[A] 교과서 원문 ↔ 정본(_SOURCE) — 전사 누락 검출');
  const tbAll = tb.paragraphs.flatMap(p => p.sentences);
  const srcAll = src.flatMap(c => c.sentences);

  if (tbAll.length !== srcAll.length) {
    err(`문장 수 불일치: 교과서 ${tbAll.length} vs 정본 ${srcAll.length}`);
  }
  // 교과서 기준 전수 — 정본에 있는가
  const srcJoined = srcAll.map(squash).join('|');
  tbAll.forEach((s, i) => {
    if (!srcJoined.includes(squash(s))) err(`교과서 ${i + 1}번 문장이 정본에 없음: ${s.slice(0, 60)}…`);
  });
  // 역방향 — 정본에 교과서에 없는 잉여 문장이 있는가(날조 검출)
  const tbJoined = tbAll.map(squash).join('|');
  srcAll.forEach((s, i) => {
    if (!tbJoined.includes(squash(s))) err(`정본 ${i + 1}번이 교과서에 없는 문장(날조/변형): ${s.slice(0, 60)}…`);
  });
  // 순서까지 일치하는가
  let orderOk = tbAll.length === srcAll.length;
  if (orderOk) for (let i = 0; i < tbAll.length; i++) {
    if (squash(tbAll[i]) !== squash(srcAll[i])) { orderOk = false; err(`정본 ${i + 1}번 순서/내용 불일치\n        교과서: ${tbAll[i]}\n        정본  : ${srcAll[i]}`); }
  }
  if (orderOk) ok(`교과서 ${tbAll.length}문장 = 정본 ${srcAll.length}문장, 순서·표기 일치`);

  // 문단 경계 보존 확인
  const tbPara = tb.paragraphs.map(p => p.sentences.length).join('/');
  const srcPara = src.map(c => c.sentences.length).join('/');
  if (tbPara !== srcPara) warn(`문단 분할 다름: 교과서 본문 ${tbPara} vs 정본 챕터 ${srcPara} (의도적 재조정이면 정상)`);
  else ok(`문단 경계 보존: ${tbPara}`);

  /* ── B) 정본 ↔ 데이터 JSON ───────────────────────────────── */
  console.log('\n[B] 정본 ↔ 데이터 JSON — 저작 누락·문제 블록 정합');
  const answers = [];
  let dataSentTotal = 0;
  for (const ch of src) {
    const f = path.join(__dirname, 'data', L, `${ch.no}.json`);
    let d;
    try { d = JSON.parse(await fs.readFile(f, 'utf8')); }
    catch (e) { err(`Ch${ch.no} JSON 읽기 실패: ${e.message}`); continue; }

    const pas = d.passage || [];
    if (pas.length !== ch.sentences.length) err(`Ch${ch.no} passage ${pas.length} ≠ 정본 ${ch.sentences.length}`);
    ch.sentences.forEach((s, i) => {
      if (squash(pas[i]) !== squash(s)) err(`Ch${ch.no} passage[${i}] 정본 불일치`);
    });
    dataSentTotal += pas.length;

    const ko = d.passage_ko || [];
    if (ko.length !== pas.length) err(`Ch${ch.no} 해석 ${ko.length} ≠ 본문 ${pas.length}`);
    ko.forEach((t, i) => { if (!String(t).trim()) err(`Ch${ch.no} 해석[${i}] 비어 있음`); });

    const ch5 = d.choices || [];
    if (ch5.length !== 5) err(`Ch${ch.no} 보기 ${ch5.length}개 (5개여야 함)`);
    const corr = ch5.filter(c => c.correct);
    if (corr.length !== 1) err(`Ch${ch.no} 정답 ${corr.length}개 (1개여야 함)`);
    else answers.push(corr[0].no);
    ch5.forEach(c => { if (!String(c.comment ?? '').trim()) err(`Ch${ch.no} 보기${c.no} 해설 비어 있음`); });

    // 어휘가 본문에 실제 등장하는가
    // ★ 표제어는 사전형(원형)으로 두는 게 옳으므로, 활용형은 검사기가 흡수한다.
    //   불규칙 동사는 어간 규칙으로 못 잡으므로 표를 둔다(bring→brought 오탐 실측).
    const IRREGULAR = {
      bring: ['brought'], take: ['took', 'taken'], become: ['became'],
      begin: ['began', 'begun'], hear: ['heard'], build: ['built'],
      speak: ['spoke', 'spoken'], know: ['knew', 'known'], leave: ['left'],
      grow: ['grew', 'grown'], see: ['saw', 'seen'], think: ['thought'],
      catch: ['caught'], fall: ['fell', 'fallen'], stand: ['stood'],
      come: ['came'], give: ['gave', 'given'], make: ['made'], sit: ['sat'],
      keep: ['kept'], say: ['said'], find: ['found'], feel: ['felt'],
      spend: ['spent'], hide: ['hid', 'hidden'], blow: ['blew', 'blown'],
      eat: ['ate', 'eaten'], eye: ['eyes'], die: ['died'], eat_: [],
    };
    const body = pas.join(' ').toLowerCase();
    for (const v of (d.vocab || [])) {
      const head = String(v.word || '').toLowerCase().replace(/\(.*?\)/g, ' ');
      const toks = head.split(/[^a-z'-]+/).filter(t => t.length > 2);
      if (!toks.length) continue;
      const hit = toks.some(t => {
        const cands = new Set([t, t.replace(/(ing|ed|es|s)$/, '')]);
        if (t.endsWith('e')) cands.add(t.slice(0, -1));
        if (t.endsWith('y')) cands.add(t.slice(0, -1) + 'i');
        (IRREGULAR[t] || []).forEach(f => cands.add(f));
        return [...cands].some(c => c.length > 2 && body.includes(c));
      });
      if (!hit) warn(`Ch${ch.no} 어휘 "${v.word}" 본문 미등장`);
    }
    if (!(d.flow || []).length) err(`Ch${ch.no} flow 없음`);
    if (!d.illustration?.prompt) warn(`Ch${ch.no} 삽화 프롬프트 없음`);
    else {
      const p = d.illustration.prompt;
      if (!/--ar 16:5/.test(p)) warn(`Ch${ch.no} 삽화 프롬프트에 --ar 16:5 없음`);
      if (!/--v 8\.1/.test(p))  warn(`Ch${ch.no} 삽화 프롬프트에 --v 8.1 없음`);
    }
  }
  if (dataSentTotal === srcAll.length) ok(`데이터 본문 ${dataSentTotal}문장 = 정본 ${srcAll.length}문장`);

  // 정답 분포 — 한쪽 번호 쏠림 검출
  const dist = [1, 2, 3, 4, 5].map(n => answers.filter(a => a === n).length);
  const maxRatio = answers.length ? Math.max(...dist) / answers.length : 0;
  const distStr = dist.map((c, i) => `${'①②③④⑤'[i]}${c}`).join(' ');
  if (maxRatio > 0.5) warn(`정답 쏠림: ${distStr} (정답 ${answers.join('/')})`);
  else ok(`정답 분포 양호: ${distStr} — 순서 ${answers.join('/')}`);

  /* ── C) 데이터 ↔ 분석 합본 PDF ───────────────────────────── */
  console.log('\n[C] 데이터 ↔ 분석 합본 PDF — 렌더 누락');
  const cDump = path.join(__dirname, 'dist', '_audit', `${L}-combined.txt`);
  let cTxt = null;
  try { cTxt = await fs.readFile(cDump, 'utf8'); }
  catch { err(`합본 텍스트 덤프 없음: dist/_audit/${L}-combined.txt → python _memaudit-extract.py ${L}`); }
  if (cTxt) {
    const hay = squash(cTxt);
    let miss = 0;
    srcAll.forEach((s, i) => { if (!hay.includes(squash(s))) { miss++; err(`합본에 원문 ${i + 1}번 없음: ${s.slice(0, 55)}…`); } });
    if (!miss) ok(`합본 PDF 에 원문 ${srcAll.length}문장 전수 수록`);

    // 분석 카드(해석) 전수 수록
    let cardMiss = 0, cardTot = 0;
    for (const ch of src) {
      const d = JSON.parse(await fs.readFile(path.join(__dirname, 'data', L, `${ch.no}.json`), 'utf8'));
      for (const s of (d.sentences || [])) {
        cardTot++;
        if (!hay.includes(squash(s.ko_full))) { cardMiss++; err(`합본에 Ch${ch.no} 분석카드 ${s.no} 해석 없음`); }
      }
    }
    if (!cardMiss) ok(`합본 PDF 에 분석카드 ${cardTot}장 전수 수록`);

    // 삽화 placeholder 여부
    const ph = (cTxt.match(/삽화 영역/g) || []).length;
    if (ph) warn(`삽화 placeholder ${ph}건 — 실제 이미지 미반영(프롬프트만 상태)`);
  }

  /* ── D) 데이터 ↔ 암기장 PDF ─────────────────────────────── */
  console.log('\n[D] 데이터 ↔ 암기장 PDF — 잘림 검출');
  const mDump = path.join(__dirname, 'dist', '_memaudit', `${L}.txt`);
  let mTxt = null;
  try { mTxt = await fs.readFile(mDump, 'utf8'); }
  catch { err(`암기장 덤프 없음: dist/_memaudit/${L}.txt → python _memaudit-extract.py ${L}`); }
  if (mTxt) {
    const hay = squash(mTxt);
    let miss = 0;
    srcAll.forEach((s, i) => { if (!hay.includes(squash(s))) { miss++; err(`암기장 정답면에 ${i + 1}번 없음: ${s.slice(0, 55)}…`); } });
    if (!miss) ok(`암기장 PDF 에 원문 ${srcAll.length}문장 전수 수록`);

    // 한글 제시문도 전수 있는가(문제면)
    let koMiss = 0;
    for (const ch of src) {
      const d = JSON.parse(await fs.readFile(path.join(__dirname, 'data', L, `${ch.no}.json`), 'utf8'));
      (d.passage_ko || []).forEach((k, i) => {
        if (!hay.includes(squash(k))) { koMiss++; err(`암기장 문제면에 Ch${ch.no} 해석 ${i + 1} 없음: ${k.slice(0, 40)}…`); }
      });
    }
    if (!koMiss) ok(`암기장 PDF 에 한글 제시문 ${srcAll.length}개 전수 수록`);

    // 번호 연속성 — 1..N 이 모두 찍혔는가
    const nums = new Set([...mTxt.matchAll(/^\s*(\d+)\./gm)].map(m => +m[1]));
    const gaps = [];
    for (let i = 1; i <= srcAll.length; i++) if (!nums.has(i)) gaps.push(i);
    if (gaps.length) err(`암기장 번호 누락: ${gaps.join(', ')}`);
    else ok(`암기장 번호 1~${srcAll.length} 연속`);
  }

  console.log('');
}

console.log('═'.repeat(64));
console.log(`검수 종료 — 통과 ${OK} · 경고 ${WARN} · 오류 ${ERR}`);
if (ERR) { console.log('\n❌ 결함이 있다. 위 ❌ 항목을 수정할 것.'); process.exit(1); }
console.log('\n✅ 전수 검수 통과 — 교과서 원문 기준 누락·변형 0');
