# Supabase Edge Functions

## 포트원 심사 완료 후 배포 순서

### 1. Supabase CLI 설치 (최초 1회)
```bash
npm install -g supabase
supabase login
supabase link --project-ref betkydmxrnlhgmnprbca
```

### 2. 환경변수 설정
```bash
# 포트원 발급 값
supabase secrets set PORTONE_V2_API_SECRET=<포트원_API_시크릿>
supabase secrets set PORTONE_WEBHOOK_SECRET=<포트원_웹훅_시크릿>  # whsec_ 접두사 포함

# 자동 갱신 크론 인증용 (64자 이상 랜덤 문자열 추천)
# 예: openssl rand -hex 32   또는   uuidgen (Windows: [System.Guid]::NewGuid())
supabase secrets set RENEWAL_CRON_SECRET=<임의의_랜덤_문자열>
```
(포트원 값은 [포트원 관리자](https://admin.portone.io) > 내 상점 > API 키 에서 발급)

### 3. Edge Function 배포 (2개)
```bash
cd "c:/Users/user/OneDrive/Desktop/Terra Nova"
supabase functions deploy portone-webhook      --no-verify-jwt
supabase functions deploy renew-subscriptions  --no-verify-jwt
```

### 4. 포트원 대시보드에 웹훅 URL 등록
- URL: `https://betkydmxrnlhgmnprbca.supabase.co/functions/v1/portone-webhook`
- 이벤트: `Transaction.Paid`, `Transaction.Cancelled`, `BillingKey.Issued`

### 5. 프론트엔드 STORE_ID / CHANNEL_KEY 교체
`portone-client.js` 상단 상수값을 실제 값으로 교체

### 6. 월간 자동 결제 크론 등록 (최초 1회)
- `supabase-cron-renewal.sql` 파일 열기
- 파일 내 `REPLACE_WITH_ACTUAL_CRON_SECRET` 부분을 Step 2에서 설정한 `RENEWAL_CRON_SECRET` 값으로 교체
- Supabase SQL Editor에서 전체 실행
- 매일 KST 03:00에 만료 1일 이내 구독이 자동으로 갱신됨

### 7. 테스트 결제 (E2E)
- 포트원 테스트 모드 카드번호: `4242-4242-4242-4242` / 임의 값
- 실제 결제 후 Supabase `orders` 테이블에 `status: 'paid'` 행 생성 확인
- 구독 결제면 `subscriptions.last_order_id`가 방금 생성된 order를 참조해야 함

---

## Edge Function 구조

| Function              | 역할                                              | 트리거                       |
|-----------------------|--------------------------------------------------|------------------------------|
| `portone-webhook`     | 결제 완료/취소/빌링키 발급 이벤트 수신 → DB 기록 | 포트원 서버에서 HTTP POST    |
| `renew-subscriptions` | 만료 임박 구독을 billing key로 자동 결제 → 연장  | pg_cron 매일 KST 03:00       |

## 보안 체크리스트

- [x] `portone-webhook`: Standard Webhooks HMAC-SHA256 서명 검증 + 5분 타임스탬프 허용
- [x] `renew-subscriptions`: Bearer 토큰(`RENEWAL_CRON_SECRET`)으로 호출자 인증
- [x] 두 함수 모두 SERVICE_ROLE_KEY 사용 → RLS 우회하여 service 테이블 직접 조작 가능
- [x] 포트원 API 재조회로 클라이언트가 보낸 금액 신뢰 안 함 (웹훅 내 `fetchPayment`)
