import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import { formatPriceCents } from "@/lib/shop-physical";
import { ClearCartOnMount } from "@/components/cart/clear-cart-on-mount";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Order confirmed — The Netball Shop",
  robots: { index: false, follow: false },
};

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  let orderNumber: string | null = null;
  let totalCents: number | null = null;
  let email: string | null = null;

  if (session_id) {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("shop_orders")
      .select("order_number, total_cents, customer_email")
      .eq("stripe_session_id", session_id)
      .maybeSingle();
    if (data) {
      orderNumber = data.order_number;
      totalCents = data.total_cents;
      email = data.customer_email;
    }
  }

  return (
    <section className="py-20">
      <ClearCartOnMount />
      <div className="mx-auto flex max-w-xl flex-col items-center px-6 text-center lg:px-10">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <CheckCircle2 className="size-10" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          Thanks — your order is placed.
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          Your payment was successful and Caitlyn has been notified. We&apos;ll
          email you with tracking as soon as it ships.
        </p>

        {(orderNumber || totalCents !== null) && (
          <div className="mt-8 w-full rounded-2xl border border-border/70 bg-card p-6 text-left">
            {orderNumber && (
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Order number
              </p>
            )}
            {orderNumber && (
              <p className="mt-1 font-display text-xl font-bold">
                {orderNumber}
              </p>
            )}
            {totalCents !== null && (
              <p className="mt-3 text-sm text-muted-foreground">
                Total paid:{" "}
                <span className="font-semibold text-foreground">
                  {formatPriceCents(totalCents)}
                </span>
              </p>
            )}
            {email && (
              <p className="mt-1 text-sm text-muted-foreground">
                Confirmation sent to{" "}
                <span className="font-semibold text-foreground">{email}</span>
              </p>
            )}
          </div>
        )}

        <Link
          href="/shop"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:scale-[1.02]"
        >
          Back to the shop
        </Link>
      </div>
    </section>
  );
}
