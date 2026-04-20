// Terra Nova · 분석 초기화 (단일 파일 관리)
// 각 HTML에 <script src="analytics.js"></script> 한 줄만 추가하면 GA4 + Clarity 동시 적용됨
//
// 🚨 설치 후 아래 2개 ID 교체 필수:
// - GA_ID    = "G-XXXXXXXXXX" (Google Analytics 4 측정 ID)
// - CLARITY_ID = "xxxxxxxxxx" (Microsoft Clarity 프로젝트 ID)

(function() {
  const GA_ID = 'G-XXXXXXXXXX';         // TODO: 교체
  const CLARITY_ID = 'REPLACE_CLARITY'; // TODO: 교체

  // 개발 모드 (localhost)에서는 추적 비활성화
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    console.info('[analytics] dev mode — tracking disabled');
    return;
  }

  // --- GA4 ---
  if (GA_ID && !GA_ID.includes('XXXXX')) {
    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(gaScript);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
  }

  // --- Clarity ---
  if (CLARITY_ID && !CLARITY_ID.includes('REPLACE')) {
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", CLARITY_ID);
  }

  // 커스텀 이벤트 헬퍼 (전역)
  window.trackEvent = function(eventName, params = {}) {
    if (window.gtag) gtag('event', eventName, params);
    if (window.clarity) clarity('event', eventName);
  };
})();
