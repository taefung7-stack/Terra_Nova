-- ============================================================
-- Terra Nova English — pg_cron 자동화 설정 (2026-05-24 정책 정정)
-- 실행 위치: Supabase Dashboard → SQL Editor (한 번 실행)
--
-- 운영 정책 (정정):
--   ❌ 이전: 매월 1일에 모든 구독자 일괄 발송
--   ✅ 현재: 결제일 기준 발송
--          - 결제·자동갱신 직후 즉시 발송 (webhook에서 직접 호출)
--          - 매일 09:00 안전망 cron 으로 누락분 자동 retry
--
-- 등록되는 cron 작업:
--   1. terra-monthly-pdf-safetynet — 매일 KST 09:00 안전망 (누락 사용자 발송)
--   2. terra-renew-subscriptions   — 매일 KST 03:00 만료 임박 구독 자동 결제
--
-- 사전 준비:
--   1. Supabase Dashboard → Database → Extensions 에서 `pg_cron`, `pg_net` 활성화
--   2. Edge Functions Secrets 에 INTERNAL_EMAIL_SECRET 및 RENEWAL_CRON_SECRET 등록 확인
--
-- ⚠️ 아래 _PROJECT_REF_ 와 _INTERNAL_EMAIL_SECRET_ / _RENEWAL_CRON_SECRET_ 부분만
--    실제 값으로 교체 후 전체 실행하세요.
-- ============================================================

-- ── 0. 확장 활성화 (이미 켜져 있으면 noop) ─────────────────────
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ── 1. 기존 작업 제거 (재실행 안전) ───────────────────────────
SELECT cron.unschedule('terra-monthly-pdf-dispatch')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'terra-monthly-pdf-dispatch');

SELECT cron.unschedule('terra-monthly-pdf-safetynet')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'terra-monthly-pdf-safetynet');

SELECT cron.unschedule('terra-renew-subscriptions')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'terra-renew-subscriptions');

-- ── 2. PDF 발송 안전망 — 매일 KST 09:00 ────────────────────
-- 정상 흐름: 결제·자동갱신 webhook 이 즉시 PDF 발송 → 이 cron 은 누락분만 처리
-- 멱등성: dispatch-monthly-pdf 가 month+userId 기준으로 중복 발송 자동 skip
-- 결제일 기준 발송 정책: userId 미지정 시 active 구독 전체 중 그달 미발송자만 발송
SELECT cron.schedule(
  'terra-monthly-pdf-safetynet',
  '0 0 * * *',  -- 매일 UTC 00:00 = KST 09:00
  $$
  SELECT net.http_post(
    url := 'https://_PROJECT_REF_.supabase.co/functions/v1/dispatch-monthly-pdf',
    headers := jsonb_build_object(
      'Authorization', 'Bearer _INTERNAL_EMAIL_SECRET_',
      'Content-Type', 'application/json'
    ),
    -- body 비워두면 month=현재 월, userId 없음 → 활성 구독자 전체 중 미발송자만 발송
    body := jsonb_build_object('month', to_char(now() AT TIME ZONE 'Asia/Seoul', 'YYYY-MM')),
    timeout_milliseconds := 600000
  );
  $$
);

-- ── 3. 만료 임박 구독 자동 결제 — 매일 KST 03:00 (= UTC 18:00 전날) ──
SELECT cron.schedule(
  'terra-renew-subscriptions',
  '0 18 * * *',  -- 매일 UTC 18:00 = KST 03:00
  $$
  SELECT net.http_post(
    url := 'https://_PROJECT_REF_.supabase.co/functions/v1/renew-subscriptions',
    headers := jsonb_build_object(
      'Authorization', 'Bearer _RENEWAL_CRON_SECRET_',
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object('dryRun', false),
    timeout_milliseconds := 300000  -- 5분
  );
  $$
);

-- ── 4. 검증 쿼리 ─────────────────────────────────────────────
-- 등록된 cron 작업 확인
SELECT jobid, schedule, jobname, command FROM cron.job
WHERE jobname IN ('terra-monthly-pdf-dispatch', 'terra-renew-subscriptions')
ORDER BY jobname;

-- 최근 실행 이력 (자동 갱신 후 확인용)
-- SELECT * FROM cron.job_run_details
-- WHERE jobname IN ('terra-monthly-pdf-dispatch', 'terra-renew-subscriptions')
-- ORDER BY start_time DESC LIMIT 10;

-- ── 5. 수동 즉시 테스트 (선택) ───────────────────────────────
-- 아래 SELECT 를 별도 실행하면 cron 대기 없이 즉시 함수 호출됨.
--
-- SELECT net.http_post(
--   url := 'https://_PROJECT_REF_.supabase.co/functions/v1/dispatch-monthly-pdf',
--   headers := jsonb_build_object(
--     'Authorization', 'Bearer _INTERNAL_EMAIL_SECRET_',
--     'Content-Type', 'application/json'
--   ),
--   body := jsonb_build_object('month', '2026-06')
-- );

-- ============================================================
-- 교체 가이드:
--   _PROJECT_REF_           → betkydmxrnlhgmnprbca  (Supabase 프로젝트 ref)
--   _INTERNAL_EMAIL_SECRET_ → Edge Functions Secrets 의 INTERNAL_EMAIL_SECRET 값
--   _RENEWAL_CRON_SECRET_   → Edge Functions Secrets 의 RENEWAL_CRON_SECRET 값
-- ============================================================
