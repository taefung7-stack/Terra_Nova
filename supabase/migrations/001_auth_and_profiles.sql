-- ============================================================
-- Terra Nova English — Migration 001: Auth & Profiles
-- Supabase SQL Editor에 그대로 붙여넣어 실행 (idempotent)
-- 실행 순서: 이 파일을 가장 먼저 실행하세요.
-- ============================================================

-- ── 1. profiles 테이블 ────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id             uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name   text,
  phone          text,
  school         text,
  grade          text,            -- '1', '2', '3' (고1~3) 또는 자유 문자열
  target_score   integer,         -- 목표 수능 점수 0~100
  is_admin       boolean NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- updated_at 자동 갱신을 위한 공용 함수 (존재하면 무시)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 2. auth.users 신규 가입 시 profiles row 자동 생성 ────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;   -- 소셜 로그인 재시도 안전
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 3. RLS 활성화 ────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 기존 정책 제거 (idempotent)
DROP POLICY IF EXISTS "profiles: 본인 읽기" ON public.profiles;
DROP POLICY IF EXISTS "profiles: 본인 수정" ON public.profiles;
DROP POLICY IF EXISTS "profiles: 관리자 전체 읽기" ON public.profiles;
DROP POLICY IF EXISTS "profiles: 관리자 전체 수정" ON public.profiles;
DROP POLICY IF EXISTS "profiles: 서비스 역할 전체 접근" ON public.profiles;

-- 본인 row 읽기
CREATE POLICY "profiles: 본인 읽기"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- 본인 row 수정 (is_admin 컬럼은 클라이언트가 바꾸지 못하도록 check 추가)
CREATE POLICY "profiles: 본인 수정"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- is_admin 값은 현재 DB 값을 유지해야 함 (클라이언트가 true로 올릴 수 없음)
    AND is_admin = (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
  );

-- 관리자: 모든 row 읽기
CREATE POLICY "profiles: 관리자 전체 읽기"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- 관리자: 모든 row 수정 (is_admin 부여/해제 포함)
CREATE POLICY "profiles: 관리자 전체 수정"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- service_role (Edge Functions): 전체 접근 — RLS 우회 불필요하지만 명시
-- service_role은 기본적으로 RLS를 bypass하므로 이 정책은 선택 사항
-- INSERT는 trigger(handle_new_user) + service role 에서만 발생
CREATE POLICY "profiles: 본인 INSERT"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ── 4. 검증 쿼리 ──────────────────────────────────────────
-- 실행 후 아래 쿼리로 확인:
--   SELECT count(*) FROM public.profiles;
--   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
--   SELECT policyname FROM pg_policies WHERE tablename = 'profiles';
