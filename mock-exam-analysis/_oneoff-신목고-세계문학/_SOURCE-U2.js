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
     * 4문장)를 이 챕터 맨 앞에 이어서 넣는다. 그 다음에 PART 1 본문이 온다.
     * → sentences = [도입 4문장, PART 1 본문] 순서. */
    sentences: [
      // 도입부 (p.24) — 4문장
      // PART 1 본문 (p.25)
    ],
    blog: {
      title: 'Delphine\'s Blog 1',
      handle: '@Del_phine',
      sentences: [
        // Delphine's Blog 1 (p.25 하단)
      ],
    },
  },
  {
    no: 2,
    subtitle: 'Delphine\'s first day at school',
    part: 'PART 2',
    page: 'p.26',
    sentences: [
      // PART 2 본문 (p.26)
    ],
    blog: {
      title: 'Delphine\'s Blog 2',
      handle: '@Del_phine',
      sentences: [
        // Delphine's Blog 2 (p.26 하단)
      ],
    },
  },
  {
    no: 3,
    subtitle: 'After school',
    part: 'PART 3',
    page: 'p.27',
    sentences: [
      // PART 3 본문 (p.27)
    ],
    blog: {
      title: 'Delphine\'s Blog 3',
      handle: '@Del_phine',
      sentences: [
        // Delphine's Blog 3 (p.27 하단)
      ],
    },
  },
  {
    no: 4,
    subtitle: 'St. Patrick\'s Day',
    part: 'PART 4',
    page: 'p.28~29',
    sentences: [
      // PART 4 본문 (p.29)
    ],
    blog: {
      title: 'Delphine\'s Blog 4',
      handle: '@Del_phine',
      sentences: [
        // Delphine's Blog 4 (p.29 하단)
      ],
    },
  },
];

/* ── 전사 완료 후 체크리스트 ────────────────────────────────────
 *  1) node _oneoff-신목고-세계문학/verify-source.mjs U2   ← 빈 슬롯 0 확인
 *  2) 챕터별 문장 수를 아래 표에 적어 둘 것 (다음 사람이 대조할 기준)
 *
 *     | Ch | PART 본문 | Blog | 계 |
 *     |----|-----------|------|----|
 *     | 1  |           |      |    |   ← 도입 4문장 포함
 *     | 2  |           |      |    |
 *     | 3  |           |      |    |
 *     | 4  |           |      |    |
 *
 *  3) 그 다음에야 분석지 JSON 의 passage 를 채운다(verify.mjs 가 대조).
 * ─────────────────────────────────────────────────────────────── */
