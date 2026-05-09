-- =====================================================================
-- Terra Nova · v8 migration — reviews.level 8단계 행성으로 통합
-- =====================================================================
-- 기존: STARTER|JUNIOR|BASIC|INTERMEDIATE|ADVANCED|MASTER (legacy 6단계)
-- 변경: MARS|VENUS|TERRA|NEPTUNE|URANUS|SATURN|JUPITER|SUN (8행성)
--      또는 NULL (선택사항)
--
-- 적용: Supabase Studio > SQL Editor > 붙여넣기 > RUN
-- =====================================================================

-- 1. 기존 CHECK 제거
alter table public.reviews
  drop constraint if exists reviews_level_check;

-- 2. 기존 row 매핑 (있다면)
-- legacy 6단계 → 신 8단계 추정 매핑
update public.reviews set level = case level
  when 'STARTER'      then 'MARS'      -- 초3·4·5 → MARS
  when 'JUNIOR'       then 'VENUS'     -- 초5·6   → VENUS
  when 'BASIC'        then 'TERRA'     -- 중1·2   → TERRA
  when 'INTERMEDIATE' then 'URANUS'    -- 중3·고1 → URANUS
  when 'ADVANCED'     then 'JUPITER'   -- 고2     → JUPITER
  when 'MASTER'       then 'SUN'       -- 고3     → SUN
  else level
end where level in ('STARTER','JUNIOR','BASIC','INTERMEDIATE','ADVANCED','MASTER');

-- 3. 새 CHECK 추가 (8행성 또는 NULL)
alter table public.reviews
  add constraint reviews_level_check
  check (level is null or level in ('MARS','VENUS','TERRA','NEPTUNE','URANUS','SATURN','JUPITER','SUN'));

comment on column public.reviews.level is '리뷰 작성자 레벨 (8행성 — MARS/VENUS/TERRA/NEPTUNE/URANUS/SATURN/JUPITER/SUN)';

-- =====================================================================
-- 검증
-- =====================================================================
-- select level, count(*) from public.reviews group by level;
