-- Shipping tracking fields for shop orders.
alter table public.shop_orders
  add column if not exists tracking_number text,
  add column if not exists shipped_at timestamptz;
