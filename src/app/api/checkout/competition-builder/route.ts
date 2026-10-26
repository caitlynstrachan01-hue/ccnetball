import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const PRICE_CENTS = 1999;

export async function POST(request: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json(
      { error: "Payments are not configured — try again shortly." },
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
      redirect: `${origin}/login?next=${encodeURIComponent("/shop/competition-builder")}`,
    });
  }

  const stripe = new Stripe(stripeKey);

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "aud",
            unit_amount: PRICE_CENTS,
            product_data: {
              name: "Competition Builder — licence (one competition)",
              description:
                "Build one netball competition fixture. Unlimited redraws, rules, grading rounds and CSV export up until the competition's start date.",
            },
          },
        },
      ],
      customer_email: user.email ?? undefined,
      client_reference_id: user.id,
      success_url: `${origin}/tools/competition-builder?checkout=success`,
      cancel_url: `${origin}/shop/competition-builder?checkout=cancelled`,
      allow_promotion_codes: true,
      metadata: {
        product: "competition-builder",
        supabase_user_id: user.id,
      },
      payment_intent_data: {
        metadata: {
          product: "competition-builder",
          supabase_user_id: user.id,
        },
      },
    });
  } catch (err) {
    console.error("Competition Builder checkout failed:", err);
    const message = err instanceof Error ? err.message : "Stripe error";
    return NextResponse.json(
      { error: "Could not start payment.", detail: message },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: session.url });
}
