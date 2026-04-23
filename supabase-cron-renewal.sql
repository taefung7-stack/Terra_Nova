-- ==========================================================
-- Terra Nova · 월간 자동 결제 pg_cron 스케줄러
-- 실행: Supabase SQL Editor에서 전체 붙여넣기 → RUN (한 번만)
-- ==========================================================
-- 전제 조건:
--   1. supabase-functions/renew-subscriptions Edge Function 배포 완료
--   2. supabase secrets set RENEWAL_CRON_SECRET=<임의의_64자리_랜덤_문자열> 실행 완료
--   3. 아래 PLACEHOLDER 값 2개를 실제 값으로 교체
-- ==========================================================

-- 1. 필요한 확장 활성화 (Supabase에는 기본 제공됨)
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net  with schema extensions;

-- 2. Supabase Vault에 크론 시크릿 저장 (원본값이 DB 로그에 남지 않도록)
-- ⚠️ 아래 두 값을 실제 값으로 교체하세요:
--    project_ref       → betkydmxrnlhgmnprbca (기존 프로젝트 ref, 변경 불필요)
--    cron_secret_value → RENEWAL_CRON_SECRET 과 동일한 값
insert into vault.secrets (name, secret)
values ('terra_nova_renewal_cron_secret', 'REPLACE_WITH_ACTUAL_CRON_SECRET')
on conflict (name) do update set secret = excluded.secret;

-- 3. 기존 스케줄 제거 (재실행 안전)
select cron.unschedule('terra_nova_daily_renewal')
  where exists (select 1 from cron.job where jobname = 'terra_nova_daily_renewal');

-- 4. 매일 03:00 KST (UTC 18:00) 실행 스케줄 등록
select cron.schedule(
  'terra_nova_daily_renewal',
  '0 18 * * *',  -- 매일 UTC 18:00 = KST 03:00
  $$
    select net.http_post(
      url := 'https://betkydmxrnlhgmnprbca.supabase.co/functions/v1/renew-subscriptions',
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer ' || (select decrypted_secret
                                         from vault.decrypted_secrets
                                         where name = 'terra_nova_renewal_cron_secret')
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 60000
    ) as request_id;
  $$
);

-- 5. 등록 확인
select jobid, jobname, schedule, active
from cron.job
where jobname = 'terra_nova_daily_renewal';

-- ==========================================================
-- 수동 실행 테스트 (선택사항):
--   select net.http_post(
--     url := 'https://betkydmxrnlhgmnprbca.supabase.co/functions/v1/renew-subscriptions',
--     headers := jsonb_build_object('Authorization', 'Bearer <RENEWAL_CRON_SECRET>'),
--     body := '{}'::jsonb
--   );
-- 실행 로그 확인:
--   select * from cron.job_run_details order by start_time desc limit 10;
-- ==========================================================
