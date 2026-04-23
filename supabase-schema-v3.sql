-- ==========================================================
-- Terra Nova Schema v3.0
-- 변경 내역:
--   1. subscriptions.plan_code: BASIC/ADVANCED/MASTER → LIGHT/STANDARD/PREMIUM
--      (UI는 LIGHT/STANDARD/PREMIUM을 보내므로 CHECK 실패 버그 수정)
--   2. products.level CHECK 확장: LIGHT/STANDARD/PREMIUM 허용
--   3. 구독 상품 SKU/가격 업데이트:
--      - STANDARD 월간 22,900 → 24,900
--      - STANDARD 연간 229,000 → 249,000
--      - PREMIUM  월간 36,900 → 38,900
--      - PREMIUM  연간 (신규) 389,000
--      - LIGHT 가격은 변경 없음
--   4. 관리자 판정용 role 컬럼 추가 (reviews 승인 페이지에서 사용)
--
-- 실행: Supabase SQL Editor에 전체 붙여넣기 → RUN
-- ==========================================================

-- ── 1. subscriptions.plan_code CHECK 변경 ────────────────
-- 기존 제약 제거 후 새 값들로 재생성
alter table public.subscriptions
  drop constraint if exists subscriptions_plan_code_check;

alter table public.subscriptions
  add constraint subscriptions_plan_code_check
    check (plan_code in ('LIGHT','STANDARD','PREMIUM'));

-- ── 2. products.level CHECK 확장 ─────────────────────────
alter table public.products
  drop constraint if exists products_level_check;

alter table public.products
  add constraint products_level_check
    check (level in ('LIGHT','STANDARD','PREMIUM','BASIC','ADVANCED','MASTER','ALL'));

-- ── 3. 구독 상품 SKU + 가격 업데이트 ─────────────────────
-- 기존 SUB-BASIC/ADVANCED/MASTER-* 레코드 제거 후 신규 SKU 삽입
delete from public.products
  where sku in (
    'SUB-BASIC-MONTHLY','SUB-ADVANCED-MONTHLY','SUB-MASTER-MONTHLY',
    'SUB-BASIC-ANNUAL', 'SUB-ADVANCED-ANNUAL', 'SUB-MASTER-ANNUAL'
  );

insert into public.products (sku, name, category, level, price, description, requires_shipping, sort_order) values
  -- 월간 3종
  ('SUB-LIGHT-MONTHLY',    'LIGHT 월간 구독',     'subscription', 'LIGHT',     11900,  'PDF 교재 매월 발행',                                    false, 10),
  ('SUB-STANDARD-MONTHLY', 'STANDARD 월간 구독',  'subscription', 'STANDARD',  24900,  'PDF + 실물 책 + 모의고사 2회 + 단어 암기장 + 시험지',   true,  20),
  ('SUB-PREMIUM-MONTHLY',  'PREMIUM 월간 구독',   'subscription', 'PREMIUM',   38900,  'STANDARD 전체 포함 + 입시뉴스 카톡방 + 해설강의(준비중)', true,  30),
  -- 연간 3종 (2개월 무료 = 월간 × 10)
  ('SUB-LIGHT-ANNUAL',     'LIGHT 연간 구독',     'subscription', 'LIGHT',    119000,  '월간 대비 2개월 무료 (23,800원 절감)',                  false, 11),
  ('SUB-STANDARD-ANNUAL',  'STANDARD 연간 구독',  'subscription', 'STANDARD', 249000,  '월간 대비 2개월 무료 (49,800원 절감)',                  true,  21),
  ('SUB-PREMIUM-ANNUAL',   'PREMIUM 연간 구독',   'subscription', 'PREMIUM',  389000,  '월간 대비 2개월 무료 (77,800원 절감, 준비중)',          true,  31)
on conflict (sku) do update set
  name = excluded.name,
  level = excluded.level,
  price = excluded.price,
  description = excluded.description,
  requires_shipping = excluded.requires_shipping,
  sort_order = excluded.sort_order,
  is_active = true;

-- ── 4. 관리자 권한용 role 컬럼 (profiles) ────────────────
-- is_admin 불리언 방식. 기본 false, 수동으로 특정 사용자에게 true 지정.
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

comment on column public.profiles.is_admin is '관리자 여부 — true 인 사용자만 admin.html 접근/리뷰 승인 가능';

-- ── 5. 리뷰 관리자 RLS 정책 추가 ─────────────────────────
-- 관리자는 모든 리뷰 조회/수정/삭제 가능 (승인 기능용)
drop policy if exists "reviews_admin_all" on public.reviews;
create policy "reviews_admin_all" on public.reviews
  for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- ── 6. 뉴스레터 관리자 RLS 정책 추가 ─────────────────────
drop policy if exists "newsletter_admin_read" on public.newsletter_subscribers;
create policy "newsletter_admin_read" on public.newsletter_subscribers
  for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- ── 완료 확인 ──
select 'Terra Nova schema v3 applied.' as msg;

-- 현재 플랜 상품 최종 상태
select sku, name, level, price, requires_shipping
from public.products
where category = 'subscription'
order by sort_order;
