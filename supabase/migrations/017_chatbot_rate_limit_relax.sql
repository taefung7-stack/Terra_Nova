-- ============================================================
-- Terra Nova — Migration 017: 챗봇 Rate Limit 완화
--
-- 배경: 016 의 5분/10회 제한이 본인 테스트 + 정상 사용자 모두에서
--       너무 빠르게 차단됨. 5분/20회로 완화 + 1분/8회 burst 제한 추가.
-- ============================================================

CREATE OR REPLACE FUNCTION public.check_chatbot_rate_limit(p_kakao_user_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count_5min int;
  v_count_1min int;
BEGIN
  SELECT count(*) INTO v_count_5min
  FROM public.chatbot_conversations
  WHERE kakao_user_id = p_kakao_user_id
    AND role = 'user'
    AND created_at > (now() - interval '5 minutes');

  SELECT count(*) INTO v_count_1min
  FROM public.chatbot_conversations
  WHERE kakao_user_id = p_kakao_user_id
    AND role = 'user'
    AND created_at > (now() - interval '1 minute');

  -- 5분 내 20회 OR 1분 내 8회 초과 시 차단
  -- (어뷰즈 방지 + 정상 사용자 보호 균형)
  RETURN v_count_5min < 20 AND v_count_1min < 8;
END;
$$;

REVOKE ALL ON FUNCTION public.check_chatbot_rate_limit(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_chatbot_rate_limit(text) TO service_role;

-- 검증:
-- SELECT public.check_chatbot_rate_limit('test_user');
