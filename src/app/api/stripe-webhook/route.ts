import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";

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

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
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
