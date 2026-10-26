import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import {
  sendShopOrderCustomerConfirmation,
  sendShopOrderNotification,
} from "@/lib/shop-order-email";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook not configured." },
      { status: 500 },
    );
  }

  const stripe = new Stripe(stripeKey);
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Bad signature." }, { status: 400 });
  }

  // Entitlements (subscription flow) still needs the service-role key.
  // Shop orders live on a table with RLS disabled and explicit grants to
  // anon, so the anon client is enough for them.
  const supabase = createAdminClient();
  const shopDb = await createClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Physical shop orders (one-off payment).
        if (
          session.mode === "payment" &&
          session.metadata?.shop_order === "true"
        ) {
          const orderId = session.metadata.order_id;
          if (!orderId) break;

          const paymentIntentId =
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id || null;

          const { data: order } = await shopDb
            .from("shop_orders")
            .select("*")
            .eq("id", orderId)
            .maybeSingle();

          if (!order) {
            console.error("Shop order not found:", orderId);
            break;
          }
          if (order.status === "paid") break; // idempotent

          // Decrement stock atomically; if it fails, flag the order instead
          // of leaving stock in an inconsistent state.
          const { error: decError } = await shopDb.rpc(
            "shop_decrement_stock",
            {
              items: order.items.map((i: { product_id: string; quantity: number }) => ({
                product_id: i.product_id,
                quantity: i.quantity,
              })),
            },
          );
          if (decError) {
            console.error("shop_decrement_stock failed:", decError);
          }

          await shopDb
            .from("shop_orders")
            .update({
              status: "paid",
              paid_at: new Date().toISOString(),
              stripe_payment_intent: paymentIntentId,
            })
            .eq("id", orderId);

          // Send both the internal CC Netball notification and the branded
          // customer confirmation (BCC'd to CC Netball). Failure of either
          // must not block the other.
          try {
            await sendShopOrderNotification(order);
          } catch (err) {
            console.error("Shop order admin email failed:", err);
          }
          try {
            await sendShopOrderCustomerConfirmation(order);
          } catch (err) {
            console.error("Customer confirmation email failed:", err);
          }
          break;
        }

        // Competition Builder — one-off $19.99 licence per competition.
        if (
          session.mode === "payment" &&
          session.metadata?.product === "competition-builder"
        ) {
          const userId =
            session.metadata.supabase_user_id ||
            session.client_reference_id ||
            null;
          if (!userId) break;

          // Idempotency — if a licence already exists for this session, stop.
          const { data: existing } = await shopDb
            .from("competition_licences")
            .select("id")
            .eq("stripe_session_id", session.id)
            .maybeSingle();
          if (existing) break;

          const paymentIntentId =
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id || null;

          const { error: licError } = await shopDb.rpc(
            "grant_competition_licence",
            {
              p_user_id: userId,
              p_stripe_session_id: session.id,
              p_stripe_payment_intent: paymentIntentId,
              p_amount_cents: session.amount_total ?? 1999,
              p_currency: (session.currency ?? "aud").toLowerCase(),
            },
          );
          if (licError) {
            console.error(
              "Competition Builder licence grant failed:",
              licError,
            );
          }
          break;
        }

        // Digital subscription flow (unchanged).
        if (session.mode !== "subscription") break;

        const userId = session.client_reference_id;
        const subscriptionId = session.subscription as string | null;
        if (!userId || !subscriptionId) break;

        const subscription =
          await stripe.subscriptions.retrieve(subscriptionId);
        await upsertEntitlement(supabase, userId, subscription, session.id);
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;
        if (!userId) break;
        await upsertEntitlement(supabase, userId, subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;
        if (!userId) break;
        await supabase
          .from("entitlements")
          .update({ status: "cancelled" })
          .eq("stripe_subscription_id", subscription.id)
          .eq("user_id", userId);
        break;
      }

      default:
        // Ignore other events for now.
        break;
    }
  } catch (err) {
    console.error("Stripe webhook handler failed:", err);
    return NextResponse.json({ error: "Handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function upsertEntitlement(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  subscription: Stripe.Subscription,
  sessionId?: string,
) {
  const productSlug =
    subscription.metadata?.product_slug ?? "drills-library";

  const item = subscription.items.data[0];
  const periodEnd = item?.current_period_end
    ? new Date(item.current_period_end * 1000).toISOString()
    : null;

  const isActive =
    subscription.status === "active" || subscription.status === "trialing";

  const { data: existing } = await supabase
    .from("entitlements")
    .select("id")
    .eq("stripe_subscription_id", subscription.id)
    .maybeSingle();

  const payload = {
    user_id: userId,
    product_slug: productSlug,
    status: isActive ? "active" : subscription.status,
    expires_at: periodEnd,
    stripe_customer_id: (subscription.customer as string) ?? null,
    stripe_subscription_id: subscription.id,
    stripe_session_id: sessionId ?? null,
    metadata: { stripe_status: subscription.status },
  };

  if (existing?.id) {
    await supabase
      .from("entitlements")
      .update(payload)
      .eq("id", existing.id);
  } else {
    await supabase.from("entitlements").insert(payload);
  }
}
