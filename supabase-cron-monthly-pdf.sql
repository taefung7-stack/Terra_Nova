-- =====================================================================
-- Terra Nova · 월간 PDF 자동 발송 cron 등록
-- =====================================================================
-- 매월 1일 09:00 KST (UTC 00:00) 에 dispatch-monthly-pdf Edge Function 호출.
--
-- 사전 조건:
--   1. v7 마이그레이션 완료 (subscriptions.level + monthly_pdf_dispatches)
--   2. dispatch-monthly-pdf 함수 배포
--   3. Vault에 INTERNAL_EMAIL_SECRET 저장:
--      Studio > Project Settings > Vault > "secrets" 테이블에 추가
--      또는: select vault.create_secret('실제_시크릿_값', 'internal_email_secret');
--
-- 등록 방법: Supabase Studio > SQL Editor > 붙여넣기 > RUN
-- =====================================================================

-- 0. pg_cron + pg_net 확장 활성화 (이미 켜져 있으면 no-op)
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net  with schema extensions;

-- 1. cron job 등록 — 매월 1일 00:00 UTC (= 09:00 KST)
select cron.schedule(
  'dispatch-monthly-pdf',
  '0 0 1 * *',  -- 매월 1일 00:00 UTC
  $$
  select net.http_post(
    url := 'https://betkydmxrnlhgmnprbca.functions.supabase.co/dispatch-monthly-pdf',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'internal_email_secret' limit 1),
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object('month', to_char(now(), 'YYYY-MM'))
  );
  $$
);

-- 2. cron 등록 확인
-- select jobname, schedule, active from cron.job where jobname = 'dispatch-monthly-pdf';

-- 3. 수동 트리거 (테스트용 — 즉시 한 번 실행)
-- select net.http_post(
--   url := 'https://betkydmxrnlhgmnprbca.functions.supabase.co/dispatch-monthly-pdf',
--   headers := jsonb_build_object(
--     'Authorization', 'Bearer <INTERNAL_EMAIL_SECRET 값>',
--     'Content-Type', 'application/json'
--   ),
--   body := jsonb_build_object('month', '2026-06')
-- );

-- =====================================================================
-- 비활성화 / 삭제
-- =====================================================================
-- select cron.unschedule('dispatch-monthly-pdf');
