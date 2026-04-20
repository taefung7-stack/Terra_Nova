// Terra Nova · 포트원 Webhook Handler (Supabase Edge Function)
// 배포: supabase functions deploy portone-webhook --no-verify-jwt
// 환경변수: PORTONE_V2_API_SECRET, PORTONE_WEBHOOK_SECRET
//
// 포트원 v2 웹훅 페이로드를 받아서:
// 1. 서버사이드 결제 검증 (금액 위변조 방지)
// 2. orders 테이블 상태를 pending → paid 로 업데이트
// 3. 구독인 경우 subscriptions 생성·연장
// 4. 중복 웹훅 처리 (idempotency)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const PORTONE_API_SECRET = Deno.env.get('PORTONE_V2_API_SECRET')!;
const PORTONE_WEBHOOK_SECRET = Deno.env.get('PORTONE_WEBHOOK_SECRET')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    // 포트원 v2 웹훅 페이로드 구조:
    // { type: 'Transaction.Paid', data: { paymentId, txId, ... } }
    const { type, data } = body;

    // TODO: 서명 검증 — PORTONE_WEBHOOK_SECRET 사용
    //       const signature = req.headers.get('webhook-signature');
    //       verifyWebhookSignature(body, signature, PORTONE_WEBHOOK_SECRET);

    if (type === 'Transaction.Paid' || type === 'Transaction.VirtualAccountIssued') {
      return await handlePayment(data);
    }

    if (type === 'Transaction.Cancelled') {
      return await handleCancel(data);
    }

    if (type === 'BillingKey.Issued') {
      return await handleBillingKeyIssued(data);
    }

    return new Response(JSON.stringify({ ignored: type }), { status: 200 });
  } catch (err) {
    console.error('[webhook] error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});

async function fetchPayment(paymentId: string) {
  const res = await fetch(`https://api.portone.io/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `PortOne ${PORTONE_API_SECRET}` }
  });
  if (!res.ok) throw new Error(`포트원 조회 실패: ${res.status}`);
  return await res.json();
}

async function handlePayment(data: { paymentId: string; txId: string }) {
  // 1. 포트원에서 실제 결제 정보 조회 (클라이언트가 보낸 금액 믿지 말것)
  const payment = await fetchPayment(data.paymentId);

  if (payment.status !== 'PAID') {
    return new Response(JSON.stringify({ status: 'not_paid_yet', payment_status: payment.status }), { status: 200 });
  }

  // 2. customData에서 메타정보 복원
  const customData = typeof payment.customData === 'string'
    ? JSON.parse(payment.customData) : (payment.customData || {});
  const { userId, items = [], shipping = {}, planCode, billingCycle } = customData;

  // 3. 이미 처리된 payment_id인지 확인 (멱등성)
  const { data: existing } = await supabase
    .from('orders').select('id, status')
    .eq('portone_payment_id', data.paymentId).maybeSingle();

  if (existing && existing.status === 'paid') {
    return new Response(JSON.stringify({ duplicate: true }), { status: 200 });
  }

  // 4. 구독 결제인지 일반 결제인지 분기
  if (planCode) {
    await activateSubscription(userId, planCode, billingCycle, payment);
  } else {
    await createOrder(userId, payment, items, shipping);
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}

async function createOrder(userId: string, payment: any, items: any[], shipping: any) {
  // INSERT orders
  const { data: order, error: orderErr } = await supabase
    .from('orders').insert({
      user_id: userId,
      status: 'paid',
      total_amount: payment.amount?.total || 0,
      payment_method: payment.method?.type || 'CARD',
      portone_payment_id: payment.id,
      portone_tx_id: payment.transactionId,
      shipping_name: shipping.name,
      shipping_phone: shipping.phone,
      shipping_address: shipping.address,
      shipping_detail: shipping.detail,
      shipping_zipcode: shipping.zipcode,
      paid_at: payment.paidAt || new Date().toISOString()
    }).select().single();

  if (orderErr) throw orderErr;

  // INSERT order_items
  if (items.length > 0) {
    const orderItems = items.map(it => ({
      order_id: order.id,
      product_id: it.product_id,
      product_snapshot: it,
      quantity: it.quantity || 1,
      unit_price: it.unit_price,
      subtotal: it.unit_price * (it.quantity || 1)
    }));
    await supabase.from('order_items').insert(orderItems);
  }
}

async function activateSubscription(userId: string, planCode: string, billingCycle: string, payment: any) {
  const expiresAt = new Date();
  if (billingCycle === 'annual') expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  else expiresAt.setMonth(expiresAt.getMonth() + 1);

  await supabase.from('subscriptions').insert({
    user_id: userId,
    plan_code: planCode,
    billing_cycle: billingCycle,
    status: 'active',
    started_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString(),
    auto_renew: true,
    portone_billing_key: payment.billingKey || null
  });

  // 첫 결제 주문도 기록
  await supabase.from('orders').insert({
    user_id: userId,
    status: 'paid',
    total_amount: payment.amount?.total || 0,
    payment_method: payment.method?.type || 'CARD',
    portone_payment_id: payment.id,
    portone_tx_id: payment.transactionId,
    paid_at: payment.paidAt || new Date().toISOString()
  });
}

async function handleCancel(data: { paymentId: string }) {
  await supabase.from('orders').update({
    status: 'cancelled'
  }).eq('portone_payment_id', data.paymentId);
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}

async function handleBillingKeyIssued(data: any) {
  // 정기결제 빌링키 발급 이벤트 — 필요 시 별도 처리
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}
