-- =====================================================================
-- Terra Nova · v10 migration — RLS 무한재귀 버그 수정
-- =====================================================================
-- 문제:
--   v9의 profiles_admin_select_all 정책이
--     using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true))
--   형태로 되어 있어, profiles SELECT 정책 안에서 profiles를 다시 SELECT 하면서
--   "infinite recursion detected in policy for relation 'profiles'" 에러 발생.
--
--   동일한 패턴이 orders/subscriptions/level_test_results/coupons/reviews/monthly_pdf_dispatches
--   admin 정책 9개 모두에 사용되어, 로그인 후 profile fetch가 깨지면서
--   "로그인 중..." 스피너에서 멈춤 + admin 빈 화면 발생.
--
-- 해결:
--   SECURITY DEFINER 함수 public.is_admin(uid)로 RLS를 우회해서
--   재귀 없이 admin 여부 확인. 모든 admin 정책을 이 함수로 재작성.
--
-- 적용: Supabase Studio > SQL Editor > 붙여넣기 > RUN
-- =====================================================================

-- =====================================================================
-- 1. SECURITY DEFINER 함수 - RLS를 우회하여 admin 여부만 반환
-- =====================================================================
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = uid), false);
$$;

comment on function public.is_admin(uuid) is
  'RLS 우회용 admin 체크 함수. profiles 정책 안에서 profiles를 조회할 때 무한재귀 방지용.';

revoke all on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to authenticated, anon, service_role;

-- =====================================================================
-- 2. profiles 정책 재작성
-- =====================================================================
drop policy if exists "profiles_admin_select_all" on public.profiles;
create policy "profiles_admin_select_all" on public.profiles
  for select
  using (public.is_admin(auth.uid()));

-- 본인 profile은 항상 조회 가능 (혹시 본인 SELECT 정책이 빠져 있을 경우 대비)
drop policy if exists "profiles_self_select" on public.profiles;
create policy "profiles_self_select" on public.profiles
  for select
  using (auth.uid() = id);

-- =====================================================================
-- 3. orders 정책 재작성
-- =====================================================================
drop policy if exists "orders_admin_select_all" on public.orders;
create policy "orders_admin_select_all" on public.orders
  for select
  using (public.is_admin(auth.uid()));

drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update" on public.orders
  for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- =====================================================================
-- 4. subscriptions 정책 재작성
-- =====================================================================
drop policy if exists "subscriptions_admin_select_all" on public.subscriptions;
create policy "subscriptions_admin_select_all" on public.subscriptions
  for select
  using (public.is_admin(auth.uid()));

drop policy if exists "subscriptions_admin_update" on public.subscriptions;
create policy "subscriptions_admin_update" on public.subscriptions
  for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- =====================================================================
-- 5. level_test_results 정책 재작성
-- =====================================================================
drop policy if exists "lvl_admin_select_all" on public.level_test_results;
create policy "lvl_admin_select_all" on public.level_test_results
  for select
  using (public.is_admin(auth.uid()));

-- =====================================================================
-- 6. monthly_pdf_dispatches 정책 재작성 (v7에서 만든 정책)
-- =====================================================================
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'monthly_pdf_dispatches') then
    drop policy if exists "mpd_admin_all" on public.monthly_pdf_dispatches;
    execute 'create policy "mpd_admin_all" on public.monthly_pdf_dispatches for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()))';
  end if;
end $$;

-- =====================================================================
-- 7. reviews admin 정책 재작성 (v3에서 만든 정책)
-- =====================================================================
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'reviews') then
    drop policy if exists "reviews_admin_publish" on public.reviews;
    execute 'create policy "reviews_admin_publish" on public.reviews for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()))';

    drop policy if exists "reviews_admin_select_all" on public.reviews;
    execute 'create policy "reviews_admin_select_all" on public.reviews for select using (public.is_admin(auth.uid()))';
  end if;
end $$;

-- =====================================================================
-- 8. coupons admin 정책 재작성 (v4에서 만든 정책 - 테이블이 있을 경우만)
-- =====================================================================
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'coupons') then
    drop policy if exists "coupons_admin_all" on public.coupons;
    execute 'create policy "coupons_admin_all" on public.coupons for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()))';
  end if;

  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'coupon_redemptions') then
    drop policy if exists "coupon_redemptions_admin_all" on public.coupon_redemptions;
    execute 'create policy "coupon_redemptions_admin_all" on public.coupon_redemptions for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()))';
  end if;
end $$;

-- =====================================================================
-- 검증
-- =====================================================================
-- 1) 함수 존재 확인
-- select proname, prosecdef from pg_proc where proname = 'is_admin';
--   -> prosecdef = true 이어야 함 (security definer)
--
-- 2) 어드민 본인이 직접 호출 (jwt가 있는 환경에서)
-- select public.is_admin(auth.uid());
--   -> true 반환되어야 함
--
-- 3) 재귀 없이 본인 profile 조회
-- select id, email, is_admin from public.profiles where id = auth.uid();
--   -> 한 행 반환 (에러 없이)
--
-- 4) admin이 모든 profiles 조회
-- select count(*) from public.profiles;
--   -> 전체 행 수 반환 (admin 일 때)
--
-- 5) 정책 목록 확인
-- select tablename, policyname from pg_policies
--   where policyname like '%admin%' order by tablename, policyname;
