/* ===================================================================
 * 중2 — 2022 개정 동아(윤정미) 중2 Lesson 6 원문 정본
 * ===================================================================
 * 사용자 제공 교과서 본문 PDF 에서 verbatim 전사. ★ 임의 수정 금지.
 * 원문 총 26문장.
 *
 * ⚠️ 문장 분할 주의 — "Dr. Schofield", "Frank W. Schofield", "2 p.m." 의
 * 마침표는 문장 끝이 아니다. 정규식 분할을 쓰면 26문장이 35문장으로
 * 잘못 쪼개진다(실제로 겪음). 이 파일이 정본이다.
 *
 * 앞부분은 극본(대화) 형식이라 화자 라벨(A man / Dr. Schofield)이 붙는다.
 * 라벨은 문장이 아니므로 speaker 필드로 따로 싣고, 본문 문장은 발화
 * 내용만 담는다.
 *
 *   Ch1  A Special Favor (1919년 2월 28일 ~ 3·1절 현장)  11문장
 *   Ch2  Seok Hopil, the Man Who Loved Korea             7문장
 *   Ch3  Telling the World About March 1st               5문장
 *   Ch4  He Never Left Again                             3문장
 *                                                  합계 26문장
 * =================================================================== */

export const SOURCE = [
  {
    no: 1,
    title: 'A Special Favor',
    subtitle: '1919년 2월 28일, 한 남자의 부탁 — 도입(극본)',
    sentences: [
      "On February 28, 1919, a man came to Dr. Schofield's house.",
      "Dr. Schofield, I have a special favor to ask you.",
      "What can I do for you?",
      "Many people are going to gather tomorrow for the independence of Korea.",
      "Could you take pictures of the event and share them with the world?",
      "At 2 p.m. on March 1, Dr. Schofield was hiding in a building and saw a large group of people gathering outside.",
      "He began to take pictures.",
      "Unbelievable!",
      "There are so many people here.",
      "I hope the world will learn about this important event through my pictures.",
      "Do you know Seok Hopil?",
    ],
    /* 각 문장의 화자 — null 이면 지문(내레이션) */
    speakers: [
      null, 'A man', 'Dr. Schofield', 'A man', 'A man',
      null, null, 'Dr. Schofield', 'Dr. Schofield', 'Dr. Schofield',
      null,
    ],
  },
  {
    no: 2,
    title: 'Seok Hopil, the Man Who Loved Korea',
    subtitle: '한국 이름을 사랑한 캐나다 의사 — 전개',
    sentences: [
      "His English name was Frank W. Schofield, but he loved his Korean name.",
      "It sounded similar to his real name, and it also had a good meaning.",
      "Dr. Schofield was a Canadian doctor, and he first came to Korea in 1916 to teach medicine.",
      "He wanted to teach in Korean, so he began to learn Korean right away.",
      "He studied so hard that he was able to teach in Korean after only a few years.",
      "He believed that every country has the right to be independent, so he helped the Korean independence movement.",
      "On March 1, 1919, Dr. Schofield heard people shouting for Korean independence in Tapgol Park.",
    ],
  },
  {
    no: 3,
    title: 'Telling the World About March 1st',
    subtitle: '사진과 기사로 세계에 알리다 — 절정',
    sentences: [
      "He took pictures of the event with his camera.",
      "He then wrote an article about the historic event and sent it to foreign newspapers with his pictures.",
      "Dr. Schofield's fight for Korean independence didn't stop even after the March 1st Movement.",
      "He continued to write about the terrible situation in Korea for foreign newspapers.",
      "He was under the watchful eye of the Japanese police, so he had to go back to Canada in 1920.",
    ],
  },
  {
    no: 4,
    title: 'He Never Left Again',
    subtitle: '다시 돌아온 한국, 그리고 영면 — 마무리',
    sentences: [
      "In 1958, he returned to Korea at the invitation of the Korean government and never left again.",
      "For the rest of his life, he worked hard to help Koreans, especially poor students.",
      "Dr. Schofield died in April 1970, and he was buried in Seoul National Cemetery.",
    ],
  },
];
