/* WI(Culture in Idioms) 전사 대조 — _PDF-RAW-WI.txt(인쇄 줄 그대로) 기계 분할 ↔ _SOURCE-WI.js(손 분할) ↔ data/WI passage
 * ★ 정규화 없이 문자 단위 일치를 요구한다.
 * 줄 끝 하이픈: 'animal-' + 'related' 처럼 원래 하이픈 복합어가 줄에서 끊긴 경우는 하이픈을 살려 붙이고
 *   ('a dog-and-' + 'monkey' 도 같음), 그 외 줄바꿈은 공백으로 잇는다.
 * 분할: [.?!] (+ 닫는 따옴표) 뒤 공백 + 대문자/여는 따옴표. 문장 중간의 '." In' 도 끊긴다.
 * 사용법: node _xcheck-WI.mjs [--pdf]   (--pdf: dist/_audit/WI-combined.txt 에 전 문장 ≥2회) */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SOURCE } from './_SOURCE-WI.js';

const D = path.dirname(fileURLToPath(import.meta.url));
const raw = fs.readFileSync(path.join(D, '_PDF-RAW-WI.txt'), 'utf8').split(/\r?\n/);
const CH = {}; let cur = null;
for (const ln of raw) {
  const m = ln.match(/^@CH (\d+)/);
  if (m) { cur = CH[m[1]] = []; continue; }
  if (ln.trim()) cur.push(ln.trim());
}
const join = (lines) => lines.reduce((acc, l) => (acc.endsWith('-') ? acc + l : (acc ? acc + ' ' + l : l)), '');
const split = (t) => t.split(/(?<=[.?!]["']?)\s+(?=[A-Z"'])/).map(s => s.trim()).filter(Boolean);

let err = 0, chars = 0;
const bad = (m) => { err++; console.log('  ✗ ' + m); };
for (const ch of SOURCE) {
  const tb = split(join(CH[ch.no] || []));
  if (tb.length !== ch.sentences.length) bad(`Ch${ch.no}: 문장 수 정본 ${ch.sentences.length} ≠ RAW ${tb.length}`);
  ch.sentences.forEach((s, i) => {
    chars += s.length;
    if (s !== tb[i]) {
      let k = 0; while (k < s.length && s[k] === tb[i]?.[k]) k++;
      bad(`Ch${ch.no} #${i + 1} @${k}\n     정본: …${s.slice(Math.max(0, k - 25), k + 25)}\n     RAW : …${(tb[i] ?? '').slice(Math.max(0, k - 25), k + 25)}`);
    }
  });
  const jf = path.join(D, 'data', 'WI', `${ch.no}.json`);
  if (fs.existsSync(jf)) {
    const d = JSON.parse(fs.readFileSync(jf, 'utf8'));
    if (JSON.stringify(d.passage) !== JSON.stringify(ch.sentences)) bad(`Ch${ch.no}: JSON passage ≠ 정본`);
  }
}
if (process.argv.includes('--pdf')) {
  const flat = (t) => t.replace(/\s+/g, '');
  /* 분석 카드 영문에는 끊어읽기 ' / ' 가 끼어 있어 그대로는 PASSAGE 1회만 잡힌다 → 걷어내고 센다
     (이 합본은 본문 전문 페이지가 없어 PASSAGE + 카드 = 2회가 기대값) */
  const txt = flat(fs.readFileSync(path.join(D, 'dist', '_audit', 'WI-combined.txt'), 'utf8').replace(/\s\/\s/g, ' '));
  let n = 0;
  for (const ch of SOURCE) for (const s of ch.sentences) {
    const hits = txt.split(flat(s)).length - 1;
    if (hits < 2) bad(`PDF 수록 ${hits}회(<2): Ch${ch.no} ${s.slice(0, 50)}`); else n++;
  }
  console.log(`  합본 PDF: ${n}문장 ≥2회 수록`);
}
const total = SOURCE.reduce((a, c) => a + c.sentences.length, 0);
console.log(`\n${err ? '❌' : '✅'} WI 전사 대조 — ${SOURCE.length}챕터 ${total}문장 ${chars}자 · 오류 ${err}`);
process.exit(err ? 1 : 0);
