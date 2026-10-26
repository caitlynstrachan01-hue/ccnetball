import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

/**
 * Internal diagnostic — reports (safely) what the shop checkout route sees
 * for its env dependencies. Delete once the shop is proven live.
 */
export async function GET() {
  const key = process.env.STRIPE_SECRET_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const svc = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  const resend = process.env.RESEND_API_KEY;

  const safe = (v: string | undefined) =>
    v ? `${v.slice(0, 10)}… (len ${v.length})` : null;

  let stripeStatus: unknown = null;
  if (key) {
    try {
      const stripe = new Stripe(key);
      const balance = await stripe.balance.retrieve();
      stripeStatus = {
        ok: true,
        livemode: balance.livemode,
        currencies: balance.available.map((a) => a.currency),
      };
    } catch (err) {
      stripeStatus = {
        ok: false,
        error: err instanceof Error ? err.message : "unknown",
        type:
          err && typeof err === "object" && "type" in err
            ? (err as { type?: string }).type
            : undefined,
      };
    }
  }

  return NextResponse.json({
    env: {
      STRIPE_SECRET_KEY: safe(key),
      NEXT_PUBLIC_SUPABASE_URL: url,
      SUPABASE_SERVICE_ROLE_KEY: safe(svc),
      NEXT_PUBLIC_SITE_URL: site,
      RESEND_API_KEY: safe(resend),
    },
    stripe: stripeStatus,
  });
}
