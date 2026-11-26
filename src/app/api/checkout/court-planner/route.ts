import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import {
  COURT_PLANNER_CHECKOUT_OPEN,
  COURT_PLANNER_CURRENCY,
  COURT_PLANNER_PRICE_CENTS,
} from "@/lib/stripe-config";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!COURT_PLANNER_CHECKOUT_OPEN) {
    return NextResponse.json(
      { error: "Court Drawing checkout isn't open yet." },
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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const origin = new URL(request.url).origin;

  if (!user) {
    return NextResponse.json({
      redirect: `${origin}/login?next=${encodeURIComponent("/shop/court-planner")}`,
    });
  }

  const stripe = new Stripe(stripeKey);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: COURT_PLANNER_CURRENCY,
          unit_amount: COURT_PLANNER_PRICE_CENTS,
          product_data: {
            name: "Netball Court - Drawing (annual access)",
            description:
              "12 months of access to Netball Court - Drawing on any phone or tablet.",
          },
        },
      },
    ],
    customer_email: user.email ?? undefined,
    client_reference_id: user.id,
    metadata: {
      supabase_user_id: user.id,
      product_slug: "court-planner",
    },
    payment_intent_data: {
      metadata: {
        supabase_user_id: user.id,
        product_slug: "court-planner",
      },
    },
    success_url: `${origin}/shop/court-planner/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/shop/court-planner?checkout=cancelled`,
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
