-- =====================================================================
-- Terra Nova · v9 migration — admin 배송 워크플로우 + 운송장 추적
-- =====================================================================
-- 1. orders.tracking_number    : 운송장 번호 (택배사 발급)
-- 2. orders.shipping_courier   : 택배사 (CJ대한통운/한진/롯데/우체국 등)
-- 3. orders.shipped_by         : 발송 처리 admin (감사 추적)
-- 4. orders.delivered_at       : 배송 완료 시각
--
-- 적용: Supabase Studio > SQL Editor > 붙여넣기 > RUN
-- =====================================================================

alter table public.orders
  add column if not exists tracking_number text,
  add column if not exists shipping_courier text,
  add column if not exists shipped_by uuid references auth.users(id),
  add column if not exists delivered_at timestamptz;

comment on column public.orders.tracking_number is '운송장 번호 (admin이 입력)';
comment on column public.orders.shipping_courier is '택배사 코드 (cj|hanjin|lotte|epost|logen|kdexp|cu)';
comment on column public.orders.shipped_by is '발송 처리한 admin user_id (감사 추적)';
comment on column public.orders.delivered_at is '배송 완료(delivered) 처리 시각';

-- 인덱스: 발송 대기 주문 빠른 조회 (paid + 운송장 미입력)
create index if not exists orders_pending_shipment_idx on public.orders(created_at desc)
  where status = 'paid' and tracking_number is null;

-- admin에게 orders UPDATE 권한 부여
drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update" on public.orders
  for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

-- admin에게 subscriptions UPDATE 권한 부여 (수동 연장/취소/level 변경)
drop policy if exists "subscriptions_admin_update" on public.subscriptions;
create policy "subscriptions_admin_update" on public.subscriptions
  for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

-- admin에게 모든 orders/subscriptions/profiles SELECT 권한 부여
drop policy if exists "orders_admin_select_all" on public.orders;
create policy "orders_admin_select_all" on public.orders
  for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

drop policy if exists "subscriptions_admin_select_all" on public.subscriptions;
create policy "subscriptions_admin_select_all" on public.subscriptions
  for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

drop policy if exists "profiles_admin_select_all" on public.profiles;
create policy "profiles_admin_select_all" on public.profiles
  for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

-- level_test_results admin SELECT (dashboard용)
drop policy if exists "lvl_admin_select_all" on public.level_test_results;
create policy "lvl_admin_select_all" on public.level_test_results
  for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

-- =====================================================================
-- 검증
-- =====================================================================
-- select column_name from information_schema.columns
--   where table_name='orders' and column_name in ('tracking_number','shipping_courier','shipped_by','delivered_at');
-- select policyname from pg_policies where tablename in ('orders','subscriptions','profiles','level_test_results') and policyname like '%admin%';
