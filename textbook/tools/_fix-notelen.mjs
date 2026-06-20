#!/usr/bin/env node
// note/grammar_note 글자수 초과 3건을 길이만 줄여 교정(내용 보존).
import { readFileSync, writeFileSync } from 'node:fs';
const edits = [
  ['content/passages/2026-07/06.json', d => { d.page3.sentences[18].segments[3].note = '분사구문 flowing + while staying (부대상황), 빈칸'; }],
  ['content/passages/2026-07/15.json', d => { d.page3.sentences[3].segments[2].note = 'about + 동명사 + 목적격 관계절(three simple goals 수식)'; }],
  ['content/passages/2026-07/18.json', d => { d.page3.sentences[15].grammar_note = '콜론 동격 + 두 독립절(yet 대조): get something for nothing / get closer to V-ing, 빈칸'; }],
];
for (const [f, fn] of edits) {
  const d = JSON.parse(readFileSync(f, 'utf8'));
  fn(d);
  writeFileSync(f, JSON.stringify(d, null, 2));
  console.log('fixed', f);
}
