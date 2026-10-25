import Link from "next/link";
import { XCircle } from "lucide-react";

export const metadata = {
  title: "Checkout cancelled — The Netball Shop",
  robots: { index: false, follow: false },
};

export default function CancelledPage() {
  return (
    <section className="py-20">
      <div className="mx-auto flex max-w-xl flex-col items-center px-6 text-center lg:px-10">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <XCircle className="size-10" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          Checkout cancelled.
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          No charge has been made. Your cart is still saved — pick up where you
          left off whenever you&apos;re ready.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link
            href="/checkout"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:scale-[1.02]"
          >
            Return to checkout
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-background px-6 py-3 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:bg-muted"
          >
            Back to shop
          </Link>
        </div>
      </div>
    </section>
  );
}
