-- =====================================================================
-- Terra Nova · v7 migration — subscriptions plan_code 정비 + 월간 PDF 인프라
-- =====================================================================
-- 1. subscriptions.plan_code: BASIC|ADVANCED|MASTER → LIGHT|STANDARD|PREMIUM
-- 2. subscriptions.level 컬럼 추가 (MARS|...|SUN)
-- 3. monthly_pdf_dispatches 테이블 (멱등성·중복 발송 차단)
-- 4. textbook-pdfs Storage 버킷 정책 (private + service_role 전용)
--
-- 적용: Supabase Studio > SQL Editor > 붙여넣기 > RUN
-- =====================================================================

-- 1. plan_code CHECK 갱신 (기존 row 백필)
do $$
begin
  -- 기존 row가 있으면 매핑: BASIC→LIGHT, ADVANCED→STANDARD, MASTER→PREMIUM
  update public.subscriptions set plan_code = case plan_code
    when 'BASIC' then 'LIGHT'
    when 'ADVANCED' then 'STANDARD'
    when 'MASTER' then 'PREMIUM'
    else plan_code
  end where plan_code in ('BASIC','ADVANCED','MASTER');
end $$;

alter table public.subscriptions
  drop constraint if exists subscriptions_plan_code_check;

alter table public.subscriptions
  add constraint subscriptions_plan_code_check
  check (plan_code in ('LIGHT','STANDARD','PREMIUM'));

-- 2. level 컬럼 추가 (학년별 매칭 학습 레벨)
alter table public.subscriptions
  add column if not exists level text
  check (level in ('MARS','VENUS','TERRA','NEPTUNE','URANUS','SATURN','JUPITER','SUN'));

comment on column public.subscriptions.level is '구독자가 매월 받을 학습 레벨 (8행성 중 하나)';
create index if not exists subs_level_idx on public.subscriptions(level) where status='active';

-- 3. 월간 PDF 발송 로그 (멱등성 보장 — 같은 월·user 조합 1회만)
create table if not exists public.monthly_pdf_dispatches (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  month text not null,                 -- 'YYYY-MM' 예: '2026-06'
  level text not null,                 -- 발송 시점의 레벨
  email text not null,
  signed_url text,                     -- 발송된 다운로드 URL (만료 시간 포함)
  email_status text not null default 'queued'
    check (email_status in ('queued','sent','failed')),
  error_message text,
  sent_at timestamptz,
  created_at timestamptz default now(),
  -- 같은 month·user 조합은 1회만
  unique (user_id, month)
);
comment on table public.monthly_pdf_dispatches is '월간 PDF 발송 로그 — 중복 발송 차단·실패 추적용';
create index if not exists mpd_month_idx on public.monthly_pdf_dispatches(month, email_status);
create index if not exists mpd_user_idx on public.monthly_pdf_dispatches(user_id, month desc);

-- RLS — 본인 발송 이력만 조회 가능 (admin은 admin RLS로 별도)
alter table public.monthly_pdf_dispatches enable row level security;
drop policy if exists "mpd_select_own" on public.monthly_pdf_dispatches;
create policy "mpd_select_own" on public.monthly_pdf_dispatches
  for select using (auth.uid() = user_id);
drop policy if exists "mpd_admin_all" on public.monthly_pdf_dispatches;
create policy "mpd_admin_all" on public.monthly_pdf_dispatches
  for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

-- 4. textbook-pdfs Storage 버킷 (private — service_role + signed URL만 접근)
-- ※ Supabase Studio Storage에서 직접 생성해도 됨. 이 SQL은 idempotent.
insert into storage.buckets (id, name, public)
  values ('textbook-pdfs', 'textbook-pdfs', false)
  on conflict (id) do nothing;

-- Storage RLS — service_role만 INSERT/UPDATE/DELETE, 일반 사용자는 SELECT 불가
-- (signed URL은 RLS 우회하므로 사용자는 Edge Function 통해서만 접근)
drop policy if exists "textbook_pdfs_service_only" on storage.objects;
create policy "textbook_pdfs_service_only" on storage.objects
  for all
  using (bucket_id = 'textbook-pdfs' and auth.role() = 'service_role')
  with check (bucket_id = 'textbook-pdfs' and auth.role() = 'service_role');

-- =====================================================================
-- 검증
-- =====================================================================
-- select column_name, data_type from information_schema.columns
--   where table_name='subscriptions' and column_name in ('plan_code','level');
-- select id, name, public from storage.buckets where id='textbook-pdfs';
