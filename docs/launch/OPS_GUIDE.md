# Terra Nova 런칭 운영 가이드

런칭 전 반드시 완료해야 할 외부 시스템 설정 목록.

---

## 1. Google Search Console 제출

### 이미 완료된 것
- ✅ `index.html` meta verification: `slAjTX-_SNyfTX3xbJuPLBGEzRiYx2MVT_oA0oUHVUk`
- ✅ `sitemap.xml` 12개 URL 포함
- ✅ `robots.txt` 존재

### 해야 할 것
1. https://search.google.com/search-console 접속
2. **속성 추가** → `https://terra-nova.kr` 입력
3. HTML 태그 방식으로 소유권 확인 (이미 삽입됨)
4. **Sitemaps** 메뉴 → `sitemap.xml` 제출
5. **URL 검사** 탭에서 주요 페이지 5개 색인 요청:
   - `/` (home)
   - `/order.html`
   - `/subscription_detail_complete.html`
   - `/sample.html`
   - `/level_test.html`
6. **성능 > 검색결과** 매일 모니터링 (런칭 2주는 데일리 체크)

### 기대 효과
- 8~48시간 내 메인 키워드 인덱싱 ("수능영어", "교과 연계 영어", "Terra Nova")
- FAQ 리치 리절트 노출 (이미 `faq.html`에 FAQPage schema 추가됨)
- Product 리치 리절트 노출 (index/order에 Offer schema 존재)

---

## 2. Naver 서치어드바이저

### 현재 상태
- `index.html`에 주석 처리된 플레이스홀더 있음: `<!-- <meta name="naver-site-verification" content="REPLACE_AFTER_NAVER_WEBMASTER_SETUP"> -->`

### 해야 할 것
1. https://searchadvisor.naver.com/ 로그인 (네이버 계정 필요)
2. **웹마스터 도구 > 사이트 등록** → `https://terra-nova.kr` 추가
3. **HTML 태그** 방식 선택 → 발급된 content 값 복사
4. `index.html` 주석 해제 후 실제 값 삽입:
   ```html
   <meta name="naver-site-verification" content="실제값">
   ```
5. 배포 후 네이버에서 **소유확인** 클릭
6. **사이트맵 제출** 메뉴 → `https://terra-nova.kr/sitemap.xml`
7. **RSS 제출** (선택, 블로그 운영 시)
8. **요청 > 웹페이지 수집** 에서 주요 페이지 개별 수집 요청

### 추가 최적화
- **동적 사이트맵** 제출 (런칭 후 블로그/리뷰 등 동적 페이지 생기면)
- **모바일 사용성** 체크 → 문제 발견 시 시맨틱 HTML 개선

---

## 3. 카카오톡 채널 운영 프로토콜

### 현재 상태
- 채널 ID: `_aLExdX` (https://pf.kakao.com/_aLExdX)
- 사이트 전역에 플로팅 카톡 버튼 연결

### 초기 세팅 체크리스트
- [ ] 채널 프로필 이미지: Terra Nova 로고 (teal 배경 + 심볼)
- [ ] 채널 커버 이미지: 1080×400 (OG 이미지 활용 가능)
- [ ] 채널 소개글: "수능영어 + 전과목 통합 학습지 · 월 11,900원부터"
- [ ] 관리자 초대 (CS 담당자 계정)

### 자동 답변 템플릿 (키워드 설정)

| 키워드 | 자동 답변 |
|--------|----------|
| `가격`, `비용`, `얼마` | "현재 플랜별 가격은 LIGHT 월 11,900원 / STANDARD 월 24,900원 / PREMIUM 월 38,900원입니다. 자세한 비교는 terra-nova.kr/subscription_detail_complete" |
| `레벨`, `테스트` | "3분 무료 레벨 테스트는 여기서: terra-nova.kr/level_test" |
| `샘플`, `미리보기` | "결제 없이 즉시 다운로드: terra-nova.kr/sample" |
| `환불`, `해지` | "구독 해지는 마이페이지에서 언제든 가능합니다. 자세한 환불 정책은 terra-nova.kr/faq#refund" |
| `배송`, `언제` | "매월 1~5일 사이 일괄 발송됩니다. 배송 시작 시 카톡으로 운송장 번호가 발송됩니다." |

### FAQ 답변 준비 (카톡 채널 CS용)

**Q: 고등학생인데 MOON 레벨이 나왔어요. 너무 낮지 않나요?**
A: 현재 위치를 정확히 아는 게 더 중요합니다. 레벨 테스트는 실제 독해 역량 기준이에요. 학년에 맞춘 레벨을 무리해서 선택하면 오히려 독해 습관이 망가집니다. 현 레벨에서 시작해 3개월에 1단계씩 올라가는 게 정상 페이스입니다.

**Q: 환불이 진짜 언제든지 가능한가요?**
A: 네, 구독 해지 시 **해지월까지는 서비스 이용 가능**, **다음 달부터 미결제**됩니다. 이미 결제된 당월 구독비는 부분환불 불가이지만, 실물 책이 아직 배송 전이라면 카톡으로 연락주시면 전액 환불 가능합니다.

**Q: 교재를 받지 못했어요.**
A: 카톡으로 **주문번호 + 수령 예정일**을 알려주세요. 분실/파손의 경우 **무료 재발송**해드립니다. 파손이면 사진 첨부 부탁드립니다.

---

## 4. 이메일 서비스 (Resend) 연동

### 단계별 가이드

**Step 1. Resend 계정 생성**
1. https://resend.com/signup — Google/GitHub 로그인 가능
2. 무료 플랜: **월 3,000건 발송 · 일 100건 한도** (런칭 초기 충분)

**Step 2. 도메인 인증**
1. Resend 대시보드 → **Domains** → **Add Domain**
2. `terra-nova.kr` 입력
3. 제공되는 DNS 레코드 3개 (DKIM/SPF/MX) 도메인 관리자에 추가:
   - TXT record: `_resend._domainkey` (DKIM)
   - TXT record: `@` (SPF)
   - MX record: `send` (Return Path, 선택)
4. DNS 전파 대기 (5~60분)
5. Resend에서 **Verify** 클릭 → 모든 레코드 초록불 확인

**Step 3. API 키 발급**
1. **API Keys** 메뉴 → **Create API Key**
2. 권한: **Sending access** (발송만 가능, 안전)
3. 키 복사 (한 번만 표시됨)
4. Supabase 환경변수 설정:
   ```bash
   supabase secrets set RESEND_API_KEY=re_xxxxx
   supabase secrets set EMAIL_FROM="Terra Nova <no-reply@terra-nova.kr>"
   ```

**Step 4. 테스트 발송**
```bash
# 내부 시크릿으로 send-email Function 수동 호출
curl -X POST https://betkydmxrnlhgmnprbca.supabase.co/functions/v1/send-email \
  -H "Authorization: Bearer $INTERNAL_EMAIL_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"to":"본인이메일@gmail.com","type":"custom","data":{"subject":"테스트","html":"<p>발송 성공</p>"}}'
```

### 발송 한도 모니터링
- Resend 대시보드 > **Analytics**: 일/월 발송량, 오픈률, 클릭률
- 월 3,000건 초과 시 Pro 플랜 ($20/월, 월 50,000건)

---

## 5. 포트원(PortOne) 심사 후 할 일 체크리스트

### Phase A — 키 발급 직후
- [ ] `portone-client.js` L12-13 상수 교체:
  ```js
  const STORE_ID   = 'store-...';
  const CHANNEL_KEY = 'channel-key-...';
  ```
- [ ] Supabase Secrets 설정:
  ```bash
  supabase secrets set PORTONE_V2_API_SECRET=...
  supabase secrets set PORTONE_WEBHOOK_SECRET=whsec_...
  supabase secrets set RENEWAL_CRON_SECRET=$(openssl rand -hex 32)
  supabase secrets set INTERNAL_EMAIL_SECRET=$(openssl rand -hex 32)
  ```

### Phase B — Edge Function 배포
```bash
cd "c:/Users/user/OneDrive/Desktop/Terra Nova"
supabase functions deploy portone-webhook      --no-verify-jwt
supabase functions deploy renew-subscriptions  --no-verify-jwt
supabase functions deploy send-email           --no-verify-jwt
```

### Phase C — Cron 등록
- `supabase-cron-renewal.sql` 열기
- `REPLACE_WITH_ACTUAL_CRON_SECRET` 을 실제 `RENEWAL_CRON_SECRET` 값으로 교체
- Supabase SQL Editor에서 전체 실행

### Phase D — 포트원 대시보드 설정
1. **결제 연동 > 웹훅** 메뉴:
   - URL: `https://betkydmxrnlhgmnprbca.supabase.co/functions/v1/portone-webhook`
   - 이벤트: `Transaction.Paid`, `Transaction.Cancelled`, `Transaction.VirtualAccountIssued`, `BillingKey.Issued`
2. **결제 수단**: 토스페이먼츠 / 카카오페이 / 네이버페이 / 계좌이체 각 채널 등록

### Phase E — 테스트 결제 E2E
1. 테스트 카드 `4242-4242-4242-4242`로 LIGHT 구독 신청
2. Supabase `orders` 테이블에 `status='paid'` 행 생성 확인
3. `subscriptions` 테이블에 `plan_code='LIGHT'`, `last_order_id`가 연결된 행 생성 확인
4. 본인 이메일로 결제 확인 메일 수신 확인

---

## 6. 분석 도구 검증

### Google Analytics 4 / Microsoft Clarity
- `analytics.html` 파일 존재 (GA/Clarity 스니펫 템플릿)
- 각 페이지에 로드되는지 확인 방법:
  ```
  1. 실제 사이트 방문 (terra-nova.kr)
  2. DevTools > Network 탭
  3. 필터: "analytics" / "clarity" / "google"
  4. GA: gtag/js?id=G-XXX 요청 200 OK 확인
  5. Clarity: clarity.ms/tag/... 요청 확인
  ```
- **GA4 Realtime 리포트**: 본인 방문이 1명으로 잡히면 OK
- **Clarity Dashboard**: 10분 이내 첫 세션 녹화 확인

### 이벤트 추적 권장 사항 (런칭 후 1주차 설정)
- `begin_checkout` — 구독 신청 페이지 진입
- `add_payment_info` — 결제 수단 선택
- `purchase` — 결제 완료 (포트원 success callback)
- `sign_up` — 회원가입 완료
- `level_test_complete` — 레벨 테스트 종료

---

## 7. 런칭 D-1 최종 체크리스트

- [ ] 포트원 심사 완료 + 키 적용
- [ ] Supabase DB에 `is_admin=true` 관리자 최소 1명 지정
- [ ] Edge Function 3개 모두 배포됨 + 로그 정상
- [ ] Resend 도메인 인증 완료
- [ ] 테스트 결제 1회 성공 (real money, 본인 카드, 소액)
- [ ] Google Search Console 사이트맵 제출
- [ ] Naver 서치어드바이저 등록 완료
- [ ] 카톡 채널 자동 답변 6개 이상 등록
- [ ] 런칭 공지 카톡 · 인스타 · 블로그 예약 발행 준비
- [ ] 쿠폰 코드 1개 발행 (예: `LAUNCH2026` → 첫 달 30% 할인)
- [ ] 환불 요청 처리 프로세스 문서화
- [ ] 택배사 연락처 확보 + 실물 교재 발송 첫 날짜 확정

---

## 8. 런칭 후 2주 KPI 모니터링

| 지표 | 목표 | 확인 위치 |
|------|------|-----------|
| 일일 방문자 (UV) | 200+ | GA4 Realtime |
| 레벨 테스트 완료 | 30+ / 일 | Supabase `level_test_results` |
| 회원가입 | 20+ / 일 | Supabase `auth.users` |
| 구독 시작 | 5+ / 일 | Supabase `subscriptions status='active'` |
| 리뷰 작성 | 3+ / 주 | Supabase `reviews` |
| 카톡 채널 친구 | +100 / 주 | Kakao 채널 대시보드 |

**Red Alert 조건 (즉시 대응):**
- 결제 실패율 > 5% → 포트원 웹훅 로그 확인
- 평균 응답시간 > 3초 → Supabase Edge Function 로그 확인
- 에러 발생 시 즉시 Sentry (설정 후)로 알림
