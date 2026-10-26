-- Drills library: general resources (season planners, rule sheets…) shown on
-- the library's first screen. Files live in the drill-videos bucket under
-- resources/ (members can already read that bucket — migration 0009).
-- Run this once in the Supabase SQL Editor: New query → paste → Run.

create table if not exists public.library_resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  file_path text not null,
  file_name text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.library_resources enable row level security;

drop policy if exists "library_resources: members read" on public.library_resources;
create policy "library_resources: members read"
  on public.library_resources for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
    or exists (
      select 1 from public.entitlements e
      where e.user_id = auth.uid()
        and e.product_slug = 'drills-library'
        and e.status = 'active'
        and (e.expires_at is null or e.expires_at > now())
    )
  );

drop policy if exists "library_resources: admin write" on public.library_resources;
create policy "library_resources: admin write"
  on public.library_resources for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );
