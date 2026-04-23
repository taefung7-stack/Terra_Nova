// Terra Nova · 트랜잭셔널 이메일 발송 Edge Function (Resend 기반)
// 배포: supabase functions deploy send-email --no-verify-jwt
// 환경변수:
//   RESEND_API_KEY         — https://resend.com/api-keys (무료 월 3,000건)
//   EMAIL_FROM             — "Terra Nova <no-reply@terra-nova.kr>" (도메인 verify 필요)
//   INTERNAL_EMAIL_SECRET  — 내부 호출자 인증용 랜덤 시크릿
//
// 사용처 (internal webhook/cron에서 호출):
//   - portone-webhook: 결제 완료 시 영수증 이메일
//   - renew-subscriptions: 자동 갱신 성공/실패 통보
//   - 가입 환영 이메일은 Supabase Auth의 Email Templates 기본 기능 사용 권장
//
// 지원 템플릿 (type):
//   - "payment_confirm"  : 결제 완료
//   - "renewal_success"  : 자동 갱신 성공
//   - "renewal_failure"  : 자동 갱신 실패 (재가입 유도)
//   - "custom"           : subject/html을 직접 지정

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const EMAIL_FROM = Deno.env.get('EMAIL_FROM') || 'Terra Nova <no-reply@terra-nova.kr>';
const INTERNAL_EMAIL_SECRET = Deno.env.get('INTERNAL_EMAIL_SECRET')!;

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  // 내부 호출자 인증
  const auth = req.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ') || auth.slice(7) !== INTERNAL_EMAIL_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const body = await req.json();
    const { to, type, data = {} } = body;

    if (!to || !type) {
      return new Response(JSON.stringify({ error: 'to and type required' }), { status: 400 });
    }

    const rendered = renderTemplate(type, data);
    if (!rendered) {
      return new Response(JSON.stringify({ error: 'unknown template: ' + type }), { status: 400 });
    }

    // Resend API 호출
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [to],
        subject: rendered.subject,
        html: rendered.html
      })
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[send-email] resend error:', err);
      return new Response(JSON.stringify({ error: 'email send failed', detail: err }), { status: 502 });
    }

    const result = await res.json();
    return new Response(JSON.stringify({ ok: true, id: result.id }), { status: 200 });
  } catch (err) {
    console.error('[send-email] error:', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500 });
  }
});

function won(n: number): string {
  return (n ?? 0).toLocaleString('ko-KR') + '원';
}

function baseWrap(innerHtml: string): string {
  return `<!doctype html><html lang="ko"><body style="margin:0;padding:0;background:#F7F7F6;font-family:'Noto Sans KR','Malgun Gothic',sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F7F6;padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.06);">
          <tr><td style="background:#0A0A0A;padding:24px 32px;">
            <div style="font-family:'Bebas Neue',sans-serif;font-size:1.3rem;letter-spacing:5px;color:#fff;">TERRA NOVA</div>
            <div style="font-size:.65rem;letter-spacing:3px;color:#2DD4BF;text-transform:uppercase;margin-top:4px;">English · 수능영어</div>
          </td></tr>
          <tr><td style="padding:32px;color:#111;line-height:1.7;font-size:14px;">
            ${innerHtml}
          </td></tr>
          <tr><td style="background:#F7F7F6;padding:20px 32px;font-size:11px;color:#888;text-align:center;border-top:1px solid #eee;">
            이 이메일은 Terra Nova 구독/결제와 관련된 안내입니다.<br>
            문의: <a href="mailto:support@terra-nova.kr" style="color:#2DD4BF;">support@terra-nova.kr</a>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`;
}

function renderTemplate(type: string, d: Record<string, any>): { subject: string; html: string } | null {
  const planKo: Record<string, string> = { LIGHT: 'LIGHT', STANDARD: 'STANDARD', PREMIUM: 'PREMIUM' };
  const cycleKo: Record<string, string> = { monthly: '월간', annual: '연간' };

  if (type === 'payment_confirm') {
    const { plan, billingCycle, amount, orderNumber, nextBillingDate } = d;
    return {
      subject: `[Terra Nova] ${planKo[plan] || plan} ${cycleKo[billingCycle] || ''} 구독이 시작되었습니다`,
      html: baseWrap(`
        <h2 style="font-size:18px;margin:0 0 16px;color:#0A0A0A;">구독이 시작되었습니다 🎉</h2>
        <p style="margin:0 0 12px;">결제해 주셔서 감사합니다. 이번 주 내로 커리큘럼이 발송됩니다.</p>
        <table role="presentation" width="100%" cellpadding="8" cellspacing="0" style="background:#F7F7F6;border-radius:8px;margin:16px 0;font-size:13px;">
          <tr><td style="color:#888;width:90px;">주문번호</td><td style="font-family:monospace;">${String(orderNumber || '-')}</td></tr>
          <tr><td style="color:#888;">플랜</td><td><strong>${planKo[plan] || plan} ${cycleKo[billingCycle] || ''}</strong></td></tr>
          <tr><td style="color:#888;">결제금액</td><td><strong>${won(amount)}</strong></td></tr>
          ${nextBillingDate ? `<tr><td style="color:#888;">다음 결제</td><td>${nextBillingDate}</td></tr>` : ''}
        </table>
        <p style="margin:16px 0 0;color:#666;font-size:12px;">마이페이지에서 구독을 관리할 수 있습니다. → <a href="https://terra-nova.kr/mypage.html" style="color:#2DD4BF;">mypage</a></p>
      `)
    };
  }

  if (type === 'renewal_success') {
    const { plan, amount, nextBillingDate } = d;
    return {
      subject: `[Terra Nova] ${planKo[plan] || plan} 구독이 자동 갱신되었습니다`,
      html: baseWrap(`
        <h2 style="font-size:18px;margin:0 0 16px;color:#0A0A0A;">구독이 자동 갱신되었습니다</h2>
        <p style="margin:0 0 12px;">등록하신 결제수단으로 이번 달 구독료가 자동 결제되었습니다.</p>
        <table role="presentation" width="100%" cellpadding="8" cellspacing="0" style="background:#F7F7F6;border-radius:8px;margin:16px 0;font-size:13px;">
          <tr><td style="color:#888;width:90px;">플랜</td><td><strong>${planKo[plan] || plan}</strong></td></tr>
          <tr><td style="color:#888;">결제금액</td><td><strong>${won(amount)}</strong></td></tr>
          ${nextBillingDate ? `<tr><td style="color:#888;">다음 결제</td><td>${nextBillingDate}</td></tr>` : ''}
        </table>
        <p style="margin:0;color:#666;font-size:12px;">자동결제를 원치 않으시면 <a href="https://terra-nova.kr/mypage.html" style="color:#2DD4BF;">마이페이지</a>에서 해지할 수 있습니다.</p>
      `)
    };
  }

  if (type === 'renewal_failure') {
    const { plan, reason } = d;
    return {
      subject: `[Terra Nova] ${planKo[plan] || plan} 자동 결제 실패 — 재가입이 필요합니다`,
      html: baseWrap(`
        <h2 style="font-size:18px;margin:0 0 16px;color:#C62828;">자동 결제에 실패했습니다</h2>
        <p style="margin:0 0 12px;">등록하신 결제수단으로 이번 달 구독료 결제가 이루어지지 않았습니다. 카드 한도/유효기간을 확인해주세요.</p>
        ${reason ? `<p style="margin:0 0 12px;color:#888;font-size:12px;">사유: ${String(reason)}</p>` : ''}
        <div style="margin:24px 0;">
          <a href="https://terra-nova.kr/order.html" style="display:inline-block;padding:12px 24px;background:#2DD4BF;color:#0A0A0A;text-decoration:none;font-weight:700;border-radius:6px;">다시 구독하기 →</a>
        </div>
        <p style="margin:0;color:#666;font-size:12px;">현재 구독은 자동 해지 처리되었습니다. 재가입 시 이전 진도가 유지됩니다.</p>
      `)
    };
  }

  if (type === 'custom') {
    const { subject, html } = d;
    if (!subject || !html) return null;
    return { subject, html: baseWrap(html) };
  }

  return null;
}
