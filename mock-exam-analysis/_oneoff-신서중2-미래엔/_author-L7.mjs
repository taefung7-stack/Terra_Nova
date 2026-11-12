/* 신서중2 미래엔 Lesson 7 Animals in Cold Places — 본문분석 저작
 * 실행: node _author-L7.mjs  → data/L7/{1..5}.json
 * 해석은 교과서 본문 PDF(7과본문.pdf) 오른쪽 단의 우리말을 문장 단위로 나눠 옮겼다.
 * 원본에 문제가 없어 type/choices 는 분석지 형식을 위해 새로 붙였다(hide_answer 라 인쇄 안 됨).
 * ⚠️ 낫표·꺾쇠 괄호는 PDF 빈칸 렌더 — 일반 괄호로 쓴다. */
import { writeChapter } from './_author.mjs';
import { SOURCE } from './_SOURCE-L7.js';

const LIGHT = 'natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, true-to-life color, sharp focus';
const NO = '--no people, person, face, hands, text, letters, words, numbers, signage, logo, watermark, golden hour, sunset, dramatic lighting, neon, night, heavy shadows, dark moody grading';

const chapters = [
  /* ── Ch1 도입 ─────────────────────────── */
  {
    no: 1, type: '주제', answer: 2,
    question: '다음 글의 주제로 가장 적절한 것은?',
    summary: '바깥 날씨가 추워지면 사람들은 외투를 입고 장갑을 끼거나, 핫 초콜릿을 마시거나, 실내에서 담요를 덮고 지내요. 그렇다면 동물들은 어떻게 추위를 견뎌 낼까요? 글쓴이는 추운 곳에 사는 동물들의 생존 비결을 함께 알아보자고 제안해요.',
    mainIdea: 'People have many ways to stay warm in the cold, and the writer invites readers to find out how animals survive the cold.',
    titleEn: 'How Do Animals Survive the Cold?',
    ko: [
      '바깥 날씨가 추워지면, 사람들은 외투를 입고 장갑을 껴요.',
      '어떤 사람들은 핫 초콜릿을 마셔요.',
      '또 다른 사람들은 실내에서 담요 아래 있어요.',
      '그런데 동물들은 어떨까요?',
      '그들은 어떻게 추위를 견뎌 낼까요?',
      '그들의 생존 비결을 몇 가지 알아봅시다.',
    ],
    choices: [
      ['겨울철 사람들이 즐겨 마시는 음료', '핫 초콜릿은 사람들이 추위를 이기는 **예시 중 하나**일 뿐이다.'],
      ['추운 곳에 사는 동물들의 생존 비결 소개', '사람의 예를 든 뒤 {how about animals?}로 화제를 돌려 **동물의 생존 비결**을 알아보자고 한다 — **정답**.'],
      ['겨울에 실내에서 지내야 하는 이유', '실내에 머무는 것은 사람들의 방법 중 하나로 **잠깐 언급**될 뿐이다.'],
      ['동물과 사람의 체온 차이', '체온을 **비교하는 내용은 없다**.'],
      ['추운 날씨에 알맞은 옷차림', '외투·장갑은 **도입의 예시**이며 글의 중심이 아니다.'],
    ],
    vocab: [
      'outside|부|바깥에, 밖에|outdoors|inside 안에|outside 바깥(명)',
      'put on|숙|~을 입다, 끼다|wear|take off 벗다|—',
      'jacket|명|재킷, 외투|coat|—|—',
      'glove|명|장갑|mitten|—|—',
      'hot chocolate|명|핫 초콜릿|cocoa|—|—',
      'others|대|다른 사람들|—|—|other 다른',
      'inside|부|안에, 실내에서|indoors|outside 바깥에|inside 안쪽(명)',
      'blanket|명|담요|cover|—|—',
      'how about ~?|숙|~은 어때?, ~은 어떨까?|what about ~?|—|—',
      'survive|동|살아남다, 견뎌 내다|live through|die 죽다|survival 생존',
      'find out|숙|알아내다, 알게 되다|discover|—|—',
      'survival|명|생존|—|death 죽음|survive 살아남다',
      'secret|명|비결, 비밀|key|—|secret 비밀의(형)',
    ],
    flow: [
      ['🧤', '사람의 방법 ① — 옷을 입는다', '추워지면 사람들은 **외투를 입고 장갑을 낀다**.'],
      ['☕', '사람의 방법 ② ③ — 마시고, 덮는다', '**Some** people은 핫 초콜릿을 마시고, **Others**는 실내에서 담요를 덮는다.'],
      ['🐾', '전환 — 그런데 동물들은?', '**But how about animals?** 동물들은 **어떻게 추위를 견딜까**라는 질문으로 화제를 돌린다.'],
      ['🔍', '안내 — 생존 비결을 알아보자', '**Let’s find out** — 북극곰·북극여우·고래·송장개구리 네 동물의 **생존 비결**이 이어진다.'],
    ],
    cards: [
      {
        covers: [1, 2, 3],
        en: '[h:When it gets cold outside], | people [g:put on] jackets and gloves. | [r:Some] people drink hot chocolate. | [r:Others] stay inside under blankets.',
        note: '**해석 도움** — 추위를 이기는 사람들의 방법 세 가지: **입기 / 마시기 / 실내에서 담요 덮기**.',
        points: [
          ['grammar', '**비인칭 주어 it + get + 형용사** — {it gets cold} "(날씨가) **추워지다**". 날씨·시간·거리의 it 은 해석하지 않는다. {get} + 형용사 = ~하게 되다.'],
          ['grammar', '**Some ~ / Others ~** — "**어떤** 사람들은 ~, **또 다른** 사람들은 ~". 여럿 가운데 일부씩을 나열할 때 쓴다(나머지 전부는 {the others}).'],
          ['vocab', '**put on / under blankets** — ~을 입다·끼다(↔ {take off}) / 담요 **아래에**.'],
        ],
      },
      {
        covers: [4, 5],
        tags: ['title'],
        en: 'But [g:how about] animals? | How do they [g:survive] the cold?',
        note: '**해석 도움** — 글의 화제가 **사람 → 동물**로 바뀌는 문장. 이 질문의 답이 글 전체의 내용이다.',
        points: [
          ['grammar', '**How about + 명사?** — "~은 **어때?**" 상대의 의견을 묻거나 화제를 바꿀 때 쓴다(= {What about ~?}, 4번 고래 단락의 {what about animals without fur?}).'],
          ['vocab', '**survive** — (위기를) 견뎌 내다, ~에서 살아남다. 타동사라 {survive the cold} 처럼 바로 목적어를 쓴다. 명사형 {survival}.'],
        ],
      },
      {
        covers: [6],
        en: '[g:Let’s find out] | some of [h:their survival secrets].',
        note: '**해석 도움** — 앞으로 소개할 내용을 예고하는 문장. {their} = 동물들의.',
        points: [
          ['grammar', '**Let’s + 동사원형** — "~하자". 제안을 나타낸다.'],
          ['grammar', '**some of + 복수명사** — "~ 중 **몇 가지**". {some of their survival secrets}.'],
          ['vocab', '**survival secret** — 생존 비결({survival} 생존 + {secret} 비결).'],
        ],
      },
    ],
    prompt: `Photorealistic still-life photograph, wide banner composition. A cozy indoor window seat on a snowy winter day: a thick knitted wool blanket folded on the cushion, a steaming mug of hot chocolate, a pair of warm gloves and a puffy winter jacket hanging nearby, soft falling snow and frosty pine trees visible through the large window. ${LIGHT}, creamy white, warm cocoa brown and pale icy blue. ${NO}, polar bear, fox, whale, frog, animals --ar 16:5 --v 8.1 --style raw`,
  },

  /* ── Ch2 북극곰 ─────────────────────────── */
  {
    no: 2, type: '내용일치', answer: 4,
    question: '북극곰에 관한 다음 글의 내용과 일치하는 것은?',
    summary: '북극곰의 털은 사실 투명해요. 햇빛 때문에 우리 눈에 흰색으로 보일 뿐이죠. 투명한 털은 더 많은 햇빛이 피부에 닿게 해 주고, 검은색 피부는 더 많은 열을 흡수하게 도와줘요. 투명한 털과 검은 피부 덕분에 북극곰은 따뜻하게 지낼 수 있어요.',
    mainIdea: 'Polar bears stay warm because their clear fur lets sunlight reach their black skin, which takes in more heat.',
    titleEn: 'Clear Fur and Black Skin',
    ko: [
      '먼저, 북극곰을 만나 보세요.',
      '여러분은 북극곰이 투명한 털을 갖고 있는 것을 알고 있었나요?',
      '그들의 털은 햇빛 때문에 우리에게 흰색으로 보일 뿐입니다.',
      '그렇다면, 왜 투명한 털이 추위에 도움이 될까요?',
      '그것은 더 많은 햇빛이 북극곰의 피부에 닿게 해 줍니다.',
      '여기에 북극곰에 대한 또 다른 흥미로운 사실이 있어요.',
      '그들은 검은색 피부를 가지고 있어요!',
      '어두운 피부는 그들이 더 많은 열을 흡수하는 것을 도와줍니다.',
      '투명한 털과 검은색 피부를 가지고 있는 것이 북극곰을 따뜻하게 유지해 줍니다.',
    ],
    choices: [
      ['북극곰의 털은 원래 흰색이다.', '털은 **투명하며** 햇빛 때문에 흰색으로 **보일 뿐**이다.'],
      ['투명한 털은 햇빛을 막아 준다.', '오히려 더 많은 햇빛이 피부에 **닿게 해 준다**({lets more sunlight reach}).'],
      ['북극곰의 피부는 흰색이다.', '피부는 **검은색**이다({They have black skin!}).'],
      ['어두운 피부는 열을 더 많이 흡수한다.', '{Dark skin helps them take in more heat} — **정답**.'],
      ['북극곰은 두꺼운 지방으로만 추위를 견딘다.', '두꺼운 지방은 **고래**의 비결이다. 북극곰은 **털과 피부**로 설명된다.'],
    ],
    vocab: [
      'polar bear|명|북극곰|—|—|polar 극지의',
      'clear|형|투명한|transparent|—|clearly 분명히',
      'fur|명|(동물의) 털|hair|—|furry 털로 덮인',
      'because of|전|~ 때문에|due to|—|because ~이기 때문에(접)',
      'sunlight|명|햇빛|sunshine|—|sun 해',
      'helpful|형|도움이 되는|useful|useless 쓸모없는|help 돕다',
      'reach|동|~에 닿다, 도달하다|get to|—|—',
      'skin|명|피부|—|—|—',
      'interesting|형|흥미로운|fascinating|boring 지루한|interest 흥미',
      'fact|명|사실|truth|—|factual 사실의',
      'dark|형|어두운, 짙은|black|bright 밝은|darkness 어둠',
      'take in|숙|흡수하다, 받아들이다|absorb|give off 내뿜다|—',
      'heat|명|열|warmth|cold 추위|heat 데우다(동)',
      'warm|형|따뜻한|—|cold 차가운|warmth 따뜻함',
    ],
    flow: [
      ['🐻', '등장 — 북극곰', '**First** — 네 동물 중 첫 번째로 북극곰을 소개한다.'],
      ['🤍', '비밀 ① — 털은 투명하다', '털은 **투명**하고 햇빛 때문에 흰색으로 **보일 뿐**이다. 투명한 털은 **햇빛이 피부까지 닿게** 한다.'],
      ['🖤', '비밀 ② — 피부는 검다', '**검은 피부**는 **열을 더 많이 흡수**한다.'],
      ['🔥', '정리 — 따뜻함 유지', '**투명한 털 + 검은 피부** → 북극곰을 **따뜻하게 유지**한다.'],
    ],
    cards: [
      {
        covers: [7, 8],
        en: 'First, [g:meet] polar bears. | Did you know | [r:that] polar bears have clear fur?',
        note: '**해석 도움** — 첫 번째 동물 소개. 흔히 알고 있는 "흰 털"이 사실은 **투명한 털**이라는 놀라운 사실로 시작한다.',
        points: [
          ['grammar', '**명령문** — {meet polar bears} "북극곰을 **만나 보세요**". 독자에게 말을 건네는 설명문의 표현.'],
          ['grammar', '**명사절 접속사 that** — {know that + 주어 + 동사} "~**라는 것을** 알다". {that} 이하가 {know} 의 목적어다(생략 가능).'],
          ['vocab', '**clear fur** — 투명한 털. 여기서 {clear} 는 "분명한"이 아니라 **투명한**.'],
        ],
      },
      {
        covers: [9],
        en: 'Their fur [r:only] [g:looks white] to us | [h:because of the sunlight].',
        note: '**해석 도움** — 털이 흰색인 것이 아니라 **햇빛 때문에 흰색으로 보이는 것뿐**이다.',
        points: [
          ['grammar', '**감각동사 look + 형용사** — {looks white} "흰색으로 **보이다**". 감각동사 뒤에는 부사가 아니라 **형용사**가 온다(looks whitely ×).'],
          ['grammar', '**because of + 명사(구)** — "~ 때문에". 뒤에 절(주어+동사)이 오면 {because} 를 쓴다.'],
          ['vocab', '**only** — ~일 뿐. 실제로는 흰색이 **아니라는** 뜻을 담는다.'],
        ],
      },
      {
        covers: [10, 11],
        en: 'So, why is clear fur [g:helpful] in the cold? | It [r:lets] more sunlight [r:reach] their skin.',
        note: '**해석 도움** — 질문하고 바로 답하는 구조. 투명한 털은 **햇빛이 피부까지 닿게** 해 준다.',
        points: [
          ['grammar', '**사역동사 let + 목적어 + 동사원형** — {lets more sunlight reach their skin} "더 많은 햇빛이 피부에 **닿게 하다**". to reach ×.'],
          ['grammar', '**의문사 + be동사 + 주어 + 형용사?** — {why is clear fur helpful?} "왜 투명한 털이 **도움이 될까**?"'],
          ['vocab', '**helpful / reach** — 도움이 되는 / ~에 닿다(타동사, reach to ×).'],
        ],
      },
      {
        covers: [12, 13, 14],
        en: '[g:Here comes] another interesting fact about polar bears. | They have black skin! | Dark skin [r:helps] them [r:take in] more heat.',
        note: '**해석 도움** — 두 번째 비밀: 북극곰은 **검은 피부**를 가졌고, 어두운 피부는 **열을 더 많이 흡수**한다.',
        points: [
          ['grammar', '**Here + 동사 + 주어 (도치)** — {Here comes another fact} "여기 또 다른 사실이 **있어요**". 주어가 명사면 동사가 앞에 온다(대명사면 {Here it comes}).'],
          ['grammar', '**help + 목적어 + (to) 동사원형** — {helps them take in more heat} "그들이 열을 더 흡수하도록 **돕다**". 동사원형·to부정사 둘 다 가능.'],
          ['vocab', '**take in** — 흡수하다, 받아들이다(= absorb).'],
        ],
      },
      {
        covers: [15],
        tags: ['title'],
        en: '[h:Having clear fur and black skin] | [g:keeps] polar bears [g:warm].',
        note: '**해석 도움** — 북극곰 단락의 **결론 문장**. 주어는 긴 동명사구다.',
        points: [
          ['grammar', '**동명사 주어 → 단수 동사** — {Having clear fur and black skin} 이 주어 → 동사 {keeps}. 동명사구는 and 로 이어진 목적어가 둘이어도 **하나의 행동**이라 단수 취급.'],
          ['grammar', '**keep + 목적어 + 형용사** — {keeps polar bears warm} "북극곰을 **따뜻하게 유지하다**". 목적격보어 자리에 형용사(warmly ×).'],
        ],
      },
    ],
    prompt: `Photorealistic wildlife photograph, wide banner composition. A large polar bear walking across white Arctic sea ice, its thick fur glowing almost translucent cream-white at the tips, faint dark skin visible around the nose and eyes, wide flat snowfield and pale blue ice ridges behind. ${LIGHT}, snow white, ivory and pale ice blue. ${NO}, fox, whale, frog, water splash, blood --ar 16:5 --v 8.1 --style raw`,
  },

  /* ── Ch3 북극여우 ─────────────────────────── */
  {
    no: 3, type: '내용불일치', answer: 1,
    question: '북극여우에 관한 다음 글의 내용과 일치하지 않는 것은?',
    summary: '북극여우도 어두운 피부와 털을 가지고 있고, 큰 꼬리로 몸을 따뜻하게 유지해요. 잠을 잘 때는 꼬리를 담요처럼 몸에 두르죠. 차가운 공기 속에서는 귀를 통해 체온을 잃을 수 있는데, 따뜻한 곳에 사는 여우들과 달리 북극여우는 귀가 작아서 열을 덜 잃어요.',
    mainIdea: 'Arctic foxes stay warm by wrapping their big tails around their bodies, and their small ears help them lose less heat.',
    titleEn: 'Big Tails and Small Ears',
    ko: [
      '북극여우도 어두운 피부와 털을 가지고 있어요.',
      '그들은 또한 큰 꼬리를 이용하여 자신들을 따뜻하게 유지해요.',
      '잠을 잘 때, 그들은 꼬리를 마치 담요처럼 몸 주위에 두른답니다!',
      '그런데 그들은 차가운 공기 속에서는 귀를 통해 체온을 잃을 수가 있어요.',
      '따뜻한 곳에 사는 다른 여우들과 달리, 북극여우들은 작은 귀를 가졌어요.',
      '그들의 귀는 정말 작아서 여우들이 열을 덜 잃게 도와줍니다.',
    ],
    choices: [
      ['북극여우는 따뜻한 곳의 여우보다 귀가 크다.', '{Unlike other foxes in warm places, arctic foxes have small ears} — 북극여우의 귀가 **더 작다**. **정답(불일치)**.'],
      ['북극여우도 어두운 피부와 털을 가졌다.', '{Arctic foxes have dark skin and fur, too} — 일치.'],
      ['북극여우는 큰 꼬리로 몸을 따뜻하게 한다.', '{use their big tails to keep themselves warm} — 일치.'],
      ['잠을 잘 때 꼬리를 몸에 두른다.', '{wrap their tails around their bodies like blankets} — 일치.'],
      ['귀를 통해 체온을 잃을 수 있다.', '{may lose body heat through their ears} — 일치.'],
    ],
    vocab: [
      'arctic fox|명|북극여우|—|—|Arctic 북극의',
      'tail|명|꼬리|—|head 머리|—',
      'keep A warm|숙|A를 따뜻하게 유지하다|—|—|—',
      'themselves|대|그들 자신을(재귀대명사)|—|—|them 그들을',
      'wrap|동|감싸다, 두르다|cover|unwrap 풀다|wrapping 포장지',
      'around|전|~ 주위에, ~을 둘러|round|—|—',
      'like|전|~처럼|as|unlike ~와 달리|likely ~할 것 같은',
      'however|부|그러나|but|—|—',
      'lose|동|잃다|—|gain 얻다|loss 손실',
      'body heat|명|체온, 몸의 열|—|—|—',
      'through|전|~을 통해|via|—|—',
      'unlike|전|~와 달리|—|like ~처럼|—',
      'less|형|더 적은|fewer|more 더 많은|little 적은(원급)',
    ],
    flow: [
      ['🦊', '등장 — 북극여우', '북극여우**도(too)** 북극곰처럼 **어두운 피부와 털**을 가졌다.'],
      ['🛌', '비밀 ① — 담요 같은 큰 꼬리', '큰 꼬리로 몸을 따뜻하게 한다. 잠잘 때 꼬리를 **담요처럼** 몸에 두른다.'],
      ['👂', '문제 — 귀로 열이 빠져나간다', '**However** — 차가운 공기 속에서는 **귀를 통해 체온을 잃을** 수 있다.'],
      ['✅', '비밀 ② — 작은 귀', '따뜻한 곳의 여우와 **달리** 귀가 **아주 작아서** 열을 **덜** 잃는다.'],
    ],
    cards: [
      {
        covers: [16, 17],
        en: 'Arctic foxes have dark skin and fur, [h:too]. | They also use their big tails | [g:to keep] [r:themselves] warm.',
        note: '**해석 도움** — {too} 는 앞 단락의 북극곰처럼 북극여우**도** 그렇다는 뜻. 북극여우만의 비결은 **큰 꼬리**다.',
        points: [
          ['grammar', '**to부정사 부사적 용법(목적)** — {use their big tails to keep ~} "~을 유지하기 **위해** 큰 꼬리를 이용하다".'],
          ['grammar', '**재귀대명사** — {keep themselves warm} 주어(They)와 목적어가 **같은 대상**이면 재귀대명사를 쓴다(them ×).'],
          ['vocab', '**too / also** — 둘 다 "~도, 또한". {too} 는 문장 끝, {also} 는 일반동사 앞.'],
        ],
      },
      {
        covers: [18],
        en: '[h:When they sleep], | they [g:wrap] their tails [g:around] their bodies | [r:like] blankets!',
        note: '**해석 도움** — 잠잘 때 꼬리를 **담요처럼** 몸에 두른다. 도입의 사람들이 덮는 담요(blankets)와 연결된다.',
        points: [
          ['grammar', '**시간의 부사절 when** — "~할 때". 주절과 함께 현재시제(일반적 사실).'],
          ['grammar', '**전치사 like** — {like blankets} "담요**처럼**". 동사 {like}(좋아하다)와 구별.'],
          ['vocab', '**wrap A around B** — A로 B를 감싸다, A를 B에 두르다.'],
        ],
      },
      {
        covers: [19, 20],
        en: '[h:However], they [g:may lose] body heat | [r:through] their ears in the cold air. | [r:Unlike] other foxes in warm places, | arctic foxes have small ears.',
        note: '**해석 도움** — **However** 로 문제점(귀로 열이 빠짐)을 제시하고, **Unlike** 로 북극여우만의 해결책(작은 귀)을 소개한다.',
        points: [
          ['grammar', '**조동사 may (추측)** — {may lose} "잃을 **수도 있다**". 가능성을 나타낸다.'],
          ['grammar', '**전치사 unlike** — {Unlike other foxes in warm places,} "따뜻한 곳의 다른 여우들**과 달리**". 대조 대상 뒤에 콤마.'],
          ['vocab', '**through / body heat** — ~을 통해 / 체온.'],
        ],
      },
      {
        covers: [21],
        tags: ['title'],
        en: 'Their ears are [g:so] small [g:that] they can [r:help] the foxes [r:lose] less heat.',
        note: '**해석 도움** — 북극여우 단락의 **결론**. 귀가 아주 작은 것이 **열을 덜 잃는** 비결이다.',
        points: [
          ['grammar', '**so + 형용사 + that ~ (결과)** — "너무 ~해서 …하다". {so small that they can help} "아주 작아서 ~을 도울 수 있다". 4번 고래 단락 {so cold that ~} 과 같은 구문.'],
          ['grammar', '**help + 목적어 + 동사원형** — {help the foxes lose less heat} "여우들이 열을 덜 잃도록 돕다".'],
          ['vocab', '**less** — {little} 의 비교급 "더 적은". 셀 수 없는 명사(heat) 앞.'],
        ],
      },
    ],
    prompt: `Photorealistic wildlife photograph, wide banner composition. An arctic fox curled up asleep on fresh snow, its huge fluffy tail wrapped around its body like a blanket covering its nose, its small rounded ears visible, soft snowy tundra and low snow-covered shrubs in the background. ${LIGHT}, snow white, soft grey and pale blue. ${NO}, polar bear, whale, frog, sea, ice floe, blood --ar 16:5 --v 8.1 --style raw`,
  },

  /* ── Ch4 고래 ─────────────────────────── */
  {
    no: 4, type: '제목', answer: 5,
    question: '다음 글의 제목으로 가장 적절한 것은?',
    summary: '털이 없는 고래는 어떻게 얼음처럼 차가운 물속에서 살까요? 겨울 바다는 사람이 단 1초도 수영할 수 없을 만큼 차갑지만, 고래는 피부 아래에 40센티미터가 넘기도 하는 두꺼운 지방을 가지고 있어요. 이 지방은 몸을 감싸 고래를 따뜻하게 지켜 주고, 오랫동안 먹이를 찾지 못할 때는 에너지도 공급해 줘요.',
    mainIdea: 'Whales live in icy water because the thick fat under their skin keeps them warm and gives them energy.',
    titleEn: 'Thick Fat: The Whale’s Secret for Icy Water',
    ko: [
      '이제, 털이 없는 동물들은 어떨까요?',
      '고래들은 어떻게 얼음처럼 찬 물속에서 살까요?',
      '겨울 바다는 너무 차가워서 여러분은 거기에서 단 1초도 수영할 수 없답니다.',
      '그러나 고래들은 얼음처럼 찬 물에서 따뜻하게 지내는 특별한 방법이 있어요.',
      '그들은 피부 아래에 두꺼운 지방을 가지고 있습니다.',
      '그 지방은 40센티미터보다 더 두꺼울 수 있어요.',
      '그것은 고래들의 몸을 감싸 그들을 따뜻하게 유지해 줍니다.',
      '그 지방은 또한 고래들이 오랫동안 먹이를 찾지 못할 때 에너지를 공급해 줍니다.',
    ],
    choices: [
      ['Why Whales Swim in Warm Seas', '고래는 따뜻한 바다가 아니라 **얼음처럼 찬 물**에서 산다.'],
      ['How Whales Find Food in Winter', '먹이는 지방이 에너지를 준다는 **부가 정보**로만 나온다.'],
      ['The Danger of Swimming in Winter', '사람이 겨울 바다에서 수영할 수 없다는 것은 **차가움을 강조하는 비유**일 뿐이다.'],
      ['Animals That Have No Fur', '털 없는 동물은 **도입 질문**이고, 글은 **고래의 지방**에 집중한다.'],
      ['Thick Fat: The Whale’s Secret for Icy Water', '두꺼운 지방이 **몸을 따뜻하게 하고 에너지도 주는** 고래의 비결 — **정답**.'],
    ],
    vocab: [
      'whale|명|고래|—|—|—',
      'without|전|~ 없이, ~이 없는|—|with ~이 있는|—',
      'icy|형|얼음같이 찬|freezing|warm 따뜻한|ice 얼음',
      'winter|명|겨울|—|summer 여름|wintry 겨울 같은',
      'even|부|~조차, ~도|—|—|—',
      'second|명|초(시간 단위)|—|—|second 두 번째의(형)',
      'special|형|특별한|unique|ordinary 평범한|specially 특별히',
      'way|명|방법|method|—|—',
      'stay|동|(~한 상태로) 있다, 머무르다|remain|leave 떠나다|—',
      'thick|형|두꺼운|—|thin 얇은|thickness 두께',
      'fat|명|지방|—|—|fat 뚱뚱한(형)',
      'cover|동|덮다, 감싸다|wrap|uncover 덮개를 벗기다|cover 덮개(명)',
      'energy|명|에너지, 기운|power|—|energetic 활기찬',
      'for a long time|숙|오랫동안|—|—|—',
    ],
    flow: [
      ['🐋', '전환 — 털이 없는 동물은?', '**Now, what about animals without fur?** 털 없는 고래로 넘어간다.'],
      ['🥶', '배경 — 겨울 바다의 추위', '겨울 바다는 **너무 차가워서** 사람은 **단 1초도** 수영할 수 없다.'],
      ['🧈', '비밀 — 두꺼운 지방', '**However** — 고래는 피부 아래 **40cm 넘는 두꺼운 지방**이 있어 몸을 감싸 **따뜻하게** 한다.'],
      ['⚡', '덤 — 에너지 저장고', '지방은 **오랫동안 먹이를 못 찾을 때 에너지**도 준다.'],
    ],
    cards: [
      {
        covers: [22, 23],
        en: 'Now, [g:what about] animals [r:without] fur? | How do whales live | in [h:icy] water?',
        note: '**해석 도움** — 앞의 두 동물은 **털**로 추위를 견뎠다. 이제 **털이 없는** 동물인 고래로 넘어간다.',
        points: [
          ['grammar', '**What about + 명사?** — "~은 **어떨까?**" 1번 도입의 {how about animals?} 와 같은 뜻.'],
          ['vocab', '**without / icy** — ~이 없는(↔ with) / 얼음처럼 찬({ice} + -y).'],
        ],
      },
      {
        covers: [24],
        en: 'The winter sea is [g:so] cold [g:that] you [r:cannot] swim there, | [h:even for a second].',
        note: '**해석 도움** — 겨울 바다가 얼마나 차가운지 강조한다 — 사람은 **단 1초도** 버틸 수 없다.',
        points: [
          ['grammar', '**so + 형용사 + that + 주어 + can’t ~** — "너무 ~해서 …할 수 없다" = {too + 형용사 + to부정사}. → {The winter sea is too cold for you to swim in.}'],
          ['grammar', '**일반 주어 you** — 특정한 "너"가 아니라 **사람들 일반**을 가리킨다.'],
          ['vocab', '**even for a second** — **단 1초도**. {even} 이 부정문을 강조한다.'],
        ],
      },
      {
        covers: [25, 26, 27],
        tags: ['title'],
        en: '[h:However], whales have a special way | [g:to stay] warm in icy water. | They have thick fat under their skin. | The fat [r:can be] [r:more than] 40 cm thick.',
        note: '**해석 도움** — 고래의 특별한 방법 = 피부 아래 **두꺼운 지방**. 두께가 **40cm 넘기도** 한다.',
        points: [
          ['grammar', '**to부정사 형용사적 용법** — {a special way to stay warm} "따뜻하게 **지낼** 특별한 방법". to부정사가 앞 명사 {way} 를 꾸민다.'],
          ['grammar', '**숫자 + 단위 + 형용사** — {40 cm thick} "두께가 40cm인". 크기·나이 표현: {10 years old}, {2 meters tall}.'],
          ['vocab', '**can (가능성) / more than** — ~일 수 있다 / ~보다 많이, ~ 넘게.'],
        ],
      },
      {
        covers: [28, 29],
        en: 'It covers their bodies and [g:keeps] them [g:warm]. | The fat also [r:gives] whales energy | [h:when they cannot find food for a long time].',
        note: '**해석 도움** — 지방의 두 가지 역할: ① 몸을 감싸 **따뜻하게** ② 먹이가 없을 때 **에너지** 공급.',
        points: [
          ['grammar', '**keep + 목적어 + 형용사** — {keeps them warm} "그들을 따뜻하게 유지하다"(2번 북극곰 {keeps polar bears warm} 과 같은 구문).'],
          ['grammar', '**4형식 give + 간접목적어 + 직접목적어** — {gives whales energy} "고래에게 에너지를 주다" = {gives energy to whales}.'],
          ['vocab', '**cover / for a long time** — 덮다·감싸다 / 오랫동안.'],
        ],
      },
    ],
    prompt: `Photorealistic ocean photograph, wide banner composition. A huge bowhead whale surfacing slowly between floating white ice floes in a calm icy polar sea, its smooth rounded dark back and thick body breaking the still grey-blue water, small chunks of ice drifting around it. ${LIGHT}, icy grey-blue, white ice and deep slate. ${NO}, polar bear, fox, frog, boat, ship, blood --ar 16:5 --v 8.1 --style raw`,
  },

  /* ── Ch5 송장개구리 ─────────────────────────── */
  {
    no: 5, type: '요지', answer: 3,
    question: '다음 글의 요지로 가장 적절한 것은?',
    summary: '알래스카의 겨울은 송장개구리에게 너무 추울 수 있어요. 그래서 이 개구리들은 스스로를 얼려 버린답니다! 몸의 60퍼센트까지 얼고, 숨쉬기와 심장 박동도 멈춰요. 하지만 걱정하지 마세요. 봄이 오면 다시 살아나요. 자연은 정말 경이로워요.',
    mainIdea: 'Wood frogs survive the freezing Alaskan winter by freezing themselves and come back to life in spring.',
    titleEn: 'Frozen Frogs Come Back to Life',
    ko: [
      '마지막으로, 알래스카에서는 겨울이 송장개구리들에게 매우 추울 수 있어요.',
      '그들은 얼어붙을 듯이 추운 날씨를 견뎌 내기 위해 무엇을 할까요?',
      '이 개구리들은 스스로를 얼려 버린답니다!',
      '그들 몸의 60퍼센트까지 얼어요.',
      '그들은 숨쉬기를 멈추고 심장 박동도 멈춘답니다.',
      '그러나 걱정하지 마세요.',
      '봄이 오면, 그들은 다시 살아납니다.',
      '자연은 정말 경이로워요.',
    ],
    choices: [
      ['송장개구리는 겨울이 오기 전 따뜻한 곳으로 이동한다.', '이동하지 않고 **그 자리에서 스스로 언다**.'],
      ['알래스카의 겨울은 송장개구리가 살기에 따뜻하다.', '겨울은 **너무 추울 수 있다**({too cold}).'],
      ['송장개구리는 스스로 얼어 겨울을 견디고 봄에 다시 살아난다.', '{These frogs freeze themselves!} + {they come back to life} — **정답**.'],
      ['송장개구리는 겨울에도 심장이 계속 뛴다.', '심장 박동이 **멈춘다**({their heart stops beating}).'],
      ['송장개구리는 몸 전체가 완전히 언다.', '몸의 **60퍼센트까지** 언다({Up to 60 percent}).'],
    ],
    vocab: [
      'lastly|부|마지막으로|finally|firstly 첫째로|last 마지막의',
      'wood frog|명|송장개구리|—|—|—',
      'freezing|형|얼어붙을 듯이 추운|icy|hot 더운|freeze 얼다',
      'weather|명|날씨|—|—|—',
      'freeze|동|얼다, 얼리다|—|melt 녹다|frozen 언(형)',
      'up to|숙|~까지|—|—|—',
      'percent|명|퍼센트|—|—|percentage 비율',
      'breathe|동|숨 쉬다|—|—|breath 숨(명)',
      'heart|명|심장|—|—|—',
      'beat|동|(심장이) 뛰다|pound|—|heartbeat 심장 박동',
      'worry|동|걱정하다|—|relax 안심하다|worried 걱정하는',
      'come back to life|숙|다시 살아나다|revive|die 죽다|—',
      'nature|명|자연|—|—|natural 자연의',
      'amazing|형|놀라운, 경이로운|wonderful|—|amaze 놀라게 하다',
    ],
    flow: [
      ['❄️', '배경 — 알래스카의 겨울', '**Lastly** — 마지막 동물. 알래스카의 겨울은 송장개구리에게 **너무 추울 수 있다**.'],
      ['🧊', '비밀 — 스스로를 얼린다', '송장개구리는 **스스로를 얼린다**. 몸의 **60%까지** 얼고, **숨과 심장도 멈춘다**.'],
      ['🌱', '반전 — 봄에 다시 살아난다', '**But don’t worry** — **봄이 오면 다시 살아난다**.'],
      ['🌍', '결론 — 자연은 경이롭다', '네 동물의 이야기를 **Nature is so amazing.** 한 문장으로 마무리한다.'],
    ],
    cards: [
      {
        covers: [30, 31],
        en: '[h:Lastly], in Alaska, winters [g:can be] [r:too] cold for wood frogs. | What do they do | [g:to survive] the freezing weather?',
        note: '**해석 도움** — 네 번째이자 **마지막** 동물. 알래스카의 혹독한 겨울을 송장개구리는 **어떻게 견딜까**라는 질문으로 시작한다.',
        points: [
          ['grammar', '**to부정사 부사적 용법(목적)** — {to survive the freezing weather} "얼어붙을 듯한 날씨를 **견뎌 내기 위해**".'],
          ['grammar', '**can (가능성) / too + 형용사** — {can be too cold} "**너무** 추울 **수 있다**". {too} 는 지나침(부정적)을 나타낸다.'],
          ['vocab', '**Lastly / freezing** — 마지막으로(First → Lastly 순서 표지) / 얼어붙을 듯이 추운.'],
        ],
      },
      {
        covers: [32, 33],
        tags: ['title'],
        en: 'These frogs [g:freeze] [r:themselves]! | [h:Up to 60 percent] of their bodies freeze.',
        note: '**해석 도움** — 놀라운 비결: 개구리가 **스스로를 얼린다** — 몸의 **60퍼센트까지** 언다.',
        points: [
          ['grammar', '**재귀대명사(목적어)** — {freeze themselves} "**자기 자신을** 얼리다". 주어 These frogs = 목적어.'],
          ['grammar', '**자동사·타동사 freeze** — 32번 {freeze themselves}(얼리다, 타동사) / 33번 {their bodies freeze}(얼다, 자동사).'],
          ['vocab', '**up to + 수량** — "~**까지**"(최대치). {percent of + 명사} 는 뒤 명사에 수를 맞춘다({bodies} → {freeze}).'],
        ],
      },
      {
        covers: [34, 35],
        en: 'They [g:stop breathing], | and their heart [g:stops beating]. | But [r:don’t worry].',
        note: '**해석 도움** — 숨도, 심장도 멈춘다 — 죽은 것처럼 보이지만 **걱정하지 마라**며 반전을 예고한다.',
        points: [
          ['grammar', '**stop + 동명사** — {stop breathing} "숨 쉬는 것을 **멈추다**". {stop + to부정사} 는 "~하기 **위해** 멈추다"로 뜻이 다르다.'],
          ['grammar', '**부정 명령문** — {Don’t + 동사원형} "~하지 마라".'],
          ['vocab', '**breathe / beat** — 숨 쉬다(명사 {breath}) / (심장이) 뛰다.'],
        ],
      },
      {
        covers: [36, 37],
        en: '[h:When spring comes], | they [g:come back to life]. | Nature is [r:so] amazing.',
        note: '**해석 도움** — **봄이 오면 다시 살아난다**. 마지막 문장은 네 동물의 이야기 전체를 정리하는 감탄이다.',
        points: [
          ['grammar', '**시간의 부사절은 현재로 미래를 나타낸다** — {When spring comes} "봄이 **오면**"(will come ×).'],
          ['vocab', '**come back to life** — 다시 살아나다, 소생하다.'],
          ['vocab', '**so + 형용사** — 여기서 {so} 는 "정말, 아주"(강조). {so ~ that} 구문과 구별.'],
        ],
      },
    ],
    prompt: `Photorealistic macro nature photograph, wide banner composition. A small brown wood frog frozen still among frosty fallen leaves on a forest floor in early winter, delicate ice crystals covering its back, and beside it fresh green spring shoots pushing up through melting snow hinting at the coming spring. ${LIGHT}, frosty white, leaf brown and fresh spring green. ${NO}, polar bear, fox, whale, sea, ice floe, blood --ar 16:5 --v 8.1 --style raw`,
  },
];

/* 이 폴더의 covers 는 챕터 안 번호(1부터)다 — 저작은 원문 전체 번호로 쓰고 여기서 바꾼다. */
let off = 0;
for (const c of chapters) {
  for (const card of c.cards) card.covers = card.covers.map(n => n - off);
  writeChapter('L7', SOURCE, c);
  off += SOURCE.find(x => x.no === c.no).sentences.length;
}
