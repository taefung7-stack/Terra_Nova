// Terra Nova · 포트원 v2 결제 클라이언트 (스켈레톤)
// 포트원 계정 심사 완료 후 아래 STORE_ID와 CHANNEL_KEY만 채우면 바로 작동합니다.
//
// 1. https://admin.portone.io > 결제 연동 > 상점 아이디 확인
// 2. 채널 등록: 토스페이먼츠 / 카카오페이 / 네이버페이 / 계좌이체 각각 등록
// 3. 각 채널의 "채널키" 복사 (v2)
// 4. 아래 상수값 교체 + Supabase Edge Function(portone-webhook) 배포

import { supabase } from './supabase-client.js';

const PORTONE_VERSION = 'v2';
const STORE_ID   = 'store-REPLACE_AFTER_APPROVAL';       // 심사 후 교체
const CHANNEL_KEY = 'channel-key-REPLACE_AFTER_APPROVAL'; // 심사 후 교체
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
 * 단건 결제 (일반 상품 주문)
 * @param {object} params
 * @param {string} params.orderName    - "Terra Nova 단어장 BASIC 외 2건"
 * @param {number} params.totalAmount  - 결제 금액 (원)
 * @param {Array}  params.items        - [{product_id, quantity, unit_price, name}]
 * @param {string} params.method       - 'CARD' | 'EASY_PAY' | 'TRANSFER' | 'VIRTUAL_ACCOUNT'
 * @param {object} params.shipping     - {name, phone, zipcode, address, detail}
 */
export async function requestPayment({ orderName, totalAmount, items, method = 'CARD', shipping }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    alert('로그인이 필요합니다.');
    location.href = 'login.html?redirect=' + encodeURIComponent(location.pathname);
    return { success: false, reason: 'auth_required' };
  }

  // 1. 주문 선생성 (pending 상태) — Edge Function 또는 직접 insert
  const paymentId = `tn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // TODO: 주문 레코드 생성은 실제로는 Edge Function으로 이관 필요 (RLS로 client insert 막혀 있음)
  //       현재는 스켈레톤이라 생략. Edge Function 배포 시 아래 supabase.functions.invoke 로 교체.
  //
  // const { data: order, error: orderErr } = await supabase.functions.invoke('create-order', {
  //   body: { items, shipping, payment_id: paymentId }
  // });

  // 2. 포트원 SDK 호출
  try {
    const PortOne = await loadPortoneSDK();
    const response = await PortOne.requestPayment({
      storeId: STORE_ID,
      channelKey: CHANNEL_KEY,
      paymentId,
      orderName,
      totalAmount,
      currency: 'CURRENCY_KRW',
      payMethod: method,
      customer: {
        customerId: user.id,
        fullName: shipping?.name || user.user_metadata?.display_name || user.email,
        phoneNumber: shipping?.phone || user.user_metadata?.phone,
        email: user.email,
      },
      // 배송 주소는 customData로 전달 — webhook이 order에 기록
      customData: {
        userId: user.id,
        items: items,
        shipping: shipping
      }
    });

    if (response.code) {
      // 결제 실패
      return { success: false, reason: response.message, code: response.code };
    }

    // 3. webhook이 서버에서 결제 검증 후 orders 상태를 paid로 변경
    //    클라이언트는 성공 페이지로 이동만 수행
    return { success: true, paymentId, txId: response.txId };

  } catch (err) {
    console.error('[portone] payment error:', err);
    return { success: false, reason: err.message };
  }
}

/**
 * 정기결제 (구독) — 빌링키 발급 후 최초 결제
 */
export async function requestSubscription({ planCode, billingCycle, totalAmount }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    alert('로그인이 필요합니다.');
    location.href = 'login.html';
    return { success: false };
  }

  const paymentId = `tn_sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  try {
    const PortOne = await loadPortoneSDK();
    const response = await PortOne.requestIssueBillingKey({
      storeId: STORE_ID,
      channelKey: CHANNEL_KEY,
      billingKeyMethod: 'CARD',
      issueId: paymentId,
      issueName: `${planCode} ${billingCycle === 'annual' ? '연간' : '월간'} 구독`,
      customer: {
        customerId: user.id,
        fullName: user.user_metadata?.display_name || user.email,
        email: user.email,
      },
      customData: {
        userId: user.id,
        planCode,
        billingCycle,
        totalAmount
      }
    });

    if (response.code) {
      return { success: false, reason: response.message };
    }

    // 빌링키는 webhook이 받아서 subscriptions에 저장하고 최초 결제 실행
    return { success: true, billingKeyId: response.billingKey };

  } catch (err) {
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
