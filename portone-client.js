// Terra Nova · 포트원 v2 결제 클라이언트
//
// 설정 단일 소스: site-config.js 의 window.PORTONE_STORE_ID / window.PORTONE_CHANNEL_KEYS
// (모든 HTML <head>에 <script src="./site-config.js"></script> 가 먼저 로드되어야 함)
//
// 현재 운영 정책 (2026-05):
//   - PG 심사 완료: KG이니시스 (신용카드 일반/정기) ← card_inicis 채널
//   - 심사 진행중: 카카오페이, 토스페이먼츠, 다날 (휴대폰)
//   - 따라서 기본 결제수단은 CARD(KG이니시스) 단독. 다른 PG는 통과 시 채널키 추가.

import { supabase, getSession } from './supabase-client.js';

const PORTONE_VERSION = 'v2';
const STORE_ID = (typeof window !== 'undefined' && window.PORTONE_STORE_ID) || '';
const CHANNEL_KEYS = (typeof window !== 'undefined' && window.PORTONE_CHANNEL_KEYS) || {};

// 결제수단별 채널 키 선택 (KG이니시스 우선, 없으면 KCP fallback)
function pickChannelKey(method) {
  const m = (method || 'CARD').toUpperCase();
  if (m === 'CARD') {
    return CHANNEL_KEYS.card_inicis || CHANNEL_KEYS.card_kcp || '';
  }
  if (m === 'EASY_PAY') {
    // 간편결제: 카카오페이 우선, 다음 네이버페이
    return CHANNEL_KEYS.kakaopay || CHANNEL_KEYS.naverpay || '';
  }
  // TRANSFER / VIRTUAL_ACCOUNT 등은 이니시스 채널 재사용
  return CHANNEL_KEYS.card_inicis || '';
}

function assertPortoneReady(channelKey) {
  if (!STORE_ID || !channelKey) {
    alert('결제 시스템 점검중입니다. 잠시 후 다시 시도해주세요.');
    console.error('[portone] missing STORE_ID or channelKey', { STORE_ID, channelKey, CHANNEL_KEYS });
    return false;
  }
  return true;
}

const PORTONE_SDK_URL = 'https://cdn.portone.io/v2/browser-sdk.js';

let sdkLoaded = false;
async function loadPortoneSDK() {
  if (sdkLoaded) return window.PortOne;
  await new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = PORTONE_SDK_URL;
    s.onload = resolve;
    s.onerror = () => reject(new Error('PortOne SDK 로드 실패'));
    document.head.appendChild(s);
  });
  sdkLoaded = true;
  return window.PortOne;
}

/**
 * 단건 결제 (일반 상품 주문) — 서버 검증 가격 사용
 *
 * 보안 흐름:
 *   1) Edge Function 'create-order'를 호출해 서버사이드에서 가격 재계산.
 *      클라이언트가 보낸 totalAmount는 절대 신뢰하지 않음.
 *   2) Function이 orders + order_items 행을 pending 상태로 INSERT 후
 *      payment_id + verified_total을 반환.
 *   3) 그 verified_total로만 PortOne 결제 호출. 클라이언트가 JS를 변조해서
 *      금액을 줄여도 webhook이 다시 검증하므로 결제 통과 안 됨.
 *
 * @param {object} params
 * @param {Array}  params.items     - [{product_id, quantity}] (단가는 서버에서 결정)
 * @param {string} params.method    - 'CARD' | 'EASY_PAY' | 'TRANSFER' | 'VIRTUAL_ACCOUNT'
 * @param {object} params.shipping  - {name, phone, zipcode, address, detail}
 */
export async function requestPayment({ items, method = 'CARD', shipping }) {
  const session = await getSession();
  const user = session?.user;
  if (!user) {
    alert('로그인이 필요합니다.');
    location.href = 'login.html?redirect=' + encodeURIComponent(location.pathname);
    return { success: false, reason: 'auth_required' };
  }

  // 1. 서버사이드에서 가격 검증 + 주문 INSERT
  const { data: order, error: orderErr } = await supabase.functions.invoke('create-order', {
    body: { kind: 'market', items, shipping }
  });
  if (orderErr || !order?.ok) {
    const reason = order?.error || orderErr?.message || 'create-order failed';
    console.error('[portone] order create failed:', reason);
    return { success: false, reason };
  }

  // 2. PortOne SDK 호출 — 서버가 검증한 금액만 사용
  try {
    const channelKey = pickChannelKey(method);
    if (!assertPortoneReady(channelKey)) {
      return { success: false, reason: 'portone_not_configured' };
    }
    const PortOne = await loadPortoneSDK();
    const response = await PortOne.requestPayment({
      storeId: STORE_ID,
      channelKey,
      paymentId: order.payment_id,
      orderName: order.order_name,
      totalAmount: order.verified_total,    // ← 서버 검증 금액
      currency: 'CURRENCY_KRW',
      payMethod: method,
      customer: {
        customerId: user.id,
        fullName: shipping?.name || user.user_metadata?.display_name || user.email,
        phoneNumber: shipping?.phone || user.user_metadata?.phone,
        email: user.email,
      },
      customData: {
        userId: user.id,
        orderId: order.order_id,
        orderNumber: order.order_number,
      }
    });

    if (response.code) {
      // 결제 실패 (사용자 취소, 카드 거절 등)
      return { success: false, reason: response.message, code: response.code };
    }

    // 3. webhook이 서버에서 결제 재검증 후 orders 상태를 paid로 변경
    return { success: true, paymentId: order.payment_id, txId: response.txId, orderId: order.order_id };

  } catch (err) {
    console.error('[portone] payment error:', err);
    return { success: false, reason: err.message };
  }
}

/**
 * 정기결제 (구독) — 빌링키 발급 후 최초 결제
 *
 * 동일하게 create-order 함수에서 plan/cycle/level 검증 후 서버 가격으로만 결제.
 *
 * @param {object} params
 * @param {string} params.plan      - 'LIGHT' | 'STANDARD' | 'PREMIUM'
 * @param {string} params.cycle     - 'monthly' | 'annual'
 * @param {string} params.level     - 'MARS' | 'VENUS' | ... | 'SUN'
 * @param {object} [params.shipping] - 실물 교재 발송 주소 (STANDARD/PREMIUM)
 */
export async function requestSubscription({ plan, cycle = 'monthly', level, shipping }) {
  // 운영 정책: 현재 LIGHT 만 판매중. STANDARD / PREMIUM 은 차단.
  const ACTIVE_PLANS = ['LIGHT'];
  if (!ACTIVE_PLANS.includes((plan || '').toUpperCase())) {
    alert((plan || '선택한') + ' 플랜은 현재 준비중입니다.\n지금은 LIGHT 플랜만 신청 가능합니다.');
    return { success: false, error: 'plan_not_active' };
  }

  const session = await getSession();
  const user = session?.user;
  if (!user) {
    alert('로그인이 필요합니다.');
    location.href = 'login.html';
    return { success: false };
  }

  // 1. 서버사이드 가격 검증 + pending order
  const { data: order, error: orderErr } = await supabase.functions.invoke('create-order', {
    body: { kind: 'subscription', plan, cycle, level, shipping }
  });
  if (orderErr || !order?.ok) {
    const reason = order?.error || orderErr?.message || 'create-order failed';
    console.error('[portone] subscription order create failed:', reason);
    return { success: false, reason };
  }

  // 2. 빌링키 발급 SDK 호출 (정기결제 — KG이니시스 신용카드 채널)
  try {
    const channelKey = pickChannelKey('CARD');
    if (!assertPortoneReady(channelKey)) {
      return { success: false, reason: 'portone_not_configured' };
    }
    const PortOne = await loadPortoneSDK();
    const response = await PortOne.requestIssueBillingKey({
      storeId: STORE_ID,
      channelKey,
      billingKeyMethod: 'CARD',
      issueId: order.payment_id,
      issueName: order.order_name,
      customer: {
        customerId: user.id,
        fullName: user.user_metadata?.display_name || user.email,
        email: user.email,
      },
      customData: {
        userId: user.id,
        orderId: order.order_id,
        plan,
        cycle,
        level,
        verifiedTotal: order.verified_total,  // webhook이 첫 결제 시 사용
      }
    });

    if (response.code) {
      return { success: false, reason: response.message };
    }

    // 빌링키는 webhook이 받아서 subscriptions에 저장하고 최초 결제 실행
    return {
      success: true,
      billingKeyId: response.billingKey,
      paymentId: order.payment_id,
      orderId: order.order_id,
    };

  } catch (err) {
    console.error('[portone] subscription error:', err);
    return { success: false, reason: err.message };
  }
}

/**
 * 결제 취소 / 환불 요청 — Edge Function으로 이관 (서버에서 포트원 API 직접 호출)
 */
export async function requestRefund(orderId, reason) {
  const { data, error } = await supabase.functions.invoke('refund-order', {
    body: { order_id: orderId, reason }
  });
  if (error) return { success: false, reason: error.message };
  return { success: true, data };
}
