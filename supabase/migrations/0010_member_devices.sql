-- Drills library: limit how many devices a member can be signed in on.
-- Run this once in the Supabase SQL Editor: New query → paste → Run.
-- One row per browser/device a member has signed in on. Signing in on a new
-- device beyond the limit signs out (revokes) the least recently used one.

create table if not exists public.member_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  device_id text not null,
  user_agent text,
  ip text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (user_id, device_id)
);

create index if not exists idx_member_devices_user
  on public.member_devices (user_id, last_seen_at desc);

alter table public.member_devices enable row level security;

drop policy if exists "member_devices: own rows" on public.member_devices;
create policy "member_devices: own rows"
  on public.member_devices for all
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );
