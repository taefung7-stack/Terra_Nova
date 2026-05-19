-- ============================================================
-- Terra Nova English — Migration 004: Storage Buckets
-- Supabase SQL Editor에 그대로 붙여넣어 실행 (idempotent)
-- 실행 순서: 003 완료 후 실행
--
-- 주의: storage.buckets INSERT는 Supabase 대시보드에서도 할 수 있지만
--       SQL로 관리하면 마이그레이션 이력이 남아 편리합니다.
-- ============================================================

-- ── 1. review-proofs 버킷 ─────────────────────────────────
-- 사용처:
--   mypage.html : supabase.storage.from('review-proofs').upload(...)
--   admin.html  : supabase.storage.from('review-proofs').createSignedUrl(...)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'review-proofs',
  'review-proofs',
  false,                                 -- private: signed URL로만 접근
  5242880,                               -- 5MB
  ARRAY['image/jpeg','image/png','image/webp','image/gif','image/heic']
)
ON CONFLICT (id) DO UPDATE SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ── 2. textbook-pdfs 버킷 ────────────────────────────────
-- 사용처:
--   dispatch-monthly-pdf Edge Function: storage.from('textbook-pdfs').createSignedUrl(...)
-- 구조: {YYYY-MM}/{YYYY-MM}-{LEVEL}.pdf  예: 2025-06/2025-06-SATURN.pdf

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'textbook-pdfs',
  'textbook-pdfs',
  false,                                 -- private: Edge Function이 signed URL 생성
  104857600,                             -- 100MB
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ── 3. sample-pdfs 버킷 ──────────────────────────────────
-- 사용처: send-sample Edge Function (있는 경우)
-- 구조: samples/{LEVEL}-sample.pdf

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'sample-pdfs',
  'sample-pdfs',
  false,
  52428800,                              -- 50MB
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ── 4. Storage RLS 정책 ───────────────────────────────────

-- ── review-proofs 정책 ────────────────────────────────────

DROP POLICY IF EXISTS "review-proofs: 본인 업로드" ON storage.objects;
DROP POLICY IF EXISTS "review-proofs: 관리자 읽기" ON storage.objects;
DROP POLICY IF EXISTS "review-proofs: 본인 읽기" ON storage.objects;
DROP POLICY IF EXISTS "review-proofs: 본인 삭제" ON storage.objects;

-- 업로드: 로그인 유저, 본인 폴더({user_id}/...) 만 가능
CREATE POLICY "review-proofs: 본인 업로드"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'review-proofs'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 읽기: 본인 파일 읽기 (signed URL 없이 직접 접근)
CREATE POLICY "review-proofs: 본인 읽기"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'review-proofs'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 읽기: 관리자는 모든 파일 접근 (createSignedUrl에서도 필요)
CREATE POLICY "review-proofs: 관리자 읽기"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'review-proofs'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- 삭제: 본인 파일만
CREATE POLICY "review-proofs: 본인 삭제"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'review-proofs'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── textbook-pdfs 정책 ────────────────────────────────────
-- service_role(Edge Function)이 업로드/signed URL 생성 → 클라이언트 직접 접근 불필요
-- 관리자만 UI에서 파일 관리 가능

DROP POLICY IF EXISTS "textbook-pdfs: 관리자 전체" ON storage.objects;

CREATE POLICY "textbook-pdfs: 관리자 전체"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'textbook-pdfs'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ── sample-pdfs 정책 ─────────────────────────────────────

DROP POLICY IF EXISTS "sample-pdfs: 관리자 전체" ON storage.objects;

CREATE POLICY "sample-pdfs: 관리자 전체"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'sample-pdfs'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ── 5. 검증 쿼리 ──────────────────────────────────────────
-- SELECT id, name, public FROM storage.buckets ORDER BY id;
-- SELECT policyname, bucket_id FROM storage.policies ORDER BY bucket_id;
-- (storage.policies 뷰가 없으면 아래로):
-- SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
