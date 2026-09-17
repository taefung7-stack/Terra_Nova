/* ===================================================================
 * 목일중3 동아(이병민) — 교과서 원문 독립 전사본 (검수 기준)
 * ===================================================================
 * ★ 이 파일은 `_SOURCE-L{6,7,8}.js` 와 **독립된 전사본**이다.
 *   사용자 제공 교과서 PDF(EXAM4YOU 본문 분석지)에서 다시 옮겨 적었다.
 *
 * 왜 따로 두는가 — `_SOURCE` 를 기준으로 검수하면 **전사 단계에서 이미
 * 빠진 문장은 영원히 못 잡는다**(자체 정합성만 맞아 보인다).
 * 중2 동아윤 L5 에서 마지막 2문장이 조용히 누락된 사고가 실제로 있었다.
 * 그래서 교과서 원문을 별도 기준으로 들고 대조한다.
 *
 * 전사 규칙
 *   · 본문(영어)만 싣는다. 우측 한글 해석 단은 싣지 않는다.
 *   · 각주(* humpback whale: … 등)는 본문 문장이 아니므로 제외.
 *   · 교과서 표기 그대로(곱슬따옴표 “ ” ’, Jørn 의 ø, 이탤릭 기사 제목).
 *   · 문단(본문 1~4) 경계를 그대로 유지한다.
 * =================================================================== */

export const TEXTBOOK = {
  L6: {
    title: 'Lesson 6 · Make the World Beautiful — Nature Meets City',
    paragraphs: [
      { no: 1, sentences: [
        "Have you heard of the expression, “Art imitates nature”?",
        "Many artists get their ideas and inspirations from the world around them.",
        "This is because the natural world is a beautiful place.",
        "The shapes in nature are very pleasing to the eye.",
        "For example, look at the egg on the left.",
        "Isn’t it beautiful?",
        "It is round and delicate, yet strong enough to protect its contents.",
        "Can you imagine a building that looks like an egg?",
        "Such a building actually exists in London.",
      ]},
      { no: 2, sentences: [
        "Nature has inspired many architects around the world.",
        "This is the Sagrada Familia in Spain.",
        "It is one of the most famous churches in the world.",
        "Look at the beautiful tall columns inside the church.",
        "They look like trees, don’t they?",
        "The famous architect, Antoni Gaudi, used the shape of trees in the Sagrada Familia.",
        "That’s how he brought the beauty of nature indoors.",
      ]},
      { no: 3, sentences: [
        "In the first two examples, we can easily see what inspired the architect.",
        "But in the next example from Australia, this is not so obvious.",
        "Jørn Utzon, the architect of the Sydney Opera House, took a shape from nature and added his imagination.",
        "Can you guess what inspired him?",
        "Many people think that it is the waves in the ocean or a sailing boat.",
        "But interestingly, the inspiration came from an orange.",
        "Look at the roof closely.",
        "Can you see the peels of an orange?",
        "When orange lights are shone on the building, you can see the peels more clearly.",
      ]},
      { no: 4, sentences: [
        "What about Korea?",
        "Have you ever been to Dongdaemun Design Plaza in Seoul?",
        "Many people think that the building looks like a giant spaceship.",
        "But the architect, Zaha Hadid, took the curved lines from nature so that city people could enjoy them.",
        "Thanks to its special design, it has become a popular tourist attraction in Seoul.",
        "As you can see, many buildings try to capture the beauty of nature in their design.",
        "They are perfect examples of “Nature meets city.”",
        "If you were an architect, what would you choose from nature?",
      ]},
    ],
  },

  L7: {
    title: 'Lesson 7 · Feel the Wonder — Under the Sea',
    paragraphs: [
      { no: 1, sentences: [
        "Two-thirds of our planet is covered by oceans.",
        "They are full of wonder and are home to millions of species.",
        "Every day, we are learning new things about them.",
        "Let’s find out about some interesting sea animals.",
      ]},
      { no: 2, sentences: [
        "Can you guess what these whales are doing in the picture?",
        "It looks like they are standing up in a group.",
        "But they are actually sleeping!",
        "Humpback whales stand on their tails while they sleep.",
        "They sleep near the surface.",
        "Since they are not fish, they need to come up to breathe.",
        "Also, they don’t fall asleep completely.",
        "When they wake up, they come out of the water for a deep breath and dive back into the sea.",
      ]},
      { no: 3, sentences: [
        "If you think fish are not smart, take a look at the tuskfish.",
        "This small fish whose favorite food is clams uses a tool to open them.",
        "Clams usually hide under the sand, so they cannot be easily discovered.",
        "The tuskfish blows on the sand until a clam appears.",
        "The clam is closed tightly, so the fish cannot eat it.",
        "But the tuskfish doesn’t give up.",
        "It smashes the clam against a rock.",
        "In the end, the clam opens and dinner is served.",
      ]},
      { no: 4, sentences: [
        "You have probably seen a bird fly down to the sea to catch a fish.",
        "But have you ever seen a fish jump out of the water to catch a bird?",
        "Well, birds have to be careful when a giant trevally is around.",
        "This fish can grow up to 170cm and 80kg.",
        "But don’t let its size fool you.",
        "This fish is quick and smart.",
        "It can spot a flying bird and calculate its speed and distance.",
        "When the bird flies nearby, the giant trevally jumps out of the water and catches it.",
      ]},
    ],
    /* 각주 — 본문 문장이 아니다(어휘 주석). 누락 검사 대상에서 제외. */
    footnotes: [
      "* humpback whale: 혹등고래라고 불리며, 북극해를 제외한 모든 대양에서 서식한다.",
      "* tuskfish: 놀래깃과의 물고기로 서태평양과 인도양에서 주로 서식한다.",
      "* giant trevally: 전갱잇과의 물고기로 서태평양과 인도양에서 서식한다.",
    ],
    /* 소제목 — 본문 문장이 아니다. */
    headings: ['Sweet Dreams', 'Enjoy Your Meal', 'One, Two, Three, Jump!'],
  },

  L8: {
    title: 'Lesson 8 · Up to You — How Will You Be Remembered?',
    paragraphs: [
      { no: 1, sentences: [
        "It was just a normal morning.",
        "Alfred Nobel sat in his chair to read the newspaper.",
        "While he was drinking his coffee, a headline caught his eye: The Merchant of Death, Alfred Nobel, Is Dead.",
        "“What? What is this?”",
        "Reading the article, he dropped his cup in surprise.",
        "His coffee spilled all over his clothes and desk, but he couldn’t take his eyes off the newspaper.",
      ]},
      { no: 2, sentences: [
        "The article was about his own death!",
        "It said Nobel had died in France from a heart attack.",
        "“Oh my goodness! Am I dead?”",
        "Catching his breath, Nobel kept reading.",
        "Soon, he became even more shocked.",
        "The article described him as the inventor of dynamite and other dangerous objects for war.",
        "It said that he had become rich from the deaths of others.",
        "He couldn’t believe his eyes.",
        "It was true that dynamite was one of his many inventions.",
        "But he never imagined that the world would think of him as “the merchant of death.”",
      ]},
      { no: 3, sentences: [
        "Nobel was deeply disappointed.",
        "“How could this be?",
        "This is unbelievable!",
        "I’m not a merchant of death.",
        "I want to be remembered in a different way.",
        "I want to be remembered as a person who made the world better.”",
        "He decided to change people’s opinions about him.",
      ]},
      { no: 4, sentences: [
        "In 1888, a French newspaper mistakenly reported Alfred Nobel’s death.",
        "The person who had actually died was his brother, Ludvig.",
        "Thanks to the report, however, Nobel decided to do something to contribute to the world.",
        "In 1895, he decided to use his money to create the Nobel Prize.",
        "Originally, there were only five awards.",
        "A sixth award was added in 1968.",
        "Today, when we think of Alfred Nobel, we think of the Nobel Prize, rather than dynamite.",
      ]},
    ],
  },
};
