// Terra Nova · 우하단 floating 액션 버튼 (모든 페이지 공통)
// 사용법: </body> 앞에 <script src="./floating-actions.js" defer></script>
// 제공 버튼:
//   1) 구독안내 — index.html#plans 로 이동 (네비에서 제거된 항목 대체)
//   2) 맨 위로 — 현재 페이지 최상단으로 스크롤 (스크롤 360px 이상일 때만 표시)
// 모바일에서는 mobile-app.js 의 하단 탭바를 회피해 약간 더 위로 배치

(function () {
  'use strict';
  if (document.querySelector('.tn-fab-stack')) return;

  var SVG_NS = 'http://www.w3.org/2000/svg';

  function makeSvgPath(d, strokeWidth) {
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '20');
    svg.setAttribute('height', '20');
    svg.setAttribute('aria-hidden', 'true');
    var path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', strokeWidth || '2');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('fill', 'none');
    svg.appendChild(path);
    return svg;
  }

  function makeFab(opts) {
    var el = document.createElement(opts.href ? 'a' : 'button');
    el.className = 'tn-fab ' + opts.cls;
    el.setAttribute('aria-label', opts.label);
    if (opts.href) {
      el.href = opts.href;
    } else {
      el.type = 'button';
    }
    el.appendChild(makeSvgPath(opts.d, opts.sw));
    if (opts.text) {
      var sr = document.createElement('span');
      sr.className = 'tn-fab-sr';
      sr.textContent = opts.text;
      el.appendChild(sr);
    }
    return el;
  }

  var stack = document.createElement('div');
  stack.className = 'tn-fab-stack';
  stack.setAttribute('aria-label', '빠른 이동');

  var plansBtn = makeFab({
    cls: 'tn-fab-plans',
    href: 'index.html#plans',
    label: '구독안내로 이동',
    d: 'M4 7h16M4 12h16M4 17h10',
    text: '구독'
  });

  var topBtn = makeFab({
    cls: 'tn-fab-top',
    label: '맨 위로 이동',
    d: 'M12 5l-7 7m7-7l7 7m-7-7v14',
    sw: '2.2'
  });
  topBtn.hidden = true;

  stack.appendChild(plansBtn);
  stack.appendChild(topBtn);

  var style = document.createElement('style');
  style.textContent = [
    '.tn-fab-stack{position:fixed;right:18px;bottom:84px;display:flex;flex-direction:column;gap:10px;z-index:120;pointer-events:none;}',
    '.tn-fab{position:relative;pointer-events:auto;display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:50%;background:rgba(10,12,18,.78);color:#fff;border:1px solid rgba(0,255,163,.32);box-shadow:0 8px 22px rgba(0,0,0,.4),0 0 18px rgba(0,255,163,.18);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);text-decoration:none;cursor:pointer;transition:transform .2s ease,background .2s ease,border-color .2s ease;padding:0;font-family:inherit;}',
    '.tn-fab:hover{transform:translateY(-2px);background:rgba(0,255,163,.18);border-color:rgba(0,255,163,.6);}',
    '.tn-fab-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0;}',
    '.tn-fab svg{display:block;}',
    '.tn-fab-plans{color:#00FFA3;}',
    '.tn-fab-top{color:#fff;}',
    '@media(max-width:680px){.tn-fab-stack{right:12px;bottom:96px;}.tn-fab{width:42px;height:42px;}.tn-fab svg{width:18px;height:18px;}}',
    'body.light-theme .tn-fab{background:rgba(255,255,255,.92);color:#0a1414;border-color:rgba(0,168,107,.4);box-shadow:0 8px 22px rgba(0,0,0,.12);}',
    'body.light-theme .tn-fab-plans{color:#00a86b;}'
  ].join('');
  document.head.appendChild(style);
  document.body.appendChild(stack);

  topBtn.addEventListener('click', function () {
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); }
    catch (e) { window.scrollTo(0, 0); }
  });

  function syncTopVisibility() {
    var y = window.scrollY || document.documentElement.scrollTop || 0;
    if (y > 360) topBtn.hidden = false;
    else         topBtn.hidden = true;
  }
  syncTopVisibility();
  window.addEventListener('scroll', syncTopVisibility, { passive: true });
})();
