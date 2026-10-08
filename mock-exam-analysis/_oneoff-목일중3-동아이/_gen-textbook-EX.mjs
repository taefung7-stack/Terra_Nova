/* _PDF-RAW-EX.txt(추가지문 사진을 인쇄 줄 그대로 전사) → _TEXTBOOK-EX.js(검수 기준)
 * ★ 정본 _SOURCE-EX.js 는 손으로 문장을 나눴고, 이 파일은 **기계 분할**이다.
 *   두 경로가 독립이라 _xcheck-EX.mjs 가 전사·분할 실수를 잡는다.
 *
 * RAW 표기
 *   @EX N     지문 시작
 *   #H …      제목(7 Supplementary Reading) — 본문 문장이 아니므로 headings 로 뺀다
 *   #G …      1번 문제의 '주어진 문단' 박스 — @INS 위치에 끼워 넣는다
 *   (A)~(D)   문단 삽입 자리 표시(줄 단독) — 문제 장치라 지운다
 *   @INS X    주어진 문단이 들어갈 자리 — 모의고사 분석지 규칙대로 정답 위치 (X) 에 복원
 * 분할 규칙: 문장부호(. ? !, 닫는 따옴표 포함) 뒤 공백 + 대문자/여는 따옴표에서 끊는다.
 * 사용법: node _gen-textbook-EX.mjs [EX|EX2] */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/* 과 id(EX / EX2 …)를 인자로 받는다: _PDF-RAW-{L}.txt → _TEXTBOOK-{L}.js */
const L = (process.argv[2] || 'EX').toUpperCase();
const raw = fs.readFileSync(path.join(__dirname, `_PDF-RAW-${L}.txt`), 'utf8').split(/\r?\n/);
const TB = {};
let cur = null;
for (const ln of raw) {
  const m = ln.match(/^@EX (\d+)/);
  if (m) { cur = TB[m[1]] = { headings: [], lines: [], given: [], ins: null }; continue; }
  if (ln.startsWith('#H ')) { cur.headings.push(ln.slice(3)); continue; }
  if (ln.startsWith('#G ')) { cur.given.push(ln.slice(3).trim()); continue; }
  if (ln.startsWith('@INS ')) { cur.ins = ln.slice(5).trim(); continue; }
  if (ln.trim()) cur.lines.push(ln.trim());
}
const split = (text) => text.split(/(?<=[.?!][”’]?)\s+(?=[A-Z“‘])/).map(s => s.trim()).filter(Boolean);
for (const [no, p] of Object.entries(TB)) {
  const lines = p.lines.map(l => (l === `(${p.ins})` ? '\u0003' : /^\([A-E]\)$/.test(l) ? '' : l));
  const text = lines.join(' ').replace(/\s+/g, ' ');
  const [a, b = ''] = text.split('\u0003');
  p.sentences = [...split(a.trim()), ...split(p.given.join(' ')), ...split(b.trim())];
  delete p.lines; delete p.given;
}
const out = `/* ===================================================================
 * 목일중3 추가지문 — 사진 원문 전사본 (검수 기준)
 * ===================================================================
 * ⚠️ _gen-textbook-EX.mjs 가 _PDF-RAW-EX.txt 에서 **기계 분할**로 생성한다. 직접 고치지 말 것.
 * 정본 _SOURCE-EX.js(손 분할)와 독립이다 → _xcheck-EX.mjs 가 서로 대조한다.
 * =================================================================== */

export const TEXTBOOK_EX = ${JSON.stringify(TB, null, 2)};
`;
fs.writeFileSync(path.join(__dirname, `_TEXTBOOK-${L}.js`), out, 'utf8');
console.log(Object.entries(TB).map(([n, p]) => `${n}:${p.sentences.length}`).join(' '));
