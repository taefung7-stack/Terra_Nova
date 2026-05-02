-- Terra Nova · Sample Request automation (v5)
-- 적용: Supabase Dashboard → SQL Editor 에 붙여 넣고 RUN
-- 의존성: handle_updated_at() (v1 schema), gen_random_uuid (pg_crypto/pgcrypto)

-- ────────────────────────────────────────────────────
-- 1. sample_requests 테이블
-- ────────────────────────────────────────────────────
create table if not exists public.sample_requests (
  id           uuid primary key default gen_random_uuid(),
  email        text not null,
  level        text not null,                 -- moon | mercury | ... | sun
  status       text not null default 'pending',  -- pending | sent | failed
  error        text,
  user_agent   text,
  created_at   timestamptz not null default now(),
  sent_at      timestamptz
);

create index if not exists sample_requests_email_idx
  on public.sample_requests(email);
create index if not exists sample_requests_created_idx
  on public.sample_requests(created_at desc);
create index if not exists sample_requests_status_idx
  on public.sample_requests(status);

comment on table public.sample_requests is
  '샘플 PDF 발송 요청 로그 (anon 사용자도 INSERT 가능, send-sample Edge Function에서 status 갱신)';

-- ────────────────────────────────────────────────────
-- 2. RLS — 누구나 INSERT 가능, 조회는 service_role만
-- ────────────────────────────────────────────────────
alter table public.sample_requests enable row level security;

-- INSERT: 익명 포함 누구나 (회원가입 없이 샘플 요청 가능)
drop policy if exists "sample_requests_insert_any" on public.sample_requests;
create policy "sample_requests_insert_any" on public.sample_requests
  for insert to anon, authenticated
  with check (true);

-- SELECT/UPDATE/DELETE: 정책 없음 → service_role만 (Edge Function이 service_role로 접근)
-- 관리자 통계 조회는 Supabase Studio에서 service_role 키로 직접

-- ────────────────────────────────────────────────────
-- 3. Rate-limit 함수 — 같은 이메일+레벨 30분 내 재요청 차단
-- ────────────────────────────────────────────────────
create or replace function public.check_sample_rate_limit(
  p_email text,
  p_level text
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count int;
begin
  select count(*) into recent_count
  from public.sample_requests
  where email = p_email
    and level = p_level
    and status = 'sent'                         -- 'pending'/'failed'은 카운트 X
    and created_at > (now() - interval '30 minutes');
  return recent_count = 0;                      -- true = 발송 OK
end;
$$;

comment on function public.check_sample_rate_limit is
  '같은 이메일·레벨 조합으로 30분 이내 발송 성공 이력이 있으면 false 반환';

-- ────────────────────────────────────────────────────
-- 4. Storage bucket 'sample-pdfs' 가이드 (수동 생성 필요)
-- ────────────────────────────────────────────────────
-- Supabase Dashboard → Storage → New bucket
--   • Name: sample-pdfs
--   • Public bucket: OFF (signed URL로만 접근)
--   • File size limit: 25 MB
-- 업로드 파일명 규약: {level}.pdf  (예: moon.pdf, mercury.pdf, ..., sun.pdf)
-- 추후 PDF만 교체하면 코드 수정 없이 최신 자료가 발송됨.
