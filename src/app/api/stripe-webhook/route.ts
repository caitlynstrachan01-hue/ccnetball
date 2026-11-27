import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";
import {
  sendShopOrderCustomerConfirmation,
  sendShopOrderNotification,
} from "@/lib/shop-order-email";
import {
  sendCompetitionBuilderWelcomeEmail,
  sendCourtPlannerWelcomeEmail,
  sendTrialRegistrationEmail,
} from "@/lib/customer-emails.server";

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

  // Entitlements and shop orders are both locked by RLS, so the webhook
  // writes with the service role.
  const supabase = createAdminClient();
  const shopDb = supabase;

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
            break;
          }

          // Welcome email to the buyer.
          const compEmail =
            session.customer_details?.email ||
            session.customer_email ||
            null;
          if (compEmail) {
            await sendCompetitionBuilderWelcomeEmail({
              customerEmail: compEmail,
              customerName: session.customer_details?.name ?? null,
            });
          }
          break;
        }

        // Netball Court - Drawing — one-off 12-month access.
        if (
          session.mode === "payment" &&
          session.metadata?.product_slug === "court-planner"
        ) {
          const userId =
            session.metadata.supabase_user_id ||
            session.client_reference_id ||
            null;
          if (!userId) break;

          // Idempotency — if access already granted for this session, stop.
          const { data: existing } = await shopDb
            .from("court_planner_access")
            .select("id")
            .eq("stripe_session_id", session.id)
            .maybeSingle();
          if (existing) break;

          const paymentIntentId =
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id || null;
          const customerId =
            typeof session.customer === "string"
              ? session.customer
              : session.customer?.id || null;

          const expiresAt = new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000,
          ).toISOString();

          const { error: accessError } = await shopDb
            .from("court_planner_access")
            .insert({
              user_id: userId,
              stripe_customer_id: customerId,
              stripe_session_id: session.id,
              stripe_payment_intent: paymentIntentId,
              expires_at: expiresAt,
              amount_cents: session.amount_total ?? 1999,
              currency: (session.currency ?? "aud").toLowerCase(),
            });
          if (accessError) {
            console.error(
              "Court Planner access grant failed:",
              accessError,
            );
            break;
          }

          // Welcome email to the buyer.
          const customerEmail =
            session.customer_details?.email ||
            session.customer_email ||
            null;
          if (customerEmail) {
            await sendCourtPlannerWelcomeEmail({
              customerEmail,
              customerName: session.customer_details?.name ?? null,
              expiresAt,
            });
          }
          break;
        }

        // Trial registrations (one-off payment).
        if (
          session.mode === "payment" &&
          session.metadata?.trial_registration === "true"
        ) {
          const participantId = session.metadata.participant_id;
          if (!participantId) break;

          const { data: participant } = await supabase
            .from("trial_participants")
            .select("id, status")
            .eq("id", participantId)
            .maybeSingle();

          if (!participant) {
            console.error("Trial participant not found:", participantId);
            break;
          }
          if (participant.status === "paid") break; // idempotent

          const paymentIntentId =
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id || null;

          await supabase
            .from("trial_participants")
            .update({
              status: "paid",
              paid_at: new Date().toISOString(),
              stripe_payment_intent: paymentIntentId,
            })
            .eq("id", participantId);

          // Confirmation email to the registering parent/guardian.
          try {
            const { data: p } = await supabase
              .from("trial_participants")
              .select(
                "first_name, last_name, parent_name, parent_email, trial_id, age_group_id",
              )
              .eq("id", participantId)
              .maybeSingle();
            if (!p || !p.parent_email) break;

            const [{ data: trial }, { data: ageGroup }, { data: sessions }] =
              await Promise.all([
                supabase
                  .from("trials")
                  .select("name, club_email")
                  .eq("id", p.trial_id)
                  .maybeSingle(),
                supabase
                  .from("trial_age_groups")
                  .select("name")
                  .eq("id", p.age_group_id)
                  .maybeSingle(),
                supabase
                  .from("trial_sessions")
                  .select("session_date, start_time, end_time, venue")
                  .eq("age_group_id", p.age_group_id)
                  .order("session_date", { ascending: true }),
              ]);

            type SessionRow = {
              session_date: string;
              start_time: string | null;
              end_time: string | null;
              venue: string | null;
            };
            const sessionRows: SessionRow[] = (sessions ?? []) as SessionRow[];

            const whenText = sessionRows
              .map((s) => {
                const date = new Date(s.session_date).toLocaleDateString(
                  "en-AU",
                  { weekday: "short", day: "numeric", month: "long" },
                );
                const time = [s.start_time, s.end_time]
                  .filter(Boolean)
                  .join(" - ");
                return time ? `${date}, ${time}` : date;
              })
              .join(" · ") || "TBA";

            const venues = Array.from(
              new Set(
                sessionRows
                  .map((s) => s.venue)
                  .filter((v): v is string => Boolean(v)),
              ),
            );
            const venueText = venues.length > 0 ? venues.join(" · ") : "TBA";

            await sendTrialRegistrationEmail({
              parentEmail: p.parent_email,
              parentName: p.parent_name ?? null,
              participantFirstName: p.first_name,
              participantFullName: `${p.first_name} ${p.last_name}`.trim(),
              ageGroupName: ageGroup?.name ?? "TBA",
              trialName: trial?.name ?? "trial",
              whenText,
              venueText,
              clubContactEmail: trial?.club_email ?? "TBA",
            });
          } catch (err) {
            console.error("Trial registration email dispatch failed:", err);
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
    // Drills Library membership (netsetgo / junior-senior / all-access).
    tier: subscription.metadata?.tier ?? null,
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
