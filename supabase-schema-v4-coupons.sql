-- ==========================================================
-- Terra Nova Schema v4 - 쿠폰 시스템
-- 실행: Supabase SQL Editor에 전체 붙여넣기 → RUN
-- 전제: schema v1 + v2 + v3 실행 완료
-- ==========================================================

-- ── 1. COUPONS (마스터) ──────────────────────────────────
create table if not exists public.coupons (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,  -- 예: 'LAUNCH2026', 'WELCOME20'
  description text,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value int not null check (discount_value > 0),
    -- percentage: 1~100 (%), fixed: 원 단위
  min_order_amount int default 0,  -- 최소 주문 금액 (미달 시 적용 불가)
  max_discount_amount int,  -- 최대 할인액 (percentage 쿠폰에 상한 설정용)
  applicable_plans text[] default '{LIGHT,STANDARD,PREMIUM}',
    -- 특정 플랜에만 적용 제한
  applicable_billing text[] default '{monthly,annual}',
    -- 'monthly' 또는 'annual'에만 적용 가능
  max_uses int,  -- 전체 사용 가능 횟수 (null=무제한)
  max_uses_per_user int default 1,  -- 사용자당 사용 가능 횟수
  valid_from timestamptz default now(),
  valid_until timestamptz,  -- null=무제한
  is_active boolean default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);
comment on table public.coupons is '쿠폰 마스터 — 관리자가 발행';
create index if not exists coupons_code_idx on public.coupons(code);
create index if not exists coupons_active_idx on public.coupons(is_active, valid_until);

-- ── 2. COUPON_REDEMPTIONS (사용 기록) ─────────────────────
create table if not exists public.coupon_redemptions (
  id uuid primary key default uuid_generate_v4(),
  coupon_id uuid references public.coupons(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete set null not null,
  order_id uuid references public.orders(id) on delete set null,
  discount_applied int not null,
  redeemed_at timestamptz default now()
);
comment on table public.coupon_redemptions is '쿠폰 사용 기록';
create index if not exists cr_user_idx on public.coupon_redemptions(user_id, redeemed_at desc);
create index if not exists cr_coupon_idx on public.coupon_redemptions(coupon_id, redeemed_at desc);

-- ── 3. RLS ────────────────────────────────────────────────
alter table public.coupons enable row level security;
alter table public.coupon_redemptions enable row level security;

-- 쿠폰: 활성화된 것만 공개 조회 (code validation용)
drop policy if exists "coupons_public_active_read" on public.coupons;
create policy "coupons_public_active_read" on public.coupons
  for select using (
    is_active = true
    and (valid_from is null or valid_from <= now())
    and (valid_until is null or valid_until >= now())
  );

-- 쿠폰: 관리자는 전체 CRUD
drop policy if exists "coupons_admin_all" on public.coupons;
create policy "coupons_admin_all" on public.coupons
  for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

-- 쿠폰 사용 기록: 본인 것만 조회, insert는 Edge Function(service_role)이 처리
drop policy if exists "cr_select_own" on public.coupon_redemptions;
create policy "cr_select_own" on public.coupon_redemptions
  for select using (auth.uid() = user_id);

drop policy if exists "cr_admin_all" on public.coupon_redemptions;
create policy "cr_admin_all" on public.coupon_redemptions
  for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

-- ── 4. 검증 함수 (쿠폰 유효성 체크 + 할인액 계산) ─────────
-- 프론트엔드에서 rpc로 호출하여 결제 직전 검증
create or replace function public.validate_coupon(
  p_code text,
  p_plan text,
  p_billing text,
  p_amount int
) returns jsonb as $$
declare
  v_coupon public.coupons%rowtype;
  v_user_uses int;
  v_total_uses int;
  v_discount int;
begin
  -- 쿠폰 조회 (RLS가 활성+유효기간 자동 필터)
  select * into v_coupon from public.coupons
  where code = upper(p_code) and is_active = true
    and (valid_from is null or valid_from <= now())
    and (valid_until is null or valid_until >= now())
  limit 1;

  if not found then
    return jsonb_build_object('valid', false, 'reason', '유효하지 않은 쿠폰 코드입니다');
  end if;

  -- 플랜 적용 가능 여부
  if not (p_plan = any(v_coupon.applicable_plans)) then
    return jsonb_build_object('valid', false, 'reason', '이 플랜에는 사용할 수 없는 쿠폰입니다');
  end if;

  -- 결제 주기 적용 가능 여부
  if not (p_billing = any(v_coupon.applicable_billing)) then
    return jsonb_build_object('valid', false, 'reason', format('이 쿠폰은 %s 결제에만 적용됩니다',
      case when 'monthly' = any(v_coupon.applicable_billing) then '월간' else '연간' end));
  end if;

  -- 최소 주문 금액
  if p_amount < v_coupon.min_order_amount then
    return jsonb_build_object('valid', false,
      'reason', format('최소 %s원 이상 주문에만 사용 가능합니다', to_char(v_coupon.min_order_amount, 'FM999,999,999')));
  end if;

  -- 전체 사용 횟수 제한
  if v_coupon.max_uses is not null then
    select count(*) into v_total_uses from public.coupon_redemptions where coupon_id = v_coupon.id;
    if v_total_uses >= v_coupon.max_uses then
      return jsonb_build_object('valid', false, 'reason', '쿠폰 사용 한도가 모두 소진되었습니다');
    end if;
  end if;

  -- 사용자별 사용 횟수 제한 (로그인 필수)
  if auth.uid() is null then
    return jsonb_build_object('valid', false, 'reason', '로그인이 필요합니다');
  end if;

  select count(*) into v_user_uses from public.coupon_redemptions
  where coupon_id = v_coupon.id and user_id = auth.uid();
  if v_user_uses >= v_coupon.max_uses_per_user then
    return jsonb_build_object('valid', false, 'reason', '이미 사용하신 쿠폰입니다');
  end if;

  -- 할인액 계산
  if v_coupon.discount_type = 'percentage' then
    v_discount := (p_amount * v_coupon.discount_value / 100)::int;
  else
    v_discount := v_coupon.discount_value;
  end if;

  -- 최대 할인액 상한 적용
  if v_coupon.max_discount_amount is not null and v_discount > v_coupon.max_discount_amount then
    v_discount := v_coupon.max_discount_amount;
  end if;

  -- 결제 금액 초과 방지
  if v_discount > p_amount then
    v_discount := p_amount;
  end if;

  return jsonb_build_object(
    'valid', true,
    'coupon_id', v_coupon.id,
    'code', v_coupon.code,
    'description', v_coupon.description,
    'discount_type', v_coupon.discount_type,
    'discount_value', v_coupon.discount_value,
    'discount_applied', v_discount,
    'final_amount', p_amount - v_discount
  );
end;
$$ language plpgsql security definer;

comment on function public.validate_coupon is '쿠폰 코드 유효성 검증 + 할인액 계산 (결제 직전 호출)';

grant execute on function public.validate_coupon(text, text, text, int) to authenticated, anon;

-- ── 5. 시드 데이터 (런칭 기념 쿠폰 예시) ──────────────────
insert into public.coupons (code, description, discount_type, discount_value, max_discount_amount, applicable_plans, max_uses_per_user, valid_until, is_active)
values
  ('LAUNCH2026', '론칭 기념 첫 달 30% 할인', 'percentage', 30, 20000, '{LIGHT,STANDARD,PREMIUM}', 1, now() + interval '30 days', true),
  ('ANNUAL10', '연간 구독 추가 10% 할인', 'percentage', 10, 50000, '{LIGHT,STANDARD,PREMIUM}', 1, null, true),
  ('WELCOME5000', '신규 가입 5천원 할인', 'fixed', 5000, null, '{LIGHT,STANDARD}', 1, null, true)
on conflict (code) do nothing;

-- 연간만 적용되는 예시
update public.coupons set applicable_billing = '{annual}' where code = 'ANNUAL10';

-- ── 완료 확인 ──
select 'Terra Nova schema v4 (coupons) applied.' as msg;
select code, description, discount_type, discount_value,
       applicable_plans, applicable_billing, is_active
  from public.coupons order by created_at desc;
