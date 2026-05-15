// Terra Nova · 공용 네비게이션 로그인 상태 반영
// 사용법: 각 HTML 끝에 <script type="module" src="./nav-auth.js"></script> 추가
// 네비에 [data-auth="guest"] / [data-auth="user"] / [data-auth="admin"] 속성을 두면 자동 토글됨

import { supabase, signOut, isAdmin, getSession } from './supabase-client.js';

// 요소가 보여질 때 어떤 display 값을 쓸지 — data-show-as 속성 우선, 없으면 빈 문자열(=원래 CSS 값)
function showVal(el) { return el.dataset.showAs || ''; }

async function applyAuthState(session) {
  const loggedIn = !!session?.user;
  document.querySelectorAll('[data-auth="guest"]').forEach(el => {
    el.style.display = loggedIn ? 'none' : showVal(el);
  });
  document.querySelectorAll('[data-auth="user"]').forEach(el => {
    el.style.display = loggedIn ? showVal(el) : 'none';
  });

  if (loggedIn) {
    const meta = session.user.user_metadata || {};
    const name = meta.display_name || (session.user.email || '').split('@')[0] || '회원';
    document.querySelectorAll('[data-user-name]').forEach(el => { el.textContent = name; });

    let admin = false;
    try { admin = await isAdmin(session.user.id); } catch {}
    document.querySelectorAll('[data-auth="admin"]').forEach(el => {
      el.style.display = admin ? showVal(el) : 'none';
    });
  } else {
    document.querySelectorAll('[data-auth="admin"]').forEach(el => {
      el.style.display = 'none';
    });
  }
}

// 초기 세션 체크 — getSession() 만 사용 (localStorage 토큰 직접 조회, hang 없음)
(async () => {
  const session = await getSession();
  applyAuthState(session);
})();

// 로그인/로그아웃 이벤트 즉시 반영 — SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED 모두 처리
supabase.auth.onAuthStateChange((event, session) => {
  console.log('[nav-auth] event:', event);
  applyAuthState(session);
});

// 로그아웃 버튼 ([data-action="logout"] / #btn-logout) — capture phase 로 등록
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-action="logout"], #btn-logout');
  if (!btn) return;
  e.preventDefault();
  e.stopPropagation();
  if (!confirm('로그아웃 하시겠습니까?')) return;
  await signOut();
}, true);
