# Terra Nova — 프로젝트 가이드 (CLAUDE.md)

테라노바(상호명: **테라노바**, 사업자등록증 기준) 영어 교육 서비스. 구독형 월간 교재 +
모의고사 분석지/워크북 단품 판매. 정적 HTML 프론트 + Supabase(Edge Functions/DB/Storage) 백엔드.

---

## 🤝 협업 규칙 (둘 이상이 같이 작업 — 가장 중요, 항상 적용)

이 저장소는 **여러 명이 GitHub를 공유**하며 함께 수정한다.
원격: `https://github.com/taefung7-stack/Terra_Nova` (브랜치: `main`).

### 핵심 습관 — "작업 전 pull, 작업 후 push"

같은 파일을 번갈아 수정하므로, 항상 **최신본 위에서 작업하고 끝나면 바로 올린다.**

1. **작업을 시작하기 전에 반드시 먼저 원격 최신본을 받는다.**
   - 사용자가 새 작업을 요청하면, 코드를 건드리기 **전에** `git pull --rebase origin main` 을 먼저 실행할 것.
   - pull 중 충돌이 나면 즉시 사용자에게 알리고 [충돌 대응](#충돌이-나면) 절차를 따른다.

2. **작업이 끝나면(또는 한 단위가 끝날 때마다) 바로 커밋하고 push 한다.**
   - 이 프로젝트는 변경 완료 시 자동 배포 정책: 사용자가 "배포해줘"라고 하지 않아도
     작업 완료 시 `git add` → `git commit` → `git push origin main` 까지 진행한다.
   - 작업을 오래 멈추거나 자리를 비울 때도 진행 중인 것을 commit + push 해 두어
     상대방이 최신본을 받을 수 있게 한다.

3. **push 가 거부되면(rejected — 상대가 먼저 올림)** 당황하지 말고:
   - `git pull --rebase origin main` 으로 상대 변경을 먼저 받은 뒤 다시 push.
   - 충돌이 나면 [충돌 대응](#충돌이-나면).

### 충돌이 나면

둘이 같은 파일의 같은 부분을 고치면 git 이 충돌(conflict)을 표시한다.
- 충돌 파일을 열어 `<<<<<<<` / `=======` / `>>>>>>>` 마커 사이의 양쪽 내용을 확인한다.
- **어느 쪽도 함부로 지우지 말 것.** 두 변경의 의도를 사용자에게 설명하고,
  어떻게 합칠지 확인받은 뒤 정리한다. 애매하면 사용자에게 물어본다.
- 정리 후 `git add <파일>` → `git rebase --continue`(또는 commit) → push.

### 협업 시 하지 말 것
- `git push --force` / `--force-with-lease` 는 상대 작업을 덮어쓸 수 있으니 **사용자가 명시적으로 요청하지 않는 한 금지.**
- `main` 브랜치 외 다른 브랜치로 임의 전환 금지 (사용자가 요청하면 OK).
- 상대가 올린 커밋을 `git reset --hard` 등으로 되돌리는 파괴적 작업 금지.

---

## 📁 프로젝트 구조

- **루트 `*.html`** — 사이트 페이지 (index, landing, market, market_checkout, mypage,
  login, signup, payment-complete, admin 등). 정적 호스팅.
- **`supabase/`** — 백엔드.
  - `functions/` — Edge Functions (create-order, portone-webhook, dispatch-order-pdf,
    dispatch-monthly-pdf, send-email, send-sample 등). Deno 런타임.
  - `migrations/` — DB 스키마 마이그레이션 (번호순).
- **`textbook/`** — 월간 구독 교재 생산 파이프라인 (Schema v2.2, build-fullbook).
  자체 `package.json` / `node_modules` / `tools/` 보유.
  - **각주 어휘 규칙 (모든 고1·2·3 지문, 2026-07~)**: 각 지문 page1 우측 하단 각주
    글로서리는 **최소 3~4개** 단어를 보여야 함. 본문 `<u>`/`<mark>` 자동 감지(보통 1~2개) +
    `page1.gloss_extra: [{ "term", "ko" }]`(그 지문에서 가장 어렵거나 전문/학술적인 단어,
    본문에 실제 등장, ko≤40자)로 채운다. 렌더러가 합쳐 최대 4개 노출
    (`render.js` MAX_PAGE1_GLOSSARY_TERMS=4). 스키마: `schemas/passage.schema.json` page1.gloss_extra.
  - **완성본 백지(blank) 3장 규칙 (전 학년 공통, 2026-07~ 신규 월호부터)**: `_finalize-*` 합본
    스크립트는 완성본을 반드시 다음 순서로 만든다 —
    **앞표지 → [백지] → 판권(colophon) → [백지] → 본문 → [백지] → 뒷표지**.
    즉 표지 뒤 1장 / 판권 뒤 1장 / 뒷표지 앞(본문 뒤) 1장, 총 백지 3장.
    백지는 빈 A4(595.28×841.89pt) 한 장. **뒷표지는 초등/고등 전 학년 공통**:
    `dist/2026-07/7월 뒷표지.png`(없으면 해당 월 공통 뒷표지). 새 달 `_finalize-*` 스크립트를
    만들 때 이 구조(백지 3장 + 공통 뒷표지)를 반드시 포함. 참조 구현: `tools/_finalize-2026-07-highschool.mjs`.
    (2026-06 이전 출고분은 소급 적용 안 함.)
- **`mock-exam-analysis/`** — 모의고사 분석지·워크북 빌더 (v1.0 LOCKED).
  - `builder/build.mjs` (분석지), `build-workbook.mjs` (워크북), `pdf-image.mjs` (글리프 안전 PDF),
    `finalize-combined.mjs` (표지+본문 병합), `combine*.mjs` (합본).
  - 회차 데이터: `2026-june-grade{1,2}/data/{N}.json` + `{N}-workbook.json`.
  - `tools/upload-mock-pdfs.mjs` — 회차 PDF 를 Supabase Storage 로 업로드.
- **`assets/` `dist/`** — 정적 자산 / 빌드 산출물.
- **`docs/`** — 설정·정책 문서.

---

## ⚙️ 자주 쓰는 작업

### 모의고사 빌드 (mock-exam-analysis 안에서)
```bash
npm run build:june    # 고2 분석지   /  build:june1  = 고1
npm run workbook:june # 고2 워크북   /  workbook:june1 = 고1
```
- 빌드 후 `builder/check-overflow.mjs <html>` 로 페이지 넘침(overflow) 검사. **overflow 0 이 절대 조건.**
- `march` dist 는 잠금(LOCKED) — 재빌드 금지.

### 결제 → PDF 자동 이메일 발송 (완성됨)
흐름: market 결제 → PortOne → `portone-webhook` → `dispatch-order-pdf`(round_meta 로
PDF 경로 매핑) → `send-email`(다운로드 링크 메일).
- 회차 PDF 경로: `textbook-pdfs/mock/{YYYY-MM}/grade{1,2}-{analysis,workbook}.pdf`
- 새 회차 업로드: `mock-exam-analysis` 에서
  `SUPABASE_SERVICE_ROLE_KEY=... node tools/upload-mock-pdfs.mjs --month YYYY-MM`
  (service_role 키는 Supabase Studio > Settings > API Keys, `eyJ` 로 시작하는 Legacy JWT).
- Edge Function 수정 후 배포: `supabase functions deploy <name> --no-verify-jwt`

### ⛔ 절대 클라우드에 올리면 안 되는 것
- **Impact7 / 내부·검토용 PDF 는 Storage 에 절대 업로드 금지.** 판매본은 **Terra Nova 정식본만.**
  (`upload-mock-pdfs.mjs` 에 파일명 `impact` 차단 가드가 있으나, 수동 업로드 시에도 반드시 지킬 것.)

---

## 📌 핵심 정책

- **상호명 표기**: 법적 표기는 **테라노바** (사업자등록증 일치, 카카오페이 가맹심사 요청).
- **가격 권위 소스**: 구독 가격은 `landing.html` 이 기준. 변경 시 동기화 대상 다수 — 임의 변경 주의.
- **Supabase 세션**: 페이지에서 `supabase.auth.getUser()` 직접 호출 금지 →
  `getSession()` + `session?.user` 패턴 사용 (모바일 race 로 미로그인 오인식 방지).
- **모바일 셸**: `mobile-app.css/js` 가 ≤680px 화면 전담. `body` 에 transform 금지(fixed 깨짐).
- **커밋 메시지**: 한국어 권장, 무엇을·왜 바꿨는지 명확히. 마지막 줄에
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` 포함.
