# 샘플 PDF 자동 발송 — 단계별 셋업 가이드

이 문서대로 따라하면 **약 30~60분** 안에 자동 발송이 동작합니다.
처음 보는 도구가 많을 수 있으니 단계별로 천천히 진행하세요.

> **💡 진행 순서가 중요합니다.** 위에서 아래로 차례대로 따라가세요.
> 0단계(Supabase 프로젝트 복구)를 안 하면 모든 게 동작하지 않습니다.

---

## 전체 그림

```
[브라우저: sample.html "샘플 받기" 클릭]
          │  POST { email, level }
          ▼
[Edge Function: send-sample]   ← Supabase에서 실행
          │
          ├── ① 30분 내 중복 요청 차단
          ├── ② sample_requests 테이블에 기록
          ├── ③ Storage에서 PDF 파일 → 1시간짜리 다운로드 링크 생성
          ├── ④ Resend(메일 발송 서비스)로 메일 발송
          └── ⑤ 발송 결과 기록 (sent / failed)
                      │
                      ▼
            [사용자 메일함 — 다운로드 버튼 포함]
```

필요한 외부 서비스 3개:
1. **Supabase** — 데이터베이스 + 함수 + 파일 저장 (이미 가입돼 있음)
2. **Resend** — 메일 발송 API (신규 가입 필요, 무료)
3. **terra-nova.kr 도메인** (이미 보유)

---

## ⚠️ 0단계: Supabase 프로젝트 복구 (가장 먼저!)

**확인된 문제**: 현재 프로젝트가 Free 플랜의 7일 비활성 정책으로 **일시 정지(paused)** 상태입니다. 도메인 자체가 응답하지 않아서 로그인·결제·샘플 모두 동작 안 합니다.

### 복구 절차

1. <https://supabase.com/dashboard> 접속 후 로그인
2. 프로젝트 목록에서 `Terra Nova` 또는 `betkydmxrnlhgmnprbca` 찾기
3. 상태가 **"Paused"**라면 프로젝트 클릭 → 빨간색 또는 노란색 안내 배너의 **"Restore project"** 버튼 클릭
4. 약 1~2분 기다리면 다시 활성화됨

### 복구 후 확인

브라우저 주소창에서 <https://betkydmxrnlhgmnprbca.supabase.co/rest/v1/> 입력 →
`{"swagger":"2.0"...}` 같은 JSON이 보이면 성공.

> **이후 자동 정지 방지 옵션** (이 문서 맨 아래 "보너스" 섹션 참조)

---

## 1단계: Resend 계정 생성

이메일 발송 API. 무료 플랜으로 **월 3,000건**까지 무료.

### 1-1. 가입

1. <https://resend.com/signup> 접속
2. 이메일/Google/GitHub 계정으로 회원가입
3. 가입한 이메일에 인증 메일 옴 → 링크 클릭하여 인증

### 1-2. API 키 발급

1. 로그인 후 좌측 메뉴 **API Keys** 클릭
2. 우측 상단 **+ Create API Key** 클릭
3. 이름: `terra-nova-prod` (아무거나)
4. Permission: **Sending access**
5. **Create** 클릭
6. 화면에 **`re_xxxxxxxxxxxx...`** 형식의 키가 한 번만 표시됨 → **반드시 메모장에 복사** (다시 못 봄)

### 1-3. 발신 도메인 등록 (중요)

기본 상태에서는 자기 자신의 이메일에만 발송 가능 (테스트 한정).
실제 사용자에게 발송하려면 `terra-nova.kr` 도메인을 등록해야 합니다.

1. 좌측 메뉴 **Domains** → **+ Add Domain**
2. 도메인: `terra-nova.kr` 입력 → **Add**
3. Resend가 4~5개의 DNS 레코드를 보여줍니다 (SPF, DKIM 등)
4. 각 레코드를 **terra-nova.kr 도메인 관리 페이지**에 추가:
   - 카페24/가비아/Cloudflare 등 도메인 등록기관 콘솔로 이동
   - "DNS 관리" 또는 "DNS 레코드" 메뉴
   - Resend가 알려준 Type/Name/Value를 그대로 복사해서 추가
5. 추가 후 Resend 대시보드에서 **Verify** 버튼 클릭
6. 약 5~30분 후 **Verified** ✅ 상태로 변경됨

> **임시로 도메인 검증 없이 테스트하고 싶다면**:
> Resend는 가입한 본인 이메일 주소로는 검증 없이 즉시 발송 가능합니다.
> `EMAIL_FROM` 환경변수에 `onboarding@resend.dev`를 입력하면 됩니다 (3-5단계).
> 이 경우 본인 이메일로만 테스트 가능하니, 정식 출시 전엔 도메인 검증 필수.

---

## 2단계: SQL 실행 (테이블 생성)

1. <https://supabase.com/dashboard/project/betkydmxrnlhgmnprbca/sql/new> 접속
2. 빈 SQL Editor 화면이 뜸
3. 이 저장소의 [supabase-schema-v5-samples.sql](../supabase-schema-v5-samples.sql) 파일을 텍스트 에디터로 열어 **전체 내용 복사** (Ctrl+A → Ctrl+C)
4. SQL Editor에 **붙여넣기** (Ctrl+V)
5. 우측 하단 **RUN** 버튼 (또는 Ctrl+Enter)
6. 하단에 **Success. No rows returned** 메시지 확인

### 결과 확인

좌측 메뉴 **Table Editor** → `sample_requests` 테이블이 생겼는지 확인.

---

## 3단계: Storage 버킷 + PDF 업로드

### 3-1. 버킷 생성

1. 좌측 메뉴 **Storage** → **New bucket**
2. 입력값:
   - **Name**: `sample-pdfs` (정확히 이렇게)
   - **Public bucket**: **OFF** (체크 해제 — 중요!)
   - **File size limit**: `25 MB`
   - **Allowed MIME types**: `application/pdf` (선택, 비워둬도 됨)
3. **Save** 클릭

### 3-2. PDF 파일 업로드

생성된 `sample-pdfs` 버킷 내부로 들어가서 PDF 업로드.

**파일명 규약 (정확히 지켜야 함)**:
```
moon.pdf       ← 초3 (MOON 레벨)
mercury.pdf    ← 초4 (MERCURY)
mars.pdf       ← 초5 (MARS)
venus.pdf      ← 초6 (VENUS)
terra.pdf      ← 중1 (TERRA)
neptune.pdf    ← 중2 (NEPTUNE)
uranus.pdf     ← 중3 (URANUS)
saturn.pdf     ← 고1 (SATURN)
jupiter.pdf    ← 고2 (JUPITER)
sun.pdf        ← 고3 (SUN)
```

> **준비된 것만 업로드해도 됩니다.** 사용자가 업로드 안 된 레벨을 요청하면 "샘플이 아직 준비되지 않았습니다" 메시지가 자동으로 안내됩니다.
>
> **업데이트는 같은 이름으로 덮어쓰기**만 하면 됩니다. 코드 수정 0.

---

## 4단계: Edge Function 배포

두 가지 방법 중 선택. **방법 A (CLI)** 가 표준이지만 **방법 B (Dashboard)** 가 처음 한 번은 더 쉬움.

### 방법 A: Supabase CLI (권장)

#### 4-A-1. Node.js + npm 설치 (이미 있으면 스킵)

PowerShell에서 `node -v` 입력 → 버전 안 나오면 <https://nodejs.org/> 에서 LTS 다운로드.

#### 4-A-2. Supabase CLI 설치

PowerShell **관리자 권한**으로 열기:
```powershell
npm install -g supabase
supabase --version    # 버전 확인 (예: 1.x.x)
```

#### 4-A-3. 로그인 + 프로젝트 연결

```powershell
cd "c:\Users\user\OneDrive\Desktop\Terra Nova"
supabase login           # 브라우저 창 떠서 인증 → 토큰 자동 저장
supabase link --project-ref betkydmxrnlhgmnprbca
```

#### 4-A-4. 함수 배포

```powershell
supabase functions deploy send-sample --no-verify-jwt
supabase functions deploy send-email --no-verify-jwt
```

`Deploying Function: send-sample (no JWT verify)` → `Deployed successfully` 메시지가 보이면 OK.

### 방법 B: Dashboard에서 수동 배포 (CLI 어려우면)

1. Supabase Dashboard → 좌측 **Edge Functions**
2. 우측 상단 **+ Deploy a new function** 클릭
3. **Function name**: `send-sample`
4. **Verify JWT with legacy secret**: **OFF** (체크 해제 — 익명 호출 허용)
5. 코드 영역에 [supabase/functions/send-sample/index.ts](../supabase/functions/send-sample/index.ts) 파일 내용 전체 복사·붙여넣기
6. **Deploy** 클릭
7. `send-email` 함수도 같은 방식으로 갱신:
   - 기존 `send-email` 클릭 → **Edit** → 코드 전체를 [supabase/functions/send-email/index.ts](../supabase/functions/send-email/index.ts) 최신 내용으로 교체 → **Deploy**

---

## 5단계: 환경변수 (Secrets) 등록

함수가 동작하려면 5개의 비밀값이 필요.

1. Supabase Dashboard → **Edge Functions** → 우측 상단 **Manage secrets**
2. 각 항목 **+ New secret**으로 추가:

| Secret 이름 | 값 | 설명 |
|---|---|---|
| `SUPABASE_URL` | `https://betkydmxrnlhgmnprbca.supabase.co` | 프로젝트 URL (이미 등록돼 있을 수 있음) |
| `SUPABASE_SERVICE_ROLE_KEY` | (Dashboard → Settings → API → `service_role` 행의 `Reveal` 클릭) | RLS 우회용 |
| `RESEND_API_KEY` | (1-2단계에서 메모한 `re_xxxxx`) | Resend 발송 권한 |
| `EMAIL_FROM` | `Terra Nova <no-reply@terra-nova.kr>` 또는 (도메인 검증 전) `Terra Nova <onboarding@resend.dev>` | 발신자 표시 이름 |
| `INTERNAL_EMAIL_SECRET` | <https://1password.com/password-generator/> 에서 32자 랜덤 생성 | 함수 간 호출 인증용. 한 번 정하면 변경 X |

> **service_role 키**는 매우 강력한 권한입니다. 절대 프론트엔드 코드나 GitHub에 올리지 마세요. Supabase Secrets에서만 사용.

저장 후 함수가 자동으로 재시작합니다 (잠시 대기).

---

## 6단계: 동작 테스트

1. 브라우저에서 <https://terra-nova.kr/sample.html> 접속
2. 임의 레벨 탭 클릭 (예: **MARS**) — 본인이 PDF 업로드한 레벨
3. 페이지 하단 **"FREE SAMPLE"** 박스에 **본인 이메일 입력**
4. **샘플 받기** 클릭
5. 5초 안에 알림: `MARS 레벨 샘플 PDF를 ... 발송했습니다!`
6. 메일함 확인 (스팸함 포함) → **PDF 다운로드 →** 버튼 → PDF 열림

### ✅ 성공 신호
- 알림 메시지에 **"발송했습니다!"** 등장
- 1분 이내 메일함에 메일 도착
- 다운로드 버튼 클릭 시 PDF 정상 열림

### ❌ 실패 시 디버깅 (단계별)

**증상 1: 알림이 "샘플 발송에 실패했습니다"**

브라우저 F12 → **Network** 탭 → `send-sample` 행 클릭 → **Response** 탭 확인:
- `"error": "해당 레벨의 샘플 PDF가 아직 준비되지 않았습니다"` → 3-2단계 PDF 업로드 누락. 해당 레벨 PDF 업로드.
- `"error": "메일 발송에 실패했습니다"` → 5단계 `RESEND_API_KEY` 또는 `EMAIL_FROM` 잘못됨. 또는 도메인 미검증 + 본인 이메일 아님.
- `"error": "같은 이메일로 30분 내 ..."` → 정상. 30분 기다리거나 다른 이메일로 테스트.

**증상 2: Network 탭에서 `send-sample` 자체가 빨간색 (4xx/5xx)**

Supabase Dashboard → **Edge Functions** → `send-sample` → **Logs** 탭에서 실제 에러 확인.
가장 흔한 원인:
- Secret 누락 (5단계 다시 확인)
- `INTERNAL_EMAIL_SECRET`이 `send-sample`과 `send-email` 양쪽에 같은 값으로 설정 안 됨

**증상 3: 알림은 성공인데 메일 안 옴**

- Resend Dashboard → **Emails** 탭에서 발송 이력 확인
- `Bounced` 또는 `Failed` 상태면 받는 사람 이메일 잘못됨 또는 Resend 도메인 미검증
- `Delivered` 표시인데 안 오면 스팸함 확인

---

## 7단계: 운영 모니터링 (선택)

언제든 Supabase SQL Editor에서 실행:

```sql
-- 최근 발송 20건
select email, level, status, error, created_at
from sample_requests
order by created_at desc
limit 20;

-- 일별 성공/실패율 (최근 7일)
select
  date_trunc('day', created_at)::date as day,
  count(*) filter (where status = 'sent') as sent,
  count(*) filter (where status = 'failed') as failed
from sample_requests
where created_at > now() - interval '7 days'
group by 1
order by 1 desc;

-- 인기 레벨 TOP 5 (최근 30일)
select level, count(*) as requests
from sample_requests
where status = 'sent' and created_at > now() - interval '30 days'
group by level
order by requests desc
limit 5;
```

---

## 🎁 보너스: Supabase 자동 정지 방지 (Free 플랜용)

Free 플랜은 7일 비활성 시 프로젝트를 자동 정지합니다. 막으려면 **GitHub Actions**으로 매일 한 번 ping을 날리면 됩니다.

이 저장소에 [.github/workflows/supabase-keepalive.yml](../.github/workflows/supabase-keepalive.yml)이 이미 만들어져 있습니다.
GitHub에 push하면 자동으로 활성화 — 별도 설정 불필요.

확인:
1. <https://github.com/taefung7-stack/Terra_Nova/actions> 접속
2. 좌측 **"Supabase Keepalive"** workflow 보임
3. 매일 한국 시간 새벽 4시에 자동 실행
4. 첫 수동 실행: 오른쪽 **Run workflow** 버튼

---

## 자주 묻는 질문

### Q1. PDF를 새로 업데이트하려면?
같은 이름(`mars.pdf` 등)으로 **덮어쓰기** 업로드. 다음 요청부터 새 PDF 자동 발송.

### Q2. 레벨별 PDF 1개씩, 총 10개 다 만들어야 하나?
아닙니다. 준비된 것만 올려도 됨. 미준비 레벨 요청 시 자동으로 안내 메시지.

### Q3. Resend 무료 3,000건 한도 초과되면?
Resend 대시보드에서 알림 옴. Pro $20/월 (50,000건) 또는 Business 플랜으로 업그레이드.
또는 SendGrid/Mailgun 등 다른 서비스로 교체 (`send-email/index.ts`의 fetch URL만 변경).

### Q4. 한 사용자가 여러 레벨 PDF 받고 싶으면?
30분 안에 같은 레벨은 1회 제한. 다른 레벨은 즉시 가능. 30분 후 같은 레벨도 다시 요청 가능.

### Q5. 도메인 검증을 안 하면 어떻게 되나?
`EMAIL_FROM`에 `onboarding@resend.dev`를 쓰면 Resend 가입 시 인증한 본인 이메일로만 발송 가능 (테스트 모드). 다른 이메일은 거부됨. 정식 출시 전엔 1-3단계 도메인 검증 필수.

### Q6. 함수 코드를 수정하고 싶으면?
1. 로컬에서 `supabase/functions/send-sample/index.ts` 편집
2. `supabase functions deploy send-sample --no-verify-jwt` 재배포
3. 1~2분 후 새 코드 적용

---

문의: 셋업 중 막히는 부분 있으면 어느 단계인지 알려주세요. 즉시 도와드리겠습니다.
