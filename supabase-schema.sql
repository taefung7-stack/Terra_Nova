-- ==========================================================
-- Terra Nova English · Supabase Database Schema v1.0
-- Run this entire file in Supabase SQL Editor (one shot)
-- Path: Dashboard > SQL Editor > New query > paste > RUN
--
-- ⚠️ 실행 순서 (IMPORTANT):
--   1. 이 파일(supabase-schema.sql)을 먼저 실행
--   2. 그 다음 supabase-schema-v2.sql을 실행
--   (v2는 reviews·newsletter·Search Console 테이블을 추가하는 마이그레이션)
-- ==========================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ── 1. PROFILES (auth.users 확장) ─────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  phone text,
  school text,
  grade int check (grade between 1 and 3),
  target_score int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
comment on table public.profiles is '사용자 프로필 (auth.users 1:1 확장)';

-- ── 2. PRODUCTS (교재/구독권/모의고사) ────────────────────
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  sku text unique not null,
  name text not null,
  category text not null check (category in ('vocab','mock_exam','subscription','textbook')),
  level text check (level in ('BASIC','ADVANCED','MASTER','ALL')),
  price int not null,
  description text,
  requires_shipping boolean default false,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);
comment on table public.products is '판매 상품 (단어장/모의고사/구독권)';

-- ── 3. ORDERS (주문) ─────────────────────────────────────
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  order_number text unique not null default ('TN-' || to_char(now(),'YYYYMMDD') || '-' || substr(uuid_generate_v4()::text,1,8)),
  status text not null default 'pending' check (status in ('pending','paid','shipped','delivered','cancelled','refunded')),
  total_amount int not null,
  payment_method text,
  portone_payment_id text,
  portone_tx_id text,
  shipping_name text,
  shipping_phone text,
  shipping_address text,
  shipping_detail text,
  shipping_zipcode text,
  memo text,
  created_at timestamptz default now(),
  paid_at timestamptz,
  shipped_at timestamptz
);
comment on table public.orders is '주문 헤더';
create index if not exists orders_user_id_idx on public.orders(user_id, created_at desc);

-- ── 4. ORDER_ITEMS (주문 상세) ───────────────────────────
create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id),
  product_snapshot jsonb, -- 결제 당시 상품 정보 스냅샷
  quantity int not null default 1,
  unit_price int not null,
  subtotal int not null
);
comment on table public.order_items is '주문 라인 아이템';
create index if not exists order_items_order_id_idx on public.order_items(order_id);

-- ── 5. SUBSCRIPTIONS (구독 — BASIC/ADVANCED/MASTER) ─────
create table if not exists public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  plan_code text not null check (plan_code in ('BASIC','ADVANCED','MASTER')),
  status text not null default 'pending' check (status in ('active','cancelled','expired','pending')),
  billing_cycle text not null check (billing_cycle in ('monthly','annual')),
  started_at timestamptz default now(),
  expires_at timestamptz not null,
  auto_renew boolean default true,
  portone_billing_key text, -- 정기결제 빌링키
  last_order_id uuid references public.orders(id),
  cancelled_at timestamptz,
  created_at timestamptz default now()
);
comment on table public.subscriptions is '구독 (3종 플랜)';
create index if not exists subs_user_idx on public.subscriptions(user_id, status);

-- ── 6. LEVEL_TEST_RESULTS (레벨테스트 결과) ──────────────
create table if not exists public.level_test_results (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  level int not null check (level between 1 and 10),
  score int,
  total_questions int,
  details jsonb, -- 과목별/문항별 세부 결과
  created_at timestamptz default now()
);
comment on table public.level_test_results is '레벨 테스트 결과 (10단계)';
create index if not exists lvl_user_idx on public.level_test_results(user_id, created_at desc);

-- ==========================================================
-- Row Level Security (RLS)
-- ==========================================================

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.subscriptions enable row level security;
alter table public.level_test_results enable row level security;

-- profiles: 본인만 조회/수정
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- products: 활성 상품은 공개 조회
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
  for select using (is_active = true);

-- orders: 본인 주문만 조회. 생성은 Edge Function에서 service_role로 처리
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own" on public.orders
  for select using (auth.uid() = user_id);

-- order_items: 본인 주문의 아이템만 조회
drop policy if exists "order_items_select_own" on public.order_items;
create policy "order_items_select_own" on public.order_items
  for select using (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

-- subscriptions: 본인 구독만 조회
drop policy if exists "subs_select_own" on public.subscriptions;
create policy "subs_select_own" on public.subscriptions
  for select using (auth.uid() = user_id);

-- level_test_results: 본인 결과 조회/생성
drop policy if exists "lvl_select_own" on public.level_test_results;
create policy "lvl_select_own" on public.level_test_results
  for select using (auth.uid() = user_id);
drop policy if exists "lvl_insert_own" on public.level_test_results;
create policy "lvl_insert_own" on public.level_test_results
  for insert with check (auth.uid() = user_id);

-- ==========================================================
-- Triggers
-- ==========================================================

-- 가입 시 profile 자동 생성
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)),
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at 자동 갱신
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ==========================================================
-- Seed Data (초기 상품 데이터)
-- ==========================================================

insert into public.products (sku, name, category, level, price, description, sort_order) values
  -- 구독 플랜 3종
  ('SUB-BASIC-MONTHLY',    '베이직 월구독',    'subscription', 'BASIC',    19000, '수능 영어 기초 단어장 + 주 2회 모의고사', 10),
  ('SUB-ADVANCED-MONTHLY', '어드밴스드 월구독','subscription', 'ADVANCED', 29000, '심화 문법·독해 + 모의고사 + 해설 영상',  20),
  ('SUB-MASTER-MONTHLY',   '마스터 월구독',    'subscription', 'MASTER',   39000, '전 과정 자료 + 1:1 첨삭 + 실시간 Q&A',   30),
  ('SUB-BASIC-ANNUAL',     '베이직 연간구독',  'subscription', 'BASIC',   190000, '월구독 대비 2개월 무료',                  11),
  ('SUB-ADVANCED-ANNUAL',  '어드밴스드 연간구독','subscription','ADVANCED',290000, '월구독 대비 2개월 무료',                  21),
  ('SUB-MASTER-ANNUAL',    '마스터 연간구독',  'subscription', 'MASTER',  390000, '월구독 대비 2개월 무료',                  31),
  -- 단어장 3단계
  ('VOCAB-BASIC',    'Terra Nova 단어장 BASIC',    'vocab', 'BASIC',    19000, '수능 필수 2,000어',                          110),
  ('VOCAB-ADVANCED', 'Terra Nova 단어장 ADVANCED', 'vocab', 'ADVANCED', 22000, '심화 3,000어 + 예문',                        120),
  ('VOCAB-MASTER',   'Terra Nova 단어장 MASTER',   'vocab', 'MASTER',   25000, '마스터 4,000어 + 동의어/반의어',             130)
on conflict (sku) do update set
  name = excluded.name, price = excluded.price, description = excluded.description;

-- ==========================================================
-- 완료 확인
-- ==========================================================
select 'Terra Nova schema installed. Tables:' as msg;
select table_name from information_schema.tables
  where table_schema='public' order by table_name;
