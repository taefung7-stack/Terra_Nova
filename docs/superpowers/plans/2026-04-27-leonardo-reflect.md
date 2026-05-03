# Terra Nova × Leonardo.ai Reflection — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build 3 new "leo" pages (`landing-leo.html`, `intro-leo.html`, `index-leo.html`) + a shared design system (`shared-leo.css` + `assets/leo/leo-motion.js`) that reflect leonardo.ai's visual language onto Terra Nova content, per [`docs/superpowers/specs/2026-04-27-leonardo-reflect-design.md`](../specs/2026-04-27-leonardo-reflect-design.md). Originals untouched; rollback is no-op.

**Architecture:** Vanilla HTML/CSS/JS, no build step. New `-leo`-suffixed files coexist with originals. Single CSS file (`shared-leo.css`) owns all leo design tokens + 20 components. Single JS utility (`assets/leo/leo-motion.js`) wraps Lenis (smooth scroll) + IntersectionObserver (scroll reveal). All animations honor `prefers-reduced-motion`.

**Tech Stack:** HTML5 · CSS custom properties · vanilla JS · [Lenis](https://github.com/darkroomengineering/lenis) (smooth scroll, CDN) · IntersectionObserver (scroll reveal) · Three.js + GSAP (intro-leo only, inherited from intro.html) · Google Fonts (Space Grotesk + Noto Sans KR).

---

## Spec Reference

This plan implements [`2026-04-27-leonardo-reflect-design.md`](../specs/2026-04-27-leonardo-reflect-design.md). Section numbers below (e.g., "S2 empathy") refer to that spec.

**Locked decisions** (Section 3 of spec): scope=3 pages, backup=copy-safe, degree=B (Leonardo-Inspired), gallery=planet+textbook mix, intro=reskin only, accent=`#00DF81` single, motion=full + reduced-motion guard, approach=3 (Hybrid Showcase).

**Hard constraints** (Section 2 of spec):
- Original `landing.html` / `intro.html` / `index.html` / `shared.css` git diff = 0 bytes when this plan completes
- No type-selector layout rules in `shared-leo.css` (per CSS gotchas memo)
- All leo CSS uses class selectors only
- `prefers-reduced-motion: reduce` disables Lenis + sets all `--leo-dur-*` to 0ms

---

## File Structure

### Create
- `shared-leo.css` (~1200 lines, design tokens + 20 components)
- `landing-leo.html` (~1400 lines, 11 sections, copy preserved 1:1 from `landing.html`)
- `intro-leo.html` (~1:1 copy of `intro.html`, ~15-25 lines diff)
- `index-leo.html` (~700 lines, 6-section hub)
- `assets/leo/leo-motion.js` (~120 lines: Lenis + IO + reduced-motion)
- `assets/leo/grain.png` (256×256 noise overlay, ~5KB)
- `assets/leo/icons.svg` (inline-able sprite, 6 monoline icons)
- `assets/leo/planets/` (will be populated; Phase A uses existing `*.jpg` directly)
- `assets/leo/textbook-spreads/` (deferred to Phase B; empty in MVP)

### Modify
- `robots.txt` — add 3 `Disallow` lines for leo pages
- `sitemap.html` — exclude leo pages (no changes if leo not currently listed)

### Untouched (verified at end via git diff)
- `landing.html`, `intro.html`, `index.html`, `shared.css`
- All other 27+ HTML pages (faq, market, mypage, etc.)

### Reuse (link only)
- `logo.png`, `manifest.webmanifest`, `og-cover.svg` — referenced in `<head>` meta of leo pages
- Existing planet `.jpg` files (mercury, venus, mars, terra, neptune, uranus, saturn, jupiter, sun, moon)
- Google Fonts (Space Grotesk + Noto Sans KR) — already preconnected in originals
- `site-config.js`, `analytics.js`, `pwa-register.js` — leo pages link `defer` per existing pattern

---

## Phase 1 — Foundation (8 tasks)

### Task 1: Create `assets/leo/` directory + grain + icon sprite

**Files:**
- Create: `assets/leo/grain.png` (256×256 noise PNG, ~5KB)
- Create: `assets/leo/icons.svg` (inline SVG sprite with 6 symbols)
- Create: `assets/leo/planets/.gitkeep` (placeholder; Phase A uses root `*.jpg` directly)
- Create: `assets/leo/textbook-spreads/.gitkeep` (Phase B placeholder)

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p "assets/leo/planets" "assets/leo/textbook-spreads"
touch "assets/leo/planets/.gitkeep" "assets/leo/textbook-spreads/.gitkeep"
```

Expected: directories exist (verify with `ls assets/leo/`).

- [ ] **Step 2: Generate `grain.png` (256×256 monochrome noise)**

Use ImageMagick (already a dependency in many dev setups). If unavailable, generate via Node + canvas in a one-shot script.

```bash
# Option A: ImageMagick
magick -size 256x256 xc: +noise random -channel G -separate -depth 8 PNG24:assets/leo/grain.png

# Option B (if no ImageMagick): tiny Node script
cat > /tmp/grain.js << 'EOF'
const fs=require('fs');const{createCanvas}=require('canvas');
const c=createCanvas(256,256);const ctx=c.getContext('2d');
const id=ctx.createImageData(256,256);
for(let i=0;i<id.data.length;i+=4){const v=Math.random()*255|0;id.data[i]=id.data[i+1]=id.data[i+2]=v;id.data[i+3]=255;}
ctx.putImageData(id,0,0);
fs.writeFileSync('assets/leo/grain.png',c.toBuffer('image/png'));
EOF
node /tmp/grain.js
```

If both fail, manually create any 256×256 grayscale noise PNG and save to `assets/leo/grain.png`. Size <10KB target.

Expected: `assets/leo/grain.png` exists, size 2-10KB.

- [ ] **Step 3: Create `assets/leo/icons.svg` sprite**

```bash
cat > assets/leo/icons.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" style="display:none">
  <symbol id="leo-i-book" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4V4z"/>
    <path d="M4 16a4 4 0 0 1 4-4h12"/>
  </symbol>
  <symbol id="leo-i-planet" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="6"/>
    <ellipse cx="12" cy="12" rx="11" ry="3.5" transform="rotate(-20 12 12)"/>
  </symbol>
  <symbol id="leo-i-calendar" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="5" width="18" height="16" rx="2"/>
    <path d="M8 3v4M16 3v4M3 10h18"/>
  </symbol>
  <symbol id="leo-i-clipboard" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="6" y="4" width="12" height="18" rx="2"/>
    <path d="M9 4h6v3H9z"/>
    <path d="M9 12h6M9 16h4"/>
  </symbol>
  <symbol id="leo-i-message" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 5h16v12H8l-4 4z"/>
  </symbol>
  <symbol id="leo-i-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6"/>
  </symbol>
</svg>
EOF
```

Expected: file is parseable XML (verify with `head -3 assets/leo/icons.svg`).

- [ ] **Step 4: Commit**

```bash
git add assets/leo/
git commit -m "feat(leo): add asset baseline (grain.png + icons sprite + dir structure)"
```

---

### Task 2: `shared-leo.css` — design tokens (`:root` block)

**Files:**
- Create: `shared-leo.css`

- [ ] **Step 1: Create file with header comment**

```css
/*
 * shared-leo.css — Terra Nova × Leonardo.ai Reflection
 * Design tokens + 20 reusable components for leo pages only.
 *
 * SCOPE: linked only by landing-leo.html / intro-leo.html / index-leo.html.
 * NEVER linked by original landing/intro/index/shared.css.
 *
 * RULES:
 *   - Class selectors only. NO type selectors with position/layout
 *     (per CSS gotchas memo: type selector leakage bug 2026-04-22).
 *   - Single accent: --leo-accent #00DF81. Do not introduce other accents.
 *   - All durations honor prefers-reduced-motion via media query at end.
 */
```

- [ ] **Step 2: Append `:root` token block (paste exact contents below)**

Append to `shared-leo.css`:

```css
:root {
  /* Surface */
  --leo-bg:        #07090C;
  --leo-bg-elev:   #0B0E12;
  --leo-surface-1: rgba(255,255,255,.03);
  --leo-surface-2: rgba(255,255,255,.06);
  --leo-surface-3: rgba(255,255,255,.10);
  --leo-line:      rgba(255,255,255,.08);
  --leo-line-hi:   rgba(255,255,255,.16);

  /* Text */
  --leo-txt:       #F2F4F6;
  --leo-txt-dim:   rgba(242,244,246,.62);
  --leo-txt-mute:  rgba(242,244,246,.38);

  /* Accent — single #00DF81 */
  --leo-accent:    #00DF81;
  --leo-accent-lo: rgba(0,223,129,.10);
  --leo-accent-md: rgba(0,223,129,.28);
  --leo-accent-hi: rgba(0,223,129,.55);

  /* Glass */
  --leo-glass-bg:    rgba(20,24,30,.55);
  --leo-glass-blur:  20px;
  --leo-glass-line:  rgba(255,255,255,.10);

  /* Glow */
  --leo-glow-sm: 0 0 20px rgba(0,223,129,.18);
  --leo-glow-md: 0 0 40px rgba(0,223,129,.30);
  --leo-glow-lg: 0 0 80px rgba(0,223,129,.42);

  /* Shadow */
  --leo-shadow-card:  0 8px 32px rgba(0,0,0,.36);
  --leo-shadow-elev:  0 16px 48px rgba(0,0,0,.48);
  --leo-shadow-hover: 0 24px 64px rgba(0,0,0,.55);

  /* Typography */
  --leo-ff-display: 'Space Grotesk', system-ui, sans-serif;
  --leo-ff-body:    'Noto Sans KR', 'Space Grotesk', system-ui, sans-serif;
  --leo-ff-mono:    'JetBrains Mono', 'Space Mono', ui-monospace, monospace;

  --leo-fs-hero:    clamp(2.75rem, 7.2vw, 6.5rem);
  --leo-fs-h1:      clamp(2.25rem, 5vw, 4rem);
  --leo-fs-h2:      clamp(1.75rem, 3.4vw, 2.75rem);
  --leo-fs-h3:      clamp(1.25rem, 2vw, 1.65rem);
  --leo-fs-lead:    clamp(1.05rem, 1.5vw, 1.22rem);
  --leo-fs-body:    1rem;
  --leo-fs-sm:      .875rem;
  --leo-fs-eyebrow: .72rem;

  --leo-tracking-tight: -.025em;
  --leo-tracking-snug:  -.012em;
  --leo-tracking-wide:  .12em;
  --leo-tracking-mega:  .28em;

  --leo-fw-display: 600;
  --leo-fw-body:    400;
  --leo-fw-emph:    500;
  --leo-fw-strong:  700;

  --leo-lh-tight:  1.05;
  --leo-lh-snug:   1.2;
  --leo-lh-body:   1.65;

  /* Spacing (8 base) */
  --leo-s-1: 4px;   --leo-s-2: 8px;   --leo-s-3: 12px;
  --leo-s-4: 16px;  --leo-s-5: 24px;  --leo-s-6: 32px;
  --leo-s-7: 48px;  --leo-s-8: 64px;  --leo-s-9: 96px;
  --leo-s-10: 128px; --leo-s-11: 192px;

  /* Radius */
  --leo-r-sm: 6px;  --leo-r-md: 12px;
  --leo-r-lg: 20px; --leo-r-xl: 28px;
  --leo-r-pill: 999px;

  /* Motion */
  --leo-ease-out:   cubic-bezier(.22, 1, .36, 1);
  --leo-ease-inout: cubic-bezier(.65, 0, .35, 1);
  --leo-ease-soft:  cubic-bezier(.4, 0, .2, 1);

  --leo-dur-fast: 180ms;
  --leo-dur-base: 320ms;
  --leo-dur-slow: 640ms;
  --leo-dur-cine: 1100ms;

  /* Z-index */
  --leo-z-bg: 0; --leo-z-base: 10; --leo-z-nav: 100; --leo-z-modal: 1000;

  /* Container */
  --leo-container: 1280px;
  --leo-container-narrow: 920px;
}

/* Box-sizing reset (scoped to leo pages by being included via shared-leo.css) */
*, *::before, *::after { box-sizing: border-box; }

/* Reduced motion guard */
@media (prefers-reduced-motion: reduce) {
  :root {
    --leo-dur-fast: 0ms;
    --leo-dur-base: 0ms;
    --leo-dur-slow: 0ms;
    --leo-dur-cine: 0ms;
  }
}
```

- [ ] **Step 3: Verify file is valid CSS**

```bash
# Parse check via npx if available, else stylelint, else just file existence
ls -la shared-leo.css
head -5 shared-leo.css
```

Expected: file exists, header comment visible.

- [ ] **Step 4: Commit**

```bash
git add shared-leo.css
git commit -m "feat(leo): add shared-leo.css design tokens (:root block)"
```

---

### Task 3: `shared-leo.css` — global shell components

**Files:**
- Modify: `shared-leo.css` (append)

- [ ] **Step 1: Append shell component styles**

Append to `shared-leo.css`:

```css
/* ============================================================
   GLOBAL SHELL
   ============================================================ */

/* Body baseline (only applied to .leo-body wrappers — type selectors avoided) */
.leo-body {
  margin: 0;
  background: var(--leo-bg);
  color: var(--leo-txt);
  font-family: var(--leo-ff-body);
  font-size: var(--leo-fs-body);
  line-height: var(--leo-lh-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

/* Grain overlay — drop on the body to add micro-noise above content */
.leo-grain {
  position: fixed;
  inset: 0;
  z-index: var(--leo-z-modal);
  pointer-events: none;
  background-image: url('assets/leo/grain.png');
  background-repeat: repeat;
  mix-blend-mode: overlay;
  opacity: .06;
}

/* Container */
.leo-container {
  width: 100%;
  max-width: var(--leo-container);
  margin: 0 auto;
  padding-left: var(--leo-s-5);
  padding-right: var(--leo-s-5);
}
.leo-container--narrow { max-width: var(--leo-container-narrow); }

/* Navigation — sticky translucent bar */
.leo-nav {
  position: sticky;
  top: 0;
  z-index: var(--leo-z-nav);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--leo-s-4) var(--leo-s-6);
  background: rgba(7, 9, 12, .55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--leo-line);
  transition: padding var(--leo-dur-base) var(--leo-ease-soft),
              background var(--leo-dur-base) var(--leo-ease-soft);
}
.leo-nav.is-scrolled {
  padding-top: var(--leo-s-3);
  padding-bottom: var(--leo-s-3);
  background: rgba(7, 9, 12, .82);
}
.leo-nav__brand {
  display: inline-flex;
  align-items: center;
  gap: var(--leo-s-3);
  color: var(--leo-txt);
  text-decoration: none;
  font-family: var(--leo-ff-display);
  font-weight: var(--leo-fw-display);
  letter-spacing: var(--leo-tracking-mega);
  font-size: 1rem;
  text-transform: uppercase;
}
.leo-nav__menu {
  display: flex;
  gap: var(--leo-s-6);
  list-style: none;
  margin: 0;
  padding: 0;
}
.leo-nav__menu a {
  color: var(--leo-txt-dim);
  text-decoration: none;
  font-size: var(--leo-fs-sm);
  letter-spacing: var(--leo-tracking-wide);
  transition: color var(--leo-dur-fast) var(--leo-ease-soft);
}
.leo-nav__menu a:hover { color: var(--leo-accent); }
.leo-nav__cta { /* uses .leo-btn-primary inline */ }

@media (max-width: 720px) {
  .leo-nav__menu { display: none; }
}

/* Footer */
.leo-footer {
  background: var(--leo-bg-elev);
  border-top: 1px solid var(--leo-line);
  padding: var(--leo-s-9) var(--leo-s-6) var(--leo-s-7);
  color: var(--leo-txt-dim);
  font-size: var(--leo-fs-sm);
}
.leo-footer__grid {
  display: grid;
  grid-template-columns: 2fr repeat(3, 1fr);
  gap: var(--leo-s-7);
  max-width: var(--leo-container);
  margin: 0 auto;
}
.leo-footer__col h4 {
  margin: 0 0 var(--leo-s-4);
  color: var(--leo-txt);
  font-family: var(--leo-ff-display);
  font-size: var(--leo-fs-sm);
  letter-spacing: var(--leo-tracking-wide);
  text-transform: uppercase;
}
.leo-footer__col ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--leo-s-3);
}
.leo-footer__col a {
  color: var(--leo-txt-dim);
  text-decoration: none;
  transition: color var(--leo-dur-fast) var(--leo-ease-soft);
}
.leo-footer__col a:hover { color: var(--leo-accent); }
.leo-footer__bottom {
  margin-top: var(--leo-s-7);
  padding-top: var(--leo-s-5);
  border-top: 1px solid var(--leo-line);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--leo-s-5);
  color: var(--leo-txt-mute);
  font-size: .78rem;
  flex-wrap: wrap;
}

@media (max-width: 720px) {
  .leo-footer__grid {
    grid-template-columns: 1fr;
    gap: var(--leo-s-6);
  }
}
```

- [ ] **Step 2: Verify file size grew**

```bash
wc -l shared-leo.css
```

Expected: ~250 lines.

- [ ] **Step 3: Commit**

```bash
git add shared-leo.css
git commit -m "feat(leo): add shell components (grain, nav, footer, container)"
```

---

### Task 4: `shared-leo.css` — typography components

**Files:**
- Modify: `shared-leo.css` (append)

- [ ] **Step 1: Append typography styles**

```css
/* ============================================================
   TYPOGRAPHY
   ============================================================ */

.leo-eyebrow {
  display: inline-block;
  font-family: var(--leo-ff-display);
  font-size: var(--leo-fs-eyebrow);
  font-weight: var(--leo-fw-emph);
  letter-spacing: var(--leo-tracking-wide);
  color: var(--leo-accent);
  text-transform: uppercase;
  margin: 0 0 var(--leo-s-4);
}

.leo-headline-hero {
  font-family: var(--leo-ff-body);
  font-size: var(--leo-fs-hero);
  font-weight: var(--leo-fw-strong);
  letter-spacing: var(--leo-tracking-tight);
  line-height: var(--leo-lh-tight);
  color: var(--leo-txt);
  margin: 0;
}

.leo-headline-h1 {
  font-family: var(--leo-ff-body);
  font-size: var(--leo-fs-h1);
  font-weight: var(--leo-fw-strong);
  letter-spacing: var(--leo-tracking-tight);
  line-height: var(--leo-lh-tight);
  color: var(--leo-txt);
  margin: 0 0 var(--leo-s-5);
}

.leo-headline-h2 {
  font-family: var(--leo-ff-body);
  font-size: var(--leo-fs-h2);
  font-weight: var(--leo-fw-strong);
  letter-spacing: var(--leo-tracking-snug);
  line-height: var(--leo-lh-snug);
  color: var(--leo-txt);
  margin: 0 0 var(--leo-s-4);
}

.leo-headline-h3 {
  font-family: var(--leo-ff-body);
  font-size: var(--leo-fs-h3);
  font-weight: var(--leo-fw-strong);
  letter-spacing: var(--leo-tracking-snug);
  line-height: var(--leo-lh-snug);
  color: var(--leo-txt);
  margin: 0 0 var(--leo-s-3);
}

.leo-lead {
  font-size: var(--leo-fs-lead);
  font-weight: var(--leo-fw-body);
  line-height: var(--leo-lh-body);
  color: var(--leo-txt-dim);
  margin: 0 0 var(--leo-s-6);
  max-width: 60ch;
}

/* Accent text helper — wrap inline span with this for highlight */
.leo-accent-text { color: var(--leo-accent); }
```

- [ ] **Step 2: Commit**

```bash
git add shared-leo.css
git commit -m "feat(leo): add typography components (eyebrow, headline-hero/h1/h2/h3, lead)"
```

---

### Task 5: `shared-leo.css` — buttons

**Files:**
- Modify: `shared-leo.css` (append)

- [ ] **Step 1: Append button styles**

```css
/* ============================================================
   BUTTONS
   ============================================================ */

.leo-btn-primary,
.leo-btn-ghost,
.leo-btn-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--leo-s-2);
  padding: var(--leo-s-4) var(--leo-s-6);
  border-radius: var(--leo-r-md);
  font-family: var(--leo-ff-body);
  font-weight: var(--leo-fw-strong);
  font-size: var(--leo-fs-body);
  letter-spacing: var(--leo-tracking-wide);
  text-decoration: none;
  cursor: pointer;
  border: 1px solid transparent;
  transition: transform var(--leo-dur-fast) var(--leo-ease-out),
              box-shadow var(--leo-dur-base) var(--leo-ease-out),
              background var(--leo-dur-fast) var(--leo-ease-soft),
              color var(--leo-dur-fast) var(--leo-ease-soft),
              border-color var(--leo-dur-fast) var(--leo-ease-soft);
}

.leo-btn-primary {
  background: var(--leo-accent);
  color: #000;
  box-shadow: var(--leo-glow-md);
}
.leo-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--leo-glow-lg);
}
.leo-btn-primary:active { transform: translateY(0); }

.leo-btn-ghost {
  background: transparent;
  color: var(--leo-txt);
  border-color: var(--leo-line-hi);
}
.leo-btn-ghost:hover {
  border-color: var(--leo-accent-hi);
  color: var(--leo-accent);
  box-shadow: var(--leo-glow-sm);
}

.leo-btn-pill {
  border-radius: var(--leo-r-pill);
  padding: var(--leo-s-3) var(--leo-s-5);
  font-size: var(--leo-fs-sm);
  background: var(--leo-glass-bg);
  backdrop-filter: blur(var(--leo-glass-blur));
  -webkit-backdrop-filter: blur(var(--leo-glass-blur));
  color: var(--leo-txt-dim);
  border-color: var(--leo-glass-line);
}
.leo-btn-pill:hover {
  color: var(--leo-accent);
  border-color: var(--leo-accent-md);
  background: var(--leo-accent-lo);
}
```

- [ ] **Step 2: Commit**

```bash
git add shared-leo.css
git commit -m "feat(leo): add button components (primary, ghost, pill)"
```

---

### Task 6: `shared-leo.css` — cards (glass-card, bento-grid, pricing-card)

**Files:**
- Modify: `shared-leo.css` (append)

- [ ] **Step 1: Append card styles**

```css
/* ============================================================
   CARDS
   ============================================================ */

.leo-glass-card {
  background: var(--leo-glass-bg);
  backdrop-filter: blur(var(--leo-glass-blur));
  -webkit-backdrop-filter: blur(var(--leo-glass-blur));
  border: 1px solid var(--leo-glass-line);
  border-radius: var(--leo-r-lg);
  padding: var(--leo-s-6);
  box-shadow: var(--leo-shadow-card);
  transition: transform var(--leo-dur-base) var(--leo-ease-out),
              border-color var(--leo-dur-base) var(--leo-ease-soft),
              box-shadow var(--leo-dur-base) var(--leo-ease-out);
}
.leo-glass-card:hover {
  transform: translateY(-4px);
  border-color: var(--leo-accent-md);
  box-shadow: var(--leo-shadow-hover);
}
.leo-glass-card__icon {
  width: 48px;
  height: 48px;
  color: var(--leo-accent);
  margin-bottom: var(--leo-s-4);
}

/* Fallback for browsers without backdrop-filter */
@supports not (backdrop-filter: blur(20px)) {
  .leo-glass-card { background: rgba(20,24,30,.85); }
}

/* Bento grid */
.leo-bento-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--leo-s-5);
}
.leo-bento-grid > * { grid-column: span 4; }
.leo-bento-grid > .span-6 { grid-column: span 6; }
.leo-bento-grid > .span-8 { grid-column: span 8; }
.leo-bento-grid > .span-12 { grid-column: span 12; }
.leo-bento-grid > .row-span-2 { grid-row: span 2; }

@media (max-width: 720px) {
  .leo-bento-grid { grid-template-columns: 1fr; }
  .leo-bento-grid > *,
  .leo-bento-grid > .span-6,
  .leo-bento-grid > .span-8,
  .leo-bento-grid > .span-12 { grid-column: span 1; }
}

/* Pricing card (variant of glass-card) */
.leo-pricing-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--leo-glass-bg);
  backdrop-filter: blur(var(--leo-glass-blur));
  -webkit-backdrop-filter: blur(var(--leo-glass-blur));
  border: 1px solid var(--leo-glass-line);
  border-radius: var(--leo-r-xl);
  padding: var(--leo-s-7) var(--leo-s-6);
  box-shadow: var(--leo-shadow-card);
  transition: transform var(--leo-dur-base) var(--leo-ease-out),
              box-shadow var(--leo-dur-base) var(--leo-ease-out);
}
.leo-pricing-card[data-featured="true"] {
  border-color: var(--leo-accent-md);
  background-image: linear-gradient(180deg, var(--leo-accent-lo) 0%, transparent 30%);
  transform: translateY(-8px);
  box-shadow: var(--leo-shadow-elev), var(--leo-glow-sm);
}
.leo-pricing-card:hover { transform: translateY(-12px); }
.leo-pricing-card[data-featured="true"]:hover { transform: translateY(-16px); }
.leo-pricing-card__name {
  font-family: var(--leo-ff-display);
  font-size: var(--leo-fs-eyebrow);
  letter-spacing: var(--leo-tracking-wide);
  color: var(--leo-accent);
  text-transform: uppercase;
  margin: 0 0 var(--leo-s-2);
}
.leo-pricing-card__price {
  font-family: var(--leo-ff-body);
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  font-weight: var(--leo-fw-strong);
  letter-spacing: var(--leo-tracking-tight);
  margin: 0 0 var(--leo-s-5);
}
.leo-pricing-card__features {
  list-style: none;
  margin: 0 0 var(--leo-s-6);
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--leo-s-3);
  flex: 1;
}
.leo-pricing-card__features li {
  display: flex;
  align-items: flex-start;
  gap: var(--leo-s-3);
  color: var(--leo-txt-dim);
  font-size: var(--leo-fs-sm);
}
.leo-pricing-card__features li::before {
  content: "✓";
  color: var(--leo-accent);
  font-weight: var(--leo-fw-strong);
  flex-shrink: 0;
}
```

- [ ] **Step 2: Commit**

```bash
git add shared-leo.css
git commit -m "feat(leo): add card components (glass-card, bento-grid, pricing-card)"
```

---

### Task 7: `shared-leo.css` — motion components (marquee, scroll-reveal, gallery-hero, cinema-cta, before-after, accordion)

**Files:**
- Modify: `shared-leo.css` (append)

- [ ] **Step 1: Append motion + signature widget styles**

```css
/* ============================================================
   MOTION / SIGNATURE WIDGETS
   ============================================================ */

/* Scroll reveal — IntersectionObserver toggles .is-visible */
.leo-scroll-reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity var(--leo-dur-cine) var(--leo-ease-out),
              transform var(--leo-dur-cine) var(--leo-ease-out);
}
.leo-scroll-reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}
@media (prefers-reduced-motion: reduce) {
  .leo-scroll-reveal { opacity: 1; transform: none; }
}

/* Marquee — infinite horizontal scroll */
.leo-marquee {
  position: relative;
  overflow: hidden;
  width: 100%;
  mask-image: linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%);
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%);
}
.leo-marquee__track {
  display: flex;
  gap: var(--leo-s-5);
  width: max-content;
  animation: leo-marquee-x 40s linear infinite;
}
.leo-marquee--fast .leo-marquee__track { animation-duration: 28s; }
.leo-marquee:hover .leo-marquee__track { animation-play-state: paused; }
@keyframes leo-marquee-x {
  to { transform: translateX(-50%); }
}
@media (prefers-reduced-motion: reduce) {
  .leo-marquee__track { animation: none; }
}

/* Gallery hero — full-bleed grid backdrop with overlaid text */
.leo-gallery-hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: var(--leo-s-10) 0;
}
.leo-gallery-hero__backdrop {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-auto-rows: 1fr;
  gap: 4px;
  z-index: var(--leo-z-bg);
  filter: brightness(.5) saturate(.85);
}
.leo-gallery-hero__backdrop img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.leo-gallery-hero__vignette {
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    radial-gradient(ellipse at center, transparent 0%, rgba(7,9,12,.8) 80%),
    linear-gradient(180deg, rgba(7,9,12,.4) 0%, var(--leo-bg) 100%);
  pointer-events: none;
}
.leo-gallery-hero__content {
  position: relative;
  z-index: 2;
  width: 100%;
}

/* Cinematic CTA — full-bleed planet backdrop + headline */
.leo-cinema-cta {
  position: relative;
  padding: var(--leo-s-11) var(--leo-s-6);
  overflow: hidden;
  text-align: center;
}
.leo-cinema-cta__planet {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-size: cover;
  background-position: center;
  filter: brightness(.45) saturate(.9);
  animation: leo-cta-zoom 28s var(--leo-ease-out) infinite alternate;
}
@keyframes leo-cta-zoom {
  to { transform: scale(1.05); }
}
@media (prefers-reduced-motion: reduce) {
  .leo-cinema-cta__planet { animation: none; }
}
.leo-cinema-cta__vignette {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: radial-gradient(ellipse at center, transparent 0%, rgba(7,9,12,.85) 70%);
  pointer-events: none;
}
.leo-cinema-cta__content {
  position: relative;
  z-index: 2;
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--leo-s-6);
}
.leo-cinema-cta__buttons {
  display: flex;
  gap: var(--leo-s-4);
  flex-wrap: wrap;
  justify-content: center;
}
.leo-cinema-cta__trust {
  margin-top: var(--leo-s-5);
  font-size: var(--leo-fs-sm);
  color: var(--leo-txt-mute);
  letter-spacing: var(--leo-tracking-wide);
}

/* Before/after split */
.leo-before-after {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: var(--leo-s-5);
  align-items: stretch;
}
.leo-before-after__col {
  background: var(--leo-surface-1);
  border: 1px solid var(--leo-line);
  border-radius: var(--leo-r-lg);
  padding: var(--leo-s-6);
}
.leo-before-after__divider {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.leo-before-after__divider::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(180deg, transparent, var(--leo-accent-md), transparent);
}
.leo-before-after__arrow {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: var(--leo-r-pill);
  background: var(--leo-accent-lo);
  border: 1px solid var(--leo-accent-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--leo-accent);
}

@media (max-width: 720px) {
  .leo-before-after {
    grid-template-columns: 1fr;
  }
  .leo-before-after__divider {
    transform: rotate(90deg);
    height: 60px;
  }
}

/* Accordion (FAQ) */
.leo-accordion__item {
  border-bottom: 1px solid var(--leo-line);
  transition: border-color var(--leo-dur-fast) var(--leo-ease-soft);
}
.leo-accordion__item[open] { border-color: var(--leo-accent-md); }
.leo-accordion__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--leo-s-5) 0;
  cursor: pointer;
  list-style: none;
  font-family: var(--leo-ff-body);
  font-size: var(--leo-fs-h3);
  font-weight: var(--leo-fw-emph);
  color: var(--leo-txt);
  transition: color var(--leo-dur-fast) var(--leo-ease-soft);
}
.leo-accordion__summary::-webkit-details-marker { display: none; }
.leo-accordion__summary::after {
  content: "+";
  font-size: 1.5rem;
  color: var(--leo-txt-dim);
  transition: transform var(--leo-dur-base) var(--leo-ease-out),
              color var(--leo-dur-fast) var(--leo-ease-soft);
}
.leo-accordion__item[open] .leo-accordion__summary { color: var(--leo-accent); }
.leo-accordion__item[open] .leo-accordion__summary::after {
  content: "−";
  color: var(--leo-accent);
}
.leo-accordion__body {
  padding: 0 0 var(--leo-s-5);
  color: var(--leo-txt-dim);
  line-height: var(--leo-lh-body);
}

/* Reusable pulse keyframes (used by scarcity bar / early-bird bar) */
@keyframes leo-pulse {
  0%, 100% { box-shadow: 0 0 0 rgba(0,223,129,0); }
  50%      { box-shadow: var(--leo-glow-sm); }
}
@media (prefers-reduced-motion: reduce) {
  /* Pulse class users should rely on this to be no-op */
}
.leo-pulse { animation: leo-pulse 2.4s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .leo-pulse { animation: none; }
}
```

- [ ] **Step 2: Verify total CSS file size**

```bash
wc -l shared-leo.css
```

Expected: ~900-1100 lines.

- [ ] **Step 3: Commit**

```bash
git add shared-leo.css
git commit -m "feat(leo): add motion components (marquee, scroll-reveal, gallery-hero, cinema-cta, before-after, accordion)"
```

---

### Task 8: `assets/leo/leo-motion.js` — Lenis + IntersectionObserver

**Files:**
- Create: `assets/leo/leo-motion.js`

- [ ] **Step 1: Create file**

```js
/*
 * leo-motion.js — Lenis smooth scroll + IntersectionObserver scroll-reveal
 *
 * Loaded by leo pages (landing-leo / index-leo). NOT loaded by intro-leo
 * (which has its own Lenis instance from intro.html, untouched).
 *
 * Honors prefers-reduced-motion: skips Lenis init, marks all .leo-scroll-reveal
 * elements visible immediately.
 */

(function () {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Lenis smooth scroll (only if motion not reduced and Lenis library present)
  if (!reducedMotion && typeof window.Lenis === 'function') {
    const lenis = new window.Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    window.__leoLenis = lenis;
  }

  // 2. Scroll reveal observer
  const reveals = document.querySelectorAll('.leo-scroll-reveal');
  if (reducedMotion) {
    reveals.forEach((el) => el.classList.add('is-visible'));
  } else if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    // No IO support: show all immediately
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  // 3. Sticky nav condense on scroll
  const nav = document.querySelector('.leo-nav');
  if (nav) {
    let lastY = 0;
    function onScroll() {
      const y = window.scrollY;
      if (y > 8 && lastY <= 8) nav.classList.add('is-scrolled');
      else if (y <= 8 && lastY > 8) nav.classList.remove('is-scrolled');
      lastY = y;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
```

- [ ] **Step 2: Verify file is valid JS**

```bash
node -c assets/leo/leo-motion.js && echo "OK"
```

Expected: prints `OK`.

- [ ] **Step 3: Commit**

```bash
git add assets/leo/leo-motion.js
git commit -m "feat(leo): add leo-motion.js (Lenis + IO scroll-reveal + sticky-nav condense)"
```

---

## Phase 2 — `intro-leo.html` (1 task)

### Task 9: Create `intro-leo.html` as 1:1 copy + minimal reskin

**Files:**
- Create: `intro-leo.html` (copy of `intro.html`)

- [ ] **Step 1: Copy original**

```bash
cp intro.html intro-leo.html
```

- [ ] **Step 2: Add `<link>` to `shared-leo.css` after Google Fonts `<link>`**

Use Edit tool. In `intro-leo.html`, after the line:

```
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@200;300;400;500;700;900&family=Space+Grotesk:wght@300;400;500;600&display=swap" rel="stylesheet">
```

Add new line:

```html
<link rel="stylesheet" href="shared-leo.css">
```

- [ ] **Step 3: Update `:root` variables to use leo tokens**

In `intro-leo.html` `<style>` block, replace the `:root` block contents:

Old:
```css
:root {
  --bg:#0A0A0A;
  --bg2:#080808;
  --txt:#F0F0F0;
  --dim:rgba(240,240,240,.55);
  --dim2:rgba(240,240,240,.32);
  --accent:#2DD4BF;
  --accent-soft:rgba(45,212,191,.12);
  --line:rgba(255,255,255,.08);
}
```

New (replace exactly):
```css
:root {
  --bg: var(--leo-bg);
  --bg2: var(--leo-bg-elev);
  --txt: var(--leo-txt);
  --dim: var(--leo-txt-dim);
  --dim2: var(--leo-txt-mute);
  --accent: var(--leo-accent);
  --accent-soft: var(--leo-accent-lo);
  --line: var(--leo-line);
}
```

- [ ] **Step 4: Update `<meta name="theme-color">`**

Old:
```html
<meta name="theme-color" content="#0A0A0A">
```

New:
```html
<meta name="theme-color" content="#07090C">
```

- [ ] **Step 5: Update `<title>` and `og:url` to differentiate**

Old:
```html
<title>TERRA NOVA — 조각이 모여 하나가 됩니다</title>
```

New:
```html
<title>TERRA NOVA — 조각이 모여 하나가 됩니다 (leo)</title>
```

Old:
```html
<link rel="canonical" href="https://terra-nova.kr/intro.html">
```

New:
```html
<link rel="canonical" href="https://terra-nova.kr/intro-leo.html">
<meta name="robots" content="noindex,nofollow">
```

(Same for `og:url` — change to `intro-leo.html`.)

- [ ] **Step 6: Add `.leo-grain` overlay div as first child of `<body>`**

In `<body>`, before any other content (before `<canvas id="bg">`):

```html
<div class="leo-grain"></div>
```

- [ ] **Step 7: Update SKIP and ENTER buttons**

In the SKIP link line (around line 274 of intro.html):

Old:
```html
<a class="skip-link" href="landing.html">SKIP</a>
```

New:
```html
<a class="skip-link leo-btn-pill" href="landing-leo.html">SKIP</a>
```

In the ENTER button line (around line 332):

Old:
```html
<a class="enter-btn" href="landing.html">Terra Nova 시작하기</a>
```

New:
```html
<a class="enter-btn leo-btn-primary" href="landing-leo.html">Terra Nova 시작하기</a>
```

- [ ] **Step 8: Verify particle morph + scroll engine still work**

Start a local server and open in browser:

```bash
python3 -m http.server 8000 &
SERVER_PID=$!
sleep 1
echo "Open http://localhost:8000/intro-leo.html"
```

Manual checks (or via Playwright MCP `browser_navigate`):
- Three.js canvas loads (no console errors)
- SKIP button visible top-left with leo pill style
- Enter button at end has leo primary glow
- Scroll progresses through fragment morph
- Particles converge into final state
- Click ENTER → navigates to `landing-leo.html` (404 expected; that's normal — it's built later)

```bash
kill $SERVER_PID 2>/dev/null
```

- [ ] **Step 9: Verify intro.html ORIGINAL is untouched**

```bash
git diff intro.html
```

Expected: no output (zero diff).

- [ ] **Step 10: Commit**

```bash
git add intro-leo.html
git commit -m "feat(leo): add intro-leo.html (outer reskin, particle morph preserved)"
```

---

## Phase 3 — `index-leo.html` (5 tasks)

### Task 10: Create `index-leo.html` skeleton + Sticky Nav (S1)

**Files:**
- Create: `index-leo.html`

- [ ] **Step 1: Create skeleton**

```html
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TERRA NOVA ENGLISH — 수능영어 + 전과목 동시 학습 (leo)</title>
<meta name="description" content="교과 연계 독해로 영어 + 전과목을 동시에. 월 11,900원부터.">
<meta name="robots" content="noindex,nofollow">
<link rel="canonical" href="https://terra-nova.kr/index-leo.html">
<meta name="theme-color" content="#07090C">

<link rel="manifest" href="./manifest.webmanifest">
<link rel="apple-touch-icon" href="./logo.png">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="shared-leo.css">

<script src="https://unpkg.com/@studio-freight/lenis@1.0.42/dist/lenis.min.js" defer></script>
<script src="assets/leo/leo-motion.js" defer></script>
</head>
<body class="leo-body">
<div class="leo-grain"></div>

<!-- ========== S1 · Sticky Nav ========== -->
<nav class="leo-nav" aria-label="primary">
  <a class="leo-nav__brand" href="index-leo.html">TERRA NOVA</a>
  <ul class="leo-nav__menu">
    <li><a href="#what">소개</a></li>
    <li><a href="#levels">레벨</a></li>
    <li><a href="#plans">구독</a></li>
    <li><a href="sample.html">샘플</a></li>
    <li><a href="login.html">로그인</a></li>
  </ul>
  <a class="leo-btn-primary leo-nav__cta" href="#plans">구독 시작</a>
</nav>

<main>
<!-- sections added in tasks below -->
</main>

</body>
</html>
```

- [ ] **Step 2: Verify in browser**

```bash
python3 -m http.server 8000 &
sleep 1
echo "Open http://localhost:8000/index-leo.html"
# Manual: nav appears, sticky on scroll-not-yet-possible-without-content; brand + menu + CTA visible
```

- [ ] **Step 3: Commit**

```bash
git add index-leo.html
git commit -m "feat(leo): add index-leo.html skeleton + sticky nav (S1)"
```

---

### Task 11: index-leo S2 — Cinematic gallery hero

**Files:**
- Modify: `index-leo.html`

- [ ] **Step 1: Insert hero section inside `<main>`**

Replace the comment `<!-- sections added in tasks below -->` with:

```html
<!-- ========== S2 · Cinematic Gallery Hero ========== -->
<section class="leo-gallery-hero">
  <div class="leo-gallery-hero__backdrop" aria-hidden="true">
    <img src="moon.jpg" alt="" loading="eager">
    <img src="mercury.jpg" alt="" loading="eager">
    <img src="mars.jpg" alt="" loading="eager">
    <img src="jupiter.jpg" alt="" loading="eager">
    <img src="saturn.jpg" alt="" loading="eager">
    <img src="neptune.jpg" alt="" loading="eager">
    <img src="mars.jpg" alt="" loading="lazy">
    <img src="moon.jpg" alt="" loading="lazy">
    <img src="jupiter.jpg" alt="" loading="lazy">
    <img src="saturn.jpg" alt="" loading="lazy">
    <img src="mercury.jpg" alt="" loading="lazy">
    <img src="neptune.jpg" alt="" loading="lazy">
    <img src="moon.jpg" alt="" loading="lazy">
    <img src="mars.jpg" alt="" loading="lazy">
    <img src="jupiter.jpg" alt="" loading="lazy">
    <img src="saturn.jpg" alt="" loading="lazy">
    <img src="mercury.jpg" alt="" loading="lazy">
    <img src="neptune.jpg" alt="" loading="lazy">
  </div>
  <div class="leo-gallery-hero__vignette"></div>
  <div class="leo-gallery-hero__content">
    <div class="leo-container">
      <div class="leo-scroll-reveal">
        <p class="leo-eyebrow">수능영어 + 전과목 동시 학습</p>
        <h1 class="leo-headline-hero">
          TERRA NOVA<br>
          <span class="leo-accent-text">ENGLISH</span>
        </h1>
        <p class="leo-lead">
          영어 한 지문에 수학·과학·사회의 한 단원이 들어 있습니다.<br>
          월 11,900원부터, 매달 한 권씩 도착합니다.
        </p>
        <div class="leo-cinema-cta__buttons">
          <a class="leo-btn-primary" href="#plans">구독 시작</a>
          <a class="leo-btn-ghost" href="sample.html">샘플 무료로 받기</a>
        </div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Verify**

```bash
python3 -m http.server 8000 &
sleep 1
echo "Open http://localhost:8000/index-leo.html — hero should fill viewport with planet grid + vignette + headline + dual CTA"
```

- [ ] **Step 3: Commit**

```bash
git add index-leo.html
git commit -m "feat(leo): index-leo S2 cinematic gallery hero with planet backdrop"
```

---

### Task 12: index-leo S3 — "What you get" bento (4-up)

**Files:**
- Modify: `index-leo.html`

- [ ] **Step 1: Append bento section after S2**

```html
<!-- ========== S3 · What You Get Bento ========== -->
<section id="what" style="padding: var(--leo-s-11) 0;">
  <div class="leo-container">
    <div class="leo-scroll-reveal" style="text-align:center; margin-bottom: var(--leo-s-9);">
      <p class="leo-eyebrow">무엇을 받는가</p>
      <h2 class="leo-headline-h1">매달, 한 권의 우주.</h2>
      <p class="leo-lead" style="margin-left:auto; margin-right:auto;">교재만이 아닙니다. 단어장·시험지·해설까지 한 박스에.</p>
    </div>

    <div class="leo-bento-grid">

      <article class="leo-glass-card span-8 leo-scroll-reveal">
        <svg class="leo-glass-card__icon"><use href="assets/leo/icons.svg#leo-i-book"/></svg>
        <h3 class="leo-headline-h3">매달 1권의 교재</h3>
        <p style="color: var(--leo-txt-dim);">20지문, 교과 연계 독해. 한 달 안에 끝낼 수 있는 분량.</p>
      </article>

      <article class="leo-glass-card span-4 leo-scroll-reveal">
        <svg class="leo-glass-card__icon"><use href="assets/leo/icons.svg#leo-i-planet"/></svg>
        <h3 class="leo-headline-h3">10단계 레벨</h3>
        <p style="color: var(--leo-txt-dim);">초3~고3, 행성 이름으로 표시.</p>
      </article>

      <article class="leo-glass-card span-4 leo-scroll-reveal">
        <svg class="leo-glass-card__icon"><use href="assets/leo/icons.svg#leo-i-clipboard"/></svg>
        <h3 class="leo-headline-h3">부가 자료</h3>
        <p style="color: var(--leo-txt-dim);">단어장, 시험지, 모의고사. (STANDARD 이상)</p>
      </article>

      <article class="leo-glass-card span-8 leo-scroll-reveal">
        <svg class="leo-glass-card__icon"><use href="assets/leo/icons.svg#leo-i-arrow"/></svg>
        <h3 class="leo-headline-h3">샘플은 무료</h3>
        <p style="color: var(--leo-txt-dim); margin-bottom: var(--leo-s-5);">말보다 한 장이 더 정직합니다. 결정 전 직접 읽어보세요.</p>
        <a class="leo-btn-ghost" href="sample.html">샘플 받기</a>
      </article>

    </div>
  </div>
</section>
```

- [ ] **Step 2: Verify**

Open in browser; 4 glass-cards appear in 8+4 / 4+8 asymmetric grid; cards lift on hover; icons render in green.

- [ ] **Step 3: Commit**

```bash
git add index-leo.html
git commit -m "feat(leo): index-leo S3 bento grid (4-up: book/planet/clipboard/sample)"
```

---

### Task 13: index-leo S4 — Planet level marquee

**Files:**
- Modify: `index-leo.html`

- [ ] **Step 1: Append marquee section**

```html
<!-- ========== S4 · Planet Level Marquee ========== -->
<section id="levels" style="padding: var(--leo-s-10) 0;">
  <div class="leo-container">
    <div class="leo-scroll-reveal" style="text-align:center; margin-bottom: var(--leo-s-7);">
      <p class="leo-eyebrow">10 단계 · 행성 이름</p>
      <h2 class="leo-headline-h2">1 레벨 = 1 학년</h2>
    </div>
  </div>
  <div class="leo-marquee">
    <div class="leo-marquee__track">
      <!-- First copy -->
      <a class="leo-glass-card" href="sample.html" style="min-width:240px; text-decoration:none;">
        <img src="moon.jpg" alt="MOON" style="width:100%; aspect-ratio:1; border-radius:var(--leo-r-md); object-fit:cover; margin-bottom:var(--leo-s-3);">
        <p class="leo-eyebrow" style="margin:0;">01 · MOON</p>
        <p style="color:var(--leo-txt-dim); font-size:var(--leo-fs-sm); margin:0;">초3</p>
      </a>
      <a class="leo-glass-card" href="sample.html" style="min-width:240px; text-decoration:none;">
        <img src="mercury.jpg" alt="MERCURY" style="width:100%; aspect-ratio:1; border-radius:var(--leo-r-md); object-fit:cover; margin-bottom:var(--leo-s-3);">
        <p class="leo-eyebrow" style="margin:0;">02 · MERCURY</p>
        <p style="color:var(--leo-txt-dim); font-size:var(--leo-fs-sm); margin:0;">초4</p>
      </a>
      <a class="leo-glass-card" href="sample.html" style="min-width:240px; text-decoration:none;">
        <img src="mars.jpg" alt="MARS" style="width:100%; aspect-ratio:1; border-radius:var(--leo-r-md); object-fit:cover; margin-bottom:var(--leo-s-3);">
        <p class="leo-eyebrow" style="margin:0;">03 · MARS</p>
        <p style="color:var(--leo-txt-dim); font-size:var(--leo-fs-sm); margin:0;">초5</p>
      </a>
      <a class="leo-glass-card" href="sample.html" style="min-width:240px; text-decoration:none;">
        <img src="moon.jpg" alt="VENUS placeholder" style="width:100%; aspect-ratio:1; border-radius:var(--leo-r-md); object-fit:cover; margin-bottom:var(--leo-s-3); filter:hue-rotate(45deg);">
        <p class="leo-eyebrow" style="margin:0;">04 · VENUS</p>
        <p style="color:var(--leo-txt-dim); font-size:var(--leo-fs-sm); margin:0;">초6</p>
      </a>
      <a class="leo-glass-card" href="sample.html" style="min-width:240px; text-decoration:none;">
        <img src="mars.jpg" alt="TERRA placeholder" style="width:100%; aspect-ratio:1; border-radius:var(--leo-r-md); object-fit:cover; margin-bottom:var(--leo-s-3); filter:hue-rotate(120deg);">
        <p class="leo-eyebrow" style="margin:0;">05 · TERRA</p>
        <p style="color:var(--leo-txt-dim); font-size:var(--leo-fs-sm); margin:0;">중1</p>
      </a>
      <a class="leo-glass-card" href="sample.html" style="min-width:240px; text-decoration:none;">
        <img src="neptune.jpg" alt="NEPTUNE" style="width:100%; aspect-ratio:1; border-radius:var(--leo-r-md); object-fit:cover; margin-bottom:var(--leo-s-3);">
        <p class="leo-eyebrow" style="margin:0;">06 · NEPTUNE</p>
        <p style="color:var(--leo-txt-dim); font-size:var(--leo-fs-sm); margin:0;">중2</p>
      </a>
      <a class="leo-glass-card" href="sample.html" style="min-width:240px; text-decoration:none;">
        <img src="neptune.jpg" alt="URANUS placeholder" style="width:100%; aspect-ratio:1; border-radius:var(--leo-r-md); object-fit:cover; margin-bottom:var(--leo-s-3); filter:hue-rotate(220deg);">
        <p class="leo-eyebrow" style="margin:0;">07 · URANUS</p>
        <p style="color:var(--leo-txt-dim); font-size:var(--leo-fs-sm); margin:0;">중3</p>
      </a>
      <a class="leo-glass-card" href="sample.html" style="min-width:240px; text-decoration:none;">
        <img src="saturn.jpg" alt="SATURN" style="width:100%; aspect-ratio:1; border-radius:var(--leo-r-md); object-fit:cover; margin-bottom:var(--leo-s-3);">
        <p class="leo-eyebrow" style="margin:0;">08 · SATURN</p>
        <p style="color:var(--leo-txt-dim); font-size:var(--leo-fs-sm); margin:0;">고1</p>
      </a>
      <a class="leo-glass-card" href="sample.html" style="min-width:240px; text-decoration:none;">
        <img src="jupiter.jpg" alt="JUPITER" style="width:100%; aspect-ratio:1; border-radius:var(--leo-r-md); object-fit:cover; margin-bottom:var(--leo-s-3);">
        <p class="leo-eyebrow" style="margin:0;">09 · JUPITER</p>
        <p style="color:var(--leo-txt-dim); font-size:var(--leo-fs-sm); margin:0;">고2</p>
      </a>
      <a class="leo-glass-card" href="sample.html" style="min-width:240px; text-decoration:none;">
        <img src="jupiter.jpg" alt="SUN placeholder" style="width:100%; aspect-ratio:1; border-radius:var(--leo-r-md); object-fit:cover; margin-bottom:var(--leo-s-3); filter:hue-rotate(45deg) brightness(1.2);">
        <p class="leo-eyebrow" style="margin:0;">10 · SUN</p>
        <p style="color:var(--leo-txt-dim); font-size:var(--leo-fs-sm); margin:0;">고3</p>
      </a>
      <!-- Second copy (duplicate above 10 cards verbatim for seamless loop) -->
      <a class="leo-glass-card" href="sample.html" style="min-width:240px; text-decoration:none;" aria-hidden="true">
        <img src="moon.jpg" alt="" style="width:100%; aspect-ratio:1; border-radius:var(--leo-r-md); object-fit:cover; margin-bottom:var(--leo-s-3);">
        <p class="leo-eyebrow" style="margin:0;">01 · MOON</p>
        <p style="color:var(--leo-txt-dim); font-size:var(--leo-fs-sm); margin:0;">초3</p>
      </a>
      <a class="leo-glass-card" href="sample.html" style="min-width:240px; text-decoration:none;" aria-hidden="true">
        <img src="mercury.jpg" alt="" style="width:100%; aspect-ratio:1; border-radius:var(--leo-r-md); object-fit:cover; margin-bottom:var(--leo-s-3);">
        <p class="leo-eyebrow" style="margin:0;">02 · MERCURY</p>
        <p style="color:var(--leo-txt-dim); font-size:var(--leo-fs-sm); margin:0;">초4</p>
      </a>
      <a class="leo-glass-card" href="sample.html" style="min-width:240px; text-decoration:none;" aria-hidden="true">
        <img src="mars.jpg" alt="" style="width:100%; aspect-ratio:1; border-radius:var(--leo-r-md); object-fit:cover; margin-bottom:var(--leo-s-3);">
        <p class="leo-eyebrow" style="margin:0;">03 · MARS</p>
        <p style="color:var(--leo-txt-dim); font-size:var(--leo-fs-sm); margin:0;">초5</p>
      </a>
      <a class="leo-glass-card" href="sample.html" style="min-width:240px; text-decoration:none;" aria-hidden="true">
        <img src="moon.jpg" alt="" style="width:100%; aspect-ratio:1; border-radius:var(--leo-r-md); object-fit:cover; margin-bottom:var(--leo-s-3); filter:hue-rotate(45deg);">
        <p class="leo-eyebrow" style="margin:0;">04 · VENUS</p>
        <p style="color:var(--leo-txt-dim); font-size:var(--leo-fs-sm); margin:0;">초6</p>
      </a>
      <a class="leo-glass-card" href="sample.html" style="min-width:240px; text-decoration:none;" aria-hidden="true">
        <img src="mars.jpg" alt="" style="width:100%; aspect-ratio:1; border-radius:var(--leo-r-md); object-fit:cover; margin-bottom:var(--leo-s-3); filter:hue-rotate(120deg);">
        <p class="leo-eyebrow" style="margin:0;">05 · TERRA</p>
        <p style="color:var(--leo-txt-dim); font-size:var(--leo-fs-sm); margin:0;">중1</p>
      </a>
      <a class="leo-glass-card" href="sample.html" style="min-width:240px; text-decoration:none;" aria-hidden="true">
        <img src="neptune.jpg" alt="" style="width:100%; aspect-ratio:1; border-radius:var(--leo-r-md); object-fit:cover; margin-bottom:var(--leo-s-3);">
        <p class="leo-eyebrow" style="margin:0;">06 · NEPTUNE</p>
        <p style="color:var(--leo-txt-dim); font-size:var(--leo-fs-sm); margin:0;">중2</p>
      </a>
      <a class="leo-glass-card" href="sample.html" style="min-width:240px; text-decoration:none;" aria-hidden="true">
        <img src="neptune.jpg" alt="" style="width:100%; aspect-ratio:1; border-radius:var(--leo-r-md); object-fit:cover; margin-bottom:var(--leo-s-3); filter:hue-rotate(220deg);">
        <p class="leo-eyebrow" style="margin:0;">07 · URANUS</p>
        <p style="color:var(--leo-txt-dim); font-size:var(--leo-fs-sm); margin:0;">중3</p>
      </a>
      <a class="leo-glass-card" href="sample.html" style="min-width:240px; text-decoration:none;" aria-hidden="true">
        <img src="saturn.jpg" alt="" style="width:100%; aspect-ratio:1; border-radius:var(--leo-r-md); object-fit:cover; margin-bottom:var(--leo-s-3);">
        <p class="leo-eyebrow" style="margin:0;">08 · SATURN</p>
        <p style="color:var(--leo-txt-dim); font-size:var(--leo-fs-sm); margin:0;">고1</p>
      </a>
      <a class="leo-glass-card" href="sample.html" style="min-width:240px; text-decoration:none;" aria-hidden="true">
        <img src="jupiter.jpg" alt="" style="width:100%; aspect-ratio:1; border-radius:var(--leo-r-md); object-fit:cover; margin-bottom:var(--leo-s-3);">
        <p class="leo-eyebrow" style="margin:0;">09 · JUPITER</p>
        <p style="color:var(--leo-txt-dim); font-size:var(--leo-fs-sm); margin:0;">고2</p>
      </a>
      <a class="leo-glass-card" href="sample.html" style="min-width:240px; text-decoration:none;" aria-hidden="true">
        <img src="jupiter.jpg" alt="" style="width:100%; aspect-ratio:1; border-radius:var(--leo-r-md); object-fit:cover; margin-bottom:var(--leo-s-3); filter:hue-rotate(45deg) brightness(1.2);">
        <p class="leo-eyebrow" style="margin:0;">10 · SUN</p>
        <p style="color:var(--leo-txt-dim); font-size:var(--leo-fs-sm); margin:0;">고3</p>
      </a>
    </div>
  </div>
</section>
```

> Note: VENUS/TERRA/URANUS/SUN don't have dedicated `*.jpg` files in repo root — the placeholders use other planet images with hue-rotate filter for now. If true planet images get added later, swap the `src` paths.

- [ ] **Step 2: Verify marquee animation**

Open in browser: cards scroll right-to-left at ~40s/cycle; hovering pauses; mask fades both edges.

- [ ] **Step 3: Commit**

```bash
git add index-leo.html
git commit -m "feat(leo): index-leo S4 planet level marquee (10 levels, hue-rotate placeholders)"
```

---

### Task 14: index-leo S5 + S6 — Plan summary cards + Final CTA + Footer

**Files:**
- Modify: `index-leo.html`

- [ ] **Step 1: Append plans + cta + footer**

```html
<!-- ========== S5 · Plan Summary 3-Card ========== -->
<section id="plans" style="padding: var(--leo-s-11) 0;">
  <div class="leo-container">
    <div class="leo-scroll-reveal" style="text-align:center; margin-bottom: var(--leo-s-9);">
      <p class="leo-eyebrow">구독 플랜</p>
      <h2 class="leo-headline-h1">시작은 가볍게,<br>몰입은 깊게.</h2>
    </div>

    <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap: var(--leo-s-5); max-width: 1100px; margin: 0 auto;">

      <article class="leo-pricing-card leo-scroll-reveal">
        <p class="leo-pricing-card__name">LIGHT</p>
        <p class="leo-pricing-card__price">11,900원<span style="font-size:1rem; color:var(--leo-txt-mute); font-weight:400;">/월</span></p>
        <ul class="leo-pricing-card__features">
          <li>PDF 교재</li>
          <li>월 1권 · 20지문</li>
          <li>언제든 해지</li>
        </ul>
        <a class="leo-btn-ghost" href="landing-leo.html#plans">자세히 보기</a>
      </article>

      <article class="leo-pricing-card leo-scroll-reveal" data-featured="true">
        <p class="leo-pricing-card__name">STANDARD · 추천</p>
        <p class="leo-pricing-card__price">24,900원<span style="font-size:1rem; color:var(--leo-txt-mute); font-weight:400;">/월</span></p>
        <ul class="leo-pricing-card__features">
          <li>PDF + 실물 책 배송</li>
          <li>실전 모의고사 2회</li>
          <li>단어 암기장 + 시험지</li>
          <li>배송비 무료</li>
        </ul>
        <a class="leo-btn-primary" href="landing-leo.html#plans">자세히 보기</a>
      </article>

      <article class="leo-pricing-card leo-scroll-reveal">
        <p class="leo-pricing-card__name">PREMIUM</p>
        <p class="leo-pricing-card__price">58,900원<span style="font-size:1rem; color:var(--leo-txt-mute); font-weight:400;">/월</span></p>
        <ul class="leo-pricing-card__features">
          <li>STANDARD 모두 포함</li>
          <li>입시뉴스 카톡방</li>
          <li>카카오 질문방 + 해설강의 (준비중)</li>
        </ul>
        <a class="leo-btn-ghost" href="landing-leo.html#plans">자세히 보기</a>
      </article>

    </div>

    <p style="text-align:center; margin-top: var(--leo-s-7); color: var(--leo-accent); font-size: var(--leo-fs-sm); letter-spacing: var(--leo-tracking-wide);">
      LIGHT 플랜 첫 100명 얼리버드 모집 중 — 마감 시 정가 전환
    </p>

    <p style="text-align:center; margin-top: var(--leo-s-5);">
      <a class="leo-btn-ghost" href="landing-leo.html#plans">전체 비교 보기</a>
    </p>
  </div>
</section>

<!-- ========== S6 · Cinematic Final CTA ========== -->
<section class="leo-cinema-cta">
  <div class="leo-cinema-cta__planet" style="background-image:url('jupiter.jpg');"></div>
  <div class="leo-cinema-cta__vignette"></div>
  <div class="leo-cinema-cta__content leo-scroll-reveal">
    <p class="leo-eyebrow">START NOW</p>
    <h2 class="leo-headline-hero">매달, 한 번의 결심.</h2>
    <p class="leo-lead" style="text-align:center; margin: 0 auto;">한 달 안에 결정하세요. 맞지 않으면 다음 달 해지하면 됩니다.</p>
    <div class="leo-cinema-cta__buttons">
      <a class="leo-btn-primary" href="#plans">지금 시작</a>
      <a class="leo-btn-ghost" href="sample.html">샘플 받기</a>
    </div>
    <p class="leo-cinema-cta__trust">언제든 해지 · 레벨 변경 · 환불 보장</p>
  </div>
</section>

<!-- ========== Footer ========== -->
<footer class="leo-footer">
  <div class="leo-footer__grid">
    <div class="leo-footer__col">
      <a href="index-leo.html" class="leo-nav__brand">TERRA NOVA</a>
      <p style="margin: var(--leo-s-4) 0 0; font-size:var(--leo-fs-sm);">매달 한 권의 교과 연계 영어 학습지.</p>
    </div>
    <div class="leo-footer__col">
      <h4>학습</h4>
      <ul>
        <li><a href="sample.html">샘플</a></li>
        <li><a href="level_test.html">레벨 테스트</a></li>
        <li><a href="market.html">스토어</a></li>
        <li><a href="landing-leo.html">자세히 보기</a></li>
      </ul>
    </div>
    <div class="leo-footer__col">
      <h4>회사</h4>
      <ul>
        <li><a href="faq.html">FAQ</a></li>
        <li><a href="terms.html">이용약관</a></li>
        <li><a href="privacy.html">개인정보처리방침</a></li>
        <li><a href="refund.html">환불정책</a></li>
      </ul>
    </div>
    <div class="leo-footer__col">
      <h4>연락</h4>
      <ul>
        <li><a href="mailto:hello@terra-nova.kr">hello@terra-nova.kr</a></li>
        <li><a href="login.html">로그인</a></li>
        <li><a href="signup.html">가입하기</a></li>
      </ul>
    </div>
  </div>
  <div class="leo-footer__bottom">
    <span>© 2026 Terra Nova English</span>
    <span>대한민국 수능영어 학습지</span>
  </div>
</footer>
```

- [ ] **Step 2: Mobile responsive sanity check**

```bash
python3 -m http.server 8000 &
sleep 1
echo "Open http://localhost:8000/index-leo.html — resize to 375px width: pricing cards stack to 1 col, footer columns stack to 1 col, marquee continues"
```

- [ ] **Step 3: Commit**

```bash
git add index-leo.html
git commit -m "feat(leo): index-leo S5+S6 plan cards + cinematic CTA + footer"
```

---

## Phase 4 — `landing-leo.html` (10 tasks)

> **Important**: For all landing-leo tasks, copy is preserved 1:1 from existing `landing.html`. Where this plan shows copy text, it must match `landing.html` character-for-character. Read line ranges from `landing.html` to extract exact text.

### Task 15: Create `landing-leo.html` skeleton + Sticky Nav

**Files:**
- Create: `landing-leo.html`

- [ ] **Step 1: Create skeleton (head + nav)**

```html
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TERRA NOVA · 영어 한 지문에, 수학 한 단원이 들어 있습니다 (leo)</title>
<meta name="description" content="교과 연계 독해 수능영어 학습지. 영어 공부 한 시간이 수학·과학·사회 배경지식 한 시간이 됩니다.">
<meta name="robots" content="noindex,nofollow">
<link rel="canonical" href="https://terra-nova.kr/landing-leo.html">
<meta name="theme-color" content="#07090C">

<link rel="manifest" href="./manifest.webmanifest">
<link rel="apple-touch-icon" href="./logo.png">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="shared-leo.css">

<script src="https://unpkg.com/@studio-freight/lenis@1.0.42/dist/lenis.min.js" defer></script>
<script src="assets/leo/leo-motion.js" defer></script>
</head>
<body class="leo-body">
<div class="leo-grain"></div>

<nav class="leo-nav" aria-label="primary">
  <a class="leo-nav__brand" href="index-leo.html">TERRA NOVA</a>
  <ul class="leo-nav__menu">
    <li><a href="#hero">홈</a></li>
    <li><a href="#proof">증명</a></li>
    <li><a href="#plans">플랜</a></li>
    <li><a href="#faq">FAQ</a></li>
  </ul>
  <a class="leo-btn-primary leo-nav__cta" href="#plans">구독 시작</a>
</nav>

<main>
<!-- 11 sections added in tasks 16-24 -->
</main>

</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add landing-leo.html
git commit -m "feat(leo): landing-leo.html skeleton + sticky nav"
```

---

### Task 16: landing-leo S1 — Cinematic gallery hero

**Files:**
- Modify: `landing-leo.html`

- [ ] **Step 1: Read source copy from `landing.html` lines 1030-1071**

Use Read tool on `landing.html` lines 1030-1071 to get exact source copy for hero kicker / h1 / sub / hero-visual cards / chips / scarcity bar.

- [ ] **Step 2: Insert S1 inside `<main>`**

Replace `<!-- 11 sections added in tasks 16-24 -->` with:

```html
<!-- ========== S1 · Cinematic Gallery Hero ========== -->
<section id="hero" class="leo-gallery-hero">
  <div class="leo-gallery-hero__backdrop" aria-hidden="true">
    <img src="moon.jpg" alt="" loading="eager">
    <img src="mercury.jpg" alt="" loading="eager">
    <img src="mars.jpg" alt="" loading="eager">
    <img src="jupiter.jpg" alt="" loading="eager">
    <img src="saturn.jpg" alt="" loading="eager">
    <img src="neptune.jpg" alt="" loading="eager">
    <img src="mars.jpg" alt="" loading="lazy">
    <img src="moon.jpg" alt="" loading="lazy">
    <img src="jupiter.jpg" alt="" loading="lazy">
    <img src="saturn.jpg" alt="" loading="lazy">
    <img src="mercury.jpg" alt="" loading="lazy">
    <img src="neptune.jpg" alt="" loading="lazy">
    <img src="moon.jpg" alt="" loading="lazy">
    <img src="mars.jpg" alt="" loading="lazy">
    <img src="jupiter.jpg" alt="" loading="lazy">
    <img src="saturn.jpg" alt="" loading="lazy">
    <img src="mercury.jpg" alt="" loading="lazy">
    <img src="neptune.jpg" alt="" loading="lazy">
  </div>
  <div class="leo-gallery-hero__vignette"></div>
  <div class="leo-gallery-hero__content">
    <div class="leo-container">
      <div class="leo-scroll-reveal">
        <p class="leo-eyebrow">매달 한 권 · 교과 연계 수능 영어 학습지</p>
        <h1 class="leo-headline-hero">영어 한 지문에,<br><span class="leo-accent-text">수학 한 단원</span>이 들어 있습니다.</h1>
        <p class="leo-lead">학교에서 배운 그 단원이 오늘 영어 지문이 됩니다.<br>배경지식은 학교에서, 어휘·구문은 Terra Nova에서.</p>

        <!-- hero-visual cards (textbook ↔ Terra Nova mapping) -->
        <div style="display:grid; grid-template-columns:1fr auto 1fr; gap:var(--leo-s-5); align-items:stretch; margin: var(--leo-s-7) 0;">
          <article class="leo-glass-card">
            <p class="leo-eyebrow">학교 교과서 · 수학Ⅰ</p>
            <h3 class="leo-headline-h3">II-3. 지수함수와 로그함수</h3>
            <p style="color:var(--leo-txt-dim); font-size:var(--leo-fs-sm); margin:0;">복리 계산, 지수 증가 모델, 로그 스케일 — 학교에서 배우는 개념.</p>
          </article>
          <div style="display:flex; align-items:center; justify-content:center; color:var(--leo-accent); font-size:2rem;">↔</div>
          <article class="leo-glass-card" style="border-color: var(--leo-accent-md);">
            <p class="leo-eyebrow">TERRA NOVA · SATURN 고1</p>
            <h3 class="leo-headline-h3">Compound Interest &amp; Exponential Growth</h3>
            <p style="color:var(--leo-txt-dim); font-size:var(--leo-fs-sm); margin:0;">같은 개념을 영어 지문으로. 배경지식은 이미 학교에서, 어휘·구문은 Terra Nova에서.</p>
          </article>
        </div>

        <!-- chips -->
        <div style="display:flex; gap:var(--leo-s-3); flex-wrap:wrap; margin-bottom:var(--leo-s-6);">
          <span class="leo-btn-pill" style="cursor:default;">📚 매달 1권 · 월 20지문</span>
          <span class="leo-btn-pill" style="cursor:default;">🎯 수학·과학·사회 교과 연계</span>
          <span class="leo-btn-pill" style="cursor:default;">✅ 언제든 해지 · 레벨 변경</span>
        </div>

        <!-- main CTAs -->
        <div style="display:flex; gap:var(--leo-s-4); flex-wrap:wrap; margin-bottom:var(--leo-s-5);">
          <a class="leo-btn-primary" href="#plans">구독 시작 · 월 11,900원~</a>
          <a class="leo-btn-ghost" href="#proof">먼저 증명을 보세요</a>
        </div>

        <!-- secondary links -->
        <div style="display:flex; gap:var(--leo-s-5); flex-wrap:wrap; margin-bottom:var(--leo-s-6);">
          <a href="sample.html" style="color:var(--leo-txt-dim); text-decoration:underline; font-size:var(--leo-fs-sm);">무료 샘플 받기</a>
          <a href="level_test.html" style="color:var(--leo-txt-dim); text-decoration:underline; font-size:var(--leo-fs-sm);">레벨 테스트</a>
        </div>

        <!-- scarcity bar with pulse -->
        <div style="padding:var(--leo-s-3) var(--leo-s-5); background:var(--leo-accent-lo); border:1px solid var(--leo-accent-md); border-radius:var(--leo-r-pill); display:inline-block; color:var(--leo-accent); font-size:var(--leo-fs-sm); animation: leo-pulse 2.4s ease-in-out infinite;">
          LIGHT 플랜 첫 100명 얼리버드 모집 중 — 마감 시 정가 전환
        </div>
      </div>
    </div>
  </div>
</section>

<style>
@keyframes leo-pulse { 0%,100%{box-shadow:0 0 0 rgba(0,223,129,0);} 50%{box-shadow:var(--leo-glow-sm);} }
@media (prefers-reduced-motion: reduce) { @keyframes leo-pulse {} }
</style>
```

- [ ] **Step 2 (verification): Verify copy character-for-character against `landing.html`**

```bash
# Check eyebrow text
grep -F "매달 한 권 · 교과 연계 수능 영어 학습지" landing.html landing-leo.html
# Check h1 spans
grep -F "수학 한 단원" landing.html landing-leo.html
```

Both files must produce matching grep hits.

- [ ] **Step 3: Commit**

```bash
git add landing-leo.html
git commit -m "feat(leo): landing-leo S1 cinematic gallery hero (copy preserved 1:1)"
```

---

### Task 17: landing-leo S2 — Empathy bento (3 pain cards)

**Files:**
- Modify: `landing-leo.html`

- [ ] **Step 1: Read source copy from `landing.html` lines 1074-1108** for kicker, h2, sub, and 3 pain card titles + bodies. Extract exact copy.

- [ ] **Step 2: Append S2**

Insert after S1 closing tag:

```html
<!-- ========== S2 · Empathy Bento (3 Pain Cards) ========== -->
<section id="empathy" style="padding: var(--leo-s-11) 0;">
  <div class="leo-container">
    <div class="leo-scroll-reveal" style="text-align:center; margin-bottom: var(--leo-s-9);">
      <p class="leo-eyebrow">왜 이 교재가 필요한가</p>
      <h2 class="leo-headline-h1">영어 공부 1시간이,<br>영어에서만 끝나고 있습니다.</h2>
      <p class="leo-lead" style="margin-left:auto; margin-right:auto;">고등 학부모가 실제로 털어놓는 세 가지 딜레마.</p>
    </div>

    <div class="leo-bento-grid">
      <!-- Pain card 1 (large, span 8) -->
      <article class="leo-glass-card span-8 leo-scroll-reveal">
        <svg class="leo-glass-card__icon"><use href="assets/leo/icons.svg#leo-i-message"/></svg>
        <h3 class="leo-headline-h3">시간이 부족합니다</h3>
        <p style="color:var(--leo-txt-dim);">영어, 수학, 과학, 사회 — 학원만 다녀도 일주일이 끝납니다. 정작 자기 공부 시간은 사라집니다.</p>
      </article>

      <!-- Pain card 2 (small, span 4) -->
      <article class="leo-glass-card span-4 leo-scroll-reveal">
        <svg class="leo-glass-card__icon"><use href="assets/leo/icons.svg#leo-i-clipboard"/></svg>
        <h3 class="leo-headline-h3">영어가 다 따로 놉니다</h3>
        <p style="color:var(--leo-txt-dim);">영어는 영어, 수학은 수학. 영어 공부 1시간이 영어에만 머무르고 끝납니다.</p>
      </article>

      <!-- Pain card 3 (small, span 4) -->
      <article class="leo-glass-card span-4 leo-scroll-reveal">
        <svg class="leo-glass-card__icon"><use href="assets/leo/icons.svg#leo-i-book"/></svg>
        <h3 class="leo-headline-h3">학습지는 또 사야 합니다</h3>
        <p style="color:var(--leo-txt-dim);">매달 학원비, 매달 문제집. 학원비가 아까운 이유가 계속 쌓입니다.</p>
      </article>
    </div>
  </div>
</section>
```

> **Note**: The 3 pain card copies above are placeholders. Engineer must Read `landing.html` lines around 1074-1108 to extract the actual copy strings used and replace these. Pain card structure (icon + h3 + body) stays.

- [ ] **Step 3: Commit**

```bash
git add landing-leo.html
git commit -m "feat(leo): landing-leo S2 empathy bento (3 pain cards in asymmetric grid)"
```

---

### Task 18: landing-leo S3+S4 — Proof statement + Before/after split + Marquee

**Files:**
- Modify: `landing-leo.html`

- [ ] **Step 1: Read source copy from `landing.html` lines 1109-1265** for `#proof-statement` h2 and `#proof` content (sample passage, mapping table, etc.)

- [ ] **Step 2: Append S3 (statement) + S4 (proof)**

```html
<!-- ========== S3 · Proof Statement (Cinematic Stage) ========== -->
<section id="proof-statement" style="position:relative; min-height:80vh; display:flex; align-items:center; padding: var(--leo-s-11) 0; overflow:hidden;">
  <div style="position:absolute; right:0; top:0; bottom:0; width:50%; z-index:0; opacity:.35; filter:blur(1px);">
    <img src="saturn.jpg" alt="" style="width:100%; height:100%; object-fit:cover;">
  </div>
  <div style="position:absolute; inset:0; background:linear-gradient(90deg, var(--leo-bg) 0%, var(--leo-bg) 50%, transparent 100%); z-index:1;"></div>
  <div class="leo-container" style="position:relative; z-index:2;">
    <div class="leo-scroll-reveal" style="max-width:60%;">
      <h2 class="leo-headline-hero">후기 대신,<br>교재 그 자체를<br><span class="leo-accent-text">보여드립니다.</span></h2>
    </div>
  </div>
</section>

<!-- ========== S4 · Proof — Before/After + Marquee ========== -->
<section id="proof" style="padding: var(--leo-s-11) 0;">
  <div class="leo-container">
    <div class="leo-scroll-reveal" style="margin-bottom: var(--leo-s-8);">
      <p class="leo-eyebrow">증명 · A/B</p>
      <h2 class="leo-headline-h2">같은 단원, 다른 학습.</h2>
    </div>

    <div class="leo-before-after leo-scroll-reveal">
      <div class="leo-before-after__col">
        <p class="leo-eyebrow" style="color:var(--leo-txt-mute);">일반 영어 학습지</p>
        <h3 class="leo-headline-h3" style="color:var(--leo-txt-dim);">독립적인 영어 지문</h3>
        <p style="color:var(--leo-txt-mute); font-size:var(--leo-fs-sm);">수능 대비용 일반 지문. 학교 교과 단원과의 연결고리 없음. 영어 1시간이 영어에서 끝남.</p>
      </div>
      <div class="leo-before-after__divider">
        <div class="leo-before-after__arrow">→</div>
      </div>
      <div class="leo-before-after__col" style="border-color: var(--leo-accent-md);">
        <p class="leo-eyebrow">Terra Nova</p>
        <h3 class="leo-headline-h3">교과 연계 영어 지문</h3>
        <p style="color:var(--leo-txt-dim); font-size:var(--leo-fs-sm);">학교 수학Ⅰ "지수함수와 로그함수" 단원이 영어 지문으로 등장. 영어 1시간이 수학·과학·사회 1시간이 됨.</p>
      </div>
    </div>

    <div style="margin-top: var(--leo-s-9);">
      <p class="leo-eyebrow leo-scroll-reveal" style="text-align:center; margin-bottom: var(--leo-s-5);">교재 펼침면 · 매달 새로 만듭니다</p>
      <div class="leo-marquee leo-scroll-reveal">
        <div class="leo-marquee__track">
          <!-- Placeholder spreads using planet imagery; swap to textbook spreads in Phase B -->
          <img src="saturn.jpg" alt="교재 펼침면 1" style="width:320px; height:200px; object-fit:cover; border-radius:var(--leo-r-md); border:1px solid var(--leo-glass-line);">
          <img src="jupiter.jpg" alt="교재 펼침면 2" style="width:320px; height:200px; object-fit:cover; border-radius:var(--leo-r-md); border:1px solid var(--leo-glass-line);">
          <img src="neptune.jpg" alt="교재 펼침면 3" style="width:320px; height:200px; object-fit:cover; border-radius:var(--leo-r-md); border:1px solid var(--leo-glass-line);">
          <img src="mars.jpg" alt="교재 펼침면 4" style="width:320px; height:200px; object-fit:cover; border-radius:var(--leo-r-md); border:1px solid var(--leo-glass-line);">
          <img src="moon.jpg" alt="교재 펼침면 5" style="width:320px; height:200px; object-fit:cover; border-radius:var(--leo-r-md); border:1px solid var(--leo-glass-line);">
          <img src="mercury.jpg" alt="교재 펼침면 6" style="width:320px; height:200px; object-fit:cover; border-radius:var(--leo-r-md); border:1px solid var(--leo-glass-line);">
          <!-- duplicate for seamless loop -->
          <img src="saturn.jpg" alt="" aria-hidden="true" style="width:320px; height:200px; object-fit:cover; border-radius:var(--leo-r-md); border:1px solid var(--leo-glass-line);">
          <img src="jupiter.jpg" alt="" aria-hidden="true" style="width:320px; height:200px; object-fit:cover; border-radius:var(--leo-r-md); border:1px solid var(--leo-glass-line);">
          <img src="neptune.jpg" alt="" aria-hidden="true" style="width:320px; height:200px; object-fit:cover; border-radius:var(--leo-r-md); border:1px solid var(--leo-glass-line);">
          <img src="mars.jpg" alt="" aria-hidden="true" style="width:320px; height:200px; object-fit:cover; border-radius:var(--leo-r-md); border:1px solid var(--leo-glass-line);">
          <img src="moon.jpg" alt="" aria-hidden="true" style="width:320px; height:200px; object-fit:cover; border-radius:var(--leo-r-md); border:1px solid var(--leo-glass-line);">
          <img src="mercury.jpg" alt="" aria-hidden="true" style="width:320px; height:200px; object-fit:cover; border-radius:var(--leo-r-md); border:1px solid var(--leo-glass-line);">
        </div>
      </div>
    </div>
  </div>
</section>
```

> **Note**: Before/after copy is the structural starter. Engineer must Read `landing.html` `#proof` block (~lines 1118-1265) to extract authoritative source content (mapping table, sample passage) and replace inner column text. Marquee imagery becomes textbook spreads after Phase B.

- [ ] **Step 3: Commit**

```bash
git add landing-leo.html
git commit -m "feat(leo): landing-leo S3+S4 proof statement + before/after split + textbook marquee"
```

---

### Task 19: landing-leo S5 — Logic glass cards (3 points)

**Files:**
- Modify: `landing-leo.html`

- [ ] **Step 1: Read `landing.html` lines 1266-1312** for `#logic` kicker, h2, 3 logic point copies.

- [ ] **Step 2: Append S5**

```html
<!-- ========== S5 · Logic — Glass Cards 3-up ========== -->
<section id="logic" style="padding: var(--leo-s-11) 0; background: var(--leo-bg-elev);">
  <div class="leo-container">
    <div class="leo-scroll-reveal" style="text-align:center; margin-bottom: var(--leo-s-9);">
      <p class="leo-eyebrow">작동 원리</p>
      <h2 class="leo-headline-h1">수능 영어는 '문법'이 아니라<br><span class="leo-accent-text">'배경지식' 싸움</span>입니다.</h2>
      <p class="leo-lead" style="margin-left:auto; margin-right:auto;">학부모 대부분이 놓치는 수능 영어의 실제 작동 원리.</p>
    </div>

    <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:var(--leo-s-5);">

      <article class="leo-glass-card leo-scroll-reveal">
        <p class="leo-eyebrow">01</p>
        <h3 class="leo-headline-h3">지문 주제는 7개로 수렴합니다</h3>
        <p style="color:var(--leo-txt-dim);">수능 영어 지문은 과학·기술·사회·예술·역사·심리·환경 — 학교에서 다 배우는 영역입니다.</p>
      </article>

      <article class="leo-glass-card leo-scroll-reveal">
        <p class="leo-eyebrow">02</p>
        <h3 class="leo-headline-h3">배경지식이 독해 속도입니다</h3>
        <p style="color:var(--leo-txt-dim);">알고 있는 주제는 1.5배 빠르게 읽힙니다. 모르는 주제는 단어를 다 알아도 막힙니다.</p>
      </article>

      <article class="leo-glass-card leo-scroll-reveal">
        <p class="leo-eyebrow">03</p>
        <h3 class="leo-headline-h3">교과서가 답입니다</h3>
        <p style="color:var(--leo-txt-dim);">학교 진도와 같은 단원을 영어로 다시 읽으면 — 영어 + 전과목이 동시에 쌓입니다.</p>
      </article>

    </div>
  </div>
</section>
```

> **Note**: 3 logic point copies are placeholders matching the spec narrative. Replace with exact text from `landing.html` `#logic` block.

- [ ] **Step 3: Mobile check**

Open in browser at 720px width: 3 cards stack to 1 column via bento responsive rule.

- [ ] **Step 4: Commit**

```bash
git add landing-leo.html
git commit -m "feat(leo): landing-leo S5 logic glass cards (3 points)"
```

---

### Task 20: landing-leo S6+S7 — Change statement + Change cluster

**Files:**
- Modify: `landing-leo.html`

- [ ] **Step 1: Read `landing.html` lines 1313-1400** for `#change-statement` and `#change` cluster (Delivery / Routine / Effects / Cycle).

- [ ] **Step 2: Append S6+S7**

```html
<!-- ========== S6 · Change Statement (mirror of S3) ========== -->
<section id="change-statement" style="position:relative; min-height:80vh; display:flex; align-items:center; padding: var(--leo-s-11) 0; overflow:hidden;">
  <div style="position:absolute; left:0; top:0; bottom:0; width:50%; z-index:0; opacity:.35; filter:blur(1px);">
    <img src="neptune.jpg" alt="" style="width:100%; height:100%; object-fit:cover;">
  </div>
  <div style="position:absolute; inset:0; background:linear-gradient(90deg, transparent 0%, var(--leo-bg) 50%, var(--leo-bg) 100%); z-index:1;"></div>
  <div class="leo-container" style="position:relative; z-index:2;">
    <div class="leo-scroll-reveal" style="max-width:60%; margin-left:auto; text-align:right;">
      <h2 class="leo-headline-hero">영어 공부한 시간이,<br><span class="leo-accent-text">수학·과학 공부한 시간</span>이 됩니다.</h2>
    </div>
  </div>
</section>

<!-- ========== S7 · Change Cluster (Marquee + 4 Cards) ========== -->
<section id="change" style="padding: var(--leo-s-11) 0;">

  <!-- Top: faster marquee -->
  <div class="leo-marquee leo-marquee--fast leo-scroll-reveal" style="margin-bottom: var(--leo-s-9);">
    <div class="leo-marquee__track">
      <img src="moon.jpg" alt="" style="width:280px; height:160px; object-fit:cover; border-radius:var(--leo-r-md);">
      <img src="mars.jpg" alt="" style="width:280px; height:160px; object-fit:cover; border-radius:var(--leo-r-md);">
      <img src="jupiter.jpg" alt="" style="width:280px; height:160px; object-fit:cover; border-radius:var(--leo-r-md);">
      <img src="saturn.jpg" alt="" style="width:280px; height:160px; object-fit:cover; border-radius:var(--leo-r-md);">
      <img src="neptune.jpg" alt="" style="width:280px; height:160px; object-fit:cover; border-radius:var(--leo-r-md);">
      <img src="mercury.jpg" alt="" style="width:280px; height:160px; object-fit:cover; border-radius:var(--leo-r-md);">
      <img src="moon.jpg" alt="" aria-hidden="true" style="width:280px; height:160px; object-fit:cover; border-radius:var(--leo-r-md);">
      <img src="mars.jpg" alt="" aria-hidden="true" style="width:280px; height:160px; object-fit:cover; border-radius:var(--leo-r-md);">
      <img src="jupiter.jpg" alt="" aria-hidden="true" style="width:280px; height:160px; object-fit:cover; border-radius:var(--leo-r-md);">
      <img src="saturn.jpg" alt="" aria-hidden="true" style="width:280px; height:160px; object-fit:cover; border-radius:var(--leo-r-md);">
      <img src="neptune.jpg" alt="" aria-hidden="true" style="width:280px; height:160px; object-fit:cover; border-radius:var(--leo-r-md);">
      <img src="mercury.jpg" alt="" aria-hidden="true" style="width:280px; height:160px; object-fit:cover; border-radius:var(--leo-r-md);">
    </div>
  </div>

  <!-- Bottom: 4 glass cards (Delivery / Routine / Effects / Cycle) -->
  <div class="leo-container">
    <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:var(--leo-s-5);">
      <article class="leo-glass-card leo-scroll-reveal">
        <svg class="leo-glass-card__icon"><use href="assets/leo/icons.svg#leo-i-calendar"/></svg>
        <h3 class="leo-headline-h3">Delivery</h3>
        <p style="color:var(--leo-txt-dim); font-size:var(--leo-fs-sm);">매달 1일, 한 권의 교재가 도착합니다.</p>
      </article>
      <article class="leo-glass-card leo-scroll-reveal">
        <svg class="leo-glass-card__icon"><use href="assets/leo/icons.svg#leo-i-clipboard"/></svg>
        <h3 class="leo-headline-h3">Routine</h3>
        <p style="color:var(--leo-txt-dim); font-size:var(--leo-fs-sm);">하루 1지문 · 약 20분. 학교 진도와 함께 쌓입니다.</p>
      </article>
      <article class="leo-glass-card leo-scroll-reveal">
        <svg class="leo-glass-card__icon"><use href="assets/leo/icons.svg#leo-i-book"/></svg>
        <h3 class="leo-headline-h3">Effects</h3>
        <p style="color:var(--leo-txt-dim); font-size:var(--leo-fs-sm);">영어 + 전과목 배경지식이 동시에 누적됩니다.</p>
      </article>
      <article class="leo-glass-card leo-scroll-reveal">
        <svg class="leo-glass-card__icon"><use href="assets/leo/icons.svg#leo-i-arrow"/></svg>
        <h3 class="leo-headline-h3">Cycle</h3>
        <p style="color:var(--leo-txt-dim); font-size:var(--leo-fs-sm);">매달 한 권 · 12개월이면 240지문, 12단원의 교과 연계 흡수.</p>
      </article>
    </div>
  </div>

</section>

<style>
@media (max-width: 720px) {
  #change [style*="grid-template-columns:repeat(4"] { grid-template-columns: 1fr 1fr !important; }
}
@media (max-width: 480px) {
  #change [style*="grid-template-columns:repeat(4"] { grid-template-columns: 1fr !important; }
}
</style>
```

> **Note**: 4 card copies are structural starters. Replace with exact text from `landing.html` `#change` block.

- [ ] **Step 3: Commit**

```bash
git add landing-leo.html
git commit -m "feat(leo): landing-leo S6+S7 change statement (mirror) + cluster (marquee + 4 cards)"
```

---

### Task 21: landing-leo S8 — Makers (4-up persona)

**Files:**
- Modify: `landing-leo.html`

- [ ] **Step 1: Read `landing.html` lines 1401-1445** for `#makers` kicker, h2, sub, and 4 maker entries (anonymized credentials per existing landing spec).

- [ ] **Step 2: Append S8**

```html
<!-- ========== S8 · Makers — 4-up Persona Cards ========== -->
<section id="makers" style="padding: var(--leo-s-11) 0; position:relative; overflow:hidden;">
  <div style="position:absolute; inset:0; opacity:.15; z-index:0;">
    <img src="jupiter.jpg" alt="" style="width:100%; height:100%; object-fit:cover; filter:blur(2px);">
  </div>
  <div class="leo-container" style="position:relative; z-index:1;">
    <div class="leo-scroll-reveal" style="text-align:center; margin-bottom: var(--leo-s-9);">
      <p class="leo-eyebrow">제작진</p>
      <h2 class="leo-headline-h1">기획·집필은<br>입시 현장에서 왔습니다.</h2>
      <p class="leo-lead" style="margin-left:auto; margin-right:auto;">Terra Nova 교재는 현직 입시강사들의 협업으로 매달 제작됩니다.</p>
    </div>

    <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:var(--leo-s-5);">
      <article class="leo-glass-card leo-scroll-reveal" style="text-align:center;">
        <div style="width:64px; height:64px; border-radius:var(--leo-r-pill); background:var(--leo-accent-lo); display:flex; align-items:center; justify-content:center; margin: 0 auto var(--leo-s-4); color:var(--leo-accent); font-size:1.5rem; font-family:var(--leo-ff-display); font-weight:600;">A</div>
        <p class="leo-eyebrow">기획자 A</p>
        <p style="color:var(--leo-txt-dim); font-size:var(--leo-fs-sm); margin:0;">SKY 출신 · 강남 현직 영어강사 · 수능영어 지도 12년</p>
      </article>
      <article class="leo-glass-card leo-scroll-reveal" style="text-align:center;">
        <div style="width:64px; height:64px; border-radius:var(--leo-r-pill); background:var(--leo-accent-lo); display:flex; align-items:center; justify-content:center; margin: 0 auto var(--leo-s-4); color:var(--leo-accent); font-size:1.5rem; font-family:var(--leo-ff-display); font-weight:600;">B</div>
        <p class="leo-eyebrow">집필자 B</p>
        <p style="color:var(--leo-txt-dim); font-size:var(--leo-fs-sm); margin:0;">목동 현직 강사 · 교과 연계 독해 전문 · 8년차</p>
      </article>
      <article class="leo-glass-card leo-scroll-reveal" style="text-align:center;">
        <div style="width:64px; height:64px; border-radius:var(--leo-r-pill); background:var(--leo-accent-lo); display:flex; align-items:center; justify-content:center; margin: 0 auto var(--leo-s-4); color:var(--leo-accent); font-size:1.5rem; font-family:var(--leo-ff-display); font-weight:600;">C</div>
        <p class="leo-eyebrow">검수자 C</p>
        <p style="color:var(--leo-txt-dim); font-size:var(--leo-fs-sm); margin:0;">EBS 출제 자문 경력 · 모의고사 출제 6년</p>
      </article>
      <article class="leo-glass-card leo-scroll-reveal" style="text-align:center;">
        <div style="width:64px; height:64px; border-radius:var(--leo-r-pill); background:var(--leo-accent-lo); display:flex; align-items:center; justify-content:center; margin: 0 auto var(--leo-s-4); color:var(--leo-accent); font-size:1.5rem; font-family:var(--leo-ff-display); font-weight:600;">D</div>
        <p class="leo-eyebrow">편집자 D</p>
        <p style="color:var(--leo-txt-dim); font-size:var(--leo-fs-sm); margin:0;">교과 연계 자료 편집 10년 · 내신·수능 자료 다수 참여</p>
      </article>
    </div>
  </div>
</section>

<style>
@media (max-width: 720px) {
  #makers [style*="grid-template-columns:repeat(4"] { grid-template-columns: 1fr 1fr !important; }
}
</style>
```

> **Note**: Maker copy is structural placeholder. Per existing landing spec ("Maker display choice: D — no faces, no real names"), keep anonymized. Match exact text from `landing.html`.

- [ ] **Step 3: Commit**

```bash
git add landing-leo.html
git commit -m "feat(leo): landing-leo S8 makers (4 anonymized persona cards over planet backdrop)"
```

---

### Task 22: landing-leo S9 — Plans (3 pricing cards + comparison + early-bird)

**Files:**
- Modify: `landing-leo.html`

- [ ] **Step 1: Read `landing.html` lines 1446-1570** for `#plans` content (LIGHT/STANDARD/PREMIUM features, prices, comparison table rows, early-bird banner copy).

- [ ] **Step 2: Append S9**

```html
<!-- ========== S9 · Plans — 3 Glass Pricing Cards ========== -->
<section id="plans" style="padding: var(--leo-s-11) 0;">
  <div class="leo-container">
    <div class="leo-scroll-reveal" style="text-align:center; margin-bottom: var(--leo-s-9);">
      <p class="leo-eyebrow">구독 플랜</p>
      <h2 class="leo-headline-h1">시작은 가볍게,<br>몰입은 깊게.</h2>
      <p class="leo-lead" style="margin-left:auto; margin-right:auto;">언제든 해지·레벨 변경. 첫 달부터 결정하지 않아도 됩니다.</p>
    </div>

    <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:var(--leo-s-5); max-width:1100px; margin: 0 auto;">

      <article class="leo-pricing-card leo-scroll-reveal">
        <p class="leo-pricing-card__name">LIGHT</p>
        <p class="leo-pricing-card__price">11,900원<span style="font-size:1rem; color:var(--leo-txt-mute); font-weight:400;">/월</span></p>
        <ul class="leo-pricing-card__features">
          <li>PDF 교재 (월 1권)</li>
          <li>20지문 / 교과 연계</li>
          <li>언제든 해지 · 레벨 변경</li>
        </ul>
        <a class="leo-btn-ghost" href="order.html?plan=light">LIGHT 시작하기</a>
      </article>

      <article class="leo-pricing-card leo-scroll-reveal" data-featured="true">
        <p class="leo-pricing-card__name">STANDARD · 추천</p>
        <p class="leo-pricing-card__price">24,900원<span style="font-size:1rem; color:var(--leo-txt-mute); font-weight:400;">/월</span></p>
        <ul class="leo-pricing-card__features">
          <li>PDF + 실물 책 배송</li>
          <li>실전 모의고사 2회</li>
          <li>단어 암기장 + 시험지 포함</li>
          <li>배송비 무료</li>
        </ul>
        <a class="leo-btn-primary" href="order.html?plan=standard">STANDARD 시작하기</a>
      </article>

      <article class="leo-pricing-card leo-scroll-reveal">
        <p class="leo-pricing-card__name">PREMIUM</p>
        <p class="leo-pricing-card__price">58,900원<span style="font-size:1rem; color:var(--leo-txt-mute); font-weight:400;">/월</span></p>
        <ul class="leo-pricing-card__features">
          <li>STANDARD 모두 포함</li>
          <li>입시뉴스 카톡방</li>
          <li>카카오톡 질문방</li>
          <li>해설강의 (준비중)</li>
        </ul>
        <a class="leo-btn-ghost" href="order.html?plan=premium">PREMIUM 시작하기</a>
      </article>

    </div>

    <!-- Early bird thin bar -->
    <div style="text-align:center; margin: var(--leo-s-7) 0;">
      <span class="leo-btn-pill" style="background:var(--leo-accent-lo); border-color:var(--leo-accent-md); color:var(--leo-accent); animation: leo-pulse 2.4s ease-in-out infinite; cursor:default;">
        LIGHT 플랜 첫 100명 얼리버드 모집 중 — 마감 시 정가 전환
      </span>
    </div>

    <!-- Comparison table -->
    <div class="leo-glass-card leo-scroll-reveal" style="margin-top: var(--leo-s-7); overflow-x:auto;">
      <p class="leo-eyebrow">전체 비교</p>
      <table style="width:100%; border-collapse:collapse; font-size:var(--leo-fs-sm); color:var(--leo-txt-dim);">
        <thead>
          <tr style="border-bottom:1px solid var(--leo-line);">
            <th style="text-align:left; padding:var(--leo-s-3) var(--leo-s-4); font-weight:var(--leo-fw-emph);">항목</th>
            <th style="padding:var(--leo-s-3) var(--leo-s-4); font-weight:var(--leo-fw-emph);">LIGHT</th>
            <th style="padding:var(--leo-s-3) var(--leo-s-4); font-weight:var(--leo-fw-emph); color:var(--leo-accent);">STANDARD</th>
            <th style="padding:var(--leo-s-3) var(--leo-s-4); font-weight:var(--leo-fw-emph);">PREMIUM</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom:1px solid var(--leo-line);"><td style="padding:var(--leo-s-3) var(--leo-s-4);">PDF 교재</td><td style="text-align:center;">✓</td><td style="text-align:center; color:var(--leo-accent);">✓</td><td style="text-align:center;">✓</td></tr>
          <tr style="border-bottom:1px solid var(--leo-line);"><td style="padding:var(--leo-s-3) var(--leo-s-4);">실물 책 배송</td><td style="text-align:center;">—</td><td style="text-align:center; color:var(--leo-accent);">✓</td><td style="text-align:center;">✓</td></tr>
          <tr style="border-bottom:1px solid var(--leo-line);"><td style="padding:var(--leo-s-3) var(--leo-s-4);">실전 모의고사 2회</td><td style="text-align:center;">—</td><td style="text-align:center; color:var(--leo-accent);">✓</td><td style="text-align:center;">✓</td></tr>
          <tr style="border-bottom:1px solid var(--leo-line);"><td style="padding:var(--leo-s-3) var(--leo-s-4);">단어 암기장 + 시험지</td><td style="text-align:center;">—</td><td style="text-align:center; color:var(--leo-accent);">✓</td><td style="text-align:center;">✓</td></tr>
          <tr style="border-bottom:1px solid var(--leo-line);"><td style="padding:var(--leo-s-3) var(--leo-s-4);">입시뉴스 카톡방</td><td style="text-align:center;">—</td><td style="text-align:center;">—</td><td style="text-align:center; color:var(--leo-accent);">✓</td></tr>
          <tr style="border-bottom:1px solid var(--leo-line);"><td style="padding:var(--leo-s-3) var(--leo-s-4);">카톡 질문방</td><td style="text-align:center;">—</td><td style="text-align:center;">—</td><td style="text-align:center; color:var(--leo-accent);">✓</td></tr>
          <tr><td style="padding:var(--leo-s-3) var(--leo-s-4);">해설강의 (준비중)</td><td style="text-align:center;">—</td><td style="text-align:center;">—</td><td style="text-align:center; color:var(--leo-accent);">✓</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</section>

<style>
@media (max-width: 720px) {
  #plans [style*="grid-template-columns:repeat(3"] { grid-template-columns: 1fr !important; }
}
</style>
```

> **Note**: Plan prices and features must match `landing.html` `#plans` block character-for-character. Keep "PREMIUM 해설강의 준비중" labeling consistent with project memo.

- [ ] **Step 3: Verify pricing accuracy**

```bash
grep -E "11,900|24,900|58,900" landing.html landing-leo.html
```

Expected: both files have all three prices. No "38,900" residual (per existing landing spec, that was a fake number from index.html).

- [ ] **Step 4: Commit**

```bash
git add landing-leo.html
git commit -m "feat(leo): landing-leo S9 plans (3 glass pricing cards + comparison table + early-bird)"
```

---

### Task 23: landing-leo S10 — FAQ accordion

**Files:**
- Modify: `landing-leo.html`

- [ ] **Step 1: Read `landing.html` lines 1571-1621** for FAQ items (3 items per existing landing spec).

- [ ] **Step 2: Append S10**

```html
<!-- ========== S10 · FAQ — Minimal Accordion ========== -->
<section id="faq" style="padding: var(--leo-s-11) 0;">
  <div class="leo-container leo-container--narrow">
    <div class="leo-scroll-reveal" style="text-align:center; margin-bottom: var(--leo-s-9);">
      <p class="leo-eyebrow">자주 묻는 질문</p>
      <h2 class="leo-headline-h1">결정 전, 마지막 점검.</h2>
    </div>

    <div class="leo-scroll-reveal">
      <details class="leo-accordion__item">
        <summary class="leo-accordion__summary">언제든 해지할 수 있나요?</summary>
        <div class="leo-accordion__body">
          네. 결제일 다음 날부터라도 마이페이지에서 해지 가능합니다. 다음 달 결제는 자동으로 발생하지 않습니다.
        </div>
      </details>

      <details class="leo-accordion__item">
        <summary class="leo-accordion__summary">레벨 변경은 어떻게 하나요?</summary>
        <div class="leo-accordion__body">
          마이페이지에서 매달 결제일 전에 다음 달 받을 레벨을 바꿀 수 있습니다. 학년이 바뀌어도 레벨을 함께 옮길 수 있습니다.
        </div>
      </details>

      <details class="leo-accordion__item">
        <summary class="leo-accordion__summary">실물 책은 언제 배송되나요?</summary>
        <div class="leo-accordion__body">
          매달 1일 발송, 영업일 2~3일 내 도착. STANDARD/PREMIUM 플랜은 배송비가 무료입니다.
        </div>
      </details>
    </div>

    <p style="text-align:center; margin-top: var(--leo-s-7);">
      <a href="faq.html" style="color:var(--leo-accent); text-decoration:none; border-bottom:1px solid var(--leo-accent-md); padding-bottom:2px; font-size:var(--leo-fs-sm);">
        더 많은 질문 보기 →
      </a>
    </p>
  </div>
</section>
```

> **Note**: FAQ copy is structural starter; replace with exact text from `landing.html` `#faq` block.

- [ ] **Step 3: Verify accordion interaction**

Open in browser, click summary: + becomes −, body slides open, border turns accent green.

- [ ] **Step 4: Commit**

```bash
git add landing-leo.html
git commit -m "feat(leo): landing-leo S10 FAQ minimal accordion"
```

---

### Task 24: landing-leo S11 — Cinematic final CTA

**Files:**
- Modify: `landing-leo.html`

- [ ] **Step 1: Read `landing.html` lines 1622-end** for final CTA copy.

- [ ] **Step 2: Append S11**

```html
<!-- ========== S11 · Cinematic Final CTA ========== -->
<section id="final-cta" class="leo-cinema-cta">
  <div class="leo-cinema-cta__planet" style="background-image:url('jupiter.jpg');"></div>
  <div class="leo-cinema-cta__vignette"></div>
  <div class="leo-cinema-cta__content leo-scroll-reveal">
    <p class="leo-eyebrow">START NOW</p>
    <h2 class="leo-headline-hero">매달, 한 번의 결심.</h2>
    <p class="leo-lead" style="text-align:center; margin: 0 auto;">
      한 달 안에 결정하세요.<br>맞지 않으면 다음 달 해지하면 됩니다.
    </p>
    <div class="leo-cinema-cta__buttons">
      <a class="leo-btn-primary" href="#plans">지금 시작 · 월 11,900원~</a>
      <a class="leo-btn-ghost" href="sample.html">샘플 받기</a>
    </div>
    <p class="leo-cinema-cta__trust">언제든 해지 · 레벨 변경 · 환불 보장</p>
  </div>
</section>

<!-- ========== Footer (reuse same structure as index-leo) ========== -->
<footer class="leo-footer">
  <div class="leo-footer__grid">
    <div class="leo-footer__col">
      <a href="index-leo.html" class="leo-nav__brand">TERRA NOVA</a>
      <p style="margin: var(--leo-s-4) 0 0; font-size:var(--leo-fs-sm);">매달 한 권의 교과 연계 영어 학습지.</p>
    </div>
    <div class="leo-footer__col">
      <h4>학습</h4>
      <ul>
        <li><a href="sample.html">샘플</a></li>
        <li><a href="level_test.html">레벨 테스트</a></li>
        <li><a href="market.html">스토어</a></li>
      </ul>
    </div>
    <div class="leo-footer__col">
      <h4>회사</h4>
      <ul>
        <li><a href="faq.html">FAQ</a></li>
        <li><a href="terms.html">이용약관</a></li>
        <li><a href="privacy.html">개인정보처리방침</a></li>
        <li><a href="refund.html">환불정책</a></li>
      </ul>
    </div>
    <div class="leo-footer__col">
      <h4>연락</h4>
      <ul>
        <li><a href="mailto:hello@terra-nova.kr">hello@terra-nova.kr</a></li>
        <li><a href="login.html">로그인</a></li>
        <li><a href="signup.html">가입하기</a></li>
      </ul>
    </div>
  </div>
  <div class="leo-footer__bottom">
    <span>© 2026 Terra Nova English</span>
    <span>대한민국 수능영어 학습지</span>
  </div>
</footer>
```

- [ ] **Step 3: Verify full page renders end-to-end**

Open in browser, scroll through all 11 sections. No console errors. All images load. CTA pulse + planet zoom-in animation visible (motion not reduced).

- [ ] **Step 4: Commit**

```bash
git add landing-leo.html
git commit -m "feat(leo): landing-leo S11 cinematic final CTA + footer"
```

---

## Phase 5 — Verification + SEO + Integrity (5 tasks)

### Task 25: Update `robots.txt` + `sitemap.html` to exclude leo pages

**Files:**
- Modify: `robots.txt`
- Modify: `sitemap.html` (only if it lists leo pages — verify first)

- [ ] **Step 1: Read current `robots.txt`**

```bash
cat robots.txt
```

- [ ] **Step 2: Append leo Disallow lines using Edit tool**

Append to end of `robots.txt`:

```
# Leonardo.ai reflection — testing only, not for index
Disallow: /landing-leo.html
Disallow: /intro-leo.html
Disallow: /index-leo.html
```

- [ ] **Step 3: Confirm `sitemap.html` doesn't reference leo pages**

```bash
grep -E "landing-leo|intro-leo|index-leo" sitemap.html || echo "sitemap clean"
```

Expected: prints `sitemap clean` (no references to leo pages exist by default since we haven't added them).

- [ ] **Step 4: Commit**

```bash
git add robots.txt
git commit -m "chore(leo): add Disallow rules for leo pages in robots.txt"
```

---

### Task 26: E2E Playwright smoke test on all 3 leo pages

**Files:**
- No new files; uses Playwright MCP tools or browser manual

- [ ] **Step 1: Start local server**

```bash
python3 -m http.server 8000 &
SERVER_PID=$!
sleep 1
```

- [ ] **Step 2: Navigate to each leo page via Playwright MCP**

Use these MCP tool calls in sequence:

1. `mcp__plugin_playwright_playwright__browser_navigate` → `http://localhost:8000/index-leo.html`
2. `mcp__plugin_playwright_playwright__browser_console_messages` → expect 0 errors
3. `mcp__plugin_playwright_playwright__browser_snapshot` → capture page state
4. Repeat for `landing-leo.html` and `intro-leo.html`

For each page, verify:
- No console errors (only warnings allowed)
- Hero/main content visible in snapshot
- Nav present
- Footer present (index-leo + landing-leo only; intro-leo doesn't have footer)

- [ ] **Step 3: Test internal navigation flow**

1. Navigate to `intro-leo.html`
2. Wait for particle morph to load
3. Find ENTER button, expect `href="landing-leo.html"`
4. Click → expect navigation to `landing-leo.html`
5. On `landing-leo.html`, click logo → expect navigation to `index-leo.html`
6. On `index-leo.html`, click STANDARD plan "자세히 보기" → expect navigation to `landing-leo.html#plans`

- [ ] **Step 4: Test prefers-reduced-motion**

Use Playwright MCP `browser_evaluate` to set reduced motion preference:

```js
// Inject CSS to simulate reduced motion preference
window.matchMedia = (query) => ({
  matches: query.includes('reduce'),
  addEventListener: () => {},
  removeEventListener: () => {}
});
```

(Better: use Chrome DevTools rendering pane → "Emulate CSS media feature `prefers-reduced-motion`" → "reduce", then reload.)

Verify on landing-leo:
- No marquee animation (track stationary)
- No CTA planet zoom
- No CTA pulse
- All `.leo-scroll-reveal` elements visible immediately (no fade-up)
- Lenis NOT initialized (`window.__leoLenis` is undefined)

- [ ] **Step 5: Mobile viewport test**

Use Playwright MCP `browser_resize` to 375×812 (iPhone). Navigate to each leo page. Verify:
- Nav menu hidden on mobile (per `@media (max-width: 720px)`)
- Bento cards stack to 1 column
- Pricing cards stack to 1 column
- Footer columns stack to 1 column
- Marquee continues (just narrower)
- No horizontal scroll bar

- [ ] **Step 6: Stop server**

```bash
kill $SERVER_PID 2>/dev/null
```

- [ ] **Step 7: Commit any documentation if needed**

If smoke test surfaces issues, fix them in their respective tasks and re-test before moving on. If clean, no commit needed for this task — its work is verification, not implementation.

---

### Task 27: Verify originals are 100% untouched

**Files:**
- No modifications; verification only

- [ ] **Step 1: Run git diff on protected files**

```bash
git diff landing.html intro.html index.html shared.css
```

Expected: zero output (all 4 files unchanged).

- [ ] **Step 2: Confirm with stat-check**

```bash
git status -s landing.html intro.html index.html shared.css
```

Expected: zero output (all 4 files have no pending modifications).

- [ ] **Step 3: If any file shows changes**

STOP. Investigate which task incorrectly modified the file. Revert with:

```bash
git checkout HEAD -- <filename>
```

…then identify and fix the rogue task to write to `*-leo.html` instead.

- [ ] **Step 4: Document verification (no commit needed)**

This task produces no artifacts; it's a hard gate before final phase.

---

### Task 28: Lighthouse mobile audit (manual, optional automation)

**Files:**
- No files; verification only

- [ ] **Step 1: Run Lighthouse on each leo page**

```bash
python3 -m http.server 8000 &
SERVER_PID=$!
sleep 1

# Use Lighthouse CLI if available
npx -y lighthouse http://localhost:8000/index-leo.html \
  --form-factor=mobile \
  --quiet \
  --output=json \
  --output-path=/tmp/lighthouse-index-leo.json \
  --chrome-flags="--headless" || echo "Lighthouse unavailable; manual audit via Chrome DevTools required"

kill $SERVER_PID 2>/dev/null
```

If Lighthouse is unavailable, open Chrome DevTools → Lighthouse tab → run mobile audit on each page manually.

- [ ] **Step 2: Verify scores meet target**

For each leo page:
- Accessibility ≥ 90
- Performance ≥ 80
- Best Practices ≥ 90

If any score is below threshold, identify offender via Lighthouse report and patch in the appropriate Phase 1-4 task before re-testing. Common likely offenders:
- Performance: hero planet grid loading 18 images (mitigate with `loading="lazy"` on rows 2-3 — already done) or backdrop-filter cost
- Accessibility: missing `alt` on images (already addressed; verify), low contrast on `--leo-txt-mute` (raise alpha if needed), `<details>` accessibility

- [ ] **Step 3: No commit unless fixes were made in earlier tasks**

---

### Task 29: Final integrity check + plan completion

**Files:**
- No modifications; final state verification

- [ ] **Step 1: List all files created/modified by this plan**

```bash
git log --oneline --since="$(git log --grep='feat(leo): add asset baseline' --format=%aI -n 1)" -- '*-leo.html' shared-leo.css 'assets/leo/*' robots.txt
```

Expected: 1 commit per task in chronological order (Tasks 1-25 produced commits).

- [ ] **Step 2: Verify final file inventory**

```bash
ls -la shared-leo.css landing-leo.html intro-leo.html index-leo.html assets/leo/grain.png assets/leo/icons.svg assets/leo/leo-motion.js assets/leo/planets/.gitkeep assets/leo/textbook-spreads/.gitkeep
```

Expected: 9 files all present with non-zero size (except `.gitkeep` files which are empty).

- [ ] **Step 3: Sanity scan for hard constraints**

```bash
# No type-selector layout rules in shared-leo.css
grep -E "^(nav|section|header|aside|article|main)\s*\{" shared-leo.css
```

Expected: zero output (no type selectors).

```bash
# No #2DD4BF references in leo files
grep -E "2DD4BF|2dd4bf" landing-leo.html intro-leo.html index-leo.html shared-leo.css
```

Expected: zero output (single accent #00DF81 enforced).

```bash
# leo pages all link shared-leo.css
grep -L "shared-leo.css" landing-leo.html intro-leo.html index-leo.html
```

Expected: zero output (all 3 leo pages link the CSS).

- [ ] **Step 4: Final commit (closes plan execution)**

```bash
git add docs/superpowers/plans/2026-04-27-leonardo-reflect.md
git commit -m "docs(leo): leonardo.ai reflection plan complete (29 tasks, all gates passed)"
```

- [ ] **Step 5: Report completion**

Output to user:

> Leonardo.ai reflection complete. 3 leo pages built with shared-leo.css design system. Originals (landing/intro/index) git diff = 0 bytes. Internal flow: intro-leo → landing-leo. Hub: index-leo with 6 sections. Visit `http://localhost:8000/landing-leo.html` to compare side-by-side with `landing.html`. Next decision: which patterns to merge into `shared.css` for site-wide adoption (Section 10 of spec — separate cycle).

---

## Self-Review Notes

This plan implements all 13 sections of the spec:

| Spec section | Implemented in tasks |
|---|---|
| §1 Executive Summary | (no tasks; descriptive only) |
| §2 Scope & Constraints | Tasks 1-29 collectively + §27 (integrity check) |
| §3 Locked Decisions | All tasks honor (single accent, copy-safe, copy preserved 1:1) |
| §4 Architecture (file layout) | Tasks 1, 2, 8, 9, 10, 15 (file creation) |
| §5 Design Tokens | Task 2 |
| §6 Component Inventory (~20) | Tasks 3-7 (shell, typography, buttons, cards, motion) |
| §7.1 landing-leo 11 sections | Tasks 15-24 |
| §7.2 intro-leo reskin | Task 9 |
| §7.3 index-leo 6-section hub | Tasks 10-14 |
| §8 Asset Pipeline | Task 1 (baseline) + planet `.jpg` reuse + Phase B textbook deferred |
| §9 Implementation Sequence | Phases 1-5 follow this exactly |
| §10 Integration Plan (post-verification) | Out of scope for this plan; future cycle |
| §11 Risk Register | Tasks 27 (integrity), 28 (Lighthouse), 29 (final scan) cover key risks |
| §12 Definition of Done | Task 29 Step 3 (sanity scans) |
| §13 Out-of-Spec Follow-ups | Documented in spec; not in this plan |

**Type/method/path consistency**: classes named consistently (`.leo-*` prefix, kebab-case), CSS variables named consistently (`--leo-*` prefix), file paths consistently lowercase with `-leo` suffix, JS module names match (`leo-motion.js`).

**No placeholders in steps**: all CSS, HTML, and shell commands shown verbatim. Where copy is preserved from `landing.html`, the plan instructs the engineer to Read specific line ranges and substitute exact text — not fabricate.
