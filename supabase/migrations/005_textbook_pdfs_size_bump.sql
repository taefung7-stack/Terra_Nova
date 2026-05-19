-- ============================================================
-- Terra Nova English — Migration 005: textbook-pdfs file size limit bump
--
-- 배경:
--   2026-06 합본(SATURN-fullbook.pdf) = 158MB (표지 + 134p 본문)
--   기존 textbook-pdfs limit 100MB 초과 → 업로드 실패
--
-- 변경:
--   textbook-pdfs:  100MB → 200MB
--   sample-pdfs:    50MB → 50MB (변경 없음, 12p 샘플은 ~18MB)
--
-- 실행: Supabase SQL Editor에 붙여넣고 Run.
-- ============================================================

UPDATE storage.buckets
SET file_size_limit = 209715200    -- 200 MB
WHERE id = 'textbook-pdfs';

-- 검증:
-- SELECT id, file_size_limit / 1024 / 1024 AS limit_mb FROM storage.buckets WHERE id IN ('textbook-pdfs','sample-pdfs');
