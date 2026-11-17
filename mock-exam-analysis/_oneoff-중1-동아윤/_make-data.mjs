/* 중1 동아윤 L6·L7·L8 — _SOURCE.js(영어+해석) → build-memorize 입력 생성
 *   _SOURCE-{L}.js (build-memorize 가 import 하는 정본 모양) + data/{L}/{N}.json (passage_ko)
 * 실행: node _make-data.mjs   (그다음 node build-memorize.mjs)
 * ★ _SOURCE-{L}.js · data/ 는 생성물 — _SOURCE.js 를 고친 뒤 다시 실행한다. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LESSONS } from './_SOURCE.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BAD = /[〔〕「」"]/;   // 직선따옴표·낫표는 PDF 빈칸 렌더

for (const [L, chapters] of Object.entries(LESSONS)) {
  const SOURCE = chapters.map((ch, i) => ({ no: i + 1, title: ch.title, sentences: ch.rows.map(r => r[0]) }));
  chapters.forEach((ch, i) => ch.rows.forEach(([en, ko], j) => {
    if (!en?.trim() || !ko?.trim()) throw new Error(`${L} Ch${i + 1} #${j + 1}: 빈 문장/해석`);
    if (BAD.test(en) || BAD.test(ko)) throw new Error(`${L} Ch${i + 1} #${j + 1}: 직선따옴표·낫표 사용 금지\n  ${en}\n  ${ko}`);
    const sp = /^[A-Z][a-z]+: /.test(en), kp = /^[^\s“]+: /.test(ko);
    if (sp !== kp) throw new Error(`${L} Ch${i + 1} #${j + 1}: 화자 표시 불일치\n  ${en}\n  ${ko}`);
  }));
  fs.writeFileSync(path.join(__dirname, `_SOURCE-${L}.js`),
    `/* 생성물 — _SOURCE.js 를 고치고 node _make-data.mjs 를 다시 실행할 것 */\nexport const SOURCE = ${JSON.stringify(SOURCE, null, 2)};\n`, 'utf8');
  chapters.forEach((ch, i) => {
    const out = path.join(__dirname, 'data', L, `${i + 1}.json`);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify({
      exam: '중1 · 동아(윤정미)', question_no: String(i + 1), subtitle: ch.title,
      passage: ch.rows.map(r => r[0]), passage_ko: ch.rows.map(r => r[1]),
    }, null, 2) + '\n', 'utf8');
  });
  console.log(`  ${L}: ${SOURCE.length}챕터 · ${SOURCE.reduce((a, c) => a + c.sentences.length, 0)}문장`);
}
