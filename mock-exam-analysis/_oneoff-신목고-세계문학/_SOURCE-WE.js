/* ===================================================================
 * 신목고 2학년 2학기 기말고사 — 세계문화 "World Englishes" 원문 정본 (ground truth)
 * ===================================================================
 * 교과서 단원 "Language: Insights into Diversity" pp.92~99 전사 (지도서 스캔 사진 8장).
 * 유닛 ID 는 WE(World Englishes). 중간고사 U1~U3 와 구분하기 위해 번호 대신 약어를 쓴다.
 *
 * ★ 이 파일은 원문이므로 임의 수정 금지. 오탈자 발견 시 교과서 재확인 후에만 수정.
 *
 * 구조: U3 처럼 댓글·블로그 없는 단순 산문(shape: 'plain').
 *   Ch1 = 도입 두 문단(영어의 확산 → World Englishes 와 Kachru 의 Expanding Circle)
 *   Ch2~6 = 지역별 영어(British / American / Australian / South Asian / African)
 *   Ch7 = 맺음말
 *
 * ┌─ 전사 시 확인한 함정 ──────────────────────────────────────────┐
 * │ 스캔본이 '지도서' 라 영어 본문 위에 한글 주석이 겹쳐 인쇄돼 있다. │
 * │   · 이탤릭 어휘(분석지 en_html 에서 살림) —                      │
 * │     Dinnae ken, Aye, a wee bit, fell, bairn, a parking lot,     │
 * │     a car park, car, hard, market, realize, realise, koala,     │
 * │     kangaroo, cheerio, hoo-roo, would-be, airdash, Howzit!,     │
 * │     robots, lekker                                              │
 * │   · Ch2 "phrases Dinnae ken, and Aye, a wee bit, for instance"   │
 * │     — Dinnae ken 뒤 쉼표가 원문에 있다                           │
 * │   · Ch4 마지막 문장은 물음표가 인용부호 밖("Yeah, nah"?)         │
 * │   · 서수 16th / 17th / 18th 는 평문 th                           │
 * │   · Ch2 머리의 말풍선 "Dinnae ken!" 은 삽화 장식이라 본문 아님    │
 * └────────────────────────────────────────────────────────────────┘
 *
 * ── 전사 규칙 (U1~U3 와 동일) ──────────────────────────────────
 *  · 큰따옴표는 곡선 따옴표를 곧은 따옴표(")로 정규화한다.
 *  · 문장 단위로 하나씩. 서식(이탤릭)은 여기서 표현하지 않는다.
 *
 *      node _oneoff-신목고-세계문학/verify-source.mjs WE
 * =================================================================== */

export const SOURCE = [
  {
    no: 1,
    subtitle: 'World Englishes (Intro)',
    part: 'INTRO',
    page: 'p.92~93',
    sentences: [
      "English has been a global language for centuries.",
      "English mostly spread by migration from Britain to places such as Australia, New Zealand, and North America.",
      "Colonialism also played a role in countries including India, Nigeria, and the Philippines.",
      "Nowadays, the varieties of English are countless, and they have their own characteristics since languages evolve to fulfill the diverse needs of the societies that use them.",
      "The multiple varieties of English thus developed have given rise to \"World Englishes.\"",
      "World Englishes include not just the varieties of English spoken in countries like Britain and the United States where English is the first language of most people.",
      "They also include the varieties used in nations such as India, Singapore, and Kenya, in which English is an official language in education, business, and government.",
      "Additionally, the term \"World Englishes\" covers varieties spoken in the Expanding Circle as described by Braj Kachru.",
      "They include English varieties spoken in countries like Korea, Mexico, and China, where English is used primarily as a foreign language for international communication.",
      "In these Expanding Circle countries, English is often used for communication between speakers whose native languages are different.",
      "Let's explore some of the most prominent World Englishes.",
    ],
  },
  {
    no: 2,
    subtitle: 'British English',
    part: 'BRITISH',
    page: 'p.94',
    sentences: [
      "British English refers to the varieties that exist in the United Kingdom (UK).",
      "When you think of how \"standard\" British English sounds, you are probably thinking of Received Pronunciation (RP).",
      "RP is the most well-known British accent because of its prominence in the media and its usage by famous figures, such as the King.",
      "Variants of English in the UK include Welsh English, Scots English, and Hiberno-English.",
      "These varieties have been heavily influenced by the languages spoken in their respective regions, resulting in a situation in which even British individuals sometimes find it hard to understand each other.",
      "Take the Scots English phrases Dinnae ken, and Aye, a wee bit, for instance.",
      "Did you know they mean, \"I don't know,\" and \"Yes, a little bit,\" respectively?",
      "In Northern England, the Vikings have left a lasting impact, with words like fell meaning \"hill\" and bairn meaning \"child.\"",
    ],
  },
  {
    no: 3,
    subtitle: 'American English',
    part: 'AMERICAN',
    page: 'p.95',
    sentences: [
      "American English is the name given to the varieties spoken in the United States of America (USA) and Canada.",
      "Since the 16th century, when the British brought the English language with them, the USA and Canada have become melting pots with linguistic influences from all over the globe.",
      "People from around the world brought their own languages with them.",
      "These have influenced standard American English as we know it today.",
      "American English is often contrasted with British English, and many differences between the two are noted in vocabulary, pronunciation, and spelling.",
      "For example, a parking lot in American English is called a car park in British English.",
      "In pronunciation, the letter \"r\" is pronounced in words like car, hard, or market in American English, whereas it remains silent in British English.",
      "Also, American English tends to use the letter \"z\" rather than the letter \"s,\" which is common in British English, as in realize vs. realise.",
    ],
  },
  {
    no: 4,
    subtitle: 'Australian English',
    part: 'AUSTRALIAN',
    page: 'p.96',
    sentences: [
      "English came to Australia in the 18th century.",
      "Australian English uses features from both British and American English.",
      "However, Australian English does have many of its own distinct features.",
      "When British settlers first arrived, many new words had to be created to describe the unique plants and animals in Australia, such as koala and kangaroo.",
      "Australian English has evolved over time and now includes many words and phrases unique to the country.",
      "Comparable to the British cheerio, hoo-roo is used by Australians to say goodbye.",
      "Some phrases may be puzzling since Australians love to shorten things.",
      "An example is the phrase, \"Yeah, nah.\"",
      "This phrase is confusing, but Australians think: why bother saying, \"Yes, I understand you, but still disagree,\" when you could simply say, \"Yeah, nah\"?",
    ],
  },
  {
    no: 5,
    subtitle: 'South Asian English',
    part: 'SOUTH ASIAN',
    page: 'p.97',
    sentences: [
      "South Asian English refers to the varieties used in countries including India, Pakistan, and Sri Lanka.",
      "English was introduced to the Indian subcontinent in the early 17th century and reinforced by long-term British rule.",
      "English is still used as an official language in some of the countries in the region.",
      "For example, India has kept English as an official language even after it became independent since the country has hundreds of native languages aside from Hindi.",
      "The most popular variety of South Asian English is Indian English with about 125 million speakers.",
      "It is sometimes called \"Hinglish,\" a mix of Hindi and English.",
      "Indian English typically adds English words to Hindi; however, the meanings can change over time.",
      "For instance, would-be in Indian English means \"a fiancé\" or \"a fiancée,\" while airdash is the word for \"travel hastily by plane.\"",
    ],
  },
  {
    no: 6,
    subtitle: 'African English',
    part: 'AFRICAN',
    page: 'p.98',
    sentences: [
      "While African English can refer to English spoken anywhere within Africa, the term is typically reserved for Sub-Saharan Africa.",
      "Today, 27 countries on the continent recognize English as an official language.",
      "South African English is a major variety of African English.",
      "English has been an official language in South Africa since the British arrived in 1795.",
      "Many languages present in the nation have dramatically influenced the variety of English used there.",
      "For one, South African English has some colorful words and phrases.",
      "For instance, when they meet someone, they might say Howzit! instead of \"Hello, how's it going?\"",
      "Traffic lights in South Africa are called robots, and lekker means \"nice.\"",
      "English speakers from other countries are sometimes confused when a South African says, \"I'll do it just now.\"",
      "That does not mean that they will do it now.",
      "It actually means they might do it sometime in the future.",
    ],
  },
  {
    no: 7,
    subtitle: 'A Language for Everyone (Closing)',
    part: 'CLOSING',
    page: 'p.99',
    sentences: [
      "As we have seen, English has spread across the globe more extensively than any other language, becoming the primary medium of international and intercultural communication.",
      "The process has given rise to countless varieties of English, known as World Englishes.",
      "The English language belongs not only to its native speakers but also to its diverse non-native users worldwide.",
      "It truly has become a language for everyone!",
    ],
  },
];
