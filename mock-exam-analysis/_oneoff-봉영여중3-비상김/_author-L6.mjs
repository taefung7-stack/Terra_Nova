/* 봉영여중3 비상(김진완) Lesson 6 — Words of Wisdom 챕터 저작 데이터
 * 실행: node _author-L6.mjs  → data/L6/{1..5}.json */
import { writeChapter } from './_author.mjs';
import { SOURCE } from './_SOURCE-L6.js';

const LIGHT = 'natural soft diffused daylight, bright overcast sky, high-key exposure, low contrast, clean bright palette';
const NO = '--no text, letters, words, logo, watermark, people, person, hands, faces, man, boy, sunset, golden hour, night, dark moody grading, heavy shadows';

export const chapters = [
  /* ── Ch1 ─────────────────────────────────────────── */
  {
    no: 1, type: '내용일치', answer: 2,
    question: '다음 글의 내용과 일치하는 것은?',
    summary: '부유하고 지혜로운 아버지에게 Puru와 Puneet 두 아들이 있었어요. 아버지는 세상을 떠나기 전 두 아들을 불러 마지막 충고를 남겼어요. “이 말대로 평생 살면 행복해질 것이다. 모든 도시에 집을 지어라. 편하게 자거라. 음식을 즐겨라. 마지막으로, 부자처럼 돈을 써라….” 하지만 아버지는 그 말의 뜻을 설명하기도 전에 세상을 떠났어요.',
    mainIdea: 'Before he died, a rich and wise father gave his two sons four pieces of advice, but he passed away before he could explain what they meant.',
    titleEn: 'A Father’s Wisdom: Four Words Left Unexplained',
    ko: [
      '부유하고 지혜로운 아버지에게 두 아들, Puru와 Puneet이 있었다.',
      '아버지는 돌아가시기 전에, 마지막 충고의 말을 하기 위해 그의 두 아들을 불렀다.',
      '“주의 깊게 듣거라, 사랑하는 아들들아.',
      '너희의 일생 동안 이 말대로 살면, 행복해질 것이다.” 그는 말했다.',
      '“모든 도시에 집을 지어라.',
      '편하게 자거라.',
      '음식을 즐기거라.',
      '마지막으로, 돈을 부자처럼 쓰거라….”',
      '아버지는 그 말을 설명하기도 전에 돌아가셨다.',
    ],
    choices: [
      ['아버지에게는 세 아들이 있었다.', '{had two sons, Puru and Puneet} — 아들은 **두 명**이다.'],
      ['아버지는 두 아들을 불러 마지막 충고를 했다.', '{he called his two sons to give them some last words of advice} 와 **일치**한다. **정답**.'],
      ['아버지는 한 도시에만 집을 지으라고 했다.', '{Build a house in every city.} — **모든 도시**에 집을 지으라고 했다.'],
      ['아버지는 돈을 아껴 쓰라고 충고했다.', '{spend money like a rich man} — **부자처럼** 돈을 쓰라고 했다. 아껴 쓰라는 말은 없다.'],
      ['아버지는 충고의 뜻을 자세히 설명했다.', '{Before he could explain himself, he passed away.} — **설명하기도 전에** 세상을 떠났다.'],
    ],
    vocab: [
      'wise|형|지혜로운, 현명한|clever, sensible|foolish 어리석은|wisdom 지혜',
      'pass away|동|돌아가시다, 세상을 떠나다|die|—|—',
      'advice|명|충고, 조언|tip, suggestion|—|advise 충고하다',
      'carefully|부|주의 깊게|attentively|carelessly 부주의하게|careful 주의 깊은',
      'live by|동|(신조·원칙)에 따라 살다|follow|—|—',
      'throughout|전|~ 내내, ~ 동안 죽|all through|—|—',
      'comfortably|부|편안하게|easily, cozily|uncomfortably 불편하게|comfortable 편안한 / comfort 편안',
      'enjoy|동|즐기다|like, relish|dislike 싫어하다|enjoyment 즐거움',
      'lastly|부|마지막으로|finally|firstly 첫째로|last 마지막의',
      'spend|동|(돈·시간을) 쓰다|use|save 모으다|spent 과거·과거분사',
      'explain|동|설명하다|describe, clarify|—|explanation 설명',
    ],
    flow: [
      ['👨‍👦‍👦', '인물 소개 — 아버지와 두 아들', '**부유하고 지혜로운** 아버지와 두 아들 **Puru**, **Puneet**. 이야기의 주인공들이 소개된다.'],
      ['🛏️', '임종 직전 — 마지막 충고', '아버지는 세상을 떠나기 전 두 아들을 불러 이 말대로 살면 **행복해질 것**이라며 **마지막 충고**를 남긴다.'],
      ['📜', '네 가지 말', '① **모든 도시에 집을 지어라** ② **편하게 자라** ③ **음식을 즐겨라** ④ **부자처럼 돈을 써라**. 짧고 **수수께끼 같은** 말들이다.'],
      ['❔', '설명 없는 죽음 — 갈등의 씨앗', '{Before he could explain himself, he passed away.} 말의 **진짜 뜻**을 알려 주지 못했다 → 두 아들이 **다르게 해석**하는 이야기로 이어진다.'],
    ],
    cards: [
      {
        covers: [1, 2],
        en: 'A [h:rich and wise] father had two sons, [h:Puru and Puneet]. | [r:Before he passed away], he called his two sons | [g:to give them] some last words of advice.',
        note: '**해석 도움** — {two sons, Puru and Puneet} 에서 콤마 뒤는 두 아들의 **이름(동격)**이다. {to give them ~} 은 "~을 **주기 위해**"라는 **목적**의 to부정사다.',
        points: [
          ['grammar', '**to부정사의 부사적 용법(목적)** — {called his two sons to give them ~} "아들들을 **불렀다** ← 충고를 **주려고**".'],
          ['grammar', '**4형식 give + 간접목적어 + 직접목적어** — {give them some last words}. 3형식으로 바꾸면 {give some last words to them}.'],
          ['vocab', '**pass away** — {die} 의 **완곡한** 표현 "돌아가시다". {words of advice} 는 "충고의 말". {advice} 는 **셀 수 없는 명사**다.'],
        ],
      },
      {
        covers: [3, 4],
        en: '“[g:Listen] carefully, [h:my dear sons]. | [g:Live by] these words throughout your life, [r:and you will be happy],” he said.',
        note: '**해석 도움** — {명령문, and ~} 는 "~해라, **그러면** …할 것이다"라는 뜻이다. {live by} 는 "(원칙·신조)**에 따라 살다**".',
        points: [
          ['grammar', '**명령문 + and / or** — {명령문, and ~}: "~해라, **그러면** …". {명령문, or ~}: "~해라, **그렇지 않으면** …". 시험 단골.'],
          ['grammar', '**If 절로 바꾸기** — {Live by these words ~, and you will be happy.} = {If you live by these words ~, you will be happy.}'],
          ['vocab', '**my dear sons** — 부르는 말(호격). 앞뒤 콤마로 문장과 분리한다.'],
        ],
      },
      {
        covers: [5, 6, 7, 8],
        en: '“[g:Build] a house [h:in every city]. | [g:Sleep] comfortably. | [g:Enjoy] your food. | [r:Lastly], [g:spend] money [h:like a rich man]... .”',
        note: '**해석 도움** — 네 문장 모두 **동사원형**으로 시작하는 **명령문**이다. {like a rich man} 의 {like} 는 동사가 아니라 "~**처럼**"이라는 **전치사**다. 말줄임표({...})는 말이 **끝나지 못했음**을 보여 준다.',
        points: [
          ['grammar', '**every + 단수명사** — {every city}(모든 도시). {every} 뒤에는 **단수명사**가 온다({every cities} ×).'],
          ['grammar', '**동사 + 부사** — {Sleep comfortably}. 동사를 꾸미므로 형용사 {comfortable} 이 아닌 **부사** {comfortably}.'],
          ['vocab', '**전치사 like** — "~처럼, ~같이". {spend money like a rich man} "부자**처럼** 돈을 써라". 이 말의 **해석 차이**가 이야기의 핵심이다.'],
        ],
      },
      {
        covers: [9],
        en: '[r:Before he could explain himself], | he [g:passed away].',
        note: '**해석 도움** — {explain oneself} 는 "자기 말(행동)의 **뜻을 설명하다**". "그가 설명**하기도 전에** 돌아가셨다"로 해석한다.',
        points: [
          ['grammar', '**재귀대명사 himself** — 주어와 목적어가 **같은 사람**일 때 쓴다. {explain himself} = 자신이 한 말을 설명하다.'],
          ['reading', '**이야기의 갈등 장치** — 설명이 없었기 때문에 두 아들이 같은 말을 **서로 다르게** 받아들이게 된다.'],
        ],
      },
    ],
    prompt: `Photorealistic interior photograph, wide banner composition. A quiet old room in a wealthy traditional Indian house: an empty carved wooden bed with white linen by a tall open window with sheer curtains, a small brass oil lamp and a folded letter on a side table, two empty wooden chairs placed side by side facing the bed, as if two sons had just been listening to their father’s last words. Calm and gentle mood. ${LIGHT}, ivory, soft teak brown and pale saffron. ${NO}, coins, gold, feast, market --ar 16:5 --v 8.1`,
  },

  /* ── Ch2 ─────────────────────────────────────────── */
  {
    no: 2, type: '내용불일치', answer: 4,
    question: '다음 글의 내용과 일치하지 않는 것은?',
    summary: '아버지가 돌아가신 뒤, 두 아들은 아버지 재산에서 각자의 몫을 받아 서로 다른 도시에 정착했어요. 5년이 지났어요. 아버지의 말을 신중하게 따라 온 Puru는 남은 돈이 하나도 없었지만, 형제 Puneet은 그 어느 때보다 부자가 되어 있었어요. Puru는 자신이 어디서 잘못했는지 어리둥절해서, 그것을 알아내려고 Puneet을 찾아갔어요.',
    mainIdea: 'Five years after their father’s death, Puru had lost all his money while Puneet had become richer, so Puru visited his brother to find out what he had done wrong.',
    titleEn: 'Five Years Later: One Brother Poor, the Other Rich',
    ko: [
      '그의 죽음 후에, 두 아들은 아버지의 재산 중 자신들의 몫을 가지고 다른 도시에 정착했다.',
      '5년이 지났다.',
      '아버지의 말을 신중히 따라온 Puru는 남은 돈이 없었다.',
      '그러나 그의 형제는 그 어느 때보다 더 부자가 되었다.',
      'Puru는 그가 어디서부터 잘못했는지 어리둥절했고, 그래서 그는 (그것을) 알아내기 위해 Puneet을 방문했다.',
    ],
    choices: [
      ['두 아들은 아버지의 재산을 나누어 가졌다.', '{the two sons took their share of the father’s wealth} 와 일치한다.'],
      ['두 아들은 서로 다른 도시에 정착했다.', '{settled in different cities} 와 일치한다.'],
      ['Puru는 아버지의 말을 신중하게 따랐다.', '{Puru, who had been following his father’s words carefully} 와 일치한다.'],
      ['5년 후 두 형제는 모두 가난해졌다.', 'Puru는 돈이 **없었지만**, Puneet은 {richer than ever} — **그 어느 때보다 부자**가 되었다. **불일치 — 정답**.'],
      ['Puru는 이유를 알아내려고 Puneet을 찾아갔다.', '{so he visited Puneet to find out} 과 일치한다.'],
    ],
    vocab: [
      'death|명|죽음|passing|birth 탄생|die 죽다 / dead 죽은',
      'share|명|몫|portion, part|—|share 나누다(동사)',
      'wealth|명|재산, 부|fortune, riches|poverty 가난|wealthy 부유한',
      'settle|동|정착하다|live, reside|move 이사하다|settlement 정착',
      'different|형|다른|various|same 같은|difference 차이',
      'pass|동|(시간이) 지나다|go by|—|passage 경과',
      'follow|동|따르다|obey|ignore 무시하다|follower 추종자',
      'left|형|남아 있는|remaining|—|leave 남기다',
      'than ever|숙|그 어느 때보다|—|—|—',
      'puzzled|형|어리둥절한, 당혹한|confused|clear 확실히 아는|puzzle 퍼즐, 당혹하게 하다',
      'go wrong|동|잘못되다, 실수하다|make a mistake|go right 잘 되다|—',
      'find out|동|알아내다|discover, learn|—|—',
    ],
    flow: [
      ['⏳', '시간 경과 — 재산을 나누고 5년', '두 아들은 아버지 재산의 **몫**을 받아 **다른 도시**에 정착했고, **5년**이 흘렀다.'],
      ['📉', 'Puru — 가진 돈을 다 잃다', '아버지 말을 **신중히** 따랐던 Puru는 {had no money left} — **남은 돈이 없었다**.'],
      ['📈', 'Puneet — 더 부자가 되다', '{But} 로 대조되는 Puneet은 {richer than ever} — **그 어느 때보다 부자**가 되었다.'],
      ['🚶', '행동 — 이유를 찾아 형제를 방문', '어디서 **잘못했는지 어리둥절한** Puru는 그 답을 **알아내려고** Puneet을 찾아간다. 다음 단락의 대화로 이어진다.'],
    ],
    cards: [
      {
        covers: [1, 2],
        en: '[h:After his death], the two sons [g:took] their share of the father’s wealth | [g:and settled] in different cities. | [h:Five years] [g:passed].',
        note: '**해석 도움** — {his death} 는 **아버지의 죽음**이다. {took ~ and settled ~} 두 과거동사가 한 주어(the two sons)에 이어진다.',
        points: [
          ['grammar', '**after + 명사 / after + 절** — {After his death}(명사구) = {After he died}(절). 전치사·접속사 **둘 다** 된다.'],
          ['vocab', '**share / wealth** — {their share of the father’s wealth} "아버지 **재산**에서 그들의 **몫**". {share} 는 동사로 "나누다".'],
          ['vocab', '**pass** — 여기서는 "(시간이) **지나다**"는 **자동사**. {pass away}(돌아가시다)와 구분하자.'],
        ],
      },
      {
        covers: [3],
        en: 'Puru, [r:who had been following] his father’s words carefully, | [g:had] [h:no money left].',
        note: '**해석 도움** — 콤마 사이 {who ~} 는 Puru를 **보충 설명**하는 **계속적 용법**의 관계대명사절이다. 문장의 동사는 {had} 이다. {no money left} 는 "**남은** 돈이 없는".',
        points: [
          ['grammar', '**과거완료진행형 had been -ing** — 과거 시점(5년 후)까지 **계속 ~해 오고 있었다**. 5년 **내내** 아버지 말을 따랐다는 뜻이다.'],
          ['grammar', '**계속적 용법 관계대명사 , who** — 앞 사람에 대한 **추가 정보**. {that} 으로 바꿔 쓸 수 **없다**.'],
          ['grammar', '**명사 + left(과거분사)** — {no money left} "남겨진 돈이 없는". {There is some food left.}(음식이 좀 남아 있다)처럼 쓴다.'],
        ],
      },
      {
        covers: [4],
        en: '[r:But] his brother was [g:richer than ever].',
        note: '**해석 도움** — {비교급 + than ever} 는 "**그 어느 때보다** 더 ~한"이라는 **최상급 의미**의 표현이다.',
        points: [
          ['grammar', '**비교급 + than ever** — {richer than ever} "그 어느 때보다 부유한". {비교급 + than any other + 단수명사} 와 함께 **최상급 의미**를 나타낸다.'],
          ['reading', '**대조의 But** — Puru(**돈이 없음**) ↔ Puneet(**더 부자**). 같은 충고를 받은 두 형제의 **결과가 정반대**라는 것이 이야기의 수수께끼다.'],
        ],
      },
      {
        covers: [5],
        en: 'Puru [g:was puzzled] about [r:where he had gone wrong], | [h:so] he visited Puneet [g:to find out].',
        note: '**해석 도움** — {where he had gone wrong} 은 전치사 {about} 의 목적어인 **간접의문문**으로 "그가 **어디서 잘못했는지**"이다. {to find out} 은 **목적**("알아내기 위해")이다.',
        points: [
          ['grammar', '**간접의문문 의문사 + 주어 + 동사** — {where he had gone wrong}. 의문문 어순({where had he gone}) 이 아니라 **평서문 어순**이다.'],
          ['grammar', '**과거완료 had gone** — "어리둥절했던(과거)" 시점보다 **더 이전**에 잘못한 일이라 **대과거**를 쓴다.'],
          ['vocab', '**puzzled / puzzling** — 사람이 **당혹스러움을 느낄 때**는 {puzzled}, 사물이 **당혹스럽게 할 때**는 {puzzling}.'],
        ],
      },
    ],
    prompt: `Photorealistic conceptual still life photograph, wide banner composition. Two small traditional cloth money pouches side by side on a plain wooden table in soft daylight: the left pouch lies flat, empty and crumpled with a single copper coin beside it, the right pouch stands full and bulging with a neat pile of gold coins next to it, showing two brothers with opposite fortunes after five years. Simple clean background. ${LIGHT}, warm linen, copper and gold. ${NO}, bed, house, city, feast --ar 16:5 --v 8.1`,
  },

  /* ── Ch3 ─────────────────────────────────────────── */
  {
    no: 3, type: '내용일치', answer: 1,
    question: '다음 글의 내용과 일치하는 것은?',
    summary: 'Puneet은 Puru를 두 팔 벌려 환영했어요. 그날 밤 저녁을 먹고 이야기를 나눌 때, Puru는 며칠째 마음속에 있던 질문을 했어요. “나는 아버지의 충고를 따랐지만 행복하지 않아. 모든 도시에 집을 지었지만 늘 머물 수 없어서 사람을 고용해 집을 돌보게 했어. 편하게 자고 음식을 즐기라셔서 전문가에게 침대를 맞추고 훌륭한 요리사에게 식사를 준비시켰지. 부자처럼 쓰라셔서 돈 걱정 없이 원하는 것을 샀어. 그런데 지금 나는 빈털터리야. 너는 어떻게 그렇게 부자가 됐니?”',
    mainIdea: 'Puru followed his father’s advice word for word by building houses, hiring experts and buying whatever he wanted, but he ended up with nothing.',
    titleEn: 'Puru’s Question: Following the Words Too Literally',
    ko: [
      'Puneet은 Puru를 두 팔 벌려 환영했다.',
      '그날 밤, 형제가 저녁 식사 후 이야기를 하려고 앉았을 때, Puru는 며칠간 자신의 마음에 있었던 그 질문을 했다.',
      '“내가 따른 건 바로 우리 아버지의 조언이었지만, 나는 행복하지 않아.',
      '나는 모든 도시에 집을 지었어.',
      '그러나 나는 그곳에 항상 머물 수 없었으므로 사람들을 고용하여 집을 돌보게 했지.',
      '아버지께서 우리는 편하게 자고 음식을 즐겨야 한다고 말씀하셔서, 나는 내 침대를 전문가들에 의해 설계되게 했고, 내 식사는 훌륭한 요리사에 의해 준비되도록 했단다.',
      '그는 우리에게 부자처럼 돈을 쓰라고 했으므로, 나는 돈 걱정을 하지 않고 내가 원하는 것을 샀지.',
      '그렇지만 지금 나를 봐!',
      '나는 빈털터리야.',
      '너는 우리 아버지의 지혜를 따르지 않았니?',
      '나에게 말해 보렴, 형제야, 너는 어떻게 그렇게 부유해졌니?”',
    ],
    choices: [
      ['Puru는 집을 돌보도록 사람들을 고용했다.', '{I hired people and had the house looked after} 와 **일치**한다. **정답**.'],
      ['Puneet은 Puru의 방문을 반기지 않았다.', '{Puneet welcomed Puru with open arms.} — **두 팔 벌려 환영**했다.'],
      ['Puru는 저녁 식사 전에 질문을 했다.', '{when the brothers sat down to chat after dinner} — 저녁 식사 **후**에 질문했다.'],
      ['Puru는 직접 침대를 만들고 요리를 했다.', '침대는 **전문가들**이 설계했고, 식사는 **훌륭한 요리사**가 준비했다({had ~ designed by experts / prepared by a great chef}).'],
      ['Puru는 돈을 쓸 때마다 가격을 꼼꼼히 따졌다.', '{without worrying about money} — **돈 걱정 없이** 원하는 것을 샀다.'],
    ],
    vocab: [
      'welcome|동|환영하다|greet, receive|reject 거절하다|welcome 환영(명사)',
      'with open arms|숙|두 팔 벌려, 따뜻하게|warmly|coldly 차갑게|—',
      'chat|동|이야기를 나누다, 수다 떨다|talk|—|chatty 수다스러운',
      'on one’s mind|숙|마음에 걸려 있는|—|—|—',
      'advice|명|충고, 조언|tip, suggestion|—|advise 충고하다',
      'hire|동|고용하다|employ|fire 해고하다|hire 고용(명사)',
      'look after|동|돌보다|take care of|neglect 방치하다|—',
      'design|동|설계하다, 디자인하다|plan, create|—|designer 디자이너',
      'expert|명|전문가|specialist|beginner 초보자|expertise 전문 지식',
      'prepare|동|준비하다|make ready|—|preparation 준비',
      'chef|명|요리사, 주방장|cook|—|—',
      'worry about|동|~에 대해 걱정하다|be anxious about|—|worry 걱정(명사) / worried 걱정하는',
      'empty-handed|형|빈손의, 빈털터리의|with nothing|—|empty 빈',
      'wisdom|명|지혜|knowledge, insight|foolishness 어리석음|wise 현명한',
    ],
    flow: [
      ['🤗', '재회 — 두 팔 벌린 환영', 'Puneet은 Puru를 {with open arms} **따뜻하게 맞이**하고, 저녁 식사 후 형제는 이야기를 나눈다.'],
      ['🏠', 'Puru의 해석 ① — 모든 도시에 집', '말 그대로 **모든 도시에 집**을 짓고, 머물 수 없어서 **사람을 고용해** 관리했다 → 큰 비용.'],
      ['🍽️', 'Puru의 해석 ②③④ — 돈으로 산 편안함', '**전문가**가 설계한 침대, **훌륭한 요리사**의 식사, **돈 걱정 없는** 소비. 아버지 말을 **글자 그대로** 따랐다.'],
      ['😞', '결과와 질문 — 빈털터리가 되다', '{I am empty-handed.} 아버지의 지혜를 따랐는데 왜 **빈털터리**가 됐는지, 형제는 **어떻게 부자**가 됐는지 묻는다.'],
    ],
    cards: [
      {
        covers: [1, 2],
        en: 'Puneet [g:welcomed] Puru [r:with open arms]. | That night, [h:when the brothers sat down to chat after dinner], | Puru asked the question | [g:that had been] on his mind [h:for days].',
        note: '**해석 도움** — {with open arms} 는 "두 팔 벌려, **진심으로 반갑게**". {the question that had been on his mind for days} 는 "**며칠 동안** 그의 마음에 **있어 온** 질문"이다.',
        points: [
          ['grammar', '**주격 관계대명사 that** — {the question that had been on his mind}. {that} 은 {which} 로 바꿀 수 있다.'],
          ['grammar', '**과거완료 계속 had been** — 질문한 **그날 밤(과거)** 이전 **며칠 동안 계속** 마음에 있었다.'],
          ['grammar', '**to부정사(목적)** — {sat down to chat} "이야기를 **나누려고** 앉았다".'],
          ['vocab', '**on one’s mind** — "마음에 걸려 있는, 계속 생각나는". {What’s on your mind?}(무슨 고민 있니?)'],
        ],
      },
      {
        covers: [3, 4],
        en: '“[r:It was] our father’s advice [r:that] I followed, | but I am not happy. | I [g:built] a house [h:in every city].',
        note: '**해석 도움** — {It was ~ that ...} 은 **강조 구문**으로 "내가 따른 **것은 바로** 우리 아버지의 조언이었다"이다. {build-built-built}.',
        points: [
          ['grammar', '**It is(was) ~ that 강조 구문** — 강조할 말을 {It was} 와 {that} 사이에 둔다. 원래 문장: {I followed our father’s advice.} → 목적어 {our father’s advice} 를 강조.'],
          ['grammar', '**강조 구문 vs 가주어 구문** — {It was} 와 {that} 을 빼도 **완전한 문장**이 남으면 **강조 구문**이다({I followed our father’s advice}).'],
          ['reading', '**Puru의 고백** — "아버지 말을 따랐는데 **행복하지 않다**". 이어지는 문장들이 그 **구체적 내용**이다.'],
        ],
      },
      {
        covers: [5],
        en: 'But [r:because] I could not always stay there, | I [g:hired] people | and [g:had the house looked after].',
        note: '**해석 도움** — {had the house looked after} 는 **사역동사 have + 목적어 + 과거분사**로 "집이 **돌봐지게 하다**", 즉 "(사람을 시켜) 집을 **돌보게 했다**"이다.',
        points: [
          ['grammar', '**have + 목적어 + p.p.** — 목적어가 동작을 **당하는** 입장일 때. 집은 **돌봐지는** 대상이라 {looked after}(과거분사).'],
          ['grammar', '**not always** — "항상 ~한 것은 아니다"라는 **부분 부정**. {could not always stay there} "늘 거기 머물 수는 **없었다**".'],
          ['vocab', '**look after = take care of** — "돌보다". 수동으로 쓰일 때도 {after} 를 빠뜨리지 않는다.'],
        ],
      },
      {
        covers: [6],
        en: 'Father said [h:we should sleep comfortably and enjoy our food], | so I [g:had my bed designed] [r:by experts] | and [g:my meals prepared] [r:by a great chef].',
        note: '**해석 도움** — {had my bed designed by experts and (had) my meals prepared by a great chef} — **have + 목적어 + p.p.** 가 두 번 이어진다. 두 번째 {had} 는 생략됐다.',
        points: [
          ['grammar', '**have + 목적어 + p.p. (+ by 행위자)** — 침대는 전문가에 의해 **설계되고**, 식사는 요리사에 의해 **준비된다**. 둘 다 **수동 관계**라 과거분사.'],
          ['grammar', '**공통 요소 생략** — {and (had) my meals prepared}. 반복되는 동사 {had} 를 생략했다.'],
          ['grammar', '**간접화법의 명사절** — {Father said (that) we should ~}. {that} 이 생략된 {said} 의 **목적어절**이다.'],
        ],
      },
      {
        covers: [7],
        en: 'He [g:told us to spend] like a rich man, | so I bought [r:what I wanted] | [h:without worrying about money].',
        note: '**해석 도움** — {tell + 목적어 + to부정사} 는 "~에게 …하라고 **말하다**". {what I wanted} 는 "내가 **원하는 것**". {without -ing} 는 "~**하지 않고**".',
        points: [
          ['grammar', '**tell + 목적어 + to부정사** — "~에게 …하라고 말하다". {ask, want, advise, order} 도 같은 구조다.'],
          ['grammar', '**관계대명사 what** — 선행사를 **포함**해 "~하는 것"({= the thing(s) which}). {bought} 의 목적어 역할.'],
          ['grammar', '**전치사 + 동명사** — {without worrying} "걱정하지 **않고**". 전치사 뒤에는 **동명사**가 온다.'],
        ],
      },
      {
        covers: [8, 9, 10, 11],
        en: 'But [g:look at me now]! | I am [r:empty-handed]. | [h:Did you not follow] our father’s wisdom? | [g:Tell me], brother, [h:how did you get so rich]?”',
        note: '**해석 도움** — {empty-handed} 는 "**빈손의**, 빈털터리의". {Did you not follow ~?} 는 **부정 의문문**으로 "~을 **따르지 않았니**?"이다. {get + 형용사} 는 "~하게 **되다**".',
        points: [
          ['grammar', '**부정 의문문** — {Did you not follow ~?}(= {Didn’t you follow ~?}). 대답은 사실에 맞춰: 따랐으면 **Yes**, 안 따랐으면 **No**.'],
          ['grammar', '**get + 형용사(상태 변화)** — {get so rich} "그렇게 **부자가 되다**". {get tired, get angry} 처럼 쓴다.'],
          ['vocab', '**empty-handed** — {empty}(빈) + {hand}(손) + {-ed}. "**빈손으로**, 가진 것 없이". {come back empty-handed}(빈손으로 돌아오다)'],
        ],
      },
    ],
    prompt: `Photorealistic interior photograph, wide banner composition. A grand but strangely empty mansion room in a traditional Indian style: a luxurious custom-made carved bed with silk cushions, a long dining table set with fancy silver dishes that are all empty, expensive vases and decorations, but a bare open wooden chest with nothing inside in the foreground, suggesting money spent on luxury until nothing was left. ${LIGHT}, ivory, pale gold and deep teal accents. ${NO}, coins, gold coins, money pouches, market, city skyline --ar 16:5 --v 8.1`,
  },

  /* ── Ch4 ─────────────────────────────────────────── */
  {
    no: 4, type: '요지', answer: 5,
    question: '다음 글에서 Puneet이 말하고자 하는 바로 가장 적절한 것은?',
    summary: 'Puneet은 웃으며 말했어요. “저도 아버지의 지혜를 따랐지만 조금 다르게 이해했어요. ‘모든 도시에 집을 지어라’는 말을 전 세계에 머물 곳을 가지라는 뜻으로 받아들였어요. 그래서 모든 도시에서 친구를 사귀고 그 도시에 갈 때 친구 집에 머물렀지요. 또 하루 종일 열심히 일해 피곤했기 때문에 침대든 딱딱한 바닥이든 매일 밤 편하게 잤어요. 배고플 때만 먹었더니 간단한 식사도 정말 맛있었어요.”',
    mainIdea: 'Puneet understood his father’s words differently: he made friends in every city, slept well after hard work, and ate only when he was hungry.',
    titleEn: 'Puneet’s Answer: The Same Words, a Different Understanding',
    ko: [
      'Puneet은 웃으며 말했다, “친애하는 형님, 저 또한 우리 아버지의 지혜를 따랐습니다.',
      '하지만 저는 조금 다르게 이해했지요.',
      '아버지가 ‘모든 도시에 집을 지어라’라고 말했을 때, 저는 그것을 전 세계에 머물 수 있는 장소를 가지는 것으로 여겼지요.',
      '그래서 저는 모든 도시에서 친구를 사귀었고 그 도시들을 방문했을 때 그들의 집에 머물렀어요.',
      '또한, 저는 하루 종일 열심히 일하고 나서 피곤해지곤 했기 때문에 침대에서 자든 딱딱한 바닥에서 자든 상관없이 매일 밤 편안하게 잠을 잤지요.',
      '저는 배고플 때만 먹었기 때문에 간단한 식사마저도 훌륭한 맛이 났습니다.”',
    ],
    choices: [
      ['아버지의 말은 글자 그대로 따라야 한다.', '글자 그대로 따른 Puru는 **빈털터리**가 됐다. Puneet은 오히려 **다르게 이해**했다.'],
      ['비싼 침대가 있어야 편하게 잘 수 있다.', 'Puneet은 피곤하면 **침대든 딱딱한 바닥이든** 편하게 잤다. 비싼 침대가 필요하지 않다는 것이다.'],
      ['여행을 많이 할수록 돈을 더 벌 수 있다.', '여러 도시를 방문했다는 말은 있지만, 여행이 **돈을 벌게 한다**는 내용은 없다.'],
      ['맛있는 음식을 먹으려면 좋은 요리사가 필요하다.', '배고플 때 먹으면 **간단한 식사**도 맛있다는 것이다. 요리사가 필요하다는 것은 **Puru의 방식**이다.'],
      ['같은 충고도 지혜롭게 해석하면 돈 없이 행복할 수 있다.', '친구 집에 머물고, 열심히 일해 잘 자고, 배고플 때 먹는 등 **같은 말을 지혜롭게** 해석해 **돈을 쓰지 않고** 행복을 누렸다는 핵심을 담은 **정답**이다.'],
    ],
    vocab: [
      'follow|동|따르다|obey|ignore 무시하다|following 다음의',
      'wisdom|명|지혜|knowledge, insight|foolishness 어리석음|wise 현명한',
      'differently|부|다르게|in another way|similarly 비슷하게|different 다른 / difference 차이',
      'take A as B|동|A를 B로 여기다(받아들이다)|regard A as B|—|—',
      'all around the world|숙|전 세계에|worldwide|—|—',
      'make friends|동|친구를 사귀다|—|—|friendship 우정',
      'visit|동|방문하다|go to see|—|visitor 방문객',
      'comfortably|부|편안하게|easily, cozily|uncomfortably 불편하게|comfortable 편안한',
      'tired|형|피곤한|exhausted|energetic 활기찬|tire 피곤하게 하다',
      'matter|동|중요하다, 문제가 되다|count, be important|—|matter 문제(명사)',
      'floor|명|바닥|ground|ceiling 천장|—',
      'hungry|형|배고픈|starving|full 배부른|hunger 배고픔',
      'simple|형|간단한, 소박한|plain, basic|fancy 화려한|simply 간단히',
      'taste|동|~한 맛이 나다|—|—|taste 맛(명사) / tasty 맛있는',
    ],
    flow: [
      ['😊', '대답의 시작 — 나도 따랐다', 'Puneet도 {I also followed our father’s wisdom}. 하지만 {a bit differently} — **조금 다르게** 이해했다.'],
      ['🏡', '해석 ① — 집 = 머물 곳(친구)', '"모든 도시에 집"을 **전 세계에 머물 곳**으로 받아들여, 모든 도시에 **친구**를 사귀고 그 집에 머물렀다.'],
      ['😴', '해석 ② — 편한 잠 = 열심히 일한 뒤의 잠', '하루 종일 **열심히 일해 피곤**했으니, **침대든 바닥이든** 상관없이 편하게 잤다.'],
      ['🍚', '해석 ③ — 음식을 즐김 = 배고플 때 먹기', '**배고플 때만** 먹으니 **간단한 식사**도 훌륭한 맛이 났다. 모두 **돈이 들지 않는** 해석이다.'],
    ],
    cards: [
      {
        covers: [1, 2],
        en: 'Puneet smiled and said, “[h:My dear brother], I [r:also] followed our father’s wisdom. | But I [g:understood it] [h:a bit differently].',
        note: '**해석 도움** — {also} 는 Puru처럼 **나도** 아버지 말을 따랐다는 뜻이다. {a bit differently} 는 "**조금 다르게**"로, {a bit} 이 부사 {differently} 를 꾸민다.',
        points: [
          ['grammar', '**동사 + 부사** — {understood it differently}. 동사를 꾸미므로 형용사 {different} 가 아닌 **부사** {differently}.'],
          ['vocab', '**a bit = a little** — "조금, 약간". 형용사·부사 앞에서 정도를 낮춘다({a bit tired}).'],
          ['reading', '**대조의 But** — 같은 **지혜를 따름** + **다르게 이해함**. 결과의 차이는 **해석의 차이**에서 왔다는 것이 핵심이다.'],
        ],
      },
      {
        covers: [3],
        en: '[r:When he said ‘build a house in every city,’] | I [g:took it as] [h:having a place to stay] | all around the world.',
        note: '**해석 도움** — {take A as B} 는 "A를 B로 **받아들이다(여기다)**". {as} 는 전치사라 뒤에 **동명사** {having} 이 온다. {a place to stay} 는 "**머물** 장소".',
        points: [
          ['grammar', '**take A as B** — "A를 B로 여기다"({= regard A as B}). {it} 은 아버지의 말 {‘build a house in every city’} 이다.'],
          ['grammar', '**전치사 + 동명사** — {as having ~}. 전치사 {as} 뒤라서 동명사를 쓴다.'],
          ['grammar', '**to부정사의 형용사적 용법** — {a place to stay} "머물 장소". 명사를 뒤에서 꾸민다.'],
        ],
      },
      {
        covers: [4],
        en: '[r:So] I [g:made friends] [h:in every city] | and I [g:stayed at their houses] | [h:when I visited those cities].',
        note: '**해석 도움** — {make friends} 는 "친구를 **사귀다**"로, {friends} 는 **항상 복수형**이다. {their houses} 는 **친구들의 집**이다.',
        points: [
          ['vocab', '**make friends (with)** — "(~와) 친구가 되다". 서로 사귀는 것이라 **복수형** {friends}.'],
          ['grammar', '**시간의 접속사 when** — {when I visited those cities} "그 도시들을 **방문했을 때**".'],
          ['reading', '**집 짓기 → 친구 사귀기** — 집을 짓고 사람을 고용한 Puru와 달리, Puneet은 **돈 없이** 모든 도시에 **머물 곳**을 얻었다.'],
        ],
      },
      {
        covers: [5],
        en: '[r:Also], I slept comfortably each night | [r:because] I [g:would be tired] after a hard day’s work, | and [g:it did not matter] [h:if I was sleeping on a bed or on the hard floor].',
        note: '**해석 도움** — {would} 는 과거의 **습관**("~하곤 했다")이다. {it did not matter if ~} 는 "~**인지는 상관없었다**"로, {it} 은 **가주어**, {if ~} 절이 **진주어**다.',
        points: [
          ['grammar', '**과거의 습관 would** — {I would be tired} "피곤하곤 했다". 매일 반복된 일을 나타낸다({used to} 와 비슷).'],
          ['grammar', '**It doesn’t matter if/whether ~** — "~인지는 중요하지 않다". {if} 는 "~인지"라는 **명사절**이다.'],
          ['vocab', '**matter** — 동사로 "**중요하다**". {It doesn’t matter.}(상관없어.) 명사로는 "문제, 일".'],
          ['vocab', '**a hard day’s work** — "하루의 고된 일". {day’s} 는 **시간의 소유격**이다({a two hours’ drive}).'],
        ],
      },
      {
        covers: [6],
        en: 'I ate [r:only when] I was hungry, | so [h:even] a simple meal [g:tasted great].”',
        note: '**해석 도움** — {only when ~} 은 "~할 **때만**". {taste + 형용사} 는 "~한 **맛이 나다**"라는 **감각동사** 구문이다.',
        points: [
          ['grammar', '**감각동사 + 형용사** — {tasted great}(○) / {tasted greatly}(×). {look, sound, smell, feel, taste} 뒤에는 **형용사**가 온다.'],
          ['vocab', '**even** — "~조차, ~마저". {even a simple meal} "**간단한** 식사**마저도**" — 요리사가 필요 없었다는 뜻이다.'],
          ['reading', '**음식을 즐김의 새 해석** — 비싼 요리사(Puru) ↔ **배고플 때 먹기**(Puneet). 즐거움은 돈이 아니라 **태도**에서 온다.'],
        ],
      },
    ],
    prompt: `Photorealistic still life photograph, wide banner composition. A simple wooden floor of a modest room with a thin rolled cotton sleeping mat and a folded blanket, and beside it on a low wooden stool a plain homemade meal: a bowl of rice, a small bowl of lentil curry and a piece of flatbread on a steel plate, looking warm and delicious. A small open window showing a friendly neighborhood street of houses. ${LIGHT}, warm beige, soft green and steel grey. ${NO}, gold, coins, luxury bed, silver dishes, silk --ar 16:5 --v 8.1`,
  },

  /* ── Ch5 ─────────────────────────────────────────── */
  {
    no: 5, type: '주제', answer: 3,
    question: '다음 글의 주제로 가장 적절한 것은?',
    summary: '“부자처럼 돈을 쓰라고요?” Puneet은 말을 이어 갔어요. “부자는 돈을 불리는 방법을 알아요. 그래서 저는 사치스러운 물건보다는 더 많은 돈을 돌려줄 수 있는 것에 돈을 쓰려고 노력했어요. 제게는 이것이 아버지가 설명하려고 하셨던 지혜예요.” 이제 Puru는 자신이 얼마나 어리석었는지 깨달았고, 이 지혜를 마음에 새기고 새로운 삶을 시작했어요.',
    mainIdea: 'Puneet explained that spending like a rich man means spending on things that make money grow, not on luxuries, and Puru started a new life with this wisdom.',
    titleEn: 'Spend like a Rich Man: Money That Brings Back More Money',
    ko: [
      '“부자처럼 돈을 쓰라고요?” Puneet은 계속했다.',
      '“부자는 돈을 불리는 방법을 알고 있어요.',
      '그래서 저는 사치스러운 물건에 돈을 쓰는 것보다는 저에게 더 많은 돈을 돌려줄 수 있는 것에 돈을 쓰려고 노력했지요.',
      '저에게는, 이게 우리의 아버지가 설명하려고 하셨던 바로 그 지혜입니다.”',
      '이제 Puru는 그가 얼마나 어리석었었는지를 깨달았다.',
      '이 지혜를 마음에 새기고, Puru는 새로운 삶을 시작했다.',
    ],
    choices: [
      ['형제간에 재산을 공평하게 나누는 방법', '재산을 나눈 것은 **본문 2**의 이야기이고, 여기서는 **돈을 쓰는 지혜**를 다룬다.'],
      ['사치스러운 물건을 사는 즐거움', '오히려 **사치스러운 물건**({luxurious things})보다 돈을 불리는 곳에 쓰라고 한다.'],
      ['돈을 불리는 곳에 쓰는 부자의 지혜', '부자는 **돈을 불리는 법**을 알기에, 돈을 **더 많이 돌려줄 곳**에 쓰는 것이 아버지의 **지혜**였다는 **정답**이다.'],
      ['어리석은 사람을 가르치는 방법', 'Puru가 **스스로** 어리석음을 깨달았을 뿐, 누군가를 **가르치는 방법**은 다루지 않는다.'],
      ['새로운 삶을 시작하는 용기', '새 삶의 시작은 **결말**일 뿐, 글의 중심은 새 삶을 가능하게 한 **돈 쓰는 지혜**다.'],
    ],
    vocab: [
      'continue|동|계속하다, (말을) 이어 가다|go on, carry on|stop 멈추다|continuous 계속되는',
      'grow|동|늘어나다, 자라다|increase|decrease 줄어들다|growth 성장',
      'bring back|동|돌려주다, 되돌려 가져오다|return|—|—',
      'rather than|숙|~보다는, ~ 대신에|instead of|—|—',
      'luxurious|형|사치스러운, 호화로운|expensive, fancy|simple 소박한|luxury 사치(품)',
      'explain|동|설명하다|describe, clarify|—|explanation 설명',
      'realize|동|깨닫다|understand, notice|—|realization 깨달음',
      'foolish|형|어리석은|stupid, silly|wise 현명한|fool 바보',
      'wisdom|명|지혜|knowledge, insight|foolishness 어리석음|wise 현명한',
      'with ~ in mind|숙|~을 마음에 새기고|—|—|mind 마음',
    ],
    flow: [
      ['💬', '마지막 충고의 재해석', '{“Spend money like a rich man?”} — 이야기의 **핵심 수수께끼**였던 마지막 말을 Puneet이 풀어 준다.'],
      ['📈', '부자의 비밀 — 돈을 불린다', '{A rich man knows how to make money grow.} 부자는 **돈을 쓰기만** 하지 않고 **불리는 법**을 안다.'],
      ['💡', 'Puneet의 실천 — 돌아오는 돈', '**사치품**({luxurious things}) 대신 **더 많은 돈을 돌려줄 곳**에 썼다. 이것이 아버지가 설명하려던 **바로 그 지혜**다.'],
      ['🌱', '깨달음과 새 출발', 'Puru는 자신이 얼마나 **어리석었는지 깨닫고**, 이 지혜를 **마음에 새겨** 새 삶을 시작한다.'],
    ],
    cards: [
      {
        covers: [1, 2],
        en: '“Spend money like a rich man?” [r:continued Puneet]. | “A rich man [g:knows how to make money grow].',
        note: '**해석 도움** — {continued Puneet} 은 {Puneet continued} 의 **도치**로, 인용문 뒤에서 **말한 사람**을 밝힐 때 자주 쓴다. {make money grow} 는 "돈이 **늘어나게 하다**"이다.',
        points: [
          ['grammar', '**인용문 뒤 주어·동사 도치** — {“~,” said he / continued Puneet}. 주어가 **명사**일 때 도치가 자연스럽다.'],
          ['grammar', '**의문사 + to부정사** — {how to make ~} "~하는 **방법**". {know} 의 **목적어**다.'],
          ['grammar', '**사역동사 make + 목적어 + 동사원형** — {make money grow} "돈이 **자라게** 하다". 목적격 보어로 **원형부정사**({grow})를 쓴다({to grow} ×).'],
        ],
      },
      {
        covers: [3],
        en: '[r:So], I [g:tried to spend] money on something | [g:that would bring me back more money] | [r:rather than] on luxurious things.',
        note: '**해석 도움** — {spend money on A rather than on B} 는 "B보다는 **A에** 돈을 쓰다"이다. {that} 은 {something} 을 꾸미는 **주격 관계대명사**다.',
        points: [
          ['grammar', '**spend + 돈/시간 + on 명사** — "~에 돈을 쓰다". {spend + 시간 + -ing}(~하는 데 시간을 쓰다)도 함께 알아두자.'],
          ['grammar', '**A rather than B** — "B보다는 A". {on something ~ rather than on luxurious things} 처럼 **같은 형태**({on + 명사})로 짝을 맞춘다.'],
          ['grammar', '**bring + 간접목적어 + back + 직접목적어** — {bring me back more money} "나에게 더 많은 돈을 **돌려주다**".'],
        ],
      },
      {
        covers: [4],
        en: 'For me, [r:it was] this wisdom [r:that] our father [g:tried to explain].”',
        note: '**해석 도움** — {It was ~ that ...} **강조 구문**으로, 아버지가 설명하려던 것이 **바로 이 지혜**였다고 강조한다. 본문 3의 Puru의 말({It was our father’s advice that I followed})과 **짝**을 이룬다.',
        points: [
          ['grammar', '**It was ~ that 강조 구문** — 원래 문장: {Our father tried to explain this wisdom.} → 목적어 {this wisdom} 을 강조.'],
          ['grammar', '**try + to부정사** — "~하려고 **애쓰다**". 아버지는 설명하려 했지만 **끝내 설명하지 못했다**(본문 1).'],
          ['reading', '**두 형제의 강조 구문 대비** — Puru: "내가 따른 건 **아버지의 조언**" / Puneet: "아버지가 설명하려던 건 **이 지혜**". **말**과 **지혜**의 차이다.'],
        ],
      },
      {
        covers: [5, 6],
        en: 'Now Puru [g:realized] [h:how foolish he had been]. | [r:With this wisdom in mind], Puru started a new life.',
        note: '**해석 도움** — {how foolish he had been} 은 "그가 **얼마나 어리석었었는지**"라는 **간접의문문**이다. {with + 명사 + in mind} 는 "~을 **마음에 새긴 채로**"이다.',
        points: [
          ['grammar', '**간접의문문 how + 형용사 + 주어 + 동사** — {how foolish he had been}. {how foolish had he been} (×).'],
          ['grammar', '**과거완료 had been** — 깨달은 시점(과거)보다 **이전 5년 동안** 어리석었다는 **대과거**다.'],
          ['grammar', '**with + 명사 + 부사구(부대상황)** — {with this wisdom in mind} "이 지혜를 **마음에 품은 채**". {with his eyes closed} 와 같은 구조.'],
        ],
      },
    ],
    prompt: `Photorealistic conceptual still life photograph, wide banner composition. On a plain wooden table in soft daylight, a small clay pot of rich soil with a young green sapling growing out of it, and a few coins placed at its roots as if planted like seeds, symbolizing money that grows. Beside it a humble notebook, a pencil and a small wooden abacus. A pile of shiny luxury jewelry pushed aside and out of focus at the far edge. ${LIGHT}, fresh green, earthy brown and soft gold. ${NO}, bed, floor mat, food, mansion --ar 16:5 --v 8.1`,
  },
];

if (process.argv[1]?.endsWith('_author-L6.mjs')) {
  console.log('✍️  L6 저작');
  for (const c of chapters) writeChapter('L6', SOURCE, c);
}
