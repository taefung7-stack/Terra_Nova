-- ============================================================
-- Terra Nova English — Migration 013: orders.status 'failed' 추가
--
-- 🚨 Codex 재검수 발견:
--   - 003 마이그레이션의 orders.status CHECK 는
--     ('pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded') 만 허용
--   - portone-webhook 은 금액 불일치 / userId mismatch / orphan payment 시
--     'failed' 로 업데이트하려 했으나 CHECK 위반으로 실제 UPDATE 가 실패
--   - 의미 구분 필요:
--     * cancelled = 사용자가 자발적 취소 (해지)
--     * failed    = 시스템 검증 실패 (금액 불일치, 사용자 불일치 등)
--
-- 해결:
--   1. CHECK 에 'failed' 추가
--   2. portone-webhook 이 'failed' 로 정확히 마킹하도록 유지
-- ============================================================

-- ── 1. 기존 CHECK 제거 후 'failed' 포함하여 재생성 ──
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS chk_order_status;

ALTER TABLE public.orders ADD CONSTRAINT chk_order_status
  CHECK (status IN ('pending', 'paid', 'failed', 'shipped', 'delivered', 'cancelled', 'refunded'));

COMMENT ON CONSTRAINT chk_order_status ON public.orders IS
  '주문 상태: pending(결제대기) | paid(결제완료) | failed(검증실패-금액/사용자 불일치) | shipped | delivered | cancelled(자발적 취소) | refunded';

-- ── 2. 검증 ──────────────────────────────────────────────
-- SELECT conname, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conrelid = 'public.orders'::regclass AND conname = 'chk_order_status';
