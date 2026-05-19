# Terra Nova English — Supabase 설정 가이드

## 마이그레이션 실행 순서

Supabase 대시보드 → **SQL Editor** 로 이동 후 아래 순서로 각 파일 내용을 붙여넣어 실행합니다.

### 1단계: 인증 & 프로필 (`001_auth_and_profiles.sql`)

```sql
-- 핵심: profiles 테이블, handle_new_user 트리거, RLS
```

실행 후 확인:
```sql
SELECT count(*) FROM public.profiles;
-- → 0 (아직 회원 없으면 0, 기존 회원이 있다면 trigger가 retroactive하지 않으므로 아래 backfill 실행)

-- 기존 auth.users에 대해 profiles row 수동 생성 (처음 마이그레이션 시 한 번만)
INSERT INTO public.profiles (id, display_name)
SELECT id, raw_user_meta_data->>'display_name'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

SELECT policyname FROM pg_policies WHERE tablename = 'profiles';
SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

### 2단계: 구독 (`002_subscriptions.sql`)

실행 후 확인:
```sql
SELECT count(*) FROM public.subscriptions;
SELECT policyname FROM pg_policies WHERE tablename = 'subscriptions';
```

### 3단계: 핵심 테이블 일괄 (`003_level_test_orders_reviews_coupons.sql`)

이 파일 하나에 아래 테이블이 모두 포함됩니다:
- `level_test_results`
- `products`
- `orders` + `order_items`
- `reviews`
- `coupons` + `coupon_uses`
- `newsletter_subscribers`
- `monthly_pdf_dispatches`
- `validate_coupon` RPC 함수

실행 후 확인:
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
-- 아래 테이블 목록이 모두 보여야 합니다:
--   coupon_uses, coupons, level_test_results, monthly_pdf_dispatches,
--   newsletter_subscribers, order_items, orders, products, profiles,
--   reviews, subscriptions

SELECT proname FROM pg_proc WHERE proname = 'validate_coupon';
-- → validate_coupon 한 행
```

### 4단계: 스토리지 버킷 (`004_storage_buckets.sql`)

실행 후 확인:
```sql
SELECT id, name, public FROM storage.buckets ORDER BY id;
-- → review-proofs (public=false)
-- → sample-pdfs   (public=false)
-- → textbook-pdfs (public=false)
```

---

## Auth 설정 체크리스트 (Supabase 대시보드)

### Authentication → Settings

| 항목 | 권장 설정 |
|------|-----------|
| Email confirmations | **활성화** — 가입 시 이메일 인증 |
| Confirm email changes | 활성화 권장 |
| Secure email change | 활성화 권장 |
| Minimum password length | **8** 이상 |
| Password strength indicator | 활성화 권장 |

### Authentication → URL Configuration

Redirect URLs에 아래를 추가:
```
https://terra-nova.kr/**
http://localhost:5500/**   (로컬 개발용)
http://127.0.0.1:5500/**  (로컬 개발용)
```

Site URL:
```
https://terra-nova.kr
```

### Email Templates 커스터마이징 (선택)

Authentication → Email Templates에서 Confirm signup / Reset Password 이메일 디자인을 Terra Nova 브랜드로 변경할 수 있습니다.

---

## 소셜 OAuth 설정 가이드

### Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com) → 새 프로젝트 또는 기존 프로젝트 선택
2. APIs & Services → Credentials → OAuth 2.0 Client ID 생성
   - Application type: Web application
   - Authorized redirect URI: `https://betkydmxrnlhgmnprbca.supabase.co/auth/v1/callback`
3. Supabase 대시보드 → Authentication → Providers → Google
   - Client ID / Client Secret 입력 후 저장

### Kakao OAuth

1. [Kakao Developers](https://developers.kakao.com) → 앱 등록
2. 앱 설정 → 카카오 로그인 → 활성화
3. Redirect URI 등록: `https://betkydmxrnlhgmnprbca.supabase.co/auth/v1/callback`
4. Supabase → Authentication → Providers → Kakao 에 앱 키 입력

### Naver OAuth

현재 `naver-oauth` Edge Function이 별도 구현되어 있습니다.
Supabase Provider 탭에 Naver가 없으므로 커스텀 플로우를 사용합니다:
1. [Naver Developers](https://developers.naver.com) → 앱 등록
2. 서비스 URL: `https://terra-nova.kr`
3. Callback URL: `https://terra-nova.kr/naver-callback.html`
4. Supabase 대시보드 → Settings → Secrets 에 아래 추가:
   - `NAVER_CLIENT_ID`
   - `NAVER_CLIENT_SECRET`

---

## Edge Functions 환경변수 목록

Supabase 대시보드 → Settings → Edge Functions Secrets 에서 설정:

| 변수명 | 용도 | 필수 |
|--------|------|------|
| `PORTONE_V2_API_SECRET` | 포트원 결제 검증 | 결제 오픈 시 |
| `PORTONE_WEBHOOK_SECRET` | 웹훅 서명 검증 (`whsec_` 포함) | 결제 오픈 시 |
| `RENEWAL_CRON_SECRET` | 자동갱신 cron 인증 | 자동갱신 시 |
| `INTERNAL_EMAIL_SECRET` | 내부 이메일 함수 인증 | 이메일 발송 시 |
| `RESEND_API_KEY` | Resend 이메일 발송 | 이메일 발송 시 |
| `EMAIL_FROM` | 발신 이메일 주소 | 이메일 발송 시 |
| `SIGNED_URL_TTL_DAYS` | PDF 링크 유효기간 (기본 30) | 선택 |
| `NAVER_CLIENT_ID` | 네이버 OAuth | 소셜 로그인 시 |
| `NAVER_CLIENT_SECRET` | 네이버 OAuth | 소셜 로그인 시 |

---

## products 테이블 초기 데이터

마이그레이션 완료 후 products 테이블에 플랜 데이터 삽입 (renew-subscriptions에서 SKU로 조회):

```sql
INSERT INTO public.products (sku, name, price, is_active, requires_shipping) VALUES
  ('SUB-LIGHT-MONTHLY',    'Terra Nova LIGHT (월간)',    11900,  true, false),
  ('SUB-LIGHT-ANNUAL',     'Terra Nova LIGHT (연간)',   119000,  true, false),
  ('SUB-STANDARD-MONTHLY', 'Terra Nova STANDARD (월간)', 24900,  true, true),
  ('SUB-STANDARD-ANNUAL',  'Terra Nova STANDARD (연간)',249000,  true, true),
  ('SUB-PREMIUM-MONTHLY',  'Terra Nova PREMIUM (월간)',  58900,  true, false),
  ('SUB-PREMIUM-ANNUAL',   'Terra Nova PREMIUM (연간)', 589000,  true, false)
ON CONFLICT (sku) DO UPDATE SET
  price     = EXCLUDED.price,
  is_active = EXCLUDED.is_active;
```

---

## 관리자 계정 설정

첫 번째 관리자는 SQL로 직접 설정합니다 (회원가입 후):

```sql
-- 이메일로 user_id 찾기
SELECT id, email FROM auth.users WHERE email = 'your-admin@email.com';

-- is_admin = true 설정
UPDATE public.profiles SET is_admin = true WHERE id = '<복사한 user_id>';
```
