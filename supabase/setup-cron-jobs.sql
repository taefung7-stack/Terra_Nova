-- ============================================================
-- Terra Nova English — pg_cron 자동화 설정
-- 실행 위치: Supabase Dashboard → SQL Editor (한 번 실행)
--
-- 등록되는 cron 작업:
--   1. terra-monthly-pdf-dispatch — 매월 1일 KST 06:00 신간 PDF 발송
--   2. terra-renew-subscriptions  — 매일 KST 03:00 만료 임박 구독 자동 결제
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

SELECT cron.unschedule('terra-renew-subscriptions')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'terra-renew-subscriptions');

-- ── 2. 월간 PDF 발송 — 매월 1일 KST 06:00 (= UTC 21:00 전월 말일) ──
-- cron 표현식: 분 시 일 월 요일 (UTC 기준)
-- KST 06:00 = UTC 21:00 → 0 21 마지막날 * *  (월 단위라 1일 자정 발송이 가장 안전)
-- 여기서는 매월 1일 KST 06:00 = UTC 0일 21:00 으로 단순화: '0 21 1 * *'는 UTC 1일 21:00 = KST 2일 06:00
-- 따라서 KST 1일 06:00 발송: UTC 전월말일 21:00 → cron 으로 '0 21 L * *' L 미지원이라
-- 대안: '0 21 28-31 * *' + SQL 안에서 '내일이 1일?' 체크
-- 가장 안전: 매월 1일 KST 06:00 = UTC 0일 21:00 = '0 21 0 * *'는 invalid
-- → 단순하게 매월 1일 UTC 00:00 (= KST 09:00) 으로 변경
SELECT cron.schedule(
  'terra-monthly-pdf-dispatch',
  '0 0 1 * *',  -- 매월 1일 UTC 00:00 = KST 09:00
  $$
  SELECT net.http_post(
    url := 'https://_PROJECT_REF_.supabase.co/functions/v1/dispatch-monthly-pdf',
    headers := jsonb_build_object(
      'Authorization', 'Bearer _INTERNAL_EMAIL_SECRET_',
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object('month', to_char(now() AT TIME ZONE 'Asia/Seoul', 'YYYY-MM')),
    timeout_milliseconds := 600000  -- 10분 (구독자 많을 때 대비)
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
