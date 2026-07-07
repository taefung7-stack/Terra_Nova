// Terra Nova · 공용 푸터 (모든 페이지 공통)
// 사용법: </body> 앞에 <script src="./footer.js"></script> 추가
// 이미 <footer> 있는 페이지(index)는 자동 스킵
// ⚠️ 사업자정보는 site-config.js의 window.BUSINESS_INFO를 참조

function buildTnFooter() {
  // 이미 tn-footer가 있으면(테마 재렌더) 제거 후 다시 만든다.
  var _existingTn = document.querySelector('footer.tn-footer');
  if (_existingTn) _existingTn.remove();
  else if (document.querySelector('footer[data-shared]')) return;

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

  // 라이트 모드 감지 — 신 방식 html.light (theme-toggle.js) + 구 light-theme 둘 다.
  const isLightTheme = document.documentElement.classList.contains('light')
    || document.body.classList.contains('light-theme');

  const bg = isLightTheme ? '#F4F6F7' : '#03030A';
  const fg = isLightTheme ? 'rgba(20,22,28,.62)' : 'rgba(240,240,240,.45)';
  const fgStrong = isLightTheme ? 'rgba(20,22,28,.82)' : 'rgba(255,255,255,.4)';
  const borderTop = isLightTheme ? '1px solid rgba(0,0,0,.10)' : '1px solid rgba(255,255,255,.07)';

  // 사업자정보 — window.BUSINESS_INFO 우선, 없으면 안전한 기본값
  const B = window.BUSINESS_INFO || {};
  const safe = (v, fallback = '—') => (v && String(v).trim() && !String(v).includes('___')) ? v : fallback;

  // 개인정보 보호(2026-07-06): footer에는 시/구까지만 노출, 상세주소·전화는 숨긴다.
  // 전체 사업자정보(주소·전화)는 공정위 통신판매사업자 조회로 확인 가능(전자상거래법 준수).
  const bizNo = String(safe(B.businessNumber, '')).replace(/[^0-9]/g, '');
  const ftcUrl = bizNo
    ? 'https://www.ftc.go.kr/bizCommPop.do?wrkr_no=' + bizNo
    : 'https://www.ftc.go.kr/www/bizCommList.do';
  // 주소는 시·도 + 시·군·구 까지만 (상세 도로명·동호수 비노출)
  const shortAddress = (function () {
    var a = safe(B.address, '');
    if (!a || a === '—') return '';
    var m = a.match(/^(\S+(?:시|도))\s+(\S+(?:시|군|구))/);
    return m ? (m[1] + ' ' + m[2]) : a.split(/\s+/).slice(0, 2).join(' ');
  })();

  const businessInfoHtml = `
    <div class="tn-business-info" style="margin-top:18px;padding-top:18px;border-top:1px solid ${isLightTheme ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.05)'};max-width:760px;font-size:.66rem;color:${fg};line-height:1.85;letter-spacing:.2px;">
      <div style="margin-bottom:4px;">
        <strong style="color:${fgStrong};font-weight:600;">${safe(B.companyName, '테라노바')}</strong>
        &nbsp;·&nbsp; 대표 ${safe(B.representative)}
        &nbsp;·&nbsp; 사업자등록번호 ${safe(B.businessNumber)}
      </div>
      <div style="margin-bottom:4px;">
        통신판매업 신고번호 ${safe(B.ecommerceNumber)}
        ${shortAddress ? '&nbsp;·&nbsp; ' + shortAddress : ''}
      </div>
      <div>
        Email <a href="mailto:${safe(B.email, 'taefung7@gmail.com')}" style="color:${fg};text-decoration:underline;">${safe(B.email, 'taefung7@gmail.com')}</a>
        ${B.customerServiceOfficer && B.customerServiceOfficer.name ? '&nbsp;·&nbsp; 개인정보보호책임자 ' + B.customerServiceOfficer.name : ''}
        &nbsp;·&nbsp; <a href="${ftcUrl}" target="_blank" rel="noopener" style="color:${fg};text-decoration:underline;">사업자정보 확인</a>
      </div>
    </div>
  `;

  const footer = document.createElement('footer');
  footer.className = 'tn-footer';
  footer.style.cssText = `background:${bg};padding:40px 5vw 60px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:12px;border-top:${borderTop};font-family:'Pretendard',sans-serif;`;
  footer.innerHTML = `
    <div>
      <div style="font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:1.1rem;letter-spacing:7px;color:${fgStrong};">TERRA NOVA</div>
      <div style="font-size:.5rem;letter-spacing:3px;color:${fg};margin-top:4px;text-transform:uppercase;">ENGLISH · 영어로 전과목 학습</div>
    </div>
    <div style="display:flex;gap:20px;flex-wrap:wrap;justify-content:center;margin-top:8px;">
      <a href="terms.html" style="color:${fg};text-decoration:none;font-size:.72rem;">이용약관</a>
      <a href="privacy.html" style="color:${fg};text-decoration:none;font-size:.72rem;font-weight:700;">개인정보처리방침</a>
      <a href="refund.html" style="color:${fg};text-decoration:none;font-size:.72rem;">환불·교환 정책</a>
      <a href="faq.html" style="color:${fg};text-decoration:none;font-size:.72rem;">FAQ</a>
      <a href="mailto:${safe(B.email, 'taefung7@gmail.com')}" style="color:${fg};text-decoration:none;font-size:.72rem;">문의</a>
    </div>
    ${businessInfoHtml}
    <p style="font-size:.7rem;color:${fg};margin-top:14px;">© 2026 Terra Nova. All rights reserved.</p>
  `;
  document.body.appendChild(footer);
}

buildTnFooter();
// 라이트/다크 토글 시 푸터를 그 테마 색으로 다시 렌더.
window.addEventListener('tn-theme-change', function () { try { buildTnFooter(); } catch (e) {} });
