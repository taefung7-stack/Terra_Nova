-- ============================================================
-- Terra Nova English — Migration 011: subscriptions RLS 출시 차단급 잠금
--
-- 🚨 출시 차단 이슈 (Codex 검수 발견):
--   1. 002 L71-73: 본인 INSERT 허용 → 사용자가 임의로 active 구독 row 생성 가능
--      → dispatch-monthly-pdf 가 활성 구독으로 인식하여 PDF 무료 발송
--   2. 005 L114-118: 본인 UPDATE 가 user_id 일치만 검증 → plan_code / expires_at
--      / level / portone_billing_key 임의 수정 가능 → 유료 콘텐츠 무한 접근
--
-- 해결 정책:
--   1. INSERT: 일반 사용자 완전 차단. service_role (Edge Function: create-order,
--      portone-webhook, renew-subscriptions) 만 INSERT 가능.
--   2. UPDATE: 본인이 수정 가능한 컬럼을 status / auto_renew /
--      cancelled_at / cancellation_reason 4개로 제한. 다른 컬럼은 트리거로 차단.
--   3. status 변경도 제한: 'active' → 'cancelled' / 'pause_requested' 만 허용.
--      (사용자가 직접 'active' 로 되돌리는 것 차단)
--
-- 실행 순서: 005 완료 후 (별도 마이그레이션이라 010 뒤에 실행)
-- ============================================================

-- ── 1. INSERT 정책 제거 (service_role 만 INSERT 가능하도록) ──
DROP POLICY IF EXISTS "subscriptions: 본인 INSERT" ON public.subscriptions;
-- 새 정책 없음: RLS 활성화 + INSERT 정책 부재 = 클라이언트 INSERT 전부 차단.
-- service_role 은 RLS bypass 라 영향 없음 (Edge Function 정상 동작).

-- ── 2. UPDATE 정책 — 본인은 status/auto_renew/cancelled_at/cancellation_reason 만 ──
DROP POLICY IF EXISTS "subscriptions: 본인 수정 (해지만 허용)" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions: 본인 해지" ON public.subscriptions;

CREATE POLICY "subscriptions: 본인 해지"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
-- USING/WITH CHECK 는 row 단위 — 어떤 컬럼이 바뀌었는지는 보지 못함.
-- 컬럼 단위 보호는 아래 트리거가 담당.

-- ── 3. 컬럼 보호 트리거: 본인이 plan_code/expires_at 등 못 바꾸도록 ──
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
    -- level 변경은 별도 정책: 한 달에 1회 무료 (이후 별도 함수로 제공)
    -- 일단 직접 변경 차단
    RAISE EXCEPTION '레벨 변경은 마이페이지 → 레벨 변경 기능으로 진행하세요.';
  END IF;
  IF NEW.portone_billing_key IS DISTINCT FROM OLD.portone_billing_key THEN
    RAISE EXCEPTION '빌링키는 직접 변경할 수 없습니다.';
  END IF;
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION '구독 소유자는 변경할 수 없습니다.';
  END IF;

  -- status 변경 제한: active → cancelled / pause_requested 만 허용
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF OLD.status = 'active' AND NEW.status NOT IN ('cancelled', 'pause_requested') THEN
      RAISE EXCEPTION '활성 구독은 cancelled / pause_requested 로만 변경할 수 있습니다.';
    END IF;
    IF OLD.status IN ('cancelled', 'expired', 'pending') AND NEW.status = 'active' THEN
      RAISE EXCEPTION '비활성 구독을 활성으로 되돌릴 수 없습니다. (재구독은 새 결제로 진행)';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_subscription_columns ON public.subscriptions;
CREATE TRIGGER trg_protect_subscription_columns
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.protect_subscription_columns();

-- ── 4. DELETE 차단 (사용자가 자기 구독 row 삭제 후 재생성 우회 방지) ──
DROP POLICY IF EXISTS "subscriptions: 본인 삭제" ON public.subscriptions;
-- 삭제 정책 부재 = RLS 활성화 상태에서 모든 클라이언트 DELETE 차단.
-- 필요 시 service_role 이 DELETE.

-- ── 5. 검증 ──────────────────────────────────────────────
-- 정상 동작 시나리오:
--   a. 클라이언트가 INSERT 시도 → "new row violates row-level security policy" 에러
--   b. 클라이언트가 UPDATE plan_code 시도 → "구독 플랜은 직접 변경할 수 없습니다" 에러
--   c. 클라이언트가 UPDATE status='active' (cancelled 상태에서) → "비활성 구독을 활성으로 되돌릴 수 없습니다" 에러
--   d. 사용자가 마이페이지에서 해지 (UPDATE status='cancelled', auto_renew=false) → 정상 동작
--   e. portone-webhook 이 service_role 로 INSERT/UPDATE → 정상 동작 (auth.uid() NULL → trigger pass)
--
-- 확인 쿼리:
-- SELECT polname, polpermissive, polcmd FROM pg_policy
-- WHERE polrelid = 'public.subscriptions'::regclass ORDER BY polname;
--
-- SELECT tgname, tgenabled FROM pg_trigger
-- WHERE tgrelid = 'public.subscriptions'::regclass AND NOT tgisinternal;
