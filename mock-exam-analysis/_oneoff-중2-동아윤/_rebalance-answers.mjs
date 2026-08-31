#!/usr/bin/env node
/* ===================================================================
 * 본문분석 정답 분포 재조정
 * -------------------------------------------------------------------
 * 문제: 7개 챕터의 정답이 전부 ① 이었다(7/7 = 100%).
 *       학생이 지문을 읽지 않고 ① 만 찍어도 전부 맞는 상태.
 * 해결: 보기 배열을 재배치하고 no 를 1~5 로 다시 매긴다.
 *       ★ 보기 "내용"과 comment 는 짝을 유지한 채 함께 이동한다 — 내용 불변.
 *       comment 안에 ①~⑤ 상호 참조가 없음을 확인했으므로(0건)
 *       번호 remap 없이 순열만으로 안전하다.
 *
 * 목표 분포 — 7문항이라 완전 균등은 불가. 각 번호가 1~2회씩 돌게 배치하고
 * 같은 과 안에서 연속으로 같은 번호가 나오지 않게 한다.
 * =================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

/* [과, 챕터] → 정답이 갈 자리 */
const TARGET = {
  'L5/1': 3,
  'L5/2': 5,
  'L5/3': 2,
  'L6/1': 4,
  'L6/2': 1,
  'L6/3': 5,
  'L6/4': 3,
};

/* 정답을 target 자리로 보내는 순열 생성.
   오답들의 상대 순서도 seed 로 결정적으로 섞는다. */
function makePerm(oldAnsIdx, targetIdx, seed) {
  const others = [0, 1, 2, 3, 4].filter(i => i !== oldAnsIdx);
  const rot = seed % 4;
  const rotated = others.slice(rot).concat(others.slice(0, rot));
  const perm = [];
  let k = 0;
  for (let ni = 0; ni < 5; ni++) perm[ni] = (ni === targetIdx) ? oldAnsIdx : rotated[k++];
  return perm;
}

const before = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
const after = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
let seed = 0, changed = 0;

for (const [key, target] of Object.entries(TARGET)) {
  const [L, ch] = key.split('/');
  const p = path.join(HERE, 'data', L, `${ch}.json`);
  const d = JSON.parse(fs.readFileSync(p, 'utf8'));

  const oldIdx = d.choices.findIndex(c => c.correct);
  if (oldIdx < 0) throw new Error(`${key}: 정답 보기가 없다`);
  before[oldIdx + 1]++;

  if (oldIdx === target - 1) { after[target]++; continue; }

  const perm = makePerm(oldIdx, target - 1, seed++);
  const old = d.choices;
  // 보기 객체를 통째로 이동 → en/ko/comment/correct 가 함께 따라간다
  d.choices = perm.map((oi, ni) => ({ ...old[oi], no: ni + 1 }));

  const newIdx = d.choices.findIndex(c => c.correct);
  if (newIdx !== target - 1) throw new Error(`${key}: 순열 실패`);
  // 내용 보존 확인
  if (JSON.stringify(d.choices[newIdx].en) !== JSON.stringify(old[oldIdx].en)) {
    throw new Error(`${key}: 정답 내용이 바뀌었다`);
  }
  after[newIdx + 1]++;
  changed++;

  fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n', 'utf8');
  console.log(`  ${key}: 정답 ${oldIdx + 1} → ${newIdx + 1}`);
}

console.log(`\n변경 ${changed}/7 문항`);
console.log('BEFORE', JSON.stringify(before));
console.log('AFTER ', JSON.stringify(after));
