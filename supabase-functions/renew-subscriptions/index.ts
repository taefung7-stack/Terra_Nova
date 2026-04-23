// Terra Nova · 월간 자동 결제 (Recurring Billing) Edge Function
// 배포: supabase functions deploy renew-subscriptions --no-verify-jwt
// 환경변수 (portone-webhook과 공유):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PORTONE_V2_API_SECRET, RENEWAL_CRON_SECRET
//
// 호출 방식 (하루 1회):
//   1. pg_cron → pg_net 으로 HTTP POST (supabase-cron-renewal.sql 참조)
//   2. 헤더 Authorization: Bearer ${RENEWAL_CRON_SECRET} 로 호출자 검증
//
// 처리 로직:
//   1. expires_at <= now() + 1 day 인 active 구독 조회 (billing_key 있는 것만)
//   2. 각 구독별로 포트원 billing key 결제 API 호출
//   3. 성공: 새 order 생성 + subscriptions.expires_at 연장 + last_order_id 업데이트
//   4. 실패: order는 status='cancelled'로 기록, subscription은 status='expired'로 변경
//
// 결과: { processed, succeeded, failed }

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const PORTONE_API_SECRET = Deno.env.get('PORTONE_V2_API_SECRET')!;
const RENEWAL_CRON_SECRET = Deno.env.get('RENEWAL_CRON_SECRET')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // 크론 호출자 인증 (외부에서 임의 호출 차단)
  const auth = req.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ') || auth.slice(7) !== RENEWAL_CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const result = await renewExpiringSubscriptions();
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (err) {
    console.error('[renew] fatal:', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500 });
  }
});

async function renewExpiringSubscriptions() {
  // 1일 이내 만료 예정 + auto_renew + billing_key 보유
  const cutoff = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const { data: subs, error } = await supabase
    .from('subscriptions')
    .select('id, user_id, plan_code, billing_cycle, portone_billing_key, expires_at')
    .eq('status', 'active')
    .eq('auto_renew', true)
    .lte('expires_at', cutoff)
    .not('portone_billing_key', 'is', null);

  if (error) throw error;

  let succeeded = 0;
  let failed = 0;
  const errors: Array<{ subscription_id: string; reason: string }> = [];

  for (const sub of subs || []) {
    try {
      await renewOne(sub);
      succeeded++;
    } catch (e) {
      failed++;
      const reason = (e as Error).message;
      errors.push({ subscription_id: sub.id, reason });
      await markFailed(sub.id, reason);
    }
  }

  return {
    processed: subs?.length || 0,
    succeeded,
    failed,
    errors
  };
}

async function renewOne(sub: {
  id: string;
  user_id: string;
  plan_code: string;
  billing_cycle: string;
  portone_billing_key: string;
  expires_at: string;
}) {
  // 1. 플랜 가격 조회 (products 테이블에서 SKU로)
  const sku = `SUB-${sub.plan_code}-${sub.billing_cycle === 'annual' ? 'ANNUAL' : 'MONTHLY'}`;
  const { data: product, error: prodErr } = await supabase
    .from('products')
    .select('id, name, price')
    .eq('sku', sku)
    .eq('is_active', true)
    .single();

  if (prodErr || !product) {
    throw new Error(`product not found: ${sku}`);
  }

  // 2. 포트원 billing key 결제 요청
  const paymentId = `tn_renew_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const portoneRes = await fetch(`https://api.portone.io/payments/${paymentId}/billing-key`, {
    method: 'POST',
    headers: {
      'Authorization': `PortOne ${PORTONE_API_SECRET}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      billingKey: sub.portone_billing_key,
      orderName: `${product.name} 자동갱신`,
      amount: { total: product.price },
      currency: 'KRW',
      customer: { customerId: sub.user_id }
    })
  });

  const portonePayload = await portoneRes.json();
  if (!portoneRes.ok || portonePayload.status !== 'PAID') {
    throw new Error(`portone decline: ${portonePayload.message || portoneRes.status}`);
  }

  // 3. 새 order 생성
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      user_id: sub.user_id,
      status: 'paid',
      total_amount: product.price,
      payment_method: 'CARD',
      portone_payment_id: paymentId,
      portone_tx_id: portonePayload.transactionId || null,
      paid_at: new Date().toISOString()
    })
    .select('id')
    .single();

  if (orderErr) throw orderErr;

  // 4. subscription 만료일 연장 + last_order_id 갱신
  const newExpires = new Date(sub.expires_at);
  if (sub.billing_cycle === 'annual') newExpires.setFullYear(newExpires.getFullYear() + 1);
  else newExpires.setMonth(newExpires.getMonth() + 1);

  const { error: updErr } = await supabase
    .from('subscriptions')
    .update({
      expires_at: newExpires.toISOString(),
      last_order_id: order.id
    })
    .eq('id', sub.id);

  if (updErr) throw updErr;
}

async function markFailed(subId: string, reason: string) {
  // 자동 갱신 실패 시 status=expired로 전환 (사용자에게 재가입 유도)
  // 추후 n회 재시도 정책이 필요하면 subscriptions에 retry_count 컬럼 추가 권장
  await supabase
    .from('subscriptions')
    .update({
      status: 'expired',
      auto_renew: false,
      cancelled_at: new Date().toISOString()
    })
    .eq('id', subId);

  console.warn(`[renew] sub ${subId} marked expired: ${reason}`);
}
