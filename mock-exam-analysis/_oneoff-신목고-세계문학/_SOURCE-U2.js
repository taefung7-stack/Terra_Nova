/* ===================================================================
 * 신목고 2학년 2학기 중간고사 — 세계문학 Unit 2 원문 정본 (ground truth)
 * ===================================================================
 * 교과서 pp.24~29 "A French Student in Dublin" 을 전사하는 자리다.
 * 문장 누락 검증의 기준이 되는 파일이므로, 반드시 교과서 실물을 보고 채운다.
 *
 * ★ 이 파일은 원문이므로 임의 수정 금지. 오탈자 발견 시 교과서 재확인 후에만 수정.
 *
 * Unit 2 — Cross-Cultural Encounters / A French Student in Dublin
 * PART 1~4 각각의 본문 뒤에 Delphine's Blog 1~4 가 붙는 구조.
 * (U1 의 '게시글 + 댓글 2개' 와 구조가 다르다 — verify.mjs 의 flatten 규칙도 다르다)
 *
 * ┌─ 전사 전 반드시 읽을 것 ────────────────────────────────────────┐
 * │ 이 유닛의 스캔본은 '지도서' 라 영어 본문 위에 한글 주석이 겹쳐   │
 * │ 인쇄돼 있다. 아래 자리는 특히 오독하기 쉬우니 교과서 실물로       │
 * │ 확인할 것 (feedback_textbook_transcription_traps):                │
 * │   · PART 1 의 아일랜드어 인사말과 그 괄호 안 영어 뜻             │
 * │   · PART 2 의 대화문 — 따옴표 안 구두점, 물음표/느낌표           │
 * │   · PART 3 의 프랑스어 음식명 이탤릭 표기                        │
 * │   · 문장 조용한 누락 — 사진과 1문장씩 대조하며 채울 것           │
 * └────────────────────────────────────────────────────────────────┘
 *
 * ── 전사 규칙 (U1 과 동일) ──────────────────────────────────────
 *  · 큰따옴표는 교과서의 곡선 따옴표(“ ”)를 곧은 따옴표(")로 정규화한다.
 *    (verify.mjs 의 norm() 이 어느 쪽이든 흡수하므로 둘 다 통과하지만,
 *     파일 안에서는 곧은 따옴표로 통일한다)
 *  · 문장 단위로 하나씩 배열 원소에 넣는다. 약어 마침표(p.m. 등)에서
 *    문장을 쪼개지 않도록 주의한다 — 이 지문에는 p.m. 이 실제로 등장한다.
 *  · 이탤릭·볼드 등 서식은 여기서 표현하지 않는다(원문 텍스트만).
 *    서식은 분석지 JSON 의 en_html 에서 입힌다.
 *
 * ── 채우는 방법 ────────────────────────────────────────────────
 *  아래 각 챕터의 sentences / blog.sentences 배열에 교과서 문장을
 *  순서대로 넣는다. 배열을 채운 뒤 반드시 검증기를 돌린다.
 *
 *      node _oneoff-신목고-세계문학/verify-source.mjs U2
 *
 *  검증기는 빈 슬롯이 남아 있으면 어디가 비었는지 알려주고 차단한다.
 * =================================================================== */

export const SOURCE = [
  {
    no: 1,
    subtitle: 'Delphine arrives at the O\'Briens',
    part: 'PART 1',
    page: 'p.24~25',
    /* 도입부(p.24 상단, Meeting people from different cultures ~ 로 시작하는
     * 문단)를 이 챕터 맨 앞에 이어서 넣었다. 그 다음에 PART 1 본문이 온다. */
    sentences: [
      // 도입부 (p.24)
      "Meeting people from different cultures helps us develop understanding of other cultures and cultural awareness.",
      "We can discover similarities and differences between cultures and have more meaningful interactions with people around us.",
      "We can also build our respect and empathy for other people, and celebrate our differences as well as our similarities.",
      "In March, Delphine Froissart travelled from Lyon, France, to Dublin, Ireland, to spend two weeks with the O'Briens.",
      "She wanted to practise her English, but she also wanted to broaden her horizons by living abroad.",
      // PART 1 본문 (p.25)
      "Ms. O'Brien and her eldest son Dara met Delphine at Dublin Airport.",
      "On their drive home, it drizzled, cleared, and suddenly rained heavily.",
      "It was like having all four seasons in just an hour.",
      "Although quite new to Delphine, the changeable weather did not bother her as a cheerful Irish folk song “The Irish Rover” was playing on the radio.",
      "The car stopped at a cosy terraced house.",
      "Inside, Delphine met two younger boys and two younger girls.",
      "They looked shy and a little nervous.",
      "“Dia duit! (= Hello!) Is mise Delphine. (= I am Delphine.),” the guest said in Irish.",
      "They smiled shyly and replied awkwardly, “Deas bualadh leat! (= Nice to meet you.).”",
      "After greeting each other in Irish, they felt closer.",
      "Delphine unpacked her luggage and gave presents to Ms. O'Brien and the children.",
    ],
    blog: {
      title: 'Delphine\'s Blog 1',
      handle: '@Del_phine',
      sentences: [
        "Finally arrived in Ireland.",
        "Somehow everything is different and new here!",
        "Ireland has fairly mild weather all year round for the most part.",
        "However, dressing for a day trip here can be a little tricky.",
        "You might wake up to glorious sunshine but end up facing a dramatic downpour by lunchtime, so the key is to be ready for anything.",
        "Wear plenty of thin layers so you can add or remove clothes as necessary, and carry an umbrella.",
        "One more thing: English is the primary language in Ireland.",
        "The nation also has its own language, Irish.",
        "Road signs are generally in both English and Irish languages.",
      ],
    },
  },
  {
    no: 2,
    subtitle: 'Delphine\'s first day at school',
    part: 'PART 2',
    page: 'p.26',
    sentences: [
      "Delphine woke up with a shock to a beeping sound.",
      "She was excited because this was her first day at school in Dublin.",
      "She was in Dara's class because they were both 16.",
      "The whole house was very hectic in the morning.",
      "All the kids rushed to get ready for school, with Ms. O'Brien checking that they had not gone back to sleep.",
      "Ms. O'Brien had a school uniform for Delphine.",
      "It suited her well although Dara had to help her with the school tie.",
      "Delphine was both delighted and nervous on the way to school.",
      "When they arrived, some of Dara's friends looked at Delphine and smiled.",
      "“Is this your girlfriend, Dara?” one of them asked.",
      "“I'm not his girlfriend!” Delphine quickly replied, feeling a bit embarrassed.",
      "Dara looked embarrassed, too.",
      "After that, the rest of the school day went smoothly except during the lunch break.",
      "Delphine was surprised to find students eat at their desks.",
      "Many kids asked Delphine about life in France.",
      "She didn't understand everything, but it was fun.",
    ],
    blog: {
      title: 'Delphine\'s Blog 2',
      handle: '@Del_phine',
      sentences: [
        "Today I was at school.",
        "Dara's friends thought I was his girlfriend. :)",
        "I learned a few things.",
        "Uniforms are normal in Irish schools—with ties worn by both male and female pupils.",
        "Also, unlike in my school back home, students in most schools here bring their lunch and eat in the classroom, at their desks.",
        "The lunch break lasts an hour, just half of the two-hour break I have for lunch at school in France!",
        "It was a fun day.",
      ],
    },
  },
  {
    no: 3,
    subtitle: 'After school',
    part: 'PART 3',
    page: 'p.27',
    sentences: [
      "It was a long day at school.",
      "Lessons finished at 4 p.m., and they got home at 5 p.m.",
      "“Hi, Delphine,” called Ms. O'Brien.",
      "“It's tea time.”",
      "“Tea time?” Delphine asked Dara.",
      "“But I'm starving, not thirsty!”",
      "Dara smiled.",
      "“Don't worry.",
      "'Tea' means dinner in Ireland.”",
      "“Guess what's for tea,” Ms. O'Brien said to Delphine with a smile.",
      "“We're having potato gratin with saucisson sec and cheese.",
      "I thought the dish with French saucisson sec and Irish potatoes would be great.”",
      "Ms. O'Brien had cooked a gratin with layers of potato-saucisson mixture topped with cheese slices, breadcrumbs, and a large spoonful of butter.",
      "“Good appetite,” Delphine said—Dara's brothers chuckled.",
      "“Did I say something wrong?” Delphine asked.",
      "“No,” Dara answered.",
      "“We understood, but we don't say, 'Good appetite.'",
      "We say, 'Enjoy your meal.'”",
      "“Oh! Enjoy your meal,” Delphine said.",
      "After the meal, Dara discussed some things they could do over the weekend.",
      "Delphine was looking forward to seeing some of the sights of Dublin.",
    ],
    blog: {
      title: 'Delphine\'s Blog 3',
      handle: '@Del_phine',
      sentences: [
        "Wednesday evening Ms. O'Brien cooked potato gratin with saucisson sec and cheese.",
        "I enjoyed the simple meal, and the potatoes were delicious.",
        "I'm glad Ms. O'Brien did not serve snails or frogs' legs as I'm French—it's a stereotype about the French, and young people like me dislike both foods. :)",
      ],
    },
  },
  {
    no: 4,
    subtitle: 'St. Patrick\'s Day',
    part: 'PART 4',
    page: 'p.28~29',
    sentences: [
      "The day before Delphine left, the O'Briens and Delphine visited Dublin's city centre to enjoy St. Patrick's Day.",
      "Ms. O'Brien explained that St. Patrick was the patron saint of Ireland who brought Christianity to the country in the 5th century, and that the Irish people celebrate their heritage and culture on March 17th, the anniversary of the saint's death.",
      "In the city centre, people wore green clothes with four-leaf clover-shaped pins and glasses.",
      "There were green rubber statues of St. Patrick, and streets were decorated with green banners.",
      "Dara said that green symbolises St. Patrick, and that green is one of the three colours in the Irish flag.",
      "When the St. Patrick's Day parade started at noon, many bands including traditional bagpipers marched along the winding streets of the Irish capital, entertaining Dubliners and tourists lining the parade route.",
    ],
    blog: {
      title: 'Delphine\'s Blog 4',
      handle: '@Del_phine',
      sentences: [
        "Today, there was a sea of green everywhere.",
        "No wonder that Ireland is called the Emerald Island!",
        "After the parade, Ms. O'Brien and Dara took me to St. Patrick's Cathedral across the river.",
        "At the cathedral, Dara took a picture of me standing by the monument of Jonathan Swift, the famous author of Gulliver's Travels.",
        "With four Nobel Prize winners, numerous book festivals, and a world-class city library, it isn't surprising that Dublin is a UNESCO City of Literature.",
      ],
    },
  },
];

/* ── 전사 완료 체크리스트 (2026-09-08 전사 완료) ──────────────────
 *  1) node _oneoff-신목고-세계문학/verify-source.mjs U2
 *     → ✅ 오류 0 · 경고 0 (총 83문장)
 *  2) 챕터별 문장 수 — 다음 사람이 대조할 기준
 *
 *     | Ch | PART 본문 | Blog | 계 |
 *     |----|-----------|------|----|
 *     | 1  |    16     |  9   | 25 |   ← 도입 5문장 포함 (PART 1 본문만 11)
 *     | 2  |    16     |  7   | 23 |
 *     | 3  |    21     |  3   | 24 |
 *     | 4  |     6     |  5   | 11 |
 *     |합계|    59     | 24   | 83 |
 *
 *  ※ 폴더 README 초안은 도입부를 4문장으로 적었으나 실제 원문은 5문장이다
 *    (Meeting people… / We can discover… / We can also build… /
 *     In March, Delphine Froissart… / She wanted to practise…).
 *
 *  ※ Ch3 PART 3 은 대화문이 많아 문장 수가 21로 가장 많다. 따옴표로
 *    닫히는 문장(”)과 4 p.m. 같은 약어 마침표가 몰려 있는 구간이므로
 *    수정 시 verify-source.mjs 를 반드시 다시 돌릴 것.
 *
 *  3) 그 다음에야 분석지 JSON 의 passage 를 채운다(verify.mjs 가 대조).
 * ─────────────────────────────────────────────────────────────── */
