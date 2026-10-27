-- ============================================================================
-- Trial App — core tables
-- ----------------------------------------------------------------------------
-- A club / association keeps a single account and creates "trials" over time.
-- Each trial has one or more age groups; each age group runs one or more
-- sessions (a date, time and venue). Players register themselves through a
-- public link and pay the CC Netball fee (+ any association add-ons) at
-- registration via Stripe — mirroring the shop checkout flow.
--
-- Privacy: participant rows hold minors' personal + medical data. Anon users
-- may only INSERT a pending registration (they never read anyone's data).
-- Reading participant data is limited to the trial's owner (the club account)
-- and the service-role key used by the Stripe webhook. Personal fields are
-- wiped `retention_months` after the trial's last session (handled elsewhere);
-- a de-identified summary is kept.
-- ============================================================================

-- ---- Trials ---------------------------------------------------------------
create table if not exists public.trials (
  id                   uuid primary key default gen_random_uuid(),
  slug                 text not null unique,              -- public URL: /trials/<slug>
  name                 text not null,                     -- "Brisbane Budgies Netball Club Trials 2027"
  club                 text not null,                     -- association / club name
  club_email           text not null,                     -- for invoice + notifications
  owner_user_id        uuid references auth.users (id) on delete set null,

  -- NOTE: finances live on each division (trial_age_groups), not here — a
  -- club can set up divisions over time (U14, then U16, ...) and each has its
  -- own fee breakdown and is reported separately.

  retention_months     integer not null default 3 check (retention_months between 1 and 24),

  -- How players are shown on trial documents (game sheets, team lists, court
  -- time, exports/prints). Club's choice. Defaults to the most private option.
  display_mode         text not null default 'number'
                         check (display_mode in ('number','initial_surname')),

  status               text not null default 'open'
                         check (status in ('draft','open','closed','finalised')),
  registration_open    boolean not null default true,

  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  finalised_at         timestamptz
);

create index if not exists trials_owner_idx  on public.trials (owner_user_id);
create index if not exists trials_status_idx on public.trials (status);

-- ---- Divisions (age groups) ----------------------------------------------
-- Each division is self-contained: its own sessions, its own participants,
-- and — importantly — its OWN finances. A club can add divisions over time.
create table if not exists public.trial_age_groups (
  id          uuid primary key default gen_random_uuid(),
  trial_id    uuid not null references public.trials (id) on delete cascade,
  name        text not null,                              -- "Under 14"
  sort_order  integer not null default 100,

  -- Per-division payment breakdown (all cents, AUD)
  fee_cents             integer not null default 220 check (fee_cents >= 0),  -- CC Netball fee per participant
  additional_fees       jsonb   not null default '[]'::jsonb,                 -- [{label, amount_cents}] add-ons: umpires, selectors, court hire, other
  association_pays_fees  boolean not null default false,  -- true => participants not charged for this division; club invoiced later

  created_at  timestamptz not null default now()
);

create index if not exists trial_age_groups_trial_idx
  on public.trial_age_groups (trial_id, sort_order);

-- ---- Sessions (date / time / venue) ---------------------------------------
create table if not exists public.trial_sessions (
  id            uuid primary key default gen_random_uuid(),
  trial_id      uuid not null references public.trials (id) on delete cascade,
  age_group_id  uuid not null references public.trial_age_groups (id) on delete cascade,
  session_date  date not null,
  start_time    text,                                     -- "5:30 pm"
  end_time      text,                                     -- "7:00 pm"
  venue         text,
  sort_order    integer not null default 100,
  created_at    timestamptz not null default now()
);

create index if not exists trial_sessions_trial_idx
  on public.trial_sessions (trial_id, sort_order);

-- ---- Participant registrations --------------------------------------------
create table if not exists public.trial_participants (
  id                 uuid primary key default gen_random_uuid(),
  trial_id           uuid not null references public.trials (id) on delete cascade,
  age_group_id       uuid not null references public.trial_age_groups (id) on delete cascade,

  status             text not null default 'pending'
                       check (status in ('pending','paid','cancelled','refunded')),

  -- Personal data (wiped after the retention window)
  first_name         text not null,
  last_name          text not null,
  dob                date,
  position_1         text,
  position_2         text,
  playing_history    text,
  medical            text,
  parent_name        text,
  parent_email       text,
  emergency_name     text,
  emergency_phone    text,

  -- Payment
  amount_cents       integer not null default 0 check (amount_cents >= 0),
  fee_breakdown      jsonb,                                -- {platform, addons, surcharge, ...}
  stripe_session_id  text unique,
  stripe_payment_intent text,
  paid_at            timestamptz,

  -- Retention
  purged             boolean not null default false,
  purge_after        date,                                 -- last session date + retention window

  created_at         timestamptz not null default now()
);

create index if not exists trial_participants_trial_idx
  on public.trial_participants (trial_id, age_group_id);
create index if not exists trial_participants_status_idx
  on public.trial_participants (status);
create index if not exists trial_participants_purge_idx
  on public.trial_participants (purge_after) where purged = false;

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.trials             enable row level security;
alter table public.trial_age_groups   enable row level security;
alter table public.trial_sessions     enable row level security;
alter table public.trial_participants enable row level security;

-- Trials / age groups / sessions: readable by anyone (needed to render the
-- public registration page). These rows contain no personal data.
drop policy if exists "trials readable" on public.trials;
create policy "trials readable" on public.trials
  for select using (true);

drop policy if exists "age groups readable" on public.trial_age_groups;
create policy "age groups readable" on public.trial_age_groups
  for select using (true);

drop policy if exists "sessions readable" on public.trial_sessions;
create policy "sessions readable" on public.trial_sessions
  for select using (true);

-- Owners (the club account) can manage their own trials.
drop policy if exists "owner manages trials" on public.trials;
create policy "owner manages trials" on public.trials
  for all using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

drop policy if exists "owner manages age groups" on public.trial_age_groups;
create policy "owner manages age groups" on public.trial_age_groups
  for all using (exists (
    select 1 from public.trials t
    where t.id = trial_age_groups.trial_id and t.owner_user_id = auth.uid()
  ));

drop policy if exists "owner manages sessions" on public.trial_sessions;
create policy "owner manages sessions" on public.trial_sessions
  for all using (exists (
    select 1 from public.trials t
    where t.id = trial_sessions.trial_id and t.owner_user_id = auth.uid()
  ));

-- Participants: NO public insert/select policy. Registrations are created only
-- through our server endpoint using the service-role key (which validates the
-- fee and the open trial first, and bypasses RLS). The public never reads or
-- writes participant rows directly.

-- Owners can read / manage their trial's participants.
drop policy if exists "owner reads participants" on public.trial_participants;
create policy "owner reads participants" on public.trial_participants
  for select using (exists (
    select 1 from public.trials t
    where t.id = trial_participants.trial_id and t.owner_user_id = auth.uid()
  ));

drop policy if exists "owner updates participants" on public.trial_participants;
create policy "owner updates participants" on public.trial_participants
  for update using (exists (
    select 1 from public.trials t
    where t.id = trial_participants.trial_id and t.owner_user_id = auth.uid()
  ));

-- NOTE: the Stripe webhook marks a registration 'paid' using the service-role
-- key, which bypasses RLS (same pattern as shop_orders).
