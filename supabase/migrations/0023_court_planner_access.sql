-- Netball Court - Drawing: one-off annual access.
-- A user who pays gets a row here with an expiry 12 months later. The app
-- at /court-planner gates on `expires_at > now()`.

create table if not exists public.court_planner_access (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id    text,
  stripe_session_id     text unique,
  stripe_payment_intent text,
  purchased_at          timestamptz not null default now(),
  expires_at            timestamptz not null,
  amount_cents          integer not null,
  currency              text not null default 'aud',
  created_at            timestamptz not null default now()
);

create index if not exists court_planner_access_user_idx
  on public.court_planner_access (user_id);

create index if not exists court_planner_access_expiry_idx
  on public.court_planner_access (expires_at desc);

alter table public.court_planner_access enable row level security;

-- A signed-in user can read their own access rows (so the app can show
-- "expires in X days"). Writes always happen with the service role via
-- the Stripe webhook.
create policy "users read their own court planner access"
  on public.court_planner_access
  for select
  using (auth.uid() = user_id);
