/* 봉영여중3 비상(김진완) Lesson 7 — Spend Wisely 챕터 저작 데이터
 * 실행: node _author-L7.mjs  → data/L7/{1..5}.json */
import { writeChapter } from './_author.mjs';
import { SOURCE } from './_SOURCE-L7.js';

const LIGHT = 'natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette';
const NO = '--no text, letters, words, numbers, price tags, logo, brand, watermark, people, person, hands, faces, sunset, golden hour, night, dark moody grading, heavy shadows';

export const chapters = [
  /* ── Ch1 ─────────────────────────────────────────── */
  {
    no: 1, type: '주제', answer: 4,
    question: '다음 글의 주제로 가장 적절한 것은?',
    summary: '여러분은 원하지도, 필요하지도 않은 물건을 왜 샀는지 궁금했던 적이 있나요? 물건을 살 때 무엇이 우리에게 영향을 주는지 함께 생각해 보자고 제안해요. 이어지는 글에서는 밴드왜건 효과, 디드로 효과, 앵커링 효과라는 세 가지 소비 심리를 차례로 살펴봐요.',
    mainIdea: 'We sometimes buy things we do not want or need, so it is worth considering what affects us when we buy things.',
    titleEn: 'Why We Buy What We Buy: What Affects Our Shopping?',
    ko: [
      '여러분은 원하거나 필요로 하지도 않는 것들을 자신이 왜 구매했는지 궁금해한 적이 있는가?',
      '물건들을 구매하는 것에 관하여 무엇이 우리에게 영향을 주는지 생각해 보자.',
    ],
    choices: [
      ['필요한 물건을 싸게 사는 요령', '싸게 사는 **요령**이 아니라, **왜** 사는지를 생각해 보자는 글이다.'],
      ['물건을 사지 않고 돈을 모으는 방법', '돈을 **모으는 방법**은 언급되지 않는다.'],
      ['쇼핑이 스트레스를 줄여 주는 이유', '쇼핑의 **효과(스트레스 해소)**는 다루지 않는다.'],
      ['물건을 살 때 우리에게 영향을 주는 것', '{Let’s consider what affects us when it comes to buying things.} — 구매에 **영향을 주는 요인**을 생각해 보자는 **정답**이다.'],
      ['원하는 물건과 필요한 물건의 차이', '{want or need} 는 **함께 묶어** 말했을 뿐, 둘의 **차이**를 설명하지 않는다.'],
    ],
    vocab: [
      'wonder|동|궁금해하다|be curious|—|wonder 경이(명사) / wonderful 훌륭한',
      'need|동|필요로 하다|require|—|need 필요(명사) / needy 가난한',
      'consider|동|고려하다, 생각해 보다|think about|ignore 무시하다|consideration 고려',
      'affect|동|영향을 주다|influence|—|effect 영향, 효과(명사)',
      'when it comes to|숙|~에 관해서라면|as for, regarding|—|—',
    ],
    flow: [
      ['🛍️', '질문 — 원하지도 않는데 왜 샀을까?', '{Have you ever wondered ~?} 로 누구나 겪어 본 **충동구매** 경험을 떠올리게 한다.'],
      ['🤔', '문제 인식 — 필요 없는 구매', '원하지도 **필요하지도 않은** 물건을 산다는 것은, 구매에 **다른 무언가**가 영향을 준다는 뜻이다.'],
      ['🔍', '제안 — 영향 요인을 살펴보자', '{Let’s consider what affects us ~} — 구매에 **무엇이 영향을 주는지** 생각해 보자고 제안한다.'],
      ['📚', '예고 — 세 가지 효과', '이어지는 본문에서 **밴드왜건 효과 · 디드로 효과 · 앵커링 효과**를 차례로 설명한다.'],
    ],
    cards: [
      {
        covers: [1],
        en: '[g:Have you ever wondered] | [h:why you’ve bought things] | [r:that] you don’t even [g:want or need]?',
        note: '**해석 도움** — {why you’ve bought things} 는 {wondered} 의 목적어인 **간접의문문**이다. {that you don’t even want or need} 는 {things} 를 꾸미는 **목적격 관계대명사절**이다.',
        points: [
          ['grammar', '**현재완료 경험 Have you ever p.p.?** — "~해 본 적 있니?" {you’ve} 는 {you have} 의 축약형.'],
          ['grammar', '**간접의문문 why + 주어 + 동사** — {why you’ve bought ~}. 평서문 어순을 지킨다.'],
          ['grammar', '**목적격 관계대명사 that** — {things that you don’t even want or need}. {want} 와 {need} 의 목적어가 {things} 라 **생략 가능**하다.'],
          ['vocab', '**even** — "~조차". {don’t even want} "**원하지조차** 않는".'],
        ],
      },
      {
        covers: [2],
        en: '[g:Let’s consider] [h:what affects us] | [r:when it comes to] buying things.',
        note: '**해석 도움** — {what affects us} 는 "**무엇이** 우리에게 영향을 주는지"로, 의문사 {what} 이 **주어**인 간접의문문이다. {when it comes to -ing} 는 "~**에 관해서라면**"이다.',
        points: [
          ['grammar', '**의문사가 주어인 간접의문문** — {what affects us}. 의문사가 주어면 **의문사 + 동사** 어순 그대로다.'],
          ['grammar', '**when it comes to + (동)명사** — 이 {to} 는 **전치사**라 뒤에 **동명사** {buying} 이 온다({to buy} ×).'],
          ['vocab', '**affect vs effect** — {affect}(동사, 영향을 주다) / {effect}(명사, 효과). 이 단원의 세 **effect** 가 우리 구매에 **affect** 한다.'],
        ],
      },
    ],
    prompt: `Photorealistic interior photograph, wide banner composition. A bright bedroom closet corner overflowing with unused purchases: several shopping bags still folded shut, boxes of new sneakers never opened, clothes hanging with the tags still attached, a new gadget box unopened on the floor. Clean, calm and slightly humorous mood, lots of soft white space. ${LIGHT}, soft white, pale pink and light grey. ${NO}, parade, wagon, headphones, soccer field --ar 16:5 --v 8.1`,
  },

  /* ── Ch2 ─────────────────────────────────────────── */
  {
    no: 2, type: '내용일치', answer: 3,
    question: '다음 글의 내용과 일치하는 것은?',
    summary: '(나는 왜 친구들이 산 것을 사고 싶을까?) Jeff는 쇼핑센터에서 진열된 축구화를 보고, 팀 소년들의 절반 이상이 신는 신발이라 한눈에 알아봐요. 이미 축구화가 많은데도 결국 또 새 축구화를 사요. 이는 “밴드왜건 효과”로 설명할 수 있어요. 밴드왜건은 퍼레이드에서 사람들이 올라타 음악을 즐기도록 부추기는 마차인데, 더 많은 사람이 올라탈수록 다른 사람들도 올라타거나 따라가려 해요. 이처럼 사람들은 다른 사람들이 샀다는 이유만으로 물건을 사는 경향이 있어요.',
    mainIdea: 'The bandwagon effect explains why people tend to buy something just because many other people have bought it, like Jeff buying another pair of soccer shoes.',
    titleEn: 'The Bandwagon Effect: Buying What Everyone Else Buys',
    ko: [
      '나는 왜 친구들이 산 것을 사고 싶은 걸까?',
      'Jeff는 쇼핑센터에 가서 진열되어 있는 축구화 한 켤레를 보게 된다.',
      '그의 축구팀에 있는 소년들의 반 이상이 그 축구화를 신기 때문에 그는 그 신발을 한눈에 알아본다.',
      '이미 그에게는 축구화가 많이 있지만, 결국 그는 또 새 켤레를 사 버리고 만다.',
      '우리는 Jeff의 행동을 설명하기 위해 ‘밴드 왜건 효과’를 이용할 수 있다.',
      '밴드 왜건(악대차)은 사람들이 올라타서 음악을 즐기게끔 부추기는 퍼레이드에 있는 사륜마차이다.',
      '더 많은 사람들이 밴드 왜건에 올라탈수록, 다른 사람들이 더욱 그것에 올라타거나 그것을 따라가려 한다.',
      '이런 식으로, 사람들은 단지 다른 사람들이 어떤 것을 샀다는 이유만으로 그것을 구매하는 경향이 있다.',
    ],
    choices: [
      ['Jeff는 온라인 쇼핑몰에서 축구화를 보았다.', 'Jeff는 **쇼핑센터**({the shopping center})에 가서 **진열된** 축구화를 보았다.'],
      ['Jeff의 팀원 중 그 축구화를 신는 사람은 거의 없다.', '{more than half of the boys on his soccer team wear them} — **절반 이상**이 신는다.'],
      ['Jeff는 이미 축구화를 많이 가지고 있다.', '{he already has many pairs of soccer shoes} 와 **일치**한다. **정답**.'],
      ['밴드왜건은 음악을 파는 가게의 이름이다.', '밴드왜건은 **퍼레이드의 마차**({a wagon in a parade})이다.'],
      ['사람이 많이 탈수록 다른 사람들은 밴드왜건을 피한다.', '더 많이 탈수록 다른 사람들도 **더 올라타거나 따라가려** 한다({more likely to get on or follow it}).'],
    ],
    vocab: [
      'on display|숙|진열된, 전시된|on show, exhibited|—|display 진열하다',
      'recognize|동|알아보다|identify, know|—|recognition 인식',
      'at a glance|숙|한눈에, 즉시|immediately|—|glance 흘끗 봄',
      'although|접|비록 ~이지만|though, even though|—|—',
      'end up -ing|동|결국 ~하게 되다|finally do|—|—',
      'behavior|명|행동|conduct, action|—|behave 행동하다',
      'wagon|명|사륜마차, 짐마차|cart|—|—',
      'parade|명|퍼레이드, 행진|march, procession|—|—',
      'encourage|동|부추기다, 격려하다|urge, motivate|discourage 막다, 낙담시키다|encouragement 격려',
      'aboard|부|(탈것에) 올라타|on board|—|board 탑승하다',
      'be likely to|숙|~할 것 같다, ~하기 쉽다|tend to|be unlikely to ~할 것 같지 않다|likely 가능성 있는',
      'follow|동|따라가다|go after|lead 이끌다|follower 추종자',
      'tend to|동|~하는 경향이 있다|be inclined to|—|tendency 경향',
    ],
    flow: [
      ['⚽', '상황 — Jeff와 축구화', 'Jeff는 쇼핑센터에서 팀원 **절반 이상**이 신는 축구화를 **한눈에** 알아본다.'],
      ['🛒', '행동 — 이미 있는데 또 산다', '{Although} 이미 **많이 있지만**, 결국({ends up}) **또 새 축구화**를 산다.'],
      ['🎺', '개념 — 밴드왜건이란?', '퍼레이드에서 사람들을 **올라타게 부추기는** 마차. **탄 사람이 많을수록** 다른 사람들도 더 **올라타거나 따라간다**.'],
      ['👥', '정리 — 밴드왜건 효과', '사람들은 **다른 사람들이 샀다는 이유만으로** 물건을 사는 경향이 있다. 이것이 Jeff의 행동을 설명한다.'],
    ],
    cards: [
      {
        covers: [1, 2],
        en: 'Why do I want to buy [h:what my friends bought]? | Jeff [g:goes] to the shopping center [g:and sees] a pair of soccer shoes [r:on display].',
        note: '**해석 도움** — {what my friends bought} 는 "내 친구들이 **산 것**"으로, **관계대명사 what** 이 이끄는 명사절이다. {a pair of soccer shoes} 는 "축구화 **한 켤레**".',
        points: [
          ['grammar', '**관계대명사 what** — {what my friends bought} = {the thing(s) that my friends bought}. {buy} 의 **목적어** 역할.'],
          ['grammar', '**현재시제로 쓰는 사례 설명** — {goes / sees}. 예시 상황을 **생생하게** 보여 주려고 현재시제를 쓴다(이 단원 사례 전부).'],
          ['vocab', '**a pair of + 복수명사** — 둘이 한 쌍인 물건: {a pair of shoes / pants / headphones}. **두 켤레**는 {two pairs of}.'],
        ],
      },
      {
        covers: [3],
        en: 'He [g:recognizes] the shoes [r:at a glance] | [r:because] [h:more than half of the boys] on his soccer team [g:wear] them.',
        note: '**해석 도움** — {at a glance} 는 "**한눈에**". {because} 절의 주어는 {more than half of the boys on his soccer team} 이고 동사는 {wear} 이다.',
        points: [
          ['grammar', '**half of + 명사 → 수 일치** — {half of the boys} 는 **복수**라 {wear}. {half of the cake is} 처럼 **of 뒤 명사**에 동사를 맞춘다.'],
          ['vocab', '**more than half** — "**절반 이상**". 많은 친구가 신기 때문에 Jeff도 그 신발에 **끌린다**.'],
        ],
      },
      {
        covers: [4],
        en: '[r:Although] he [h:already] has many pairs of soccer shoes, | he [g:ends up buying] [h:another new pair].',
        note: '**해석 도움** — {Although} 는 "비록 ~이지만"이라는 **양보**의 접속사다. {end up -ing} 는 "**결국** ~하게 되다".',
        points: [
          ['grammar', '**양보 접속사 although(though, even though)** — 뒤에 **주어+동사**. {despite / in spite of} 는 **명사(구)**가 온다.'],
          ['grammar', '**end up + -ing** — 의도와 달리 "결국 ~하게 되다". {end up to buy} (×).'],
          ['vocab', '**another + 단수명사** — "또 하나의". {another new pair} "또 다른 새 **한 켤레**".'],
        ],
      },
      {
        covers: [5],
        en: 'We [g:can use] the “bandwagon effect” | [r:to explain] Jeff’s behavior.',
        note: '**해석 도움** — {to explain ~} 은 "~을 **설명하기 위해**"라는 **목적**의 to부정사다.',
        points: [
          ['grammar', '**to부정사의 부사적 용법(목적)** — {use ~ to explain ~} "설명하기 **위해** 이용하다".'],
          ['reading', '**사례 → 개념** — Jeff의 **사례**를 먼저 보여 주고, 그것을 설명하는 **개념**(bandwagon effect)을 소개하는 구성이다. 본문 3·4도 같은 구조.'],
        ],
      },
      {
        covers: [6],
        en: 'A bandwagon is a wagon in a parade | [g:that encourages people to jump aboard and enjoy] the music.',
        note: '**해석 도움** — {that} 은 {a wagon in a parade} 를 꾸미는 **주격 관계대명사**다. {encourage + 목적어 + to부정사} 는 "~가 …하도록 **부추기다**".',
        points: [
          ['grammar', '**encourage + 목적어 + to부정사** — "~가 …하도록 권하다/부추기다". {jump aboard and (to) enjoy} 두 동작이 병렬.'],
          ['grammar', '**주격 관계대명사 + 단수동사** — 선행사 {a wagon} 이 **단수**라 {encourages}. {parade} 를 선행사로 오해하지 않도록 **의미**로 판단한다.'],
          ['vocab', '**aboard** — "(배·차 등에) **올라타**". {jump aboard} "훌쩍 올라타다", {All aboard!}(모두 탑승하세요!)'],
        ],
      },
      {
        covers: [7],
        en: '[r:As] [h:more and more people] get on the bandwagon, | others [g:are more likely to get on or follow] it.',
        note: '**해석 도움** — 여기서 {As} 는 "~**함에 따라**, ~할수록"이라는 **비례**의 접속사다. {be likely to} 는 "~**할 가능성이 크다**".',
        points: [
          ['grammar', '**비례의 접속사 as** — "~함에 따라". 뒤에 **비교급**({more and more})이 오면 "~할수록"으로 해석한다.'],
          ['grammar', '**비교급 and 비교급** — {more and more people} "점점 **더 많은** 사람들".'],
          ['grammar', '**others** — 정해지지 않은 **다른 사람들**. {be more likely to ~} "~할 가능성이 **더 크다**".'],
        ],
      },
      {
        covers: [8],
        en: '[r:In this way], people [g:tend to buy] something | [h:just because other people have bought it].',
        note: '**해석 도움** — {tend to} 는 "~**하는 경향이 있다**". {just because ~} 는 "**단지** ~라는 **이유만으로**"이다.',
        points: [
          ['grammar', '**tend to + 동사원형** — "~하는 경향이 있다". 명사형 {tendency}.'],
          ['grammar', '**현재완료 have bought** — 다른 사람들이 **이미 사서 갖고 있는** 상태를 나타낸다.'],
          ['reading', '**밴드왜건 효과의 정의** — 물건이 **필요해서**가 아니라 **남들이 샀기 때문에** 산다. 본문 5 결론의 {Just like Jeff and his friends} 로 이어진다.'],
        ],
      },
    ],
    prompt: `Photorealistic street photograph, wide banner composition. A cheerful old-fashioned wooden parade bandwagon painted red and gold, decorated with bunting flags and brass instruments resting on its benches, parked on a festive town street with colorful balloons and paper streamers along the buildings. Next to it a sports shop window displaying many identical pairs of bright soccer shoes in neat rows. ${LIGHT}, bright red, gold and fresh green. ${NO}, coat, gown, furniture, headphones --ar 16:5 --v 8.1`,
  },

  /* ── Ch3 ─────────────────────────────────────────── */
  {
    no: 3, type: '내용불일치', answer: 2,
    question: '다음 글의 내용과 일치하지 않는 것은?',
    summary: '(나는 왜 새 코트를 산 뒤에 바지와 가방까지 살까?) Lisa는 정말 마음에 드는 코트를 사자마자 바지가 코트와 어울리지 않는다는 것을 깨닫고 새 바지를 사요. 그런데 가방도 새 옷과 어울리지 않아 새 가방까지 사요. 돈 대부분이 새 모습을 완성하는 데 쓰였어요. 이것은 “디드로 효과”로 설명할 수 있어요. 프랑스 작가 드니 디드로는 선물로 새 가운을 받은 뒤 가구가 가운과 어울리지 않는다는 것을 알고 결국 대부분을 바꿨어요. 디드로 효과는 새 물건 하나를 사는 것이 흔히 계획에 없던 더 많은 구매로 이어진다는 개념이에요.',
    mainIdea: 'The Diderot effect is the idea that buying one new item often leads to more unplanned purchases, as with Lisa’s new coat and Diderot’s new gown.',
    titleEn: 'The Diderot Effect: One New Item Leads to Another',
    ko: [
      '나는 왜 새 코트를 구입한 후에 바지와 가방을 사는 걸까?',
      'Lisa는 정말 마음에 드는 코트를 산다.',
      '그녀는 그녀의 바지가 새 코트와 어울리지 않는다는 것을 즉시 알아차린다.',
      '그래서 그녀는 새 코트와 완벽하게 어울리는 새 바지를 구입한다.',
      '하지만 그녀는 자신의 가방 중 어느 것도 새로운 옷들과 어울리지 않는다는 것을 알게 된다.',
      '그래서 그녀는 새 가방을 산다.',
      '그녀의 돈 대부분이 그녀의 새로운 모습을 완성하기 위하여 새로운 물품을 사는 데 쓰인다.',
      '무엇이 Lisa로 하여금 새 코트를 산 후 즉시 새로운 물품을 찾게 했을까?',
      '‘디드로 효과’가 그것을 설명해 줄지도 모른다.',
      '프랑스 작가인 Denis Diderot는 선물로 새 가운을 받았다.',
      '그 선물을 받은 후에 곧 그는 그의 모든 가구가 새로운 가운과 어울리지 않는다는 것을 알아챘다.',
      '그래서 그는 결국 대부분의 가구를 바꾸고 말았다.',
      '그러므로, 디드로 효과는 새로운 물품을 구입하는 것이 흔히 계획에 없던 더 많은 구매로 이어진다는 개념이다.',
    ],
    choices: [
      ['Lisa는 마음에 드는 코트를 샀다.', '{Lisa buys a coat that she really loves.} 와 일치한다.'],
      ['Lisa는 가방이 옷과 어울려 가방은 사지 않았다.', '{none of her bags match her new clothes. So, she buys a new bag.} — 어울리는 가방이 **하나도 없어** 새 가방을 **샀다**. **불일치 — 정답**.'],
      ['Lisa는 돈의 대부분을 새 물건을 사는 데 썼다.', '{Most of her money is spent on buying the new items} 와 일치한다.'],
      ['Diderot는 새 가운을 선물로 받았다.', '{received a new gown as a gift} 와 일치한다.'],
      ['Diderot는 결국 가구 대부분을 바꾸었다.', '{he ended up replacing most of it} 과 일치한다.'],
    ],
    vocab: [
      'immediately|부|즉시, 곧바로|at once, right away|later 나중에|immediate 즉각적인',
      'realize|동|깨닫다, 알아차리다|notice, recognize|—|realization 깨달음',
      'match|동|어울리다, 일치하다|go with, suit|clash 어울리지 않다|match 경기(명사)',
      'go with|동|~와 어울리다|match, suit|—|—',
      'perfectly|부|완벽하게|completely, ideally|poorly 형편없이|perfect 완벽한',
      'none of|대|~ 중 아무것도 … 않다|not any of|all of 모두|—',
      'complete|동|완성하다|finish|start 시작하다|complete 완전한(형) / completion 완성',
      'search for|동|~을 찾다|look for|—|search 검색',
      'item|명|물품, 품목|thing, article|—|—',
      'gown|명|(실내용) 가운|robe|—|—',
      'receive|동|받다|get|give 주다|receipt 영수증 / reception 환영',
      'furniture|명|가구|furnishings|—|furnish (가구를) 비치하다',
      'replace|동|교체하다, 바꾸다|change, substitute|keep 유지하다|replacement 교체',
      'concept|명|개념|idea, notion|—|conceptual 개념의',
      'purchase|동|구입하다|buy|sell 팔다|purchase 구입(명사)',
      'lead to|동|~로 이어지다|result in, cause|—|led 과거형',
      'unplanned|형|계획에 없던|unexpected, sudden|planned 계획된|plan 계획하다',
    ],
    flow: [
      ['🧥', '사례 — Lisa의 새 코트', '마음에 드는 코트를 사자 **바지**가 안 어울리고 → 새 바지, **가방**도 안 어울리고 → 새 가방. 돈 대부분이 **새 모습 완성**에 쓰였다.'],
      ['❓', '질문 — 무엇이 Lisa를 그렇게 했나?', '{What made Lisa search for new items ~?} → 답은 **디드로 효과**.'],
      ['🛋️', '유래 — 디드로의 새 가운', '프랑스 작가 **Diderot**는 선물받은 새 가운과 **가구가 안 어울려** 결국 **대부분의 가구를 바꿨다**.'],
      ['🔗', '정의 — 디드로 효과', '새 물건 **하나**를 사는 것이 흔히 **계획에 없던 더 많은 구매**로 이어진다는 개념이다.'],
    ],
    cards: [
      {
        covers: [1, 2],
        en: 'Why do I buy a pair of pants and a bag | [r:after I have bought a new coat]? | Lisa buys a coat [g:that she really loves].',
        note: '**해석 도움** — {after I have bought ~} 는 "~을 **산 후에**"로, 시간의 부사절에서는 미래·완료의 의미라도 **현재(완료)시제**를 쓴다. {that she really loves} 는 {a coat} 를 꾸미는 **목적격 관계대명사절**이다.',
        points: [
          ['grammar', '**목적격 관계대명사 that** — {a coat (that) she really loves}. {loves} 의 목적어가 {a coat} 이므로 **생략 가능**.'],
          ['vocab', '**a pair of pants** — 바지는 다리 두 개가 **한 벌**이라 {a pair of} 로 센다. {pants} 는 항상 **복수형**.'],
        ],
      },
      {
        covers: [3, 4],
        en: '[r:Immediately], she [g:realizes] [h:that her pants do not match her new coat]. | [r:So], she buys new pants [g:that go perfectly with] her new coat.',
        note: '**해석 도움** — {realizes that ~} 은 "~라는 것을 **깨닫다**". {go with} 는 "~와 **어울리다**"로 {match} 와 같은 뜻이다.',
        points: [
          ['grammar', '**명사절 that** — {realize / notice / see + that절}. "~라는 것을 깨닫다/알아차리다/알게 되다".'],
          ['grammar', '**주격 관계대명사 + 복수동사** — {new pants that go ~}. 선행사 {pants} 가 **복수**라 {go}.'],
          ['vocab', '**match = go (well) with** — "~와 어울리다". 이 단락에서 {match} 와 {go with} 가 **번갈아** 쓰인다.'],
        ],
      },
      {
        covers: [5, 6],
        en: 'But she sees that [r:none of her bags] [g:match] her new clothes. | So, she buys [h:a new bag].',
        note: '**해석 도움** — {none of ~} 는 "~ 중 **아무것도** … 않다"라는 **전체 부정**이다. 가방이 **하나도** 새 옷과 어울리지 않는다는 뜻이다.',
        points: [
          ['grammar', '**none of + 복수명사** — "~ 중 아무것도 ~ 않다". 뒤의 동사는 **단수·복수 모두** 가능({none of her bags match / matches}).'],
          ['grammar', '**전체 부정 vs 부분 부정** — {none}(하나도 ~ 않다) vs {not all}(모두 ~인 것은 아니다).'],
          ['reading', '**연쇄 구매** — 코트 → 바지 → 가방. 새 물건 **하나**가 다음 구매를 **부른다**.'],
        ],
      },
      {
        covers: [7],
        en: '[h:Most of her money] [g:is spent on buying] the new items | [r:to complete her new look].',
        note: '**해석 도움** — {is spent on buying} 은 {spend A on -ing} 의 **수동태**로 "~을 사는 데 **쓰인다**". {to complete ~} 는 "~을 **완성하기 위해**"라는 **목적**이다.',
        points: [
          ['grammar', '**most of + 셀 수 없는 명사 → 단수동사** — {Most of her money is ~}. of 뒤 명사({money})에 수를 맞춘다.'],
          ['grammar', '**spend A on -ing 의 수동태** — {Her money is spent on buying ~}. 전치사 {on} 뒤 **동명사**.'],
          ['vocab', '**look** — 명사로 "**모습, 외모**". {complete her new look} "새로운 **스타일**을 완성하다".'],
        ],
      },
      {
        covers: [8, 9],
        en: 'What [g:made Lisa search for] new items | [h:immediately after buying a new coat]? | The “Diderot effect” [g:may explain] it.',
        note: '**해석 도움** — {make + 목적어 + 동사원형} 은 "~가 …하게 **만들다**"라는 **사역** 구문이다. "무엇이 Lisa로 하여금 ~을 **찾게 했을까**?"로 해석한다. {may} 는 "~**일지도 모른다**".',
        points: [
          ['grammar', '**사역동사 make + 목적어 + 동사원형** — {made Lisa search for ~}. {to search} (×).'],
          ['grammar', '**after + 동명사** — {after buying} "산 **후에**". 전치사 {after} 뒤에 동명사.'],
          ['grammar', '**추측의 조동사 may** — "~일지도 모른다". 확신이 **덜한** 추측이다.'],
        ],
      },
      {
        covers: [10],
        en: 'Denis Diderot, [h:a French writer], | [g:received] a new gown [r:as a gift].',
        note: '**해석 도움** — 콤마 사이 {a French writer} 는 Denis Diderot를 설명하는 **동격**이다. {as a gift} 의 {as} 는 "~**로서**"라는 전치사다.',
        points: [
          ['grammar', '**동격의 콤마** — {Denis Diderot, a French writer,} "프랑스 작가인 드니 디드로".'],
          ['grammar', '**전치사 as** — "~로(서)". {receive A as a gift} "A를 **선물로** 받다".'],
        ],
      },
      {
        covers: [11, 12],
        en: '[r:Soon after receiving the gift], | he [g:noticed] that [h:all of his furniture] did not go well with his new gown. | So, he [g:ended up replacing] [h:most of it].',
        note: '**해석 도움** — {Soon after receiving ~} 는 "~을 받은 **직후에**". {most of it} 의 {it} 은 **그의 가구 전체**({his furniture})를 가리킨다.',
        points: [
          ['grammar', '**furniture 는 셀 수 없는 명사** — {a furniture}, {furnitures} (×). 그래서 대명사도 {it}. 셀 때는 {a piece of furniture}.'],
          ['grammar', '**end up -ing** — {ended up replacing} "결국 **바꾸고 말았다**". 본문 2의 {ends up buying} 과 같은 표현.'],
          ['grammar', '**all ~ not** — {all of his furniture did not go well} "가구 **모두가** 어울리지 않았다". 문맥상 **전체**가 어울리지 않았다는 뜻이다.'],
        ],
      },
      {
        covers: [13],
        en: 'The Diderot effect, [r:therefore], is the concept | [r:that] [h:purchasing a new item] often [g:leads to] more unplanned purchases.',
        note: '**해석 도움** — {the concept that ~} 의 {that} 은 **동격**의 접속사로 "~라는 **개념**"이다. that절의 주어는 동명사구 {purchasing a new item}, 동사는 {leads to} 이다.',
        points: [
          ['grammar', '**동격의 that** — {the concept that ~} "~라는 개념". 뒤에 **완전한 문장**이 온다(관계대명사 that 과 구분).'],
          ['grammar', '**동명사 주어 + 단수동사** — {purchasing a new item leads to ~}. 동명사 주어는 **단수** 취급.'],
          ['vocab', '**therefore** — "그러므로". 앞의 사례들을 **정리해 결론(정의)**을 내릴 때 쓴다. 문장 중간에 콤마로 끼워 넣었다.'],
        ],
      },
    ],
    prompt: `Photorealistic interior photograph, wide banner composition. An elegant eighteenth century French study: a luxurious new crimson silk dressing gown hanging on a stand in the center, looking far finer than the old worn wooden desk, faded armchair and shabby bookshelves around it; at the right side of the room several brand-new elegant pieces of furniture wrapped in paper are waiting to replace the old ones. ${LIGHT}, crimson, cream and pale wood. ${NO}, parade, soccer shoes, headphones, shopping bags --ar 16:5 --v 8.1`,
  },

  /* ── Ch4 ─────────────────────────────────────────── */
  {
    no: 4, type: '내용일치', answer: 1,
    question: '다음 글의 내용과 일치하는 것은?',
    summary: '(나는 왜 할인 중이라는 이유만으로 물건을 살까?) Nathan은 구경하다가 200달러짜리 헤드폰을 보고 너무 비싸다고 생각해요. 그때 점원이 다가와 20퍼센트 할인을 받을 수 있다고 말하고, 할인된 가격도 여전히 싸지 않은데 Nathan은 헤드폰을 사기로 해요. 이것이 “앵커링 효과”의 예예요. 처음 제시된 가격이 나중 가격에 대한 우리의 판단에 영향을 주어, 200달러로 시작하면 160달러는 상대적으로 싸 보여요. 두 가격의 차이가 클수록 효과는 더 강해져요. 처음 가격이 가격에 대한 생각을 고정하는 “닻” 역할을 해요.',
    mainIdea: 'The anchoring effect means that the first price we see acts as an anchor, making later prices seem cheap in comparison, as when Nathan buys discounted headphones.',
    titleEn: 'The Anchoring Effect: The First Price Holds Our Thoughts',
    ko: [
      '나는 왜 단지 할인 중이라는 이유로 물건을 구입하는 걸까?',
      'Nathan은 진열된 상품을 구경하러 가서 헤드폰을 하나 본다.',
      '그는 가격을 확인하고 그것이 200달러임을 알게 된다.',
      '그는 그 헤드폰이 너무 비싸다고 생각한다.',
      '점원이 그에게 다가와 “이 헤드폰에 20퍼센트 할인을 받을 수 있어요.”라고 말한다.',
      '비록 할인된 가격이 여전히 별로 낮지는 않지만, Nathan은 그 헤드폰을 사기로 결심한다.',
      '위에 기술된 상황은 ‘앵커링 효과’의 한 예이다.',
      '처음에 언급된 가격이 이후에 언급되는 가격에 대한 우리의 의견에 영향을 미친다.',
      '예를 들어, 만약 우리가 200달러로 시작한다면, 비교해 볼 때 160달러는 저렴해 보일 것이다.',
      '그뿐만 아니라, 두 가격의 차이가 커질수록 그 효과는 더욱 강력해질 것이다.',
      '이와 같이, 처음에 언급된 가격이 물건의 가격에 대한 우리의 생각을 고정하는 ‘닻’으로서 작동한다.',
    ],
    choices: [
      ['Nathan은 처음에 헤드폰이 너무 비싸다고 생각했다.', '{He thinks that the headphones are too expensive.} 와 **일치**한다. **정답**.'],
      ['헤드폰의 원래 가격은 160달러였다.', '원래 가격은 **200달러**, **160달러**는 20퍼센트 할인된 가격이다.'],
      ['점원은 헤드폰을 50퍼센트 할인해 주겠다고 했다.', '점원은 **20퍼센트** 할인({a 20 percent discount})을 말했다.'],
      ['할인된 가격은 매우 낮은 가격이었다.', '{the discounted price is still not very low} — 할인가도 **여전히 별로 낮지 않았다**.'],
      ['두 가격의 차이가 클수록 효과는 약해진다.', '차이가 커질수록 효과는 **더 강력해진다**({the effect will be more powerful}).'],
    ],
    vocab: [
      'on sale|숙|할인 중인|discounted|—|sale 판매, 할인',
      'window shopping|명|(사지 않고) 진열된 상품 구경|browsing|—|—',
      'find out|동|알아내다|discover, learn|—|—',
      'expensive|형|비싼|costly, pricey|cheap 싼|expense 비용',
      'approach|동|다가가다, 접근하다|come near|leave 떠나다|approach 접근(명사)',
      'discount|명|할인|reduction|—|discounted 할인된',
      'decide|동|결심하다, 결정하다|choose, determine|—|decision 결정',
      'situation|명|상황|case, circumstance|—|situated 위치한',
      'anchor|명|닻, 고정 장치|—|—|anchoring 닻 내리기, 고정',
      'mention|동|언급하다|refer to|—|mention 언급(명사)',
      'opinion|명|의견|view, idea|—|—',
      'afterwards|부|그 후에, 나중에|later|beforehand 미리|—',
      'in comparison|숙|비교해 보면|by comparison|—|compare 비교하다',
      'furthermore|부|게다가, 더욱이|moreover, besides|—|—',
      'difference|명|차이|gap|similarity 유사성|differ 다르다 / different 다른',
      'powerful|형|강력한|strong|weak 약한|power 힘',
      'as such|숙|이와 같이, 그러므로|thus|—|—',
      'fix|동|고정하다|fasten, set|loosen 느슨하게 하다|fixed 고정된',
    ],
    flow: [
      ['🎧', '사례 — Nathan과 200달러 헤드폰', '구경하다 본 헤드폰이 **200달러** — **너무 비싸다**고 생각한다.'],
      ['🏷️', '반전 — 20% 할인에 구매 결심', '점원이 **20퍼센트 할인**을 제안하자, 할인가도 **여전히 싸지 않은데** Nathan은 **사기로 결심**한다.'],
      ['⚓', '개념 — 앵커링 효과', '**처음 언급된 가격**이 이후 가격에 대한 판단에 영향을 준다. 200달러로 시작하면 160달러는 **싸 보인다**. 차이가 **클수록** 효과는 **강해진다**.'],
      ['📌', '정리 — 가격의 닻', '처음 가격이 물건 가격에 대한 생각을 **고정하는 닻**({anchor}) 역할을 한다.'],
    ],
    cards: [
      {
        covers: [1, 2],
        en: 'Why do I buy things [r:just because] they are [h:on sale]? | Nathan [g:goes window shopping] and sees [h:a pair of headphones].',
        note: '**해석 도움** — {on sale} 은 "**할인 중인**"(또는 "판매 중인"). {go window shopping} 은 "(사지 않고) **진열된 상품을 구경하러 가다**"이다.',
        points: [
          ['grammar', '**go + -ing** — "~하러 가다". {go shopping, go swimming, go window shopping}.'],
          ['vocab', '**on sale / for sale** — {on sale}(할인 중인, 판매 중인), {for sale}(팔려고 내놓은). 이 단락에서는 **할인**의 뜻.'],
          ['vocab', '**a pair of headphones** — 양쪽 귀가 한 쌍이라 {a pair of}. 대명사로 받을 때도 **복수** {they}.'],
        ],
      },
      {
        covers: [3, 4],
        en: 'He [g:checks] the price [g:and finds out] [h:that they are $200]. | He thinks that the headphones are [r:too expensive].',
        note: '**해석 도움** — {finds out that ~} 은 "~라는 것을 **알게 되다**". {they} 는 **헤드폰**을 가리킨다. {too} 는 "**너무** (~해서 곤란한)"이라는 **부정적** 의미의 부사다.',
        points: [
          ['grammar', '**명사절 that** — {find out / think + that절}. {that} 은 생략할 수 있다.'],
          ['vocab', '**too + 형용사** — "지나치게 ~한". {very}(매우)와 달리 **부정적** 뉘앙스. {too expensive to buy}(너무 비싸서 살 수 없는).'],
        ],
      },
      {
        covers: [5],
        en: 'The sales person [g:approaches] him and says, | “You [g:can get] [h:a 20 percent discount] on those headphones.”',
        note: '**해석 도움** — {approach} 는 **타동사**라 전치사 없이 바로 목적어 {him} 이 온다. {a 20 percent discount} 에서 {20 percent} 는 형용사처럼 {discount} 를 꾸며 **단수형**이다.',
        points: [
          ['grammar', '**approach + 목적어** — {approach him}(○) / {approach to him}(×). 뜻에 끌려 {to} 를 넣지 않도록 주의.'],
          ['grammar', '**숫자 + 명사가 형용사로 쓰일 때 단수** — {a 20 percent discount}, {a five-year-old boy}. {a 20 percents discount} (×).'],
          ['vocab', '**get a discount on ~** — "~에 대해 할인을 받다".'],
        ],
      },
      {
        covers: [6],
        en: '[r:Even though] the discounted price is [h:still not very low], | Nathan [g:decides to buy] the headphones.',
        note: '**해석 도움** — {Even though} 는 "비록 ~**이지만**"이라는 **양보**의 접속사다. {the discounted price} 는 "**할인된** 가격"이다.',
        points: [
          ['grammar', '**양보 접속사 even though** — {although} 보다 **강조**된 표현. 뒤에 주어+동사.'],
          ['grammar', '**decide + to부정사** — "~하기로 결심하다". {decide buying} (×). {plan, hope, want} 도 to부정사를 목적어로 취한다.'],
          ['grammar', '**과거분사 형용사 discounted** — 가격은 **할인되는** 대상이라 {-ed}.'],
        ],
      },
      {
        covers: [7, 8],
        en: 'The situation [h:described above] is an example of the “anchoring effect.” | The price [h:mentioned first] [g:affects] our opinion of prices [h:mentioned afterwards].',
        note: '**해석 도움** — {described above}, {mentioned first}, {mentioned afterwards} 는 모두 앞 명사를 뒤에서 꾸미는 **과거분사구**다. 둘째 문장의 주어는 {The price mentioned first}, 동사는 {affects}.',
        points: [
          ['grammar', '**과거분사의 후치 수식** — {the price (which is) mentioned first} "처음에 **언급된** 가격". 수식어가 길어도 **주어의 핵**({The price})에 동사를 맞춘다 → {affects}.'],
          ['vocab', '**affect** — 동사 "~에 영향을 주다". 명사 {effect}(효과)와 구분({anchoring effect}).'],
          ['reading', '**사례 → 개념** — Nathan 사례를 **앵커링 효과**로 이름 붙이고, 그 **원리**(처음 가격 → 이후 가격 판단)를 설명한다.'],
        ],
      },
      {
        covers: [9],
        en: '[r:For example], [h:if we start with $200], | [r:then] $160 [g:will seem cheap] [h:in comparison].',
        note: '**해석 도움** — {seem + 형용사} 는 "~하게 **보이다**". {in comparison} 은 "(200달러와) **비교해 보면**"이다. 200달러에서 20% 할인하면 **160달러**다.',
        points: [
          ['grammar', '**조건의 if절 + 현재시제** — {if we start with ~}. 조건절에서는 미래 의미도 **현재시제**, 주절에 {will}.'],
          ['grammar', '**seem + 형용사(보어)** — {seem cheap}(○) / {seem cheaply}(×).'],
          ['reading', '**수치 확인** — 200 × 0.8 = **160**. 200달러라는 **닻** 때문에 160달러가 싸게 **느껴질 뿐**, 실제로는 여전히 비싸다.'],
        ],
      },
      {
        covers: [10],
        en: '[r:Furthermore], [r:as] the difference of the two prices [g:becomes bigger], | the effect [g:will be more powerful].',
        note: '**해석 도움** — {as} 는 "~**함에 따라**", 비교급과 함께 "~**할수록**"으로 해석한다. "두 가격의 차이가 **커질수록** 효과는 **더 강력해질** 것이다."',
        points: [
          ['grammar', '**비례의 접속사 as** — {as ~ becomes bigger, ~ will be more powerful}. = {The bigger the difference becomes, the more powerful the effect will be.}'],
          ['grammar', '**the 비교급, the 비교급** — "~할수록 더 …하다". 이 문장을 바꿔 쓰는 문제가 자주 나온다.'],
          ['vocab', '**furthermore** — "게다가, 더욱이"({= moreover, in addition}). 앞 내용에 **정보를 덧붙인다**.'],
        ],
      },
      {
        covers: [11],
        en: '[r:As such], the price mentioned first [g:acts as] an “anchor” | [g:that fixes] our thoughts about the price of an item.',
        note: '**해석 도움** — {act as ~} 는 "~**로서 작용하다**, ~ 역할을 하다". {that fixes ~} 는 {an anchor} 를 꾸미는 **주격 관계대명사절**이다.',
        points: [
          ['grammar', '**act as + 명사** — "~의 역할을 하다"({= serve as}). 이 {as} 는 **전치사**.'],
          ['grammar', '**주격 관계대명사 + 단수동사** — {an “anchor” that fixes ~}. 선행사가 **단수**라 {fixes}.'],
          ['vocab', '**anchor** — 배를 한곳에 **고정하는 닻**. 처음 가격이 닻처럼 우리 생각을 **붙잡아 둔다**는 **비유**다.'],
        ],
      },
    ],
    prompt: `Photorealistic product still life photograph, wide banner composition. A pair of sleek over-ear headphones displayed on a white store shelf, and next to them a small heavy iron ship anchor resting on the same shelf as a visual metaphor, its chain curling gently toward the headphones. Clean minimal electronics shop background softly out of focus. ${LIGHT}, white, silver and soft navy blue. ${NO}, gown, furniture, parade, soccer shoes, shopping bags --ar 16:5 --v 8.1`,
  },

  /* ── Ch5 ─────────────────────────────────────────── */
  {
    no: 5, type: '요지', answer: 5,
    question: '다음 글의 요지로 가장 적절한 것은?',
    summary: 'Jeff와 친구들처럼 우리는 왜 사는지 진지하게 생각하지 않고 물건을 사는 경향이 있어요. 앞의 효과들이 보여 주듯이 많은 것이 우리의 구매에 영향을 미쳐요. 그러니 다음에 무언가를 사기로 결정할 때는 왜 그것을 사려는지 잠시 생각해 보라고 조언해요.',
    mainIdea: 'Since many things influence our purchases, we should think for a moment about why we are buying something before we buy it.',
    titleEn: 'Think before You Buy: Spend Wisely',
    ko: [
      'Jeff와 그의 친구들처럼, 우리는 우리가 왜 물건들을 사는지 진지하게 고려하지 않고 그것들을 구입하는 경향이 있다.',
      '이러한 효과들이 보여 주듯이, 많은 것들이 우리의 구매에 영향을 미친다.',
      '다음번에 여러분이 어떤 것을 구매하려고 결정할 때에는, 자신이 그것을 왜 사려는지 잠시 동안 생각해 보아라.',
    ],
    choices: [
      ['친구가 산 물건은 따라 사는 것이 좋다.', 'Jeff와 친구들은 **따라 하지 말아야 할** 예로 나온다. **정반대**다.'],
      ['할인 상품은 반드시 사야 이익이다.', '할인에 끌리는 것은 **앵커링 효과**의 예일 뿐, 반드시 사라는 말이 아니다.'],
      ['물건을 살 때는 가격만 비교하면 된다.', '가격 비교가 아니라 **왜 사는지** 생각하라고 한다.'],
      ['필요한 물건만 사도록 돈을 모아야 한다.', '돈을 **모으라는** 내용은 없다.'],
      ['물건을 사기 전에 왜 사는지 잠시 생각해야 한다.', '{think for a moment about why you are buying it} — 사기 전 **구매 이유를 생각하라**는 **정답**이다.'],
    ],
    vocab: [
      'just like|전|꼭 ~처럼|exactly like|unlike ~와 달리|—',
      'tend to|동|~하는 경향이 있다|be inclined to|—|tendency 경향',
      'seriously|부|진지하게|earnestly|lightly 가볍게|serious 진지한',
      'consider|동|고려하다, 숙고하다|think about|ignore 무시하다|consideration 고려',
      'effect|명|효과, 영향|result, influence|cause 원인|effective 효과적인',
      'influence|동|영향을 미치다|affect|—|influence 영향(명사) / influential 영향력 있는',
      'purchase|명|구매, 구입|buying|sale 판매|purchase 구입하다(동사)',
      'decide|동|결정하다, 결심하다|choose|—|decision 결정',
      'for a moment|숙|잠시 동안|for a while, briefly|—|moment 순간',
    ],
    flow: [
      ['🔁', '연결 — Jeff와 친구들처럼', '{Just like Jeff and his friends} — 앞의 **밴드왜건 효과** 사례로 돌아가 **우리 모두**의 모습으로 확장한다.'],
      ['🛍️', '문제 — 생각 없이 사는 습관', '우리는 **왜 사는지 진지하게 생각하지 않고** 물건을 사는 경향이 있다.'],
      ['🧩', '근거 — 세 가지 효과', '{As these effects have shown} — 밴드왜건·디드로·앵커링 효과가 보여 주듯 **많은 것**이 구매에 **영향**을 미친다.'],
      ['💭', '결론 — 사기 전에 생각하라', '{think for a moment about why you are buying it} — 다음번엔 **왜 사는지 잠시 생각**해 보라. 단원명 **Spend Wisely** 의 핵심이다.'],
    ],
    cards: [
      {
        covers: [1],
        en: '[r:Just like Jeff and his friends], | we [g:tend to buy] things | [h:without seriously considering] [h:why we are buying them].',
        note: '**해석 도움** — {Just like ~} 는 "**꼭 ~처럼**"이라는 전치사구다. {without -ing} 는 "~**하지 않고**", {why we are buying them} 은 {considering} 의 목적어인 **간접의문문**이다.',
        points: [
          ['grammar', '**전치사 like** — "~처럼". {Just like Jeff ~} 의 {like} 는 **동사가 아니다**.'],
          ['grammar', '**without + (부사) + 동명사** — {without seriously considering}. 부사 {seriously} 가 동명사를 꾸민다.'],
          ['grammar', '**간접의문문** — {why we are buying them}. 의문사 + **주어 + 동사** 어순.'],
        ],
      },
      {
        covers: [2],
        en: '[r:As] these effects [g:have shown], | many things [g:influence] our purchases.',
        note: '**해석 도움** — 여기서 {As} 는 "~**하듯이**, ~처럼"이라는 **양태**의 접속사다. {these effects} 는 앞에서 본 **세 가지 효과**다.',
        points: [
          ['grammar', '**접속사 as 의 다양한 뜻** — ~할 때 / ~ 때문에 / ~함에 따라(본문 2·4) / **~하듯이**(이 문장). **문맥**으로 구분한다.'],
          ['grammar', '**현재완료 have shown** — 지금까지 살펴본 효과들이 **이미 보여 준** 결과를 나타낸다.'],
          ['vocab', '**influence = affect** — "~에 영향을 미치다". 본문 1의 {what affects us} 에 대한 **답**이 이 문장이다.'],
        ],
      },
      {
        covers: [3],
        en: '[r:The next time] you decide to buy something, | [g:think] [h:for a moment] | about [h:why you are buying it].',
        note: '**해석 도움** — {The next time ~} 는 "**다음번에** ~할 때"라는 **접속사처럼** 쓰이는 표현이다. 주절은 동사원형 {think} 로 시작하는 **명령문**이다.',
        points: [
          ['grammar', '**The next time + 주어 + 동사** — "다음에 ~할 때". {when} 처럼 **시간의 부사절**을 이끈다.'],
          ['grammar', '**명령문** — {think ~}. 글쓴이의 **조언·당부**가 담긴 **결론** 문장이다.'],
          ['reading', '**글의 요지** — 구매에 영향을 주는 요인이 많으니, 사기 전에 **구매 이유를 생각하라**. 단원명 **Spend Wisely**(현명하게 소비하라)와 연결된다.'],
        ],
      },
    ],
    prompt: `Photorealistic still life photograph, wide banner composition. A calm clean white desk with a closed wallet lying beside a small notepad and a pencil, a single shopping bag standing unopened next to it, and a small potted plant, suggesting a quiet pause to think before buying. Very minimal, peaceful, lots of empty white space. ${LIGHT}, soft white, sage green and light tan. ${NO}, parade, headphones, anchor, gown, soccer shoes --ar 16:5 --v 8.1`,
  },
];

if (process.argv[1]?.endsWith('_author-L7.mjs')) {
  console.log('✍️  L7 저작');
  for (const c of chapters) writeChapter('L7', SOURCE, c);
}
