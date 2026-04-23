// PWA 서비스 워커 등록 — 모든 페이지에서 자동 실행
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js', { scope: './' })
      .then((reg) => console.info('[pwa] SW registered:', reg.scope))
      .catch((err) => console.warn('[pwa] SW registration failed:', err));
  });
}

// PWA 설치 프롬프트 (홈 추가 유도)
// 전략: 두 번째 방문 + 최소 30초 체류 후 한 번만 노출, "다시 보지 않기" 클릭 시 30일간 숨김.
(function () {
  let deferredPrompt = null;
  const STORAGE_KEY = 'tn-pwa-install';

  function getState() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
  }
  function setState(s) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    maybeShowPrompt();
  });

  window.addEventListener('appinstalled', () => {
    setState({ installed: true, at: Date.now() });
    const banner = document.getElementById('tn-pwa-banner');
    if (banner) banner.remove();
  });

  function maybeShowPrompt() {
    const state = getState();
    if (state.installed) return;
    if (state.dismissedAt && Date.now() - state.dismissedAt < 30 * 24 * 60 * 60 * 1000) return;

    // 방문 카운트 증가
    const visits = (state.visits || 0) + 1;
    setState({ ...state, visits });
    if (visits < 2) return; // 2회 이상 방문 시에만

    // 30초 체류 후 배너 노출
    setTimeout(renderBanner, 30 * 1000);
  }

  function renderBanner() {
    if (!deferredPrompt) return;
    if (document.getElementById('tn-pwa-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'tn-pwa-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', '홈 화면에 Terra Nova 추가');
    banner.style.cssText = [
      'position:fixed',
      'left:50%', 'transform:translateX(-50%)',
      'bottom:20px',
      'max-width:92vw', 'width:420px',
      'background:rgba(14,14,22,.96)',
      'backdrop-filter:blur(16px)',
      'border:1px solid rgba(45,212,191,.38)',
      'border-radius:12px',
      'padding:14px 16px',
      'box-shadow:0 8px 28px rgba(0,0,0,.45)',
      'color:#F0F0F0',
      'font-family:"Noto Sans KR",sans-serif',
      'font-size:.85rem',
      'line-height:1.55',
      'z-index:9999',
      'display:flex', 'align-items:center', 'gap:12px',
      'animation:tnPwaUp .25s ease both'
    ].join(';');
    banner.innerHTML = [
      '<style>@keyframes tnPwaUp{from{opacity:0;transform:translate(-50%,20px)}to{opacity:1;transform:translate(-50%,0)}}</style>',
      '<span style="font-size:1.6rem;flex-shrink:0;">📱</span>',
      '<div style="flex:1;min-width:0;">',
      '<div style="font-weight:700;color:#fff;margin-bottom:2px;">Terra Nova 홈 화면에 추가</div>',
      '<div style="font-size:.74rem;color:rgba(240,240,240,.7);">앱처럼 빠르게 실행하세요</div>',
      '</div>',
      '<button id="tn-pwa-install" style="background:#2DD4BF;color:#0A0A0A;border:none;padding:7px 14px;border-radius:6px;font-weight:700;font-size:.78rem;cursor:pointer;">설치</button>',
      '<button id="tn-pwa-dismiss" aria-label="닫기" style="background:none;color:rgba(240,240,240,.55);border:none;font-size:1.2rem;cursor:pointer;padding:4px 6px;">×</button>'
    ].join('');
    document.body.appendChild(banner);

    banner.querySelector('#tn-pwa-install').addEventListener('click', async () => {
      if (!deferredPrompt) return;
      banner.remove();
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
    });
    banner.querySelector('#tn-pwa-dismiss').addEventListener('click', () => {
      banner.remove();
      setState({ ...getState(), dismissedAt: Date.now() });
    });
  }
})();
