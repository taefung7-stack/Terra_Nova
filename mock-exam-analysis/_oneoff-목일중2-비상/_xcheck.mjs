/* 교과서 PDF 텍스트 추출본(_PDF-RAW-{L}.txt) ↔ 정본(_SOURCE-{L}.js) 문자 단위 대조
 * RAW 는 PyMuPDF 로 영어 단(x 55~375pt)만 잘라 뽑은 것이다(사람 손을 거치지 않은 독립 경로).
 * 비교: 제목·소제목 줄을 빼고 공백만 정규화(구두점·따옴표·대소문자는 그대로).
 * 사용법: node _xcheck.mjs L7|L8 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const L = (process.argv[2] || 'L7').toUpperCase();
const { SOURCE } = await import(`./_SOURCE-${L}.js`);
const headings = new Set([SOURCE[0].title, ...SOURCE.flatMap(c => c.headings || [])].map(s => s.trim()));
const raw = fs.readFileSync(path.join(__dirname, `_PDF-RAW-${L}.txt`), 'utf8')
  .split(/\r?\n/).map(s => s.trim()).filter(s => s && !headings.has(s) && s !== 'Food Brings Us Together').join(' ');
const flat = (s) => s.replace(/\s+/g, ' ').trim();
const a = flat(SOURCE.flatMap(c => c.sentences).join(' '));
const b = flat(raw);
let k = 0; while (k < a.length && a[k] === b[k]) k++;
const n = SOURCE.reduce((x, c) => x + c.sentences.length, 0);
if (a === b) console.log(`✅ ${L}: 정본 ${n}문장 ${a.length}자 = PDF 추출본 (문자 단위 완전 일치)`);
else { console.log(`❌ ${L}: @${k} 불일치\n  정본: …${a.slice(Math.max(0, k - 40), k + 40)}\n  PDF : …${b.slice(Math.max(0, k - 40), k + 40)}`); process.exit(1); }
