#!/usr/bin/env node
/* ===================================================================
 * 봉영여중3 추가지문 9·10·11 (스놉 / 베블런 / 로미오와 줄리엣 효과) — 워크북 저작
 * ===================================================================
 * data/EXV/{9,10,11}.json (= data/EX 의 같은 번호 분석지 사본) 을 기준으로
 * data/EXV/{N}-workbook.json 을 생성한다. 직접 JSON 을 고치지 말고 여기서 고친다.
 *
 * 축약 규칙
 *   G/V : [ref, en_template, [explain...]]  → answers 는 템플릿 A 슬롯, ko_full 은 passage_ko
 *   F   : [ref, [answer...]]                → letter 는 첫 글자
 *   jumble.words 는 정답 문장에서 자동 생성(구두점 제거)
 *
 * ⚠️ 빌더 고유명사 오탐 — 아래 단어는 단독 정답으로 쓰지 말 것(조용히 삭제됨)
 *   9 : why this as however companies researchers
 *   10: veblen american thorstein unlike consumers according
 *   11: juliet romeo only do i can buyers
 * ⚠️ 빈칸 정답은 5글자 이상(4글자 이하는 빌더가 지움)
 * =================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(HERE, 'data', 'EXV');

const slotsOf = (t) => [...t.matchAll(/\{\{(\d+):([^\/]+)\/([^}]+)\}\}/g)].map(m => m[2].trim());
const wordsOf = (s) => s.split(/\s+/)
  .map(w => w.replace(/^[“"‘(]+/, '').replace(/[”"’),.!?:;]+$/, '').replace(/[”"),.!?:;]+$/, ''))
  .filter(Boolean);

function build(n, spec) {
  const data = JSON.parse(fs.readFileSync(path.join(DIR, `${n}.json`), 'utf8'));
  const ko = (r) => data.passage_ko[r - 1];
  const en = (r) => data.passage[r - 1];
  const choice = (arr) => arr.map(([ref, tmpl, explain], i) => ({
    no: i + 1, ref_sentence: ref, en_template: tmpl, ko_full: ko(ref),
    answers: slotsOf(tmpl), explain,
  }));
  const wb = {
    $schema_version: '1.0',
    $ref_source: `${n}.json`,
    _note: `봉영여중3 추가지문 ${n}번 워크북 — _author-EXV-workbook.mjs 가 생성(직접 수정 금지).`,
    voca_check: spec.voca,
    grammar_choice: choice(spec.G),
    vocab_choice: choice(spec.V),
    fill_first_letter: spec.F.map(([ref, answers], i) => ({
      no: i + 1, ref_sentence: ref,
      hints: answers.map((a, k) => ({ pos: k + 1, letter: a[0].toLowerCase(), answer: a, after: '' })),
      ko_full: ko(ref),
    })),
    ko_translation: spec.KO.map((ref, i) => ({ no: i + 1, ref_sentence: ref })),
    jumble: spec.J.map((ref, i) => ({ no: i + 1, ref_sentence: ref, words: wordsOf(en(ref)), answer: en(ref) })),
    sentence_translation: spec.S.map((ref, i) => ({ no: i + 1, ref_sentence: ref, given: 'ko' })),
    mixed: spec.M.map(([kind, ref], i) => ({ kind, ref, no: i + 1 })),
  };
  fs.writeFileSync(path.join(DIR, `${n}-workbook.json`), JSON.stringify(wb, null, 2) + '\n', 'utf8');
  console.log(`✓ ${n}-workbook.json  어법 ${wb.grammar_choice.length} · 어휘 ${wb.vocab_choice.length} · 빈칸 ${wb.fill_first_letter.length} · 해석 ${wb.ko_translation.length} · 배열 ${wb.jumble.length} · 영작 ${wb.sentence_translation.length} · 종합 ${wb.mixed.length}`);
}

/* ───────────────────────── 9. The snob effect ───────────────────────── */
build(9, {
  voca: {
    en_to_ko: [
      { word: 'popular', pos: '형' }, { word: 'tendency', pos: '명' }, { word: 'exclusive', pos: '형' },
      { word: 'attractive', pos: '형' }, { word: 'obtain', pos: '동' }, { word: 'opposite', pos: '명' },
      { word: 'occurs', pos: '동' }, { word: 'strategies', pos: '명' }, { word: 'uniqueness', pos: '명' },
      { word: 'scarcity', pos: '명' },
    ],
    ko_to_en: [
      { meaning: '희귀한, 드문', pos: '형', answer: 'rare' },
      { meaning: '출시하다, 내놓다', pos: '동', answer: 'release' },
      { meaning: '한정판의', pos: '형', answer: 'limited-edition' },
      { meaning: '생산하다', pos: '동', answer: 'produce' },
      { meaning: '희소성, 희귀함', pos: '명', answer: 'rarity' },
      { meaning: '독점성, 배타성', pos: '명', answer: 'exclusivity' },
      { meaning: '군중, 무리', pos: '명', answer: 'crowd' },
      { meaning: '수요', pos: '명', answer: 'demand' },
      { meaning: '추구하다, 찾다', pos: '동', answer: 'seek' },
      { meaning: '소비자', pos: '명', answer: 'consumer' },
    ],
    expressions: [
      { ko: '흥미를 잃다', answer: 'lose interest' },
      { ko: '더 이상 ~않다', answer: 'no longer' },
      { ko: '~에서 돋보이다, 두드러지다', answer: 'stand out from' },
      { ko: '기꺼이 ~하다', answer: 'be willing to' },
      { ko: '~에 따라', answer: 'depending on' },
    ],
    definitions: [
      { def: 'not common; not often found or seen', answer: 'rare' },
      { def: 'the amount of a product that people want to buy', answer: 'demand' },
      { def: 'to make a new product available for people to buy', answer: 'release' },
      { def: 'the quality of being the only one of its kind', answer: 'uniqueness' },
      { def: 'a large group of people in one place', answer: 'crowd' },
    ],
  },
  G: [
    [1, 'Why do some people stop {{1:wanting/want}} a product after it {{2:becomes/become}} popular?',
      ['stop 이 ‘~하는 것을 그만두다’의 뜻일 때 목적어로 동명사를 쓰므로 wanting. 동사원형 want 는 올 수 없다.',
       '시간 부사절의 주어 it(= a product)이 3인칭 단수이므로 becomes.']],
    [3, 'The snob effect {{1:refers/refer}} to people’s tendency {{2:to value/valuing}} a product because it is rare or exclusive.',
      ['주어 The snob effect 가 단수이므로 refers.',
       'tendency 는 to부정사의 수식을 받아 ‘~하는 경향’을 나타낸다(tendency to-v).']],
    [5, 'For example, {{1:imagine/imagining}} that a company {{2:releases/release}} only 500 pairs of limited-edition sneakers.',
      ['주어 없이 동사원형으로 시작하는 명령문이므로 imagine.',
       'that절의 주어 a company 가 단수이므로 releases.']],
    [6, 'Many people want to buy them {{1:because/because of}} they are difficult {{2:to obtain/obtaining}}.',
      ['뒤에 「주어+동사」(they are)가 오므로 접속사 because. because of 뒤에는 명사(구)가 온다.',
       '「difficult + to부정사」는 ‘~하기 어려운’이라는 뜻이다.']],
    [7, 'However, if the company later {{1:produces/will produce}} millions of the same sneakers, some buyers {{2:lose/loses}} interest.',
      ['조건의 부사절(if)에서는 미래의 일도 현재시제로 쓴다.',
       '주어 some buyers 가 복수이므로 lose.']],
    [8, 'They no longer feel {{1:special/specially}} because many other people {{2:own/owns}} the same shoes.',
      ['감각동사 feel 뒤에는 형용사 보어가 온다.',
       '주어 many other people 이 복수이므로 own.']],
    [10, 'The bandwagon effect {{1:occurs/is occurred}} when people buy a product simply because many others {{2:are buying/is buying}} it.',
      ['occur(일어나다)는 자동사라 수동태로 쓸 수 없다.',
       '주어 many others 가 복수이므로 are buying.']],
    [11, 'In contrast, the snob effect encourages people {{1:to choose/choose}} products that {{2:help/helps}} them stand out from the crowd.',
      ['「encourage + 목적어 + to부정사」 구조이다.',
       '주격 관계대명사 that 의 선행사가 복수 products 이므로 help.']],
    [14, 'As a result, consumers {{1:who/which}} value uniqueness may be willing {{2:to pay/paying}} higher prices for these products.',
      ['선행사 consumers 가 사람이므로 주격 관계대명사 who.',
       'be willing to-v 는 ‘기꺼이 ~하다’이다.']],
    [15, 'Researchers {{1:have/has}} found that scarcity can increase or decrease demand depending on {{2:whether/that}} consumers are seeking exclusivity or popularity.',
      ['주어 Researchers 가 복수이므로 have found(현재완료).',
       '뒤에 A or B 가 이어져 ‘~인지 아닌지’를 뜻하므로 whether. depending on 뒤에 that절은 올 수 없다.']],
  ],
  V: [
    [3, 'The snob effect refers to people’s tendency to value a product because it is {{1:rare/common}} or {{2:exclusive/ordinary}}.',
      ['희귀해서 가치 있게 여긴다는 뜻이므로 rare(희귀한). common 은 ‘흔한’.',
       '아무나 가질 수 없는 제품이므로 exclusive(독점적인). ordinary 는 ‘평범한’.']],
    [4, 'As more people buy the same product, it becomes {{1:less/more}} attractive to those consumers.',
      ['많은 사람이 살수록 스놉 소비자에게는 매력이 줄어든다(less).']],
    [6, 'Many people want to buy them because they are {{1:difficult/easy}} to obtain.',
      ['500켤레뿐이라 구하기 어렵다(difficult).']],
    [7, 'However, if the company later produces millions of the same sneakers, some buyers {{1:lose/gain}} interest.',
      ['흔해지면 흥미를 잃는다(lose interest). gain 은 ‘얻다’.']],
    [8, 'They no longer feel {{1:special/ordinary}} because many other people own the same shoes.',
      ['더 이상 ‘특별하다’고 느끼지 않는다는 흐름이므로 special.']],
    [9, 'The snob effect is the {{1:opposite/same}} of the bandwagon effect.',
      ['남을 따라 사는 밴드왜건 효과와 반대(opposite)이다.']],
    [11, 'In contrast, the snob effect encourages people to choose products that help them {{1:stand out/blend in}} from the crowd.',
      ['군중 속에서 ‘돋보이게’(stand out) 해 주는 제품을 고른다. blend in 은 ‘섞여 들다’.']],
    [13, 'They release limited-edition products or luxury products to create a sense of {{1:rarity/popularity}} and exclusivity.',
      ['한정판으로 ‘희소성’(rarity)의 느낌을 만든다. popularity 는 ‘인기’.']],
    [14, 'As a result, consumers who value {{1:uniqueness/similarity}} may be willing to pay {{2:higher/lower}} prices for these products.',
      ['스놉 소비자는 ‘독특함’(uniqueness)을 중시한다. similarity 는 ‘비슷함’.',
       '희소한 제품에 기꺼이 ‘더 높은’ 가격을 지불한다.']],
    [15, 'Researchers have found that {{1:scarcity/plenty}} can increase or decrease {{2:demand/supply}} depending on whether consumers are seeking exclusivity or popularity.',
      ['‘희소성’(scarcity)이 수요에 미치는 영향을 말한다. plenty 는 ‘풍부함’.',
       '소비자가 사려는 양, 즉 ‘수요’(demand)이다. supply 는 ‘공급’.']],
  ],
  F: [
    [2, ['behavior', 'called']],
    [3, ['tendency', 'value', 'exclusive']],
    [5, ['releases', 'limited-edition', 'sneakers']],
    [6, ['difficult', 'obtain']],
    [9, ['opposite', 'bandwagon']],
    [10, ['occurs', 'simply']],
    [12, ['often', 'marketing', 'strategies']],
    [13, ['rarity', 'exclusivity']],
    [14, ['uniqueness', 'willing', 'prices']],
    [15, ['scarcity', 'demand', 'depending']],
  ],
  KO: [1, 3, 4, 7, 8, 10, 11, 13, 14, 15],
  J: [2, 4, 5, 6, 8, 9, 11, 12, 13, 14],
  S: [1, 3, 6, 7, 9, 10, 11, 12, 14, 15],
  M: [['grammar', 2], ['vocab', 4], ['fill', 6], ['ko', 3], ['jumble', 5], ['sent', 8], ['grammar', 9], ['vocab', 7]],
});

/* ───────────────────────── 10. The Veblen effect ───────────────────────── */
build(10, {
  voca: {
    en_to_ko: [
      { word: 'consumer', pos: '명' }, { word: 'behavior', pos: '명' }, { word: 'demand', pos: '명' },
      { word: 'purchase', pos: '동' }, { word: 'wealth', pos: '명' }, { word: 'status', pos: '명' },
      { word: 'concept', pos: '명' }, { word: 'consumption', pos: '명' }, { word: 'prestigious', pos: '형' },
      { word: 'symbolizes', pos: '동' },
    ],
    ko_to_en: [
      { meaning: '비싼', pos: '형', answer: 'expensive' },
      { meaning: '품질', pos: '명', answer: 'quality' },
      { meaning: '보여 주다, 과시하다', pos: '동', answer: 'display' },
      { meaning: '경제학자', pos: '명', answer: 'economist' },
      { meaning: '명성, 위신', pos: '명', answer: 'prestige' },
      { meaning: '고급의, 독점적인', pos: '형', answer: 'exclusive' },
      { meaning: '증가하다', pos: '동', answer: 'increase' },
      { meaning: '이론', pos: '명', answer: 'theory' },
      { meaning: '상품, 물건', pos: '명', answer: 'goods' },
      { meaning: '경제적인, 재정의', pos: '형', answer: 'financial' },
    ],
    expressions: [
      { ko: '~의 한 유형', answer: 'a type of' },
      { ko: '~에 근거하다', answer: 'is based on' },
      { ko: '~에 따르면', answer: 'according to' },
      { ko: '~ 대신에', answer: 'instead of' },
      { ko: '사회적 지위', answer: 'social status' },
    ],
    definitions: [
      { def: 'a person who studies how money, goods and services work in society', answer: 'economist' },
      { def: 'how good or bad something is', answer: 'quality' },
      { def: 'very easy to see or notice', answer: 'conspicuous' },
      { def: 'costing a lot of money', answer: 'expensive' },
      { def: 'the respect people get because of their success or high position', answer: 'prestige' },
    ],
  },
  G: [
    [1, 'The Veblen effect is a type of consumer behavior {{1:in which/which}} people are more willing {{2:to buy/buying}} a product because it is expensive.',
      ['뒤에 완전한 절(people are more willing ~)이 오므로 「전치사+관계대명사」 in which. which 뒤에는 불완전한 절이 온다.',
       'be willing to-v ‘기꺼이 ~하다’이므로 to buy.']],
    [2, 'Unlike most products, demand for Veblen goods may {{1:increase/increases}} as their prices {{2:rise/raise}}.',
      ['조동사 may 뒤에는 동사원형이 온다.',
       '목적어 없이 ‘(가격이) 오르다’는 자동사 rise. raise 는 ‘~을 올리다’(타동사).']],
    [3, 'Consumers often {{1:purchase/purchases}} these products {{2:to show/to showing}} their wealth, success, or social status.',
      ['주어 Consumers 가 복수이므로 purchase.',
       '‘~하기 위해’를 뜻하는 to부정사(목적)이므로 to + 동사원형.']],
    [4, 'Luxury brands, expensive watches, sports cars, and designer handbags {{1:are/is}} common examples of Veblen goods.',
      ['A, B, C, and D 로 나열된 복수 주어이므로 are.']],
    [5, 'This idea {{1:is based/bases}} on the concept of conspicuous consumption, {{2:introduced/introducing}} by the American economist Thorstein Veblen.',
      ['be based on ‘~에 근거하다’는 수동 형태로 쓴다.',
       '과시적 소비라는 개념은 베블런에 의해 ‘소개된’ 것이므로 과거분사 introduced(뒤에 by).']],
    [6, 'According to this theory, some people buy expensive goods not only for their quality but also {{1:to display/display}} their financial success.',
      ['not only A but also B 에서 B 는 ‘~하기 위해’를 뜻하는 to부정사 to display.']],
    [7, 'A customer chooses a luxury watch instead of a cheaper {{1:one/it}} because its high price makes the watch {{2:seem/to seem}} more prestigious.',
      ['앞의 watch 와 같은 종류의 다른 것을 가리키므로 부정대명사 one(a cheaper one).',
       '사역동사 make 는 「make + 목적어 + 동사원형」이므로 seem.']],
    [8, 'A luxury brand {{1:raises/rises}} the price of a handbag, and demand increases because the product appears even more {{2:exclusive/exclusively}}.',
      ['목적어 the price 가 있으므로 타동사 raises(~을 올리다).',
       'appear(~처럼 보이다) 뒤에는 형용사 보어가 온다.']],
    [9, 'The Veblen effect is the tendency for demand {{1:to rise/rising}} as the price of a product rises because the product {{2:symbolizes/symbolize}} wealth, prestige, or social status.',
      ['「tendency for + 의미상 주어 + to부정사」 구조이다.',
       '주어 the product 가 단수이므로 symbolizes.']],
  ],
  V: [
    [1, 'The Veblen effect is a type of consumer behavior in which people are more willing to buy a product because it is {{1:expensive/cheap}}.',
      ['베블런 효과는 ‘비싸기’ 때문에 더 사려는 행동이다.']],
    [2, 'Unlike most products, {{1:demand/supply}} for Veblen goods may {{2:increase/decrease}} as their prices rise.',
      ['사람들이 사려는 양, 즉 ‘수요’(demand)이다.',
       '대부분의 제품과 ‘달리’ 가격이 오르면 수요가 ‘증가’한다.']],
    [3, 'Consumers often purchase these products to {{1:show/hide}} their wealth, success, or social status.',
      ['부와 지위를 ‘보여 주기’ 위해 산다. hide 는 ‘숨기다’.']],
    [4, 'Luxury brands, expensive watches, sports cars, and designer handbags are {{1:common/rare}} examples of Veblen goods.',
      ['베블런재의 ‘흔한’(common) 예들이다.']],
    [5, 'This idea is based on the concept of {{1:conspicuous/hidden}} consumption, introduced by the American economist Thorstein Veblen.',
      ['남에게 보이려는 소비, 즉 ‘과시적’(conspicuous) 소비이다. hidden 은 ‘숨겨진’.']],
    [6, 'According to this theory, some people buy expensive goods not only for their {{1:quality/quantity}} but also to {{2:display/conceal}} their financial success.',
      ['물건의 ‘품질’(quality) 때문만이 아니라는 뜻이다. quantity 는 ‘양’.',
       '경제적 성공을 ‘과시하기’(display) 위해서이다. conceal 은 ‘감추다’.']],
    [7, 'A customer chooses a luxury watch instead of a {{1:cheaper/pricier}} one because its high price makes the watch seem more {{2:prestigious/ordinary}}.',
      ['명품 시계 대신이 아니라 ‘더 싼’(cheaper) 시계 대신 명품을 고른다.',
       '높은 가격이 시계를 더 ‘고급스러워’(prestigious) 보이게 한다.']],
    [8, 'A luxury brand {{1:raises/lowers}} the price of a handbag, and demand {{2:increases/decreases}} because the product appears even more exclusive.',
      ['가격을 ‘올리자’(raises) 더 고급스러워 보인다는 흐름이다.',
       '베블런 효과이므로 수요가 ‘증가’한다.']],
    [9, 'The Veblen effect is the tendency for demand to rise as the price of a product rises because the product {{1:symbolizes/hides}} wealth, prestige, or social status.',
      ['제품이 부·명성·지위를 ‘상징하기’(symbolizes) 때문이다.']],
  ],
  F: [
    [1, ['behavior', 'willing', 'expensive']],
    [2, ['products', 'demand', 'increase']],
    [3, ['purchase', 'wealth', 'status']],
    [4, ['watches', 'designer', 'examples']],
    [5, ['concept', 'conspicuous', 'economist']],
    [6, ['theory', 'quality', 'display', 'financial']],
    [7, ['customer', 'instead', 'prestigious']],
    [8, ['raises', 'handbag', 'exclusive']],
    [9, ['tendency', 'symbolizes', 'prestige']],
  ],
  KO: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  J: [2, 3, 4, 5, 6, 7, 8],
  S: [1, 2, 3, 5, 6, 7, 8, 9],
  M: [['grammar', 2], ['vocab', 5], ['fill', 7], ['ko', 4], ['jumble', 6], ['sent', 1], ['grammar', 7], ['vocab', 8]],
});

/* ───────────────────────── 11. Romeo and Juliet effect ───────────────────────── */
build(11, {
  voca: {
    en_to_ko: [
      { word: 'together', pos: '부' }, { word: 'psychologist', pos: '명' }, { word: 'problems', pos: '명' },
      { word: 'parents', pos: '명' }, { word: 'applies', pos: '동' }, { word: 'wonder', pos: '동' },
      { word: 'disappear', pos: '동' }, { word: 'sellers', pos: '명' }, { word: 'worry', pos: '동' },
      { word: 'shopping', pos: '명' },
    ],
    ko_to_en: [
      { meaning: '선택했다 (choose의 과거형)', pos: '동', answer: 'chose' },
      { meaning: '빨리, 신속하게', pos: '부', answer: 'quickly' },
      { meaning: '곧, 빨리', pos: '부', answer: 'soon' },
      { meaning: '심리학자', pos: '명', answer: 'psychologist' },
      { meaning: '감정, 느낌', pos: '명', answer: 'feeling' },
      { meaning: '사라지다', pos: '동', answer: 'disappear' },
      { meaning: '판매자', pos: '명', answer: 'seller' },
      { meaning: '구매자', pos: '명', answer: 'buyer' },
      { meaning: '세일, 할인 판매', pos: '명', answer: 'sale' },
      { meaning: '필요하다', pos: '동', answer: 'need' },
    ],
    expressions: [
      { ko: '서로', answer: 'each other' },
      { ko: '~와 사랑에 빠지다', answer: 'fall in love with' },
      { ko: '~에 적용되다', answer: 'applies to' },
      { ko: '사라지다, 없어지다', answer: 'go away' },
      { ko: '즉시, 곧바로', answer: 'right away' },
    ],
    definitions: [
      { def: 'a person who studies the human mind and behavior', answer: 'psychologist' },
      { def: 'to go out of sight or stop existing', answer: 'disappear' },
      { def: 'a person who sells things', answer: 'seller' },
      { def: 'to feel nervous about something that might happen', answer: 'worry' },
      { def: 'the activity of going to stores to buy things', answer: 'shopping' },
    ],
  },
  G: [
    [2, 'In the story, they chose {{1:to die/dying}} because they couldn’t be together.',
      ['choose 는 to부정사를 목적어로 취한다(choose to-v ‘~하기로 선택하다’).']],
    [3, 'But did you know {{1:that/what}} Romeo and Juliet knew each other {{2:for/during}} only five days?',
      ['뒤에 완전한 절이 오는 명사절이므로 접속사 that. what 뒤에는 불완전한 절이 온다.',
       '숫자로 된 기간(five days) 앞에는 for. during 뒤에는 특정 기간의 명사(the summer 등)가 온다.']],
    [4, 'Can you really fall in love with someone so {{1:quickly/quick}}?',
      ['동사구 fall in love 를 꾸미므로 부사 quickly.']],
    [5, 'A psychologist has an idea about {{1:why they fell/why did they fall}} in love so soon.',
      ['전치사 about 의 목적어인 간접의문문이므로 「의문사 + 주어 + 동사」 어순.']],
    [6, 'The idea is {{1:that/what}} Romeo and Juliet liked each other more {{2:because/because of}} they had many problems.',
      ['보어 자리의 명사절이고 뒤가 완전한 절이므로 that.',
       '뒤에 「주어+동사」(they had)가 오므로 접속사 because.']],
    [7, 'Their parents did not like their love and tried {{1:to stop/stop}} them, {{2:which/that}} made Romeo and Juliet {{3:want/to want}} each other even more.',
      ['try to-v ‘~하려고 애쓰다’.',
       '앞 절 전체를 받는 계속적 용법(콤마 뒤)에는 that 을 쓸 수 없고 which 를 쓴다.',
       '사역동사 make 는 「make + 목적어 + 동사원형」이므로 want.']],
    [8, 'This feeling is not just about love, but it also {{1:applies/apply}} to shopping.',
      ['주어 it(= This feeling)이 3인칭 단수이므로 applies.']],
    [9, 'People want something more when they think it might {{1:go/goes}} away.',
      ['조동사 might 뒤에는 동사원형이 온다.']],
    [10, 'You may wonder {{1:why people want/why do people want}} somethings more when they think they might disappear.',
      ['wonder 의 목적어인 간접의문문이므로 「의문사 + 주어 + 동사」 어순(why people want). ※ 프린트 원문 표기 somethings 를 그대로 두었다(문법상으로는 something).']],
    [14, 'Buyers worry about {{1:not getting/not get}} {{2:what/that}} they want, so they buy right away.',
      ['전치사 about 뒤에는 동명사가 오며, 동명사의 부정은 not 을 앞에 둔다.',
       '선행사가 없고 want 의 목적어가 빠진 불완전한 절이므로 관계대명사 what(~하는 것).']],
    [15, 'This {{1:is called/calls}} the Romeo and Juliet effect.',
      ['‘~라고 불린다’는 수동태 be called.']],
    [16, 'So, next time you see a “3-day-only sale,” ask {{1:yourself/you}}: Do I really need it?',
      ['명령문의 숨은 주어 you 와 목적어가 같으므로 재귀대명사 yourself.']],
  ],
  V: [
    [1, 'Romeo and Juliet’s love story is very {{1:sad/happy}}.',
      ['둘이 죽음을 택한 이야기이므로 ‘슬프다’(sad).']],
    [2, 'In the story, they chose to die because they couldn’t be {{1:together/apart}}.',
      ['‘함께’(together) 있을 수 없어서 죽음을 택했다.']],
    [5, 'A {{1:psychologist/biologist}} has an idea about why they fell in love so {{2:soon/late}}.',
      ['사랑에 빠지는 마음을 연구하는 사람은 ‘심리학자’(psychologist). biologist 는 ‘생물학자’.',
       '5일 만에 사랑에 빠졌으므로 ‘그렇게 빨리’(so soon).']],
    [6, 'The idea is that Romeo and Juliet liked each other more because they had many {{1:problems/friends}}.',
      ['장애물, 즉 많은 ‘문제’(problems) 때문에 더 좋아했다는 것이 핵심이다.']],
    [7, 'Their parents did not like their love and tried to {{1:stop/help}} them, which made Romeo and Juliet want each other even {{2:more/less}}.',
      ['사랑을 반대한 부모는 둘을 ‘막으려’(stop) 했다.',
       '반대가 오히려 서로를 ‘더’(more) 원하게 만들었다.']],
    [8, 'This feeling is not just about love, but it also {{1:applies/belongs}} to shopping.',
      ['이 감정이 쇼핑에도 ‘적용된다’(applies to).']],
    [9, 'People want something {{1:more/less}} when they think it might go away.',
      ['사라질 것 같으면 ‘더’(more) 원한다.']],
    [10, 'You may {{1:wonder/forget}} why people want somethings more when they think they might {{2:disappear/appear}}.',
      ['왜 그런지 ‘궁금해할’(wonder) 수 있다.',
       '‘사라질지도’(disappear) 모른다고 생각할 때이다. appear 는 ‘나타나다’.']],
    [11, 'Many {{1:sellers/doctors}} use this idea from Romeo and Juliet.',
      ['“단 3일 남았습니다!”라고 말하는 사람은 ‘판매자’(sellers)이다.']],
    [14, 'Buyers {{1:worry/relax}} about not getting what they want, so they buy {{2:right away/much later}}.',
      ['원하는 것을 못 얻을까 봐 ‘걱정한다’(worry about).',
       '걱정해서 ‘즉시’(right away) 산다.']],
    [16, 'So, next time you see a “3-day-only sale,” ask yourself: Do I really {{1:need/hate}} it?',
      ['충동구매 전에 정말 ‘필요한지’(need) 스스로 묻는다.']],
  ],
  F: [
    [1, ['story']],
    [2, ['chose', 'together']],
    [4, ['really', 'quickly']],
    [5, ['psychologist']],
    [6, ['liked', 'problems']],
    [7, ['parents', 'tried']],
    [8, ['feeling', 'applies', 'shopping']],
    [9, ['something', 'think']],
    [10, ['wonder', 'disappear']],
    [11, ['sellers']],
    [14, ['worry', 'getting']],
    [16, ['yourself', 'really']],
  ],
  KO: [2, 3, 5, 7, 8, 10, 12, 13, 14, 16],
  J: [1, 2, 4, 5, 6, 8, 9, 11, 14, 15],
  S: [3, 4, 6, 7, 9, 10, 11, 14, 15, 16],
  M: [['grammar', 5], ['vocab', 6], ['fill', 8], ['ko', 6], ['jumble', 7], ['sent', 4], ['grammar', 10], ['vocab', 10]],
});
