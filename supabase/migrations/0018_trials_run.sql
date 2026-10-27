-- ============================================================================
-- Trial App — "run the trial" tools (Phase 2)
-- ----------------------------------------------------------------------------
-- Adds everything needed to run a trial day: on-the-day attendance, de-identified
-- game line-ups, team drafting (Shooters / Midcourt / Defenders), court-time
-- tracking, and manual-add players (billed to the club). All owner-only; none of
-- this is public.
-- ============================================================================

-- ---- Stable player number (per division) ---------------------------------
-- Players are shown on trial documents as a number (or initial+surname). The
-- number must stay put even if someone cancels, so we store it.
alter table public.trial_participants
  add column if not exists player_number integer;

-- Manually-added players: entered by the club, no online payment taken. The
-- $2.20 (and any add-ons) are the club's to collect — billed on their invoice.
alter table public.trial_participants
  add column if not exists manual_entry boolean not null default false;

-- Draft (team selection) — a participant belongs to one division, so the draft
-- slot lives on the participant row.
alter table public.trial_participants
  add column if not exists draft_team integer;         -- which team number (null = pool)
alter table public.trial_participants
  add column if not exists draft_bucket text
    check (draft_bucket in ('shooters','midcourt','defenders'));

-- Allow a 'manual' status (club-billed, not paid online).
alter table public.trial_participants
  drop constraint if exists trial_participants_status_check;
alter table public.trial_participants
  add constraint trial_participants_status_check
    check (status in ('pending','paid','cancelled','refunded','manual'));

-- How many draft teams the club wants to build for a division.
alter table public.trial_age_groups
  add column if not exists draft_team_count integer not null default 2
    check (draft_team_count between 1 and 20);

-- Backfill player numbers for any existing rows (sequential per division).
with numbered as (
  select id,
         row_number() over (
           partition by trial_id, age_group_id
           order by created_at, id
         ) as rn
  from public.trial_participants
  where player_number is null
)
update public.trial_participants p
set player_number = numbered.rn
from numbered
where p.id = numbered.id;

-- ---- Attendance (per session, per participant) ----------------------------
create table if not exists public.trial_attendance (
  id             uuid primary key default gen_random_uuid(),
  trial_id       uuid not null references public.trials (id) on delete cascade,
  session_id     uuid not null references public.trial_sessions (id) on delete cascade,
  participant_id uuid not null references public.trial_participants (id) on delete cascade,
  present        boolean not null default false,
  checked_in_at  timestamptz,
  unique (session_id, participant_id)
);

create index if not exists trial_attendance_session_idx
  on public.trial_attendance (session_id);

-- ---- Saved game line-ups (per session) ------------------------------------
-- The game builder runs in the app; we store its result so sheets re-print and
-- late arrivals can be folded in "from round N" without losing earlier rounds.
create table if not exists public.trial_session_games (
  session_id   uuid primary key references public.trial_sessions (id) on delete cascade,
  trial_id     uuid not null references public.trials (id) on delete cascade,
  num_games    integer not null default 2 check (num_games between 1 and 20),
  allow_shared boolean not null default true,
  result       jsonb   not null default '{}'::jsonb,   -- {games, playCount, playedPref, sharedCount, attendeeIds}
  generated_at timestamptz not null default now()
);

-- ============================================================================
-- Row Level Security — owner only (these reference minors' participation)
-- ============================================================================
alter table public.trial_attendance    enable row level security;
alter table public.trial_session_games enable row level security;

drop policy if exists "owner manages attendance" on public.trial_attendance;
create policy "owner manages attendance" on public.trial_attendance
  for all using (exists (
    select 1 from public.trials t
    where t.id = trial_attendance.trial_id and t.owner_user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.trials t
    where t.id = trial_attendance.trial_id and t.owner_user_id = auth.uid()
  ));

drop policy if exists "owner manages session games" on public.trial_session_games;
create policy "owner manages session games" on public.trial_session_games
  for all using (exists (
    select 1 from public.trials t
    where t.id = trial_session_games.trial_id and t.owner_user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.trials t
    where t.id = trial_session_games.trial_id and t.owner_user_id = auth.uid()
  ));
