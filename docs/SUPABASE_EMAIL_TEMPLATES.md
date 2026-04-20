# Supabase 이메일 템플릿 한국어화

## 적용 방법
Supabase 대시보드 > **Authentication > Email** > 각 템플릿 클릭 → Subject + HTML 붙여넣기 → Save

---

## 1. Confirm signup (회원가입 인증)

**Subject**: `[Terra Nova] 이메일 인증을 완료해주세요`

**HTML**:
```html
<div style="font-family:'Apple SD Gothic Neo','Malgun Gothic',sans-serif;max-width:560px;margin:0 auto;background:#0A0A0A;color:#F0F0F0;padding:40px 28px;border-radius:12px;">
  <div style="text-align:center;margin-bottom:28px;">
    <div style="font-family:'Bebas Neue',sans-serif;font-size:1.9rem;letter-spacing:6px;color:#fff;">TERRA NOVA</div>
    <div style="font-size:.62rem;letter-spacing:3px;color:#2DD4BF;margin-top:4px;">ENGLISH</div>
  </div>
  <h1 style="font-size:1.2rem;color:#fff;font-weight:800;margin-bottom:18px;">이메일 인증 안내</h1>
  <p style="font-size:.92rem;line-height:1.7;color:rgba(255,255,255,.82);margin-bottom:24px;">
    Terra Nova English에 가입해주셔서 감사합니다.<br>
    아래 버튼을 눌러 이메일 인증을 완료해주세요.
  </p>
  <div style="text-align:center;margin:32px 0;">
    <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#2DD4BF;color:#0A0A0A;font-weight:900;padding:14px 32px;border-radius:6px;text-decoration:none;letter-spacing:.5px;">이메일 인증하기</a>
  </div>
  <p style="font-size:.78rem;color:rgba(255,255,255,.5);line-height:1.7;">
    본인이 요청하지 않았다면 이 이메일을 무시하셔도 됩니다.<br>
    링크는 24시간 동안 유효합니다.
  </p>
  <hr style="border:none;border-top:1px solid rgba(255,255,255,.08);margin:28px 0 16px;">
  <p style="font-size:.72rem;color:rgba(255,255,255,.4);text-align:center;">
    © Terra Nova English · 수능영어 구독 서비스
  </p>
</div>
```

---

## 2. Magic Link (매직 링크 로그인)

**Subject**: `[Terra Nova] 로그인 링크입니다`

**HTML**:
```html
<div style="font-family:'Apple SD Gothic Neo','Malgun Gothic',sans-serif;max-width:560px;margin:0 auto;background:#0A0A0A;color:#F0F0F0;padding:40px 28px;border-radius:12px;">
  <div style="text-align:center;margin-bottom:28px;">
    <div style="font-family:'Bebas Neue',sans-serif;font-size:1.9rem;letter-spacing:6px;color:#fff;">TERRA NOVA</div>
    <div style="font-size:.62rem;letter-spacing:3px;color:#2DD4BF;margin-top:4px;">ENGLISH</div>
  </div>
  <h1 style="font-size:1.2rem;color:#fff;font-weight:800;margin-bottom:18px;">로그인 링크</h1>
  <p style="font-size:.92rem;line-height:1.7;color:rgba(255,255,255,.82);margin-bottom:24px;">
    아래 버튼을 눌러 로그인하세요. 비밀번호 입력 없이 바로 접속됩니다.
  </p>
  <div style="text-align:center;margin:32px 0;">
    <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#2DD4BF;color:#0A0A0A;font-weight:900;padding:14px 32px;border-radius:6px;text-decoration:none;letter-spacing:.5px;">로그인하기</a>
  </div>
  <p style="font-size:.78rem;color:rgba(255,255,255,.5);line-height:1.7;">
    본인이 요청하지 않았다면 이 이메일을 무시하셔도 됩니다.<br>
    링크는 1시간 동안 유효합니다.
  </p>
</div>
```

---

## 3. Reset Password (비밀번호 재설정)

**Subject**: `[Terra Nova] 비밀번호 재설정 안내`

**HTML**:
```html
<div style="font-family:'Apple SD Gothic Neo','Malgun Gothic',sans-serif;max-width:560px;margin:0 auto;background:#0A0A0A;color:#F0F0F0;padding:40px 28px;border-radius:12px;">
  <div style="text-align:center;margin-bottom:28px;">
    <div style="font-family:'Bebas Neue',sans-serif;font-size:1.9rem;letter-spacing:6px;color:#fff;">TERRA NOVA</div>
    <div style="font-size:.62rem;letter-spacing:3px;color:#2DD4BF;margin-top:4px;">ENGLISH</div>
  </div>
  <h1 style="font-size:1.2rem;color:#fff;font-weight:800;margin-bottom:18px;">비밀번호 재설정</h1>
  <p style="font-size:.92rem;line-height:1.7;color:rgba(255,255,255,.82);margin-bottom:24px;">
    Terra Nova English 비밀번호 재설정을 요청하셨습니다.<br>
    아래 버튼을 눌러 새 비밀번호를 설정해주세요.
  </p>
  <div style="text-align:center;margin:32px 0;">
    <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#2DD4BF;color:#0A0A0A;font-weight:900;padding:14px 32px;border-radius:6px;text-decoration:none;letter-spacing:.5px;">비밀번호 재설정</a>
  </div>
  <p style="font-size:.78rem;color:rgba(255,255,255,.5);line-height:1.7;">
    본인이 요청하지 않았다면 이 이메일을 무시하셔도 되며, 계정은 안전합니다.<br>
    링크는 1시간 동안 유효합니다.
  </p>
</div>
```

---

## 4. Change Email (이메일 변경 확인) — 선택

**Subject**: `[Terra Nova] 이메일 변경 확인`

**HTML**: 위 템플릿과 유사한 구조로 `{{ .ConfirmationURL }}` 포함.

---

## Sender Name 설정

**Authentication > Email > SMTP Settings**:
- **Sender name**: `Terra Nova English`
- 무료 플랜은 Supabase 기본 SMTP 사용 (제한 있음, 하루 2~3건)
- **프로덕션에서는 반드시 커스텀 SMTP 연결 필요** (Resend / SendGrid / AWS SES)

### 무료 권장: Resend
1. https://resend.com 회원가입 → 무료 3,000건/월
2. 도메인 인증 (terranova.co.kr 소유 시) 또는 resend.dev 서브도메인 사용
3. Supabase > SMTP Settings:
   - Host: `smtp.resend.com`
   - Port: `465` (SSL)
   - Username: `resend`
   - Password: Resend API Key
   - Sender: `noreply@resend.dev` 또는 `noreply@terranova.co.kr`
