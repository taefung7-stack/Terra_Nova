#!/usr/bin/env node
/* ===================================================================
 * EX2 무관한 문장(irrelevant) 정답 위치 분산
 * -------------------------------------------------------------------
 * EX2 4지문 전부 무관 문장이 ④ 자리에 있어 위치만으로 정답이 찍혔다
 * (EX 는 3/5/4/2 로 이미 분산됨).
 * 무관 문장은 흐름상 어디에 끼워도 '무관'이므로 자유롭게 이동 가능하다.
 * 단, 나머지 문장들의 상대 순서는 논리 전개이므로 절대 건드리지 않는다.
 * 해설·오답노트의 ①~⑤ 표기도 새 번호에 맞춰 동기화한다.
 * =================================================================== */
import fs from 'fs';

const C = ['①','②','③','④','⑤'];
// 지문별 무관 문장의 새 위치(1-based). ④ -> 2 / 5 / 3 / 4(유지)
const TARGET = { 1: 2, 2: 5, 3: 3, 4: 4 };

for (let no = 1; no <= 4; no++) {
  const p = `data/EX2/${no}-variant.json`;
  const d = JSON.parse(fs.readFileSync(p, 'utf8'));
  const it = d.by_type.irrelevant;
  const from = it.answer, to = TARGET[no];
  if (from === to) { console.log(`  EX2/${no}  ${from} 유지`); continue; }

  // 무관 문장을 뽑아 새 위치에 삽입 (나머지 상대 순서 보존)
  const arr = [...it.sentences];
  const [odd] = arr.splice(from - 1, 1);
  arr.splice(to - 1, 0, odd);
  it.sentences = arr;

  // 옛 번호 -> 새 번호 매핑 (무관 문장 이동에 따라 사이 문장들이 한 칸씩 밀림)
  const oldToNew = {};
  oldToNew[from] = to;
  for (let o = 1; o <= 5; o++) {
    if (o === from) continue;
    let shifted = o;
    if (from < o && o <= to) shifted = o - 1;       // 뒤로 이동 → 사이 문장 앞으로
    else if (to <= o && o < from) shifted = o + 1;  // 앞으로 이동 → 사이 문장 뒤로
    oldToNew[o] = shifted;
  }
  const remap = t => String(t ?? '').replace(/[①②③④⑤]/g, ch => C[oldToNew[C.indexOf(ch) + 1] - 1]);
  it.explanation_ko = remap(it.explanation_ko);
  it.distractor_ko  = remap(it.distractor_ko);
  it.answer = to;

  // 무관 문장이 제자리에 갔는지 확인
  if (it.sentences[to - 1] !== odd) throw new Error(`EX2/${no}: 이동 실패`);
  fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n', 'utf8');
  console.log(`  EX2/${no}  ${from} → ${to}   "${odd.slice(0, 55)}..."`);
}
