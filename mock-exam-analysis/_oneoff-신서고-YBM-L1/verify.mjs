#!/usr/bin/env node
/* ===================================================================
 * 신서고 YBM 영어II L1 — 무결성 검증 (문장 누락 0 보장)
 * ===================================================================
 * 원문 정본(_SOURCE.js)과 각 챕터 JSON을 대조해 다음을 강제한다.
 *   1) passage 가 원문과 verbatim 일치 (문장 수·순서·구두점까지)
 *   2) passage_ko / sentences 길이가 passage 와 동일 (분석 누락 0)
 *   3) sentences[i].en_html 의 태그 제거 결과 === passage[i]
 *   4) choices 정답 정확히 1개, vocab/flow 존재
 *
 * 사용법: node _oneoff-신서고-YBM-L1/verify.mjs
 * =================================================================== */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SOURCE } from './_SOURCE.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');

/** en_html → 순수 텍스트. 태그 제거 + HTML 엔티티 복원 + 공백 정규화.
 *  ★ 끊어읽기 마커 <span class="slash">/</span> 는 태그를 벗기면 '/' 문자가 남으므로
 *    태그 제거 '전에' 통째로 걷어낸다. (안 그러면 정상 문장이 전부 불일치로 잡힘) */
function plain(html) {
  return String(html ?? '')
    .replace(/<span class="slash">\s*\/\s*<\/span>/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/** 비교용 정규화 — 곱슬따옴표/대시 변형을 흡수한다(원문 표기 차이는 결함이 아님). */
function norm(s) {
  return plain(s)
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[‐-―]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

let errors = 0;
let warns = 0;
const err = (m) => { console.error(`   ❌ ${m}`); errors++; };
const warn = (m) => { console.warn(`   ⚠️  ${m}`); warns++; };

console.log('🔍 신서고 YBM 영어II Lesson 1 — 무결성 검증\n');

for (const ch of SOURCE) {
  const file = `${ch.no}.json`;
  console.log(`── Chapter ${ch.no} · ${ch.subtitle}`);

  let data;
  try {
    data = JSON.parse(await fs.readFile(path.join(DATA_DIR, file), 'utf8'));
  } catch (e) {
    err(`${file} 을 읽을 수 없음: ${e.message}`);
    continue;
  }

  const src = ch.sentences;
  const pas = data.passage || [];
  const ko = data.passage_ko || [];
  const sents = data.sentences || [];

  // 1) 문장 수
  if (pas.length !== src.length) {
    err(`문장 수 불일치: 원문 ${src.length} vs passage ${pas.length}  ← 누락/중복`);
  }

  // 2) verbatim 대조 (원문 기준 전수)
  for (let i = 0; i < src.length; i++) {
    if (norm(pas[i]) !== norm(src[i])) {
      err(`passage[${i}] 원문 불일치\n        원문: ${src[i]}\n        JSON: ${pas[i] ?? '(없음)'}`);
    }
  }
  // 원문에 없는 잉여 문장
  for (let i = src.length; i < pas.length; i++) {
    err(`passage[${i}] 원문에 없는 잉여 문장: ${pas[i]}`);
  }

  // 3) 해석·분석 길이 동기화
  if (ko.length !== pas.length) err(`passage_ko 길이 ${ko.length} ≠ passage ${pas.length}  ← 해석 누락`);
  ko.forEach((t, i) => { if (!String(t).trim()) err(`passage_ko[${i}] 비어 있음`); });

  // 4) 문장분석 ↔ 본문 정합
  //    ★ 짧은 문장은 한 카드에 여러 개를 묶으므로(2026-08-14 정책) 카드 수 = 문장 수가
  //      아니다. 대신 "카드들의 영어를 순서대로 이어붙이면 원문 전체와 일치"를 검사한다.
  //      → 병합은 허용하되 누락·순서 변경·문장 변형은 전부 잡힌다.
  const cardTexts = sents.map(s => norm(s.en_html));
  const joinedCards = cardTexts.join(' ').replace(/\s+/g, ' ').trim();
  const joinedSrc = pas.map(norm).join(' ').replace(/\s+/g, ' ').trim();
  if (joinedCards !== joinedSrc) {
    err('분석 카드 전체가 본문 전체와 불일치 ← 문장 누락/변형 의심');
    // 어디서 갈라지는지 첫 지점을 보고한다.
    const a = joinedCards, b = joinedSrc;
    let k = 0; while (k < a.length && k < b.length && a[k] === b[k]) k++;
    err(`  최초 불일치 위치 ${k}자\n        카드: ...${a.slice(Math.max(0, k - 60), k + 60)}\n        원문: ...${b.slice(Math.max(0, k - 60), k + 60)}`);
  }

  // 카드가 커버하는 원문 문장 번호(covers)가 있으면 전수 커버를 검사한다.
  const covered = new Set();
  sents.forEach((s, i) => {
    const cov = s.covers || [s.no];
    cov.forEach(n => covered.add(n));
    if (!String(s.ko_full ?? '').trim()) err(`sentences[${i}].ko_full 비어 있음`);
    if (!String(s.ko_chunks ?? '').trim()) err(`sentences[${i}].ko_chunks 비어 있음`);
    if (!(s.points || []).length) err(`sentences[${i}] points 없음 (분석 누락)`);
  });
  for (let n = 1; n <= pas.length; n++) {
    if (!covered.has(n)) err(`원문 ${n}번 문장을 어떤 분석 카드도 다루지 않음 ← 분석 누락`);
  }
  // 카드 번호는 오름차순이어야 한다(순서 뒤바뀜 방지).
  for (let i = 1; i < sents.length; i++) {
    if (!(sents[i].no > sents[i - 1].no)) err(`sentences[${i}].no(${sents[i].no}) 가 앞 카드(${sents[i - 1].no})보다 크지 않음`);
  }

  // 5) 문제 블록
  const correct = (data.choices || []).filter(c => c.correct);
  if ((data.choices || []).length !== 5) err(`choices 가 5개가 아님 (${(data.choices || []).length}개)`);
  if (correct.length !== 1) err(`정답이 정확히 1개가 아님 (${correct.length}개)`);
  (data.choices || []).forEach(c => {
    if (!String(c.comment ?? '').trim()) err(`choices[${c.no}] comment 비어 있음`);
  });

  // 6) 부가 블록
  if (!(data.vocab || []).length) err('vocab 없음');
  if ((data.flow || []).length !== 4) warn(`flow 가 4단계가 아님 (${(data.flow || []).length}단계)`);
  if (!data.illustration?.file) warn('illustration.file 없음');
  if (!data.illustration?.prompt) warn('illustration.prompt 없음');

  // 7) 어휘가 본문에 실제 등장하는지 (교재 품질 규칙 ③)
  //    구동사(take away)·굴절형(tried out)을 감안해 어간 기준으로 느슨하게 본다.
  //    표제어의 토큰 중 '하나라도' 본문에 어간 일치하면 통과 — 오탐 방지.
  const bodyLower = pas.join(' ').toLowerCase();
  /** 굴절 어미를 떼어 어간 후보를 만든다. */
  const stem = (w) => w.replace(/(ing|ed|es|s)$/, '');
  /** 불규칙 동사 원형 → 본문에 나타날 수 있는 활용형(표제어는 원형으로 두는 게 맞으므로 예외 처리). */
  const IRREGULAR = {
    overcome: ['overcame', 'overcome'],
    take: ['took', 'taken', 'take'],
    become: ['became', 'become'],
    begin: ['began', 'begun', 'begin'],
    hear: ['heard', 'hear'],
    spread: ['spread'],
    build: ['built', 'build'],
    speak: ['spoke', 'spoken', 'speak'],
    know: ['knew', 'known', 'know'],
    bring: ['brought', 'bring'],
    fight: ['fought', 'fight'],
    leave: ['left', 'leave'],
  };
  for (const v of (data.vocab || [])) {
    const head = String(v.word || '').toLowerCase().replace(/\(.*?\)/g, ' ');
    const tokens = head.split(/[^a-z'-]+/).filter(t => t.length > 2);
    if (!tokens.length) continue;
    const hit = tokens.some(t =>
      bodyLower.includes(t) ||
      bodyLower.includes(stem(t)) ||
      (IRREGULAR[t] || []).some(f => bodyLower.includes(f)));
    if (!hit) warn(`vocab "${v.word}" 가 본문에 등장하지 않음`);
  }

  console.log(`   문장 ${pas.length} · 해석 ${ko.length} · 분석 ${sents.length} · 어휘 ${(data.vocab || []).length}`);
  console.log('');
}

console.log('─'.repeat(60));
const total = SOURCE.reduce((a, c) => a + c.sentences.length, 0);
console.log(`원문 총 문장: ${total}`);
if (errors) {
  console.error(`\n❌ 검증 실패 — 오류 ${errors}건, 경고 ${warns}건`);
  process.exit(1);
}
console.log(`\n✅ 검증 통과 — 오류 0건, 경고 ${warns}건 (문장 누락 없음)`);
