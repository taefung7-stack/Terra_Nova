-- ============================================================
-- Terra Nova English — Migration 008: Storage RLS 정책 정합성
--
-- 배경: 005_fix_rls_infinite_recursion.sql 에서 public.is_admin(uuid)
-- SECURITY DEFINER 함수를 도입하여 profiles 정책의 무한재귀를 해결했음.
-- 그러나 004_storage_buckets.sql 의 storage.objects 정책들은 여전히
-- 직접 EXISTS (SELECT FROM profiles WHERE is_admin) 패턴을 사용 중.
--
-- 이 패턴이 storage 정책에 남아 있으면:
--   1. profiles SELECT → profiles RLS 평가 → 다시 storage 정책 트리거 가능
--   2. service_role 로 호출하는 Edge Function 에는 영향 없지만,
--      관리자가 admin.html 에서 storage 파일 직접 조회 시 잠재적 recursion
--
-- 해결: 모든 storage 정책의 admin 체크를 public.is_admin(auth.uid()) 호출로 통일.
--
-- 실행 순서: 005_fix_rls_infinite_recursion.sql 완료 후
-- ============================================================

-- ── 1. review-proofs ─────────────────────────────────────
DROP POLICY IF EXISTS "review-proofs: 관리자 읽기" ON storage.objects;
CREATE POLICY "review-proofs: 관리자 읽기"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'review-proofs'
    AND public.is_admin(auth.uid())
  );

-- ── 2. textbook-pdfs ─────────────────────────────────────
DROP POLICY IF EXISTS "textbook-pdfs: 관리자 전체" ON storage.objects;
CREATE POLICY "textbook-pdfs: 관리자 전체"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'textbook-pdfs'
    AND public.is_admin(auth.uid())
  );

-- ── 3. sample-pdfs ───────────────────────────────────────
DROP POLICY IF EXISTS "sample-pdfs: 관리자 전체" ON storage.objects;
CREATE POLICY "sample-pdfs: 관리자 전체"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'sample-pdfs'
    AND public.is_admin(auth.uid())
  );

-- ── 4. 검증 ──────────────────────────────────────────────
-- SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage'
-- ORDER BY policyname;
