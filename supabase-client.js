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
