-- Allow fixture games to carry a list of rule violations they couldn't
-- satisfy at placement time. Soft-constraint fallback: when the strict
-- pass can't place a game anywhere, the min-violations pass puts it in
-- the least-conflicting cell and records which rules weren't met, so the
-- organiser can see exactly what the trade-off was.
alter table public.competition_fixture_games
  add column if not exists rule_violations jsonb not null default '[]'::jsonb;
