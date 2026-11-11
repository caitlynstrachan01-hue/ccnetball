import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/memberships";
import {
  DRILLS_LIBRARY_CHECKOUT_OPEN,
  MEMBERSHIP_PRICE_IDS,
} from "@/lib/stripe-config";

export async function POST(request: Request) {
  if (!DRILLS_LIBRARY_CHECKOUT_OPEN) {
    return NextResponse.json(
      { error: "Subscriptions open soon." },
      { status: 503 },
    );
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json(
      { error: "Stripe not configured yet." },
      { status: 500 },
    );
  }

  const { membership: membershipId } = (await request
    .json()
    .catch(() => ({}))) as { membership?: string };
  const membership = getMembership(membershipId);
  if (!membership)
    return NextResponse.json(
      { error: "Please choose a membership." },
      { status: 400 },
    );
  const price = MEMBERSHIP_PRICE_IDS[membership.id];
  if (!price)
    return NextResponse.json(
      { error: `${membership.name} isn't available to buy yet.` },
      { status: 503 },
    );

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Not signed in — bounce to /login and come back once signed in.
    const origin = new URL(request.url).origin;
    return NextResponse.json({
      redirect: `${origin}/login?next=${encodeURIComponent("/shop/drills-library")}`,
    });
  }

  const stripe = new Stripe(stripeKey);
  const origin = new URL(request.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    customer_email: user.email ?? undefined,
    client_reference_id: user.id,
    subscription_data: {
      metadata: {
        supabase_user_id: user.id,
        product_slug: "drills-library",
        tier: membership.id,
      },
    },
    success_url: `${origin}/account?checkout=success`,
    cancel_url: `${origin}/shop/drills-library?checkout=cancelled`,
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
