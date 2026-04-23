# Sentry 에러 트래킹 설치 가이드

## 왜 Sentry?
- 프로덕션에서 **사용자가 직접 겪는 JS 에러**를 실시간 수집
- 스택트레이스 + 브라우저 정보 + 사용자 컨텍스트 자동 기록
- 무료 플랜: 월 5,000 events · 30일 데이터 보관

## 설정 단계

### 1. 계정 생성
- https://sentry.io/signup — GitHub/Google 로그인 가능
- 조직명: "Terra Nova" (임의)

### 2. 프로젝트 생성
- **Create Project** 클릭
- Platform: **Browser JavaScript**
- Alert frequency: **On every new issue** (권장)
- Project name: `terra-nova-web`

### 3. DSN 복사
- 프로젝트 생성 직후 "Configure JavaScript" 페이지의 **DSN** 복사
- 형태: `https://abc123@o123.ingest.sentry.io/456`

### 4. 프로젝트 코드 업데이트
파일: `sentry-init.js` (이미 생성됨)

```js
const SENTRY_DSN = 'REPLACE_HERE';  // ← 복사한 DSN 붙여넣기
```

### 5. 모든 HTML 페이지에 스크립트 로드 추가

주요 페이지에 기존 `analytics.js` 근처에 추가:
```html
<script src="./sentry-init.js" defer></script>
```

적용 대상 (우선순위순):
- [ ] `order.html` (결제 페이지 — 가장 중요)
- [ ] `mypage.html` (로그인 후 기능)
- [ ] `index.html`
- [ ] `login.html`, `signup.html`
- [ ] `level_test.html`, `sample.html`
- [ ] `admin.html`

### 6. 테스트 발생
- 배포 후 아무 페이지에서 Console 열고:
  ```js
  throw new Error('Sentry test');
  ```
- Sentry 대시보드 > **Issues** 탭에 1분 내 에러 나타나야 정상

### 7. 알림 설정 (권장)
- **Settings > Alerts > Default Issue Alert**
- 트리거: **Event frequency** (5 min 동안 10 events 이상)
- 액션: **Send email** (본인 이메일)
- Slack/Discord 연동도 가능

## 운영 팁

### 노이즈 최소화
이미 `sentry-init.js`에서 처리됨:
- 브라우저 확장 에러 무시
- 취소된 fetch 무시
- Supabase SDK의 CSP eval 경고 무시

### 비용 관리
- 무료 플랜 월 5,000 events는 **일평균 166건**
- 버그 많은 초기엔 빠르게 소진될 수 있음 → 주요 에러 먼저 수정하는 루프
- 초과 시 옵션:
  1. **Team 플랜** ($26/월 · 50,000 events)
  2. `tracesSampleRate: 0.1 → 0.01` 낮추기
  3. `ignoreErrors`에 반복 패턴 추가

### 릴리스 트래킹
`sentry-init.js`의 `release` 필드를 배포마다 업데이트:
```js
release: 'terra-nova@2026-04-23-rc1'
```
- 장점: 어떤 배포에서 새 에러가 나타났는지 즉시 확인 가능
- 자동화: GitHub Actions 배포 워크플로에 `sentry-cli` 연동 (추후)

### 사용자 세션 리플레이 (기본 OFF, 비용 이슈 시 ON 가능)
- `replaysSessionSampleRate: 0.0 → 0.1` 로 변경하면 세션의 10%를 녹화
- 에러 발생 시점의 사용자 행동을 영상처럼 재생
- **프라이버시**: Input 필드는 기본 마스킹됨

## Sentry 대시보드 주요 화면

| 메뉴 | 역할 |
|------|------|
| Issues | 새 에러 + 발생 빈도 순 목록 (매일 확인) |
| Performance | 페이지 로드 시간, 트랜잭션 추적 |
| Releases | 버전별 새 이슈/해결된 이슈 |
| Alerts | 알림 규칙 관리 |

## 연관 문서
- `OPS_GUIDE.md` — 전체 런칭 체크리스트
- `MARKETING_KIT.md` — 런칭 마케팅 자료
