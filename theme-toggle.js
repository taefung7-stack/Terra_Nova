// Terra Nova · 공용 라이트/다크 테마 토글
// ────────────────────────────────────────────────────────────────
// 사용법 (모든 페이지 공통):
//   1) <head> 최상단에 FOUC 방지 인라인 스니펫(아래 THEME_FOUC_SNIPPET)을 넣는다.
//      (파일로 뺄 수 없음 — 렌더 전에 동기 실행돼야 깜박임이 없다.)
//   2) 상단 네비 우측(구독 버튼 옆)에 토글 버튼을 넣는다:
//        <button class="theme-toggle" id="theme-toggle" type="button"
//                aria-label="라이트/다크 모드 전환"></button>
//   3) </body> 앞에 <script src="theme-toggle.js" defer></script>
//
// 저장: localStorage['tn-theme'] = 'light' | 'dark'
//       값이 없으면 prefers-color-scheme 를 따른다.
// 적용: html 요소에 class="light" 를 토글한다. 각 페이지 CSS 의 html.light{} 가 색을 재정의.
// ────────────────────────────────────────────────────────────────

(function () {
  var KEY = 'tn-theme';
  var root = document.documentElement;

  function current() {
    return root.classList.contains('light') ? 'light' : 'dark';
  }

  // 아이콘: 라이트면 달(다크로 전환 예고), 다크면 해(라이트로 전환 예고).
  var SUN = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>';
  var MOON = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

  function paintButtons() {
    var mode = current();
    var btns = document.querySelectorAll('.theme-toggle');
    for (var i = 0; i < btns.length; i++) {
      btns[i].innerHTML = mode === 'light' ? MOON : SUN;
      btns[i].setAttribute('aria-pressed', mode === 'light' ? 'true' : 'false');
      btns[i].title = mode === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환';
    }
  }

  function apply(mode) {
    if (mode === 'light') root.classList.add('light');
    else root.classList.remove('light');
    paintButtons();
    // 히어로 캔버스 등 JS 렌더러에 테마 변경을 알린다(있으면 반응, 없으면 무시).
    try {
      window.dispatchEvent(new CustomEvent('tn-theme-change', { detail: { mode: mode } }));
    } catch (e) {}
  }

  function toggle() {
    var next = current() === 'light' ? 'dark' : 'light';
    try { localStorage.setItem(KEY, next); } catch (e) {}
    apply(next);
  }

  // 토글 버튼이 정적으로 없는 페이지(nav를 스크립트로 주입하는 페이지 등)에는
  // 런타임에 네비 우측へ 버튼을 하나 만들어 넣는다.
  function ensureButton() {
    if (document.querySelector('.theme-toggle')) return;
    var btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.id = 'theme-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-label', '라이트/다크 모드 전환');
    var nav = document.querySelector('.site-nav') || document.querySelector('nav');
    if (nav) {
      var ham = nav.querySelector('.nav-hamburger');
      if (ham) nav.insertBefore(btn, ham);
      else nav.appendChild(btn);
      if (!btn.style.width) {
        btn.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;margin-left:14px;border:1px solid currentColor;border-radius:11px;background:transparent;color:inherit;cursor:pointer;opacity:.85;';
      }
    } else {
      // nav 가 없는 페이지 — 화면 우상단에 고정(fixed) 버튼으로.
      btn.classList.add('theme-toggle--floating');
      btn.style.cssText = 'position:fixed;top:16px;right:16px;z-index:9999;display:inline-flex;align-items:center;justify-content:center;width:42px;height:42px;border:1px solid rgba(128,128,128,.4);border-radius:11px;background:rgba(128,128,128,.12);color:inherit;cursor:pointer;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);';
      document.body.appendChild(btn);
    }
  }

  function wire() {
    ensureButton();
    paintButtons();
    var btns = document.querySelectorAll('.theme-toggle');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', toggle);
    }
    // 저장된 선택이 없을 때만 시스템 설정 변화를 실시간 반영.
    try {
      var mq = window.matchMedia('(prefers-color-scheme: light)');
      mq.addEventListener('change', function (e) {
        var saved = null;
        try { saved = localStorage.getItem(KEY); } catch (err) {}
        if (!saved) apply(e.matches ? 'light' : 'dark');
      });
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire);
  } else {
    wire();
  }
})();
