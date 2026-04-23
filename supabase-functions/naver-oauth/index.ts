// Terra Nova · 네이버 OAuth Edge Function
// 배포: supabase functions deploy naver-oauth --no-verify-jwt
// 환경변수: NAVER_CLIENT_ID, NAVER_CLIENT_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
// 흐름:
//   1. 클라이언트(naver-callback.html)가 Naver 인증 코드를 POST /functions/v1/naver-oauth
//   2. Edge Function이:
//      a. 코드를 Naver access_token으로 교환
//      b. Naver 프로필 API 호출 (이메일, 이름, 프로필 이미지)
//      c. Supabase auth.users에 사용자 생성 또는 조회 (이메일 기반)
//      d. Magic link 생성 → 반환
//   3. 클라이언트가 magic link로 리다이렉트 → Supabase가 세션 발급 → 로그인 완료

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const NAVER_CLIENT_ID = Deno.env.get('NAVER_CLIENT_ID')!;
const NAVER_CLIENT_SECRET = Deno.env.get('NAVER_CLIENT_SECRET')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

Deno.serve(async (req) => {
  // CORS 프리플라이트
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders()
    });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const { code, state, redirect_uri } = await req.json();
    if (!code || !redirect_uri) {
      return json({ error: 'code and redirect_uri required' }, 400);
    }

    // 1. Naver access_token 교환
    const tokenUrl = 'https://nid.naver.com/oauth2.0/token'
      + '?grant_type=authorization_code'
      + `&client_id=${encodeURIComponent(NAVER_CLIENT_ID)}`
      + `&client_secret=${encodeURIComponent(NAVER_CLIENT_SECRET)}`
      + `&code=${encodeURIComponent(code)}`
      + (state ? `&state=${encodeURIComponent(state)}` : '');

    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error('[naver] token exchange failed:', tokenData);
      return json({ error: 'token exchange failed', detail: tokenData }, 400);
    }

    // 2. Naver 프로필 조회
    const profileRes = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const profileData = await profileRes.json();
    if (profileData.resultcode !== '00' || !profileData.response?.email) {
      console.error('[naver] profile fetch failed:', profileData);
      return json({ error: 'profile fetch failed (email required scope)' }, 400);
    }

    const { email, name, profile_image, mobile } = profileData.response;

    // 3. Supabase auth.users에 사용자 조회 / 생성
    // auth.admin.listUsers는 email 필터를 지원하지 않으므로 getUserByEmail 대안 사용
    let userId: string | null = null;
    const { data: existingList } = await supabase.auth.admin.listUsers();
    const existing = existingList?.users?.find(u => u.email === email);
    if (existing) {
      userId = existing.id;
      // 메타데이터 업데이트 (네이버 정보 최신화)
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...(existing.user_metadata || {}),
          provider_naver: { sub: tokenData.access_token?.slice(0, 8), at: Date.now() },
          display_name: (existing.user_metadata as any)?.display_name || name,
          phone: (existing.user_metadata as any)?.phone || mobile || null,
          avatar_url: profile_image || (existing.user_metadata as any)?.avatar_url
        }
      });
    } else {
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true, // Naver가 이미 이메일 검증함
        user_metadata: {
          display_name: name,
          phone: mobile || null,
          avatar_url: profile_image || null,
          provider: 'naver'
        }
      });
      if (createErr) {
        console.error('[naver] user create failed:', createErr);
        return json({ error: 'user create failed', detail: createErr.message }, 500);
      }
      userId = created.user!.id;
    }

    // 4. Magic link 생성 (Naver 인증 통과했으므로 즉시 세션 발급용)
    const redirectOrigin = new URL(redirect_uri).origin;
    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: redirectOrigin + '/mypage.html'
      }
    });
    if (linkErr || !linkData?.properties?.action_link) {
      console.error('[naver] magiclink failed:', linkErr);
      return json({ error: 'magiclink failed', detail: linkErr?.message }, 500);
    }

    return json({
      ok: true,
      action_link: linkData.properties.action_link,
      is_new_user: !existing
    });
  } catch (err) {
    console.error('[naver] fatal:', err);
    return json({ error: (err as Error).message }, 500);
  }
});

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
  });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
  };
}
