/* 목일중2 비상(황종배) Lesson 8 The Last Wild Race — 본문분석 저작
 * 실행: node _author-L8.mjs  → data/L8/{1..4}.json
 * 해석은 교과서 본문 PDF(목일중 8과.pdf) 오른쪽 단의 우리말을 문장 단위로 나눠 옮겼다.
 * 원본에 문제가 없어 type/choices 는 분석지 형식을 위해 새로 붙였다(hide_answer 라 인쇄 안 됨).
 * ⚠️ 낫표(「 」)는 PDF 빈칸 렌더 — 괄호로 쓴다. */
import { writeChapter } from './_author.mjs';
import { SOURCE } from './_SOURCE-L8.js';

const LIGHT = 'natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette';
const NO = '--no text, letters, words, numbers, signage, logo, brand, watermark, people, person, hands, faces, sunset, golden hour, night, dark moody grading, heavy shadows';

const chapters = [
  /* ── Ch1 도입 ─────────────────────────── */
  {
    no: 1, type: '목적', answer: 5,
    question: '다음 글의 목적으로 가장 적절한 것은?',
    summary: '세상에서 가장 도전적인 경주는 무엇일까요? 바로 ‘마지막 야생 경주(The Last Wild Race)’예요. 이 경주는 지구상의 마지막 야생 지역 중 하나인 칠레의 남부 파타고니아에서 열리고, 매년 전 세계의 많은 팀이 참가해요. 이 경주에는 힘뿐만 아니라 팀워크도 필요하답니다.',
    mainIdea: 'The Last Wild Race in Southern Patagonia is the most challenging race in the world, and it needs not only strength but also teamwork.',
    titleEn: 'The Last Wild Race: A Challenge in Southern Patagonia',
    ko: [
      '여러분은 세상에서 가장 도전적인 경주가 무엇인지 아시나요?',
      '그것은 ‘마지막 야생 경주(The Last Wild Race)’입니다!',
      '여러분은 칠레의 남부 파타고니아에서 우리와 함께하셔야 합니다.',
      '이곳은 지구상의 마지막 야생 지역 중 하나입니다!',
      '매년 전 세계에서 온 많은 팀들이 이 경주에 참여합니다.',
      '이 경주를 위해서, 여러분은 힘뿐만 아니라 팀워크도 필요합니다.',
    ],
    choices: [
      ['칠레의 역사를 설명하려고', '칠레는 경주가 열리는 **장소**일 뿐이다.'],
      ['경주에서 우승하는 방법을 알려 주려고', '우승 비법은 나오지 않는다.'],
      ['야생 동물 보호를 호소하려고', '동물 이야기는 없다.'],
      ['팀워크가 필요 없는 이유를 말하려고', '오히려 **팀워크도 필요하다**고 한다.'],
      ['도전적인 야생 경주를 소개하고 참가를 권유하려고', '{You should join us} — 경주 소개 + 참가 권유 — **정답**.'],
    ],
    vocab: [
      'challenging|형|도전적인, 힘든|difficult, demanding|easy 쉬운|challenge 도전',
      'race|명|경주|competition|—|racer 경주자',
      'wild|형|야생의, 자연 그대로의|natural|tame 길들여진|wildlife 야생 생물',
      'join|동|함께하다, 참가하다|take part in|leave 떠나다|—',
      'Southern Patagonia|명|남부 파타고니아(남미 남단 지역)|—|—|—',
      'area|명|지역|region|—|—',
      'on Earth|숙|지구상에서|in the world|—|—',
      'all over the world|숙|전 세계에서|around the world|—|—',
      'not only A but also B|숙|A뿐만 아니라 B도|B as well as A|—|—',
      'strength|명|힘, 체력|power|weakness 약함|strong 강한',
      'teamwork|명|팀워크, 협동|cooperation|—|team 팀',
    ],
    flow: [
      ['❓', '질문 — 가장 도전적인 경주는?', '세상에서 **가장 도전적인 경주**가 무엇인지 묻는다.'],
      ['🏔️', '답 — 마지막 야생 경주', '그것은 **‘The Last Wild Race’** — 칠레 **남부 파타고니아**, 지구상의 **마지막 야생 지역** 중 하나에서 열린다.'],
      ['🌍', '참가 — 전 세계의 팀들', '**매년** 전 세계의 많은 팀이 참가한다.'],
      ['💪', '조건 — 힘과 팀워크', '이 경주에는 **힘뿐만 아니라 팀워크도** 필요하다.'],
    ],
    cards: [
      {
        covers: [1, 2],
        en: 'Do you know [h:what the most challenging race in the world is]? | It is “The Last Wild Race”!',
        note: '**해석 도움** — 세상에서 **가장 도전적인 경주가 무엇인지** 아나요? 그것은 ‘마지막 야생 경주’다 — 질문으로 시작해 관심을 끈다.',
        points: [
          ['grammar', '**간접의문문 (의문사 + 주어 + 동사)** — {Do you know what the most challenging race in the world is?}. 의문문 {What is ~?} 가 know 의 목적어가 되면 **is 가 맨 뒤**로 간다.'],
          ['grammar', '**최상급 the most + 형용사** — {the most challenging race} "**가장** 도전적인 경주". 긴 형용사는 -est 대신 most.'],
          ['vocab', '**challenging** — 도전적인, 힘든(명사 {challenge} 도전).'],
        ],
      },
      {
        covers: [3, 4],
        en: 'You [g:should] join us in Southern Patagonia, Chile. | It is [g:one of the last wild areas] on Earth!',
        note: '**해석 도움** — 칠레의 **남부 파타고니아**에서 우리와 **함께하셔야** 한다. 그곳은 지구상의 **마지막 야생 지역 중 하나**다.',
        points: [
          ['grammar', '**조동사 should + 동사원형** — {should join} "~해야 한다, ~하는 게 좋다"(권유). 홍보 글의 **참가 권유**.'],
          ['grammar', '**one of the + 복수명사** — {one of the last wild areas} "마지막 야생 지역 **중 하나**". areas 복수형에 주의.'],
          ['vocab', '**join / on Earth** — 함께하다·참가하다 / 지구상에서. {It} = Southern Patagonia.'],
        ],
      },
      {
        covers: [5],
        en: '[g:Every] year, many teams from [h:all over the world] [g:join] the race.',
        note: '**해석 도움** — **매년** 전 세계에서 온 많은 팀이 이 경주에 참가한다.',
        points: [
          ['grammar', '**주어 찾기** — S {many teams}(from all over the world 는 꾸밈말) → V {join}(복수).'],
          ['vocab', '**every + 단수명사 / all over the world** — {every year} 매년 / 전 세계에서.'],
        ],
      },
      {
        covers: [6],
        tags: ['title'],
        en: 'For this race, you need [g:not only] strength [g:but also] teamwork.',
        note: '**해석 도움** — 이 경주에는 **힘뿐만 아니라 팀워크도** 필요하다 — 다음 단락(규칙: 4명 팀)으로 이어지는 핵심.',
        points: [
          ['grammar', '**not only A but also B** — "A**뿐만 아니라** B**도**". A·B 자리에 같은 품사(명사 strength / teamwork)가 온다. = {B as well as A}.'],
          ['vocab', '**strength / teamwork** — 힘·체력 / 팀워크. {strong}(형) → {strength}(명).'],
        ],
      },
    ],
    prompt: `Photorealistic landscape photograph, wide banner composition. The vast wild landscape of Southern Patagonia: jagged granite mountain peaks with patches of snow, a turquoise glacier lake below and wide open golden-green grassland in the foreground, a faint narrow hiking trail winding toward the mountains, untouched nature with no buildings. ${LIGHT}, turquoise, slate grey and soft sage green. ${NO}, bikes, boats, ropes, maps, flags, tents, campfire --ar 16:5 --v 8.1`,
  },

  /* ── Ch2 What Is the Race Like? ─────────────────────────── */
  {
    no: 2, type: '내용일치', answer: 3,
    question: '다음 글의 내용과 일치하는 것은?',
    summary: '경주 코스는 500km가 넘고 매년 바뀌어요. 팀들은 경주 하루 전에야 그해의 코스를 알게 돼요. 경주 동안 각 팀은 거친 땅을 걷고, 험한 길에서 자전거를 타고, 물살이 빠른 물 위에서 배를 저으며 야생을 통과해요. 하지만 이 경주는 스포츠만의 문제가 아니라서, 팀들은 불을 피우거나 쓰레기를 남기지 않으며 남부 파타고니아의 자연환경을 지켜야 해요.',
    mainIdea: 'The race course changes every year and includes walking, biking, and rowing, but the teams must also take care of nature.',
    titleEn: 'A Race Through the Wild That Protects Nature',
    ko: [
      '경주 코스는 500km 이상 길이가 되고 그것은 매년 바뀝니다.',
      '팀들이 그해의 코스를 언제 알게 되는지 아시나요?',
      '바로 경주 하루 전입니다!',
      '경주 동안, 각 팀은 다양한 활동들을 함으로써 야생을 통과합니다.',
      '그들은 거친 땅을 걷고, 험한 길에서 자전거를 타며, 속도가 빠른 물 위에서 배를 젓습니다.',
      '그 경주는 단지 스포츠에 관한 것만은 아닙니다.',
      '팀들은 또한 자연을 돌볼 필요가 있습니다.',
      '그들은 경주 중에 불을 피우거나 쓰레기를 남기지 말아야 합니다.',
      '모두가 남부 파타고니아의 자연환경을 보호해야 합니다.',
    ],
    choices: [
      ['경주 코스는 매년 같은 곳에서 열린다.', '{it changes every year} — **매년 바뀐다**.'],
      ['팀들은 한 달 전에 코스를 미리 안다.', '**경주 하루 전**에 알게 된다.'],
      ['팀들은 걷기·자전거 타기·배 젓기를 하며 야생을 통과한다.', '{walk ~, ride bikes ~, and row boats ~} — **정답**.'],
      ['경주 중에는 불을 피워 요리할 수 있다.', '{must not make fires} — 불을 피우면 **안 된다**.'],
      ['이 경주는 오직 스포츠 실력만 겨룬다.', '{not just about sports} — 자연도 **돌봐야** 한다.'],
    ],
    vocab: [
      'course|명|(경주) 코스, 경로|route|—|—',
      'more than|숙|~ 이상, ~보다 많이|over|less than ~보다 적게|—',
      'find out|숙|알아내다, 알게 되다|discover|—|—',
      'during|전|~ 동안|throughout|—|—',
      'go through|숙|~을 통과하다, 지나가다|pass through|—|—',
      'activity|명|활동|—|—|active 활동적인',
      'rough|형|거친, 울퉁불퉁한|uneven|smooth 매끄러운|roughly 대략',
      'tough|형|험한, 힘든|hard, difficult|easy 쉬운|—',
      'row|동|(노를) 젓다|paddle|—|rower 노 젓는 사람',
      'rapid|형|(물살이) 빠른|fast, quick|slow 느린|rapidly 빠르게',
      'take care of|숙|~을 돌보다|look after|—|—',
      'make a fire|숙|불을 피우다|build a fire|put out a fire 불을 끄다|—',
      'leave ~ behind|숙|~을 남기고 가다|—|take away 가져가다|—',
      'trash|명|쓰레기|garbage, waste|—|—',
      'protect|동|보호하다|guard|harm 해치다|protection 보호',
      'environment|명|환경|surroundings|—|environmental 환경의',
    ],
    flow: [
      ['🗺️', '코스 — 500km, 매년 바뀜', '코스는 **500km 이상**이고 **매년 바뀐다**. 팀들은 **경주 하루 전**에야 코스를 안다.'],
      ['🚴', '활동 — 걷고, 타고, 젓고', '각 팀은 **거친 땅을 걷고**, **험한 길에서 자전거를 타고**, **빠른 물 위에서 배를 저으며** 야생을 통과한다.'],
      ['🌿', '전환 — 스포츠만이 아니다', '경주는 **스포츠만의 일이 아니다** — 팀들은 **자연도 돌봐야** 한다.'],
      ['🚯', '규칙 — 불·쓰레기 금지', '**불을 피우거나 쓰레기를 남기면 안 되고**, 모두가 남부 파타고니아의 **자연환경을 보호**해야 한다.'],
    ],
    cards: [
      {
        covers: [1],
        en: 'The race course is [g:more than] 500 kilometers long | and it [g:changes] every year.',
        note: '**해석 도움** — 코스는 **500km 이상**이고 **매년 바뀐다** — 이 경주가 예측하기 어려운 이유.',
        points: [
          ['grammar', '**길이 표현 숫자 + 단위 + long** — {500 kilometers long} "길이가 500km". {more than} ~ 이상.'],
          ['grammar', '**3인칭 단수 현재 -s** — {it}(= the race course) → {changes}.'],
        ],
      },
      {
        covers: [2, 3],
        en: 'Do you know [h:when the teams find out the course for the year]? | Just a day before the race!',
        note: '**해석 도움** — 팀들이 그해 코스를 **언제 알게 되는지** 아나요? **바로 경주 하루 전**이다!',
        points: [
          ['grammar', '**간접의문문 (when + 주어 + 동사)** — {when the teams find out ~}. {When do the teams find out ~?} 가 know 의 목적어가 되면서 **do 가 빠지고** 평서문 어순이 된다.'],
          ['vocab', '**find out / for the year** — 알아내다·알게 되다 / 그해의. {Just a day before} "**바로** 하루 전"(생략 문장 — 앞 질문의 답).'],
        ],
      },
      {
        covers: [4, 5],
        en: '[r:During] the race, each team [g:goes] through the wild [r:by] [g:doing] different activities. | They [g:walk] on rough ground, [g:ride] bikes on tough roads, | and [g:row] boats on rapid water.',
        note: '**해석 도움** — 경주 동안 각 팀은 **다양한 활동을 하면서** 야생을 통과한다 — **걷기·자전거·배 젓기** 세 가지 활동.',
        points: [
          ['grammar', '**by + -ing (수단)** — {by doing different activities} "다양한 활동을 **함으로써**". 전치사 by 뒤 동명사.'],
          ['grammar', '**each + 단수명사 + 단수동사** — {each team goes}. / **병렬 구조** — {walk ~, ride ~, and row ~} 동사 세 개가 and 로 나란히.'],
          ['vocab', '**rough / tough / rapid** — 거친(땅) / 험한(길) / 빠른(물살). {go through} 통과하다, {during + 명사} ~ 동안.'],
        ],
      },
      {
        covers: [6, 7],
        tags: ['title'],
        en: 'The race is [g:not just about] sports. | The teams also [g:need to take care of] nature.',
        note: '**해석 도움** — 경주는 **단지 스포츠에 관한 것만은 아니다**. 팀들은 **자연도 돌봐야** 한다 — 단락의 **전환점**.',
        points: [
          ['grammar', '**need to + 동사원형** — {need to take care of} "~을 **돌볼 필요가 있다**". need 는 to부정사를 목적어로 취한다.'],
          ['vocab', '**not just about ~ / take care of** — "단지 ~에 관한 것만은 아닌" / ~을 돌보다(= look after).'],
        ],
      },
      {
        covers: [8, 9],
        en: 'They [g:must not] make fires [r:or] leave trash behind during the race. | Everyone [g:should] protect the natural environment of Southern Patagonia.',
        note: '**해석 도움** — 경주 중에 **불을 피우거나 쓰레기를 남기면 안 된다**. 모두가 남부 파타고니아의 **자연환경을 보호**해야 한다.',
        points: [
          ['grammar', '**must not + 동사원형 (금지)** — "**~해서는 안 된다**". {must not make ~ or leave ~} 두 동작 모두 금지. (don’t have to 는 "~할 필요가 없다"로 뜻이 다르다.)'],
          ['grammar', '**everyone + 단수 취급 / should** — {Everyone should protect} "모두가 보호해야 한다". 조동사 뒤 동사원형.'],
          ['vocab', '**make fires / leave ~ behind / environment** — 불을 피우다 / ~을 남기고 가다 / 환경.'],
        ],
      },
    ],
    prompt: `Photorealistic outdoor photograph, wide banner composition. A wild Patagonian valley with three empty adventure race routes side by side: a rocky rough trail with a sturdy pair of trekking poles leaning on a boulder, a muddy mountain bike leaning against a fence post beside a tough gravel road, and a red kayak pulled up on the bank of a fast white-water river, pristine nature with no litter. ${LIGHT}, river blue, rock grey and fresh moss green. ${NO}, campfire, smoke, trash, flags, maps, ropes, first-aid kit --ar 16:5 --v 8.1`,
  },

  /* ── Ch3 What Are the Rules of the Race? ─────────────────────────── */
  {
    no: 3, type: '내용불일치', answer: 2,
    question: '다음 글의 내용과 일치하지 않는 것은?',
    summary: '경주에 참가하려면 모든 팀이 몇 가지 규칙을 따라야 해요. 4명으로 된 팀에는 남자와 여자가 적어도 한 명씩 있어야 하고, 모든 팀원은 건강하다는 것을 보여 줘야 해요. 또 로프 사용, 지도 읽기, 응급 처치 기술을 확인하는 테스트를 통과해야 하는데, 경주가 매우 힘들어서 모두가 도전에 대비해야 하기 때문이에요. 경주를 끝내려면 모든 체크포인트에 도달해야 하고, 가장 먼저 끝내는 팀이 우승해요.',
    mainIdea: 'To join and finish the race, teams must follow rules about team members, health, skill tests, and reaching every checkpoint.',
    titleEn: 'Rules for a Tough Race',
    ko: [
      '이 행사에 참가하기 위해, 모든 팀들은 몇 가지 규칙을 따라야 합니다.',
      '예를 들어, 4명으로 구성된 팀에는 적어도 한 명의 남자와 한 명의 여자가 있어야 합니다.',
      '모든 팀원은 그들이 건강하다는 것을 보여줘야 합니다.',
      '또한, 각 팀은 로프 사용하기, 지도 읽기, 응급 처치하기에서의 기술들을 확인하는 몇 가지 테스트를 통과해야 합니다.',
      '이것은 중요한데, 왜냐하면 경주가 매우 힘들어서 모든 사람이 도전에 준비되어 있어야 하기 때문입니다.',
      '경주를 끝내기 위해, 각 팀은 모든 체크포인트에 도달해야 합니다.',
      '가장 먼저 경주를 마치는 팀이 승리합니다.',
    ],
    choices: [
      ['한 팀은 4명으로 구성된다.', '{a team of four} — 일치.'],
      ['팀원은 모두 같은 성별이어야 한다.', '**남자와 여자가 적어도 한 명씩** 있어야 한다 — 불일치, **정답**.'],
      ['모든 팀원은 건강하다는 것을 보여 줘야 한다.', '{Every member must show that they are healthy} — 일치.'],
      ['응급 처치 기술 테스트를 통과해야 한다.', '{giving first aid} — 일치.'],
      ['가장 먼저 경주를 마친 팀이 우승한다.', '{The first team to finish the race wins} — 일치.'],
    ],
    vocab: [
      'event|명|행사, 경기|—|—|—',
      'follow|동|따르다|obey|break 어기다|—',
      'rule|명|규칙|regulation|—|—',
      'a team of four|숙|4명으로 구성된 팀|—|—|—',
      'at least|숙|적어도, 최소한|—|at most 기껏해야|—',
      'member|명|구성원, 팀원|—|—|membership 회원 자격',
      'healthy|형|건강한|fit, well|sick 아픈|health 건강',
      'pass|동|(시험을) 통과하다|—|fail 떨어지다|—',
      'skill|명|기술, 능력|ability|—|skillful 능숙한',
      'rope|명|밧줄, 로프|—|—|—',
      'first aid|명|응급 처치|—|—|—',
      'important|형|중요한|significant|unimportant 중요하지 않은|importance 중요성',
      'be ready for|숙|~에 준비가 되다|be prepared for|—|readiness 준비',
      'challenge|명|도전, 어려운 일|—|—|challenging 도전적인',
      'reach|동|~에 도달하다|get to, arrive at|—|—',
      'checkpoint|명|체크포인트, 검문소|—|—|—',
    ],
    flow: [
      ['📋', '규칙 — 참가하려면', '행사에 **참가하기 위해** 모든 팀은 **몇 가지 규칙**을 따라야 한다.'],
      ['👫', '팀·건강 — 4명, 남녀, 건강', '4명 팀에 **남녀 각 1명 이상**, 모든 팀원은 **건강을 증명**해야 한다.'],
      ['🧭', '기술 테스트 — 로프·지도·응급 처치', '로프·지도·응급 처치 **기술 테스트**를 통과해야 한다 — 경주가 **매우 힘들어서** 모두 **도전에 대비**해야 하기 때문.'],
      ['🏁', '완주·우승 — 체크포인트', '완주하려면 **모든 체크포인트에 도달**해야 하고, **가장 먼저 끝낸 팀**이 이긴다.'],
    ],
    cards: [
      {
        covers: [1, 2],
        en: '[g:To join] the event, all teams [g:must] follow a few rules. | For example, a team of four must have [h:at least] one man and one woman.',
        note: '**해석 도움** — 행사에 **참가하기 위해** 모든 팀은 몇 가지 규칙을 따라야 한다. 예를 들어 4명 팀에는 **적어도** 남자 한 명과 여자 한 명이 있어야 한다.',
        points: [
          ['grammar', '**to부정사 부사적 용법(목적)** — {To join the event,} "행사에 **참가하기 위해**". 문장 맨 앞의 목적 표현 뒤에 쉼표.'],
          ['grammar', '**must + 동사원형 (의무)** — {must follow / must have} "~해야 한다". / **a few + 복수명사** {a few rules} "몇 가지 규칙".'],
          ['vocab', '**a team of four / at least** — 4명으로 구성된 팀 / 적어도(↔ at most).'],
        ],
      },
      {
        covers: [3],
        en: 'Every member must show [r:that] they [g:are] healthy.',
        note: '**해석 도움** — 모든 팀원은 **자신들이 건강하다는 것**을 보여 줘야 한다.',
        points: [
          ['grammar', '**명사절 접속사 that** — {show that + 주어 + 동사} "~라는 것을 보여 주다". that절이 show 의 목적어.'],
          ['grammar', '**every + 단수명사** — {Every member}(단수). that절의 {they} 는 팀원들을 성별 구분 없이 가리킨다.'],
          ['vocab', '**healthy** — 건강한(명사 {health}).'],
        ],
      },
      {
        covers: [4],
        en: 'Also, each team must pass some tests [r:that] check their skills | [r:in] [g:using] ropes, [g:reading] maps, and [g:giving] first aid.',
        note: '**해석 도움** — 각 팀은 **로프 사용하기·지도 읽기·응급 처치하기** 기술을 **확인하는 테스트**를 통과해야 한다.',
        points: [
          ['grammar', '**주격 관계대명사 that** — {some tests that check their skills} "기술을 **확인하는** 테스트". 선행사 {tests}(복수) → {check}.'],
          ['grammar', '**전치사 in + 동명사 병렬** — {in using ~, reading ~, and giving ~}. 전치사 뒤 동명사 세 개가 나란히.'],
          ['vocab', '**pass a test / first aid** — 시험을 통과하다 / 응급 처치. {give first aid} 응급 처치를 하다.'],
        ],
      },
      {
        covers: [5],
        tags: ['title'],
        en: '[h:This] is important [r:because] the race is very tough, | and everyone [g:needs to be ready for] the challenges.',
        note: '**해석 도움** — **이것(테스트 통과)**은 중요하다. 경주가 **매우 힘들어서** 모든 사람이 **도전에 준비되어 있어야** 하기 때문이다 — 규칙의 **이유**.',
        points: [
          ['grammar', '**because + 주어 + 동사 (이유)** — {because the race is very tough, and everyone needs ~}. because 뒤에 두 절이 and 로 이어졌다.'],
          ['grammar', '**everyone 은 단수 취급** — {everyone needs}(-s). {need to be ready for} ~에 준비되어 있어야 한다.'],
          ['reading', '**This 가 가리키는 것** — 바로 앞 문장의 **기술 테스트를 통과하는 것**.'],
        ],
      },
      {
        covers: [6, 7],
        en: '[g:To finish] the race, each team must [g:reach] every checkpoint. | [h:The first team] [g:to finish] the race [g:wins].',
        note: '**해석 도움** — 경주를 **끝내기 위해** 모든 체크포인트에 **도달해야** 한다. **가장 먼저 경주를 마치는 팀**이 이긴다.',
        points: [
          ['grammar', '**to부정사의 두 쓰임** — {To finish the race,} "끝내기 **위해**"(부사적·목적) / {The first team to finish the race} "경주를 **마치는** 첫 번째 팀"(형용사적, team 을 꾸밈).'],
          ['grammar', '**주어가 길어도 동사는 하나** — S {The first team to finish the race} → V {wins}(3인칭 단수).'],
          ['vocab', '**reach / checkpoint** — ~에 도달하다(= get to, 전치사 없이 목적어) / 체크포인트.'],
        ],
      },
    ],
    prompt: `Photorealistic still-life photograph, wide banner composition. Adventure race gear laid out neatly on a flat granite rock in the Patagonian wilderness: a coiled climbing rope with a carabiner, a folded paper topographic map with a compass on top, a compact red first-aid kit and a water bottle, distant mountains softly blurred behind. ${LIGHT}, bright red, rope orange and stone grey. ${NO}, bikes, kayaks, campfire, flags, tents, map labels --ar 16:5 --v 8.1`,
  },

  /* ── Ch4 Join Us! ─────────────────────────── */
  {
    no: 4, type: '요지', answer: 1,
    question: '다음 글의 요지로 가장 적절한 것은?',
    summary: '‘마지막 야생 경주’를 경험할 준비가 되었나요? 이 놀라운 모험을 놓치지 마세요! 이 야생의 여정은 흥미진진할 뿐만 아니라 의미도 있어요. 오늘 바로 등록하고 평생 기억에 남을 순간들을 즐겨 보세요.',
    mainIdea: 'The writer invites readers to sign up for the exciting and meaningful journey of The Last Wild Race.',
    titleEn: 'Don’t Miss Out: Sign Up Today!',
    ko: [
      '‘마지막 야생 경주’를 경험할 준비가 되셨나요?',
      '이 놀라운 모험을 놓치지 마세요!',
      '이 야생의 여정은 흥미진진할 뿐만 아니라 의미도 있습니다.',
      '오늘 바로 등록하고 평생 지속될 순간들을 즐겨 보세요.',
    ],
    choices: [
      ['흥미진진하고 의미 있는 이 경주에 지금 참가하라.', '{Don’t miss out ~ Sign up today} — 참가 권유 — **정답**.'],
      ['경주는 너무 위험하므로 참가하지 마라.', '오히려 **놓치지 말라**고 한다.'],
      ['경주보다 휴식이 더 중요하다.', '휴식 이야기는 없다.'],
      ['등록은 경주 당일에만 할 수 있다.', '**오늘 바로** 등록하라고 한다.'],
      ['모험은 혼자 하는 것이 좋다.', '팀으로 참가하는 경주다.'],
    ],
    vocab: [
      'be ready to|숙|~할 준비가 되다|be prepared to|—|—',
      'experience|동|경험하다|go through|—|experience 경험(명)',
      'miss out on|숙|~을 놓치다|—|—|—',
      'amazing|형|놀라운|wonderful|boring 지루한|amaze 놀라게 하다',
      'adventure|명|모험|—|—|adventurous 모험심이 강한',
      'journey|명|여정, 여행|trip|—|—',
      'exciting|형|흥미진진한, 신나는|thrilling|boring 지루한|excite 흥분시키다',
      'meaningful|형|의미 있는|significant|meaningless 의미 없는|meaning 의미',
      'sign up|숙|등록하다, 가입하다|register|—|sign-up 등록',
      'moment|명|순간|instant|—|—',
      'last|동|지속되다|continue|—|lasting 지속적인',
      'lifetime|명|평생, 일생|—|—|life 삶',
    ],
    flow: [
      ['🙋', '질문 — 준비됐나요?', '‘마지막 야생 경주’를 **경험할 준비가 되었는지** 묻는다.'],
      ['🚫', '권유 — 놓치지 마세요', '이 **놀라운 모험을 놓치지 말라**고 한다.'],
      ['✨', '가치 — 흥미 + 의미', '이 여정은 **흥미진진할 뿐만 아니라 의미도 있다**.'],
      ['📝', '행동 — 오늘 등록!', '**오늘 바로 등록**하고 **평생 남을 순간**을 즐기라 — 홍보 글의 **마무리(요지)**.'],
    ],
    cards: [
      {
        covers: [1, 2],
        en: 'Are you [g:ready to experience] “The Last Wild Race”? | [g:Don’t miss out on] this amazing adventure!',
        note: '**해석 도움** — ‘마지막 야생 경주’를 **경험할 준비가 되었나요**? 이 놀라운 모험을 **놓치지 마세요**!',
        points: [
          ['grammar', '**be ready to + 동사원형** — {Are you ready to experience ~?} "~을 **경험할 준비가 되었나요**?"'],
          ['grammar', '**부정 명령문 Don’t + 동사원형** — {Don’t miss out on ~} "~을 **놓치지 마세요**".'],
          ['vocab', '**miss out on / amazing / adventure** — ~을 놓치다 / 놀라운 / 모험.'],
        ],
      },
      {
        covers: [3],
        tags: ['title'],
        en: 'This wild journey is [g:not only] exciting [g:but also] meaningful.',
        note: '**해석 도움** — 이 야생의 여정은 **흥미진진할 뿐만 아니라 의미도 있다** — 경주의 **두 가지 가치**.',
        points: [
          ['grammar', '**not only A but also B (형용사 병렬)** — {not only exciting but also meaningful}. 1단락의 {not only strength but also teamwork}(명사 병렬)와 같은 구조.'],
          ['vocab', '**exciting / meaningful** — 흥미진진한(감정을 **일으키는** -ing) / 의미 있는({meaning} + {-ful}).'],
          ['reading', '**meaningful 인 이유** — 2단락의 **자연 보호**·3단락의 **팀워크와 준비** — 스포츠 이상의 의미.'],
        ],
      },
      {
        covers: [4],
        en: '[g:Sign up] today and [g:enjoy] moments [r:that] [g:will last] a lifetime.',
        note: '**해석 도움** — **오늘 바로 등록하고** **평생 지속될 순간들**을 즐기세요 — 등록을 권하는 **마지막 행동 촉구**.',
        points: [
          ['grammar', '**명령문 + and 병렬** — {Sign up today and enjoy ~} 동사원형 두 개를 and 로 연결.'],
          ['grammar', '**주격 관계대명사 that** — {moments that will last a lifetime} "평생 **지속될** 순간들". 선행사 {moments}.'],
          ['vocab', '**sign up / last(동) / lifetime** — 등록하다 / **지속되다**(형용사 "마지막의"와 구별) / 평생.'],
        ],
      },
    ],
    prompt: `Photorealistic landscape photograph, wide banner composition. A small bright orange checkpoint flag on a slim pole planted at the top of a rocky ridge, overlooking a sweeping Patagonian panorama of turquoise lakes, glaciers and distant mountains, the end of a long wild journey, wide open sky above. ${LIGHT}, sky blue, glacier white and bright orange accent. ${NO}, bikes, kayaks, ropes, maps, first-aid kit, tents, banners --ar 16:5 --v 8.1`,
  },
];

for (const c of chapters) writeChapter('L8', SOURCE, c);
