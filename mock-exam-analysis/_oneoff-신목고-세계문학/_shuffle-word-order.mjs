#!/usr/bin/env node
/* ===================================================================
 * 서술형 "배열 영작"(word_order) / 워크북 "영문 배열"(jumble) 단어 순서 섞기
 * -------------------------------------------------------------------
 * 문제: writing[].subtype === 'word_order' 의 `words` 배열과
 *       workbook jumble[].words 배열이 전부 answer 문장과 완전히
 *       동일한 순서로 저장되어 있어, 학생이 재배열할 필요 없이
 *       <보기> 를 그대로 옮겨 적기만 하면 정답이 되는 상태였다.
 * 해결: `answer` 문장(진실의 원천)은 그대로 두고, `words` 배열만
 *       원래 순서와 달라질 때까지 무작위로 섞는다. 내용은 건드리지 않음.
 * =================================================================== */
import fs from 'fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

// 결정적 시드 기반 PRNG (재현 가능한 셔플)
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; }
  return h;
}

function shuffleArray(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sameOrder(a, b) {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

/* words 배열을 섞되:
 * - 원래 순서와 완전히 같으면 재시도
 * - 단어 수 <= 1 이면 섞을 수 없으므로 그대로 반환(플래그)
 * - 최대 50회 시도 후에도 실패하면(이론상 3단어 미만 극단 케이스) 원본 유지 + 경고
 */
function shuffleWords(words, seedKey) {
  if (words.length <= 2) {
    return { words, changed: false, skipped: true };
  }
  let seed = hashStr(seedKey);
  for (let attempt = 0; attempt < 50; attempt++) {
    const rng = mulberry32(seed + attempt);
    const shuffled = shuffleArray(words, rng);
    if (!sameOrder(shuffled, words)) {
      return { words: shuffled, changed: true, skipped: false };
    }
  }
  return { words, changed: false, skipped: false, failed: true };
}

const results = { variant: [], workbook: [] };

// ── 1) variant.json: by_type.writing[].subtype === 'word_order' ──
const variantFiles = fs.readdirSync(path.join(HERE, 'data'))
  .flatMap(unit => {
    const dir = path.join(HERE, 'data', unit);
    if (!fs.statSync(dir).isDirectory()) return [];
    return fs.readdirSync(dir)
      .filter(f => f.endsWith('-variant.json'))
      .map(f => path.join(dir, f));
  });

for (const file of variantFiles) {
  const raw = fs.readFileSync(file, 'utf-8');
  const data = JSON.parse(raw);
  const writing = data.by_type?.writing;
  if (!Array.isArray(writing)) continue;

  let fileChanged = false;
  for (const item of writing) {
    if (item.subtype !== 'word_order') continue;
    const seedKey = `${path.basename(file)}::${item.no ?? item.ko_prompt}`;
    const { words, changed, skipped, failed } = shuffleWords(item.words, seedKey);
    if (changed) {
      item.words = words;
      fileChanged = true;
      results.variant.push({ file: path.relative(HERE, file), no: item.no, status: 'shuffled' });
    } else if (skipped) {
      results.variant.push({ file: path.relative(HERE, file), no: item.no, status: 'skipped(<=2 words)' });
    } else if (failed) {
      results.variant.push({ file: path.relative(HERE, file), no: item.no, status: 'FAILED' });
    }
  }
  if (fileChanged) {
    fs.writeFileSync(file, JSON.stringify(data, null, 1) + '\n', 'utf-8');
  }
}

// ── 2) workbook.json: jumble[].words ──
const workbookFiles = fs.readdirSync(path.join(HERE, 'data'))
  .flatMap(unit => {
    const dir = path.join(HERE, 'data', unit);
    if (!fs.statSync(dir).isDirectory()) return [];
    return fs.readdirSync(dir)
      .filter(f => f.endsWith('-workbook.json'))
      .map(f => path.join(dir, f));
  });

for (const file of workbookFiles) {
  const raw = fs.readFileSync(file, 'utf-8');
  const data = JSON.parse(raw);
  const jumble = data.jumble;
  if (!Array.isArray(jumble)) continue;

  let fileChanged = false;
  for (const item of jumble) {
    const seedKey = `${path.basename(file)}::jumble::${item.no}`;
    const { words, changed, skipped, failed } = shuffleWords(item.words, seedKey);
    if (changed) {
      item.words = words;
      fileChanged = true;
      results.workbook.push({ file: path.relative(HERE, file), no: item.no, status: 'shuffled' });
    } else if (skipped) {
      results.workbook.push({ file: path.relative(HERE, file), no: item.no, status: 'skipped(<=2 words)' });
    } else if (failed) {
      results.workbook.push({ file: path.relative(HERE, file), no: item.no, status: 'FAILED' });
    }
  }
  if (fileChanged) {
    fs.writeFileSync(file, JSON.stringify(data, null, 1) + '\n', 'utf-8');
  }
}

console.log('=== variant word_order ===');
for (const r of results.variant) console.log(` ${r.file} #${r.no}: ${r.status}`);
console.log(`\n총 ${results.variant.length}건 (shuffled: ${results.variant.filter(r=>r.status==='shuffled').length})`);

console.log('\n=== workbook jumble ===');
for (const r of results.workbook) console.log(` ${r.file} #${r.no}: ${r.status}`);
console.log(`\n총 ${results.workbook.length}건 (shuffled: ${results.workbook.filter(r=>r.status==='shuffled').length})`);

const failedCount = [...results.variant, ...results.workbook].filter(r => r.status === 'FAILED').length;
if (failedCount > 0) {
  console.error(`\n⚠️  ${failedCount}건 셔플 실패 — 수동 확인 필요`);
  process.exit(1);
}
