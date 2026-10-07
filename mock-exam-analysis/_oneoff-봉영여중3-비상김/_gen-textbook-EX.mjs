/* _PDF-RAW-EX.txt(추가지문 사진 11장을 인쇄 줄 그대로 전사) → _TEXTBOOK-EX.js(검수 기준)
 * ★ 정본 _SOURCE-EX.js 는 손으로 문장을 나눴고, 이 파일은 **기계 분할**이다.
 *   두 경로가 독립이라 _xcheck-EX.mjs 가 전사·분할 실수를 잡는다.
 *
 * RAW 표기
 *   @EX N        지문 시작
 *   #H …         제목·소제목([Example] 등) — 본문 문장이 아니므로 headings 로 뺀다
 *   #G …         08 문장 삽입의 '주어진 문장' 박스 — @INS k 위치에 끼워 넣는다
 *   @INS k       주어진 문장이 들어갈 자리 ( ⓚ ) — 모의고사 분석지 규칙대로 정답 위치에 복원
 *   @FILL word   빈칸(____)에 들어갈 정답 — 분석지는 빈칸을 정답으로 채워 싣는다
 *   ( ① ) / ① 등 보기 번호는 문제 장치라 지운다.
 * 분할 규칙: 문장부호(. ? !, 닫는 따옴표 포함) 뒤 공백 + 대문자/여는 따옴표에서 끊는다.
 *   Dr. 같은 약어 뒤에서는 끊지 않는다. 말줄임표(...) 뒤 소문자는 끊지 않는다.
 * 사용법: node _gen-textbook-EX.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raw = fs.readFileSync(path.join(__dirname, '_PDF-RAW-EX.txt'), 'utf8').split(/\r?\n/);
const TB = {};
let cur = null;
for (const ln of raw) {
  const m = ln.match(/^@EX (\d+)/);
  if (m) { cur = TB[m[1]] = { headings: [], lines: [], given: [], ins: null, fill: null }; continue; }
  if (ln.startsWith('#H ')) { cur.headings.push(ln.slice(3)); continue; }
  if (ln.startsWith('#G ')) { cur.given.push(ln.slice(3).trim()); continue; }
  if (ln.startsWith('@INS ')) { cur.ins = +ln.slice(5); continue; }
  if (ln.startsWith('@FILL ')) { cur.fill = ln.slice(6).trim(); continue; }
  if (ln.trim()) cur.lines.push(ln.trim());
}
const ABBR = ['Dr.', 'Mr.', 'Mrs.', 'Ms.', 'etc.'];
const split = (text) => {
  let t = text;
  ABBR.forEach((a, i) => { t = t.split(a + ' ').join(`\u0002${i}\u0002 `); });
  return t.split(/(?<=[.?!][”’]?)\s+(?=[A-Z“‘])/)
    .map(s => s.replace(/\u0002(\d)\u0002/g, (_, i) => ABBR[+i]).trim()).filter(Boolean);
};
for (const [no, p] of Object.entries(TB)) {
  let text = p.lines.join(' ');
  if (p.fill) text = text.replace(/_{3,}/, p.fill);
  if (p.ins) text = text.replace(`( ${'①②③④⑤'[p.ins - 1]} )`, `\u0003`);
  text = text.replace(/\(\s*[①②③④⑤]\s*\)\s*/g, '').replace(/[①②③④⑤]\s*/g, '').replace(/\s+/g, ' ');
  if (p.ins) {
    const [a, b] = text.split('\u0003');
    p.sentences = [...split(a.trim()), p.given.join(' '), ...split(b.trim())];
  } else p.sentences = split(text);
  delete p.lines; delete p.given;
}
const out = `/* ===================================================================
 * 봉영여중3 추가지문 — 사진 원문 전사본 (검수 기준)
 * ===================================================================
 * ⚠️ _gen-textbook-EX.mjs 가 _PDF-RAW-EX.txt 에서 **기계 분할**로 생성한다. 직접 고치지 말 것.
 * 정본 _SOURCE-EX.js(손 분할)와 독립이다 → _xcheck-EX.mjs 가 서로 대조한다.
 * =================================================================== */

export const TEXTBOOK_EX = ${JSON.stringify(TB, null, 2)};
`;
fs.writeFileSync(path.join(__dirname, '_TEXTBOOK-EX.js'), out, 'utf8');
console.log(Object.entries(TB).map(([n, p]) => `${n}:${p.sentences.length}`).join(' '));
