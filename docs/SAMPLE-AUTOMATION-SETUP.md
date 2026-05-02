# 샘플 PDF 자동 발송 셋업 가이드

`sample.html`의 "샘플 받기" 버튼을 실제 자동 발송 시스템으로 동작시키기 위한 일회성 설정입니다.

## 아키텍처

```
[브라우저: sample.html]
        │ POST { email, level }
        ▼
[Edge Function: send-sample]   ← 공개, no-verify-jwt
        │
        ├── ① rate-limit 체크 (RPC: check_sample_rate_limit)
        ├── ② sample_requests INSERT (status=pending)
        ├── ③ Storage signed URL 생성 (sample-pdfs/{level}.pdf, 1h TTL)
        ├── ④ send-email 함수 호출 (sample_request 템플릿)
        └── ⑤ status=sent / failed 갱신
                    │
                    ▼
[Resend API] → 사용자 메일함 (다운로드 버튼 포함)
```

## 1. SQL 적용

[Supabase Dashboard → SQL Editor](https://supabase.com/dashboard/project/_/sql)에서 [supabase-schema-v5-samples.sql](../supabase-schema-v5-samples.sql) 전체를 붙여 넣고 **RUN**.

생성되는 것:
- `public.sample_requests` 테이블 (anon INSERT 허용, 조회는 service_role만)
- `check_sample_rate_limit(email, level)` RPC — 30분 내 같은 요청 차단

## 2. Storage 버킷 생성

Supabase Dashboard → **Storage** → **New bucket**

| 항목 | 값 |
|---|---|
| Name | `sample-pdfs` |
| Public bucket | **OFF** (signed URL로만 접근) |
| File size limit | 25 MB |
| Allowed MIME types | `application/pdf` |

## 3. PDF 업로드

생성한 버킷에 다음 파일명으로 PDF 업로드:

```
moon.pdf       ← 초3 (MOON)
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

> 아직 준비 안 된 레벨은 비워둬도 됩니다. 사용자가 해당 레벨을 요청하면 "준비 중" 메시지가 자동으로 안내됩니다 (PDF만 추후 업로드하면 즉시 발송 가능).

> 같은 파일명으로 **재업로드하면 다음 요청부터 새 PDF가 자동으로 발송**됩니다 — 코드 수정 불필요.

## 4. Edge Function 배포

CLI 필요: `npm install -g supabase`

```bash
# 프로젝트 연결 (이미 되어 있으면 스킵)
supabase link --project-ref betkydmxrnlhgmnprbca

# 새 함수 배포 (no-verify-jwt: 익명 호출 허용)
supabase functions deploy send-sample --no-verify-jwt

# 기존 send-email 함수도 sample_request 템플릿이 추가됐으므로 재배포
supabase functions deploy send-email --no-verify-jwt
```

## 5. 환경변수 (Secrets) 등록

Supabase Dashboard → **Edge Functions** → **Manage secrets**

다음 값이 모두 등록되어 있어야 합니다 (이미 다른 함수용으로 설정돼 있을 수 있음):

| Secret | 값 | 설명 |
|---|---|---|
| `SUPABASE_URL` | `https://betkydmxrnlhgmnprbca.supabase.co` | 프로젝트 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | (Dashboard → Settings → API) | RLS 우회 + 서명 URL 발급 |
| `RESEND_API_KEY` | `re_xxxxxxxx` | [resend.com/api-keys](https://resend.com/api-keys) (무료 월 3,000건) |
| `EMAIL_FROM` | `Terra Nova <no-reply@terra-nova.kr>` | 도메인 검증 후 사용 |
| `INTERNAL_EMAIL_SECRET` | (랜덤 32자) | 함수 간 호출 인증용 — 한 번 정한 값 유지 |

> **Resend 도메인 검증**: terra-nova.kr DNS에 SPF/DKIM 레코드 등록 필요. Resend 대시보드 가이드 따라 1회만 설정.

## 6. 동작 확인

배포 후 [terra-nova.kr/sample.html](https://terra-nova.kr/sample.html) 에서:

1. 임의 레벨 탭 클릭 (예: MARS)
2. 본인 이메일 입력 → 샘플 받기
3. 1~5초 안에 알림: "MARS 레벨 샘플 PDF를 ... 발송했습니다!"
4. 메일함 확인 → 다운로드 버튼 → PDF 열림

**문제 시 디버그**:
- 브라우저 DevTools → Network 탭 → `send-sample` 응답 status/body 확인
- Supabase Dashboard → Edge Functions → `send-sample` → Logs
- `select * from sample_requests order by created_at desc limit 20;` 로 발송 이력 조회

## 7. 운영 통계 SQL

```sql
-- 최근 7일 발송 현황 (성공/실패율)
select
  date_trunc('day', created_at)::date as day,
  level,
  count(*) filter (where status = 'sent')   as sent,
  count(*) filter (where status = 'failed') as failed,
  count(*) filter (where status = 'pending') as pending
from public.sample_requests
where created_at > now() - interval '7 days'
group by 1, 2
order by 1 desc, 2;

-- 가장 인기 있는 레벨 TOP 5 (최근 30일)
select level, count(*) as requests
from public.sample_requests
where status = 'sent'
  and created_at > now() - interval '30 days'
group by level
order by requests desc
limit 5;
```

## 8. 보안·rate-limit 정책

- **이메일+레벨 30분 1회**: 봇/장난 트래픽 차단 (`check_sample_rate_limit` RPC)
- **service_role 키**: Edge Function 안에서만 사용, 프론트엔드 노출 X
- **signed URL 1시간**: 메일 본문이 유출돼도 영구 다운로드 불가
- **Storage 버킷 Public OFF**: 직접 URL 접근 불가, 서명 키 필수

추가 강화 옵션 (필요 시):
- Cloudflare Turnstile / hCaptcha를 sample.html 폼에 추가 → bot 트래픽 0
- IP 단위 rate-limit (현재는 email+level만) → check_sample_rate_limit 함수 확장
- send-email RESEND_API_KEY 월 한도 모니터링 → 임계값 초과 시 슬랙 알림
