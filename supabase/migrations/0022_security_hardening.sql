-- Security hardening (24 Nov 2026).
-- Run once in the Supabase SQL Editor: New query → paste → Run.

-- 1. Only the payment webhook (service role) may grant Competition Builder
--    licences. Before this, anyone on the internet could call it.
do $$
declare fn regprocedure;
begin
  for fn in
    select oid::regprocedure from pg_proc
    where proname = 'grant_competition_licence'
      and pronamespace = 'public'::regnamespace
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', fn);
    execute format('grant execute on function %s to service_role', fn);
  end loop;
end $$;

-- 2. Members can't make themselves admins. Their own profile row stays
--    editable, but is_admin only changes from the SQL Editor / service role.
create or replace function public.protect_profile_admin_flag()
returns trigger
language plpgsql
as $$
begin
  if current_user in ('anon', 'authenticated') then
    if tg_op = 'INSERT' then
      new.is_admin := false;
    else
      new.is_admin := old.is_admin;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_admin on public.profiles;
create trigger profiles_protect_admin
  before insert or update on public.profiles
  for each row execute function public.protect_profile_admin_flag();

revoke insert, update, delete on public.profiles from anon;

-- 3. Only Caitlyn (through the admin page) can mark a session plan as
--    "recommended" — members can't promote their own plan to other coaches.
create or replace function public.protect_plan_recommended()
returns trigger
language plpgsql
as $$
begin
  if current_user in ('anon', 'authenticated') then
    if tg_op = 'INSERT' then
      new.recommended := false;
    else
      new.recommended := old.recommended;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists session_plans_protect_recommended on public.session_plans;
create trigger session_plans_protect_recommended
  before insert or update on public.session_plans
  for each row execute function public.protect_plan_recommended();

-- 4. Device limit: members can see their devices but not edit them, so a
--    signed-out device can't be switched back on. The server records devices.
drop policy if exists "member_devices: own rows" on public.member_devices;
drop policy if exists "member_devices: own select" on public.member_devices;
create policy "member_devices: own select"
  on public.member_devices for select
  using ( auth.uid() = user_id );
revoke insert, update, delete on public.member_devices from anon, authenticated;

-- 5. Signed-out visitors can't write anywhere in the drills library.
revoke insert, update, delete on public.drills from anon;
revoke insert, update, delete on public.entitlements from anon, authenticated;
revoke insert, update, delete on public.library_resources from anon;
revoke all on public.session_plans from anon;
revoke all on public.member_devices from anon;

-- Check: every table should show "locked = true".
select tablename, rowsecurity as locked
from pg_tables
where schemaname = 'public'
order by tablename;
