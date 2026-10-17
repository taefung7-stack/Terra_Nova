#!/usr/bin/env node
/* ===================================================================
 * 목일중3 추가지문(EX · EX2) — 워크북 저작
 * ===================================================================
 * data/EXV/1.json  (= data/EX/1.json  사본, exam 변경 + 16번 carefuliy→carefully)
 * data/EX2V/1.json (= data/EX2/1.json 사본, exam 변경)
 * 을 기준으로 data/{EXV,EX2V}/1-workbook.json 을 생성한다. 직접 JSON 을 고치지 말고 여기서 고친다.
 * 도구는 _oneoff-봉영여중3-비상김/_author-EXV-workbook.mjs 복제.
 *
 * 축약 규칙
 *   G/V : [ref, en_template, [explain...]]  → answers 는 템플릿 A 슬롯, ko_full 은 passage_ko
 *         ⚠️ 빌더는 {{n:A/B}} 를 적힌 순서 그대로 찍는다. 저작 규약(A=정답)대로 두면 정답이
 *         언제나 앞에 와서 순서로 답이 새므로, 출력 템플릿에서는 슬롯마다 결정적 해시로
 *         약 절반을 B/A 로 뒤집는다(정답지는 answers 배열을 쓰므로 영향 없음).
 *   F   : [ref, [answer...]]                → letter 는 첫 글자
 *   jumble.words 는 정답 문장에서 자동 생성(구두점 제거)
 *
 * ⚠️ 빌더 고유명사 오탐 — 아래 단어는 단독 정답으로 쓰지 말 것(조용히 삭제됨, verify 가 차단)
 *   EXV : lee suji korean daechi-dong this although
 *   EX2V: ai many these consequently there building by nevertheless if yet ultimately while using
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

function build(lesson, spec) {
  const DIR = path.join(HERE, 'data', lesson);
  const data = JSON.parse(fs.readFileSync(path.join(DIR, '1.json'), 'utf8'));
  const ko = (r) => data.passage_ko[r - 1];
  const en = (r) => data.passage[r - 1];
  const choice = (kind) => (arr) => arr.map(([ref, tmpl, explain], i) => ({
    no: i + 1, ref_sentence: ref, en_template: displayTemplate(tmpl, `${lesson}|${kind}|${ref}`), ko_full: ko(ref),
    answers: slotsOf(tmpl), explain,
  }));
  const wb = {
    $schema_version: '1.0',
    $ref_source: '1.json',
    _note: `목일중3 ${spec.label} 워크북 — _author-EXV-workbook.mjs 가 생성(직접 수정 금지).`,
    voca_check: spec.voca,
    grammar_choice: choice('G')(spec.G),
    vocab_choice: choice('V')(spec.V),
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
  fs.writeFileSync(path.join(DIR, '1-workbook.json'), JSON.stringify(wb, null, 2) + '\n', 'utf8');
  const pos = [...wb.grammar_choice, ...wb.vocab_choice].flatMap(it => slotsOf(it.en_template).map((a, k) => a === it.answers[k]));
  console.log(`  양자택일 정답 위치: 앞 ${pos.filter(Boolean).length} · 뒤 ${pos.filter(x => !x).length}`);
  console.log(`✓ ${lesson}/1-workbook.json  어법 ${wb.grammar_choice.length} · 어휘 ${wb.vocab_choice.length} · 빈칸 ${wb.fill_first_letter.length} · 해석 ${wb.ko_translation.length} · 배열 ${wb.jumble.length} · 영작 ${wb.sentence_translation.length} · 종합 ${wb.mixed.length}`);
}

/* ───────────── EX. 7 Supplementary Reading — Lee Suji’s Comedy ───────────── */
build('EXV', {
  label: '추가지문(7 Supplementary Reading)',
  voca: {
    en_to_ko: [
      { word: 'extreme', pos: '형' }, { word: 'psychology', pos: '명' }, { word: 'conformity', pos: '명' },
      { word: 'influencer', pos: '명' }, { word: 'ceramic', pos: '형' }, { word: 'comparison', pos: '명' },
      { word: 'exaggeration', pos: '명' }, { word: 'questionable', pos: '형' }, { word: 'mental', pos: '형' },
      { word: 'encourages', pos: '동' },
    ],
    ko_to_en: [
      { meaning: '흔한, 일반적인', pos: '형', answer: 'common' },
      { meaning: '행동', pos: '명', answer: 'behavior' },
      { meaning: '따라 하다, 모방하다', pos: '동', answer: 'copy' },
      { meaning: '평범한, 보통의', pos: '형', answer: 'regular' },
      { meaning: '비교하다', pos: '동', answer: 'compare' },
      { meaning: '경쟁적인', pos: '형', answer: 'competitive' },
      { meaning: '압력, 압박', pos: '명', answer: 'pressure' },
      { meaning: '능가하다, ~보다 낫다', pos: '동', answer: 'outdo' },
      { meaning: '비판, 비난', pos: '명', answer: 'criticism' },
      { meaning: '사려 깊은', pos: '형', answer: 'thoughtful' },
    ],
    expressions: [
      { ko: '~을 놀리다, 웃음거리로 만들다', answer: 'makes fun of' },
      { ko: '~에 대해 농담하다', answer: 'makes jokes about' },
      { ko: '도를 지나치다', answer: 'go too far' },
      { ko: '~로 이어지다', answer: 'lead to' },
      { ko: '~ 대신에', answer: 'instead of' },
    ],
    definitions: [
      { def: 'a person whose job is to make people laugh', answer: 'comedian' },
      { def: 'a way of doing or wearing something that becomes popular for a time', answer: 'trend' },
      { def: 'not good for your body or mind', answer: 'unhealthy' },
      { def: 'a person who buys things in stores or online', answer: 'shopper' },
      { def: 'to see or become aware of something', answer: 'notice' },
    ],
  },
  G: [
    [1, 'Korean comedian Lee Suji {{1:has become/has became}} popular on social media by {{2:making/make}} funny videos about Korean trends.',
      ['현재완료는 「have/has + 과거분사」이고 become 의 과거분사는 become(become-became-become)이다.',
       '전치사 by 뒤에는 동명사가 온다(by -ing ‘~함으로써’).']],
    [2, 'By making common behaviors {{1:look/to look}} silly and {{2:extreme/extremely}}, she helps people {{3:think/thinking}} about why they follow these trends.',
      ['사역동사 make 는 「make + 목적어 + 동사원형」이므로 look.',
       'look(~하게 보이다)의 보어로 silly 와 병렬된 형용사 extreme 이 온다.',
       'help 는 「help + 목적어 + (to) 동사원형」이므로 think. -ing 형은 쓸 수 없다.']],
    [5, 'This is when people just copy {{1:what/that}} others do without {{2:thinking/think}} for themselves.',
      ['선행사가 없고 do 의 목적어가 빠진 불완전한 절을 이끄는 관계대명사 what(~하는 것).',
       '전치사 without 뒤에는 동명사가 온다.']],
    [6, 'In one video, she acts like an influencer {{1:selling/sold}} a regular ceramic cup, {{2:calling/called}} it a “face slimming tool” for a very high price.',
      ['인플루언서가 컵을 ‘파는’ 능동 관계이므로 현재분사 selling 이 an influencer 를 꾸민다.',
       '주어 she 가 그것을 ‘부르는’ 능동 관계의 분사구문이므로 calling.']],
    [7, 'Her followers quickly buy it just {{1:because/because of}} the influencer they like {{2:says/say}} it works.',
      ['뒤에 「주어 + 동사」(the influencer … says)가 오므로 접속사 because.',
       '주어는 the influencer(단수)이고 they like 는 목적격 관계대명사가 생략된 수식어이므로 says.']],
    [9, 'This happens when people always compare {{1:themselves/them}} to others.',
      ['주어 people 과 목적어가 같은 대상이므로 재귀대명사 themselves.']],
    [11, 'In her comedy, she makes fun of {{1:how/what}} parents go too far by sending their children to hakwons for everything – even for basic life skills like {{2:using/use}} the bathroom.',
      ['뒤에 완전한 절(parents go too far)이 오므로 의문사 how(얼마나 ~하는지). what 뒤에는 불완전한 절이 온다.',
       '전치사 like(~ 같은) 뒤에는 동명사가 온다.']],
    [12, 'Her funny exaggeration shows how {{1:competitive/competitively}} schooling has become in Korean society.',
      ['become 의 보어 자리이므로 형용사 competitive(how + 형용사 + 주어 + 동사).']],
    [14, 'Conformity bias makes people {{1:follow/to follow}} trends without questioning them, {{2:while/during}} social comparison creates pressure {{3:to outdo/outdoing}} others.',
      ['사역동사 make 는 「make + 목적어 + 동사원형」이므로 follow.',
       '뒤에 「주어 + 동사」가 오므로 접속사 while(~인 반면). during 은 전치사라 명사(구)만 온다.',
       'pressure 를 꾸미는 to부정사(~하려는 압박)이므로 to outdo.']],
    [15, 'Both can lead to unhealthy behaviors – {{1:wasting/wasted}} money on products of questionable value or {{2:pushing/push}} children too hard in school.',
      ['대시 뒤는 unhealthy behaviors 의 구체적인 예로, 동명사 wasting 이 온다.',
       'or 로 wasting 과 병렬되므로 같은 동명사 형태 pushing.']],
    [17, '{{1:Using/Used}} humor instead of criticism, she encourages people {{2:to question/question}} social pressures that might affect {{3:what/that}} they buy or how they live.',
      ['주어 she 가 유머를 ‘사용하는’ 능동 관계의 분사구문이므로 현재분사 Using.',
       '「encourage + 목적어 + to부정사」 구조이므로 to question.',
       '선행사가 없고 buy 의 목적어가 빠진 불완전한 절이므로 관계대명사 what.']],
    [18, 'By making us {{1:laugh/to laugh}} at {{2:ourselves/us}}, Lee Suji helps us become more careful shoppers and more thoughtful members of society.',
      ['사역동사 make 는 「make + 목적어 + 동사원형」이므로 laugh.',
       '웃는 주체(us)와 웃음의 대상이 같으므로 재귀대명사 ourselves.']],
  ],
  V: [
    [2, 'By making common behaviors look {{1:silly/serious}} and extreme, she helps people think about why they {{2:follow/ignore}} these trends.',
      ['흔한 행동을 ‘우스꽝스럽게’(silly) 보이게 만드는 것이 코미디이다. serious 는 ‘진지한’.',
       '사람들이 유행을 왜 ‘따르는지’(follow) 생각하게 돕는다. ignore 는 ‘무시하다’.']],
    [5, 'This is when people just {{1:copy/avoid}} what others do without thinking for themselves.',
      ['동조 편향은 남이 하는 것을 생각 없이 ‘따라 하는’(copy) 것이다. avoid 는 ‘피하다’.']],
    [6, 'In one video, she acts like an influencer selling a {{1:regular/special}} ceramic cup, calling it a “face slimming tool” for a very {{2:high/low}} price.',
      ['‘평범한’(regular) 컵을 특별한 도구처럼 꾸며 파는 것이 웃음 포인트이다.',
       '평범한 컵을 아주 ‘비싼’(high) 가격에 판다.']],
    [7, 'Her followers quickly buy it just because the influencer they {{1:like/doubt}} says it works.',
      ['‘좋아하는’(like) 인플루언서의 말만 믿고 산다. doubt 는 ‘의심하다’.']],
    [9, 'This happens when people always {{1:compare/connect}} themselves to others.',
      ['사회적 비교 이론이므로 자신을 남과 ‘비교한다’(compare A to B).']],
    [12, 'Her funny {{1:exaggeration/explanation}} shows how {{2:competitive/cooperative}} schooling has become in Korean society.',
      ['화장실 사용까지 학원에 보낸다는 것은 ‘과장’(exaggeration)이다. explanation 은 ‘설명’.',
       '교육이 얼마나 ‘경쟁적’(competitive)이 되었는지 보여 준다. cooperative 는 ‘협력적인’.']],
    [13, 'Although these ideas affect {{1:different/similar}} areas of life, both show how social {{2:pressure/freedom}} influences our behavior.',
      ['소비와 교육이라는 ‘서로 다른’(different) 영역이라 Although 로 양보한다.',
       '두 개념의 공통점은 사회적 ‘압력’(pressure)이다. freedom 은 ‘자유’.']],
    [14, 'Conformity bias makes people follow trends without {{1:questioning/accepting}} them, while social comparison creates pressure to {{2:outdo/help}} others.',
      ['동조 편향은 유행에 ‘의문을 갖지’(questioning) 않고 따르게 한다.',
       '사회적 비교는 남을 ‘능가하려는’(outdo) 압박을 만든다.']],
    [15, 'Both can lead to {{1:unhealthy/healthy}} behaviors – wasting money on products of {{2:questionable/proven}} value or pushing children too hard in school.',
      ['돈 낭비와 아이 몰아붙이기는 ‘건강하지 못한’(unhealthy) 행동이다.',
       '‘의심스러운’(questionable) 가치의 제품에 돈을 낭비한다. proven 은 ‘입증된’.']],
    [16, 'Lee Suji’s comedy helps viewers {{1:notice/hide}} these mental habits in their own lives and think more carefully about their own choices.',
      ['자기 삶 속의 습관을 ‘알아차리게’(notice) 돕는다. hide 는 ‘숨기다’.']],
    [17, 'Using humor instead of {{1:criticism/praise}}, she encourages people to question social pressures that might affect what they buy or how they live.',
      ['‘비판’(criticism) 대신 유머를 쓴다는 흐름이다. praise 는 ‘칭찬’.']],
    [18, 'By making us laugh at ourselves, Lee Suji helps us become more {{1:careful/careless}} shoppers and more {{2:thoughtful/thoughtless}} members of society.',
      ['더 ‘신중한’(careful) 소비자가 되도록 돕는다. careless 는 ‘부주의한’.',
       '더 ‘사려 깊은’(thoughtful) 사회 구성원이 된다. thoughtless 는 ‘생각 없는’.']],
  ],
  F: [
    [1, ['comedian', 'popular', 'trends']],
    [2, ['behaviors', 'silly', 'extreme']],
    [3, ['comedy', 'important', 'psychology']],
    [5, ['without', 'themselves']],
    [6, ['influencer', 'regular', 'ceramic']],
    [10, ['focused', 'studies']],
    [11, ['everything', 'basic', 'bathroom']],
    [12, ['exaggeration', 'competitive', 'society']],
    [14, ['questioning', 'outdo']],
    [15, ['unhealthy', 'wasting', 'questionable']],
    [17, ['criticism', 'encourages', 'pressures']],
    [18, ['careful', 'thoughtful', 'members']],
  ],
  KO: [2, 5, 6, 7, 11, 13, 14, 15, 16, 17],
  J: [1, 3, 4, 5, 8, 9, 10, 12, 16, 18],
  S: [1, 2, 3, 7, 9, 10, 12, 13, 17, 18],
  M: [['grammar', 3], ['vocab', 4], ['fill', 5], ['ko', 2], ['jumble', 4], ['sent', 6], ['grammar', 8], ['vocab', 9]],
});

/* ───────────── EX2. Unit 8 Supplementary Reading — AI and Human Connection ───────────── */
build('EX2V', {
  label: '추가지문2(Unit 8 Supplementary Reading)',
  voca: {
    en_to_ko: [
      { word: 'era', pos: '명' }, { word: 'artificial', pos: '형' }, { word: 'accessible', pos: '형' },
      { word: 'empathize', pos: '동' }, { word: 'companion', pos: '명' }, { word: 'perceive', pos: '동' },
      { word: 'rejection', pos: '명' }, { word: 'anxiety', pos: '명' }, { word: 'drawbacks', pos: '명' },
      { word: 'simulation', pos: '명' },
    ],
    ko_to_en: [
      { meaning: '편리함', pos: '명', answer: 'convenience' },
      { meaning: '버리다, 떠나다', pos: '동', answer: 'abandon' },
      { meaning: '안도, 안심', pos: '명', answer: 'relief' },
      { meaning: '상당한, 중요한', pos: '형', answer: 'significant' },
      { meaning: '진짜의, 진정한', pos: '형', answer: 'authentic' },
      { meaning: '(느낌·경험이) 깊은, 엄청난', pos: '형', answer: 'profound' },
      { meaning: '대체하다; 대체물', pos: '동', answer: 'substitute' },
      { meaning: '화해', pos: '명', answer: 'reconciliation' },
      { meaning: '매우 중요한', pos: '형', answer: 'crucial' },
      { meaning: '(사람·삶을) 변화시키는', pos: '형', answer: 'transformative' },
    ],
    expressions: [
      { ko: '~에 참여하다, ~을 하다', answer: 'engage in' },
      { ko: '~이 없는, ~로부터 자유로운', answer: 'free from' },
      { ko: '그에 반해, 대조적으로', answer: 'by contrast' },
      { ko: '~으로 힘들어하다, ~와 씨름하다', answer: 'struggle with' },
      { ko: '~보다는, ~ 대신에', answer: 'rather than' },
    ],
    definitions: [
      { def: 'the sad feeling of being alone', answer: 'loneliness' },
      { def: 'to understand and share another person’s feelings', answer: 'empathize' },
      { def: 'a problem or disadvantage of something', answer: 'drawback' },
      { def: 'real and true, not fake', answer: 'genuine' },
      { def: 'the state of being alone and separated from others', answer: 'isolation' },
    ],
  },
  G: [
    [1, 'In the modern era, artificial intelligence (AI) is increasingly {{1:woven/weaving}} into our daily lives.',
      ['AI 가 일상에 ‘엮여 들어가는’ 수동 관계이므로 「be + 과거분사」 woven(weave-wove-woven).']],
    [2, 'Many individuals engage in conversations with AI chatbots when they experience loneliness, stress, or simply {{1:want/wants}} someone {{2:who/which}} will listen to them.',
      ['when 절의 주어 they 에 experience 와 병렬로 이어지므로 want.',
       '선행사 someone 이 사람이므로 주격 관계대명사 who.']],
    [3, 'These systems are constantly {{1:accessible/accessibly}}, free from judgment, and {{2:appear/appears}} to empathize with human emotions.',
      ['be동사의 보어 자리이므로 형용사 accessible.',
       '주어 These systems 가 복수이고 are 와 병렬된 동사이므로 appear.']],
    [5, 'There are several reasons {{1:why/which}} people seek emotional comfort from AI.',
      ['선행사 reasons 뒤에 완전한 절이 오므로 관계부사 why.']],
    [6, 'Building genuine human relationships can be {{1:complicated/complicating}}, {{2:requiring/required}} effort, communication, and the risk of rejection or conflict.',
      ['‘복잡한’이라는 뜻의 형용사 complicated 가 보어로 온다.',
       '관계 맺기가 노력을 ‘필요로 하는’ 능동 관계의 분사구문이므로 requiring.']],
    [7, 'By contrast, {{1:interacting/interact}} with AI is effortless: it responds {{2:politely/polite}}, listens attentively, and never abandons them or {{3:argues/argue}}.',
      ['주어 자리이므로 동명사 interacting(동사원형은 주어가 될 수 없다).',
       '동사 responds 를 꾸미는 부사 politely.',
       '주어 it 이 3인칭 단수이고 abandons 와 병렬이므로 argues.']],
    [8, 'For those {{1:who/which}} struggle with isolation or anxiety, such interactions {{2:provide/provides}} a sense of security and relief.',
      ['those who ‘~하는 사람들’. 사람을 가리키므로 who.',
       '주어 such interactions 가 복수이므로 provide.']],
    [9, 'Nevertheless, {{1:depending/depend}} too heavily on AI {{2:comes/come}} with significant drawbacks.',
      ['주어 자리이므로 동명사 depending.',
       '동명사 주어는 단수 취급하므로 comes.']],
    [13, 'If individuals {{1:substitute/will substitute}} human relationships with artificial ones, they may lose the chance {{2:to experience/experiencing}} the profound and genuine connections {{3:that/what}} only real people can provide.',
      ['조건의 부사절(If)에서는 미래의 일도 현재시제로 쓴다.',
       'the chance 를 꾸미는 to부정사(~할 기회)이므로 to experience.',
       '선행사 connections 가 있으므로 목적격 관계대명사 that. what 은 선행사를 포함한다.']],
    [15, 'It may help {{1:organize/organizing}} thoughts and reduce loneliness.',
      ['help 는 (to) 동사원형을 목적어로 취하므로 organize. 뒤의 reduce 와도 병렬이다.']],
    [17, 'Human growth {{1:occurs/is occurred}} through real experiences – {{2:including/included}} conflicts, reconciliation, and emotional sharing.',
      ['occur(일어나다)는 자동사라 수동태로 쓸 수 없다.',
       '‘~을 포함하여’는 전치사처럼 쓰이는 including.']],
    [18, 'These challenges teach us how {{1:to build/build}} trust, express love, and support {{2:one another/each others}} in meaningful ways.',
      ['「how + to부정사」 ‘~하는 방법’이므로 to build.',
       '‘서로’는 one another(또는 each other). each others 라는 형태는 없다.']],
    [21, 'Using AI wisely means {{1:recognizing/to recognize}} its limits and {{2:pursuing/pursue}} authentic growth through human connection, rather than retreating into isolation with machines.',
      ['mean -ing 는 ‘~을 의미하다’, mean to-v 는 ‘~할 작정이다’. 여기서는 ‘의미하다’이므로 recognizing.',
       'and 로 recognizing 과 병렬되므로 pursuing.']],
  ],
  V: [
    [1, 'In the modern era, artificial intelligence (AI) is {{1:increasingly/rarely}} woven into our daily lives.',
      ['AI 가 일상에 ‘점점 더’(increasingly) 스며들고 있다. rarely 는 ‘거의 ~않는’.']],
    [2, 'Many individuals engage in conversations with AI chatbots when they experience {{1:loneliness/excitement}}, stress, or simply want someone who will listen to them.',
      ['stress 와 나란히 오는 부정적 감정, ‘외로움’(loneliness)이다.']],
    [3, 'These systems are constantly {{1:accessible/unavailable}}, free from {{2:judgment/kindness}}, and appear to {{3:empathize/argue}} with human emotions.',
      ['언제나 ‘이용할 수 있다’(accessible). unavailable 은 ‘이용할 수 없는’.',
       '‘판단(평가)’(judgment)이 없다. free from kindness 는 장점이 될 수 없다.',
       '인간의 감정에 ‘공감하는’(empathize) 것처럼 보인다.']],
    [4, 'Consequently, some users even begin to perceive AI as a close {{1:companion/stranger}}, or, in certain cases, as a romantic partner.',
      ['close 와 어울리는 ‘동반자’(companion). stranger 는 ‘낯선 사람’.']],
    [6, 'Building {{1:genuine/artificial}} human relationships can be {{2:complicated/simple}}, requiring effort, communication, and the risk of rejection or conflict.',
      ['‘진정한’(genuine) 인간관계이다. artificial 은 ‘인공적인’.',
       '노력과 거절의 위험이 따르므로 ‘복잡하다’(complicated).']],
    [7, 'By contrast, interacting with AI is {{1:effortless/exhausting}}: it responds politely, listens {{2:attentively/carelessly}}, and never {{3:abandons/supports}} them or argues.',
      ['By contrast 로 앞 문장(복잡함)과 대조되므로 ‘힘들지 않은’(effortless).',
       '‘주의 깊게’(attentively) 들어 준다.',
       'never 뒤이므로 ‘버리다’(abandons)가 장점이 된다.']],
    [8, 'For those who struggle with {{1:isolation/popularity}} or anxiety, such interactions provide a sense of {{2:security/danger}} and relief.',
      ['anxiety 와 나란히 오는 어려움, ‘고립’(isolation).',
       'relief 와 함께 ‘안정감’(security)을 준다.']],
    [9, 'Nevertheless, depending too heavily on AI comes with significant {{1:drawbacks/benefits}}.',
      ['Nevertheless 로 흐름이 바뀌어 ‘단점’(drawbacks)을 말한다.']],
    [10, 'Most importantly, AI {{1:lacks/possesses}} authentic emotions.',
      ['AI 에게는 진정한 감정이 ‘없다’(lacks). possess 는 ‘가지다’.']],
    [12, 'Its {{1:apparent/genuine}} understanding is merely a {{2:simulation/reality}} based on programmed data.',
      ['‘겉으로 보이는’(apparent) 이해일 뿐이다. genuine 은 앞뒤 흐름과 모순된다.',
       '프로그래밍된 데이터에 기반한 ‘모방’(simulation)이다.']],
    [13, 'If individuals substitute human relationships with {{1:artificial/real}} ones, they may lose the chance to experience the {{2:profound/shallow}} and genuine connections that only real people can provide.',
      ['인간관계를 ‘인공적인’(artificial) 관계로 대체하는 경우이다.',
       '실제 사람만 줄 수 있는 ‘깊은’(profound) 유대이다. shallow 는 ‘얕은’.']],
    [17, 'Human growth occurs through real experiences – including conflicts, {{1:reconciliation/separation}}, and emotional sharing.',
      ['갈등 뒤의 ‘화해’(reconciliation)를 통해 성장한다. separation 은 ‘분리’.']],
    [20, 'While AI may offer convenience and comfort, the most memorable and {{1:transformative/ordinary}} moments in life emerge from {{2:real/virtual}} relationships – with all their joys and difficulties.',
      ['memorable 과 나란히 오는 긍정적 의미, ‘변화시키는’(transformative).',
       '‘실제’(real) 관계에서 나온다는 것이 글의 핵심이다. virtual 은 ‘가상의’.']],
  ],
  F: [
    [1, ['modern', 'artificial', 'intelligence', 'woven']],
    [3, ['constantly', 'accessible', 'judgment', 'empathize']],
    [4, ['perceive', 'companion', 'romantic']],
    [6, ['genuine', 'complicated', 'rejection', 'conflict']],
    [7, ['contrast', 'effortless', 'attentively', 'abandons']],
    [8, ['struggle', 'isolation', 'anxiety', 'security']],
    [9, ['depending', 'heavily', 'significant', 'drawbacks']],
    [12, ['apparent', 'merely', 'simulation', 'programmed']],
    [13, ['substitute', 'artificial', 'profound']],
    [14, ['certainly', 'valuable', 'particularly']],
    [17, ['growth', 'reconciliation', 'sharing']],
    [20, ['convenience', 'memorable', 'transformative', 'emerge']],
    [21, ['wisely', 'recognizing', 'pursuing', 'retreating']],
  ],
  KO: [2, 4, 6, 7, 8, 13, 14, 17, 20, 21],
  J: [3, 5, 9, 10, 11, 12, 15, 16, 18, 19],
  S: [1, 4, 5, 8, 10, 11, 12, 15, 18, 19],
  M: [['grammar', 4], ['vocab', 5], ['fill', 6], ['ko', 3], ['jumble', 2], ['sent', 7], ['grammar', 10], ['vocab', 11]],
});
