import { Metadata } from "next";
import { CheckoutForm } from "./checkout-form";

export const metadata: Metadata = {
  title: "Checkout — The Netball Shop",
  description: "Checkout and pay for your Netball Shop order.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <section className="py-10 lg:py-14">
      <div className="mx-auto max-w-5xl px-6 lg:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Checkout
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          Almost there.
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Enter your delivery details and choose a postage option. Payment is
          processed securely by Stripe on the next page.
        </p>

        <div className="mt-8">
          <CheckoutForm />
        </div>
      </div>
    </section>
  );
}
