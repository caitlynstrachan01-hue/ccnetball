-- Physical products store (posters, cards, wall chart etc.)
-- Separate from the digital/subscription "entitlements" world.

create table if not exists public.shop_physical_products (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name          text not null,
  short         text not null,
  description   text not null,
  price_cents   integer not null check (price_cents >= 0),
  stock         integer not null default 0 check (stock >= 0),
  is_limited_edition boolean not null default true,
  photos        text[] not null default '{}'::text[],
  is_active     boolean not null default true,
  sort_order    integer not null default 100,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists shop_physical_products_active_idx
  on public.shop_physical_products (is_active, sort_order);

-- Orders placed through the shop checkout.
create table if not exists public.shop_orders (
  id                  uuid primary key default gen_random_uuid(),
  order_number        text not null unique,
  status              text not null default 'pending' check (status in ('pending','paid','cancelled','refunded','fulfilled')),

  customer_email      text not null,
  customer_name       text not null,
  customer_phone      text,

  postal_line1        text not null,
  postal_line2        text,
  postal_suburb       text not null,
  postal_state        text not null,
  postal_postcode     text not null,
  postal_country      text not null default 'Australia',

  billing_same_as_postal boolean not null default true,
  billing_line1       text,
  billing_line2       text,
  billing_suburb      text,
  billing_state       text,
  billing_postcode    text,
  billing_country     text,

  items               jsonb not null,

  subtotal_cents      integer not null,
  postage_type        text not null check (postage_type in ('standard','express')),
  postage_cents       integer not null,
  gst_cents           integer not null default 0,
  total_cents         integer not null,

  stripe_session_id   text unique,
  stripe_payment_intent text,

  created_at          timestamptz not null default now(),
  paid_at             timestamptz
);

create index if not exists shop_orders_created_idx
  on public.shop_orders (created_at desc);
create index if not exists shop_orders_status_idx
  on public.shop_orders (status);

-- Atomic stock decrement: fails if any product would drop below 0.
create or replace function public.shop_decrement_stock(items jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  item record;
begin
  for item in
    select
      (value ->> 'product_id')::uuid as product_id,
      (value ->> 'quantity')::integer as quantity
    from jsonb_array_elements(items)
  loop
    update public.shop_physical_products
       set stock = stock - item.quantity,
           updated_at = now()
     where id = item.product_id
       and stock >= item.quantity;

    if not found then
      raise exception 'Insufficient stock for product %', item.product_id;
    end if;
  end loop;
end;
$$;

-- RLS: products are public-read; orders are admin/service-role only.
alter table public.shop_physical_products enable row level security;
alter table public.shop_orders enable row level security;

create policy "Public can read active products"
  on public.shop_physical_products
  for select
  using (is_active = true);

-- No public policies on shop_orders; writes/reads only via service role.

-- Seed the initial four products.
insert into public.shop_physical_products
  (slug, name, short, description, price_cents, stock, is_limited_edition, sort_order, photos)
values
  (
    'abc-netball-wall-chart',
    'ABC Netball Wall Chart',
    'The alphabet of netball — framed and ready for the bedroom wall.',
    'A beautifully illustrated A-to-Z of netball. Perfect for junior players learning the game, and a gorgeous keepsake for every netball-mad household.',
    4995,
    20,
    true,
    10,
    '{}'::text[]
  ),
  (
    'eat-sleep-netball-repeat-poster',
    'Eat, Sleep, Netball, Repeat Poster',
    'The mantra of every netballer, in print.',
    'A premium-quality poster celebrating the netball-obsessed life. Looks beautiful in a bedroom, a bag room, or a club rooms wall.',
    4000,
    10,
    true,
    20,
    '{}'::text[]
  ),
  (
    'netball-christmas-cards-pk10',
    'Netball Christmas Cards (pack of 10)',
    'Christmas cards for the whole netball family.',
    'A pack of 10 beautifully illustrated netball-themed Christmas cards. Perfect for the coach, the teammates, and the family who have cheered them on all year. Card size: 11.7 × 18.2 cm.',
    3500,
    10,
    true,
    30,
    '{}'::text[]
  ),
  (
    'netball-birthday-cards-pk10',
    'Netball Birthday Cards (pack of 10)',
    'Birthday cards for the netball-mad in your life.',
    'A pack of 10 beautifully illustrated netball-themed birthday cards. The perfect thing to have on hand for team birthdays all season. Card size: 11.7 × 18.2 cm.',
    3500,
    10,
    true,
    40,
    '{}'::text[]
  )
on conflict (slug) do nothing;
