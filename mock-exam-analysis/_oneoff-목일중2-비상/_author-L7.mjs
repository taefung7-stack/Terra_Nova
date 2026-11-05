/* 목일중2 비상(황종배) Lesson 7 Food Brings Us Together — 본문분석 저작
 * 실행: node _author-L7.mjs  → data/L7/{1..4}.json
 * 해석은 교과서 본문 PDF(목일중 7과.pdf) 오른쪽 단의 우리말을 문장 단위로 나눠 옮겼다(인명은 한글 표기).
 * 원본에 문제가 없어 type/choices 는 분석지 형식을 위해 새로 붙였다(hide_answer 라 인쇄 안 됨). */
import { writeChapter } from './_author.mjs';
import { SOURCE } from './_SOURCE-L7.js';

const LIGHT = 'natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette';
const NO = '--no text, letters, words, numbers, signage, logo, brand, watermark, people, person, hands, faces, sunset, golden hour, night, dark moody grading, heavy shadows';

const chapters = [
  /* ── Ch1 민찬 — 김장 ─────────────────────────── */
  {
    no: 1, type: '주제', answer: 2,
    question: '다음 글의 주제로 가장 적절한 것은?',
    summary: '민찬이는 오늘 가족과 함께 할머니 댁에서 김장을 해요. 김장은 겨울이 오기 전에 함께 모여 많은 김치를 담그는 한국의 문화적 전통이에요. 하지만 김장은 단순히 김치를 만드는 일이 아니라 가족과 함께 시간을 보내는 일이기도 해요. 민찬이는 함께 모이는 것은 언제나 좋다고 말하며, 여러분에게도 특별한 음식 전통이 있는지 물어요.',
    mainIdea: 'Gimjang is a Korean tradition of making a lot of kimchi together before winter, and it is also about spending time with family.',
    titleEn: 'Gimjang: More Than Making Kimchi',
    ko: [
      '안녕하세요, 저는 민찬이에요!',
      '오늘 저희 가족과 저는 김장을 하기 위해 할머니 댁에 있어요.',
      '김장은 무엇일까요?',
      '그것은 겨울이 오기 전에 함께 모여 많은 김치를 만드는 한국의 문화적 전통이에요.',
      '김장은 김치를 만드는 것 이상이에요.',
      '그것은 또한 가족과 시간을 보내는 것에 관한 것이에요.',
      '함께 모이는 것은 언제나 좋아요.',
      '여러분도 어떤 특별한 음식 전통이 있나요?',
    ],
    choices: [
      ['김치를 맛있게 담그는 방법', '만드는 **방법**은 나오지 않는다.'],
      ['가족이 함께 모여 김치를 담그는 김장 문화', '김장의 뜻과 **가족과 함께하는 의미** — **정답**.'],
      ['겨울철 건강을 지키는 음식', '김장은 겨울 **전**에 하는 일일 뿐, 건강 이야기는 없다.'],
      ['할머니 댁에 가는 이유', '할머니 댁은 김장을 하는 **장소**일 뿐이다.'],
      ['세계 여러 나라의 김치', '한국의 전통만 다룬다(다른 나라 음식은 다음 글).'],
    ],
    vocab: [
      'gimjang|명|김장|—|—|—',
      'cultural|형|문화의, 문화적인|—|—|culture 문화',
      'tradition|명|전통|custom|—|traditional 전통적인',
      'get together|숙|모이다, 함께 모이다|gather|—|get-together 모임',
      'a lot of|숙|많은|lots of, many, much|a few, a little 약간의|—',
      'before|접|~하기 전에|—|after ~한 후에|—',
      'more than|숙|~ 이상의, ~보다 많은|—|less than ~보다 적은|—',
      'spend time with|숙|~와 시간을 보내다|—|—|—',
      'always|부|항상, 언제나|all the time|never 결코 ~않다|—',
      'special|형|특별한|unique|ordinary 평범한|specially 특별히',
    ],
    flow: [
      ['👋', '자기소개 — 할머니 댁의 민찬', '민찬이는 오늘 가족과 함께 **김장을 하기 위해** 할머니 댁에 있다.'],
      ['🥬', '정의 — 김장이란?', '**겨울이 오기 전에** 함께 모여 **많은 김치를 담그는** 한국의 **문화적 전통**이다.'],
      ['👨‍👩‍👧', '의미 — 김치 그 이상', '김장은 김치를 만드는 것 **이상**으로, **가족과 시간을 보내는 일**이다 — **주제**.'],
      ['❓', '질문 — 여러분은?', '함께 모이는 것은 늘 좋다며 독자에게 **특별한 음식 전통**이 있는지 묻는다(다음 화자로 연결).'],
    ],
    cards: [
      {
        covers: [1, 2],
        en: 'Hello, I’m Minchan! | Today, my family and I [g:are] at my grandmother’s house | [r:to do] gimjang.',
        note: '**해석 도움** — 민찬이가 자기를 소개하고, 오늘 **김장을 하러** 할머니 댁에 와 있다고 말한다.',
        points: [
          ['grammar', '**주어가 둘이면 복수 동사** — {my family and I} 는 두 사람 이상이므로 be동사 {are}.'],
          ['grammar', '**to부정사 부사적 용법(목적)** — {to do gimjang} "**김장을 하기 위해**". 왜 할머니 댁에 있는지를 알려 준다.'],
          ['vocab', '**grandmother’s house** — 소유격 {’s} "할머니**의** 집". {I’m} = {I am}.'],
        ],
      },
      {
        covers: [3, 4],
        tags: ['title'],
        en: 'What is gimjang? | [h:It] is a Korean cultural tradition | [g:to get together and make] a lot of kimchi | [r:before] winter comes.',
        note: '**해석 도움** — 김장은 **겨울이 오기 전에** 함께 모여 **많은 김치를 만드는** 한국의 문화적 전통이다 — **정의 문장**.',
        points: [
          ['grammar', '**형용사적 to부정사** — {a Korean cultural tradition to get together and make ~} "~하는 전통". to 하나에 {get} 과 {make} 가 and 로 이어졌다.'],
          ['grammar', '**시간 부사절은 현재시제** — {before winter comes}. 미래의 일이어도 {will come} 을 쓰지 않는다. {comes}(3인칭 단수 -s).'],
          ['vocab', '**cultural tradition / get together** — 문화적 전통 / 모이다. {It} = gimjang.'],
        ],
      },
      {
        covers: [5, 6],
        en: 'Gimjang is [g:more than] [g:making] kimchi. | It’s also about [g:spending] time with family.',
        note: '**해석 도움** — 김장은 김치를 만드는 것 **이상**이다. **가족과 시간을 보내는 것**에 관한 일이기도 하다 — 글의 **핵심 의미**.',
        points: [
          ['grammar', '**전치사 뒤 동명사** — {than making}, {about spending}. 전치사(than·about) 뒤에 동사가 오면 {-ing}.'],
          ['vocab', '**more than ~ / spend time with ~** — "~ **이상**의" / "~와 **시간을 보내다**".'],
          ['reading', '**also 의 역할** — 김치를 만드는 일 + **가족과 보내는 시간**. 두 가지 의미를 더해 김장의 가치를 넓힌다.'],
        ],
      },
      {
        covers: [7, 8],
        en: '[h:It] is always good [g:to get together]. | Do you also have any special food traditions?',
        note: '**해석 도움** — **함께 모이는 것**은 언제나 좋다. 여러분도 **특별한 음식 전통**이 있나요? — 다음 화자(에밀)로 넘어가는 질문.',
        points: [
          ['grammar', '**가주어 It ~ 진주어 to부정사** — {It is always good to get together} "**함께 모이는 것은** 언제나 좋다". It 은 뜻이 없고 진짜 주어는 {to get together}.'],
          ['grammar', '**빈도부사 always 의 위치** — be동사 **뒤**({is always good}), 일반동사 **앞**({always find}).'],
          ['vocab', '**any + 복수명사(의문문)** — {any special food traditions} "어떤 특별한 음식 전통이라도".'],
        ],
      },
    ],
    prompt: `Photorealistic still-life photograph, wide banner composition. A traditional Korean wooden floor covered with large round plastic basins full of salted napa cabbage halves and a big bowl of bright red kimchi seasoning, ceramic onggi jars in the background, a warm family home atmosphere without anyone in the frame. ${LIGHT}, fresh green, warm red and soft beige. ${NO}, gloves, chopsticks, bread, noodles, market stalls --ar 16:5 --v 8.1`,
  },

  /* ── Ch2 에밀 — 플랫브레드 ─────────────────────────── */
  {
    no: 2, type: '내용일치', answer: 4,
    question: '다음 글의 내용과 일치하는 것은?',
    summary: '아제르바이잔에서 온 에밀에게도 비슷한 문화적 전통이 있어요. 이모의 결혼식 사진 속 신부의 어깨에는 커다란 플랫브레드가 걸려 있는데, 빵을 어깨 위에 올리면 행운이 온다고 믿기 때문이에요. 플랫브레드는 밀가루·소금·물로만 만드는데, 평소에도 끼니마다 먹지만 특별한 날에는 더 크게 만들어서 공동체 사람들이 모두 모여 도와요. 함께 빵을 굽는 일은 공동체를 더 단단하게 만들어요.',
    mainIdea: 'In Azerbaijan, people put a big flatbread on a bride’s shoulder for good luck, and baking it together makes the community stronger.',
    titleEn: 'A Flatbread That Brings Good Luck',
    ko: [
      '안녕하세요, 저는 에밀이에요!',
      '아제르바이잔에도 이런 종류의 문화적 전통이 있어요.',
      '여기 제 이모 결혼식 사진이 있어요.',
      '그녀의 어깨 위에 있는 물건이 보이나요?',
      '그것은 플랫브레드예요.',
      '그것은 매우 커서 그녀의 어깨를 덮어요.',
      '우리는 그 빵을 어깨 위에 올려두는 것이 행운을 가져온다고 믿어요.',
      '플랫브레드는 밀가루, 소금, 물로만 만들어져요.',
      '우리는 매 끼니에 이 빵을 먹지만, 특별한 날에는 더 크게 만들어요.',
      '그래서 공동체에 있는 모든 사람이 함께 모여서 도와줘요.',
      '함께 빵을 굽는 일은 우리 공동체를 더욱 단단하게 만들어 줘요.',
    ],
    choices: [
      ['플랫브레드는 결혼식 날에만 먹는다.', '{We eat this bread at every meal} — **매 끼니** 먹는다.'],
      ['플랫브레드에는 설탕과 우유가 들어간다.', '**밀가루·소금·물로만** 만든다.'],
      ['빵을 머리 위에 올리면 행운이 온다고 믿는다.', '머리가 아니라 **어깨** 위다.'],
      ['특별한 날에는 빵을 더 크게 만든다.', '{we make it bigger on special days} — **정답**.'],
      ['빵은 가족끼리만 조용히 굽는다.', '**공동체의 모든 사람**이 모여 돕는다.'],
    ],
    vocab: [
      'this kind of|숙|이런 종류의|this sort of|—|—',
      'Azerbaijan|명|아제르바이잔(나라)|—|—|Azerbaijani 아제르바이잔의',
      'aunt|명|이모, 고모, 숙모|—|uncle 삼촌|—',
      'wedding|명|결혼식|marriage ceremony|—|wed 결혼하다',
      'shoulder|명|어깨|—|—|—',
      'flatbread|명|플랫브레드(납작한 빵)|—|—|flat 납작한',
      'so ~ that ...|숙|너무 ~해서 …하다|—|—|—',
      'cover|동|덮다|—|uncover 덮개를 벗기다|cover 덮개',
      'believe|동|믿다|think|doubt 의심하다|belief 믿음',
      'good luck|명|행운|fortune|bad luck 불운|lucky 운이 좋은',
      'be made from|숙|~으로 만들어지다|—|—|—',
      'flour|명|밀가루|—|—|—',
      'meal|명|식사, 끼니|—|—|—',
      'community|명|공동체, 지역 사회|society|—|communal 공동의',
      'help out|숙|(일을) 돕다|assist|—|helpful 도움이 되는',
      'bake|동|(빵 등을) 굽다|—|—|baker 제빵사',
      'stronger|형|더 강한, 더 단단한 (strong 의 비교급)|—|weaker 더 약한|strength 힘',
    ],
    flow: [
      ['🇦🇿', '연결 — 아제르바이잔에도', '에밀은 아제르바이잔에도 **이런 종류의 문화적 전통**이 있다며 이모 결혼식 사진을 보여 준다.'],
      ['🫓', '사진 — 어깨 위의 빵', '신부의 어깨 위 물건은 **플랫브레드**다. **너무 커서 어깨를 덮는다.**'],
      ['🍀', '의미 — 행운의 믿음', '빵을 어깨 위에 올려두면 **행운을 가져온다**고 믿는다.'],
      ['🤝', '공동체 — 함께 굽는 빵', '평소에도 먹지만 특별한 날엔 **더 크게** 만들어 **모두가 모여 돕고**, 함께 굽는 일이 **공동체를 더 단단하게** 한다.'],
    ],
    cards: [
      {
        covers: [1, 2, 3],
        en: 'Hi, I’m Emil! | We also have [h:this kind of] cultural tradition in Azerbaijan. | [g:Here’s] a picture from my aunt’s wedding.',
        note: '**해석 도움** — 에밀은 아제르바이잔에도 **이런 종류의(김장과 같은)** 문화적 전통이 있다고 말하며 이모의 결혼식 사진을 소개한다.',
        points: [
          ['reading', '**this kind of 가 가리키는 것** — 앞 글(민찬)의 **함께 모여 음식을 만드는 전통**. 두 글을 잇는 연결어다.'],
          ['grammar', '**Here is + 단수명사** — {Here’s a picture} "**여기** 사진이 **있어요**". 복수명사면 {Here are}.'],
          ['vocab', '**aunt / wedding** — 이모·고모·숙모 / 결혼식. {aunt’s} 소유격.'],
        ],
      },
      {
        covers: [4, 5, 6],
        en: 'Do you see [h:the thing] on her shoulder? | It’s a flatbread. | It is [g:so] big [g:that] it covers her shoulder.',
        note: '**해석 도움** — 어깨 위의 물건은 **플랫브레드**다. 그것은 **매우 커서** 어깨를 **덮는다**.',
        points: [
          ['grammar', '**so + 형용사 + that + 주어 + 동사** — "너무 ~해서 …하다". {so big that it covers her shoulder} "매우 커서 어깨를 덮는다"(결과).'],
          ['grammar', '**3인칭 단수 현재 -s** — 주어 {it}(빵)이므로 {covers}.'],
          ['vocab', '**flatbread / shoulder** — 납작한 빵 / 어깨. {It’s} = {It is}.'],
        ],
      },
      {
        covers: [7],
        tags: ['title'],
        en: 'We believe [r:that] [h:putting the bread over the shoulder] [g:brings] good luck.',
        note: '**해석 도움** — 빵을 **어깨 위에 올려두는 것**이 **행운을 가져온다**고 믿는다 — 어깨 위 빵의 **이유**.',
        points: [
          ['grammar', '**명사절 접속사 that** — {believe that + 주어 + 동사} "~라고 믿다". that 은 생략할 수 있다.'],
          ['grammar', '**동명사 주어는 단수 취급** — 주어 {putting the bread over the shoulder}(~을 올려두는 것) → 동사 {brings}.'],
          ['vocab', '**bring good luck / over** — 행운을 가져오다 / ~ 위에(덮듯이).'],
        ],
      },
      {
        covers: [8, 9],
        en: 'A flatbread [g:is made] only [g:from] flour, salt, and water. | We eat this bread at every meal, | [r:but] we make it [g:bigger] on special days.',
        note: '**해석 도움** — 플랫브레드는 **밀가루·소금·물로만** 만든다. 끼니마다 먹지만 **특별한 날에는 더 크게** 만든다.',
        points: [
          ['grammar', '**수동태 be made from** — "~으로 **만들어지다**". 재료의 형태가 바뀌면(밀가루 → 빵) {from}, 그대로 보이면 {of}.'],
          ['grammar', '**make + 목적어 + 형용사(비교급)** — {make it bigger} "그것을 **더 크게** 만들다". {big – bigger – biggest}(g 를 겹쳐 쓴다).'],
          ['vocab', '**every meal / special days** — 매 끼니(every + 단수명사) / 특별한 날.'],
        ],
      },
      {
        covers: [10, 11],
        en: '[r:So], everyone in the community [g:gets] together and [g:helps] out. | [h:Baking the bread together] [g:makes] our community [g:stronger].',
        note: '**해석 도움** — **그래서** 공동체의 모든 사람이 모여 돕는다. **함께 빵을 굽는 일**은 공동체를 **더 단단하게** 만든다 — 이 전통의 **의미**.',
        points: [
          ['grammar', '**everyone 은 단수 취급** — {everyone ~ gets ~ and helps}. 둘 다 3인칭 단수 -s.'],
          ['grammar', '**동명사 주어 + make + 목적어 + 형용사** — {Baking the bread together}(단수) → {makes}, {our community stronger} 공동체를 **더 강하게**.'],
          ['reading', '**So 의 역할** — 특별한 날 빵이 **크다**(원인) → 혼자 못 하니 **모두가 모여 돕는다**(결과).'],
        ],
      },
    ],
    prompt: `Photorealistic still-life photograph, wide banner composition. A huge thin round golden flatbread draped over the back of a carved wooden chair beside a rustic table, with a small bowl of white flour, a pinch of coarse salt and a clay water jug on the table, a softly blurred festive room with simple white fabric decorations behind. ${LIGHT}, warm wheat beige, cream and soft terracotta. ${NO}, kimchi, cabbage, noodles, food stalls, bride, dress --ar 16:5 --v 8.1`,
  },

  /* ── Ch3 비비안 — 호커 센터 ─────────────────────────── */
  {
    no: 3, type: '제목', answer: 1,
    question: '다음 글의 제목으로 가장 적절한 것은?',
    summary: '싱가포르의 비비안은 호커 센터를 소개해요. 호커는 길거리에서 음식을 파는 사람들인데, 그들이 모여 호커 센터를 만들었고 이 센터들은 거대한 음식 공동체가 되었어요. 호커 센터는 아주 인기가 많아서 늘 사람들로 가득하고, 중국식 국수부터 말레이시아식 카레, 인도네시아식 사테까지 온갖 음식이 있어요.',
    mainIdea: 'Hawker centers in Singapore, formed by street food sellers, have become a huge and popular food community with all kinds of food.',
    titleEn: 'Hawker Centers: Singapore’s Huge Food Community',
    ko: [
      '저는 비비안이에요!',
      '여러분은 싱가포르에 있는 호커 센터에 대해 들어 본 적 있나요?',
      '호커는 길거리에서 음식을 파는 사람들을 말해요.',
      '그들이 호커 센터를 만들었고, 이 센터들이 거대한 음식 공동체가 되었어요.',
      '이 센터들은 매우 인기 있어서 늘 사람들로 가득 차요.',
      '중국식 국수부터 말레이시아식 카레, 인도네시아식 사테까지 모든 종류의 음식들이 있어요.',
    ],
    choices: [
      ['Hawker Centers: Singapore’s Huge Food Community', '호커 센터의 탄생·인기·다양한 음식 — **정답**.'],
      ['How to Cook Malaysian Curry', '카레는 여러 음식 중 **하나의 예**일 뿐이다.'],
      ['The History of Chinese Noodles', '국수의 역사는 다루지 않는다.'],
      ['Why Street Food Is Unhealthy', '건강 이야기는 나오지 않는다.'],
      ['Life as a Hawker in Singapore', '호커 한 사람의 삶이 아니라 **센터**를 소개한다.'],
    ],
    vocab: [
      'hear of|숙|~에 대해 듣다|—|—|—',
      'hawker center|명|호커 센터(싱가포르의 대형 노점 식당가)|food court|—|—',
      'hawker|명|노점상, 행상인|street vendor|—|—',
      'sell|동|팔다 (sell-sold-sold)|—|buy 사다|sale 판매',
      'form|동|형성하다, 만들다|create|—|formation 형성',
      'huge|형|거대한|enormous|tiny 아주 작은|—',
      'community|명|공동체|—|—|—',
      'popular|형|인기 있는|well-liked|unpopular 인기 없는|popularity 인기',
      'be full of|숙|~으로 가득 차다|be filled with|be empty 비어 있다|—',
      'all kinds of|숙|모든 종류의|various|—|—',
      'from A to B|숙|A부터 B까지|—|—|—',
      'satay|명|사테(꼬치구이 요리)|—|—|—',
    ],
    flow: [
      ['🇸🇬', '질문 — 호커 센터를 아나요?', '비비안은 싱가포르의 **호커 센터**를 들어 봤는지 묻는다.'],
      ['🛒', '정의 — 호커란?', '**호커**는 길거리에서 음식을 파는 사람들이다.'],
      ['🏬', '탄생 — 거대한 음식 공동체', '호커들이 **호커 센터를 만들었고**, 센터는 **거대한 음식 공동체**가 되었다.'],
      ['🍜', '특징 — 늘 붐비는 다양한 음식', '**매우 인기 있어서** 늘 사람들로 가득하고, 국수·카레·사테 등 **모든 종류의 음식**이 있다.'],
    ],
    cards: [
      {
        covers: [1, 2],
        en: 'I’m Vivian! | [g:Have] you [g:heard] of hawker centers in Singapore?',
        note: '**해석 도움** — 세 번째 화자 비비안이 싱가포르의 **호커 센터를 들어 본 적 있는지** 묻는다.',
        points: [
          ['grammar', '**현재완료(경험) 의문문** — {Have you heard of ~?} "~에 대해 **들어 본 적 있나요**?" (Have + 주어 + 과거분사). hear 의 과거분사 {heard}.'],
          ['vocab', '**hear of / hawker center** — ~에 대해 듣다 / 호커 센터(대형 노점 식당가).'],
        ],
      },
      {
        covers: [3],
        en: 'Hawkers are people [r:who] [g:sell] food on the street.',
        note: '**해석 도움** — **호커**는 길거리에서 음식을 **파는 사람들**이다 — 낯선 말의 **정의**.',
        points: [
          ['grammar', '**주격 관계대명사 who** — {people who sell food} "음식을 **파는** 사람들". 선행사가 사람이면 who, 선행사 {people}(복수) → {sell}.'],
          ['vocab', '**on the street** — 길거리에서. {sell} 팔다(sell–sold–sold).'],
        ],
      },
      {
        covers: [4],
        tags: ['title'],
        en: 'They [g:formed] the hawker centers | and these centers [g:have become] a huge food community.',
        note: '**해석 도움** — 호커들이 호커 센터를 **만들었고**, 이 센터들은 **거대한 음식 공동체가 되었다**.',
        points: [
          ['grammar', '**과거 vs 현재완료** — {formed}(과거에 만들었다, 끝난 일) / {have become}(되었고 **지금도** 그렇다). become 의 과거분사는 {become}(become–became–become).'],
          ['vocab', '**form / huge / community** — 형성하다 / 거대한 / 공동체. {They} = hawkers.'],
        ],
      },
      {
        covers: [5, 6],
        en: 'These centers are [g:so] popular [g:that] they are always [h:full of] people. | There are all kinds of food, | [g:from] Chinese noodles [g:to] Malaysian curry [g:to] Indonesian satay.',
        note: '**해석 도움** — 센터들은 **매우 인기 있어서** 늘 사람들로 **가득하다**. 중국식 국수**부터** 말레이시아식 카레, 인도네시아식 사테**까지** 모든 음식이 있다.',
        points: [
          ['grammar', '**so + 형용사 + that ~** — {so popular that they are always full of people} "너무 인기 있어서 늘 붐빈다". 에밀 글의 {so big that ~} 과 같은 구조.'],
          ['grammar', '**There are + 복수명사** — {There are all kinds of food} "모든 종류의 음식이 **있다**".'],
          ['vocab', '**from A to B (to C)** — "A**부터** B, C**까지**"(범위). {be full of} ~으로 가득 차다.'],
        ],
      },
    ],
    prompt: `Photorealistic interior photograph, wide banner composition. A spacious open-air Singapore-style hawker center under a high airy roof: long rows of small food stall counters with steaming woks and noodle pots, many round tables with simple stools in the foreground, bowls of noodles, curry and satay skewers on a counter, completely empty of diners. ${LIGHT}, bright white, soft teal and warm orange accents. ${NO}, kimchi, flatbread, menus, price boards, wooden crates --ar 16:5 --v 8.1`,
  },

  /* ── Ch4 비비안 — 호커 문화를 사랑하는 이유 ─────────────────────────── */
  {
    no: 4, type: '요지', answer: 3,
    question: '다음 글의 요지로 가장 적절한 것은?',
    summary: '비비안과 친구들은 서로 다른 나라 출신이라 음식 취향도 모두 달라요. 하지만 호커 센터에서는 언제나 각자 좋아하는 음식을 찾을 수 있어요. 때로는 낯선 사람과 테이블을 함께 쓰다가 친구가 되기도 해요. 좋은 사람들과 함께 음식을 즐기는 것이 재미있기 때문에 비비안은 호커 문화를 사랑해요.',
    mainIdea: 'At hawker centers, people with different tastes can all find food they like and even make new friends, which is why Vivian loves hawker culture.',
    titleEn: 'Different Tastes, One Table',
    ko: [
      '제 친구들과 저는 서로 다른 나라 출신이에요.',
      '우리는 모두 음식 취향이 달라요.',
      '하지만 호커 센터에서 우리는 항상 우리가 좋아하는 것을 찾을 수 있어요.',
      '때때로 우리는 낯선 사람들과 테이블을 함께 쓰다가 친구가 되기도 해요.',
      '좋은 사람들과 함께 음식을 즐기는 건 재미있어요.',
      '그게 제가 이 호커 문화를 사랑하는 이유예요.',
    ],
    choices: [
      ['음식 취향이 다른 사람과는 친구가 되기 어렵다.', '오히려 낯선 사람과 **친구가 되기도** 한다.'],
      ['호커 센터의 음식은 값이 싸서 인기가 많다.', '**가격** 이야기는 나오지 않는다.'],
      ['호커 센터에서는 누구나 좋아하는 음식을 찾고 함께 어울릴 수 있다.', '다양한 음식 + 함께 즐기는 즐거움 — **정답**.'],
      ['외국 음식은 자기 나라 음식보다 맛이 없다.', '취향이 **다를** 뿐, 맛을 비교하지 않는다.'],
      ['식사는 가족과만 하는 것이 좋다.', '**낯선 사람**과도 식탁을 함께 쓴다.'],
    ],
    vocab: [
      'be from|숙|~ 출신이다|come from|—|—',
      'different|형|다른|various|same 같은|difference 차이',
      'country|명|나라|nation|—|—',
      'taste|명|취향, 입맛; 맛|preference|—|tasty 맛있는',
      'find|동|찾다, 발견하다 (find-found-found)|discover|lose 잃어버리다|—',
      'share|동|함께 쓰다, 나누다|—|—|share 몫',
      'stranger|명|낯선 사람|—|friend 친구|strange 낯선',
      'end up -ing|숙|결국 ~하게 되다|—|—|—',
      'enjoy|동|즐기다|—|—|enjoyable 즐거운',
      'that’s why|숙|그것이 ~한 이유이다, 그래서 ~하다|—|—|—',
      'culture|명|문화|—|—|cultural 문화의',
    ],
    flow: [
      ['🌏', '상황 — 서로 다른 나라, 다른 입맛', '비비안과 친구들은 **다른 나라 출신**이라 **음식 취향이 다르다**.'],
      ['🍽️', '해결 — 누구나 좋아하는 음식', '**하지만** 호커 센터에서는 **항상 좋아하는 것을 찾을 수 있다**.'],
      ['🤝', '덤 — 낯선 사람이 친구로', '때로는 **낯선 사람과 테이블을 함께 쓰다가** 친구가 된다.'],
      ['❤️', '결론 — 호커 문화를 사랑하는 이유', '좋은 사람들과 함께 음식을 즐기는 것이 **재미있어서** 호커 문화를 사랑한다 — **요지**.'],
    ],
    cards: [
      {
        covers: [1, 2],
        en: 'My friends and I [g:are] [h:from] different countries. | We all have different food tastes.',
        note: '**해석 도움** — 비비안과 친구들은 **서로 다른 나라 출신**이라 **음식 취향도 다르다** — 문제 상황.',
        points: [
          ['grammar', '**주어가 둘이면 복수 동사** — {My friends and I} → {are}. 민찬 글의 {my family and I are} 와 같다.'],
          ['vocab', '**be from / food taste** — ~ 출신이다 / 음식 취향. {We all} "우리 **모두**".'],
        ],
      },
      {
        covers: [3],
        en: '[r:But] at the hawker centers, we can always [g:find] [h:something we like].',
        note: '**해석 도움** — **하지만** 호커 센터에서는 언제나 **우리가 좋아하는 것**을 찾을 수 있다 — 취향이 달라도 괜찮은 **이유**.',
        points: [
          ['grammar', '**목적격 관계대명사 생략** — {something (that) we like} "우리가 **좋아하는** 것". 목적격 that/which 는 생략할 수 있다.'],
          ['grammar', '**조동사 can + 동사원형 / 빈도부사 위치** — {can always find}. always 는 조동사 **뒤**, 동사원형 **앞**.'],
          ['reading', '**But 의 역할** — 취향이 **다르다**(앞) ↔ 그래도 **모두 좋아하는 것을 찾는다**(뒤).'],
        ],
      },
      {
        covers: [4],
        en: 'Sometimes, we [g:share] the tables with strangers | and [g:end up becoming] friends.',
        note: '**해석 도움** — 때때로 **낯선 사람들과 테이블을 함께 쓰다가 결국 친구가 되기도** 한다.',
        points: [
          ['grammar', '**end up + -ing** — "결국 **~하게 되다**". {end up becoming friends}. {end up to become} (×).'],
          ['vocab', '**share A with B / stranger** — B와 A를 함께 쓰다 / 낯선 사람. {Sometimes} 때때로(빈도부사, 문장 앞에도 온다).'],
        ],
      },
      {
        covers: [5, 6],
        tags: ['title'],
        en: '[h:It] is fun [g:to enjoy] the food with good people. | [g:That’s why] I love this hawker culture.',
        note: '**해석 도움** — 좋은 사람들과 **함께 음식을 즐기는 것**은 재미있다. **그게 내가 이 호커 문화를 사랑하는 이유다** — 결론.',
        points: [
          ['grammar', '**가주어 It ~ 진주어 to부정사** — {It is fun to enjoy the food ~} "음식을 **즐기는 것은** 재미있다". 민찬 글의 {It is always good to get together} 와 같은 구조.'],
          ['grammar', '**That’s why + 주어 + 동사** — "그것이 ~한 **이유**다 / **그래서** ~하다". 앞 문장이 **이유**, 뒤가 **결과**.'],
          ['vocab', '**hawker culture** — 호커 문화. 글 전체(다른 입맛·같은 식탁·새 친구)를 한 말로 묶는다.'],
        ],
      },
    ],
    prompt: `Photorealistic still-life photograph, wide banner composition, seen from slightly above. One large shared round table at a bright food court crowded with many different dishes side by side: a bowl of noodles, a plate of yellow curry with rice, satay skewers with peanut sauce, dumplings and fresh juice cups, several empty stools around the table inviting strangers to sit together. ${LIGHT}, warm yellow, fresh green and soft red accents. ${NO}, kimchi, flatbread, stall counters, menus --ar 16:5 --v 8.1`,
  },
];

for (const c of chapters) writeChapter('L7', SOURCE, c);
