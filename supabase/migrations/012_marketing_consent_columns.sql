-- ============================================================
-- Terra Nova English — Migration 012: 마케팅 · 약관 동의 증적 컬럼
--
-- 🚨 Codex 검수 발견:
--   - signup.html 에서 마케팅 [선택] 동의 체크박스가 UI 에만 있고,
--     실제 값이 DB 에 저장되지 않아 추후 마케팅 발송 시 동의 증적 부재
--   - 정보통신망법 제50조 (영리목적 광고성 정보 전송 제한):
--     사전 동의 + 동의 일시 보존 + 거부 의사표시 처리 가능해야 함
--
-- 해결:
--   1. profiles 테이블에 동의 컬럼 4개 추가
--   2. signup.html 이 가입 시 동의 일시(consentTimestamp) 함께 INSERT
--   3. 마케팅 동의 철회 시 marketing_consent = false, marketing_revoked_at 기록
-- ============================================================

-- ── 1. profiles 동의 컬럼 추가 (없으면 추가) ──
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS marketing_consent boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketing_agreed_at timestamptz,
  ADD COLUMN IF NOT EXISTS marketing_revoked_at timestamptz,
  ADD COLUMN IF NOT EXISTS terms_agreed_at timestamptz,
  ADD COLUMN IF NOT EXISTS privacy_agreed_at timestamptz;

COMMENT ON COLUMN public.profiles.marketing_consent IS '마케팅 정보 수신 동의 여부 (현재 상태)';
COMMENT ON COLUMN public.profiles.marketing_agreed_at IS '마케팅 동의 일시 (정보통신망법 50조 증적)';
COMMENT ON COLUMN public.profiles.marketing_revoked_at IS '마케팅 동의 철회 일시 (수신거부 처리)';
COMMENT ON COLUMN public.profiles.terms_agreed_at IS '이용약관 동의 일시';
COMMENT ON COLUMN public.profiles.privacy_agreed_at IS '개인정보 처리방침 동의 일시';

-- ── 2. handle_new_user 트리거에 동의 정보 전파 (이미 있다면 갱신) ──
-- signUp options.data 에서 받은 동의 메타데이터를 profiles row 에 복사
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, display_name, phone,
    shipping_zipcode, shipping_address, shipping_detail,
    marketing_consent, marketing_agreed_at,
    terms_agreed_at, privacy_agreed_at
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'shipping_zipcode',
    NEW.raw_user_meta_data->>'shipping_address',
    NEW.raw_user_meta_data->>'shipping_detail',
    COALESCE((NEW.raw_user_meta_data->>'marketing_consent')::boolean, false),
    NULLIF(NEW.raw_user_meta_data->>'marketing_agreed_at', '')::timestamptz,
    NULLIF(NEW.raw_user_meta_data->>'terms_agreed_at', '')::timestamptz,
    NULLIF(NEW.raw_user_meta_data->>'privacy_agreed_at', '')::timestamptz
  )
  ON CONFLICT (id) DO UPDATE SET
    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    marketing_consent = EXCLUDED.marketing_consent,
    marketing_agreed_at = COALESCE(EXCLUDED.marketing_agreed_at, profiles.marketing_agreed_at),
    terms_agreed_at = COALESCE(EXCLUDED.terms_agreed_at, profiles.terms_agreed_at),
    privacy_agreed_at = COALESCE(EXCLUDED.privacy_agreed_at, profiles.privacy_agreed_at);
  RETURN NEW;
END;
$$;

-- ── 3. 마케팅 동의 철회 트리거 (UI 에서 OFF 시 자동 기록) ──
CREATE OR REPLACE FUNCTION public.track_marketing_consent_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- false → true: 새로 동의
  IF OLD.marketing_consent = false AND NEW.marketing_consent = true THEN
    NEW.marketing_agreed_at := now();
    NEW.marketing_revoked_at := NULL;
  END IF;
  -- true → false: 동의 철회
  IF OLD.marketing_consent = true AND NEW.marketing_consent = false THEN
    NEW.marketing_revoked_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_marketing_consent_change ON public.profiles;
CREATE TRIGGER trg_marketing_consent_change
  BEFORE UPDATE OF marketing_consent ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.track_marketing_consent_change();

-- ── 4. 인덱스 (마케팅 발송 대상 추출 시 사용) ──
CREATE INDEX IF NOT EXISTS idx_profiles_marketing_consent
  ON public.profiles (marketing_consent)
  WHERE marketing_consent = true;

-- ── 5. 검증 ──────────────────────────────────────────────
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'profiles'
--   AND column_name LIKE '%agreed%' OR column_name LIKE '%consent%' OR column_name LIKE '%revoked%'
-- ORDER BY column_name;
