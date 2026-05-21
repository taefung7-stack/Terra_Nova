-- ============================================================
-- Terra Nova English — Migration 009: 무료 샘플 rate-limit RPC
--
-- 배경: send-sample Edge Function 이 check_sample_rate_limit RPC 를 호출하지만
-- 함수가 마이그레이션에 정의되지 않아 항상 catch 로 떨어져 rate limit 미작동.
--
-- 정책: 같은 이메일이 동일 레벨 샘플을 30분 내 재요청 불가.
-- 다른 레벨은 별도 카운트.
--
-- Edge Function 호출 패턴:
--   POST /rest/v1/rpc/check_sample_rate_limit
--   body: { "p_email": "user@x.com", "p_level": "mars" }
--   응답: true (허용) | false (차단)
-- ============================================================

CREATE OR REPLACE FUNCTION public.check_sample_rate_limit(
  p_email text,
  p_level text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
BEGIN
  SELECT count(*) INTO v_count
  FROM public.sample_requests
  WHERE email = p_email
    AND level = p_level
    AND created_at > (now() - interval '30 minutes');

  -- 30분 내 같은 (email, level) 조합으로 0건 = 허용 → true
  -- 1건 이상 있으면 차단 → false
  RETURN v_count = 0;
END;
$$;

-- service_role 만 호출 가능 (Edge Function 만 사용)
REVOKE ALL ON FUNCTION public.check_sample_rate_limit(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.check_sample_rate_limit(text, text) FROM anon;
REVOKE ALL ON FUNCTION public.check_sample_rate_limit(text, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.check_sample_rate_limit(text, text) TO service_role;

-- 검증
-- SELECT public.check_sample_rate_limit('test@x.com', 'mars'); -- true (첫 요청)
-- INSERT INTO public.sample_requests (email, level) VALUES ('test@x.com', 'mars');
-- SELECT public.check_sample_rate_limit('test@x.com', 'mars'); -- false (30분 내 차단)
