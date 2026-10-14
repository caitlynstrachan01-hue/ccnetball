-- Drills library: a fixed drill number, separate from the list order.
-- Run this once in the Supabase SQL Editor: New query → paste → Run.
-- sort_order stays the list position; drill_number is Caitlyn's own number
-- and never changes when she reorders. Existing numbers are kept.

alter table public.drills
  add column if not exists drill_number int;

update public.drills
  set drill_number = sort_order + 1
  where drill_number is null;
