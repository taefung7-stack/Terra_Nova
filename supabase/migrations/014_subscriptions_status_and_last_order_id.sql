-- ============================================================
-- Terra Nova English — Migration 014: subscriptions CHECK + last_order_id 보호
--
-- 🚨 Codex 3차 검수 발견:
--   1. 011 의 protect_subscription_columns 트리거가 'active → pause_requested' 전이를
--      허용하지만, 002 의 subscriptions.status CHECK 에는 'pause_requested' 가 없어
--      실제 DB UPDATE 가 CHECK 위반으로 실패함. 정책과 제약이 불일치.
--   2. 011 의 컬럼 보호 트리거가 last_order_id 변경을 막지 않음. 권한 우회 직접
--      위험은 낮지만 감사/정산 정합성에 영향을 주는 컬럼이라 보호 대상에 포함.
--
-- 해결:
--   1. subscriptions.status CHECK 에 'pause_requested' 추가
--   2. protect_subscription_columns 트리거 함수 갱신 — last_order_id 본인 변경 차단
-- ============================================================

-- ── 1. subscriptions.status CHECK 확장 ─────────────────────
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS chk_status;

ALTER TABLE public.subscriptions ADD CONSTRAINT chk_status
  CHECK (status IN ('active', 'cancelled', 'expired', 'pending', 'pause_requested'));

COMMENT ON CONSTRAINT chk_status ON public.subscriptions IS
  '구독 상태: active(이용중) | cancelled(해지요청) | expired(만료) | pending(결제대기) | pause_requested(일시정지 요청)';

-- ── 2. protect_subscription_columns 트리거 — last_order_id 보호 추가 ──
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
  IF NEW.level IS DISTINCT FROM OLD.level THEN
    RAISE EXCEPTION '레벨 변경은 마이페이지 → 레벨 변경 기능으로 진행하세요.';
  END IF;
  IF NEW.portone_billing_key IS DISTINCT FROM OLD.portone_billing_key THEN
    RAISE EXCEPTION '빌링키는 직접 변경할 수 없습니다.';
  END IF;
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION '구독 소유자는 변경할 수 없습니다.';
  END IF;
  -- 🆕 last_order_id 보호 (Codex 3차 검수 — 감사/정산 정합성)
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

-- ── 3. 검증 ──────────────────────────────────────────────
-- SELECT pg_get_constraintdef(oid) FROM pg_constraint
-- WHERE conrelid = 'public.subscriptions'::regclass AND conname = 'chk_status';
--
-- SELECT pg_get_functiondef(oid) FROM pg_proc
-- WHERE proname = 'protect_subscription_columns';
