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

// ─────────────────────────────────────────────────────────────
// 사업자 정보 (전자상거래법 제13조 의무 표시 항목)
// ⚠️ TODO 표시된 항목은 실제 값으로 교체하세요.
// 모든 페이지 푸터 / 약관 / 개인정보처리방침에서 이 객체를 참조합니다.
// ─────────────────────────────────────────────────────────────
window.BUSINESS_INFO = {
  // ── 기본 정보 ──
  companyName: 'Terra Nova English',          // 상호 (사업자등록증과 동일하게)
  companyNameKo: '테라노바 잉글리시',          // 한글 상호 (있으면)
  representative: '강성엽',                     // 대표자 성명

  // ── 등록 번호 ──
  businessNumber: '160-50-01039',              // 사업자등록번호
  ecommerceNumber: '제2026-서울____-____호',   // TODO: 통신판매업 신고번호 (수리 후 입력)

  // ── 연락처 ──
  address: '서울특별시 마포구 백범로31길 8',    // 사업장 주소 (홈택스 공식 표기)
  addressDetail: '202동 2003호 (공덕동, 공덕SK리더스뷰)',  // 상세주소
  phone: '010-8248-6428',                       // 대표 연락처
  email: 'support@terra-nova.kr',               // 대표 이메일
  kakaoChannel: '@TerraNovaEnglish',            // 카카오채널 (선택)

  // ── 책임자 ──
  privacyOfficer: {
    name: '강성엽',
    email: 'support@terra-nova.kr',
    phone: '010-8248-6428',
  },
  customerServiceOfficer: {                     // 소비자 분쟁/상담 책임자 (전상법 권장)
    name: '강성엽',
    email: 'support@terra-nova.kr',
    phone: '010-8248-6428',
  },

  // ── 호스팅·기술 ──
  hosting: 'GitHub Pages · Supabase Inc.',      // 호스트서버 소재지 (선택 표시)

  // ── 사업 종류 ──
  businessType: '온라인 학습지 구독 · 교재 판매',
  businessCategory: '전자상거래업 / 교육 서비스',

  // ── 정책 시행일 ──
  termsEffectiveDate: '2026-01-01',
  privacyEffectiveDate: '2026-01-01',
  privacyRevisionDate: '2026-04-21',
};
