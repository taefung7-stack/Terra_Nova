#!/usr/bin/env node
/* ===================================================================
 * 변형문제 정답 길이 균형 교정
 * -------------------------------------------------------------------
 * CLAUDE.md 품질 규칙 ① — 정답이 혼자 길면 학생이 길이로 정답을 찍는다.
 * 48개 내용형 문항 중 최장보기=정답 이 31건(65%, 기대 20%)이었고,
 * 그중 2위와 5자 이상 벌어진 11건을 정답만 간결화한다(의미 불변).
 * 오답은 손대지 않는다 — 오답을 늘리면 지문이 장황해진다.
 * =================================================================== */
import fs from 'fs';

const EDITS = [
  // [set, passage, type, 기존 정답 앞부분, 새 정답]
  ['EX', 4, 'implication',
   'He cared for the penguin until it recovered',
   'He nursed the penguin well and let it go, expecting a final parting.'],

  ['EX', 1, 'blank',
   'treating repeated, closely spaced touches',
   'treating quick repeated touches as the sign of live prey'],

  ['EX', 2, 'theme',
   'the same pressure principle that protects',
   'the pressure principle that guards oil pipes yet threatens water pipes'],

  ['EX2', 2, 'implication',
   'each newly connected vehicle increases',
   'every newly connected vehicle widens the opening for attackers'],

  ['EX2', 3, 'implication',
   'it recreates the conditions of space temporarily',
   'it briefly recreates the conditions of space inside the atmosphere'],

  ['EX', 2, 'gist',
   '음압은 쓰이는 곳에 따라',
   '음압은 쓰임에 따라 이롭기도 해롭기도 해 관리가 필요하다.'],

  ['EX2', 2, 'gist',
   '연결된 자율주행차가 늘어날수록',
   '연결된 자율주행차가 늘수록 해킹 위험이 커져 보안이 시급하다.'],

  ['EX2', 3, 'gist',
   'NASA는 급강하 비행으로',
   'NASA는 급강하 비행으로 짧은 무중력을 만들어 훈련에 쓴다.'],

  ['EX', 3, 'gist',
   '윤일은 달력을 실제 공전 주기에',
   '윤일은 달력을 공전 주기에 맞춰 계절과 어긋나지 않게 한다.'],

  ['EX', 3, 'implication',
   'Festivals would slowly fall on dates',
   'Festivals would drift to dates outside their original season.'],

  ['EX2', 3, 'title',
   'Training for Space Without Ever Leaving',
   'Training for Space Without Leaving the Sky'],
];

let n = 0;
for (const [set, no, type, head, replacement] of EDITS) {
  const p = `data/${set}/${no}-variant.json`;
  const d = JSON.parse(fs.readFileSync(p, 'utf8'));
  const it = d.by_type[type];
  const idx = it.answer - 1;
  const before = it.choices[idx];
  if (!before.startsWith(head)) {
    throw new Error(`${set}/${no} ${type}: 정답 보기가 예상과 다름\n  실제: ${before}\n  기대 앞부분: ${head}`);
  }
  it.choices[idx] = replacement;
  fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n', 'utf8');
  console.log(`  ${set}/${no} ${type.padEnd(12)} ${before.length}자 → ${replacement.length}자`);
  n++;
}
console.log(`\n정답 간결화 ${n}건 완료`);
