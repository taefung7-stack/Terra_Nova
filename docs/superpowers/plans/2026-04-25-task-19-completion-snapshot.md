Task 19 — landing.html implementation complete

Verification snapshot (2026-04-25, branch landing-page-impl):

Section structure
- 11 sections render: hero, empathy, proof-statement, proof, logic, change-statement, change, makers, plans, faq, final-cta
- 1 h1, 8 h2, 4 h3, 0 h4 (proper heading hierarchy)
- Style block balanced (1/1), all 9 script blocks balanced

Critical content presence
- Hero H1 phrasing: "영어 한 지문에" + "수학 한 단원" — present (6× each across hero + meta)
- Proof statement "후기 대신" — present (1×)
- Change statement "영어 공부한 시간이" — present (1×)
- Final CTA subtitle "샘플을 확인하셨다면" — present (1×, exact)
- Final CTA H2 "Terra Nova의 첫 100명" — present (1×)
- "LIGHT 얼리버드" — present (4×)
- Pricing: 5,950원 (3×), 11,900원 (6×), 24,900원 (2×), 58,900원 (2×) — all present

Honesty principle (banned content scan)
- "5,800": 0 occurrences
- "97%": 0 occurrences
- "4,645,000": 0 occurrences
- "aggregateRating": 1 occurrence — in a self-documenting HTML comment ("NO aggregateRating"); JSON-LD body uses Organization + Product + AggregateOffer only (priceCurrency/lowPrice/highPrice), no rating fields
- "reviewCount": 0 occurrences
- "ratingValue": 0 occurrences

Earlybird counter
- LIGHT card counter: <strong id="earlybird-count" aria-live="polite" aria-atomic="true">0</strong>/100명 모집 시작
- Final CTA mirror counter: <strong id="final-earlybird-count" aria-live="polite" aria-atomic="true">0</strong>/100명 모집 중 · 100명 달성 시 정가 전환
- Auto-transition disclosure phrasing present (8 mentions of 100명/자동 전환/얼리버드 마감)

FAQ section
- Exactly 3 faq-item entries (환불 / 얼리버드 마감 / 영어 기초)
- Link to faq.html for full FAQ depth

Hero V1 typography mockup
- 0 <img> tags inside #hero (no external textbook imagery)

External link integrity
- All 5 *.html targets exist locally (index, sample, level_test, faq, order)
- Order links correctly parameterized: ?plan=light&ref=earlybird, ?plan=standard, ?plan=premium
- Logo back-link: index.html
- Canonical/OG: terra-nova.kr (production domain)
- Fonts: Google Fonts preconnect + stylesheet

Accessibility
- aria-live on both earlybird counters (2 occurrences)
- og:image:alt and twitter:image:alt both present
- Reduced-motion media query implemented

File metrics
- 1692 lines, 60,465 bytes
- Self-contained single HTML (shared.css + Google Fonts only)

Editorial placeholders pending (per spec Section 10)
- 5 mapping table sample rows finalization
- Sample passage text
- Real curriculum chart citations
- Live earlybird counter wiring (currently 0/100 static)

Note on HTTP smoke test
- The localhost:8765 server referenced by the task was not listening at verification time (curl/Invoke-WebRequest both refused). File-based audits are authoritative; the page head is well-formed (DOCTYPE, lang="ko", complete meta block) per direct inspection.

Branch landing-page-impl is ready for code review and merge.
