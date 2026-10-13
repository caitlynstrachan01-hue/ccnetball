-- Session planner: Caitlyn can recommend a coach's plan to other coaches.
-- Run this once in the Supabase SQL Editor: New query → paste → Run.
-- Recommended plans are served to members by the server with the original
-- coach's brief and identity stripped, so no new read policy is needed.

alter table public.session_plans
  add column if not exists recommended boolean not null default false;

create index if not exists idx_session_plans_recommended
  on public.session_plans (recommended, age_group)
  where recommended;
