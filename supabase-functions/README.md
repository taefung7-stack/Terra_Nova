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
supabase secrets set PORTONE_V2_API_SECRET=<포트원_API_시크릿>
supabase secrets set PORTONE_WEBHOOK_SECRET=<포트원_웹훅_시크릿>
```
(값은 https://admin.portone.io > 내 상점 > API 키 에서 발급)

### 3. Edge Function 배포
```bash
cd "c:/Users/user/OneDrive/Desktop/Terra Nova"
supabase functions deploy portone-webhook --no-verify-jwt
```

### 4. 포트원 대시보드에 웹훅 URL 등록
- URL: `https://betkydmxrnlhgmnprbca.supabase.co/functions/v1/portone-webhook`
- 이벤트: `Transaction.Paid`, `Transaction.Cancelled`, `BillingKey.Issued`

### 5. 프론트엔드 STORE_ID / CHANNEL_KEY 교체
`portone-client.js` 상단 상수값을 실제 값으로 교체

### 6. 테스트 결제
- 포트원 테스트 모드 카드번호: `4242-4242-4242-4242` / 임의 값
- 실제 결제 후 Supabase `orders` 테이블에 `status: 'paid'` 행 생성 확인
