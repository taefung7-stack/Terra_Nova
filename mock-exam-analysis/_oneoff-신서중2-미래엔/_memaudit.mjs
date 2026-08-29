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
const TEXTBOOK = {
  L5: [
    `Hi, my name is Yujin, and I'm writing a blog to introduce my hometown, Chuncheon. Have you ever visited Chuncheon? It's famous for its beautiful mountains and lakes. There are so many things to do and so many things to see. Nowadays, the number of foreign tourists who visit Chuncheon is growing. I want to share the history of Chuncheon and tips for visitors from around the world. So, I started this blog.`,
    `Today's focus is the Memorial Hall for Ethiopian Soldiers in the Korean War. On the first floor of the hall, visitors can see the names and pictures of the brave soldiers. On the second floor, Ethiopian cultural items are displayed. If you want to know about the special history between Korea and Ethiopia, please click on the link below.`,
    `Ethiopia and Korea are far apart on the map, but they have had strong ties for many years. Ethiopia was the only African country to send soldiers during the Korean War. Ethiopian soldiers fought many battles in Chuncheon and never lost. During the war, some Korean children lost their parents. Ethiopian soldiers used their own money to help them.`,
    `In the 2000s, Chuncheon became the sister city of Addis Ababa, the capital city of Ethiopia. Each city built a memorial hall to honor the Ethiopian soldiers who fought in the Korean War. The Memorial Hall in Chuncheon was built in 2006. It looks like a traditional Ethiopian house. It has three round roofs. Here, you can feel the strong friendship between the two countries.`,
    `In the next story, I will introduce Soyanggang Skywalk and share some useful tips for traveling there. You don't want to miss it!`,
  ],
  L6: [
    `When did you last try something new? I have always wanted to learn skateboarding. Today, I took the first step toward becoming a cool skater boy. I joined a one-day skateboarding class.`,
    `When I got to the skatepark, I saw a guy skateboarding in a big bowl. He was Eric, my skateboarding teacher. He jumped into the air and flipped the board. He landed cleanly. He reminded me of a surfer on a big wave. I learned from a blog that skateboarding began with surfers in California. They wanted to surf on land, too, so they put wheels on wooden boards. When there was little rain in California, skateboarders used empty swimming pools as their skateparks.`,
    `Before the lesson, Eric and I did a warm-up exercise. Eric told me, "Safety is the most important thing, Ian!" Then, he made me wear a helmet and pads to stay safe during the class.`,
    `The lesson finally began. Eric taught me the most basic skill, the "push-off." To push off on the skateboard, I put one foot on the board and pushed against the ground with the other foot. Tada! I moved forward! This skill looked simple, but I fell down many times. With practice, I was able to keep my balance and ride. I heard Eric cheering for me.`,
    `After the lesson, I realized skateboarding is more than just a cool-looking sport. It makes me feel free. I am glad that I started my skateboarding journey today. My shoes and jeans got dirty, but I felt great. It shows I practiced really hard. I hope to skate better and more freely someday. Do you want to try skateboarding, too? Just visit the nearest skatepark!`,
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
for (const L of ['L5', 'L6']) {
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
