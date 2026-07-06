-- ============================================================
-- Terra Nova English — Migration 019: 쿠폰 보상 체인 복구 + 리뷰 보안 강화
--
-- 2026-07-06 사이트 3영역 전수 점검 결과 반영:
--   1. reviews INSERT 가 모더레이션(is_published=false)을 강제하지 않아
--      API 직접 호출로 자체 공개 가능 → WITH CHECK 강화
--   2. reviews 스팸 가드 부재 → 유저당 24시간 3건 제한 트리거
--   3. coupons SELECT 가 "로그인 유저 전체 활성 쿠폰" → 타인 쿠폰 코드 노출
--      → 본인(user_id) 쿠폰만 조회 가능 (일반 쿠폰은 validate_coupon RPC 로만 검증)
--   4. coupon_uses 에 본인 SELECT 정책 부재 → 추가
--   5. validate_coupon 이 reward_kind(이벤트 보상)를 해석하지 못함 + 소유자
--      검사 없음 → v2 로 교체 (무료개월 쿠폰 = 월간 첫 결제 100% 할인 + free_months)
--   6. orders 에 쿠폰 추적 컬럼(coupon_id/discount_amount/free_months) 추가
--      (create-order 가 기록, portone-webhook 이 사용 처리 + 무료개월 반영)
--   7. 기존 0원으로 발급된 이벤트 쿠폰 백필
--   8. protect_subscription_columns: 본인 level 변경 허용 (개통 레벨 한정)
--      — 마이페이지 "레벨 변경" 기능 실동작화
-- ============================================================

-- ── 1. reviews INSERT 모더레이션 강제 ───────────────────────
DROP POLICY IF EXISTS "reviews: 본인 INSERT" ON public.reviews;
CREATE POLICY "reviews: 본인 INSERT"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND is_published = false
    AND is_verified = false
    AND coupon_issued_at IS NULL
  );

-- ── 2. reviews 스팸 가드: 유저당 24시간 3건 ─────────────────
CREATE OR REPLACE FUNCTION public.reviews_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- service_role(Edge Function)·관리자는 제한 없음
  IF auth.uid() IS NULL OR public.is_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;
  IF (SELECT count(*) FROM public.reviews
      WHERE user_id = NEW.user_id
        AND created_at > now() - interval '24 hours') >= 3 THEN
    RAISE EXCEPTION '리뷰는 24시간에 3건까지만 등록할 수 있습니다.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_reviews_rate_limit ON public.reviews;
CREATE TRIGGER trg_reviews_rate_limit
  BEFORE INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.reviews_rate_limit();

-- ── 3. coupons SELECT — 본인 쿠폰만 ─────────────────────────
-- 일반(무기명) 쿠폰 코드는 목록 노출 없이 validate_coupon RPC(SECURITY DEFINER)
-- 로만 검증한다. mypage 쿠폰함은 본인 발급 쿠폰(user_id)만 표시.
DROP POLICY IF EXISTS "coupons: 활성 쿠폰 읽기 (로그인 유저)" ON public.coupons;
DROP POLICY IF EXISTS "coupons: 본인 쿠폰 읽기" ON public.coupons;
CREATE POLICY "coupons: 본인 쿠폰 읽기"
  ON public.coupons FOR SELECT
  USING (auth.uid() = user_id);

-- ── 4. coupon_uses — 본인 사용 내역 읽기 ────────────────────
DROP POLICY IF EXISTS "coupon_uses: 본인 읽기" ON public.coupon_uses;
CREATE POLICY "coupon_uses: 본인 읽기"
  ON public.coupon_uses FOR SELECT
  USING (auth.uid() = user_id);

-- ── 5. orders 쿠폰 추적 컬럼 ────────────────────────────────
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS coupon_id       uuid REFERENCES public.coupons(id) ON DELETE SET NULL;
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS discount_amount integer NOT NULL DEFAULT 0;
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS free_months     integer NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.orders.coupon_id IS '적용된 쿠폰 (create-order 기록, webhook 결제 확정 시 사용 처리)';
COMMENT ON COLUMN public.orders.discount_amount IS '쿠폰 할인액(원). total_amount 는 할인 반영 후 금액';
COMMENT ON COLUMN public.orders.free_months IS '무료 제공 개월수 (free_month_any=1, free_6months=6). 월간 구독 첫 결제 0원 + expires_at 연장';

-- ── 6. validate_coupon v2 ───────────────────────────────────
-- 변경점: ① 소유자(user_id) 검사 ② 발급형 쿠폰 used_at 검사
--        ③ reward_kind 해석 — 무료개월 쿠폰은 월간 한정, 첫 결제 전액 할인
--        ④ discount_30_next 인데 discount_value=0 인 레거시 쿠폰 30% 폴백
--        ⑤ 응답에 reward_kind / free_months 포함
CREATE OR REPLACE FUNCTION public.validate_coupon(
  p_code    text,
  p_plan    text,
  p_billing text,
  p_amount  integer
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coupon      public.coupons%ROWTYPE;
  v_use_count   integer;
  v_user_use    integer;
  v_discount    integer;
  v_uid         uuid;
  v_free_months integer := 0;
BEGIN
  v_uid := auth.uid();

  SELECT * INTO v_coupon
  FROM public.coupons
  WHERE code = upper(trim(p_code))
    AND is_active = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'reason', '존재하지 않는 쿠폰입니다');
  END IF;

  -- 발급형(기명) 쿠폰: 소유자 본인만 사용 가능
  IF v_coupon.user_id IS NOT NULL THEN
    IF v_uid IS NULL OR v_uid <> v_coupon.user_id THEN
      RETURN jsonb_build_object('valid', false, 'reason', '본인에게 발급된 쿠폰이 아닙니다');
    END IF;
    IF v_coupon.used_at IS NOT NULL THEN
      RETURN jsonb_build_object('valid', false, 'reason', '이미 사용한 쿠폰입니다');
    END IF;
  END IF;

  IF v_coupon.valid_from IS NOT NULL AND now() < v_coupon.valid_from THEN
    RETURN jsonb_build_object('valid', false, 'reason', '아직 사용할 수 없는 쿠폰입니다');
  END IF;
  IF v_coupon.valid_until IS NOT NULL AND now() > v_coupon.valid_until THEN
    RETURN jsonb_build_object('valid', false, 'reason', '만료된 쿠폰입니다');
  END IF;

  IF array_length(v_coupon.applicable_plans, 1) > 0
    AND NOT (upper(p_plan) = ANY(v_coupon.applicable_plans)) THEN
    RETURN jsonb_build_object('valid', false, 'reason', '이 플랜에는 적용할 수 없는 쿠폰입니다');
  END IF;

  IF array_length(v_coupon.applicable_billing, 1) > 0
    AND NOT (p_billing = ANY(v_coupon.applicable_billing)) THEN
    RETURN jsonb_build_object('valid', false, 'reason', '이 결제 주기에는 적용할 수 없는 쿠폰입니다');
  END IF;

  IF v_coupon.max_uses IS NOT NULL THEN
    SELECT count(*) INTO v_use_count FROM public.coupon_uses WHERE coupon_id = v_coupon.id;
    IF v_use_count >= v_coupon.max_uses THEN
      RETURN jsonb_build_object('valid', false, 'reason', '사용 한도가 초과된 쿠폰입니다');
    END IF;
  END IF;

  IF v_uid IS NOT NULL THEN
    SELECT count(*) INTO v_user_use
    FROM public.coupon_uses
    WHERE coupon_id = v_coupon.id AND user_id = v_uid;
    IF v_user_use >= v_coupon.max_uses_per_user THEN
      RETURN jsonb_build_object('valid', false, 'reason', '이미 사용한 쿠폰입니다');
    END IF;
  END IF;

  -- 이벤트 보상(reward_kind) 해석
  v_free_months := CASE v_coupon.reward_kind
    WHEN 'free_month_any'   THEN 1
    WHEN 'free_month_light' THEN 1
    WHEN 'free_6months'     THEN 6
    ELSE 0
  END;

  IF v_free_months > 0 THEN
    -- 무료개월 쿠폰: 월간 정기결제 전용 (첫 결제 0원 + 무료 기간 후 정상 과금)
    IF p_billing <> 'monthly' THEN
      RETURN jsonb_build_object('valid', false, 'reason', '이 쿠폰은 월간 정기결제에서만 사용할 수 있습니다');
    END IF;
    v_discount := p_amount;
  ELSIF v_coupon.reward_kind = 'discount_30_next' AND coalesce(v_coupon.discount_value, 0) = 0 THEN
    -- 레거시(019 이전 발급) 30% 쿠폰 폴백
    v_discount := floor(p_amount * 30 / 100.0)::integer;
  ELSIF v_coupon.discount_type = 'percentage' THEN
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
    'final_amount',     p_amount - v_discount,
    'reward_kind',      v_coupon.reward_kind,
    'free_months',      v_free_months
  );
END;
$$;

-- ── 7. 기존 0원 이벤트 쿠폰 백필 ────────────────────────────
UPDATE public.coupons SET
  discount_type = 'percentage', discount_value = 30, reward_value = 30,
  description = coalesce(description, '리뷰 이벤트 · 다음 결제 30% 할인')
WHERE reward_kind = 'discount_30_next' AND coalesce(discount_value, 0) = 0;

UPDATE public.coupons SET
  discount_type = 'percentage', discount_value = 100, reward_value = 1,
  applicable_billing = '{monthly}',
  description = coalesce(description, 'SNS 후기 이벤트 · 한 달 무료')
WHERE reward_kind = 'free_month_any' AND coalesce(discount_value, 0) = 0;

UPDATE public.coupons SET
  discount_type = 'percentage', discount_value = 100, reward_value = 6,
  applicable_billing = '{monthly}',
  description = coalesce(description, '성적인증 이벤트 · 6개월 무료')
WHERE reward_kind = 'free_6months' AND coalesce(discount_value, 0) = 0;

-- ── 8. protect_subscription_columns — 본인 level 변경 허용 ──
-- 014 함수 전체 재정의. 변경점: level 블록만 "차단 → 개통 레벨 검증 후 허용".
-- 개통 레벨 목록은 create-order ACTIVE_LEVELS 와 동기화할 것 (레벨 개통 4곳 체크리스트에 추가).
CREATE OR REPLACE FUNCTION public.protect_subscription_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean := false;
BEGIN
  -- service_role 은 auth.uid() 가 NULL → 모든 변경 허용 (Edge Functions)
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- 관리자는 모든 컬럼 변경 가능
  v_is_admin := public.is_admin(auth.uid());
  IF v_is_admin THEN
    RETURN NEW;
  END IF;

  -- 본인 — 보호된 컬럼이 바뀌었는지 확인
  IF NEW.plan_code IS DISTINCT FROM OLD.plan_code THEN
    RAISE EXCEPTION '구독 플랜은 직접 변경할 수 없습니다. (Edge Function 만 가능)';
  END IF;
  IF NEW.billing_cycle IS DISTINCT FROM OLD.billing_cycle THEN
    RAISE EXCEPTION '결제 주기는 직접 변경할 수 없습니다.';
  END IF;
  IF NEW.expires_at IS DISTINCT FROM OLD.expires_at THEN
    RAISE EXCEPTION '구독 만료일은 직접 변경할 수 없습니다.';
  END IF;
  IF NEW.started_at IS DISTINCT FROM OLD.started_at THEN
    RAISE EXCEPTION '구독 시작일은 직접 변경할 수 없습니다.';
  END IF;
  -- 🆕 레벨: 활성 구독의 소유자가 개통된 레벨로만 변경 가능 (다음 발송분부터 적용)
  IF NEW.level IS DISTINCT FROM OLD.level THEN
    IF OLD.status <> 'active' THEN
      RAISE EXCEPTION '활성 구독에서만 레벨을 변경할 수 있습니다.';
    END IF;
    IF NEW.level IS NULL OR NEW.level NOT IN ('MARS','VENUS','TERRA','SATURN','JUPITER','SUN') THEN
      RAISE EXCEPTION '해당 레벨은 아직 준비 중입니다: %', coalesce(NEW.level, '(없음)');
    END IF;
  END IF;
  IF NEW.portone_billing_key IS DISTINCT FROM OLD.portone_billing_key THEN
    RAISE EXCEPTION '빌링키는 직접 변경할 수 없습니다.';
  END IF;
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION '구독 소유자는 변경할 수 없습니다.';
  END IF;
  IF NEW.last_order_id IS DISTINCT FROM OLD.last_order_id THEN
    RAISE EXCEPTION '결제 연동 정보(last_order_id)는 직접 변경할 수 없습니다.';
  END IF;

  -- status 변경 제한: active → cancelled / pause_requested 만 허용
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF OLD.status = 'active' AND NEW.status NOT IN ('cancelled', 'pause_requested') THEN
      RAISE EXCEPTION '활성 구독은 cancelled / pause_requested 로만 변경할 수 있습니다.';
    END IF;
    IF OLD.status IN ('cancelled', 'expired', 'pending') AND NEW.status = 'active' THEN
      RAISE EXCEPTION '비활성 구독을 활성으로 되돌릴 수 없습니다. (재구독은 새 결제로 진행)';
    END IF;
    IF OLD.status = 'pause_requested' AND NEW.status NOT IN ('active', 'cancelled') THEN
      RAISE EXCEPTION '일시정지 상태는 active 또는 cancelled 로만 변경할 수 있습니다.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- ── 9. pdf_resend_logs — resend-pdf 남용 방지 카운터 ────────
-- resend-pdf Edge Function 이 발송 시마다 1행 기록, 최근 1시간 5회 제한에 사용.
CREATE TABLE IF NOT EXISTS public.pdf_resend_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind        text NOT NULL,                -- 'order' | 'monthly'
  order_id    uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS pdf_resend_logs_user_time_idx
  ON public.pdf_resend_logs (user_id, created_at DESC);

ALTER TABLE public.pdf_resend_logs ENABLE ROW LEVEL SECURITY;
-- service_role(Edge Function) 전용 — 클라이언트 정책 없음 (기본 전부 차단)

-- ── 검증 쿼리 ────────────────────────────────────────────────
-- SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename IN ('reviews','coupons','coupon_uses');
-- SELECT column_name FROM information_schema.columns WHERE table_name='orders' AND column_name IN ('coupon_id','discount_amount','free_months');
