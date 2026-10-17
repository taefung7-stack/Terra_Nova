#!/usr/bin/env node
/* ===================================================================
 * 봉영여중3 추가지문 9·10·11 — 변형문제 저작
 * ===================================================================
 * data/EXV/{9,10,11}-variant.json 생성. 직접 JSON 을 고치지 말고 여기서 고친다.
 * 스키마: variant-v0.3-type-grouped (_oneoff-신서고-YBM-L1/data/EX/*-variant.json 과 동일)
 *
 * 정답 분포(객관식 33문항) — ① 6 · ② 7 · ③ 7 · ④ 7 · ⑤ 6, 유형별로 지문마다 다르게.
 * ⚠️ summary.options[].no 는 배열 위치(1..5)와 반드시 같게 — 렌더러가 no 로 ①~⑤ 를 찍는다.
 * ⚠️ blank_sentence_index 는 0-based, 그 문장에 ___ 가 있어야 한다.
 * =================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(HERE, 'data', 'EXV');
const NUM = ['①', '②', '③', '④', '⑤'];
const ORDER = ['(A) - (B) - (C)', '(A) - (C) - (B)', '(B) - (A) - (C)', '(B) - (C) - (A)', '(C) - (A) - (B)'];
const BLANK = '______________________';

const ul = (list) => list.map(([sent_index, text, fix], i) => (fix
  ? { no: i + 1, sent_index, text, correct: false, fix }
  : { no: i + 1, sent_index, text, correct: true }));
const summaryOpts = (pairs) => pairs.map(([A, B], i) => ({ no: i + 1, A, B }));

function write(n, topic_ko, bt) {
  const data = JSON.parse(fs.readFileSync(path.join(DIR, `${n}.json`), 'utf8'));
  const ko = (r) => data.passage_ko[r - 1];
  const en = (r) => data.passage[r - 1];
  // 서술형 번역·배열은 원문 문장을 쓰므로 여기서 채운다
  for (const w of bt.writing) {
    if (w.ref) {
      if (w.subtype === 'word_order') {
        w.answer = en(w.ref);
        w.ko_prompt = ko(w.ref).replace(/^\((예시|요약)\)\s*/, '');
        w.words = en(w.ref).split(/\s+/).map(t => t.replace(/[,.!?:;”“]/g, '')).filter(Boolean)
          .map((t, i) => (i === 0 ? t.toLowerCase() : t));
      } else if (w.subtype === 'translate_ko') {
        w.en_prompt = en(w.ref);
        w.answer = ko(w.ref).replace(/^\((예시|요약)\)\s*/, '');
      } else if (w.subtype === 'conditioned_write') {
        w.answer = en(w.ref);
        w.ko_prompt = ko(w.ref).replace(/^\((예시|요약)\)\s*/, '');
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
  const ans = Object.entries(bt).filter(([k]) => k !== 'writing').map(([k, v]) => `${k}${NUM[v.answer - 1]}`);
  console.log(`✓ ${n}-variant.json  ${ans.join(' ')} · 서술형 ${bt.writing.length}`);
}

/* ═══════════════════════ 9. The snob effect ═══════════════════════ */
const P9_A = [
  'Some shoppers lose their desire for an item the moment everyone else seems to have it.',
  'This reaction is known as the snob effect.',
  'People affected by it value goods mainly because few others can get them.',
  'Picture a brand that sells just 500 pairs of special sneakers.',
  'Fans rush to buy them since they are so hard to find.',
  'But when the brand later makes millions of pairs, many of those fans walk away.',
  'Owning the shoes no longer makes them feel different from others.',
  'For this reason, companies often keep their products limited to make them look rare and special.',
];
const P9_B = [
  'Most of us like things that are popular, but some people feel the opposite way.',
  'They want a product most when it is rare or hard to get.',
  'If only a few hundred pairs of sneakers are sold, these buyers are eager to own a pair.',
  'Once the same sneakers are produced in huge numbers, however, the shoes lose their appeal.',
  'This is the snob effect, and it works in the opposite direction from the bandwagon effect.',
  'While bandwagon buyers want what everyone has, snob buyers want what makes them different.',
  'Knowing this, companies release limited-edition and luxury goods to create a feeling of rarity.',
  'Buyers who value being unique are often ready to pay more for such goods.',
];
write(9, '스놉 효과 — 제품이 희귀할수록 가치 있게 여기고, 흔해지면 흥미를 잃는 소비 심리', {
  theme: {
    passage: P9_A,
    choices: [
      'why mass production always lowers the quality of sneakers',
      'how a product’s rarity affects some consumers’ desire to buy it',
      'the reasons people follow their friends’ shopping choices',
      'ways to save money when buying limited-edition goods',
      'the history of famous sneaker brands and their designs',
    ],
    answer: 2,
    explanation_ko: '흔해지면 사고 싶은 마음이 사라지고, 희귀할 때 더 원한다는 내용이므로 ‘제품의 희소성이 일부 소비자의 구매 욕구에 미치는 영향’이 주제이다.',
    distractor_ko: '① 대량 생산과 품질은 무관하다. ③ 친구를 따라 사는 것은 반대 개념(밴드왜건 효과)이다. ④ 돈을 아끼는 방법은 나오지 않는다. ⑤ 운동화 브랜드의 역사는 다루지 않는다.',
  },
  gist: {
    passage: P9_B,
    choices: [
      '유행하는 제품을 사야 사회에서 인정받을 수 있다.',
      '한정판 제품은 품질이 좋아서 비싸게 팔린다.',
      '기업은 제품을 대량 생산해야 더 많은 이익을 얻는다.',
      '어떤 소비자들은 제품이 희소할수록 더 가치 있게 여기고, 흔해지면 관심을 잃는다.',
      '소비자는 친구들이 산 물건을 따라 사는 경향이 있다.',
    ],
    answer: 4,
    explanation_ko: '희귀할 때 원하고 흔해지면 매력을 잃는 스놉 효과를 설명하는 글이므로 ④가 요지이다.',
    distractor_ko: '① 유행을 따르는 것은 스놉 효과와 반대이다. ② 품질 이야기는 없다. ③ 대량 생산하면 오히려 흥미를 잃는다. ⑤ 밴드왜건 효과의 설명이다.',
  },
  title: {
    passage: P9_A,
    choices: [
      'Rare Means Special: Why Some Buyers Avoid Popular Items',
      'Follow the Crowd and Shop Smart',
      'How Sneakers Are Made in Factories',
      'The Hidden Costs of Cheap Products',
      'Why Prices Always Rise over Time',
    ],
    answer: 1,
    explanation_ko: '드물어야 특별하게 느끼고, 인기 있는 물건은 피하는 소비자를 다루므로 ①이 제목으로 알맞다.',
    distractor_ko: '② 군중을 따르는 것은 반대 내용이다. ③ 운동화 제조 과정은 나오지 않는다. ④ 싼 제품의 숨은 비용은 무관하다. ⑤ 가격 상승 일반론은 다루지 않는다.',
  },
  implication: {
    passage: [
      'A sneaker company decides to make only 500 pairs of a new design.',
      'Because the shoes are so hard to get, many people line up to buy them.',
      'Months later, the company produces millions of the same pair.',
      'Suddenly, some of the first buyers stop wearing them.',
      'Their shoes have become just another pair in the crowd.',
      'This is a typical example of the snob effect.',
      'People who are influenced by it value products that are rare or exclusive.',
      'When too many others own the same item, it loses its charm for them.',
    ],
    underlined: 'just another pair in the crowd',
    choices: [
      'a pair that is too small for most people to wear',
      'a pair that was made with cheaper materials',
      'a pair that no longer makes its owner stand out',
      'a pair that is sold at a much higher price',
      'a pair that the company refused to produce again',
    ],
    answer: 3,
    explanation_ko: '수백만 켤레가 생산되어 누구나 가진 흔한 신발이 되었다는 뜻이므로, 더 이상 주인을 돋보이게 하지 못한다는 ③이 알맞다.',
    distractor_ko: '① 크기 이야기는 없다. ② 재료가 싸졌다는 말은 없다. ④ 가격이 올랐다는 내용이 아니다. ⑤ 회사는 오히려 대량으로 다시 생산했다.',
  },
  grammar: {
    passage: [
      'Why do some people stop wanting a product once it becomes popular?',
      'The answer lies in the snob effect, which refers to people’s tendency to value things that are rare.',
      'Imagine a company that releases only 500 pairs of limited-edition sneakers.',
      'Many people want them because they are difficult to obtain.',
      'Later, however, the company produces millions of the same sneakers, and some buyers lose interest.',
      'They no longer feel special, since so many other people own the same shoes.',
      'That is why companies release limited products to create a sense of rarity.',
      'Consumers who value uniqueness may even be willing paying higher prices for them.',
    ],
    underlines: ul([
      [0, 'stop wanting'],
      [1, 'which refers to'],
      [3, 'difficult to obtain'],
      [5, 'no longer feel special'],
      [7, 'be willing paying', 'be willing to pay'],
    ]),
    choices: NUM,
    answer: 5,
    explanation_ko: 'be willing 뒤에는 to부정사가 와서 ‘기꺼이 ~하다’를 나타내므로 be willing paying 은 be willing to pay 가 되어야 한다.',
    distractor_ko: '① stop -ing ‘~하는 것을 그만두다’. ② 앞의 the snob effect 를 보충 설명하는 계속적 용법 which 와 단수 동사 refers. ③ 「difficult + to부정사」. ④ 감각동사 feel + 형용사 보어.',
  },
  vocab: {
    passage: [
      'Some consumers value a product because it is rare or exclusive.',
      'As more people buy the same product, it becomes more attractive to these consumers.',
      'Picture a company that releases only 500 pairs of limited-edition sneakers.',
      'Many people want them because they are hard to obtain.',
      'If the company later makes millions of the same sneakers, some buyers lose interest.',
      'This snob effect is the opposite of the bandwagon effect, in which people follow the crowd.',
      'Companies make use of it by releasing luxury goods to create a sense of scarcity.',
      'Buyers who value uniqueness may then pay higher prices for these goods.',
    ],
    underlines: ul([
      [0, 'rare'],
      [1, 'more attractive', 'less attractive'],
      [4, 'lose'],
      [5, 'opposite'],
      [6, 'scarcity'],
    ]),
    choices: NUM,
    answer: 2,
    explanation_ko: '스놉 효과의 소비자에게는 많은 사람이 같은 제품을 살수록 제품이 ‘덜’ 매력적이 되므로 more attractive 는 less attractive 가 되어야 한다.',
    distractor_ko: '① 희귀해서 가치 있게 여긴다. ③ 흔해지면 흥미를 ‘잃는다’. ④ 군중을 따르는 밴드왜건 효과의 ‘반대’이다. ⑤ 명품으로 ‘희소성’의 느낌을 만든다.',
  },
  blank: {
    passage: [
      'When a new product appears, some people rush to buy it simply because everyone else does.',
      'Others react in the opposite way.',
      'They are attracted to a product only while it is rare or hard to get.',
      'When a company sells just 500 pairs of special sneakers, these buyers eagerly line up.',
      'But once millions of the same sneakers fill the stores, they lose interest.',
      `For these consumers, the value of a product depends on ${BLANK}.`,
      'This tendency is called the snob effect.',
      'It explains why companies often sell limited editions at high prices.',
    ],
    blank_sentence_index: 5,
    blank_target: BLANK,
    choices: [
      'how useful it is in everyday life',
      'how many of their friends recommend it',
      'how cheaply it can be produced',
      'how few other people own it',
      'how long it lasts after purchase',
    ],
    answer: 4,
    explanation_ko: '희귀할 때만 끌리고 흔해지면 흥미를 잃으므로, 이들에게 제품의 가치는 ‘그것을 가진 사람이 얼마나 적은가’에 달려 있다.',
    distractor_ko: '① 쓸모, ③ 생산 비용, ⑤ 내구성은 본문에서 다루지 않는다. ② 친구의 추천을 따르는 것은 반대 성향이다.',
  },
  irrelevant: {
    intro: 'The snob effect describes people’s tendency to value a product because it is rare or exclusive.',
    sentences: [
      'When a company releases only a small number of sneakers, many people want to own a pair.',
      'However, when the same shoes are later produced in large numbers, some buyers lose interest.',
      'Sneakers with thick soles help protect runners’ knees from injury.',
      'These buyers no longer feel special because so many other people own the same shoes.',
      'For this reason, companies release limited-edition goods to create a sense of rarity.',
    ],
    choices: NUM,
    answer: 3,
    explanation_ko: '③은 운동화 밑창의 기능(무릎 보호)에 관한 내용으로, 희소성과 소비 심리를 다루는 글의 흐름과 무관하다.',
    distractor_ko: '①② 한정판 → 대량 생산의 예시, ④ 흥미를 잃는 이유, ⑤ 기업의 활용으로 모두 흐름에 맞다.',
  },
  order: {
    given: 'Why do some people lose interest in a product as soon as it becomes popular? This behavior is known as the snob effect, people’s tendency to value things that are rare or exclusive.',
    blocks: {
      A: 'For example, suppose a company releases only 500 pairs of limited-edition sneakers. Many people want them because they are so hard to obtain.',
      B: 'Companies have learned from this pattern of excitement and disappointment. They release limited-edition or luxury products to create a sense of rarity, and buyers who value uniqueness are willing to pay more.',
      C: 'Later, however, the company produces millions of the same pair. Some of the first buyers then lose interest, because owning the shoes no longer makes them feel special.',
    },
    choices: ORDER,
    answer: 2,
    explanation_ko: '스놉 효과 정의(주어진 글) → For example 로 한정판 500켤레 예시(A) → Later, however 로 대량 생산 후 흥미 상실(C) → 이 ‘열광과 실망의 패턴’을 이용하는 기업(B) 순이다.',
    distractor_ko: '(C)의 the company·the same pair 는 (A)의 회사와 운동화를 받으므로 (A) 뒤에 와야 하고, (B)의 this pattern of excitement and disappointment 는 (A)의 열광과 (C)의 실망을 모두 받으므로 맨 끝이다.',
  },
  insert: {
    insert_sentence: 'As a result, these companies can charge higher prices, since buyers who value uniqueness are willing to pay more.',
    passage_marked: [
      { text: 'The snob effect is people’s tendency to value products that are rare or exclusive.', slot_after: 1 },
      { text: 'When only 500 pairs of special sneakers are released, many people want them because they are hard to get.', slot_after: 2 },
      { text: 'If millions of the same sneakers are produced later, however, some buyers lose interest.', slot_after: 3 },
      { text: 'Unlike bandwagon buyers, these people want products that help them stand out from the crowd.', slot_after: 4 },
      { text: 'That is why companies release limited-edition or luxury products to create a sense of rarity.', slot_after: 5 },
    ],
    choices: NUM,
    answer: 5,
    explanation_ko: '주어진 문장의 these companies 는 마지막 문장의 companies 를 가리키고, ‘그 결과’ 더 높은 가격을 받을 수 있다는 결과이므로 ⑤에 들어간다.',
    distractor_ko: '①~④ 앞에는 companies 가 한 번도 나오지 않아 these companies 가 가리킬 대상이 없다.',
  },
  summary: {
    passage: P9_B,
    summary_template: 'Some consumers want a product more when it is __(A)__, but they lose interest once it becomes __(B)__.',
    options: summaryOpts([
      ['rare', 'common'],
      ['cheap', 'expensive'],
      ['common', 'rare'],
      ['popular', 'limited'],
      ['new', 'old'],
    ]),
    answer: 1,
    explanation_ko: '희귀할(rare) 때 더 원하고 흔해지면(common) 흥미를 잃는다는 스놉 효과의 요약이다.',
    distractor_ko: '② 가격은 다루지 않는다. ③④ 두 낱말의 관계가 거꾸로이다. ⑤ 새것·헌것의 문제가 아니다.',
  },
  writing: [
    {
      subtype: 'word_order', subtype_label: '배열 영작', ref: 6,
      question: '다음 우리말과 같은 뜻이 되도록 <보기>의 단어를 모두 배열하여 영작하시오.',
      explanation_ko: '「difficult + to부정사」 ‘~하기 어려운’, 이유의 접속사 because 뒤에 「주어 + 동사」가 온다.',
    },
    {
      subtype: 'conditioned_write', subtype_label: '조건 영작', ref: 4,
      question: '다음 조건에 맞게 우리말을 영작하시오.',
      conditions: ['접속사 As 로 문장을 시작할 것', '비교급 less attractive 를 사용할 것', 'become 을 알맞은 형태로 쓸 것'],
      explanation_ko: '접속사 as 는 ‘~함에 따라, ~할수록’을 뜻하고, 주어 it 이 단수이므로 becomes 를 쓴다.',
    },
    {
      subtype: 'fill_blank', subtype_label: '빈칸 완성', show_passage: true,
      question: '본문의 내용에 맞게 빈칸에 알맞은 한 단어를 쓰시오.',
      context: 'The snob effect is the ___________ of the bandwagon effect, which occurs when people buy a product simply because many others are buying it.',
      answer: 'opposite',
      explanation_ko: '본문에서 스놉 효과는 밴드왜건 효과의 반대(the opposite)라고 했다.',
    },
    {
      subtype: 'translate_ko', subtype_label: '우리말 해석', ref: 11,
      question: '다음 문장을 우리말로 해석하시오.',
      explanation_ko: '「encourage + 목적어 + to부정사」 ‘~가 …하도록 부추기다’, 주격 관계대명사 that 이 products 를 수식하고 「help + 목적어 + 동사원형」이 이어진다.',
    },
    {
      subtype: 'summary_word', subtype_label: '요약문 완성', show_passage: true,
      question: '본문을 한 문장으로 요약할 때 빈칸 (A), (B)에 들어갈 단어를 본문에서 각각 한 단어로 찾아 쓰시오.',
      summary: 'People influenced by the snob effect value products that are rare or __(A)__, so companies release limited-edition products to create a sense of __(B)__ and exclusivity.',
      answer_a: 'exclusive', answer_b: 'rarity',
      explanation_ko: '본문 3번 문장의 rare or exclusive, 13번 문장의 a sense of rarity and exclusivity 에서 찾는다(뒤에 and exclusivity 가 이미 있으므로 (B)는 rarity).',
    },
    {
      subtype: 'topic_write', subtype_label: '주제문 쓰기',
      question: '다음 조건에 맞게 이 글의 주제문을 영어로 쓰시오.',
      ko_prompt: '이 글의 주제를 한 문장으로 쓰시오.',
      conditions: ['rare 와 lose interest 를 반드시 포함할 것', '15단어 내외의 완전한 문장으로 쓸 것'],
      answer: 'Some consumers value products that are rare and lose interest when the products become popular.',
      explanation_ko: '희귀한 제품을 중시하는 경향과 흔해지면 흥미를 잃는 결과를 한 문장에 담는다.',
    },
  ],
});

/* ═══════════════════════ 10. The Veblen effect ═══════════════════════ */
const P10_A = [
  'Normally, people buy less of a product when its price goes up.',
  'With Veblen goods, however, the opposite can happen.',
  'These are items such as luxury watches, sports cars, and designer handbags.',
  'Buyers choose them not only for their quality but also to show off their wealth and status.',
  'Economist Thorstein Veblen called this kind of spending conspicuous consumption.',
  'A high price makes such goods look more prestigious.',
  'So when a luxury brand raises the price of a handbag, even more people may want it.',
  'In short, the price itself becomes a symbol of success.',
];
const P10_B = [
  'Most products sell less when they become more expensive.',
  'Veblen goods are different, because their demand may grow as their prices climb.',
  'People buy luxury brands, expensive watches, or sports cars partly to display their wealth and social position.',
  'Thorstein Veblen, an American economist, described this as conspicuous consumption.',
  'For example, a shopper may pick a costly watch over a cheaper one simply because the price makes it seem prestigious.',
  'Likewise, when a brand raises the price of a handbag, it can look even more exclusive and sell better.',
  'In these cases, a high price is not a reason to stop buying.',
  'Instead, it is the very reason people want the product.',
];
write(10, '베블런 효과 — 부와 지위를 과시하려는 소비 때문에 가격이 오를수록 수요가 늘어나는 현상', {
  theme: {
    passage: P10_A,
    choices: [
      'why luxury goods are usually made with better materials',
      'how people can avoid spending too much money on watches',
      'why demand for some goods rises as their prices go up',
      'the life and works of the economist Thorstein Veblen',
      'how companies lower prices to attract more customers',
    ],
    answer: 3,
    explanation_ko: '보통과 달리 가격이 오를수록 더 원하게 되는 베블런재를 설명하므로 ‘일부 상품의 수요가 가격 상승과 함께 늘어나는 이유’가 주제이다.',
    distractor_ko: '① 재료의 품질은 다루지 않는다. ② 절약 방법은 나오지 않는다. ④ 베블런은 개념을 소개한 사람으로만 등장한다. ⑤ 가격을 내리는 전략은 반대 내용이다.',
  },
  gist: {
    passage: P10_B,
    choices: [
      '어떤 제품은 비쌀수록 부와 지위의 상징이 되어 수요가 늘어난다.',
      '명품은 품질이 뛰어나기 때문에 가격이 비싸다.',
      '소비자는 가격이 오르면 대체로 구매를 줄인다.',
      '과시적 소비는 경제 성장에 도움이 된다.',
      '합리적인 소비자는 가격보다 품질을 중시한다.',
    ],
    answer: 1,
    explanation_ko: '높은 가격이 오히려 사고 싶은 이유가 된다는 베블런 효과가 글의 요지이다.',
    distractor_ko: '② 품질 때문이 아니라 과시 때문이다. ③ 일반 제품의 경우로, 글은 그 예외를 말한다. ④ 경제 성장은 언급되지 않는다. ⑤ 글과 반대 방향의 주장이다.',
  },
  title: {
    passage: P10_A,
    choices: [
      'Quality Always Comes First',
      'Save Money with Smart Shopping',
      'The Life of a Famous Economist',
      'Why Cheap Products Sell Better',
      'The Higher the Price, the Stronger the Desire',
    ],
    answer: 5,
    explanation_ko: '가격이 오를수록 사고 싶은 마음이 커지는 베블런 효과를 압축한 ⑤가 제목으로 알맞다.',
    distractor_ko: '① 품질보다 과시가 핵심이다. ② 절약은 다루지 않는다. ③ 경제학자의 생애는 나오지 않는다. ④ 반대 내용이다.',
  },
  implication: {
    passage: [
      'Imagine two watches that keep time equally well.',
      'One costs $100, and the other costs $10,000.',
      'Surprisingly, some customers choose the expensive one without hesitation.',
      'For them, the price tag is part of what they are buying.',
      'A high price makes the watch seem more prestigious.',
      'Wearing it tells others that its owner is wealthy and successful.',
      'This is called the Veblen effect.',
      'It explains why demand for some luxury goods rises along with their prices.',
    ],
    underlined: 'the price tag is part of what they are buying',
    choices: [
      'They expect the price of the watch to drop soon.',
      'They believe expensive watches keep better time.',
      'They plan to sell the watch later for a profit.',
      'They value the high price because it shows their wealth.',
      'They compare prices carefully before buying anything.',
    ],
    answer: 4,
    explanation_ko: '두 시계의 성능은 같으므로, 이들이 사는 것은 시계의 기능이 아니라 ‘비싼 가격이 보여 주는 부와 성공’이다. 따라서 ④가 알맞다.',
    distractor_ko: '② 두 시계는 똑같이 정확하다고 했다. ① 가격 하락, ③ 되팔기, ⑤ 꼼꼼한 가격 비교는 본문에 없다.',
  },
  grammar: {
    passage: [
      'The Veblen effect is a type of consumer behavior in which people want a product more because it is expensive.',
      'Unlike most products, Veblen goods may sell better as their prices raise.',
      'Consumers often purchase such items to show their wealth or social status.',
      'This idea is based on conspicuous consumption, a concept introduced by Thorstein Veblen.',
      'Some people buy expensive goods not only for their quality but also to display their success.',
      'A high price makes a luxury watch seem more prestigious.',
      'When a brand raises the price of a handbag, demand may even increase.',
      'The product appears even more exclusive than before.',
    ],
    underlines: ul([
      [0, 'in which'],
      [1, 'prices raise', 'prices rise'],
      [3, 'introduced by'],
      [4, 'to display'],
      [5, 'seem'],
    ]),
    choices: NUM,
    answer: 2,
    explanation_ko: '목적어 없이 ‘(가격이) 오르다’라는 뜻이므로 타동사 raise 가 아니라 자동사 rise 를 써야 한다.',
    distractor_ko: '① 뒤에 완전한 절이 오는 「전치사 + 관계대명사」. ③ 베블런에 의해 ‘소개된’ 개념이므로 과거분사. ④ not only for ~ but also 뒤 목적의 to부정사. ⑤ 사역동사 make + 목적어 + 동사원형.',
  },
  vocab: {
    passage: [
      'Some people are more willing to buy a product because it is expensive.',
      'Unlike ordinary products, the demand for Veblen goods can grow as prices go up.',
      'Buyers purchase them to hide their wealth, success, or social status.',
      'Luxury brands, sports cars, and designer handbags are common examples.',
      'The idea comes from conspicuous consumption, a term introduced by Thorstein Veblen.',
      'A customer may choose a luxury watch over a cheaper one because its high price makes it seem prestigious.',
      'Similarly, raising the price of a handbag can make it appear even more exclusive.',
    ],
    underlines: ul([
      [0, 'expensive'],
      [1, 'grow'],
      [2, 'hide', 'show'],
      [4, 'conspicuous'],
      [5, 'prestigious'],
    ]),
    choices: NUM,
    answer: 3,
    explanation_ko: '베블런재는 부와 성공, 사회적 지위를 ‘보여 주기’ 위해 사는 것이므로 hide 는 show 가 되어야 한다.',
    distractor_ko: '① 비싸서 더 사려 한다. ② 가격이 오를수록 수요가 ‘늘어난다’. ④ 남에게 보이려는 ‘과시적’ 소비. ⑤ 높은 가격이 시계를 ‘고급스러워’ 보이게 한다.',
  },
  blank: {
    passage: [
      'Usually, when prices go up, people buy less.',
      'But some goods break this rule.',
      'When the price of a designer handbag rises, more shoppers may want it.',
      'A luxury watch can sell better than a cheaper one simply because it costs more.',
      `This is because buyers of such goods want ${BLANK}.`,
      'The economist Thorstein Veblen called this conspicuous consumption.',
      'Today we call it the Veblen effect.',
    ],
    blank_sentence_index: 4,
    blank_target: BLANK,
    choices: [
      'to show others their wealth and status',
      'to find the best quality at the lowest price',
      'to save money for the future',
      'to buy what their friends recommend',
      'to avoid products that are too popular',
    ],
    answer: 1,
    explanation_ko: '빈칸 뒤에서 이를 ‘과시적 소비’라고 불렀으므로, 구매자들은 ‘남에게 자신의 부와 지위를 보여 주기를’ 원한다.',
    distractor_ko: '② 최저가 탐색, ③ 저축은 글과 반대이다. ④ 친구의 추천(밴드왜건), ⑤ 흔한 제품 회피(스놉)는 다른 효과이다.',
  },
  irrelevant: {
    intro: 'The Veblen effect describes how demand for some goods can rise as their prices go up.',
    sentences: [
      'People buy items such as luxury watches and sports cars partly to show their wealth.',
      'This idea comes from the concept of conspicuous consumption, introduced by Thorstein Veblen.',
      'For these buyers, a high price makes a product seem more prestigious.',
      'Many economists also study how the weather affects the price of farm products.',
      'So when a luxury brand raises its prices, demand for its handbags may even increase.',
    ],
    choices: NUM,
    answer: 4,
    explanation_ko: '④는 날씨와 농산물 가격의 관계로, 과시를 위해 비싼 제품을 사는 베블런 효과와 무관하다.',
    distractor_ko: '① 구매 동기, ② 개념의 출처, ③ 높은 가격의 효과, ⑤ 핸드백 예시로 모두 흐름에 맞다.',
  },
  order: {
    given: 'Usually, people buy less of a product when its price rises. Veblen goods, however, are different: demand for them may increase as their prices go up.',
    blocks: {
      A: 'His idea can be seen in everyday shopping. When a luxury brand raises the price of a handbag, the bag looks even more exclusive, and more people want it.',
      B: 'This happens because consumers often purchase such goods to show their wealth, success, or social status. Luxury brands, expensive watches, and sports cars are common examples.',
      C: 'The American economist Thorstein Veblen called this kind of buying for show conspicuous consumption. According to him, people buy these goods not only for their quality but also to display their success.',
    },
    choices: ORDER,
    answer: 4,
    explanation_ko: '가격이 오르면 수요가 늘 수 있다(주어진 글) → 그 이유는 과시(B) → 이를 ‘과시적 소비’라 부른 베블런(C) → 그의 생각이 드러나는 일상 예시(A) 순이다.',
    distractor_ko: '(C)의 this kind of buying for show 는 (B)의 to show their wealth 를 받고, (A)의 His idea 는 (C)의 Veblen 을 가리키므로 (B)-(C)-(A) 만 가능하다.',
  },
  insert: {
    insert_sentence: 'Luxury brands, expensive watches, and designer handbags are typical examples of goods bought for this purpose.',
    passage_marked: [
      { text: 'The Veblen effect is a kind of consumer behavior in which people want a product more because it is expensive.', slot_after: 1 },
      { text: 'Buyers often purchase these products to show off their wealth, success, or social status.', slot_after: 2 },
      { text: 'The idea is based on conspicuous consumption, a concept introduced by the economist Thorstein Veblen.', slot_after: 3 },
      { text: 'For instance, a customer may choose a costly watch over a cheaper one because the high price makes it seem prestigious.', slot_after: 4 },
      { text: 'In this way, a high price can make demand rise instead of fall.', slot_after: 5 },
    ],
    choices: NUM,
    answer: 2,
    explanation_ko: '주어진 문장의 this purpose(이 목적)는 ‘부·성공·지위를 과시하려는’ 목적을 말하므로, 그 목적이 처음 나온 문장 뒤인 ②에 들어간다.',
    distractor_ko: '① 뒤에는 아직 구매 목적이 나오지 않았다. ③~⑤ 뒤에 넣으면 개념 설명과 예시 사이 흐름이 끊긴다.',
  },
  summary: {
    passage: P10_B,
    summary_template: 'For Veblen goods, a __(A)__ price can actually __(B)__ demand, because the product shows the buyer’s wealth and status.',
    options: summaryOpts([
      ['low', 'raise'],
      ['high', 'reduce'],
      ['fair', 'reduce'],
      ['low', 'stop'],
      ['high', 'increase'],
    ]),
    answer: 5,
    explanation_ko: '베블런재는 ‘높은’(high) 가격이 오히려 수요를 ‘늘린다’(increase).',
    distractor_ko: '①④ 낮은 가격이 아니라 높은 가격이 핵심이다. ②③ 수요가 줄어드는 것은 일반 제품의 경우이다.',
  },
  writing: [
    {
      subtype: 'word_order', subtype_label: '배열 영작', ref: 3,
      question: '다음 우리말과 같은 뜻이 되도록 <보기>의 단어를 모두 배열하여 영작하시오.',
      explanation_ko: '주어 Consumers 뒤에 빈도부사 often 과 동사 purchase, 목적을 나타내는 to show 가 이어진다.',
    },
    {
      subtype: 'conditioned_write', subtype_label: '조건 영작', ref: 7,
      question: '다음 조건에 맞게 우리말을 영작하시오.',
      conditions: ['instead of 를 사용할 것', '「make + 목적어 + 동사원형」 구조를 쓸 것', 'prestigious 를 사용할 것'],
      explanation_ko: 'a cheaper one 의 one 은 watch 를 대신하며, 사역동사 make 뒤에는 동사원형 seem 이 온다.',
    },
    {
      subtype: 'fill_blank', subtype_label: '빈칸 완성', show_passage: true,
      question: '본문의 내용에 맞게 빈칸에 알맞은 한 단어를 쓰시오.',
      context: 'Thorstein Veblen introduced the concept of ___________ consumption, which means buying expensive goods to display one’s financial success.',
      answer: 'conspicuous',
      explanation_ko: '본문 5번 문장의 conspicuous consumption(과시적 소비)이다.',
    },
    {
      subtype: 'translate_ko', subtype_label: '우리말 해석', ref: 6,
      question: '다음 문장을 우리말로 해석하시오.',
      explanation_ko: 'not only for their quality but also to display ~ 는 ‘품질 때문만이 아니라 ~을 과시하기 위해서도’로 해석한다.',
    },
    {
      subtype: 'summary_word', subtype_label: '요약문 완성', show_passage: true,
      question: '본문을 한 문장으로 요약할 때 빈칸 (A), (B)에 들어갈 단어를 본문에서 각각 한 단어로 찾아 쓰시오.',
      summary: 'Demand for Veblen goods may __(A)__ as their prices rise, because the products symbolize wealth, __(B)__, or social status.',
      answer_a: 'increase', answer_b: 'prestige',
      explanation_ko: '본문 2번 문장의 may increase, 9번 문장의 wealth, prestige, or social status 에서 찾는다.',
    },
    {
      subtype: 'topic_write', subtype_label: '주제문 쓰기',
      question: '다음 조건에 맞게 이 글의 주제문을 영어로 쓰시오.',
      ko_prompt: '이 글의 주제를 한 문장으로 쓰시오.',
      conditions: ['price 와 demand 를 반드시 포함할 것', '15단어 내외의 완전한 문장으로 쓸 것'],
      answer: 'For Veblen goods, a higher price can increase demand because the goods show wealth and status.',
      explanation_ko: '가격 상승 → 수요 증가라는 베블런 효과의 핵심과 그 이유(부·지위 과시)를 함께 쓴다.',
    },
  ],
});

/* ═══════════════════════ 11. Romeo and Juliet effect ═══════════════════════ */
const P11_A = [
  'Romeo and Juliet knew each other for only five days, yet they fell deeply in love.',
  'One psychologist thinks the problems they faced made their love stronger.',
  'Because their parents tried to keep them apart, they wanted each other even more.',
  'Interestingly, the same feeling appears when we go shopping.',
  'We tend to want something more when we think we might lose the chance to have it.',
  'Sellers use this by saying things like “Only three days left!”',
  'Worried about missing out, buyers often purchase the item immediately.',
  'So when you see a limited-time sale, it is wise to ask whether you truly need the item.',
];
const P11_B = [
  'Romeo and Juliet fell in love in just five days.',
  'A psychologist explains that their many problems actually brought them closer.',
  'Their parents’ attempts to stop them only made the two want each other more.',
  'This feeling also affects how we shop.',
  'When people fear that something will soon disappear, they want it even more.',
  'That is why sellers shout, “Only three days left! Buy before it’s gone!”',
  'Afraid of missing out, buyers rush to purchase right away.',
  'This is known as the Romeo and Juliet effect.',
  'Next time you see a “3-day-only sale,” stop and ask yourself whether you really need it.',
];
write(11, '로미오와 줄리엣 효과 — 사라질지 모른다고 느끼면 더 원하게 되는 심리와 한정 판매', {
  theme: {
    passage: P11_A,
    choices: [
      'how parents can help their children make good friends',
      'why Romeo and Juliet’s story has stayed popular for centuries',
      'the reasons sellers offer large discounts on old products',
      'how fear of losing something makes people want it more',
      'the best ways to plan a shopping budget',
    ],
    answer: 4,
    explanation_ko: '방해를 받거나 기회를 잃을 것 같을 때 더 원하게 되는 심리가 사랑과 쇼핑 모두에 나타난다는 글이므로 ④가 주제이다.',
    distractor_ko: '① 친구 사귀기는 무관하다. ② 이야기가 인기 있는 이유는 다루지 않는다. ③ 할인 폭이 아니라 기간 제한이 핵심이다. ⑤ 예산 계획은 나오지 않는다.',
  },
  gist: {
    passage: P11_B,
    choices: [
      '진정한 사랑은 오랜 시간에 걸쳐 천천히 자란다.',
      '부모는 자녀의 연애에 간섭하지 않아야 한다.',
      '기간 한정 세일은 소비자에게 큰 이익을 준다.',
      '판매자는 소비자에게 정직한 정보를 제공해야 한다.',
      '사라질지 모른다고 느끼면 더 원하게 되므로, 한정 판매 앞에서는 정말 필요한지 따져 봐야 한다.',
    ],
    answer: 5,
    explanation_ko: '사라질 것 같으면 더 원하는 로미오와 줄리엣 효과를 설명하고, 한정 세일을 보면 정말 필요한지 스스로 물으라고 하므로 ⑤가 요지이다.',
    distractor_ko: '① 둘은 5일 만에 사랑에 빠졌다. ② 부모의 간섭은 예시일 뿐 주장이 아니다. ③ 오히려 충동구매를 경계한다. ④ 판매자의 정직성은 다루지 않는다.',
  },
  title: {
    passage: P11_A,
    choices: [
      'Love Grows Slowly over Many Years',
      'Hard to Get, Harder to Resist',
      'Parents Always Know What Is Best',
      'Big Discounts Make Happy Customers',
      'How to Write a Great Love Story',
    ],
    answer: 2,
    explanation_ko: '얻기 어렵거나 잃을 것 같을수록 더 끌린다는 사랑과 쇼핑의 공통 심리를 담은 ②가 제목으로 알맞다.',
    distractor_ko: '① 5일 만에 사랑에 빠졌다. ③ 부모의 판단을 다루지 않는다. ④ 할인 폭이 아니라 기간 제한이 핵심이다. ⑤ 글쓰기 방법이 아니다.',
  },
  implication: {
    passage: [
      'Romeo and Juliet had known each other for only five days.',
      'Still, they loved each other so much that they chose to die rather than live apart.',
      'A psychologist believes their many problems made their love grow faster.',
      'When their parents tried to stop them, the couple wanted each other even more.',
      'The same thing happens in stores.',
      'A sign saying “Buy before it’s gone!” makes shoppers feel that the chance is slipping away.',
      'Worried about not getting what they want, they buy right away.',
      'So, before you join the rush, ask yourself: Do I really need it?',
    ],
    underlined: 'the chance is slipping away',
    choices: [
      'they may soon be unable to get the item',
      'the price of the item will go up tomorrow',
      'the store is too crowded to shop in',
      'they have already spent too much money',
      'the item is not as good as it looks',
    ],
    answer: 1,
    explanation_ko: '“사라지기 전에 사세요!”라는 문구 때문에 곧 그 물건을 살 수 없게 될 것 같다고 느낀다는 뜻이므로 ①이 알맞다.',
    distractor_ko: '② 가격 인상, ③ 혼잡, ④ 지출, ⑤ 품질은 본문에서 말하지 않았다.',
  },
  grammar: {
    passage: [
      'Did you know that Romeo and Juliet knew each other for only five days?',
      'A psychologist has an idea about why they fell in love so quickly.',
      'The idea is that they liked each other more because they had many problems.',
      'Their parents tried stop them, which made them want each other even more.',
      'This feeling also applies to shopping.',
      'Shoppers want an item more when they think it might disappear.',
      'Worried about not getting what they want, buyers often buy right away.',
      'This tendency is known as the Romeo and Juliet effect.',
    ],
    underlines: ul([
      [1, 'why they fell'],
      [2, 'that they liked'],
      [3, 'tried stop', 'tried to stop'],
      [4, 'applies'],
      [6, 'not getting what they want'],
    ]),
    choices: NUM,
    answer: 3,
    explanation_ko: 'try 는 to부정사를 목적어로 취해 ‘~하려고 애쓰다’를 나타내므로 tried stop 은 tried to stop 이 되어야 한다.',
    distractor_ko: '① 간접의문문 「의문사 + 주어 + 동사」. ② 보어 자리의 명사절 that. ④ 단수 주어 This feeling 에 맞는 applies. ⑤ 전치사 about 뒤 동명사의 부정 not getting 과 관계대명사 what.',
  },
  vocab: {
    passage: [
      'Romeo and Juliet’s love story is a very sad one.',
      'They knew each other for only five days, but they fell deeply in love.',
      'A psychologist says their many problems made them like each other more.',
      'When their parents tried to stop them, they wanted each other even more.',
      'This feeling is not only about love; it also applies to shopping.',
      'People want something less when they think it might disappear.',
      'Sellers take advantage of this by saying, “Only three days left!”',
      'Worried about missing out, buyers purchase the item right away.',
    ],
    underlines: ul([
      [2, 'problems'],
      [3, 'stop'],
      [4, 'applies'],
      [5, 'less', 'more'],
      [7, 'right away'],
    ]),
    choices: NUM,
    answer: 4,
    explanation_ko: '사라질지 모른다고 생각하면 그것을 ‘더’ 원하게 되므로 less 는 more 가 되어야 한다.',
    distractor_ko: '① 많은 ‘문제’ 때문에 더 좋아했다. ② 부모는 둘을 ‘막으려’ 했다. ③ 이 감정이 쇼핑에도 ‘적용된다’. ⑤ 놓칠까 봐 ‘즉시’ 산다.',
  },
  blank: {
    passage: [
      'Romeo and Juliet’s parents tried to keep the two apart.',
      'Strangely, this only made the young lovers want each other more.',
      'Shoppers often react in a similar way.',
      'When a sign says “Only three days left!” people suddenly feel they must buy.',
      'Afraid of missing their chance, they purchase the item right away.',
      `In both cases, people tend to want something more when ${BLANK}.`,
      'This is called the Romeo and Juliet effect.',
      'So, before you buy, ask yourself whether you really need it.',
    ],
    blank_sentence_index: 5,
    blank_target: BLANK,
    choices: [
      'it is cheaper than they expected',
      'their friends already have it',
      'they have plenty of time to decide',
      'it is recommended by experts',
      'it seems hard to keep or get',
    ],
    answer: 5,
    explanation_ko: '부모의 반대로 함께 있기 어려웠던 연인, 곧 끝나는 세일 앞의 쇼핑객 모두 ‘지키거나 얻기 어려워 보일 때’ 더 원하게 된다.',
    distractor_ko: '③ 시간이 넉넉하면 오히려 서두르지 않는다. ① 가격, ② 친구, ④ 전문가 추천은 본문과 무관하다.',
  },
  irrelevant: {
    intro: 'Romeo and Juliet wanted each other even more because their parents tried to stop their love.',
    sentences: [
      'A psychologist says this feeling is not just about love but also applies to shopping.',
      'Shakespeare wrote many other famous plays, including Hamlet and Macbeth.',
      'People tend to want something more when they think it might disappear.',
      'Sellers use this idea by saying, “Only three days left! Buy before it’s gone!”',
      'Worried about not getting what they want, buyers often purchase the item right away.',
    ],
    choices: NUM,
    answer: 2,
    explanation_ko: '②는 셰익스피어의 다른 작품 소개로, 사라질 것 같으면 더 원하는 심리를 다루는 글의 흐름과 무관하다.',
    distractor_ko: '① 사랑 → 쇼핑으로의 연결, ③ 핵심 심리, ④ 판매자의 이용, ⑤ 구매자의 반응으로 모두 흐름에 맞다.',
  },
  order: {
    given: 'Romeo and Juliet knew each other for only five days, yet they fell in love. A psychologist has an idea about why their love grew so quickly.',
    blocks: {
      A: 'This feeling is not just about love; it also applies to shopping. People want something more when they think it might go away.',
      B: 'According to the psychologist, they liked each other more because they had many problems. Their parents tried to stop them, and this made them want each other even more.',
      C: 'That is why sellers say, “Only three days left! Buy before it’s gone!” Worried about missing out, buyers purchase the item right away.',
    },
    choices: ORDER,
    answer: 3,
    explanation_ko: '심리학자의 생각이 있다(주어진 글) → 그 생각의 내용: 문제가 많아 더 좋아했다(B) → 이 감정은 쇼핑에도 적용된다(A) → 그래서 판매자가 “단 3일 남았습니다!”라고 한다(C) 순이다.',
    distractor_ko: '(B)의 the psychologist 는 주어진 글의 A psychologist 를 받고, (A)의 This feeling 은 (B)의 감정을, (C)의 That is why 는 (A)의 쇼핑 심리를 받는다.',
  },
  insert: {
    insert_sentence: 'How could two people fall in love so quickly?',
    passage_marked: [
      { text: 'Romeo and Juliet knew each other for only five days.', slot_after: 1 },
      { text: 'A psychologist believes the problems they faced made their feelings grow faster.', slot_after: 2 },
      { text: 'Their parents tried to stop them, which only made them want each other more.', slot_after: 3 },
      { text: 'This feeling also applies to shopping, because people want things more when they might disappear.', slot_after: 4 },
      { text: 'That is why sellers say, “Only three days left!”', slot_after: 5 },
    ],
    choices: NUM,
    answer: 1,
    explanation_ko: '‘단 5일’이라는 사실 뒤에 ‘어떻게 그렇게 빨리 사랑에 빠질 수 있었을까?’라는 질문이 오고, 이어서 심리학자의 설명이 그 답이 되므로 ①이 알맞다.',
    distractor_ko: '② 이후에는 이미 빨리 사랑에 빠진 이유가 설명된 뒤라 질문이 어색하다. ④⑤ 뒤는 쇼핑 이야기라 연결되지 않는다.',
  },
  summary: {
    passage: P11_B,
    summary_template: 'When people feel that something might soon __(A)__, they want it more, so sellers use time __(B)__ to make buyers act quickly.',
    options: summaryOpts([
      ['improve', 'limits'],
      ['disappear', 'tests'],
      ['disappear', 'limits'],
      ['appear', 'limits'],
      ['change', 'gifts'],
    ]),
    answer: 3,
    explanation_ko: '곧 ‘사라질’(disappear) 것 같으면 더 원하므로, 판매자는 ‘시간 제한’(time limits, 단 3일)을 이용해 즉시 사게 만든다.',
    distractor_ko: '①④⑤ 좋아짐·나타남·변화가 아니라 사라짐이 핵심이다. ② 시간 ‘시험’이 아니라 시간 ‘제한’이다.',
  },
  writing: [
    {
      subtype: 'word_order', subtype_label: '배열 영작', ref: 9,
      question: '다음 우리말과 같은 뜻이 되도록 <보기>의 단어를 모두 배열하여 영작하시오.',
      explanation_ko: '시간의 접속사 when 뒤에 「주어 + 동사」, think 뒤에 that 이 생략된 명사절 it might go away 가 온다.',
    },
    {
      subtype: 'conditioned_write', subtype_label: '조건 영작', ref: 7,
      question: '다음 조건에 맞게 우리말을 영작하시오.',
      conditions: ['관계대명사 which 의 계속적 용법을 쓸 것', '「make + 목적어 + 동사원형」을 쓸 것', 'even more 를 사용할 것'],
      explanation_ko: ', which 는 앞 절 전체(부모가 막으려 한 것)를 받고, 사역동사 made 뒤에 목적어 Romeo and Juliet 과 동사원형 want 가 온다.',
    },
    {
      subtype: 'fill_blank', subtype_label: '빈칸 완성', show_passage: true,
      question: '본문의 내용에 맞게 빈칸에 알맞은 한 단어를 쓰시오.',
      context: 'Sellers say “Only three days left!” because buyers ___________ about not getting what they want and buy right away.',
      answer: 'worry',
      explanation_ko: '본문 14번 문장의 Buyers worry about not getting what they want 에서 찾는다.',
    },
    {
      subtype: 'translate_ko', subtype_label: '우리말 해석', ref: 8,
      question: '다음 문장을 우리말로 해석하시오.',
      explanation_ko: 'not just A, but also B ‘A뿐만 아니라 B도’, apply to ‘~에 적용되다’.',
    },
    {
      subtype: 'summary_word', subtype_label: '요약문 완성', show_passage: true,
      question: '본문을 한 문장으로 요약할 때 빈칸 (A), (B)에 들어갈 단어를 본문에서 각각 한 단어로 찾아 쓰시오.',
      summary: 'Romeo and Juliet wanted each other more because their parents tried to __(A)__ them, and shoppers want items more when they think the items might __(B)__.',
      answer_a: 'stop', answer_b: 'disappear',
      explanation_ko: '본문 7번 문장의 tried to stop them, 10번 문장의 they might disappear 에서 찾는다(9번의 go away 는 두 단어라 답이 아니다).',
    },
    {
      subtype: 'topic_write', subtype_label: '주제문 쓰기',
      question: '다음 조건에 맞게 이 글의 주제문을 영어로 쓰시오.',
      ko_prompt: '이 글의 주제를 한 문장으로 쓰시오.',
      conditions: ['disappear 와 want 를 반드시 포함할 것', '15단어 내외의 완전한 문장으로 쓸 것'],
      answer: 'People want something more when they think it might disappear, and sellers use this feeling.',
      explanation_ko: '사라질 것 같으면 더 원하는 심리와 판매자의 활용을 한 문장에 담는다.',
    },
  ],
});
