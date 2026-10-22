#!/usr/bin/env node
/* ===================================================================
 * 봉영여중3 추가지문 4 — 12 The Lipstick Effect · 13 The Halo Effect — 워크북 저작
 * ===================================================================
 * data/EX4V/{12,13}.json (= data/EX4 의 같은 번호 분석지 사본, exam 만 변경) 을 기준으로
 * data/EX4V/{N}-workbook.json 을 생성한다. 직접 JSON 을 고치지 말고 여기서 고친다.
 * 9~11(_author-EXV-workbook.mjs) 형식에 목일중3 EXV 의 두 보강을 더했다:
 *   ① 양자택일 표시 순서 섞기 — 빌더는 {{n:A/B}} 를 적힌 순서 그대로 찍어 정답(A)이 늘 앞에 온다.
 *      출력 템플릿에서 슬롯마다 결정적 해시로 약 절반을 B/A 로 뒤집는다(정답지는 answers 배열 사용).
 *   ② 배열 단어 순서 역산 — 빌더 섞기를 재현해 최종 인쇄 순서가 원문 이웃쌍 0·첫 단어 다름이 되게 한다.
 *
 * 축약 규칙
 *   G/V : [ref, en_template(A=정답), [explain...]]  F : [ref, [answer...]]
 *
 * ⚠️ 빌더 고유명사 오탐 — 아래 단어는 단독 정답으로 쓰지 말 것(조용히 삭제됨, verify 가 차단)
 *   12: when however these    13: english it for therefore
 * ⚠️ 빈칸 정답은 5글자 이상(4글자 이하는 빌더가 지움)
 * =================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

const slotsOf = (t) => [...t.matchAll(/\{\{(\d+):([^\/]+)\/([^}]+)\}\}/g)].map(m => m[2].trim());
// 결정적 해시(FNV-1a) — 같은 입력이면 항상 같은 순서
const hash = (str) => { let h = 2166136261; for (const c of str) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const displayTemplate = (tmpl, seed) => tmpl.replace(/\{\{(\d+):([^\/]+)\/([^}]+)\}\}/g,
  (m, n, a, b) => (hash(`${seed}|${n}`) % 2 ? `{{${n}:${b}/${a}}}` : m));
const wordsOf = (s) => s.split(/\s+/)
  .map(w => w.replace(/^[“"‘(]+/, '').replace(/[”"’),.!?:;]+$/, '').replace(/[”"),.!?:;]+$/, ''))
  .filter(w => w && w !== '–');

/* ── 배열 단어 순서 ───────────────────────────────────────────────
 * build-workbook.mjs 는 jumble.words 를 시드(`${exam}|${question_no}|j${ref}`)로 한 번 더 섞는다(mulberry32 +
 * Fisher–Yates, 결정적). 그 섞기만으로는 원문에서 이웃한 단어가 그대로 붙어 남거나 첫 단어가 정답 첫 단어인
 * 경우가 생기므로(실측 최대 3쌍), 빌더 섞기를 그대로 재현해 "최종 인쇄 순서"가 원문 이웃쌍 0·첫 단어 다름이
 * 되도록 입력 순서를 역산한다. verify-workbook-EXV.mjs 가 같은 재현으로 결과를 검사한다. */
function seededRng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function strSeed(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
/* 빌더 shuffleWords 의 첫 시도 순열: 최종[i] = 입력[perm[i]] */
function builderPerm(n, seedKey) {
  const rng = seededRng(strSeed(seedKey + '#0'));
  const idx = [...Array(n).keys()];
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return idx;
}
/* 원문 위치 배열(order)에서 이웃쌍 수 + 첫 단어 유지 벌점 — 같은 단어가 두 번 나오는 문장(is·the 등)도
 * 인쇄된 글자로 이웃쌍이 보이면 안 되므로 위치가 아니라 단어 문자열 쌍으로 센다. */
function orderScore(words, order) {
  const key = (w) => w.toLowerCase();
  const adj = new Set(words.slice(1).map((w, i) => `${key(words[i])} ${key(w)}`));
  const kept = order.slice(1).filter((p, i) => adj.has(`${key(words[order[i]])} ${key(words[p])}`)).length;
  return kept * 2 + (key(words[order[0]]) === key(words[0]) ? 1 : 0);
}
function targetOrder(words, seedKey) {
  const n = words.length;
  let best = null, bestScore = Infinity;
  for (let attempt = 0; attempt < 2000 && bestScore > 0; attempt++) {
    const rng = seededRng(strSeed(`${seedKey}|target#${attempt}`));
    const o = [...Array(n).keys()];
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; }
    const sc = orderScore(words, o);
    if (sc < bestScore) { best = o; bestScore = sc; }
  }
  return best;
}
/* 빌더가 섞은 뒤 targetOrder 가 되도록 입력 순서를 역산 */
function preShuffle(words, seedKey) {
  const n = words.length;
  if (n < 2) return words.slice();
  const want = targetOrder(words, seedKey);       // 최종 인쇄 순서(원문 위치)
  const perm = builderPerm(n, seedKey);           // 최종[i] = 입력[perm[i]]
  const input = new Array(n);
  perm.forEach((src, i) => { input[src] = words[want[i]]; });
  return input;
}

const DIR = path.join(HERE, 'data', 'EX4V');

function build(n, spec) {
  const data = JSON.parse(fs.readFileSync(path.join(DIR, `${n}.json`), 'utf8'));
  const ko = (r) => data.passage_ko[r - 1];
  const en = (r) => data.passage[r - 1];
  const choice = (kind) => (arr) => arr.map(([ref, tmpl, explain], i) => ({
    no: i + 1, ref_sentence: ref, en_template: displayTemplate(tmpl, `EX4V|${n}|${kind}|${ref}`), ko_full: ko(ref),
    answers: slotsOf(tmpl), explain,
  }));
  const wb = {
    $schema_version: '1.0',
    $ref_source: `${n}.json`,
    _note: `봉영여중3 추가지문 ${n}번 워크북 — _author-EX4V-workbook.mjs 가 생성(직접 수정 금지).`,
    voca_check: spec.voca,
    grammar_choice: choice('G')(spec.G),
    vocab_choice: choice('V')(spec.V),
    fill_first_letter: spec.F.map(([ref, answers], i) => ({
      no: i + 1, ref_sentence: ref,
      hints: answers.map((a, k) => ({ pos: k + 1, letter: a[0].toLowerCase(), answer: a, after: '' })),
      ko_full: ko(ref),
    })),
    ko_translation: spec.KO.map((ref, i) => ({ no: i + 1, ref_sentence: ref })),
    jumble: spec.J.map((ref, i) => ({ no: i + 1, ref_sentence: ref,
      words: preShuffle(wordsOf(en(ref)), `${data.exam || ''}|${data.question_no || ''}|j${ref}`), answer: en(ref) })),
    sentence_translation: spec.S.map((ref, i) => ({ no: i + 1, ref_sentence: ref, given: 'ko' })),
    mixed: spec.M.map(([kind, ref], i) => ({ kind, ref, no: i + 1 })),
  };
  fs.writeFileSync(path.join(DIR, `${n}-workbook.json`), JSON.stringify(wb, null, 2) + '\n', 'utf8');
  const pos = [...wb.grammar_choice, ...wb.vocab_choice].flatMap(it => slotsOf(it.en_template).map((a, k) => a === it.answers[k]));
  console.log(`  양자택일 정답 위치: 앞 ${pos.filter(Boolean).length} · 뒤 ${pos.filter(x => !x).length}`);
  console.log(`✓ ${n}-workbook.json  어법 ${wb.grammar_choice.length} · 어휘 ${wb.vocab_choice.length} · 빈칸 ${wb.fill_first_letter.length} · 해석 ${wb.ko_translation.length} · 배열 ${wb.jumble.length} · 영작 ${wb.sentence_translation.length} · 종합 ${wb.mixed.length}`);
}

/* ───────────────────────── 12. The Lipstick Effect ───────────────────────── */
build(12, {
  voca: {
    en_to_ko: [
      { word: 'economic', pos: '형' }, { word: 'phenomenon', pos: '명' }, { word: 'economy', pos: '명' },
      { word: 'pleasures', pos: '명' }, { word: 'designer', pos: '명' }, { word: 'perfume', pos: '명' },
      { word: 'relatively', pos: '부' }, { word: 'inexpensive', pos: '형' }, { word: 'affordable', pos: '형' },
      { word: 'during', pos: '전' },
    ],
    ko_to_en: [
      { meaning: '흥미로운', pos: '형', answer: 'interesting' },
      { meaning: '비싼', pos: '형', answer: 'expensive' },
      { meaning: '제품', pos: '명', answer: 'product' },
      { meaning: '즐기다', pos: '동', answer: 'enjoy' },
      { meaning: '일상의, 매일의', pos: '형', answer: 'daily' },
      { meaning: '립스틱', pos: '명', answer: 'lipstick' },
      { meaning: '행복한', pos: '형', answer: 'happy' },
      { meaning: '어려운', pos: '형', answer: 'difficult' },
      { meaning: '보여 주다', pos: '동', answer: 'show' },
      { meaning: '여전히, 아직도', pos: '부', answer: 'still' },
    ],
    expressions: [
      { ko: '~ 대신에', answer: 'instead of' },
      { ko: '~을 찾다', answer: 'look for' },
      { ko: '예를 들어', answer: 'for example' },
      { ko: '일상생활', answer: 'daily lives' },
      { ko: '경제적으로 어려운 시기', answer: 'difficult economic times' },
    ],
    definitions: [
      { def: 'something that happens and can be seen or studied', answer: 'phenomenon' },
      { def: 'a liquid with a pleasant smell that people put on their skin', answer: 'perfume' },
      { def: 'cheap enough for most people to buy', answer: 'affordable' },
      { def: 'the system of money, trade and business in a country', answer: 'economy' },
      { def: 'a feeling of happiness or enjoyment', answer: 'pleasure' },
    ],
  },
  G: [
    [1, 'The lipstick effect {{1:is/are}} an interesting economic {{2:phenomenon/phenomena}}.',
      ['주어 The lipstick effect 가 단수이므로 is.',
       '부정관사 an 뒤에는 단수명사 phenomenon. phenomena 는 복수형이다.']],
    [2, 'When the economy is bad, people often spend {{1:less/fewer}} money {{2:on/to}} expensive products.',
      ['셀 수 없는 명사 money 앞이므로 little 의 비교급 less. fewer 는 셀 수 있는 명사의 복수형 앞에 쓴다.',
       'spend A on B ‘B에 A를 쓰다’이므로 전치사 on.']],
    [3, 'However, they still want {{1:to enjoy/enjoying}} small pleasures in their daily lives.',
      ['want 는 to부정사를 목적어로 취한다(want to-v).']],
    [4, 'For example, instead of {{1:buying/buy}} an expensive designer bag, some people may {{2:buy/buys}} a new lipstick or a small perfume.',
      ['instead of 는 전치사구라 뒤에 동명사 buying 이 온다.',
       '조동사 may 뒤에는 동사원형 buy.']],
    [5, 'These products are {{1:relatively/relative}} inexpensive, but they can make people {{2:feel/to feel}} {{3:happy/happily}}.',
      ['형용사 inexpensive 를 꾸미므로 부사 relatively.',
       '사역동사 make 는 「make + 목적어 + 동사원형」이므로 feel.',
       '감각동사 feel 뒤에는 형용사 보어 happy.']],
    [6, 'The lipstick effect shows that even {{1:during/while}} difficult economic times, people still look for affordable ways {{2:to enjoy/enjoying}} their lives.',
      ['뒤에 명사구(difficult economic times)가 오므로 전치사 during. while 은 접속사라 「주어 + 동사」가 온다.',
       'ways 를 꾸미는 형용사적 to부정사(~할 방법)이므로 to enjoy.']],
  ],
  V: [
    [1, 'The lipstick effect is an interesting {{1:economic/medical}} phenomenon.',
      ['경기와 소비에 관한 ‘경제’(economic) 현상이다. medical 은 ‘의학의’.']],
    [2, 'When the economy is {{1:bad/strong}}, people often spend {{2:less/more}} money on {{3:expensive/cheap}} products.',
      ['립스틱 효과는 경기가 ‘나쁠’(bad) 때 나타난다.',
       '불황에는 돈을 ‘덜’(less) 쓴다.',
       '덜 쓰는 대상은 ‘비싼’(expensive) 제품이다.']],
    [3, 'However, they still want to enjoy small {{1:pleasures/problems}} in their daily lives.',
      ['여전히 누리고 싶은 것은 작은 ‘즐거움’(pleasures)이다.']],
    [4, 'For example, instead of buying an {{1:expensive/affordable}} designer bag, some people may buy a new lipstick or a {{2:small/large}} perfume.',
      ['사지 않는 것은 ‘비싼’(expensive) 디자이너 가방이다.',
       '저렴한 즐거움이므로 ‘작은’(small) 향수이다.']],
    [5, 'These products are relatively {{1:inexpensive/expensive}}, but they can make people feel {{2:happy/guilty}}.',
      ['립스틱·향수는 비교적 ‘저렴하다’(inexpensive).',
       '작은 즐거움이 사람들을 ‘행복하게’(happy) 한다. guilty 는 ‘죄책감이 드는’.']],
    [6, 'The lipstick effect shows that even during {{1:difficult/prosperous}} economic times, people still look for {{2:affordable/luxurious}} ways to enjoy their lives.',
      ['경제적으로 ‘어려운’(difficult) 시기이다. prosperous 는 ‘번영하는’.',
       '‘감당할 만한’(affordable) 방법을 찾는다. luxurious 는 ‘사치스러운’.']],
  ],
  F: [
    [1, ['interesting', 'economic', 'phenomenon']],
    [2, ['economy', 'often', 'expensive', 'products']],
    [3, ['still', 'enjoy', 'pleasures', 'daily']],
    [4, ['instead', 'buying', 'designer', 'lipstick', 'perfume']],
    [5, ['products', 'relatively', 'inexpensive', 'happy']],
    [6, ['shows', 'during', 'difficult', 'affordable']],
  ],
  KO: [1, 2, 3, 4, 5, 6],
  J: [1, 2, 3, 4, 5, 6],
  S: [1, 2, 3, 4, 5, 6],
  M: [['grammar', 2], ['vocab', 4], ['fill', 3], ['ko', 5], ['jumble', 1], ['sent', 6], ['grammar', 5], ['vocab', 6]],
});

/* ───────────────────────── 13. The Halo Effect ───────────────────────── */
build(13, {
  voca: {
    en_to_ko: [
      { word: 'psychological', pos: '형' }, { word: 'phenomenon', pos: '명' }, { word: 'quality', pos: '명' },
      { word: 'influences', pos: '동' }, { word: 'actual', pos: '형' }, { word: 'abilities', pos: '명' },
      { word: 'advertising', pos: '명' }, { word: 'celebrity', pos: '명' }, { word: 'promotes', pos: '동' },
      { word: 'judgments', pos: '명' },
    ],
    ko_to_en: [
      { meaning: '상상하다', pos: '동', answer: 'imagine' },
      { meaning: '훌륭한, 뛰어난', pos: '형', answer: 'excellent' },
      { meaning: '유명한', pos: '형', answer: 'famous' },
      { meaning: '믿다', pos: '동', answer: 'believe' },
      { meaning: '인상', pos: '명', answer: 'impression' },
      { meaning: '사실', pos: '명', answer: 'fact' },
      { meaning: '판단하다', pos: '동', answer: 'judge' },
      { meaning: '때때로', pos: '부', answer: 'sometimes' },
      { meaning: '일어나다, 발생하다', pos: '동', answer: 'happen' },
      { meaning: '제품', pos: '명', answer: 'product' },
    ],
    expressions: [
      { ko: '~을 잘하다', answer: 'good at' },
      { ko: '비록 ~이지만, ~인데도', answer: 'even though' },
      { ko: '~보다는', answer: 'rather than' },
      { ko: '~에 근거하여', answer: 'based on' },
      { ko: '첫인상', answer: 'first impressions' },
    ],
    definitions: [
      { def: 'a famous person, especially in movies, music or TV', answer: 'celebrity' },
      { def: 'the business of telling people about products to make them buy them', answer: 'advertising' },
      { def: 'an opinion you form after thinking about something', answer: 'judgment' },
      { def: 'a feature of a person’s character or of a thing', answer: 'quality' },
      { def: 'real, not imagined', answer: 'actual' },
    ],
  },
  G: [
    [1, 'The halo effect is an interesting {{1:psychological/psychology}} phenomenon.',
      ['명사 phenomenon 을 꾸미므로 형용사 psychological. psychology 는 ‘심리학’(명사).']],
    [2, 'It happens when one good quality of a person or product {{1:influences/influence}} {{2:how we think/how do we think}} about their other qualities.',
      ['when 절의 주어는 one good quality(단수)이고 of a person or product 는 수식어이므로 influences.',
       'influences 의 목적어인 간접의문문은 「의문사 + 주어 + 동사」 어순.']],
    [3, 'For example, imagine {{1:that/what}} you meet a student {{2:who/which}} is very good at English.',
      ['뒤에 완전한 절이 오는 명사절이므로 접속사 that. what 뒤에는 불완전한 절이 온다.',
       '선행사 a student 가 사람이므로 주격 관계대명사 who.']],
    [4, 'You may {{1:think/thinks}} that the student is also good at math and science, {{2:even though/despite}} you do not know their actual abilities.',
      ['조동사 may 뒤에는 동사원형 think.',
       '뒤에 「주어 + 동사」(you do not know)가 오므로 접속사 even though. despite 는 전치사라 명사(구)가 온다.']],
    [5, 'The halo effect can also {{1:be seen/see}} in advertising.',
      ['후광 효과가 ‘보이는’ 수동 관계이므로 「조동사 + be + 과거분사」 be seen.']],
    [6, 'When a famous celebrity {{1:promotes/promote}} a product, people may believe that the product is {{2:excellent/excellently}} because they like the celebrity.',
      ['주어 a famous celebrity 가 3인칭 단수이므로 promotes.',
       'be동사 is 의 보어이므로 형용사 excellent.']],
    [7, 'The halo effect shows that our judgments {{1:are/is}} sometimes {{2:influenced/influencing}} by first impressions rather than facts.',
      ['that절의 주어 our judgments 가 복수이므로 are.',
       '판단이 첫인상에 의해 ‘영향을 받는’ 수동태이므로 과거분사 influenced(뒤에 by).']],
    [8, 'Therefore, we should try to {{1:judge/judging}} people and products {{2:based/basing}} on their actual qualities.',
      ['try to 뒤에는 동사원형 judge.',
       '‘~에 근거하여’는 과거분사 based on.']],
  ],
  V: [
    [1, 'The halo effect is an interesting {{1:psychological/physical}} phenomenon.',
      ['생각과 판단에 관한 ‘심리’(psychological) 현상이다. physical 은 ‘신체의, 물리적인’.']],
    [2, 'It happens when one {{1:good/bad}} quality of a person or product influences how we think about their {{2:other/same}} qualities.',
      ['후광 효과는 ‘좋은’(good) 특성 하나에서 시작된다.',
       '그 특성이 ‘다른’(other) 특성들에 대한 생각에 영향을 준다.']],
    [3, 'For example, imagine that you meet a student who is very {{1:good/poor}} at English.',
      ['영어를 ‘잘하는’(good at) 학생이 예시이다. be poor at 은 ‘~을 못하다’.']],
    [4, 'You may think that the student is {{1:also/never}} good at math and science, even though you do not know their {{2:actual/imaginary}} abilities.',
      ['영어처럼 수학·과학‘도’(also) 잘한다고 생각한다.',
       '학생의 ‘실제’(actual) 능력을 모른다. imaginary 는 ‘상상의’.']],
    [5, 'The halo effect can also be seen in {{1:advertising/agriculture}}.',
      ['뒤 문장의 연예인 홍보는 ‘광고’(advertising)의 예이다. agriculture 는 ‘농업’.']],
    [6, 'When a famous celebrity {{1:promotes/criticizes}} a product, people may believe that the product is {{2:excellent/terrible}} because they {{3:like/dislike}} the celebrity.',
      ['연예인이 제품을 ‘홍보할’(promotes) 때이다. criticize 는 ‘비판하다’.',
       '제품이 ‘훌륭하다’(excellent)고 믿는다.',
       '연예인을 ‘좋아하기’(like) 때문이다.']],
    [7, 'The halo effect shows that our judgments are sometimes influenced by first {{1:impressions/experiments}} rather than {{2:facts/rumors}}.',
      ['‘첫인상’(first impressions)에 영향을 받는다.',
       '첫인상과 대비되는 것은 ‘사실’(facts)이다. rumors 는 ‘소문’.']],
    [8, 'Therefore, we should try to judge people and products based on their {{1:actual/imagined}} qualities.',
      ['‘실제’(actual) 특성에 근거해 판단해야 한다는 교훈이다.']],
  ],
  F: [
    [1, ['interesting', 'psychological', 'phenomenon']],
    [2, ['happens', 'quality', 'product', 'influences', 'qualities']],
    [3, ['example', 'imagine', 'student']],
    [4, ['science', 'though', 'actual', 'abilities']],
    [5, ['effect', 'advertising']],
    [6, ['famous', 'celebrity', 'promotes', 'believe', 'excellent']],
    [7, ['judgments', 'sometimes', 'influenced', 'impressions', 'facts']],
    [8, ['judge', 'people', 'products', 'based', 'actual']],
  ],
  KO: [1, 2, 3, 4, 5, 6, 7, 8],
  J: [1, 2, 3, 4, 5, 6, 7, 8],
  S: [1, 2, 3, 4, 5, 6, 7, 8],
  M: [['grammar', 2], ['vocab', 6], ['fill', 4], ['ko', 7], ['jumble', 3], ['sent', 8], ['grammar', 6], ['vocab', 4]],
});
