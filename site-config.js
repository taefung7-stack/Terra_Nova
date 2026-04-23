// Terra Nova · 사이트 공개 설정 (클라이언트 노출 가능한 값만)
// ⚠️ SECRET은 절대 여기 넣지 말 것 — .env / Supabase Secrets 사용
// 사용법: 모든 HTML <head> 안에 `<script src="./site-config.js"></script>` 추가

window.NAVER_CLIENT_ID = 'jrpqX5SMmUskZT2AuJvE';
  // 설정 방법:
  // 1. https://developers.naver.com 로그인 → 애플리케이션 등록
  // 2. 서비스 URL: https://terra-nova.kr
  // 3. 네이버 아이디로 로그인 오픈 API 서비스 환경:
  //    - PC 웹 · https://terra-nova.kr
  //    - Callback URL: https://terra-nova.kr/naver-callback.html
  // 4. 제공 정보: 이메일(필수), 이름, 프로필이미지, 휴대전화
  // 5. 앱 등록 완료 후 "Client ID"만 위에 교체 (Secret은 Supabase Edge Function 환경변수로)
