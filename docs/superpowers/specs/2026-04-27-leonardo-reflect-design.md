# Terra Nova × Leonardo.ai — Design Reflection Spec

**Date**: 2026-04-27
**Status**: Design approved, pending implementation plan
**Reference**: leonardo.ai (visual language, layout patterns, motion)
**File targets**: `landing-leo.html`, `intro-leo.html`, `index-leo.html`, `shared-leo.css` (all new files; originals untouched)

---

## 1. Executive Summary

Reflect leonardo.ai's visual language — dark cinematic surfaces, gallery-driven layout, glass cards, marquee scrolling, display typography, layered motion — into Terra Nova's three primary public pages without overwriting current work. Each new file lives alongside the original (`-leo` suffix) so direct A/B comparison is possible at any time, and rollback is a no-op.

The reflection is **B-degree** ("Leonardo-Inspired Terra Nova") — adopt visual patterns, keep brand identity (single accent `#00DF81`, planet + textbook content surfaces, Korean-parent voice). The accent color discrepancy in the existing codebase (`#2DD4BF` teal in code vs `#00DF81` neon green in brand memo) is resolved in this spec: **leo pages use `#00DF81` exclusively**.

### Value Delivered — 4 Perspective Table

| Perspective | Current Problem | Leo Reflection Solution |
|---|---|---|
| **Problem** | Site reads as a generic Korean education page; visual identity does not match the premium brand voice; recent landing.html copy is strong but the visual surface underdelivers. | Cinematic dark surfaces, gallery-as-design treatment, glass cards, marquee — Terra Nova reads as a premium, distinctive brand. |
| **Solution** | Visual upgrade requires a long redesign cycle and risks breaking recent work (Three.js intro, 9-section landing). | Side-by-side new files (`-leo` suffix); originals never touched; integration only after approval. |
| **Function UX Effect** | Reader receives information without atmosphere; product feels educational but not "wow". | Cinematic hero + scroll-driven reveals + planet metaphor make brand emotionally legible in <10 seconds. |
| **Core Value** | Terra Nova's "수능영어 + 우주 메타포" identity is conceptually present but visually underused. | Planet imagery and textbook spreads become the design surface itself — identity becomes the visual language. |

---

## 2. Scope & Constraints

### In scope

- **3 new HTML files**: `landing-leo.html`, `intro-leo.html`, `index-leo.html`
- **1 new CSS file**: `shared-leo.css` (design tokens + 16 components)
- **1 new JS file**: `assets/leo/leo-motion.js` (Lenis + IntersectionObserver utilities)
- **New asset directory**: `assets/leo/{planets, textbook-spreads, icons.svg, grain.png}`
- **Updates** to `robots.txt` + `sitemap.html` to disallow leo pages from search indexing

### Out of scope

- **No modification** to existing `landing.html`, `intro.html`, `index.html`, `shared.css`, or any other site file
- No changes to other 27 pages (faq, market, mypage, etc.) — those follow in a later cycle if leo wins
- No new copy writing — reuse existing landing.html copy 1:1 for landing-leo
- No backend, database, or PortOne integration changes
- No SEO/meta optimization on leo pages (intentionally low-visibility during testing)

### Hard constraints

- **Absolute prohibition**: original `landing.html` / `intro.html` / `index.html` git diff = 0 bytes
- **No type-selector layout rules** in `shared-leo.css` (per CSS gotchas memo: avoid `nav`/`section`/`header` type selectors with position/layout properties; always use class selectors)
- **prefers-reduced-motion** must disable Lenis and reduce all motion durations to 0
- **Accent color**: single `#00DF81` (Caribbean Green); no `#2DD4BF` usage in leo pages
- **Copy preservation**: landing-leo uses landing.html copy 1:1 (visual reskin only per Approach 3)
- **No fabricated content** rule from original landing spec carries over (no fake reviews/stats)

---

## 3. Decisions Locked During Brainstorming

| # | Decision | Choice |
|---|---|---|
| 1 | Scope (which pages) | B — landing + intro + index (3 pages) |
| 2 | Backup strategy | New files with `-leo` suffix; originals untouched |
| 3 | Reflection degree | B — Leonardo-Inspired Terra Nova (adopt patterns, keep brand identity) |
| 4 | Gallery showcase content | A — planet imagery + textbook spread mix |
| 5 | intro.html handling | A — keep particle morph, reskin outer chrome only |
| 6 | Accent color | A — single `#00DF81` unified |
| 7 | Motion budget | A — Full motion (Lenis + GSAP + IntersectionObserver) with `prefers-reduced-motion` guard |
| 8 | Approach to mapping | 3 — Hybrid Showcase (preserve narrative, map Leonardo pattern per section) |

---

## 4. Architecture

### File layout

```
Terra Nova/
├── landing.html              # ORIGINAL — untouched
├── landing-leo.html          # NEW — Leonardo-Inspired
├── intro.html                # ORIGINAL — untouched
├── intro-leo.html            # NEW — outer reskin only
├── index.html                # ORIGINAL — untouched
├── index-leo.html            # NEW — 6-section hub
│
├── shared.css                # ORIGINAL — untouched
├── shared-leo.css            # NEW — leo tokens + components
│
├── assets/leo/               # NEW
│   ├── planets/              # WebP + JPG, 4 sizes (320/640/1024/1600w) × 10 planets
│   ├── textbook-spreads/     # 6-8 textbook spread PNGs from build-fullbook
│   ├── icons.svg             # Inline-able sprite, ~6 monoline icons
│   ├── grain.png             # 256×256 noise overlay, ~5KB
│   └── leo-motion.js         # Lenis + IO utilities
│
└── docs/superpowers/specs/
    └── 2026-04-27-leonardo-reflect-design.md   # this file
```

### Visibility / routing

- Leo pages are reachable only by direct URL (`/landing-leo.html`, etc.)
- No site menu/footer/inter-page link points to leo files
- `robots.txt` adds `Disallow: /landing-leo.html`, `/intro-leo.html`, `/index-leo.html`
- `sitemap.html` excludes leo pages
- Search engines see zero leo content; visitors only via shared link

### Internal flow (when navigating leo as a complete experience)

```
intro-leo.html  →  [enter button: href="landing-leo.html"]  →  landing-leo.html
index-leo.html  →  [pricing card link: href="landing-leo.html#plans"]  →  landing-leo.html
```

Original flow (`intro.html → landing.html`) remains untouched.

---

## 5. Design Tokens (`shared-leo.css` `:root`)

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

  /* Accent (single) */
  --leo-accent:    #00DF81;
  --leo-accent-lo: rgba(0,223,129,.10);
  --leo-accent-md: rgba(0,223,129,.28);
  --leo-accent-hi: rgba(0,223,129,.55);

  /* Glass */
  --leo-glass-bg:    rgba(20,24,30,.55);
  --leo-glass-blur:  20px;
  --leo-glass-line:  rgba(255,255,255,.10);

  /* Glow */
  --leo-glow-sm:  0 0 20px rgba(0,223,129,.18);
  --leo-glow-md:  0 0 40px rgba(0,223,129,.30);
  --leo-glow-lg:  0 0 80px rgba(0,223,129,.42);

  /* Shadow */
  --leo-shadow-card:    0 8px 32px rgba(0,0,0,.36);
  --leo-shadow-elev:    0 16px 48px rgba(0,0,0,.48);
  --leo-shadow-hover:   0 24px 64px rgba(0,0,0,.55);

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
  --leo-s-1:  4px;   --leo-s-2:  8px;   --leo-s-3:  12px;
  --leo-s-4:  16px;  --leo-s-5:  24px;  --leo-s-6:  32px;
  --leo-s-7:  48px;  --leo-s-8:  64px;  --leo-s-9:  96px;
  --leo-s-10: 128px; --leo-s-11: 192px;

  /* Radius */
  --leo-r-sm:  6px;   --leo-r-md:  12px;
  --leo-r-lg:  20px;  --leo-r-xl:  28px;
  --leo-r-pill: 999px;

  /* Motion */
  --leo-ease-out:    cubic-bezier(.22, 1, .36, 1);
  --leo-ease-inout:  cubic-bezier(.65, 0, .35, 1);
  --leo-ease-soft:   cubic-bezier(.4, 0, .2, 1);

  --leo-dur-fast:  180ms;
  --leo-dur-base:  320ms;
  --leo-dur-slow:  640ms;
  --leo-dur-cine:  1100ms;

  /* Z-index */
  --leo-z-bg:    0;
  --leo-z-base:  10;
  --leo-z-nav:   100;
  --leo-z-modal: 1000;

  /* Container */
  --leo-container:        1280px;
  --leo-container-narrow: 920px;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --leo-dur-fast: 0ms;
    --leo-dur-base: 0ms;
    --leo-dur-slow: 0ms;
    --leo-dur-cine: 0ms;
  }
}
```

---

## 6. Component Inventory

Approximately 20 reusable components in `shared-leo.css` (4 shell + 4 typography + 3 buttons + 3 cards + 6 motion widgets). Each described in 1 line — full styling rules deferred to implementation plan.

### Global shell

| Class | Purpose |
|---|---|
| `.leo-grain` | Fixed full-screen noise overlay, `mix-blend-mode:overlay opacity:.06`, pointer-events:none |
| `.leo-nav` | Sticky top, `backdrop-filter:blur(16px)`, condenses on scroll (height -8px, alpha ↑) |
| `.leo-footer` | 4-column grid; brand block (left) + 3 link columns (right) |
| `.leo-container` | `max-width:1280px`, `--leo-narrow` variant 920px |

### Typography / labels

| Class | Purpose |
|---|---|
| `.leo-eyebrow` | Uppercase + `--leo-tracking-wide` + `--leo-accent` color |
| `.leo-headline-hero` | `--leo-fs-hero` + `--leo-tracking-tight` + display weight |
| `.leo-headline-h1/h2/h3` | Section title scale |
| `.leo-lead` | Lead copy below headline (dim text) |

### Buttons

| Class | Purpose |
|---|---|
| `.leo-btn-primary` | Accent fill + black text + `--leo-glow-md`; hover: `glow-lg` + translateY(-2px) |
| `.leo-btn-ghost` | Transparent + `--leo-line-hi` border; hover: `--leo-accent-hi` border + soft glow |
| `.leo-btn-pill` | radius 999px variant for compact CTAs |

### Cards / containers

| Class | Purpose |
|---|---|
| `.leo-glass-card` | Glass surface + thin border; hover: accent border + lift + hover shadow |
| `.leo-bento-grid` | 12-col CSS Grid; children use arbitrary `grid-column/row-span` (1×1 / 2×1 / 2×2 / 3×2) |
| `.leo-pricing-card` | Glass-card variant; `data-featured="true"` adds accent border + gradient header + raised state |

### Motion / signature widgets

| Class | Purpose |
|---|---|
| `.leo-marquee` | Flex row, children duplicated; CSS `@keyframes` linear infinite 40s; pause on hover |
| `.leo-scroll-reveal` | Initial `opacity:0; translate:0 20px;` → IntersectionObserver adds `.is-visible` |
| `.leo-gallery-hero` | Full-bleed grid backdrop + vignette overlay + absolutely positioned `headline-hero` |
| `.leo-cinema-cta` | Full-bleed CTA section; planet backdrop + gradient pulse + large CTA |
| `.leo-before-after` | 50/50 split comparison; 1px accent line + small arrow between |
| `.leo-accordion` | `<details>`-based; bottom border, accent on open |

### JS utility (`assets/leo/leo-motion.js`)

- Single Lenis instance; auto-destroy on page transition
- Single IntersectionObserver registers all `.leo-scroll-reveal` elements
- Marquee is CSS-only (no JS)
- Detects `prefers-reduced-motion` → skips Lenis + immediately marks all reveal elements visible

---

## 7. Page Designs

### 7.1 `landing-leo.html` — 11 sections (Approach 3 mapping)

Copy preserved 1:1 from `landing.html`; only visual surface and motion change.

| # | Section ID | Leonardo pattern | Key visual details |
|---|---|---|---|
| S1 | `#hero` | Cinematic gallery hero | 6-col × 3-row planet grid backdrop + vignette + display headline + dual CTA. Existing hero-visual textbook ↔ Terra Nova cards become 2 glass-cards with `↔` accent. Chips → pill buttons. Scarcity bar pulses. Sequential fade-up entrance (90ms stagger) + clip-path headline reveal. |
| S2 | `#empathy` | Bento grid (3 pain cards) | 12-col asymmetric (8+4 over 4+8); each card glass + eyebrow + h3 + body + monoline SVG icon; stagger fade-up; hover lift + accent outer outline. |
| S3 | `#proof-statement` | Cinematic stage statement | Full-bleed; SATURN (고1) planet 50% right (blurred); huge headline 50% left; line-by-line cine reveal at `--leo-dur-cine`. |
| S4 | `#proof` | Before/after split + marquee | Top: before/after split (generic English passage vs Terra Nova mapped passage); middle accent line + arrow. Bottom: marquee row of textbook spreads (right-to-left, 32s, hover-pause). Caption with eyebrow + 1-line description. |
| S5 | `#logic` | Glass card 3-up (3 points) | 4-col × 3 glass-cards; eyebrow "01"/"02"/"03" + h3 + body + monoline SVG infographic; left-to-right stagger reveal; hover transitions infographic to accent. |
| S6 | `#change-statement` | Cinematic stage statement (mirror) | NEPTUNE planet left + headline right (mirror of S3). |
| S7 | `#change` | Marquee + glass card cluster | Top row: faster marquee (28s) of textbook spreads + word-list + test sheets mix. Bottom row: 4 glass-cards (Delivery/Routine/Effects/Cycle) with left illustration + right text; cards fade-up via IO. |
| S8 | `#makers` | 4-up persona cards + planet backdrop | 4 glass-cards (anonymized maker silhouettes/initials + credentials + quote); section background = single planet at opacity .15; stagger reveal. |
| S9 | `#plans` | Glass pricing 3-card | LIGHT / **STANDARD (featured)** / PREMIUM; featured has accent border + gradient header + raised state. Comparison table = full-width glass-card with thin slim table; row hover highlight. LIGHT early-bird thin bar pulses. |
| S10 | `#faq` | Minimal accordion | Bottom-border per item; +/− toggle; open state turns border accent; max-height transition + inner fade. |
| S11 | `#final-cta` | Cinematic full-bleed CTA | SUN planet backdrop + dark vignette + large headline + `.leo-btn-primary` (strong glow pulse) + `.leo-btn-ghost`; trust strip below. Slow zoom-in (scale 1.0 → 1.05, infinite ease) on planet. |

### 7.2 `intro-leo.html` — Outer reskin only

**Untouched** (core interaction): Three.js scene, particle morph, Lenis instance, GSAP ScrollTrigger sequence, scroll choreography, SKIP flow, `#bg` canvas.

**Reskinned** (outer chrome only):

| Item | Change |
|---|---|
| `--accent` | `#2DD4BF` → `var(--leo-accent)` |
| `--accent-soft` | `rgba(45,212,191,.12)` → `var(--leo-accent-lo)` |
| `--bg` / `--bg2` | `#0A0A0A` / `#080808` → `var(--leo-bg)` / `var(--leo-bg-elev)` |
| `--line` | unchanged value, retoken to `var(--leo-line)` |
| `<meta name="theme-color">` | `#0A0A0A` → `#07090C` |
| `.skip-link` | adds class `.leo-btn-pill` |
| `.enter-btn` | adds class `.leo-btn-primary` + intensified glow |
| Display tracking | aligned to `--leo-tracking-tight` / `--leo-tracking-mega` |
| `<link>` | adds `<link rel="stylesheet" href="shared-leo.css">` |
| `enter-btn` href | `landing.html` → `landing-leo.html` |
| Grain overlay | `<div class="leo-grain"></div>` added (above canvas, below content) |

Estimated diff: ~15-25 lines vs `intro.html`. **Particle morph, scroll engine, and Lenis logic remain bit-for-bit identical**.

`prefers-reduced-motion` guard added if absent (verify during implementation).

### 7.3 `index-leo.html` — 6-section hub

Hub structure prioritizing navigation over narrative. Original `index.html` has 12 sections (213KB); leo hub compresses to 6.

| # | Section | Pattern |
|---|---|---|
| S1 | Sticky nav | `.leo-nav`; left brand + center menu (소개·레벨·구독·샘플·로그인) + right `.leo-btn-primary` "구독 시작" |
| S2 | Cinematic gallery hero | Backdrop: 6×3 grid of 10 planets + 8 textbook spreads (mix); foreground: left-aligned eyebrow + headline ("TERRA NOVA `<accent>`ENGLISH`</accent>`") + lead + dual CTA |
| S3 | "What you get" bento (4-up) | 12-col asymmetric bento; cards: 교재 (large, textbook spread backdrop) / 10단계 레벨 / 부가 자료 / 샘플 (large); all glass; hover lift + accent outline |
| S4 | Planet level marquee | 10 planet cards left-to-right infinite scroll (40s); each card = planet image + level number + grade label (e.g., "06 · NEPTUNE · 중2"); pause on hover |
| S5 | Glass plan card 3-up (summary) | LIGHT / STANDARD-featured / PREMIUM; concise 3-4 bullets each; "전체 비교 보기" link → `landing-leo.html#plans`; LIGHT early-bird thin bar |
| S6 | Final CTA + footer | Full-bleed SUN planet + headline + dual CTA + `.leo-footer` (4-column links) |

Sections **deliberately not ported** from `index.html`:

- ~~#pain-points~~ → covered in `landing-leo` S2
- ~~#integrated~~, ~~#manifesto~~, ~~#price~~ → covered in `landing-leo` S3-S5
- ~~#reviews~~, ~~#grade-graph~~, ~~#trust~~ → covered in `landing-leo` S4·S6·S8
- ~~#products~~ (구독 + 추가 상품) → compressed into S3 bento + S5 plan cards
- ~~#contact~~ → absorbed into footer

Hub goal: **3.5 seconds for "What is Terra Nova and where do I go next"**; deep narrative deferred to `landing-leo.html`.

---

## 8. Asset Pipeline

| Asset | Source | Processing |
|---|---|---|
| Planet images (10) | Existing `*.jpg` (mercury…sun) | Convert to WebP + 4 responsive sizes (320/640/1024/1600w); slight darken pass for backdrop dimness; output to `assets/leo/planets/` |
| Textbook spreads (6-8) | `build-fullbook` pipeline output | Extract PNG → WebP convert; output to `assets/leo/textbook-spreads/` |
| Grain noise | New (256×256 PNG, ~5KB) | Generate once; reuse across pages |
| Monoline icons (4-6) | New (inline SVG sprite) | book / planet / calendar / clipboard / message / arrow |
| Fonts | Already loaded (Space Grotesk + Noto Sans KR) | No change; preconnect/preload retained |

Total estimated asset size: ~1MB (planets ~600KB + textbook spreads ~400KB + grain + icons negligible).

**Phased asset delivery** (pragmatic):

1. **Phase A** (immediate): Use existing planet `*.jpg` directly + grain + icons → leo skeleton renders fully
2. **Phase B** (after build-fullbook run): Add textbook spreads → marquee/bento gain real depth
3. **Phase C** (post-implementation): Optimize all to WebP responsive sets

---

## 9. Implementation Sequence (post-spec approval)

```
1. assets/leo/ baseline (planets, grain, icons)
2. shared-leo.css (tokens + 16 components)
3. assets/leo/leo-motion.js (Lenis + IO)
4. landing-leo.html (most complex; 11 sections)
5. intro-leo.html (1:1 copy + variable swap)
6. index-leo.html (6-section hub)
7. robots.txt + sitemap.html updates (Disallow leo)
8. Local E2E verification (chrome/safari/edge desktop + iOS/Android mobile + reduced-motion toggle)
9. Phase B: textbook spread asset injection (after build-fullbook)
```

---

## 10. Integration Plan (after design verification)

1. **Token/component merge**: Approved tokens and components → merge into `shared.css` (preserve `--leo-` prefix during transition; rename to `--brand-` only after full sweep)
2. **Page swap**:
   ```
   landing.html → landing-legacy-2026-04.html
   landing-leo.html → landing.html
   (intro/index follow same pattern)
   ```
3. **Asset directory**: `assets/leo/` either merged into `assets/` or retained as namespace
4. **Search re-enablement**: Remove leo Disallow rules from `robots.txt` after swap; new `landing.html` (formerly leo) is now indexable

---

## 11. Risk Register

| Risk | Mitigation |
|---|---|
| Lenis double-instantiation | One Lenis per page; intro-leo retains existing instance unchanged; landing/index-leo create their own |
| `prefers-reduced-motion` not honored | Token durations forced to 0ms via media query; `leo-motion.js` skips Lenis init; reveal observer immediately marks visible |
| Planet image weight on hero grid (6×3 = 18 tiles) | WebP + 4 responsive sizes + `loading="lazy"` + `decoding="async"`; only first row eager-loaded |
| `backdrop-filter` Safari/Firefox older versions | Glass surfaces fall back to solid alpha cleanly via `@supports` |
| Type-selector layout leakage (per CSS gotchas memo) | All leo selectors are class-based; zero `nav`/`section`/`header`/`aside` type rules with position/layout in `shared-leo.css` |
| Font FOUT/FOIT | `font-display:swap` + preconnect/preload retained from existing pages |
| Three.js + leo cache collisions | leo pages do not load Three.js; intro-leo retains its existing Three.js setup unchanged |
| Search engine crawl of leo pages | `robots.txt` Disallow + sitemap exclusion |
| Recent landing.html copy regressions | Copy preserved 1:1; reskin pure-visual; verify all 11 section texts character-for-character |
| Existing `--accent: #2DD4BF` references in other (non-leo) pages | Out of scope for this spec; leo pages standardize on `--leo-accent` (#00DF81); intro-leo is in-scope and remaps `--accent` to leo accent. Project-wide palette migration of remaining 27+ pages is a separate later task. |

---

## 12. Definition of Done

- [ ] 3 leo pages render correctly on Chrome / Safari / Edge desktop + iOS Safari + Android Chrome
- [ ] `prefers-reduced-motion: reduce` disables Lenis, sets all `--leo-dur-*` to 0, marks all reveal elements immediately visible
- [ ] Keyboard-only Tab navigation works on all 3 pages with visible focus
- [ ] Lighthouse mobile: a11y ≥ 90, performance ≥ 80
- [ ] `landing-leo.html` ↔ `landing.html` 1-second side-by-side comparison possible (different browser tabs)
- [ ] `robots.txt` + `sitemap.html` updated; leo pages excluded from index
- [ ] `git diff landing.html intro.html index.html shared.css` is empty (3 originals + shared.css unchanged)
- [ ] All 11 landing-leo section copy strings match `landing.html` character-for-character
- [ ] No type-selector layout rules in `shared-leo.css`
- [ ] Spec committed to git

---

## 13. Out-of-Spec Follow-ups (for later)

- Other 27 site pages (faq, market, mypage, sample, level_test, etc.) Leonardo treatment
- Migration of project-wide accent from `#2DD4BF` to `#00DF81` (separate cleanup spec)
- Real student review/testimonial integration (when first cohort delivers data)
- Real-time grade-improvement chart (currently a placeholder in `index.html#grade-graph`)
- Dark/light mode toggle (currently dark-only)
- Internationalization (English mirror of leo pages)
