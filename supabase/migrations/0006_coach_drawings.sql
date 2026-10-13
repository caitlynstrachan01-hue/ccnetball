-- Session planner: coaches can attach a court drawing to their own drills.
-- Run this once in the Supabase SQL Editor: New query → paste → Run.
-- Each coach writes only inside a folder named after their user id;
-- admins can view every drawing on the review page.

insert into storage.buckets (id, name, public)
values ('coach-drawings', 'coach-drawings', false)
on conflict (id) do nothing;

drop policy if exists "coach-drawings: own folder" on storage.objects;
create policy "coach-drawings: own folder"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'coach-drawings'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'coach-drawings'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "coach-drawings: admin read" on storage.objects;
create policy "coach-drawings: admin read"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'coach-drawings'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );
