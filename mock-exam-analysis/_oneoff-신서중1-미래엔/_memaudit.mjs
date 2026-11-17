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
/* 신서중1 6과.pdf / 7과.pdf(2026-11-17) 영어 본문을 문단·말차례 단위로 옮김.
   인쇄본 조판 정리(닫는 따옴표 모양·느낌표 뒤 공백·…→...)만 정본과 같게 맞췄다. */
const TEXTBOOK = {
  L6: [
    `My teacher told us about tomorrow’s presentation. He asked us, “What do you want to be when you grow up?” I said to myself, “Oh, no. Not again! What do I want to be? I have no idea.”`,
    `At home, I asked my family about their dream jobs. Dad said, “Well, I wanted to be an astronaut when I was young. I wanted to travel to the moon.”`,
    `“When I grow up, I’m going to be a robot designer,” said my big sister Angela.`,
    `My little sister Sophie shouted, “I’m going to be a superhero or a bird!”`,
    `Dad asked me, “What about you, Noah? What do you want to be?”`,
    `I was stressed out.`,
    `Later, Mom came home from work.`,
    `“Noah, is everything okay?” she asked.`,
    `“No, Mom. Something is wrong with me. I’m not going to be anything in the future.”`,
    `“What do you mean?” she asked.`,
    `“Everyone has a dream job. Even Sophie does. And she’s only three!” I cried.`,
    `“Oh, Noah. I don’t know my dream job.”`,
    `“What? But you’re a grown-up, and you have a job,” I said.`,
    `“That’s right, but ...”`,
    `“And you take care of everyone. You have the answers to everything,” I went on. “You’re always nice, and you’re not afraid of anything. Most of all, you’re my mom!”`,
    `Mom smiled and said, “I hope you are right. I wanted to become that kind of person.”`,
    `“Mom! You’re already that kind of person!”`,
    `Just then, I had an idea. “That’s it! Thanks, Mom!”`,
    `The next day, I gave a presentation.`,
    `“What do I want to be when I grow up? I don’t know. Who do I want to be? I know that!`,
    `I want to be a caring person. I want to help others. I also want to be a brave person. I want to try new things.`,
    `Who do I want to be? I want to be me.”`,
  ],
  L7: [
    `Host: Welcome to the Paran Quiz Show! I’m your host, Suji. Today, we have two finalists, Namjun from Class 2 and Sara from Class 5. Namjun and Sara, how are you today?`,
    `Namjun: I’m nervous, but I’ll do my best.`,
    `Sara: I’m excited!`,
    `Host: The winner will receive a Fast Pass for lunch. Today’s topic is amazing facts about the world. I’m going to ask you three questions. Are you ready?`,
    `Namjun & Sara: Yes, I’m ready!`,
    `Host: Here is the first question. What is the largest desert in the world?`,
    `Namjun: It’s the Sahara.`,
    `Sara: It’s Antarctica.`,
    `Host: The answer is ... Antarctica!`,
    `Namjun: Antarctica? I thought a desert has to be hot and sandy.`,
    `Host: Well, it doesn’t need to be hot or sandy. We have AI Joe here. Hey Joe, can you tell us more about deserts?`,
    `AI Joe: A desert is a dry place. It can be cold or hot. The Sahara is the largest hot desert in the world. But Antarctica is larger than the Sahara. So Antarctica is the world’s largest desert.`,
    `Host: Thank you, Joe. Let’s move on to the next question. What is the tallest mountain in the world?`,
    `Namjun: It’s Mount Everest.`,
    `Sara: It’s Mauna Kea in Hawaii.`,
    `Host: Well, it’s a difficult question. Hey Joe, what is the tallest mountain on Earth?`,
    `AI Joe: Mount Everest is the tallest mountain above sea level. Mauna Kea begins below sea level. So from the bottom to the top, Mauna Kea is taller than Mount Everest.`,
    `Host: Thank you, Joe.`,
    `Sara: Then who is correct?`,
    `Host: For this question, you are both correct.`,
    `Host: Now, here comes the final question. Which country has the most pyramids in the world?`,
    `Sara: I’m sure it’s Egypt!`,
    `Namjun: It’s Sudan.`,
    `Host: The answer is ... Sudan!`,
    `Sara: Oh, really?`,
    `Host: I’m surprised, too. Hey Joe, tell us more about it.`,
    `AI Joe: Please look at this map. Sudan and Egypt are close to each other. Egypt is more famous for its pyramids, but Sudan has more pyramids than Egypt.`,
    `Host: Thanks, Joe. We have two winners today. Congratulations, Namjun and Sara!`,
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
const AUDIT_TARGETS = process.argv[2] ? [process.argv[2].toUpperCase()] : ['L6', 'L7'];
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
