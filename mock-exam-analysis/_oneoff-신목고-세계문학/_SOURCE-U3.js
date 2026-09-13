/* ===================================================================
 * 신목고 2학년 2학기 중간고사 — 세계문학 Unit 3 원문 정본 (ground truth)
 * ===================================================================
 * 교과서 pp.58~63 "Noodle Dishes from Around the World" 전사.
 * 문장 누락 검증의 기준이 되는 파일이므로, 반드시 교과서 실물을 보고 채운다.
 *
 * ★ 이 파일은 원문이므로 임의 수정 금지. 오탈자 발견 시 교과서 재확인 후에만 수정.
 *
 * Unit 3 — Flavors of the World / Noodle Dishes from Around the World
 * U1(게시글+댓글), U2(PART 본문 + 블로그) 와 달리 이 유닛은 **단순 산문**이다.
 * 각 챕터 = 한 나라의 면 요리를 소개하는 한 덩어리 글(shape: 'plain').
 *
 * ┌─ 전사 시 확인한 함정 ──────────────────────────────────────────┐
 * │ 이 유닛의 스캔본도 '지도서' 라 영어 본문 위에 한글 주석이 겹쳐   │
 * │ 인쇄돼 있다. 아래 자리를 특히 주의해 대조했다                    │
 * │ (feedback_textbook_transcription_traps):                        │
 * │   · 이탤릭 외국어·요리명 — macaroni, lasagna, spaghetti,         │
 * │     pho, pho bo, pho ga, rishta, ghee, Eid al-Fitr,             │
 * │     haram, halal, creole, sopa criolla                          │
 * │   · 이탈리아어 속담 "A tavola non si invecchia" 와 그 영어 뜻    │
 * │   · 서수 표기 17th / 20th (교과서는 th 를 위첨자로 인쇄)         │
 * │   · Ch1 마지막 문장(Now, shall we ~)은 p.58 본문에 포함          │
 * │   · Ch5 는 p.63 맺음말 — 짧지만 독립된 문단이다                  │
 * └────────────────────────────────────────────────────────────────┘
 *
 * ── 전사 규칙 (U1·U2 와 동일) ──────────────────────────────────
 *  · 큰따옴표는 교과서의 곡선 따옴표(“ ”)를 곧은 따옴표(")로 정규화한다.
 *  · 문장 단위로 하나씩 배열 원소에 넣는다. 약어 마침표에서 문장을
 *    쪼개지 않도록 주의한다.
 *  · 이탤릭·볼드 등 서식은 여기서 표현하지 않는다(원문 텍스트만).
 *    서식은 분석지 JSON 의 en_html 에서 입힌다.
 *  · 위첨자 서수(17th, 20th)는 평문 'th' 로 적는다.
 *
 * ── 채우는 방법 ────────────────────────────────────────────────
 *      node _oneoff-신목고-세계문학/verify-source.mjs U3
 * =================================================================== */

export const SOURCE = [
  {
    no: 1,
    subtitle: 'Noodle Dishes from Around the World (Intro)',
    part: 'INTRO',
    page: 'p.58',
    sentences: [
      "Noodles are one of the oldest foods that can be found across cultures.",
      "Though nobody knows for sure who first invented noodles, or even when they were invented, they have been part of the human diet for thousands of years.",
      "Like any other food item, noodles are cooked and enjoyed in different ways in different cultures.",
      "Thus, exploring different noodle dishes from around the world will be a truly learning experience.",
      "Now, shall we begin a short culinary tour from Italy to Peru?",
    ],
  },
  {
    no: 2,
    subtitle: 'Pasta, Italy',
    part: 'PASTA',
    page: 'p.59',
    sentences: [
      "Pasta, typically made of wheat flour, is a staple food in Italian cuisine.",
      "Although it is not certain when people started eating pasta, it is believed that the food originated in Sicily and spread to other parts of Italy in the 17th century.",
      "It comes in a variety of shapes and sizes, each with its own name, such as macaroni, lasagna, and spaghetti.",
      "Spaghetti, one of the most popular types of pasta, is long, thin noodles.",
      "Italians love to cook pasta with their favorite recipes.",
      "Usually, they boil the noodles in a pot, and then prepare a sauce with various ingredients such as olive oil, garlic, chopped vegetables, sliced meat, herbs, and tomatoes.",
      "Regardless of the ingredients used, Italians cherish the saying, \"A tavola non si invecchia,\" which means \"At the table with good friends and family, one does not age.\"",
    ],
  },
  {
    no: 3,
    subtitle: 'Pho, Vietnam',
    part: 'PHO',
    page: 'p.60',
    sentences: [
      "Pho is a Vietnamese rice noodle dish that is typically enjoyed for breakfast across the country.",
      "Vietnam is one of the largest rice-producing countries in the world due to its ideal growing conditions for rice.",
      "No wonder steamed rice is a main staple food in Vietnamese cuisine.",
      "Rice is also made into noodles known as pho, which are served in a bowl of chicken, beef, or seafood broth with a variety of spices and herbs to give it a distinct Vietnamese flavor.",
      "There are various variations of pho depending on the ingredients or the types of broth used.",
      "The two best-known are pho bo served in beef broth, and pho ga in chicken broth.",
      "Pho is believed to have originated in northern Vietnam in the early 20th century and has since become synonymous with Vietnamese cuisine.",
    ],
  },
  {
    no: 4,
    subtitle: 'Rechta, Algeria',
    part: 'RECHTA',
    page: 'p.61',
    sentences: [
      "Rechta is one of the most popular Algerian dishes.",
      "The name originates from the Persian word rishta, which means \"thread\" and generally refers to noodles made of wheat flour.",
      "Rechta is made with thin and flat noodles.",
      "Algerians make the noodles by mixing wheat flour, salt, water, and ghee (clarified butter) together.",
      "The dish also contains ingredients such as chopped meat, onions, garlic, turnips, potatoes, zucchini, and uniquely Algerian spices.",
      "Algerians typically enjoy rechta on festive occasions, including weddings and Eid al-Fitr (the end of Ramadan).",
      "However, it is worth noting that rechta does not contain pork, as it is considered haram (forbidden), not halal (permissible), under Islamic dietary laws.",
    ],
  },
  {
    no: 5,
    subtitle: 'Sopa Criolla, Peru',
    part: 'SOPA CRIOLLA',
    page: 'p.62',
    sentences: [
      "In Peru, people love to have sopa criolla for lunch or dinner.",
      "As a comfort food for Peruvians, it is a staple in many households.",
      "Sopa criolla means \"creole soup,\" and the term creole refers to local people who are usually descendants of European conquerors.",
      "This suggests that Peruvian cuisine has been shaped not just by indigenous ethnic groups but also by foreign settlers.",
      "To make sopa criolla, Peruvians normally use thin noodles, which are often called \"angel hair.\"",
      "Noodles are boiled and usually served in a bowl of beef stock seasoned with garlic, onions, tomato paste, milk, and other ingredients.",
      "The soup is often topped with a fried egg, which makes the dish look and taste delicious to Peruvians of all ages.",
    ],
  },
  {
    no: 6,
    subtitle: 'Noodles Bring Us Together (Closing)',
    part: 'CLOSING',
    page: 'p.63',
    sentences: [
      "Noodle dishes look as diverse as the cultures in which they are enjoyed.",
      "The next time you visit another country, try a noodle dish there and learn about the culture behind it.",
      "As you try out the dish, you will see that all humans have something in common and yet may wonder, \"Why are noodles popular around the world?\"",
    ],
  },
];
