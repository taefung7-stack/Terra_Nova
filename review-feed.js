// Terra Nova English · Review Feed
// 목적: landing.html / index.html의 ".쏟아지는 후기들" (.review-rain) 섹션에
//      Supabase의 승인된 5점 리뷰(is_published=true, rating=5)를 자동 주입.
//
// 동작 원칙:
// 1. Supabase에서 5★ 승인 리뷰를 최대 45건 가져옴 (created_at desc).
// 2. 결과가 0건이거나 fetch 실패 → 기존 하드코딩된 베타/샘플 후기 그대로
//    유지 (graceful degradation, 빈 화면 방지).
// 3. 결과가 있으면 → 실리뷰가 columns의 맨 앞에, 부족분은 하드코딩 카피로
//    채워 15개씩 3컬럼을 유지. infinite-loop을 위해 끝에 그대로 복제.
// 4. 인증 사용자(is_verified=true)는 우측 상단 태그 "VERIFIED",
//    그 외는 레벨명(예: SATURN)이나 "REVIEW".
//
// 보안: 사용자 컨텐츠(content/author_name)는 모두 textContent로만 삽입 →
// innerHTML 사용 안 함, XSS surface 0. 카드는 createElement로 빌드.
//
// SEO/접근성: 하드코딩 fallback이 HTML에 그대로 남아있어 JS 미실행 환경
// 에서도 리뷰가 보임. JS 실행되면 같은 .review-card 구조로 교체.

import { supabase } from './supabase-client.js';

(async function injectReviews() {
  const stage = document.querySelector('.review-rain-stage');
  if (!stage) return;

  const colTracks = stage.querySelectorAll('.review-col-track');
  if (colTracks.length !== 3) return; // 예상 구조가 깨졌으면 손대지 않음

  // ── 1. 실리뷰 가져오기 ──────────────────────────────
  let realReviews = [];
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating, title, content, level, author_name, author_grade, is_verified, created_at')
      .eq('is_published', true)
      .eq('rating', 5)
      .order('created_at', { ascending: false })
      .limit(45);
    if (error) {
      console.warn('[review-feed] supabase error:', error.message);
      return;
    }
    realReviews = data || [];
  } catch (e) {
    console.warn('[review-feed] fetch failed:', e.message);
    return;
  }

  if (realReviews.length === 0) {
    // 실리뷰가 아직 0건 → 하드코딩 fallback 유지
    return;
  }

  // ── 2. DOM 빌더 (XSS 안전) ───────────────────────────
  function buildCard(r, isDup) {
    const card = document.createElement('div');
    card.className = 'review-card';
    if (isDup) card.setAttribute('aria-hidden', 'true');

    const stars = document.createElement('div');
    stars.className = 'review-card-stars';
    stars.setAttribute('aria-label', '별점 5점');
    stars.textContent = '★★★★★';
    card.appendChild(stars);

    const quote = document.createElement('p');
    quote.className = 'review-card-quote';
    quote.textContent = `"${r.content || ''}"`;
    card.appendChild(quote);

    const meta = document.createElement('div');
    meta.className = 'review-card-meta';

    const left = document.createElement('span');
    const author = r.author_name || '구독자';
    const grade = r.author_grade ? ` · ${r.author_grade}` : '';
    left.textContent = `${author}${grade}`;
    meta.appendChild(left);

    const right = document.createElement('span');
    right.className = 'review-card-tag';
    if (r.is_verified) right.textContent = 'VERIFIED';
    else if (r.level) right.textContent = String(r.level).toUpperCase();
    else right.textContent = 'REVIEW';
    meta.appendChild(right);

    card.appendChild(meta);
    return card;
  }

  // ── 3. 3컬럼 round-robin 분배 ────────────────────────
  const colReal = [[], [], []];
  realReviews.forEach((r, i) => colReal[i % 3].push(r));

  // ── 4. 각 컬럼 재구성: 실리뷰 + 부족분 = 하드코딩 카드 ─
  const TARGET_PER_COL = 15;
  colTracks.forEach((track, idx) => {
    // 기존 unique 카드(non-duplicate) 풀
    const fallbackCards = Array.from(
      track.querySelectorAll('.review-card:not([aria-hidden="true"])')
    );

    const reviews = colReal[idx];
    const need = Math.max(0, TARGET_PER_COL - reviews.length);
    const usedFallbacks = fallbackCards.slice(0, need);

    // 트랙 비우고 새로 채움
    track.replaceChildren();

    // (1) unique 회: 실리뷰 → fallback
    reviews.forEach(r => track.appendChild(buildCard(r, false)));
    usedFallbacks.forEach(c => track.appendChild(c.cloneNode(true)));

    // (2) duplicate 회 (무한 루프용, aria-hidden)
    reviews.forEach(r => track.appendChild(buildCard(r, true)));
    usedFallbacks.forEach(c => {
      const clone = c.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  });

  console.info(`[review-feed] injected ${realReviews.length} real 5★ reviews across 3 columns`);
})();
