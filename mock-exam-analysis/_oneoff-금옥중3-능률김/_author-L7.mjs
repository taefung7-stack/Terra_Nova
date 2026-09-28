/* 금옥중3 능률(김성곤) Lesson 7 — Future Changes through Technology 챕터 저작 데이터
 * 실행: node _author-L7.mjs  → data/L7/{1..4}.json
 *
 * ★ 소제목(AI Speakers / AI Pets / Home Helper Robot / Self-Driving Car /
 *   Robot Swarm / Search-and-Rescue Robot …)은 본문 문장이 아니라 정본에서 뺐다.
 *   소제목 바로 뒤 문장의 They·This robot 이 무엇을 가리키는지 알 수 있도록
 *   해석(passage_ko) 앞에 (AI 스피커)처럼 소제목을 밝혀 두었다. */
import { writeChapter } from './_author.mjs';
import { SOURCE } from './_SOURCE-L7.js';

const LIGHT = 'natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette';
const NO = '--no text, letters, words, logo, watermark, screen interface, people, person, hands, faces, humanoid face, sunset, golden hour, night, dark moody grading, heavy shadows, neon';

const chapters = [
  /* ── Ch1 ─────────────────────────────────────────── */
  {
    no: 1, type: '주제', answer: 1,
    question: '다음 글의 주제로 가장 적절한 것은?',
    summary: '로봇은 이제 더 이상 영화와 책 속에만 있지 않아요. 세계 곳곳에서 로봇은 다양한 일을 하고 있어요. 하늘을 나는 배달 로봇, 공장의 로봇 팔, 그리고 공공장소의 서비스 로봇이 그 예예요.',
    mainIdea: 'Robots are no longer only in movies and books; they are doing many kinds of tasks around the world.',
    titleEn: 'Where Do We See Robots? Robots in Real Life',
    ko: [
      '로봇은 더 이상 영화와 책 속에만 있지 않다.',
      '세계 곳곳에서 로봇은 다양한 일을 수행하고 있다.',
      '하늘에는 날아다니는 배달 로봇이, 공장에는 로봇 팔이, 그리고 공공장소에는 서비스 로봇이 있다.',
    ],
    choices: [
      ['현실 세계 곳곳에서 다양한 일을 하는 로봇', '로봇이 **영화·책 밖**으로 나와 **세계 곳곳에서 다양한 일**을 한다는 것이 글의 중심이다. **정답**.'],
      ['로봇이 등장하는 유명한 영화와 책', '영화와 책은 **예전의 로봇**을 말하려고 잠깐 나올 뿐, 특정 작품을 소개하지 않는다.'],
      ['공장에서 로봇 팔을 만드는 과정', '로봇 팔은 **예시 중 하나**일 뿐, **제작 과정**은 나오지 않는다.'],
      ['배달 로봇이 일으키는 사고', '배달 로봇은 **하늘을 나는 예시**로만 나온다. **사고** 이야기는 없다.'],
      ['로봇 기술 발전의 역사', '과거부터의 **발전 과정**이 아니라 **현재 로봇이 쓰이는 곳**을 소개한다.'],
    ],
    vocab: [
      'robot|명|로봇|machine|human 인간|robotic 로봇의',
      'not ~ anymore|숙|더 이상 ~ 아니다|no longer|—|—',
      'around the world|숙|세계 곳곳에서|worldwide, globally|—|—',
      'a variety of|숙|다양한|various, many kinds of|—|variety 다양성',
      'task|명|일, 업무|job, work|—|—',
      'delivery|명|배달|shipping|—|deliver 배달하다',
      'factory|명|공장|plant|—|—',
      'service|명|서비스, 봉사|—|—|serve 봉사하다',
      'public|형|공공의|common, shared|private 사적인|publicly 공개적으로',
    ],
    flow: [
      ['🎬', '예전 — 영화와 책 속의 로봇', '{not only in movies and books anymore} — 로봇은 **예전에는 상상 속**(영화·책)에만 있었다는 것을 전제로 한다.'],
      ['🌐', '지금 — 세계 곳곳의 로봇', '{Around the world} 로 범위를 넓혀, 로봇이 **현실에서 다양한 일**을 하고 있다고 말한다.'],
      ['🚁', '예시 ① — 하늘의 배달 로봇', '{delivery robots flying in the sky} — 하늘을 **날아다니며 물건을 배달**하는 로봇.'],
      ['🏭', '예시 ②③ — 공장과 공공장소', '**공장의 로봇 팔**과 **공공장소의 서비스 로봇**(예: 평창 올림픽)으로 예시를 마무리한다.'],
    ],
    cards: [
      {
        covers: [1, 2],
        en: 'Robots are [r:not only] in movies and books [r:anymore]. | [h:Around the world], robots [g:are doing] [h:a variety of tasks].',
        note: '**해석 도움** — {not ~ anymore} 는 "**더 이상 ~ 아니다**". {not only} 가 있지만 여기서는 {but also} 가 없는 형태로 "**더 이상 영화와 책 속에만 있는 것이 아니다**"로 해석한다.',
        points: [
          ['grammar', '**not ~ anymore = no longer** — {Robots are not ~ anymore} = {Robots are no longer ~}. 예전과 **달라진 상황**을 나타낸다.'],
          ['grammar', '**현재진행형 are doing** — 지금 **실제로 일어나고 있는** 일임을 강조한다.'],
          ['vocab', '**a variety of + 복수명사** — "**다양한** ~". {a variety of tasks} = {various tasks}.'],
        ],
      },
      {
        covers: [3],
        en: '[g:There are] delivery robots [r:flying in the sky], | robot arms in factories, | [h:and] service robots in public places.',
        ko: '하늘에는 날아다니는 배달 로봇이, | 공장에는 로봇 팔이, | 그리고 공공장소에는 서비스 로봇이 있다.',
        note: '**해석 도움** — {There are} 뒤에 세 가지 예시가 **콤마와 and로 나열**된다. {flying in the sky} 는 {delivery robots} 를 뒤에서 꾸미는 **현재분사구**다.',
        points: [
          ['grammar', '**There are + 복수명사** — 뒤에 오는 명사가 **복수**라 {are}. 첫 명사 {delivery robots} 에 수를 맞춘다.'],
          ['grammar', '**현재분사의 후치 수식** — {robots flying in the sky} "하늘을 **날고 있는** 로봇". 분사에 **수식어구가 붙으면** 명사 **뒤**에 온다.'],
          ['grammar', '**A, B, and C 나열** — 세 개 이상을 나열할 때 **마지막 항목 앞에만 and** 를 쓴다.'],
        ],
      },
    ],
    prompt: `Photorealistic urban photograph, wide banner composition. A white quadcopter delivery drone carrying a small cardboard parcel flies over a clean modern city, seen from a rooftop level: rows of bright apartment buildings and green street trees below, wide open pale sky filling most of the frame. Clear, optimistic, near-future everyday scene. ${LIGHT}, soft sky blue and white. ${NO}, robot dog, robot arm, factory --ar 16:5 --v 8.1`,
  },

  /* ── Ch2 ─────────────────────────────────────────── */
  {
    no: 2, type: '내용일치', answer: 3,
    question: '다음 글의 내용과 일치하는 것은?',
    summary: '과거에 로봇은 인간이 프로그래밍한 쉬운 일만 했어요. 하지만 이제 로봇은 점점 더 똑똑해지고 있고, 곧 인간처럼 생각할 수 있을지도 몰라요. 이를 가능하게 하는 것이 인공지능(AI)이에요. AI를 갖춘 로봇은 환경을 인지하고 결정을 내리며, 말을 알아듣고 농담을 하고 인간과 게임도 해요. AI 스피커는 질문에 답하고 집 안의 기계를 제어하며 음악을 틀어 주고, AI 반려동물은 진짜 강아지처럼 주인과 걷고 놀며 칭찬을 알아들어요.',
    mainIdea: 'Thanks to artificial intelligence, robots are becoming smart enough to perceive, decide, and interact with humans, as AI speakers and AI pets show.',
    titleEn: 'Robots Are Becoming Smart: The Power of AI',
    ko: [
      '과거에 로봇은 인간이 로봇에게 행하도록 프로그래밍한 간단한 일만을 수행했다.',
      '그러나 로봇은 이제 점점 ‘더 똑똑해지고’ 있으며, 곧 그들은 인간처럼 생각을 할 수 있을지도 모른다.',
      '이를 가능하게 하는 것이 인공지능(AI)이다.',
      '인공지능을 갖춘 로봇은 환경을 인지하고 결정을 내릴 수 있다.',
      '그들은 또한 말을 인식하고, 농담을 건네며, 인간과 게임을 할 수도 있다.',
      '(AI 스피커) 그들은 당신의 질문에 대답할 수 있고, 당신의 가정에 있는 기계를 제어할 수 있으며, 당신을 위해 음악을 재생할 수도 있다.',
      '(AI 반려동물) 그들은 꼭 진짜 강아지처럼 행동한다.',
      '그들은 주인과 함께 걷고 놀며 칭찬을 알아듣는다.',
    ],
    choices: [
      ['과거의 로봇은 스스로 판단하여 어려운 일을 해냈다.', '{performed only easy tasks that humans programmed them to do} — 과거 로봇은 인간이 **프로그래밍한 쉬운 일만** 했다.'],
      ['로봇은 이미 인간과 똑같이 생각할 수 있게 되었다.', '{soon they might be able to think like humans} — **곧 그럴지도 모른다**는 **가능성**이다. **이미** 그렇다는 것은 틀리다.'],
      ['인공지능을 갖춘 로봇은 환경을 인지하고 결정을 내릴 수 있다.', '{Robots that have AI can perceive environments and make decisions.} 와 **일치**한다. **정답**.'],
      ['AI 스피커는 질문에 답할 수 있지만 음악은 재생하지 못한다.', 'AI 스피커는 {play music for you} — 음악도 **재생할 수 있다**.'],
      ['AI 반려동물은 주인의 칭찬을 알아듣지 못한다.', '{They walk and play with their owners and recognize praise.} — 칭찬을 **알아듣는다**.'],
    ],
    vocab: [
      'in the past|숙|과거에|before, formerly|in the future 미래에|—',
      'perform|동|수행하다|do, carry out|—|performance 수행, 공연',
      'program|동|프로그래밍하다|code|—|programmer 프로그래머',
      'smart|형|똑똑한|intelligent, clever|stupid 어리석은|smartly 영리하게',
      'might|조|~일지도 모른다|may|—|—',
      'possible|형|가능한|—|impossible 불가능한|possibility 가능성',
      'artificial intelligence|명|인공지능|AI|human intelligence 인간 지능|artificial 인공의',
      'perceive|동|인지하다, 감지하다|notice, sense|miss 놓치다|perception 인식',
      'environment|명|환경|surroundings|—|environmental 환경의',
      'make a decision|숙|결정을 내리다|decide|—|decision 결정',
      'recognize|동|인식하다, 알아보다|identify, know|—|recognition 인식',
      'speech|명|말, 언어|talk, words|—|speak 말하다',
      'joke|명|농담|—|—|tell a joke 농담하다',
      'control|동|제어하다, 조종하다|operate, manage|—|control 통제(명사)',
      'machine|명|기계|device|—|machinery 기계류',
      'act like|숙|~처럼 행동하다|behave like|—|action 행동',
      'owner|명|주인|keeper|—|own 소유하다',
      'praise|명|칭찬|compliment|blame 비난|praise 칭찬하다(동사)',
    ],
    flow: [
      ['⚙️', '과거 — 프로그래밍된 일만', '과거 로봇은 **인간이 프로그래밍한 쉬운 일만** 했다. 스스로 생각하지 못했다.'],
      ['🧠', '현재 — 똑똑해지는 로봇, 그 원인 AI', '{However} 로 전환 — 로봇이 **‘더 똑똑해지고’** 있으며 곧 **인간처럼 생각**할지도 모른다. 그 원동력은 **인공지능(AI)** 이다.'],
      ['👀', 'AI 로봇의 능력', '**환경 인지·결정**은 물론 **말 인식·농담·게임**까지 가능하다. 인간과 **상호작용**하는 수준이 되었다.'],
      ['🔊', '예시 — AI 스피커와 AI 반려동물', '**AI 스피커**는 질문에 답하고 기계를 제어하며 음악을 틀고, **AI 반려동물**은 진짜 강아지처럼 걷고 놀며 **칭찬을 알아듣는다**.'],
    ],
    cards: [
      {
        covers: [1],
        en: '[h:In the past], robots performed [r:only] easy tasks | [g:that humans programmed them to do].',
        ko: '과거에 로봇은 간단한 일만을 수행했다 | 인간이 로봇에게 행하도록 프로그래밍한',
        note: '**해석 도움** — {that humans programmed them to do} 는 {easy tasks} 를 꾸미는 **목적격 관계대명사절**이다. {program + 목적어 + to부정사} 는 "(목적어)가 ~하도록 **프로그래밍하다**". {them} 은 **robots** 다.',
        points: [
          ['grammar', '**목적격 관계대명사 that** — {tasks that humans programmed them to do ___}. {do} 의 목적어 자리가 비어 있어 **목적격**이다.'],
          ['grammar', '**동사 + 목적어 + to부정사** — {programmed them to do}. {want, ask, allow, program} 처럼 **목적격보어로 to부정사**를 쓴다.'],
          ['reading', '**only 의 의미** — 과거 로봇의 **한계**(쉬운 일만, 시킨 일만)를 강조한다. 다음 문장 {However} 와 **대조**된다.'],
        ],
      },
      {
        covers: [2],
        en: '[r:However], robots are now [g:getting “smarter,”] | and soon they [g:might be able to] think like humans.',
        ko: '그러나 로봇은 이제 점점 ‘더 똑똑해지고’ 있으며, | 곧 그들은 인간처럼 생각을 할 수 있을지도 모른다.',
        note: '**해석 도움** — {get + 비교급} 은 "**점점 더 ~해지다**". 따옴표 “smarter” 는 로봇이 **사람처럼** 똑똑해진다는 **비유적 표현**임을 나타낸다. {might} 는 **약한 추측**("~일지도 모른다").',
        points: [
          ['grammar', '**get + 비교급 (진행형)** — {are getting smarter} "**점점 더** 똑똑해지고 있다". 변화가 **진행 중**임을 나타낸다.'],
          ['grammar', '**might be able to** — 조동사 두 개를 겹쳐 쓸 수 없으므로 {might can} ✗ 대신 {might be able to} 를 쓴다.'],
          ['vocab', '**like (전치사)** — {think like humans} "인간**처럼** 생각하다". 동사 {like}(좋아하다)가 아니다.'],
        ],
      },
      {
        covers: [3],
        en: '[g:What makes this possible] | is artificial intelligence (AI).',
        ko: '이를 가능하게 하는 것은 | 인공지능(AI)이다.',
        note: '**해석 도움** — 주어는 관계대명사 {What} 이 이끄는 절 {What makes this possible} 전체이고, 동사는 {is} 다. "~하는 **것**은 인공지능이다". {this} 는 **로봇이 똑똑해지는 것**을 가리킨다.',
        points: [
          ['grammar', '**관계대명사 what절 주어** — {What makes this possible} 이 **주어**. what절 주어는 **단수 취급**하므로 {is}.'],
          ['grammar', '**make + 목적어 + 형용사** — {makes this possible} "이것을 **가능하게** 만들다". 5형식.'],
        ],
      },
      {
        covers: [4, 5],
        en: 'Robots [g:that have AI] can [h:perceive environments] [r:and] [h:make decisions]. | They can also [h:recognize speech], [h:tell jokes], [r:and] [h:play games] with humans.',
        note: '**해석 도움** — {that have AI} 는 {Robots} 를 꾸미는 **주격 관계대명사절**이다. 주어는 {Robots that have AI}, 동사는 {can perceive ~ and make ~} 다.',
        points: [
          ['grammar', '**주격 관계대명사 that** — {Robots that have AI} "AI를 **가진** 로봇". 선행사가 복수라 {have}.'],
          ['grammar', '**조동사 뒤 동사원형 병렬** — {can recognize, tell, and play}. 조동사 {can} 하나가 동사 **세 개**에 모두 걸린다.'],
          ['vocab', '**perceive / recognize** — {perceive} 는 **감각으로 알아차리다**, {recognize} 는 **알아보다·인식하다**. 둘 다 AI 로봇의 **인지 능력**이다.'],
        ],
      },
      {
        covers: [6],
        en: 'They can [h:answer your questions], | [h:control machines in your home], | [r:and] [h:play music for you].',
        ko: '(AI 스피커) 그들은 당신의 질문에 대답할 수 있고, | 당신의 가정에 있는 기계를 제어할 수 있으며, | 당신을 위해 음악을 재생할 수도 있다.',
        note: '**해석 도움** — 소제목 **AI Speakers** 아래 문장이다. {They} 는 **AI 스피커**를 가리킨다. {answer} 는 **타동사**라 {answer to your questions} ✗.',
        points: [
          ['grammar', '**동사구 3개 병렬** — {can answer ~, control ~, and play ~}. 모두 **동사원형**이다.'],
          ['grammar', '**타동사 answer** — {answer your questions}. "~에 대답하다"로 해석되지만 **전치사 없이** 목적어를 바로 쓴다.'],
        ],
      },
      {
        covers: [7, 8],
        en: 'They [g:act just like] real dogs. | They [h:walk and play] with their owners [r:and recognize praise].',
        ko: '(AI 반려동물) 그들은 꼭 진짜 강아지처럼 행동한다. | 그들은 주인과 함께 걷고 놀며 칭찬을 알아듣는다.',
        note: '**해석 도움** — 소제목 **AI Pets** 아래 문장이다. {They} 는 **AI 반려동물**이다. {just like} 는 "**꼭 ~처럼**".',
        points: [
          ['grammar', '**act like + 명사** — {act just like real dogs} "진짜 강아지**처럼** 행동하다". {just} 는 "꼭, 바로"라는 **강조**.'],
          ['grammar', '**동사 병렬** — {walk and play ~ and recognize ~}. 주어 {They} 에 동사 **세 개**가 이어진다.'],
          ['vocab', '**praise** — "**칭찬**". 명사·동사 형태가 같다({praise a child} 아이를 칭찬하다).'],
        ],
      },
    ],
    prompt: `Photorealistic interior photograph, wide banner composition. A bright modern living room with a small white robot dog, sleek and friendly with rounded plastic body panels, sitting on a light wooden floor and looking up attentively, and a round cylindrical smart speaker glowing with a soft blue ring light on a low shelf beside a sofa. Minimal Scandinavian decor, large window. ${LIGHT}, white, light wood and soft blue accents. ${NO}, drone, car, real dog --ar 16:5 --v 8.1`,
  },

  /* ── Ch3 ─────────────────────────────────────────── */
  {
    no: 3, type: '내용불일치', answer: 4,
    question: '다음 글의 내용과 일치하지 않는 것은?',
    summary: '로봇은 일을 더 빠르고 쉽게 만들어 주며, 가정·도로·재난 지역 어디에서든 우리를 도울 수 있어요. 가정 도우미 로봇은 하루 종일 가족을 도와 요리와 청소를 쉽게 해 주고, 가족과 대화하며 감정도 감지해요. 자율 주행차는 운전자가 필요 없고, 카메라·감지기·소프트웨어로 길을 찾아가 사람이 쉬면서 주행을 즐길 수 있게 해요. 로봇 군집은 개미나 벌처럼 서로 소통하는 대규모 로봇 집단으로, 농장이나 건설 현장 같은 곳에서 집단으로 일하며 해결책을 찾아요.',
    mainIdea: 'Robots such as home helper robots, self-driving cars, and robot swarms make life faster and easier by helping us at home, on roads, and in many workplaces.',
    titleEn: 'Robots around Us: Home Helpers, Self-Driving Cars, and Robot Swarms',
    ko: [
      '로봇은 일을 더 빠르고 더 쉽게 만들어 주고 있다.',
      '그들은 어디에서나 우리를 도울 수 있다 — 우리의 가정에서, 길에서, 또는 재난 지역에서.',
      '(가정 도우미 로봇) 이 로봇은 온종일 당신의 가족을 돕는다.',
      '만약 당신이 이런 로봇 하나를 가지고 있다면 요리와 청소가 더 쉬워질 것이다.',
      '이 로봇은 또한 가족 구성원들과 이야기를 나누며 감정을 감지할 수 있다.',
      '(자율 주행차) 자율 주행차는 운전자를 필요로 하지 않는다.',
      '카메라, 감지기, 그리고 소프트웨어를 이용하여, 이 차는 당신이 쉬면서 주행을 즐길 수 있도록 당신을 위해 길을 찾아갈 수 있다.',
      '(로봇 군집) 로봇 군집이란 개미나 벌처럼 서로 의사소통할 수 있는 대규모의 로봇 집단을 말한다.',
      '그들은 농장이나 건설 현장을 포함하여 다양한 장소에서 사용될 수 있다.',
      '그들은 집단을 이루어 임무에 착수하고 해결책을 찾는다.',
    ],
    choices: [
      ['로봇은 가정, 도로, 재난 지역 등 어디에서나 도움을 줄 수 있다.', '{They can help us anywhere — in our homes, on roads, or in disaster areas.} 와 일치한다.'],
      ['가정 도우미 로봇은 가족 구성원의 감정을 감지할 수 있다.', '{It also talks with family members and can sense emotions.} 와 일치한다.'],
      ['자율 주행차는 카메라와 감지기, 소프트웨어를 이용해 길을 찾아간다.', '{With cameras, sensors, and software, it can navigate roads} 와 일치한다.'],
      ['로봇 군집의 로봇들은 서로 소통하지 않고 각자 따로 일한다.', '로봇 군집은 **서로 소통하며**({communicate with one another}) **집단으로** 일한다({as a group}). **불일치 → 정답**.'],
      ['로봇 군집은 농장이나 건설 현장에서 사용될 수 있다.', '{including farms or building sites} 와 일치한다.'],
    ],
    vocab: [
      'anywhere|부|어디에서나|everywhere|nowhere 아무 데도|—',
      'disaster|명|재난, 재해|catastrophe|—|disastrous 처참한',
      'area|명|지역|region, zone|—|—',
      'family member|명|가족 구성원|relative|stranger 낯선 사람|member 구성원',
      'throughout|전|~ 내내|all through|—|—',
      'sense|동|감지하다, 느끼다|feel, detect|—|sense 감각(명사) / sensor 감지기',
      'emotion|명|감정|feeling|—|emotional 감정적인',
      'self-driving|형|자율 주행의|driverless, autonomous|—|drive 운전하다',
      'sensor|명|감지기, 센서|detector|—|sense 감지하다',
      'software|명|소프트웨어|program|hardware 하드웨어|—',
      'navigate|동|길을 찾다, 항해하다|find one’s way, steer|get lost 길을 잃다|navigation 항해, 길 찾기',
      'relax|동|쉬다, 긴장을 풀다|rest|—|relaxed 편안한',
      'swarm|명|(곤충 등의) 떼, 군집|crowd, group|individual 개체|—',
      'communicate|동|의사소통하다|talk, contact|—|communication 의사소통',
      'one another|대|서로|each other|—|—',
      'including|전|~을 포함하여|such as|excluding ~을 제외하고|include 포함하다',
      'building site|명|건설 현장|construction site|—|build 짓다',
      'solution|명|해결책|answer, way out|problem 문제|solve 해결하다',
    ],
    flow: [
      ['⚡', '도입 — 어디서나 돕는 로봇', '로봇은 일을 **더 빠르고 쉽게** 만들며, **가정·도로·재난 지역** 어디에서나 우리를 돕는다. 이후 **세 가지 로봇**이 소개된다.'],
      ['🏠', '가정 도우미 로봇', '온종일 가족을 돕고 **요리·청소**를 쉽게 해 준다. 가족과 **대화**하고 **감정을 감지**한다.'],
      ['🚗', '자율 주행차', '**운전자가 필요 없다**. **카메라·감지기·소프트웨어**로 길을 찾아, 사람은 **쉬면서 주행을 즐긴다**.'],
      ['🐝', '로봇 군집', '**개미나 벌처럼 서로 소통**하는 대규모 로봇 집단. **농장·건설 현장**에서 **집단으로** 일하고 해결책을 찾는다.'],
    ],
    cards: [
      {
        covers: [1, 2],
        en: 'Robots are [g:making things faster and easier]. | They can help us [h:anywhere] — in our homes, on roads, or in disaster areas.',
        note: '**해석 도움** — {make + 목적어 + 형용사} 에서 목적격보어 자리에 비교급 {faster and easier} 가 왔다. 대시(—) 뒤는 {anywhere} 를 **구체적으로 풀어 쓴** 부분이다.',
        points: [
          ['grammar', '**make + 목적어 + 형용사(비교급)** — {making things faster and easier} "일을 **더 빠르고 더 쉽게** 만들다".'],
          ['reading', '**대시(—)의 역할** — {anywhere} 의 **구체적인 예**(가정·도로·재난 지역)를 덧붙인다. 이 세 장소가 뒤에 나오는 로봇들과 **연결**된다.'],
        ],
      },
      {
        covers: [3, 4],
        en: 'This robot helps your family [h:throughout the day]. | Cooking and cleaning [g:would be easier] | [g:if you had one].',
        ko: '(가정 도우미 로봇) 이 로봇은 온종일 당신의 가족을 돕는다. | 요리와 청소가 더 쉬워질 것이다 | 만약 당신이 이런 로봇 하나를 가지고 있다면',
        note: '**해석 도움** — {if you had one, ~ would be ~} 는 **가정법 과거**로, **현재 사실과 반대**되는 상황(지금은 이 로봇이 없다)을 가정한다. {one} 은 **a home helper robot** 이다.',
        points: [
          ['grammar', '**가정법 과거** — {If + 주어 + 과거동사, 주어 + would + 동사원형}. "(지금 없지만) 만약 **있다면** ~할 텐데". 이 과의 **핵심 문법**이다.'],
          ['grammar', '**동명사 주어** — {Cooking and cleaning} "요리하는 것과 청소하는 것"이 주어다. 동사원형이 주어 자리에 올 수 없으므로 **-ing** 형을 쓴다.'],
          ['vocab', '**throughout the day** — "**하루 종일**". {throughout} 은 "~ 내내".'],
        ],
      },
      {
        covers: [5],
        en: 'It [r:also] [g:talks with] family members [g:and can sense] emotions.',
        ko: '이 로봇은 또한 가족 구성원들과 이야기를 나누며 감정을 감지할 수 있다.',
        note: '**해석 도움** — 주어 {It}(가정 도우미 로봇)에 {talks} 와 {can sense} 가 {and} 로 이어진다. 앞은 **일반동사 현재형**, 뒤는 **조동사 + 동사원형**이다.',
        points: [
          ['grammar', '**형태가 다른 동사 병렬** — {talks ~ and can sense ~}. 병렬은 **동사끼리** 맞으면 되므로 시제·조동사 유무가 달라도 된다.'],
          ['vocab', '**sense (동사)** — "**감지하다, 느끼다**". 명사 {sense}(감각)와 형태가 같다. {sensor}(감지기)와 어원이 같다.'],
        ],
      },
      {
        covers: [6, 7],
        en: 'A self-driving car [g:doesn’t need] a driver. | [r:With cameras, sensors, and software], | it can [h:navigate roads] for you | [g:so that you can relax] [g:and enjoy] the ride.',
        ko: '(자율 주행차) 자율 주행차는 운전자를 필요로 하지 않는다. | 카메라, 감지기, 그리고 소프트웨어를 이용하여, | 이 차는 당신을 위해 길을 찾아갈 수 있다 | 당신이 쉬면서 주행을 즐길 수 있도록',
        note: '**해석 도움** — {With ~} 는 "~을 **가지고, 이용하여**"라는 **수단**이다. {so that + 주어 + can ~} 은 "~가 ~**할 수 있도록**"이라는 **목적**을 나타낸다.',
        points: [
          ['grammar', '**so that + 주어 + can + 동사원형** — {so that you can relax} "당신이 **쉴 수 있도록**". {in order that} 과 같은 뜻이다.'],
          ['grammar', '**수단의 with** — {With cameras, sensors, and software} "카메라, 감지기, 소프트웨어**로**". 도구·수단을 나타낸다.'],
          ['vocab', '**navigate** — "(길을) **찾아가다**, 항해하다". {navigation}(내비게이션)과 같은 어원이다.'],
        ],
      },
      {
        covers: [8],
        en: 'A robot swarm is a large group of robots | [g:that can communicate with one another], | [r:like ants or bees].',
        ko: '(로봇 군집) 로봇 군집이란 대규모의 로봇 집단을 말한다 | 서로 의사소통할 수 있는 | 개미나 벌처럼',
        note: '**해석 도움** — {that can communicate ~} 는 {a large group of robots} 를 꾸미는 **주격 관계대명사절**이다. {like ants or bees} 의 {like} 는 **전치사**로 "~**처럼**".',
        points: [
          ['grammar', '**주격 관계대명사 that** — {robots that can communicate with one another}. 선행사는 {robots} 다.'],
          ['vocab', '**one another = each other** — "**서로**". 원래 {one another} 는 셋 이상, {each other} 는 둘 사이에 쓴다고 배우지만 요즘은 **구분 없이** 쓴다.'],
          ['reading', '**비유 like ants or bees** — 개미·벌처럼 **떼 지어 협력**하는 모습에 빗대 **로봇 군집**을 설명한다.'],
        ],
      },
      {
        covers: [9, 10],
        en: 'They [g:can be used] in a variety of places, | [r:including] farms or building sites. | They [h:work on tasks] and [h:find solutions] [r:as a group].',
        ko: '그들은 다양한 장소에서 사용될 수 있다 | 농장이나 건설 현장을 포함하여 | 그들은 집단을 이루어 임무에 착수하고 해결책을 찾는다.',
        note: '**해석 도움** — {can be used} 는 **조동사가 있는 수동태**("사용될 수 있다"). {including} 은 "~을 **포함하여**"라는 **전치사**로 예시를 덧붙인다.',
        points: [
          ['grammar', '**조동사 + be + p.p.** — {can be used} "**사용될 수 있다**". 로봇은 사람이 **사용하는** 대상이므로 수동태.'],
          ['grammar', '**전치사 including** — {including farms or building sites}. 뒤에 **명사**가 온다. {such as} 로 바꿔 쓸 수 있다.'],
          ['vocab', '**as a group** — "**집단으로, 무리를 지어**". 로봇 군집의 **핵심 특징**이다.'],
        ],
      },
    ],
    prompt: `Photorealistic agricultural technology photograph, wide banner composition. A robot swarm working on a wide green farm field: dozens of small identical white wheeled robots spread evenly in neat rows between crops, moving together like a colony of ants, some tending plants, gentle rolling farmland and a row of trees on the horizon. Organized, cooperative, futuristic yet calm. ${LIGHT}, fresh greens and clean white. ${NO}, drone, humanoid robot, tractor driver, rubble --ar 16:5 --v 8.1`,
  },

  /* ── Ch4 ─────────────────────────────────────────── */
  {
    no: 4, type: '요지', answer: 2,
    question: '다음 글의 요지로 가장 적절한 것은?',
    summary: '수색 구조 로봇은 사람에게 위험한 재난 지역에 들어가 생존자를 찾고, 위험 요소를 처리하며, 사람들이 안전하게 탈출할 수 있도록 길을 치워요. 로봇과 함께하는 우리의 미래는 밝지만 완벽하지는 않아요. 어떤 사람들은 로봇 덕분에 생활이 더 편리해질 것이라 기대하지만, 다른 사람들은 일자리와 안전에 대한 위협 같은 문제를 걱정해요. 중요한 것은 가능한 해결책을 찾고, 로봇이 반드시 좋은 일에만 쓰이도록 하는 것이에요.',
    mainIdea: 'Our future with robots is bright but not perfect, so we must find solutions to possible problems and make sure robots are only used for good.',
    titleEn: 'Looking toward the Future: Using Robots Only for Good',
    ko: [
      '(수색 구조 로봇) 수색 구조 로봇은 사람에게 위험한 재난 지역에 투입될 수 있다.',
      '그들은 생존자를 찾고, 위험 요소를 처리하며, 사람들이 안전한 곳으로 탈출할 수 있도록 길을 말끔히 치운다.',
      '(미래에 대한 전망) 로봇과 함께하는 우리의 미래는 밝지만 완벽해 보이지는 않는다.',
      '어떤 사람들은 로봇의 도움으로 생활이 더욱 편리해질 것이라고 기대한다.',
      '그러나 다른 어떤 사람들은 우리의 일자리와 안전에 대한 위협과 같이, 로봇이 일으킬지 모르는 문제들에 대해 걱정한다.',
      '중요한 것은 가능한 해결책들을 찾는 것과 로봇이 반드시 좋은 일을 위해서만 쓰이도록 하는 것이다.',
    ],
    choices: [
      ['로봇은 위험하므로 개발을 멈춰야 한다.', '글은 로봇의 **문제를 해결**하고 **좋은 일에 쓰자**는 것이지, **개발을 멈추자**는 것이 아니다.'],
      ['로봇의 문제에 대한 해결책을 찾고 로봇이 좋은 일에만 쓰이게 해야 한다.', '마지막 문장 {The important thing is to find possible solutions and to ensure that robots are only used for good.} 가 **요지**다. **정답**.'],
      ['로봇 덕분에 미래에는 아무런 문제도 없을 것이다.', '{looks bright but not perfect} — 미래는 밝지만 **완벽하지 않다**. 문제가 없다는 것은 틀리다.'],
      ['수색 구조 로봇은 사람보다 재난 지역에서 더 위험하다.', '재난 지역은 **사람에게 위험한 곳**이라 로봇이 대신 들어간다. 로봇이 더 위험하다는 말은 없다.'],
      ['로봇이 일자리를 빼앗는 것은 피할 수 없는 일이다.', '일자리 위협은 **일부 사람들의 걱정**으로 소개될 뿐, **피할 수 없다**고 단정하지 않는다.'],
    ],
    vocab: [
      'search-and-rescue|형|수색 구조의|—|—|search 수색 / rescue 구조',
      'disaster area|명|재난 지역|—|safe area 안전 지역|disaster 재난',
      'dangerous|형|위험한|risky, unsafe|safe 안전한|danger 위험',
      'survivor|명|생존자|—|victim 희생자|survive 살아남다 / survival 생존',
      'deal with|숙|~을 처리하다, 다루다|handle, cope with|ignore 무시하다|—',
      'clear|동|(장애물을) 치우다|remove, clean up|block 막다|clear 맑은(형용사)',
      'route|명|길, 경로|path, way|—|—',
      'escape|동|탈출하다|get away, flee|—|escape 탈출(명사)',
      'safety|명|안전|security|danger 위험|safe 안전한',
      'bright|형|밝은, 희망찬|hopeful, promising|dark 어두운|brightly 밝게',
      'perfect|형|완벽한|flawless|imperfect 불완전한|perfection 완벽',
      'expect|동|기대하다, 예상하다|anticipate|—|expectation 기대',
      'convenient|형|편리한|handy, easy|inconvenient 불편한|convenience 편리',
      'worry about|숙|~에 대해 걱정하다|be concerned about|—|worried 걱정하는',
      'cause|동|일으키다, 야기하다|bring about, lead to|—|cause 원인(명사)',
      'threat|명|위협|danger, risk|—|threaten 위협하다',
      'possible|형|가능한|—|impossible 불가능한|possibility 가능성',
      'ensure|동|반드시 ~하게 하다, 보장하다|make sure, guarantee|—|sure 확실한',
      'for good|숙|좋은 일을 위해|for good purposes|for evil 나쁜 일을 위해|—',
    ],
    flow: [
      ['🚨', '마지막 예시 — 수색 구조 로봇', '**사람에게 위험한 재난 지역**에 들어가 **생존자 수색 → 위험 처리 → 길 확보**로 사람들의 **탈출**을 돕는다.'],
      ['🔭', '전망 — 밝지만 완벽하지 않은 미래', '{looks bright but not perfect} — 로봇과 함께하는 미래에 대한 **양면적 평가**가 글의 결론부를 연다.'],
      ['⚖️', '두 입장 — 기대 vs. 걱정', '**어떤 사람들**은 **편리한 생활**을 기대하고({Some people}), **다른 사람들**은 **일자리·안전 위협**을 걱정한다({other people}).'],
      ['✅', '결론 — 해결책과 좋은 사용', '{The important thing is ~} — **해결책을 찾고** 로봇이 **좋은 일에만 쓰이도록 하는 것**이 가장 중요하다는 **글 전체의 요지**.'],
    ],
    cards: [
      {
        covers: [1],
        en: 'Search-and-rescue robots can [h:go into disaster areas] | [g:that are dangerous for humans].',
        ko: '(수색 구조 로봇) 수색 구조 로봇은 재난 지역에 투입될 수 있다 | 사람에게 위험한',
        note: '**해석 도움** — {that are dangerous for humans} 는 {disaster areas} 를 꾸미는 **주격 관계대명사절**이다. "사람에게 **위험한** 재난 지역".',
        points: [
          ['grammar', '**주격 관계대명사 that** — {areas that are dangerous}. 선행사가 복수 {areas} 라 {are}.'],
          ['vocab', '**search-and-rescue** — **하이픈으로 연결된 복합 형용사**. "수색(search)과 구조(rescue)를 하는".'],
        ],
      },
      {
        covers: [2],
        en: 'They [h:find survivors], [h:deal with dangers], [r:and] [h:clear routes] | [g:so that people can escape] to safety.',
        ko: '그들은 생존자를 찾고, 위험 요소를 처리하며, 길을 말끔히 치운다 | 사람들이 안전한 곳으로 탈출할 수 있도록',
        note: '**해석 도움** — 주어 {They} 에 동사 **세 개**(find, deal with, clear)가 나열된다. {so that + 주어 + can} 은 "~**할 수 있도록**"이라는 **목적**이다. {clear} 는 여기서 **동사**("치우다")다.',
        points: [
          ['grammar', '**A, B, and C 동사 병렬** — {find ~, deal with ~, and clear ~}. 모두 **현재형 복수 동사**다.'],
          ['grammar', '**so that + 주어 + can** — 앞 3과 {so that you can relax} 와 **같은 구문**이다. 목적을 나타낸다.'],
          ['vocab', '**clear (동사)** — "(장애물을) **치우다**". 형용사 {clear}(맑은, 분명한)와 뜻이 다르다. {escape to safety} 는 "**안전한 곳으로** 탈출하다".'],
        ],
      },
      {
        covers: [3, 4],
        en: 'Our future with robots [g:looks bright] [r:but not perfect]. | Some people [g:expect life to become] more convenient | [h:with the help of robots].',
        ko: '(미래에 대한 전망) 로봇과 함께하는 우리의 미래는 밝지만 완벽해 보이지는 않는다. | 어떤 사람들은 생활이 더욱 편리해질 것이라고 기대한다 | 로봇의 도움으로',
        note: '**해석 도움** — {look + 형용사} 는 "~**해 보이다**". {expect + 목적어 + to부정사} 는 "(목적어)가 ~할 것이라고 **기대하다**". {Some people} 은 뒤 문장의 {other people} 과 **짝**을 이룬다.',
        points: [
          ['grammar', '**감각동사 look + 형용사** — {looks bright but not perfect}. 보어 자리에 **형용사**가 온다({brightly} ✗).'],
          ['grammar', '**expect + 목적어 + to부정사** — {expect life to become more convenient}. 5형식 구문.'],
          ['reading', '**Some ~ / Other ~ 대조** — 로봇에 대한 **두 가지 시각**(기대 vs. 걱정)을 나란히 제시하는 구조다.'],
        ],
      },
      {
        covers: [5],
        en: '[r:However], other people [g:worry about] problems | [g:they might cause], | [h:such as threats to our jobs and safety].',
        ko: '그러나 다른 어떤 사람들은 문제들에 대해 걱정한다 | 로봇이 일으킬지 모르는 | 우리의 일자리와 안전에 대한 위협과 같은',
        note: '**해석 도움** — {they might cause} 앞에 목적격 관계대명사 {that} 이 **생략**되었다. {they} 는 **robots** 다. {such as} 는 "~와 같은"으로 **예시**를 든다.',
        points: [
          ['grammar', '**목적격 관계대명사 생략** — {problems (that) they might cause ___}. {cause} 의 목적어가 빠져 있다.'],
          ['grammar', '**such as + 명사** — {such as threats to our jobs and safety}. 앞 명사 {problems} 의 **구체적 예**를 든다.'],
          ['vocab', '**threat to ~** — "~에 대한 **위협**". 전치사 **to** 를 쓴다. 동사형은 {threaten}.'],
        ],
      },
      {
        covers: [6],
        en: '[h:The important thing] is [g:to find] possible solutions | [r:and] [g:to ensure] [h:that robots are only used for good].',
        ko: '중요한 것은 가능한 해결책들을 찾는 것과 | 로봇이 반드시 좋은 일을 위해서만 쓰이도록 하는 것이다.',
        note: '**해석 도움** — {is} 뒤에 **to부정사 보어 두 개**({to find ~ and to ensure ~})가 병렬로 온다. {ensure that ~} 은 "**반드시 ~하게 하다**". {for good} 은 여기서 "**좋은 일을 위해**"라는 뜻이다.',
        points: [
          ['grammar', '**to부정사 보어 병렬** — {The important thing is to find ~ and to ensure ~}. "중요한 것은 ~하는 **것**과 ~하는 **것**이다". 명사적 용법.'],
          ['grammar', '**수동태 are used** — {robots are only used for good}. 로봇은 **사용되는** 대상. {only} 는 {for good} 을 강조해 "**좋은 일에만**".'],
          ['reading', '**글 전체의 요지** — 로봇의 **장점과 문제**를 모두 보여 준 뒤, **해결책 + 좋은 사용**이라는 **결론**으로 마무리한다.'],
        ],
      },
    ],
    prompt: `Photorealistic documentary photograph, wide banner composition. A rugged four-legged search-and-rescue robot with tracked sensor head and bright orange safety panels carefully climbing over broken concrete rubble of a collapsed building after an earthquake, a cleared path visible behind it, light dust in the air, the open bright sky above suggesting hope. ${LIGHT}, pale concrete greys with vivid safety orange accents. ${NO}, fire, flames, smoke, blood, injured, drone, robot dog pet --ar 16:5 --v 8.1`,
  },
];

console.log('✍️  L7 저작');
for (const c of chapters) writeChapter('L7', SOURCE, c);
