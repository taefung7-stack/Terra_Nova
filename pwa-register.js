// PWA 서비스 워커 등록 — 모든 페이지에서 자동 실행
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js', { scope: './' })
      .then((reg) => console.info('[pwa] SW registered:', reg.scope))
      .catch((err) => console.warn('[pwa] SW registration failed:', err));
  });
}
