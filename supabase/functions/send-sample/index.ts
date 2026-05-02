// Terra Nova · 샘플 PDF 자동 발송 (공개 endpoint)
//
// 배포: supabase functions deploy send-sample --no-verify-jwt
//
// 환경변수 (Supabase Dashboard → Edge Functions → Secrets):
//   SUPABASE_URL                — 프로젝트 URL (https://xxx.supabase.co)
//   SUPABASE_SERVICE_ROLE_KEY   — service_role 키 (RLS 우회 + 서명 URL 발급)
//   INTERNAL_EMAIL_SECRET       — send-email 함수 내부 인증용 (기존 값 재사용)
//
// 호출 (브라우저):
//   POST https://{ref}.supabase.co/functions/v1/send-sample
//   Body: { "email": "user@example.com", "level": "mars" }
//
// 처리 흐름:
//   1) 입력 검증 (이메일 형식 + 허용된 레벨인지)
//   2) Rate limit 체크 (같은 이메일+레벨 30분 내 재발송 차단)
//   3) sample_requests 테이블에 pending row INSERT
//   4) Storage 'sample-pdfs/{level}.pdf' 1시간 signed URL 생성
//   5) send-email 함수 호출하여 sample_request 템플릿 발송
//   6) 결과에 따라 status=sent / failed 갱신
//
// PDF 미존재 시: 503 응답 + status=failed (error=pdf_not_found).

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const INTERNAL_EMAIL_SECRET = Deno.env.get('INTERNAL_EMAIL_SECRET')!;

const VALID_LEVELS = new Set([
  'moon', 'mercury', 'mars', 'venus', 'terra',
  'neptune', 'uranus', 'saturn', 'jupiter', 'sun',
]);
const SIGNED_URL_TTL_SEC = 3600; // 1 hour

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });

async function sbFetch(path: string, init: RequestInit = {}) {
  return fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      'apikey': SERVICE_ROLE,
      'Authorization': `Bearer ${SERVICE_ROLE}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
}

async function updateStatus(id: string, patch: Record<string, unknown>) {
  if (!id) return;
  await sbFetch(`/rest/v1/sample_requests?id=eq.${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  }).catch(() => {});
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: cors });
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: cors });

  let email = '', level = '';
  try {
    const body = await req.json();
    email = String(body.email || '').trim().toLowerCase();
    level = String(body.level || '').trim().toLowerCase();
  } catch {
    return json({ error: '잘못된 요청 본문입니다.' }, 400);
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return json({ error: '올바른 이메일 주소를 입력해 주세요.' }, 400);
  }
  if (!VALID_LEVELS.has(level)) {
    return json({ error: '레벨이 올바르지 않습니다.' }, 400);
  }

  // 1) Rate limit
  try {
    const rateRes = await sbFetch('/rest/v1/rpc/check_sample_rate_limit', {
      method: 'POST',
      body: JSON.stringify({ p_email: email, p_level: level }),
    });
    const allowed = await rateRes.json();
    if (allowed === false) {
      return json({ error: '같은 이메일로 30분 내 동일 레벨을 다시 요청할 수 없습니다.' }, 429);
    }
  } catch (err) {
    console.warn('[send-sample] rate-limit check skipped:', err);
  }

  // 2) Insert pending row
  let requestId = '';
  try {
    const insertRes = await sbFetch('/rest/v1/sample_requests', {
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: JSON.stringify({
        email,
        level,
        status: 'pending',
        user_agent: req.headers.get('user-agent')?.slice(0, 200) || null,
      }),
    });
    if (insertRes.ok) {
      const rows = await insertRes.json();
      requestId = rows?.[0]?.id || '';
    }
  } catch (err) {
    console.warn('[send-sample] insert failed (continuing):', err);
  }

  // 3) Signed URL for sample-pdfs/{level}.pdf
  const objectPath = `${level}.pdf`;
  let downloadUrl = '';
  try {
    const signRes = await sbFetch(`/storage/v1/object/sign/sample-pdfs/${objectPath}`, {
      method: 'POST',
      body: JSON.stringify({ expiresIn: SIGNED_URL_TTL_SEC }),
    });
    if (!signRes.ok) {
      const errText = await signRes.text();
      console.error('[send-sample] sign URL failed:', signRes.status, errText);
      await updateStatus(requestId, { status: 'failed', error: 'pdf_not_found' });
      return json({
        error: '해당 레벨의 샘플 PDF가 아직 준비되지 않았습니다. 다른 레벨을 선택하시거나 잠시 후 다시 시도해 주세요.',
      }, 503);
    }
    const signed = await signRes.json();
    // signed.signedURL = "/object/sign/sample-pdfs/{level}.pdf?token=..."
    downloadUrl = `${SUPABASE_URL}/storage/v1${signed.signedURL || signed.signedUrl}`;
  } catch (err) {
    console.error('[send-sample] sign URL error:', err);
    await updateStatus(requestId, { status: 'failed', error: 'sign_url_error' });
    return json({ error: '다운로드 링크 생성에 실패했습니다.' }, 500);
  }

  // 4) Send email via send-email function
  try {
    const emailRes = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${INTERNAL_EMAIL_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        type: 'sample_request',
        data: {
          level,
          levelDisplay: level.toUpperCase(),
          downloadUrl,
        },
      }),
    });
    if (!emailRes.ok) {
      const errText = await emailRes.text();
      console.error('[send-sample] email send failed:', emailRes.status, errText);
      await updateStatus(requestId, { status: 'failed', error: 'email_send_failed' });
      return json({ error: '메일 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.' }, 502);
    }
  } catch (err) {
    console.error('[send-sample] email fetch error:', err);
    await updateStatus(requestId, { status: 'failed', error: 'email_network_error' });
    return json({ error: '메일 발송 중 네트워크 오류가 발생했습니다.' }, 502);
  }

  // 5) Mark sent
  await updateStatus(requestId, {
    status: 'sent',
    sent_at: new Date().toISOString(),
  });

  return json({ ok: true, level, levelDisplay: level.toUpperCase() });
});
