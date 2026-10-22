-- Drills library: step-by-step drill instructions, separate from the short
-- description and from the coaching (error detection & correction) points.
-- Run this once in the Supabase SQL Editor: New query → paste → Run.

alter table public.drills
  add column if not exists instructions text[] not null default '{}';
