-- ============================================================
-- Terra Nova English — Migration 006: sample_requests 테이블
-- send-sample Edge Function 의존성 보완
--
-- 이전 마이그레이션에 누락된 테이블. send-sample 함수가
-- INSERT/UPDATE 하는 컬럼 명세에 맞춰 정의.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.sample_requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email           text NOT NULL,
  level           text NOT NULL,                       -- 'mars'..'sun' (소문자)
  status          text NOT NULL DEFAULT 'pending',     -- 'pending' | 'sent' | 'failed'
  signed_url      text,
  error           text,
  user_agent      text,
  sent_at         timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT chk_sample_status CHECK (status IN ('pending', 'sent', 'failed'))
);

-- updated_at 자동 갱신
DROP TRIGGER IF EXISTS trg_sample_requests_updated_at ON public.sample_requests;
CREATE TRIGGER trg_sample_requests_updated_at
  BEFORE UPDATE ON public.sample_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 인덱스 (rate-limit 체크 + 관리자 조회)
CREATE INDEX IF NOT EXISTS idx_sample_requests_email_created
  ON public.sample_requests (email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sample_requests_status
  ON public.sample_requests (status, created_at DESC);

-- RLS — service_role(Edge Function) 만 접근. 익명/유저 직접 접근 불가
ALTER TABLE public.sample_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sample_requests: 관리자 전체" ON public.sample_requests;
CREATE POLICY "sample_requests: 관리자 전체"
  ON public.sample_requests FOR ALL
  USING (public.is_admin(auth.uid()));

-- 검증
-- SELECT count(*) FROM public.sample_requests;
