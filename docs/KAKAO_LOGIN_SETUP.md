# 카카오 로그인 연동 가이드

## 1. Kakao Developers 앱 등록 (10분)

1. https://developers.kakao.com 접속 → 카카오 계정 로그인
2. **내 애플리케이션 > 애플리케이션 추가하기**
3. 앱 정보 입력:
   - **앱 이름**: `Terra Nova English`
   - **사업자명**: 개인 또는 사업자명
   - 앱 아이콘: `logo.png` 업로드
4. 생성 후 **앱 설정 > 일반** 에서 **앱 키** 확인:
   - **REST API 키** 복사해둘 것

## 2. 카카오 로그인 활성화

1. 좌측 메뉴 **제품 설정 > 카카오 로그인**
2. **활성화 설정** ON
3. **Redirect URI** 등록 (2개):
   - `https://betkydmxrnlhgmnprbca.supabase.co/auth/v1/callback`
   - `http://localhost:5500/login.html` (로컬 테스트용)
4. **동의 항목** (제품 설정 > 카카오 로그인 > 동의항목):
   - 닉네임 — 필수
   - 카카오계정(이메일) — 필수 동의

## 3. Supabase에 카카오 Provider 연결

1. Supabase 대시보드 > **Authentication > Sign In / Providers**
2. **Kakao** 항목 찾아서 **Enable** 토글
3. 입력:
   - **Client ID**: Kakao Developers에서 복사한 **REST API 키**
   - **Client Secret**: Kakao Developers > 제품 설정 > 카카오 로그인 > 보안 탭 > **Client Secret 생성** (선택, 발급하는 게 보안상 권장)
4. **Save**

## 4. 테스트
- `login.html` 접속 → **카카오 로그인 버튼** 클릭
- 카카오 로그인 팝업 뜸 → 정보 제공 동의
- 자동으로 mypage.html로 이동
- Supabase **Authentication > Users**에 카카오 계정이 추가되어 있는지 확인

## 5. 선택: 프로덕션 도메인 등록
GitHub Pages 도메인에서도 작동하게 하려면:
- Kakao Redirect URI에 `https://betkydmxrnlhgmnprbca.supabase.co/auth/v1/callback` (이미 등록됨)
- 단, Supabase Site URL도 프로덕션으로 설정되어 있어야 함 (이미 설정 완료)

## 트러블슈팅
- **"KOE101" 에러**: Redirect URI 불일치 → Kakao Developers에 등록한 URI가 정확한지 확인
- **"KOE204" 에러**: Client Secret 불일치 → Supabase와 Kakao의 값이 같은지 확인
- **로그인 후 빈 화면**: Supabase URL Configuration의 Site URL 확인
