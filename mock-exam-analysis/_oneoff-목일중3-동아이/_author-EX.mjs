/* 목일중3 추가지문(EX) — 7 Supplementary Reading 저작 데이터 + 실행
 * 실행: node _author-EX.mjs  → data/EX/1.json
 * (중요) 사진 속 수업 필기(밑줄·V/O/O.C 표시·화살표·괄호·여백 문법 노트)를 문장 분석 카드에
 *   **[수업 필기]** 로, 2쪽 단어표의 손글씨 뜻·영영 풀이 빈칸은 **[수업 단어표]** 로,
 *   2쪽 문제 2~4 는 **[프린트 문제 N]** 으로 녹였다. 필기가 부정확한 곳(help 목적어 to V)은 바로잡아 실었다.
 * hide_answer 라 choices 는 인쇄되지 않지만, 원본 1번 문제의 보기·정답을 그대로 기록해 둔다. */
import { writeChapter } from './_author.mjs';
import { SOURCE } from './_SOURCE-EX.js';

const LIGHT = 'natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette';
const NO = '--no text, letters, words, numbers, signage, logo, brand, watermark, people, person, hands, faces, sunset, golden hour, night, dark moody grading, heavy shadows';

const chapters = [
  {
    no: 1, exam: '목일중 3학년 · 추가지문', type: '문단 삽입', answer: 3,
    question: '(A)~(D) 중 다음 문단이 들어가기에 적절한 곳은?',
    summary: '코미디언 이수지는 한국의 유행을 우스꽝스럽고 극단적으로 과장한 영상으로 사람들이 왜 유행을 따르는지 생각하게 해요. 평범한 컵을 비싼 ‘얼굴 갸름해지는 도구’로 파는 인플루언서 흉내는 다른 사람을 생각 없이 따라 하는 ‘동조 편향’을, 화장실 사용까지 학원에 보내는 대치동 부모 패러디는 늘 남과 비교하는 ‘사회적 비교 이론’을 보여 줘요. 두 가지 모두 사회적 압력이 행동에 영향을 주는 방식이며, 그녀의 유머는 비판 대신 웃음으로 우리를 더 신중한 소비자이자 사려 깊은 사회 구성원으로 만들어요.',
    mainIdea: 'By exaggerating Korean trends with humor, Lee Suji helps people notice how conformity bias and social comparison pressure their choices.',
    titleEn: 'Laughing at Ourselves: The Psychology Behind Lee Suji’s Comedy',
    ko: [
      '한국의 코미디언 이수지는 한국의 유행에 대한 재미있는 영상을 만들어 소셜 미디어에서 인기를 얻게 되었다.',
      '흔한 행동들을 우스꽝스럽고 극단적으로 보이게 만듦으로써, 그녀는 사람들이 왜 이러한 유행을 따르는지에 대해 생각하도록 돕는다.',
      '이수지의 코미디는 심리학에서 나온 두 가지 중요한 개념을 보여 준다.',
      '첫 번째 개념은 ‘동조 편향’이다.',
      '이것은 사람들이 스스로 생각하지 않고 다른 사람들이 하는 것을 그저 따라 할 때를 말한다.',
      '한 영상에서, 그녀는 평범한 도자기 컵을 ‘얼굴을 갸름하게 해 주는 도구’라고 부르면서 매우 비싼 가격에 파는 인플루언서처럼 행동한다.',
      '그녀의 팔로워들은 단지 자신들이 좋아하는 인플루언서가 그것이 효과가 있다고 말한다는 이유만으로 그것을 재빨리 산다.',
      '두 번째 개념은 ‘사회적 비교 이론’이다.',
      '이것은 사람들이 항상 자신을 다른 사람들과 비교할 때 일어난다.',
      '이수지는 자녀의 공부에 지나치게 집중하는 대치동 부모들에 대해 농담을 한다.',
      '자신의 코미디에서, 그녀는 부모들이 모든 것을 위해, 심지어 화장실 사용 같은 기본적인 생활 기술을 위해서까지 자녀를 학원에 보내며 얼마나 도를 지나치는지를 놀린다.',
      '그녀의 재미있는 과장은 한국 사회에서 교육이 얼마나 경쟁적이 되었는지를 보여 준다.',
      '비록 이 개념들은 삶의 서로 다른 영역에 영향을 미치지만, 둘 다 사회적 압력이 우리의 행동에 어떻게 영향을 주는지를 보여 준다.',
      '동조 편향은 사람들이 유행에 의문을 갖지 않고 그것을 따르게 만드는 반면, 사회적 비교는 다른 사람들을 능가하려는 압박을 만들어 낸다.',
      '둘 다 의심스러운 가치를 지닌 제품에 돈을 낭비하거나 학교에서 아이들을 너무 심하게 몰아붙이는 것과 같은 건강하지 못한 행동으로 이어질 수 있다.',
      '이수지의 코미디는 시청자들이 자신의 삶 속에서 이러한 정신적 습관을 알아차리고 자신의 선택에 대해 더 신중하게 생각하도록 돕는다.',
      '비판 대신 유머를 사용하면서, 그녀는 사람들이 자신이 무엇을 사는지 또는 어떻게 사는지에 영향을 미칠 수도 있는 사회적 압력에 의문을 제기하도록 격려한다.',
      '우리가 우리 자신을 보며 웃게 만듦으로써, 이수지는 우리가 더 신중한 소비자이자 더 사려 깊은 사회 구성원이 되도록 돕는다.',
    ],
    choices: [
      ['(A)', '첫 문단 뒤 — 아직 **두 개념(동조 편향·사회적 비교)** 이 하나도 소개되지 않아 {these ideas}, {both} 가 가리킬 대상이 없다.'],
      ['(B)', '첫째 개념(동조 편향)만 나온 뒤 — {both} 라고 묶기엔 **둘째 개념이 아직 없다**.'],
      ['(C)', '둘째 개념(사회적 비교·대치동 부모)까지 끝난 뒤 — {these ideas}·{both} 가 두 개념을 정확히 받고, 뒤 문단의 {these mental habits} 가 다시 이 문단을 받는다 → **정답**.'],
      ['(D)', '글의 결론(더 신중한 소비자·사려 깊은 구성원) 뒤 — 결론 다음에 두 개념을 다시 정리하면 흐름이 거꾸로 된다.'],
    ],
    vocab: [
      'comedian|명|코미디언, 개그맨/우먼|comic|—|comedy 코미디',
      'social media|명|소셜 미디어, 사회관계망 서비스|SNS|—|—',
      'trend|명|유행, 트렌드|fashion, fad|—|trendy 유행하는',
      'extreme|형|극단적인, 극도의|excessive|moderate 적당한|extremely 극도로',
      'psychology|명|심리학|—|—|psychological 심리적인',
      'conformity bias|명|동조 편향(다른 사람들을 따라 하는 경향)|—|—|conform 따르다',
      'influencer|명|인플루언서(영향력 있는 사람)|—|—|influence 영향',
      'ceramic|형|도자기의|—|—|ceramics 도예',
      'social comparison theory|명|사회적 비교 이론(자신을 다른 사람과 비교하는 경향)|—|—|compare 비교하다',
      'compare A to B|숙|A를 B와 비교하다|compare A with B|—|comparison 비교',
      'make jokes about|숙|~에 대해 농담하다, ~을 놀리다|joke about|—|—',
      'make fun of|숙|~을 놀리다, 웃음거리로 만들다|tease, mock|—|—',
      'go too far|숙|도를 지나치다|overdo|—|—',
      'exaggeration|명|과장|overstatement|understatement 축소|exaggerate 과장하다',
      'competitive|형|경쟁적인|—|cooperative 협력적인|competition 경쟁',
      'schooling|명|교육, 학교 교육|education|—|school 학교',
      'society|명|사회|community|—|social 사회의',
      'social pressure|명|사회적 압력|peer pressure|—|—',
      'outdo|동|능가하다|surpass, outperform|—|—',
      'questionable|형|의심스러운|doubtful|reliable 믿을 만한|question 의문을 제기하다',
      'mental|형|정신적인, 마음의|psychological|physical 신체의|mentally 정신적으로',
      'criticism|명|비판, 비난|disapproval|praise 칭찬|criticize 비판하다',
      'question|동|의문을 제기하다|doubt|accept 받아들이다|questionable 의심스러운',
      'affect|동|영향을 미치다|influence|—|effect 영향, 효과',
      'thoughtful|형|사려 깊은|considerate|thoughtless 생각 없는|thought 생각',
      'parody|명|패러디, 흉내 내기|imitation|—|—',
      'consumer|명|소비자|shopper|producer 생산자|consume 소비하다',
    ],
    flow: [
      ['🎭', '도입 — 유행을 과장하는 코미디', '이수지는 한국의 유행을 **우스꽝스럽고 극단적으로** 보이게 만들어 사람들이 **왜 유행을 따르는지** 생각하게 한다.'],
      ['☕', '개념 1 — 동조 편향', '{conformity bias}: **스스로 생각하지 않고** 남을 따라 함. 예) 평범한 도자기 컵을 ‘얼굴 갸름 도구’로 비싸게 파는 인플루언서 → 팔로워들이 그냥 산다.'],
      ['📚', '개념 2 — 사회적 비교 이론', '{social comparison theory}: 늘 **남과 비교**함. 예) 화장실 사용까지 학원에 보내는 **대치동 부모** → 경쟁적인 교육. 이어서 **(C) 주어진 문단**이 두 개념을 묶는다(둘 다 **사회적 압력**).'],
      ['😂', '결론 — 비판 대신 웃음', '유머로 **정신적 습관을 알아차리고** 사회적 압력에 **의문을 제기**하게 해, 우리를 **더 신중한 소비자·사려 깊은 사회 구성원**으로 만든다.'],
    ],
    cards: [
      {
        covers: [1],
        en: '[h:Korean comedian Lee Suji] [g:has become] popular on social media | [r:by making] funny videos about Korean trends.',
        note: '**해석 도움** — "한국의 코미디언 이수지는 한국의 유행에 대한 재미있는 영상을 **만듦으로써** 소셜 미디어에서 인기를 얻게 되었다."',
        points: [
          ['grammar', '**[수업 필기] by -ing : ~함으로써(수단)** — 밑줄 {by making}. 인기를 얻게 된 **방법**을 말한다. 2번·18번 문장의 {By making} 도 같은 구조.'],
          ['grammar', '**현재완료 has become** — 과거에 시작해 지금 인기 있는 상태(결과). {become – became – become}.'],
          ['vocab', '**[수업 단어표] comedian 코미디언, 개그맨/우먼** — A person who **performs** to make people **laugh**. / **social media 소셜 미디어, 사회관계망 서비스** — Websites and apps where people **share content** and **connect** with others. / **trend 유행, 트렌드** — Popular styles or activities that **many people follow**.'],
        ],
      },
      {
        covers: [2],
        en: '[r:By making] common behaviors [g:look] [h:silly and extreme], | she [g:helps] people [g:think] about | [r:why] they follow these trends.',
        note: '**해석 도움** — "흔한 행동들을 **우스꽝스럽고 극단적으로 보이게** 만듦으로써, 그녀는 사람들이 **왜 그들이 이러한 유행을 따르는지**에 대해 생각하도록 돕는다."',
        points: [
          ['grammar', '**[수업 필기] look + 형용사 : ~하게 보이다** — 밑줄 {look silly and extreme}. 감각동사 {look} 뒤에는 부사가 아닌 **형용사**(silly, extreme). / {make}(사역) + 목적어 {common behaviors} + 동사원형 {look}.'],
          ['grammar', '**[수업 필기] help + 목적어 + (to) V : ~가 ~하도록 돕다** — 밑줄 {helps people think}. 필기는 "help 목적어 to V" 이지만 {help} 는 목적격보어로 **동사원형과 to부정사 둘 다** 쓸 수 있고, 본문은 **동사원형** {think} 를 썼다.'],
          ['grammar', '**[수업 필기] 간접의문문 (의문사 + 주어 + 동사)** — 밑줄 {why they follow these trends}: "**왜 그들이 이러한 유행들을 쫓는지**". 전치사 {about} 의 목적어. 어순 주의 — why **do they follow**(×) → why **they follow**(○).'],
        ],
      },
      {
        covers: [3, 4],
        en: '[h:Lee’s comedy] [g:shows] [h:two important ideas] from psychology. | The first idea [g:is] “conformity bias.”',
        note: '**해석 도움** — 이수지의 코미디는 **심리학에서 나온 두 가지 중요한 개념**을 보여 준다. 첫 번째 개념은 ‘**동조 편향**’이다. → {two important ideas} 가 글 전체의 뼈대(첫째 = 동조 편향 / 둘째 = 사회적 비교 이론).',
        points: [
          ['reading', '**문단 삽입 단서** — "두 개념"이라고 예고했으니, 주어진 문단의 {these ideas}·{both} 는 **두 개념이 모두 나온 뒤**에 와야 한다 → (A)·(B) 탈락.'],
          ['vocab', '**[수업 단어표] psychology 심리학** — The study of the human mind and **behavior**. / **conformity bias 동조 편향**(다른 사람들을 따라 하는 경향). {conform} 따르다, 순응하다.'],
        ],
      },
      {
        covers: [5],
        en: '[h:This] [g:is] [r:when] people just copy [r:what] others do | without thinking [r:for themselves].',
        note: '**해석 도움** — "이것은 사람들이 **스스로 생각하지 않고** **다른 사람들이 하는 것**을 그저 따라 할 때이다." → {conformity bias} 의 **정의**.',
        points: [
          ['grammar', '**[수업 필기] what others do : 다른 사람들이 하는 것 → 관계대명사 what** — 밑줄. {what} = the thing(s) which. 선행사를 포함하며 {copy} 의 목적어 역할.'],
          ['vocab', '**[수업 필기] for oneself : 스스로, 혼자 힘으로** — 밑줄 {for themselves}. 주어 {people} 에 맞춰 {themselves}. / {without + -ing} ~하지 않고.'],
          ['grammar', '**This is when ~** — "이것은 ~할 때이다", {when} 이 이끄는 절이 보어. 9번 문장 {This happens when ~} 과 짝을 이룬다.'],
          ['reading', '**[프린트 문제 2] “conformity bias”를 가장 잘 설명한 것 — 정답 ②** {The tendency to copy others without thinking for yourself}. ① 광고 영향 ③ 교육 전문가 신뢰 ④ 사회 속 경쟁(→ 사회적 비교에 가까움)은 오답.'],
        ],
      },
      {
        covers: [6],
        en: 'In one video, | she [g:acts like] an influencer | [r:selling] a regular ceramic cup, | [r:calling] it a “face slimming tool” | [r:for] a very high price.',
        note: '**해석 도움** — "한 영상에서, 그녀는 **평범한 도자기 컵을 매우 비싼 가격에 파는** 인플루언서처럼 행동하는데, 그것을 ‘**얼굴을 갸름하게 해 주는 도구**’라고 **부르면서**." → 동조 편향의 **예시 1**.',
        points: [
          ['grammar', '**[수업 필기] 현재분사 후치수식** — 괄호 (selling ~ price) 가 화살표로 {influencer} 를 꾸민다: "~을 파는 인플루언서".'],
          ['vocab', '**[수업 필기] sell A for B : A를 B에 팔다** — A = {a regular ceramic cup}, B = {a very high price}. 사이에 {calling ~ tool} 이 끼어 있어 {for} 와 {sell} 이 멀리 떨어져 있다(필기의 {for} 밑줄).'],
          ['grammar', '**[수업 필기] calling : 부르면서** — 분사구문(동시동작). {call A B} "A를 B라고 부르다": A = {it}(컵), B = {a “face slimming tool”}.'],
          ['vocab', '**[수업 단어표] influencer 인플루언서** — Someone on social media who has many followers and can **affect others’ choices**. / {ceramic} 도자기의, {regular} 평범한.'],
        ],
      },
      {
        covers: [7],
        en: '[h:Her followers] quickly [g:buy] [h:it] | just because [h:the influencer] [r:they like] [g:says] it works.',
        note: '**해석 도움** — "그녀의 팔로워들은 단지 **그들이 좋아하는 인플루언서가** 그것이 효과가 있다고 **말한다는 이유만으로** **그것(도자기 컵)**을 재빨리 산다." → 스스로 생각하지 않고 따라 하는 **동조 편향**.',
        points: [
          ['grammar', '**[수업 필기] it = ceramic cup** — 동그라미 {it}. 앞 문장의 {a regular ceramic cup}.'],
          ['grammar', '**[수업 필기] (that) they like : 그들이 좋아하는 — 목적격 관계대명사 생략** — 괄호와 화살표로 {the influencer} 수식. {the influencer (that) they like} 가 통째로 주어, 동사는 {says}(단수). {they like}의 {like} 를 동사로 착각하지 말 것.'],
          ['grammar', '**says (that) it works** — 접속사 {that} 생략. {work} = 효과가 있다. / {just because} 단지 ~라는 이유만으로.'],
        ],
      },
      {
        covers: [8, 9],
        en: 'The second idea [g:is] “social comparison theory.” | [h:This] [g:happens] [r:when] people always [g:compare] [h:themselves] [r:to] others.',
        note: '**해석 도움** — 두 번째 개념은 ‘**사회적 비교 이론**’이다. 이것은 사람들이 항상 **자신을 다른 사람들과 비교할** 때 일어난다.',
        points: [
          ['vocab', '**[수업 필기] compare A to B : A를 B와 비교하다** — 밑줄 {compare}, {to}. A = {themselves}, B = {others}. 주어 {people} 과 목적어가 같은 대상이라 재귀대명사 {themselves}.'],
          ['vocab', '**[수업 단어표] social comparison theory 사회적 비교 이론**(자신을 다른 사람과 비교하는 경향). {comparison} 비교 ← {compare}.'],
        ],
      },
      {
        covers: [10],
        en: 'Lee [g:makes jokes about] [h:parents] in Daechi-dong | [r:who] are too focused on their children’s studies.',
        note: '**해석 도움** — "이수지는 **자녀의 공부에 지나치게 집중하는** 대치동 **부모들**에 대해 농담을 한다." → 사회적 비교 이론의 **예시**.',
        points: [
          ['vocab', '**[수업 필기] make jokes (about) : 농담하다, ~을 놀리다** — 밑줄 {makes jokes}.'],
          ['grammar', '**[수업 필기] 주격 관계대명사 who** — 동그라미 {who}, 화살표로 선행사 {parents} 를 가리킨다. {in Daechi-dong} 을 건너뛰어 수식하므로 {Daechi-dong} 을 선행사로 착각하지 말 것 → 동사도 복수 {are}.'],
          ['vocab', '**be focused on : ~에 집중하다** — {too} 가 붙어 "**지나치게** 집중하는"(부정적 뉘앙스).'],
        ],
      },
      {
        covers: [11],
        en: 'In her comedy, | she [g:makes fun of] [r:how] parents [g:go too far] | [r:by sending] their children to hakwons for everything | – even for basic life skills like using the bathroom.',
        note: '**해석 도움** — "자신의 코미디에서, 그녀는 부모들이 모든 것을 위해 — **심지어 화장실 사용 같은 기본적인 생활 기술을 위해서까지** — 자녀를 학원에 보냄으로써 **얼마나 도를 지나치는지를 놀린다**."',
        points: [
          ['vocab', '**[수업 필기] make fun of : 놀리다, 웃음거리로 만들다** — 밑줄. / **[수업 필기] go too far : 도를 지나치다** — 밑줄.'],
          ['grammar', '**간접의문문 how + 주어 + 동사** — {how parents go too far} 가 {make fun of} 의 목적어. / {by sending} ~을 보냄으로써(수단, 1번 문장의 by -ing).'],
          ['reading', '**[수업 필기] 대시(–) = 부연 설명** — 대시에 괄호·화살표 표시. 앞의 {for everything} 을 {even for basic life skills ~} 로 **구체화·강조**한다.'],
          ['reading', '**[프린트 문제 3] 교육에 지나치게 열성적인 부모님들을 패러디하기 위해 이수지가 사용한 예시 — 정답 ③** {Parents sending children to hakwons even for basic skills like using the bathroom}. ① 성적으로 교사와 다툼 ② 과외비 과다 지출 ④ 대치동 이사 — 본문에 없다.'],
          ['vocab', '**[수업 단어표] parody 패러디, 흉내 내기** — A humorous **imitation** of something that makes fun of it.'],
        ],
      },
      {
        covers: [12],
        en: '[h:Her funny exaggeration] [g:shows] | [r:how] [h:competitive] schooling [g:has become] in Korean society.',
        note: '**해석 도움** — "그녀의 재미있는 **과장**은 한국 사회에서 교육이 **얼마나 경쟁적이 되었는지**를 보여 준다."',
        points: [
          ['grammar', '**[수업 필기] O(목적어) — how 간접의문문** — 괄호와 O 표시. {how competitive schooling has become} 전체가 {shows} 의 목적어. (중요) 어순: {how} + **형용사**({competitive}) + 주어({schooling}) + 동사({has become}). 원래 문장 = schooling has become **competitive**.'],
          ['vocab', '**[수업 필기] competitive 경쟁적인 / schooling 교육** — 밑줄과 여백 필기.'],
          ['vocab', '**[수업 단어표] exaggeration 과장** — The act of describing something as **larger** or **more important** than it really is. / **society 사회** — The **community of people** living together in a country or region.'],
          ['reading', '**문단 삽입 정답 (C)** — 여기서 **두 번째 개념의 예시까지 끝난다.** 바로 뒤에 주어진 문단이 와서 두 개념을 묶는다.'],
        ],
      },
      {
        covers: [13],
        tags: ['insert'],
        en: '[r:Although] [h:these ideas] affect different areas of life, | [h:both] [g:show] [r:how] social pressure influences our behavior.',
        note: '**해석 도움** — (중요) **주어진 문단 → (C)**. "**비록** 이 개념들은 삶의 서로 다른 영역에 영향을 미치지만, **둘 다** 사회적 압력이 우리의 행동에 어떻게 영향을 주는지를 보여 준다."',
        points: [
          ['reading', '**[프린트 문제 1] 정답 ③ (C) — 근거** — {these ideas}·{both} 는 앞서 나온 **두 개념(동조 편향 + 사회적 비교)** 을 가리킨다. 두 개념이 모두 나온 뒤이면서, 뒤 문단 {these mental habits} 가 다시 받는 자리 = (C).'],
          ['grammar', '**Although + 주어 + 동사 : 비록 ~이지만(양보)** / {how social pressure influences our behavior} — 간접의문문, {show} 의 목적어.'],
          ['vocab', '**[수업 단어표] social pressure 사회적 압력** — The **influence** from other people that makes you behave in certain ways. / {affect}(동) = {influence}(동) 영향을 미치다.'],
        ],
      },
      {
        covers: [14],
        tags: ['insert'],
        en: '[h:Conformity bias] [g:makes] people [g:follow] trends | without questioning them, | [r:while] [h:social comparison] [g:creates] pressure [r:to outdo] others.',
        note: '**해석 도움** — "동조 편향은 사람들이 유행에 **의문을 갖지 않고** 그것을 따르게 만드는 **반면**, 사회적 비교는 **다른 사람들을 능가하려는** 압박을 만들어 낸다." → 두 개념을 한 문장에서 **대조**.',
        points: [
          ['grammar', '**사역동사 make + 목적어 + 동사원형** — {makes people follow}(○) / makes people **to follow**(×).'],
          ['grammar', '**while : ~인 반면(대조)** / {pressure to outdo others} — 명사를 꾸미는 to부정사(형용사적 용법) "능가하려는 압박". {them} = trends.'],
          ['vocab', '**[수업 필기] outdo : 능가하다** — 밑줄과 여백 필기. {out-}(~보다 더) + {do}.'],
        ],
      },
      {
        covers: [15],
        tags: ['insert'],
        en: '[h:Both] [g:can lead to] unhealthy behaviors | – [r:wasting] money on products of questionable value | [r:or] [r:pushing] children too hard in school.',
        note: '**해석 도움** — "둘 다 **건강하지 못한 행동** — 즉 **의심스러운 가치를 지닌 제품에 돈을 낭비**하거나 **학교에서 아이들을 너무 심하게 몰아붙이는 것** — 으로 이어질 수 있다." → 앞의 두 예시(도자기 컵 / 대치동 부모)를 그대로 다시 정리.',
        points: [
          ['reading', '**대시(–) 뒤 = unhealthy behaviors 의 구체적 내용** — {wasting money ~}(동조 편향 → 도자기 컵) / {pushing children ~}(사회적 비교 → 대치동 학원). 동명사 두 개가 {or} 로 병렬.'],
          ['vocab', '**[수업 필기] questionable : 의심스러운** — 밑줄과 여백 필기. {of questionable value} = 가치가 의심스러운. / {lead to} ~로 이어지다, {waste A on B} B에 A를 낭비하다, {push} 몰아붙이다.'],
        ],
      },
      {
        covers: [16],
        en: '[h:Lee Suji’s comedy] [g:helps] [h:viewers] [g:notice] these mental habits in their own lives | [r:and] [g:think] more carefuliy about their own choices.',
        note: '**해석 도움** — "이수지의 코미디는 시청자들이 자신의 삶 속에서 이러한 **정신적 습관을 알아차리고** 자신의 선택에 대해 **더 신중하게 생각하도록** 돕는다." ※ 프린트 인쇄 그대로 {carefuliy} 로 실었다 — **바른 철자는 carefully**(오타).',
        points: [
          ['grammar', '**[수업 필기] V · O · O.C · O.C** — {helps}(V) {viewers}(O) {notice}(O.C) … {and}(세모 표시 = 병렬) {think}(O.C). help + 목적어 + **동사원형** 두 개가 {and} 로 병렬.'],
          ['vocab', '**[수업 필기] mental : 정신적인** — 밑줄과 여백 필기. {these mental habits} = 앞의 동조 편향·사회적 비교. / 밑줄 {their own} 자신의, 자기 자신의(강조).'],
          ['reading', '**[프린트 문제 4] 이수지 코미디의 주된 목적 — 정답 ③** {To help viewers notice mental habits and think more carefully about their choices}. ① 가혹한 비판(본문은 **instead of criticism**) ② 남을 비웃기(본문은 **laugh at ourselves**) ④ 자기 홍보 — 오답.'],
        ],
      },
      {
        covers: [17],
        en: '[r:Using] humor [r:instead of] criticism, | she [g:encourages] [h:people] [g:to question] social pressures | [r:that] might affect | [r:what] they buy or [r:how] they live.',
        note: '**해석 도움** — "**비판 대신 유머를 사용하면서**, 그녀는 사람들이 자신이 **무엇을 사는지** 또는 **어떻게 사는지**에 영향을 미칠 수도 있는 사회적 압력에 **의문을 제기하도록** 격려한다."',
        points: [
          ['grammar', '**[수업 필기] Using : ~을 사용하면서(동시동작)** — 분사구문. = As she uses humor instead of criticism.'],
          ['grammar', '**[수업 필기] encourage + O + to V** — {encourages}(V) {people}(O) {to question}(to V, 목적격보어). {encourage} 는 **to부정사**를 목적격보어로 쓴다(help 와 다름).'],
          ['vocab', '**[수업 필기] criticism : 비난, 비판 / question : 의문을 제기하다 / affect : 영향을 미치다** — 밑줄과 여백 필기. 여기서 {question} 은 **동사**.'],
          ['grammar', '**주격 관계대명사 that + what절 / how절** — {social pressures} ← {that might affect ~}. {affect} 의 목적어는 {what they buy}(관계대명사 what) 와 {how they live}(간접의문문)가 {or} 로 병렬.'],
          ['vocab', '**[수업 단어표] criticism 비판** — The act of expressing **disapproval** of someone or something.'],
        ],
      },
      {
        covers: [18],
        en: '[r:By making] us [g:laugh at] ourselves, | Lee Suji [g:helps] us [g:become] more careful shoppers | and more thoughtful members of society.',
        note: '**해석 도움** — "우리가 **우리 자신을 보며 웃게 만듦으로써**, 이수지는 우리가 **더 신중한 소비자이자 더 사려 깊은 사회 구성원**이 되도록 돕는다." → 글의 결론(동조 편향 → 신중한 소비자 / 사회적 비교 → 사려 깊은 구성원).',
        points: [
          ['grammar', '**by -ing + 사역 make + O + 동사원형** — {By making us laugh}: 우리를 웃게 만듦으로써. {laugh at ourselves} 자신을 보고 웃다(주어 us 와 같은 대상 → 재귀대명사).'],
          ['grammar', '**help + O + 동사원형** — {helps us become} ~. 보어 {more careful shoppers and more thoughtful members of society} 가 {and} 로 병렬.'],
          ['vocab', '**[수업 단어표] consumer 소비자** — People who buy **goods or services**. 본문의 {shoppers} 와 같은 뜻. / {thoughtful} 사려 깊은.'],
        ],
      },
    ],
    prompt: `Photorealistic product photograph, wide banner composition. A plain white ceramic cup displayed like a luxury product on a pastel pink pedestal in a bright livestream studio, a ring light and an empty smartphone on a tripod beside it, a few scattered shopping bags and a stack of colorful workbooks with a tiny graduation cap on the far side of the table. Playful, satirical, cheerful mood. ${LIGHT}, soft pink, mint and cream. ${NO}, screens with images --ar 16:5 --v 8.1`,
  },
];

for (const c of chapters) writeChapter('EX', SOURCE, c);
