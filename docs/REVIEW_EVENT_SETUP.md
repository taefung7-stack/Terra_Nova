# 리뷰 이벤트 — Supabase 셋업 가이드

> "리뷰 작성 + SNS 업로드 + 인증 → 다음 달 PDF 1개월 무료" 이벤트를 운영하기
> 위해 Supabase에 추가해야 하는 스키마 변경과 RLS 정책을 한 번에 정리한
> 문서. SQL Editor에서 아래 블록을 그대로 실행하면 됩니다.

## 0. 적용 순서 요약

1. SQL Editor에서 [1. `reviews` 테이블 컬럼 추가](#1-reviews-컬럼-추가) 실행
2. SQL Editor에서 [2. `coupons` 테이블 생성](#2-coupons-테이블-생성) 실행
3. Storage에서 [3. `review-proofs` 버킷 생성](#3-review-proofs-storage-버킷) (UI에서 클릭으로)
4. SQL Editor에서 [4. RLS 정책](#4-rls-정책) 실행
5. 확인 — `mypage.html → 리뷰 작성 탭`에서 SNS URL 입력란이 보이는지 / `admin.html → 리뷰 관리`에서 "쿠폰 발급" 버튼이 보이는지

---

## 1. `reviews` 컬럼 추가

리뷰 작성 시 SNS 인증 정보를 같이 받기 위해 컬럼 4개 추가.

```sql
alter table public.reviews
  add column if not exists sns_url           text,                            -- 사용자가 SNS에 올린 게시물 URL
  add column if not exists sns_screenshot    text,                            -- Supabase Storage 경로 (review-proofs 버킷)
  add column if not exists sns_platform      text check (sns_platform in ('instagram','blog','naver_cafe','threads','x','other')),
  add column if not exists coupon_issued_at  timestamptz;                     -- 쿠폰 발급 시각 (한 리뷰당 1회만)

comment on column public.reviews.sns_url           is '리뷰 이벤트: 사용자가 SNS에 올린 게시물 링크';
comment on column public.reviews.sns_screenshot    is '리뷰 이벤트: Supabase Storage review-proofs 버킷의 캡처 파일 경로';
comment on column public.reviews.sns_platform      is '리뷰 이벤트: SNS 플랫폼 (instagram/blog/...)';
comment on column public.reviews.coupon_issued_at  is '리뷰 이벤트: 쿠폰 발급 완료 시각 — null이면 아직 미발급';
```

## 2. `coupons` 테이블 생성

```sql
create table if not exists public.coupons (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  code            text unique not null,                               -- 사람이 입력 가능한 형태: TN-RV-XXXX-XXXX
  type            text not null check (type in ('review_sns_free_month','admin_grant','signup_bonus','other')),
  reward_kind     text not null check (reward_kind in ('free_month_light','percent_off','fixed_off')),
  reward_value    int,                                                -- percent_off=10이면 10%, fixed_off=5000이면 5000원, free_month_light=null
  source_review_id uuid references public.reviews(id) on delete set null,  -- 어느 리뷰로 발급됐는지 추적
  valid_from      timestamptz not null default now(),
  valid_until     timestamptz not null default (now() + interval '90 days'),
  used_at         timestamptz,
  used_order_id   text,                                               -- order.html / market_checkout.html 결제 시 채움
  created_by      uuid references auth.users(id),                     -- 발급한 admin (NULL이면 시스템 자동)
  created_at      timestamptz not null default now()
);

create index if not exists coupons_user_id_idx on public.coupons(user_id);
create index if not exists coupons_code_idx    on public.coupons(code);
create index if not exists coupons_unused_idx  on public.coupons(user_id) where used_at is null;
```

### 쿠폰 코드 자동 생성 함수 (선택)

```sql
create or replace function public.generate_coupon_code(prefix text default 'TN-RV')
returns text
language plpgsql
as $$
declare
  candidate text;
  exists_count int;
begin
  loop
    candidate := prefix || '-' ||
                 upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4)) || '-' ||
                 upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4));
    select count(*) into exists_count from public.coupons where code = candidate;
    exit when exists_count = 0;
  end loop;
  return candidate;
end;
$$;
```

## 3. `review-proofs` Storage 버킷

Supabase Studio → Storage → New Bucket:

- **Name**: `review-proofs`
- **Public**: ❌ (private)
- **File size limit**: 5 MB
- **Allowed MIME types**: `image/png,image/jpeg,image/webp`

## 4. RLS 정책

### `reviews` 테이블 (이미 있을 수 있음 — 없으면 추가)

```sql
alter table public.reviews enable row level security;

-- 모든 사용자: 본인 리뷰 조회
drop policy if exists "reviews_select_own" on public.reviews;
create policy "reviews_select_own" on public.reviews
  for select using (auth.uid() = user_id);

-- 모든 방문자: 공개된 리뷰 조회 (review-feed.js + landing.html)
drop policy if exists "reviews_select_published" on public.reviews;
create policy "reviews_select_published" on public.reviews
  for select using (is_published = true);

-- 본인: 리뷰 작성 / 수정 / 삭제
drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own" on public.reviews
  for insert with check (auth.uid() = user_id);

drop policy if exists "reviews_update_own" on public.reviews;
create policy "reviews_update_own" on public.reviews
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "reviews_delete_own" on public.reviews;
create policy "reviews_delete_own" on public.reviews
  for delete using (auth.uid() = user_id);
```

> ⚠ **admin이 `is_published`/`is_verified`/`coupon_issued_at` 등을 수정해야 하므로**
> 별도의 admin role 정책이 필요합니다. 가장 간단한 방법은 `profiles.role = 'admin'`
> 컬럼을 두고 SECURITY DEFINER 함수로 우회하거나, Service Role Key를 admin.html에
> 환경변수로 주입하는 것. 현재는 Supabase Studio의 Authenticator로 admin 작업은
> 콘솔 직접 처리한다고 가정. (필요하면 admin role 정책 별도 정의 가능)

### `coupons` 테이블

```sql
alter table public.coupons enable row level security;

-- 본인: 본인 쿠폰만 조회 (mypage 쿠폰함)
drop policy if exists "coupons_select_own" on public.coupons;
create policy "coupons_select_own" on public.coupons
  for select using (auth.uid() = user_id);

-- INSERT는 admin만 (Service Role Key 또는 admin role 함수 통해서) — 일반 유저는 직접 발급 불가
-- DELETE / UPDATE도 마찬가지

-- 결제 시 본인 쿠폰의 used_at 채우는 정책 (간이)
drop policy if exists "coupons_redeem_own" on public.coupons;
create policy "coupons_redeem_own" on public.coupons
  for update using (auth.uid() = user_id and used_at is null)
  with check (auth.uid() = user_id);
```

### `review-proofs` Storage 버킷 정책

Supabase Studio → Storage → review-proofs → Policies:

```sql
-- 본인 폴더에만 업로드 (경로: {user_id}/{filename})
create policy "review_proofs_upload_own" on storage.objects
  for insert with check (
    bucket_id = 'review-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 본인 파일 조회
create policy "review_proofs_read_own" on storage.objects
  for select using (
    bucket_id = 'review-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
```

## 5. 결제 시 쿠폰 적용 (TODO — order.html / market_checkout.html)

쿠폰 사용 흐름은 결제 단에서 처리됩니다. 현재 코드에는 placeholder만 있고
실제 차감 로직은 다음 작업으로 미뤄두었습니다:

```
1. order.html의 결제 폼에 "쿠폰 코드" 입력란 추가
2. 코드 검증: select * from coupons where code = ? and user_id = auth.uid() and used_at is null and valid_until > now()
3. reward_kind === 'free_month_light' && plan === 'light' → 결제 금액 0원
4. 결제 성공 시 update coupons set used_at = now(), used_order_id = '...' where id = ?
```

---

## 운영 체크리스트

| 항목 | 위치 | 빈도 |
|---|---|---|
| 검토 대기 리뷰 확인 | admin.html → 리뷰 관리 → 검토 중 필터 | 매일 |
| SNS 링크 확인 | 각 리뷰 카드 SNS URL 클릭 → 게시물 실재 확인 | 승인 시 |
| 쿠폰 발급 | "SNS 인증 + 쿠폰 발급" 버튼 클릭 | 승인과 동시에 |
| 만료 임박 쿠폰 알림 | (수동) `select * from coupons where used_at is null and valid_until < now() + interval '7 days'` | 주 1회 |
