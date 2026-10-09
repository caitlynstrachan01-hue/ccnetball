-- Drills library: let admins save drills and upload videos.
-- Run this once in the Supabase SQL Editor: New query → paste → Run.

-- 1. Admins can read every drill (published or not) and write drills.
drop policy if exists "drills: admin all" on public.drills;
create policy "drills: admin all"
  on public.drills for all
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

-- 2. Private bucket for drill videos. No per-bucket size limit, so the
--    project-wide limit applies (50MB on Free, raised on Pro).
insert into storage.buckets (id, name, public)
values ('drill-videos', 'drill-videos', false)
on conflict (id) do nothing;

-- 3. Only admins can upload, replace or delete drill videos. Members get
--    short-lived signed links generated on the server after an access check.
drop policy if exists "drill-videos: admin all" on storage.objects;
create policy "drill-videos: admin all"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'drill-videos'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  )
  with check (
    bucket_id = 'drill-videos'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );
