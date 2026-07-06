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

  // 2. customData에서 메타정보 복원 (구·신 네이밍 모두 호환)
  const customData = typeof payment.customData === 'string'
    ? JSON.parse(payment.customData) : (payment.customData || {});
  const {
    userId, items = [], shipping = {},
    // 구버전 (planCode/billingCycle) 또는 신버전 (plan/cycle/level)
    planCode: planCodeV1,
    billingCycle: billingCycleV1,
    plan: planV2,
    cycle: cycleV2,
    level,
  } = customData;
  const planCode = planV2 || planCodeV1 || null;
  const billingCycle = cycleV2 || billingCycleV1 || null;

  // 3. create-order pending row 조회 — 모든 결제는 반드시 사전 등록되어야 함
  // order_items.product_snapshot 도 함께 조회 (Codex 3차 검수 발견 — customData 대신 서버 스냅샷 신뢰)
  const { data: existing } = await supabase
    .from('orders')
    .select('id, status, total_amount, user_id, coupon_id, free_months, order_items(product_snapshot, quantity, unit_price)')
    .eq('portone_payment_id', data.paymentId).maybeSingle();

  if (existing && existing.status === 'paid') {
    return new Response(JSON.stringify({ duplicate: true }), { status: 200 });
  }

  // 🛡️ 사전 등록되지 않은 결제 완전 거절 (Codex 2차 검수)
  if (!existing) {
    console.error('[webhook] orphan payment — no pending order', {
      paymentId: data.paymentId,
      portoneAmount: payment.amount?.total,
      userId,
    });
    return new Response(JSON.stringify({
      error: 'orphan_payment',
      message: 'No pending order found. All payments must originate from create-order.',
      paymentId: data.paymentId,
    }), { status: 200 });
  }

  // 🛡️ 금액 검증
  const portoneAmount = payment.amount?.total || 0;
  if (existing.total_amount > 0 && portoneAmount !== existing.total_amount) {
    console.error('[webhook] amount mismatch', {
      paymentId: data.paymentId,
      expected: existing.total_amount,
      actual: portoneAmount,
    });
    await supabase.from('orders').update({
      status: 'failed',
      memo: `amount_mismatch: expected ${existing.total_amount}, got ${portoneAmount}`,
    }).eq('id', existing.id);
    return new Response(JSON.stringify({
      error: 'amount_mismatch',
      expected: existing.total_amount,
      actual: portoneAmount,
    }), { status: 200 });
  }

  // userId 검증
  if (existing.user_id && userId && existing.user_id !== userId) {
    console.error('[webhook] userId mismatch', {
      paymentId: data.paymentId,
      orderUserId: existing.user_id,
      customUserId: userId,
    });
    await supabase.from('orders').update({
      status: 'failed',
      memo: `user_mismatch: order_user=${existing.user_id}, custom_user=${userId}`,
    }).eq('id', existing.id);
    return new Response(JSON.stringify({ error: 'user_mismatch' }), { status: 200 });
  }

  if (!existing.user_id) {
    console.error('[webhook] order has no user_id', { paymentId: data.paymentId });
    return new Response(JSON.stringify({ error: 'order_missing_user' }), { status: 200 });
  }

  const verifiedUserId = existing.user_id;

  // 🛡️ plan/cycle/level 을 customData 대신 order_items.product_snapshot 에서 복원
  // (Codex 3차 검수 발견 — customData 만 조작하여 STANDARD/PREMIUM 활성화 우회 차단)
  let verifiedPlanCode: string | null = null;
  let verifiedBillingCycle: string | null = null;
  let verifiedLevel: string | null = null;
  let isSubscription = false;

  const orderItems = (existing as any).order_items || [];
  for (const item of orderItems) {
    const snap = item.product_snapshot || {};
    if (snap.kind === 'subscription') {
      isSubscription = true;
      verifiedPlanCode = (snap.plan || '').toString().toUpperCase() || null;
      verifiedBillingCycle = (snap.cycle || '').toString() || null;
      verifiedLevel = (snap.level || '').toString().toUpperCase() || null;
      break;
    }
  }

  // customData 와 product_snapshot 이 다르면 cancel — 위조 시도 가능성
  if (isSubscription && planCode && verifiedPlanCode && planCode.toUpperCase() !== verifiedPlanCode) {
    console.error('[webhook] plan mismatch', {
      paymentId: data.paymentId,
      snapshotPlan: verifiedPlanCode,
      customPlan: planCode,
    });
    await supabase.from('orders').update({
      status: 'failed',
      memo: `plan_mismatch: snapshot=${verifiedPlanCode}, custom=${planCode}`,
    }).eq('id', existing.id);
    return new Response(JSON.stringify({ error: 'plan_mismatch' }), { status: 200 });
  }

  // 4. 구독 결제인지 일반 결제인지 분기 — 모든 값은 server-side 스냅샷 신뢰
  if (isSubscription) {
    await activateSubscription(verifiedUserId, verifiedPlanCode!, verifiedBillingCycle, verifiedLevel, payment,
      Number((existing as any).free_months) || 0);
  } else {
    await createOrder(verifiedUserId, payment, items, shipping);
  }

  // 4-b. 쿠폰 사용 처리 — 결제가 확정된 시점에만 기록 (이탈한 pending 주문은 쿠폰 소모 안 함)
  await markCouponUsed((existing as any).coupon_id, verifiedUserId, existing.id);

  // 5. 결제 확인 이메일 (best-effort) — verified 값 사용
  if (payment.customer?.email) {
    await sendEmail(payment.customer.email, 'payment_confirm', {
      plan: verifiedPlanCode || null,
      billingCycle: verifiedBillingCycle || null,
      amount: payment.amount?.total || 0,
      orderNumber: payment.id,
      nextBillingDate: isSubscription
        ? new Date(Date.now() + (verifiedBillingCycle === 'annual' ? 365 : 30) * 86400000).toLocaleDateString('ko-KR')
        : null
    });
  }

  // 6. 결제 완료 직후 PDF 즉시 발송 (best-effort, 실패해도 webhook 은 200 OK)
  const dispatchHeaders = {
    'Authorization': `Bearer ${Deno.env.get('INTERNAL_EMAIL_SECRET')}`,
    'Content-Type': 'application/json',
  };
  if (isSubscription) {
    // 구독 결제 → 그달치 월간 PDF 발송 (dispatch-monthly-pdf)
    try {
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/dispatch-monthly-pdf`, {
        method: 'POST',
        headers: dispatchHeaders,
        body: JSON.stringify({ userId: verifiedUserId }),
      });
    } catch (err) {
      console.error('[webhook] post-subscription dispatch failed (non-fatal):', err);
    }
  } else {
    // 마켓 단품 결제 → 주문 내 디지털 상품 PDF 발송 (dispatch-order-pdf)
    try {
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/dispatch-order-pdf`, {
        method: 'POST',
        headers: dispatchHeaders,
        body: JSON.stringify({ orderId: existing.id }),
      });
    } catch (err) {
      console.error('[webhook] post-market dispatch failed (non-fatal):', err);
    }
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}

// 마켓 단품 결제: create-order 의 pending 주문을 paid 로 UPDATE
// (Codex 4차 검수 발견 — 이전엔 새 INSERT 였어서 PG 켜면 중복 주문 + pending 잔류 위험)
// 상위 handlePayment 에서 이미 existing/금액/userId/snapshot 모두 검증했으므로
// 여기서는 단순 paid 마킹 + 배송 정보 갱신.
async function createOrder(userId: string, payment: any, items: any[], shipping: any) {
  const { error: updErr } = await supabase
    .from('orders')
    .update({
      status: 'paid',
      payment_method: payment.method?.type || 'CARD',
      portone_tx_id: payment.transactionId,
      paid_at: payment.paidAt || new Date().toISOString(),
      // shipping 정보는 create-order 시점 값을 우선하되, webhook 시 보강 가능
      shipping_name: shipping.name ?? undefined,
      shipping_phone: shipping.phone ?? undefined,
      shipping_address: shipping.address ?? undefined,
      shipping_detail: shipping.detail ?? undefined,
      shipping_zipcode: shipping.zipcode ?? undefined,
    })
    .eq('portone_payment_id', payment.id)
    .eq('user_id', userId);  // 이중 안전망

  if (updErr) throw updErr;
  // order_items 는 create-order 시점에 이미 INSERT 됐으므로 추가 작업 없음.
}

// 쿠폰 사용 확정: coupon_uses 기록 + 발급형 쿠폰 used_at 마킹 (idempotent — UNIQUE(coupon_id,user_id))
async function markCouponUsed(couponId: string | null, userId: string, orderId: string) {
  if (!couponId) return;
  try {
    const { error: useErr } = await supabase.from('coupon_uses')
      .insert({ coupon_id: couponId, user_id: userId, order_id: orderId });
    if (useErr && useErr.code !== '23505') throw useErr; // 중복 웹훅 재호출은 무시
    await supabase.from('coupons').update({ used_at: new Date().toISOString() })
      .eq('id', couponId).not('user_id', 'is', null).is('used_at', null);
  } catch (err) {
    // 쿠폰 마킹 실패는 결제 처리 자체를 막지 않음 (로그만 — 수동 보정 가능)
    console.error('[webhook] markCouponUsed failed (non-fatal):', (err as Error).message, { couponId, orderId });
  }
}

async function activateSubscription(userId: string, planCode: string, billingCycle: string, level: string | null, payment: any, freeMonths = 0) {
  // 무료개월 쿠폰(free_months>0)은 월간 첫 결제 0원 + 무료 기간만큼 만료일 연장 → 그 후 정상 갱신 과금
  const addMonths = billingCycle === 'annual' ? 0 : Math.max(1, freeMonths);
  const expiresAt = new Date();
  if (billingCycle === 'annual') expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  else expiresAt.setMonth(expiresAt.getMonth() + addMonths);

  // 상위 handlePayment 에서 existing 검증 완료 — 여기는 pending → paid UPDATE 만
  const { data: updated, error: updErr } = await supabase
    .from('orders')
    .update({
      status: 'paid',
      payment_method: payment.method?.type || 'CARD',
      portone_tx_id: payment.transactionId,
      paid_at: payment.paidAt || new Date().toISOString(),
    })
    .eq('portone_payment_id', payment.id)
    .eq('user_id', userId)
    .select('id')
    .single();
  if (updErr) throw updErr;
  const orderId = updated.id;

  // 중복 active 구독 가드: 같은 유저·레벨의 active 구독이 이미 있으면 INSERT 하지 않고 연장.
  // (재결제는 payment_id 가 달라 order 단 중복체크를 통과 → active 2건 → renew-subscriptions 가
  //  양쪽을 각각 빌링하는 이중 청구가 되므로 반드시 기존 행을 재사용한다.)
  const { data: actives, error: actErr } = await supabase
    .from('subscriptions')
    .select('id, level, expires_at, portone_billing_key')
    .eq('user_id', userId)
    .eq('status', 'active');
  if (actErr) throw actErr;

  const dupe = (actives || []).find((s: any) => (s.level || null) === (level || null));
  if (dupe) {
    // 남은 기간이 있으면 그 끝에서부터 연장 (두 번 결제한 만큼 손해 없게)
    const extendFrom = new Date(Math.max(Date.now(), new Date(dupe.expires_at).getTime()));
    if (billingCycle === 'annual') extendFrom.setFullYear(extendFrom.getFullYear() + 1);
    else extendFrom.setMonth(extendFrom.getMonth() + addMonths);

    const { error: extErr } = await supabase.from('subscriptions').update({
      plan_code: planCode,
      billing_cycle: billingCycle,
      expires_at: extendFrom.toISOString(),
      auto_renew: true,
      portone_billing_key: payment.billingKey || dupe.portone_billing_key || null,
      last_order_id: orderId,
    }).eq('id', dupe.id);
    if (extErr) throw extErr;
    return;
  }

  // subscriptions INSERT (server-side 검증된 plan/cycle/level 사용)
  const { error: subErr } = await supabase.from('subscriptions').insert({
    user_id: userId,
    plan_code: planCode,
    billing_cycle: billingCycle,
    level: level || null,
    status: 'active',
    started_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString(),
    auto_renew: true,
    portone_billing_key: payment.billingKey || null,
    last_order_id: orderId,
  });

  if (subErr) throw subErr;
}

async function handleCancel(data: { paymentId: string }) {
  await supabase.from('orders').update({
    status: 'cancelled'
  }).eq('portone_payment_id', data.paymentId);
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}

// 정기결제(월간) 빌링키 발급 이벤트 → 빌링키로 첫 달 즉시 결제 + 구독 활성화.
// issueId = create-order 가 만든 payment_id (order.portone_payment_id).
// 보안: plan/cycle/level/금액은 order_items.product_snapshot(서버 검증값)만 신뢰.
async function handleBillingKeyIssued(data: any) {
  const billingKey: string | undefined = data?.billingKey;
  const issueId: string | undefined = data?.issueId || data?.issue_id;
  if (!billingKey || !issueId) {
    console.error('[webhook] BillingKey.Issued missing billingKey/issueId', data);
    return new Response(JSON.stringify({ error: 'missing_billing_fields' }), { status: 200 });
  }

  // 1. order 조회 (pending) + 스냅샷에서 plan/cycle/level 복원
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('id, user_id, status, total_amount, coupon_id, free_months, order_items(product_snapshot)')
    .eq('portone_payment_id', issueId)
    .maybeSingle();
  if (orderErr || !order) {
    console.error('[webhook] BillingKey.Issued: order not found', { issueId, err: orderErr?.message });
    return new Response(JSON.stringify({ error: 'order_not_found' }), { status: 200 });
  }
  if (order.status === 'paid') {
    return new Response(JSON.stringify({ status: 'already_paid' }), { status: 200 });
  }

  let planCode: string | null = null, billingCycle: string | null = null, level: string | null = null;
  for (const item of ((order as any).order_items || [])) {
    const snap = item.product_snapshot || {};
    if (snap.kind === 'subscription') {
      planCode = (snap.plan || '').toString().toUpperCase() || null;
      billingCycle = (snap.cycle || '').toString() || null;
      level = (snap.level || '').toString().toUpperCase() || null;
      break;
    }
  }
  if (!planCode) {
    console.error('[webhook] BillingKey.Issued: not a subscription order', { issueId });
    return new Response(JSON.stringify({ error: 'not_subscription' }), { status: 200 });
  }
  // 이니시스 정책: 정기결제(빌링)는 월간만. 연간이 빌링으로 들어오면 거부.
  if (billingCycle !== 'monthly') {
    console.error('[webhook] BillingKey.Issued: billing only allowed for monthly', { issueId, billingCycle });
    return new Response(JSON.stringify({ error: 'billing_cycle_not_monthly' }), { status: 200 });
  }

  const amount = Number(order.total_amount) || 0;
  const freeMonths = Number((order as any).free_months) || 0;

  // 무료개월 쿠폰: 첫 결제 0원 → PortOne 청구 생략, 빌링키만 저장하고 구독 즉시 활성화.
  // 무료 기간(expires_at + freeMonths) 이후 renew-subscriptions 가 정상 과금 시작.
  if (amount === 0 && (order as any).coupon_id && freeMonths > 0) {
    // activateSubscription 은 payment.id(=portone_payment_id) 로 주문을 paid 마킹하므로
    // PortOne 결제 없이도 동일 형태의 합성 payment 객체를 만들어 재사용한다.
    const syntheticPayment = {
      id: issueId,
      billingKey,
      transactionId: null,
      paidAt: new Date().toISOString(),
      method: { type: 'COUPON' },
    };
    await activateSubscription(order.user_id, planCode, billingCycle, level, syntheticPayment, freeMonths);
    await markCouponUsed((order as any).coupon_id, order.user_id, order.id);

    try {
      await fetch(`${SUPABASE_URL}/functions/v1/dispatch-monthly-pdf`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${INTERNAL_EMAIL_SECRET}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: order.user_id, level }),
      });
    } catch (err) {
      console.warn('[webhook] free-month post-activation PDF dispatch failed (non-fatal):', (err as Error).message);
    }
    return new Response(JSON.stringify({ ok: true, charged: 0, free_months: freeMonths }), { status: 200 });
  }

  if (amount <= 0) {
    return new Response(JSON.stringify({ error: 'invalid_amount' }), { status: 200 });
  }

  // 2. 빌링키로 첫 달 즉시 결제 (PortOne V2 API)
  const payRes = await fetch(
    `https://api.portone.io/payments/${encodeURIComponent(issueId)}/billing-key`,
    {
      method: 'POST',
      headers: {
        Authorization: `PortOne ${PORTONE_API_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        billingKey,
        orderName: `Terra Nova ${planCode} · 월간 · ${level || ''}`.trim(),
        // customer.id 는 카카오페이 등 간편결제 빌링에서 안정적 처리를 위해 포함 (선택 필드)
        customer: { id: order.user_id },
        amount: { total: amount },
        currency: 'KRW',
      }),
    }
  );
  if (!payRes.ok) {
    const txt = await payRes.text().catch(() => '');
    console.error('[webhook] billing-key payment failed', { issueId, status: payRes.status, body: txt });
    await supabase.from('orders').update({
      status: 'failed',
      memo: `billing_first_charge_failed: ${payRes.status} ${txt.slice(0, 200)}`,
    }).eq('id', order.id);
    return new Response(JSON.stringify({ error: 'billing_charge_failed' }), { status: 200 });
  }

  // 3. 결제 검증 후 구독 활성화 (기존 activateSubscription 재사용)
  const payment = await fetchPayment(issueId);
  if (payment.status !== 'PAID') {
    console.error('[webhook] billing charge not PAID after API call', { issueId, status: payment.status });
    return new Response(JSON.stringify({ status: 'charge_not_paid', payment_status: payment.status }), { status: 200 });
  }
  // billingKey 를 subscriptions 에 저장하도록 payment 객체에 주입
  payment.billingKey = billingKey;
  await activateSubscription(order.user_id, planCode, billingCycle, level, payment, freeMonths);
  await markCouponUsed((order as any).coupon_id, order.user_id, order.id);

  // 첫 결제 확인 메일 + PDF 발송 (best-effort)
  if (payment.customer?.email) {
    await sendEmail(payment.customer.email, 'payment_confirm', {
      plan: planCode, billingCycle, amount,
      orderNumber: issueId,
      nextBillingDate: new Date(Date.now() + 30 * 86400000).toLocaleDateString('ko-KR'),
    });
  }
  try {
    await fetch(`${SUPABASE_URL}/functions/v1/dispatch-monthly-pdf`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${INTERNAL_EMAIL_SECRET}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: order.user_id, level }),
    });
  } catch (err) {
    console.warn('[webhook] billing post-charge PDF dispatch failed (non-fatal):', (err as Error).message);
  }

  return new Response(JSON.stringify({ ok: true, charged: amount }), { status: 200 });
}
