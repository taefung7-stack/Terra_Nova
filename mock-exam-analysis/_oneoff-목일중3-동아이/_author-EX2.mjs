/* 목일중3 추가지문 2(EX2) — Unit 8 Supplementary Reading 저작 데이터 + 실행
 * 실행: node _author-EX2.mjs  → data/EX2/1.json
 * (중요) 사진 1쪽의 수업 필기(형광펜·밑줄·괄호·① ② 병렬 표시·여백 뜻)는 **[수업 필기]**,
 *   2쪽 단어표 14개의 손글씨 뜻·영영 풀이 빈칸은 **[수업 단어표]**, 문제 1~3 은 **[프린트 문제 N]** 으로 녹였다.
 *   필기 "free from: ~로부터 해방되다" 는 형용사구라 "~이 없는, ~에서 자유로운" 으로 함께 적었다.
 * hide_answer 라 choices 는 인쇄되지 않지만, 원본 1번 문제(제목)의 보기·정답 A 를 그대로 기록해 둔다. */
import { writeChapter } from './_author.mjs';
import { SOURCE } from './_SOURCE-EX2.js';

const LIGHT = 'natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette';
const NO = '--no text, letters, words, numbers, signage, logo, brand, watermark, people, person, hands, faces, sunset, golden hour, night, dark moody grading, heavy shadows';

const chapters = [
  {
    no: 1, exam: '목일중 3학년 · 추가지문 2', type: '제목', answer: 1,
    question: '윗글의 제목으로 가장 적절한 것은?',
    summary: '요즘 많은 사람이 외롭거나 스트레스를 받을 때 AI 챗봇과 대화하고, 일부는 AI를 친한 친구나 연인처럼 여기기도 해요. 인간관계는 노력이 필요하고 거절과 갈등의 위험이 있지만, AI는 늘 공손하게 들어 주고 떠나지 않아 안정감을 주기 때문이에요. 하지만 AI에게는 진짜 감정이 없어서, 사람과의 관계를 AI로 대신하면 깊고 진정한 연결을 경험할 기회를 잃을 수 있어요. AI는 유용한 도구일 뿐이며, 진짜 성장은 갈등과 화해를 포함한 실제 인간관계에서 나와요.',
    mainIdea: 'AI can comfort us, but it is only a tool and should never replace real human relationships, where true growth happens.',
    titleEn: 'A New Relationship Between Humans and AI: A Tool, Not a Substitute',
    ko: [
      '현대 시대에, 인공 지능(AI)은 점점 더 우리의 일상생활에 깊이 스며들고 있다.',
      '많은 사람들이 외로움이나 스트레스를 느낄 때, 또는 단순히 자신의 말을 들어 줄 누군가를 원할 때 AI 챗봇과 대화를 나눈다.',
      '이러한 시스템은 언제나 이용할 수 있고, 판단(평가)을 하지 않으며, 인간의 감정에 공감하는 것처럼 보인다.',
      '그 결과, 일부 사용자들은 AI를 친한 동반자로, 또는 어떤 경우에는 연인으로까지 여기기 시작한다.',
      '사람들이 AI에게서 정서적 위안을 찾는 데에는 몇 가지 이유가 있다.',
      '진정한 인간관계를 쌓는 것은 복잡할 수 있는데, 노력과 소통, 그리고 거절이나 갈등의 위험을 필요로 하기 때문이다.',
      '그에 반해, AI와 상호 작용하는 것은 힘이 들지 않는다. AI는 공손하게 응답하고, 주의 깊게 들어 주며, 결코 그들을 버리거나 말다툼하지 않는다.',
      '고립감이나 불안으로 힘들어하는 사람들에게, 그러한 상호 작용은 안정감과 안도감을 준다.',
      '그럼에도 불구하고, AI에 너무 많이 의존하는 것에는 상당한 단점이 따른다.',
      '가장 중요하게는, AI에게는 진정한 감정이 없다.',
      'AI는 인간이 할 수 있는 방식으로 사랑, 슬픔, 또는 고통을 진정으로 경험할 수 없다.',
      'AI의 겉으로 보이는 이해는 프로그래밍된 데이터에 기반한 모방에 불과하다.',
      '만약 사람들이 인간관계를 인공적인 관계로 대체한다면, 그들은 오직 실제 사람들만이 줄 수 있는 깊고 진정한 유대를 경험할 기회를 잃을지도 모른다.',
      'AI는 확실히 유용한 도구가 될 수 있는데, 특히 자신의 감정을 표현하거나 대화를 연습할 안전한 공간이 필요한 사람들에게 그렇다.',
      'AI는 생각을 정리하고 외로움을 줄이는 데 도움이 될 수 있다.',
      '하지만, AI가 진정한 상호 작용을 결코 대신해서는 안 된다.',
      '인간의 성장은 갈등, 화해, 그리고 감정의 나눔을 포함한 실제 경험을 통해 일어난다.',
      '이러한 어려움들은 우리에게 신뢰를 쌓고, 사랑을 표현하고, 의미 있는 방식으로 서로를 지지하는 법을 가르쳐 준다.',
      '결국, AI는 도구에 불과할 뿐 진정한 인간적 유대를 대신하는 것이 아니라는 점을 기억하는 것이 매우 중요하다.',
      'AI가 편리함과 위안을 줄 수는 있지만, 인생에서 가장 기억에 남고 우리를 변화시키는 순간들은 기쁨과 어려움이 모두 담긴 실제 관계에서 나온다.',
      'AI를 현명하게 사용한다는 것은 기계와 함께 고립 속으로 숨어드는 것이 아니라, AI의 한계를 인식하고 인간적 유대를 통해 진정한 성장을 추구하는 것을 의미한다.',
    ],
    choices: [
      ['A New Relationship Between Humans and AI', 'AI가 위안을 주는 **새로운 관계**를 소개하고 그 **한계**까지 다룬 글 전체를 포괄한다 — **정답**.'],
      ['The History of Artificial Intelligence', 'AI의 **역사**는 다루지 않는다.'],
      ['Why Humans Need Friends', '사람에게 친구가 필요한 이유는 일부 내용일 뿐, 글의 중심은 **AI와의 관계**다.'],
      ['The Best Way to Overcome Loneliness', 'AI가 외로움을 줄일 수 있다고는 하지만, 외로움 극복 **방법**을 제시하는 글이 아니다.'],
      ['The Age of Machines Smarter Than Humans', 'AI가 인간보다 **똑똑하다**는 내용은 없다. 오히려 AI에게 **진짜 감정이 없다**고 한다.'],
    ],
    vocab: [
      'loneliness|명|외로움|isolation|companionship 동반자 관계|lonely 외로운',
      'constantly|부|끊임없이, 거듭|all the time, repeatedly|rarely 드물게|constant 끊임없는',
      'companion|명|동반자, 친구, 동지|friend, partner|—|companionship 동반자 관계',
      'perceive A as B|숙|A를 B로 여기다, 인지하다|regard A as B|—|perception 인식',
      'seek|동|찾다, 구하다|look for|—|—',
      'genuine|형|진짜의, 진정한|real, authentic|fake 가짜의|genuinely 진정으로',
      'attentively|부|조심스럽게, 정중히, 주의 깊게|carefully|carelessly 부주의하게|attentive 주의 깊은',
      'abandon|동|버리다, 떠나다|leave, desert|keep 지키다|abandonment 버림',
      'isolation|명|고립, 분리, 격리|separation|connection 연결|isolate 고립시키다',
      'significant|형|중요한, 의미 있는, 상당한|important, considerable|minor 사소한|significance 중요성',
      'profound|형|(영향·느낌·경험 등이) 엄청난, 깊은|deep, strong|shallow 얕은|profoundly 깊이',
      'substitute A with B|숙|A를 B로 대체하다|replace A with B|—|substitute 대체물',
      'conflict|명|갈등, 충돌|disagreement, argument|harmony 조화|—',
      'emerge from|숙|~에서 나타나다, 생겨나다|come out of|disappear 사라지다|emergence 출현',
      'be woven into|숙|~에 짜여 들어가다, 깊이 스며들다|be part of|—|weave 짜다',
      'engage in|숙|~에 관여[참여]하다|take part in|—|engagement 참여',
      'accessible|형|접근[이용] 가능한|available|inaccessible 접근할 수 없는|access 접근',
      'empathize with|숙|~에 공감하다|sympathize with|—|empathy 공감',
      'consequently|부|결과적으로|as a result|—|consequence 결과',
      'free from|숙|~이 없는, ~에서 자유로운|without|—|freedom 자유',
      'era|명|시대|age, period|—|—',
      'rejection|명|거절|refusal|acceptance 수용|reject 거절하다',
      'effortless|형|힘이 들지 않는|easy|difficult 어려운|effort 노력',
      'drawback|명|단점|disadvantage|advantage 장점|—',
      'authentic|형|진정한, 진짜의|genuine, real|fake 가짜의|authenticity 진짜임',
      'simulation|명|모방, 흉내, 모의 실험|imitation|—|simulate 흉내 내다',
      'reconciliation|명|화해|reunion|conflict 갈등|reconcile 화해시키다',
      'crucial|형|매우 중요한|essential|unimportant 중요하지 않은|—',
      'transformative|형|변화를 일으키는|life-changing|—|transform 변화시키다',
      'retreat into|숙|~속으로 물러나다, 숨어들다|withdraw into|—|retreat 후퇴',
    ],
    flow: [
      ['💬', '현상 — AI를 친구·연인으로', '외롭거나 스트레스를 받을 때 **AI 챗봇과 대화**한다. 늘 이용 가능하고, **판단하지 않고**, 공감하는 듯해서 **동반자·연인**으로까지 여긴다.'],
      ['🛋️', '이유 — 쉽고 안전해서', '인간관계는 **노력·소통·거절과 갈등의 위험**이 따르지만, AI는 공손하게 응답하고 **결코 떠나지 않는다** → 안정감과 안도감.'],
      ['⚠️', '문제 — 진짜 감정이 없다', '{Nevertheless} — AI의 이해는 **프로그램된 데이터의 모방**일 뿐. 인간관계를 AI로 **대체**하면 깊고 진정한 유대를 잃는다.'],
      ['🤝', '결론 — 도구일 뿐, 대체물은 아니다', 'AI는 **유용한 도구**지만 진짜 상호 작용을 **대신해선 안 된다**. 성장은 **갈등·화해·감정 나눔**이 있는 실제 관계에서 나온다.'],
    ],
    cards: [
      {
        covers: [1],
        en: 'In the modern era, | [h:artificial intelligence (AI)] [g:is] increasingly [g:woven into] our daily lives.',
        note: '**해석 도움** — "현대 시대에, 인공 지능(AI)은 점점 더 우리의 일상생활에 **깊이 스며들고 있다**." {be woven into} 는 실이 천에 짜여 들어가듯 **삶의 일부가 된다**는 비유.',
        points: [
          ['vocab', '**[수업 필기] modern 현대 / era 시대** — {In the modern era} "현대 시대에".'],
          ['grammar', '**[수업 필기] be woven into : ~에 짜여 들어가다** — 형광펜 {is}·{woven into}. {weave – wove – woven} 의 과거분사로 만든 **수동태**. 부사 {increasingly}(점점 더)가 be동사와 p.p. 사이에 끼어 있다.'],
        ],
      },
      {
        covers: [2],
        en: 'Many individuals [g:engage in] conversations with AI chatbots | [r:when] they [g:experience] loneliness, stress, | [r:or] simply [g:want] someone [r:who will listen to them].',
        note: '**해석 도움** — "많은 사람들이 **외로움이나 스트레스를 느낄 때**, 또는 단순히 **자신의 말을 들어 줄 누군가를 원할 때** AI 챗봇과 대화를 나눈다."',
        points: [
          ['vocab', '**[수업 필기] engage in something : ~에 관여[참여]하다** — 형광펜. {engage in conversations} "대화를 나누다".'],
          ['grammar', '**[수업 필기] when they ① experience ~ : 시간 부사절** — when 절 안에서 동사 **① experience** 와 **② want** 가 {or} 로 병렬(필기의 ①·② 표시). 둘 다 주어는 {they}.'],
          ['grammar', '**[수업 필기] 주격 관계대명사 who** — 괄호 [who will listen to them] 이 화살표로 {someone} 을 꾸민다. {them} = Many individuals.'],
          ['vocab', '**[수업 단어표] loneliness 외로움** — n. **a feeling of being unhappy** because you have no friends or people to talk to.'],
        ],
      },
      {
        covers: [3],
        en: '[h:These systems] [g:are] constantly accessible, free from judgment, | [r:and] [g:appear to empathize with] human emotions.',
        note: '**해석 도움** — "**이러한 시스템(AI 챗봇)**은 언제나 이용할 수 있고, **판단(평가)을 하지 않으며**, 인간의 감정에 **공감하는 것처럼 보인다**." → 사람들이 AI와 대화하는 이유 세 가지.',
        points: [
          ['reading', '**[수업 필기] These systems = AI chatbots** — 밑줄. 앞 문장의 {AI chatbots} 를 받는다.'],
          ['grammar', '**동사 병렬 are ~, and appear** — 보어 {constantly accessible}·{free from judgment} 뒤에 동사 {appear} 가 {and} 로 이어진다. {appear to + V} "~하는 것처럼 보이다"(실제로는 아님 → 9~12번에서 반박).'],
          ['vocab', '**[수업 필기] accessible 접근 가능한 / free from: ~로부터 해방되다 / empathize 공감하다** — 형광펜·밑줄. {free from judgment} 는 "**판단이 없는, 평가하지 않는**"(형용사구)으로 이해하면 자연스럽다.'],
          ['vocab', '**[수업 단어표] constantly 끊임없이, 거듭** — adv. **all the time**; repeatedly.'],
        ],
      },
      {
        covers: [4],
        en: '[r:Consequently], some users even [g:begin to perceive] AI [r:as] a close companion, | or, in certain cases, [r:as] a romantic partner.',
        note: '**해석 도움** — "**그 결과**, 일부 사용자들은 AI를 친한 **동반자**로, 또는 어떤 경우에는 **연인**으로까지 여기기 시작한다."',
        points: [
          ['vocab', '**[수업 필기] Consequently 결과적으로** — 형광펜. 앞 문장(AI의 장점)의 **결과**를 잇는 연결어.'],
          ['grammar', '**perceive A as B : A를 B로 여기다** — A = {AI}, B = {a close companion} / {a romantic partner}. {as} 가 두 번 반복되며, 삽입구 {in certain cases} 가 끼어 있다. / {begin to V} ~하기 시작하다.'],
          ['vocab', '**[수업 단어표] companion 동반자, 동행, 친구, 동지** — n. a person or an animal **that travels with you or spends a lot of time with you**. / **perceive 감지하다, 인지하다, ~로 여기다** — v. to **understand or think of** somebody/something in a particular way.'],
        ],
      },
      {
        covers: [5, 6],
        en: 'There are several reasons [r:why] people [g:seek] emotional comfort from AI. | [h:Building genuine human relationships] [g:can be] complicated, | [r:requiring] effort, communication, and the risk of rejection or conflict.',
        note: '**해석 도움** — 사람들이 AI에게서 **정서적 위안을 찾는** 데에는 몇 가지 이유가 있다. **진정한 인간관계를 쌓는 것**은 복잡할 수 있는데, **노력·소통·거절이나 갈등의 위험**이 따르기 때문이다.',
        points: [
          ['grammar', '**관계부사 why** — {several reasons why ~} "~하는 몇 가지 이유". / **동명사 주어 → 단수 취급**: {Building genuine human relationships}(S) + {can be}(V).'],
          ['grammar', '**분사구문 requiring ~** — 쉼표 뒤 {requiring A, B, and C} = because it requires ~. 인간관계가 복잡한 **이유**.'],
          ['vocab', '**[수업 단어표] seek 찾다** — v. to **look for** something/somebody. / **genuine 진짜의, 진품의** — adj. real; **exactly what it appears to be**; not artificial (=authentic). / **conflict 갈등, 충돌** — n. a state of **disagreement or argument** between people, groups, countries etc.'],
        ],
      },
      {
        covers: [7],
        en: '[r:By contrast], [h:interacting with AI] [g:is] effortless: | it [g:responds] politely, [g:listens] attentively, | and never [g:abandons] them or [g:argues].',
        note: '**해석 도움** — "**그에 반해**, AI와 상호 작용하는 것은 **힘이 들지 않는다**. AI는 공손하게 응답하고, 주의 깊게 들어 주며, 결코 그들을 **버리거나** 말다툼하지 않는다." → 6번(인간관계의 어려움)과 **대조**.',
        points: [
          ['reading', '**콜론(:) = 구체적 설명** — {effortless} 의 내용을 콜론 뒤에서 동사 네 개로 풀어 준다: {responds}·{listens}·{abandons}·{argues}(모두 주어 it = AI, 3인칭 단수 -s).'],
          ['grammar', '**동명사 주어 interacting with AI → is** / {never abandons them or argues} — {never} 가 두 동사를 모두 부정한다.'],
          ['vocab', '**[수업 단어표] attentively 조심스럽게, 정중히** — adv. **carefully**, in a way that shows a lot of interest. / **abandon 버리다, 떠나다** — v. to leave somebody, especially somebody you are responsible for, **with no intention of** returning.'],
        ],
      },
      {
        covers: [8],
        en: 'For those [r:who] struggle with isolation or anxiety, | such interactions [g:provide] a sense of security and relief.',
        note: '**해석 도움** — "**고립감이나 불안으로 힘들어하는 사람들**에게, 그러한 상호 작용은 **안정감과 안도감**을 준다."',
        points: [
          ['grammar', '**those who ~ : ~하는 사람들** — {those} = people. {struggle with} ~로 힘들어하다, ~와 씨름하다.'],
          ['vocab', '**[수업 단어표] isolation 고립, 분리, 격리** — n. the act of **separating** somebody/something; **the state of being separate**. / {a sense of security} 안정감, {relief} 안도.'],
          ['reading', '**[프린트 문제 2] 왜 어떤 사람들은 AI와 대화하는 것을 더 좋아하는가 — 정답 B** {Because talking to AI feels easier and safer than real human relationships}. 근거: 7번 {effortless} + 8번 {a sense of security and relief}. A·C(AI가 감정을 느낀다)는 10~11번과 반대, D·E 는 본문에 없다.'],
        ],
      },
      {
        covers: [9, 10],
        tags: ['title'],
        en: '[r:Nevertheless], [h:depending too heavily on AI] [g:comes with] significant drawbacks. | [r:Most importantly], AI [g:lacks] authentic emotions.',
        note: '**해석 도움** — "**그럼에도 불구하고**, AI에 **너무 많이 의존하는 것**에는 **상당한 단점**이 따른다. 가장 중요하게는, AI에게는 **진정한 감정이 없다**." → 글의 **전환점**(장점 → 단점).',
        points: [
          ['reading', '**Nevertheless = 역접 전환** — 앞 두 문단(AI의 장점)을 인정한 뒤 **반론**을 시작한다. 글쓴이의 주장은 여기서부터.'],
          ['grammar', '**동명사 주어 → 단수 동사 comes** / {come with} ~이 따르다. / {lack} 은 **타동사** — {lacks emotions}(○), lacks **of** emotions(×).'],
          ['vocab', '**[수업 단어표] significant 중요한, 의미 있는** — adj. large or important enough to have an effect or **to be noticed**. / {drawback} 단점, {authentic} 진정한(= genuine).'],
        ],
      },
      {
        covers: [11, 12],
        en: 'It cannot truly [g:experience] love, sorrow, or pain | [r:in the way] humans can. | [h:Its apparent understanding] [g:is] merely a simulation | [r:based on] programmed data.',
        note: '**해석 도움** — AI는 **인간이 할 수 있는 방식으로** 사랑·슬픔·고통을 진정으로 경험할 수 없다. AI의 **겉으로 보이는 이해**는 **프로그래밍된 데이터에 기반한 모방에 불과하다**.',
        points: [
          ['grammar', '**in the way (that) humans can (experience them)** — 반복되는 {experience love, sorrow, or pain} 을 생략하고 조동사 {can} 만 남겼다(대동사).'],
          ['grammar', '**과거분사 후치수식 based on** — {a simulation (which is) based on programmed data}. / {Its} = AI’s. {apparent} 겉보기의(실제로는 아님), {merely} 단지 ~일 뿐.'],
          ['reading', '**3번 문장과 연결** — 3번의 {appear to empathize}(공감하는 **것처럼 보인다**)가 실제로는 **모방**일 뿐임을 밝힌다.'],
        ],
      },
      {
        covers: [13],
        en: '[r:If] individuals [g:substitute] human relationships [r:with] artificial ones, | they [g:may lose] the chance [r:to experience] the profound and genuine connections | [r:that] only real people can provide.',
        note: '**해석 도움** — "만약 사람들이 인간관계를 **인공적인 관계로 대체한다면**, 그들은 **오직 실제 사람들만이 줄 수 있는** 깊고 진정한 유대를 경험할 **기회를 잃을지도 모른다**."',
        points: [
          ['vocab', '**substitute A with B : A를 B로 대체하다** — A = {human relationships}, B = {artificial ones}({ones} = relationships). 주의: {substitute B for A} 는 어순이 반대(B를 A 대신 쓰다).'],
          ['grammar', '**조건 if절은 현재시제** / {the chance to experience} 명사를 꾸미는 to부정사 / 목적격 관계대명사 {that} — {connections} ← {that only real people can provide}.'],
          ['vocab', '**[수업 단어표] substitute 대체하다** — v. to use something new or different **instead of something else**. / **profound (영향·느낌·경험 등이) 엄청난[깊은]** — adj. having a **strong influence or effect**.'],
        ],
      },
      {
        covers: [14, 15],
        en: 'AI can certainly [g:serve as] a valuable tool, | [r:particularly] for those [r:who] need a safe space [r:to express] their feelings or practice conversation. | It [g:may help] [g:organize] thoughts and [g:reduce] loneliness.',
        note: '**해석 도움** — AI는 확실히 **유용한 도구**가 될 수 있는데, 특히 감정을 표현하거나 대화를 연습할 **안전한 공간이 필요한 사람들**에게 그렇다. AI는 생각을 정리하고 외로움을 줄이는 데 도움이 될 수 있다. → **양보**(AI의 쓸모를 인정).',
        points: [
          ['grammar', '**a safe space to express ~ or (to) practice ~** — 형용사적 to부정사. {express} 와 {practice} 가 {or} 로 병렬.'],
          ['grammar', '**help + (to) 동사원형** — {help organize ~ and reduce ~}. {help} 뒤에는 동사원형이 바로 올 수 있다.'],
          ['vocab', '**serve as : ~의 역할을 하다** / {certainly} 확실히 — 바로 뒤 {Yet} 과 짝을 이루는 **양보 표현**(certainly ~. Yet ~ = 물론 ~이지만, 그러나 ~).'],
        ],
      },
      {
        covers: [16, 17, 18],
        tags: ['title'],
        en: '[r:Yet], it [g:should never replace] authentic interactions. | [h:Human growth] [g:occurs] through real experiences | – [r:including] conflicts, reconciliation, and emotional sharing. | [h:These challenges] [g:teach] us [r:how to] build trust, express love, and support one another in meaningful ways.',
        note: '**해석 도움** — **하지만** AI가 진정한 상호 작용을 **결코 대신해서는 안 된다**. 인간의 성장은 **갈등·화해·감정의 나눔을 포함한** 실제 경험을 통해 일어난다. **이러한 어려움들**은 신뢰를 쌓고, 사랑을 표현하고, 서로를 지지하는 법을 가르쳐 준다.',
        points: [
          ['reading', '**Yet = 주장 강조** — 14~15번(AI의 쓸모)을 인정한 뒤, 글쓴이의 **핵심 주장**: AI는 진짜 관계를 대신해선 안 된다.'],
          ['grammar', '**대시(–) + including** — {real experiences} 의 예를 들어 **구체화**한다. / {teach + 간접목적어(us) + 직접목적어(how to + V)}: {build}·{express}·{support} 세 동사원형이 병렬.'],
          ['reading', '**[프린트 문제 3] 요약문 빈칸 — 정답 ③ challenges** — {real-life human relationships with their ____ and emotions}. 근거: 18번 {These challenges}(= 갈등·화해 같은 어려움) + 20번 {with all their joys and difficulties}. ① comforts ② advantages ④ solutions ⑤ successes 는 "어려움"이 아니다.'],
          ['vocab', '**[수업 단어표] conflict 갈등, 충돌** / {reconciliation} 화해, {one another} 서로.'],
        ],
      },
      {
        covers: [19],
        tags: ['title'],
        en: '[r:Ultimately], [g:it] is crucial [g:to remember] [r:that] AI is merely a tool, | [r:not] a substitute for true human connection.',
        note: '**해석 도움** — "결국, AI는 **도구에 불과할 뿐** 진정한 인간적 유대를 **대신하는 것이 아니라는** 점을 기억하는 것이 **매우 중요하다**." → 글의 **요지**.',
        points: [
          ['grammar', '**가주어 it – 진주어 to부정사** — {it}(가주어) = {to remember that ~}(진주어). / {that} 은 {remember} 의 목적어절 접속사.'],
          ['grammar', '**A, not B : B가 아니라 A** — {merely a tool, not a substitute ~}. 여기서 {substitute} 는 **명사**(대체물).'],
        ],
      },
      {
        covers: [20],
        en: '[r:While] AI may offer convenience and comfort, | [h:the most memorable and transformative moments] in life [g:emerge from] real relationships | – with all their joys and difficulties.',
        note: '**해석 도움** — "AI가 편리함과 위안을 **줄 수는 있지만**, 인생에서 **가장 기억에 남고 우리를 변화시키는 순간들**은 **기쁨과 어려움이 모두 담긴** 실제 관계에서 나온다."',
        points: [
          ['grammar', '**While = ~이지만(양보)** — 시간 "~하는 동안"이 아니다. / 주어 {the most memorable and transformative moments in life}(복수) → 동사 {emerge}.'],
          ['vocab', '**[수업 단어표] emerge (from) ~에서 나타나다** — v. to rise or appear from a hidden or unknown place or condition; to come out into view.'],
          ['reading', '**대시(–) 뒤 with all their joys and difficulties** — 실제 관계에는 기쁨만이 아니라 **어려움(difficulties = challenges)** 도 있다 → 요약문 빈칸 ③ challenges 의 또 다른 근거.'],
        ],
      },
      {
        covers: [21],
        en: '[h:Using AI wisely] [g:means] [r:recognizing] its limits and [r:pursuing] authentic growth through human connection, | [r:rather than] [r:retreating] into isolation with machines.',
        note: '**해석 도움** — "AI를 현명하게 사용한다는 것은 기계와 함께 **고립 속으로 숨어드는 것이 아니라**, AI의 **한계를 인식하고** 인간적 유대를 통해 **진정한 성장을 추구하는 것**을 의미한다."',
        points: [
          ['grammar', '**동명사 주어 Using AI wisely → means + 동명사 목적어** — {mean -ing} "~하는 것을 의미하다": {recognizing} 와 {pursuing} 이 {and} 로 병렬.'],
          ['grammar', '**rather than + -ing : ~하기보다는** — 앞의 동명사와 형태를 맞춰 {retreating}. {retreat into} ~속으로 물러나다.'],
          ['reading', '**[프린트 문제 1] 제목 — 정답 A** {A New Relationship Between Humans and AI}. B(역사) E(인간보다 똑똑한 기계)는 본문에 없고, C(친구가 필요한 이유)·D(외로움 극복법)는 일부 내용일 뿐이다.'],
        ],
      },
    ],
    prompt: `Photorealistic interior photograph, wide banner composition. A bright cozy cafe table by a large window: on one side a smartphone propped against a mug, its blank screen glowing softly in front of an empty chair; on the other side two ceramic cups, a shared slice of cake with two forks and two chairs pulled close together. A quiet contrast between machine company and real human company. ${LIGHT}, warm cream, soft wood and pale sage green. ${NO}, robots, screens with images, laptop --ar 16:5 --v 8.1`,
  },
];

for (const c of chapters) writeChapter('EX2', SOURCE, c);
