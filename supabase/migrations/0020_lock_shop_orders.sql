-- SECURITY: lock down shop_orders (Supabase alert, 2026-11-04).
-- shop_orders had row-level security disabled with grants to anon, so anyone
-- with the project URL could read, edit or delete customers' orders. The site
-- now writes orders with the service role; only admins read them via RLS.
-- Run this once in the Supabase SQL Editor: New query → paste → Run.

-- 1. Turn row-level security on for every public table that's missing it.
do $$
declare t record;
begin
  for t in select tablename from pg_tables
           where schemaname = 'public' and rowsecurity = false loop
    execute format('alter table public.%I enable row level security', t.tablename);
  end loop;
end $$;

-- 2. Remove any open policies on shop_orders; admins only from now on.
do $$
declare p record;
begin
  for p in select policyname from pg_policies
           where schemaname = 'public' and tablename = 'shop_orders' loop
    execute format('drop policy %I on public.shop_orders', p.policyname);
  end loop;
end $$;

create policy "shop_orders: admin all"
  on public.shop_orders for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

-- 3. Take back the public key's direct access.
revoke all on public.shop_orders from anon;
revoke execute on function public.shop_decrement_stock(jsonb) from public, anon, authenticated;
grant execute on function public.shop_decrement_stock(jsonb) to service_role;

-- 4. Report: every public table and whether it's locked.
select tablename, rowsecurity as locked
from pg_tables where schemaname = 'public' order by tablename;
