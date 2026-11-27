-- Netball Court - Drawing: geo tracking + suspend/reactivate.
-- Adds last-seen location columns so Caitlyn gets an email alert when an
-- existing account signs in from a new country, and a suspended flag she
-- can toggle from the admin area.

alter table public.court_planner_access
  add column if not exists last_seen_country   text,
  add column if not exists last_seen_city      text,
  add column if not exists last_seen_at        timestamptz,
  add column if not exists last_alerted_country text,
  add column if not exists suspended_at        timestamptz,
  add column if not exists suspended_reason    text,
  add column if not exists suspended_by        uuid references auth.users(id);

create index if not exists court_planner_access_suspended_idx
  on public.court_planner_access (suspended_at)
  where suspended_at is not null;
