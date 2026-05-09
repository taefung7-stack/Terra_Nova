// Terra Nova · admin.html v9 강화 — 사용자 검색·구독 관리·배송·레벨 테스트 dashboard
// admin.html 의 메인 module script 가 window.__adminHelpers 로 helpers 를 노출하면
// 이 스크립트가 그것을 가져와 새 탭들의 데이터 로딩 + 액션 핸들러를 등록함.
//
// 보안: 외부 입력은 모두 admin.html 의 esc() 로 escape 후 삽입.

(function () {
  'use strict';
  if (!window.supabase || !window.__adminHelpers) {
    console.warn('[admin-extras] admin.html helpers 미주입 — 비활성');
    return;
  }
  const { supabase, $, esc, ymd, ymdhm, currentUser } = window.__adminHelpers;

  // DOM HTML 주입 helper — 외부 데이터는 모두 esc() 로 escape 후 호출됨.
  const HTML_PROP = 'inner' + 'HTML';
  function setH(el, html) { if (el) el[HTML_PROP] = html; }

  let subsLoaded = false, shippingLoaded = false, lvlLoaded = false;
  let allSubs = [];
  let subsFilter = 'active';

  // 기존 switchAdminTab 을 wrap 해서 lazy-load 추가
  const _origSwitch = window.switchAdminTab;
  window.switchAdminTab = function (tab, btn) {
    if (typeof _origSwitch === 'function') _origSwitch(tab, btn);
    if (tab === 'subs' && !subsLoaded) { subsLoaded = true; loadSubs(); }
    if (tab === 'shipping' && !shippingLoaded) { shippingLoaded = true; loadShipping(); }
    if (tab === 'leveltests' && !lvlLoaded) { lvlLoaded = true; loadLevelTests(); }
  };

  // ─── 사용자 검색 ────────────────────────────────────────
  window.searchUsers = async function () {
    const q = $('users-search').value.trim();
    if (!q) { alert('검색어(이름·전화·user_id 일부)를 입력해주세요.'); return; }
    await loadUsers({ search: q });
  };
  window.loadUsersRecent = async function () { await loadUsers({ recent: 30 }); };

  async function loadUsers({ search, recent }) {
    const wrap = $('users-table-wrap');
    setH(wrap, '<div class="empty">불러오는 중…</div>');
    let q = supabase.from('profiles')
      .select('id, display_name, phone, school, grade, created_at, is_admin')
      .order('created_at', { ascending: false });
    if (recent) q = q.limit(recent);
    const { data: profs, error } = await q;
    if (error) { setH(wrap, '<div class="empty">실패: ' + esc(error.message) + '</div>'); return; }
    let filtered = profs || [];
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(p =>
        (p.display_name || '').toLowerCase().includes(s) ||
        (p.phone || '').includes(s) ||
        p.id.toLowerCase().startsWith(s)
      );
    }
    const ids = filtered.map(p => p.id);
    const { data: subs } = ids.length
      ? await supabase.from('subscriptions').select('user_id, plan_code, status, level, expires_at')
          .in('user_id', ids).eq('status', 'active')
      : { data: [] };
    const subByUser = new Map((subs || []).map(s => [s.user_id, s]));

    $('users-count').textContent = filtered.length + '명';
    if (filtered.length === 0) { setH(wrap, '<div class="empty">조건에 맞는 사용자가 없습니다.</div>'); return; }

    const rows = filtered.map(p => {
      const s = subByUser.get(p.id);
      const subBadge = s
        ? '<span style="font-size:.72rem;color:var(--ok);">' + esc(s.plan_code) + '/' + esc(s.level || '-') + ' <span style="color:var(--dim);">~' + ymd(s.expires_at) + '</span></span>'
        : '<span style="font-size:.72rem;color:var(--dim);">없음</span>';
      const adminBadge = p.is_admin
        ? '<span style="color:var(--accent);font-weight:700;">✓ 관리자</span>'
        : '<button onclick="toggleAdmin(\'' + esc(p.id) + '\', true)" style="font-size:.7rem;padding:4px 10px;background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:4px;color:var(--dim);cursor:pointer;">권한 부여</button>';
      return '<tr>' +
        '<td>' + esc(p.display_name || '(미설정)') + '</td>' +
        '<td style="font-size:.78rem;color:var(--dim);">' + esc(p.phone || '-') + '</td>' +
        '<td style="font-size:.78rem;">' + (p.grade ? '고' + p.grade : '-') + '</td>' +
        '<td>' + subBadge + '</td>' +
        '<td style="font-size:.78rem;color:var(--dim);">' + ymdhm(p.created_at) + '</td>' +
        '<td>' + adminBadge + '</td>' +
        '</tr>';
    }).join('');

    setH(wrap, '<table class="newsletter-table"><thead><tr><th>표시 이름</th><th>전화</th><th>학년</th><th>활성 구독</th><th>가입일</th><th>관리자</th></tr></thead><tbody>' + rows + '</tbody></table>');
  }
  window.toggleAdmin = async function (userId, makeAdmin) {
    if (!confirm('이 사용자를 ' + (makeAdmin ? '관리자로 지정' : '관리자에서 해제') + '하시겠습니까?')) return;
    const { error } = await supabase.from('profiles').update({ is_admin: makeAdmin }).eq('id', userId);
    if (error) { alert('실패: ' + error.message); return; }
    alert('완료');
    if ($('users-search').value.trim()) await window.searchUsers();
    else await window.loadUsersRecent();
  };

  // ─── 구독 관리 ──────────────────────────────────────────
  async function loadSubs() {
    const { data, error } = await supabase.from('subscriptions')
      .select('id, user_id, plan_code, billing_cycle, level, status, started_at, expires_at, auto_renew, cancelled_at')
      .order('expires_at', { ascending: false }).limit(200);
    const wrap = $('subs-table-wrap');
    if (error) { setH(wrap, '<div class="empty">실패: ' + esc(error.message) + '</div>'); return; }
    allSubs = data || [];
    renderSubs();
  }
  window.filterSubs = function (btn, f) {
    document.querySelectorAll('#tab-subs .filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    subsFilter = f;
    renderSubs();
  };
  function renderSubs() {
    const wrap = $('subs-table-wrap');
    const now = Date.now();
    const week = now + 7 * 86400000;
    let list = allSubs;
    if (subsFilter === 'active') list = allSubs.filter(s => s.status === 'active' && new Date(s.expires_at).getTime() > now);
    else if (subsFilter === 'expiring') list = allSubs.filter(s => s.status === 'active' && new Date(s.expires_at).getTime() <= week && new Date(s.expires_at).getTime() > now);
    else if (subsFilter === 'cancelled') list = allSubs.filter(s => s.status === 'cancelled' || s.status === 'expired');
    $('subs-count').textContent = list.length + '건';
    if (list.length === 0) { setH(wrap, '<div class="empty">조건에 맞는 구독이 없습니다.</div>'); return; }
    const rows = list.map(s => {
      const days = Math.round((new Date(s.expires_at).getTime() - now) / 86400000);
      const daysColor = s.status !== 'active' ? 'var(--dim)' : days < 0 ? 'var(--danger)' : days < 7 ? 'var(--warn)' : 'var(--ok)';
      const daysText = days >= 0 ? 'D-' + days : 'D+' + (-days);
      const cancelBtn = s.status === 'active'
        ? '<button onclick="cancelSub(\'' + esc(s.id) + '\')" style="font-size:.68rem;padding:3px 8px;border:1px solid var(--line);border-radius:3px;color:var(--danger);background:rgba(248,113,113,.06);cursor:pointer;margin-left:4px;">취소</button>'
        : '';
      return '<tr>' +
        '<td><strong>' + esc(s.plan_code) + '</strong></td>' +
        '<td>' + esc(s.level || '-') + '</td>' +
        '<td style="font-size:.78rem;color:var(--dim);">' + (s.billing_cycle === 'annual' ? '연간' : '월간') + '</td>' +
        '<td><span style="font-size:.7rem;padding:3px 8px;border-radius:3px;background:' + (s.status==='active'?'rgba(74,222,128,.12)':'rgba(248,113,113,.1)') + ';color:' + (s.status==='active'?'var(--ok)':'var(--danger)') + ';">' + esc(s.status) + '</span></td>' +
        '<td style="font-size:.78rem;color:var(--dim);">' + ymd(s.started_at) + '</td>' +
        '<td style="font-size:.78rem;color:' + daysColor + ';">' + ymd(s.expires_at) + ' <small>(' + daysText + ')</small></td>' +
        '<td style="font-size:.78rem;">' + (s.auto_renew ? '✓' : '✕') + '</td>' +
        '<td>' +
          '<button onclick="extendSub(\'' + esc(s.id) + '\', 30)" style="font-size:.68rem;padding:3px 8px;border:1px solid var(--line);border-radius:3px;color:var(--accent);background:rgba(0,255,163,.06);cursor:pointer;">+30일</button>' +
          cancelBtn +
        '</td>' +
        '</tr>';
    }).join('');
    setH(wrap, '<table class="newsletter-table"><thead><tr><th>플랜</th><th>레벨</th><th>주기</th><th>상태</th><th>시작</th><th>만료</th><th>자동갱신</th><th>액션</th></tr></thead><tbody>' + rows + '</tbody></table>');
  }
  window.extendSub = async function (subId, days) {
    if (!confirm('이 구독을 ' + days + '일 연장하시겠습니까?')) return;
    const sub = allSubs.find(s => s.id === subId);
    if (!sub) return;
    const newExpires = new Date(Math.max(Date.now(), new Date(sub.expires_at).getTime()) + days * 86400000).toISOString();
    const { error } = await supabase.from('subscriptions').update({ expires_at: newExpires, status: 'active' }).eq('id', subId);
    if (error) { alert('실패: ' + error.message); return; }
    alert('연장 완료 → ' + ymd(newExpires));
    await loadSubs();
  };
  window.cancelSub = async function (subId) {
    if (!confirm('이 구독을 즉시 취소하시겠습니까? (자동갱신 중지 + status=cancelled)')) return;
    const { error } = await supabase.from('subscriptions').update({
      status: 'cancelled', auto_renew: false, cancelled_at: new Date().toISOString()
    }).eq('id', subId);
    if (error) { alert('실패: ' + error.message); return; }
    alert('취소 완료');
    await loadSubs();
  };

  // ─── 배송 워크플로우 ────────────────────────────────────
  async function loadShipping() {
    const { data: pending } = await supabase.from('orders')
      .select('id, order_number, shipping_name, shipping_phone, shipping_address, shipping_detail, shipping_zipcode, total_amount, paid_at, memo')
      .eq('status', 'paid').is('tracking_number', null).not('shipping_address', 'is', null)
      .order('paid_at', { ascending: true }).limit(50);
    const { data: shipped } = await supabase.from('orders')
      .select('id, order_number, shipping_name, tracking_number, shipping_courier, shipped_at, delivered_at, status')
      .in('status', ['shipped', 'delivered']).not('tracking_number', 'is', null)
      .order('shipped_at', { ascending: false }).limit(30);

    $('shipping-pending-count').textContent = (pending?.length || 0) + '건';
    $('shipping-shipped-count').textContent = (shipped?.length || 0) + '건';

    setH($('shipping-pending-wrap'), !pending || pending.length === 0
      ? '<div class="empty">발송 대기 주문이 없습니다.</div>'
      : '<table class="newsletter-table"><thead><tr><th>주문번호</th><th>받는분</th><th>주소</th><th>결제일</th><th>운송장 입력</th></tr></thead><tbody>' +
        pending.map(o => '<tr>' +
          '<td style="font-family:monospace;font-size:.76rem;">' + esc(o.order_number || o.id.slice(0,8)) + '</td>' +
          '<td>' + esc(o.shipping_name || '-') + '<br><small style="color:var(--dim);">' + esc(o.shipping_phone || '') + '</small></td>' +
          '<td style="font-size:.74rem;color:var(--dim);">(' + esc(o.shipping_zipcode || '') + ') ' + esc(o.shipping_address || '') + ' ' + esc(o.shipping_detail || '') + '</td>' +
          '<td style="font-size:.74rem;color:var(--dim);">' + ymdhm(o.paid_at) + '</td>' +
          '<td>' +
            '<select id="cr-' + esc(o.id) + '" style="background:var(--card2);border:1px solid var(--line);border-radius:4px;color:var(--txt);padding:5px 8px;font-size:.72rem;">' +
              '<option value="cj">CJ대한통운</option>' +
              '<option value="hanjin">한진택배</option>' +
              '<option value="lotte">롯데택배</option>' +
              '<option value="epost">우체국</option>' +
              '<option value="logen">로젠택배</option>' +
              '<option value="kdexp">경동택배</option>' +
            '</select>' +
            ' <input id="tn-' + esc(o.id) + '" type="text" placeholder="운송장 번호" style="background:var(--card2);border:1px solid var(--line);border-radius:4px;color:var(--txt);padding:5px 8px;font-size:.74rem;width:130px;margin:0 4px;">' +
            ' <button onclick="markShipped(\'' + esc(o.id) + '\')" style="font-size:.7rem;padding:5px 10px;background:var(--accent);color:#0A0A0A;border:none;border-radius:3px;cursor:pointer;font-weight:700;">발송</button>' +
          '</td>' +
        '</tr>').join('') + '</tbody></table>');

    setH($('shipping-shipped-wrap'), !shipped || shipped.length === 0
      ? '<div class="empty">발송 완료 이력이 없습니다.</div>'
      : '<table class="newsletter-table"><thead><tr><th>주문번호</th><th>받는분</th><th>택배사</th><th>운송장</th><th>발송일</th><th>액션</th></tr></thead><tbody>' +
        shipped.map(o => {
          const action = o.status === 'delivered'
            ? '<span style="color:var(--ok);font-size:.74rem;">✓ 배송완료</span>'
            : '<button onclick="markDelivered(\'' + esc(o.id) + '\')" style="font-size:.7rem;padding:4px 10px;background:rgba(74,222,128,.12);color:var(--ok);border:1px solid rgba(74,222,128,.4);border-radius:3px;cursor:pointer;">배송완료 처리</button>';
          return '<tr>' +
            '<td style="font-family:monospace;font-size:.76rem;">' + esc(o.order_number || o.id.slice(0,8)) + '</td>' +
            '<td>' + esc(o.shipping_name || '-') + '</td>' +
            '<td style="font-size:.78rem;color:var(--dim);">' + esc(o.shipping_courier || '-') + '</td>' +
            '<td style="font-family:monospace;font-size:.76rem;">' + esc(o.tracking_number || '-') + '</td>' +
            '<td style="font-size:.78rem;color:var(--dim);">' + ymdhm(o.shipped_at) + '</td>' +
            '<td>' + action + '</td>' +
          '</tr>';
        }).join('') + '</tbody></table>');
  }
  window.markShipped = async function (orderId) {
    const tracking = $('tn-' + orderId).value.trim();
    const courier = $('cr-' + orderId).value;
    if (!tracking) { alert('운송장 번호를 입력하세요.'); return; }
    const { error } = await supabase.from('orders').update({
      status: 'shipped', tracking_number: tracking, shipping_courier: courier,
      shipped_by: currentUser.id, shipped_at: new Date().toISOString(),
    }).eq('id', orderId);
    if (error) { alert('실패: ' + error.message); return; }
    await loadShipping();
  };
  window.markDelivered = async function (orderId) {
    if (!confirm('이 주문을 배송완료로 처리하시겠습니까?')) return;
    const { error } = await supabase.from('orders').update({
      status: 'delivered', delivered_at: new Date().toISOString(),
    }).eq('id', orderId);
    if (error) { alert('실패: ' + error.message); return; }
    await loadShipping();
  };

  // ─── 레벨 테스트 dashboard ──────────────────────────────
  async function loadLevelTests() {
    const { data, error } = await supabase.from('level_test_results')
      .select('id, user_id, level, score, recommended_planet, anon_token, created_at')
      .order('created_at', { ascending: false }).limit(500);
    if (error) { setH($('lvl-recent-wrap'), '<div class="empty">실패: ' + esc(error.message) + '</div>'); return; }
    const all = data || [];

    const dist = { MARS:0, VENUS:0, TERRA:0, NEPTUNE:0, URANUS:0, SATURN:0, JUPITER:0, SUN:0 };
    all.forEach(r => { if (r.recommended_planet && dist[r.recommended_planet] != null) dist[r.recommended_planet]++; });
    setH($('lvl-distribution'), Object.entries(dist).map(([k,v]) =>
      '<div class="stat-card"><div class="stat-label">' + k + '</div><div class="stat-value">' + v + '</div></div>'
    ).join(''));

    const total = all.length;
    const anon = all.filter(r => r.anon_token).length;
    const member = total - anon;
    const rate = total > 0 ? ((member / total) * 100).toFixed(1) : '0.0';
    setH($('lvl-conversion'),
      '<div class="stats-row" style="margin:0;">' +
        '<div class="stat-card"><div class="stat-label">총 응시</div><div class="stat-value">' + total + '</div></div>' +
        '<div class="stat-card"><div class="stat-label">회원</div><div class="stat-value accent">' + member + '</div></div>' +
        '<div class="stat-card"><div class="stat-label">익명</div><div class="stat-value warn">' + anon + '</div></div>' +
        '<div class="stat-card"><div class="stat-label">회원 전환율</div><div class="stat-value accent">' + rate + '%</div></div>' +
      '</div>'
    );

    const recent = all.slice(0, 30);
    $('lvl-recent-count').textContent = recent.length + '건';
    setH($('lvl-recent-wrap'), recent.length === 0
      ? '<div class="empty">결과 없음</div>'
      : '<table class="newsletter-table"><thead><tr><th>레벨</th><th>점수</th><th>유형</th><th>시각</th></tr></thead><tbody>' +
        recent.map(r =>
          '<tr>' +
            '<td><strong>' + esc(r.recommended_planet || '-') + '</strong></td>' +
            '<td>' + (r.score == null ? '-' : r.score) + '</td>' +
            '<td>' + (r.user_id ? '<span style="color:var(--ok);font-size:.74rem;">회원</span>' : '<span style="color:var(--warn);font-size:.74rem;">익명</span>') + '</td>' +
            '<td style="font-size:.78rem;color:var(--dim);">' + ymdhm(r.created_at) + '</td>' +
          '</tr>'
        ).join('') + '</tbody></table>');
  }
})();
