# 소셜 로그인 / 가입 설정 가이드

Terra Nova는 **Google · Kakao · Naver** 3가지 소셜 로그인을 지원합니다.

## 🏗️ 아키텍처 개요

| Provider | Supabase 네이티브 지원 | Terra Nova 구현 방식 |
|----------|------------------------|----------------------|
| Google   | ✅ 지원               | `supabase.auth.signInWithOAuth({provider:'google'})` |
| Kakao    | ✅ 지원               | `supabase.auth.signInWithOAuth({provider:'kakao'})` |
| Naver    | ❌ 미지원             | Custom Edge Function `naver-oauth` + `naver-callback.html` |

모든 경우에서 **최초 로그인 시 자동으로 회원가입 처리**됩니다. (별도 가입 단계 없음)

---

## 1️⃣ Google OAuth

### Step 1: Google Cloud Console 설정 (15분)
1. https://console.cloud.google.com 접속
2. **프로젝트 생성** — 이름: `Terra Nova English`
3. **APIs & Services > OAuth consent screen**
   - User type: **External**
   - App name: `Terra Nova English`
   - User support email: `taefung7@gmail.com` (또는 회사 이메일)
   - Developer contact: 동일
   - Scopes: `.../auth/userinfo.email`, `.../auth/userinfo.profile`, `openid`
   - Test users: (심사 전 테스트 단계일 때만 본인 이메일 추가)
4. **APIs & Services > Credentials > Create Credentials > OAuth 2.0 Client IDs**
   - Application type: **Web application**
   - Name: `Terra Nova Web`
   - **Authorized JavaScript origins**: `https://terra-nova.kr`
   - **Authorized redirect URIs**:
     - `https://betkydmxrnlhgmnprbca.supabase.co/auth/v1/callback`
   - **Client ID** 와 **Client Secret** 복사

### Step 2: Supabase Dashboard 연동
1. https://supabase.com/dashboard > Terra Nova 프로젝트
2. **Authentication > Providers > Google**
3. **Enable** 토글 ON
4. **Client ID** 붙여넣기
5. **Client Secret** 붙여넣기
6. Save

### Step 3: 테스트
1. https://terra-nova.kr/login.html 접속
2. "구글로 로그인" 버튼 클릭
3. Google 계정 선택 → Terra Nova 동의 → mypage.html로 리다이렉트되면 성공

### 배포 후 앱 심사 (필요 시)
초기 Test 모드에서는 최대 100명 제한. 정식 서비스 전 Google OAuth 심사 신청:
- Scope 소명: 이메일/프로필만 사용
- 데모 영상: 로그인 흐름 스크린 녹화
- 예상 심사 기간: 1~6주

---

## 2️⃣ Kakao OAuth

### Step 1: Kakao Developers 앱 등록 (10분)
1. https://developers.kakao.com 접속 → 카카오 계정 로그인
2. **내 애플리케이션 > 애플리케이션 추가하기**
3. 앱 정보:
   - 앱 이름: `Terra Nova English`
   - 사업자명: (개인/사업자명)
   - 카테고리: **교육**
4. **앱 키**:
   - **REST API 키** 복사 → Client ID로 사용
5. **제품 설정 > 카카오 로그인**
   - **활성화 설정** ON
   - **OpenID Connect 활성화** ON (Supabase 연동에 필수)
   - **Redirect URI**: `https://betkydmxrnlhgmnprbca.supabase.co/auth/v1/callback`
6. **동의항목**
   - 이메일: **필수 동의**
   - 닉네임: 권장
   - 프로필 사진: 선택
7. **보안**
   - **Client Secret** 생성 → 복사

### Step 2: Supabase 연동
1. **Authentication > Providers > Kakao**
2. Enable ON
3. Kakao Client ID = 카카오 REST API 키
4. Kakao Client Secret = 카카오 Client Secret
5. Save

### Step 3: 테스트
Google과 동일. "카카오로 로그인" 클릭 → 인증 → mypage.html

### ⚠️ 카카오 특이사항
- 앱이 **개발 모드**에서는 **테스트 사용자(본인/팀 카카오 계정)만 로그인 가능**
- 심사 신청 전 필요 준비물:
  - 동의항목별 사용 목적 작성
  - 서비스 URL / 개인정보처리방침 URL
  - 사업자등록증 (법인앱일 때)

---

## 3️⃣ Naver OAuth (Custom 구현)

Supabase는 네이버를 네이티브 지원하지 않기 때문에 **Edge Function + Callback 페이지** 조합으로 구현.

### Step 1: Naver Developers 앱 등록
1. https://developers.naver.com 로그인
2. **Application > 애플리케이션 등록**
3. 앱 정보:
   - 애플리케이션 이름: `Terra Nova English`
   - 사용 API: **네이버 아이디로 로그인**
4. 제공 정보 선택:
   - **이메일** (필수)
   - **이름** (권장)
   - **프로필 이미지** (선택)
   - **휴대전화 번호** (선택 — 있으면 구독 알림에 활용)
5. **네이버 아이디로 로그인 서비스 환경**:
   - PC 웹 — **서비스 URL**: `https://terra-nova.kr`
   - **Callback URL**: `https://terra-nova.kr/naver-callback.html`
6. 등록 완료 후 **Client ID**, **Client Secret** 복사

### Step 2: 클라이언트 설정 (`site-config.js`)
```js
window.NAVER_CLIENT_ID = '발급받은_Client_ID';  // 공개 가능, Secret 아님
```
- 파일: `site-config.js` (프로젝트 루트)
- Client ID는 브라우저에 노출되어도 안전 (OAuth 스펙)
- **Client Secret은 절대 여기 두지 말 것** — Edge Function으로만

### Step 3: Supabase Edge Function 배포
```bash
cd "c:/Users/user/OneDrive/Desktop/Terra Nova"

supabase secrets set NAVER_CLIENT_ID=네이버_Client_ID
supabase secrets set NAVER_CLIENT_SECRET=네이버_Client_Secret

supabase functions deploy naver-oauth --no-verify-jwt
```

### Step 4: 배포 확인
- Edge Function URL: `https://betkydmxrnlhgmnprbca.supabase.co/functions/v1/naver-oauth`
- 로그 확인: Supabase Dashboard > Functions > naver-oauth > Logs

### Step 5: 테스트
1. https://terra-nova.kr/login.html
2. "네이버로 로그인" 클릭
3. 네이버 계정 로그인 → 제공 정보 동의
4. `naver-callback.html`로 리다이렉트 → "로그인 처리 중" 화면
5. Edge Function이 내부 처리 후 → `mypage.html`로 자동 이동 → 로그인 완료

### 구현 세부 (작동 원리)
```
User → [1. 네이버 가입 버튼 클릭]
     → Naver OAuth 페이지 → 로그인 + 동의
     → [2. redirect_uri로 code 반환]
     → naver-callback.html
     → [3. Edge Function POST /naver-oauth (code 전달)]
     → Naver API로 access_token 교환
     → Naver 프로필 조회 (email, name)
     → Supabase admin API로 user 생성/조회
     → Magic Link 생성
     → [4. Client로 action_link 반환]
     → [5. Magic Link로 리다이렉트 → Supabase가 세션 발급]
     → mypage.html (로그인 상태)
```

---

## 🔒 보안 주의사항

### 공개해도 되는 값 (`site-config.js`)
- Naver Client ID
- Google/Kakao Client ID (Supabase 대시보드 내부이므로 사실상 노출 안 됨)

### 절대 노출 금지 (Supabase Secrets)
- Naver Client Secret
- Google/Kakao Client Secret (Supabase가 대신 저장)
- Supabase Service Role Key

### CSRF 방어
- 각 OAuth 시작 시 `state` 무작위 값 생성 → sessionStorage 저장
- 콜백에서 state 검증 후 일치하지 않으면 거부
- 현재 코드에 구현됨 (`login.html`, `signup.html`, `naver-callback.html`)

---

## 🧪 테스트 체크리스트

### 신규 사용자 흐름
- [ ] Google: 최초 로그인 → `auth.users` + `profiles` 자동 생성 → mypage 접근 가능
- [ ] Kakao: 위와 동일
- [ ] Naver: 위와 동일

### 기존 사용자 흐름
- [ ] 이메일로 가입한 계정이 동일 이메일의 Google로 로그인 시도 → **자동 병합** (Supabase 기본)
- [ ] 탈퇴 후 재가입: `auth.admin.deleteUser` 호출 후 재로그인 → 새 계정 생성

### 에러 케이스
- [ ] 이메일 권한 미동의 → "email required scope" 에러 표시
- [ ] 네이버 CSRF state 불일치 → "보안 검증 실패"
- [ ] 잘못된 콜백 URL → OAuth 에러 페이지 (프로바이더 측)

---

## 📊 로그인 방식 통계 (추후)

Supabase `auth.users.raw_user_meta_data.provider`로 집계 가능:
```sql
select
  coalesce(raw_user_meta_data->>'provider', 'email') as provider,
  count(*) as users
from auth.users
group by 1 order by 2 desc;
```
런칭 후 1개월 뒤 통계 확인 → 마케팅 채널 최적화 근거
