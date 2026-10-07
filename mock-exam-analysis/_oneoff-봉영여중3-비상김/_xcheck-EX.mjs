/* 추가지문(EX) 전사 대조 — 정본(손 분할) ↔ RAW 기계 분할 ↔ 챕터 JSON ↔ 합본 PDF 텍스트
 * ★ 정규화 없이 **문자 단위 완전 일치**를 요구한다(따옴표·대시·쉼표까지).
 * 사용법: node _gen-textbook-EX.mjs && node _xcheck-EX.mjs [--pdf]
 *   --pdf : dist/_audit/EX-combined.txt(합본 PDF 텍스트 덤프)에 전 문장이 실렸는지도 본다. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SOURCE } from './_SOURCE-EX.js';
import { TEXTBOOK_EX } from './_TEXTBOOK-EX.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let err = 0, chars = 0;
const bad = (m) => { err++; console.log('  ✗ ' + m); };
for (const ch of SOURCE) {
  const tb = TEXTBOOK_EX[ch.no]?.sentences;
  if (!tb) { bad(`Ch${ch.no}: RAW 없음`); continue; }
  if (tb.length !== ch.sentences.length) bad(`Ch${ch.no}: 문장 수 정본 ${ch.sentences.length} ≠ RAW ${tb.length}`);
  ch.sentences.forEach((s, i) => {
    chars += s.length;
    if (s !== tb[i]) {
      let k = 0; while (k < s.length && s[k] === tb[i]?.[k]) k++;
      bad(`Ch${ch.no} #${i + 1} 불일치 @${k}\n     정본: …${s.slice(Math.max(0, k - 25), k + 25)}\n     RAW : …${(tb[i] ?? '').slice(Math.max(0, k - 25), k + 25)}`);
    }
  });
  const jf = path.join(__dirname, 'data', 'EX', `${ch.no}.json`);
  if (fs.existsSync(jf)) {
    const d = JSON.parse(fs.readFileSync(jf, 'utf8'));
    if (JSON.stringify(d.passage) !== JSON.stringify(ch.sentences)) bad(`Ch${ch.no}: JSON passage ≠ 정본`);
    if ((d.passage_ko || []).length !== ch.sentences.length) bad(`Ch${ch.no}: 해석 수 불일치`);
  }
}
if (process.argv.includes('--pdf')) {
  const dump = path.join(__dirname, 'dist', '_audit', 'EX-combined.txt');
  const flat = (t) => t.replace(/\s+/g, '');
  const txt = flat(fs.readFileSync(dump, 'utf8'));
  let n = 0;
  for (const ch of SOURCE) for (const s of ch.sentences) {
    const hits = txt.split(flat(s)).length - 1;
    if (hits < 2) bad(`PDF 수록 ${hits}회(<2): Ch${ch.no} ${s.slice(0, 50)}`); else n++;
  }
  console.log(`  합본 PDF: ${n}문장 ≥2회 수록(본문 전문 + PASSAGE)`);
}
const total = SOURCE.reduce((a, c) => a + c.sentences.length, 0);
console.log(`\n${err ? '❌' : '✅'} 추가지문 ${SOURCE.length}편 ${total}문장 ${chars}자 · 오류 ${err}`);
process.exit(err ? 1 : 0);
