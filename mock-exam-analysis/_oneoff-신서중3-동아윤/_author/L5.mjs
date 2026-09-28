/* 신서중3 동아(윤정미) Lesson 5 — The Team Behind the Team · 저작 원고
 * 문법은 _gen-data.mjs 머리말 참고. 정답 위치 2/4/1/5 (사전 분산). */

const NEG = 'people, faces, hands, runners, crowd, text, letters, numbers, logo, watermark, dramatic lighting, sunset, golden hour, night, heavy shadows';

export const CHAPTERS = [
  /* ─────────────────────────── Ch1 ─────────────────────────── */
  {
    no: 1, type: '주제', answer: 2,
    summary: '스포츠에서 트로피나 메달은 선수들만 받지만, 선수들이 혼자 힘으로 이기는 것은 아니에요. 선수들을 돕는 사람들이 있는데, 이들은 흔히 드러나지 않고 주목도 받지 못하지요. 하지만 이들은 선수들만큼 중요해요. 글쓴이는 그 첫 번째 예로 마라톤의 페이서를 소개합니다. 페이서는 경험 많은 선수로서 다른 선수들과 함께 달리며 그들이 경주를 더 잘 운영하도록 이끌고, 한 경주에 여러 명이 있을 수 있어요.',
    main_idea_en: 'Players do not win alone; hidden helpers such as marathon pacers are just as important as the players themselves.',
    title_en: 'Hidden People in Sports: The Pacers',
    illust: `Wide banner photograph of an empty city marathon course just before the race, a broad clean asphalt road
      lined with low blue barriers, clusters of bright helium balloons in red, yellow, blue and green tied to the
      barriers and swaying at different heights, small plain colored pennant flags on poles, a long table of paper
      water cups at the roadside, an inflatable start arch far down the road. Natural soft diffused daylight, bright
      overcast sky, high-key exposure, low contrast, fresh clean colors. Crisp editorial sports photography, shallow
      depth of field on the far arch. --ar 16:5 --v 8.1 --no race car, tires, pit lane, mountains, snow, tents,
      ${NEG}`,
    ko: [
      '스포츠에서는 선수들만 트로피나 메달을 받지만, 그들이 혼자 힘으로 이기는 것은 아닙니다.',
      '선수들을 돕는 사람들이 있습니다.',
      '이 사람들은 종종 숨겨져 있고 주목을 받지 못합니다.',
      '하지만 그들은 선수들만큼 중요합니다.',
      '여기 몇 가지 예가 있습니다.',
      '페이서들은 마라톤에서 다른 선수들과 함께 달리며 그들을 이끕니다.',
      '페이서들은 경험이 많은 선수들이며, 그들의 일은 다른 선수들이 자신의 경주를 더 잘 운영하도록 돕는 것입니다.',
      '한 경주에는 여러 명의 페이서가 있을 수 있습니다.',
    ],
    choices: [
      ['the reasons why marathons are becoming popular', '마라톤이 **인기를 얻는 이유**는 한 줄도 나오지 않는다. 마라톤은 숨은 조력자의 **예시가 등장하는 무대**일 뿐이다.'],
      ['the importance of hidden helpers in sports', '`they don’t win on their own` → `There are people who help` → `as important as the players` 로 이어지는 **글 전체의 중심 생각**이다. 페이서는 그 **첫 번째 예**다.'],
      ['how to win a trophy or medal in sports', '첫 문장의 `trophy or medal` 은 **화제를 꺼내는 도입**이다. 상을 **받는 방법**은 다루지 않는다.'],
      ['the difficulty of choosing a marathon coach', '본문은 **코치**가 아니라 **페이서**를 말한다. 선택이 **어렵다**는 내용도 없다.'],
      ['why players should run without any help', '본문은 정반대로 **선수들은 혼자 이기지 않는다**(`don’t win on their own`)고 말한다.'],
    ],
    vocab: [
      ['trophy', '명', '트로피, 우승컵', 'cup, prize', '—', 'trophies (복수)'],
      ['medal', '명', '메달', 'award', '—', 'medalist 메달 수상자'],
      ['on one’s own', '숙', '혼자서, 혼자 힘으로', 'alone, by oneself', 'together 함께', 'own 자신의'],
      ['hidden', '형', '숨겨진, 드러나지 않는', 'unseen, invisible', 'visible 눈에 보이는', 'hide 숨기다'],
      ['attention', '명', '주목, 관심', 'notice, focus', 'neglect 무시', 'attend 주의를 기울이다'],
      ['however', '부', '하지만, 그러나', 'but, yet', '—', '—'],
      ['as ~ as', '숙', '…만큼 ~한', 'equally', '—', '원급 비교'],
      ['example', '명', '예, 사례', 'instance, case', '—', 'for example 예를 들어'],
      ['pacer', '명', '페이서(속도 조절 주자)', 'pacemaker', '—', 'pace 속도'],
      ['lead', '동', '이끌다, 안내하다', 'guide, direct', 'follow 따라가다', 'leader 지도자'],
      ['marathon', '명', '마라톤', 'long-distance race', 'sprint 단거리 경주', '—'],
      ['experienced', '형', '경험이 많은, 노련한', 'skilled, expert', 'inexperienced 미숙한', 'experience 경험'],
      ['manage', '동', '관리하다, 운영하다', 'handle, control', 'mismanage 잘못 관리하다', 'management 관리'],
      ['several', '형', '여럿의, 몇몇의', 'a few, some', '—', '—'],
    ],
    flow: [
      ['🏆', '통념 뒤집기 — 선수는 혼자 이기지 않는다', '**only the players get a trophy** 라는 익숙한 사실을 먼저 말한 뒤, **but** 으로 곧장 뒤집는다. **보상은 선수만, 승리는 모두의 것**이라는 대비가 과 전체의 출발점이다.'],
      ['🙈', '숨은 조력자의 등장', '선수를 **돕는 사람들**이 있지만 그들은 **숨겨져 있고 주목받지 못한다**. **However** 뒤에서 글쓴이의 주장 — **선수들만큼 중요하다** — 이 나온다.'],
      ['🏃', '첫 번째 예 — 마라톤의 페이서', '**Here are some examples.** 로 예시 단락을 연다. 페이서는 **다른 선수들과 함께 달리며 이끄는** 사람이다.'],
      ['📋', '페이서의 조건과 역할', '페이서는 **경험 많은 선수**이며, 일은 **다른 선수들이 경주를 잘 운영하도록 돕는 것**. 한 경주에 **여러 명**이 있다는 정보가 다음 단락(속도별 페이서)으로 이어진다.'],
    ],
    cards: [
      { c: [1], en: 'In sports, [[only the players]] get a trophy or medal, / ((but)) they don’t win {{on their own}}.',
        ko: '스포츠에서는, 선수들만 트로피나 메달을 받는다, / 하지만 그들은 혼자 힘으로 이기지 않는다.',
        note: '**해석 도움** — `only` 가 `the players` 앞에 붙어 **‘선수들만’** 이라는 **한정**을 만든다. 뒤의 **but** 이 이 한정을 뒤집는 **반전 신호**다.',
        pts: [
          ['grammar', '**only의 위치** — `only` 는 **꾸미는 말 바로 앞**에 둔다. `only the players` 는 ‘선수들만’, `the players only get` 처럼 옮기면 뜻이 흐려진다.'],
          ['vocab', '**on one’s own** — ‘혼자서, 혼자 힘으로’. `by themselves`, `alone` 과 바꿔 쓸 수 있다. 소유격(`their`)은 주어에 맞춰 바뀐다.'],
          ['reading', '**통념 제시 → 반박** — 누구나 아는 사실(상은 선수만 받는다)을 먼저 인정하고 **but** 으로 글쓴이의 관점을 세운다. 이 과 전체의 **주제문 역할**을 한다.'],
        ] },
      { c: [2, 3], en: 'There are [[people]] {{who help the players}}. / These people are often ((hidden)) and don’t get attention.',
        ko: '사람들이 있다 / 선수들을 돕는. / 이 사람들은 종종 숨겨져 있고 주목을 받지 못한다.',
        note: '**해석 도움** — `who help the players` 가 앞의 `people` 을 뒤에서 꾸민다. 우리말로는 **‘선수들을 돕는 사람들’** 로 당겨 해석한다.',
        pts: [
          ['grammar', '**주격 관계대명사 who** — 선행사가 **사람**(`people`)이므로 `who`. `that` 으로 바꿔 쓸 수 있고, 주격이라 **생략할 수 없다**. 동사 `help` 는 선행사(복수)에 수를 맞춘다.'],
          ['grammar', '**be동사 + 과거분사(형용사)** — `are hidden` 은 ‘숨겨져 있다’는 **상태**. `and` 뒤에서 일반동사 부정 `don’t get` 과 **병렬**로 이어진다.'],
          ['vocab', '**get attention** — ‘주목을 받다’. 반대로 **주목을 끌다**는 `attract attention`, `catch one’s attention`.'],
        ] },
      { c: [4, 5], en: '((However)), they are [[as important as]] the players. / {{Here are}} some examples.',
        ko: '하지만, 그들은 선수들만큼 중요하다. / 여기 몇 가지 예가 있다.',
        note: '**해석 도움** — `as important as the players` 는 **‘선수들만큼 중요한’**. 두 대상이 **같은 정도**임을 말하는 **원급 비교**다.',
        pts: [
          ['grammar', '**원급 비교 as + 형용사 + as** — 두 `as` 사이에는 **원급**이 온다(`as more important as` ×). 부정은 `not as(so) ~ as` 로 ‘…만큼 ~하지 않은’.'],
          ['grammar', '**Here + be동사 + 주어** — 부사 `Here` 가 앞에 나오면 **주어와 동사가 도치**된다. 주어가 복수(`some examples`)이므로 `are`.'],
          ['reading', '**However = 글쓴이의 주장** — 앞의 ‘숨겨져 있다, 주목받지 못한다’를 뒤집고 **핵심 주장**을 내놓는다. 주제 찾기 문제의 **근거 문장**이다.'],
        ] },
      { c: [6, 7], en: 'Pacers run with other runners and [[lead them]] in a marathon. / Pacers are experienced runners, and their job is {{to help}} other runners [[manage]] their race better.',
        ko: '페이서들은 다른 선수들과 함께 달리고 그들을 이끈다 / 마라톤에서. / 페이서들은 경험 많은 선수들이다, / 그리고 그들의 일은 다른 선수들이 경주를 더 잘 운영하도록 돕는 것이다.',
        note: '**해석 도움** — `help other runners manage ~` 는 **help + 목적어 + 동사원형** 구조로 ‘다른 선수들이 ~을 운영하도록 돕다’. `manage` 앞에 `to` 가 **없어도 된다**.',
        pts: [
          ['grammar', '**to부정사의 명사적 용법(보어)** — `their job is to help ~` 에서 `to help` 는 **주격 보어**로 ‘돕는 것’. 주어가 **일·목표·계획**일 때 자주 쓰는 틀이다.'],
          ['grammar', '**help + 목적어 + (to) 동사원형** — `help` 는 목적격 보어로 **동사원형과 to부정사 모두** 가능하다. 서술형에서 **manage/to manage** 둘 다 정답.'],
          ['vocab', '**experienced** — ‘경험 많은, 노련한’. 명사 `experience` 에 `-ed` 가 붙은 형용사다. 반의어 **inexperienced**.'],
        ] },
      { c: [8], en: '((There can be)) [[several pacers]] in a race.',
        ko: '여러 명의 페이서가 있을 수 있다 / 한 경주에.',
        note: '**해석 도움** — `There can be ~` 는 ‘~이 있을 수 있다’. `There is/are` 에 **조동사 can** 이 끼어든 형태다.',
        pts: [
          ['grammar', '**There + 조동사 + be** — 조동사 뒤에는 **동사원형** `be` 가 온다. 주어가 복수여도 `There can are` × → `There can be` ○.'],
          ['reading', '**다음 단락 예고** — 페이서가 **여럿**이라는 정보가 다음 단락의 **속도별 페이서**(`Each pacer runs at different speeds`) 설명으로 이어진다.'],
        ] },
    ],
  },

  /* ─────────────────────────── Ch2 ─────────────────────────── */
  {
    no: 2, type: '요지', answer: 4,
    summary: '페이서들은 저마다 다른 속도로 달려 서로 다른 시간에 경주를 마치고, 보통 자신의 완주 시간을 알리는 깃발이나 풍선을 달고 달려요. 선수들은 목표 완주 시간에 맞춰 페이서를 고를 수 있어요. 예를 들어 4시간 안에 완주하고 싶은 선수는 4시간 페이서를 따라가면 되지요. 페이서가 시간을 계속 챙겨 주니 선수는 목표를 더 쉽게 이룰 수 있어요. 요컨대 페이서는 달리지만 이기려고 달리지 않아요. 다른 사람들을 위해 달리는 거예요.',
    main_idea_en: 'Pacers keep track of time so that runners can reach their target finish time; they run not to win but for others.',
    title_en: 'Pacers Run, but Not to Win',
    illust: `Wide banner close-up still life at the side of a marathon road: a slim metal pole holding a bundle of three
      bright orange helium balloons and a plain blank orange triangular pennant flag, beside it on a small folding
      table a classic silver stopwatch and a neatly folded plain running bib with no printing, the empty asphalt road
      curving away softly out of focus behind. Natural soft diffused daylight, bright overcast sky, high-key exposure,
      low contrast, clean orange and pale grey palette. Crisp product-style editorial photography, shallow depth of
      field. --ar 16:5 --v 8.1 --no race car, tires, mountains, snow, tents, finish arch, ${NEG}`,
    ko: [
      '각각의 페이서는 다른 속도로 달리고 다른 시간에 경주를 마칩니다.',
      '페이서들은 보통 자신의 완주 시간을 보여 주는 깃발이나 풍선을 가지고 있습니다.',
      '선수들은 자신의 목표 완주 시간에 따라 페이서를 선택할 수 있습니다.',
      '예를 들어, 한 선수가 4시간 안에 경주를 마치고 싶다면, 그 선수는 4시간 페이서를 따라갈 것입니다.',
      '페이서가 시간을 계속 파악하기 때문에, 선수는 특정 시간 안에 마라톤을 완주하려는 자신의 목표를 더 쉽게 달성할 수 있습니다.',
      '요컨대, 페이서들은 달리지만 이기기 위해 달리지는 않습니다.',
      '그들은 다른 사람들을 위해 달립니다.',
    ],
    choices: [
      ['Pacers should try their best to win the race.', '마지막에 `they don’t run to win` 이라고 **정반대**로 못 박는다.'],
      ['Runners should not care about their finish time.', '선수들은 **목표 완주 시간에 따라** 페이서를 고른다. 시간은 이 글의 **핵심 기준**이다.'],
      ['Flags and balloons make a marathon fun to watch.', '깃발·풍선은 **완주 시간을 알려 주는 표시**일 뿐, **관람의 재미**와는 관계없다.'],
      ['Pacers help runners reach their target time.', '`the runner can achieve his or her goal ~ more easily` 와 `They run for others` 를 한 줄로 묶은 **요지**다.'],
      ['Only experienced runners can finish in four hours.', '‘4시간’은 페이서 선택을 설명하는 **예시 숫자**다. **누가 완주할 수 있는지**는 말하지 않는다.'],
    ],
    vocab: [
      ['speed', '명', '속도', 'pace, rate', '—', 'speedy 빠른'],
      ['finish', '동', '끝내다, 완주하다', 'complete, end', 'start 시작하다', 'finish time 완주 시간'],
      ['flag', '명', '깃발', 'banner, pennant', '—', '—'],
      ['balloon', '명', '풍선', '—', '—', '—'],
      ['choose', '동', '고르다, 선택하다', 'select, pick', 'reject 거절하다', 'choice 선택'],
      ['depending on', '숙', '~에 따라', 'according to', '—', 'depend 의존하다'],
      ['target', '형·명', '목표(의)', 'goal, aim', '—', 'target finish time 목표 완주 시간'],
      ['follow', '동', '따라가다', 'go after', 'lead 이끌다', 'follower 추종자'],
      ['keep track of', '숙', '~을 계속 파악하다, 놓치지 않다', 'monitor, check', 'lose track of 놓치다', 'track 자취'],
      ['achieve', '동', '달성하다, 이루다', 'reach, accomplish', 'fail 실패하다', 'achievement 성취'],
      ['goal', '명', '목표', 'aim, target', '—', '—'],
      ['particular', '형', '특정한', 'specific, certain', 'general 일반적인', 'particularly 특히'],
      ['in short', '숙', '요컨대, 간단히 말해', 'in brief, to sum up', '—', '—'],
    ],
    flow: [
      ['⏱️', '페이서는 속도가 다 다르다', '**Each pacer** 로 시작해 페이서마다 **속도와 완주 시간이 다르다**고 설명한다. 깃발·풍선은 그 **완주 시간을 알리는 표시**다.'],
      ['🎯', '선수는 목표 시간으로 페이서를 고른다', '**depending on their target finish time** — 선택의 기준은 **목표 완주 시간**이다. 앞 단락의 ‘여러 명의 페이서’가 왜 필요한지가 여기서 풀린다.'],
      ['4️⃣', '예시 — 4시간 페이서', '**For example, if ~** 로 ‘4시간 안에 완주하고 싶다면 4시간 페이서를 따른다’는 **구체적 상황**을 든다. **Since** 절이 그 효과(목표를 더 쉽게 달성)를 설명한다.'],
      ['🤝', '결론 — 남을 위해 달린다', '**In short** 로 정리한다. 페이서는 **달리지만 이기려고 달리지 않는다** — **They run for others.** 가 이 단락의 **요지 문장**이다.'],
    ],
    cards: [
      { c: [1, 2], en: '[[Each pacer]] runs at different speeds and finishes the race in different times. / Pacers usually have flags or balloons {{showing their finish time}}.',
        ko: '각각의 페이서는 다른 속도로 달리고 / 다른 시간에 경주를 마친다. / 페이서들은 보통 깃발이나 풍선을 가지고 있다 / 자신들의 완주 시간을 보여 주는.',
        note: '**해석 도움** — `showing their finish time` 이 앞의 `flags or balloons` 를 **뒤에서 꾸민다**. ‘완주 시간을 **보여 주는** 깃발이나 풍선’.',
        pts: [
          ['grammar', '**each + 단수명사 + 단수동사** — `Each pacer runs ~ and finishes ~`. `each` 뒤에는 **단수명사**, 동사도 **단수형**(-s)이다. 두 동사가 `and` 로 병렬.'],
          ['grammar', '**현재분사의 후치 수식** — `balloons showing ~` = `balloons **which(that) show** ~`. 분사가 **목적어 등 다른 말을 달고 길어지면** 명사 **뒤**에 둔다.'],
          ['vocab', '**usually** — 빈도부사. **일반동사 앞, be동사·조동사 뒤**에 둔다(`Pacers usually have`).'],
        ] },
      { c: [3, 4], en: 'Runners can choose a pacer {{depending on}} their target finish time. / For example, ((if a runner wants)) to finish the race in four hours, the runner [[will follow]] the four-hour pacer.',
        ko: '선수들은 페이서를 선택할 수 있다 / 자신들의 목표 완주 시간에 따라. / 예를 들어, 한 선수가 4시간 안에 경주를 마치고 싶다면, / 그 선수는 4시간 페이서를 따라갈 것이다.',
        note: '**해석 도움** — `four-hour pacer` 에서 하이픈으로 묶인 `four-hour` 는 **형용사**다. 그래서 `hours` 가 아니라 **단수 hour**.',
        pts: [
          ['grammar', '**조건의 부사절 — 현재시제가 미래를 대신** — `if a runner wants ~` 는 미래 상황이지만 **현재형**. 주절은 `will follow`. `if ~ will want` ×.'],
          ['grammar', '**〈수사-명사〉 복합 형용사** — `a four-hour pacer`, `a ten-year-old boy` 처럼 하이픈으로 묶어 명사 앞에 쓰면 명사는 **단수형**을 쓴다.'],
          ['vocab', '**depending on** — ‘~에 따라’. `according to` 와 비슷하지만 `depending on` 은 **조건에 따라 달라짐**을 강조한다.'],
        ] },
      { c: [5], en: '((Since)) the pacer {{keeps track of}} the time, / the runner can achieve [[his or her goal]] {{of finishing}} the marathon in a particular time more easily.',
        ko: '페이서가 시간을 계속 파악하기 때문에, / 선수는 자신의 목표를 더 쉽게 달성할 수 있다 / 특정 시간 안에 마라톤을 완주하려는.',
        note: '**해석 도움** — `his or her goal of finishing ~` 에서 `of` 는 **동격**이다. ‘~을 완주하려는 **그 목표**’. `goal` 의 **내용**을 `of + 동명사` 가 풀어 준다.',
        pts: [
          ['grammar', '**이유의 접속사 since** — 여기서 `since` 는 ‘~이래로’가 아니라 **‘~ 때문에’**(= `because`, `as`). 뒤 절이 **현재시제**이고 시점이 없으니 이유로 읽는다.'],
          ['grammar', '**전치사 + 동명사** — `of finishing` 처럼 **전치사 뒤 동사는 -ing**. 동격 `of` 로 앞 명사 `goal` 의 내용을 설명한다.'],
          ['vocab', '**keep track of** — ‘~을 계속 파악하다, 놓치지 않다’. 반대는 `lose track of`(~을 놓치다, 잊다).'],
        ] },
      { c: [6, 7], en: '((In short)), pacers run ((but)) they don’t run [[to win]]. / They run {{for others}}.',
        ko: '요컨대, 페이서들은 달리지만 / 이기기 위해 달리지는 않는다. / 그들은 다른 사람들을 위해 달린다.',
        note: '**해석 도움** — `to win` 은 **목적**을 나타내는 to부정사로 ‘이기기 위해’. 부정문이므로 ‘이기려고 달리는 것은 **아니다**’로 옮긴다.',
        pts: [
          ['grammar', '**to부정사의 부사적 용법(목적)** — `run to win` = ‘이기기 위해 달리다’. `in order to win` 으로 바꿔 쓸 수 있다.'],
          ['vocab', '**in short** — 앞 내용을 **요약**하는 연결어. `in brief`, `to sum up` 과 같다. 이 표현 뒤 문장이 곧 **요지**다.'],
          ['reading', '**run 의 반복과 대조** — `run / don’t run to win / run for others` 로 같은 동사를 세 번 써서 **달리는 목적의 차이**를 선명하게 보여 준다.'],
        ] },
    ],
  },

  /* ─────────────────────────── Ch3 ─────────────────────────── */
  {
    no: 3, type: '제목', answer: 1,
    summary: '대부분의 자동차 경주에서는 자동차와 레이서만 보이지만, 레이서 뒤에는 피트 크루라는 팀이 있어요. 피트는 경주 트랙 옆에 있는 공간으로, 레이서들은 경주 중 이곳에 여러 번 멈춰요. 피트 크루의 주된 일은 차를 점검하고 타이어를 교체하는 것인데, 빠른 속도의 경주에서는 타이어가 쉽게 닳기 때문에 특히 중요하지요. 피트 스톱은 짧게는 2초이고 크루는 많게는 20명이라, 완벽한 조화를 이루며 일해야 해요. 그래서 사람들은 “경주의 우승은 피트에서 이루어진다.”라고 말해요.',
    main_idea_en: 'Behind every race car driver is a pit crew whose fast, perfectly coordinated work can decide the race.',
    title_en: 'Races Are Won in the Pits',
    illust: `Wide banner photograph of a clean empty motor racing pit lane: a sleek unmarked single-seater race car in
      glossy red parked in its pit box with its front wheels removed, neat stacks of new black racing tires wrapped
      in plain grey tire warmers, pneumatic wheel guns hanging from overhead hoses, a spotless painted floor with
      marked lines, open garage door behind. Natural soft diffused daylight, bright overcast sky, high-key exposure,
      low contrast, crisp red, black and white palette. Sharp editorial motorsport photography. --ar 16:5 --v 8.1
      --no drivers, mechanics, helmets, balloons, flags, mountains, snow, tents, sponsor decals, ${NEG}`,
    ko: [
      '여러분은 대부분의 자동차 경주에서 자동차와 레이서만 볼지도 모르지만, 그 레이서 뒤에는 팀이 있습니다.',
      '이 팀은 피트 크루라고 불립니다.',
      '피트는 경주 트랙의 옆에 있는 공간이며, 레이서들은 경주 도중에 그곳에 여러 번 멈춥니다.',
      '피트 크루의 주된 일은 자동차를 점검하고 타이어를 교체하는 것입니다.',
      '빠른 속도의 경주에서는 타이어가 쉽게 닳기 때문에 타이어를 교체하는 것이 특히 중요합니다.',
      '피트 스톱은 짧게는 2초밖에 안 될 수 있고, 한 크루에 많게는 20명의 구성원이 있습니다.',
      '그러므로 피트 크루는 완벽한 조화를 이루며 일해야 합니다.',
      '레이서가 모든 주목을 받을지도 모르지만, 사람들이 말하듯이 “경주의 우승은 피트에서 이루어집니다.”',
    ],
    choices: [
      ['Races Are Won in the Pits', '마지막 인용문을 그대로 살린 제목. **보이지 않는 피트 크루의 팀워크가 승부를 가른다**는 글 전체를 담는다.'],
      ['How to Become a Race Car Driver', '레이서가 **되는 방법**은 없다. 레이서는 **주목받는 쪽**으로만 언급된다.'],
      ['Why Tires Last So Long', '본문은 반대로 타이어가 **쉽게 닳는다**(`wear out easily`)고 말한다.'],
      ['The Long History of Car Racing', '자동차 경주의 **역사**는 다루지 않는다.'],
      ['Drivers Who Win All Alone', '`there is a team behind the driver` — 레이서 **혼자** 이기는 것이 아니라는 글과 **정반대**다.'],
    ],
    vocab: [
      ['race', '명·동', '경주(하다)', 'contest, compete', '—', 'racer 경주자 / racing 경주'],
      ['driver', '명', '(자동차 경주) 레이서, 운전자', 'racer', '—', 'drive 운전하다'],
      ['crew', '명', '(함께 일하는) 팀, 승무원', 'team, staff', '—', 'pit crew 피트 크루'],
      ['track', '명', '경주로, 트랙', 'course, circuit', '—', 'race track 경주 트랙'],
      ['main', '형', '주된, 주요한', 'chief, major', 'minor 사소한', 'mainly 주로'],
      ['check', '동', '점검하다, 확인하다', 'inspect, examine', '—', 'checkup 점검'],
      ['tire', '명', '타이어', '—', '—', '—'],
      ['especially', '부', '특히', 'particularly', '—', 'special 특별한'],
      ['wear out', '숙', '닳다, 해지다', 'wear down', '—', 'worn-out 닳아 해진'],
      ['as short as', '숙', '짧게는 ~밖에 안 되는', '—', 'as long as 길게는', '원급 강조'],
      ['as many as', '숙', '많게는 ~나 되는', 'up to', 'as few as 적게는', '원급 강조'],
      ['member', '명', '구성원, 일원', 'part', '—', 'membership 회원 자격'],
      ['therefore', '부', '그러므로', 'so, thus', '—', '—'],
      ['harmony', '명', '조화, 화합', 'unity, teamwork', 'conflict 갈등', 'harmonious 조화로운'],
    ],
    flow: [
      ['🏎️', '보이는 것과 보이지 않는 것', '**You may only see the car and the driver** — 관중 눈에 보이는 것을 먼저 말하고, **but** 으로 **레이서 뒤의 팀**을 끌어낸다. 1단락의 ‘숨은 조력자’ 구도를 그대로 반복한다.'],
      ['🔧', '피트와 피트 크루의 정의', '**피트**는 트랙 옆 공간, 레이서가 **경주 중 여러 번 멈추는 곳**이다. 크루의 주된 일은 **차 점검과 타이어 교체**.'],
      ['🛞', '왜 타이어 교체가 중요한가', '**because** 절로 이유를 든다 — **빠른 경주에서 타이어가 쉽게 닳기** 때문이다.'],
      ['⚡', '2초·20명 → 완벽한 조화 → 승부', '**as short as 2 seconds**, **as many as 20 members** — 숫자로 긴박함을 보여 주고 **Therefore** 로 ‘완벽한 조화’가 필요함을 끌어낸다. 인용문 **Races are won in the pits** 가 결론이다.'],
    ],
    cards: [
      { c: [1, 2], en: 'You [[may only see]] the car and the driver during most car races, / ((but)) there is a team {{behind the driver}}. / This team [[is called]] a pit crew.',
        ko: '여러분은 자동차와 레이서만 볼지도 모른다 / 대부분의 자동차 경주 동안, / 하지만 레이서 뒤에는 팀이 있다. / 이 팀은 피트 크루라고 불린다.',
        note: '**해석 도움** — `may` 는 여기서 **허가**가 아니라 **추측(~일지도 모른다)**. ‘자동차와 레이서만 **볼지도 모르지만**’으로 **양보**처럼 읽힌다.',
        pts: [
          ['grammar', '**may ~, but ...** — ‘~일지도 모르지만 …이다’. 상대의 생각을 **일단 인정**하고 **but** 뒤에 **진짜 하고 싶은 말**을 둔다. 마지막 문장 `The driver may get ~, but ~` 과 **같은 틀**이다.'],
          ['grammar', '**수동태 be called + 명사** — `This team is called a pit crew.` = ‘피트 크루라고 **불린다**’. 능동태 `People call this team a pit crew.` 의 목적격 보어가 그대로 남았다.'],
          ['vocab', '**during + 명사** — ‘~ 동안’. 뒤에 **명사(구)**가 온다(`during most car races`). **절**이 오면 `while`.'],
        ] },
      { c: [3, 4], en: 'A pit is a place {{on the side of}} the race track, / and drivers stop there [[several times]] during a race. / The main job of the pit crew is ((to check)) the car and ((change)) the tires.',
        ko: '피트는 경주 트랙 옆에 있는 공간이다, / 그리고 레이서들은 경주 도중 그곳에 여러 번 멈춘다. / 피트 크루의 주된 일은 자동차를 점검하고 타이어를 교체하는 것이다.',
        note: '**해석 도움** — `to check the car and change the tires` 에서 `change` 앞의 `to` 가 **생략**되었다. `to check ~ and (to) change ~` 의 **병렬**이다.',
        pts: [
          ['grammar', '**to부정사 보어의 병렬** — `is to check ~ and change ~`. `and` 로 이어지는 두 번째 to부정사는 `to` 를 흔히 **생략**한다. `changing` ×(형태 불일치).'],
          ['grammar', '**주어가 긴 문장의 수 일치** — 주어의 핵심은 `The main job`(단수) → 동사 `is`. `of the pit crew` 는 꾸밈말이다.'],
          ['vocab', '**several times** — ‘여러 번’. `time` 이 **횟수**를 뜻할 때는 **셀 수 있는 명사**라 복수형 `times`.'],
        ] },
      { c: [5], en: '[[Changing the tires]] is especially important / ((because)) the tires {{wear out}} easily in a high speed race.',
        ko: '타이어를 교체하는 것은 특히 중요하다 / 타이어가 쉽게 닳기 때문에 / 빠른 속도의 경주에서는.',
        note: '**해석 도움** — 주어는 `Changing the tires`(타이어를 교체하는 것). 동명사 주어는 **단수** 취급이라 `are` 가 아니라 `is`.',
        pts: [
          ['grammar', '**동명사 주어 + 단수동사** — `Changing the tires is ~`. `tires` 가 복수라고 `are` 를 쓰면 **오답**. 서술형 수 일치 단골이다.'],
          ['grammar', '**because + 절 / because of + 명사** — `because the tires wear out` 은 **절**. 명사만 오면 `because of the high speed` 처럼 쓴다.'],
          ['vocab', '**wear out** — ‘닳다, 해지다’. 자동사로도 타동사로도 쓴다. 형용사 `worn-out`(닳아 해진).'],
        ] },
      { c: [6, 7], en: 'A pit stop can be [[as short as]] 2 seconds, / and there are [[as many as]] 20 members on a crew. / ((Therefore)), the pit crew {{has to}} work in perfect harmony.',
        ko: '피트 스톱은 짧게는 2초밖에 안 될 수 있다, / 그리고 한 크루에 많게는 20명의 구성원이 있다. / 그러므로, 피트 크루는 완벽한 조화를 이루며 일해야 한다.',
        note: '**해석 도움** — `as short as 2 seconds` 는 ‘2초**만큼 짧은**’이 아니라 ‘**짧게는 2초**밖에 안 되는’. 숫자 앞 `as ~ as` 는 **그 수가 놀랍다**는 강조다.',
        pts: [
          ['grammar', '**as + 형용사 + as + 수사(강조)** — `as many as 20`(무려 20명이나), `as short as 2 seconds`(겨우 2초). 비교가 아니라 **수치 강조**로 해석한다.'],
          ['grammar', '**has to + 동사원형** — ‘~해야 한다’(의무). 주어가 3인칭 단수(`the pit crew`)라 `has to`. 과거는 `had to`, 부정 `doesn’t have to`는 ‘~할 필요 없다’.'],
          ['reading', '**Therefore = 결과** — 시간은 **짧고** 인원은 **많다** → 그러므로 **완벽한 조화**가 필요하다. 원인 두 개에서 결론 하나를 끌어낸다.'],
        ] },
      { c: [8], en: 'The driver [[may get]] all the attention, / ((but)) {{as people say}}, “Races are won in the pits.”',
        ko: '레이서가 모든 주목을 받을지도 모른다, / 하지만 사람들이 말하듯이, / “경주의 우승은 피트에서 이루어진다.”',
        note: '**해석 도움** — `as people say` 의 `as` 는 **‘~하듯이, ~처럼’**. 뒤의 인용문이 **널리 알려진 말**임을 알려 준다.',
        pts: [
          ['grammar', '**접속사 as(~하듯이)** — `as people say`, `as you know`, `as you can see` 처럼 **말·앎의 동사**와 짝을 이룬다.'],
          ['grammar', '**수동태 are won** — 경주는 **이기는 대상**이므로 `Races are won`(경주는 **이겨진다** → 승부가 난다). 능동태로는 `Teams win races in the pits.`'],
          ['reading', '**인용으로 마무리** — 제목 문제의 **정답 근거**. 레이서가 주목받지만 **승부는 피트 크루가 가른다**는 이 단락의 결론을 한 문장으로 요약한다.'],
        ] },
    ],
  },

  /* ─────────────────────────── Ch4 ─────────────────────────── */
  {
    no: 4, type: '내용일치', answer: 5,
    summary: 'Sherpa라는 말은 네팔 동쪽에 사는 셰르파족에서 왔어요. 셰르파는 등반 기술이 뛰어나고 산의 지리를 잘 알며, 높은 산에서도 숨 쉬는 데 어려움이 거의 없어요. 그래서 등산가들은 에베레스트산 등반을 도와줄 셰르파를 고용하기 시작했지요. 셰르파는 등산가들을 정상까지 이끌고, 텐트를 치고 가방을 나르는 등 여러 방식으로 도와요. 하지만 사람들은 흔히 정상에 선 등산가들만 찍힌 사진을 보기 때문에, 셰르파는 종종 에베레스트의 보이지 않는 사람들이라 불려요.',
    main_idea_en: 'Sherpas, skilled climbers from eastern Nepal, guide and support Everest climbers, yet remain invisible in the summit photos.',
    title_en: 'Sherpas: The Invisible People of Mount Everest',
    illust: `Wide banner photograph of a high Himalayan base camp on a clear morning: a row of bright yellow and orange
      expedition tents pitched on a snowy rocky ridge, large packed climbing backpacks, coiled ropes and ice axes
      resting neatly beside the tents, a line of colorful prayer flags stretched between poles, and the majestic
      snow-covered pyramid peak of Mount Everest rising against a clean pale blue sky in the distance. Natural soft
      diffused daylight, bright hazy sky, high-key exposure, low contrast, crisp white snow with yellow and blue
      accents. Epic editorial mountain photography, sharp detail. --ar 16:5 --v 8.1 --no climbers, porters, race car,
      tires, balloons, marathon, ${NEG}`,
    ko: [
      'Sherpa라는 단어는 셰르파족에서 유래하는데, 그들은 네팔의 동쪽 지역에 삽니다.',
      '셰르파들은 훌륭한 등반 기술을 가지고 있으며 산의 지리를 잘 압니다.',
      '그들은 또한 산의 높은 곳에서 호흡하는 데 어려움이 거의 없습니다.',
      '그래서 등산가들은 자신들이 에베레스트산을 오르는 것을 도와줄 셰르파를 고용하기 시작했습니다.',
      '셰르파들은 등산가들을 산 정상까지 이끕니다.',
      '그들은 여러 방식으로 등산가들을 지원합니다.',
      '예를 들어, 그들은 텐트를 치고 등산가들의 가방을 나릅니다.',
      '사람들은 흔히 산 정상에 있는 등산가들만 찍힌 사진을 보기 때문에, 셰르파들은 종종 에베레스트산의 보이지 않는 사람들이라고 불립니다.',
    ],
    choices: [
      ['셰르파족은 네팔의 서쪽 지역에 산다.', '본문은 `the eastern part of Nepal`, 즉 **동쪽** 지역이라고 한다.'],
      ['셰르파는 높은 산에서 숨 쉬는 데 어려움을 많이 겪는다.', '`have little difficulty breathing` — `little` 은 **‘거의 없는’**이다. 어려움이 **거의 없다**는 뜻이므로 정반대다.'],
      ['셰르파는 산 정상에서 찍힌 사진에 자주 등장한다.', '사람들이 보는 것은 `a picture of only the climbers`, **등산가들만** 찍힌 사진이다. 그래서 셰르파가 **보이지 않는 사람들**로 불린다.'],
      ['등산가들이 셰르파를 위해 텐트를 쳐 준다.', '텐트를 치는 쪽은 **셰르파**다(`they put up tents`). 주체가 **뒤바뀌었다**.'],
      ['셰르파는 등산가들의 가방을 들어 주며 그들을 돕는다.', '`they put up tents and carry climbers’ bags` 와 일치한다.'],
    ],
    vocab: [
      ['come from', '숙', '~에서 유래하다, ~ 출신이다', 'originate from', '—', '—'],
      ['tribe', '명', '부족, 종족', 'clan, people', '—', 'tribal 부족의'],
      ['eastern', '형', '동쪽의', 'east', 'western 서쪽의', 'east 동쪽'],
      ['skill', '명', '기술, 솜씨', 'ability, technique', '—', 'skilled 숙련된'],
      ['know one’s way around', '숙', '(장소의) 지리를 잘 알다', 'be familiar with', 'get lost 길을 잃다', '—'],
      ['have difficulty (in) -ing', '숙', '~하는 데 어려움을 겪다', 'have trouble -ing', '—', 'difficult 어려운'],
      ['breathe', '동', '숨 쉬다, 호흡하다', 'inhale', '—', 'breath 숨(명사)'],
      ['hire', '동', '고용하다', 'employ', 'fire 해고하다', '—'],
      ['climb', '동', '오르다, 등반하다', 'go up, ascend', 'descend 내려가다', 'climber 등산가'],
      ['support', '동', '지원하다, 돕다', 'help, assist', 'oppose 반대하다', 'supportive 지원하는'],
      ['put up', '숙', '(텐트 등을) 치다, 세우다', 'set up, pitch', 'take down 걷다', '—'],
      ['carry', '동', '나르다, 운반하다', 'bring, transport', 'drop 떨어뜨리다', 'carrier 운반인'],
      ['invisible', '형', '보이지 않는', 'unseen, hidden', 'visible 보이는', 'visible 보이는'],
    ],
    flow: [
      ['🏔️', '이름의 유래 — 셰르파족', '**The word Sherpa comes from ~** 로 이름부터 설명한다. 셰르파족은 **네팔 동쪽**에 산다.'],
      ['💪', '셰르파의 강점 세 가지', '① **훌륭한 등반 기술** ② **산의 지리를 잘 앎** ③ **높은 곳에서도 숨쉬기 어려움이 거의 없음**. **Therefore** 로 등산가들이 이들을 **고용하게 된 이유**를 연결한다.'],
      ['🎒', '셰르파가 하는 일', '등산가들을 **정상까지 이끌고**, **텐트를 치고 가방을 나르는** 등 여러 방식으로 **지원**한다. For example 이 추상(support)을 구체(tents, bags)로 바꾼다.'],
      ['👻', '보이지 않는 사람들', '정상 사진에는 **등산가들만** 찍혀 있다. 그래서 셰르파는 **invisible people** — 1단락의 ‘숨은 조력자(hidden people)’라는 과의 주제로 되돌아온다.'],
    ],
    cards: [
      { c: [1], en: 'The word Sherpa [[comes from]] the Sherpa tribe, / {{which lives}} in the eastern part of Nepal.',
        ko: 'Sherpa라는 단어는 셰르파족에서 유래한다, / 그리고 그들은 네팔의 동쪽 지역에 산다.',
        note: '**해석 도움** — 콤마 뒤 `which` 는 **계속적 용법**이다. 앞에서부터 **‘…에서 유래하는데, 그 부족은 ~에 산다’**로 이어서 해석한다.',
        pts: [
          ['grammar', '**관계대명사의 계속적 용법 , which** — 선행사 `the Sherpa tribe` 에 **덧붙여 설명**한다. `, and it lives ~` 로 바꿔 쓸 수 있다. 계속적 용법에는 **that 을 쓸 수 없다**.'],
          ['grammar', '**집합명사 tribe + 단수동사** — `tribe` 를 **하나의 집단**으로 보아 `lives`. 선행사의 수에 동사를 맞추는 **관계절 수 일치** 문제로 나온다.'],
          ['vocab', '**come from** — ‘~에서 유래하다, ~ 출신이다’. 늘 **현재시제**로 쓰는 점이 특징(`I come from Korea.`).'],
        ] },
      { c: [2, 3], en: 'Sherpas have good climbing skills and {{know their way around}} the mountains well. / They also [[have little difficulty breathing]] high up in the mountains.',
        ko: '셰르파들은 훌륭한 등반 기술을 가지고 있고 / 산의 지리를 잘 안다. / 그들은 또한 숨 쉬는 데 어려움이 거의 없다 / 산의 높은 곳에서.',
        note: '**해석 도움** — `little` 은 셀 수 없는 명사 앞에서 **‘거의 없는’**(부정의 뜻). `a little difficulty`(약간의 어려움)와 **뜻이 반대**다.',
        pts: [
          ['grammar', '**have difficulty (in) + -ing** — ‘~하는 데 어려움을 겪다’. `breathing` 은 **동명사**. `have difficulty to breathe` ×. `have trouble -ing` 도 같은 틀.'],
          ['grammar', '**little vs. a little** — `little` = 거의 없는(부정), `a little` = 약간 있는(긍정). 셀 수 있는 명사라면 `few / a few`.'],
          ['vocab', '**know one’s way around** — ‘(장소)의 지리를 잘 알다, 훤하다’. 소유격이 주어에 맞춰 `their way` 로 바뀌었다.'],
        ] },
      { c: [4], en: '((Therefore)), mountain climbers [[started to hire]] Sherpas {{to help them climb}} Mount Everest.',
        ko: '그래서, 등산가들은 셰르파를 고용하기 시작했다 / 자신들이 에베레스트산을 오르는 것을 돕도록.',
        note: '**해석 도움** — `to help them climb ~` 은 **목적**(~을 돕도록)으로 읽는다. `them` = 등산가들, `climb` 은 `help` 의 목적격 보어(동사원형).',
        pts: [
          ['grammar', '**start + to부정사 / 동명사** — `started to hire` = `started hiring`. `start`, `begin`, `like` 는 **둘 다** 목적어로 취하며 뜻 차이가 거의 없다.'],
          ['grammar', '**help + 목적어 + 동사원형** — `help them climb`. 1단락의 `help other runners manage` 와 **같은 구조**. `to climb` 도 가능.'],
          ['reading', '**Therefore = 앞 강점의 결과** — 기술·지리·호흡이라는 **세 가지 강점**이 **고용**이라는 결과로 이어진다.'],
        ] },
      { c: [5, 6, 7], en: 'Sherpas [[lead]] mountain climbers {{to the top of}} the mountain. / They support climbers in many ways. / ((For example)), they [[put up]] tents and carry climbers’ bags.',
        ko: '셰르파들은 등산가들을 산 정상까지 이끈다. / 그들은 여러 방식으로 등산가들을 지원한다. / 예를 들어, 그들은 텐트를 치고 등산가들의 가방을 나른다.',
        note: '**해석 도움** — `climbers’ bags` 는 **복수 소유격**. `-s` 로 끝나는 복수명사는 **아포스트로피(’)만** 붙인다.',
        pts: [
          ['grammar', '**복수명사의 소유격** — `climbers’`(등산가들의), `the players’`. 단수는 `a climber’s bag`. **어포스트로피 위치**가 단·복수를 구별한다.'],
          ['vocab', '**put up** — ‘(텐트를) 치다, (건물을) 세우다, (게시물을) 붙이다’. 텐트를 **걷다**는 `take down`.'],
          ['reading', '**일반 → 구체** — `support ~ in many ways`(추상) → `For example` → `put up tents, carry bags`(구체). 내용일치 문제의 **정답 근거 문장**이다.'],
        ] },
      { c: [8], en: 'Sherpas [[are often called]] the invisible people of Mount Everest / ((because)) people often see {{a picture of only the climbers}} at the top of the mountain.',
        ko: '셰르파들은 종종 에베레스트산의 보이지 않는 사람들이라고 불린다 / 사람들이 흔히 등산가들만 찍힌 사진을 보기 때문에 / 산 정상에 있는.',
        note: '**해석 도움** — `a picture of only the climbers` 는 **‘등산가들만 찍힌 사진’**. `only` 가 `the climbers` 를 한정해 **셰르파는 빠져 있다**는 뜻을 만든다.',
        pts: [
          ['grammar', '**5형식 수동태 be called + 명사** — 능동 `People often call Sherpas the invisible people ~` 의 목적어가 주어로 나오고, 목적격 보어 `the invisible people` 은 **동사 뒤에 그대로** 남는다.'],
          ['grammar', '**빈도부사 often의 위치** — `are often called`(be동사 뒤), `people often see`(일반동사 앞). 한 문장에 두 위치가 다 나온다.'],
          ['reading', '**과 전체의 주제 회귀** — `invisible people` 은 1단락의 `hidden` 과 같은 말이다. 페이서·피트 크루·셰르파 모두 **보이지 않지만 중요한 사람들**이다.'],
        ] },
    ],
  },
];
