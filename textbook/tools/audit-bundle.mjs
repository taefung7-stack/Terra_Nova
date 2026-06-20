#!/usr/bin/env node
// 60지문의 검수에 필요한 필드만 추려 audit/2026-07/_input.json 으로 묶는다(Workflow args 용).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const GRADES = [
  { key: 'saturn-g1',  dir: 'content/passages/2026-07' },
  { key: 'jupiter-g2', dir: 'content/passages/2026-07-J' },
  { key: 'sun-g3',     dir: 'content/passages/2026-07-Sun' },
];
// prepass의 Lexile 신호를 입력에 함께 실어준다(에이전트가 라벨 괴리 맥락을 알게).
let prepass = {};
try {
  const pp = JSON.parse(readFileSync(resolve(root, 'audit/2026-07/_prepass.json'), 'utf8'));
  for (const p of pp.passages) prepass[`${p.grade}#${p.seq}`] = p.l2;
} catch {}

const items = [];
for (const g of GRADES) {
  const gdir = resolve(root, g.dir);
  for (const f of readdirSync(gdir).filter(f => /^\d{2}\.json$/.test(f)).sort()) {
    const d = JSON.parse(readFileSync(join(gdir, f), 'utf8'));
    const seq = parseInt(f, 10);
    items.push({
      grade: g.key, seq,
      meta: d.meta,
      prepass_l2: prepass[`${g.key}#${seq}`] || null,
      title: d.page1?.title, subtitle: d.page1?.subtitle, body: d.page1?.body,
      questions: d.page2?.questions,
      sentences: d.page3?.sentences,
      translation_ko: d.page3?.translation_ko,
      answers: d.answers,
      vocab: d.page4?.vocab,
    });
  }
}
writeFileSync(resolve(root, 'audit/2026-07/_input.json'), JSON.stringify(items));
console.log(`[audit-bundle] ${items.length} passages → audit/2026-07/_input.json`);
