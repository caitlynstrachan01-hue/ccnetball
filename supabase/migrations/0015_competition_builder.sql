-- Competition Builder: licences, competitions, and all the pieces of a draw.
-- A licence is tied to a user and consumed by a single competition. The
-- consumption window ends on the competition start date — after that, a new
-- competition needs a fresh licence.

create table if not exists public.competition_licences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_session_id text unique,
  stripe_payment_intent text,
  purchased_at timestamptz not null default now(),
  consumed_by_competition_id uuid,
  consumed_at timestamptz,
  amount_cents integer not null default 1999,
  currency text not null default 'aud'
);

create index if not exists competition_licences_user_idx
  on public.competition_licences (user_id, purchased_at desc);
create index if not exists competition_licences_unused_idx
  on public.competition_licences (user_id)
  where consumed_by_competition_id is null;

create table if not exists public.competitions (
  id uuid primary key default gen_random_uuid(),
  licence_id uuid not null unique references public.competition_licences(id) on delete restrict,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  start_date date not null,
  rounds_home_and_away integer not null default 0 check (rounds_home_and_away >= 0),
  has_finals boolean not null default false,
  fill_mode text not null default 'even' check (fill_mode in ('even','maximum_play')),
  locked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists competitions_owner_idx
  on public.competitions (owner_user_id, created_at desc);

create table if not exists public.competition_courts (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  name text not null,
  ordinal integer not null default 0,
  created_at timestamptz not null default now(),
  unique (competition_id, name)
);

create table if not exists public.competition_timeslots (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  label text not null,
  starts_at_minutes integer,
  ordinal integer not null default 0,
  created_at timestamptz not null default now(),
  unique (competition_id, label)
);

create table if not exists public.competition_divisions (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  name text not null,
  ordinal integer not null default 0,
  locked_court_id uuid references public.competition_courts(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (competition_id, name)
);

create table if not exists public.competition_teams (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  name text not null,
  division_id uuid references public.competition_divisions(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (competition_id, name)
);

create index if not exists competition_teams_division_idx
  on public.competition_teams (division_id);

create table if not exists public.competition_rules (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  rule_type text not null,
  params jsonb not null default '{}'::jsonb,
  plain_english text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.competition_grading_rounds (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  round_number integer not null,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (competition_id, round_number)
);

create table if not exists public.competition_grading_results (
  id uuid primary key default gen_random_uuid(),
  grading_round_id uuid not null references public.competition_grading_rounds(id) on delete cascade,
  team_id uuid not null references public.competition_teams(id) on delete cascade,
  result text not null check (result in ('win','loss','draw','bye')),
  created_at timestamptz not null default now(),
  unique (grading_round_id, team_id)
);

create table if not exists public.competition_fixture_games (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  round_number integer not null,
  court_id uuid references public.competition_courts(id) on delete set null,
  timeslot_id uuid references public.competition_timeslots(id) on delete set null,
  team_a_id uuid references public.competition_teams(id) on delete set null,
  team_b_id uuid references public.competition_teams(id) on delete set null,
  is_bye boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists competition_fixture_games_comp_round_idx
  on public.competition_fixture_games (competition_id, round_number);

-- Flagged events (used for the >25% team-change anti-abuse check in Phase 3).
create table if not exists public.competition_flags (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid references public.competitions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  flag_type text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- RLS: owners can read and write their own competitions; admins see all.
alter table public.competition_licences enable row level security;
alter table public.competitions enable row level security;
alter table public.competition_courts enable row level security;
alter table public.competition_timeslots enable row level security;
alter table public.competition_divisions enable row level security;
alter table public.competition_teams enable row level security;
alter table public.competition_rules enable row level security;
alter table public.competition_grading_rounds enable row level security;
alter table public.competition_grading_results enable row level security;
alter table public.competition_fixture_games enable row level security;
alter table public.competition_flags enable row level security;

create policy "Owners read their licences"
  on public.competition_licences for select
  using (user_id = auth.uid());
create policy "Owners read their competitions"
  on public.competitions for select
  using (owner_user_id = auth.uid());
create policy "Owners write their competitions"
  on public.competitions for update
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());
create policy "Owners insert their competitions"
  on public.competitions for insert
  with check (owner_user_id = auth.uid());

-- Each child table follows the same owner-via-competition pattern via a
-- helper check. Child policies read/write permitted if the parent
-- competition is owned by the current user.
create or replace function public.owns_competition(comp_id uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.competitions c
    where c.id = comp_id and c.owner_user_id = auth.uid()
  );
$$;

create policy "Owners manage courts"
  on public.competition_courts for all
  using (owns_competition(competition_id))
  with check (owns_competition(competition_id));
create policy "Owners manage timeslots"
  on public.competition_timeslots for all
  using (owns_competition(competition_id))
  with check (owns_competition(competition_id));
create policy "Owners manage divisions"
  on public.competition_divisions for all
  using (owns_competition(competition_id))
  with check (owns_competition(competition_id));
create policy "Owners manage teams"
  on public.competition_teams for all
  using (owns_competition(competition_id))
  with check (owns_competition(competition_id));
create policy "Owners manage rules"
  on public.competition_rules for all
  using (owns_competition(competition_id))
  with check (owns_competition(competition_id));
create policy "Owners manage grading rounds"
  on public.competition_grading_rounds for all
  using (owns_competition(competition_id))
  with check (owns_competition(competition_id));
create policy "Owners manage grading results"
  on public.competition_grading_results for all
  using (
    exists (
      select 1 from public.competition_grading_rounds gr
      where gr.id = grading_round_id
        and owns_competition(gr.competition_id)
    )
  )
  with check (
    exists (
      select 1 from public.competition_grading_rounds gr
      where gr.id = grading_round_id
        and owns_competition(gr.competition_id)
    )
  );
create policy "Owners read fixture games"
  on public.competition_fixture_games for select
  using (owns_competition(competition_id));
create policy "Owners write fixture games"
  on public.competition_fixture_games for all
  using (owns_competition(competition_id))
  with check (owns_competition(competition_id));

grant select, insert, update, delete on public.competitions to authenticated;
grant select, insert, update, delete on public.competition_courts to authenticated;
grant select, insert, update, delete on public.competition_timeslots to authenticated;
grant select, insert, update, delete on public.competition_divisions to authenticated;
grant select, insert, update, delete on public.competition_teams to authenticated;
grant select, insert, update, delete on public.competition_rules to authenticated;
grant select, insert, update, delete on public.competition_grading_rounds to authenticated;
grant select, insert, update, delete on public.competition_grading_results to authenticated;
grant select, insert, update, delete on public.competition_fixture_games to authenticated;
grant select on public.competition_licences to authenticated;
