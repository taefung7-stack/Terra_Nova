/* ===================================================================
 * 신목고 2학년 2학기 기말고사 — 세계문화 "Culture in Idioms" 원문 정본 (ground truth)
 * ===================================================================
 * 교과서 단원 "Language: Insights into Diversity"(Unit 3) pp.104~108 전사 (지도서 스캔 사진 5장, 2026-11-26).
 * WE(World Englishes, pp.92~99) 다음 지문. 유닛 ID 는 WI(World Idioms) — WE 합본을 건드리지 않도록 분리했고,
 * 완성 PDF 만 사용자 요청대로 dist/WE/ 에 둔다(combine.mjs WI 의 out 경로).
 *
 * ★ 이 파일은 원문이므로 임의 수정 금지.
 *
 * 구조: 단순 산문(shape: 'plain'). 교과서 문단 = 챕터.
 *   Ch1 p.104  동물에 대한 문화별 인식 차이(쥐·원숭이)            7문장
 *   Ch2 p.105  쉽게 짐작되는 동물 관용구(악어·물고기)             10문장
 *   Ch3 p.106  짐작하기 어려운 관용구(쥐·닭)                      8문장
 *   Ch4 p.107  같은 특성, 다른 동물(고집·건망증·위장)              6문장
 *   Ch5 p.108  두 동물이 나오는 관용구(고양이와 쥐·개와 원숭이)   6문장
 *   Ch6 p.108  관용구의 기원(스웨덴 "얼음 위에 소가 없다")        4문장
 *
 * ┌─ 전사 시 확인한 것 ───────────────────────────────────────────┐
 * │ · 지도서라 한글 주석·밑줄이 겹쳐 있다 — 띠 단위 확대로 재판독.   │
 * │ · Ch2 "just as easily—to feel" 은 em dash(—), 앞뒤 공백 없음.   │
 * │ · Ch5 'to attempt … for personal gain'. — 작은따옴표, 마침표는   │
 * │   닫는 따옴표 밖.                                               │
 * │ · Ch6 마지막 문장은 물음표가 인용부호 밖(…to worry"?).          │
 * │ · 콤마는 인용부호 안("…factory," / "very nervous," 등).         │
 * └────────────────────────────────────────────────────────────────┘
 * 전사 규칙(WE 와 동일): 곡선 따옴표 → 곧은 따옴표(" ')로 정규화. 문장 단위.
 *
 *      node _oneoff-신목고-세계문학/verify-source.mjs WI
 * =================================================================== */

export const SOURCE = [
  {
    no: 1,
    subtitle: 'Culture in Idioms (Intro)',
    part: 'INTRO',
    page: 'p.104',
    sentences: [
      "Human beings have inhabited the earth with all kinds of animals for a long time.",
      "Since people in different parts of the world experience the animal kingdom in their own environments, they perceive and treat animals differently.",
      "For instance, rats are commonly seen as something to be avoided in many societies, whereas they are considered holy in Indian culture.",
      "As a matter of fact, there is even an unusual temple for rats in India where tens of thousands of rats welcome visitors.",
      "Monkeys present another cultural difference.",
      "In Spanish culture, monkeys are animals to be adored because they are considered pretty.",
      "However, in German and American cultures, monkeys are often associated with qualities such as ugliness and foolishness.",
    ],
  },
  {
    no: 2,
    subtitle: 'Easy-to-Guess Animal Idioms',
    part: 'EASY IDIOMS',
    page: 'p.105',
    sentences: [
      "Human perceptions of animals indeed differ from culture to culture.",
      "Such dissimilar perceptions are clearly mirrored in human languages, particularly in the form of animal-based idioms.",
      "Just like other idioms that can pose difficulty for language learners, animal idioms can also be a potential source of difficulty.",
      "However, not all animal-related idioms are equally challenging.",
      "Some of them can be easily understood based on common sense and general knowledge.",
      "Take, for example, the idiom \"like a crocodile in a wallet factory,\" commonly used in Puerto Rico.",
      "How would a crocodile feel if it were waiting to be killed and skinned for wallets?",
      "It would definitely feel \"very nervous,\" and that is exactly what the idiom means.",
      "What about idioms such as \"to be like a fish in water\" and \"to be like a fish out of water,\" which are used in Korea, as well as in Spain, Germany, and many other Western countries?",
      "You can guess their meanings just as easily—to feel secure and insecure, respectively.",
    ],
  },
  {
    no: 3,
    subtitle: 'Hard-to-Guess Animal Idioms',
    part: 'HARD IDIOMS',
    page: 'p.106',
    sentences: [
      "However, there are many animal-related idioms from around the world whose meanings are quite hard to guess.",
      "These idioms can be confusing to language learners because the same animal can stand for different ideas.",
      "Let us consider rats first.",
      "In Germany, Spain, and the USA, the idiom \"to be a rat\" is used to refer to someone who is dishonest, someone who is extremely stingy, and someone who runs away from a possibly dangerous situation, respectively.",
      "Another example that shows cultural diversity is the idiom \"to be a chicken.\"",
      "In many Western cultures, chickens often stand for someone who is cowardly or afraid of taking action.",
      "In the USA, the idiom \"chicken out\" is often used to describe someone who intends to do something but eventually does not do it out of fear.",
      "In Egypt, however, chickens are perceived to be useful and valuable, and thus \"to have chickens\" means \"to have a secure income.\"",
    ],
  },
  {
    no: 4,
    subtitle: 'Same Idea, Different Animals',
    part: 'SAME IDEA',
    page: 'p.107',
    sentences: [
      "In many cases, the same idea or quality is expressed using idioms containing different animals as well.",
      "For instance, stubbornness is expressed by donkeys in German, mules in English, and cows in Korean.",
      "Forgetfulness, which is another common human trait, is portrayed using various animal metaphors in different cultures.",
      "In Spanish, \"to have the memory of a fish\" means that someone is forgetful, while \"to have a bird's brain\" conveys the same idea in the USA.",
      "Human beings sometimes disguise themselves to appear nice or kind.",
      "In Japan, \"to wear a cat on one's head\" means \"to pretend to be nice with one's true self hidden,\" while in many Western cultures \"a wolf in sheep's clothing\" describes someone who has a friendly appearance, hiding their true harmful intentions.",
    ],
  },
  {
    no: 5,
    subtitle: 'Idioms with Two Animals',
    part: 'TWO ANIMALS',
    page: 'p.108',
    sentences: [
      "Some idioms include not just one animal but two.",
      "They often reflect the kind of relationship the animals maintain in the natural world.",
      "For example, Americans say \"to play cat and mouse with someone\" to mean 'to attempt to defeat someone by tricking that person for personal gain'.",
      "Both animals also appear in German and Spanish idioms, symbolizing hostility between two people.",
      "In Korea, on the other hand, a similar idea is expressed through the idiom \"a dog-and-monkey relationship.\"",
      "The idiom describes a hostile relationship between two individuals, similar to the perceived hostility between dogs and monkeys in the natural world.",
    ],
  },
  {
    no: 6,
    subtitle: 'Where Do Idioms Come From? (Closing)',
    part: 'CLOSING',
    page: 'p.108',
    sentences: [
      "You may wonder how all these idioms came into being.",
      "In many cases, it is next to impossible to trace and explain their exact origins.",
      "There are interesting ideas and guesses, though.",
      "Why don't you try to figure out how the Swedish idiom \"there is no cow on the ice\" came to mean \"there is no need to worry\"?",
    ],
  },
];
