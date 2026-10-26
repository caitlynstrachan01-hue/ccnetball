-- Waitlist signups for sold-out products.
-- Public can insert (subscribe); only admins can read, update or delete.
create table if not exists public.shop_waitlist (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.shop_physical_products(id) on delete cascade,
  email text not null,
  name text,
  created_at timestamptz not null default now(),
  notified_at timestamptz,
  unique (product_id, email)
);

create index if not exists shop_waitlist_product_idx
  on public.shop_waitlist (product_id);
create index if not exists shop_waitlist_pending_idx
  on public.shop_waitlist (product_id, created_at)
  where notified_at is null;

alter table public.shop_waitlist enable row level security;

drop policy if exists "Anyone can subscribe to waitlist" on public.shop_waitlist;
create policy "Anyone can subscribe to waitlist"
  on public.shop_waitlist
  as permissive
  for insert
  with check (true);

drop policy if exists "Admins can read waitlist" on public.shop_waitlist;
create policy "Admins can read waitlist"
  on public.shop_waitlist
  as permissive
  for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

drop policy if exists "Admins can update waitlist" on public.shop_waitlist;
create policy "Admins can update waitlist"
  on public.shop_waitlist
  as permissive
  for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

grant insert on public.shop_waitlist to anon, authenticated;
grant select, update on public.shop_waitlist to authenticated;
