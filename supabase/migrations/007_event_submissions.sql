-- ============================================================
-- Terra Nova English — Migration 007: 3종 이벤트 인증 시스템
--
-- 리뷰 이벤트 (30% 할인) + SNS 후기 이벤트 (한 달 무료) +
-- 성적인증 이벤트 (6개월 무료) 를 통합 관리하는 event_submissions
-- 테이블 + event-proofs Storage 버킷 + RLS.
--
-- 의존성: 003 (coupons), 004 (storage buckets)
-- 실행: Supabase SQL Editor에 통째로 붙여넣고 Run (idempotent).
--
-- 적용 후 점검 쿼리:
--   SELECT count(*) FROM public.event_submissions;
--   SELECT id, file_size_limit FROM storage.buckets WHERE id = 'event-proofs';
--   SELECT policyname FROM pg_policies
--     WHERE tablename IN ('event_submissions','objects')
--     AND (policyname LIKE 'ev_sub%' OR policyname LIKE 'event_proofs%');
-- ============================================================

-- ── 1. coupons 테이블에 누락 컬럼 추가 ──
-- 003 마이그레이션은 일반 할인 쿠폰 스키마(discount_type/discount_value 등)만
-- 가지고 있어서 admin.html 의 이벤트 쿠폰 발급(user_id, type, reward_kind,
-- reward_value) 흐름과 호환되지 않음. 두 흐름을 공존 가능하게 컬럼 보강.
ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS type         text;
ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS reward_kind  text;
ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS reward_value integer;
ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS used_at      timestamptz;

CREATE INDEX IF NOT EXISTS coupons_user_idx ON public.coupons(user_id, valid_until DESC)
  WHERE user_id IS NOT NULL;

-- ── 2. coupons.reward_kind CHECK 제약 ──
ALTER TABLE public.coupons
  DROP CONSTRAINT IF EXISTS coupons_reward_kind_check;

ALTER TABLE public.coupons
  ADD CONSTRAINT coupons_reward_kind_check
  CHECK (reward_kind IS NULL OR reward_kind IN (
    'free_month_light',      -- LIGHT 1개월 무료
    'percent_off',           -- % 할인
    'fixed_off',             -- 정액 할인
    'discount_30_next',      -- 다음달 30% 할인 (리뷰 이벤트)
    'free_month_any',        -- 한 달 무료 (SNS 후기 이벤트)
    'free_6months'           -- 6개월 무료 (성적인증 이벤트)
  ));

-- ── 3. coupons.type CHECK 제약 ──
ALTER TABLE public.coupons
  DROP CONSTRAINT IF EXISTS coupons_type_check;

ALTER TABLE public.coupons
  ADD CONSTRAINT coupons_type_check
  CHECK (type IS NULL OR type IN (
    'review_sns_free_month',   -- 기존 (점진 폐기 예정)
    'admin_grant',
    'signup_bonus',
    'other',
    'event_review',            -- 리뷰 이벤트 (30% 할인)
    'event_sns',               -- SNS 후기 이벤트 (한 달 무료)
    'event_grade'              -- 성적인증 이벤트 (6개월 무료)
  ));

-- ── 3. event_submissions 테이블 ──
CREATE TABLE IF NOT EXISTS public.event_submissions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type      text NOT NULL CHECK (event_type IN ('review','sns','grade')),
  -- 공통 메시지 (한마디)
  message         text,
  -- 리뷰/SNS 공통: 플랫폼 + 게시물 URL
  sns_platform    text CHECK (sns_platform IN (
    'instagram','blog','naver_cafe','threads','x','youtube','homepage','other'
  )),
  sns_url         text,
  -- 첨부 파일 경로 (event-proofs 버킷)
  proof_path      text,
  proof_path_2    text,    -- 성적인증: 학습 전 성적표 (proof_path는 학습 후)
  -- 검토 상태
  status          text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','rejected')),
  rejection_note  text,
  reviewed_at     timestamptz,
  reviewed_by     uuid REFERENCES auth.users(id),
  -- 발급된 쿠폰 연결
  coupon_id       uuid REFERENCES public.coupons(id) ON DELETE SET NULL,
  -- 메타
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS event_submissions_user_idx
  ON public.event_submissions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS event_submissions_status_idx
  ON public.event_submissions(status, event_type);
CREATE INDEX IF NOT EXISTS event_submissions_pending_idx
  ON public.event_submissions(event_type, created_at DESC)
  WHERE status = 'pending';

-- 1인 1회 제약 (이벤트당) — rejected는 재제출 가능
CREATE UNIQUE INDEX IF NOT EXISTS event_submissions_one_per_user
  ON public.event_submissions(user_id, event_type)
  WHERE status IN ('pending','approved');

COMMENT ON TABLE public.event_submissions IS
  '3종 이벤트(리뷰/SNS/성적인증) 제출 통합 테이블';
COMMENT ON COLUMN public.event_submissions.event_type IS
  'review=리뷰 이벤트(30% 할인), sns=SNS 후기(한달 무료), grade=성적인증(6개월 무료)';
COMMENT ON COLUMN public.event_submissions.proof_path IS
  'event-proofs 버킷의 첨부 파일 경로 (캡처/성적표 등)';
COMMENT ON COLUMN public.event_submissions.proof_path_2 IS
  '성적인증 이벤트: 학습 전 성적표 (proof_path는 학습 후)';

-- ── 4. event-proofs Storage 버킷 ──
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-proofs',
  'event-proofs',
  false,                                  -- private: signed URL로만 접근
  10485760,                               -- 10MB
  ARRAY[
    'image/png','image/jpeg','image/webp','image/heic','image/gif',
    'application/pdf'                     -- 성적표 PDF 허용
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ── 5. event_submissions RLS ──
ALTER TABLE public.event_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ev_sub_own_select" ON public.event_submissions;
CREATE POLICY "ev_sub_own_select"
  ON public.event_submissions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "ev_sub_own_insert" ON public.event_submissions;
CREATE POLICY "ev_sub_own_insert"
  ON public.event_submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

DROP POLICY IF EXISTS "ev_sub_admin_all" ON public.event_submissions;
CREATE POLICY "ev_sub_admin_all"
  ON public.event_submissions FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

-- ── 6. event-proofs Storage RLS ──
DROP POLICY IF EXISTS "event_proofs_own_insert"  ON storage.objects;
DROP POLICY IF EXISTS "event_proofs_own_select"  ON storage.objects;
DROP POLICY IF EXISTS "event_proofs_admin_select" ON storage.objects;

-- 본인 폴더만 INSERT (path는 `{user_id}/{filename}` 형식)
CREATE POLICY "event_proofs_own_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'event-proofs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 본인 폴더 SELECT (mypage에서 내 캡처 다시 보기)
CREATE POLICY "event_proofs_own_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'event-proofs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 관리자는 전체 SELECT (admin.html에서 검토용 signed URL 발급)
CREATE POLICY "event_proofs_admin_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'event-proofs'
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

-- ── 검증 ──
-- SELECT id, file_size_limit/1024/1024 AS limit_mb FROM storage.buckets WHERE id = 'event-proofs';
-- SELECT count(*) FROM public.event_submissions;
-- SELECT policyname, tablename FROM pg_policies
--   WHERE policyname LIKE 'ev_sub%' OR policyname LIKE 'event_proofs%'
--   ORDER BY tablename, policyname;
