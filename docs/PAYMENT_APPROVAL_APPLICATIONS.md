# 카카오페이·NICE 정기결제 가맹 심사 신청 패키지

작성일: 2026-05-29

## 목표

Terra Nova 월간 정기결제를 카드번호 직접입력 대신 앱 인증 기반 결제로 제공하기 위해 다음 채널을 신청한다.

- 카카오페이 직접 빌링: `site-config.js`의 `card_kakao_billing`
- NICE Payments 간편결제 빌링: `site-config.js`의 `nice_kakao_billing`

승인 후 PortOne 콘솔에서 발급된 Channel Key를 각 항목에 입력하면 `order.html`에서 자동으로 활성화된다.

## 신청 전 사이트 점검

카카오페이 온라인 가맹점 신청 안내 기준으로 사이트에 다음 항목이 보여야 한다.

- 사업자정보: 상호, 대표자명, 사업자등록번호, 통신판매업 신고번호, 주소, 전화번호
- 상품/서비스 3개 이상 또는 명확한 요금제: LIGHT, STANDARD, PREMIUM 노출
- 이용약관
- 취소·환불 규정
- 결제가 가능한 사이트 URL

현재 반영 상태:

- 사업자정보: `site-config.js`의 `window.BUSINESS_INFO`에서 전역 표시
- 이용약관: `terms.html`
- 개인정보처리방침: `privacy.html`
- 환불·교환 정책: `refund.html`
- 주문/구독 화면: `order.html`
- FAQ: `faq.html`

## 공통 신청 정보

| 항목 | 입력값 |
| --- | --- |
| 상호 | Terra Nova |
| 한글 상호 | 테라노바 잉글리시 |
| 대표자 | 강성엽 |
| 사업자등록번호 | 160-50-01039 |
| 통신판매업 신고번호 | 제2026-서울마포-1110호 |
| 사업장 주소 | 서울특별시 마포구 백범로31길 8, 202동 2003호 (공덕동, 공덕SK리더스뷰) |
| 대표 연락처 | 010-8248-6428 |
| 대표 이메일 | support@terra-nova.kr |
| 사이트 URL | https://terra-nova.kr |
| 주문 URL | https://terra-nova.kr/order.html |
| 상품/서비스 | 온라인 영어 학습 PDF 교재 월간 구독 및 연간 이용권 |
| 업종 설명 | 전자상거래업 / 교육 서비스 |
| 결제 목적 | 월간 구독 자동결제 및 연간 1회 결제 |
| 디지털 콘텐츠 제공 방식 | 결제 완료 후 이메일 및 마이페이지에서 PDF 다운로드 제공 |
| 환불 안내 URL | https://terra-nova.kr/refund.html |
| 이용약관 URL | https://terra-nova.kr/terms.html |
| 개인정보처리방침 URL | https://terra-nova.kr/privacy.html |

## 준비 서류

개인사업자 기준으로 먼저 준비한다.

- 사업자등록증
- 대표자 명의 정산계좌 사본
- 대표자 신분증
- 통신판매업 신고증 또는 신고번호 확인 화면
- 사이트 캡처: 메인, 주문 화면, 환불정책, 사업자정보 푸터

카카오페이는 공식 안내에서 개인사업자 구비서류로 사업자등록증, 정산계좌, 대표자 신분증을 요구한다. NICE는 신청접수 후 계약구비서류 및 보증보험/전자계약 절차가 이어질 수 있다.

## 카카오페이 신청 절차

1. 카카오페이 파트너센터 온라인 쇼핑몰 가맹점 신청으로 이동한다.
2. 신청 유형은 `인터넷 쇼핑몰 운영`을 선택한다.
3. PortOne을 이용하므로 카카오페이 안내상 `호스팅사 또는 외부 결제 연동 서비스 이용` 유형을 우선 확인한다. 직접 API 연동형을 요구받으면 Terra Nova는 독립형 쇼핑몰로도 설명 가능하다.
4. 1차 신청 정보를 입력한다.
5. 카카오페이 1차 심사 메일을 기다린다.
6. 2차 신청 안내 URL에서 정산 정보와 서류를 첨부한다.
7. 승인/연동 안내 메일 수신 후 PortOne 콘솔에서 카카오페이 빌링 채널을 생성한다.
8. 발급된 Channel Key를 `site-config.js`의 `card_kakao_billing`에 입력한다.

신청 메모 문구:

```text
Terra Nova는 초중고 학생 대상 온라인 영어 학습 PDF 교재 구독 서비스입니다.
월간 구독은 매월 자동결제로 제공하며, 사용자는 결제 후 이메일 및 마이페이지에서 PDF 교재를 다운로드합니다.
카드번호 직접입력 대신 카카오페이 앱 인증 기반 정기결제를 제공하기 위해 카카오페이 빌링 결제수단 신청을 요청드립니다.
사이트에는 사업자정보, 이용약관, 개인정보처리방침, 환불정책을 공개하고 있습니다.
```

## NICE Payments 신청 절차

1. NICE PAY 서비스신청 페이지에서 온라인 PG 신청을 시작한다.
2. 계약 형태는 일반적으로 `대행 가맹점`으로 진행한다.
3. 결제수단은 카카오페이를 포함한 간편결제 및 정기결제/빌링 가능 여부를 요청사항에 명시한다.
4. 신청접수 후 NICE에서 안내하는 계약구비서류, 보증보험, 전자계약 절차를 진행한다.
5. 승인 후 PortOne 콘솔에서 NICE Payments V2 채널을 생성한다.
6. 발급된 Channel Key를 `site-config.js`의 `nice_kakao_billing`에 입력한다.

신청 메모 문구:

```text
온라인 영어 학습 PDF 교재 월간 구독 서비스의 자동결제를 위해 NICE Payments 간편결제 빌링 연동을 신청합니다.
PortOne V2를 통해 연동할 예정이며, 월간 구독의 빌링키 발급 및 정기 승인 처리가 필요합니다.
카카오페이 간편결제 빌링을 포함하여 사용자가 카드번호를 직접 입력하지 않는 결제 UX를 제공하고자 합니다.
```

## 승인 후 코드 반영

`site-config.js`:

```js
window.PORTONE_CHANNEL_KEYS = {
  card_kakao_billing: 'channel-key-카카오페이빌링',
  nice_kakao_billing: 'channel-key-NICE빌링',
  card_monthly: 'channel-key-bcea3c1d-7213-42ad-a549-e7c43ca80857',
  card_annual: 'channel-key-9982c887-52f5-40cc-ba7e-3af5a8b64f1e',
  card_inicis: 'channel-key-bcea3c1d-7213-42ad-a549-e7c43ca80857'
};
```

재배포 필요:

```bash
supabase functions deploy create-order
supabase functions deploy portone-webhook --no-verify-jwt
```

## 테스트 시나리오

1. `order.html?cycle=monthly&plan=LIGHT&level=JUPITER` 접속
2. 월간 정기결제 수단에서 카카오페이 또는 NICE 선택지가 `사용 가능`인지 확인
3. 테스트 결제 진행
4. PortOne 결제 이벤트 `BillingKey.Issued` 확인
5. Supabase `orders.status = paid` 확인
6. Supabase `subscriptions.portone_billing_key` 저장 확인
7. 결제 확인 이메일 및 PDF 발송 확인

## 공식 참고

- 카카오페이 온라인 쇼핑몰 가맹점 신청 안내: https://partner.kakaopay.com/partner/online/application-information?mall_type=standalone
- 카카오페이 개발자센터 온라인 결제: https://developers.kakaopay.com/docs/payment/online/common
- NICE PAY 서비스 신청/이용요금: https://www.nicepay.co.kr/apply/guide/fee.do
- PortOne PG 연동 설정: https://portone.gitbook.io/docs-en/console/pg
