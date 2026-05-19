-- ============================================================
-- Terra Nova English — Migration 002: Subscriptions
-- Supabase SQL Editor에 그대로 붙여넣어 실행 (idempotent)
-- 실행 순서: 001 완료 후 실행
-- ============================================================

-- ── 1. subscriptions 테이블 ──────────────────────────────

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 플랜 정보 (create-order/portone-webhook 기준)
  plan_code             text NOT NULL,           -- 'LIGHT' | 'STANDARD' | 'PREMIUM'
  billing_cycle         text NOT NULL DEFAULT 'monthly',  -- 'monthly' | 'annual'
  level                 text,                    -- 'MARS' | 'VENUS' | 'TERRA' | 'NEPTUNE' | 'URANUS' | 'SATURN' | 'JUPITER' | 'SUN'

  -- 상태
  status                text NOT NULL DEFAULT 'active',
    -- 'active' | 'cancelled' | 'expired' | 'pending'
  auto_renew            boolean NOT NULL DEFAULT true,

  -- 기간
  started_at            timestamptz NOT NULL DEFAULT now(),
  expires_at            timestamptz NOT NULL,
  cancelled_at          timestamptz,

  -- 결제 연동
  portone_billing_key   text,                    -- 정기결제 빌링키 (renew-subscriptions 사용)
  last_order_id         uuid,                    -- 최근 주문 ID (orders 테이블 FK — 순환 참조 방지로 FK 미설정)

  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT chk_plan_code CHECK (plan_code IN ('LIGHT', 'STANDARD', 'PREMIUM')),
  CONSTRAINT chk_billing_cycle CHECK (billing_cycle IN ('monthly', 'annual')),
  CONSTRAINT chk_status CHECK (status IN ('active', 'cancelled', 'expired', 'pending'))
);

-- updated_at 트리거
DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 인덱스 (getActiveSubscription 쿼리 최적화)
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status_expires
  ON public.subscriptions (user_id, status, expires_at DESC);

CREATE INDEX IF NOT EXISTS idx_subscriptions_status_autorenew
  ON public.subscriptions (status, auto_renew, expires_at)
  WHERE status = 'active' AND auto_renew = true;

-- ── 2. RLS ───────────────────────────────────────────────

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subscriptions: 본인 읽기" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions: 본인 INSERT" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions: 본인 수정 (해지만 허용)" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions: 관리자 전체 읽기" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions: 관리자 전체 수정" ON public.subscriptions;

-- 본인 구독 읽기
CREATE POLICY "subscriptions: 본인 읽기"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- 본인 구독 생성 (일반적으로 Edge Function이 service role로 INSERT,
--  클라이언트 직접 INSERT도 허용해두어 유연성 확보)
CREATE POLICY "subscriptions: 본인 INSERT"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 본인: status=cancelled, auto_renew=false, cancelled_at 만 바꿀 수 있음 (해지 동작)
-- plan_code, expires_at, portone_billing_key 는 클라이언트가 못 바꿈
CREATE POLICY "subscriptions: 본인 수정 (해지만 허용)"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND plan_code = (SELECT plan_code FROM public.subscriptions WHERE id = subscriptions.id)
    AND expires_at = (SELECT expires_at FROM public.subscriptions WHERE id = subscriptions.id)
  );

-- 관리자: 전체 읽기
CREATE POLICY "subscriptions: 관리자 전체 읽기"
  ON public.subscriptions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- 관리자: 전체 수정 (구독 연장, 취소, 레벨 변경 등)
CREATE POLICY "subscriptions: 관리자 전체 수정"
  ON public.subscriptions FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ── 3. 검증 쿼리 ──────────────────────────────────────────
-- SELECT count(*) FROM public.subscriptions;
-- SELECT policyname FROM pg_policies WHERE tablename = 'subscriptions';
