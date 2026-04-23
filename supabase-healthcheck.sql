-- ==========================================================
-- Terra Nova · Supabase 백엔드 상태 진단 스크립트 (통합 버전)
-- 실행: Supabase SQL Editor에 전체 붙여넣기 → RUN
-- 결과: 단일 테이블에 모든 진단 결과가 섹션별로 정렬되어 출력됨
-- ==========================================================

with
-- [1] 테이블 존재 여부
t_tables as (
  select
    1 as ord,
    '1. TABLES' as section,
    e.name as item,
    case when t.table_name is null then '❌ MISSING' else '✅ EXISTS' end as status,
    null::text as detail
  from (values
    ('profiles'),('products'),('orders'),('order_items'),
    ('subscriptions'),('level_test_results'),
    ('reviews'),('newsletter_subscribers')
  ) e(name)
  left join information_schema.tables t
    on t.table_schema='public' and t.table_name=e.name
),
-- [2] RLS 활성화 여부
t_rls as (
  select
    2 as ord,
    '2. RLS ENABLED' as section,
    c.relname as item,
    case when c.relrowsecurity then '✅ ON' else '❌ OFF' end as status,
    null::text as detail
  from pg_class c
  join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public'
    and c.relname in ('profiles','products','orders','order_items',
      'subscriptions','level_test_results','reviews','newsletter_subscribers')
),
-- [3] RLS 정책 개수 (기대치와 비교)
t_policies as (
  select
    3 as ord,
    '3. RLS POLICIES' as section,
    tablename as item,
    case
      when (tablename='profiles' and count(*)>=3) then '✅ ' || count(*) || ' policies'
      when (tablename='reviews' and count(*)>=4) then '✅ ' || count(*) || ' policies'
      when (tablename='level_test_results' and count(*)>=2) then '✅ ' || count(*) || ' policies'
      when count(*)>=1 then '✅ ' || count(*) || ' policies'
      else '⚠️ ' || count(*) || ' (check expected)'
    end as status,
    string_agg(policyname, ', ' order by policyname) as detail
  from pg_policies
  where schemaname='public'
  group by tablename
),
-- [4] 시드 데이터 / 사용자 수
t_data as (
  select 4 as ord, '4. DATA COUNTS' as section, 'products' as item,
    (select count(*)||' rows (active: '||count(*) filter(where is_active=true)||')' from public.products) as status,
    'expected 9 rows (6 subscription + 3 vocab)'::text as detail
  union all
  select 4, '4. DATA COUNTS', 'reviews',
    (select count(*)||' rows (published: '||count(*) filter(where is_published=true)||')' from public.reviews),
    'expected 3 published seed reviews'
  union all
  select 4, '4. DATA COUNTS', 'newsletter_subscribers',
    (select count(*)::text||' rows' from public.newsletter_subscribers),
    'email signups'
  union all
  select 4, '4. DATA COUNTS', 'orders',
    (select count(*)||' rows (paid: '||count(*) filter(where status='paid')||')' from public.orders),
    'total orders'
  union all
  select 4, '4. DATA COUNTS', 'subscriptions',
    (select count(*)||' rows (active: '||count(*) filter(where status='active')||')' from public.subscriptions),
    'user subscriptions'
  union all
  select 4, '4. DATA COUNTS', 'profiles',
    (select count(*)::text||' rows' from public.profiles),
    'should match auth.users'
  union all
  select 4, '4. DATA COUNTS', 'auth.users',
    (select count(*)::text||' rows' from auth.users),
    'signed-up users'
),
-- [5] 트리거 확인
t_triggers as (
  select
    5 as ord,
    '5. TRIGGERS' as section,
    e.name as item,
    case when tr.trigger_name is null then '❌ MISSING' else '✅ EXISTS' end as status,
    coalesce(tr.event_object_schema || '.' || tr.event_object_table, 'N/A')::text as detail
  from (values ('on_auth_user_created'),('profiles_updated_at')) e(name)
  left join information_schema.triggers tr
    on tr.trigger_name=e.name
),
-- [6] 함수 확인
t_functions as (
  select
    6 as ord,
    '6. FUNCTIONS' as section,
    e.name as item,
    case when p.proname is null then '❌ MISSING'
         when p.prosecdef then '✅ SECURITY DEFINER'
         else '⚠️ SECURITY INVOKER (handle_new_user needs DEFINER)' end as status,
    null::text as detail
  from (values ('handle_new_user'),('set_updated_at')) e(name)
  left join pg_proc p on p.proname=e.name
  left join pg_namespace n on n.oid=p.pronamespace and n.nspname='public'
),
-- [7] 결제 무결성 체크
t_integrity as (
  select
    7 as ord,
    '7. INTEGRITY' as section,
    'Paid orders w/o subscription link' as item,
    case when count(*)=0 then '✅ 0' else '❌ ' || count(*) || ' broken' end as status,
    null::text as detail
  from public.orders o
  where o.status='paid'
    and not exists (select 1 from public.subscriptions s where s.last_order_id=o.id)
  union all
  select 7, '7. INTEGRITY', 'Active subs w/o portone_billing_key',
    case when count(*)=0 then '✅ 0' else '❌ ' || count(*) || ' missing billing key' end,
    null
  from public.subscriptions where status='active' and portone_billing_key is null
  union all
  select 7, '7. INTEGRITY', 'Paid orders w/o portone_payment_id',
    case when count(*)=0 then '✅ 0' else '❌ ' || count(*) || ' missing payment id' end,
    null
  from public.orders where status='paid' and portone_payment_id is null
)
-- 통합 출력 (UNION 결과를 서브쿼리로 감싸서 ORDER BY 적용)
select section, item, status, detail
from (
  select ord, section, item, status, detail from t_tables
  union all select ord, section, item, status, detail from t_rls
  union all select ord, section, item, status, detail from t_policies
  union all select ord, section, item, status, detail from t_data
  union all select ord, section, item, status, detail from t_triggers
  union all select ord, section, item, status, detail from t_functions
  union all select ord, section, item, status, detail from t_integrity
) combined
order by ord, item;
