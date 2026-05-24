-- ============================================================
-- Terra Nova English — Migration 015: products.pdf_path 컬럼
--
-- 배경:
--   마켓 단품(모의고사 분석지·워크북·플래너 등)은 PDF 디지털 상품.
--   결제 완료 시 즉시 다운로드 링크를 이메일로 발송해야 함.
--   상품마다 PDF 파일 경로(textbook-pdfs 또는 market-pdfs 버킷의 object key)를
--   저장할 컬럼이 필요.
--
-- 정책:
--   - pdf_path = NULL 인 상품은 즉시 발송 대상 아님 (실물 상품 또는 미설정)
--   - pdf_path 값 = "market/YYYY-MM-mock-exam-saturn.pdf" 같은 bucket 내 경로
--   - dispatch-order-pdf Edge Function 이 결제 완료 후 이 값을 읽어 signed URL 생성 → 발송
-- ============================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS pdf_path text;

COMMENT ON COLUMN public.products.pdf_path IS
  '디지털 상품의 PDF 파일 경로 (textbook-pdfs 버킷 기준, 예: market/2026-06-mock-exam.pdf). NULL 이면 즉시 발송 대상 아님.';

-- 검증
-- SELECT id, sku, name, pdf_path FROM public.products WHERE pdf_path IS NOT NULL;
