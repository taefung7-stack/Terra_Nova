#!/usr/bin/env node
/* ===================================================================
 * 봉영여중3 추가지문 4 — 12 The Lipstick Effect · 13 The Halo Effect — 변형문제 저작
 * ===================================================================
 * data/EX4V/{12,13}-variant.json 생성. 직접 JSON 을 고치지 말고 여기서 고친다.
 * 스키마: variant-v0.3-type-grouped (_author-EXV-variant.mjs 와 동일)
 *
 * 정답 분포(객관식 22문항) — 12: ①2 ②3 ③2 ④3 ⑤1 · 13: ①2 ②2 ③2 ④2 ⑤3 → 합계 ①4 ②5 ③4 ④5 ⑤4
 * ⚠️ summary.options[].no 는 배열 위치(1..5)와 반드시 같게 — 렌더러가 no 로 ①~⑤ 를 찍는다.
 * ⚠️ blank_sentence_index 는 0-based, 그 문장에 ___ 가 있어야 한다.
 * ⚠️ 따옴표는 곱슬따옴표(“ ” ‘ ’)만 — 직선따옴표는 PDF 에서 빈칸처럼 렌더된다.
 * ⚠️ 배열 영작 <보기>는 build-variant.mjs 가 섞지 않는다 → scramble() 로 원문 이웃쌍 0·첫 단어 다름.
 * =================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(HERE, 'data', 'EX4V');
const NUM = ['①', '②', '③', '④', '⑤'];
const ORDER = ['(A) - (B) - (C)', '(A) - (C) - (B)', '(B) - (A) - (C)', '(B) - (C) - (A)', '(C) - (A) - (B)'];
const BLANK = '______________________';

const ul = (list) => list.map(([sent_index, text, fix], i) => (fix
  ? { no: i + 1, sent_index, text, correct: false, fix }
  : { no: i + 1, sent_index, text, correct: true }));
const summaryOpts = (pairs) => pairs.map(([A, B], i) => ({ no: i + 1, A, B }));

/* 배열 영작 <보기> 섞기 — 결정적. 원문에서 이웃한 두 단어(문자열 쌍)가 같은 순서로 붙어 남지 않고
 * 첫 단어도 원래 첫 단어가 아니도록 고른다. 같은 단어가 두 번 나와도 글자 기준으로 센다. */
const hash = (str) => { let h = 2166136261; for (const c of str) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const rngOf = (seed) => { let t = seed; return () => { t = (t + 0x6D2B79F5) >>> 0; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; };
function scramble(words, seedKey) {
  const k = (w) => w.toLowerCase();
  const adj = new Set(words.slice(1).map((w, i) => `${k(words[i])} ${k(w)}`));
  let best = null, bestScore = Infinity;
  for (let attempt = 0; attempt < 2000 && bestScore > 0; attempt++) {
    const rng = rngOf(hash(`${seedKey}#${attempt}`));
    const arr = words.slice();
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    const kept = arr.slice(1).filter((w, i) => adj.has(`${k(arr[i])} ${k(w)}`)).length;
    const score = kept * 2 + (k(arr[0]) === k(words[0]) ? 1 : 0);
    if (score < bestScore) { best = arr; bestScore = score; }
  }
  return best;
}

function write(n, topic_ko, bt) {
  const data = JSON.parse(fs.readFileSync(path.join(DIR, `${n}.json`), 'utf8'));
  const ko = (r) => data.passage_ko[r - 1];
  const en = (r) => data.passage[r - 1];
  for (const w of bt.writing) {
    if (w.ref) {
      if (w.subtype === 'word_order') {
        w.answer = en(w.ref);
        w.ko_prompt = ko(w.ref);
        w.words = scramble(en(w.ref).split(/\s+/).map(t => t.replace(/[,.!?:;”“]/g, '')).filter(Boolean)
          .map((t, i) => (i === 0 ? t.toLowerCase() : t)), `EX4V|${n}|${w.ref}`);
      } else if (w.subtype === 'translate_ko') {
        w.en_prompt = en(w.ref);
        w.answer = ko(w.ref);
      } else if (w.subtype === 'conditioned_write') {
        w.answer = en(w.ref);
        w.ko_prompt = ko(w.ref);
      }
      delete w.ref;
    }
  }
  const out = {
    $schema_version: 'variant-v0.3-type-grouped',
    $ref_source: `${n}.json`,
    passage_id: n,
    topic_ko,
    by_type: bt,
  };
  fs.writeFileSync(path.join(DIR, `${n}-variant.json`), JSON.stringify(out, null, 2) + '\n', 'utf8');
  const ans = Object.entries(bt).filter(([kk]) => kk !== 'writing').map(([kk, v]) => `${kk}${NUM[v.answer - 1]}`);
  console.log(`✓ ${n}-variant.json  ${ans.join(' ')} · 서술형 ${bt.writing.length}`);
}

/* ═══════════════════════ 12. The Lipstick Effect ═══════════════════════ */
const P12_A = [
  'When the economy slows down, many people cut back on big purchases.',
  'They spend less money on expensive products such as designer bags.',
  'Yet they do not stop treating themselves completely.',
  'Instead, they spend a little on small luxuries such as a lipstick or a bottle of perfume.',
  'These items cost far less than a designer bag, but they still lift people’s mood.',
  'This pattern is known as the lipstick effect.',
  'It shows that people look for affordable pleasures even in hard times.',
  'A small treat can make a difficult day feel a little brighter.',
];
const P12_B = [
  'People do not give up every pleasure when money is tight.',
  'During an economic slump, they stop spending on costly products like designer bags.',
  'However, they still want something to brighten their everyday lives.',
  'So they turn to cheaper treats, such as a new lipstick or a small bottle of perfume.',
  'These little purchases are easy on the wallet but still make them feel good.',
  'This pattern is called the lipstick effect.',
  'It reminds us that the wish to enjoy life does not disappear in hard times.',
  'People simply find more affordable ways to satisfy it.',
];
write(12, '립스틱 효과 — 경기가 나빠도 사람들은 감당할 수 있는 작은 즐거움(립스틱·향수)을 산다', {
  theme: {
    passage: P12_A,
    choices: [
      'the reasons designer bags become more expensive over time',
      'why people buy small, affordable treats when the economy is bad',
      'how cosmetic companies advertise their products online',
      'the importance of saving money for the future',
      'the history of lipstick as a popular fashion item',
    ],
    answer: 2,
    explanation_ko: '경기가 나쁘면 비싼 물건은 줄이지만 립스틱·향수 같은 저렴한 즐거움은 계속 산다는 내용이므로 ②가 주제이다.',
    distractor_ko: '① 가방 가격이 오르는 이유는 다루지 않는다. ③ 화장품 광고는 나오지 않는다. ④ 저축의 중요성이 아니라 작은 소비를 다룬다. ⑤ 립스틱의 역사는 나오지 않는다.',
  },
  gist: {
    passage: P12_B,
    choices: [
      '경기가 나빠지면 사람들은 모든 소비를 멈춘다.',
      '비싼 제품일수록 사람들에게 더 큰 행복을 준다.',
      '불황기에는 화장품 회사의 매출이 크게 줄어든다.',
      '어려운 시기에도 사람들은 감당할 수 있는 작은 즐거움을 찾는다.',
      '돈을 아끼려면 작은 사치품부터 줄여야 한다.',
    ],
    answer: 4,
    explanation_ko: '돈이 부족해도 즐거움을 모두 포기하지 않고 더 저렴한 방법(립스틱·향수)으로 삶을 즐긴다는 내용이므로 ④가 요지이다.',
    distractor_ko: '① 비싼 제품만 줄이고 작은 즐거움은 산다. ② 오히려 저렴한 물건이 기분을 좋게 한다. ③ 매출 이야기는 없다. ⑤ 작은 사치품은 오히려 계속 산다.',
  },
  title: {
    passage: P12_A,
    choices: [
      'Small Treats in Hard Times: The Lipstick Effect',
      'How to Choose the Right Lipstick',
      'Designer Bags: A Smart Investment',
      'Why People Stop Shopping in a Crisis',
      'The Secret History of Perfume',
    ],
    answer: 1,
    explanation_ko: '어려운 시기에도 작은 사치(립스틱·향수)로 기분을 내는 립스틱 효과를 다루므로 ①이 제목으로 알맞다.',
    distractor_ko: '② 립스틱 고르는 법은 나오지 않는다. ③ 가방은 오히려 줄이는 소비이다. ④ 쇼핑을 멈추는 것이 아니라 작은 것을 산다. ⑤ 향수의 역사는 다루지 않는다.',
  },
  implication: {
    passage: [
      'When times are hard, many families check their budgets carefully.',
      'Big spending on designer bags or other expensive products is often the first thing to go.',
      'But giving up every pleasure would make daily life feel gray.',
      'That is why some people still pick up a new lipstick or a tiny bottle of perfume.',
      'These products are fairly cheap, yet they make people feel happy.',
      'For a small price, they open a small window of joy in a difficult week.',
      'This is known as the lipstick effect.',
      'People keep looking for affordable ways to enjoy their lives.',
    ],
    underlined: 'a small window of joy',
    choices: [
      'a chance to earn extra money during a crisis',
      'a way to save money for an expensive bag',
      'a little happiness that an inexpensive item brings',
      'a short break from shopping for cosmetics',
      'a new store that sells only cheap products',
    ],
    answer: 3,
    explanation_ko: '싼값에 립스틱·향수를 사서 힘든 한 주에 잠깐의 기쁨을 얻는다는 뜻이므로, 저렴한 물건이 주는 작은 행복인 ③이 알맞다.',
    distractor_ko: '① 돈을 버는 이야기가 아니다. ② 비싼 가방은 오히려 포기한다. ④ 쇼핑을 쉬는 것이 아니라 작은 물건을 산다. ⑤ 실제 가게(window)를 뜻하지 않는다.',
  },
  grammar: {
    passage: [
      'The lipstick effect is a curious pattern in the economy.',
      'When the economy is bad, people spend less money on expensive products.',
      'However, they still want to enjoy small pleasures every day.',
      'Instead of buying a designer bag, some people may buy a new lipstick.',
      'Such products are fairly cheap, but they can make people to feel happy.',
      'Even during difficult times, people still look for affordable ways to enjoy their lives.',
    ],
    underlines: ul([
      [1, 'less money'],
      [2, 'to enjoy'],
      [3, 'Instead of buying'],
      [4, 'make people to feel', 'make people feel'],
      [5, 'ways to enjoy'],
    ]),
    choices: NUM,
    answer: 4,
    explanation_ko: '사역동사 make 는 「make + 목적어 + 동사원형」 구조이므로 make people to feel 은 make people feel 이 되어야 한다.',
    distractor_ko: '① 셀 수 없는 명사 money 앞이라 little 의 비교급 less. ② want 는 to부정사를 목적어로 취한다. ③ 전치사구 instead of 뒤에는 동명사 buying. ⑤ ways 를 꾸미는 형용사적 to부정사.',
  },
  vocab: {
    passage: [
      'The lipstick effect describes how people shop when the economy is weak.',
      'In bad times, they spend less money on expensive items.',
      'However, they completely give up small pleasures in their daily lives.',
      'Instead of a designer bag, they may buy a new lipstick or a small perfume.',
      'These items are relatively inexpensive, yet they lift people’s mood.',
      'Even in difficult times, people look for affordable ways to enjoy life.',
    ],
    underlines: ul([
      [1, 'less'],
      [2, 'completely give up', 'still want to enjoy'],
      [3, 'Instead of'],
      [4, 'inexpensive'],
      [5, 'affordable'],
    ]),
    choices: NUM,
    answer: 2,
    explanation_ko: 'However 로 앞 문장(비싼 물건에 돈을 덜 씀)과 대조되며, 뒤 문장에서 립스틱·향수를 산다고 했으므로 작은 즐거움을 ‘완전히 포기한다’가 아니라 ‘여전히 즐기고 싶어 한다’가 알맞다.',
    distractor_ko: '① 불황에는 비싼 물건에 돈을 ‘덜’ 쓴다. ③ 가방 ‘대신’ 립스틱을 산다. ④ 립스틱·향수는 비교적 ‘저렴하다’. ⑤ ‘감당할 만한’ 방법을 찾는다.',
  },
  blank: {
    passage: [
      'When the economy is bad, people often feel they must save money.',
      'They stop buying expensive products such as designer bags.',
      'Still, they want small pleasures in their daily lives.',
      'So they buy cheaper items like a new lipstick or a small perfume.',
      'These products do not cost much, but they make people feel happy.',
      `The lipstick effect shows that even in hard times, people ${BLANK}.`,
      'They simply choose pleasures that fit their budget.',
    ],
    blank_sentence_index: 5,
    blank_target: BLANK,
    choices: [
      'stop spending money on anything they enjoy',
      'buy more designer bags than before',
      'save all of their money for the future',
      'care less about how they look',
      'still find affordable ways to enjoy their lives',
    ],
    answer: 5,
    explanation_ko: '비싼 가방 대신 저렴한 립스틱·향수로 행복을 느낀다고 했으므로, 어려운 시기에도 사람들은 ‘삶을 즐길 감당할 만한 방법을 여전히 찾는다’.',
    distractor_ko: '① 즐거움을 모두 포기하지 않는다. ② 비싼 가방은 오히려 사지 않는다. ③ 작은 것에는 돈을 쓴다. ④ 외모에 덜 신경 쓴다는 내용은 없다.',
  },
  irrelevant: {
    intro: 'The lipstick effect describes how people spend money when the economy is bad.',
    sentences: [
      'In hard times, people often spend less money on expensive products like designer bags.',
      'However, they still want to enjoy small pleasures in their daily lives.',
      'Some lipsticks are designed to last all day without fading.',
      'So they buy relatively inexpensive items, such as a new lipstick or a small perfume.',
      'These small purchases help them feel happy without spending too much.',
    ],
    choices: NUM,
    answer: 3,
    explanation_ko: '③은 립스틱의 지속력(제품 성능)에 관한 내용으로, 불황기의 소비 심리를 다루는 글의 흐름과 무관하다.',
    distractor_ko: '① 비싼 제품 소비 감소, ② 작은 즐거움에 대한 욕구, ④ 저렴한 대체 구매, ⑤ 그 효과로 모두 흐름에 맞다.',
  },
  order: {
    given: 'The lipstick effect is an interesting economic phenomenon. When the economy is bad, people often spend less money on expensive products.',
    blocks: {
      A: 'However, they do not give up every pleasure. They still want to enjoy small treats in their daily lives.',
      B: 'In this way, the lipstick effect shows that even in difficult economic times, people look for affordable ways to enjoy their lives.',
      C: 'For example, instead of buying an expensive designer bag, some people may buy a new lipstick or a small perfume. Such products are relatively inexpensive, but they make people feel happy.',
    },
    choices: ORDER,
    answer: 2,
    explanation_ko: '비싼 제품에 돈을 덜 쓴다(주어진 글) → However 로 작은 즐거움은 원한다(A) → For example 로 립스틱·향수의 예(C) → In this way 로 결론(B) 순이다.',
    distractor_ko: '(C)의 For example 은 (A)의 small treats 의 예시이므로 (A) 뒤에 오고, (B)의 In this way 는 앞의 내용을 모두 정리하므로 맨 끝이다.',
  },
  insert: {
    insert_sentence: 'These products are relatively inexpensive, but they can still make people feel happy.',
    passage_marked: [
      { text: 'The lipstick effect is a common pattern in hard economic times.', slot_after: 1 },
      { text: 'When the economy is bad, people spend less money on expensive products.', slot_after: 2 },
      { text: 'However, they still want to enjoy small pleasures in their daily lives.', slot_after: 3 },
      { text: 'For example, instead of a designer bag, some people buy a new lipstick or a small perfume.', slot_after: 4 },
      { text: 'That is why this pattern is named after the lipstick.', slot_after: 5 },
    ],
    choices: NUM,
    answer: 4,
    explanation_ko: '주어진 문장의 These products 는 바로 앞의 립스틱·작은 향수를 가리키므로 ④에 들어간다. 뒤 문장의 That is why(그래서 립스틱의 이름이 붙었다)는 ‘저렴하지만 행복하게 해 준다’를 이유로 받는다.',
    distractor_ko: '①②③ 앞에는 These products 가 가리킬 립스틱·향수가 아직 나오지 않았다. ⑤ That is why 의 이유가 빠진 채 결론이 먼저 나오게 된다.',
  },
  summary: {
    passage: P12_B,
    summary_template: 'In hard economic times, people spend less on __(A)__ products, but they still buy small, __(B)__ treats to enjoy their lives.',
    options: summaryOpts([
      ['expensive', 'affordable'],
      ['cheap', 'luxurious'],
      ['expensive', 'luxurious'],
      ['necessary', 'affordable'],
      ['cheap', 'useless'],
    ]),
    answer: 1,
    explanation_ko: '비싼(expensive) 제품에는 돈을 덜 쓰지만 감당할 만한(affordable) 작은 즐거움은 계속 산다는 요약이다.',
    distractor_ko: '② 싼 제품을 줄이는 것이 아니다. ③ 사치스러운 것이 아니라 저렴한 것을 산다. ④ 줄이는 것은 필수품이 아니라 비싼 제품이다. ⑤ 저렴한 제품을 줄이고 쓸모없는 것을 사는 내용이 아니다.',
  },
  writing: [
    {
      subtype: 'word_order', subtype_label: '배열 영작', ref: 3,
      question: '다음 우리말과 같은 뜻이 되도록 <보기>의 단어를 모두 배열하여 영작하시오.',
      explanation_ko: 'want 는 to부정사를 목적어로 취하므로 want to enjoy, 부사 still 은 일반동사 want 앞에 둔다.',
    },
    {
      subtype: 'conditioned_write', subtype_label: '조건 영작', ref: 5,
      question: '다음 조건에 맞게 우리말을 영작하시오.',
      conditions: ['사역동사 make 를 사용할 것', 'feel + 형용사 구조를 쓸 것', '접속사 but 을 사용할 것'],
      explanation_ko: '「make + 목적어 + 동사원형」(make people feel)과 「feel + 형용사」(feel happy), 부사 relatively 가 형용사 inexpensive 를 꾸민다.',
    },
    {
      subtype: 'fill_blank', subtype_label: '빈칸 완성', show_passage: true,
      question: '본문의 내용에 맞게 빈칸에 알맞은 한 단어를 쓰시오.',
      context: 'For example, ___________ of buying an expensive designer bag, some people may buy a new lipstick or a small perfume.',
      answer: 'instead',
      explanation_ko: 'instead of + 동명사 ‘~하는 대신에’. 본문 4번 문장이다.',
    },
    {
      subtype: 'translate_ko', subtype_label: '우리말 해석', ref: 6,
      question: '다음 문장을 우리말로 해석하시오.',
      explanation_ko: 'shows that + 주어 + 동사, that절 안에 부사구 even during difficult economic times 가 끼어 있고 ways to enjoy 는 형용사적 to부정사이다.',
    },
    {
      subtype: 'summary_word', subtype_label: '요약문 완성', show_passage: true,
      question: '본문을 한 문장으로 요약할 때 빈칸 (A), (B)에 들어갈 말을 본문에서 찾아 각각 한 단어로 쓰시오.',
      summary: 'When the economy is bad, people spend __(A)__ money on expensive products, but they still look for __(B)__ ways to enjoy their lives.',
      answer_a: 'less', answer_b: 'affordable',
      explanation_ko: '본문 2번 문장의 spend less money, 6번 문장의 affordable ways to enjoy their lives 에서 찾는다.',
    },
    {
      subtype: 'topic_write', subtype_label: '주제문 쓰기',
      question: '다음 조건에 맞게 이 글의 주제문을 영어로 쓰시오.',
      ko_prompt: '이 글의 주제를 한 문장으로 쓰시오.',
      conditions: ['the lipstick effect 와 affordable 을 반드시 포함할 것', '15단어 내외의 완전한 문장으로 쓸 것'],
      answer: 'The lipstick effect shows that people buy affordable small pleasures even when the economy is bad.',
      explanation_ko: '불황이라는 상황과 감당할 만한 작은 즐거움을 산다는 행동을 한 문장에 담는다.',
    },
  ],
});

/* ═══════════════════════ 13. The Halo Effect ═══════════════════════ */
const P13_A = [
  'Sometimes one good thing about a person changes how we see everything else about them.',
  'This is known as the halo effect.',
  'If a classmate is great at English, we may assume that he or she is also good at math and science.',
  'We believe this even though we know nothing about the student’s real abilities.',
  'The same thing happens in advertising.',
  'When a famous star promotes a product, people tend to trust the product because they like the star.',
  'In both cases, a first impression shapes our judgment more than the facts do.',
  'So it is wise to judge people and products by their actual qualities.',
];
const P13_B = [
  'Have you ever thought someone was smart in every subject just because they were good at one?',
  'This is the halo effect at work.',
  'One good quality of a person or product makes us think well of their other qualities too.',
  'For instance, a student who speaks excellent English may seem like a math and science star as well.',
  'Advertising uses this effect when a popular celebrity promotes a product.',
  'Fans often believe the product is excellent simply because they like the celebrity.',
  'Such judgments come from first impressions, not from facts.',
  'We should therefore judge people and products by what they are really like.',
];
write(13, '후광 효과 — 한 가지 좋은 특성이 다른 특성에 대한 판단까지 좌우하므로 실제 특성으로 판단해야 한다', {
  theme: {
    passage: P13_A,
    choices: [
      'the importance of learning English well',
      'how celebrities become famous through advertising',
      'ways to make a good first impression on others',
      'why students should study math and science together',
      'how one good quality can affect our overall judgment',
    ],
    answer: 5,
    explanation_ko: '영어를 잘하는 학생과 연예인 광고의 예를 통해 한 가지 좋은 점이 전체 판단에 영향을 준다는 후광 효과를 설명하므로 ⑤가 주제이다.',
    distractor_ko: '① 영어 학습은 예시의 소재일 뿐이다. ② 연예인이 유명해지는 과정은 다루지 않는다. ③ 오히려 첫인상보다 사실로 판단하라고 한다. ④ 과목 공부법은 나오지 않는다.',
  },
  gist: {
    passage: P13_B,
    choices: [
      '좋은 첫인상을 남기는 것이 성공의 열쇠이다.',
      '유명인이 광고하는 제품은 품질을 믿어도 된다.',
      '한 가지 장점에 휘둘리지 말고 실제 특성으로 판단해야 한다.',
      '영어를 잘하는 학생은 다른 과목도 잘한다.',
      '광고는 소비자에게 정확한 정보를 제공한다.',
    ],
    answer: 3,
    explanation_ko: '한 가지 좋은 특성 때문에 다른 특성까지 좋게 보는 판단은 첫인상에서 나온 것이므로, 실제 모습으로 판단해야 한다는 ③이 요지이다.',
    distractor_ko: '① 첫인상을 남기는 법이 아니라 첫인상에 속지 말라는 글이다. ② 연예인 때문에 제품을 믿는 것이 바로 후광 효과이다. ④ 그렇게 ‘보일’ 뿐 실제로는 알 수 없다. ⑤ 광고의 정확성은 다루지 않는다.',
  },
  title: {
    passage: P13_A,
    choices: [
      'Why English Is the Most Important Subject',
      'One Bright Spot: How the Halo Effect Shapes Our Judgments',
      'Why Famous Stars Sell More Products',
      'Tips for Making a Strong First Impression',
      'The Science of Learning Many Subjects',
    ],
    answer: 2,
    explanation_ko: '한 가지 좋은 점(One Bright Spot)이 판단 전체를 좌우하는 후광 효과를 다루므로 ②가 제목으로 알맞다.',
    distractor_ko: '① 영어가 가장 중요한 과목이라는 내용은 없다(영어는 예시의 소재). ③ 연예인 광고는 예시 중 하나이다. ④ 첫인상을 강하게 남기는 법은 다루지 않는다. ⑤ 여러 과목 학습법은 나오지 않는다.',
  },
  implication: {
    passage: [
      'Imagine meeting a new classmate who speaks English beautifully.',
      'Right away, you may think she is also a top student in math and science.',
      'Yet you have never seen her math test or her science report.',
      'Your opinion grew out of a single strength.',
      'The same thing happens when a famous celebrity promotes a product.',
      'Fans believe the product is excellent simply because they like the star.',
      'In both cases, we are blinded by the light of one bright quality.',
      'To be fair, we should look at actual qualities, not first impressions.',
    ],
    underlined: 'blinded by the light of one bright quality',
    choices: [
      'unable to see clearly because the room is too bright',
      'confused because the person has no good qualities',
      'impressed by facts that we have carefully checked',
      'jealous of people who are better than us',
      'judging everything by one good point we noticed first',
    ],
    answer: 5,
    explanation_ko: '영어 실력 하나, 연예인에 대한 호감 하나 때문에 나머지를 확인하지 않고 좋게 판단한다는 뜻이므로 ⑤가 알맞다.',
    distractor_ko: '① 실제로 눈이 부신 것이 아니다(비유). ② 좋은 특성이 있어서 생기는 일이다. ③ 사실을 확인하지 않았다. ④ 질투는 나오지 않는다.',
  },
  grammar: {
    passage: [
      'The halo effect is a psychological phenomenon that affect our judgments.',
      'It happens when one good quality influences how we think about other qualities.',
      'Imagine that you meet a student who is very good at English.',
      'You may think the student is also good at math, even though you do not know the facts.',
      'In advertising, a product promoted by a famous celebrity may seem excellent.',
      'This is simply because people like the celebrity.',
      'So we should try to judge things based on their actual qualities.',
    ],
    underlines: ul([
      [0, 'that affect', 'that affects'],
      [1, 'how we think'],
      [2, 'who is'],
      [3, 'even though'],
      [4, 'promoted'],
    ]),
    choices: NUM,
    answer: 1,
    explanation_ko: '주격 관계대명사 that 의 선행사가 단수 명사 a psychological phenomenon 이므로 동사는 affects 가 되어야 한다.',
    distractor_ko: '② influences 의 목적어인 간접의문문 「의문사 + 주어 + 동사」. ③ 선행사 a student(사람·단수) + who is. ④ 뒤에 「주어 + 동사」가 오는 양보 접속사 even though. ⑤ 제품이 ‘홍보되는’ 수동 관계이므로 과거분사 promoted.',
  },
  vocab: {
    passage: [
      'The halo effect is a common psychological phenomenon.',
      'One good quality of a person can influence how we judge their other qualities.',
      'If a student is good at English, we may assume the student is also good at math.',
      'We think this even though we do not know the student’s actual abilities.',
      'Likewise, people may trust a product because a celebrity they like promotes it.',
      'Such judgments are based on facts rather than first impressions.',
      'Therefore, we should judge people by their real qualities.',
    ],
    underlines: ul([
      [1, 'influence'],
      [2, 'assume'],
      [3, 'actual'],
      [4, 'promotes'],
      [5, 'facts rather than first impressions', 'first impressions rather than facts'],
    ]),
    choices: NUM,
    answer: 5,
    explanation_ko: '실제 능력을 모르면서 판단하고, 연예인이 좋아서 제품을 믿는 것은 사실이 아니라 첫인상에 근거한 판단이므로 ‘first impressions rather than facts’가 되어야 한다.',
    distractor_ko: '① 한 가지 특성이 다른 특성의 판단에 ‘영향을 준다’. ② 수학도 잘한다고 ‘가정한다’. ③ ‘실제’ 능력을 모른다. ④ 연예인이 제품을 ‘홍보한다’.',
  },
  blank: {
    passage: [
      'Why do we trust a product just because a famous celebrity promotes it?',
      'The answer lies in the halo effect.',
      'When one good quality stands out, it influences how we see everything else.',
      'A student who is great at English may seem good at math and science too.',
      'A product may seem excellent because we like the person who advertises it.',
      `In other words, our judgments are often shaped by ${BLANK}.`,
      'That is why we should try to judge things based on their actual qualities.',
    ],
    blank_sentence_index: 5,
    blank_target: BLANK,
    choices: [
      'careful research and real facts',
      'the opinions of experts we trust',
      'the prices of the products we buy',
      'first impressions rather than facts',
      'our memories of past failures',
    ],
    answer: 4,
    explanation_ko: '눈에 띄는 좋은 점 하나 때문에 확인하지 않은 다른 특성까지 좋게 보므로, 판단은 ‘사실보다는 첫인상’에 의해 만들어진다.',
    distractor_ko: '① 사실에 근거하지 않는다는 것이 핵심이다. ② 전문가 의견, ③ 가격, ⑤ 과거의 실패는 나오지 않는다.',
  },
  irrelevant: {
    intro: 'The halo effect happens when one good quality of a person or product influences how we think about their other qualities.',
    sentences: [
      'Learning a second language early can also improve memory skills.',
      'For example, if a student is very good at English, we may think the student is also good at math.',
      'We believe this even though we do not know the student’s actual abilities.',
      'Similarly, when a celebrity we like promotes a product, we may believe the product is excellent.',
      'This shows that our judgments are sometimes influenced by first impressions rather than facts.',
    ],
    choices: NUM,
    answer: 1,
    explanation_ko: '①은 조기 외국어 학습이 기억력에 주는 효과에 관한 내용으로, 후광 효과를 설명하는 글의 흐름과 무관하다.',
    distractor_ko: '② 학생 예시, ③ 실제 능력을 모른다는 점, ④ 광고 예시, ⑤ 결론으로 모두 흐름에 맞다.',
  },
  order: {
    given: 'The halo effect is an interesting psychological phenomenon. It happens when one good quality influences how we think about other qualities.',
    blocks: {
      A: 'The halo effect can also be seen in advertising. When a famous celebrity promotes a product, people may believe the product is excellent just because they like the celebrity.',
      B: 'For example, imagine that you meet a student who is very good at English. You may think the student is also good at math and science without knowing their actual abilities.',
      C: 'These examples show that our judgments are sometimes based on first impressions rather than facts. Therefore, we should judge people and products by their actual qualities.',
    },
    choices: ORDER,
    answer: 3,
    explanation_ko: '후광 효과의 정의(주어진 글) → For example 로 영어 잘하는 학생(B) → can also 로 광고 예시(A) → These examples 로 결론(C) 순이다.',
    distractor_ko: '(A)의 also 는 앞에 다른 예가 먼저 나왔음을 뜻하므로 (B) 뒤에 오고, (C)의 These examples 는 두 예시를 모두 받으므로 맨 끝이다.',
  },
  insert: {
    insert_sentence: 'People may believe that the product is excellent simply because they like the celebrity.',
    passage_marked: [
      { text: 'The halo effect happens when one good quality shapes how we see other qualities.', slot_after: 1 },
      { text: 'If a student is very good at English, we may think the student is good at math and science too.', slot_after: 2 },
      { text: 'We think so even though we do not know the student’s actual abilities.', slot_after: 3 },
      { text: 'The same effect can be seen when a famous celebrity promotes a product.', slot_after: 4 },
      { text: 'These quick conclusions, about the student and the product alike, come from first impressions rather than facts.', slot_after: 5 },
    ],
    choices: NUM,
    answer: 4,
    explanation_ko: '주어진 문장의 the product 와 the celebrity 는 ④ 앞 문장의 a product 와 a famous celebrity 를 받고, 뒤 문장의 ‘제품에 대한 성급한 결론’이 바로 이 믿음을 가리키므로 ④에 들어간다.',
    distractor_ko: '①②③ 앞에는 제품과 연예인이 아직 나오지 않았다. ⑤ 마지막 문장이 ‘제품에 대한 결론’을 이미 언급하므로 그 뒤에 오면 순서가 뒤바뀐다.',
  },
  summary: {
    passage: P13_B,
    summary_template: 'Because of the halo effect, one __(A)__ quality can change how we judge other qualities, so we should rely on __(B)__ qualities rather than first impressions.',
    options: summaryOpts([
      ['bad', 'imagined'],
      ['good', 'actual'],
      ['good', 'famous'],
      ['hidden', 'actual'],
      ['bad', 'actual'],
    ]),
    answer: 2,
    explanation_ko: '한 가지 좋은(good) 특성이 다른 특성의 판단을 바꾸므로, 첫인상보다 실제(actual) 특성에 근거해야 한다는 요약이다.',
    distractor_ko: '①⑤ 나쁜 특성이 아니라 좋은 특성이다. ③ 유명한 특성에 의존하라는 내용이 아니다. ④ 숨겨진 특성이 아니라 눈에 띄는 좋은 특성이다.',
  },
  writing: [
    {
      subtype: 'word_order', subtype_label: '배열 영작', ref: 5,
      question: '다음 우리말과 같은 뜻이 되도록 <보기>의 단어를 모두 배열하여 영작하시오.',
      explanation_ko: '조동사가 있는 수동태 「can + be + 과거분사」(can be seen), 부사 also 는 조동사와 be 사이에 둔다.',
    },
    {
      subtype: 'conditioned_write', subtype_label: '조건 영작', ref: 4,
      question: '다음 조건에 맞게 우리말을 영작하시오.',
      conditions: ['조동사 may 를 사용할 것', '양보의 접속사 even though 를 사용할 것', 'be good at 을 사용할 것'],
      explanation_ko: 'may + 동사원형(may think), 명사절 접속사 that, 양보의 even though + 주어 + 동사를 쓴다.',
    },
    {
      subtype: 'fill_blank', subtype_label: '빈칸 완성', show_passage: true,
      question: '본문의 내용에 맞게 빈칸에 알맞은 한 단어를 쓰시오.',
      context: 'The halo effect shows that our judgments are sometimes influenced by first impressions ___________ than facts.',
      answer: 'rather',
      explanation_ko: 'rather than ‘~보다는’. 본문 7번 문장이다.',
    },
    {
      subtype: 'translate_ko', subtype_label: '우리말 해석', ref: 2,
      question: '다음 문장을 우리말로 해석하시오.',
      explanation_ko: 'when 절의 주어는 one good quality of a person or product(단수 → influences), how we think 는 「의문사 + 주어 + 동사」 간접의문문이다.',
    },
    {
      subtype: 'summary_word', subtype_label: '요약문 완성', show_passage: true,
      question: '본문을 한 문장으로 요약할 때 빈칸 (A), (B)에 들어갈 말을 본문에서 찾아 각각 한 단어로 쓰시오.',
      summary: 'One good __(A)__ of a person or product can influence how we think about their other qualities, so we should judge them based on their __(B)__ qualities.',
      answer_a: 'quality', answer_b: 'actual',
      explanation_ko: '본문 2번 문장의 one good quality, 8번 문장의 based on their actual qualities 에서 찾는다.',
    },
    {
      subtype: 'topic_write', subtype_label: '주제문 쓰기',
      question: '다음 조건에 맞게 이 글의 주제문을 영어로 쓰시오.',
      ko_prompt: '이 글의 주제를 한 문장으로 쓰시오.',
      conditions: ['the halo effect 와 first impressions 를 반드시 포함할 것', '15단어 내외의 완전한 문장으로 쓸 것'],
      answer: 'The halo effect shows that first impressions, not facts, can influence how we judge people and products.',
      explanation_ko: '한 가지 좋은 점(첫인상)이 판단을 좌우한다는 내용과 사실이 아니라는 대비를 한 문장에 담는다.',
    },
  ],
});
