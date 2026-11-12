/* 신서중2 미래엔 Lesson 8 Comparing Prices — 본문분석 저작
 * 실행: node _author-L8.mjs  → data/L8/{1..4}.json
 * 해석은 교과서 본문 PDF(8과본문.pdf) 오른쪽 단의 우리말을 문장 단위로 나눠 옮겼다(화자: 엄마/아빠, 아이들 이름은 영문 그대로).
 * 10번 해석만 교과서가 두 문장으로 나눈 것을 영어 한 문장에 맞춰 한 문장으로 합쳤다.
 * 원본에 문제가 없어 type/choices 는 분석지 형식을 위해 새로 붙였다(hide_answer 라 인쇄 안 됨).
 * cards.covers 는 원문 전체 번호로 쓰고, 맨 아래 루프에서 챕터 안 번호로 바꾼다.
 * ⚠️ 낫표·꺾쇠 괄호는 PDF 빈칸 렌더 — 일반 괄호로 쓴다. */
import { writeChapter } from './_author.mjs';
import { SOURCE } from './_SOURCE-L8.js';

const LIGHT = 'natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, true-to-life color, sharp focus';
const NO = '--no people, person, face, hands, text, letters, words, numbers, signage, logo, watermark, golden hour, sunset, dramatic lighting, neon, night, heavy shadows, dark moody grading';

const chapters = [
  /* ── Ch1 코알라 투어 고르기 ─────────────────────────── */
  {
    no: 1, type: '내용일치', answer: 3,
    question: '다음 글의 내용과 일치하는 것은?',
    summary: 'Emily의 가족은 호주에서 일주일 동안 휴가를 보내고 있어요. 오늘 무엇을 할지 이야기하던 중 Nick이 귀여운 코알라를 보고 싶다고 해요. Emily가 안내 데스크에 코알라 투어 정보를 물어보겠다고 하자, 아빠는 그럴 필요 없다며 Smile Tour, Star Tour, Top Tour 세 개의 관광 안내 책자를 보여 줘요. 가족은 어느 투어가 가장 좋을지 살펴보기로 해요.',
    mainIdea: 'While on vacation in Australia, Emily’s family decides to compare three koala tour brochures to find the best one.',
    titleEn: 'Which Koala Tour Is the Best?',
    ko: [
      'Emily의 가족은 호주에서 휴가 중이에요.',
      '그들은 일주일 동안 여행하고 있어요.',
      '그들은 오늘 하루 계획에 대해서 이야기하고 있어요.',
      '엄마: 얘들아, 오늘은 뭐 하고 싶니?',
      'Nick: 저는 코알라를 정말 보고 싶어요.',
      '코알라는 진짜 귀여워요!',
      'Emily: 코알라 투어가 몇 개 있을지도 몰라요.',
      '제가 안내 데스크에 정보를 물어볼까요?',
      '아빠: 그럴 필요 없단다.',
      '여기 Smile Tour, Star Tour, Top Tour, 이렇게 관광 안내 책자 세 개가 있어.',
      '어느 코알라 투어가 우리에게 가장 좋을지 살펴보자.',
    ],
    choices: [
      ['Emily의 가족은 한 달 동안 호주를 여행한다.', '**일주일** 동안 여행한다({for a week}).'],
      ['Emily가 가장 먼저 코알라를 보고 싶다고 말했다.', '코알라를 보고 싶다고 한 사람은 **Nick**이다.'],
      ['아빠는 안내 데스크에 물어볼 필요가 없다고 했다.', '{You don’t have to.} — 이미 **안내 책자 세 개**가 있다. **정답**.'],
      ['가족은 안내 데스크에서 책자를 받아 왔다.', '책자는 **이미 여기에(here)** 있었다. 데스크에 간다는 말은 Emily의 제안일 뿐이다.'],
      ['코알라 투어는 두 종류가 있다.', '**Smile / Star / Top** 세 종류다.'],
    ],
    vocab: [
      'be on vacation|숙|휴가 중이다|be on holiday|—|vacation 휴가(명)',
      'Australia|명|호주|—|—|Australian 호주의',
      'travel|동|여행하다|take a trip|—|traveler 여행자',
      'plan|명|계획|schedule|—|plan 계획하다(동)',
      'koala|명|코알라|—|—|—',
      'cute|형|귀여운|lovely|ugly 못생긴|—',
      'tour|명|투어, 관광|trip|—|tourist 관광객',
      'information|명|정보|—|—|inform 알리다',
      'desk|명|(호텔 등의) 안내 데스크|front desk|—|—',
      'have to|숙|~해야 한다|must|—|—',
      'brochure|명|(안내·광고용) 책자|pamphlet|—|—',
      'which|형|어느, 어떤|what|—|—',
      'the best|형|가장 좋은(good의 최상급)|—|the worst 가장 나쁜|better 더 좋은',
    ],
    flow: [
      ['✈️', '상황 — 호주에서 휴가 중', 'Emily의 가족이 **호주에서 일주일 동안** 여행하며 오늘 계획을 이야기한다.'],
      ['🐨', '바람 — 코알라를 보고 싶다', 'Nick이 **코알라를 보고 싶다**고 하고, Emily는 **코알라 투어**가 있을 거라며 데스크에 물어보자고 한다.'],
      ['📚', '자료 — 안내 책자 세 개', '아빠: 물어볼 **필요 없다** — **Smile / Star / Top Tour** 책자가 이미 있다. (Smile $25/1인·1시간, Star $60/1인·3시간, Top $110/2인·3시간)'],
      ['🔍', '목표 — 가장 좋은 투어 찾기', '**Let’s see which koala tour will be the best** — 세 투어를 비교하는 이야기가 시작된다.'],
    ],
    cards: [
      {
        covers: [1, 2, 3],
        en: 'Emily’s family [g:is on vacation] in Australia. | They [r:are traveling] for a week. | They [r:are talking] about their plans for the day.',
        note: '**해석 도움** — 대화의 배경: **호주 / 일주일 / 오늘 계획**. 이어지는 대화는 무엇을 할지 정하는 장면이다.',
        points: [
          ['grammar', '**현재진행형 be + -ing** — {are traveling / are talking} "~하고 **있다**". 지금 진행 중인 일.'],
          ['grammar', '**family 의 수** — {Emily’s family is} 가족을 한 단위로 보면 단수 동사. 이어지는 {They} 는 가족 구성원들을 가리킨다.'],
          ['vocab', '**be on vacation / for a week** — 휴가 중이다 / 일주일 **동안**({for} + 기간).'],
        ],
      },
      {
        covers: [4, 5, 6],
        en: 'Mom: Guys, | [h:what do you want to do] today? | Nick: I really [g:want to see] koalas. | They’re so cute!',
        note: '**해석 도움** — 엄마가 오늘 하고 싶은 일을 묻고, Nick이 **코알라를 보고 싶다**고 답한다 — 이야기의 출발점.',
        points: [
          ['grammar', '**want to + 동사원형** — "~하고 싶다". {want to do / want to see} — to부정사는 {want} 의 목적어(명사적 용법).'],
          ['vocab', '**Guys** — (여럿을 부를 때) 얘들아, 여러분. 남녀 모두에게 쓴다.'],
          ['vocab', '**so cute** — 정말 귀여운({so} 강조). {They’re} = They are.'],
        ],
      },
      {
        covers: [7, 8],
        en: 'Emily: There [g:may be] some koala tours. | [r:Should I] ask for information | at the desk?',
        note: '**해석 도움** — Emily는 코알라 투어가 **있을지도 모른다**며 안내 데스크에 **물어볼지** 제안한다.',
        points: [
          ['grammar', '**There may be ~** — "~이 **있을지도 모른다**". {may} 는 추측(가능성). There is ~ 구문에 조동사가 들어간 형태.'],
          ['grammar', '**Should I ~?** — "제가 ~**할까요**?" 상대에게 제안하거나 의견을 물을 때 쓴다.'],
          ['vocab', '**ask for information** — 정보를 **요청하다**({ask for} ~을 요청하다). {information} 은 셀 수 없는 명사(informations ×).'],
        ],
      },
      {
        covers: [9, 10, 11],
        tags: ['title'],
        en: 'Dad: You [g:don’t have to]. | There are three tour brochures here: | Smile Tour, Star Tour, and Top Tour. | Let’s see | [h:which koala tour will be the best for us].',
        note: '**해석 도움** — 아빠: 물어볼 **필요 없다** — 책자 세 개가 이미 있다. 이어지는 표(Smile **$25/1인·1시간·시간 선택** / Star **$60/1인·3시간** / Top **$110/2인(pair)·3시간**)가 비교의 자료다.',
        points: [
          ['grammar', '**don’t have to (불필요)** — "~**할 필요 없다**"({= don’t need to}). {must not}(~하면 안 된다, 금지)과 뜻이 다르다. 뒤에 {ask for information at the desk} 가 생략.'],
          ['grammar', '**간접의문문 which + 명사 + 동사** — {see which koala tour will be the best} "어느 투어가 가장 좋을지 (살펴보다)". 의문사 주어라 어순 그대로 {which tour + will be}.'],
          ['vocab', '**콜론(:)** — 앞의 three tour brochures 가 **무엇인지 나열**한다.'],
        ],
      },
    ],
    prompt: `Photorealistic travel still-life photograph, wide banner composition. A bright hotel room table during a family vacation in Australia: an open suitcase, two sun hats, a camera and a small plush koala toy, a large window behind showing green eucalyptus-covered hills and a calm blue bay. ${LIGHT}, eucalyptus green, sand beige and sky blue. ${NO}, calculator, brochure rack, real koala, chart --ar 16:5 --v 8.1 --style raw`,
  },

  /* ── Ch2 같은 시간 기준 ─────────────────────────── */
  {
    no: 2, type: '요지', answer: 5,
    question: '다음 대화에서 Emily와 아빠가 말하려는 바로 가장 적절한 것은?',
    summary: 'Nick은 Smile Tour가 25달러밖에 안 해서 가격이 정말 괜찮아 보인다고 해요. 하지만 Emily는 그건 한 시간 가격이고, 다른 투어들은 모두 3시간짜리라고 짚어요. 아빠도 같은 시간에 대한 가격을 알아내야 한다고 맞장구치고, Nick은 어떻게 알아낼 수 있는지 물어요.',
    mainIdea: 'To compare the tour prices fairly, the family needs to find out the price for the same amount of time.',
    titleEn: 'Compare Prices for the Same Time',
    ko: [
      'Nick: 먼저 제가 가격을 비교해 볼게요.',
      'Smile Tour의 가격이 정말 괜찮아 보여요!',
      '25달러밖에 안 해요.',
      'Emily: 오, 그건 한 시간에 25달러야.',
      '봐, 다른 투어들은 모두 3시간짜리인걸.',
      '아빠: 맞아.',
      '우리는 같은 시간에 대한 가격을 알아내야 해.',
      'Nick: 알겠어요, 그런데 어떻게 알아낼 수 있어요?',
    ],
    choices: [
      ['가장 싼 투어를 고르는 것이 항상 좋다.', '싼 것을 고르자는 게 아니라 **비교 기준**을 맞추자는 이야기다.'],
      ['투어 시간은 짧을수록 좋다.', '시간의 길고 짧음을 평가하지 **않는다**.'],
      ['가격은 안내 데스크에 물어봐야 정확하다.', '데스크 이야기는 1장에서 **필요 없다**고 했다.'],
      ['Smile Tour가 가장 저렴하다.', 'Nick의 첫인상일 뿐 — **1시간 가격**이라 바로 비교할 수 없다.'],
      ['가격은 같은 시간을 기준으로 비교해야 한다.', '{We need to find out the price for the same amount of time} — **정답**.'],
    ],
    vocab: [
      'first|부|먼저, 우선|—|lastly 마지막으로|—',
      'compare|동|비교하다|—|—|comparison 비교',
      'price|명|가격|cost|—|pricey 비싼',
      'look good|숙|좋아 보이다|—|—|—',
      'only|부|겨우, 단지|just|—|only 유일한(형)',
      'look|동|(명령문) 봐, 보다|see|—|—',
      'hour|명|시간, 1시간|—|—|hourly 매시간의',
      'the other|형|(나머지) 다른|—|—|another 또 다른 하나의',
      'need to|숙|~해야 한다|have to|—|need 필요',
      'find out|숙|알아내다|discover|—|—',
      'same|형|같은|equal|different 다른|—',
      'amount|명|양, 액수|quantity|—|—',
    ],
    flow: [
      ['💲', '첫인상 — Smile Tour 가 싸 보인다', 'Nick: Smile Tour는 **25달러밖에** 안 한다!'],
      ['⏱️', '반론 — 그건 1시간 가격', 'Emily: **한 시간에** 25달러다. 다른 투어는 **모두 3시간**짜리다.'],
      ['⚖️', '원칙 — 같은 시간으로 비교', '아빠: **같은 시간(the same amount of time)**에 대한 가격을 알아내야 한다.'],
      ['❓', '질문 — 어떻게?', 'Nick: **어떻게** 알아낼 수 있지? → 다음 장에서 계산이 시작된다.'],
    ],
    cards: [
      {
        covers: [12, 13, 14],
        en: 'Nick: First, [g:let me compare] the prices. | The price of Smile Tour [r:looks] really [r:good]! | It’s [h:only $25].',
        note: '**해석 도움** — Nick은 가격만 보고 Smile Tour가 **가장 싸 보인다**고 판단한다 — 시간 조건을 놓친 성급한 판단.',
        points: [
          ['grammar', '**let me + 동사원형** — "제가 ~**할게요**". 사역동사 {let} + 목적어 + 동사원형(to compare ×).'],
          ['grammar', '**감각동사 look + 형용사** — {looks really good} "정말 **좋아 보이다**"(looks well ×). 주어는 {The price}(단수) → {looks}.'],
          ['vocab', '**only** — 겨우, ~밖에. 가격이 싸다는 느낌을 준다.'],
        ],
      },
      {
        covers: [15, 16],
        en: 'Emily: Oh, it’s $25 [h:for one hour]. | Look, [r:the other] tours are all 3 hours.',
        note: '**해석 도움** — Emily가 문제를 짚는다: 25달러는 **1시간 가격**인데 나머지는 **3시간**이다 — 조건이 달라 바로 비교할 수 없다.',
        points: [
          ['grammar', '**the other + 복수명사** — "(정해진 것 중) **나머지** ~들". 세 투어 중 Smile 을 뺀 **나머지 둘**이라 {the other tours}.'],
          ['grammar', '**be + all + 보어** — {are all 3 hours} "**모두** 3시간이다". {all} 은 be동사 뒤에 온다.'],
          ['vocab', '**for one hour** — 한 시간**에**(대가의 for). {Look,} — 봐(상대의 주의를 끄는 말).'],
        ],
      },
      {
        covers: [17, 18, 19],
        tags: ['title'],
        en: 'Dad: Right. | We [g:need to find out] the price | for [h:the same amount of time]. | Nick: Okay, but [r:how can we do that]?',
        note: '**해석 도움** — 이 대화의 **핵심 원칙**: 가격은 **같은 시간 기준**으로 비교해야 한다. Nick의 질문이 다음 장의 계산으로 이어진다.',
        points: [
          ['grammar', '**need to + 동사원형** — "~**해야 한다**"(필요). {need to find out} = have to find out.'],
          ['grammar', '**지시대명사 that** — {do that} = 앞 문장의 **같은 시간에 대한 가격을 알아내는 것**.'],
          ['vocab', '**the same amount of time / find out** — 같은 양의 시간 / 알아내다.'],
        ],
      },
    ],
    prompt: `Photorealistic interior photograph, wide banner composition. A bright hotel lobby front desk with a tall wooden rack holding many colorful folded travel brochures with plain blank covers, a small bell on the counter and potted eucalyptus branches nearby, soft daylight from tall windows. ${LIGHT}, warm wood, white and leafy green. ${NO}, koala, calculator, chart, suitcase --ar 16:5 --v 8.1 --style raw`,
  },

  /* ── Ch3 3시간 기준 + 확인할 것 하나 더 ─────────────────────────── */
  {
    no: 3, type: '내용불일치', answer: 2,
    question: '다음 대화의 내용과 일치하지 않는 것은?',
    summary: 'Emily는 Smile Tour를 3시간 하면 75달러가 든다고 계산해요. Star Tour는 3시간에 60달러, Top Tour는 110달러이니 이제 Star Tour가 가장 싸 보여요. 그런데 엄마가 확인할 것이 한 가지 더 있다며, Top Tour의 110달러는 두 사람 기준이라고 알려 줘요. Nick은 깜짝 놀라 그게 어디에 쓰여 있는지 물어요.',
    mainIdea: 'After converting Smile Tour to a 3-hour price, Star Tour looks the cheapest, but Mom points out that Top Tour’s price is for two people.',
    titleEn: 'Is Star Tour Really the Cheapest?',
    ko: [
      'Emily: Smile Tour부터 시작해 봐요.',
      '우리가 3시간짜리 투어를 한다면, 75달러 비용이 들 거예요.',
      'Nick: Star Tour는 3시간에 60달러이고, Top Tour는 110달러네요.',
      '와, 이제 Star Tour가 가장 저렴하네요!',
      '엄마: 맞아, 하지만 우리가 확인해야 할 것이 한 가지 더 있지.',
      'Nick: 그게 뭔데요, 엄마?',
      '엄마: Top Tour의 가격은 110달러지만, 그것은 두 사람 기준이야.',
      'Nick: 정말이에요?',
      '그게 어디에 쓰여 있어요?',
    ],
    choices: [
      ['Smile Tour를 3시간 하면 75달러가 든다.', '{If we take a 3-hour tour, it will cost $75.} — 일치.'],
      ['Top Tour의 110달러는 한 사람 가격이다.', '{it’s for two people} — **두 사람** 가격이다. **정답(불일치)**.'],
      ['Star Tour는 3시간에 60달러이다.', '{Star Tour is $60 for 3 hours} — 일치.'],
      ['Nick은 Star Tour가 가장 싸다고 생각했다.', '{now Star Tour is the cheapest!} — 일치.'],
      ['엄마는 확인할 것이 하나 더 있다고 했다.', '{we have one more thing to check} — 일치.'],
    ],
    vocab: [
      'start with|숙|~부터 시작하다|begin with|end with ~로 끝내다|—',
      'take a tour|숙|투어를 하다|go on a tour|—|—',
      '3-hour|형|3시간짜리의|—|—|—',
      'cost|동|(비용이) 들다|—|—|cost 비용(명)',
      'cheapest|형|가장 싼(cheap의 최상급)|—|most expensive 가장 비싼|cheaper 더 싼',
      'right|형|맞는, 옳은|correct|wrong 틀린|—',
      'one more|숙|하나 더|another|—|—',
      'thing|명|것, 일|—|—|—',
      'check|동|확인하다|—|—|checklist 점검표',
      'really|부|정말로|truly|—|real 진짜의',
    ],
    flow: [
      ['🧮', '계산 ① — Smile Tour 를 3시간으로', 'Emily: 1시간 25달러 × 3 = **75달러**.'],
      ['📊', '비교 — Star Tour 가 가장 싸다?', 'Smile **$75** / Star **$60** / Top **$110** → Nick: **Star Tour가 가장 싸다!**'],
      ['☝️', '반전 — 확인할 것이 하나 더', '엄마: **하나 더 확인**해야 한다 — Top Tour의 110달러는 **두 사람 기준**이다.'],
      ['😮', '놀람 — 어디에 쓰여 있지?', 'Nick: **정말요? 어디에 쓰여 있어요?** → 다음 장에서 per pair 를 확인한다.'],
    ],
    cards: [
      {
        covers: [20, 21],
        en: 'Emily: [g:Let’s start with] Smile Tour. | [h:If we take a 3-hour tour], | it [r:will cost] $75.',
        note: '**해석 도움** — 같은 시간 기준을 만드는 첫 계산: Smile Tour 1시간 25달러 × 3 = **75달러**.',
        points: [
          ['grammar', '**조건의 부사절은 현재가 미래를 대신한다** — {If we take ~,} "~**한다면**"(will take ×). 주절은 미래 {it will cost}.'],
          ['grammar', '**하이픈 복합 형용사 3-hour** — 명사 앞에서 꾸밀 때 숫자 + 단위는 **단수**: {a 3-hour tour}(a 3-hours tour ×). 보어 자리에서는 {3 hours}.'],
          ['vocab', '**cost** — (비용이) 들다. 사물이 주어: {it will cost $75}.'],
        ],
      },
      {
        covers: [22, 23],
        en: 'Nick: Star Tour is $60 for 3 hours, | and Top Tour is $110. | Wow, now Star Tour is [g:the cheapest]!',
        note: '**해석 도움** — 3시간 기준으로 보면 Smile $75 · Star $60 · Top $110 → **Star Tour가 가장 싸다**는 두 번째 판단. 아직 Top Tour의 조건을 확인하지 않았다.',
        points: [
          ['grammar', '**최상급 the + -est** — {the cheapest} "가장 싼". {cheap – cheaper – cheapest}. 셋 이상을 비교할 때 최상급.'],
          ['vocab', '**now** — **이제는**(Smile 이 가장 싸 보였던 앞의 판단과 대비).'],
        ],
      },
      {
        covers: [24, 25, 26],
        tags: ['title'],
        en: 'Mom: Right, but we have | [h:one more thing] [g:to check]. | Nick: What is it, Mom? | Mom: The price of Top Tour is $110, | [r:but] it’s for two people.',
        note: '**해석 도움** — 엄마가 **반전**을 알려 준다: Top Tour 110달러는 **두 사람 가격**이다 — 1인 가격으로 바꿔야 공정하게 비교할 수 있다.',
        points: [
          ['grammar', '**to부정사 형용사적 용법** — {one more thing to check} "확인**할** 것 하나 더". to부정사가 앞 명사 {thing} 을 꾸민다.'],
          ['grammar', '**역접 but** — {Right, but ~ / $110, but it’s for two people} 앞 말을 인정하면서 **다른 사실**을 덧붙인다.'],
          ['vocab', '**for two people** — 두 사람**용**, 두 사람 기준.'],
        ],
      },
      {
        covers: [27, 28],
        en: 'Nick: Really? | Where does it [g:say] that?',
        note: '**해석 도움** — Nick은 놀라서 **어디에 쓰여 있는지** 묻는다 — 정보를 꼼꼼히 확인하는 태도로 이어진다.',
        points: [
          ['grammar', '**사물 주어 + say** — {Where does it say that?} "그게 어디에 **쓰여 있어요**?" 책자·표지판의 {say} = ~라고 쓰여 있다.'],
          ['grammar', '**의문사 + does + 주어 + 동사원형** — 일반동사 의문문: {Where does it say ~?}(says ×).'],
        ],
      },
    ],
    prompt: `Photorealistic still-life photograph, wide banner composition. A wooden café table by a bright window: a simple calculator, a sharpened pencil and a blank open notepad, three folded travel brochures with plain blank covers fanned out beside a cup of flat white coffee, a eucalyptus sprig in a small vase. ${LIGHT}, natural wood, cream white and soft eucalyptus green. ${NO}, koala, hotel lobby, suitcase, chart, banknotes --ar 16:5 --v 8.1 --style raw`,
  },

  /* ── Ch4 per pair ─────────────────────────── */
  {
    no: 4, type: '제목', answer: 4,
    question: '다음 대화의 제목으로 가장 적절한 것은?',
    summary: '엄마는 Top Tour 책자에 ‘두 사람당(per pair)’ 110달러라고 쓰여 있고, pair는 둘을 뜻한다고 알려 줘요. Emily는 110을 2로 나눠 한 사람당 가격을 구하자고 하고, Nick은 55달러라며 Star Tour보다 더 싸다는 사실에 놀라 표를 만들어요. 엄마는 Nick을 칭찬하며 이제 Top Tour가 왜 가장 저렴한지 알 수 있다고 하고, 가족은 Top Tour로 결정해요.',
    mainIdea: 'By dividing Top Tour’s price per pair by two, the family finds that it is the cheapest per person and chooses it.',
    titleEn: 'Price per Person: Top Tour Wins',
    ko: [
      '엄마: 여기, ‘두 사람당’ 110달러라고 쓰여 있어.',
      '너는 pair가 뭔지 아니?',
      '그것은 둘을 의미해.',
      'Emily: 아, 이제 저는 무엇을 해야 할지 알겠어요!',
      '한 사람당 가격을 알아내기 위해 110을 2로 나누어요.',
      'Nick: 그건 55달러네요!',
      '와, 이게 Star Tour보다 더 저렴해요.',
      '놀라워요!',
      '제가 표를 만들어 볼게요.',
      '엄마: Nick, 아주 잘했다.',
      '이제 Top Tour가 왜 가장 저렴한지 알겠지.',
      '이것으로 결정하자.',
    ],
    choices: [
      ['Why Short Tours Are Always Cheaper', '짧은 투어(Smile)는 3시간 기준으로 **가장 비쌌다**.'],
      ['How to Find Koalas in Australia', '코알라를 찾는 방법은 **나오지 않는다**.'],
      ['Star Tour: The Best Choice for Families', '가족은 Star Tour가 아니라 **Top Tour**를 골랐다.'],
      ['Price per Person: Top Tour Wins', '110 ÷ 2 = **1인 55달러** → Top Tour가 가장 저렴해 선택 — **정답**.'],
      ['Making Charts for School Projects', '표는 가격을 정리하려고 만든 것이고 **학교 과제와 무관**하다.'],
    ],
    vocab: [
      'per pair|숙|두 사람당, 한 쌍당|—|per person 한 사람당|—',
      'pair|명|(두 개로 된) 한 쌍|couple|—|—',
      'mean|동|의미하다|stand for|—|meaning 의미',
      'divide|동|나누다|split|multiply 곱하다|division 나눗셈',
      'person|명|사람, 개인|individual|—|personal 개인의',
      'cheaper|형|더 싼(cheap의 비교급)|—|more expensive 더 비싼|cheap 싼',
      'amazing|형|놀라운|surprising|—|amaze 놀라게 하다',
      'chart|명|도표, 표|table|—|—',
      'do a good job|숙|잘하다|—|—|—',
      'go with|숙|(제안 등을) 받아들이다, ~으로 정하다|choose|—|—',
    ],
    flow: [
      ['🔎', '확인 — per pair', '엄마: 책자에 **per pair** 110달러라고 쓰여 있다. **pair = 둘**.'],
      ['➗', '계산 ② — 110 ÷ 2', 'Emily: 한 사람당 가격을 구하려면 **110을 2로 나눈다**.'],
      ['📋', '결과 — 1인 55달러', 'Nick: **55달러** — Star Tour보다 **더 싸다**! 표로 정리: Smile **$75** / Star **$60** / Top **$55**(3시간·1인).'],
      ['✅', '결정 — Top Tour', '엄마: Nick을 칭찬하고 **Top Tour로 결정**. 교훈: 가격은 **같은 시간·같은 인원 기준**으로 비교한다.'],
    ],
    cards: [
      {
        covers: [29, 30, 31],
        en: 'Mom: Here, it [g:says] $110 “per pair.” | Do you know | [h:what a pair is]? | It [r:means] two.',
        note: '**해석 도움** — 놓쳤던 조건은 **per pair**. {pair} 는 **둘**을 뜻한다 — 110달러는 두 사람 가격이다.',
        points: [
          ['grammar', '**간접의문문 의문사 + 주어 + 동사** — {Do you know what a pair is?} "pair가 **무엇인지** 아니?"(what is a pair ×). 11번 {which koala tour will be} 와 비교.'],
          ['grammar', '**사물 주어 + say** — {it says $110 “per pair.”} "‘두 사람당’ 110달러라고 **쓰여 있다**".'],
          ['vocab', '**per / pair / mean** — ~당 / 한 쌍 / 의미하다.'],
        ],
      },
      {
        covers: [32, 33],
        en: 'Emily: Oh, now I know [h:what to do]! | [g:Divide] 110 [g:by] 2 | [r:to get] the price for one person.',
        note: '**해석 도움** — 해결책: 두 사람 가격을 **2로 나눠 1인 가격**을 구한다.',
        points: [
          ['grammar', '**의문사 + to부정사** — {what to do} "**무엇을 해야 할지**" = what I should do.'],
          ['grammar', '**to부정사 부사적 용법(목적)** — {to get the price for one person} "한 사람당 가격을 **구하기 위해**".'],
          ['vocab', '**divide A by B** — A를 B로 **나누다**(명령문). 반대는 {multiply A by B} 곱하다.'],
        ],
      },
      {
        covers: [34, 35, 36, 37],
        en: 'Nick: It’s $55! | Wow, it’s [g:cheaper than] Star Tour. | That’s amazing! | [r:Let me] make a chart.',
        note: '**해석 도움** — 1인 55달러로 **Star Tour($60)보다 싸다**. Nick은 결과를 **표**로 정리한다(Smile $75 / Star $60 / Top $55 — 3시간·1인 기준).',
        points: [
          ['grammar', '**비교급 + than** — {cheaper than Star Tour} "Star Tour**보다 더 싼**". {cheap – cheaper – cheapest}.'],
          ['grammar', '**let me + 동사원형** — {Let me make a chart} "제가 표를 만들어 **볼게요**"(12번 {let me compare} 와 같은 구문).'],
          ['vocab', '**amazing / chart** — 놀라운 / 도표·표.'],
        ],
      },
      {
        covers: [38, 39, 40],
        tags: ['title'],
        en: 'Mom: Nick, you [g:did a good job]. | Now you can see | [h:why Top Tour is the cheapest]. | Let’s [r:go with] this one.',
        note: '**해석 도움** — 엄마가 Nick을 칭찬하며 결론: 같은 조건(3시간·1인)으로 바꾸니 **Top Tour가 가장 싸다** → Top Tour로 결정.',
        points: [
          ['grammar', '**간접의문문 why + 주어 + 동사** — {see why Top Tour is the cheapest} "Top Tour가 **왜** 가장 싼지 (알다)"(why is Top Tour ×).'],
          ['grammar', '**부정대명사 one** — {this one} = this **tour**. 앞에 나온 명사의 반복을 피한다.'],
          ['vocab', '**do a good job / go with** — 잘하다 / ~으로 정하다, ~을 선택하다.'],
        ],
      },
    ],
    prompt: `Photorealistic wildlife photograph, wide banner composition. A pair of two fluffy grey koalas sitting close together side by side on a thick eucalyptus branch in a green Australian forest, soft rounded ears and dark noses, surrounded by fresh eucalyptus leaves. ${LIGHT}, soft koala grey, eucalyptus green and pale sky white. ${NO}, calculator, brochure, hotel, suitcase, chart --ar 16:5 --v 8.1 --style raw`,
  },
];

/* 이 폴더의 covers 는 챕터 안 번호(1부터)다 — 저작은 원문 전체 번호로 쓰고 여기서 바꾼다. */
let off = 0;
for (const c of chapters) {
  for (const card of c.cards) card.covers = card.covers.map(n => n - off);
  writeChapter('L8', SOURCE, c);
  off += SOURCE.find(x => x.no === c.no).sentences.length;
}
