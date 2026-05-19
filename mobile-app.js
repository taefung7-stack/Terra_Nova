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
    { href: 'index.html',                       label: '홈',     icon: '🏠', aliases: ['index.html', 'landing.html', 'intro.html', 'exam-match.html', '/'] },
    { href: 'sample.html',                      label: '샘플',   icon: '📖', aliases: ['sample.html'] },
    { href: 'level_test.html',                  label: '레벨',   icon: '🎯', aliases: ['level_test.html'] },
    { href: 'mypage.html',                      label: '마이',   icon: '👤', aliases: ['mypage.html', 'login.html', 'signup.html'] },
    { href: 'order.html',                       label: '구독',   icon: '✨', aliases: ['order.html', 'subscription.html', 'index.html#plans', 'market.html', 'market_checkout.html'] }
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
  // bio 모드(=index/landing의 link-in-bio 홈)에서는 교재 carousel·모달과
  // 충돌하므로 페이지 전환 스와이프 자체를 비활성. 다른 탭바 페이지에서만 동작.
  function attachSwipe() {
    var path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (document.body.classList.contains('m-bio-mode')) return;  // bio 홈 = 스와이프 끔
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
      // carousel 같은 가로 스크롤러 안에서 시작한 터치는 페이지 전환에 사용 안 함
      if (e.target && e.target.closest && e.target.closest('[data-no-page-swipe]')) {
        tracking = false;
        return;
      }
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
    { type: 'feature', icon: '🎯', title: 'TERRA NOVA = 수능지문',  modal: 'books' },
    { type: 'feature-2', icon: '📖', title: '무료 샘플 받기',         href: 'sample.html' },
    { type: 'section', label: '시작하기' },
    { type: 'link', icon: '🧭', title: '내 레벨 알아보기',             href: 'level_test.html' },
    { type: 'link', icon: '✨', title: '구독 플랜 보기',                href: 'subscription.html' },
    { type: 'section', label: '소식' },
    { type: 'link', icon: '🛍️', title: '마켓',                          href: 'market.html' },
    { type: 'link', icon: '🎁', title: '이벤트',                       href: 'event.html' },
    { type: 'link', icon: '❓', title: '자주 묻는 질문',                href: 'faq.html' },
    { type: 'section', label: '내 계정' },
    { type: 'link', icon: '👤', title: '마이페이지',                    href: 'mypage.html' }
  ];

  // 홈 화면에 바로 보여줄 교재 4권 — Mars(초5), Saturn(고1), Jupiter(고2), Sun(고3).
  // 표지 대신 P1 (Passage) 페이지 썸네일 사용. 클릭 시 sample.html.
  // syllabus = 그 권이 다루는 교과 단원 — 큰 글씨로 carousel 카드에 노출.
  var HOME_BOOKS = [
    {
      code: 'MARS', grade: '초5',
      cover: 'assets/textbook-previews/mars-p1.jpg',
      headline: '초5 교과서를 영어로',
      syllabus: ['국어 5-2 · 우리말 어휘 확장', '사회 5-2 · 우리 역사의 시작', '과학 5-2 · 생물과 환경', '수학 5-2 · 약수와 배수']
    },
    {
      code: 'SATURN', grade: '고1',
      cover: 'assets/textbook-previews/saturn-p1.jpg',
      headline: '고1 통합과학 · 공통수학을 영어로',
      syllabus: ['통합과학 I-2 · 자연의 구성 물질 (탄소·공유결합)', '공통수학 Ⅱ-2 · 이차함수와 포물선', '통합사회 Ⅱ-1 · 인권 보장과 정의', '영어Ⅰ · 학력평가 어휘 1,800']
    },
    {
      code: 'JUPITER', grade: '고2',
      cover: 'assets/textbook-previews/jupiter-p1.jpg',
      headline: '고2 선택과목 · 미적분의 길로',
      syllabus: ['생명과학Ⅰ Ⅱ-1 · DNA 복제와 유전 정보', '미적분 · 함수의 극한과 연속', '영어 독해와 작문 · 모의고사 어법', '한국지리 · 자연환경과 인간생활']
    },
    {
      code: 'SUN', grade: '고3',
      cover: 'assets/textbook-previews/sun-p1.jpg',
      headline: '고3 수능 직결 · 모의고사 깊이',
      syllabus: ['한국사 Ⅲ-1 · 조선 통치 체제 (6조 직계제)', '생활과 윤리 Ⅱ-3 · 롤스의 정의론', '독서 · 수능 EBS 연계 지문 깊이', '영어 · 수능 빈출 어법·구문 패턴']
    }
  ];

  // 교재 보기 모달용 데이터 — 매핑 3개 (figure 그림 포함, bookTag 없음)
  // figure = 'molecule' (탄소·물·CO2) | 'parabola' (포물선) | 'veil' (무지의 베일)
  var BOOKS_DATA = {
    matches: [
      {
        pairNum: '01',
        gradeLabel: '고1 · 통합과학',
        examTag: '2026학년도 6월 · 고1 전국연합학력평가',
        examTitle: '통합과학 15번',
        examStem: '그림은 분자 (가)와 (나)를 화학 결합 모형으로 나타낸 것이다. (가)와 (나)는 각각 물(H₂O)과 이산화 탄소(CO₂) 중 하나이다. <보기>에서 옳은 것만을 있는 대로 고른 것은? [2점]',
        examChoices: [
          '(가)는 물(H₂O)이다.',
          '(가)에서 모든 원자는 네온(Ne)과 같은 전자 배치를 가진다.',
          '공유하는 전자쌍의 수는 (가)와 (나)가 같다.'
        ],
        examHighlight: ['공유하는 전자쌍의 수', '전자 배치'],
        figure: 'molecule',
        bookTitle: 'Why Carbon Can Build Almost Anything',
        bookBody: 'Carbon has four outer electrons, which means it can share bonds with four different neighbors at the same time — the small difference that quietly shapes the entire story of biology.',
        bookHighlight: ['four outer electrons', 'share bonds'],
        bookBodyKo: '탄소는 가장 바깥쪽 전자가 4개라, 네 이웃 원자와 동시에 결합을 공유할 수 있다 — 그 작은 차이가 생물학 전체를 빚어낸다.',
        bookHighlightKo: ['가장 바깥쪽 전자가 4개', '결합을 공유'],
        concept: '공유결합 · 전자쌍 공유',
        curriculum: '통합과학 I-2'
      },
      {
        pairNum: '02',
        gradeLabel: '고1 · 공통수학',
        examTag: '2026학년도 6월 · 고1 전국연합학력평가',
        examTitle: '공통수학 24번',
        examStem: '45° 각도로 던져 올린 야구공의 위치 (가)는 이차함수 y = ax² + bx + c 로 모형화된다. 그래프는 시간에 따른 공의 높이를 나타낸 포물선이다. <보기>에서 옳은 것을 모두 고른 것은? [3점]',
        examChoices: [
          'a < 0 이므로 그래프는 위로 볼록한 포물선이다.',
          '최고점의 좌표는 −b/2a 에서 결정된다.',
          '판별식 b² − 4ac 는 x축과의 교점 개수를 결정한다.'
        ],
        examHighlight: ['이차함수 y = ax² + bx + c', '포물선', '판별식 b² − 4ac', 'x축과의 교점'],
        figure: 'parabola',
        bookTitle: 'Why Parabolas Always Beat Straight Lines',
        bookBody: 'A baseball thrown at 45° never travels in a straight line — it traces a perfect parabolic arc, modeled by y = ax² + bx + c. The discriminant tells us, before the ball even leaves the hand, how many roots that path will share with the field.',
        bookHighlight: ['parabolic arc', 'y = ax² + bx + c', 'discriminant', 'roots'],
        bookBodyKo: '45°로 던진 공은 직선이 아닌 완벽한 포물선으로 날아간다. 판별식은 공이 손을 떠나기도 전에 그 경로가 지면과 몇 점을 공유할지 알려준다.',
        bookHighlightKo: ['포물선', '판별식', '지면과 몇 점을 공유'],
        concept: '이차함수 · 포물선 · 판별식',
        curriculum: '공통수학 Ⅱ-2'
      },
      {
        pairNum: '03',
        gradeLabel: '고3 · 생활과 윤리',
        examTag: '2026학년도 6월 · 고3 전국연합학력평가',
        examTitle: '생활과 윤리 18번',
        examStem: '다음은 어느 사상가의 입장이다. 이 사상가가 주장한 정의의 원칙으로 옳은 것만을 <보기>에서 있는 대로 고른 것은? [3점]',
        examChoices: [
          '정의의 원칙은 자신의 우연적 조건을 모르는 상태에서 도출된다.',
          '평등한 기본 자유의 원칙이 차등의 원칙보다 우선한다.',
          '사회·경제적 불평등은 최소 수혜자에게 이익이 될 때에만 정당화된다.'
        ],
        examHighlight: ['자신의 우연적 조건을 모르는', '평등한 기본 자유의 원칙', '차등의 원칙', '최소 수혜자'],
        figure: 'veil',
        bookTitle: 'Justice Behind a Veil',
        bookBody: 'John Rawls asked a deceptively simple question: what rules would we choose if we didn\'t know who we\'d be in society? Behind this veil of ignorance, Rawls believed people would converge on two principles: equal basic liberties for all, and inequalities permitted only when they help the worst-off.',
        bookHighlight: ['veil of ignorance', 'equal basic liberties', 'worst-off'],
        bookBodyKo: '존 롤스는 단순해 보이는 질문을 던졌다 — 우리가 사회에서 어떤 사람이 될지 모른 채 규칙을 정한다면 어떤 규칙을 고르겠는가? 롤스는 무지의 베일 뒤에서 사람들이 두 원칙으로 수렴한다 보았다 — 모두에게 평등한 기본 자유, 그리고 불평등은 최소 수혜자에게 도움이 될 때만 정당화된다.',
        bookHighlightKo: ['무지의 베일', '평등한 기본 자유', '최소 수혜자'],
        concept: '무지의 베일 · 차등의 원칙',
        curriculum: '생활과 윤리 Ⅱ-3'
      }
    ]
  };

  // 모의고사 문제 도식 SVG — 인라인 빌더 (index.html 원본 그림 단순화 버전)
  function buildExamFigure(kind) {
    var wrap = el('div', { cls: 'm-match-figure', ariaHidden: true });
    var svg;
    if (kind === 'molecule') {
      svg = svgEl('svg', { viewBox: '0 0 280 96', width: '100%', height: '96', role: 'img', 'aria-label': '물·이산화탄소 분자 모형' });
      // H2O on left
      var g1 = svgEl('g', {});
      g1.appendChild(svgEl('line',   { x1: '38', y1: '76', x2: '64', y2: '36', stroke: '#cfd0d2', 'stroke-width': '2' }));
      g1.appendChild(svgEl('line',   { x1: '64', y1: '36', x2: '90', y2: '76', stroke: '#cfd0d2', 'stroke-width': '2' }));
      g1.appendChild(svgEl('circle', { cx: '64', cy: '36', r: '16', fill: '#33d6ff' }));
      var oT = svgEl('text', { x: '64', y: '41', 'text-anchor': 'middle', 'font-size': '14', 'font-weight': '700', fill: '#001417' }); oT.textContent = 'O'; g1.appendChild(oT);
      g1.appendChild(svgEl('circle', { cx: '38', cy: '76', r: '10', fill: '#fff' }));
      var hT1 = svgEl('text', { x: '38', y: '80', 'text-anchor': 'middle', 'font-size': '11', 'font-weight': '700', fill: '#000' }); hT1.textContent = 'H'; g1.appendChild(hT1);
      g1.appendChild(svgEl('circle', { cx: '90', cy: '76', r: '10', fill: '#fff' }));
      var hT2 = svgEl('text', { x: '90', y: '80', 'text-anchor': 'middle', 'font-size': '11', 'font-weight': '700', fill: '#000' }); hT2.textContent = 'H'; g1.appendChild(hT2);
      var cap1 = svgEl('text', { x: '64', y: '94', 'text-anchor': 'middle', 'font-size': '9', fill: '#cfd0d2' }); cap1.textContent = '(가) H₂O'; g1.appendChild(cap1);
      svg.appendChild(g1);
      // CO2 on right
      var g2 = svgEl('g', { transform: 'translate(150,0)' });
      g2.appendChild(svgEl('line', { x1: '8',  y1: '38', x2: '36',  y2: '38', stroke: '#cfd0d2', 'stroke-width': '1.6' }));
      g2.appendChild(svgEl('line', { x1: '8',  y1: '46', x2: '36',  y2: '46', stroke: '#cfd0d2', 'stroke-width': '1.6' }));
      g2.appendChild(svgEl('line', { x1: '76', y1: '38', x2: '104', y2: '38', stroke: '#cfd0d2', 'stroke-width': '1.6' }));
      g2.appendChild(svgEl('line', { x1: '76', y1: '46', x2: '104', y2: '46', stroke: '#cfd0d2', 'stroke-width': '1.6' }));
      g2.appendChild(svgEl('circle', { cx: '56', cy: '42', r: '14', fill: '#1f1f1f', stroke: '#fff', 'stroke-width': '1.2' }));
      var cT = svgEl('text', { x: '56', y: '47', 'text-anchor': 'middle', 'font-size': '13', 'font-weight': '700', fill: '#fff' }); cT.textContent = 'C'; g2.appendChild(cT);
      g2.appendChild(svgEl('circle', { cx: '8',   cy: '42', r: '11', fill: '#33d6ff' }));
      var o1 = svgEl('text', { x: '8',   y: '47', 'text-anchor': 'middle', 'font-size': '12', 'font-weight': '700', fill: '#001417' }); o1.textContent = 'O'; g2.appendChild(o1);
      g2.appendChild(svgEl('circle', { cx: '104', cy: '42', r: '11', fill: '#33d6ff' }));
      var o2 = svgEl('text', { x: '104', y: '47', 'text-anchor': 'middle', 'font-size': '12', 'font-weight': '700', fill: '#001417' }); o2.textContent = 'O'; g2.appendChild(o2);
      var cap2 = svgEl('text', { x: '56', y: '94', 'text-anchor': 'middle', 'font-size': '9', fill: '#cfd0d2' }); cap2.textContent = '(나) CO₂'; g2.appendChild(cap2);
      svg.appendChild(g2);
    } else if (kind === 'parabola') {
      svg = svgEl('svg', { viewBox: '0 0 280 110', width: '100%', height: '110', role: 'img', 'aria-label': '이차함수 포물선 그래프' });
      // axes
      svg.appendChild(svgEl('line', { x1: '14', y1: '94', x2: '266', y2: '94', stroke: '#cfd0d2', 'stroke-width': '1.4' }));
      svg.appendChild(svgEl('line', { x1: '24', y1: '14', x2: '24',  y2: '102', stroke: '#cfd0d2', 'stroke-width': '1.4' }));
      var tt = svgEl('text', { x: '268', y: '98', 'font-size': '10', fill: '#cfd0d2' }); tt.textContent = 't'; svg.appendChild(tt);
      var ty = svgEl('text', { x: '14',  y: '13', 'font-size': '10', fill: '#cfd0d2' }); ty.textContent = 'y'; svg.appendChild(ty);
      // parabola
      svg.appendChild(svgEl('path', { d: 'M 26 94 Q 140 -16 254 94', stroke: '#33d6ff', 'stroke-width': '2.4', fill: 'none' }));
      // vertex
      svg.appendChild(svgEl('circle', { cx: '140', cy: '24', r: '3.5', fill: '#33d6ff' }));
      var vtxT = svgEl('text', { x: '146', y: '22', 'font-size': '10', fill: '#33d6ff' }); vtxT.textContent = '최고점 (−b/2a)'; svg.appendChild(vtxT);
      // launch point
      svg.appendChild(svgEl('circle', { cx: '26', cy: '94', r: '3', fill: '#fff' }));
      var lpT = svgEl('text', { x: '30', y: '88', 'font-size': '9', fill: '#fff' }); lpT.textContent = '던진 점'; svg.appendChild(lpT);
      // equation
      var eqT = svgEl('text', { x: '150', y: '78', 'font-size': '11', 'font-weight': '700', fill: '#fff', 'font-style': 'italic' }); eqT.textContent = 'y = ax² + bx + c'; svg.appendChild(eqT);
    } else if (kind === 'veil') {
      svg = svgEl('svg', { viewBox: '0 0 280 110', width: '100%', height: '110', role: 'img', 'aria-label': '롤스의 무지의 베일 모형' });
      // veil bar
      svg.appendChild(svgEl('rect', { x: '24', y: '12', width: '232', height: '22', fill: '#0f1a18', stroke: 'rgba(0,255,163,.45)', 'stroke-width': '1' }));
      var vT = svgEl('text', { x: '140', y: '27', 'text-anchor': 'middle', 'font-size': '10', 'font-weight': '700', fill: '#33d6ff' }); vT.textContent = 'VEIL OF IGNORANCE'; svg.appendChild(vT);
      // drop lines
      [70, 140, 210].forEach(function (x) {
        svg.appendChild(svgEl('line', { x1: x, y1: '34', x2: x, y2: '58', stroke: 'rgba(255,255,255,.4)', 'stroke-width': '1', 'stroke-dasharray': '2,2' }));
      });
      // figures
      var labels = ['A','B','C'];
      [70, 140, 210].forEach(function (x, i) {
        svg.appendChild(svgEl('circle', { cx: x, cy: '72', r: '12', fill: '#161616', stroke: 'rgba(255,255,255,.35)', 'stroke-width': '1' }));
        var lt = svgEl('text', { x: x, y: '76', 'text-anchor': 'middle', 'font-size': '10', 'font-weight': '700', fill: '#fff' }); lt.textContent = labels[i]; svg.appendChild(lt);
      });
      var capV = svgEl('text', { x: '140', y: '102', 'text-anchor': 'middle', 'font-size': '9', fill: '#cfd0d2' }); capV.textContent = '원초적 입장 · Original Position'; svg.appendChild(capV);
    }
    if (svg) wrap.appendChild(svg);
    return wrap;
  }

  // 구독 플랜 데이터 (landing.html 권도, 2026-04-27 기준)
  // 9번 요청: features 정리 — 일부 항목 삭제·이름변경
  // 운영 정책: 현재 LIGHT만 판매중 (STANDARD/PREMIUM 준비중)
  var PLANS_DATA = [
    {
      name: 'LIGHT',
      tag: 'PDF 구독',
      price: '11,900',
      annualNote: '연 119,000원 (2개월 무료)',
      features: ['매월 1권 PDF 다운로드', '해설·정답·번역 포함', '복습용 영구 보관'],
      featured: true,
      cta: '구독 신청',
      href: 'order.html?plan=light'
    },
    {
      name: 'STANDARD',
      tag: 'PDF + 실물',
      price: '24,900',
      annualNote: '연 249,000원 (2개월 무료)',
      features: ['LIGHT 전체 포함', '매월 실물 책 배송', '오프라인 학습 가능'],
      badge: '준비중',
      comingSoon: true,
      cta: '준비중',
      href: '#'
    },
    {
      name: 'PREMIUM',
      tag: '올인원',
      price: '58,900',
      annualNote: '연 589,000원 (2개월 무료)',
      features: ['STANDARD 전체 포함', '전 지문 해설강의'],
      badge: '준비중',
      comingSoon: true,
      cta: '준비중',
      href: '#'
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

  // 교재 모달 콘텐츠 빌더 — 모의고사 ↔ Terra Nova 매핑 3선
  // 모의고사 카드: figure 그림 + 발문 + 보기 ul (실제 시험지처럼)
  // Terra Nova 카드: bookTag 없음 (사용자 요청)
  function buildBooksModal(body) {
    BOOKS_DATA.matches.forEach(function (m) {
      var pair = el('article', { cls: 'm-match-pair' });

      var label = el('div', { cls: 'm-match-label' });
      label.appendChild(el('span', { cls: 'm-match-num', text: m.pairNum }));
      label.appendChild(el('span', { cls: 'm-match-grade', text: m.gradeLabel }));
      pair.appendChild(label);

      // Exam side — 실제 시험지 느낌으로 강화
      var examCard = el('div', { cls: 'm-match-card m-match-exam' });
      examCard.appendChild(el('div', { cls: 'm-match-role m-match-role-exam', text: '모의고사' }));
      examCard.appendChild(el('div', { cls: 'm-match-tag', text: m.examTag }));
      examCard.appendChild(el('h4', { cls: 'm-match-cardtitle', text: m.examTitle }));
      if (m.figure) {
        examCard.appendChild(buildExamFigure(m.figure));
      }
      examCard.appendChild(el('p', { cls: 'm-match-stem', text: m.examStem }));
      if (m.examChoices && m.examChoices.length) {
        var ul = el('ul', { cls: 'm-match-choices' });
        m.examChoices.forEach(function (c, i) {
          var li = el('li');
          li.appendChild(el('span', { cls: 'm-match-choice-num', text: ['①','②','③','④','⑤'][i] || ('' + (i+1)) }));
          li.appendChild(el('span', { cls: 'm-match-choice-text', text: c }));
          ul.appendChild(li);
        });
        examCard.appendChild(ul);
      }
      pair.appendChild(examCard);

      // Arrow
      var arrow = el('div', { cls: 'm-match-arrow', ariaHidden: true });
      arrow.appendChild(el('span', { cls: 'm-match-arrow-line' }));
      arrow.appendChild(el('span', { cls: 'm-match-arrow-label', text: '같은 개념' }));
      pair.appendChild(arrow);

      // Book side — bookTag 제거
      var bookCard = el('div', { cls: 'm-match-card m-match-book' });
      bookCard.appendChild(el('div', { cls: 'm-match-role m-match-role-book', text: 'Terra Nova 교재' }));
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
      var cls = 'm-plan-card';
      if (p.featured)    cls += ' m-plan-featured';
      if (p.comingSoon) cls += ' m-plan-coming-soon';
      var card = el('section', { cls: cls });
      var head = el('div', { cls: 'm-plan-head' });
      var nameRow = el('div', { cls: 'm-plan-namerow' });
      nameRow.appendChild(el('span', { cls: 'm-plan-name', text: p.name }));
      if (p.featured) nameRow.appendChild(el('span', { cls: 'm-plan-pop', text: 'RECOMMENDED' }));
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

      var ctaOpts = { cls: 'm-plan-cta', href: p.href, text: p.cta + (p.comingSoon ? '' : ' →') };
      if (p.comingSoon) {
        ctaOpts.onclick = function (e) {
          e.preventDefault();
          alert(p.name + ' 플랜은 현재 준비중입니다.\n지금은 LIGHT 플랜만 신청 가능합니다.');
        };
      }
      card.appendChild(el('a', ctaOpts));
      body.appendChild(card);
    });

    var note = el('p', { cls: 'm-plan-note', text: '※ STANDARD · PREMIUM은 현재 준비중입니다. 정식 출시 시 알려드립니다.' });
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
      { href: 'https://x.com/snowball8631',                    label: 'X',          svg: 'x' },
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
        head.appendChild(el('span', { cls: 'm-bio-rail-sub', text: '한 권씩 넘겨보기' }));
        bio.appendChild(head);

        // data-no-page-swipe → 페이지 전환 스와이프 차단(이 안에서 시작한 터치는 무시)
        var rail = el('div', { cls: 'm-bio-rail' });
        rail.setAttribute('data-no-page-swipe', '1');
        HOME_BOOKS.forEach(function (bk) {
          // 1번 요청: 클릭해도 아무 페이지로 안 넘어가게 div 컨테이너
          var card = el('div', {
            cls: 'm-bio-book',
            aria: bk.code + ' ' + bk.grade + ' 교재 미리보기'
          });
          var imgWrap = el('div', { cls: 'm-bio-book-cover' });
          imgWrap.appendChild(el('img', { src: bk.cover, alt: bk.code + ' 교재 표지', loading: 'lazy' }));
          card.appendChild(imgWrap);

          var meta = el('div', { cls: 'm-bio-book-meta' });
          var topRow = el('div', { cls: 'm-bio-book-toprow' });
          topRow.appendChild(el('div', { cls: 'm-bio-book-code',  text: bk.code }));
          topRow.appendChild(el('div', { cls: 'm-bio-book-grade', text: bk.grade }));
          meta.appendChild(topRow);
          if (bk.headline) {
            meta.appendChild(el('div', { cls: 'm-bio-book-headline', text: bk.headline }));
          }
          if (bk.syllabus && bk.syllabus.length) {
            var ul = el('ul', { cls: 'm-bio-book-syllabus' });
            bk.syllabus.forEach(function (s) {
              var li = el('li');
              li.appendChild(el('span', { cls: 'm-bio-book-dot', text: '•', ariaHidden: true }));
              li.appendChild(el('span', { text: s }));
              ul.appendChild(li);
            });
            meta.appendChild(ul);
          }
          card.appendChild(meta);
          rail.appendChild(card);
        });
        bio.appendChild(rail);

        // pager dots
        var dots = el('div', { cls: 'm-bio-rail-dots', ariaHidden: true });
        HOME_BOOKS.forEach(function (_, i) {
          dots.appendChild(el('span', { cls: 'm-bio-dot' + (i === 0 ? ' is-active' : '') }));
        });
        bio.appendChild(dots);

        // scroll-position → dot active 동기화
        var dotsArr = dots.querySelectorAll('.m-bio-dot');
        rail.addEventListener('scroll', function () {
          var w = rail.clientWidth || 1;
          var idx2 = Math.round(rail.scrollLeft / w);
          for (var i2 = 0; i2 < dotsArr.length; i2++) {
            dotsArr[i2].classList.toggle('is-active', i2 === idx2);
          }
        }, { passive: true });
        return;
      }
      var isFeature  = item.type === 'feature';
      var isFeature2 = item.type === 'feature-2';
      var rootCls;
      if (isFeature)      rootCls = 'm-bio-feature';
      else if (isFeature2) rootCls = 'm-bio-feature m-bio-feature-2';
      else                rootCls = 'm-bio-link';

      // 2번/8번 요청: modal → 실제 페이지로 navigate
      var clickHandler = null;
      var href = item.href || '#';
      if (item.modal === 'books') href = 'exam-match.html';
      else if (item.modal === 'plans') href = 'subscription.html';

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

  // ── Sub page injectors (exam-match.html / subscription.html) ──
  // 새 페이지에서 #m-page 컨테이너에 컨텐츠 inject. mobile-app.css의 m-bio-mode
  // 룰을 재활용 (헤더/푸터 등 hide). 데스크탑(>680px)은 파일 최상단 가드로 미발동.
  function injectSubPage() {
    var path = (location.pathname.split('/').pop() || '').toLowerCase();
    if (path === 'exam-match.html') {
      document.body.classList.add('m-bio-mode', 'm-subpage');
      // 1번 요청: 일반 페이지 nav 패턴 (좌측 TERRA NOVA 워드마크 + 우상단 햄버거)
      document.body.insertBefore(buildStandardNav(), document.body.firstChild);
      var container = el('section', { id: 'm-bio', cls: 'm-subpage-wrap' });
      // 페이지 본문 안 큰 2줄 타이틀
      var heroBlock = el('div', { cls: 'm-subpage-hero' });
      heroBlock.appendChild(el('h1', { cls: 'm-subpage-title', text: 'TERRA NOVA' }));
      heroBlock.appendChild(el('div', { cls: 'm-subpage-subtitle', text: '= 교과서 연계 수능지문' }));
      container.appendChild(heroBlock);
      buildBooksPage(container);
      document.body.appendChild(container);
      return true;
    }
    if (path === 'subscription.html') {
      document.body.classList.add('m-bio-mode', 'm-subpage');
      document.body.insertBefore(buildStandardNav(), document.body.firstChild);
      var container2 = el('section', { id: 'm-bio', cls: 'm-subpage-wrap' });
      var heroBlock2 = el('div', { cls: 'm-subpage-hero' });
      heroBlock2.appendChild(el('h1', { cls: 'm-subpage-title m-subpage-title-eng', text: '3 PLANS' }));
      container2.appendChild(heroBlock2);
      buildPlansPage(container2);
      document.body.appendChild(container2);
      return true;
    }
    return false;
  }

  // 1번 요청: exam-match · subscription 페이지의 nav를 일반 페이지(sample 등) 패턴으로.
  // 좌측 TERRA NOVA 워드마크 + 우상단 햄버거 + 동일 메뉴 항목.
  function buildStandardNav() {
    var nav = document.createElement('nav');
    nav.setAttribute('aria-label', '주 메뉴');
    nav.className = 'site-nav m-subpage-stdnav';

    var logo = el('a', { cls: 'logo-wrap', href: 'index.html', aria: 'Terra Nova 홈' });
    var logoText = el('div', { cls: 'logo-text' });
    logoText.appendChild(el('div', { cls: 'logo-main', text: 'TERRA NOVA' }));
    logoText.appendChild(el('div', { cls: 'logo-eng', text: 'ENGLISH' }));
    logo.appendChild(logoText);
    nav.appendChild(logo);

    var ul = el('ul', { cls: 'nav-links' });
    // 1번 요청: level_test 와 동일한 메뉴 (마이페이지/관리자/로그아웃 + 구독 신청 nav-cta)
    var ITEMS = [
      { href: 'index.html',          label: '홈' },
      { href: 'level_test.html',     label: '레벨테스트' },
      { href: 'sample.html',         label: '무료샘플' },
      { href: 'market.html',         label: '마켓' },
      { href: 'event.html',          label: '이벤트' },
      { href: 'faq.html',            label: 'FAQ' },
      { href: 'login.html',          label: '로그인',  auth: 'guest' },
      { href: 'mypage.html',         label: '마이페이지', auth: 'user' },
      { href: 'admin.html',          label: '🛡️ 관리자', auth: 'admin' },
      { href: '#', logout: true,     label: '로그아웃', auth: 'user' },
      { href: 'order.html',          label: '구독 신청', cta: true }
    ];
    ITEMS.forEach(function (item) {
      var li = el('li');
      if (item.auth) li.setAttribute('data-auth', item.auth);
      if (item.auth === 'user' || item.auth === 'admin') li.style.display = 'none';
      var a = el('a', { href: item.href, text: item.label });
      if (item.cta) a.className = 'nav-cta';
      if (item.logout) a.setAttribute('data-action', 'logout');
      li.appendChild(a);
      ul.appendChild(li);
    });
    nav.appendChild(ul);

    var btn = el('button', { cls: 'nav-hamburger', type: 'button', aria: '메뉴' });
    btn.id = 'nav-hamburger';
    btn.appendChild(el('span'));
    btn.appendChild(el('span'));
    btn.appendChild(el('span'));
    btn.addEventListener('click', function () {
      btn.classList.toggle('open');
      ul.classList.toggle('open');
    });
    nav.appendChild(btn);

    return nav;
  }

  // 3번 요청: 각 문제 헤더 가운데정렬·크게 + 형광펜
  // bookHighlight: bookBody 안에서 노란 형광펜 칠할 부분 (mark)
  // examHighlight: examStem/choices 안에서 노란 형광펜 칠할 부분
  function buildBooksPage(parent) {
    BOOKS_DATA.matches.forEach(function (m) {
      var pair = el('article', { cls: 'm-match-pair m-match-pair-page' });

      // Centered big label
      var label = el('div', { cls: 'm-match-label-center' });
      var labelTop = el('div', { cls: 'm-match-label-top' });
      labelTop.appendChild(el('span', { cls: 'm-match-num-big', text: m.pairNum }));
      label.appendChild(labelTop);
      label.appendChild(el('div', { cls: 'm-match-grade-big', text: m.gradeLabel }));
      pair.appendChild(label);

      // Exam card with highlight
      var examCard = el('div', { cls: 'm-match-card m-match-exam' });
      examCard.appendChild(el('div', { cls: 'm-match-role m-match-role-exam', text: '모의고사' }));
      examCard.appendChild(el('div', { cls: 'm-match-tag', text: m.examTag }));
      examCard.appendChild(el('h4', { cls: 'm-match-cardtitle', text: m.examTitle }));
      if (m.figure) examCard.appendChild(buildExamFigure(m.figure));
      examCard.appendChild(buildHighlighted('p', 'm-match-stem', m.examStem, m.examHighlight));
      if (m.examChoices && m.examChoices.length) {
        var ul = el('ul', { cls: 'm-match-choices' });
        m.examChoices.forEach(function (c, i) {
          var li = el('li');
          li.appendChild(el('span', { cls: 'm-match-choice-num', text: ['①','②','③','④','⑤'][i] || ('' + (i+1)) }));
          li.appendChild(buildHighlighted('span', 'm-match-choice-text', c, m.examHighlight));
          ul.appendChild(li);
        });
        examCard.appendChild(ul);
      }
      pair.appendChild(examCard);

      // Arrow
      var arrow = el('div', { cls: 'm-match-arrow', ariaHidden: true });
      arrow.appendChild(el('span', { cls: 'm-match-arrow-line' }));
      arrow.appendChild(el('span', { cls: 'm-match-arrow-label', text: '같은 개념' }));
      pair.appendChild(arrow);

      // Book card with highlight
      var bookCard = el('div', { cls: 'm-match-card m-match-book' });
      bookCard.appendChild(el('div', { cls: 'm-match-role m-match-role-book', text: 'Terra Nova 교재' }));
      bookCard.appendChild(el('h4', { cls: 'm-match-cardtitle', text: m.bookTitle }));
      bookCard.appendChild(buildHighlighted('p', 'm-match-body m-match-body-en', m.bookBody, m.bookHighlight));
      bookCard.appendChild(buildHighlighted('p', 'm-match-body m-match-body-ko', m.bookBodyKo, m.bookHighlightKo));
      pair.appendChild(bookCard);

      // Concept chip
      var concept = el('div', { cls: 'm-match-concept' });
      concept.appendChild(el('span', { cls: 'm-match-concept-label', text: '핵심 개념' }));
      concept.appendChild(el('strong', { text: m.concept }));
      concept.appendChild(el('span', { cls: 'm-match-concept-curr', text: m.curriculum }));
      pair.appendChild(concept);

      parent.appendChild(pair);
    });

    var cta = el('a', { cls: 'm-modal-cta', href: 'sample.html', text: '무료 샘플 받아보기 →' });
    parent.appendChild(cta);
  }

  // 텍스트 안에서 부분 문자열을 <mark>로 감싸 형광펜 처리.
  // highlight 가 배열이면 모든 항목을 각각 형광펜.
  function buildHighlighted(tag, cls, fullText, highlights) {
    var wrap = el(tag, { cls: cls });
    if (!fullText) { return wrap; }
    if (!highlights || (Array.isArray(highlights) && highlights.length === 0)) {
      wrap.appendChild(document.createTextNode(fullText));
      return wrap;
    }
    var list = Array.isArray(highlights) ? highlights : [highlights];
    // 모든 highlight 위치를 모아 정렬 후 분할 렌더
    var spans = [];
    for (var i = 0; i < list.length; i++) {
      var needle = list[i];
      var from = 0;
      while (true) {
        var pos = fullText.indexOf(needle, from);
        if (pos < 0) break;
        spans.push([pos, pos + needle.length]);
        from = pos + needle.length;
      }
    }
    if (spans.length === 0) {
      wrap.appendChild(document.createTextNode(fullText));
      return wrap;
    }
    spans.sort(function (a, b) { return a[0] - b[0]; });
    // 겹침 병합
    var merged = [spans[0].slice()];
    for (var j = 1; j < spans.length; j++) {
      var last = merged[merged.length - 1];
      if (spans[j][0] <= last[1]) {
        if (spans[j][1] > last[1]) last[1] = spans[j][1];
      } else {
        merged.push(spans[j].slice());
      }
    }
    var cursor = 0;
    merged.forEach(function (sp) {
      if (sp[0] > cursor) wrap.appendChild(document.createTextNode(fullText.slice(cursor, sp[0])));
      var mark = el('mark', { cls: 'm-hl', text: fullText.slice(sp[0], sp[1]) });
      wrap.appendChild(mark);
      cursor = sp[1];
    });
    if (cursor < fullText.length) wrap.appendChild(document.createTextNode(fullText.slice(cursor)));
    return wrap;
  }

  function buildPlansPage(parent) {
    PLANS_DATA.forEach(function (p) {
      var cls = 'm-plan-card';
      if (p.featured)   cls += ' m-plan-featured';
      if (p.comingSoon) cls += ' m-plan-coming-soon';
      var card = el('section', { cls: cls });
      var head = el('div', { cls: 'm-plan-head' });
      var nameRow = el('div', { cls: 'm-plan-namerow' });
      nameRow.appendChild(el('span', { cls: 'm-plan-name', text: p.name }));
      if (p.featured) nameRow.appendChild(el('span', { cls: 'm-plan-pop', text: 'RECOMMENDED' }));
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

      var ctaOpts = { cls: 'm-plan-cta', href: p.href, text: p.cta + (p.comingSoon ? '' : ' →') };
      if (p.comingSoon) {
        ctaOpts.onclick = function (e) {
          e.preventDefault();
          alert(p.name + ' 플랜은 현재 준비중입니다.\n지금은 LIGHT 플랜만 신청 가능합니다.');
        };
      }
      card.appendChild(el('a', ctaOpts));
      parent.appendChild(card);
    });

    var note = el('p', { cls: 'm-plan-note', text: '※ STANDARD · PREMIUM은 현재 준비중입니다. 정식 출시 시 알려드립니다.' });
    parent.appendChild(note);
  }

  // ── 5. Boot ──────────────────────────────────────────────────
  function boot() {
    var isSubPage = injectSubPage();
    if (!isSubPage) injectLinkInBio();
    buildTabBar();
    attachSwipe();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();