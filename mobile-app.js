/*
 * Terra Nova — Mobile App Shell JS (v3)
 *
 * 폰 화면에서만 동작 (matchMedia max-width: 680px).
 * 1) 하단 탭바를 자동으로 body에 inject (모든 페이지 공통)
 * 2) 좌/우 스와이프로 이전/다음 페이지 이동 (홈 ↔ 샘플 ↔ 레벨테스트 ↔ 마이 ↔ 구독)
 * 3) 페이지 전환 시 200ms fade transition
 *
 * 데스크탑·태블릿(>680px)에서는 이 스크립트가 즉시 return — 영향 없음.
 */

(function () {
  'use strict';

  // 데스크탑이면 즉시 종료
  if (!window.matchMedia('(max-width: 680px)').matches) return;

  // ── 1. Tab definitions ────────────────────────────────────────
  // 순서가 그대로 좌→우 스와이프 인덱스가 된다.
  var TABS = [
    { href: 'index.html',                       label: '홈',     icon: '🏠', aliases: ['index.html', 'landing.html', 'intro.html', '/'] },
    { href: 'sample.html',                      label: '샘플',   icon: '📖', aliases: ['sample.html'] },
    { href: 'level_test.html',                  label: '레벨',   icon: '🎯', aliases: ['level_test.html'] },
    { href: 'mypage.html',                      label: '마이',   icon: '👤', aliases: ['mypage.html', 'login.html', 'signup.html'] },
    { href: 'index.html#plans',                 label: '구독',   icon: '✨', aliases: ['index.html#plans', 'order.html', 'market.html', 'market_checkout.html'] }
  ];

  // ── 2. Inject tab bar ────────────────────────────────────────
  function buildTabBar() {
    if (document.getElementById('m-tabbar')) return;          // idempotent
    var path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    // <div role="navigation">으로 만든다.
    // <nav> 로 만들면 페이지의 sticky `nav` 룰이 같이 매치되어
    // top:0 sticky로 변해 버린다.
    var nav = document.createElement('div');
    nav.id = 'm-tabbar';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', '하단 탭');
    TABS.forEach(function (t) {
      var a = document.createElement('a');
      a.href = t.href;
      a.innerHTML = '<span class="m-tab-icon" aria-hidden="true">' + t.icon + '</span><span class="m-tab-label">' + t.label + '</span>';
      if (t.aliases.indexOf(path) !== -1 || (path === '' && t.aliases.indexOf('/') !== -1)) {
        a.classList.add('is-active');
      }
      nav.appendChild(a);
    });
    document.body.appendChild(nav);
  }

  // ── 3. Swipe gesture (이전/다음 페이지) ────────────────────
  function attachSwipe() {
    var path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    var idx = -1;
    for (var i = 0; i < TABS.length; i++) {
      if (TABS[i].aliases.indexOf(path) !== -1) { idx = i; break; }
    }
    if (idx === -1) return;       // 탭바에 매핑 안 되는 페이지(privacy 등)는 스와이프 비활성

    var startX = 0, startY = 0, tracking = false;
    var THRESH = 80;              // 최소 px 이동
    var V_TOLERANCE = 50;         // 세로 이동 허용치

    document.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      tracking = true;
    }, { passive: true });

    document.addEventListener('touchend', function (e) {
      if (!tracking) return;
      tracking = false;
      var t = e.changedTouches[0];
      var dx = t.clientX - startX;
      var dy = Math.abs(t.clientY - startY);
      if (dy > V_TOLERANCE) return;             // 세로 스크롤 의도면 무시
      if (Math.abs(dx) < THRESH) return;

      // 가장자리 스와이프(브라우저 뒤로가기) 충돌 방지
      if (startX < 20 || startX > window.innerWidth - 20) return;

      if (dx < 0 && idx < TABS.length - 1) {
        // 왼쪽 스와이프 → 다음
        location.href = TABS[idx + 1].href;
      } else if (dx > 0 && idx > 0) {
        // 오른쪽 스와이프 → 이전
        location.href = TABS[idx - 1].href;
      }
    }, { passive: true });
  }

  // ── 4. Link-in-bio mode (index.html / landing.html only) ───
  // linktr.ee/litt.ly 감성 — 폰 홈 화면을 프로필 + 링크 카드 리스트로 대체.
  // 웹/태블릿(>680px) 에서는 이 함수까지 도달하지도 않음 (파일 최상단 가드).
  // 다른 페이지(sample, mypage 등)에서도 발동하지 않음 — path 화이트리스트.
  var BIO_PAGES = ['', '/', 'index.html', 'landing.html'];

  // 링크 카드 데이터. 순서 = 노출 순서.
  // type 'book-rail' → 4권 교재 carousel 인라인 표시
  // modal: 'books' → TERRA NOVA = 수능지문, 'plans' → 구독 플랜 보기
  var BIO_LINKS = [
    { type: 'book-rail' },
    { type: 'feature', icon: '🎯', title: 'TERRA NOVA = 수능지문',  sub: '모의고사 개념 ↔ Terra Nova 매핑 5선',  modal: 'books' },
    { type: 'feature-2', icon: '📖', title: '무료 샘플 받기',                                          href: 'sample.html' },
    { type: 'section', label: '시작하기' },
    { type: 'link', icon: '🧭', title: '내 레벨 알아보기',                                             href: 'level_test.html' },
    { type: 'link', icon: '✨', title: '구독 플랜 보기',            sub: '월간 11,900원부터',           modal: 'plans' },
    { type: 'section', label: '소식' },
    { type: 'link', icon: '🎁', title: '이번 달 이벤트',            sub: '신규 구독 혜택 보기',          href: 'event.html' },
    { type: 'link', icon: '❓', title: '자주 묻는 질문',             sub: '구독·결제·환불 안내',           href: 'faq.html' },
    { type: 'section', label: '내 계정' },
    { type: 'link', icon: '👤', title: '마이페이지',                sub: '주문·구독 상태',               href: 'mypage.html' }
  ];

  // 홈 화면에 바로 보여줄 교재 4권 — Mars(초5), Saturn(고1), Jupiter(고2), Sun(고3).
  // 표지 대신 P1 (Passage) 페이지 썸네일 사용. 클릭 시 books 모달로 점프.
  var HOME_BOOKS = [
    { code: 'MARS',    grade: '초5', cover: 'assets/textbook-previews/mars-p1.jpg' },
    { code: 'SATURN',  grade: '고1', cover: 'assets/textbook-previews/saturn-p1.jpg' },
    { code: 'JUPITER', grade: '고2', cover: 'assets/textbook-previews/jupiter-p1.jpg' },
    { code: 'SUN',     grade: '고3', cover: 'assets/textbook-previews/sun-p1.jpg' }
  ];

  // 교재 보기 모달용 데이터 — 매핑 5개
  var BOOKS_DATA = {
    matches: [
      {
        pairNum: '01',
        gradeLabel: '고1 · 통합과학',
        levelLabel: 'Saturn · Lv 08',
        examTag: '2026학년도 6월 · 고1 전국연합학력평가',
        examTitle: '통합과학 15번',
        examBody: '물(H₂O)과 이산화 탄소(CO₂) 분자에서 모든 원자가 네온(Ne)과 같은 전자 배치를 가지는지, 공유하는 전자쌍의 수가 같은지를 묻는 문제.',
        bookTag: 'Terra Nova · 2026.06 · Saturn L1',
        bookTitle: 'Why Carbon Can Build Almost Anything',
        bookBody: 'Carbon has four outer electrons, which means it can share bonds with four different neighbors at the same time — the small difference that quietly shapes the entire story of biology.',
        bookBodyKo: '탄소는 가장 바깥쪽 전자가 4개라, 네 이웃 원자와 동시에 결합을 공유할 수 있다 — 그 작은 차이가 생물학 전체를 빚어낸다.',
        concept: '공유결합 · 전자쌍 공유',
        curriculum: '통합과학 I-2'
      },
      {
        pairNum: '02',
        gradeLabel: '고1 · 공통수학',
        levelLabel: 'Saturn · Lv 08',
        examTag: '2026학년도 6월 · 고1 전국연합학력평가',
        examTitle: '공통수학 24번',
        examBody: '45° 각도로 던져 올린 야구공의 위치를 y = ax² + bx + c 로 모형화한 포물선 그래프에서, 볼록 방향·최고점 좌표·판별식과 x축 교점 수의 관계를 묻는 문제.',
        bookTag: 'Terra Nova · 2026.06 · Saturn L3',
        bookTitle: 'Why Parabolas Always Beat Straight Lines',
        bookBody: 'A baseball thrown at 45° never travels in a straight line — it traces a perfect parabolic arc, modeled by y = ax² + bx + c. The discriminant tells us, before the ball even leaves the hand, how many roots that path will share with the field.',
        bookBodyKo: '45°로 던진 공은 직선이 아닌 완벽한 포물선으로 날아간다. 판별식은 공이 손을 떠나기도 전에 그 경로가 지면과 몇 점을 공유할지 알려준다.',
        concept: '이차함수 · 포물선 · 판별식',
        curriculum: '공통수학 Ⅱ-2'
      },
      {
        pairNum: '03',
        gradeLabel: '고2 · 생명과학Ⅰ',
        levelLabel: 'Jupiter · Lv 09',
        examTag: '2026학년도 6월 · 고2 전국연합학력평가',
        examTitle: '생명과학Ⅰ 11번',
        examBody: 'DNA 이중나선의 상보적 염기쌍 (A–T, G–C) 결합과 반보존적 복제 모형에서 모(母) 가닥과 새 가닥의 비율을 추론하는 문제.',
        bookTag: 'Terra Nova · 2026.06 · Jupiter L2',
        bookTitle: 'The Ladder That Copies Itself',
        bookBody: 'DNA is a twisted ladder whose rungs only fit in one way — A always with T, G always with C. When a cell divides, the ladder splits down the middle, and each half rebuilds its missing side from scratch. The copy is never random; it is dictated, base by base, by the strand that already exists.',
        bookBodyKo: 'DNA는 사다리처럼 비틀려 있고, 그 가로대는 한 가지 방식으로만 맞물린다 — A는 항상 T와, G는 항상 C와. 세포가 분열할 때 사다리는 가운데서 갈라지고, 각 반쪽은 사라진 면을 처음부터 다시 짓는다. 복제는 결코 무작위가 아니다 — 이미 존재하는 가닥이 염기 하나하나를 받아쓴다.',
        concept: '상보적 염기쌍 · 반보존적 복제',
        curriculum: '생명과학Ⅰ Ⅱ-1'
      },
      {
        pairNum: '04',
        gradeLabel: '고3 · 한국사',
        levelLabel: 'Sun · Lv 10',
        examTag: '2026학년도 6월 · 고3 전국연합학력평가',
        examTitle: '한국사 9번',
        examBody: '조선 초기 의정부 서사제와 6조 직계제의 권력 구조를 비교하고, 태종·세조 대에 6조 직계제가 채택된 정치적 배경을 묻는 문제.',
        bookTag: 'Terra Nova · 2026.06 · Sun L4',
        bookTitle: 'Who Whispers to the King?',
        bookBody: 'Joseon\'s early monarchs faced a quiet design choice: should ministers route every decision through a council, or report directly to the throne? The Council Route (Uijeongbu) softened royal power but slowed action; the Direct Route (Yukjo) concentrated speed and authority — at the cost of voices that disagreed. Taejong and Sejo chose speed.',
        bookBodyKo: '조선 초기 군주들은 조용한 설계의 갈림길에 섰다 — 신하들이 모든 결정을 의정부를 통해 올릴 것인가, 아니면 6조가 곧장 임금에게 보고할 것인가. 의정부 서사제는 왕권을 누그러뜨렸지만 결정을 늦췄고, 6조 직계제는 속도와 권위를 한곳에 모았지만 반대 목소리는 사라졌다. 태종과 세조는 속도를 골랐다.',
        concept: '6조 직계제 · 왕권 강화',
        curriculum: '한국사 Ⅲ-1'
      },
      {
        pairNum: '05',
        gradeLabel: '고3 · 생활과 윤리',
        levelLabel: 'Sun · Lv 10',
        examTag: '2026학년도 6월 · 고3 전국연합학력평가',
        examTitle: '생활과 윤리 18번',
        examBody: '롤스가 제시한 정의의 원칙 — 무지의 베일 뒤 원초적 입장, 평등한 기본 자유의 원칙, 차등의 원칙 (최소 수혜자에게 이익이 될 때만 불평등 정당화) — 에 부합하는 입장을 모두 고르는 문제.',
        bookTag: 'Terra Nova · 2026.06 · Sun L5',
        bookTitle: 'Justice Behind a Veil',
        bookBody: 'John Rawls asked a deceptively simple question: what rules would we choose if we didn\'t know who we\'d be in society? Strip away your gender, your class, your talent — would you still vote for the same tax code? Behind this veil of ignorance, Rawls believed people would converge on two principles: equal basic liberties for all, and inequalities permitted only when they help the worst-off.',
        bookBodyKo: '존 롤스는 단순해 보이는 질문을 던졌다 — 우리가 사회에서 어떤 사람이 될지 모른 채 규칙을 정한다면 어떤 규칙을 고르겠는가? 성별, 계층, 재능을 벗겨낸다면 같은 세제에 찬성하겠는가? 롤스는 무지의 베일 뒤에서 사람들이 두 원칙으로 수렴한다 보았다 — 모두에게 평등한 기본 자유, 그리고 불평등은 최소 수혜자에게 도움이 될 때만 정당화된다.',
        concept: '무지의 베일 · 차등의 원칙',
        curriculum: '생활과 윤리 Ⅱ-3'
      }
    ]
  };

  // 구독 플랜 모달용 데이터 (landing.html 권도, 2026-04-27 기준)
  var PLANS_DATA = [
    {
      name: 'LIGHT',
      tag: 'PDF 구독',
      price: '11,900',
      annualNote: '연 119,000원 (2개월 무료)',
      features: ['매월 1권 PDF 다운로드', '레벨별 134p 풀북', '해설·정답·번역 포함', '복습용 영구 보관'],
      cta: '구독 신청',
      href: 'order.html?plan=light'
    },
    {
      name: 'STANDARD',
      tag: 'PDF + 실물',
      price: '24,900',
      annualNote: '연 249,000원 (2개월 무료)',
      features: ['LIGHT 전체 포함', '매월 실물 책 배송', '오프라인 학습 가능', '학습 진도 트래킹'],
      featured: true,
      cta: '구독 신청',
      href: 'order.html?plan=standard'
    },
    {
      name: 'PREMIUM',
      tag: '올인원',
      price: '58,900',
      annualNote: '연 589,000원 (2개월 무료)',
      features: ['STANDARD 전체 포함', '실시간 1:1 첨삭', '월간 라이브 클래스', '학부모 리포트 발송'],
      badge: '준비중',
      cta: '사전 예약',
      href: 'order.html?plan=premium'
    }
  ];

  // SVG 소셜 아이콘 빌더 — 인라인 SVG, currentColor 상속.
  var SVG_NS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs) {
    var n = document.createElementNS(SVG_NS, tag);
    if (attrs) {
      for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) n.setAttribute(k, attrs[k]);
    }
    return n;
  }
  function buildSocialIcon(kind) {
    var s = svgEl('svg', { viewBox: '0 0 24 24', width: '18', height: '18', fill: 'none', 'aria-hidden': 'true' });
    if (kind === 'instagram') {
      s.appendChild(svgEl('rect', { x: '3', y: '3', width: '18', height: '18', rx: '5', stroke: 'currentColor', 'stroke-width': '1.8' }));
      s.appendChild(svgEl('circle', { cx: '12', cy: '12', r: '4', stroke: 'currentColor', 'stroke-width': '1.8' }));
      s.appendChild(svgEl('circle', { cx: '17.2', cy: '6.8', r: '1', fill: 'currentColor' }));
    } else if (kind === 'x') {
      var p = svgEl('path', { d: 'M4 3 L20 21 M20 3 L4 21', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round' });
      s.appendChild(p);
    } else if (kind === 'threads') {
      // Threads-style spiral approximation
      s.appendChild(svgEl('path', { d: 'M12 3.5 C7.5 3.5 4 7 4 12 C4 17 7.5 20.5 12 20.5 C16.5 20.5 19 18 19 15 C19 12.5 17 10.5 13.5 10.5 C10.8 10.5 9 12 9 13.7 C9 15.2 10.2 16.2 11.8 16.2 C13.6 16.2 14.5 14.9 14.5 13 C14.5 9.5 12 7.5 9 7.5', stroke: 'currentColor', 'stroke-width': '1.6', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
    } else if (kind === 'kakao') {
      s.appendChild(svgEl('path', { d: 'M12 4.5 C7 4.5 3 7.7 3 11.6 C3 14.1 4.7 16.3 7.3 17.4 L6.4 20.5 L9.9 18.5 C10.6 18.6 11.3 18.7 12 18.7 C17 18.7 21 15.5 21 11.6 C21 7.7 17 4.5 12 4.5 Z', fill: 'currentColor' }));
    }
    return s;
  }

  // 안전한 DOM 빌더 — innerHTML 사용 안 함.
  function el(tag, opts) {
    var node = document.createElement(tag);
    if (!opts) return node;
    if (opts.cls)   node.className   = opts.cls;
    if (opts.text)  node.textContent = opts.text;
    if (opts.href)  node.href        = opts.href;
    if (opts.src)   node.src         = opts.src;
    if (opts.alt !== undefined) node.alt = opts.alt;
    if (opts.target){node.target     = opts.target; node.rel = 'noopener'; }
    if (opts.aria)  node.setAttribute('aria-label', opts.aria);
    if (opts.ariaHidden) node.setAttribute('aria-hidden', 'true');
    if (opts.id)    node.id          = opts.id;
    if (opts.role)  node.setAttribute('role', opts.role);
    if (opts.type)  node.type        = opts.type;
    if (opts.loading) node.setAttribute('loading', opts.loading);
    if (opts.onclick) node.addEventListener('click', opts.onclick);
    return node;
  }

  // ── Modal system ─────────────────────────────────────────────
  // bottom sheet 풀스크린. ESC + 외부 클릭 + 닫기 버튼 + body scroll lock.
  function openModal(buildContent, title) {
    closeModal(); // idempotent
    var backdrop = el('div', { id: 'm-modal-backdrop', cls: 'm-modal-backdrop' });
    var sheet = el('div', { cls: 'm-modal-sheet', role: 'dialog' });
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-label', title || '');

    var head = el('header', { cls: 'm-modal-head' });
    var grabber = el('div', { cls: 'm-modal-grab', ariaHidden: true });
    var titleEl = el('h2', { cls: 'm-modal-title', text: title || '' });
    var closeBtn = el('button', {
      cls: 'm-modal-close', type: 'button', aria: '닫기', text: '✕',
      onclick: closeModal
    });
    head.appendChild(grabber);
    head.appendChild(titleEl);
    head.appendChild(closeBtn);
    sheet.appendChild(head);

    var body = el('div', { cls: 'm-modal-body' });
    buildContent(body);
    sheet.appendChild(body);

    backdrop.appendChild(sheet);
    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) closeModal();
    });
    document.body.appendChild(backdrop);
    document.body.classList.add('m-modal-open');
    document.addEventListener('keydown', escClose);
  }

  function closeModal() {
    var b = document.getElementById('m-modal-backdrop');
    if (b) b.parentNode.removeChild(b);
    document.body.classList.remove('m-modal-open');
    document.removeEventListener('keydown', escClose);
  }
  function escClose(e) { if (e.key === 'Escape') closeModal(); }

  // 교재 모달 콘텐츠 빌더 — 모의고사 ↔ Terra Nova 매핑 5선
  function buildBooksModal(body) {
    var lead = el('p', { cls: 'm-modal-lead', text: '모의고사에 나온 그 개념. Terra Nova 영어 지문에서 같은 깊이로 만났습니다.' });
    body.appendChild(lead);

    BOOKS_DATA.matches.forEach(function (m) {
      var pair = el('article', { cls: 'm-match-pair' });

      var label = el('div', { cls: 'm-match-label' });
      label.appendChild(el('span', { cls: 'm-match-num', text: m.pairNum }));
      label.appendChild(el('span', { cls: 'm-match-grade', text: m.gradeLabel }));
      label.appendChild(el('span', { cls: 'm-match-level', text: m.levelLabel }));
      pair.appendChild(label);

      // Exam side
      var examCard = el('div', { cls: 'm-match-card m-match-exam' });
      examCard.appendChild(el('div', { cls: 'm-match-role m-match-role-exam', text: '모의고사' }));
      examCard.appendChild(el('div', { cls: 'm-match-tag', text: m.examTag }));
      examCard.appendChild(el('h4', { cls: 'm-match-cardtitle', text: m.examTitle }));
      examCard.appendChild(el('p', { cls: 'm-match-body', text: m.examBody }));
      pair.appendChild(examCard);

      // Arrow
      var arrow = el('div', { cls: 'm-match-arrow', ariaHidden: true });
      arrow.appendChild(el('span', { cls: 'm-match-arrow-line' }));
      arrow.appendChild(el('span', { cls: 'm-match-arrow-label', text: '같은 개념' }));
      pair.appendChild(arrow);

      // Book side
      var bookCard = el('div', { cls: 'm-match-card m-match-book' });
      bookCard.appendChild(el('div', { cls: 'm-match-role m-match-role-book', text: 'Terra Nova 교재' }));
      bookCard.appendChild(el('div', { cls: 'm-match-tag', text: m.bookTag }));
      bookCard.appendChild(el('h4', { cls: 'm-match-cardtitle', text: m.bookTitle }));
      bookCard.appendChild(el('p', { cls: 'm-match-body m-match-body-en', text: m.bookBody }));
      bookCard.appendChild(el('p', { cls: 'm-match-body m-match-body-ko', text: m.bookBodyKo }));
      pair.appendChild(bookCard);

      // Concept chip
      var concept = el('div', { cls: 'm-match-concept' });
      concept.appendChild(el('span', { cls: 'm-match-concept-label', text: '핵심 개념' }));
      concept.appendChild(el('strong', { text: m.concept }));
      concept.appendChild(el('span', { cls: 'm-match-concept-curr', text: m.curriculum }));
      pair.appendChild(concept);

      body.appendChild(pair);
    });

    // CTA
    var cta = el('a', { cls: 'm-modal-cta', href: 'sample.html', text: '무료 샘플 받아보기 →' });
    body.appendChild(cta);
  }

  // 플랜 모달 콘텐츠 빌더
  function buildPlansModal(body) {
    var lead = el('p', { cls: 'm-modal-lead', text: '월간 구독으로 매월 새 교재를 받아보세요. 언제든 해지 가능.' });
    body.appendChild(lead);

    PLANS_DATA.forEach(function (p) {
      var card = el('section', { cls: 'm-plan-card' + (p.featured ? ' m-plan-featured' : '') });
      var head = el('div', { cls: 'm-plan-head' });
      var nameRow = el('div', { cls: 'm-plan-namerow' });
      nameRow.appendChild(el('span', { cls: 'm-plan-name', text: p.name }));
      if (p.featured) nameRow.appendChild(el('span', { cls: 'm-plan-pop', text: 'POPULAR' }));
      if (p.badge)    nameRow.appendChild(el('span', { cls: 'm-plan-badge', text: p.badge }));
      head.appendChild(nameRow);
      head.appendChild(el('div', { cls: 'm-plan-tag', text: p.tag }));
      card.appendChild(head);

      var priceRow = el('div', { cls: 'm-plan-pricerow' });
      priceRow.appendChild(el('span', { cls: 'm-plan-price', text: p.price }));
      priceRow.appendChild(el('span', { cls: 'm-plan-unit', text: '원 / 월' }));
      card.appendChild(priceRow);
      card.appendChild(el('div', { cls: 'm-plan-annual', text: p.annualNote }));

      var ul = el('ul', { cls: 'm-plan-features' });
      p.features.forEach(function (f) {
        var li = el('li');
        li.appendChild(el('span', { cls: 'm-plan-check', text: '✓', ariaHidden: true }));
        li.appendChild(el('span', { text: f }));
        ul.appendChild(li);
      });
      card.appendChild(ul);

      card.appendChild(el('a', { cls: 'm-plan-cta', href: p.href, text: p.cta + ' →' }));
      body.appendChild(card);
    });

    var note = el('p', { cls: 'm-plan-note', text: '※ PREMIUM은 2026 하반기 정식 출시 예정. 사전 예약 시 출시 알림을 받습니다.' });
    body.appendChild(note);
  }

  function injectLinkInBio() {
    var path = (location.pathname.split('/').pop() || '').toLowerCase();
    if (BIO_PAGES.indexOf(path) === -1) return;
    if (document.getElementById('m-bio')) return;

    document.body.classList.add('m-bio-mode');

    var bio = el('section', { id: 'm-bio', aria: 'Terra Nova 모바일 홈' });

    // Profile header — 큰 워드마크 (Pretendard)
    var profile = el('header', { cls: 'm-bio-profile' });
    profile.appendChild(el('h1', { cls: 'm-bio-wordmark', text: 'TERRA NOVA' }));
    profile.appendChild(el('div', { cls: 'm-bio-eng',     text: 'ENGLISH' }));
    profile.appendChild(el('p',  { cls: 'm-bio-tagline',  text: '모든 교과를 영어로 학습하세요.' }));
    bio.appendChild(profile);

    // Social row — Instagram / X / Threads / KakaoTalk
    var social = el('div', { cls: 'm-bio-social' });
    var SOC = [
      { href: 'https://www.instagram.com/terra_nova_english/', label: 'Instagram',  svg: 'instagram' },
      { href: 'https://x.com/terra_nova_eng',                  label: 'X',          svg: 'x' },
      { href: 'https://www.threads.net/@terra_nova_english',   label: 'Threads',    svg: 'threads' },
      { href: 'https://pf.kakao.com/_aLExdX',                  label: '카카오톡',   svg: 'kakao' }
    ];
    SOC.forEach(function (s) {
      var a = el('a', { href: s.href, target: '_blank', aria: s.label });
      a.appendChild(buildSocialIcon(s.svg));
      social.appendChild(a);
    });
    bio.appendChild(social);

    // Link cards
    BIO_LINKS.forEach(function (item) {
      if (item.type === 'section') {
        bio.appendChild(el('div', { cls: 'm-bio-section', text: item.label }));
        return;
      }
      if (item.type === 'book-rail') {
        var head = el('div', { cls: 'm-bio-rail-head' });
        head.appendChild(el('span', { cls: 'm-bio-rail-title', text: '교재 미리보기' }));
        head.appendChild(el('span', { cls: 'm-bio-rail-sub', text: '초5 · 고1 · 고2 · 고3' }));
        bio.appendChild(head);

        var rail = el('div', { cls: 'm-bio-rail' });
        HOME_BOOKS.forEach(function (bk) {
          var card = el('a', {
            cls: 'm-bio-book',
            href: 'sample.html',
            aria: bk.code + ' ' + bk.grade + ' 교재 미리보기'
          });
          var imgWrap = el('div', { cls: 'm-bio-book-cover' });
          imgWrap.appendChild(el('img', { src: bk.cover, alt: bk.code + ' 교재 표지', loading: 'lazy' }));
          card.appendChild(imgWrap);
          var meta = el('div', { cls: 'm-bio-book-meta' });
          meta.appendChild(el('div', { cls: 'm-bio-book-code',  text: bk.code }));
          meta.appendChild(el('div', { cls: 'm-bio-book-grade', text: bk.grade }));
          card.appendChild(meta);
          rail.appendChild(card);
        });
        bio.appendChild(rail);
        return;
      }
      var isFeature  = item.type === 'feature';
      var isFeature2 = item.type === 'feature-2';
      var rootCls;
      if (isFeature)      rootCls = 'm-bio-feature';
      else if (isFeature2) rootCls = 'm-bio-feature m-bio-feature-2';
      else                rootCls = 'm-bio-link';

      var clickHandler = null;
      var href = item.href || '#';
      if (item.modal) {
        clickHandler = function (e) {
          e.preventDefault();
          if (item.modal === 'books') openModal(buildBooksModal, 'TERRA NOVA = 수능지문');
          else if (item.modal === 'plans') openModal(buildPlansModal, '구독 플랜 보기');
        };
      }

      var a = el('a', { cls: rootCls, href: href, onclick: clickHandler });
      var bigIcon = isFeature || isFeature2;
      a.appendChild(el('span', {
        cls: bigIcon ? 'm-bio-feat-icon' : 'm-bio-icon',
        text: item.icon,
        ariaHidden: true
      }));
      var bodyEl = el('div', { cls: bigIcon ? 'm-bio-feat-body' : 'm-bio-body' });
      bodyEl.appendChild(el('div', { cls: bigIcon ? 'm-bio-feat-title' : 'm-bio-title', text: item.title }));
      if (item.sub) {
        bodyEl.appendChild(el('div', { cls: bigIcon ? 'm-bio-feat-sub' : 'm-bio-sub', text: item.sub }));
      }
      a.appendChild(bodyEl);
      a.appendChild(el('span', {
        cls: bigIcon ? 'm-bio-feat-arrow' : 'm-bio-arrow',
        text: '›',
        ariaHidden: true
      }));
      bio.appendChild(a);
    });

    // Footer
    var footer = el('footer', { cls: 'm-bio-footer' });
    footer.appendChild(el('a', { href: 'privacy.html', text: '개인정보처리방침' }));
    footer.appendChild(document.createTextNode(' · '));
    footer.appendChild(el('a', { href: 'terms.html',   text: '이용약관' }));
    footer.appendChild(document.createTextNode(' · '));
    footer.appendChild(el('a', { href: 'refund.html',  text: '환불' }));
    footer.appendChild(el('br'));
    footer.appendChild(document.createTextNode('© Terra Nova English'));
    bio.appendChild(footer);

    document.body.insertBefore(bio, document.body.firstChild);
  }

  // ── 5. Boot ──────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      injectLinkInBio();
      buildTabBar();
      attachSwipe();
    });
  } else {
    injectLinkInBio();
    buildTabBar();
    attachSwipe();
  }
})();