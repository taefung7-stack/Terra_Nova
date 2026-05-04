// Terra Nova · 공용 푸터 (모든 페이지 공통)
// 사용법: </body> 앞에 <script src="./footer.js"></script> 추가
// 이미 <footer> 있는 페이지(index)는 자동 스킵
// ⚠️ 사업자정보는 site-config.js의 window.BUSINESS_INFO를 참조

(function() {
  if (document.querySelector('footer.tn-footer') || document.querySelector('footer[data-shared]')) return;

  // 사용자 피드백(2026-05-04): 홈(index.html / landing.html)에도 약관·사업자
  // 정보 풀 푸터가 보여야 함. 기존엔 home에 짧은 <footer class="site-footer">
  // (카피라이트만)이 있어 footer.js가 스킵 → 홈에서 약관/연락처 못 봄.
  // 정책 변경: site-footer는 "미니멀 카피라이트 placeholder"로 간주하고
  // 제거한 뒤 풀 푸터를 주입한다. 다른 형태의 <footer>(예: tn-footer,
  // data-shared, 커스텀 클래스)는 그대로 살린다.
  const existingFooter = document.querySelector('footer');
  if (existingFooter) {
    if (existingFooter.classList.contains('site-footer')) {
      existingFooter.remove();
    } else {
      return; // 별도 커스텀 footer는 존중
    }
  }

  const isLightTheme = document.body.classList.contains('light-theme') ||
                       location.pathname.includes('subscription_detail_complete');

  const bg = isLightTheme ? '#fff' : '#03030A';
  const fg = isLightTheme ? 'rgba(0,0,0,.55)' : 'rgba(240,240,240,.45)';
  const fgStrong = isLightTheme ? 'rgba(0,0,0,.75)' : 'rgba(255,255,255,.4)';
  const borderTop = isLightTheme ? '1px solid rgba(0,0,0,.08)' : '1px solid rgba(255,255,255,.07)';

  // 사업자정보 — window.BUSINESS_INFO 우선, 없으면 안전한 기본값
  const B = window.BUSINESS_INFO || {};
  const safe = (v, fallback = '—') => (v && String(v).trim() && !String(v).includes('___')) ? v : fallback;

  const fullAddress = [B.address, B.addressDetail].filter(Boolean).join(' ');

  const businessInfoHtml = `
    <div class="tn-business-info" style="margin-top:18px;padding-top:18px;border-top:1px solid ${isLightTheme ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.05)'};max-width:760px;font-size:.66rem;color:${fg};line-height:1.85;letter-spacing:.2px;">
      <div style="margin-bottom:4px;">
        <strong style="color:${fgStrong};font-weight:600;">${safe(B.companyName, 'Terra Nova English')}</strong>
        &nbsp;·&nbsp; 대표 ${safe(B.representative)}
        &nbsp;·&nbsp; 사업자등록번호 ${safe(B.businessNumber)}
      </div>
      <div style="margin-bottom:4px;">
        통신판매업 신고번호 ${safe(B.ecommerceNumber)}
        ${fullAddress ? '&nbsp;·&nbsp; ' + fullAddress : ''}
      </div>
      <div>
        Tel ${safe(B.phone)}
        &nbsp;·&nbsp; Email <a href="mailto:${safe(B.email, 'support@terra-nova.kr')}" style="color:${fg};text-decoration:underline;">${safe(B.email, 'support@terra-nova.kr')}</a>
        ${B.customerServiceOfficer && B.customerServiceOfficer.name ? '&nbsp;·&nbsp; 개인정보보호책임자 ' + B.customerServiceOfficer.name : ''}
      </div>
    </div>
  `;

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
      <a href="refund.html" style="color:${fg};text-decoration:none;font-size:.72rem;">환불·교환 정책</a>
      <a href="faq.html" style="color:${fg};text-decoration:none;font-size:.72rem;">FAQ</a>
      <a href="mailto:${safe(B.email, 'support@terra-nova.kr')}" style="color:${fg};text-decoration:none;font-size:.72rem;">문의</a>
    </div>
    ${businessInfoHtml}
    <p style="font-size:.7rem;color:${fg};margin-top:14px;">© 2026 Terra Nova English. All rights reserved.</p>
  `;
  document.body.appendChild(footer);
})();
