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
  // modal: 'books' → TERRA NOVA 교재 보기, 'plans' → 구독 플랜 보기
  var BIO_LINKS = [
    { type: 'feature', icon: '📚', title: 'TERRA NOVA 교재 보기',  sub: '실제 페이지 + 모의고사 매핑',  modal: 'books' },
    { type: 'feature-2', icon: '📖', title: '무료 샘플 받기',                                    href: 'sample.html' },
    { type: 'section', label: '시작하기' },
    { type: 'link', icon: '🎯', title: '내 레벨 알아보기',                                       href: 'level_test.html' },
    { type: 'link', icon: '✨', title: '구독 플랜 보기',          sub: '월간 11,900원부터',         modal: 'plans' },
    { type: 'section', label: '소식' },
    { type: 'link', icon: '🎁', title: '이번 달 이벤트',          sub: '신규 구독 혜택 보기',        href: 'event.html' },
    { type: 'link', icon: '❓', title: '자주 묻는 질문',           sub: '구독·결제·환불 안내',         href: 'faq.html' },
    { type: 'section', label: '내 계정' },
    { type: 'link', icon: '👤', title: '마이페이지',              sub: '주문·구독 상태',             href: 'mypage.html' }
  ];

  // 교재 보기 모달용 데이터
  var BOOKS_DATA = {
    levels: [
      {
        code: 'SATURN',
        grade: '고1',
        planet: 'assets/3d/planets-normalized/saturn.png',
        pages: [
          { src: 'assets/textbook-previews/saturn-p1.jpg', label: 'P1 · Passage' },
          { src: 'assets/textbook-previews/saturn-p2.jpg', label: 'P2 · Practice' },
          { src: 'assets/textbook-previews/saturn-p3.jpg', label: 'P3 · Syntax' },
          { src: 'assets/textbook-previews/saturn-p4.jpg', label: 'P4 · Vocab' }
        ]
      },
      {
        code: 'MARS',
        grade: '초5',
        planet: 'assets/3d/planets-normalized/mars.png',
        pages: [
          { src: 'assets/textbook-previews/mars-p1.jpg', label: 'P1 · Passage' },
          { src: 'assets/textbook-previews/mars-p2.jpg', label: 'P2 · Practice' },
          { src: 'assets/textbook-previews/mars-p3.jpg', label: 'P3 · Syntax' },
          { src: 'assets/textbook-previews/mars-p4.jpg', label: 'P4 · Vocab' }
        ]
      }
    ],
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

  // 교재 모달 콘텐츠 빌더
  function buildBooksModal(body) {
    var lead = el('p', { cls: 'm-modal-lead', text: '실제 교재 페이지와 모의고사 연계 사례를 확인하세요.' });
    body.appendChild(lead);

    // 레벨 2개 carousel
    BOOKS_DATA.levels.forEach(function (lv) {
      var card = el('section', { cls: 'm-book-level' });
      var head = el('div', { cls: 'm-book-level-head' });
      var planetImg = el('img', { cls: 'm-book-planet', src: lv.planet, alt: lv.code, loading: 'lazy' });
      var titles = el('div', { cls: 'm-book-titles' });
      titles.appendChild(el('div', { cls: 'm-book-code', text: lv.code }));
      titles.appendChild(el('div', { cls: 'm-book-grade', text: lv.grade }));
      head.appendChild(planetImg);
      head.appendChild(titles);
      card.appendChild(head);

      var rail = el('div', { cls: 'm-book-rail' });
      lv.pages.forEach(function (pg) {
        var slide = el('figure', { cls: 'm-book-slide' });
        slide.appendChild(el('img', { src: pg.src, alt: lv.code + ' ' + pg.label, loading: 'lazy' }));
        slide.appendChild(el('figcaption', { text: pg.label }));
        rail.appendChild(slide);
      });
      card.appendChild(rail);
      body.appendChild(card);
    });

    // 모의고사 매핑 2개
    var matchTitle = el('h3', { cls: 'm-modal-subhead', text: '모의고사 ↔ 교재 매핑' });
    body.appendChild(matchTitle);

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

    // Profile header — 실제 로고 사용
    var profile = el('header', { cls: 'm-bio-profile' });
    var avatar = el('div', { cls: 'm-bio-avatar', ariaHidden: true });
    avatar.appendChild(el('img', { src: 'logo.png', alt: 'Terra Nova', loading: 'eager' }));
    profile.appendChild(avatar);
    profile.appendChild(el('h1',  { cls: 'm-bio-name',   text: 'Terra Nova English' }));
    profile.appendChild(el('div', { cls: 'm-bio-handle', text: '@terra_nova_english' }));
    profile.appendChild(el('p',   { cls: 'm-bio-bio',    text: '영어로 전과목 학습' }));
    bio.appendChild(profile);

    // Social row
    var social = el('div', { cls: 'm-bio-social' });
    social.appendChild(el('a', { href: 'https://www.instagram.com/terra_nova_english/', target: '_blank', aria: 'Instagram',     text: '📷' }));
    social.appendChild(el('a', { href: 'https://pf.kakao.com/_aLExdX',                  target: '_blank', aria: '카카오톡 상담', text: '💬' }));
    social.appendChild(el('a', { href: 'mailto:support@terra-nova.kr',                                    aria: '이메일 문의',    text: '✉️' }));
    bio.appendChild(social);

    // Link cards
    BIO_LINKS.forEach(function (item) {
      if (item.type === 'section') {
        bio.appendChild(el('div', { cls: 'm-bio-section', text: item.label }));
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
          if (item.modal === 'books') openModal(buildBooksModal, 'TERRA NOVA 교재 보기');
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