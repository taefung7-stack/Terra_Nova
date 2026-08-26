#!/usr/bin/env node
/* ===================================================================
 * EX2 어휘(vocab) 정답 위치 분산
 * -------------------------------------------------------------------
 * EX2/2·3·4 가 전부 ⑤(마지막 문장)에 오답 어휘를 두어 ④⑤⑤⑤ 가 되었다.
 * 어휘 문항의 정답 위치는 "어느 밑줄이 문맥상 틀렸는가"로 정해지므로,
 * 마지막 문장의 낱말을 올바른 것으로 되돌리고 다른 밑줄을 문맥상
 * 부적절한 낱말로 바꿔 정답 위치를 옮긴다.
 * underlines 의 sent_index 오름차순과 밑줄 개수(5)는 그대로 유지한다.
 * =================================================================== */
import fs from 'fs';

const EDITS = {
  // EX2/3 : ⑤ descend→experience(정상화), ② balances→cancels(X: 상쇄가 아니라 '취소'로 오용) ... 
  // 더 자연스러운 오용은 ③ climbs → descends (오르막인데 '내려간다')
  3: {
    to: 3,
    restore: { no: 5, from: 'descend', to: 'experience',
               sentFrom: 'the passengers descend into weightlessness',
               sentTo:   'the passengers experience weightlessness' },
    corrupt: { no: 3, from: 'climbs', to: 'descends',
               sentFrom: 'As a roller coaster climbs the track',
               sentTo:   'As a roller coaster descends the track',
               fix: 'climbs' },
    explanation_ko: '롤러코스터가 트랙을 올라갈 때 중력이 몸을 아래로 누른다는 맥락이므로 descends(내려가다)는 정반대다. climbs 가 되어야 한다.',
    distractor_ko: '① 무중력을 느끼므로 weightless 가 맞다. ② 속도가 중력을 상쇄하므로 balance 가 적절하다. ④ 앞서 설명한 현상을 가리키므로 phenomenon 이 적절하다. ⑤ 탑승자가 무중력을 겪으므로 experience 가 맞다.',
  },
  // EX2/4 : ⑤ conceal→reveal(정상화), ② sense → ignore (감지하는데 '무시한다')
  4: {
    to: 2,
    restore: { no: 5, from: 'conceal', to: 'reveal',
               sentFrom: 'predict droughts and conceal subtle changes',
               sentTo:   'predict droughts and reveal subtle changes' },
    corrupt: { no: 2, from: 'sense', to: 'ignore',
               sentFrom: 'emit a signal when they sense certain compounds',
               sentTo:   'emit a signal when they ignore certain compounds',
               fix: 'sense' },
    explanation_ko: '특정 화합물을 감지했을 때 신호를 내보낸다는 맥락이므로 ignore(무시하다)는 정반대다. sense 가 되어야 한다.',
    distractor_ko: '① 신호를 내보내므로 emit 이 맞다. ③ 폭발물을 감지하는지가 연구 목표였다. ④ 잠재력이 더 넓다는 뜻이므로 broader 가 맞다. ⑤ 식물이 변화를 알려 주므로 reveal 이 적절하다.',
  },
};

for (const [noStr, e] of Object.entries(EDITS)) {
  const no = +noStr;
  const p = `data/EX2/${no}-variant.json`;
  const d = JSON.parse(fs.readFileSync(p, 'utf8'));
  const it = d.by_type.vocab;

  for (const step of [e.restore, e.corrupt]) {
    const u = it.underlines.find(x => x.no === step.no);
    if (!u || u.text !== step.from) throw new Error(`EX2/${no} 밑줄 ${step.no} 예상 불일치: ${u && u.text}`);
    const si = u.sent_index;
    if (!it.passage[si].includes(step.sentFrom)) throw new Error(`EX2/${no} sent${si} 원문 불일치`);
    it.passage[si] = it.passage[si].replace(step.sentFrom, step.sentTo);
    u.text = step.to;
    if (step.fix) { u.correct = false; u.fix = step.fix; }
    else { u.correct = true; delete u.fix; }
  }
  it.answer = e.to;
  it.explanation_ko = e.explanation_ko;
  it.distractor_ko  = e.distractor_ko;

  const wrong = it.underlines.filter(u => u.correct === false);
  if (wrong.length !== 1 || wrong[0].no !== e.to) throw new Error(`EX2/${no}: 오답 밑줄이 정확히 1개(${e.to})가 아님`);
  fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n', 'utf8');
  console.log(`  EX2/${no} vocab  5 → ${e.to}   (${e.restore.from}→${e.restore.to} 정상화 / ${e.corrupt.from}→${e.corrupt.to} 오용)`);
}
