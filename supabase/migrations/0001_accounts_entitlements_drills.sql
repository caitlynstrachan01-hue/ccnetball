-- CC Netball accounts + entitlements + drills library schema.
-- Run this once in the Supabase SQL Editor: New query → paste → Run.

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
create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  product_slug text not null,
  tier text,
  status text not null default 'active',
  purchased_at timestamptz not null default now(),
  expires_at timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_session_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_entitlements_user on public.entitlements (user_id);
create index if not exists idx_entitlements_user_product on public.entitlements (user_id, product_slug);
create index if not exists idx_entitlements_status on public.entitlements (status);
create index if not exists idx_entitlements_stripe_sub on public.entitlements (stripe_subscription_id);

-- 3. Drills table (drills library CMS content).
create table if not exists public.drills (
  id uuid primary key default gen_random_uuid(),
  category_slug text not null,
  slug text not null,
  title text not null,
  description text,
  make_it_easier text[] not null default '{}',
  make_it_harder text[] not null default '{}',
  variations text[] not null default '{}',
  video_path text,
  duration_minutes int,
  level text,
  focus text,
  sort_order int not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(category_slug, slug)
);

create index if not exists idx_drills_category on public.drills (category_slug, sort_order);
create index if not exists idx_drills_published on public.drills (published);

-- 4. Row Level Security.
alter table public.profiles enable row level security;
alter table public.entitlements enable row level security;
alter table public.drills enable row level security;

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

drop policy if exists "drills: entitled or admin select" on public.drills;
create policy "drills: entitled or admin select"
  on public.drills for select
  using (
    published = true
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

-- 5. Auto-create a profile row whenever a new user signs up.
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

-- 6. Auto-touch updated_at.
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

drop trigger if exists drills_set_updated_at on public.drills;
create trigger drills_set_updated_at
  before update on public.drills
  for each row execute function public.set_updated_at();
