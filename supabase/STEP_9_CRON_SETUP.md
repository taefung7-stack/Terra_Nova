# Step 9 — dispatch-monthly-pdf 자동화 설정 가이드

## 📋 목적

매월 1일 KST 09:00에 모든 활성 구독자에게 자동으로 신간 PDF 발송.
+ 매일 KST 03:00에 만료 임박 구독 자동 결제.

## ✅ 사전 점검

### 1. Edge Functions 배포 확인

Supabase Dashboard → Edge Functions 에 다음 함수가 있어야 합니다:

| Function | 상태 |
|----------|------|
| `dispatch-monthly-pdf` | ✅ 배포됨 |
| `renew-subscriptions` | ✅ 배포됨 |
| `send-email` | ✅ 배포됨 (monthly_pdf 타입 핸들러 포함) |

배포 명령:
```bash
supabase functions deploy dispatch-monthly-pdf --no-verify-jwt
supabase functions deploy renew-subscriptions --no-verify-jwt
supabase functions deploy send-email --no-verify-jwt
```

### 2. Secrets 설정 확인

Supabase Dashboard → Edge Functions → Secrets:

| Secret | 용도 |
|--------|------|
| `INTERNAL_EMAIL_SECRET` | cron 인증 + send-email 내부 호출 |
| `RENEWAL_CRON_SECRET` | renew-subscriptions cron 인증 |
| `RESEND_API_KEY` | 이메일 발송 |
| `PORTONE_V2_API_SECRET` | PortOne API 호출 |

### 3. Storage 버킷 확인

Supabase Dashboard → Storage:

| 버킷 | 상태 | 용도 |
|------|------|------|
| `review-proofs` | ✅ private | 리뷰 인증 사진 (5MB) |
| `textbook-pdfs` | ✅ private | 월간 PDF (100MB) |
| `sample-pdfs` | ✅ private | 무료 샘플 PDF (50MB) |

### 4. PDF 업로드 폴더 규약

`textbook-pdfs` 버킷 내부 구조:

```
textbook-pdfs/
├── 2026-06/
│   ├── 2026-06-MARS.pdf
│   ├── 2026-06-VENUS.pdf
│   ├── 2026-06-TERRA.pdf
│   ├── 2026-06-NEPTUNE.pdf
│   ├── 2026-06-URANUS.pdf
│   ├── 2026-06-SATURN.pdf
│   ├── 2026-06-JUPITER.pdf
│   └── 2026-06-SUN.pdf
└── 2026-07/
    └── ...
```

> ⚠️ 파일이 누락된 레벨은 `dispatch-monthly-pdf` 가 자동으로 `failed` 로
> 기록하고 다른 사용자 처리를 계속합니다. 매월 말일 전에 8개 레벨 모두 업로드 필수.

## 🚀 cron 등록 절차

### Step 1. 확장 활성화

Supabase Dashboard → Database → Extensions 에서 다음 2개 확장이 켜져 있는지 확인:

- ✅ `pg_cron`
- ✅ `pg_net`

꺼져 있으면 토글로 켭니다.

### Step 2. SQL Editor 에서 cron 등록

1. Supabase Dashboard → SQL Editor 열기
2. `supabase/setup-cron-jobs.sql` 파일 전체 복사
3. 아래 3개 placeholder 를 실제 값으로 교체:
   - `_PROJECT_REF_` → `betkydmxrnlhgmnprbca`
   - `_INTERNAL_EMAIL_SECRET_` → Edge Functions Secrets 의 값
   - `_RENEWAL_CRON_SECRET_` → Edge Functions Secrets 의 값
4. 전체 SELECT → Run

성공 시 마지막 SELECT 결과로 2개 작업이 나옵니다:

```
jobid | schedule       | jobname                       | command (앞 일부)
------|----------------|-------------------------------|------------------
  1   | 0 0 1 * *      | terra-monthly-pdf-dispatch    | SELECT net.http_post(...)
  2   | 0 18 * * *     | terra-renew-subscriptions     | SELECT net.http_post(...)
```

### Step 3. 즉시 수동 테스트 (선택)

다음 달 1일을 기다리지 않고 곧장 테스트:

```sql
-- 현재 월 PDF 발송 트리거
SELECT net.http_post(
  url := 'https://betkydmxrnlhgmnprbca.supabase.co/functions/v1/dispatch-monthly-pdf',
  headers := jsonb_build_object(
    'Authorization', 'Bearer ' || current_setting('app.internal_email_secret', true),
    'Content-Type', 'application/json'
  ),
  body := jsonb_build_object('month', '2026-06')
);
```

또는 admin.html 에서 "월간 PDF 발송" 버튼 클릭 (관리자 JWT 인증).

### Step 4. 실행 이력 확인

```sql
-- 최근 10건 실행 결과
SELECT
  j.jobname,
  d.start_time AT TIME ZONE 'Asia/Seoul' AS kst,
  d.status,
  d.return_message
FROM cron.job_run_details d
JOIN cron.job j ON j.jobid = d.jobid
WHERE j.jobname IN ('terra-monthly-pdf-dispatch', 'terra-renew-subscriptions')
ORDER BY d.start_time DESC
LIMIT 10;
```

또는 `monthly_pdf_dispatches` 테이블 직접 조회:

```sql
SELECT month, email_status, count(*)
FROM monthly_pdf_dispatches
WHERE month = to_char(now() AT TIME ZONE 'Asia/Seoul', 'YYYY-MM')
GROUP BY month, email_status;
```

## 🛡️ 멱등성 보장

- `dispatch-monthly-pdf` 는 `monthly_pdf_dispatches.unique(user_id, month)` 제약으로
  같은 월 발송을 중복 처리하지 않음 (이미 `sent` 상태인 row 는 skip).
- cron 이 어떤 사유로 같은 날 두 번 실행되어도 안전.

## ⚠️ 자주 발생하는 오류

| 증상 | 원인 | 해결 |
|------|------|------|
| `401 Unauthorized` | Bearer 토큰 불일치 | SQL 안의 `_INTERNAL_EMAIL_SECRET_` 가 Secrets 값과 다른지 재확인 |
| `Signed URL failed: PDF not found` | textbook-pdfs 버킷에 해당 월/레벨 파일 없음 | 매월 말일 전에 8개 레벨 모두 업로드 |
| `extension "pg_cron" does not exist` | Extension 미활성화 | Dashboard → Database → Extensions 에서 켜기 |
| 실행은 되는데 결과가 0 | 활성 구독자가 없거나 모두 이미 발송됨 | `subscriptions.status='active' AND expires_at>now()` 인 row 가 있는지 확인 |
| `monthly_pdf_dispatches` 에 `failed` 행 누적 | RLS 정책 또는 storage 권한 문제 | 008_storage_rls_use_is_admin_helper.sql 실행 |

## 📊 완료 체크리스트

- [ ] 008 마이그레이션 실행 (storage RLS is_admin 헬퍼 적용)
- [ ] pg_cron / pg_net 확장 활성화
- [ ] setup-cron-jobs.sql 의 3개 placeholder 교체 후 실행
- [ ] cron.job 테이블에 2개 작업 등록 확인
- [ ] 수동 테스트 실행 (선택)
- [ ] 6월 PDF 8개 레벨 모두 textbook-pdfs 에 업로드
