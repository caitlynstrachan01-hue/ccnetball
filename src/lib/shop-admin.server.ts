import "server-only";
import { createClient } from "@/lib/supabase/server";

export type AdminShopOrder = {
  id: string;
  orderNumber: string;
  status: "pending" | "paid" | "cancelled" | "refunded" | "fulfilled";
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  postalLine1: string;
  postalLine2: string | null;
  postalSuburb: string;
  postalState: string;
  postalPostcode: string;
  billingSameAsPostal: boolean;
  billingLine1: string | null;
  billingLine2: string | null;
  billingSuburb: string | null;
  billingState: string | null;
  billingPostcode: string | null;
  items: Array<{
    product_id: string;
    slug: string;
    name: string;
    quantity: number;
    unit_price_cents: number;
    line_total_cents: number;
  }>;
  subtotalCents: number;
  postageType: "standard" | "express";
  postageCents: number;
  totalCents: number;
  trackingNumber: string | null;
  shippedAt: string | null;
  paidAt: string | null;
  createdAt: string;
  stripeSessionId: string | null;
};

type Row = {
  id: string;
  order_number: string;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  postal_line1: string;
  postal_line2: string | null;
  postal_suburb: string;
  postal_state: string;
  postal_postcode: string;
  billing_same_as_postal: boolean;
  billing_line1: string | null;
  billing_line2: string | null;
  billing_suburb: string | null;
  billing_state: string | null;
  billing_postcode: string | null;
  items: AdminShopOrder["items"];
  subtotal_cents: number;
  postage_type: string;
  postage_cents: number;
  total_cents: number;
  tracking_number: string | null;
  shipped_at: string | null;
  paid_at: string | null;
  created_at: string;
  stripe_session_id: string | null;
};

function toOrder(row: Row): AdminShopOrder {
  return {
    id: row.id,
    orderNumber: row.order_number,
    status: row.status as AdminShopOrder["status"],
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    postalLine1: row.postal_line1,
    postalLine2: row.postal_line2,
    postalSuburb: row.postal_suburb,
    postalState: row.postal_state,
    postalPostcode: row.postal_postcode,
    billingSameAsPostal: row.billing_same_as_postal,
    billingLine1: row.billing_line1,
    billingLine2: row.billing_line2,
    billingSuburb: row.billing_suburb,
    billingState: row.billing_state,
    billingPostcode: row.billing_postcode,
    items: row.items ?? [],
    subtotalCents: row.subtotal_cents,
    postageType: row.postage_type as "standard" | "express",
    postageCents: row.postage_cents,
    totalCents: row.total_cents,
    trackingNumber: row.tracking_number,
    shippedAt: row.shipped_at,
    paidAt: row.paid_at,
    createdAt: row.created_at,
    stripeSessionId: row.stripe_session_id,
  };
}

export async function listShopOrders(): Promise<AdminShopOrder[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shop_orders")
    .select(
      "id, order_number, status, customer_name, customer_email, customer_phone, postal_line1, postal_line2, postal_suburb, postal_state, postal_postcode, billing_same_as_postal, billing_line1, billing_line2, billing_suburb, billing_state, billing_postcode, items, subtotal_cents, postage_type, postage_cents, total_cents, tracking_number, shipped_at, paid_at, created_at, stripe_session_id",
    )
    .order("created_at", { ascending: false });
  if (error) {
    console.error("listShopOrders failed:", error);
    return [];
  }
  return (data as Row[]).map(toOrder);
}

export async function getShopOrderById(
  id: string,
): Promise<AdminShopOrder | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shop_orders")
    .select(
      "id, order_number, status, customer_name, customer_email, customer_phone, postal_line1, postal_line2, postal_suburb, postal_state, postal_postcode, billing_same_as_postal, billing_line1, billing_line2, billing_suburb, billing_state, billing_postcode, items, subtotal_cents, postage_type, postage_cents, total_cents, tracking_number, shipped_at, paid_at, created_at, stripe_session_id",
    )
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return toOrder(data as Row);
}
