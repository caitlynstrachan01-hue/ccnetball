-- Drills library: a picture (diagram/photo) per drill, plus member read
-- access to drill files.
-- Run this once in the Supabase SQL Editor: New query → paste → Run.

-- 1. Where each drill's picture lives (inside the drill-videos bucket).
alter table public.drills
  add column if not exists image_path text;

-- 2. Members with an active Drills Library subscription (and admins) can read
--    drill files — pictures, PDF skill sheets and older uploaded videos — so
--    the site can sign links through the member's own session.
drop policy if exists "drill-videos: members read" on storage.objects;
create policy "drill-videos: members read"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'drill-videos'
    and (
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
    )
  );
