/* 목일중 L7·L8 → 봉영여중 2학년용 사본 L7B·L8B 생성 (2026-11-05 요청)
 * 내용은 그대로 두고 학교명(exam)만 바꾼다. 삽화 축소본(dist/{L}/assets)도 복사한다.
 * ★ data/{L7B,L8B} 를 직접 고치지 말 것 — L7·L8 을 고친 뒤 이 스크립트를 다시 돌린다.
 * 사용법: node _make-bongyoung.mjs  (그다음 build.mjs → pdf.mjs → combine.mjs L7B|L8B → build-memorize.mjs L7B|L8B) */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FROM = '목일중 2학년 · 비상(황종배)';
const TO = '봉영여중 2학년 · 비상(황종배)';
for (const L of ['L7', 'L8']) {
  const src = path.join(__dirname, 'data', L), dst = path.join(__dirname, 'data', L + 'B');
  fs.mkdirSync(dst, { recursive: true });
  for (const f of fs.readdirSync(src).filter(f => f.endsWith('.json'))) {
    const d = JSON.parse(fs.readFileSync(path.join(src, f), 'utf8'));
    if (d.exam !== FROM) throw new Error(`${L}/${f}: exam 이 예상과 다름(${d.exam})`);
    d.exam = TO;
    const s = JSON.stringify(d, null, 2);
    if (s.includes('목일중')) throw new Error(`${L}/${f}: exam 외에 목일중 문자열이 남음`);
    fs.writeFileSync(path.join(dst, f), s + '\n', 'utf8');
  }
  const a = path.join(__dirname, 'dist', L, 'assets'), b = path.join(__dirname, 'dist', L + 'B', 'assets');
  fs.mkdirSync(b, { recursive: true });
  for (const f of fs.readdirSync(a)) fs.copyFileSync(path.join(a, f), path.join(b, f));
  console.log(`✓ ${L} → ${L}B  (data ${fs.readdirSync(dst).length}개 · 삽화 ${fs.readdirSync(b).length}장)`);
}
