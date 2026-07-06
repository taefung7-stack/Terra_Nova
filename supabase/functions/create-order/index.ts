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
// 판매 가능 레벨만 주문 허용. 교재 완성본이 Storage에 올라간 레벨만 추가한다.
// 2026-07: TERRA(중1) 개통. NEPTUNE(중2)/URANUS(중3)는 교재 미완료라 차단 유지.
const ACTIVE_LEVELS = new Set(['MARS', 'VENUS', 'TERRA', 'SATURN', 'JUPITER', 'SUN']);

// 8자리 랜덤 결제 ID.
// NICE 빌링키 발급 issueId는 영문/숫자 40자 이내만 허용하므로 구독 주문은 alnum 형식을 쓴다.
function makePaymentId(prefix: string, alnum = false): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 10);
  if (alnum) return `${prefix}${ts}${rand}`;
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
  const couponCode = typeof body.coupon_code === 'string' ? body.coupon_code.trim().toUpperCase() : '';

  // 공통 결과 변수
  let orderName = '';
  let totalAmount = 0;
  let lineItems: Array<{ product_id?: string; product_snapshot: any; quantity: number; unit_price: number; subtotal: number }> = [];
  let paymentMethod: string | null = null;
  let paymentIdPrefix = 'tn';
  // 쿠폰 적용 결과 (구독 주문만 지원)
  let couponId: string | null = null;
  let discountAmount = 0;
  let freeMonths = 0;

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
    if (!ACTIVE_LEVELS.has(level)) {
      return jsonError(`Level currently unavailable: ${level}. Middle-school levels are not open yet.`, 403);
    }

    totalAmount = PLAN_PRICES[plan as keyof typeof PLAN_PRICES][cycle as 'monthly' | 'annual'];
    // 이니시스 입점조건: 연간은 1회성 일반결제이므로 "12개월 서비스 제공"을 상품명에 명시.
    const cycleLabel = cycle === 'annual' ? '연간 (12개월 서비스 제공)' : '월간';
    orderName = `${PLAN_NAMES[plan as keyof typeof PLAN_NAMES]} · ${cycleLabel} · ${level}`;
    paymentIdPrefix = 'tnsub';
    lineItems = [{
      product_snapshot: { kind: 'subscription', plan, cycle, level, name: orderName, price: totalAmount },
      quantity: 1,
      unit_price: totalAmount,
      subtotal: totalAmount,
    }];

    // ── 쿠폰 서버사이드 검증·적용 (구독 주문만) ──────────────
    // 검증 규칙은 migrations/019 validate_coupon v2 와 동일해야 한다 (동기화 주의).
    if (couponCode) {
      const { data: coupon, error: cErr } = await sb
        .from('coupons')
        .select('*')
        .eq('code', couponCode)
        .eq('is_active', true)
        .maybeSingle();
      if (cErr) return jsonError('Coupon lookup failed: ' + cErr.message, 500);
      if (!coupon) return jsonError('존재하지 않는 쿠폰입니다', 400);
      if (coupon.user_id && coupon.user_id !== user.id) return jsonError('본인에게 발급된 쿠폰이 아닙니다', 403);
      if (coupon.user_id && coupon.used_at) return jsonError('이미 사용한 쿠폰입니다', 400);
      const nowTs = Date.now();
      if (coupon.valid_from && nowTs < new Date(coupon.valid_from).getTime()) return jsonError('아직 사용할 수 없는 쿠폰입니다', 400);
      if (coupon.valid_until && nowTs > new Date(coupon.valid_until).getTime()) return jsonError('만료된 쿠폰입니다', 400);
      if (Array.isArray(coupon.applicable_plans) && coupon.applicable_plans.length > 0
          && !coupon.applicable_plans.includes(plan)) return jsonError('이 플랜에는 적용할 수 없는 쿠폰입니다', 400);
      if (Array.isArray(coupon.applicable_billing) && coupon.applicable_billing.length > 0
          && !coupon.applicable_billing.includes(cycle)) return jsonError('이 결제 주기에는 적용할 수 없는 쿠폰입니다', 400);

      // 사용 횟수 (coupon_uses 는 webhook 이 결제 확정 시 기록)
      const { count: totalUses } = await sb.from('coupon_uses')
        .select('id', { count: 'exact', head: true }).eq('coupon_id', coupon.id);
      if (coupon.max_uses != null && (totalUses ?? 0) >= coupon.max_uses) return jsonError('사용 한도가 초과된 쿠폰입니다', 400);
      const { count: userUses } = await sb.from('coupon_uses')
        .select('id', { count: 'exact', head: true }).eq('coupon_id', coupon.id).eq('user_id', user.id);
      if ((userUses ?? 0) >= (coupon.max_uses_per_user ?? 1)) return jsonError('이미 사용한 쿠폰입니다', 400);

      // 보상 해석 — 무료개월(월간 전용: 첫 결제 0원 + expires_at 연장) / 퍼센트 / 정액
      freeMonths = coupon.reward_kind === 'free_6months' ? 6
        : (coupon.reward_kind === 'free_month_any' || coupon.reward_kind === 'free_month_light') ? 1 : 0;
      if (freeMonths > 0) {
        if (cycle !== 'monthly') return jsonError('이 쿠폰은 월간 정기결제에서만 사용할 수 있습니다', 400);
        discountAmount = totalAmount;
      } else if (coupon.reward_kind === 'discount_30_next' && !(coupon.discount_value > 0)) {
        discountAmount = Math.floor(totalAmount * 30 / 100); // 레거시 0원 발급분 폴백
      } else if (coupon.discount_type === 'percentage') {
        discountAmount = Math.floor(totalAmount * (coupon.discount_value || 0) / 100);
        if (coupon.max_discount_amount != null) discountAmount = Math.min(discountAmount, coupon.max_discount_amount);
      } else {
        discountAmount = Math.min(coupon.discount_value || 0, totalAmount);
      }
      discountAmount = Math.max(0, Math.min(discountAmount, totalAmount));
      couponId = coupon.id;
      totalAmount -= discountAmount;
    }
  }
  // ─── 3b. 마켓 주문 (단어장·모의고사 등) ─────────────────────────
  else if (kind === 'market') {
    const items = Array.isArray(body.items) ? body.items : [];
    if (items.length === 0) return jsonError('items[] is required for market orders', 400);
    if (items.length > 50) return jsonError('items[] too long (max 50)', 400);

    // products 테이블에서 canonical 가격 조회 — UUID(product_id) 또는 sku 둘 다 지원
    const productIds = items.map((it: any) => String(it.product_id || '')).filter(Boolean);
    const skus = items.map((it: any) => String(it.sku || '')).filter(Boolean);
    if (productIds.length === 0 && skus.length === 0) {
      return jsonError('Invalid items[]: each item must have product_id (UUID) or sku', 400);
    }

    let query = sb.from('products').select('id,sku,name,price,is_active,requires_shipping');
    // UUID 또는 sku 어느 쪽이라도 매치되는 모든 상품 조회
    if (productIds.length && skus.length) {
      query = query.or(`id.in.(${productIds.join(',')}),sku.in.(${skus.join(',')})`);
    } else if (productIds.length) {
      query = query.in('id', productIds);
    } else {
      query = query.in('sku', skus);
    }
    const { data: products, error: prodErr } = await query;
    if (prodErr) return jsonError('Product lookup failed: ' + prodErr.message, 500);

    const byId  = new Map(products!.map(p => [p.id,  p]));
    const bySku = new Map(products!.map(p => [p.sku, p]));
    for (const it of items) {
      const p = (it.product_id && byId.get(String(it.product_id)))
             || (it.sku && bySku.get(String(it.sku)));
      if (!p) return jsonError(`Product not found: ${it.product_id || it.sku}`, 400);
      if (!p.is_active) return jsonError(`Product not available: ${p.sku}`, 400);
      const qty = Math.max(1, Math.min(99, parseInt(String(it.quantity || 1), 10)));
      const subtotal = p.price * qty;
      totalAmount += subtotal;

      // round_meta: 회차/학년/월 등 클라이언트가 보낸 부가 정보를 product_snapshot에 보존
      // dispatch-order-pdf 가 이걸 읽어 어느 회차 PDF 를 보낼지 결정
      const snapshot: Record<string, unknown> = { sku: p.sku, name: p.name, price: p.price };
      if (it.round_meta && typeof it.round_meta === 'object') {
        snapshot.round_meta = it.round_meta;
        // 상품명에 회차 라벨 부가 (관리자/주문내역 가독성)
        if (it.round_meta.label) snapshot.display_name = `${it.round_meta.label} · ${p.name}`;
      }
      lineItems.push({
        product_id: p.id,
        product_snapshot: snapshot,
        quantity: qty,
        unit_price: p.price,
        subtotal,
      });
    }
    const firstName = (lineItems[0].product_snapshot as any).display_name
                   || (lineItems[0].product_snapshot as any).name;
    orderName = lineItems.length === 1
      ? firstName
      : `${firstName} 외 ${lineItems.length - 1}건`;
  }
  else {
    return jsonError(`Invalid kind: ${kind} (expected 'subscription' or 'market')`, 400);
  }

  // 0원은 무료개월 쿠폰(월간 빌링키 발급 후 첫 결제 생략)일 때만 허용
  if (totalAmount < 0 || (totalAmount === 0 && !(couponId && freeMonths > 0))) {
    return jsonError('totalAmount must be > 0', 400);
  }

  // ─── 4. orders INSERT ───────────────────────────────
  const paymentId = makePaymentId(paymentIdPrefix, kind === 'subscription');
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
      coupon_id: couponId,
      discount_amount: discountAmount,
      free_months: freeMonths,
      memo: kind === 'subscription'
        ? `plan=${body.plan} cycle=${body.cycle} level=${body.level}${couponCode ? ` coupon=${couponCode} -${discountAmount}` : ''}`
        : null,
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
      discount_amount: discountAmount,
      free_months: freeMonths,
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
