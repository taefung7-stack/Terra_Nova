// Terra Nova · 공용 푸터 (모든 페이지 공통)
// 사용법: </body> 앞에 <script src="./footer.js"></script> 추가
// 이미 <footer> 있는 페이지(index)는 자동 스킵

(function() {
  if (document.querySelector('footer.tn-footer') || document.querySelector('footer[data-shared]')) return;

  // index.html은 이미 전용 footer 보유 → 스킵
  if (location.pathname.endsWith('/index.html') || location.pathname.endsWith('/Terra_Nova/') || location.pathname === '/') {
    if (document.querySelector('footer')) return;
  }

  const isLightTheme = document.body.classList.contains('light-theme') ||
                       location.pathname.includes('subscription_detail_complete');

  const bg = isLightTheme ? '#fff' : '#03030A';
  const fg = isLightTheme ? 'rgba(0,0,0,.55)' : 'rgba(240,240,240,.45)';
  const fgStrong = isLightTheme ? 'rgba(0,0,0,.75)' : 'rgba(255,255,255,.4)';
  const borderTop = isLightTheme ? '1px solid rgba(0,0,0,.08)' : '1px solid rgba(255,255,255,.07)';

  const footer = document.createElement('footer');
  footer.className = 'tn-footer';
  footer.style.cssText = `background:${bg};padding:40px 5vw 60px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:12px;border-top:${borderTop};font-family:'Noto Sans KR',sans-serif;`;
  footer.innerHTML = `
    <div>
      <div style="font-family:'Bebas Neue',sans-serif;font-size:1.1rem;letter-spacing:7px;color:${fgStrong};">TERRA NOVA</div>
      <div style="font-size:.5rem;letter-spacing:3px;color:${fg};margin-top:4px;text-transform:uppercase;">ENGLISH · 수능영어 전문 학습자료</div>
    </div>
    <div style="display:flex;gap:20px;flex-wrap:wrap;justify-content:center;margin-top:8px;">
      <a href="terms.html" style="color:${fg};text-decoration:none;font-size:.72rem;">이용약관</a>
      <a href="privacy.html" style="color:${fg};text-decoration:none;font-size:.72rem;font-weight:700;">개인정보처리방침</a>
      <a href="faq.html" style="color:${fg};text-decoration:none;font-size:.72rem;">FAQ</a>
      <a href="mailto:support@terra-nova.kr" style="color:${fg};text-decoration:none;font-size:.72rem;">문의</a>
    </div>
    <p style="font-size:.7rem;color:${fg};">© 2026 Terra Nova English. All rights reserved.</p>
  `;
  document.body.appendChild(footer);
})();
