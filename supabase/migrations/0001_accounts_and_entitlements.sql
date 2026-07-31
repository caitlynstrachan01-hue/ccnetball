-- CC Netball accounts + entitlements schema.
-- Run this once in the Supabase SQL Editor: Dashboard → SQL Editor → New query → paste → Run.

-- 1. Profiles table (extends auth.users with app-specific fields).
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  full_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Entitlements table — one row per product a user has paid for.
--    status = 'active' | 'expired' | 'cancelled'
create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  product_slug text not null,           -- matches SHOP_PRODUCTS[i].slug
  tier text,                            -- e.g. 'Small', 'Medium', 'Large' for Competition Builder
  status text not null default 'active',
  purchased_at timestamptz not null default now(),
  expires_at timestamptz,               -- null = no expiry
  stripe_session_id text,               -- for reconciling against Stripe payments
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_entitlements_user on public.entitlements (user_id);
create index if not exists idx_entitlements_user_product on public.entitlements (user_id, product_slug);
create index if not exists idx_entitlements_status on public.entitlements (status);

-- 3. Row Level Security — customers can read/update their own rows only.
alter table public.profiles enable row level security;
alter table public.entitlements enable row level security;

drop policy if exists "profiles: own row select" on public.profiles;
create policy "profiles: own row select"
  on public.profiles for select
  using ( auth.uid() = id );

drop policy if exists "profiles: own row update" on public.profiles;
create policy "profiles: own row update"
  on public.profiles for update
  using ( auth.uid() = id );

drop policy if exists "entitlements: own rows select" on public.entitlements;
create policy "entitlements: own rows select"
  on public.entitlements for select
  using ( auth.uid() = user_id );

-- (Writes to entitlements only happen server-side via the service role key, which bypasses RLS.)

-- 4. Auto-create a profile row whenever a new user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. Auto-touch updated_at on profile / entitlement updates.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists entitlements_set_updated_at on public.entitlements;
create trigger entitlements_set_updated_at
  before update on public.entitlements
  for each row execute function public.set_updated_at();
