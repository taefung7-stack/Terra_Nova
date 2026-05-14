// Terra Nova · 공용 네비게이션 로그인 상태 반영
// 사용법: 각 HTML 끝에 <script type="module" src="./nav-auth.js"></script> 추가
// 네비에 [data-auth="guest"] / [data-auth="user"] / [data-auth="admin"] 속성을 두면 자동 토글됨

import { supabase, signOut, isAdmin } from './supabase-client.js';

async function applyAuthState(session) {
  const loggedIn = !!session?.user;
  document.querySelectorAll('[data-auth="guest"]').forEach(el => {
    el.style.display = loggedIn ? 'none' : '';
  });
  document.querySelectorAll('[data-auth="user"]').forEach(el => {
    el.style.display = loggedIn ? '' : 'none';
  });
  // 사용자 이름 치환 (data-user-name 속성)
  if (loggedIn) {
    const meta = session.user.user_metadata || {};
    const name = meta.display_name || (session.user.email || '').split('@')[0] || '회원';
    document.querySelectorAll('[data-user-name]').forEach(el => { el.textContent = name; });

    // 관리자는 [data-auth="admin"] 요소 노출 — supabase-client 의 헬퍼 재사용
    try {
      const admin = await isAdmin(session.user.id);
      document.querySelectorAll('[data-auth="admin"]').forEach(el => {
        el.style.display = admin ? '' : 'none';
      });
    } catch { /* no-op */ }
  } else {
    document.querySelectorAll('[data-auth="admin"]').forEach(el => {
      el.style.display = 'none';
    });
  }
}

// 초기 세션 체크 — getSession() 우선, hang 시 5s 후 게스트로 그리기
(async () => {
  const sessP = supabase.auth.getSession()
    .then(r => r.data?.session || null)
    .catch(() => null);
  const timeoutP = new Promise(res => setTimeout(() => res(null), 5000));
  const session = await Promise.race([sessP, timeoutP]);
  applyAuthState(session);
})();

// 로그인/로그아웃 이벤트 반영
supabase.auth.onAuthStateChange((_e, session) => applyAuthState(session));

// 로그아웃 버튼 ([data-action="logout"] / #btn-logout) — capture phase 로 등록해 다른 핸들러보다 먼저
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-action="logout"], #btn-logout');
  if (!btn) return;
  e.preventDefault();
  e.stopPropagation();
  if (!confirm('로그아웃 하시겠습니까?')) return;
  await signOut();
}, true);
