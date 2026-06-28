// Terra Nova · 마켓 단품 PDF 발송 Edge Function
// 배포: supabase functions deploy dispatch-order-pdf --no-verify-jwt
//
// 운영 정책:
//   - 마켓 단품 결제(market_checkout) 완료 시 portone-webhook 이 호출
//   - 해당 order_id 의 order_items.product_snapshot 을 읽어 PDF 발송
//   - 디지털 상품(pdf_path 존재) 만 발송, 실물 상품(requires_shipping=true) 은 별도 배송 처리
//
// 환경변수:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  — 자동 주입
//   INTERNAL_EMAIL_SECRET                    — webhook 호출 인증 + send-email 호출용
//   SIGNED_URL_TTL_DAYS                      — 다운로드 링크 유효 기간 (default 30)
//
// 입력 (body):
//   { orderId: 'uuid' }  — 발송할 order_id (필수)
//   { force?: boolean }  — 이미 발송된 주문 재발송 (admin 수동 트리거)
//
// 처리:
//   1. orders 조회 → status='paid' 확인
//   2. order_items 조회 → 각 item 의 product_snapshot 에서 pdf_path 추출
//      (없으면 products 테이블에서 직접 조회)
//   3. signed URL 생성 (textbook-pdfs 버킷, 30일)
//   4. send-email 호출 (type='order_pdf')
//   5. orders.memo 에 발송 시각 기록 (멱등성)
//
// 응답: { ok, orderId, sent, items[] }

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const INTERNAL_EMAIL_SECRET = Deno.env.get('INTERNAL_EMAIL_SECRET')!;
const SIGNED_URL_TTL_DAYS = parseInt(Deno.env.get('SIGNED_URL_TTL_DAYS') || '30', 10);

const BUCKET = 'textbook-pdfs';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ── 모의고사(round_meta) → Storage 경로 매핑 ──
// market.html addMock() 이 보내는 round_meta = { year, grade, month, kind, label }
//   grade: '고1' | '고2' | '고3'
//   kind : 'analysis' | 'workbook' | 'variant' | 'bundle'
// 여기 등록된 경로의 PDF만 발송된다 = 화이트리스트.
// ⚠️ 반드시 Terra Nova 정식본만 등록할 것. Impact7 등 내부/검토용 파일은 절대 올리지 말 것.
//    (업로드 스크립트도 Terra Nova 파일만 textbook-pdfs/mock/ 에 올리도록 분리되어 있음)
const GRADE_SLUG: Record<string, string> = { '고1': 'grade1', '고2': 'grade2', '고3': 'grade3' };

// 회차별 자산이 존재하는 항목만 등록. Storage 에 PDF 가 올라간 grade/kind 만 발송된다(화이트리스트).
// 2026-06-29: 고3 + variant(전 학년) PDF 정식본 업로드 → analysis/workbook/variant 모두 발송 대상.
// 키: `${grade}|${year}-${MM}|${kind}` → Storage 경로(또는 bundle 의 경우 구성 목록)
function mockPdfPaths(meta: any): Array<{ name: string; path: string }> {
  if (!meta || typeof meta !== 'object') return [];
  const grade = GRADE_SLUG[String(meta.grade || '')];
  const year = String(meta.year || '');
  const mm = String(meta.month || '').padStart(2, '0');
  const kind = String(meta.kind || '');
  if (!grade || !year || !mm) return [];

  const base = `mock/${year}-${mm}`;
  const label = meta.label ? `${meta.label} ` : '';
  const gradeKo = String(meta.grade || '');

  // 단품 종류 → (표시명, 파일명) 매핑. 등록된 것만 발송.
  const SINGLE: Record<string, { suffix: string; ko: string }> = {
    analysis: { suffix: 'analysis', ko: '본문분석' },
    workbook: { suffix: 'workbook', ko: '워크북' },
    variant:  { suffix: 'variant',  ko: '변형문제' },
  };

  if (kind === 'bundle') {
    // 3종 풀패키지 → 등록된 단품(analysis + workbook + variant)을 모두 발송
    const out: Array<{ name: string; path: string }> = [];
    for (const k of ['analysis', 'workbook', 'variant']) {
      const s = SINGLE[k];
      if (s) out.push({ name: `${label}${gradeKo} 모의고사 ${s.ko}`, path: `${base}/${grade}-${s.suffix}.pdf` });
    }
    return out;
  }

  const s = SINGLE[kind];
  if (!s) return [];
  return [{ name: `${label}${gradeKo} 모의고사 ${s.ko}`, path: `${base}/${grade}-${s.suffix}.pdf` }];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return jsonResp({ error: 'Method not allowed' }, 405);

  // ── 1. 인증 — INTERNAL_EMAIL_SECRET (webhook) OR admin JWT ──
  const auth = req.headers.get('Authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  if (!token) return jsonResp({ error: 'Missing Authorization' }, 401);

  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  let isInternal = (token === INTERNAL_EMAIL_SECRET);
  let isAdmin = false;

  if (!isInternal) {
    const { data: { user } } = await sb.auth.getUser(token);
    if (user) {
      const { data: profile } = await sb.from('profiles').select('is_admin').eq('id', user.id).single();
      isAdmin = !!profile?.is_admin;
    }
    if (!isAdmin) return jsonResp({ error: 'Unauthorized — internal secret or admin required' }, 401);
  }

  // ── 2. 입력 ──
  let body: any = {};
  try { body = await req.json(); } catch {}
  const orderId: string = body.orderId || '';
  const force: boolean = body.force === true;
  if (!orderId) return jsonResp({ error: 'orderId is required' }, 400);

  // ── 3. order 조회 ──
  const { data: order, error: orderErr } = await sb
    .from('orders')
    .select('id, user_id, status, memo, paid_at, order_items(product_id, product_snapshot, quantity)')
    .eq('id', orderId)
    .maybeSingle();

  if (orderErr) return jsonResp({ error: 'Order query failed: ' + orderErr.message }, 500);
  if (!order) return jsonResp({ error: 'Order not found', orderId }, 404);
  if (order.status !== 'paid') {
    return jsonResp({ error: 'Order is not paid', status: order.status, orderId }, 400);
  }

  // 멱등성: 이미 발송된 주문은 skip (memo 에 'order_pdf_sent_at' 마커)
  if (!force && order.memo && order.memo.includes('order_pdf_sent_at=')) {
    return jsonResp({ ok: true, orderId, sent: 0, message: 'Already sent (use force=true to resend)' }, 200);
  }

  // ── 4. 사용자 이메일 ──
  const { data: { user: authUser } } = await sb.auth.admin.getUserById(order.user_id);
  const email = authUser?.email;
  if (!email) return jsonResp({ error: 'No email for user', userId: order.user_id }, 400);

  // ── 5. order_items 각각 처리 — pdf_path 가 있는 디지털 상품만 발송 ──
  const orderItems = (order as any).order_items || [];
  const downloads: Array<{ name: string; url: string }> = [];
  const errors: any[] = [];

  // 발송 대상 (표시명 + Storage 경로) 목록을 모은 뒤 signed URL 생성
  const toSign: Array<{ name: string; path: string; productId?: string }> = [];

  for (const item of orderItems) {
    const snap = item.product_snapshot || {};

    // (A) 모의고사 회차 상품 — round_meta 로 경로 동적 구성 (화이트리스트)
    if (snap.round_meta) {
      const mapped = mockPdfPaths(snap.round_meta);
      if (mapped.length) {
        for (const m of mapped) toSign.push({ name: m.name, path: m.path, productId: item.product_id });
        continue;
      }
      // 매핑 없음(미등록 학년/월/종류) → 스킵 (오류 아님)
      errors.push({ productId: item.product_id, productName: snap.display_name || snap.name, round_meta: snap.round_meta, error: 'No PDF mapped for this round (grade/kind not available)' });
      continue;
    }

    // (B) 기존 단순 상품 — snapshot/products 의 pdf_path
    let pdfPath: string | null = snap.pdf_path || null;
    let productName: string = snap.name || 'PDF 상품';

    if (!pdfPath && item.product_id) {
      const { data: prod } = await sb
        .from('products')
        .select('name, pdf_path, requires_shipping')
        .eq('id', item.product_id)
        .maybeSingle();
      if (prod) {
        pdfPath = prod.pdf_path || null;
        productName = prod.name || productName;
        if (prod.requires_shipping) continue; // 실물 상품 스킵
      }
    }
    if (!pdfPath) continue; // 실물 또는 미설정 → 스킵

    toSign.push({ name: productName, path: pdfPath, productId: item.product_id });
  }

  // signed URL 생성
  for (const t of toSign) {
    const { data: signed, error: signedErr } = await sb.storage
      .from(BUCKET)
      .createSignedUrl(t.path, SIGNED_URL_TTL_DAYS * 24 * 60 * 60);

    if (signedErr || !signed?.signedUrl) {
      errors.push({
        productId: t.productId,
        productName: t.name,
        pdfPath: t.path,
        error: signedErr?.message || 'Signed URL not generated',
      });
      continue;
    }
    downloads.push({ name: t.name, url: signed.signedUrl });
  }

  // 디지털 상품 없으면 메일 발송 안 함 (실물 상품만 주문한 경우)
  if (downloads.length === 0) {
    return jsonResp({
      ok: true, orderId, sent: 0,
      message: 'No digital items to send',
      errors,
    }, 200);
  }

  // ── 6. send-email 호출 (type='order_pdf') ──
  const emailRes = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${INTERNAL_EMAIL_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: email,
      type: 'order_pdf',
      data: {
        orderId,
        downloads,
        ttlDays: SIGNED_URL_TTL_DAYS,
      },
    }),
  });

  const emailOk = emailRes.ok;
  const emailErrText = emailOk ? null : await emailRes.text().catch(() => 'unknown');

  // ── 7. orders.memo 에 발송 마커 기록 (멱등성) ──
  if (emailOk) {
    const sentMarker = `order_pdf_sent_at=${new Date().toISOString()}`;
    const newMemo = order.memo ? `${order.memo} | ${sentMarker}` : sentMarker;
    await sb.from('orders').update({ memo: newMemo }).eq('id', orderId);
  }

  return jsonResp({
    ok: emailOk,
    orderId,
    sent: emailOk ? downloads.length : 0,
    items: downloads.map(d => d.name),
    errors: emailOk ? errors : [...errors, { email: emailErrText }],
  }, 200);
});

function jsonResp(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
