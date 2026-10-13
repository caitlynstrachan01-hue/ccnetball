-- Drills library: coaching points for each drill (shown in the library and
-- on printed session plans).
-- Run this once in the Supabase SQL Editor: New query → paste → Run.

alter table public.drills
  add column if not exists coaching_points text[] not null default '{}';
