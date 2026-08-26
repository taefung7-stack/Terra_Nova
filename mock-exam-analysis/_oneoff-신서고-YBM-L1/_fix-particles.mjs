#!/usr/bin/env node
/* ===================================================================
 * ①~⑤ 뒤 조사 일치 교정
 * -------------------------------------------------------------------
 * 정답 번호를 재배치하면서 숫자는 바뀌었지만 뒤따르는 조사는 그대로 남아
 * "③가 무관하다"(→③이), "②이 적절하다"(→②가) 같은 오류가 생겼다.
 * 읽기: ①일·③삼 = 받침 있음 → 이/은/과, ②이·④사·⑤오 = 받침 없음 → 가/는/와.
 * =================================================================== */
import fs from 'fs';

const HAS_FINAL = { '①': true, '②': false, '③': true, '④': false, '⑤': false };
const SWAP = { '이':'가', '가':'이', '은':'는', '는':'은', '과':'와', '와':'과' };
const ALL = ['theme','gist','title','implication','grammar','vocab','blank','irrelevant','order','insert','summary'];

let n = 0;
for (const s of ['EX','EX2']) for (let i = 1; i <= 4; i++) {
  const p = `data/${s}/${i}-variant.json`;
  const d = JSON.parse(fs.readFileSync(p, 'utf8'));
  let touched = false;
  for (const t of ALL) {
    const it = d.by_type[t];
    for (const f of ['explanation_ko','distractor_ko']) {
      if (!it[f]) continue;
      const fixed = it[f].replace(/([①②③④⑤])(이|가|은|는|과|와)(?![가-힣])/g, (full, num, par) => {
        const fin = HAS_FINAL[num];
        const ok = { '이':fin, '가':!fin, '은':fin, '는':!fin, '과':fin, '와':!fin }[par];
        if (ok) return full;
        n++; touched = true;
        return num + SWAP[par];
      });
      it[f] = fixed;
    }
  }
  if (touched) fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n', 'utf8');
}
console.log(`조사 교정 ${n}건`);
