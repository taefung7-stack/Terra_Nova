// Terra Nova · 주문 생성 Edge Function (서버사이드 가격 검증)
// 배포: supabase functions deploy create-order
// (verify_jwt = true (default) — 사용자 JWT가 있어야 호출 가능)
//
// 클라이언트 호출:
//   const { data, error } = await supabase.functions.invoke('create-order', {
//     body: { kind: 'subscription', plan: 'STANDARD', cycle: 'monthly',
//             level: 'SATURN', shipping: {...} }
//   })
//
// 응답: { payment_id, verified_total, order_id, order_number }
// 클라이언트는 verified_total로만 PortOne 결제 호출 → 가격 위변조 차단.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// ─── 서버사이드 가격 표 (구독 플랜) ──────────────────────────
// 클라이언트가 보내온 plan/cycle 조합으로 canonical 가격 결정.
// 가격 변경 시 여기 + landing.html 동기화 필요.
const PLAN_PRICES = {
  LIGHT: { monthly: 11900, annual: 119000 },
  STANDARD: { monthly: 24900, annual: 249000 },
  PREMIUM: { monthly: 58900, annual: 589000 },
} as const;

// ─── 운영 정책: 현재 활성화된 플랜 (Codex 3차 검수 발견) ──────
// 프론트는 STANDARD/PREMIUM 차단했지만 API 직접 호출은 막지 않았음.
// 실물 배송 파트너 계약 완료 시 ACTIVE_PLANS 에 'STANDARD', 'PREMIUM' 추가.
const ACTIVE_PLANS = new Set(['LIGHT']);

const PLAN_NAMES = {
  LIGHT: 'Terra Nova LIGHT (PDF 교재)',
  STANDARD: 'Terra Nova STANDARD (실물 교재 + PDF)',
  PREMIUM: 'Terra Nova PREMIUM (해설 강의 포함)',
} as const;

const VALID_LEVELS = ['MARS', 'VENUS', 'TERRA', 'NEPTUNE', 'URANUS', 'SATURN', 'JUPITER', 'SUN'];

// 8자리 랜덤 결제 ID
function makePaymentId(prefix: string): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${ts}_${rand}`;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // ─── 1. 사용자 인증 (Authorization Bearer JWT) ────────
  const authHeader = req.headers.get('Authorization') || '';
  const jwt = authHeader.replace(/^Bearer\s+/i, '');
  if (!jwt) {
    return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data: { user }, error: authErr } = await sb.auth.getUser(jwt);
  if (authErr || !user) {
    return new Response(JSON.stringify({ error: 'Invalid or expired JWT' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // ─── 2. 입력 파싱 ────────────────────────────────────
  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const kind = body.kind;
  const shipping = body.shipping || {};

  // 공통 결과 변수
  let orderName = '';
  let totalAmount = 0;
  let lineItems: Array<{ product_id?: string; product_snapshot: any; quantity: number; unit_price: number; subtotal: number }> = [];
  let paymentMethod: string | null = null;
  let paymentIdPrefix = 'tn';

  // ─── 3a. 구독 주문 ────────────────────────────────────
  if (kind === 'subscription') {
    const plan = String(body.plan || '').toUpperCase();
    const cycle = String(body.cycle || 'monthly');
    const level = String(body.level || '').toUpperCase();

    if (!(plan in PLAN_PRICES)) {
      return jsonError(`Invalid plan: ${plan}`, 400);
    }
    // 🛡️ 활성화된 플랜만 허용 (Codex 3차 검수 발견)
    if (!ACTIVE_PLANS.has(plan)) {
      return jsonError(`Plan currently unavailable: ${plan}. Only ${Array.from(ACTIVE_PLANS).join(', ')} is active.`, 403);
    }
    if (cycle !== 'monthly' && cycle !== 'annual') {
      return jsonError(`Invalid cycle: ${cycle}`, 400);
    }
    if (!VALID_LEVELS.includes(level)) {
      return jsonError(`Invalid level: ${level}`, 400);
    }

    totalAmount = PLAN_PRICES[plan as keyof typeof PLAN_PRICES][cycle as 'monthly' | 'annual'];
    orderName = `${PLAN_NAMES[plan as keyof typeof PLAN_NAMES]} · ${cycle === 'annual' ? '연간' : '월간'} · ${level}`;
    paymentIdPrefix = 'tn_sub';
    lineItems = [{
      product_snapshot: { kind: 'subscription', plan, cycle, level, name: orderName, price: totalAmount },
      quantity: 1,
      unit_price: totalAmount,
      subtotal: totalAmount,
    }];
  }
  // ─── 3b. 마켓 주문 (단어장 등) ─────────────────────────
  else if (kind === 'market') {
    const items = Array.isArray(body.items) ? body.items : [];
    if (items.length === 0) return jsonError('items[] is required for market orders', 400);
    if (items.length > 50) return jsonError('items[] too long (max 50)', 400);

    // products 테이블에서 canonical 가격 조회
    const productIds = items.map((it: any) => String(it.product_id)).filter(Boolean);
    if (productIds.length === 0) return jsonError('Invalid items[]: missing product_id', 400);

    const { data: products, error: prodErr } = await sb
      .from('products')
      .select('id,sku,name,price,is_active,requires_shipping')
      .in('id', productIds);
    if (prodErr) return jsonError('Product lookup failed: ' + prodErr.message, 500);

    const prodMap = new Map(products!.map(p => [p.id, p]));
    for (const it of items) {
      const p = prodMap.get(String(it.product_id));
      if (!p) return jsonError(`Product not found: ${it.product_id}`, 400);
      if (!p.is_active) return jsonError(`Product not available: ${p.sku}`, 400);
      const qty = Math.max(1, Math.min(99, parseInt(String(it.quantity || 1), 10)));
      const subtotal = p.price * qty;
      totalAmount += subtotal;
      lineItems.push({
        product_id: p.id,
        product_snapshot: { sku: p.sku, name: p.name, price: p.price },
        quantity: qty,
        unit_price: p.price,
        subtotal,
      });
    }
    orderName = lineItems.length === 1
      ? lineItems[0].product_snapshot.name
      : `${lineItems[0].product_snapshot.name} 외 ${lineItems.length - 1}건`;
  }
  else {
    return jsonError(`Invalid kind: ${kind} (expected 'subscription' or 'market')`, 400);
  }

  if (totalAmount <= 0) return jsonError('totalAmount must be > 0', 400);

  // ─── 4. orders INSERT ───────────────────────────────
  const paymentId = makePaymentId(paymentIdPrefix);
  const { data: order, error: orderErr } = await sb
    .from('orders')
    .insert({
      user_id: user.id,
      status: 'pending',
      total_amount: totalAmount,
      payment_method: paymentMethod,
      portone_payment_id: paymentId,
      shipping_name: shipping.name || null,
      shipping_phone: shipping.phone || null,
      shipping_address: shipping.address || null,
      shipping_detail: shipping.detail || null,
      shipping_zipcode: shipping.zipcode || null,
      memo: kind === 'subscription' ? `plan=${body.plan} cycle=${body.cycle} level=${body.level}` : null,
    })
    .select('id, order_number')
    .single();
  if (orderErr) return jsonError('Order insert failed: ' + orderErr.message, 500);

  // ─── 5. order_items INSERT ──────────────────────────
  const itemsToInsert = lineItems.map(li => ({
    order_id: order.id,
    product_id: li.product_id || null,
    product_snapshot: li.product_snapshot,
    quantity: li.quantity,
    unit_price: li.unit_price,
    subtotal: li.subtotal,
  }));
  const { error: itemsErr } = await sb.from('order_items').insert(itemsToInsert);
  if (itemsErr) {
    // 롤백: orders도 제거 (best-effort)
    await sb.from('orders').delete().eq('id', order.id);
    return jsonError('Order items insert failed: ' + itemsErr.message, 500);
  }

  // ─── 6. 응답 ─────────────────────────────────────────
  return new Response(
    JSON.stringify({
      ok: true,
      payment_id: paymentId,
      verified_total: totalAmount,
      order_id: order.id,
      order_number: order.order_number,
      order_name: orderName,
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});

function jsonError(message: string, status: number) {
  console.warn('[create-order]', status, message);
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
