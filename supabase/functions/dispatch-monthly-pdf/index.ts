// Terra Nova · 월간 PDF 발송 Edge Function
// 배포: supabase functions deploy dispatch-monthly-pdf --no-verify-jwt
//
// 운영 정책 (2026-05-24 정정):
//   ❌ 이전: 매월 1일 09:00 cron 이 모든 활성 구독자에게 일괄 발송
//   ✅ 현재: 결제일 기준 즉시 발송
//          - 신규 결제 시 → portone-webhook 이 호출 (해당 user 만)
//          - 자동 갱신 시 → renew-subscriptions 가 호출 (해당 user 만)
//          - 안전망 cron → 매일 09:00, 같은 month 미발송 사용자만 retry
//
// 환경변수:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  — 자동 주입
//   INTERNAL_EMAIL_SECRET                    — send-email 호출용 + cron 인증용
//   SIGNED_URL_TTL_DAYS                      — 다운로드 링크 유효 기간 (default 30)
//
// 입력 (body):
//   { userId?: 'uuid' }          — 특정 사용자만 발송 (webhook 트리거)
//   { month?: 'YYYY-MM' }        — 발송할 월 (기본: 현재 월)
//   { force?: boolean }          — 이미 발송된 사용자도 재발송 (admin 수동 트리거)
//
// 처리:
//   1. userId 지정 시 → 그 사용자만, 미지정 시 → 활성 구독자 전체
//   2. month-{level}.pdf 가 textbook-pdfs 버킷에 있는지 확인
//   3. 같은 month 로 이미 발송 완료(sent)된 사용자는 skip (멱등성, force=true 시 우회)
//   4. 각 사용자에게 30일 signed URL 생성 → send-email 호출
//   5. monthly_pdf_dispatches 로그 기록
//
// 응답: { processed, sent, skipped, failed, errors[] }

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const INTERNAL_EMAIL_SECRET = Deno.env.get('INTERNAL_EMAIL_SECRET')!;
const SIGNED_URL_TTL_DAYS = parseInt(Deno.env.get('SIGNED_URL_TTL_DAYS') || '30', 10);

const VALID_LEVELS = ['MARS', 'VENUS', 'TERRA', 'NEPTUNE', 'URANUS', 'SATURN', 'JUPITER', 'SUN'];
// 2026-07 오픈 기준: Storage에 올라간 판매 가능 월간 교재만 발송.
// 2026-07-17 NEPTUNE(중2)·URANUS(중3) 완성본·샘플 Storage 업로드 → 전 학년 판매 개통.
const ACTIVE_LEVELS = new Set(['MARS', 'VENUS', 'TERRA', 'NEPTUNE', 'URANUS', 'SATURN', 'JUPITER', 'SUN']);
const BUCKET = 'textbook-pdfs';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// 월 경계는 한국 시간(KST, UTC+9) 기준.
// "7월 1일 00:00(KST)부터 7월호 발송, 8월 1일 00:00(KST)부터 7월호 중단" 정책.
// UTC 그대로 쓰면 KST 자정~오전 9시 사이에 직전 달 교재가 발송되는 오류가 난다.
function nowMonthKey(): string {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return `${kst.getUTCFullYear()}-${String(kst.getUTCMonth() + 1).padStart(2, '0')}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return jsonResp({ error: 'Method not allowed' }, 405);
  }

  // ── 1. 인증 — INTERNAL_EMAIL_SECRET (cron) OR admin JWT ──
  const auth = req.headers.get('Authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  if (!token) return jsonResp({ error: 'Missing Authorization' }, 401);

  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  let isInternal = (token === INTERNAL_EMAIL_SECRET);
  let isAdmin = false;

  if (!isInternal) {
    // JWT로 시도
    const { data: { user } } = await sb.auth.getUser(token);
    if (user) {
      const { data: profile } = await sb.from('profiles').select('is_admin').eq('id', user.id).single();
      isAdmin = !!profile?.is_admin;
    }
    if (!isAdmin) return jsonResp({ error: 'Unauthorized — internal secret or admin required' }, 401);
  }

  // ── 2. 입력 파싱 ──
  let body: any = {};
  try { body = await req.json(); } catch { /* 빈 body 허용 */ }
  const month: string = (body.month || nowMonthKey()).match(/^\d{4}-\d{2}$/) ? body.month || nowMonthKey() : nowMonthKey();
  const targetUserId: string | null = body.userId || null;
  const force: boolean = body.force === true;

  // ── 3. 활성 구독자 조회 (전체 또는 특정 user) ──
  let subsQuery = sb
    .from('subscriptions')
    .select('user_id, level, expires_at, plan_code')
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .not('level', 'is', null);

  if (targetUserId) {
    subsQuery = subsQuery.eq('user_id', targetUserId);
  }

  const { data: subs, error: subsErr } = await subsQuery;

  if (subsErr) return jsonResp({ error: 'Subscription query failed: ' + subsErr.message }, 500);
  if (!subs || subs.length === 0) {
    return jsonResp({
      ok: true, month, processed: 0, sent: 0, skipped: 0, failed: 0,
      message: targetUserId ? `No active subscription for user ${targetUserId}` : 'No active subscribers',
    }, 200);
  }

  // 이미 이번 month로 발송된 user 조회 (idempotency, force=true 시 무시)
  const userIds = subs.map(s => s.user_id);
  let sentSet = new Set<string>();
  if (!force) {
    const { data: alreadySent } = await sb
      .from('monthly_pdf_dispatches')
      .select('user_id')
      .eq('month', month)
      .eq('email_status', 'sent')
      .in('user_id', userIds);
    sentSet = new Set((alreadySent || []).map(r => r.user_id));
  }

  // ── 4. user별 처리 ──
  const errors: any[] = [];
  let sent = 0, skipped = 0, failed = 0;
  for (const sub of subs) {
    if (sentSet.has(sub.user_id)) { skipped++; continue; }
    if (!VALID_LEVELS.includes(sub.level) || !ACTIVE_LEVELS.has(sub.level)) { skipped++; continue; }

    // 사용자 이메일 (auth.users)
    const { data: { user: authUser } } = await sb.auth.admin.getUserById(sub.user_id);
    const email = authUser?.email;
    if (!email) {
      errors.push({ user_id: sub.user_id, error: 'No email' });
      failed++;
      continue;
    }

    // 4-1. PDF 경로
    const objectPath = `${month}/${month}-${sub.level}.pdf`;

    // 4-2. signed URL 생성 (30일)
    const { data: signed, error: signedErr } = await sb.storage
      .from(BUCKET)
      .createSignedUrl(objectPath, SIGNED_URL_TTL_DAYS * 24 * 60 * 60);
    if (signedErr || !signed?.signedUrl) {
      errors.push({ user_id: sub.user_id, error: `Signed URL failed: ${signedErr?.message || 'PDF not found'}` });
      failed++;
      // dispatch 로그 (failed)
      await sb.from('monthly_pdf_dispatches').upsert({
        user_id: sub.user_id, month, level: sub.level, email,
        email_status: 'failed', error_message: signedErr?.message || 'PDF missing',
      }, { onConflict: 'user_id,month' });
      continue;
    }

    // 4-3. send-email 호출
    const emailRes = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${INTERNAL_EMAIL_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        type: 'monthly_pdf',
        data: {
          month, level: sub.level, signedUrl: signed.signedUrl,
          ttlDays: SIGNED_URL_TTL_DAYS, planCode: sub.plan_code,
        },
      }),
    });

    const emailOk = emailRes.ok;
    const emailErrText = emailOk ? null : await emailRes.text().catch(() => 'unknown');

    // 4-4. 로그 기록 (UPSERT — unique(user_id, month) 제약)
    await sb.from('monthly_pdf_dispatches').upsert({
      user_id: sub.user_id, month, level: sub.level, email,
      signed_url: signed.signedUrl,
      email_status: emailOk ? 'sent' : 'failed',
      error_message: emailErrText,
      sent_at: emailOk ? new Date().toISOString() : null,
    }, { onConflict: 'user_id,month' });

    if (emailOk) { sent++; }
    else { failed++; errors.push({ user_id: sub.user_id, error: emailErrText }); }
  }

  return jsonResp({
    ok: true, month,
    processed: subs.length, sent, skipped, failed,
    errors: errors.slice(0, 20),
  }, 200);
});

function jsonResp(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
