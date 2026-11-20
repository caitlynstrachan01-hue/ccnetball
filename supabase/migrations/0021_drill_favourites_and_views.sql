-- Drills Library: members' favourite drills, and video views for Caitlyn's
-- private "most popular" report.
-- Run once in the Supabase SQL Editor: New query → paste → Run.

-- 1. Favourites — one row per member per starred drill.
create table if not exists public.drill_favourites (
  user_id uuid not null references auth.users on delete cascade,
  drill_id uuid not null references public.drills (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, drill_id)
);

alter table public.drill_favourites enable row level security;

drop policy if exists "drill_favourites: own select" on public.drill_favourites;
create policy "drill_favourites: own select"
  on public.drill_favourites for select
  using ( auth.uid() = user_id );

drop policy if exists "drill_favourites: admin select" on public.drill_favourites;
create policy "drill_favourites: admin select"
  on public.drill_favourites for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

drop policy if exists "drill_favourites: own insert" on public.drill_favourites;
create policy "drill_favourites: own insert"
  on public.drill_favourites for insert
  with check ( auth.uid() = user_id );

drop policy if exists "drill_favourites: own delete" on public.drill_favourites;
create policy "drill_favourites: own delete"
  on public.drill_favourites for delete
  using ( auth.uid() = user_id );

-- 2. Video views — one row every time a member plays a drill's video.
create table if not exists public.drill_views (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users on delete cascade,
  drill_id uuid not null references public.drills (id) on delete cascade,
  viewed_at timestamptz not null default now()
);

create index if not exists idx_drill_views_drill on public.drill_views (drill_id);
create index if not exists idx_drill_views_user on public.drill_views (user_id);

alter table public.drill_views enable row level security;

-- Members can add their own views but never read anyone's.
drop policy if exists "drill_views: own insert" on public.drill_views;
create policy "drill_views: own insert"
  on public.drill_views for insert
  with check ( auth.uid() = user_id );

drop policy if exists "drill_views: admin select" on public.drill_views;
create policy "drill_views: admin select"
  on public.drill_views for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

-- Signed-out visitors get nothing.
revoke all on public.drill_favourites from anon;
revoke all on public.drill_views from anon;
