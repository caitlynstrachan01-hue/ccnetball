import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import {
  formatPriceCents,
  getPostageOptions,
  type PostageOption,
} from "@/lib/shop-physical";
import { getPhysicalProductsByIds } from "@/lib/shop-physical.server";

export const runtime = "nodejs";

type IncomingItem = { productId: string; quantity: number };
type AddressIn = {
  line1: string;
  line2?: string | null;
  suburb: string;
  state: string;
  postcode: string;
};
type CustomerIn = { name: string; email: string; phone: string };

type Body = {
  items?: IncomingItem[];
  customer?: CustomerIn;
  postal?: AddressIn;
  billing?: AddressIn | null;
  postageType?: PostageOption["id"];
};

function generateOrderNumber(): string {
  const now = new Date();
  const stamp =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `CCN-${stamp}-${rand}`;
}

export async function POST(request: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json(
      { error: "Payments are not configured — please try again shortly." },
      { status: 500 },
    );
  }

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const items = body.items ?? [];
  if (!items.length) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }
  if (!body.customer?.email || !body.customer?.name || !body.customer?.phone) {
    return NextResponse.json(
      { error: "Please complete your contact details." },
      { status: 400 },
    );
  }
  if (
    !body.postal ||
    !body.postal.line1 ||
    !body.postal.suburb ||
    !body.postal.state ||
    !body.postal.postcode
  ) {
    return NextResponse.json(
      { error: "Please complete your delivery address." },
      { status: 400 },
    );
  }
  if (!body.postageType) {
    return NextResponse.json(
      { error: "Please choose a postage option." },
      { status: 400 },
    );
  }

  // Validate every item against DB stock (server-side source of truth).
  const products = await getPhysicalProductsByIds(items.map((i) => i.productId));
  const byId = new Map(products.map((p) => [p.id, p]));

  // Compute postage server-side from the DB-known slugs; never trust
  // whatever price the client might have inferred.
  const postageOptions = getPostageOptions(
    items
      .map((i) => byId.get(i.productId))
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
      .map((p) => ({ slug: p.slug })),
  );
  const postage = postageOptions.find((p) => p.id === body.postageType);
  if (!postage) {
    return NextResponse.json(
      { error: "Please choose a postage option." },
      { status: 400 },
    );
  }
  for (const item of items) {
    const product = byId.get(item.productId);
    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: "One of the items is no longer available." },
        { status: 400 },
      );
    }
    if (item.quantity < 1 || item.quantity > product.stock) {
      return NextResponse.json(
        {
          error: `Only ${product.stock} ${product.name} remain. Please update your cart.`,
        },
        { status: 400 },
      );
    }
  }

  const normalizedItems = items.map((i) => {
    const product = byId.get(i.productId)!;
    return {
      product_id: product.id,
      slug: product.slug,
      name: product.name,
      quantity: i.quantity,
      unit_price_cents: product.priceCents,
      line_total_cents: product.priceCents * i.quantity,
    };
  });
  const subtotalCents = normalizedItems.reduce(
    (sum, i) => sum + i.line_total_cents,
    0,
  );
  const totalCents = subtotalCents + postage.priceCents;

  // Order inserts happen through the anon client (allowed by RLS to insert
  // pending orders only). Service role is only needed to attach the Stripe
  // session_id afterwards; if it's not configured we skip that step —
  // the webhook can still find the order via its order_id metadata.
  const supabase = await createClient();

  const orderNumber = generateOrderNumber();

  const insert = await supabase
    .from("shop_orders")
    .insert({
      order_number: orderNumber,
      status: "pending",
      customer_email: body.customer.email,
      customer_name: body.customer.name,
      customer_phone: body.customer.phone,
      postal_line1: body.postal.line1,
      postal_line2: body.postal.line2 || null,
      postal_suburb: body.postal.suburb,
      postal_state: body.postal.state,
      postal_postcode: body.postal.postcode,
      billing_same_as_postal: !body.billing,
      billing_line1: body.billing?.line1 ?? null,
      billing_line2: body.billing?.line2 ?? null,
      billing_suburb: body.billing?.suburb ?? null,
      billing_state: body.billing?.state ?? null,
      billing_postcode: body.billing?.postcode ?? null,
      billing_country: body.billing ? "Australia" : null,
      items: normalizedItems,
      subtotal_cents: subtotalCents,
      postage_type: postage.id,
      postage_cents: postage.priceCents,
      gst_cents: 0,
      total_cents: totalCents,
    })
    .select("id")
    .single();

  if (insert.error || !insert.data) {
    console.error("Order insert failed:", insert.error);
    return NextResponse.json(
      {
        error: "Could not create the order. Please try again.",
        detail: insert.error?.message,
      },
      { status: 500 },
    );
  }

  const orderId = insert.data.id as string;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.ccnetball.com";

  const stripe = new Stripe(stripeKey);
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
    normalizedItems.map((i) => ({
      quantity: i.quantity,
      price_data: {
        currency: "aud",
        unit_amount: i.unit_price_cents,
        product_data: { name: i.name },
      },
    }));
  lineItems.push({
    quantity: 1,
    price_data: {
      currency: "aud",
      unit_amount: postage.priceCents,
      product_data: {
        name: `Postage — ${postage.label}`,
        description: `Postage: ${formatPriceCents(postage.priceCents)}`,
      },
    },
  });

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_email: body.customer.email,
      success_url: `${siteUrl}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/shop/cancelled?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        order_id: orderId,
        order_number: orderNumber,
        shop_order: "true",
      },
      payment_intent_data: {
        metadata: {
          order_id: orderId,
          order_number: orderNumber,
        },
      },
    });
  } catch (err) {
    console.error("Stripe session create failed:", err);
    const message = err instanceof Error ? err.message : "Stripe error";
    return NextResponse.json(
      {
        error: "Could not start payment. Please try again.",
        detail: message,
      },
      { status: 500 },
    );
  }

  // Save the Stripe session id back on the order so the success page can
  // look it up. Updates on shop_orders need service role (no public policy
  // for updates), so fall back silently if it's not configured — the
  // webhook will still find the order via its order_id metadata.
  try {
    const admin = createAdminClient();
    await admin
      .from("shop_orders")
      .update({ stripe_session_id: session.id })
      .eq("id", orderId);
  } catch (err) {
    console.warn("Could not attach session_id to order:", err);
  }

  return NextResponse.json({ url: session.url });
}
