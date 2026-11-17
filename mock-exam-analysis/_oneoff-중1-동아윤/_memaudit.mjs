#!/usr/bin/env node
/* ===================================================================
 * 본문암기 PDF 전수 검수 — "원문 한 문장도 빠지면 안 된다"
 * ===================================================================
 * ★ 핵심: 비교 기준을 _SOURCE-*.js 가 아니라 **교과서 원문 문자열**로 둔다.
 *   _SOURCE 를 기준으로 삼으면 전사 단계에서 이미 빠진 문장은 영원히 못 잡는다.
 *   아래 TEXTBOOK 은 사용자가 제공한 교과서 본문 PDF 에서 문단째로 옮긴 것이며,
 *   여기서 문장을 기계적으로 쪼개 기준 집합을 만든다.
 *
 * 검사:
 *   1) 교과서 원문 문장 수 = 암기장 문항 수
 *   2) 교과서의 모든 영어 문장이 암기장 '정답면'에 존재
 *   3) 모든 문항의 한글이 '문제면'에 존재 (해석 누락·빈칸 방지)
 *   4) 문제 번호·정답 번호가 1..N 연속이며 서로 짝이 맞음
 *   5) 잘림 검사 — 각 문장이 '끝까지' 들어갔는지(마지막 6단어까지 대조)
 * =================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

/* ── 교과서 원문 (사용자 제공 PDF 에서 문단 단위로 전사) ───────────── */
/* 중1 동아윤 6과/7과/8과.pdf(2026-11-17) 영어 본문을 문단·말차례 단위로 옮김(소제목 제외).
   인쇄본 조판 정리(닫는 따옴표 모양·느낌표 뒤 공백)만 정본과 같게 맞췄다. */
const TEXTBOOK = {
  L6: [
    `Every day, we produce lots of waste, and the Earth is getting sicker and sicker. Do you want to save the Earth? Then, join the zero-waste challenge, and share your stories.`,
    `Olivia: My birthday was last Saturday, and my family and I ate out. There were lots of leftovers, but we brought them home. The next day, I made a nice lunch out of them. FYI, you can find great cooking ideas for leftovers on the Internet.`,
    `Domingo: My dog tore my bag. I wanted to buy a new one, but I thought again. I learned that reusing is important for zero-waste living. So, I decided to fix it and reuse it. I’m not very good at sewing, and I don’t think that the bag looks perfect. I guess it’s all right.`,
    `Emma: I often use food delivery services, but today I didn’t. Instead, I walked to my favorite restaurant with a reusable container and picked up the food. I heard that plastic never goes away completely. I didn’t use any single-use plastic today. I felt good!`,
    `Minsu: Yesterday, I took some plastic and glass bottles to a recycling machine near my house. I put them into the machine one by one, and I got some points in return. What can I do with those points? Well, I can use them like money. Don’t you think that’s cool?`,
  ],
  L7: [
    `Hi, I’m Jim Brown, the director of Happy Days. It’s a movie about the friendship between Tom and his dog Max. A lot of people are working hard to create this movie. Do you want to meet some of them?`,
    `I’m Anna, and I found this beautiful beach. I’m a location manager, and my job is to find perfect places for shooting. Of course, it is not easy, but I love my job. I like to travel and enjoy challenges.`,
    `I’m Peter, the director of photography for this movie. I’m in charge of all the cameras. Today, Tom and Max are going to play together with a ball on the beach. To capture their happy moments, I’m going to use drones.`,
    `I’m Jennifer. I trained and took care of Max for a long time. Max is a great actor, but he sometimes gets too excited when a lot of people are around. So, I use hand signals to calm him. Who am I? I’m an animal wrangler.`,
    `My name is Emma, and I’m a film editor. My work begins after the shooting is over. To create a better story, I can change the order of scenes or delete some of them. Storytelling skills are important for my job, so I read a lot.`,
    `I’m Chris, and I’m a Foley artist. I create sound effects in my studio when recording on location is not easy. Listen carefully. Do you hear the sound of waves? I made that sound with rice and a plastic container. Doesn’t it sound real?`,
  ],
  L8: [
    `There was a little girl with golden hair in a small town. Her name was Goldilocks. She liked to share photos on social media. At first, she posted everyday things, but people didn’t give her many likes.`,
    `“What should I do to get more likes?” she thought. “I know! I should post funny pictures.”`,
    `Now, her posts were getting a lot of likes, and Goldilocks was happy. Her followers, however, soon got bored. So, she decided to post more shocking pictures.`,
    `One day, she was taking a walk in the forest and found a cottage. She knocked on the door, but there was no answer. It was getting dark, and it started to rain. She opened the door and walked inside.`,
    `There were three bowls of soup on a table. She ate the smallest one and took selfies with a smile. There were also three chairs. She jumped on the smallest one again and again. It broke, but she didn’t care.`,
    `“It’s so fun!” shouted Goldilocks.`,
    `She took selfies again and posted all the selfies on social media. Then, she went upstairs and found three beds. She felt tired and fell asleep in the smallest bed.`,
    `About an hour later, three bears came home.`,
    `“Someone ate my soup and broke my chair!” cried Baby Bear.`,
    `They went upstairs and saw Goldilocks. Mother Bear found a phone next to Goldilocks.`,
    `“This is terrible! Look at all these posts of our home,” shouted Mother Bear angrily.`,
    `Goldilocks jumped up in surprise.`,
    `“You broke into our house and posted these pictures without our permission. Don’t you know these things are wrong?” said Father Bear.`,
    `“Please forgive me. I’m so sorry, and I’ll clean your house every day until the end of the summer,” said Goldilocks.`,
    `All summer long, Goldilocks worked hard. On the last day, Goldilocks said to Father Bear, “I deleted all my posts of your cottage, so please don’t worry.”`,
    `“You still don’t understand. Other people already shared them on social media. Your posts will live on forever,” said Father Bear.`,
    `“Oh, I didn’t think about that,” said Goldilocks. “From now on, I’ll think twice before I press POST.”`,
  ],
};

/* 문단 → 문장 분리.
   "Ian!" / "push-off." 처럼 닫는 따옴표가 뒤따르는 경우, Tada! I moved forward!
   같은 감탄문, 약어가 아닌 마침표를 모두 문장 경계로 본다. */
function splitSentences(para) {
  const out = [];
  let buf = '';
  for (let i = 0; i < para.length; i++) {
    buf += para[i];
    if (/[.!?]/.test(para[i])) {
      // 닫는 따옴표가 붙어 있으면 함께 삼킨다
      while (i + 1 < para.length && /["'”’]/.test(para[i + 1])) { buf += para[++i]; }
      // 다음 문자가 공백+대문자(또는 끝)면 문장 종료
      const rest = para.slice(i + 1);
      if (/[”"]$/.test(buf) && /^\s+(I|[A-Z][a-z]+)\s+(said|asked|shouted|cried|went on)\./.test(rest)) continue;   // "I cried." 처럼 화자 표시로 끝날 때만(“…?” I said to myself, … 는 새 문장)
      if (/\.\.\.$/.test(buf)) continue;
      if (!rest.trim() || /^\s+["“']?[A-Z]/.test(rest)) {
        out.push(buf.trim());
        buf = '';
      }
    }
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

const sq = (s) => String(s ?? '')
  .replace(/[‘’ʼ]/g, "'").replace(/[“”]/g, '"')
  .replace(/ﬁ/g, 'fi').replace(/ﬂ/g, 'fl')
  .replace(/[‐-―–—]/g, '-')
  .replace(/[^A-Za-z0-9]/g, '')
  .toLowerCase();

const sqk = (s) => String(s ?? '').replace(/\s+/g, '').replace(/[.,!?"'“”‘’()·…]/g, '');

let block = 0;
const AUDIT_TARGETS = process.argv[2] ? [process.argv[2].toUpperCase()] : ['L6', 'L7', 'L8'];
for (const L of AUDIT_TARGETS) {
  console.log(`\n${'='.repeat(66)}\n${L} — 교과서 원문 기준 검수\n${'='.repeat(66)}`);

  /* 1) 교과서에서 기준 문장 집합 생성 */
  const truth = TEXTBOOK[L].flatMap(splitSentences);

  /* 2) 정본(_SOURCE)과 교차 확인 — 전사 단계 누락 탐지 */
  const { SOURCE } = await import(`./_SOURCE-${L}.js`);
  const srcSents = SOURCE.flatMap(c => c.sentences);
  console.log(`  교과서 문장 ${truth.length} · 정본(_SOURCE) 문장 ${srcSents.length}`);
  if (truth.length !== srcSents.length) {
    console.log(`  ❌ 문장 수 불일치 — 전사 단계에서 누락/추가 발생`);
    block++;
  }
  const srcSet = new Set(srcSents.map(sq));
  const missInSrc = truth.filter(t => !srcSet.has(sq(t)));
  if (missInSrc.length) {
    block++;
    console.log(`  ❌ 정본에 없는 교과서 문장 ${missInSrc.length}건:`);
    missInSrc.forEach(s => console.log(`     · ${s}`));
  }
  const truthSet = new Set(truth.map(sq));
  const extraInSrc = srcSents.filter(s => !truthSet.has(sq(s)));
  if (extraInSrc.length) {
    block++;
    console.log(`  ❌ 교과서에 없는 정본 문장 ${extraInSrc.length}건(창작 의심):`);
    extraInSrc.forEach(s => console.log(`     · ${s}`));
  }

  /* 3) 암기장 PDF 대조 */
  const pdfTxt = fs.readFileSync(path.join(HERE, `dist/_memaudit/${L}.txt`), 'utf8');
  const pages = pdfTxt.split('<<<PAGE>>>');
  const en = sq(pdfTxt);

  let missPdf = 0, cut = 0;
  for (const t of truth) {
    if (!en.includes(sq(t))) {
      missPdf++; block++;
      console.log(`  ❌ 암기장 정답면에 없음: ${t}`);
    } else {
      /* 잘림 검사 — 문장의 뒷부분 6단어가 함께 있는지 */
      const tail = t.trim().split(/\s+/).slice(-6).join(' ');
      if (tail && !en.includes(sq(tail))) {
        cut++; block++;
        console.log(`  ❌ 문장 끝이 잘림: …${tail}`);
      }
    }
  }

  /* 4) 한글(문제면) 전수 확인 */
  const koAll = [];
  for (const ch of SOURCE) {
    const d = JSON.parse(fs.readFileSync(path.join(HERE, `data/${L}/${ch.no}.json`), 'utf8'));
    koAll.push(...d.passage_ko);
  }
  const koPdf = sqk(pdfTxt);
  let missKo = 0;
  koAll.forEach((k, i) => {
    if (!koPdf.includes(sqk(k))) { missKo++; block++; console.log(`  ❌ 문제면에 한글 ${i + 1}번 없음: ${k}`); }
  });

  /* 5) 번호 연속성 — HTML 로 확인(PDF 텍스트는 번호가 섞여 나옴) */
  const html = fs.readFileSync(path.join(HERE, `dist/${L}/memorize.html`), 'utf8');
  const qNos = [...html.matchAll(/class="ti-no">(\d+)\./g)].map(m => +m[1]);
  const aNos = [...html.matchAll(/class="al-no">(\d+)</g)].map(m => +m[1]);
  const expect = Array.from({ length: truth.length }, (_, i) => i + 1);
  const okQ = JSON.stringify(qNos) === JSON.stringify(expect);
  const okA = JSON.stringify(aNos) === JSON.stringify(expect);
  if (!okQ) { block++; console.log(`  ❌ 문제 번호 불연속: [${qNos}]`); }
  if (!okA) { block++; console.log(`  ❌ 정답 번호 불연속: [${aNos}]`); }

  /* 6) 정답면의 영어가 실제로 교과서 문장인지(순서까지) */
  const aTexts = [...html.matchAll(/class="al-body"><span class="en">([\s\S]*?)<\/span>/g)]
    .map(m => m[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
  let orderBad = 0;
  aTexts.forEach((a, i) => {
    if (sq(a) !== sq(truth[i] ?? '')) { orderBad++; }
  });
  if (orderBad) {
    block++;
    console.log(`  ❌ 정답면 문장이 교과서 순서와 다름 ${orderBad}건`);
    aTexts.forEach((a, i) => {
      if (sq(a) !== sq(truth[i] ?? '')) console.log(`     [${i + 1}] 교과서: ${truth[i]}\n         암기장: ${a}`);
    });
  }

  console.log(`  ── 결과: 교과서 ${truth.length}문장 · 정답면 ${truth.length - missPdf}/${truth.length}` +
    ` · 문제면 한글 ${koAll.length - missKo}/${koAll.length}` +
    ` · 번호 ${okQ && okA ? '연속 ✓' : '✗'} · 순서 ${orderBad ? '✗' : '✓'} · 잘림 ${cut}`);
}

console.log(`\n${'='.repeat(66)}`);
console.log(block ? `❌ 차단 ${block}건` : '✅ 차단 0 — 교과서 원문 기준 누락 없음');
process.exit(block ? 1 : 0);
