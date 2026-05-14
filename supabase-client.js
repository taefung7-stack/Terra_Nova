// Terra Nova English · Supabase Client
// 사용법: HTML에서 <script type="module"> import { supabase } from './supabase-client.js' </script>

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.0/+esm';

const SUPABASE_URL = 'https://betkydmxrnlhgmnprbca.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJldGt5ZG14cm5saGdtbnByYmNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MTczOTMsImV4cCI6MjA5MjE5MzM5M30.XvR78ZJVF7KIq_h_mLY3dSzMi5Qb3SkGPlTGlA-TQWY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/* ── 공용 헬퍼 ───────────────────────────────────────── */

// getUser() 가 종종 hang/느린 케이스 대비 — getSession() 캐시를 먼저 시도하고,
// 둘 다 race 해서 빠른 쪽 결과를 사용. timeout 7초.
export async function getCurrentUser() {
  const sessP = supabase.auth.getSession()
    .then(r => r.data?.session?.user || null)
    .catch(err => { console.warn('[auth] getSession err', err); return null; });
  const userP = supabase.auth.getUser()
    .then(r => r.data?.user || null)
    .catch(err => { console.warn('[auth] getUser err', err); return null; });
  const timeoutP = new Promise(res => setTimeout(() => res('__TIMEOUT__'), 7000));
  const first = await Promise.race([sessP, userP, timeoutP]);
  if (first === '__TIMEOUT__') {
    console.error('[auth] resolveUser timeout');
    return null;
  }
  if (first) return first;
  const [s, u] = await Promise.all([sessP, userP]);
  return s || u;
}

export async function requireAuth(redirectTo = 'login.html') {
  const user = await getCurrentUser();
  if (!user) {
    const back = encodeURIComponent(location.pathname + location.search);
    location.href = `${redirectTo}?redirect=${back}`;
    return null;
  }
  return user;
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) console.warn('[auth] signOut err', error);
  } catch (e) {
    console.warn('[auth] signOut threw', e);
  }
  // scope=local 추가로 client-side 토큰 강제 제거
  try { await supabase.auth.signOut({ scope: 'local' }); } catch {}
  // 어떤 경우든 홈으로 이동
  location.href = 'index.html';
  return true;
}

// profile row 가 없는 신규 가입자도 정상 동작하도록 .maybeSingle() 사용 + 자동 생성.
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) {
    console.warn('[profile] fetch error:', error.message);
    return null;
  }
  // row 없으면 빈 row 자동 생성 시도 (RLS 가 본인 INSERT 허용한다는 전제)
  if (!data) {
    try {
      const { data: user } = await supabase.auth.getUser();
      const meta = user?.user?.user_metadata || {};
      const insertPayload = {
        id: userId,
        display_name: meta.display_name || meta.name || null,
        phone: meta.phone || null,
      };
      const { data: created, error: insErr } = await supabase
        .from('profiles')
        .insert(insertPayload)
        .select('*')
        .maybeSingle();
      if (insErr) {
        console.warn('[profile] auto-create failed:', insErr.message);
        return null;
      }
      return created;
    } catch (e) {
      console.warn('[profile] auto-create threw', e);
      return null;
    }
  }
  return data;
}

// 사용자가 관리자인지 확인 (mypage / nav 양쪽에서 사용)
export async function isAdmin(userId) {
  if (!userId) return false;
  try {
    const { data } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .maybeSingle();
    return data?.is_admin === true;
  } catch (e) {
    console.warn('[isAdmin] err', e);
    return false;
  }
}

export async function getActiveSubscription(userId) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .gte('expires_at', new Date().toISOString())
    .order('expires_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.warn('[subscription] fetch error:', error.message);
    return null;
  }
  return data;
}

/* ── 네비게이션 UI 자동 업데이트 (선택) ─────────────── */
export function renderAuthNav(loginEl, logoutEl, mypageEl) {
  supabase.auth.onAuthStateChange((_event, session) => {
    const loggedIn = !!session?.user;
    if (loginEl) loginEl.style.display = loggedIn ? 'none' : '';
    if (logoutEl) logoutEl.style.display = loggedIn ? '' : 'none';
    if (mypageEl) mypageEl.style.display = loggedIn ? '' : 'none';
  });
}

/* ── 익명 레벨 테스트 결과 → 가입 유저 linkup ──────────
   비로그인 시 level_test.html이 localStorage('tn_anon_token') 에 UUID를 저장하고
   level_test_results 테이블에 user_id=NULL + anon_token 으로 INSERT 함.
   사용자가 가입/로그인하면 이 함수를 호출해 그 row의 user_id를 본인으로 채움.

   호출 시점:
   - 회원가입 직후 (signup.html 인증 콜백)
   - 로그인 직후 (login.html, naver-callback.html)
   - 또는 onAuthStateChange('SIGNED_IN') 시 자동 1회
*/
export async function linkAnonLevelTest() {
  const anonToken = localStorage.getItem('tn_anon_token');
  if (!anonToken) return { linked: 0 };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { linked: 0 };
  const { data, error } = await supabase
    .from('level_test_results')
    .update({ user_id: user.id, anon_token: null })
    .eq('anon_token', anonToken)
    .is('user_id', null)
    .select('id');
  if (error) {
    console.warn('[linkAnonLevelTest] error:', error.message);
    return { linked: 0, error };
  }
  // 성공 시 토큰 제거 (재실행 방지)
  localStorage.removeItem('tn_anon_token');
  console.info('[linkAnonLevelTest] linked', data?.length || 0, 'result(s) to user', user.id);
  return { linked: data?.length || 0 };
}

/* ── 자동 linkup: 모든 페이지에서 SIGNED_IN 이벤트 감지 시 1회 실행 ──
   side-effect 없는 idempotent 호출이므로 페이지 전체에 안전하게 묶어둠. */
supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_IN' && localStorage.getItem('tn_anon_token')) {
    linkAnonLevelTest().catch(err => console.warn('[auto-linkup]', err?.message));
  }
});
