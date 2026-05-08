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

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.warn('[auth] getUser error:', error.message);
    return null;
  }
  return user;
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
  const { error } = await supabase.auth.signOut();
  if (error) {
    alert('로그아웃 실패: ' + error.message);
    return false;
  }
  location.href = 'index.html';
  return true;
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) {
    console.warn('[profile] fetch error:', error.message);
    return null;
  }
  return data;
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
