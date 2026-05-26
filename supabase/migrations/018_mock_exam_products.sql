-- ============================================================
-- Terra Nova English — Migration 018: 모의고사 마켓 상품 4종 등록
--
-- 배경:
--   market.html에서 판매할 모의고사 분석지·워크북·변형문제·3종번들 4개 상품을
--   products 테이블에 등록한다.
--
-- 설계 결정:
--   - 회차(년/월/학년)별로 상품을 만들면 12회/년 × 4종 × 3학년 = 144개로 폭증.
--     → 카탈로그 상품은 4종 SKU만 고정 등록하고,
--       회차 정보는 클라이언트가 cart item의 round_meta로 전송 →
--       order_items.product_snapshot에 함께 저장하는 방식으로 처리.
--   - pdf_path는 NULL로 두고 dispatch-order-pdf가 round_meta를 보고
--     동적으로 PDF 경로를 구성한다 (예: market/2026-06-grade2-analysis.pdf).
--     실제 PDF는 Storage에 회차별로 업로드 (별도 작업).
--
-- 카테고리:
--   기존 'subscription' | 'textbook' | 'merchandise' 에 'mock_exam' 추가.
-- ============================================================

-- 1) 카테고리 제약 검증 — 'mock_exam' 카테고리 허용 (현재 별도 CHECK가 없으므로 INSERT만)

-- 2) 4종 상품 등록 (UPSERT — 재실행 안전)
INSERT INTO public.products (sku, name, category, price, description, is_active, requires_shipping, sort_order)
VALUES
  ('mock-analysis', '모의고사 분석지',    'mock_exam', 4900,
   '지문별 논리구조·오답 원인·출제 포인트를 체계적으로 정리한 심층 해설 PDF.',
   true, false, 10),
  ('mock-workbook', '모의고사 워크북',    'mock_exam', 4900,
   '본문 빈칸·어휘 자가 점검·구문 연습으로 회독 효과를 극대화하는 실전 워크북.',
   true, false, 20),
  ('mock-variant',  '모의고사 변형문제',  'mock_exam', 4900,
   '원본 지문을 어휘 교체·빈칸 변경·순서 재구성으로 변형한 실전 문제집.',
   true, false, 30),
  ('mock-bundle',   '모의고사 3종 풀패키지', 'mock_exam', 11760,
   '분석지+워크북+변형문제 3종 묶음 (정가 14,700원에서 20% 할인). 회차당 3개 PDF 발송.',
   true, false, 40)
ON CONFLICT (sku) DO UPDATE
  SET name = EXCLUDED.name,
      price = EXCLUDED.price,
      description = EXCLUDED.description,
      is_active = true,
      requires_shipping = false,
      sort_order = EXCLUDED.sort_order,
      updated_at = now();

-- 3) 검증 쿼리 (수동 실행용)
-- SELECT sku, name, price, category FROM public.products WHERE category = 'mock_exam' ORDER BY sort_order;
