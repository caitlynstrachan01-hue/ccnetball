-- Competition rule priority ranking. Default = creation order (earliest = 1).
-- Lower number = more important (less willing to compromise).

alter table public.competition_rules
  add column if not exists priority integer;

-- Back-fill priority based on created_at ordering per competition.
with ranked as (
  select
    id,
    row_number() over (
      partition by competition_id
      order by created_at
    ) as rn
  from public.competition_rules
  where priority is null
)
update public.competition_rules r
set priority = ranked.rn
from ranked
where r.id = ranked.id;

-- From here on every rule gets a priority. We don't make it NOT NULL in case
-- a direct insert forgets — the API will default it to max(priority) + 1.
create index if not exists competition_rules_priority_idx
  on public.competition_rules (competition_id, priority);
