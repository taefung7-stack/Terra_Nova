# PortOne (포트원) V2 결제 셋업 체크리스트

Terra Nova가 PortOne V2 SDK 기반으로 결제를 처리합니다. 아래 순서대로 진행하면 결제가 동작합니다.

---

## 0. 현재 상태 (2026-05-11)

- [x] 코드: order.html에 PortOne SDK + requestPayment 흐름 구현 완료
- [x] 코드: payment-complete.html (결제 완료 후 webhook 처리 폴링)
- [x] Edge Function: create-order (서버사이드 가격 검증)
- [x] Edge Function: portone-webhook (Standard Webhooks 서명 검증 + subscription 활성화)
- [ ] **PortOne 콘솔: PG 심사 통과 (현재 진행중)**
- [ ] **Supabase Secrets: PORTONE_V2_API_SECRET / PORTONE_WEBHOOK_SECRET 입력**
- [ ] **site-config.js: PORTONE_STORE_ID + PORTONE_CHANNEL_KEYS 입력**
- [ ] PortOne 콘솔에서 webhook URL 등록

키 미설정 상태에서는 order.html 결제수단 라디오가 자동으로 비활성화되고 "결제 시스템 준비중" 안내가 표시됩니다.

---

## 1. PortOne 콘솔 — Store ID 확인

위치: https://admin.portone.io → 좌측 사이드바 **결제 연동 → 결제 연동 정보**

- **Store ID**: `store-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX` 형태
- 클라이언트(브라우저)에 노출되는 공개값
- → `site-config.js` 의 `window.PORTONE_STORE_ID`에 붙여넣기

```js
window.PORTONE_STORE_ID = 'store-xxxxxxxx-xxxx-...';
```

---

## 2. PortOne 콘솔 — V2 API Secret 발급

위치: https://admin.portone.io → 좌측 사이드바 **결제 연동 → API Keys (또는 인증정보 / V2 API 인증정보)**

- **V2 API Secret** 항목의 "발급" 버튼 클릭 → 시크릿 복사
- 한 번 발급되면 다시 보이지 않으니 즉시 안전한 곳에 저장
- 서버에서만 쓰는 비밀값 (절대 클라이언트 코드에 넣지 말 것)

→ **Supabase Edge Function Secrets에 등록** (3번 항목 참고)

---

## 3. Supabase Edge Function Secrets — 환경변수 입력

위치: https://supabase.com/dashboard/project/betkydmxrnlhgmnprbca/settings/functions

좌측 Project Settings → Edge Functions → "Secrets" 섹션에서 "Add new secret" 클릭.

다음 키들을 등록:

| 키 이름 | 값 |
|--------|---|
| `PORTONE_V2_API_SECRET` | 위 2번에서 발급받은 V2 API Secret |
| `PORTONE_WEBHOOK_SECRET` | 4번 webhook 등록 후 발급되는 `whsec_...` 시크릿 |
| `INTERNAL_EMAIL_SECRET` | (선택) 결제 확인 이메일 발송용. 미설정 시 이메일만 skip되고 결제는 정상 처리 |

저장 즉시 모든 Edge Function이 새 값을 사용합니다 (재배포 불필요).

---

## 4. PortOne 콘솔 — Webhook 등록

위치: https://admin.portone.io → 좌측 **개발자 도구 → Webhook**

1. "엔드포인트 추가" 클릭
2. **URL**: `https://betkydmxrnlhgmnprbca.supabase.co/functions/v1/portone-webhook`
3. **활성화 이벤트**:
   - `Transaction.Paid` (결제 완료)
   - `Transaction.VirtualAccountIssued` (가상계좌 발급)
   - `Transaction.Cancelled` (결제 취소)
   - `BillingKey.Issued` (정기결제 빌링키 발급, 정기결제 도입 시)
4. 저장 후 "시크릿 키" 발급 → `whsec_...` 형식 → **3번 표의 PORTONE_WEBHOOK_SECRET에 입력**

> 주의: Webhook 시크릿은 발급 후 한 번만 보이므로 즉시 복사해서 Supabase Secrets에 입력.

---

## 5. PG 심사 통과 후 — 채널 키 입력

각 PG사 심사가 통과되면 PortOne 콘솔의 **결제 연동 → 결제 연동 정보 → 채널** 탭에 "Channel Key"가 발급됩니다.

site-config.js 의 다음 항목에 채널별로 입력:

```js
window.PORTONE_CHANNEL_KEYS = {
  kakaopay: 'channel-key-...',     // 카카오페이 채널 키
  naverpay: 'channel-key-...',     // 네이버페이 채널 키
  card_kcp: 'channel-key-...',     // KCP 신용카드 채널 키 (선택)
  card_inicis: 'channel-key-...'   // 이니시스 신용카드 채널 키 (선택)
};
```

**한 채널만 살아있어도 그 결제수단은 동작합니다.** 빈 문자열 채널은 order.html에서 자동으로 "준비중" 표시.

---

## 6. 동작 확인

1. 키 입력 후 `git add . && git commit -m "config: PortOne keys" && git push` (Github Pages 자동 배포 ~1분)
2. 시크릿창으로 https://terra-nova.kr/login.html 접속 → 로그인
3. https://terra-nova.kr/order.html → 플랜·레벨 선택 → 결제수단 라디오 활성화 확인
4. "구독 신청하기" → PortOne 결제창 호출 → 실제 카카오페이/네이버페이 화면
5. 테스트 결제 완료 → payment-complete.html 자동 이동 → "결제가 완료되었습니다 🎉" 표시
6. mypage.html에서 활성 구독 확인
7. Supabase Studio → orders 테이블 → status='paid' 행 확인
8. Supabase Studio → subscriptions 테이블 → status='active' 행 확인

---

## 7. 트러블슈팅

| 증상 | 원인 | 해결 |
|---|---|---|
| 결제수단 모두 "준비중" | site-config.js 에 키 미입력 | 1·5번 다시 확인 |
| "주문 생성에 실패했습니다" | create-order Edge Function 미배포 또는 RLS 막힘 | `supabase functions deploy create-order` |
| webhook 401 invalid signature | PORTONE_WEBHOOK_SECRET 불일치 또는 `whsec_` 누락 | 4번 시크릿 재발급 후 Supabase Secrets 갱신 |
| payment-complete 30초 폴링 후 "처리 지연" | webhook이 도달 못 하거나 PortOne 콘솔 webhook URL 오타 | 4번 URL 재확인, PortOne 콘솔 "이벤트 로그"에서 발송 시도 확인 |
| 결제창은 뜨는데 storeId/channelKey 에러 | site-config.js 값 오타 또는 빈 따옴표 | 1·5번 값 그대로 복붙했는지 확인 |

---

## 8. 가격 변경 시 동기화 위치

가격을 바꾸면 다음 3곳을 모두 수정해야 가격 위변조 검증이 통과됩니다.

1. `landing.html` — 노출 가격
2. `subscription_detail_complete.html` — 노출 가격
3. `supabase/functions/create-order/index.ts` 의 `PLAN_PRICES` 상수

`PLAN_PRICES`가 canonical 소스이므로 클라이언트가 다른 가격으로 결제 시도해도 서버가 거부합니다.
