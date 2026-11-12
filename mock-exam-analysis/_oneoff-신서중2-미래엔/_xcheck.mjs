/* 교과서 PDF 텍스트 추출본(_PDF-RAW-{L}.txt) ↔ 정본(_SOURCE-{L}.js) 문자 단위 대조 (Lesson 7·8 부터)
 * RAW 는 첨부 PDF 의 텍스트 레이어 추출본에서 영어 단만 그대로 옮긴 것(줄바꿈 유지, 사람 손 정리 없음).
 * 비교 전 정규화는 공백 뭉치 → 한 칸 뿐. 제목·소제목 줄과 가격표(표) 줄은 뺀다.
 * 철자·구두점·따옴표·대소문자는 그대로 비교한다.
 * 사용법: node _xcheck.mjs L7 | L8 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const L = (process.argv[2] || 'L7').toUpperCase();
const { SOURCE } = await import(`./_SOURCE-${L}.js`);
const SKIP = [
  /^Animals in Cold Places$/, /^(Polar bears|Arctic foxes|Whales|Wood frogs)$/,
  /^Comparing Prices$/, /^(Smile Tour Star Tour Top Tour|Tour Smile Tour Star Tour Top Tour)$/,
  /^\$\d+\/(person|pair)/, /^\d+ hours$/, /^Choose the hours!$/, /^Price for a$/, /^3-hour tour\/person$/, /^\$75 \$60 \$55$/,
];
const raw = fs.readFileSync(path.join(__dirname, `_PDF-RAW-${L}.txt`), 'utf8')
  .split(/\r?\n/).map(s => s.trim()).filter(s => s && !SKIP.some(r => r.test(s))).join(' ');
const flat = (s) => s.replace(/\s+/g, ' ').trim();
const a = flat(SOURCE.flatMap(c => c.sentences).join(' '));
const b = flat(raw);
let k = 0; while (k < a.length && a[k] === b[k]) k++;
const n = SOURCE.reduce((x, c) => x + c.sentences.length, 0);
if (a === b) console.log(`✅ ${L}: 정본 ${n}문장 ${a.length}자 = PDF 추출본 (문자 단위 완전 일치)`);
else { console.log(`❌ ${L}: @${k} 불일치\n  정본: …${a.slice(Math.max(0, k - 40), k + 40)}\n  PDF : …${b.slice(Math.max(0, k - 40), k + 40)}`); process.exit(1); }
