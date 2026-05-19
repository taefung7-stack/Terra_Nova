-- ============================================================
-- Terra Nova English — Migration 003: Core Tables
--   level_test_results, orders, order_items, products,
--   reviews, coupons, newsletter_subscribers,
--   monthly_pdf_dispatches
-- Supabase SQL Editor에 그대로 붙여넣어 실행 (idempotent)
-- 실행 순서: 002 완료 후 실행
-- ============================================================

-- ── 1. level_test_results ────────────────────────────────

CREATE TABLE IF NOT EXISTS public.level_test_results (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    -- 비로그인 응시 시 NULL, 로그인 후 linkAnonLevelTest()로 채워짐
  anon_token           text,
    -- 비로그인 응시 시 localStorage 'tn_anon_token' 값
  level                integer,                  -- 추천 레벨 번호 (1~8)
  score                integer,                  -- 응시 점수 (문항 맞은 수)
  total_questions      integer,
  recommended_planet   text,                     -- 'MARS'|'VENUS'|'TERRA'|'NEPTUNE'|'URANUS'|'SATURN'|'JUPITER'|'SUN'
  details              jsonb,                    -- 세부 결과 (level_label 등)
  created_at           timestamptz NOT NULL DEFAULT now(),

  -- user_id 또는 anon_token 중 하나는 있어야 함
  CONSTRAINT chk_identity CHECK (user_id IS NOT NULL OR anon_token IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_lvl_user ON public.level_test_results (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_lvl_anon ON public.level_test_results (anon_token) WHERE anon_token IS NOT NULL;

ALTER TABLE public.level_test_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "level_test_results: 본인 읽기" ON public.level_test_results;
DROP POLICY IF EXISTS "level_test_results: INSERT (익명 포함)" ON public.level_test_results;
DROP POLICY IF EXISTS "level_test_results: 본인 UPDATE (anon→user 링크)" ON public.level_test_results;
DROP POLICY IF EXISTS "level_test_results: 관리자 전체" ON public.level_test_results;

CREATE POLICY "level_test_results: 본인 읽기"
  ON public.level_test_results FOR SELECT
  USING (auth.uid() = user_id);

-- 비로그인/로그인 모두 INSERT 허용 (anon key로도 가능)
CREATE POLICY "level_test_results: INSERT (익명 포함)"
  ON public.level_test_results FOR INSERT
  WITH CHECK (true);

-- linkAnonLevelTest: anon_token 기반 row에 user_id를 채우는 UPDATE
CREATE POLICY "level_test_results: 본인 UPDATE (anon→user 링크)"
  ON public.level_test_results FOR UPDATE
  USING (auth.uid() IS NOT NULL AND anon_token IS NOT NULL AND user_id IS NULL);

CREATE POLICY "level_test_results: 관리자 전체"
  ON public.level_test_results FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ── 2. products (create-order / renew-subscriptions 참조) ─

-- ⚠️ 이 Supabase 프로젝트는 이미 products 테이블이 다음 컬럼으로 존재함:
--   id, sku, name, category(NOT NULL), level, price, description,
--   requires_shipping, is_active, sort_order, created_at
-- CREATE TABLE IF NOT EXISTS 는 이미 있으면 skip → 컬럼 변경 없음.
-- INSERT 시 category 컬럼을 반드시 채워야 함 ('subscription' 등).

CREATE TABLE IF NOT EXISTS public.products (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku               text NOT NULL UNIQUE,
  name              text NOT NULL,
  category          text NOT NULL,               -- 'subscription' | 'textbook' | 'merchandise'
  level             text,                        -- 'MARS'..'SUN' 또는 NULL
  price             integer NOT NULL,
  description       text,
  is_active         boolean DEFAULT true,
  requires_shipping boolean DEFAULT false,
  sort_order        integer DEFAULT 0,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products: 전체 읽기 (anon 포함)" ON public.products;
DROP POLICY IF EXISTS "products: 관리자 수정" ON public.products;

-- 상품 목록은 누구나 읽을 수 있음 (가격 표시용)
CREATE POLICY "products: 전체 읽기 (anon 포함)"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "products: 관리자 수정"
  ON public.products FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ── 3. orders ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.orders (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  order_number          text UNIQUE DEFAULT 'TN-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(gen_random_uuid()::text, 1, 6)),

  status                text NOT NULL DEFAULT 'pending',
    -- 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  total_amount          integer NOT NULL DEFAULT 0,

  -- 포트원 연동
  payment_method        text,                    -- 'CARD' | 'EASY_PAY' | 'TRANSFER' | 'VIRTUAL_ACCOUNT'
  portone_payment_id    text UNIQUE,             -- 멱등성 키
  portone_tx_id         text,

  -- 배송
  shipping_name         text,
  shipping_phone        text,
  shipping_address      text,
  shipping_detail       text,
  shipping_zipcode      text,
  shipping_courier      text,                    -- 택배사 코드
  tracking_number       text,
  shipped_by            uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  shipped_at            timestamptz,
  delivered_at          timestamptz,

  -- 기타
  memo                  text,
  paid_at               timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT chk_order_status CHECK (
    status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded')
  )
);

DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_portone ON public.orders (portone_payment_id) WHERE portone_payment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status, paid_at DESC);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders: 본인 읽기" ON public.orders;
DROP POLICY IF EXISTS "orders: 본인 INSERT" ON public.orders;
DROP POLICY IF EXISTS "orders: 관리자 전체" ON public.orders;

CREATE POLICY "orders: 본인 읽기"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "orders: 본인 INSERT"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "orders: 관리자 전체"
  ON public.orders FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ── 4. order_items ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.order_items (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id       uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_snapshot jsonb NOT NULL DEFAULT '{}',  -- 주문 당시 상품 정보 스냅샷
  quantity         integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price       integer NOT NULL DEFAULT 0,
  subtotal         integer NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items (order_id);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_items: 본인 주문 읽기" ON public.order_items;
DROP POLICY IF EXISTS "order_items: 본인 주문 INSERT" ON public.order_items;
DROP POLICY IF EXISTS "order_items: 관리자 전체" ON public.order_items;

CREATE POLICY "order_items: 본인 주문 읽기"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND user_id = auth.uid())
  );

CREATE POLICY "order_items: 본인 주문 INSERT"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND user_id = auth.uid())
  );

CREATE POLICY "order_items: 관리자 전체"
  ON public.order_items FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ── 5. reviews ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.reviews (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 후기 내용
  author_name      text NOT NULL,
  author_grade     text,
  level            text,                         -- 응시 레벨
  rating           integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title            text NOT NULL,
  content          text NOT NULL,

  -- 공개 상태
  is_published     boolean NOT NULL DEFAULT false,
  is_verified      boolean NOT NULL DEFAULT false,  -- 관리자 인증 여부

  -- SNS 인증 (리뷰 이벤트)
  sns_platform     text,                         -- 'instagram' | 'blog' | etc.
  sns_url          text,
  sns_screenshot   text,                         -- review-proofs 버킷 경로

  -- 쿠폰 발급 추적
  coupon_issued_at timestamptz,

  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_reviews_updated_at ON public.reviews;
CREATE TRIGGER trg_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_reviews_user ON public.reviews (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_published ON public.reviews (is_published, created_at DESC);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews: 공개 리뷰 전체 읽기" ON public.reviews;
DROP POLICY IF EXISTS "reviews: 본인 전체 읽기" ON public.reviews;
DROP POLICY IF EXISTS "reviews: 본인 INSERT" ON public.reviews;
DROP POLICY IF EXISTS "reviews: 본인 DELETE" ON public.reviews;
DROP POLICY IF EXISTS "reviews: 관리자 전체" ON public.reviews;

-- 공개 리뷰는 누구나 읽을 수 있음 (랜딩페이지 표시)
CREATE POLICY "reviews: 공개 리뷰 전체 읽기"
  ON public.reviews FOR SELECT
  USING (is_published = true);

-- 본인 리뷰는 비공개도 읽을 수 있음
CREATE POLICY "reviews: 본인 전체 읽기"
  ON public.reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "reviews: 본인 INSERT"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews: 본인 DELETE"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "reviews: 관리자 전체"
  ON public.reviews FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ── 6. coupons ────────────────────────────────────────────
-- 관리자가 생성하는 쿠폰 코드 (할인 적용은 validate_coupon RPC로 서버사이드 검증)

CREATE TABLE IF NOT EXISTS public.coupons (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code                 text NOT NULL UNIQUE,
  description          text,

  discount_type        text NOT NULL DEFAULT 'fixed',   -- 'fixed' | 'percentage'
  discount_value       integer NOT NULL DEFAULT 0,       -- 원화 또는 %
  max_discount_amount  integer,                          -- percentage 시 최대 할인 한도

  -- 사용 제한
  max_uses             integer,                          -- NULL = 무제한
  max_uses_per_user    integer NOT NULL DEFAULT 1,
  applicable_plans     text[] NOT NULL DEFAULT '{}',     -- [] = 전체 플랜
  applicable_billing   text[] NOT NULL DEFAULT '{}',     -- [] = 전체 주기

  -- 유효 기간 & 상태
  valid_from           timestamptz,
  valid_until          timestamptz,
  is_active            boolean NOT NULL DEFAULT true,

  -- 발급 추적
  created_by           uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT chk_discount_type CHECK (discount_type IN ('fixed', 'percentage')),
  CONSTRAINT chk_discount_value CHECK (discount_value >= 0),
  CONSTRAINT chk_percentage CHECK (discount_type <> 'percentage' OR discount_value <= 100)
);

DROP TRIGGER IF EXISTS trg_coupons_updated_at ON public.coupons;
CREATE TRIGGER trg_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "coupons: 관리자 전체" ON public.coupons;
DROP POLICY IF EXISTS "coupons: 활성 쿠폰 읽기 (로그인 유저)" ON public.coupons;

CREATE POLICY "coupons: 관리자 전체"
  ON public.coupons FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- 로그인된 사용자: 쿠폰 코드 조회 (validate_coupon RPC에서 서버사이드 검증)
CREATE POLICY "coupons: 활성 쿠폰 읽기 (로그인 유저)"
  ON public.coupons FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);

-- ── 7. coupon_uses (쿠폰 사용 내역) ──────────────────────

CREATE TABLE IF NOT EXISTS public.coupon_uses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id   uuid NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id    uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  used_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (coupon_id, user_id)  -- 동일 쿠폰을 동일 유저가 2회 사용 방지
);

CREATE INDEX IF NOT EXISTS idx_coupon_uses_coupon ON public.coupon_uses (coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_uses_user ON public.coupon_uses (user_id);

ALTER TABLE public.coupon_uses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "coupon_uses: 관리자 전체" ON public.coupon_uses;

CREATE POLICY "coupon_uses: 관리자 전체"
  ON public.coupon_uses FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ── 8. validate_coupon RPC ────────────────────────────────
-- order.html에서 supabase.rpc('validate_coupon', {...}) 로 호출됨

CREATE OR REPLACE FUNCTION public.validate_coupon(
  p_code    text,
  p_plan    text,
  p_billing text,
  p_amount  integer
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_coupon    public.coupons%ROWTYPE;
  v_use_count integer;
  v_user_use  integer;
  v_discount  integer;
  v_uid       uuid;
BEGIN
  v_uid := auth.uid();

  -- 쿠폰 조회
  SELECT * INTO v_coupon
  FROM public.coupons
  WHERE code = upper(trim(p_code))
    AND is_active = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'reason', '존재하지 않는 쿠폰입니다');
  END IF;

  -- 유효 기간 체크
  IF v_coupon.valid_from IS NOT NULL AND now() < v_coupon.valid_from THEN
    RETURN jsonb_build_object('valid', false, 'reason', '아직 사용할 수 없는 쿠폰입니다');
  END IF;
  IF v_coupon.valid_until IS NOT NULL AND now() > v_coupon.valid_until THEN
    RETURN jsonb_build_object('valid', false, 'reason', '만료된 쿠폰입니다');
  END IF;

  -- 적용 가능 플랜 체크
  IF array_length(v_coupon.applicable_plans, 1) > 0
    AND NOT (upper(p_plan) = ANY(v_coupon.applicable_plans)) THEN
    RETURN jsonb_build_object('valid', false, 'reason', '이 플랜에는 적용할 수 없는 쿠폰입니다');
  END IF;

  -- 적용 가능 결제 주기 체크
  IF array_length(v_coupon.applicable_billing, 1) > 0
    AND NOT (p_billing = ANY(v_coupon.applicable_billing)) THEN
    RETURN jsonb_build_object('valid', false, 'reason', '이 결제 주기에는 적용할 수 없는 쿠폰입니다');
  END IF;

  -- 전체 사용 횟수 체크
  IF v_coupon.max_uses IS NOT NULL THEN
    SELECT count(*) INTO v_use_count FROM public.coupon_uses WHERE coupon_id = v_coupon.id;
    IF v_use_count >= v_coupon.max_uses THEN
      RETURN jsonb_build_object('valid', false, 'reason', '사용 한도가 초과된 쿠폰입니다');
    END IF;
  END IF;

  -- 유저별 사용 횟수 체크 (로그인 유저만)
  IF v_uid IS NOT NULL THEN
    SELECT count(*) INTO v_user_use
    FROM public.coupon_uses
    WHERE coupon_id = v_coupon.id AND user_id = v_uid;
    IF v_user_use >= v_coupon.max_uses_per_user THEN
      RETURN jsonb_build_object('valid', false, 'reason', '이미 사용한 쿠폰입니다');
    END IF;
  END IF;

  -- 할인 금액 계산
  IF v_coupon.discount_type = 'percentage' THEN
    v_discount := floor(p_amount * v_coupon.discount_value / 100.0)::integer;
    IF v_coupon.max_discount_amount IS NOT NULL THEN
      v_discount := least(v_discount, v_coupon.max_discount_amount);
    END IF;
  ELSE
    v_discount := least(v_coupon.discount_value, p_amount);
  END IF;

  RETURN jsonb_build_object(
    'valid',            true,
    'coupon_id',        v_coupon.id,
    'code',             v_coupon.code,
    'description',      v_coupon.description,
    'discount_type',    v_coupon.discount_type,
    'discount_value',   v_coupon.discount_value,
    'discount_applied', v_discount,
    'final_amount',     p_amount - v_discount
  );
END;
$$;

-- ── 9. newsletter_subscribers ─────────────────────────────

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email            text NOT NULL UNIQUE,
  source           text,                         -- 'landing' | 'signup' | 'footer' 등
  consented_at     timestamptz,
  unsubscribed_at  timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_active ON public.newsletter_subscribers (unsubscribed_at) WHERE unsubscribed_at IS NULL;

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "newsletter: 관리자 전체" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "newsletter: INSERT (anon 포함)" ON public.newsletter_subscribers;

CREATE POLICY "newsletter: 관리자 전체"
  ON public.newsletter_subscribers FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- 구독 신청은 누구나 (이메일만 입력)
CREATE POLICY "newsletter: INSERT (anon 포함)"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (true);

-- ── 10. monthly_pdf_dispatches ───────────────────────────

CREATE TABLE IF NOT EXISTS public.monthly_pdf_dispatches (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month          text NOT NULL,                  -- 'YYYY-MM'
  level          text,
  email          text,
  signed_url     text,
  email_status   text NOT NULL DEFAULT 'pending',  -- 'pending' | 'sent' | 'failed'
  error_message  text,
  sent_at        timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),

  UNIQUE (user_id, month)                        -- UPSERT onConflict 키
);

DROP TRIGGER IF EXISTS trg_pdf_dispatches_updated_at ON public.monthly_pdf_dispatches;
CREATE TRIGGER trg_pdf_dispatches_updated_at
  BEFORE UPDATE ON public.monthly_pdf_dispatches
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_pdf_dispatch_month ON public.monthly_pdf_dispatches (month, email_status);

ALTER TABLE public.monthly_pdf_dispatches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pdf_dispatches: 본인 읽기" ON public.monthly_pdf_dispatches;
DROP POLICY IF EXISTS "pdf_dispatches: 관리자 전체" ON public.monthly_pdf_dispatches;

CREATE POLICY "pdf_dispatches: 본인 읽기"
  ON public.monthly_pdf_dispatches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "pdf_dispatches: 관리자 전체"
  ON public.monthly_pdf_dispatches FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ── 11. 검증 쿼리 ─────────────────────────────────────────
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
-- SELECT policyname, tablename FROM pg_policies ORDER BY tablename, policyname;
-- SELECT proname FROM pg_proc WHERE proname = 'validate_coupon';
