// Terra Nova · PDF 재발송 (마이페이지 "다시 받기")
// 배포: supabase functions deploy resend-pdf
// (verify_jwt = true — 로그인 사용자만 호출 가능)
//
// 이메일 링크(서명 URL 30일)가 만료되거나 메일이 유실됐을 때 사용자가 직접
// 자기 계정 이메일로 PDF 를 다시 받는 self-service 경로.
//
// 요청 body:
//   { type: 'order',   orderId: 'uuid' }  — 본인 결제완료(paid) 주문의 디지털 상품 재발송
//   { type: 'monthly' }                   — 본인 활성 구독의 이번 달 교재 재발송
//
// 내부적으로 dispatch-order-pdf / dispatch-monthly-pdf 를 INTERNAL_EMAIL_SECRET
// 으로 호출한다 (두 함수의 발송 대상은 항상 계정 이메일 — 타인 메일로 유출 불가).
// 남용 방지: 사용자당 1시간 5회 제한 (pdf_resend_logs 테이블 — migration 019).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const INTERNAL_EMAIL_SECRET = Deno.env.get('INTERNAL_EMAIL_SECRET')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResp(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return jsonResp({ error: 'Method not allowed' }, 405);

  // ── 1. 사용자 인증 ──────────────────────────────────────
  const jwt = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  if (!jwt) return jsonResp({ error: 'Missing Authorization' }, 401);
  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data: { user }, error: authErr } = await sb.auth.getUser(jwt);
  if (authErr || !user) return jsonResp({ error: 'Invalid or expired JWT' }, 401);

  let body: any;
  try { body = await req.json(); } catch { return jsonResp({ error: 'Invalid JSON body' }, 400); }
  const type = body.type;

  // ── 2. 남용 방지: 최근 1시간 발송 5회 제한 (pdf_resend_logs, migration 019) ──
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: recentCount, error: rlErr } = await sb.from('pdf_resend_logs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', oneHourAgo);
  if (rlErr) console.warn('[resend-pdf] rate-limit check failed:', rlErr.message);
  if ((recentCount ?? 0) >= 5) {
    return jsonResp({ error: '재발송은 1시간에 5회까지 가능합니다. 잠시 후 다시 시도해주세요.' }, 429);
  }
  const logResend = (kind: string, orderId: string | null = null) =>
    sb.from('pdf_resend_logs').insert({ user_id: user.id, kind, order_id: orderId })
      .then(({ error }) => { if (error) console.warn('[resend-pdf] log insert failed:', error.message); });

  const internalHeaders = {
    'Authorization': `Bearer ${INTERNAL_EMAIL_SECRET}`,
    'Content-Type': 'application/json',
  };

  // ── 3a. 단품 주문 PDF 재발송 ────────────────────────────
  if (type === 'order') {
    const orderId = String(body.orderId || '');
    if (!orderId) return jsonResp({ error: 'orderId is required' }, 400);

    // 본인 소유 + 결제완료 주문인지 검증
    const { data: order, error: oErr } = await sb.from('orders')
      .select('id, user_id, status')
      .eq('id', orderId).maybeSingle();
    if (oErr) return jsonResp({ error: 'Order lookup failed' }, 500);
    if (!order || order.user_id !== user.id) return jsonResp({ error: '주문을 찾을 수 없습니다' }, 404);
    if (!['paid', 'shipped', 'delivered'].includes(order.status)) {
      return jsonResp({ error: '결제 완료된 주문만 재발송할 수 있습니다' }, 400);
    }

    const res = await fetch(`${SUPABASE_URL}/functions/v1/dispatch-order-pdf`, {
      method: 'POST', headers: internalHeaders, body: JSON.stringify({ orderId }),
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok) return jsonResp({ error: out.error || '재발송에 실패했습니다' }, 502);
    await logResend('order', orderId);
    return jsonResp({ ok: true, sent: out.sent ?? true });
  }

  // ── 3b. 월간 교재 재발송 (활성 구독) ─────────────────────
  if (type === 'monthly') {
    const { data: subs, error: sErr } = await sb.from('subscriptions')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(1);
    if (sErr) return jsonResp({ error: 'Subscription lookup failed' }, 500);
    if (!subs || subs.length === 0) return jsonResp({ error: '활성 구독이 없습니다' }, 400);

    const res = await fetch(`${SUPABASE_URL}/functions/v1/dispatch-monthly-pdf`, {
      method: 'POST', headers: internalHeaders, body: JSON.stringify({ userId: user.id }),
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok) return jsonResp({ error: out.error || '재발송에 실패했습니다' }, 502);
    await logResend('monthly');
    return jsonResp({ ok: true, sent: out.sent ?? true });
  }

  return jsonResp({ error: `Invalid type: ${type} (expected 'order' or 'monthly')` }, 400);
});
