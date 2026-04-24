# Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `landing.html` — a new marketing landing page implementing the design spec [`docs/superpowers/specs/2026-04-24-landing-page-design.md`](../specs/2026-04-24-landing-page-design.md) as a single self-contained HTML file, coexisting with existing `index.html` without modifying it.

**Architecture:** Vanilla HTML/CSS/JS. Single-file page with inline `<style>` and `<script>` — follows Terra Nova's explicit "page isolation" convention (per `shared.css` header comment). Reuses shared utilities (`shared.css`, `footer.js`, `nav-auth.js`) but owns its visual styles to avoid cross-page breakage.

**Tech Stack:** HTML5 · inline CSS · vanilla JS · Google Fonts (Noto Sans KR + Space Grotesk) · Terra Nova design tokens (`--mint #2DD4BF`, `--dark #0A0A0A`, etc.)

---

## Amendment 2026-04-25 — arsea.kr visual language

User requested adopting arsea.kr's visual language (bigger typography, more breathing room, subtle effects) while keeping Terra Nova's dark + mint palette. Three-knob adjustment applied inline to affected tasks:

1. **Typography scale ↑** — H1 bumped from `clamp(2.4rem, 6vw, 4.4rem)` → `clamp(3rem, 8.5vw, 7rem)`. H2 from `clamp(1.8rem, 4.2vw, 2.9rem)` → `clamp(2.4rem, 6vw, 4.6rem)`. Body text unchanged for contrast.
2. **Section breathing ↑** — Default section padding `120px 5vw` → `180px 6vw`. Mobile `80px 5vw` → `110px 5vw`. Hero `min-height:92vh` → `100vh`.
3. **Subtle effects** — Scroll-reveal fade-in via IntersectionObserver + H1 slow fade-in animation + stronger button hover transforms.

**Full-screen statement stages added** (cinematic rhythm):
- New `#proof-statement` stage before `#proof` content (Section 3)
- New `#change-statement` stage before `#change` content (Section 5)

Hero anchor CTAs (`#proof`, `#plans`) unchanged — intent-driven users still jump directly to content. Organic scrollers experience the statement stages as narrative beats.

**Reveal class application** — during each section task below, add `class="reveal"` (or append to existing classes) to the following block-level elements to make them fade in on scroll:
- `.pain-card` (Section 2) · `.mapping-table-wrap`, `.sample-passage`, `.compare-table-wrap`, `.proof-bridge` (Section 3) · `.logic-card` (Section 4) · `.change-box`, `.effect-card`, `.cycle-table` (Section 5) · `.makers-credentials`, `.principle-card` (Section 6) · `.plan-card`, `.plans-compare`, `.risk-item` (Section 7) · `.faq-item` (Section 8) · `#final-cta > .sec-wrap` (Section 9)

The `#proof-statement` and `#change-statement` stages already have `reveal` applied in their task HTML. Hero uses its own custom `heroFadeUp` keyframes (defined in Task 4).

---

## Important Deviations From Spec

The spec was written from memory that was stale on two items. Actual project tokens must be used for visual consistency with other Terra Nova pages:

| Spec says | Actual project uses | Plan follows |
|---|---|---|
| Accent: `#00DF81` Caribbean Green | `--mint #2DD4BF` (index.html) | **`#2DD4BF`** |
| Font: Axiforma | Noto Sans KR + Space Grotesk + Bebas Neue | **Noto Sans KR + Space Grotesk + Bebas Neue** |
| "Rich Black" bg `#02021B` | `--dark #0A0A0A` (index.html) | **`#0A0A0A`** |

All other spec content (section structure, copy, prices, level mapping, honesty principles) is authoritative and unchanged.

## Fake Data Prohibitions (enforced throughout implementation)

Do NOT copy from `index.html`:
- The JSON-LD `aggregateRating` block (ratingValue: 4.9, reviewCount: 2400) — fabricated social proof embedded in Schema.org.
- Any Offer price mismatches (existing index.html lists PREMIUM at 38,900 which conflicts with current 58,900).
- `5,800+ 학생`, `97% 성적 향상`, `4,645,000원 절약` stats.

`landing.html` ships with a minimal, honest JSON-LD block (Organization + Product only, no fake ratings).

---

## File Structure

### Create
- `landing.html` (root, ~2500-3500 lines self-contained)

### Modify (minimal, optional)
- None required for MVP. `index.html` and `subscription_detail_complete.html` untouched.

### Reuse (link only, no edits)
- `shared.css` — `<link rel="stylesheet">`
- `footer.js` — `<script defer>`
- `nav-auth.js` — `<script defer>`
- `analytics.js`, `pwa-register.js`, `sentry-init.js`, `site-config.js` — `<script defer>` per existing pattern
- `logo.png`, `manifest.webmanifest`, `og-cover.svg` — referenced in meta tags

### Editorial placeholders (implementation uses clearly-labeled placeholders; editorial team finalizes later)
- 5 mapping table sample rows (Section 3 Block A)
- 1 full sample passage text + explanation (Section 3 Block B)
- 수능 지문 주제 분포 chart data sources (Section 4 Point 1)
- Kakao channel URL (Section 8 bottom link — verify or remove)

---

## Task 1: Create `landing.html` skeleton (head + meta)

**Files:**
- Create: `landing.html`

- [ ] **Step 1: Create file with doctype, head, meta, title**

```html
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TERRA NOVA · 영어 한 지문에, 수학 한 단원이 들어 있습니다</title>
<meta name="description" content="교과 연계 독해 수능영어 학습지. 영어 공부 한 시간이 수학·과학·사회 배경지식 한 시간이 됩니다. 초3~고3 10단계 레벨. LIGHT 얼리버드 첫 달 5,950원.">
<meta name="keywords" content="수능영어,교과 연계 영어,영어 학습지,월간 구독,Terra Nova,수능 독해,고등 영어,중등 영어,초등 영어">
<meta name="author" content="Terra Nova English">
<link rel="canonical" href="https://terra-nova.kr/landing.html">

<!-- PWA / favicon (match index.html) -->
<link rel="manifest" href="./manifest.webmanifest">
<meta name="theme-color" content="#2DD4BF">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Terra Nova">
<link rel="apple-touch-icon" href="./logo.png">

<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="TERRA NOVA ENGLISH">
<meta property="og:locale" content="ko_KR">
<meta property="og:title" content="영어 한 지문에, 수학 한 단원이 들어 있습니다 · Terra Nova">
<meta property="og:description" content="교과 연계 독해. 영어 공부 한 시간이 전과목 공부 한 시간이 됩니다.">
<meta property="og:url" content="https://terra-nova.kr/landing.html">
<meta property="og:image" content="https://terra-nova.kr/og-cover.svg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="영어 한 지문에, 수학 한 단원이 들어 있습니다 · Terra Nova">
<meta name="twitter:description" content="교과 연계 독해. 영어 공부 한 시간이 전과목 공부 한 시간이 됩니다.">
<meta name="twitter:image" content="https://terra-nova.kr/og-cover.svg">

<!-- Minimal, honest JSON-LD (Organization + Product only; NO aggregateRating) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://terra-nova.kr/#organization",
      "name": "Terra Nova English",
      "url": "https://terra-nova.kr/",
      "logo": "https://terra-nova.kr/og-cover.svg",
      "description": "교과 연계 수능영어 월간 구독 학습지"
    },
    {
      "@type": "Product",
      "name": "Terra Nova 월간 독해 학습지",
      "description": "초3부터 고3까지 10단계 레벨별 교과 연계 영어 독해 학습지. 월 20지문.",
      "image": ["https://terra-nova.kr/og-cover.svg"],
      "brand": {"@type": "Brand", "name": "Terra Nova English"},
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "KRW",
        "lowPrice": "11900",
        "highPrice": "58900",
        "offerCount": 3
      }
    }
  ]
}
</script>

<!-- Fonts (match index.html) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Noto+Sans+KR:wght@300;400;500;700;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">

<!-- Shared utilities -->
<link rel="stylesheet" href="shared.css">
</head>
<body>
<!-- TODO: skip link, nav, content sections, scripts, footer -->
</body>
</html>
```

- [ ] **Step 2: Verify file opens in browser**

Run: `open landing.html` (or drag into browser)
Expected: blank white page with tab title "TERRA NOVA · 영어 한 지문에..."

- [ ] **Step 3: Commit**

```bash
git add landing.html
git commit -m "feat(landing): scaffold landing.html skeleton (head, meta, JSON-LD, fonts)"
```

---

## Task 2: Inline design tokens + base styles

**Files:**
- Modify: `landing.html` — insert `<style>` block before `</head>`

- [ ] **Step 1: Add `<style>` block with design tokens + resets**

Insert before `</head>`:

```html
<style>
:root {
  --mint:#2DD4BF;
  --mint2:#14B8A6;
  --accent:#2DD4BF;
  --dark:#0A0A0A;
  --mid:#111111;
  --card:#1C1C1C;
  --card2:#222222;
  --txt:#F0F0F0;
  --dim:rgba(240,240,240,.78);
  --dim2:rgba(240,240,240,.52);
  --line:rgba(255,255,255,.07);
  --line2:rgba(45,212,191,.18);
}
* { margin:0; padding:0; box-sizing:border-box; }
html { scroll-behavior:smooth; }
body {
  background:var(--dark);
  color:var(--txt);
  font-family:'Noto Sans KR',sans-serif;
  overflow-x:hidden;
  -webkit-font-smoothing:antialiased;
  line-height:1.55;
}
img, svg { display:block; max-width:100%; }
a { color:inherit; text-decoration:none; }
button { font:inherit; cursor:pointer; }

/* Focus visibility */
a:focus-visible, button:focus-visible, input:focus-visible {
  outline:2px solid var(--accent);
  outline-offset:3px;
  border-radius:4px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration:.01ms !important;
    transition-duration:.01ms !important;
    scroll-behavior:auto !important;
  }
}

/* Section base — arsea.kr-inspired breathing room */
section { padding:180px 6vw; position:relative; }
.sec-wrap { max-width:1180px; margin:0 auto; }
.sec-kicker {
  display:inline-block;
  font-family:'Space Grotesk',sans-serif;
  font-size:.78rem;
  letter-spacing:4px;
  color:var(--accent);
  text-transform:uppercase;
  margin-bottom:32px;
  padding:6px 14px;
  border:1px solid var(--line2);
  border-radius:2px;
}
.sec-h2 {
  font-family:'Noto Sans KR',sans-serif;
  font-size:clamp(2.4rem, 6vw, 4.6rem);
  font-weight:900;
  letter-spacing:-.03em;
  line-height:1.2;
  color:#fff;
  margin-bottom:28px;
}
.sec-sub {
  font-size:clamp(1.05rem, 1.7vw, 1.25rem);
  color:var(--dim);
  line-height:1.85;
  font-weight:500;
  max-width:760px;
  margin-bottom:72px;
}
.accent-text { color:var(--accent); }

/* Mobile break utility (match index.html pattern) */
.mobile-br { display:none; }
@media (max-width:720px) {
  .mobile-br { display:inline; }
  section { padding:110px 5vw; }
  .sec-sub { margin-bottom:56px; }
}

/* Scroll-reveal utility (IntersectionObserver target) */
.reveal {
  opacity:0;
  transform:translateY(24px);
  transition:opacity .8s cubic-bezier(.2,.8,.2,1), transform .8s cubic-bezier(.2,.8,.2,1);
  will-change:opacity, transform;
}
.reveal.is-visible { opacity:1; transform:translateY(0); }
@media (prefers-reduced-motion: reduce) {
  .reveal { opacity:1; transform:none; transition:none; }
}

/* Stage statement (arsea-style full-screen single-sentence) */
.stage-statement {
  min-height:100vh;
  display:flex; align-items:center; justify-content:center;
  padding:120px 6vw;
  text-align:center;
  background:var(--dark);
  border-top:1px solid var(--line);
  position:relative;
}
.stage-statement::before {
  content:''; position:absolute; inset:0;
  background:radial-gradient(ellipse at 50% 50%, rgba(45,212,191,.05) 0%, transparent 65%);
  pointer-events:none;
}
.stage-inner { max-width:1040px; position:relative; z-index:1; }
.stage-kicker {
  display:inline-block;
  font-family:'Space Grotesk',sans-serif;
  font-size:.78rem; letter-spacing:4px;
  color:var(--accent); text-transform:uppercase;
  margin-bottom:40px;
  padding:6px 14px; border:1px solid var(--line2); border-radius:2px;
}
.stage-h2 {
  font-family:'Noto Sans KR',sans-serif;
  font-size:clamp(2.8rem, 7.5vw, 6rem);
  font-weight:900; letter-spacing:-.035em;
  line-height:1.22; color:#fff; margin-bottom:36px;
}
.stage-h2 .accent-text { color:var(--accent); }
.stage-sub {
  font-size:clamp(1.05rem, 1.8vw, 1.3rem);
  color:var(--dim); max-width:720px;
  margin:0 auto; line-height:1.85; font-weight:500;
}
@media (max-width:720px) {
  .stage-statement { min-height:90vh; padding:80px 5vw; }
}

/* Skip link (accessibility) */
.skip-link {
  position:absolute; top:-48px; left:8px; z-index:9999;
  background:var(--accent); color:#0A0A0A;
  padding:10px 16px; border-radius:4px;
  font-weight:700; font-size:.85rem;
  transition:top .2s;
}
.skip-link:focus { top:8px; }
</style>
```

- [ ] **Step 2: Add skip link and main element in body**

Replace the TODO comment in body:

```html
<a href="#main" class="skip-link">본문으로 건너뛰기</a>
<main id="main">
  <!-- TODO: sections 1-9 -->
</main>
```

- [ ] **Step 3: Add scroll-reveal JS (IntersectionObserver) before `</body>` — add to the existing `<script>` block if later created, or start a new one now**

```html
<script>
  // Scroll-reveal: add .is-visible when element enters viewport
  (function() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function(el){ el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    els.forEach(function(el){ io.observe(el); });
  })();
</script>
```

- [ ] **Step 4: Reload browser, verify dark bg + white text**

Expected: black background (`#0A0A0A`), no content yet but body renders correctly. Reveal utility won't show anything yet (no `.reveal` elements).

- [ ] **Step 5: Commit**

```bash
git add landing.html
git commit -m "feat(landing): add design tokens, stage/reveal utilities (arsea-inspired)"
```

---

## Task 3: Nav bar + floating buttons

**Files:**
- Modify: `landing.html` — append nav styles, nav HTML, floating buttons

Reuse pattern from `index.html:210-235`. Copy nav structure (not the whole page).

- [ ] **Step 1: Add nav styles inside existing `<style>` block**

```css
/* NAV */
nav.site-nav {
  position:fixed; top:0; left:0; right:0; z-index:100;
  display:flex; align-items:center; justify-content:space-between;
  padding:0 5vw; height:68px;
  background:rgba(6,6,15,.92); backdrop-filter:blur(24px);
  border-bottom:1px solid var(--line);
}
.logo-wrap { display:flex; flex-direction:column; gap:2px; }
.logo-main {
  font-family:'Bebas Neue',sans-serif;
  font-size:1.45rem; letter-spacing:7px; color:#fff;
}
.logo-eng {
  font-family:'Noto Sans KR',sans-serif;
  font-size:.5rem; font-weight:500; letter-spacing:5px;
  color:rgba(45,212,191,.35); text-transform:uppercase;
}
.nav-links { display:flex; gap:32px; list-style:none; align-items:center; }
.nav-links a {
  color:var(--dim); font-size:.75rem; font-weight:500;
  letter-spacing:.8px; transition:color .2s;
}
.nav-links a:hover { color:#fff; }
.nav-cta {
  color:var(--accent) !important;
  border:1px solid rgba(45,212,191,.3);
  padding:7px 18px; border-radius:4px;
  font-weight:600;
  transition:background .2s;
}
.nav-cta:hover { background:rgba(45,212,191,.08); }
@media (max-width:720px) {
  .nav-links { display:none; }
}
```

- [ ] **Step 2: Add nav HTML inside body, before `<main>`**

```html
<nav class="site-nav" role="navigation">
  <a href="index.html" class="logo-wrap" aria-label="Terra Nova 홈">
    <span class="logo-main">TERRA NOVA</span>
    <span class="logo-eng">ENGLISH</span>
  </a>
  <ul class="nav-links">
    <li><a href="sample.html">샘플</a></li>
    <li><a href="level_test.html">레벨 테스트</a></li>
    <li><a href="faq.html">FAQ</a></li>
    <li><a href="order.html" class="nav-cta">구독 시작</a></li>
  </ul>
</nav>
```

- [ ] **Step 3: Add footer include placeholder at end of body**

```html
<footer id="site-footer"></footer>
<script defer src="footer.js"></script>
<script defer src="nav-auth.js"></script>
<script defer src="analytics.js"></script>
<script defer src="pwa-register.js"></script>
<script defer src="sentry-init.js"></script>
<script defer src="site-config.js"></script>
```

- [ ] **Step 4: Reload browser, verify nav renders at top**

Expected: fixed nav with "TERRA NOVA" logo left, 4 links right. Hover changes color.

- [ ] **Step 5: Commit**

```bash
git add landing.html
git commit -m "feat(landing): add nav bar and shared script includes"
```

---

## Task 4: Section 1 — Hero

**Files:**
- Modify: `landing.html` — add hero styles + HTML inside `<main>`

Spec reference: Section 1 of design spec.

- [ ] **Step 1: Add hero styles to `<style>` block**

```css
/* HERO — arsea-inspired: full viewport height */
#hero {
  padding-top:160px;
  padding-bottom:120px;
  background:var(--dark);
  min-height:100vh;
  display:flex; align-items:center;
  position:relative; overflow:hidden;
}
#hero::before {
  content:''; position:absolute;
  top:20%; left:50%; transform:translateX(-50%);
  width:720px; height:720px;
  background:radial-gradient(circle, rgba(45,212,191,.08) 0%, transparent 60%);
  pointer-events:none;
}
.hero-inner { max-width:1180px; margin:0 auto; position:relative; z-index:1; }
.hero-kicker {
  display:inline-flex; align-items:center; gap:8px;
  font-family:'Space Grotesk',sans-serif;
  font-size:.74rem; letter-spacing:3px;
  color:var(--accent); text-transform:uppercase;
  margin-bottom:28px;
  padding:6px 14px; border:1px solid var(--line2); border-radius:2px;
}
.hero-kicker::before {
  content:''; width:6px; height:6px;
  background:var(--accent); border-radius:50%;
  box-shadow:0 0 10px var(--accent);
}
.hero-h1 {
  font-family:'Noto Sans KR',sans-serif;
  font-size:clamp(3rem, 8.5vw, 7rem);
  font-weight:900; letter-spacing:-.04em;
  line-height:1.12; color:#fff;
  margin-bottom:36px; max-width:1080px;
}
/* Hero H1 slow fade-in on load */
@keyframes heroFadeUp {
  from { opacity:0; transform:translateY(28px); }
  to { opacity:1; transform:translateY(0); }
}
.hero-h1, .hero-sub, .hero-kicker { animation:heroFadeUp 1s cubic-bezier(.2,.8,.2,1) both; }
.hero-kicker { animation-delay:.1s; }
.hero-h1 { animation-delay:.25s; }
.hero-sub { animation-delay:.45s; }
@media (prefers-reduced-motion: reduce) {
  .hero-h1, .hero-sub, .hero-kicker { animation:none; }
}
.hero-divider {
  width:64px; height:3px; background:var(--accent);
  margin-bottom:24px;
}
.hero-sub {
  font-size:clamp(1.05rem, 1.8vw, 1.25rem);
  color:var(--dim); line-height:1.85; font-weight:500;
  max-width:640px; margin-bottom:48px;
}
.hero-visual {
  display:grid; grid-template-columns:1fr auto 1fr; gap:24px;
  align-items:center; margin-bottom:48px;
  max-width:900px;
}
.hero-visual-card {
  background:var(--card); border:1px solid var(--line);
  padding:24px; border-radius:6px;
  min-height:220px;
  display:flex; flex-direction:column; justify-content:center; gap:10px;
}
.hero-visual-label {
  font-family:'Space Grotesk',sans-serif;
  font-size:.7rem; letter-spacing:2px;
  color:var(--dim2); text-transform:uppercase;
}
.hero-visual-title {
  font-weight:900; font-size:1.1rem; color:#fff;
}
.hero-visual-body {
  font-size:.92rem; color:var(--dim); line-height:1.65;
}
.hero-visual-arrow {
  font-size:1.5rem; color:var(--accent); font-weight:700;
}
.hero-chips {
  display:flex; flex-wrap:wrap; gap:12px; margin-bottom:40px;
}
.hero-chip {
  display:inline-flex; align-items:center; gap:6px;
  padding:8px 16px; border:1px solid var(--line);
  border-radius:999px;
  font-size:.82rem; color:var(--dim); font-weight:500;
}
.hero-btns { display:flex; flex-wrap:wrap; gap:14px; margin-bottom:32px; }
.btn-primary {
  display:inline-flex; align-items:center; gap:8px;
  padding:14px 28px;
  background:var(--accent); color:#0A0A0A;
  border-radius:4px; font-weight:700; font-size:.95rem;
  transition:transform .15s, box-shadow .15s;
}
.btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 22px rgba(45,212,191,.28); }
.btn-ghost {
  display:inline-flex; align-items:center; gap:8px;
  padding:14px 26px;
  border:1px solid var(--line2); color:var(--accent);
  border-radius:4px; font-weight:600; font-size:.9rem;
  transition:background .15s;
}
.btn-ghost:hover { background:rgba(45,212,191,.08); }
.hero-links-row { display:flex; gap:20px; }
.hero-link {
  font-size:.82rem; color:var(--dim); font-weight:500;
  border-bottom:1px dashed var(--line);
  padding-bottom:2px;
}
.hero-link:hover { color:#fff; border-color:var(--accent); }
.hero-scarcity {
  margin-top:40px; padding:12px 18px;
  background:rgba(45,212,191,.06);
  border:1px solid var(--line2); border-radius:4px;
  font-size:.82rem; color:var(--dim);
  display:inline-flex; align-items:center; gap:8px;
}
.hero-scarcity::before {
  content:'●'; color:var(--accent); font-size:.7rem;
}

/* Hero mobile */
@media (max-width:720px) {
  .hero-visual { grid-template-columns:1fr; }
  .hero-visual-arrow { transform:rotate(90deg); justify-self:center; }
  .btn-primary, .btn-ghost { width:100%; justify-content:center; }
  .hero-btns { flex-direction:column; }
}
```

- [ ] **Step 2: Add hero HTML inside `<main>`**

```html
<section id="hero">
  <div class="hero-inner">
    <div class="hero-kicker">매달 한 권 · 교과 연계 수능 영어 학습지</div>
    <h1 class="hero-h1">영어 한 지문에, <br class="mobile-br"><span class="accent-text">수학 한 단원</span>이 들어 있습니다.</h1>
    <div class="hero-divider"></div>
    <p class="hero-sub">
      영어 지문 한 편 = 수학·과학·사회 교과서 한 편. <br class="mobile-br">
      한 권으로 영어 공부하면서 전과목 배경 지식까지 동시에 쌓입니다.
    </p>

    <!-- V1 typography mockup: textbook card ↔ Terra Nova card -->
    <div class="hero-visual" aria-hidden="true">
      <div class="hero-visual-card">
        <div class="hero-visual-label">학교 교과서 · 수학Ⅰ</div>
        <div class="hero-visual-title">II-3. 지수함수와 로그함수</div>
        <div class="hero-visual-body">복리 계산, 지수 증가 모델, 로그 스케일 — 학교에서 배우는 개념.</div>
      </div>
      <div class="hero-visual-arrow">↔</div>
      <div class="hero-visual-card" style="border-color:var(--line2); background:rgba(45,212,191,.03);">
        <div class="hero-visual-label" style="color:var(--accent);">TERRA NOVA · SATURN 고1</div>
        <div class="hero-visual-title">Compound Interest &amp; Exponential Growth</div>
        <div class="hero-visual-body">같은 개념을 영어 지문으로. 배경지식은 이미 학교에서, 어휘·구문은 Terra Nova에서.</div>
      </div>
    </div>

    <div class="hero-chips">
      <span class="hero-chip">📚 매달 1권 · 월 20지문</span>
      <span class="hero-chip">🎯 수학·과학·사회 교과 연계</span>
      <span class="hero-chip">✅ 언제든 해지 · 레벨 변경</span>
    </div>

    <div class="hero-btns">
      <a href="#proof" class="btn-primary">교과 매칭표 미리보기 →</a>
      <a href="#plans" class="btn-ghost">첫 구독 시작하기</a>
    </div>
    <div class="hero-links-row">
      <a href="sample.html" class="hero-link">무료 샘플 받기</a>
      <a href="level_test.html" class="hero-link">레벨 테스트</a>
    </div>

    <div class="hero-scarcity">LIGHT 플랜 첫 100명 얼리버드 모집 중 — 마감 시 정가 전환</div>
  </div>
</section>
```

- [ ] **Step 3: Reload browser, verify hero renders**

Expected: headline "영어 한 지문에, 수학 한 단원이..." with mint accent on "수학 한 단원", two-card visual mockup (textbook ↔ Terra Nova), chips, primary + ghost buttons.

- [ ] **Step 4: Verify smooth-scroll to `#proof` and `#plans` (anchors will 404 until those sections exist — expected for now)**

Click "교과 매칭표 미리보기" — nothing happens yet (target missing). This is acceptable; will verify after Task 6.

- [ ] **Step 5: Commit**

```bash
git add landing.html
git commit -m "feat(landing): add hero section (H1, visual mockup, CTAs, scarcity)"
```

---

## Task 5: Section 2 — 공감 (Empathy)

**Files:**
- Modify: `landing.html` — append empathy styles + HTML

Spec reference: Section 2.

- [ ] **Step 1: Add empathy styles**

```css
/* SECTION 2 EMPATHY */
#empathy { background:var(--dark); border-top:1px solid var(--line); }
.empathy-grid {
  display:grid;
  grid-template-columns:repeat(3, 1fr);
  gap:24px;
  margin-bottom:56px;
}
.pain-card {
  background:var(--card);
  border:1px solid var(--line);
  border-radius:6px;
  padding:32px 28px;
  transition:border-color .2s, transform .2s;
}
.pain-card:hover {
  border-color:var(--line2);
  transform:translateY(-2px);
}
.pain-icon {
  width:56px; height:56px;
  display:flex; align-items:center; justify-content:center;
  font-size:1.8rem;
  border-radius:50%;
  background:rgba(45,212,191,.06);
  border:1px solid var(--line2);
  margin-bottom:20px;
}
.pain-title {
  font-size:1.15rem; font-weight:900; color:#fff;
  line-height:1.4; margin-bottom:12px;
}
.pain-body {
  font-size:.92rem; color:var(--dim); line-height:1.75;
}
.empathy-bridge {
  text-align:center; padding:40px 20px;
  border-top:1px solid var(--line);
}
.empathy-bridge-text {
  font-size:clamp(1.15rem, 2vw, 1.4rem);
  color:#fff; font-weight:700;
  line-height:1.6; margin-bottom:12px;
}
.empathy-bridge-text .accent-text { color:var(--accent); }
.empathy-bridge-arrow {
  font-size:.85rem; color:var(--dim); letter-spacing:2px;
}
@media (max-width:720px) {
  .empathy-grid { grid-template-columns:1fr; }
}
```

- [ ] **Step 2: Add empathy HTML inside `<main>` after `#hero`**

```html
<section id="empathy">
  <div class="sec-wrap">
    <div class="sec-kicker">왜 이 교재가 필요한가</div>
    <h2 class="sec-h2">영어 공부 1시간이, <br class="mobile-br">영어에서만 끝나고 있습니다.</h2>
    <p class="sec-sub">고등 학부모가 실제로 털어놓는 세 가지 딜레마.</p>

    <div class="empathy-grid">
      <div class="pain-card">
        <div class="pain-icon">🧩</div>
        <div class="pain-title">영어 지문엔 과학·철학·경제가 나옵니다. 학교 수업과 왜 따로 놀까요?</div>
        <p class="pain-body">영어 공부는 영어만, 수학은 수학만. 각 과목에서 쌓는 배경 지식이 서로 연결되지 않으니 공부 시간 대비 효율이 나오지 않습니다.</p>
      </div>
      <div class="pain-card">
        <div class="pain-icon">💰</div>
        <div class="pain-title">전과목 학원은 월 100만 원. 한 과목도 빼기 불안합니다.</div>
        <p class="pain-body">영어 학원만 월 40만 원. 수학·과학까지 합치면 월 100만 원이 기본. 그런데 어느 과목 하나 빼기도 불안합니다.</p>
      </div>
      <div class="pain-card">
        <div class="pain-icon">⏱️</div>
        <div class="pain-title">같은 한 시간을, 두 배로 쌓고 싶습니다.</div>
        <p class="pain-body">영어 공부 한 시간에 영어 실력만 남는 게 아쉽습니다. 배경 지식까지 같이 쌓여야 그 시간이 아깝지 않습니다.</p>
      </div>
    </div>

    <div class="empathy-bridge">
      <div class="empathy-bridge-text">
        그래서 Terra Nova는 — <br class="mobile-br">
        영어 지문 한 편에 <span class="accent-text">교과서 한 단원</span>을 담았습니다.
      </div>
      <div class="empathy-bridge-arrow">↓ 증거를 보여드립니다</div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Reload browser, verify 3 pain cards render in row (desktop) / stack (mobile)**

Expected: 3 cards with icons 🧩 💰 ⏱️, bridge text with mint accent below.

- [ ] **Step 4: Commit**

```bash
git add landing.html
git commit -m "feat(landing): add Section 2 empathy (3 pain cards + bridge)"
```

---

## Task 6: Section 3 Block A — Curriculum mapping table

**Files:**
- Modify: `landing.html` — append proof section styles + mapping table HTML

Spec reference: Section 3 Block A. This is the page spine evidence.

- [ ] **Step 1: Add proof section base styles and table styles**

```css
/* SECTION 3 PROOF */
#proof { background:var(--mid); border-top:1px solid var(--line); }
.proof-block { margin-bottom:72px; }
.proof-block-title {
  font-size:clamp(1.35rem, 2.5vw, 1.7rem);
  font-weight:900; color:#fff;
  margin-bottom:10px; line-height:1.35;
}
.proof-block-sub {
  font-size:.95rem; color:var(--dim);
  line-height:1.75; margin-bottom:28px; max-width:720px;
}

/* Mapping table */
.mapping-table-wrap { overflow-x:auto; border:1px solid var(--line); border-radius:6px; }
.mapping-table {
  width:100%; border-collapse:collapse;
  background:var(--card); min-width:780px;
}
.mapping-table th, .mapping-table td {
  padding:16px 18px; text-align:left;
  font-size:.9rem; border-bottom:1px solid var(--line);
}
.mapping-table th {
  font-family:'Space Grotesk',sans-serif;
  font-size:.72rem; letter-spacing:2px;
  color:var(--accent); text-transform:uppercase;
  background:rgba(45,212,191,.04);
  border-bottom:1px solid var(--line2);
}
.mapping-table tr:last-child td { border-bottom:none; }
.mapping-table .level-cell {
  font-weight:700; color:#fff;
  font-family:'Space Grotesk',sans-serif;
  letter-spacing:2px;
}
.mapping-table .grade-cell { color:var(--accent); font-size:.82rem; }
.mapping-table .topic-cell { color:#fff; font-weight:500; }
.mapping-table .subject-cell { color:var(--dim); }
.mapping-table .concept-cell { color:var(--dim2); font-size:.82rem; }

.mapping-cta {
  margin-top:24px; padding:20px;
  background:var(--card); border:1px dashed var(--line2); border-radius:6px;
  display:flex; justify-content:space-between; align-items:center; gap:16px;
  flex-wrap:wrap;
}
.mapping-cta-text { color:var(--dim); font-size:.95rem; }
.mapping-cta-text strong { color:#fff; }

@media (max-width:720px) {
  .mapping-cta { flex-direction:column; align-items:flex-start; }
}
```

- [ ] **Step 2: Add Section 3 full-screen statement stage + proof section opener HTML + Block A (mapping table)**

Add after `#empathy`. Note the new `#proof-statement` stage before `#proof` content — creates cinematic beat per arsea pattern.

```html
<!-- SECTION 3 STAGE: arsea-style full-screen H2 beat -->
<section id="proof-statement" class="stage-statement reveal">
  <div class="stage-inner">
    <div class="stage-kicker">Terra Nova의 증거</div>
    <h2 class="stage-h2">후기 대신, <br class="mobile-br">교재 그 자체를 <br class="mobile-br"><span class="accent-text">보여드립니다.</span></h2>
    <p class="stage-sub">아직 후기는 쌓이지 않았습니다. 대신 첫 배송본 안쪽을 전부 열어 보여드립니다.</p>
  </div>
</section>

<!-- SECTION 3 CONTENT: mapping table + sample + comparison -->
<section id="proof">
  <div class="sec-wrap">
    <!-- BLOCK A: Mapping table -->
    <div class="proof-block">
      <div class="proof-block-title">10단계 × 학년별 교과 매칭 — 대표 5지문</div>
      <p class="proof-block-sub">
        초3부터 고3까지 10단계 전 레벨이 각자 학년 교과와 1:1 매칭됩니다.
        아래는 레벨 스펙트럼을 보여주는 대표 5지문.
        <!-- EDITORIAL: replace with finalized data at launch -->
      </p>

      <div class="mapping-table-wrap">
        <table class="mapping-table">
          <thead>
            <tr>
              <th>레벨</th>
              <th>학년</th>
              <th>지문 주제</th>
              <th>연계 교과·단원</th>
              <th>핵심 개념</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="level-cell">MOON</td>
              <td class="grade-cell">초3</td>
              <td class="topic-cell">Animal Habitats</td>
              <td class="subject-cell">초3 과학 · 동식물의 한살이</td>
              <td class="concept-cell">서식지</td>
            </tr>
            <tr>
              <td class="level-cell">VENUS</td>
              <td class="grade-cell">초6</td>
              <td class="topic-cell">Why Democracy Works</td>
              <td class="subject-cell">초6 사회 · 민주 정치</td>
              <td class="concept-cell">의사결정</td>
            </tr>
            <tr>
              <td class="level-cell">NEPTUNE</td>
              <td class="grade-cell">중2</td>
              <td class="topic-cell">Energy Transformation</td>
              <td class="subject-cell">중2 과학 · 에너지 전환</td>
              <td class="concept-cell">에너지 변환</td>
            </tr>
            <tr>
              <td class="level-cell">SATURN</td>
              <td class="grade-cell">고1</td>
              <td class="topic-cell">Compound Interest and Exponential Growth</td>
              <td class="subject-cell">수학Ⅰ · 지수와 로그</td>
              <td class="concept-cell">복리 / 지수 증가</td>
            </tr>
            <tr>
              <td class="level-cell">SUN</td>
              <td class="grade-cell">고3</td>
              <td class="topic-cell">Market Equilibrium in Global Trade</td>
              <td class="subject-cell">사회·문화 · 경제</td>
              <td class="concept-cell">수요 / 공급</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mapping-cta">
        <div class="mapping-cta-text">
          <strong>전체 20지문 매칭표</strong>를 PDF로 받으시겠어요? <br>
          이메일 남겨 주시면 현재 레벨의 전체 매칭표를 바로 보내드립니다.
        </div>
        <a href="sample.html" class="btn-ghost">매칭표 PDF 받기 →</a>
      </div>
    </div>
    <!-- TODO: Block B sample passage, Block C comparison, Block D bridge -->
  </div>
</section>
```

- [ ] **Step 3: Reload browser, verify table renders with 5 rows**

Expected: proof section opens with "후기 대신, 교재 그 자체를..." H2, table with 5 rows (MOON/VENUS/NEPTUNE/SATURN/SUN), CTA box below.

Also verify: clicking "교과 매칭표 미리보기" from hero now smooth-scrolls to `#proof`.

- [ ] **Step 4: Commit**

```bash
git add landing.html
git commit -m "feat(landing): add Section 3 Block A mapping table (10-level × subject)"
```

---

## Task 7: Section 3 Block B — Sample passage

**Files:**
- Modify: `landing.html` — append Block B HTML inside existing `#proof` section

- [ ] **Step 1: Add sample passage styles**

Append to `<style>`:

```css
.sample-passage {
  background:var(--card); border:1px solid var(--line);
  border-radius:6px; padding:32px 36px;
  margin-top:16px;
}
.sample-passage-label {
  display:inline-block; padding:4px 12px;
  background:rgba(45,212,191,.08); color:var(--accent);
  font-family:'Space Grotesk',sans-serif;
  font-size:.72rem; letter-spacing:2px;
  border-radius:2px; text-transform:uppercase;
  margin-bottom:16px;
}
.sample-passage-title {
  font-size:1.3rem; font-weight:700; color:#fff;
  margin-bottom:18px; font-family:'Space Grotesk',sans-serif;
}
.sample-passage-text {
  font-size:.95rem; line-height:1.85; color:var(--dim);
  font-family:'Space Grotesk',sans-serif;
  margin-bottom:20px;
}
.sample-passage-explanation {
  border-top:1px solid var(--line); padding-top:20px;
  font-size:.88rem; color:var(--dim); line-height:1.8;
}
.sample-passage-explanation strong { color:#fff; }
.sample-passage-cta { margin-top:20px; display:flex; gap:12px; flex-wrap:wrap; }
```

- [ ] **Step 2: Replace the `<!-- TODO: Block B ... -->` comment with Block B HTML**

```html
<!-- BLOCK B: Sample passage -->
<div class="proof-block">
  <div class="proof-block-title">샘플 지문 1편, 페이지 안에서 공개합니다</div>
  <p class="proof-block-sub">SATURN 레벨(고1) 6월호 지문 예시. <!-- EDITORIAL: replace with actual passage text at launch. --></p>

  <div class="sample-passage">
    <span class="sample-passage-label">SATURN · 고1 · 수학Ⅰ 지수와 로그</span>
    <h3 class="sample-passage-title">Compound Interest and Exponential Growth</h3>
    <p class="sample-passage-text">
      <!-- EDITORIAL PLACEHOLDER — replace with actual passage at launch -->
      [샘플 지문 300~350단어. 편집진이 고1 6월호 실제 지문으로 교체.
      주제: 복리 개념이 어떻게 지수 함수 모델과 연결되는가. 학교 수학Ⅰ II-3 단원과 1:1 대응.]
    </p>
    <div class="sample-passage-explanation">
      <strong>이 지문은 이렇게 활용합니다.</strong><br>
      학교 수학 시간에 배우는 '지수함수와 로그함수' 단원의 개념이 영어 지문의 주제와 그대로 대응됩니다.
      학생은 이미 익숙한 수학 개념을 영어로 다시 만나면서 배경지식 친숙도와 영어 독해를 동시에 쌓습니다.
      문제 풀이 후에는 해설지가 "왜 이 지문 주제가 교과서 개념과 연결되는지"를 한 번 더 짚어줍니다.
    </div>
    <div class="sample-passage-cta">
      <a href="sample.html" class="btn-primary">해설 포함 전체 샘플 PDF 받기</a>
      <a href="sample.html" class="btn-ghost">모든 레벨 샘플 보기</a>
    </div>
  </div>
</div>
<!-- TODO: Block C comparison, Block D bridge -->
```

- [ ] **Step 3: Reload browser, verify sample passage card renders**

Expected: card with SATURN label, title, passage placeholder text, explanation, 2 CTAs.

- [ ] **Step 4: Commit**

```bash
git add landing.html
git commit -m "feat(landing): add Section 3 Block B sample passage (with editorial placeholder)"
```

---

## Task 8: Section 3 Block C — Comparison checklist + Block D bridge

**Files:**
- Modify: `landing.html` — append inside `#proof` section

- [ ] **Step 1: Add comparison styles**

```css
.compare-table-wrap { overflow-x:auto; border:1px solid var(--line); border-radius:6px; }
.compare-table {
  width:100%; border-collapse:collapse;
  background:var(--card); min-width:620px;
}
.compare-table th, .compare-table td {
  padding:16px 20px; text-align:left;
  font-size:.9rem; border-bottom:1px solid var(--line);
}
.compare-table th {
  font-family:'Space Grotesk',sans-serif;
  font-size:.72rem; letter-spacing:2px; text-transform:uppercase;
  color:var(--dim); background:rgba(255,255,255,.02);
}
.compare-table th.highlight-col, .compare-table td.highlight-col {
  background:rgba(45,212,191,.06);
  border-left:1px solid var(--line2);
  border-right:1px solid var(--line2);
  color:#fff;
}
.compare-table th.highlight-col { color:var(--accent); }
.compare-table tr:last-child td { border-bottom:none; }

.proof-bridge {
  text-align:center; padding:40px 20px 0;
}
.proof-bridge-text {
  font-size:clamp(1.1rem, 1.8vw, 1.3rem);
  color:#fff; font-weight:700; margin-bottom:10px;
}
.proof-bridge-arrow {
  font-size:.85rem; color:var(--dim); letter-spacing:2px;
}
```

- [ ] **Step 2: Replace `<!-- TODO: Block C ... -->` comment with Block C + D**

```html
<!-- BLOCK C: Comparison checklist -->
<div class="proof-block">
  <div class="proof-block-title">일반 영어 교재와 Terra Nova, 이렇게 다릅니다</div>
  <p class="proof-block-sub">학습 효과 기준의 비교 (비용 비교는 플랜 섹션에서 따로 다룹니다).</p>

  <div class="compare-table-wrap">
    <table class="compare-table">
      <thead>
        <tr>
          <th>항목</th>
          <th>일반 영어 교재</th>
          <th class="highlight-col">Terra Nova</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>지문 주제</td>
          <td>임의 선정</td>
          <td class="highlight-col"><strong>교과 단원과 1:1 매칭</strong></td>
        </tr>
        <tr>
          <td>학습 결과</td>
          <td>영어 실력</td>
          <td class="highlight-col"><strong>영어 + 전과목 배경 지식</strong></td>
        </tr>
        <tr>
          <td>해설 범위</td>
          <td>문제 풀이 중심</td>
          <td class="highlight-col"><strong>배경 지식 연결까지</strong></td>
        </tr>
        <tr>
          <td>시간 효율</td>
          <td>영어 1시간 = 영어 1시간</td>
          <td class="highlight-col"><strong>영어 1시간 = 영어 + 전과목 배경 1시간</strong></td>
        </tr>
        <tr>
          <td>수능 대비</td>
          <td>문제 유형 훈련</td>
          <td class="highlight-col"><strong>유형 + 주제 친숙화</strong></td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

<!-- BLOCK D: Bridge to Section 4 -->
<div class="proof-bridge">
  <div class="proof-bridge-text">왜 교과 연계 독해가 수능에 더 유리한지 — 아래에서 논리로 설명드립니다.</div>
  <div class="proof-bridge-arrow">↓</div>
</div>
```

- [ ] **Step 3: Reload browser, verify comparison table + bridge render**

Expected: 5-row comparison table with Terra Nova column highlighted mint, followed by centered bridge text.

- [ ] **Step 4: Commit**

```bash
git add landing.html
git commit -m "feat(landing): add Section 3 Block C comparison and Block D bridge"
```

---

## Task 9: Section 4 — 설명 (Logic)

**Files:**
- Modify: `landing.html` — append logic section

Spec reference: Section 4.

- [ ] **Step 1: Add logic section styles**

```css
/* SECTION 4 LOGIC */
#logic {
  background:var(--mid);
  border-top:1px solid var(--line);
  background-image:linear-gradient(180deg, rgba(45,212,191,.02), transparent 400px);
}
.logic-grid {
  display:grid; grid-template-columns:repeat(3, 1fr); gap:28px;
  margin-bottom:40px;
}
.logic-card {
  background:var(--card); border:1px solid var(--line);
  border-radius:6px; padding:32px 28px;
}
.logic-num {
  font-family:'Space Grotesk',sans-serif;
  font-size:.72rem; letter-spacing:3px; color:var(--accent);
  margin-bottom:14px;
}
.logic-title {
  font-size:1.12rem; font-weight:900; color:#fff;
  line-height:1.4; margin-bottom:14px;
}
.logic-body {
  font-size:.9rem; color:var(--dim); line-height:1.8;
}
.logic-example {
  margin-top:16px; padding:14px 16px;
  background:rgba(45,212,191,.04);
  border-left:3px solid var(--accent);
  font-size:.85rem; color:var(--dim); font-style:italic;
  line-height:1.75;
}
.vocab-table {
  width:100%; margin-top:14px; border-collapse:collapse;
  font-size:.85rem;
}
.vocab-table td {
  padding:6px 10px; border-bottom:1px solid var(--line);
  color:var(--dim);
}
.vocab-table .ko { color:#fff; font-weight:700; width:45%; }
.vocab-table .en {
  font-family:'Space Grotesk',sans-serif;
  color:var(--accent);
}
.logic-chart-placeholder {
  margin-top:16px; padding:20px;
  background:rgba(255,255,255,.02);
  border:1px dashed var(--line); border-radius:4px;
  font-size:.8rem; color:var(--dim2); text-align:center;
}
.logic-bridge { text-align:center; padding:40px 20px 0; }
@media (max-width:720px) {
  .logic-grid { grid-template-columns:1fr; }
}
```

- [ ] **Step 2: Add logic section HTML after `#proof`**

```html
<section id="logic">
  <div class="sec-wrap">
    <div class="sec-kicker">작동 원리</div>
    <h2 class="sec-h2">수능 영어는 '문법'이 아니라 <br class="mobile-br"><span class="accent-text">'배경지식' 싸움</span>입니다.</h2>
    <p class="sec-sub">학부모 대부분이 놓치는 수능 영어의 실제 작동 원리.</p>

    <div class="logic-grid">
      <div class="logic-card">
        <div class="logic-num">POINT 1</div>
        <div class="logic-title">수능 영어 지문 주제는 <br>학교 교과와 크게 겹칩니다</div>
        <p class="logic-body">최근 수능 영어 지문의 주제 분포를 분석해보면 과학·사회·경제·철학 주제가 다수입니다. 영어 실력만으로는 벽을 넘기 어렵다는 뜻입니다.</p>
        <div class="logic-chart-placeholder">
          <!-- EDITORIAL: insert actual chart using publicly available 수능 주제 분석 data -->
          [차트: 최근 5년 수능 영어 지문 주제 분포 — 교육평가원·EBS 공개 분석 기반]
        </div>
      </div>

      <div class="logic-card">
        <div class="logic-num">POINT 2</div>
        <div class="logic-title">배경지식이 있으면 <br>풀이 속도가 다릅니다</div>
        <p class="logic-body">같은 어휘·구문 난이도라도 주제가 친숙하면 읽기 속도가 다릅니다. 수능 영어는 정답률보다 시간 관리가 승부처입니다.</p>
        <div class="logic-example">
          지수함수를 학교에서 배운 학생이 <em>Compound Interest</em> 지문을 읽을 때 — 개념을 이해하고 있으니 한 번 읽고 문제로 바로 넘어갑니다.
        </div>
      </div>

      <div class="logic-card">
        <div class="logic-num">POINT 3</div>
        <div class="logic-title">이중 학습 효과</div>
        <p class="logic-body">영어 학습 한 시간에 교과 개념의 영어 표현까지 동시에 익힙니다. 수학·과학·사회 수업을 영어로 다시 듣는 경험이 됩니다.</p>
        <table class="vocab-table">
          <tr><td class="ko">지수</td><td class="en">exponential</td></tr>
          <tr><td class="ko">생태계</td><td class="en">ecosystem</td></tr>
          <tr><td class="ko">수요</td><td class="en">demand</td></tr>
          <tr><td class="ko">정체성</td><td class="en">identity</td></tr>
        </table>
      </div>
    </div>

    <div class="logic-bridge">
      <div class="proof-bridge-text">그래서 구독 첫 달, 무엇이 어떻게 달라지는지 — 생활 단위로 보여드립니다.</div>
      <div class="proof-bridge-arrow">↓</div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Reload browser, verify 3 logic cards render**

Expected: 3 cards with POINT 1/2/3 labels, chart placeholder in card 1, example box in card 2, vocab table in card 3, bridge below.

- [ ] **Step 4: Commit**

```bash
git add landing.html
git commit -m "feat(landing): add Section 4 logic (3 points, chart placeholder, vocab table)"
```

---

## Task 10: Section 5 — 변화 (Change)

**Files:**
- Modify: `landing.html` — append change section

Spec reference: Section 5 (with plan-aware Block A revision).

- [ ] **Step 1: Add change section styles**

```css
/* SECTION 5 CHANGE */
#change { background:var(--dark); border-top:1px solid var(--line); }
.change-boxes {
  display:grid; grid-template-columns:repeat(2, 1fr); gap:28px;
  margin-bottom:56px;
}
.change-box {
  background:var(--card); border:1px solid var(--line);
  border-radius:6px; padding:32px 28px;
}
.change-box h4 {
  font-size:1.05rem; font-weight:900; color:#fff;
  margin-bottom:16px; padding-bottom:12px;
  border-bottom:1px solid var(--line);
}
.change-list { list-style:none; }
.change-list li {
  padding:8px 0; font-size:.92rem; color:var(--dim);
  display:flex; align-items:flex-start; gap:10px;
}
.change-list li::before {
  content:attr(data-icon); font-size:1rem; flex-shrink:0;
}
.plan-section {
  margin-top:20px; padding:16px; border:1px solid var(--line2);
  border-radius:4px; background:rgba(45,212,191,.03);
}
.plan-section strong { color:var(--accent); display:block; margin-bottom:6px; font-size:.85rem; letter-spacing:1px; }
.routine-viz {
  display:flex; flex-direction:column; gap:12px;
}
.routine-row {
  display:flex; justify-content:space-between; align-items:center;
  padding:14px 18px; background:rgba(45,212,191,.04);
  border-radius:4px; font-size:.95rem;
}
.routine-row strong { color:var(--accent); }
.routine-compare {
  margin-top:14px; font-size:.82rem; color:var(--dim2);
  padding-top:14px; border-top:1px solid var(--line);
}
.effects-grid {
  display:grid; grid-template-columns:repeat(3, 1fr); gap:20px;
  margin-bottom:48px;
}
.effect-card {
  padding:24px; background:var(--card); border:1px solid var(--line);
  border-radius:6px;
}
.effect-num {
  font-family:'Space Grotesk',sans-serif;
  color:var(--accent); font-size:.72rem; letter-spacing:3px;
  margin-bottom:12px;
}
.effect-title { font-size:1rem; font-weight:900; color:#fff; margin-bottom:10px; line-height:1.4; }
.effect-body { font-size:.88rem; color:var(--dim); line-height:1.75; }
.cycle-table {
  width:100%; border-collapse:collapse;
  background:var(--card); border:1px solid var(--line); border-radius:6px;
  overflow:hidden;
}
.cycle-table th, .cycle-table td {
  padding:14px 18px; text-align:left; font-size:.9rem;
  border-bottom:1px solid var(--line);
}
.cycle-table th {
  font-family:'Space Grotesk',sans-serif;
  color:var(--accent); font-size:.72rem; letter-spacing:2px;
  text-transform:uppercase; background:rgba(45,212,191,.04);
}
.cycle-table tr:last-child td { border-bottom:none; }
@media (max-width:720px) {
  .change-boxes, .effects-grid { grid-template-columns:1fr; }
}
```

- [ ] **Step 2: Add Section 5 full-screen statement stage + change section HTML after `#logic`**

Note the new `#change-statement` stage before `#change` content — second cinematic beat per arsea pattern.

```html
<!-- SECTION 5 STAGE: arsea-style full-screen H2 beat -->
<section id="change-statement" class="stage-statement reveal">
  <div class="stage-inner">
    <div class="stage-kicker">구독 첫 달</div>
    <h2 class="stage-h2">영어 공부한 시간이, <br class="mobile-br"><span class="accent-text">수학·과학 공부한 시간</span>이 됩니다.</h2>
    <p class="stage-sub">구독 첫 달, 하루 한 지문으로 달라지는 공부 구조.</p>
  </div>
</section>

<!-- SECTION 5 CONTENT: delivery + routine + effects + cycle -->
<section id="change">
  <div class="sec-wrap">

    <div class="change-boxes">
      <!-- Block A: plan-aware first delivery -->
      <div class="change-box">
        <h4>📦 이번 달 받으시는 것</h4>
        <ul class="change-list">
          <li data-icon="📋">20지문 × 교과 연계 매칭 리스트</li>
          <li data-icon="✏️">지문별 해설 + 어휘장</li>
          <li data-icon="🗓️">월간 학습 플랜 (하루 1지문 × 5일 × 4주)</li>
        </ul>
        <div class="plan-section">
          <strong>LIGHT</strong>
          📑 PDF 교재 1권 (월 20지문)
        </div>
        <div class="plan-section">
          <strong>STANDARD · PREMIUM</strong>
          📘 실물 교재 1권 + 실전 모의고사 2회 + 단어 암기장 + 시험지 + 배송비 무료
        </div>
        <div class="plan-section">
          <strong>PREMIUM 추가</strong>
          💬 입시뉴스 카톡방 + 카카오톡 질문방 + 해설강의 (준비중)
        </div>
      </div>

      <!-- Block B: routine visualization -->
      <div class="change-box">
        <h4>⏱️ 하루 루틴</h4>
        <div class="routine-viz">
          <div class="routine-row"><span>하루</span><strong>15~20분 · 지문 1편</strong></div>
          <div class="routine-row"><span>주 (월~금)</span><strong>5일 · 주당 5지문</strong></div>
          <div class="routine-row"><span>한 달</span><strong>4주 · 월간 20지문</strong></div>
        </div>
        <div class="routine-compare">
          비교: 영어 학원 왕복 시간 ≈ 주당 5시간 (Terra Nova의 약 10배)
        </div>
      </div>
    </div>

    <!-- Block C: 3 mechanism effects -->
    <div class="proof-block-title" style="margin-top:0;">교재 설계상 필연적으로 발생하는 3가지</div>
    <p class="proof-block-sub">결과 보장이 아니라, 이 교재를 한 달 쓰면 물리적으로 일어나는 일입니다.</p>

    <div class="effects-grid">
      <div class="effect-card">
        <div class="effect-num">EFFECT 1</div>
        <div class="effect-title">주제 친숙도 축적</div>
        <p class="effect-body">학교에서 배우는 수학·과학·사회 주제 20편이 영어 지문으로 다시 노출됩니다. 같은 개념을 두 경로로 만나므로 주제 친숙도가 쌓입니다.</p>
      </div>
      <div class="effect-card">
        <div class="effect-num">EFFECT 2</div>
        <div class="effect-title">이중 어휘 습득</div>
        <p class="effect-body">교과 개념의 영어 표현을 자연스럽게 익힙니다. exponential, ecosystem, demand, identity — 수능 영어 반복 어휘를 교과 개념과 연결해 기억합니다.</p>
      </div>
      <div class="effect-card">
        <div class="effect-num">EFFECT 3</div>
        <div class="effect-title">학습 시간 배분 여유</div>
        <p class="effect-body">영어 학습 1시간이 영어 + 전과목 배경 1시간이 되므로, 기존 영어 학원 시간 일부를 다른 과목에 재배분할 수 있는 여지가 생깁니다.</p>
      </div>
    </div>

    <!-- Block D: monthly cycle -->
    <div class="proof-block-title" style="margin-top:0;">월간 학습 사이클</div>
    <p class="proof-block-sub">주당 5지문, 4주 구성.</p>

    <table class="cycle-table">
      <thead>
        <tr><th>주차</th><th>학습</th><th>결과물</th></tr>
      </thead>
      <tbody>
        <tr><td><strong>Week 1</strong></td><td>5지문 (주제 탐색)</td><td>주차별 어휘 정리</td></tr>
        <tr><td><strong>Week 2</strong></td><td>5지문 (심화 독해)</td><td>주제 연결 맵</td></tr>
        <tr><td><strong>Week 3</strong></td><td>5지문 (수능 유형 적용)</td><td>유형별 풀이 노트</td></tr>
        <tr><td><strong>Week 4</strong></td><td>5지문 + 월간 테스트</td><td>월간 학습 기록</td></tr>
      </tbody>
    </table>
  </div>
</section>
```

- [ ] **Step 3: Reload browser, verify change section renders**

Expected: Two columns (delivery box + routine box), 3 effect cards, 4-row cycle table.

- [ ] **Step 4: Commit**

```bash
git add landing.html
git commit -m "feat(landing): add Section 5 change (plan-aware delivery, routine, effects, cycle)"
```

---

## Task 11: Section 6 — 누가 만듦 (Makers)

**Files:**
- Modify: `landing.html` — append makers section

Spec reference: Section 6 (D-mode: no faces, no names).

- [ ] **Step 1: Add makers section styles**

```css
/* SECTION 6 MAKERS */
#makers { background:var(--mid); border-top:1px solid var(--line); padding:80px 5vw; }
.makers-grid {
  display:grid; grid-template-columns:1fr 2fr; gap:40px;
  margin-top:28px;
}
.makers-credentials {
  background:var(--card); border:1px solid var(--line);
  border-radius:6px; padding:28px 26px;
}
.makers-credentials h4 {
  font-size:.95rem; color:var(--accent);
  font-family:'Space Grotesk',sans-serif;
  letter-spacing:2px; text-transform:uppercase;
  margin-bottom:16px;
}
.makers-credentials ul { list-style:none; }
.makers-credentials li {
  padding:10px 0; font-size:.9rem; color:var(--dim);
  border-bottom:1px dashed var(--line); line-height:1.65;
}
.makers-credentials li:last-child { border-bottom:none; }
.makers-principles {
  display:grid; grid-template-columns:repeat(2, 1fr); gap:18px;
}
.principle-card {
  background:var(--card); border:1px solid var(--line);
  border-radius:6px; padding:22px;
}
.principle-num {
  font-family:'Space Grotesk',sans-serif;
  font-size:.72rem; letter-spacing:2px; color:var(--accent);
  margin-bottom:10px;
}
.principle-title { font-size:1rem; font-weight:900; color:#fff; margin-bottom:10px; }
.principle-body { font-size:.87rem; color:var(--dim); line-height:1.75; }
@media (max-width:720px) {
  .makers-grid { grid-template-columns:1fr; }
  .makers-principles { grid-template-columns:1fr; }
}
```

- [ ] **Step 2: Add makers HTML after `#change`**

```html
<section id="makers">
  <div class="sec-wrap">
    <div class="sec-kicker">제작진</div>
    <h2 class="sec-h2">기획·집필은 <br class="mobile-br">입시 현장에서 왔습니다.</h2>
    <p class="sec-sub">Terra Nova 교재는 현직 입시강사들의 협업으로 매달 제작됩니다.</p>

    <div class="makers-grid">
      <div class="makers-credentials">
        <h4>제작진 구성</h4>
        <ul>
          <li>SKY 출신 영어 전공 · 강남·목동·대치 현직 입시강사</li>
          <li>수능 영어 지도 경력 총합 30년 이상</li>
          <li>모의고사 출제·분석 경험 보유</li>
          <!-- EDITORIAL: include next line only if true -->
          <!-- <li>고교 영어 교과서 집필/검토 경력 포함</li> -->
        </ul>
      </div>

      <div class="makers-principles">
        <div class="principle-card">
          <div class="principle-num">PRINCIPLE 1</div>
          <div class="principle-title">교과 1:1 매칭 원칙</div>
          <p class="principle-body">모든 지문은 해당 레벨 학년의 교과 단원과 1:1로 대응시킵니다. 임의 주제 선정을 하지 않습니다.</p>
        </div>
        <div class="principle-card">
          <div class="principle-num">PRINCIPLE 2</div>
          <div class="principle-title">수능 경향 추적 원칙</div>
          <p class="principle-body">분기별 수능·모의평가 주제 분포를 분석해 다음 호 주제 비중을 조정합니다.</p>
        </div>
        <div class="principle-card">
          <div class="principle-num">PRINCIPLE 3</div>
          <div class="principle-title">이중 해설 원칙</div>
          <p class="principle-body">해설은 문제풀이뿐 아니라 지문의 배경 지식·교과 연결까지 포함합니다.</p>
        </div>
        <div class="principle-card">
          <div class="principle-num">PRINCIPLE 4</div>
          <div class="principle-title">실전 난이도 원칙</div>
          <p class="principle-body">지문 어휘·구문 난이도는 실제 수능 기출 기준선에 맞춰 조정합니다.</p>
        </div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Reload browser, verify makers section**

Expected: Left column credentials ledger, right column 4 principle cards in 2×2 grid.

- [ ] **Step 4: Commit**

```bash
git add landing.html
git commit -m "feat(landing): add Section 6 makers (anonymized credentials + 4 principles)"
```

---

## Task 12: Section 7 Block A+B — Plan cards + LIGHT earlybird banner

**Files:**
- Modify: `landing.html` — append plans section start

Spec reference: Section 7 Blocks A, B.

- [ ] **Step 1: Add plan styles**

```css
/* SECTION 7 PLANS */
#plans { background:var(--dark); border-top:1px solid var(--line); }
.plans-grid {
  display:grid; grid-template-columns:repeat(3, 1fr); gap:20px;
  margin-top:40px; margin-bottom:48px;
}
.plan-card {
  background:var(--card); border:1px solid var(--line);
  border-radius:8px; padding:32px 28px;
  display:flex; flex-direction:column;
  position:relative; overflow:hidden;
}
.plan-card.featured {
  border-color:var(--line2);
  background:linear-gradient(180deg, rgba(45,212,191,.04), var(--card) 60%);
}
.plan-name {
  font-family:'Space Grotesk',sans-serif;
  font-size:.95rem; letter-spacing:3px;
  color:var(--accent); text-transform:uppercase;
  margin-bottom:6px;
}
.plan-target {
  font-size:.78rem; color:var(--dim2); margin-bottom:22px;
  font-weight:500;
}
.plan-price {
  font-family:'Space Grotesk',sans-serif;
  font-size:2.2rem; font-weight:700; color:#fff;
  margin-bottom:4px; line-height:1.2;
}
.plan-price small {
  font-size:.8rem; color:var(--dim); font-weight:500;
  display:inline-block; margin-left:4px;
}
.plan-period { font-size:.8rem; color:var(--dim); margin-bottom:24px; }
.plan-features { list-style:none; margin-bottom:28px; flex:1; }
.plan-features li {
  padding:8px 0; font-size:.88rem; color:var(--dim); line-height:1.65;
  display:flex; align-items:flex-start; gap:10px;
}
.plan-features li::before { content:'✓'; color:var(--accent); flex-shrink:0; font-weight:700; }
.plan-cta {
  display:block; text-align:center;
  padding:14px; border-radius:4px; font-weight:700; font-size:.92rem;
  transition:transform .15s, box-shadow .15s;
}
.plan-cta.primary { background:var(--accent); color:#0A0A0A; }
.plan-cta.primary:hover { transform:translateY(-2px); box-shadow:0 8px 22px rgba(45,212,191,.28); }
.plan-cta.ghost { border:1px solid var(--line2); color:var(--accent); }
.plan-cta.ghost:hover { background:rgba(45,212,191,.08); }

.earlybird-banner {
  background:rgba(45,212,191,.08);
  border:1px solid var(--accent); border-radius:4px;
  padding:14px 16px; margin-bottom:18px;
}
.earlybird-title {
  font-size:.82rem; color:var(--accent); font-weight:700;
  margin-bottom:6px; font-family:'Space Grotesk',sans-serif;
  letter-spacing:1px; text-transform:uppercase;
}
.earlybird-price {
  font-size:1.1rem; color:#fff; font-weight:900; margin-bottom:4px;
}
.earlybird-price strike { color:var(--dim2); font-weight:500; margin-right:6px; }
.earlybird-note { font-size:.75rem; color:var(--dim); line-height:1.55; }
.earlybird-progress {
  margin-top:10px; font-size:.72rem; color:var(--dim);
}

@media (max-width:900px) {
  .plans-grid { grid-template-columns:1fr; }
}
```

- [ ] **Step 2: Add plans section opener + 3 plan cards HTML after `#makers`**

```html
<section id="plans">
  <div class="sec-wrap">
    <div class="sec-kicker">플랜 선택</div>
    <h2 class="sec-h2">첫 구독, <br class="mobile-br">세 가지 플랜에서 고르세요.</h2>
    <p class="sec-sub">월 구독 · 언제든 해지 · 레벨 변경 자유.</p>

    <div class="plans-grid">
      <!-- LIGHT with earlybird -->
      <div class="plan-card">
        <div class="earlybird-banner">
          <div class="earlybird-title">🎯 런칭 멤버십 · 첫 100명 한정</div>
          <div class="earlybird-price">
            <strike>11,900원</strike>
            5,950원 <small style="color:var(--accent);font-weight:700;">(첫 달 50%)</small>
          </div>
          <div class="earlybird-note">둘째 달부터 정상가 11,900원/월로 자동 전환 · 언제든 해지 가능</div>
          <div class="earlybird-progress">현재 <strong id="earlybird-count">0</strong>/100명 모집 시작</div>
        </div>
        <div class="plan-name">LIGHT</div>
        <div class="plan-target">비용 효율 · 자기주도 학습</div>
        <div class="plan-price">11,900원</div>
        <div class="plan-period">/ 월 (정상가)</div>
        <ul class="plan-features">
          <li>PDF 교재 1권 (월 20지문)</li>
          <li>지문별 해설 + 어휘장</li>
          <li>월간 학습 플랜</li>
          <li>언제든 해지 · 레벨 변경</li>
        </ul>
        <a href="order.html?plan=light&ref=earlybird" class="plan-cta primary">LIGHT 얼리버드 시작하기</a>
      </div>

      <!-- STANDARD featured -->
      <div class="plan-card featured">
        <div class="plan-name">STANDARD</div>
        <div class="plan-target">실물 교재 + 시험 준비</div>
        <div class="plan-price">24,900원</div>
        <div class="plan-period">/ 월</div>
        <ul class="plan-features">
          <li>LIGHT 전체 포함</li>
          <li>실물 교재 책 배송</li>
          <li>실전 모의고사 2회</li>
          <li>단어 암기장 + 시험지</li>
          <li>배송비 무료</li>
        </ul>
        <a href="order.html?plan=standard" class="plan-cta primary">STANDARD 구독하기</a>
      </div>

      <!-- PREMIUM -->
      <div class="plan-card">
        <div class="plan-name">PREMIUM</div>
        <div class="plan-target">질문·상담 필요</div>
        <div class="plan-price">58,900원</div>
        <div class="plan-period">/ 월</div>
        <ul class="plan-features">
          <li>STANDARD 전체 포함</li>
          <li>입시뉴스 카톡방</li>
          <li>카카오톡 질문방</li>
          <li>해설강의 (준비중)</li>
        </ul>
        <a href="order.html?plan=premium" class="plan-cta ghost">PREMIUM 구독하기</a>
      </div>
    </div>
    <!-- TODO: comparison table, risk reversal, mid-CTA -->
  </div>
</section>
```

- [ ] **Step 3: Reload browser, verify 3 plan cards render**

Expected: 3 cards side-by-side (desktop) / stacked (mobile). LIGHT has earlybird banner with strike-through. STANDARD has subtle mint gradient.

- [ ] **Step 4: Commit**

```bash
git add landing.html
git commit -m "feat(landing): add Section 7 plan cards (3 plans + LIGHT earlybird banner)"
```

---

## Task 13: Section 7 Block C+D — Comparison table, risk reversal, C-headline caption

**Files:**
- Modify: `landing.html` — append inside `#plans` section

Spec reference: Section 7 Blocks C, D.

- [ ] **Step 1: Add comparison and risk reversal styles**

```css
.plans-compare {
  margin-top:60px; margin-bottom:48px;
}
.plans-compare-title {
  font-size:1.2rem; font-weight:900; color:#fff;
  margin-bottom:14px;
}
.plans-compare-caption {
  margin-top:14px; font-size:.82rem; color:var(--dim2);
  line-height:1.75; font-style:italic;
  padding:14px 18px; border-left:2px solid var(--line2);
  background:rgba(255,255,255,.02);
}
.plans-compare-caption strong { color:var(--accent); font-style:normal; }

.risk-reversal {
  display:grid; grid-template-columns:repeat(4, 1fr); gap:14px;
  margin-top:32px;
}
.risk-item {
  background:var(--card); border:1px solid var(--line);
  border-radius:4px; padding:16px;
  font-size:.85rem; color:var(--dim);
  display:flex; align-items:flex-start; gap:10px; line-height:1.55;
}
.risk-item::before { content:'✓'; color:var(--accent); font-weight:700; flex-shrink:0; font-size:1rem; }
.risk-item strong { color:#fff; }

@media (max-width:900px) {
  .risk-reversal { grid-template-columns:repeat(2, 1fr); }
}
@media (max-width:520px) {
  .risk-reversal { grid-template-columns:1fr; }
}
```

- [ ] **Step 2: Replace `<!-- TODO: comparison table, risk reversal, mid-CTA -->` with Block C + D HTML**

```html
<!-- Block C: cost comparison table -->
<div class="plans-compare">
  <div class="plans-compare-title">학원·인강 vs Terra Nova</div>
  <div class="compare-table-wrap">
    <table class="compare-table">
      <thead>
        <tr>
          <th>비교 항목</th>
          <th>일반 학원</th>
          <th>인터넷 강의</th>
          <th class="highlight-col">Terra Nova</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>월 수업료</td>
          <td>400,000원</td>
          <td>100,000원~</td>
          <td class="highlight-col"><strong>11,900원~</strong></td>
        </tr>
        <tr>
          <td>교재비</td>
          <td>별도</td>
          <td>별도</td>
          <td class="highlight-col"><strong>포함</strong></td>
        </tr>
        <tr>
          <td>교과 연계</td>
          <td>✕</td>
          <td>✕</td>
          <td class="highlight-col"><strong>✓</strong></td>
        </tr>
        <tr>
          <td>해설</td>
          <td>수업 중만</td>
          <td>강의 내만</td>
          <td class="highlight-col"><strong>교재에 포함</strong></td>
        </tr>
        <tr>
          <td>해지 자유도</td>
          <td>학기 단위</td>
          <td>강좌 단위</td>
          <td class="highlight-col"><strong>월 단위</strong></td>
        </tr>
      </tbody>
    </table>
  </div>
  <p class="plans-compare-caption">
    학원비 400,000원은 수도권 고등 영어 입시 학원 평균 기준. 초·중등 학원은 평균 월 25~30만 원대. <br>
    <strong>영어 학원비에 월 40만 원. Terra Nova는 11,900원부터 시작합니다.</strong>
  </p>
</div>

<!-- Block D: risk reversal -->
<div class="plans-compare-title">결제하기 전에 안심하세요</div>
<div class="risk-reversal">
  <div class="risk-item"><span><strong>런칭 멤버 50% 할인</strong><br>LIGHT 첫 달</span></div>
  <div class="risk-item"><span><strong>월 단위 해지 자유</strong><br>위약금 없음</span></div>
  <div class="risk-item"><span><strong>레벨 변경 자유</strong><br>매달 재선택</span></div>
  <div class="risk-item"><span><strong>결제 전 샘플 전문 공개</strong><br>품질 사전 확인</span></div>
</div>
```

- [ ] **Step 3: Reload browser, verify comparison table + caption + 4 risk items**

Expected: comparison table (학원 / 인강 / Terra Nova 컬럼), italic caption below with C-headline in bold, 4 risk items in 4-col grid (desktop).

- [ ] **Step 4: Commit**

```bash
git add landing.html
git commit -m "feat(landing): add Section 7 comparison table, C-headline caption, risk reversal"
```

---

## Task 14: Section 8 — FAQ (3 minimized)

**Files:**
- Modify: `landing.html` — append FAQ section + small JS for accordion

Spec reference: Section 8 (X1 decision: 3 items only).

- [ ] **Step 1: Add FAQ styles**

```css
/* SECTION 8 FAQ */
#faq { background:var(--mid); border-top:1px solid var(--line); }
.faq-list { display:flex; flex-direction:column; gap:12px; max-width:840px; }
.faq-item {
  background:var(--card); border:1px solid var(--line);
  border-radius:6px; overflow:hidden;
}
.faq-question {
  width:100%; text-align:left;
  padding:20px 24px; background:transparent; border:none;
  color:#fff; font-weight:700; font-size:1rem;
  display:flex; justify-content:space-between; align-items:center;
  gap:16px; line-height:1.5;
}
.faq-question::after {
  content:'+'; color:var(--accent);
  font-size:1.4rem; font-weight:400; flex-shrink:0;
  transition:transform .2s;
}
.faq-item.open .faq-question::after { transform:rotate(45deg); }
.faq-answer {
  max-height:0; overflow:hidden;
  transition:max-height .3s ease, padding .3s ease;
  padding:0 24px;
}
.faq-item.open .faq-answer {
  max-height:500px;
  padding:0 24px 22px;
}
.faq-answer p {
  font-size:.92rem; color:var(--dim); line-height:1.8;
}
.faq-answer strong { color:#fff; }
.faq-bottom-link {
  margin-top:24px; text-align:center;
  font-size:.88rem; color:var(--dim);
}
.faq-bottom-link a { color:var(--accent); text-decoration:underline; }
```

- [ ] **Step 2: Add FAQ HTML after `#plans`**

```html
<section id="faq">
  <div class="sec-wrap">
    <div class="sec-kicker">자주 묻는 질문</div>
    <h2 class="sec-h2">결정 전에 확인하시는 3가지</h2>
    <p class="sec-sub">결제 직전에 꼭 확인되면 좋은 내용들입니다.</p>

    <div class="faq-list">
      <div class="faq-item">
        <button class="faq-question" aria-expanded="false">
          환불은 되나요?
        </button>
        <div class="faq-answer">
          <p>
            <strong>환불은 제공하지 않습니다.</strong> 대신 결제 전 샘플 지문 전문을 공개하고, 월 단위 해지가 자유롭습니다.
            구독 중 다음 달 결제 이전에 해지하시면 이후 비용이 발생하지 않습니다.
          </p>
        </div>
      </div>

      <div class="faq-item">
        <button class="faq-question" aria-expanded="false">
          얼리버드 할인은 끝나면 어떻게 되나요?
        </button>
        <div class="faq-answer">
          <p>
            첫 100명 한정 50% 할인은 해당 멤버의 <strong>첫 달</strong>에만 적용됩니다.
            둘째 달부터는 정상가(11,900원/월)로 자동 전환됩니다. 100명 모집 후에는 얼리버드 신규 가입이 중단됩니다.
          </p>
        </div>
      </div>

      <div class="faq-item">
        <button class="faq-question" aria-expanded="false">
          영어 기초가 약한데 가능한가요?
        </button>
        <div class="faq-answer">
          <p>
            <strong>초3부터 고3까지 10단계 레벨</strong>로 나눠 놓았습니다.
            행성 이름(MOON · MERCURY · MARS · VENUS · TERRA · NEPTUNE · URANUS · SATURN · JUPITER · SUN)으로 구분됩니다.
            시작 전 무료 <a href="level_test.html" style="color:var(--accent);text-decoration:underline;">레벨 테스트</a>로 적합한 레벨을 확인하실 수 있습니다.
          </p>
        </div>
      </div>
    </div>

    <div class="faq-bottom-link">
      더 많은 질문 → <a href="faq.html">전체 FAQ 보기</a>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Add accordion JS before `</body>`**

```html
<script>
  // FAQ accordion
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const isOpen = item.classList.contains('open');
      item.classList.toggle('open');
      btn.setAttribute('aria-expanded', !isOpen);
    });
  });
</script>
```

- [ ] **Step 4: Reload browser, verify 3 FAQ items**

Expected: 3 collapsed items. Click each — expands with answer. "+" rotates to "×". Bottom link "전체 FAQ 보기" → faq.html.

- [ ] **Step 5: Commit**

```bash
git add landing.html
git commit -m "feat(landing): add Section 8 FAQ (3 items accordion + bottom link)"
```

---

## Task 15: Section 9 — Final CTA

**Files:**
- Modify: `landing.html` — append final CTA section

Spec reference: Section 9 (subtitle A confirmed).

- [ ] **Step 1: Add final CTA styles**

```css
/* SECTION 9 FINAL CTA */
#final-cta {
  background:
    radial-gradient(ellipse at 50% 30%, rgba(45,212,191,.08) 0%, transparent 70%),
    var(--dark);
  border-top:1px solid var(--line);
  text-align:center; padding:120px 5vw;
}
.final-kicker { margin:0 auto 24px; }
.final-h2 {
  font-family:'Noto Sans KR',sans-serif;
  font-size:clamp(2rem, 5vw, 3.4rem);
  font-weight:900; letter-spacing:-.02em;
  line-height:1.3; color:#fff; margin-bottom:18px;
}
.final-sub {
  font-size:clamp(1rem, 1.6vw, 1.2rem);
  color:var(--dim); margin-bottom:48px;
  font-style:italic;
}
.final-primary {
  display:inline-block;
  padding:22px 48px;
  background:var(--accent); color:#0A0A0A;
  border-radius:6px; font-weight:900;
  font-size:1.1rem; letter-spacing:.5px;
  transition:transform .15s, box-shadow .15s;
  margin-bottom:20px;
}
.final-primary:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(45,212,191,.35); }
.final-primary-sub {
  font-size:.82rem; color:var(--dim); margin-bottom:36px;
  font-family:'Space Grotesk',sans-serif; letter-spacing:1px;
}
.final-secondary {
  display:flex; justify-content:center; gap:16px; flex-wrap:wrap;
  margin-bottom:28px;
}
.final-sec-btn {
  padding:13px 22px; border:1px solid var(--line2);
  color:var(--accent); border-radius:4px;
  font-weight:600; font-size:.88rem;
  transition:background .15s;
}
.final-sec-btn:hover { background:rgba(45,212,191,.08); }
.final-tertiary {
  display:flex; justify-content:center; gap:20px; flex-wrap:wrap;
  margin-bottom:48px;
}
.final-ter-link {
  font-size:.82rem; color:var(--dim); font-weight:500;
  border-bottom:1px dashed var(--line); padding-bottom:2px;
}
.final-ter-link:hover { color:#fff; border-color:var(--accent); }
.final-trust-strip {
  display:flex; justify-content:center; flex-wrap:wrap; gap:24px;
  padding-top:36px; border-top:1px solid var(--line);
  font-size:.82rem; color:var(--dim);
}
.final-trust-item { display:inline-flex; align-items:center; gap:6px; }
.final-trust-item::before { content:'✓'; color:var(--accent); font-weight:700; }
@media (max-width:720px) {
  .final-primary { padding:18px 28px; font-size:1rem; width:100%; max-width:340px; }
  .final-secondary, .final-tertiary { flex-direction:column; align-items:center; }
}
```

- [ ] **Step 2: Add final CTA HTML after `#faq`**

```html
<section id="final-cta">
  <div class="sec-wrap">
    <div class="sec-kicker final-kicker">지금 시작합니다</div>
    <h2 class="final-h2">Terra Nova의 첫 100명, <br class="mobile-br">오늘 당신입니다.</h2>
    <p class="final-sub">샘플을 확인하셨다면, 시작할 시간입니다.</p>

    <a href="order.html?plan=light&ref=earlybird" class="final-primary">
      LIGHT 얼리버드 시작하기 — 첫 달 5,950원
    </a>
    <div class="final-primary-sub">⓵ LIGHT 얼리버드 현재 <strong id="final-earlybird-count">0</strong>/100명 모집 중 · 100명 달성 시 정가 전환</div>

    <div class="final-secondary">
      <a href="order.html?plan=standard" class="final-sec-btn">STANDARD 구독하기 — 24,900원/월</a>
      <a href="order.html?plan=premium" class="final-sec-btn">PREMIUM 구독하기 — 58,900원/월</a>
      <a href="level_test.html" class="final-sec-btn">무료 레벨 테스트 먼저</a>
    </div>

    <div class="final-tertiary">
      <a href="sample.html" class="final-ter-link">무료 샘플 지문 받기</a>
      <a href="faq.html" class="final-ter-link">더 많은 질문</a>
    </div>

    <div class="final-trust-strip">
      <span class="final-trust-item">결제 전 샘플 공개</span>
      <span class="final-trust-item">월 단위 해지 자유</span>
      <span class="final-trust-item">레벨 변경 자유</span>
      <span class="final-trust-item">STANDARD/PREMIUM 배송 무료</span>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Reload browser, verify final CTA**

Expected: centered layout, big primary button with price, secondary row of 3 smaller buttons, tertiary text links, trust strip with 4 checkmarks.

- [ ] **Step 4: Commit**

```bash
git add landing.html
git commit -m "feat(landing): add Section 9 final CTA (primary + secondary + trust strip)"
```

---

## Task 16: Smooth-scroll anchors + CTA wiring verification

**Files:**
- Modify: `landing.html` — verify/fix internal anchor behavior

- [ ] **Step 1: Verify all in-page anchors work**

Test each:
- Hero → `[교과 매칭표 미리보기]` → scrolls to `#proof` ✓
- Hero → `[첫 구독 시작하기]` → scrolls to `#plans` ✓
- `html { scroll-behavior:smooth; }` is set in Task 2 — animation should be smooth

- [ ] **Step 2: Verify all external links point to existing files**

Check each:
- `sample.html` exists ✓
- `level_test.html` exists ✓
- `order.html` exists ✓ (with `?plan=light&ref=earlybird` query — order.html must handle these; verify in order.html)
- `faq.html` exists ✓
- `index.html` exists ✓ (logo click)

- [ ] **Step 3: Optional — if order.html doesn't already read `?plan=` and `?ref=` query params, note as follow-up (not blocking)**

Run: `grep -n "searchParams\|URLSearchParams\|plan=" "c:/Users/user/OneDrive/Desktop/Terra Nova/order.html" | head`
Expected: either existing handling or noted for follow-up.

- [ ] **Step 4: No commit if nothing changed; else commit**

```bash
# only if changes
git add landing.html
git commit -m "fix(landing): smooth-scroll verification + link audit"
```

---

## Task 17: Mobile responsive pass

**Files:**
- Modify: `landing.html` — test at 375px, 480px, 720px widths

- [ ] **Step 1: Open landing.html in browser devtools, simulate 375px iPhone width**

Verify each section:
- Nav: links hidden (already set at `@media (max-width:720px)`)
- Hero: single column, H1 breaks at `<br class="mobile-br">`, visual cards stack vertically, arrow rotates 90deg, buttons full-width
- Empathy: 3 cards stack
- Proof mapping table: horizontal scroll enabled (`.mapping-table-wrap { overflow-x:auto; }`)
- Sample passage: text readable, padding reasonable
- Logic: 3 cards stack
- Change: 2 boxes stack, 3 effect cards stack
- Makers: credentials + principles stack
- Plans: 3 plan cards stack
- Risk reversal: 4 items → 1 column at <520px
- FAQ: full width, accordion works
- Final CTA: primary button full-width (max 340px), secondary buttons stack

- [ ] **Step 2: Fix any overflow/clipping issues**

Common issues to check:
- Long English titles in mapping table clipping
- Price strike-through wrap in earlybird banner
- Hero visual arrow "↔" rotating correctly on mobile

Add fixes if needed:

```css
/* Polish fixes discovered during mobile test */
@media (max-width:520px) {
  .hero-h1 { font-size:2rem; }
  .final-primary { font-size:.92rem; padding:16px 20px; }
  .mapping-table, .compare-table, .cycle-table { font-size:.8rem; }
}
```

- [ ] **Step 3: Verify 480px (small tablet) and 720px (nav breakpoint) also look OK**

- [ ] **Step 4: Commit any polish fixes**

```bash
git add landing.html
git commit -m "fix(landing): mobile responsive polish"
```

---

## Task 18: Accessibility audit

**Files:**
- Modify: `landing.html` — add/verify semantic attributes

- [ ] **Step 1: Verify heading hierarchy is strict H1 → H2 → H3**

Run: `grep -n "<h[1-6]" landing.html`
Expected: Exactly one H1 (in hero). All section titles are H2. Any sub-titles (e.g. sample passage title) are H3.
Fix any H2-after-H3 or missing levels.

- [ ] **Step 2: Verify all interactive elements have accessible names**

Check:
- Logo link: `aria-label="Terra Nova 홈"` ✓ (set in Task 3)
- FAQ buttons: `aria-expanded` attribute updates on click ✓ (set in Task 14)
- All `<a>` and `<button>` have text content or aria-label

- [ ] **Step 3: Verify color contrast — mint `#2DD4BF` on `#0A0A0A` passes WCAG AA**

Open browser devtools → Lighthouse → Accessibility audit.
Expected: score ≥ 90. Fix any contrast issues flagged.

Common fixes:
- If dim text (`--dim rgba(240,240,240,.78)`) too low contrast, bump to `.85`.
- If accent on mint bg has low contrast for body text, use darker backdrop.

- [ ] **Step 4: Verify keyboard navigation**

Tab through page: skip link → nav → hero CTAs → all sections → final CTA. Focus outlines should be visible (mint outline).

- [ ] **Step 5: Commit fixes if any**

```bash
git add landing.html
git commit -m "fix(landing): accessibility polish (headings, focus, contrast)"
```

---

## Task 19: End-to-end smoke test + final commit

**Files:**
- Modify: `landing.html` — final verification pass

- [ ] **Step 1: Full page scroll-through at desktop 1440px**

Verify in order:
1. Nav fixed at top ✓
2. Hero with mockup ✓
3. Empathy 3 cards + bridge ✓
4. Proof mapping table + sample passage + comparison + bridge ✓
5. Logic 3 points ✓
6. Change (delivery, routine, 3 effects, monthly cycle) ✓
7. Makers (credentials + 4 principles) ✓
8. Plans 3 cards + earlybird + comparison + risk reversal ✓
9. FAQ 3 items ✓
10. Final CTA ✓

- [ ] **Step 2: Click every CTA and confirm destinations**

From hero: `#proof`, `#plans`, `sample.html`, `level_test.html`
From plans: 3× `order.html?plan=...`
From final CTA: `order.html?plan=light&ref=earlybird`, STANDARD/PREMIUM variants, `level_test.html`, `sample.html`, `faq.html`
From FAQ bottom: `faq.html`
From logo: `index.html`

- [ ] **Step 3: Run Lighthouse (Performance + SEO + Accessibility)**

Targets:
- Accessibility ≥ 90
- SEO ≥ 90 (meta tags, canonical, OG set)
- Performance ≥ 85 (single-file with embedded CSS should be fast)

- [ ] **Step 4: Spec Success Criteria checklist verification**

Reference: spec Section 9.
- ✅ All 9 sections render correctly at ≥1024px and ≤480px
- ✅ Hero V1 typography mockup, no external textbook imagery
- ✅ CTA hierarchy unambiguous — one primary per section
- ✅ LIGHT earlybird banner shows counter + auto-transition disclosure
- ✅ Section 8 has exactly 3 FAQs
- ✅ Final CTA subtitle: "샘플을 확인하셨다면, 시작할 시간입니다."
- ✅ No fabricated numbers, testimonials, or outcome promises in copy
- ✅ Heading hierarchy + color contrast passes

- [ ] **Step 5: Final commit marking completion**

```bash
git add landing.html
git commit -m "feat(landing): landing.html implementation complete — ready for editorial review"
```

- [ ] **Step 6: Update todo / open items in spec (optional)**

If any editorial placeholders remain visible to end user, note them as known-deferred. Editorial team swaps at launch.

---

## Self-Review Checklist

### Spec coverage
- ✅ Section 1 Hero → Task 4
- ✅ Section 2 Empathy → Task 5
- ✅ Section 3 Proof (Blocks A/B/C/D) → Tasks 6, 7, 8
- ✅ Section 4 Logic → Task 9
- ✅ Section 5 Change (Block A plan-aware) → Task 10
- ✅ Section 6 Makers → Task 11
- ✅ Section 7 Plans + earlybird + comparison + risk reversal → Tasks 12, 13
- ✅ Section 8 FAQ minimized → Task 14
- ✅ Section 9 Final CTA → Task 15
- ✅ Design system tokens → Task 2 (with spec deviation notes)
- ✅ Mobile responsive → Task 17
- ✅ Accessibility → Task 18

### Placeholder scan
- Editorial placeholders (`<!-- EDITORIAL: ... -->`) are intentional, documented in spec Section 10 Open Items. Not plan failures.
- `[N]/100` earlybird counter starts at `0` — server/dynamic update deferred to operations.
- No TODO/TBD/"implement later" in plan tasks.

### Type / name consistency
- Variable tokens: `--mint` / `--accent` / `--dark` / `--mid` / `--card` / `--line` / `--line2` / `--txt` / `--dim` consistent across all tasks.
- Section IDs: `#hero` / `#empathy` / `#proof` / `#logic` / `#change` / `#makers` / `#plans` / `#faq` / `#final-cta` consistent with anchor links from hero CTAs.
- Class naming convention: `.sec-*` for shared helpers, `.{section}-*` for section-scoped.

All consistent. Plan ready for execution.
