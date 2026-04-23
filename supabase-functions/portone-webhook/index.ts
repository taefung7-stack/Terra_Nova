// Terra Nova · 포트원 Webhook Handler (Supabase Edge Function)
// 배포: supabase functions deploy portone-webhook --no-verify-jwt
// 환경변수: PORTONE_V2_API_SECRET, PORTONE_WEBHOOK_SECRET (whsec_ 접두사 포함)
//
// 포트원 v2 웹훅 페이로드를 받아서:
// 1. HMAC-SHA256 서명 검증 (Standard Webhooks 스펙) — 위변조 차단
// 2. 서버사이드 결제 검증 (금액 위변조 방지)
// 3. orders 테이블 상태를 pending → paid 로 업데이트
// 4. 구독인 경우 subscriptions 생성·연장
// 5. 중복 웹훅 처리 (idempotency)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const PORTONE_API_SECRET = Deno.env.get('PORTONE_V2_API_SECRET')!;
const PORTONE_WEBHOOK_SECRET = Deno.env.get('PORTONE_WEBHOOK_SECRET')!;
const INTERNAL_EMAIL_SECRET = Deno.env.get('INTERNAL_EMAIL_SECRET') || '';

// 트랜잭셔널 이메일 발송 (실패해도 결제 처리에는 영향 주지 않음 — best-effort)
async function sendEmail(to: string, type: string, data: Record<string, any>) {
  if (!INTERNAL_EMAIL_SECRET) return;
  try {
    await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${INTERNAL_EMAIL_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ to, type, data })
    });
  } catch (err) {
    console.warn('[webhook] email send failed:', (err as Error).message);
  }
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

// ────────────────────────────────────────────────────────────
// Standard Webhooks 스펙 서명 검증
// headers:
//   webhook-id         : 웹훅 고유 ID (리플레이 방지용)
//   webhook-timestamp  : Unix 초 단위 타임스탬프
//   webhook-signature  : "v1,<base64-HMAC-SHA256>" (공백 구분된 다중 서명 허용)
// 서명 대상 문자열: `${id}.${timestamp}.${rawBody}`
// 시크릿 형식     : `whsec_<base64>` — 앞의 whsec_ 제거 후 base64 디코드
// ────────────────────────────────────────────────────────────
async function verifyWebhookSignature(
  rawBody: string,
  headers: Headers
): Promise<{ valid: boolean; reason?: string }> {
  const id = headers.get('webhook-id');
  const timestamp = headers.get('webhook-timestamp');
  const sigHeader = headers.get('webhook-signature');

  if (!id || !timestamp || !sigHeader) {
    return { valid: false, reason: 'missing webhook headers' };
  }

  // 리플레이 공격 방지: ±5분 허용
  const ts = parseInt(timestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(ts) || Math.abs(now - ts) > 300) {
    return { valid: false, reason: 'timestamp out of tolerance' };
  }

  // 시크릿 준비 (whsec_ 접두사 제거 후 base64 디코드)
  const rawSecret = PORTONE_WEBHOOK_SECRET.startsWith('whsec_')
    ? PORTONE_WEBHOOK_SECRET.slice(6)
    : PORTONE_WEBHOOK_SECRET;

  let keyBytes: Uint8Array;
  try {
    keyBytes = Uint8Array.from(atob(rawSecret), (c) => c.charCodeAt(0));
  } catch {
    return { valid: false, reason: 'invalid secret format' };
  }

  // HMAC-SHA256 계산
  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signedContent = `${id}.${timestamp}.${rawBody}`;
  const sigBytes = new Uint8Array(
    await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedContent))
  );
  const expected = btoa(String.fromCharCode(...sigBytes));

  // 헤더는 "v1,sig1 v1,sig2" 형태로 여러 개 올 수 있음 — 하나라도 일치하면 통과
  const provided = sigHeader
    .split(' ')
    .map((part) => part.trim().split(',')[1])
    .filter(Boolean);

  const match = provided.some((p) => constantTimeEqual(p, expected));
  return match ? { valid: true } : { valid: false, reason: 'signature mismatch' };
}

// 타이밍 공격 방지용 상수 시간 비교
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    // 1. 원본 문자열을 먼저 확보 (서명은 raw body 기준으로 검증)
    const rawBody = await req.text();

    // 2. 서명 검증 (프로덕션에서는 반드시 활성화)
    const verify = await verifyWebhookSignature(rawBody, req.headers);
    if (!verify.valid) {
      console.warn('[webhook] rejected:', verify.reason);
      return new Response(JSON.stringify({ error: 'invalid signature', reason: verify.reason }), {
        status: 401
      });
    }

    // 3. 검증 통과 후 JSON 파싱
    const body = JSON.parse(rawBody);
    // 포트원 v2 웹훅 페이로드 구조:
    // { type: 'Transaction.Paid', data: { paymentId, txId, ... } }
    const { type, data } = body;

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
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500 });
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

  // 5. 결제 확인 이메일 (best-effort)
  if (payment.customer?.email) {
    await sendEmail(payment.customer.email, 'payment_confirm', {
      plan: planCode || null,
      billingCycle: billingCycle || null,
      amount: payment.amount?.total || 0,
      orderNumber: payment.id,
      nextBillingDate: planCode
        ? new Date(Date.now() + (billingCycle === 'annual' ? 365 : 30) * 86400000).toLocaleDateString('ko-KR')
        : null
    });
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

  // 1. 첫 결제 주문을 먼저 기록하고 id 확보
  const { data: order, error: orderErr } = await supabase.from('orders').insert({
    user_id: userId,
    status: 'paid',
    total_amount: payment.amount?.total || 0,
    payment_method: payment.method?.type || 'CARD',
    portone_payment_id: payment.id,
    portone_tx_id: payment.transactionId,
    paid_at: payment.paidAt || new Date().toISOString()
  }).select('id').single();

  if (orderErr) throw orderErr;

  // 2. subscriptions에 last_order_id 연결 — 조회 시 "마지막 결제 주문"을 즉시 추적 가능
  const { error: subErr } = await supabase.from('subscriptions').insert({
    user_id: userId,
    plan_code: planCode,
    billing_cycle: billingCycle,
    status: 'active',
    started_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString(),
    auto_renew: true,
    portone_billing_key: payment.billingKey || null,
    last_order_id: order.id
  });

  if (subErr) throw subErr;
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
