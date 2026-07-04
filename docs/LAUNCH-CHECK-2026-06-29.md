# 테라노바 판매개시 전 전체 최종점검 리포트

- 점검일: 2026-06-29
- 범위: 프론트 22페이지 + Edge Functions 9종 + Migrations 19종 (결제·인증·PDF발송·구독·법무·중등게이팅)
- 방법: 6개 영역 병렬 전문 점검 + 핵심 결함 직접 소스 대조 검증
- **판정: 🔴 차단 1건 수정 후 판매개시 가능** (초등·고등·모의고사는 판매 준비 완료)

---

## 🔴 차단 (판매개시 전 반드시 수정) — 1건

### 중등부(중1 TERRA·중2 NEPTUNE·중3 URANUS) 구독이 결제 관문에 열려 있음 → "결제됐는데 PDF 못 받음"
사용자가 명시한 "중등부 교재만 미완료"인데, **결제 파이프라인 전 구간이 중등 레벨을 정상 상품으로 허용**한다. 독립 에이전트 2개가 동일 결함을 지목했고 직접 소스로 확정.

- **`order.html:476–490`** — TERRA/NEPTUNE/URANUS가 클릭 가능한 `level-btn`(`selectLevel`)으로 노출. 학년/미판매 가드 없음. (STANDARD/PREMIUM은 "준비중" 게이팅 있으나 **레벨에는 없음**.)
- **`supabase/functions/create-order/index.ts:39`** — `VALID_LEVELS`에 `'TERRA','NEPTUNE','URANUS'` 포함 → 중등 구독 주문 승인·결제.
- **`portone-webhook/index.ts:385`** — 결제완료 시 중등 레벨로 `subscriptions` active INSERT.
- **`dispatch-monthly-pdf/index.ts:37`** — 중등 발송 시도(`{month}-TERRA.pdf` 등). **차단 유일 지점 = 파일 부재**(코드 게이팅 아님). 파일이 하나라도 올라가면 즉시 발송.

**영향**: 실결제 발생 → active 구독 생성 → PDF 미발송 → 환불·CS. 현재는 "파일이 없어서" 우연히 발송만 안 될 뿐, 코드상 열려 있어 안전하지 않음.

**수정(결제 관문에서 원천 차단)**:
1. `order.html`의 TERRA/NEPTUNE/URANUS 3개 버튼을 `disabled`+"준비중" 처리(STANDARD/PREMIUM 방식).
2. `create-order`의 `VALID_LEVELS`에서 중등 3종 제거(서버 방어 — UI 우회 결제도 400 거절).
   → 이 둘만 막으면 구독 생성 자체가 불가 → dispatch/send-sample까지 자동 차단.

---

## 🟡 권고 (판매 차단 아님, 오픈 직후 정리 권장)

| # | 위치 | 내용 |
|---|---|---|
| 1 | portone-webhook `activateSubscription` (:385) | **활성 구독 중복 생성**: 이미 active인 유저가 재결제하면 payment_id가 달라 중복체크 통과 → active 2건 → renew가 양쪽 이중빌링. INSERT 전 기존 active 확인 후 연장 처리 권장. |
| 2 | naver-oauth `index.ts` CORS | `Access-Control-Allow-Origin:'*'` → `terra-nova.kr` 화이트리스트 권장. state 서버측 이중검증 추가 고려(현재 클라이언트 localStorage 검증만). |
| 3 | index/landing/level_test | 중등 마케팅 카드·레벨테스트 추천이 중등을 노출(결제불가지만 기대 형성). 오픈 시점 정리. |
| 4 | index.html:10 canonical | 홈(=index.html)이 landing.html을 canonical로 지정 → 홈이 색인 안 됨. `/` 또는 자기 URL로 교정. |
| 5 | exam-match.html·subscription.html | OG 태그 없음 → 공유 시 이미지 없는 카드. 4줄 추가 권장(assets/og/ 이미 존재). |

## 🟢 경미
- `market_checkout.html:481` 죽은 UI 코드(`#pay-notice`/`.pay-method` null-guard됨) 정리.
- 중복 `<title>` 7개 페이지, faq.html "테라 노바" 띄어쓰기 혼용(법무·푸터는 "테라노바" 정확).

---

## ✅ 점검했으나 문제없음 (판매개시 안전 근거)

- **결제 보안**: webhook HMAC-SHA256 서명검증(±5분 리플레이 방지·상수시간 비교), 서버 canonical price 2중검증(프론트 금액 미신뢰), orphan 결제 거절, portone_payment_id UNIQUE 멱등성, 취소/실패 처리. 테스트키·mock 모드 잔존 없음. `config.toml` verify_jwt(create-order=true·webhook=false) 정상.
- **인증/세션**: `getUser()` 직접호출 규칙 위반 0건(getSession 패턴 준수), 프론트 시크릿 노출 0건(anon 키·공개 OAuth ID만 노출·정상), 로그인/회원가입/네이버OAuth/세션갱신/로그아웃/보호페이지 리다이렉트 정상.
- **RLS**: profiles·subscriptions·orders·products·events·storage 전부 RLS enabled + 본인scope/admin 정책. 남의 주문·PDF 접근 불가.
- **모의고사 발송(마켓 실판매 대상)**: 2026-06 grade1/2/3 × analysis/workbook/variant **9종 전부 Storage 업로드 확인**. dispatch 화이트리스트 매핑 완전. Impact7 차단 2중(dispatch 화이트리스트 + 업로드 파일명 필터).
- **월 게이팅(KST)**: dispatch-monthly-pdf·send-sample 모두 UTC+9 보정, 그달 것만 발송.
- **가격 일관성**: LIGHT 11,900 / STANDARD 24,900 / PREMIUM 58,900 전 페이지 일치. STANDARD·PREMIUM은 "준비중" 일관 게이팅(현재 판매가능 = LIGHT 단독). 단품(단어장·모의고사) 자체 일관.
- **사업자정보(전상법 13조)**: site-config.js 단일소스(상호 테라노바·대표 강성엽·사업자 160-50-01039·통판 제2026-서울마포-1110호)를 terms/privacy/refund/footer가 `data-biz` 런타임 주입으로 표시(placeholder는 fallback). 디지털콘텐츠 청약철회 제한·환불기준·분쟁조정(1372) 명확.
- **모바일 셸·nav**: body transform 금지·`role="navigation"` 탭바·nav 셀렉터 스코프 준수(전역 누수 없음). 깨진 링크·미로드 스크립트·이미지 0건.

---

## 결론
판매 파이프라인의 **보안·결제·발송·법무 기반은 견고**하다. 초등(Mars/Venus)·고등(Saturn/Jupiter/Sun)·모의고사(고1·2·3 6월)는 판매 준비 완료 상태다.
**단 하나, 중등부(중1·2·3) 구독이 결제 관문에서 열려 있는 차단 결함 1건만 수정하면 오늘 판매개시 가능**하다. 수정은 `order.html` 버튼 게이팅 + `create-order` VALID_LEVELS 제외 2곳이면 충분하다.
