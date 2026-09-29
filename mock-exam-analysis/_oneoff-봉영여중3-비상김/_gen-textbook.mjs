/* _PDF-RAW.txt(원본 PDF 줄 그대로 전사) → _TEXTBOOK.js(검수 기준)
 * ★ 정본 _SOURCE-L*.js 는 손으로 문장을 나눴고, 이 파일은 **기계 분할**이다.
 *   두 경로가 독립이라 _audit.mjs [A] 대조가 전사·분할 실수를 잡는다.
 * 분할 규칙: 문장부호(. ? !, 닫는 따옴표 포함) 뒤 공백 + 대문자/여는 따옴표에서 끊는다.
 *   "man... ." 처럼 말줄임표 뒤 소문자·마침표는 끊지 않는다.
 *   전부 대문자로 시작하는 목록 줄(CONSIDER the Source 등)은 그 줄 자체가 한 항목이다.
 *   #H 줄(헤드라인·목록 제목)은 headings 로 뺀다.
 * 사용법: node _gen-textbook.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TITLES = {
  L5: 'Lesson 5 · Critical Minds — Can You Spot Fake News?',
  L6: 'Lesson 6 · Words of Wisdom — A Father’s Wisdom',
  L7: 'Lesson 7 · Spend Wisely — Why We Buy What We Buy',
};
const raw = fs.readFileSync(path.join(__dirname, '_PDF-RAW.txt'), 'utf8').split(/\r?\n/);
const TB = {};
let cur = null;
for (const ln of raw) {
  const m = ln.match(/^@(L\d) (\d+)/);
  if (m) {
    TB[m[1]] ??= { title: TITLES[m[1]], headings: [], paragraphs: [] };
    cur = { no: +m[2], lines: [] };
    TB[m[1]].paragraphs.push(cur);
    cur.L = m[1];
    continue;
  }
  if (ln.startsWith('#H ')) { TB[cur.L].headings.push(ln.slice(3)); continue; }
  if (ln.trim()) cur.lines.push(ln.trim());
}
for (const L of Object.keys(TB)) {
  for (const p of TB[L].paragraphs) {
    // 목록 줄은 앞뒤에 구분자를 넣어 강제 분리
    const text = p.lines.map(l => (/^[A-Z]{3,}\b/.test(l) && /^[A-Z]+ /.test(l) && !/[.?!]$/.test(l)) ? `\u0001${l}\u0001` : l).join(' ');
    p.sentences = text.split('\u0001').flatMap(seg =>
      seg.trim().split(/(?<=[.?!][”’]?)\s+(?=[A-Z“‘])/)).map(s => s.trim()).filter(Boolean);
    delete p.lines; delete p.L;
  }
}
const out = `/* ===================================================================
 * 봉영여중3 비상(김진완) — 교과서 원문 전사본 (검수 기준)
 * ===================================================================
 * ⚠️ _gen-textbook.mjs 가 _PDF-RAW.txt 에서 **기계 분할**로 생성한다. 직접 고치지 말 것.
 * 정본 _SOURCE-L{5,6,7}.js(손 분할)와 독립이다 → _audit.mjs [A] 가 서로 대조한다.
 * =================================================================== */

export const TEXTBOOK = ${JSON.stringify(TB, null, 2)};
`;
fs.writeFileSync(path.join(__dirname, '_TEXTBOOK.js'), out, 'utf8');
for (const L of Object.keys(TB)) console.log(L, TB[L].paragraphs.map(p => p.sentences.length).join('/'), '| headings', TB[L].headings.length);
