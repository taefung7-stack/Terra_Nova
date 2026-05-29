// Terra Nova · 사이트 공개 설정 (클라이언트 노출 가능한 값만)
// ⚠️ SECRET은 절대 여기 넣지 말 것 — .env / Supabase Secrets 사용
// 사용법: 모든 HTML <head> 안에 `<script src="./site-config.js"></script>` 추가

window.NAVER_CLIENT_ID = 'jrpqX5SMmUskZT2AuJvE';

// ─────────────────────────────────────────────────────────────
// PortOne (포트원) V2 결제 SDK
// ⚠️ storeId / channelKey 는 클라이언트 노출 가능 (공개값).
//    API Secret / Webhook Secret 은 Supabase Edge Function Secrets 에만 보관.
// 설정 방법:
//   1. https://admin.portone.io 로그인 → 결제 연동 → 결제 연동 정보
//   2. "Store ID" 복사 → 아래 PORTONE_STORE_ID 에 붙여넣기 (예: 'store-xxxxxxxx-xxxx-...')
//   3. PG 심사 통과 후 채널별 "Channel Key" 발급되면 아래 항목 채우기
//   4. 미설정 채널은 빈 문자열 유지 → 결제창에서 자동으로 비활성화
// ─────────────────────────────────────────────────────────────
window.PORTONE_STORE_ID = 'store-bb4f1ef9-bd0f-444c-9315-5c5608a3c281';
// 운영 정책 (2026-05 기준): 일반결제는 KG이니시스, 월간 정기결제는 간편결제 빌링 우선
//   ✅ card_inicis  — KG이니시스 신용카드 (일반결제창 안에서 카드 + 간편결제 모두 선택 가능)
//   ✅ card_kakao_billing / nice_kakao_billing — 월간 정기결제용 앱 인증 빌링
// ── KG이니시스 MID 분리 (2026-05-28, 카드사 신규계약 입점조건 반영) ──
//   이니시스 정책상 정기결제는 월간만 지원 → 연간은 1회성 일반결제로 처리.
//   월간(정기결제)과 연간(일반결제)이 서로 다른 MID·채널을 사용한다.
//   ▸ 월간 = 정기결제 MID MOI2432342  (channel: bcea3c1d…)
//   ▸ 연간 = 일반결제 MID MOI5915678  (channel: 9982c887…)
// ── 월간 자동결제(빌링) 간편결제화 (2026-05-29) ──
//   KG이니시스 빌링은 카드 직접입력만 지원(앱카드/간편결제 불가, PortOne 문서 확인).
//   → 월간 정기결제를 '카카오페이/NICE 빌링(EASY_PAY)'으로 전환해 카드번호 입력 없는 자동결제 제공.
//   각 채널키는 PortOne 콘솔에서 PG별 가맹 신청·심사 후 발급받아 입력.
//   ▸ 간편결제 빌링 채널이 비어있으면 order.html 이 자동으로 KG이니시스 카드 빌링으로 폴백.
// 월간 정기결제 수단 선택 — order.html 이 채널키 있는 수단만 버튼으로 노출.
//   ▸ 카카오페이 빌링: card_kakao_billing (EASY_PAY + KAKAOPAY, 앱 인증 자동결제)
//   ▸ 카드(앱카드) 빌링: nice_card_billing (NICE CARD 빌링, ISP/페이북 등 앱카드 자동결제)
//   ▸ 폴백: card_monthly (KG이니시스 CARD 빌링, 카드 직접입력)
//   모두 비어있으면 KG 폴백으로 동작. 채널키 채우면 해당 수단 버튼 자동 노출.
window.PORTONE_CHANNEL_KEYS = {
  // 월간 정기결제 — 카카오페이 직접 빌링(EASY_PAY). ⬇️ 가맹 심사 후 채널키 입력
  card_kakao_billing: '',
  // 월간 정기결제 — NICE 카드 빌링(CARD, ISP/앱카드 자동결제). ⬇️ 가맹 심사 후 채널키 입력
  nice_card_billing: '',
  // 월간 정기결제 폴백 — KG이니시스 카드 빌링 (MID MOI2432342)
  card_monthly: 'channel-key-bcea3c1d-7213-42ad-a549-e7c43ca80857',
  // 연간 일반결제 1회성 (MID MOI5915678)
  card_annual:  'channel-key-9982c887-52f5-40cc-ba7e-3af5a8b64f1e',
  // 하위호환: 기존 card_inicis 참조 코드용 (월간 채널을 기본으로)
  card_inicis:  'channel-key-bcea3c1d-7213-42ad-a549-e7c43ca80857'
};
window.PORTONE_PAY_METHODS = {
  card: 'CARD'
};

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
  companyName: 'Terra Nova',                   // 상호 (KG이니시스 카드심사 요청: 'English' 삭제 — 사업자등록증 상호 '테라노바'와 일치)
  companyNameKo: '테라노바 잉글리시',          // 한글 상호 (있으면)
  representative: '강성엽',                     // 대표자 성명

  // ── 등록 번호 ──
  businessNumber: '160-50-01039',              // 사업자등록번호
  ecommerceNumber: '제2026-서울마포-1110호',     // 통신판매업 신고번호 (2026 마포구 수리 완료)

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
