-- =====================================================================
-- Terra Nova · v6 migration — level_test_results 8-level support + anon
-- =====================================================================
-- 1. CHECK constraint 10단계 → 8단계로 축소
-- 2. recommended_planet (MARS|VENUS|...|SUN) 컬럼 추가
-- 3. anon_token UUID 추가 (비로그인 사용자 결과 임시 저장용)
-- 4. user_id NULL 허용 (anon 사용자)
-- 5. RLS 정책 갱신:
--    INSERT — 로그인 사용자(자기 user_id) + 비로그인(user_id IS NULL + anon_token)
--    SELECT — 본인 user_id만
--    UPDATE — anon row(user_id IS NULL)를 본인 user_id로 claim 허용 (linkup)
--
-- 적용 방법: Supabase Studio > SQL Editor에 붙여넣고 RUN
-- =====================================================================

-- 1. 기존 CHECK constraint 제거 + 새로 추가 (1~8)
alter table public.level_test_results
  drop constraint if exists level_test_results_level_check;

alter table public.level_test_results
  add constraint level_test_results_level_check check (level between 1 and 8);

-- 2. 새 컬럼 추가 (안전: IF NOT EXISTS)
alter table public.level_test_results
  add column if not exists recommended_planet text,
  add column if not exists anon_token uuid;

-- 3. user_id NULL 허용 (anon 결과)
alter table public.level_test_results
  alter column user_id drop not null;

-- 4. anon_token 인덱스 (linkup 시 빠른 조회)
create index if not exists lvl_anon_token_idx
  on public.level_test_results(anon_token)
  where anon_token is not null;

-- 5. RLS 정책 재설정
-- 5-1. INSERT — logged-in 본인 OR anon
drop policy if exists "lvl_insert_own" on public.level_test_results;
drop policy if exists "lvl_insert_own_or_anon" on public.level_test_results;
create policy "lvl_insert_own_or_anon" on public.level_test_results
  for insert
  with check (
    -- 로그인: user_id가 본인이어야
    (auth.uid() is not null and auth.uid() = user_id and anon_token is null)
    or
    -- 비로그인: user_id NULL + anon_token 있어야
    (auth.uid() is null and user_id is null and anon_token is not null)
  );

-- 5-2. SELECT — 본인 user_id만
drop policy if exists "lvl_select_own" on public.level_test_results;
drop policy if exists "lvl_select_own_or_anon" on public.level_test_results;
create policy "lvl_select_own" on public.level_test_results
  for select using (auth.uid() = user_id);

-- 5-3. UPDATE — anon → user 링크업 (가입/로그인 시 claim)
drop policy if exists "lvl_update_linkup" on public.level_test_results;
create policy "lvl_update_linkup" on public.level_test_results
  for update
  using (
    -- 본인 row 수정 OR anon row claim
    auth.uid() = user_id
    or (user_id is null and auth.uid() is not null)
  )
  with check (auth.uid() = user_id);

-- 6. 코멘트 갱신
comment on table public.level_test_results is '레벨 테스트 결과 (8단계: MARS~SUN)';
comment on column public.level_test_results.recommended_planet is '추천 행성/레벨 텍스트 (MARS/VENUS/TERRA/NEPTUNE/URANUS/SATURN/JUPITER/SUN)';
comment on column public.level_test_results.anon_token is '비로그인 사용자의 익명 토큰 — 가입 후 user_id로 linkup';

-- =====================================================================
-- 검증 쿼리 (RUN 후 실행해서 확인)
-- =====================================================================
-- select column_name, is_nullable, data_type from information_schema.columns
--   where table_name='level_test_results' and table_schema='public';
--
-- select policyname, cmd, qual, with_check from pg_policies
--   where tablename='level_test_results';
