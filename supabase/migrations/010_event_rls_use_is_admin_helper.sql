-- ============================================================
-- Terra Nova English — Migration 010: event_submissions + event-proofs RLS 정합성
--
-- 배경: 008 에서 storage RLS 의 admin 체크를 public.is_admin() 헬퍼로 통일했지만,
-- 007 에 있는 event_submissions 테이블 정책 + event-proofs storage 정책 4개가
-- 여전히 EXISTS (SELECT FROM profiles WHERE is_admin) 패턴 사용 중.
--
-- 위험: admin 사용자가 event 관련 데이터/파일 조회 시 RLS 재평가 시 무한재귀
-- 잠재 가능.
--
-- 해결: 모두 public.is_admin(auth.uid()) 호출로 통일.
--
-- 실행 순서: 005 + 007 + 008 완료 후
-- ============================================================

-- ── 1. event_submissions 관리자 정책 ─────────────────────
DROP POLICY IF EXISTS "ev_sub_admin_all" ON public.event_submissions;
CREATE POLICY "ev_sub_admin_all"
  ON public.event_submissions FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ── 2. event-proofs storage 관리자 SELECT ───────────────
DROP POLICY IF EXISTS "event_proofs_admin_select" ON storage.objects;
CREATE POLICY "event_proofs_admin_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'event-proofs'
    AND public.is_admin(auth.uid())
  );

-- ── 3. 검증 ──────────────────────────────────────────────
-- SELECT policyname FROM pg_policies
-- WHERE (tablename = 'event_submissions' OR (schemaname = 'storage' AND tablename = 'objects'))
--   AND policyname LIKE '%admin%'
-- ORDER BY policyname;
