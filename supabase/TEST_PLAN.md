# Terra Nova English — 라이브 테스트 시나리오

## 사전 준비

- 마이그레이션 001~004 모두 실행 완료
- `supabase-client.js`가 올바른 URL/anon key를 가리키고 있음
- 브라우저 DevTools(F12) Network 탭 열어둠

---

## 시나리오 A: 회원가입 → 이메일 인증 → 로그인 → 마이페이지

### A-1 회원가입

1. `signup.html` 접속
2. 이름·이메일·비밀번호(8자+ 영문+숫자+특수) 입력 후 가입
3. "인증 이메일을 발송했습니다" 메시지 확인

**성공 기준:**
- 화면에 성공 메시지 표시
- Supabase 대시보드 → Authentication → Users 에 신규 유저 행 생성
- 이메일 받은 편지함에 인증 메일 도착

**실패 시 의심 항목:**
- `Email confirmation` 설정이 꺼져 있으면 인증 메일이 안 옴 (대시보드 체크)
- `Redirect URL`이 허용 목록에 없으면 인증 링크 클릭 후 오류 (Site URL 체크)
- profiles trigger 실패 시 → SQL Editor에서 `SELECT * FROM public.profiles` 확인
- 비밀번호 규칙 불일치: 8자 + 대/소문자 + 숫자 + 특수문자 조합 필요

### A-2 이메일 인증 링크 클릭

1. 이메일의 "이메일 확인" 버튼 클릭
2. `https://terra-nova.kr` 로 redirect됨 (또는 `detectSessionInUrl: true`에 의해 자동 로그인)

**성공 기준:**
- URL에 `#access_token=` 포함 또는 홈으로 redirect
- 브라우저 localStorage에 `sb-betkydmxrnlhgmnprbca-auth-token` 키 생성

**실패 시 의심 항목:**
- Redirect URL 미등록: 대시보드 → Authentication → URL Configuration 확인
- 이미 만료된 링크: Supabase 기본 1시간 유효

### A-3 로그인

1. `login.html` 접속
2. 이메일 + 비밀번호 입력
3. 로그인 버튼 클릭

**성공 기준:**
- `index.html`로 redirect
- DevTools → Application → Local Storage → `sb-...-auth-token` 존재

**실패 시 의심 항목:**
- "Email not confirmed" 오류: A-2 인증 링크 먼저 클릭
- "Invalid login credentials" 오류: 비밀번호 오입력 또는 미가입 이메일
- profiles row 없음: 001 마이그레이션 + backfill 쿼리 실행 여부 확인

### A-4 마이페이지 접근

1. `mypage.html` 접속
2. 사용자 이름·이메일이 올바르게 표시되는지 확인

**성공 기준:**
- 로그인 상태 유지 → 마이페이지 정상 표시
- 구독 없을 경우 "구독 없음" 메시지 표시
- level_test_results가 없으면 "레벨 테스트 결과 없음" 표시

**실패 시 의심 항목:**
- 바로 `login.html`로 redirect: `getSession()` 실패 → 브라우저 콘솔 확인
- 빈 화면: profiles RLS 정책 오류 → `002_auth_and_profiles.sql` 재실행
- "profiles: 본인 수정" 정책의 is_admin 체크 오류 → 아래 쿼리로 확인:
  ```sql
  SELECT id, is_admin FROM public.profiles WHERE id = '<your-user-id>';
  ```

---

## 시나리오 B: 비밀번호 재설정

1. `login.html` 접속 → "비밀번호를 잊으셨나요?" 클릭
2. 이메일 입력 후 재설정 메일 요청
3. 이메일의 "비밀번호 재설정" 링크 클릭
4. 새 비밀번호 입력 후 저장

**성공 기준:**
- 재설정 링크 클릭 후 `mypage.html` 또는 홈으로 이동
- 새 비밀번호로 로그인 가능

**실패 시 의심 항목:**
- 재설정 이메일 미수신: Supabase 무료 티어 이메일 발송 한도(4건/시간) 초과 가능
- "Password should be at least 8 characters" 오류: 비밀번호 정책 확인
- Redirect URL 오류: `resetPasswordForEmail`의 `redirectTo` 값이 허용 목록에 있는지 확인

---

## 시나리오 C: 회원 정보 수정

1. `mypage.html` 로그인 상태로 접속
2. "계정 정보" 탭 → 이름/전화번호 변경 후 저장

**성공 기준:**
- "저장되었습니다" 메시지 표시
- 페이지 상단 표시 이름이 즉시 변경됨
- SQL Editor: `SELECT display_name, phone FROM public.profiles WHERE id = '<user-id>';`

**실패 시 의심 항목:**
- "저장 실패" 오류: profiles RLS 정책 확인
  ```sql
  -- 정책 확인
  SELECT policyname FROM pg_policies WHERE tablename = 'profiles';
  ```
- is_admin 정책 충돌: profiles UPDATE 정책의 is_admin 체크가 본인 row에서 순환 참조 문제를 일으킬 경우
  → `003` 정책 단순화 버전으로 교체 (아래 비상 SQL 참조)

**비상 SQL (is_admin 체크 제거, 단순화):**
```sql
DROP POLICY IF EXISTS "profiles: 본인 수정" ON public.profiles;
CREATE POLICY "profiles: 본인 수정 (단순)"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
-- 주의: 이 경우 클라이언트가 is_admin을 true로 바꿀 수 있으므로
-- 프론트엔드 코드에서 is_admin 필드를 절대 UPDATE에 포함하지 않도록 확인 필요
```

---

## 시나리오 D: 로그아웃 후 마이페이지 접근

1. 마이페이지에서 로그아웃 버튼 클릭
2. `index.html`로 redirect 확인
3. 주소창에 `mypage.html` 직접 입력

**성공 기준:**
- `login.html?redirect=%2Fmypage.html` 형태로 redirect
- localStorage에서 `sb-...-auth-token` 삭제됨

**실패 시 의심 항목:**
- 로그아웃 후에도 마이페이지 접근 가능: `signOut` 함수가 localStorage를 완전히 정리하지 못함
  → `supabase-client.js`의 `signOut()` 함수 강제 localStorage 정리 코드 확인
- 무한 redirect loop: `requireAuth`의 `redirectTo` 경로 오류

---

## 시나리오 E: 레벨 테스트 (익명 → 회원 연동)

1. 비로그인 상태로 `level_test.html` 접속
2. 레벨 테스트 완료
3. 결과가 localStorage `tn_anon_token` 에 저장되는지 확인
4. 회원가입 또는 로그인
5. `linkAnonLevelTest` 호출 결과 확인 (`mypage.html`에서 레벨 결과 표시)

**성공 기준:**
```sql
-- 연동 전: user_id IS NULL, anon_token IS NOT NULL
-- 연동 후: user_id IS NOT NULL, anon_token IS NULL
SELECT user_id, anon_token, level FROM public.level_test_results
ORDER BY created_at DESC LIMIT 5;
```

**실패 시 의심 항목:**
- INSERT 실패: level_test_results RLS "INSERT (익명 포함)" 정책 확인
- UPDATE 실패: RLS "본인 UPDATE (anon→user 링크)" 정책 확인

---

## 시나리오 F: 관리자 접근

1. SQL Editor에서 본인 계정에 `is_admin = true` 설정
2. `admin.html` 접속
3. 리뷰 목록, 구독 통계, 뉴스레터 수 표시 확인

**성공 기준:**
- "관리자 권한이 없습니다" 메시지 없이 대시보드 표시
- stat 카운트가 숫자로 표시 (0이어도 OK)

**실패 시 의심 항목:**
- "관리자 권한이 없는 계정입니다" 표시: profiles.is_admin = true 설정 재확인
  ```sql
  UPDATE public.profiles SET is_admin = true WHERE id = auth.uid();
  -- 또는 직접:
  UPDATE public.profiles SET is_admin = true WHERE id = '<user-uuid>';
  ```

---

## 빠른 전체 상태 체크 쿼리

```sql
-- 테이블 존재 여부
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- RLS 활성화 여부
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 트리거 확인
SELECT tgname, tgrelid::regclass AS table_name
FROM pg_trigger
WHERE tgname LIKE 'trg_%' OR tgname = 'on_auth_user_created'
ORDER BY tgrelid::regclass::text;

-- 버킷 확인
SELECT id, name, public, file_size_limit FROM storage.buckets ORDER BY id;

-- 정책 수 확인
SELECT tablename, count(*) AS policy_count
FROM pg_policies
WHERE schemaname IN ('public', 'storage')
GROUP BY tablename
ORDER BY tablename;
```
