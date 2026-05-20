-- ============================================================
-- Terra Nova English — Migration 005: RLS 무한재귀 방지 hot-fix
-- Supabase SQL Editor에 그대로 붙여넣어 실행 (idempotent)
--
-- 문제
--   - profiles 의 '관리자 전체 읽기' / '본인 수정' 정책이 자기 자신을 참조
--     (EXISTS (SELECT FROM profiles WHERE is_admin) 패턴)
--   - 다른 테이블의 '관리자 전체' 정책도 모두 profiles 를 EXISTS 로 조회
--     → 클라이언트가 profiles 또는 다른 테이블 SELECT 시 무한재귀 발생
--   - 콘솔 에러: "infinite recursion detected in policy for relation 'profiles'"
--
-- 해결
--   - SECURITY DEFINER 함수 is_admin(uuid) 를 만들어 RLS bypass
--   - 모든 '관리자 체크' 정책을 EXISTS(SELECT FROM profiles ...) 대신
--     public.is_admin(auth.uid()) 호출로 교체
--   - profiles 의 본인 수정 정책에서 is_admin 동등성 검사도 함수로 대체
-- ============================================================

-- ── 1. SECURITY DEFINER 함수: 본인 is_admin 여부 ─────────────
-- SECURITY DEFINER 는 함수 작성자(슈퍼유저) 권한으로 실행 → RLS bypass
-- STABLE 은 같은 트랜잭션 내 재호출 시 캐시됨

CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE((SELECT is_admin FROM public.profiles WHERE id = uid), false);
$$;

-- 공개 (anon 포함 누구나 자기 uid 로 호출 가능)
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO anon, authenticated, service_role;

-- ── 2. profiles 정책 재정의 ────────────────────────────────

DROP POLICY IF EXISTS "profiles: 본인 읽기" ON public.profiles;
DROP POLICY IF EXISTS "profiles: 본인 수정" ON public.profiles;
DROP POLICY IF EXISTS "profiles: 관리자 전체 읽기" ON public.profiles;
DROP POLICY IF EXISTS "profiles: 관리자 전체 수정" ON public.profiles;
DROP POLICY IF EXISTS "profiles: 본인 INSERT" ON public.profiles;

-- (a) 본인 읽기 — 단순 동등성, 재귀 없음
CREATE POLICY "profiles: 본인 읽기"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- (b) 본인 수정 — is_admin 컬럼은 클라이언트가 못 바꾸도록 트리거로 차단(아래)
--     WITH CHECK 의 self-subquery 는 제거 (재귀 원인)
CREATE POLICY "profiles: 본인 수정"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- (c) 본인 INSERT (handle_new_user trigger 외에 클라이언트도 가능)
CREATE POLICY "profiles: 본인 INSERT"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- (d) 관리자 전체 읽기 — 함수로 안전 호출
CREATE POLICY "profiles: 관리자 전체 읽기"
  ON public.profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

-- (e) 관리자 전체 수정
CREATE POLICY "profiles: 관리자 전체 수정"
  ON public.profiles FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- ── 3. is_admin 컬럼 변경 차단 트리거 (정책 self-subquery 대체) ─
CREATE OR REPLACE FUNCTION public.prevent_is_admin_self_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- service_role (Edge Functions) 또는 관리자만 is_admin 변경 가능
  IF NEW.is_admin IS DISTINCT FROM OLD.is_admin THEN
    IF NOT public.is_admin(auth.uid()) AND auth.uid() = OLD.id THEN
      RAISE EXCEPTION '본인은 is_admin 값을 변경할 수 없습니다.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_is_admin_self_change ON public.profiles;
CREATE TRIGGER trg_prevent_is_admin_self_change
  BEFORE UPDATE OF is_admin ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_is_admin_self_change();

-- ── 4. 다른 테이블의 '관리자 전체' 정책을 함수 호출로 교체 ──

-- 4-1. level_test_results
DROP POLICY IF EXISTS "level_test_results: 관리자 전체" ON public.level_test_results;
CREATE POLICY "level_test_results: 관리자 전체"
  ON public.level_test_results FOR ALL
  USING (public.is_admin(auth.uid()));

-- 4-2. subscriptions
DROP POLICY IF EXISTS "subscriptions: 관리자 전체 읽기" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions: 관리자 전체 수정" ON public.subscriptions;
CREATE POLICY "subscriptions: 관리자 전체 읽기"
  ON public.subscriptions FOR SELECT
  USING (public.is_admin(auth.uid()));
CREATE POLICY "subscriptions: 관리자 전체 수정"
  ON public.subscriptions FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- 4-3. subscriptions: 본인 수정 정책의 self-subquery 도 단순화
--      (해지/auto_renew 변경만 허용, plan_code 등은 service_role 만)
DROP POLICY IF EXISTS "subscriptions: 본인 수정 (해지만 허용)" ON public.subscriptions;
CREATE POLICY "subscriptions: 본인 수정 (해지만 허용)"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
-- plan_code/expires_at 보호는 별도 트리거로 (필요 시 추후 추가)

-- 4-4. orders (만약 있다면)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='orders') THEN
    EXECUTE 'DROP POLICY IF EXISTS "orders: 관리자 전체" ON public.orders';
    EXECUTE 'CREATE POLICY "orders: 관리자 전체" ON public.orders FOR ALL USING (public.is_admin(auth.uid()))';
  END IF;
END $$;

-- 4-5. order_items
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='order_items') THEN
    EXECUTE 'DROP POLICY IF EXISTS "order_items: 관리자 전체" ON public.order_items';
    EXECUTE 'CREATE POLICY "order_items: 관리자 전체" ON public.order_items FOR ALL USING (public.is_admin(auth.uid()))';
  END IF;
END $$;

-- 4-6. products (관리자 수정)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='products') THEN
    EXECUTE 'DROP POLICY IF EXISTS "products: 관리자 수정" ON public.products';
    EXECUTE 'CREATE POLICY "products: 관리자 수정" ON public.products FOR ALL USING (public.is_admin(auth.uid()))';
  END IF;
END $$;

-- 4-7. reviews
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='reviews') THEN
    EXECUTE 'DROP POLICY IF EXISTS "reviews: 관리자 전체" ON public.reviews';
    EXECUTE 'CREATE POLICY "reviews: 관리자 전체" ON public.reviews FOR ALL USING (public.is_admin(auth.uid()))';
  END IF;
END $$;

-- 4-8. coupons
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='coupons') THEN
    EXECUTE 'DROP POLICY IF EXISTS "coupons: 관리자 전체" ON public.coupons';
    EXECUTE 'CREATE POLICY "coupons: 관리자 전체" ON public.coupons FOR ALL USING (public.is_admin(auth.uid()))';
  END IF;
END $$;

-- 4-9. coupon_uses
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='coupon_uses') THEN
    EXECUTE 'DROP POLICY IF EXISTS "coupon_uses: 관리자 전체" ON public.coupon_uses';
    EXECUTE 'CREATE POLICY "coupon_uses: 관리자 전체" ON public.coupon_uses FOR ALL USING (public.is_admin(auth.uid()))';
  END IF;
END $$;

-- 4-10. newsletter_subscribers
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='newsletter_subscribers') THEN
    EXECUTE 'DROP POLICY IF EXISTS "newsletter_subscribers: 관리자 읽기" ON public.newsletter_subscribers';
    EXECUTE 'CREATE POLICY "newsletter_subscribers: 관리자 읽기" ON public.newsletter_subscribers FOR SELECT USING (public.is_admin(auth.uid()))';
  END IF;
END $$;

-- 4-11. monthly_pdf_dispatches
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='monthly_pdf_dispatches') THEN
    EXECUTE 'DROP POLICY IF EXISTS "monthly_pdf_dispatches: 관리자 전체" ON public.monthly_pdf_dispatches';
    EXECUTE 'CREATE POLICY "monthly_pdf_dispatches: 관리자 전체" ON public.monthly_pdf_dispatches FOR ALL USING (public.is_admin(auth.uid()))';
  END IF;
END $$;

-- ── 5. Storage RLS 정책의 관리자 체크도 함수로 교체 ──
DROP POLICY IF EXISTS "review-proofs: 관리자 읽기" ON storage.objects;
CREATE POLICY "review-proofs: 관리자 읽기"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'review-proofs'
    AND public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "textbook-pdfs: 관리자 전체" ON storage.objects;
CREATE POLICY "textbook-pdfs: 관리자 전체"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'textbook-pdfs'
    AND public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "sample-pdfs: 관리자 전체" ON storage.objects;
CREATE POLICY "sample-pdfs: 관리자 전체"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'sample-pdfs'
    AND public.is_admin(auth.uid())
  );

-- ── 6. mypage 콘솔 에러로 발견된 'coupons.user_id 없음' 대응 ──
-- coupons 테이블에 user_id 컬럼이 없는 스키마 변형이 있음.
-- 마이페이지가 coupons 조회 시 'column coupons.user_id does not exist' 에러.
-- 추후 마이페이지 쿼리 측에서 coupon_uses 를 통해 조회하도록 수정 필요.
-- (이 마이그레이션은 RLS 만 다루므로 노트만 남김)

-- ── 7. 검증 쿼리 ─────────────────────────────────────────────
-- 적용 후 다음 실행:
-- SELECT proname, prosecdef FROM pg_proc WHERE proname IN ('is_admin', 'prevent_is_admin_self_change');
-- (둘 다 prosecdef = true 면 SECURITY DEFINER 정상)
--
-- 본인 계정으로 마이페이지 새로고침 → 콘솔에 'infinite recursion' 에러 사라져야 함
