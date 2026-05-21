# 3종 이벤트 시스템 — Supabase 셋업 가이드

> 2026-05-21 신설. 리뷰/SNS 후기/성적인증 3종 이벤트를 운영하기 위한
> Supabase 스키마 확장과 RLS 정책. SQL Editor에서 순서대로 실행.
>
> 기존 `reviews` + `coupons` 테이블은 그대로 유지하고,
> 신규 `event_submissions` 테이블에서 모든 인증 제출을 통합 관리한다.

## 0. 적용 순서

1. SQL Editor에서 [1. `coupons` reward_kind 확장](#1-coupons-rewardkind-확장)
2. SQL Editor에서 [2. `coupons.type` 확장](#2-couponstype-확장)
3. SQL Editor에서 [3. `event_submissions` 테이블 생성](#3-eventsubmissions-테이블-생성)
4. Storage에서 [4. `event-proofs` 버킷 생성](#4-eventproofs-storage-버킷)
5. SQL Editor에서 [5. RLS 정책](#5-rls-정책)

---

## 1. `coupons.reward_kind` 확장

기존 free_month_light · percent_off · fixed_off 에 더해 3종 이벤트용 보상값 추가.

```sql
alter table public.coupons
  drop constraint if exists coupons_reward_kind_check;

alter table public.coupons
  add constraint coupons_reward_kind_check
  check (reward_kind in (
    'free_month_light',      -- 기존: LIGHT 1개월 무료
    'percent_off',           -- 기존: % 할인
    'fixed_off',             -- 기존: 정액 할인
    'discount_30_next',      -- NEW: 다음달 30% 할인 (리뷰 이벤트)
    'free_month_any',        -- NEW: 한 달 무료 (SNS 후기 이벤트)
    'free_6months'           -- NEW: 6개월 무료 (성적인증 이벤트)
  ));
```

## 2. `coupons.type` 확장

이벤트 타입을 명시적으로 구분.

```sql
alter table public.coupons
  drop constraint if exists coupons_type_check;

alter table public.coupons
  add constraint coupons_type_check
  check (type in (
    'review_sns_free_month',   -- 기존 (점진적 폐기 예정)
    'admin_grant',
    'signup_bonus',
    'other',
    'event_review',            -- NEW: 리뷰 이벤트 (30% 할인)
    'event_sns',               -- NEW: SNS 후기 이벤트 (한 달 무료)
    'event_grade'              -- NEW: 성적인증 이벤트 (6개월 무료)
  ));
```

## 3. `event_submissions` 테이블 생성

3종 이벤트 인증 제출을 통합 관리. 기존 `reviews` 테이블의 SNS 인증 흐름과는 독립.

```sql
create table if not exists public.event_submissions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  event_type      text not null check (event_type in ('review','sns','grade')),
  -- 공통: 메시지 (사용자 한마디)
  message         text,
  -- 리뷰/SNS 공통
  sns_platform    text check (sns_platform in ('instagram','blog','naver_cafe','threads','x','youtube','homepage','other')),
  sns_url         text,
  -- 첨부 파일 (event-proofs 버킷의 경로)
  proof_path      text,
  proof_path_2    text,                                             -- 성적인증: 학습 전/후 2장
  -- 검토 상태
  status          text not null default 'pending' check (status in ('pending','approved','rejected')),
  rejection_note  text,                                             -- 반려 사유
  reviewed_at     timestamptz,
  reviewed_by     uuid references auth.users(id),
  -- 발급된 쿠폰 연결
  coupon_id       uuid references public.coupons(id) on delete set null,
  -- 메타
  created_at      timestamptz not null default now()
);

create index if not exists event_submissions_user_idx   on public.event_submissions(user_id, created_at desc);
create index if not exists event_submissions_status_idx on public.event_submissions(status, event_type);
create index if not exists event_submissions_pending_idx on public.event_submissions(event_type, created_at desc) where status = 'pending';

comment on table public.event_submissions is '3종 이벤트(리뷰/SNS/성적인증) 제출 통합 테이블';
comment on column public.event_submissions.event_type is 'review=리뷰 이벤트(30% 할인), sns=SNS 후기(한달 무료), grade=성적인증(6개월 무료)';
comment on column public.event_submissions.proof_path is 'event-proofs 버킷의 첨부 파일 경로 (캡처/성적표 등)';
comment on column public.event_submissions.proof_path_2 is '성적인증 이벤트: 학습 전 성적표 (proof_path는 학습 후)';
```

### 1인 1회 제약 (이벤트당)

```sql
create unique index if not exists event_submissions_one_per_user
  on public.event_submissions(user_id, event_type)
  where status in ('pending','approved');
```

같은 이벤트에 reject 된 경우는 재제출 가능. approved 된 경우 다시 못 만듦.

## 4. `event-proofs` Storage 버킷

Supabase Studio → Storage → New bucket:

- 이름: `event-proofs`
- Public: **off** (private)
- File size limit: 10MB
- Allowed MIME: `image/png, image/jpeg, image/webp, image/heic, application/pdf`

성적표 PDF 업로드를 허용하므로 application/pdf 포함.

## 5. RLS 정책

### event_submissions

```sql
alter table public.event_submissions enable row level security;

-- 본인 제출 SELECT
drop policy if exists "ev_sub_own_select" on public.event_submissions;
create policy "ev_sub_own_select"
on public.event_submissions for select to authenticated
using (auth.uid() = user_id);

-- 본인 제출 INSERT (status는 항상 pending)
drop policy if exists "ev_sub_own_insert" on public.event_submissions;
create policy "ev_sub_own_insert"
on public.event_submissions for insert to authenticated
with check (auth.uid() = user_id and status = 'pending');

-- admin 전체 SELECT/UPDATE
drop policy if exists "ev_sub_admin_all" on public.event_submissions;
create policy "ev_sub_admin_all"
on public.event_submissions for all to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));
```

### event-proofs Storage

```sql
-- 본인 폴더만 INSERT (`{user_id}/...` 경로)
create policy "event_proofs_own_insert"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'event-proofs'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 본인 폴더 SELECT
create policy "event_proofs_own_select"
on storage.objects for select to authenticated
using (
  bucket_id = 'event-proofs'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- admin은 전체 SELECT (캡처 검토용 signed URL 발급)
create policy "event_proofs_admin_select"
on storage.objects for select to authenticated
using (
  bucket_id = 'event-proofs'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
);
```

## 6. 확인

- `mypage.html → 리뷰 작성 탭` 에서 3개 이벤트 인증 폼이 분리되어 보이는지
- `admin.html → 이벤트 제출` 탭에서 pending 항목 검토 + 승인 시 자동 쿠폰 발급
- 본인 마이페이지 "내 쿠폰함" 에 발급된 쿠폰 표시
