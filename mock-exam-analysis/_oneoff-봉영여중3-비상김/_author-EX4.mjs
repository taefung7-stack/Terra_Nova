/* 봉영여중3 Lesson 07 Spend Wisely 추가지문 4 — 12·13번 본문분석 저작
 * 실행: node _author-EX4.mjs  → data/EX4/{12,13}.json
 * 12 The Lipstick Effect: 필기(phenomenon=현상 · When/less 박스 · instead of buy(ing) · bag, 뒤 끊어읽기 · feel+형용사) 반영.
 * 13 The Halo Effect: 필기(Halo=후광 · when 박스 · may 동그라미 + think 밑줄 · promotes=광고하다) 반영.
 * 원본 프린트에 문제가 없어 type/choices 는 분석지 형식을 위해 새로 붙였다(hide_answer 라 인쇄 안 됨). */
import { writeChapter } from './_author.mjs';
import { SOURCE } from './_SOURCE-EX4.js';
import { EXAM, LIGHT, NO } from './_author-EX-1.mjs';

const chapters = [
  /* ── 12 The Lipstick Effect ──────────────────────────── */
  {
    no: 12, exam: EXAM, type: '요지', answer: 4,
    question: '다음 글의 요지로 가장 적절한 것은?',
    summary: '경기가 나쁠 때 사람들은 비싼 제품에 쓰는 돈을 줄이지만, 일상의 작은 즐거움까지 포기하지는 않아요. 비싼 디자이너 가방 대신 새 립스틱이나 작은 향수처럼 비교적 저렴하면서도 기분을 좋게 해 주는 물건을 사는데, 이것을 립스틱 효과라고 해요. 어려운 시기에도 사람들은 감당할 수 있는 방법으로 삶을 즐기려 한다는 것을 보여 주는 경제 현상이에요.',
    mainIdea: 'Even in hard economic times, people still look for affordable ways, like buying a lipstick, to enjoy small pleasures.',
    titleEn: 'The Lipstick Effect: Small Pleasures in Hard Times',
    ko: [
      '립스틱 효과는 흥미로운 경제 현상이다.',
      '경기가 나쁠 때, 사람들은 종종 비싼 제품에 돈을 덜 쓴다.',
      '하지만 그들은 여전히 일상생활에서 작은 즐거움을 누리고 싶어 한다.',
      '예를 들어, 비싼 디자이너 가방을 사는 대신 어떤 사람들은 새 립스틱이나 작은 향수를 살지도 모른다.',
      '이 제품들은 비교적 저렴하지만, 사람들을 행복하게 느끼도록 해 줄 수 있다.',
      '립스틱 효과는 경제적으로 어려운 시기에도 사람들이 여전히 자신의 삶을 즐길 수 있는 감당할 만한(저렴한) 방법을 찾는다는 것을 보여 준다.',
    ],
    choices: [
      ['경기가 나쁠 때는 모든 소비를 줄여야 한다.', '비싼 제품만 줄이고 **작은 즐거움**은 여전히 산다.'],
      ['비싼 명품일수록 사람들을 더 행복하게 만든다.', '오히려 **저렴한** 립스틱·향수가 행복을 준다.'],
      ['립스틱은 경기와 상관없이 꾸준히 팔린다.', '경기가 **나쁠 때** 나타나는 현상을 다룬다.'],
      ['불황에도 사람들은 저렴한 방법으로 작은 즐거움을 찾는다.', '마지막 문장의 결론 — **정답**.'],
      ['경제가 어려우면 사람들은 즐거움을 포기한다.', '{still want to enjoy small pleasures} — 포기하지 **않는다**.'],
    ],
    vocab: [
      'lipstick effect|명|립스틱 효과|—|—|—',
      'economic|형|경제의, 경제적인|financial|—|economy 경제',
      'phenomenon|명|현상|occurrence|—|phenomena 현상들(복수)',
      'economy|명|경제, 경기|—|—|economic 경제의',
      'spend A on B|숙|B에 A(돈·시간)를 쓰다|—|save 아끼다|spending 지출',
      'expensive|형|비싼|costly|inexpensive 저렴한|expense 비용',
      'pleasure|명|즐거움, 기쁨|joy|pain 고통|please 기쁘게 하다',
      'daily life|명|일상생활|everyday life|—|—',
      'instead of|숙|~ 대신에|rather than|—|—',
      'designer bag|명|디자이너(명품) 가방|luxury bag|—|—',
      'perfume|명|향수|fragrance|—|—',
      'relatively|부|비교적, 상대적으로|comparatively|absolutely 절대적으로|relative 상대적인',
      'inexpensive|형|비싸지 않은, 저렴한|cheap|expensive 비싼|—',
      'look for|숙|~을 찾다|search for, seek|—|—',
      'affordable|형|(가격이) 감당할 수 있는, 저렴한|reasonable|unaffordable 너무 비싼|afford ~할 여유가 있다',
      'during|전|~ 동안|throughout|—|—',
    ],
    flow: [
      ['💄', '정의 — 립스틱 효과', '립스틱 효과는 흥미로운 **경제 현상**이다.'],
      ['📉', '상황 — 불황의 소비', '경기가 나쁘면 **비싼 제품**에는 돈을 덜 쓰지만, 일상의 **작은 즐거움**은 여전히 원한다.'],
      ['🛍️', '예시 — 가방 대신 립스틱', '비싼 **디자이너 가방 대신** 새 **립스틱·작은 향수**를 산다 — **비교적 저렴하지만** 행복감을 준다.'],
      ['✨', '결론 — 감당할 만한 즐거움', '어려운 시기에도 사람들은 삶을 즐길 **감당할 만한(affordable) 방법**을 찾는다 — **요지**.'],
    ],
    cards: [
      {
        covers: [1, 2],
        en: '[h:The lipstick effect] is an interesting [g:economic phenomenon]. | [r:When] the economy is bad, | people often spend [g:less] money [r:on] expensive products.',
        note: '**해석 도움** — 립스틱 효과는 흥미로운 **경제 현상**이다. **경기가 나쁠 때** 사람들은 비싼 제품에 **돈을 덜** 쓴다 — 글의 **정의 + 배경 상황**.',
        points: [
          ['vocab', '**[수업 필기] phenomenon = 현상** — 밑줄 + 여백 뜻 "현상". 복수형은 {phenomena}. {economic phenomenon} 경제 현상 / 13번 {psychological phenomenon} 심리 현상.'],
          ['grammar', '**[수업 필기] When (접속사) ~할 때** — 박스 친 {When} 뒤에 **주어 + 동사**({the economy is bad}). 부사절이 앞에 오면 쉼표로 주절과 나눈다.'],
          ['grammar', '**[수업 필기] less = little 의 비교급** — 박스 친 {less money} "**더 적은** 돈". {little – less – least}. 셀 수 없는 명사 {money} 앞이라 {fewer} 가 아니다.'],
          ['vocab', '**spend A on B** — "B에 A를 쓰다". {spend less money on expensive products} 비싼 제품에 돈을 덜 쓰다.'],
        ],
      },
      {
        covers: [3],
        en: '[r:However], they [g:still] [g:want to enjoy] small pleasures in their daily lives.',
        note: '**해석 도움** — **하지만** 그들은 **여전히** 일상의 **작은 즐거움**을 누리고 싶어 한다 — 앞 문장(소비를 줄인다)과 **대조**되는 핵심 전환.',
        points: [
          ['grammar', '**want + to부정사** — {want to enjoy} "**즐기고 싶어 하다**". want 는 to부정사를 목적어로 취한다.'],
          ['reading', '**However 의 역할** — 돈을 덜 쓴다 ↔ 그래도 즐거움은 원한다. 립스틱 효과가 생기는 **이유**가 이 문장에 있다.'],
          ['vocab', '**still / pleasure / daily lives** — 여전히 / 즐거움 / 일상생활({life} 의 복수 {lives}).'],
        ],
      },
      {
        covers: [4],
        en: 'For example, [g:instead of] [g:buying] an expensive designer bag, | some people [g:may buy] a new lipstick or a small perfume.',
        note: '**해석 도움** — 예를 들어, 비싼 **디자이너 가방을 사는 대신** 어떤 사람들은 **새 립스틱이나 작은 향수**를 살지도 모른다 — 립스틱 효과의 **구체적 예시**.',
        points: [
          ['grammar', '**[수업 필기] instead of + 동명사** — 밑줄 친 {instead of} 는 **전치사구**라 뒤에 동사가 오면 {-ing}(동그라미 친 {buy(ing)}). {instead of buy} (×).'],
          ['reading', '**[수업 필기] 끊어읽기 /** — {bag,} 뒤의 사선: 앞은 **부사구**(~ 대신에), 뒤 {some people may buy ~} 가 **주어 + 동사**(주절)의 시작이다.'],
          ['grammar', '**조동사 may + 동사원형** — {may buy} "**살지도 모른다**"(추측). 13번 {may think} 와 같은 may.'],
        ],
      },
      {
        covers: [5],
        en: '[h:These products] are [g:relatively inexpensive], | [r:but] they can [g:make] people [g:feel happy].',
        note: '**해석 도움** — 이 제품들은 **비교적 저렴하지만**, 사람들을 **행복하게 느끼도록** 해 줄 수 있다. {These products} = 립스틱·작은 향수.',
        points: [
          ['grammar', '**[수업 필기] feel + 형용사** — 밑줄 친 {feel happy}. 감각동사 feel 뒤에는 **형용사** 보어({happily} ×).'],
          ['grammar', '**사역동사 make + 목적어 + 동사원형** — {make people feel happy} "사람들을 행복하게 **느끼게 하다**". {to feel} (×).'],
          ['vocab', '**relatively / inexpensive** — 비교적 / 비싸지 않은({in-} 부정 접두사: {expensive} ↔ {inexpensive}).'],
        ],
      },
      {
        covers: [6],
        tags: ['title'],
        en: 'The lipstick effect [g:shows] [r:that] [r:even during] difficult economic times, | people [g:still] [g:look for] [h:affordable ways to enjoy their lives].',
        note: '**해석 도움** — 립스틱 효과는 **경제적으로 어려운 시기에도** 사람들이 여전히 삶을 즐길 **감당할 만한 방법**을 찾는다는 것을 **보여 준다** — **결론(요지) 문장**.',
        points: [
          ['grammar', '**명사절 접속사 that** — {shows that + 주어 + 동사}. that절 안에 {even during ~ times,} 부사구가 끼어 있고 주어는 {people}.'],
          ['grammar', '**during + 명사 vs while + 주어 + 동사** — {during difficult economic times} 처럼 during 뒤에는 **명사(구)**.'],
          ['vocab', '**affordable / look for** — (가격이) **감당할 수 있는·저렴한** / ~을 찾다. {ways to enjoy} 즐길 **방법**(형용사적 to부정사).'],
        ],
      },
    ],
    prompt: `Photorealistic still-life photograph, wide banner composition. A bright minimalist vanity table: one small lipstick in a plain white case and a tiny round perfume bottle stand in sharp focus on a white ceramic tray, while far behind them on a glass shelf a large leather handbag sits softly blurred and out of reach. Calm contrast between a small affordable pleasure and an expensive luxury. ${LIGHT}, white, blush pink and pale beige. ${NO}, sneakers, shoe boxes, watches, pedestal, spotlight, price tags, money, coins`,
  },

  /* ── 13 The Halo Effect ──────────────────────────── */
  {
    no: 13, exam: EXAM, type: '주제', answer: 1,
    question: '다음 글의 주제로 가장 적절한 것은?',
    summary: '후광 효과는 어떤 사람이나 제품의 좋은 점 하나가 그 대상의 다른 점까지 좋게 생각하게 만드는 심리 현상이에요. 영어를 잘하는 학생을 보면 실제로 알지도 못하면서 수학과 과학도 잘할 거라고 생각하는 것이 그 예예요. 광고에서도 좋아하는 연예인이 홍보하면 제품이 훌륭하다고 믿게 되죠. 우리의 판단은 사실보다 첫인상에 좌우되기도 하니, 실제 특성에 근거해 판단하려고 노력해야 해요.',
    mainIdea: 'The halo effect makes one good quality shape our view of other qualities, so we should judge people and products by their actual qualities.',
    titleEn: 'The Halo Effect: When One Good Quality Shines on Everything',
    ko: [
      '후광 효과는 흥미로운 심리 현상이다.',
      '그것은 어떤 사람이나 제품의 한 가지 좋은 특성이 그 대상의 다른 특성들에 대해 우리가 생각하는 방식에 영향을 미칠 때 일어난다.',
      '예를 들어, 여러분이 영어를 아주 잘하는 한 학생을 만난다고 상상해 보라.',
      '여러분은 그 학생의 실제 능력을 알지 못하는데도, 그 학생이 수학과 과학도 잘한다고 생각할지도 모른다.',
      '후광 효과는 광고에서도 볼 수 있다.',
      '유명한 연예인이 어떤 제품을 홍보하면, 사람들은 그 연예인을 좋아하기 때문에 그 제품이 훌륭하다고 믿을지도 모른다.',
      '후광 효과는 우리의 판단이 때때로 사실보다는 첫인상에 영향을 받는다는 것을 보여 준다.',
      '그러므로 우리는 사람과 제품을 그들의 실제 특성에 근거하여 판단하려고 노력해야 한다.',
    ],
    choices: [
      ['한 가지 좋은 특성이 전체 평가에 영향을 미치는 후광 효과', '정의·예시·광고·교훈이 모두 후광 효과를 다룬다 — **정답**.'],
      ['광고에 유명 연예인을 써야 하는 이유', '광고는 후광 효과의 **예시** 중 하나일 뿐이다.'],
      ['외국어 실력과 수학 실력의 관계', '실제 능력을 **모르는데도** 그렇게 생각하는 착각의 예시이다.'],
      ['좋은 첫인상을 만드는 방법', '오히려 첫인상보다 **사실**로 판단하라고 한다.'],
      ['심리학 연구의 역사', '연구의 역사는 다루지 않는다.'],
    ],
    vocab: [
      'halo effect|명|후광 효과|—|—|halo 후광',
      'psychological|형|심리의, 심리적인|mental|physical 신체의|psychology 심리학',
      'phenomenon|명|현상|occurrence|—|phenomena 현상들(복수)',
      'quality|명|특성, 자질; 품질|trait, feature|—|qualities 특성들(복수)',
      'influence|동|영향을 미치다|affect|—|influential 영향력 있는',
      'be good at|숙|~을 잘하다|be skilled at|be poor at ~을 못하다|—',
      'even though|접|비록 ~이지만, ~인데도|although|—|—',
      'actual|형|실제의|real|imaginary 상상의|actually 실제로',
      'ability|명|능력|skill|inability 무능|able ~할 수 있는',
      'advertising|명|광고|commercials|—|advertise 광고하다',
      'celebrity|명|유명 인사, 연예인|star|—|celebrated 유명한',
      'promote|동|홍보하다, 광고하다|advertise|—|promotion 홍보',
      'excellent|형|훌륭한, 뛰어난|outstanding|poor 형편없는|excellence 탁월함',
      'judgment|명|판단|decision|—|judge 판단하다',
      'first impression|명|첫인상|—|—|impress 감명을 주다',
      'rather than|숙|~보다는|instead of|—|—',
      'judge|동|판단하다, 평가하다|evaluate|—|judgment 판단',
      'based on|숙|~에 근거하여|according to|—|basis 근거',
    ],
    flow: [
      ['😇', '정의 — 후광 효과', '**한 가지 좋은 특성**이 그 대상의 **다른 특성**에 대한 생각에까지 영향을 미치는 **심리 현상**.'],
      ['🎓', '예시 1 — 영어 잘하는 학생', '영어를 잘하면 실제 능력을 **모르는데도** 수학·과학까지 잘할 거라 생각한다.'],
      ['📺', '예시 2 — 연예인 광고', '좋아하는 **연예인이 홍보**하면 제품도 **훌륭하다고** 믿는다.'],
      ['⚖️', '교훈 — 사실로 판단하기', '판단은 **첫인상**에 좌우되기 쉬우니 **실제 특성**에 근거해 판단해야 한다 — **주제**.'],
    ],
    cards: [
      {
        covers: [1, 2],
        tags: ['title'],
        en: '[h:The halo effect] is an interesting [g:psychological phenomenon]. | It happens [r:when] [h:one good quality] of a person or product | [g:influences] [r:how] we think about their other qualities.',
        note: '**해석 도움** — 후광 효과는 **심리 현상**이다. 어떤 사람이나 제품의 **좋은 특성 하나**가 그 대상의 **다른 특성들**에 대한 우리의 생각에 **영향을 줄 때** 일어난다 — **정의 문장**.',
        points: [
          ['vocab', '**[수업 필기] Halo = 후광** — 제목 {Halo} 밑줄 + 뜻 "후광". 성화 속 인물 머리 뒤의 빛처럼, 좋은 점 하나가 **전체를 환하게** 보이게 한다는 뜻의 이름.'],
          ['grammar', '**[수업 필기] when (접속사) ~할 때** — 박스 친 {when} 뒤에 **주어 + 동사**: S {one good quality of a person or product} → V {influences}(주어가 {quality} 단수라 -s).'],
          ['grammar', '**간접의문문 how + 주어 + 동사** — {influences how we think ~} "우리가 **어떻게** 생각하는지에 영향을 주다". {how do we think} (×).'],
          ['vocab', '**quality / qualities** — 여기서는 "품질"이 아니라 사람·사물의 **특성, 자질**. {their} = 그 사람(제품)의.'],
        ],
      },
      {
        covers: [3],
        en: 'For example, [g:imagine] [r:that] you meet a student | [r:who] is very [g:good at] English.',
        note: '**해석 도움** — 예를 들어, **영어를 아주 잘하는** 학생을 만난다고 **상상해 보라** — 첫 번째 예시의 시작.',
        points: [
          ['grammar', '**명령문 imagine + that절** — "~라고 **상상해 보라**". 9번 지문 {imagine that a company releases ~} 와 같은 예시 도입.'],
          ['grammar', '**주격 관계대명사 who** — {a student who is very good at English}. 선행사가 사람이라 who.'],
          ['vocab', '**be good at** — "~을 **잘하다**". 반대는 {be poor at}.'],
        ],
      },
      {
        covers: [4],
        en: 'You [g:may think] [r:that] the student is [g:also] good at math and science, | [r:even though] you do not know their [h:actual abilities].',
        note: '**해석 도움** — 실제 능력을 **알지 못하는데도** 그 학생이 수학과 과학**도** 잘한다고 생각**할지도 모른다** — 한 가지 장점(영어)이 다른 특성(수학·과학) 판단으로 번지는 **후광 효과**.',
        points: [
          ['grammar', '**[수업 필기] 조동사 may + 동사원형** — 동그라미 친 {may} + 밑줄 친 {think}. "**생각할지도 모른다**"(추측). may 뒤에는 동사원형({thinks} ×).'],
          ['grammar', '**even though + 주어 + 동사 (양보)** — "비록 ~이지만, **~인데도**". {even though you do not know ~}. {despite} 뒤에는 명사.'],
          ['vocab', '**actual / ability** — 실제의 / 능력({abilities} 복수). 마지막 문장 {actual qualities} 와 연결된다.'],
        ],
      },
      {
        covers: [5, 6],
        en: 'The halo effect [g:can also be seen] in advertising. | [r:When] a famous celebrity [g:promotes] a product, | people [g:may believe] [r:that] the product is excellent | [r:because] they like the celebrity.',
        note: '**해석 도움** — 후광 효과는 **광고**에서도 볼 수 있다. 유명 **연예인이 제품을 홍보**하면 사람들은 그 연예인을 **좋아하기 때문에** 제품도 훌륭하다고 믿을지도 모른다 — **두 번째 예시**.',
        points: [
          ['grammar', '**조동사 + 수동태 can be seen** — "**볼 수 있다**(보일 수 있다)". (조동사 + be + 과거분사).'],
          ['vocab', '**[수업 필기] promote = 광고하다** — 밑줄 + 여백 뜻 "광고하다". 정확히는 "(상품을) **홍보하다**"이며, 사람을 목적어로 쓰면 "승진시키다"도 된다({promote him} 그를 승진시키다). 명사 {promotion} 홍보.'],
          ['grammar', '**because + 주어 + 동사** — {because they like the celebrity}. 이유가 제품 자체가 아니라 **연예인에 대한 호감**이라는 점이 후광 효과의 핵심.'],
        ],
      },
      {
        covers: [7, 8],
        en: 'The halo effect shows [r:that] our judgments [g:are] sometimes [g:influenced by] first impressions | [h:rather than facts]. | [r:Therefore], we should [g:try to judge] people and products | [g:based on] their actual qualities.',
        note: '**해석 도움** — 우리의 판단은 때때로 **사실보다는 첫인상**에 영향을 받는다. **그러므로** 사람과 제품을 **실제 특성에 근거하여** 판단하려고 노력해야 한다 — **결론 + 교훈**.',
        points: [
          ['grammar', '**수동태 be influenced by** — {our judgments are influenced by first impressions} "판단이 첫인상**에 의해 영향을 받는다**". 주어 {judgments} 복수 → {are}.'],
          ['grammar', '**try + to부정사 / based on** — {try to judge} "판단하**려고 노력하다**"({try -ing} 는 "시험 삼아 ~해 보다"). {based on} "~에 근거하여".'],
          ['vocab', '**rather than / first impression / judgment** — ~보다는 / 첫인상 / 판단. {judge}(동사) → {judgment}(명사).'],
        ],
      },
    ],
    prompt: `Photorealistic still-life photograph, wide banner composition. A rustic wooden crate full of ordinary red apples at a bright market stall; one apple in the center is wrapped in a soft circular glow of light like a gentle halo, making it look special, while all the apples around it are plainly the same. Quiet contrast between one shining quality and the unexamined rest. ${LIGHT}, fresh red, warm wood brown and soft cream. ${NO}, desk, books, textbooks, cards, sneakers, shoe boxes, handbags, lipstick, perfume, pedestal, stage, spotlight beam, price tags`,
  },
];

for (const c of chapters) writeChapter('EX4', SOURCE, c);
