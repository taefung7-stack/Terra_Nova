/* ===================================================================
 * 신서고 부교재 — 상관접속사/병렬 4지문 원문 정본 (EX2)
 * ===================================================================
 * 사용자 제공 이미지(문제집)에서 verbatim 전사. ★ 임의 수정 금지.
 * 각 지문은 원문의 문제 유형을 그대로 유지한다(빈칸 / 빈칸 / 어법 / 어휘).
 *
 * 원문 번호(srcNo)는 문제집의 문항 번호 — 1 / 3 / 5 / 7.
 * 네 지문 모두 상관접속사(either A or B, both A and B, not just A but also B,
 * not only A but also B) 와 병렬 구조가 굵게 표시돼 있는 것이 공통 문법 포인트다.
 * =================================================================== */

export const SOURCE = [
  {
    no: 1,
    srcNo: 1,
    type: '빈칸',
    question: '다음 빈칸에 들어갈 말로 가장 적절한 것은?',
    subtitle: '웃음이 농담을 더 웃기게 만든다 — 빈칸추론',
    footnote: '*dad joke: 어설픈 농담, 아재 개그',
    sentences: [
      "In a scientific study, 72 people were asked to listen to “dad jokes.”",
      "After each joke, there was either no laughter, fake laughter, or real laughter.",
      "The participants then rated how funny the jokes were.",
      "Jokes with no laughter didn't get high ratings.",
      "Jokes followed by fake laughter were rated 10 percent funnier.",
      "And jokes followed by real laughter were rated 20 percent funnier.",
      "This study shows that both real and fake laughter make a big difference in how funny we find jokes.",
      "It suggests that we pay close attention not just to a joke's content but also to the reaction it gets.",
      "This is because we get ready to smile or laugh when we hear someone else laughing.",
      "Essentially, laughter not only makes jokes funnier but also brings people together.",
      "This highlights laughter's ________________ nature.",
    ],
    choices: [
      { no: 1, en: 'cooperative and cultural' },
      { no: 2, en: 'logical and mathematical' },
      { no: 3, en: 'personal and humorous' },
      { no: 4, en: 'emotional and unreasonable' },
      { no: 5, en: 'social and contagious' },
    ],
    answer: 5,
  },
  {
    no: 2,
    srcNo: 3,
    type: '빈칸',
    question: '다음 빈칸에 들어갈 말로 가장 적절한 것은?',
    subtitle: '자율주행차와 사이버 보안 — 빈칸추론',
    footnote: '*transmission: (자동차) 변속기',
    sentences: [
      "There will soon be many self-driving cars with internet access on the road.",
      "Although these cars have many benefits, experts warn that having more self-driving cars also means having ________________.",
      "Researchers recently proved through a demonstration that even today's “smart” cars are vulnerable.",
      "They used a computer to take control of a car while someone else was driving it.",
      "They were not only able to change the radio's volume, adjust the air conditioner, and switch the windshield wipers on, but they were also able to take control of the transmission and stop the car as it was driving down the highway.",
      "Fortunately, it was just a demonstration, but it sends a clear message to both the auto industry and the government: automotive cybersecurity is a real issue that must be taken seriously.",
    ],
    choices: [
      { no: 1, en: 'more accidents on highways' },
      { no: 2, en: 'more unemployed car mechanics' },
      { no: 3, en: 'more potential targets for hackers' },
      { no: 4, en: 'more traffic jams during rush hour' },
      { no: 5, en: 'more incidents of automobile theft' },
    ],
    answer: 3,
  },
  {
    no: 3,
    srcNo: 5,
    type: '어법',
    question: '다음 글의 밑줄 친 부분 중, 어법상 틀린 것은?',
    subtitle: 'NASA의 무중력 훈련 비행 — 어법',
    sentences: [
      "Astronauts feel weightless when they travel outside our planet's atmosphere because the speed of a spacecraft in orbit balances the force of Earth's gravitational pull.",
      "In fact, you may have experienced a similar feeling when riding a roller coaster.",
      "As the roller coaster car climbs up the track, gravity pulls your body downward, and you feel yourself pushing down on your seat.",
      "However, when the car rushes down, your body hangs in the air until it is pulled down by your safety belt.",
      "Using this phenomenon, NASA prepares its astronauts for space travel.",
      "The astronauts fly in an aircraft that ascends to an altitude of 24,000 feet, and once the aircraft dives down, the passengers experience about 20 to 25 seconds of weightlessness.",
      "These flights help astronauts get used to the environment of space, and they allow NASA to conduct experiments and test equipment in a similar environment as well.",
    ],
    /* 밑줄 5개 — 원문에서 ①~⑤ 로 표시된 대상. ③ pushing 이 정답(틀린 것).
     * you feel yourself (③) down on your seat
     *   지각동사 feel + 목적어(yourself) + 목적격보어.
     *   중력이 몸을 '누르는' 것이므로 yourself 는 누름을 '당하는' 대상 →
     *   목적격보어는 과거분사 pushed 여야 한다. 능동 pushing 은 틀림.
     * ⑤ test 는 정답이 아님 — allow NASA to [conduct ... and test ...] 로
     *   to conduct 와 병렬을 이루는 원형이라 어법상 맞다. */
    underlines: [
      { no: 1, text: 'balances' },
      { no: 2, text: 'may have experienced' },
      { no: 3, text: 'pushing' },
      { no: 4, text: 'once' },
      { no: 5, text: 'test' },
    ],
    answer: 3,
  },
  {
    no: 4,
    srcNo: 7,
    type: '어휘',
    question: '다음 글의 밑줄 친 부분 중, 문맥상 낱말의 쓰임이 적절하지 않은 것은?',
    subtitle: '이메일 보내는 시금치 — 어휘',
    footnote: '*nitroaromatic: 질화방향족',
    sentences: [
      "While you're unlikely to receive an email from a vegetable, it's not impossible.",
      "A team of engineers placed special devices in spinach plants that emit a signal when they sense nitroaromatic compounds in the soil.",
      "These components are commonly found in explosives.",
      "The signal causes a small computer to send an email to the engineers.",
      "The goal of this study was to find out if spinach could hide explosives, but the technology involved has broader potential.",
      "It is possible that it can be used to help scientists gather vital information about environmental conditions.",
      "The engineers believe plants have the ability to predict upcoming droughts, as well as more subtle changes in soil and water, as they grow.",
      "They could also be useful in detecting pollution and combating climate change.",
    ],
    /* 밑줄 5개 — ③ hide 가 정답(문맥상 부적절: detect 여야 함). */
    underlines: [
      { no: 1, text: 'emit' },
      { no: 2, text: 'send' },
      { no: 3, text: 'hide' },
      { no: 4, text: 'gather' },
      { no: 5, text: 'subtle' },
    ],
    answer: 3,
  },
];
