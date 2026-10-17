#!/usr/bin/env node
/* ===================================================================
 * 목일중3 추가지문(EX · EX2) — 변형문제 저작
 * ===================================================================
 * data/{EXV,EX2V}/1-variant.json 생성. 직접 JSON 을 고치지 말고 여기서 고친다.
 * 스키마: variant-v0.3-type-grouped (_oneoff-봉영여중3-비상김/_author-EXV-variant.mjs 와 동일)
 *
 * 정답 분포(객관식 11문항 × 2권)
 *   EXV : ①2 ②2 ③3 ④2 ⑤2   EX2V: ①2 ②2 ③2 ④2 ⑤3   → 합계 ①4 ②4 ③5 ④4 ⑤5
 * ⚠️ summary.options[].no 는 배열 위치(1..5)와 반드시 같게 — 렌더러가 no 로 ①~⑤ 를 찍는다.
 * ⚠️ blank_sentence_index 는 0-based, 그 문장에 ___ 가 있어야 한다.
 * ⚠️ 따옴표는 곱슬따옴표(“ ” ‘ ’)만 — 직선따옴표는 PDF 에서 빈칸처럼 렌더된다.
 * =================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const NUM = ['①', '②', '③', '④', '⑤'];
const ORDER = ['(A) - (B) - (C)', '(A) - (C) - (B)', '(B) - (A) - (C)', '(B) - (C) - (A)', '(C) - (A) - (B)'];
const BLANK = '______________________';

const ul = (list) => list.map(([sent_index, text, fix], i) => (fix
  ? { no: i + 1, sent_index, text, correct: false, fix }
  : { no: i + 1, sent_index, text, correct: true }));
const summaryOpts = (pairs) => pairs.map(([A, B], i) => ({ no: i + 1, A, B }));

function write(lesson, topic_ko, bt) {
  const DIR = path.join(HERE, 'data', lesson);
  const data = JSON.parse(fs.readFileSync(path.join(DIR, '1.json'), 'utf8'));
  const ko = (r) => data.passage_ko[r - 1];
  const en = (r) => data.passage[r - 1];
  // 서술형 번역·배열은 원문 문장을 쓰므로 여기서 채운다
  for (const w of bt.writing) {
    if (w.ref) {
      if (w.subtype === 'word_order') {
        w.answer = en(w.ref);
        w.ko_prompt = ko(w.ref);
        w.words = en(w.ref).split(/\s+/).map(t => t.replace(/[,.!?:;”“]/g, '')).filter(Boolean)
          .map((t, i) => (i === 0 && t !== 'AI' ? t.toLowerCase() : t));
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
    $ref_source: '1.json',
    passage_id: 1,
    topic_ko,
    by_type: bt,
  };
  fs.writeFileSync(path.join(DIR, '1-variant.json'), JSON.stringify(out, null, 2) + '\n', 'utf8');
  const ans = Object.entries(bt).filter(([k]) => k !== 'writing').map(([k, v]) => `${k}${NUM[v.answer - 1]}`);
  console.log(`✓ ${lesson}/1-variant.json  ${ans.join(' ')} · 서술형 ${bt.writing.length}`);
}

/* ═══════════════════════ EX. Lee Suji’s Comedy ═══════════════════════ */
const EX_A = [
  'Comedian Lee Suji makes funny videos that make fun of everyday trends in Korea.',
  'In one of them, she plays an influencer who sells an ordinary ceramic cup as a “face slimming tool” at a ridiculous price.',
  'Her fans buy it right away simply because someone they admire recommends it.',
  'This shows conformity bias, the habit of copying others without thinking.',
  'In another video, she jokes about parents who send their children to hakwons even to learn how to use the bathroom.',
  'This reflects social comparison, the habit of measuring ourselves against others.',
  'By laughing at these extreme situations, viewers can see the same habits in their own lives.',
  'Her humor gently pushes them to make wiser choices about what they buy and how they live.',
];
const EX_B = [
  'Why do people buy things just because everyone else does?',
  'Comedian Lee Suji answers this question with laughter.',
  'Her videos show followers rushing to buy an ordinary cup that an influencer praises, and parents who send their children to hakwons for even the simplest skills.',
  'The first case is an example of conformity bias, and the second is an example of social comparison.',
  'Both habits come from social pressure, and both can lead to wasted money or stressed children.',
  'Lee does not lecture her viewers or criticize them directly.',
  'Instead, she lets them laugh at exaggerated versions of themselves.',
  'As they laugh, they begin to question the pressures that shape their own choices.',
];
write('EXV', '이수지의 코미디 — 유머로 동조 편향과 사회적 비교, 사회적 압력을 돌아보게 한다', {
  theme: {
    passage: EX_A,
    choices: [
      'the dangers of spending too much time watching online comedy videos',
      'practical ways parents can help their children do well at school',
      'how comedy reveals the social pressures behind our everyday choices',
      'the reasons influencers sell ordinary products at very high prices',
      'the history of popular comedy programs on Korean television',
    ],
    answer: 3,
    explanation_ko: '이수지의 코미디가 동조 편향과 사회적 비교를 과장해 보여 주며 우리의 선택 뒤에 있는 사회적 압력을 깨닫게 한다는 내용이므로 ③이 주제이다.',
    distractor_ko: '① 영상 시청의 위험은 다루지 않는다. ② 학부모의 교육 방법이 아니라 과열된 교육을 풍자한다. ④ 인플루언서는 예시 속 소재일 뿐이다. ⑤ 코미디의 역사는 나오지 않는다.',
  },
  gist: {
    passage: EX_B,
    choices: [
      '유머는 사회적 압력에 따른 행동을 스스로 돌아보게 하는 효과적인 방법이 될 수 있다.',
      '인플루언서가 추천하는 제품은 품질을 믿고 구매해도 된다.',
      '자녀의 성공을 위해서는 어릴 때부터 학원 교육이 꼭 필요하다.',
      '코미디는 사회 문제를 비판할 때 날카롭고 직설적이어야 한다.',
      '다른 사람과 자신을 비교하는 습관은 성장의 원동력이 된다.',
    ],
    answer: 1,
    explanation_ko: '직접 비판하지 않고 과장된 모습을 보며 웃게 해서, 사람들이 자신의 선택을 형성하는 압력에 의문을 갖게 한다는 내용이므로 ①이 요지이다.',
    distractor_ko: '② 오히려 인플루언서 말만 믿고 사는 행동을 풍자한다. ③ 과도한 학원 교육은 풍자의 대상이다. ④ 이수지는 직접 비판하지 않는다(does not … criticize them directly). ⑤ 비교 습관은 건강하지 못한 행동으로 이어진다.',
  },
  title: {
    passage: EX_A,
    choices: [
      'How to Become a Famous Comedian on Social Media',
      'Ceramic Cups: A Secret Tool for a Slimmer Face',
      'Why Korean Parents Love Hakwons So Much',
      'Laughing at Ourselves: Comedy That Exposes Social Pressure',
      'The Rise and Fall of Online Influencers',
    ],
    answer: 4,
    explanation_ko: '우리 자신의 모습을 보고 웃게 하여 사회적 압력을 드러내는 코미디를 다루므로 ④가 제목으로 알맞다.',
    distractor_ko: '① 유명 코미디언이 되는 법은 나오지 않는다. ② ‘얼굴 갸름하게 하는 도구’는 풍자 속 가짜 광고이다. ③ 학원 선호의 이유를 분석하는 글이 아니다. ⑤ 인플루언서의 흥망은 다루지 않는다.',
  },
  implication: {
    passage: [
      'Lee Suji’s videos look like simple jokes at first.',
      'She acts as an influencer who sells a plain cup as a beauty tool, and her followers buy it without a second thought.',
      'She also plays parents who send their children to hakwons for every little skill.',
      'These scenes are so exaggerated that viewers burst out laughing.',
      'But the laughter soon turns into recognition.',
      'Many viewers realize that they, too, follow trends blindly or compare themselves to others.',
      'In this way, her comedy works as a mirror held up to the audience.',
      'It makes people think more carefully about their own choices.',
    ],
    underlined: 'a mirror held up to the audience',
    choices: [
      'a way to advertise beauty products to young viewers',
      'a way to help viewers see their own habits and behavior',
      'a way to make fun of people who live in one rich area',
      'a way to show viewers how to become famous online',
      'a way to hide the problems of Korean society from viewers',
    ],
    answer: 2,
    explanation_ko: '거울은 보는 사람 자신을 비춘다. 시청자들이 웃다가 자신도 유행을 맹목적으로 따르거나 남과 비교한다는 것을 깨닫게 된다는 뜻이므로 ②가 알맞다.',
    distractor_ko: '① 제품 광고가 아니라 광고를 풍자한다. ③ 특정 지역 사람을 조롱하는 것이 목적이 아니다. ④ 유명해지는 법은 무관하다. ⑤ 오히려 사회의 문제를 드러낸다.',
  },
  grammar: {
    passage: [
      'Korean comedian Lee Suji has become famous for making funny videos about popular trends.',
      'By making ordinary behaviors look silly, she helps people think about why they follow them.',
      'In one video, she plays an influencer selling a regular cup at a very high price.',
      'Her followers buy it quickly just because someone they like says it works.',
      'This is an example of conformity bias, which means copying others without thinking.',
      'In another video, she jokes about parents who send their children to hakwons for everything.',
      'This shows social comparison, the habit of comparing ourselves to others.',
      'Her comedy encourages people question the social pressures that affect their choices.',
    ],
    underlines: ul([
      [0, 'has become'],
      [1, 'look silly'],
      [2, 'selling'],
      [4, 'which means'],
      [7, 'encourages people question', 'encourages people to question'],
    ]),
    choices: NUM,
    answer: 5,
    explanation_ko: 'encourage 는 「encourage + 목적어 + to부정사」 구조로 쓰므로 encourages people question 은 encourages people to question 이 되어야 한다.',
    distractor_ko: '① 현재완료 has + 과거분사 become. ② 사역동사 make + 목적어 + 동사원형(look) + 형용사 보어(silly). ③ 인플루언서가 컵을 ‘파는’ 능동이므로 현재분사 selling. ④ 앞의 conformity bias 를 보충 설명하는 계속적 용법 which 와 단수 동사 means.',
  },
  vocab: {
    passage: [
      'Lee Suji’s comedy shows how social pressure shapes our behavior.',
      'In one video, followers rush to buy an ordinary cup simply because an influencer they like praises it.',
      'This is conformity bias: people copy others without thinking for themselves.',
      'In another video, parents send their children to hakwons for even the most basic skills.',
      'Her exaggeration shows how relaxed schooling has become in Korean society.',
      'Both habits can lead to unhealthy results, such as wasting money or pushing children too hard.',
      'Instead of criticizing people, Lee uses humor to make them laugh at themselves.',
      'This helps viewers question the pressures that affect their choices.',
    ],
    underlines: ul([
      [1, 'ordinary'],
      [2, 'copy'],
      [4, 'relaxed', 'competitive'],
      [5, 'unhealthy'],
      [7, 'question'],
    ]),
    choices: NUM,
    answer: 3,
    explanation_ko: '기본적인 기술까지 학원에 보내는 모습을 과장한 것은 교육이 얼마나 ‘경쟁적’이 되었는지를 보여 주므로 relaxed(느긋한)는 competitive 가 되어야 한다.',
    distractor_ko: '① 평범한 컵을 특별한 도구처럼 판다. ② 동조 편향은 남을 ‘따라 하는’ 것이다. ④ 돈 낭비·아이 몰아붙이기는 ‘건강하지 못한’ 결과이다. ⑤ 압력에 ‘의문을 갖게’ 돕는다.',
  },
  blank: {
    passage: [
      'Lee Suji’s comedy videos have made millions of people laugh.',
      'In one, an influencer sells a plain cup as a “face slimming tool,” and her followers buy it without asking any questions.',
      'In another, parents send their children to hakwons to learn even how to use the bathroom.',
      'These scenes are funny because they are extreme.',
      'Yet viewers soon notice that the same habits exist in their own lives.',
      `In this way, her humor helps people ${BLANK}.`,
      'Without any harsh criticism, she gets her audience to rethink their choices.',
      'Laughter, it seems, can teach as well as entertain.',
    ],
    blank_sentence_index: 5,
    blank_target: BLANK,
    choices: [
      'recognize the social pressures behind their own behavior',
      'find the cheapest beauty products on the market',
      'choose the best hakwons for their children',
      'become popular comedians on social media',
      'avoid watching videos that make fun of others',
    ],
    answer: 1,
    explanation_ko: '극단적인 장면에 웃다가 같은 습관이 자기 삶에도 있음을 알아차리고 선택을 다시 생각하게 되므로, 유머는 ‘자기 행동 뒤에 있는 사회적 압력을 인식하도록’ 돕는다.',
    distractor_ko: '② 싼 제품 찾기, ③ 좋은 학원 고르기, ④ 코미디언 되기는 글의 흐름과 무관하다. ⑤ 남을 놀리는 영상을 피하라는 내용은 없다.',
  },
  irrelevant: {
    intro: 'Comedian Lee Suji uses humor to show how social pressure influences what people do.',
    sentences: [
      'In one video, her followers buy an ordinary cup just because an influencer they like recommends it.',
      'This scene shows conformity bias, the tendency to copy others without thinking.',
      'In another video, she jokes about parents who send their children to hakwons for everything.',
      'Ceramic cups keep drinks warm much longer than paper cups do.',
      'By laughing at these exaggerated scenes, viewers begin to question their own choices.',
    ],
    choices: NUM,
    answer: 4,
    explanation_ko: '④는 도자기 컵의 보온 성능에 관한 내용으로, 유머로 사회적 압력을 돌아보게 한다는 글의 흐름과 무관하다.',
    distractor_ko: '①② 동조 편향의 예와 설명, ③ 사회적 비교의 예, ⑤ 코미디의 효과로 모두 흐름에 맞다.',
  },
  order: {
    given: 'Korean comedian Lee Suji has become popular by making funny videos about Korean trends. Her comedy shows two important ideas from psychology.',
    blocks: {
      A: 'The second is social comparison, the habit of comparing ourselves to others. She jokes about parents who send their children to hakwons even to learn basic life skills.',
      B: 'Although these two ideas affect different areas of life, both show how social pressure shapes our behavior. By laughing at them, viewers learn to think more carefully about their own choices.',
      C: 'The first is conformity bias, or copying others without thinking. In one video, her followers buy an ordinary cup for a high price just because an influencer they like says it works.',
    },
    choices: ORDER,
    answer: 5,
    explanation_ko: '두 가지 개념 소개(주어진 글) → The first 로 동조 편향(C) → The second 로 사회적 비교(A) → these two ideas 로 둘을 묶어 정리(B) 순이다.',
    distractor_ko: '(C)의 The first 와 (A)의 The second 는 주어진 글의 two important ideas 를 차례로 받고, (B)의 these two ideas 는 두 개념이 모두 나온 뒤에야 쓸 수 있으므로 맨 끝이다.',
  },
  insert: {
    insert_sentence: 'Her followers buy it right away, just because the influencer they like says it works.',
    passage_marked: [
      { text: 'Lee Suji’s comedy shows two ideas from psychology, and the first is conformity bias.', slot_after: 1 },
      { text: 'In one video, she plays an influencer who sells an ordinary ceramic cup as a “face slimming tool” at a very high price.', slot_after: 2 },
      { text: 'This blind copying of others is exactly what conformity bias means.', slot_after: 3 },
      { text: 'The second idea, social comparison, appears in her jokes about parents in Daechi-dong.', slot_after: 4 },
      { text: 'They send their children to hakwons for everything, even for using the bathroom.', slot_after: 5 },
    ],
    choices: NUM,
    answer: 2,
    explanation_ko: '주어진 문장의 it 은 인플루언서가 파는 도자기 컵을 가리키고, 그 뒤 문장의 This blind copying(이 맹목적인 따라 하기)은 팔로워들이 산 행동을 받으므로 ②에 들어간다.',
    distractor_ko: '① 앞에는 it 이 가리킬 컵이 없다. ③ This blind copying 이 가리킬 행동이 먼저 나와야 한다. ④⑤ 사회적 비교(대치동 부모) 이야기 속이라 흐름이 끊긴다.',
  },
  summary: {
    passage: EX_B,
    summary_template: 'Through humor that __(A)__ everyday behaviors, Lee Suji helps viewers recognize the social __(B)__ that shapes their choices.',
    options: summaryOpts([
      ['praises', 'freedom'],
      ['ignores', 'pressure'],
      ['exaggerates', 'pressure'],
      ['exaggerates', 'freedom'],
      ['criticizes', 'education'],
    ]),
    answer: 3,
    explanation_ko: '일상의 행동을 과장한(exaggerates) 유머로 선택을 형성하는 사회적 압력(pressure)을 깨닫게 한다는 요약이다.',
    distractor_ko: '① 행동을 칭찬하지 않는다. ② 행동을 무시하지 않고 과장한다. ④ 깨닫게 하는 것은 자유가 아니라 압력이다. ⑤ 이수지는 직접 비판하지 않고, 교육은 두 사례 중 하나일 뿐이다.',
  },
  writing: [
    {
      subtype: 'word_order', subtype_label: '배열 영작', ref: 9,
      question: '다음 우리말과 같은 뜻이 되도록 <보기>의 단어를 모두 배열하여 영작하시오.',
      explanation_ko: '접속사 when 뒤에 「주어 + 동사」가 오고, 주어 people 과 목적어가 같으므로 재귀대명사 themselves 를 쓴다(compare A to B).',
    },
    {
      subtype: 'conditioned_write', subtype_label: '조건 영작', ref: 7,
      question: '다음 조건에 맞게 우리말을 영작하시오.',
      conditions: ['just because 를 사용할 것', '목적격 관계대명사를 생략하여 the influencer 를 수식할 것', '총 14단어로 쓸 것'],
      explanation_ko: 'because 뒤 절의 주어는 the influencer(단수)이므로 says 를 쓰고, they like 가 목적격 관계대명사 없이 the influencer 를 꾸민다.',
    },
    {
      subtype: 'fill_blank', subtype_label: '빈칸 완성', show_passage: true,
      question: '본문의 내용에 맞게 빈칸에 알맞은 한 단어를 쓰시오.',
      context: 'Conformity bias makes people follow trends without ___________ them, while social comparison creates pressure to outdo others.',
      answer: 'questioning',
      explanation_ko: '전치사 without 뒤에는 동명사가 오므로 question 의 -ing 형 questioning(의문을 갖다)을 쓴다.',
    },
    {
      subtype: 'translate_ko', subtype_label: '우리말 해석', ref: 17,
      question: '다음 문장을 우리말로 해석하시오.',
      explanation_ko: 'Using humor 는 능동 분사구문, 「encourage + 목적어 + to부정사」, what 과 how 가 이끄는 두 명사절이 affect 의 목적어로 병렬된다.',
    },
    {
      subtype: 'summary_word', subtype_label: '요약문 완성', show_passage: true,
      question: '본문을 한 문장으로 요약할 때 빈칸 (A), (B)에 들어갈 단어를 본문에서 찾아 쓰시오.',
      summary: 'Lee Suji’s comedy shows conformity bias and social __(A)__ theory, and both show how social __(B)__ influences our behavior.',
      answer_a: 'comparison', answer_b: 'pressure',
      explanation_ko: '본문 8번 문장의 social comparison theory, 13번 문장의 how social pressure influences our behavior 에서 찾는다.',
    },
    {
      subtype: 'topic_write', subtype_label: '주제문 쓰기',
      question: '다음 조건에 맞게 이 글의 주제문을 영어로 쓰시오.',
      ko_prompt: '이 글의 주제를 한 문장으로 쓰시오.',
      conditions: ['humor 와 social pressure 를 반드시 포함할 것', '15단어 내외의 완전한 문장으로 쓸 것'],
      answer: 'Lee Suji’s comedy uses humor to help people notice how social pressure affects their behavior.',
      explanation_ko: '유머라는 수단과 사회적 압력을 깨닫게 한다는 효과를 한 문장에 담는다.',
    },
  ],
});

/* ═══════════════════════ EX2. AI and Human Connection ═══════════════════════ */
const EX2_A = [
  'Today, many people talk to AI chatbots when they feel lonely or stressed.',
  'These programs are always available, never judge, and seem to understand our feelings.',
  'Some users even start to see AI as a close friend or a romantic partner.',
  'It is easy to see why, since real relationships take effort and can lead to conflict.',
  'However, AI has no real emotions, and its understanding is only a simulation.',
  'People who replace human relationships with AI may miss out on deep connections.',
  'AI can be a useful tool for organizing thoughts or practicing conversation, but it should not replace real people.',
  'True growth comes from sharing our lives with others, including the difficult moments.',
];
const EX2_B = [
  'When people feel lonely, an AI chatbot can seem like the perfect listener.',
  'It is polite, patient, and available at any hour.',
  'Human relationships, on the other hand, are complicated and sometimes painful.',
  'Still, AI cannot truly feel love, sadness, or pain.',
  'Its kindness is only a program running on data.',
  'We grow when we work through conflicts, make up with friends, and share real emotions.',
  'So AI may comfort us for a while, but it cannot give us that kind of growth.',
  'We should use it as a tool, not as a substitute for people.',
];
write('EX2V', 'AI는 도구일 뿐 — 정서적 위안은 줄 수 있어도 진정한 인간관계와 성장을 대신할 수 없다', {
  theme: {
    passage: EX2_A,
    choices: [
      'the latest technologies used to build AI chatbots',
      'ways to avoid conflict in close human relationships',
      'reasons why AI will soon understand human emotions',
      'the limits of AI as a replacement for human relationships',
      'how loneliness affects people’s physical health',
    ],
    answer: 4,
    explanation_ko: '사람들이 AI 에게서 위안을 찾지만 AI 에게는 진짜 감정이 없어 인간관계를 대신할 수 없다는 내용이므로 ④가 주제이다.',
    distractor_ko: '① 챗봇 기술은 다루지 않는다. ② 갈등을 피하는 법이 아니라 갈등도 성장의 일부라고 본다. ③ AI 의 이해는 모방일 뿐이라고 했다. ⑤ 외로움과 신체 건강의 관계는 나오지 않는다.',
  },
  gist: {
    passage: EX2_B,
    choices: [
      'AI 챗봇은 사람보다 더 정확하게 감정을 이해한다.',
      'AI는 유용한 도구일 뿐, 진정한 인간관계를 대신할 수 없다.',
      '외로움을 해결하려면 새로운 기술을 적극 활용해야 한다.',
      '인간관계의 갈등은 가능한 한 피하는 것이 바람직하다.',
      'AI 챗봇 사용은 청소년에게 금지되어야 한다.',
    ],
    answer: 2,
    explanation_ko: 'AI 는 위안을 줄 수 있지만 진짜 감정이 없어 인간관계가 주는 성장을 줄 수 없으므로, 사람의 대체물이 아닌 도구로 써야 한다는 ②가 요지이다.',
    distractor_ko: '① AI 의 친절은 데이터로 돌아가는 프로그램일 뿐이다. ③ 기술 활용을 권하는 글이 아니다. ④ 갈등을 겪어 내며 성장한다고 했다. ⑤ 사용 금지를 주장하지 않는다.',
  },
  title: {
    passage: EX2_A,
    choices: [
      'How to Build Your Own AI Chatbot',
      'Loneliness: A Disease of the Modern Era',
      'Why AI Will Soon Have Real Feelings',
      'The Secret to Avoiding Conflict with Friends',
      'A Helpful Tool, Not a True Friend: The Limits of AI',
    ],
    answer: 5,
    explanation_ko: 'AI 는 생각 정리나 대화 연습에 유용한 도구이지만 진짜 친구(인간관계)를 대신할 수 없다는 내용이므로 ⑤가 제목으로 알맞다.',
    distractor_ko: '① 챗봇 제작법은 나오지 않는다. ② 외로움은 AI 를 찾는 계기일 뿐 중심 내용이 아니다. ③ AI 에게는 진짜 감정이 없다고 했다. ④ 갈등을 피하는 비결은 다루지 않는다.',
  },
  implication: {
    passage: [
      'Many people turn to AI chatbots when they feel lonely.',
      'The chatbots always answer politely and never argue.',
      'They seem to understand every feeling users share.',
      'But this understanding is only a simulation based on programmed data.',
      'AI cannot truly feel joy, sorrow, or pain.',
      'In a sense, talking to it is like talking to an echo.',
      'You hear a kind voice, but no one is really there.',
      'Real connection requires another person who can truly feel with you.',
    ],
    underlined: 'talking to an echo',
    choices: [
      'getting answers that come from no real feelings',
      'having a conversation that is too loud to hear',
      'speaking with many people at the same time',
      'hearing the same words again and again',
      'arguing with someone who disagrees with you',
    ],
    answer: 1,
    explanation_ko: '메아리처럼 친절한 목소리는 들리지만 실제로 느끼는 존재는 없다는 뜻이다. AI 의 대답에는 진짜 감정이 없다는 ①이 알맞다.',
    distractor_ko: '② 소리의 크기와는 무관하다. ③ 여러 사람과의 대화가 아니다. ④ 메아리의 글자 그대로의 뜻(같은 말의 반복)이지만, 바로 뒤 no one is really there 가 감정 없는 대답임을 밝힌다. ⑤ AI 는 결코 말다툼하지 않는다.',
  },
  grammar: {
    passage: [
      'Artificial intelligence is increasingly woven into our daily lives.',
      'Many people talk to AI chatbots when they feel lonely or want someone to listen.',
      'These chatbots are always available and appear to understand human emotions.',
      'Building real relationships can be difficult, since it requires effort and the risk of conflict.',
      'By contrast, interact with AI is easy, because it never argues or leaves.',
      'However, AI lacks real emotions, and its understanding is merely a simulation.',
      'People who depend too much on AI may lose the chance to build deep connections.',
      'It is important to remember that AI is a tool, not a substitute for people.',
    ],
    underlines: ul([
      [0, 'woven'],
      [2, 'appear to understand'],
      [4, 'interact', 'interacting'],
      [6, 'who depend'],
      [7, 'to remember'],
    ]),
    choices: NUM,
    answer: 3,
    explanation_ko: '문장의 주어 자리에는 동사원형이 올 수 없으므로 interact 는 동명사 interacting 이 되어야 한다(동명사 주어는 단수 취급 → is).',
    distractor_ko: '① AI 가 일상에 ‘엮여 드는’ 수동이므로 be + 과거분사 woven. ② 복수 주어 These chatbots + appear + to부정사. ④ 선행사 People(복수)를 받는 주격 관계대명사 who + depend. ⑤ 가주어 It ~ 진주어 to remember.',
  },
  vocab: {
    passage: [
      'Many people find comfort in AI chatbots, which seem patient and kind.',
      'Building real human relationships can be simple, requiring effort, communication, and the risk of conflict.',
      'By contrast, AI responds politely and never argues.',
      'However, AI lacks authentic emotions.',
      'Its understanding is merely a simulation based on programmed data.',
      'People who replace friends with AI may lose the chance to form deep connections.',
      'Real growth comes through conflict, reconciliation, and shared emotions.',
      'AI should be a tool, not a substitute for people.',
    ],
    underlines: ul([
      [1, 'simple', 'complicated'],
      [2, 'politely'],
      [3, 'lacks'],
      [4, 'simulation'],
      [6, 'reconciliation'],
    ]),
    choices: NUM,
    answer: 1,
    explanation_ko: '노력·소통·갈등의 위험이 필요하다고 했고 뒤 문장이 By contrast 로 AI 와의 쉬운 관계를 대조하므로, simple(간단한)은 complicated(복잡한)가 되어야 한다.',
    distractor_ko: '② AI 는 ‘공손하게’ 응답한다. ③ AI 에게는 진정한 감정이 ‘없다’. ④ AI 의 이해는 데이터에 기반한 ‘모방’이다. ⑤ 갈등 뒤의 ‘화해’를 통해 성장한다.',
  },
  blank: {
    passage: [
      'More and more people share their worries with AI chatbots.',
      'The chatbots are always available and never judge, so talking to them feels safe.',
      'But AI cannot truly feel love, sorrow, or pain.',
      'Its understanding is only a program built on data.',
      'Real friends, on the other hand, sometimes disagree with us, hurt us, and then make up with us.',
      'These difficult moments teach us how to trust and support one another.',
      `That is why AI should ${BLANK}.`,
      'We need real people to grow.',
    ],
    blank_sentence_index: 6,
    blank_target: BLANK,
    choices: [
      'be banned from schools and workplaces',
      'learn to feel emotions like humans',
      'replace friends who often disagree with us',
      'become our main source of comfort',
      'remain a tool, not a replacement for people',
    ],
    answer: 5,
    explanation_ko: 'AI 는 진짜 감정이 없고, 우리는 실제 친구와의 어려운 순간을 통해 신뢰와 지지를 배우므로 AI 는 ‘사람의 대체물이 아닌 도구로 남아야’ 한다.',
    distractor_ko: '① 금지를 주장하지 않는다. ② AI 가 감정을 배워야 한다는 내용이 아니다. ③④ 글의 주장과 정반대이다.',
  },
  irrelevant: {
    intro: 'Many people today turn to AI chatbots for emotional comfort.',
    sentences: [
      'The chatbots are available at any time and never judge or argue.',
      'Some chatbots can also translate text into dozens of foreign languages.',
      'However, AI cannot truly feel love, sorrow, or pain like humans.',
      'Its apparent understanding is only a simulation based on data.',
      'For this reason, AI should support human relationships, not replace them.',
    ],
    choices: NUM,
    answer: 2,
    explanation_ko: '②는 챗봇의 번역 기능에 관한 내용으로, AI 에게서 정서적 위안을 찾는 것의 한계를 다루는 글의 흐름과 무관하다.',
    distractor_ko: '① 사람들이 AI 를 찾는 이유, ③④ AI 의 한계, ⑤ 결론으로 모두 흐름에 맞다.',
  },
  order: {
    given: 'Artificial intelligence is now part of our daily lives, and many people talk to AI chatbots when they feel lonely or stressed.',
    blocks: {
      A: 'Therefore, we should use AI wisely, as a tool and not a substitute. True growth comes only from real human connection, with all its joys and difficulties.',
      B: 'It is easy to understand why. Real relationships require effort and carry the risk of rejection, while AI always responds politely and never argues.',
      C: 'Nevertheless, depending too heavily on AI has serious drawbacks. AI lacks real emotions, and its understanding is merely a simulation.',
    },
    choices: ORDER,
    answer: 4,
    explanation_ko: 'AI 챗봇과 대화하는 사람들(주어진 글) → 그 이유(B) → Nevertheless 로 지나친 의존의 단점(C) → Therefore 로 현명한 사용이라는 결론(A) 순이다.',
    distractor_ko: '(B)의 why 는 주어진 글의 ‘AI 와 대화하는 현상’을 받고, (C)의 Nevertheless 는 (B)의 장점과 대조되며, (A)의 Therefore 는 단점을 근거로 한 결론이므로 맨 끝이다.',
  },
  insert: {
    insert_sentence: 'Most importantly, it lacks authentic emotions and cannot truly feel love or pain.',
    passage_marked: [
      { text: 'Talking to AI chatbots has become a common way to deal with loneliness.', slot_after: 1 },
      { text: 'They are always available, polite, and free from judgment.', slot_after: 2 },
      { text: 'Nevertheless, depending too heavily on AI comes with serious drawbacks.', slot_after: 3 },
      { text: 'Therefore, what looks like sympathy is merely a simulation based on programmed data.', slot_after: 4 },
      { text: 'People who rely only on AI may miss the deep connections that only real people can provide.', slot_after: 5 },
    ],
    choices: NUM,
    answer: 3,
    explanation_ko: '주어진 문장은 Most importantly 로 ‘심각한 단점’의 핵심(진정한 감정이 없음)을 꺼내므로 ③에 들어간다. 뒤 문장의 Therefore(그러므로 공감처럼 보이는 것은 모방일 뿐)는 바로 이 ‘감정이 없다’를 근거로 받는다.',
    distractor_ko: '①② 아직 단점이 나오기 전이라 Most importantly 가 어색하다. ④⑤ 주어진 문장이 빠지면 Therefore 가 근거 없이 단점 소개 문장에 바로 이어져 흐름이 끊긴다.',
  },
  summary: {
    passage: EX2_B,
    summary_template: 'Although AI can offer comfort as a useful __(A)__, it cannot __(B)__ the genuine connections that help humans grow.',
    options: summaryOpts([
      ['companion', 'improve'],
      ['teacher', 'explain'],
      ['judge', 'replace'],
      ['tool', 'destroy'],
      ['tool', 'replace'],
    ]),
    answer: 5,
    explanation_ko: 'AI 는 유용한 도구(tool)로서 위안을 줄 수 있지만, 인간을 성장시키는 진정한 유대를 대신할(replace) 수 없다는 요약이다.',
    distractor_ko: '① AI 는 동반자가 아니라 도구로 써야 한다. ② 가르치거나 설명하는 역할은 나오지 않는다. ③ AI 는 판단하지 않는다(never judge). ④ 유대를 파괴한다는 내용이 아니라 대신할 수 없다는 내용이다.',
  },
  writing: [
    {
      subtype: 'word_order', subtype_label: '배열 영작', ref: 15,
      question: '다음 우리말과 같은 뜻이 되도록 <보기>의 단어를 모두 배열하여 영작하시오.',
      explanation_ko: '「help + (to) 동사원형」에서 organize 와 reduce 가 and 로 병렬된다.',
    },
    {
      subtype: 'conditioned_write', subtype_label: '조건 영작', ref: 9,
      question: '다음 조건에 맞게 우리말을 영작하시오.',
      conditions: ['Nevertheless 로 문장을 시작할 것', '동명사 주어를 사용할 것', 'come with 를 알맞은 형태로 쓸 것'],
      explanation_ko: '동명사 주어 depending too heavily on AI 는 단수 취급하므로 comes with 를 쓴다.',
    },
    {
      subtype: 'fill_blank', subtype_label: '빈칸 완성', show_passage: true,
      question: '본문의 내용에 맞게 빈칸에 알맞은 한 단어를 쓰시오.',
      context: 'Ultimately, it is crucial to remember that AI is merely a ___________, not a substitute for true human connection.',
      answer: 'tool',
      explanation_ko: '본문 14번·19번 문장에서 AI 는 유용한 도구(a valuable tool)일 뿐이라고 했다.',
    },
    {
      subtype: 'translate_ko', subtype_label: '우리말 해석', ref: 13,
      question: '다음 문장을 우리말로 해석하시오.',
      explanation_ko: 'substitute A with B ‘A를 B로 대체하다’, the chance 를 꾸미는 to부정사, 목적격 관계대명사 that 이 connections 를 수식한다.',
    },
    {
      subtype: 'summary_word', subtype_label: '요약문 완성', show_passage: true,
      question: '본문을 한 문장으로 요약할 때 빈칸 (A), (B)에 들어갈 단어를 본문에서 찾아 쓰시오.',
      summary: 'AI may offer __(A)__ and comfort, but it is merely a tool, not a __(B)__ for true human connection.',
      answer_a: 'convenience', answer_b: 'substitute',
      explanation_ko: '본문 20번 문장의 convenience and comfort, 19번 문장의 not a substitute for true human connection 에서 찾는다.',
    },
    {
      subtype: 'topic_write', subtype_label: '주제문 쓰기',
      question: '다음 조건에 맞게 이 글의 주제문을 영어로 쓰시오.',
      ko_prompt: '이 글의 주제를 한 문장으로 쓰시오.',
      conditions: ['tool 과 human relationships 를 반드시 포함할 것', '15단어 내외의 완전한 문장으로 쓸 것'],
      answer: 'AI can be a useful tool, but it can never replace real human relationships.',
      explanation_ko: 'AI 의 유용함(도구)과 한계(인간관계를 대신할 수 없음)를 한 문장에 담는다.',
    },
  ],
});
