// Terra Nova · 공용 네비게이션 로그인 상태 반영
// 사용법: 각 HTML 끝에 <script type="module" src="./nav-auth.js"></script> 추가
// 네비에 [data-auth="guest"] 또는 [data-auth="user"] 속성을 두면 자동 토글됨

import { supabase, signOut } from './supabase-client.js';

function applyAuthState(session) {
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
    const name = meta.display_name || session.user.email.split('@')[0];
    document.querySelectorAll('[data-user-name]').forEach(el => { el.textContent = name; });
  }
}

// 초기 세션 체크
(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  applyAuthState(session);
})();

// 로그인/로그아웃 이벤트 반영
supabase.auth.onAuthStateChange((_e, session) => applyAuthState(session));

// 로그아웃 버튼 ([data-action="logout"])
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-action="logout"]');
  if (!btn) return;
  e.preventDefault();
  if (!confirm('로그아웃 하시겠습니까?')) return;
  await signOut();
});
