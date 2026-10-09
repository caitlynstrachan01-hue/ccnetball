-- Drills library v2: richer drill details + members' session planner.
-- Run this once in the Supabase SQL Editor: New query → paste → Run.

-- 1. New drill fields.
alter table public.drills
  add column if not exists equipment text,
  add column if not exists group_size text,
  add column if not exists tags text[] not null default '{}',
  add column if not exists age_groups text[] not null default '{}',
  add column if not exists age_notes jsonb not null default '{}'::jsonb,
  add column if not exists session_slot text,
  add column if not exists hidden boolean not null default false;

-- 2. Saved session plans — the planner's memory of what each coach ran.
create table if not exists public.session_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  title text not null,
  brief text,
  age_group text,
  duration_minutes int,
  plan jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_session_plans_user
  on public.session_plans (user_id, created_at desc);

alter table public.session_plans enable row level security;

drop policy if exists "session_plans: own rows" on public.session_plans;
create policy "session_plans: own rows"
  on public.session_plans for all
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

drop trigger if exists session_plans_set_updated_at on public.session_plans;
create trigger session_plans_set_updated_at
  before update on public.session_plans
  for each row execute function public.set_updated_at();
