// Terra Nova English · Supabase Client
// 사용법: HTML에서 <script type="module"> import { supabase } from './supabase-client.js' </script>

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.0/+esm';

const SUPABASE_URL = 'https://betkydmxrnlhgmnprbca.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJldGt5ZG14cm5saGdtbnByYmNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MTczOTMsImV4cCI6MjA5MjE5MzM5M30.XvR78ZJVF7KIq_h_mLY3dSzMi5Qb3SkGPlTGlA-TQWY';

// storageKey 는 기본값 사용 — 모든 페이지가 같은 supabase 인스턴스/같은 key 를 쓰도록.
// 변경 시 기존 로그인 세션이 모두 invalidate 되니 주의.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/* ── 단일 진실 출처: getSession() 만 사용 ─────────────────────
   getSession() 은 localStorage 의 토큰을 반환 (네트워크 호출 없음 → hang 가능성 없음).
   getUser() 는 매번 /auth/v1/user 네트워크 호출 → 불안정. signOut 직후에도 캐시 race.
   페이지 단에서는 getSession() 하나만 보고 결정하면 모순이 사라짐. */
export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('[auth] getSession error:', error.message);
      return null;
    }
    return data?.session || null;
  } catch (e) {
    console.warn('[auth] getSession threw', e);
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user || null;
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

/* ── 결정적 로그아웃: supabase signOut + localStorage 강제 정리 + 무조건 redirect ─ */
export async function signOut() {
  // 1. supabase 의 신호 보냄 (서버 세션 무효화) — 실패해도 무시
  try { await supabase.auth.signOut({ scope: 'global' }); } catch (e) { console.warn('[auth] global signOut err', e); }
  try { await supabase.auth.signOut({ scope: 'local'  }); } catch (e) { console.warn('[auth] local signOut err', e); }

  // 2. localStorage 의 모든 supabase 키 강제 제거 (race condition 방지)
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('sb-') || k.includes('supabase'))) keys.push(k);
    }
    keys.forEach(k => localStorage.removeItem(k));
  } catch (e) { console.warn('[auth] localStorage clear failed', e); }

  // 3. sessionStorage 도 같이 정리
  try {
    const skeys = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && (k.startsWith('sb-') || k.includes('supabase'))) skeys.push(k);
    }
    skeys.forEach(k => sessionStorage.removeItem(k));
  } catch {}

  // 4. 무조건 홈으로 이동 (replace 로 history 도 정리)
  location.replace('index.html');
  return true;
}

/* ── profile row 자동 보장 + maybeSingle ──────────────────── */
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
  if (!data) {
    try {
      const { data: u } = await supabase.auth.getUser();
      const meta = u?.user?.user_metadata || {};
      const { data: created, error: insErr } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          display_name: meta.display_name || meta.name || null,
          phone: meta.phone || null,
        })
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

/* ── 익명 레벨 테스트 결과 → 가입 유저 linkup ────────────── */
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
  localStorage.removeItem('tn_anon_token');
  console.info('[linkAnonLevelTest] linked', data?.length || 0, 'result(s) to user', user.id);
  return { linked: data?.length || 0 };
}

/* ── 자동 linkup: SIGNED_IN 이벤트 감지 시 1회 실행 ──────── */
supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_IN' && localStorage.getItem('tn_anon_token')) {
    linkAnonLevelTest().catch(err => console.warn('[auto-linkup]', err?.message));
  }
});
