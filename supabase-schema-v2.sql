-- ==========================================================
-- Terra Nova Schema v2.0 - 리뷰 + 뉴스레터 + Search Console 추가
-- 기존 schema v1.0을 이미 실행한 상태에서 이 파일을 추가로 실행하세요.
-- ==========================================================

-- ── 7. REVIEWS (수강 후기) ────────────────────────────────
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  author_name text not null,
  author_grade text,
  level text check (level in ('STARTER','JUNIOR','BASIC','INTERMEDIATE','ADVANCED','MASTER')),
  rating int check (rating between 1 and 5) not null,
  title text not null,
  content text not null,
  is_published boolean default false, -- 관리자 승인 후 공개
  is_verified boolean default false,  -- 실제 구독 회원 인증 마크
  created_at timestamptz default now()
);
comment on table public.reviews is '수강 후기';
create index if not exists reviews_published_idx on public.reviews(is_published, created_at desc);

alter table public.reviews enable row level security;

-- RLS: 공개된 리뷰는 누구나 조회 가능
drop policy if exists "reviews_public_read" on public.reviews;
create policy "reviews_public_read" on public.reviews
  for select using (is_published = true);

-- 로그인 사용자는 본인 리뷰 작성 가능
drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own" on public.reviews
  for insert with check (auth.uid() = user_id);

-- 본인 리뷰 수정/삭제
drop policy if exists "reviews_update_own" on public.reviews;
create policy "reviews_update_own" on public.reviews
  for update using (auth.uid() = user_id);

drop policy if exists "reviews_delete_own" on public.reviews;
create policy "reviews_delete_own" on public.reviews
  for delete using (auth.uid() = user_id);

-- ── 8. NEWSLETTER SUBSCRIBERS ─────────────────────────────
create table if not exists public.newsletter_subscribers (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  source text, -- 'landing' | 'checkout' | 'footer' 등
  consented_at timestamptz default now(),
  unsubscribed_at timestamptz,
  tags jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);
comment on table public.newsletter_subscribers is '뉴스레터 구독자';
create index if not exists newsletter_email_idx on public.newsletter_subscribers(email);

alter table public.newsletter_subscribers enable row level security;

-- 누구나 구독 가능 (insert)
drop policy if exists "newsletter_public_insert" on public.newsletter_subscribers;
create policy "newsletter_public_insert" on public.newsletter_subscribers
  for insert with check (true);

-- 조회는 관리자만 (service_role) — 기본적으로 RLS가 막음

-- ── 시드: 초기 리뷰 3개 (예시 — 관리자 승인 상태) ───────
insert into public.reviews (author_name, author_grade, level, rating, title, content, is_published, is_verified)
values
  ('김**', '고등학교 1학년', 'INTERMEDIATE', 5, '정말 달라졌어요', '매달 새로운 지문이 와서 지루하지 않고, 해설이 자세해서 혼자서도 공부가 가능해요. 모의고사 등급이 3등급에서 1등급으로 올랐습니다.', true, true),
  ('이**', '중학교 3학년', 'BASIC', 5, '영어가 재밌어졌어요', '기존 문제집은 지루했는데 Terra Nova는 과학·사회 지문이 섞여 있어서 영어 공부하면서 지식도 쌓이는 느낌이에요.', true, true),
  ('박**', '고등학교 3학년', 'MASTER', 4, '수능 대비에 최적', 'EBS 연계 지문 + 고난도 킬러 문항이 같이 있어서 실전 감각 유지에 딱 좋아요. 해설 영상이 있으면 더 좋을 것 같아요.', true, true)
on conflict do nothing;

-- ── 완료 확인 ──
select 'Terra Nova v2 schema extension installed.' as msg;
select table_name from information_schema.tables
  where table_schema='public' and table_name in ('reviews','newsletter_subscribers')
  order by table_name;
