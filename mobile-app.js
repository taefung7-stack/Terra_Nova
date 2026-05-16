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
  var BIO_LINKS = [
    { type: 'feature', icon: '📖', title: '무료 샘플 받기', sub: '한 지문에 한 단원 — 직접 보기', href: 'sample.html' },
    { type: 'section', label: '시작하기' },
    { type: 'link', icon: '🎯', title: '내 레벨 알아보기',   sub: '초5~고3 8단계 진단',          href: 'level_test.html' },
    { type: 'link', icon: '✨', title: '월간 구독',          sub: 'PREMIUM 58,900원 / 월',       href: 'index.html#plans' },
    { type: 'link', icon: '📚', title: '책 미리보기',         sub: '실제 134p 풀북 구성',          href: 'intro.html' },
    { type: 'section', label: '소식' },
    { type: 'link', icon: '🎁', title: '이번 달 이벤트',      sub: '신규 구독 혜택 보기',          href: 'event.html' },
    { type: 'link', icon: '❓', title: '자주 묻는 질문',       sub: '구독·결제·환불 안내',           href: 'faq.html' },
    { type: 'section', label: '내 계정' },
    { type: 'link', icon: '👤', title: '마이페이지',          sub: '주문·구독 상태',               href: 'mypage.html' }
  ];

  // 안전한 DOM 빌더 — innerHTML 사용 안 함.
  function el(tag, opts) {
    var node = document.createElement(tag);
    if (!opts) return node;
    if (opts.cls)   node.className   = opts.cls;
    if (opts.text)  node.textContent = opts.text;
    if (opts.href)  node.href        = opts.href;
    if (opts.target){node.target     = opts.target; node.rel = 'noopener'; }
    if (opts.aria)  node.setAttribute('aria-label', opts.aria);
    if (opts.ariaHidden) node.setAttribute('aria-hidden', 'true');
    if (opts.id)    node.id          = opts.id;
    return node;
  }

  function injectLinkInBio() {
    var path = (location.pathname.split('/').pop() || '').toLowerCase();
    if (BIO_PAGES.indexOf(path) === -1) return;
    if (document.getElementById('m-bio')) return;

    document.body.classList.add('m-bio-mode');

    var bio = el('section', { id: 'm-bio', aria: 'Terra Nova 모바일 홈' });

    // Profile header
    var profile = el('header', { cls: 'm-bio-profile' });
    profile.appendChild(el('div', { cls: 'm-bio-avatar', text: 'TN', ariaHidden: true }));
    profile.appendChild(el('h1',  { cls: 'm-bio-name',   text: 'Terra Nova English' }));
    profile.appendChild(el('div', { cls: 'm-bio-handle', text: '@terra_nova_english' }));
    var bioP = el('p', { cls: 'm-bio-bio' });
    bioP.appendChild(document.createTextNode('한 지문에, 한 단원이 들어 있습니다.'));
    bioP.appendChild(el('br'));
    bioP.appendChild(document.createTextNode('초5~고3 교과 연계 영어 독해 학습지.'));
    profile.appendChild(bioP);
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
      var isFeature = item.type === 'feature';
      var a = el('a', { cls: isFeature ? 'm-bio-feature' : 'm-bio-link', href: item.href });
      a.appendChild(el('span', {
        cls: isFeature ? 'm-bio-feat-icon' : 'm-bio-icon',
        text: item.icon,
        ariaHidden: true
      }));
      var body = el('div', { cls: isFeature ? 'm-bio-feat-body' : 'm-bio-body' });
      body.appendChild(el('div', { cls: isFeature ? 'm-bio-feat-title' : 'm-bio-title', text: item.title }));
      body.appendChild(el('div', { cls: isFeature ? 'm-bio-feat-sub'   : 'm-bio-sub',   text: item.sub   }));
      a.appendChild(body);
      a.appendChild(el('span', {
        cls: isFeature ? 'm-bio-feat-arrow' : 'm-bio-arrow',
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