// Terra Nova · Sentry 에러 트래킹 초기화 (공용)
// 사용법: 각 HTML 페이지에 analytics.js와 같은 방식으로 로드
// <script src="./sentry-init.js" defer></script>
//
// 설정 방법:
// 1. https://sentry.io 계정 생성 (무료 플랜: 월 5,000 events)
// 2. New Project > Browser JavaScript 선택 → DSN 복사
// 3. 아래 SENTRY_DSN 값 교체
// 4. 프로덕션 배포
//
// ⚠️ DSN은 클라이언트에 노출되어도 안전함 (발송 전용 공개 키).
//    Source Map 업로드는 별도 Auth Token 필요.

(function () {
  const SENTRY_DSN = 'https://REPLACE_AFTER_SENTRY_SIGNUP@o0.ingest.sentry.io/0';
  const IS_PLACEHOLDER = SENTRY_DSN.includes('REPLACE_AFTER');
  if (IS_PLACEHOLDER) return; // Sentry 미설정 시 로드 스킵 (콘솔 에러 방지)

  // CDN에서 Sentry SDK 로드 (Browser SDK v7)
  const script = document.createElement('script');
  script.src = 'https://browser.sentry-cdn.com/7.120.0/bundle.tracing.min.js';
  script.crossOrigin = 'anonymous';
  script.integrity = 'sha384-auto'; // 실제 값은 Sentry 문서 참조
  script.onload = function () {
    if (typeof Sentry === 'undefined') return;
    Sentry.init({
      dsn: SENTRY_DSN,
      // 릴리스 식별 (배포마다 업데이트 권장)
      release: 'terra-nova@2026-04-23',
      environment: location.hostname === 'terra-nova.kr' ? 'production' : 'staging',

      // 샘플링: 에러는 100%, 성능은 10% (트래픽 늘면 조정)
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.0, // 세션 리플레이 off (비용 절약)
      replaysOnErrorSampleRate: 1.0, // 에러 발생 세션만 리플레이

      // 개인정보 보호
      beforeSend(event) {
        // 비밀번호 필드값 제거
        if (event.request?.data && typeof event.request.data === 'object') {
          const data = event.request.data;
          ['password', 'new_password', 'current_password', 'confirm_password'].forEach(k => {
            if (data[k]) data[k] = '[Filtered]';
          });
        }
        // URL에서 민감한 쿼리 파라미터 제거
        if (event.request?.url) {
          event.request.url = event.request.url.replace(/access_token=[^&]+/, 'access_token=[Filtered]');
        }
        return event;
      },

      // 무시할 에러 (노이즈 차단)
      ignoreErrors: [
        // 브라우저 확장프로그램 에러
        'ResizeObserver loop',
        'Non-Error promise rejection captured',
        // 취소된 fetch
        'AbortError',
        // 네트워크 차단
        'Failed to fetch',
        // Supabase SDK eval warning (기능 이슈 아님)
        /Content Security Policy.*eval/i
      ],

      // 디버그
      debug: false
    });

    // 로그인된 사용자 태깅 (Supabase 연동 후)
    if (window.supabase?.auth) {
      window.supabase.auth.getUser().then(({ data }) => {
        if (data?.user) {
          Sentry.setUser({
            id: data.user.id,
            email: data.user.email
          });
        }
      }).catch(() => {});
    }
  };
  script.onerror = () => console.warn('[sentry] SDK 로드 실패');
  document.head.appendChild(script);
})();
