-- ============================================================
-- Terra Nova English — Migration 016: 카카오톡 챗봇 지원
--
-- 목적:
--   - 카카오톡 사용자(채널 메시지 발신자) ID를 우리 profiles 와 매칭
--   - 챗봇 대화 이력 저장 (LLM 컨텍스트 + 비용 모니터링)
--   - LLM 호출량 추적 (월별 토큰 사용량)
-- ============================================================

-- ── 1. profiles 에 카카오 사용자 ID 컬럼 추가 ──
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS kakao_user_id text;

COMMENT ON COLUMN public.profiles.kakao_user_id IS
  '카카오톡 채널 메시지 발신자 ID (카카오 i 오픈빌더 userKey). 챗봇 사용자 식별용.';

CREATE INDEX IF NOT EXISTS idx_profiles_kakao_user_id
  ON public.profiles (kakao_user_id)
  WHERE kakao_user_id IS NOT NULL;

-- ── 2. chatbot_conversations 테이블 (대화 이력) ──
-- 사용자별 대화를 저장하여 LLM 에 멀티턴 컨텍스트 제공
-- 30일 이후 자동 삭제 (TTL은 별도 cron 으로 처리 권장)
CREATE TABLE IF NOT EXISTS public.chatbot_conversations (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  kakao_user_id     text NOT NULL,        -- 매칭 안 된 사용자도 저장 (익명)
  role              text NOT NULL,         -- 'user' | 'assistant' | 'system'
  message           text NOT NULL,
  tokens_input      integer DEFAULT 0,
  tokens_output     integer DEFAULT 0,
  cost_usd          numeric(10, 6) DEFAULT 0,
  model             text DEFAULT 'gpt-4o',
  created_at        timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT chk_role CHECK (role IN ('user', 'assistant', 'system'))
);

CREATE INDEX IF NOT EXISTS idx_chatbot_conv_kakao_user
  ON public.chatbot_conversations (kakao_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chatbot_conv_user_id
  ON public.chatbot_conversations (user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

-- RLS: 본인 대화만 조회 + service_role (Edge Function) 전체 접근
ALTER TABLE public.chatbot_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chatbot_conv: 본인 읽기" ON public.chatbot_conversations;
CREATE POLICY "chatbot_conv: 본인 읽기"
  ON public.chatbot_conversations FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "chatbot_conv: 관리자 전체" ON public.chatbot_conversations;
CREATE POLICY "chatbot_conv: 관리자 전체"
  ON public.chatbot_conversations FOR ALL
  USING (public.is_admin(auth.uid()));

-- ── 3. chatbot_usage_daily 테이블 (일별 비용 모니터링) ──
-- 매일 LLM 호출량/비용 집계 (admin 대시보드에서 모니터링)
CREATE TABLE IF NOT EXISTS public.chatbot_usage_daily (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date              date NOT NULL UNIQUE,
  total_messages    integer NOT NULL DEFAULT 0,
  total_users       integer NOT NULL DEFAULT 0,
  total_tokens_in   bigint NOT NULL DEFAULT 0,
  total_tokens_out  bigint NOT NULL DEFAULT 0,
  total_cost_usd    numeric(10, 4) NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_chatbot_usage_updated_at ON public.chatbot_usage_daily;
CREATE TRIGGER trg_chatbot_usage_updated_at
  BEFORE UPDATE ON public.chatbot_usage_daily
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.chatbot_usage_daily ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chatbot_usage: 관리자만" ON public.chatbot_usage_daily;
CREATE POLICY "chatbot_usage: 관리자만"
  ON public.chatbot_usage_daily FOR ALL
  USING (public.is_admin(auth.uid()));

-- ── 4. Rate Limit 함수 — 카카오 사용자 ID 기준 5분 내 10회 제한 ──
CREATE OR REPLACE FUNCTION public.check_chatbot_rate_limit(p_kakao_user_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
BEGIN
  SELECT count(*) INTO v_count
  FROM public.chatbot_conversations
  WHERE kakao_user_id = p_kakao_user_id
    AND role = 'user'
    AND created_at > (now() - interval '5 minutes');

  -- 5분 내 10회 이하 = 허용 / 11회 이상 = 차단
  RETURN v_count < 10;
END;
$$;

REVOKE ALL ON FUNCTION public.check_chatbot_rate_limit(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_chatbot_rate_limit(text) TO service_role;

-- ── 5. 일별 사용량 집계 RPC (chatbot-handler 호출 후 누적) ──
CREATE OR REPLACE FUNCTION public.upsert_chatbot_usage_daily(
  p_date date,
  p_tokens_in bigint,
  p_tokens_out bigint,
  p_cost_usd numeric
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.chatbot_usage_daily (
    date, total_messages, total_tokens_in, total_tokens_out, total_cost_usd
  )
  VALUES (p_date, 1, p_tokens_in, p_tokens_out, p_cost_usd)
  ON CONFLICT (date) DO UPDATE SET
    total_messages = chatbot_usage_daily.total_messages + 1,
    total_tokens_in = chatbot_usage_daily.total_tokens_in + p_tokens_in,
    total_tokens_out = chatbot_usage_daily.total_tokens_out + p_tokens_out,
    total_cost_usd = chatbot_usage_daily.total_cost_usd + p_cost_usd,
    updated_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.upsert_chatbot_usage_daily(date, bigint, bigint, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.upsert_chatbot_usage_daily(date, bigint, bigint, numeric) TO service_role;

-- ── 6. 검증 ──
-- SELECT column_name FROM information_schema.columns
-- WHERE table_schema='public' AND table_name='profiles' AND column_name='kakao_user_id';
--
-- SELECT count(*) FROM public.chatbot_conversations;
-- SELECT count(*) FROM public.chatbot_usage_daily;
