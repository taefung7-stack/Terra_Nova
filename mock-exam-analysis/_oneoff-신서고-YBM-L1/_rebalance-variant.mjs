#!/usr/bin/env node
/* ===================================================================
 * 변형문제 정답 분포 재조정 (EX / EX2)
 * -------------------------------------------------------------------
 * 문제: theme·gist·title·implication·blank 5개 유형이 8지문 전부 ①,
 *       그 밖의 유형도 편중되어 88문항 중 ①이 48개(54.5%)였다.
 * 해결: 각 문항의 보기 배열을 순열로 재배치하고, 정답 번호와
 *       explanation_ko / distractor_ko 안의 ①~⑤ 표기를 동기화한다.
 *       보기 "내용"은 건드리지 않는다 — 순서만 바꾼다.
 * =================================================================== */
import fs from 'fs';

const C = ['①','②','③','④','⑤'];
const ALL_TYPES = ['theme','gist','title','implication','grammar','vocab','blank','irrelevant','order','insert','summary'];
/* 보기 목록이 '내용'인 유형만 순열 재배치가 안전하다.
 * grammar/vocab 은 choices 가 ①~⑤ 마커이고 정답이 underlines[].no 에,
 * irrelevant/insert 는 정답이 문장 위치에 묶여 있어 목록 순서를 바꿀 수 없다
 * (바꾸면 정답 번호와 밑줄·문장 위치가 어긋난다 — verify-variant-*.mjs 가 잡아냄).
 * 따라서 이 4개 유형은 원본 정답을 그대로 두고, 나머지 7개 유형으로 전체 분포를 맞춘다. */
const TYPES = ['theme','gist','title','implication','blank','order','summary'];

/* 유형별 목표 정답 (8지문 = EX 1..4 + EX2 1..4).
 * 각 유형이 5개 번호를 고르게 돌도록 배치하고,
 * 동시에 지문(세로)별로도 같은 번호가 몰리지 않게 라틴방진에 가깝게 구성. */
const TARGET = {
  theme:       [1,5,1,2,3,5,4,1],
  gist:        [2,5,3,1,3,2,3,2],
  title:       [3,1,5,3,1,2,1,2],
  implication: [2,5,3,1,5,1,2,1],
  blank:       [5,2,1,3,4,1,2,1],
  order:       [4,2,3,1,2,1,2,1],
  summary:     [1,3,2,2,5,1,3,2],
};

/* ①~⑤ 표기를 옛번호→새번호 매핑으로 치환 */
function remapNumerals(text, oldToNew) {
  if (!text) return text;
  return text.replace(/[①②③④⑤]/g, ch => C[oldToNew[C.indexOf(ch)]]);
}

/* choices 배열(또는 options 배열)을 perm 에 따라 재배치.
 * perm[newIdx] = oldIdx  */
function applyPerm(item, perm) {
  const listKey = item.choices ? 'choices' : (item.options ? 'options' : null);
  if (!listKey) throw new Error('no choices/options');
  const old = item[listKey];
  if (old.length !== 5) throw new Error('choices length != 5');

  item[listKey] = perm.map(oi => old[oi]);

  // oldIdx -> newIdx 역매핑
  const oldToNew = new Array(5);
  perm.forEach((oi, ni) => { oldToNew[oi] = ni; });

  const oldAnsIdx = item.answer - 1;
  item.answer = oldToNew[oldAnsIdx] + 1;

  item.explanation_ko = remapNumerals(item.explanation_ko, oldToNew);
  item.distractor_ko  = remapNumerals(item.distractor_ko,  oldToNew);
  return item;
}

/* 정답을 targetAnswer 자리로 보내는 순열 생성.
 * 정답 외 보기들의 상대 순서를 최대한 섞되 결정적(deterministic)으로. */
function makePerm(oldAnsIdx, targetIdx, seed) {
  const others = [0,1,2,3,4].filter(i => i !== oldAnsIdx);
  // seed 기반 결정적 회전으로 오답 순서도 섞는다
  const rot = seed % 4;
  const rotated = others.slice(rot).concat(others.slice(0, rot));
  const perm = [];
  let k = 0;
  for (let ni = 0; ni < 5; ni++) {
    perm[ni] = (ni === targetIdx) ? oldAnsIdx : rotated[k++];
  }
  return perm;
}

let seed = 0;
const before = {1:0,2:0,3:0,4:0,5:0};
const after  = {1:0,2:0,3:0,4:0,5:0};
const changed = [];

const files = [];
for (const set of ['EX','EX2']) for (let i=1;i<=4;i++) files.push({set,i});

files.forEach((f, passIdx) => {
  const path = `data/${f.set}/${f.i}-variant.json`;
  const d = JSON.parse(fs.readFileSync(path,'utf8'));
  for (const t of ALL_TYPES) { const it = d.by_type[t]; if (it) before[it.answer]++; }
  for (const t of ALL_TYPES) { if (!TYPES.includes(t) && d.by_type[t]) after[d.by_type[t].answer]++; }
  for (const t of TYPES) {
    const it = d.by_type[t];
    if (!it) continue;
    const target = TARGET[t][passIdx];
    if (it.answer === target) { after[target]++; continue; }
    const perm = makePerm(it.answer - 1, target - 1, seed++);
    const oldAns = it.answer;
    applyPerm(it, perm);
    if (it.answer !== target) throw new Error(`perm failed ${f.set}${f.i}/${t}`);
    after[it.answer]++;
    changed.push(`${f.set}/${f.i} ${t}: ${oldAns} -> ${it.answer}`);
  }
  fs.writeFileSync(path, JSON.stringify(d, null, 2) + '\n', 'utf8');
});

console.log('변경 문항:', changed.length, '/ 56 (순열 가능 유형)  · 고정 유형 32문항은 원본 유지');
console.log('BEFORE', JSON.stringify(before));
console.log('AFTER ', JSON.stringify(after));
