# Terra Nova Landing Page — Design Spec

**Date**: 2026-04-24
**Status**: Design approved, pending implementation plan
**File target**: `landing.html` (root, coexists with existing `index.html`)
**Reference**: Persuasion structure adapted from YouTube video references on detail-page design (선언-증명-효익 / 주장-증명-설명-변화 frames)

---

## 1. Executive Summary

A new marketing landing page that applies persuasion design principles to Terra Nova's core differentiation ("영어로 전과목 공부"). Built for a **zero-customer launch** — no real reviews, statistics, or student testimonials yet — so evidence is sourced entirely from the product itself (teaching material, curriculum mapping table, and editorial methodology).

Existing `index.html` and `subscription_detail_complete.html` are **not modified**. `landing.html` exists alongside them for testing and will replace `index.html` only after validation.

### Value Delivered — 4 Perspective Table

| Perspective | Current Problem | New Landing Solution |
|---|---|---|
| **Problem** | Pages don't persuade; conversion feels unlikely. Fake metrics ("5,800+ 학생", "97% 성적 향상") create legal + brand risk. Two pages have overlapping roles. | Honest zero-customer positioning; no fabricated evidence. |
| **Solution** | Restructure flow as parent-focused sales narrative following video's 주장-증명-설명-변화 arc. | 9-section page: Hero → Pain → Proof → Logic → Change → Makers → Plans → FAQ → CTA. |
| **Function UX Effect** | Parent reaches decision with full transparency; student voice is used as proof, not co-pilot. | Primary CTA scrolls to evidence, not checkout — respects zero-customer trust calibration. |
| **Core Value** | Page's "differentiation" (curriculum-linked reading) is preached but not proven. | Mapping table and sample passage make the differentiation visible, not claimed. |

---

## 2. Scope & Constraints

### In scope
- Create new `landing.html` at project root.
- Reuse existing Terra Nova design tokens (colors, fonts, VS diagram component).
- Reuse existing helper pages: `sample.html`, `level_test.html`, `order.html`, `faq.html`.
- Data assets needed: curriculum mapping table (5 sample rows across 10 levels), one full sample passage.

### Out of scope
- No modification of `index.html` or `subscription_detail_complete.html`.
- No removal of fake stats from `subscription_detail_complete.html` (tracked separately — recommended urgent action but not part of this spec).
- No implementation (this spec terminates at implementation planning handoff).

### Hard constraints
- **Absolute prohibition**: no fabricated testimonials, student reviews, statistics, grade improvements, student counts, or stock-photo faces.
- **Copyright prohibition**: no reproductions of competitor textbook page spreads (V1 typography mockup only for comparison visuals).
- **Policy accuracy**: every policy statement (refund, cancellation, early-bird transition) must reflect actual operational capability.

---

## 3. Audience & Voice

### Audience (C2 approach)
- **Primary reader**: 고등 학부모 (payer + decision-maker). All hero, empathy, pricing, and CTA copy speaks in parent voice.
- **Student as proof**: Student-facing content (sample passages, readability evidence) appears in Section 3 (Proof) to address parent concern "아이가 실제로 이걸 할까?" — student is never addressed directly as primary reader.

### Voice rules
- Parent's actual language, not brand marketing-ese.
- No rhetorical questions with awkward Korean structure (e.g., "수학은 누가 봅니까" — rejected).
- Numbers come after context, not before.
- Transparency over polish.

### Maker display choice: D
- No faces, no real names in promotional placement.
- Creator section moved to **page rear** (Section 6).
- Hero and proof rely on product evidence + methodology, not founder/teacher personality.

---

## 4. Page Architecture

### Section flow

| # | Section | Customer Question | Video Frame Role |
|---|---|---|---|
| 1 | Hero | "What is this?" | 선언 (main hook) |
| 2 | 공감 (Empathy) | "Why me?" | 상황 |
| 3 | 증명 (Proof) | "Does it work?" | 증명 (page spine) |
| 4 | 설명 (Logic) | "Why does this method work?" | 설명 |
| 5 | 변화 (Change) | "What shifts for me?" | 변화 |
| 6 | 누가 만듦 (Makers) | "Who's behind this?" | 신뢰 (deferred to rear) |
| 7 | Plans + LIGHT earlybird + risk reversal | "Why now?" | 긴급성 |
| 8 | FAQ (3 minimal) | "Am I safe?" | 안심 |
| 9 | Final CTA | "What do I do?" | 행동 |

### Removed / avoided from existing pages
- ❌ "5,800+ 학생 / 97% 성적 향상 / 연간 4,645,000원 절약"
- ❌ Nine-item pain-point listing (compressed to 3)
- ❌ "쏟아지는 실제 후기" section
- ❌ Two competing price tables on one page
- ❌ Brand philosophy question ("영어는 언어입니다") in hero position

### Reused from existing pages
- ✅ Rich Black + Dark Green palette, Caribbean Green accent `#00DF81`
- ✅ Axiforma + Noto Sans KR typography
- ✅ VS comparison diagram component
- ✅ Risk/cost comparison table (학원 vs 인강 vs Terra Nova)
- ✅ `sample.html` and `level_test.html` as referenced destinations

---

## 5. Section-by-Section Detail

### Section 1 — Hero

**Layout**
- Kicker: "매달 한 권, 교과 연계 수능 영어 학습지"
- H1: **"영어 한 지문에, 수학 한 단원이 들어 있습니다."** ("수학 한 단원" accented in Caribbean Green)
- Divider line
- Subhead: "영어 지문 한 편 = 수학·과학·사회 교과서 한 편. 한 권으로 영어 공부하면서 전과목 배경 지식까지 동시에 쌓입니다."
- Visual evidence (V1 typography mockup): left-side "교과서 메타데이터 카드" (단원 번호 + 단원명, typography only, no reproduced textbook imagery) ↔ right-side Terra Nova sample passage page (owned asset).
- Feature chips: `📚 매달 1권 · 월 20지문` / `🎯 수학·과학·사회 교과 연계` / `✅ 언제든 해지 · 레벨 변경`

**CTA hierarchy**

| Tier | Button | Destination | Style |
|---|---|---|---|
| Primary | `교과 매칭표 미리보기` | `#proof` (in-page scroll) | Green fill |
| Secondary | `첫 구독 시작하기` | `#plans` (in-page) | Dark ghost |
| Tertiary | `무료 샘플 받기` · `레벨 테스트` | `sample.html`, `level_test.html` | Text links |

**Scarcity line** (hero bottom, small): "LIGHT 플랜 첫 100명 얼리버드 모집 중 — 마감 시 정가 전환"

**Not in hero**: no price, no fabricated social proof, no brand philosophy copy, no teacher faces.

### Section 2 — 공감 (Empathy)

**Header**
- Kicker: "왜 이 교재가 필요한가"
- H2: **"영어 공부 1시간이, 영어에서만 끝나고 있습니다."**
- Subtitle: "고등 학부모가 실제로 털어놓는 세 가지 딜레마"

**3 Pain Cards** (order reflects brand identity priority)

1. **🧩 통합 학습 부재** — "영어 지문엔 과학·철학·경제가 나옵니다. 학교 수업과 왜 따로 놀까요?" + 2-3 line explanation.
2. **💰 비용 부담** — "전과목 학원은 월 100만 원. 한 과목도 빼기 불안합니다" + explanation.
3. **⏱️ 시간 효율** — "같은 한 시간을, 두 배로 쌓고 싶습니다" (re-framed from "영어 시간 줄이자" which would contradict brand identity).

**Bridge**: "그래서 Terra Nova는 — 영어 지문 한 편에 교과서 한 단원을 담았습니다. ↓ 증거를 보여드립니다"

### Section 3 — 증명 (Proof, page spine)

**Header**
- Kicker: "Terra Nova의 증거"
- H2: **"후기 대신, 교재 그 자체를 보여드립니다."**
- Subtitle: "아직 후기는 쌓이지 않았습니다. 대신 첫 배송본 안쪽을 전부 열어 보여드립니다."

**Block A — Curriculum mapping table** (approach B: spectrum across 10 levels)

Title: "10단계 × 학년별 교과 매칭 — 대표 5지문"

Sample rows (actual data to be finalized by editorial team at launch):

| 레벨 | 학년 | 지문 주제 | 연계 교과·단원 | 핵심 개념 |
|---|---|---|---|---|
| MOON | 초3 | Animal Habitats | 초3 과학 · 동식물의 한살이 | 서식지 |
| VENUS | 초6 | Why Democracy Works | 초6 사회 · 민주 정치 | 의사결정 |
| NEPTUNE | 중2 | Energy Transformation | 중2 과학 · 에너지 전환 | 에너지 변환 |
| SATURN | 고1 | Compound Interest and Exponential Growth | 수학Ⅰ · 지수와 로그 | 복리/지수 증가 |
| SUN | 고3 | Market Equilibrium in Global Trade | 사회·문화 · 경제 | 수요/공급 |

**Scope decision**: 5 sample rows visible on page. Full monthly mapping (20 passages per level) delivered via email PDF. Rationale: 5 sample + lead capture balances evidence density with funnel economics.

**Block B — One full sample passage** embedded in page (English text + short explanation + label "This passage connects to SATURN-level · 수학Ⅰ 지수와 로그"). CTA: "해설 포함 전체 샘플 PDF 받기" (email capture). Also links to existing `sample.html`.

**Block C — Comparison checklist** (learning effectiveness, not cost — cost comparison belongs in Section 7)

| 항목 | 일반 영어 교재 | Terra Nova |
|---|---|---|
| 지문 주제 | 임의 선정 | 교과 단원과 1:1 매칭 |
| 학습 결과 | 영어 실력 | 영어 + 전과목 배경 지식 |
| 해설 범위 | 문제 풀이 중심 | 배경 지식 연결까지 |
| 시간 효율 | 영어 1시간 = 영어 1시간 | 영어 1시간 = 영어 + 전과목 배경 1시간 |
| 수능 대비 | 문제 유형 훈련 | 유형 + 주제 친숙화 |

**Block D — Bridge**: "왜 교과 연계 독해가 수능에 더 유리한지 — 아래에서 논리로 설명드립니다. ↓"

### Section 4 — 설명 (Logic)

**Header**
- Kicker: "작동 원리"
- H2: **"수능 영어는 '문법'이 아니라 '배경지식' 싸움입니다."**
- Subtitle: "학부모 대부분이 놓치는 수능 영어의 실제 작동 원리"

**3 Logic points**
1. **수능 영어 지문 주제 분포 (empirical)** — small chart of past 5-year subject distribution from publicly available analyses (교육평가원/EBS sources cited inline). No fabrication.
2. **배경지식 = 풀이 속도** — example box: "지수함수를 배운 학생이 *Compound Interest* 지문을 읽을 때" — framed as mechanism, not claimed result.
3. **이중 학습 효과** — vocabulary mapping table: 지수 → exponential, 생태계 → ecosystem, 수요 → demand, 정체성 → identity.

**Bridge**: "그래서 구독 첫 달, 무엇이 어떻게 달라지는지 — 생활 단위로 보여드립니다. ↓"

### Section 5 — 변화 (Change)

**Header**
- Kicker: "구독 첫 달"
- H2: **"영어 공부한 시간이, 수학·과학 공부한 시간이 됩니다."**
- Subtitle: "구독 첫 달, 하루 한 지문으로 달라지는 공부 구조"

**Block A — 첫 배송본 transparency** (plan-aware display)

All plans include:
- 📋 20지문 × 교과 연계 매칭 리스트
- ✏️ 지문별 해설 + 어휘장
- 🗓️ 월간 학습 플랜 (하루 1지문 × 5일 × 4주)

Plan-specific delivery:
- **LIGHT**: 📑 PDF 교재 1권 (월 20지문)
- **STANDARD / PREMIUM**: 📘 실물 교재 1권 (월 20지문) + 실전 모의고사 2회 + 단어 암기장 + 시험지 + 배송비 무료
- **PREMIUM only**: + 입시뉴스 카톡방 + 카카오톡 질문방 + 해설강의(준비중)

(No next-month preview — editorial schedule cannot promise forward content.)

**Block B — Daily routine visualization**
- 하루 15~20분 · 지문 1편
- 주 5일 (월~금) · 주당 5지문
- 한 달 4주 · 월간 20지문
- Comparison: 영어 학원 왕복 시간 ≈ 주당 5h (Terra Nova의 ≈10배)

**Block C — 3 designed-in mechanism effects** (NOT outcome promises)
1. 주제 친숙도 축적 — 학교에서 배우는 수학·과학·사회 주제 20편이 영어 지문으로 다시 노출.
2. 이중 어휘 습득 — 교과 개념의 영어 표현을 자연스럽게 익힘.
3. 학습 시간 배분 여유 — 영어 시간이 영어 + 전과목 배경 1시간이 되므로 시간 재배분 여지.

**Block D — Monthly cycle** (5 passages/week)

| Week | Focus | Output |
|---|---|---|
| 1 | 5지문 (주제 탐색) | 주차별 어휘 정리 |
| 2 | 5지문 (심화 독해) | 주제 연결 맵 |
| 3 | 5지문 (수능 유형 적용) | 유형별 풀이 노트 |
| 4 | 5지문 + 월간 테스트 | 월간 학습 기록 |

**Not included**: fabricated grade results, fake before/after, hypothetical student profiles.

### Section 6 — 누가 만듦 (Makers, deferred rear placement)

**Header**
- Kicker: "제작진"
- H2: **"기획·집필은 입시 현장에서 왔습니다."**
- Subtitle: "Terra Nova 교재는 현직 입시강사들의 협업으로 매달 제작됩니다."

**Block A — Anonymized credentials** (D-mode: no faces, no names, collective ledger only)

Display only items that are actually true; omit others:
- SKY 출신 영어 전공 · 강남·목동·대치 현직 입시강사
- 수능 영어 지도 경력 총합 30년 이상
- 모의고사 출제·분석 경험 보유
- 고교 영어 교과서 집필/검토 경력 포함 여부 (if applicable)

**Block B — 편집 원칙** (the real trust asset for this section)
1. 교과 1:1 매칭 원칙 — 모든 지문은 해당 레벨 학년의 교과 단원과 1:1 대응.
2. 수능 경향 추적 원칙 — 분기별 수능·모의평가 주제 분석 결과를 다음 호 주제 비중에 반영.
3. 이중 해설 원칙 — 해설은 문제풀이 + 배경 지식·교과 연결.
4. 실전 난이도 원칙 — 지문 어휘·구문 난이도는 실제 수능 기출 기준선에 맞춤.

**Not included**: stock photos, fake profile cards, self-bestowed superlatives ("업계 최고" / "1위").

### Section 7 — Plans + LIGHT earlybird + risk reversal

**Header**
- Kicker: "플랜 선택"
- H2: **"첫 구독, 세 가지 플랜에서 고르세요."**
- Subtitle: "월 구독 · 언제든 해지 · 레벨 변경 자유"

**Block A — 3 Plan cards**

| 플랜 | 가격 | 대상 | 포함 |
|---|---|---|---|
| LIGHT (PDF) | 11,900원/월 | 비용 효율 · 자기주도 학습 | PDF 교재 (20지문 + 해설 + 어휘장 + 학습 플랜) |
| STANDARD (PDF + 실물) | 24,900원/월 | 실물 교재 + 시험 준비 | LIGHT + 실물 책 + 실전 모의고사 2회 + 단어 암기장 + 시험지 + 배송 무료 |
| PREMIUM | 58,900원/월 | 질문·상담 필요 | STANDARD + 입시뉴스 카톡방 + 카카오톡 질문방 + 해설강의(준비중) |

**No "가장 인기" badge** — zero-customer state makes that a false social proof. Plan labels indicate **who the plan fits**, not popularity.

**Block B — LIGHT earlybird banner** (inside LIGHT card)
- "🎯 런칭 멤버십 — 첫 100명 한정"
- 첫 달 50% 할인: LIGHT 11,900원 → 5,950원
- "이후 정상가 11,900원/월로 자동 전환 · 언제든 해지 가능" (dark-pattern avoidance — transition explicitly disclosed)
- Progress: "현재 [N]/100명 모집" (actual number, "0/100 모집 시작" if truly zero).

**Block C — Comparison table** (cost axis)

| 비교 항목 | 일반 학원 | 인터넷 강의 | Terra Nova |
|---|---|---|---|
| 월 수업료 | 400,000원 | 100,000원~ | **11,900원~** |
| 교재비 | 별도 | 별도 | 포함 |
| 교과 연계 | ✕ | ✕ | ✓ |
| 해설 | 수업 중만 | 강의 내만 | 교재에 포함 |
| 해지 자유도 | 학기 단위 | 강좌 단위 | 월 단위 |

**Caption under table**:
> *학원비 400,000원은 수도권 고등 영어 입시 학원 평균 기준. 초·중등 학원은 평균 월 25~30만 원대.*
> *영어 학원비에 월 40만 원. Terra Nova는 11,900원부터 시작합니다.*

**Block D — Risk reversal** (horizontal list)
- ✅ 런칭 멤버 50% 할인 (LIGHT 첫 달)
- ✅ 월 단위 해지 자유
- ✅ 레벨 변경 자유
- ✅ 결제 전 샘플 전문 공개
- ✅ 배송 무료 (STANDARD / PREMIUM)

(No 환불 보장 — refund is explicitly not offered. Honesty is maintained via samples + cancel freedom.)

**Block E — CTA** (same hierarchy as final CTA but mid-page)

### Section 8 — FAQ (minimized, 3 items only)

Decision X1: landing FAQ serves only as last-mile objection killer. Full FAQ lives at `faq.html`.

**Header**
- Kicker: "자주 묻는 질문"
- H2: "결정 전에 확인하시는 3가지"

**Q1. 환불은 되나요?**
> 환불은 제공하지 않습니다. 대신 결제 전 샘플 지문 전문을 공개하고, 월 단위 해지가 자유롭습니다. 구독 중 다음 달 결제 이전에 해지하시면 이후 비용이 발생하지 않습니다.

**Q2. 얼리버드 할인은 끝나면 어떻게 되나요?**
> 첫 100명 한정 50% 할인은 해당 멤버의 첫 달에만 적용됩니다. 둘째 달부터는 정상가(11,900원/월)로 자동 전환됩니다. 100명 모집 후엔 얼리버드 신규 가입이 중단됩니다.

**Q3. 영어 기초가 약한데 가능한가요?**
> 초3부터 고3까지 10단계 레벨로 나눠 놓았습니다. 행성 이름(MOON, MERCURY, MARS, VENUS, TERRA, NEPTUNE, URANUS, SATURN, JUPITER, SUN)으로 구분되며, 시작 전 무료 레벨 테스트로 적합한 레벨을 확인하실 수 있습니다.

**Bottom link**: "더 많은 질문 → 전체 FAQ 보기 (`faq.html`)"

### Section 9 — Final CTA

**Header**
- Kicker: "지금 시작합니다"
- H2: **"Terra Nova의 첫 100명, 오늘 당신입니다."**
- Subtitle: *"샘플을 확인하셨다면, 시작할 시간입니다."*

**Block A — CTA hierarchy**
- **Primary** (big centered button): `LIGHT 얼리버드 시작하기 — 첫 달 5,950원` → `order.html?plan=light&ref=earlybird`
- **Secondary row**: `STANDARD 구독하기 — 24,900원/월` · `PREMIUM 구독하기 — 58,900원/월` · `무료 레벨 테스트 먼저` (→ `level_test.html`)
- **Tertiary text links**: 무료 샘플 지문 받기 (→ `sample.html`) · 더 많은 질문 (→ `faq.html`)

**Block B — Scarcity indicator**
> ⓘ LIGHT 얼리버드 현재 **[N]/100명** 모집 중 · 100명 달성 시 정가 전환

**Block C — Final trust strip**
> ✅ 결제 전 샘플 공개  ✅ 월 단위 해지 자유  ✅ 레벨 변경 자유  ✅ STANDARD/PREMIUM 배송 무료

**Not included**: fake countdown timers, FOMO exaggeration, forced modals.

---

## 6. Design System

### Colors (existing Terra Nova palette, reused)
- Background: Rich Black `#02021B` family
- Dark surface: Dark Green `#032221`
- Mid surface: Bangladesh Green `#03624C`
- Accent: Caribbean Green `#00DF81`
- Text primary: Anti-Flash White `#F1F7F6`

### Typography
- Latin: Axiforma (Regular / Medium / Semi Bold)
- Korean: Noto Sans KR (500 / 700 / 800 / 900)
- H1: ~clamp(2.2rem, 5.8vw, 4rem), Noto Sans KR 900
- H2: ~clamp(1.8rem, 4.2vw, 2.9rem), Noto Sans KR 800
- Body: 1rem, Noto Sans KR 500

### Section background rhythm
- Sections 1 / 2 / 5 / 9: `var(--dark)`
- Sections 3 / 6 / 7 / 8: `var(--mid)`
- Section 4: slight gradient on `var(--mid)` to visually mark logic/reasoning block.

### Responsive
- Hero headline: `<br class="mobile-br">` line break control
- Plan cards: 3-col desktop, vertical stack mobile
- Mapping table: scroll on desktop, card stack on mobile
- Primary CTA: full-width on mobile

---

## 7. Data Assets Required at Launch

| Asset | Owner | Timing |
|---|---|---|
| Curriculum mapping table — 5 sample rows | Editorial team | Pre-launch |
| Full sample passage (1 passage + explanation) | Editorial team | Pre-launch |
| Full monthly mapping (20 passages × 10 levels) — PDF | Editorial team | Pre-launch (for email delivery) |
| 수능 영어 지문 주제 분포 chart source citations | Marketing / editorial | Pre-launch |
| LIGHT earlybird counter (current `[N]/100`) | Operations | Dynamic (live count) |
| Kakao channel link for support (if mentioned) | Operations | Verify existence before linking |

---

## 8. Honesty Principles (non-negotiable)

1. No fabricated testimonials, student reviews, or stock-photo faces.
2. No fake statistics or student counts.
3. No manufactured urgency (countdown timers, fake stock).
4. Explicit disclosure of auto-renewal pricing transitions.
5. No grade-improvement claims — only mechanism descriptions.
6. No competitor textbook image reproduction (V1 typography mockup only).
7. Existing fake stats on `subscription_detail_complete.html` flagged separately for removal (`5,800+ 학생`, `97% 성적 향상`, `4,645,000원 절약`).

---

## 9. Success Criteria

- All 9 sections render correctly on Desktop (≥1024px) and Mobile (≤480px).
- Hero's 시각 증거 V1 typography mockup renders without external textbook imagery.
- CTA hierarchy is unambiguous — single primary button per section.
- LIGHT earlybird banner displays actual counter and auto-transition disclosure.
- Section 8 has exactly 3 FAQs linking to `faq.html` for depth.
- Final CTA subtitle reads: "샘플을 확인하셨다면, 시작할 시간입니다."
- No copy contains fabricated numbers, testimonials, or outcome promises.
- Page passes accessibility check (color contrast, headline hierarchy, semantic HTML).

---

## 10. Open Items (deferred to implementation)

- Final editorial data for 5 mapping sample rows.
- Final sample passage text.
- Exact LIGHT earlybird discount mechanics (pricing engine integration).
- Kakao channel verification.
- 수능 영어 지문 주제 분포 chart data source citations (which year range, which analyses).
- Decision on whether to also remove fake stats from `subscription_detail_complete.html` (recommended but out of scope for this spec).
