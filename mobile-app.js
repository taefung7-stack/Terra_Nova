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
    { href: 'subscription_detail_complete.html',label: '구독',   icon: '✨', aliases: ['subscription_detail_complete.html', 'order.html', 'market.html', 'market_checkout.html'] }
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

  // ── 4. Boot ──────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      buildTabBar();
      attachSwipe();
    });
  } else {
    buildTabBar();
    attachSwipe();
  }
})();