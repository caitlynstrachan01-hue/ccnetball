import Link from "next/link";
import { ArrowRight, ShoppingBag, Sparkles } from "lucide-react";
import { Reveal } from "@/components/motion";

export const metadata = {
  title: "The Netball Shop",
  description:
    "The CCNetball Shop is coming soon — training gear, apparel, and essentials curated by Caitlyn.",
};

export default function ShopPage() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-40 size-[40rem] rounded-full bg-[var(--brand-coral)]/30 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 size-[40rem] rounded-full bg-[var(--brand-raspberry)]/20 blur-[120px]" />
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-4xl flex-col items-center justify-center px-6 py-20 text-center lg:px-10 lg:py-28">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <Sparkles className="size-3.5" />
            Coming Soon
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="mt-8 flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShoppingBag className="size-9" />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <h1 className="mt-8 font-display text-5xl font-extrabold leading-[1.02] tracking-tight md:text-7xl lg:text-8xl">
            The <span className="gradient-text">Netball Shop</span>.
          </h1>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Something exciting is on the way. Caitlyn is curating a collection
            of training gear, apparel and essentials — designed for athletes
            who take their game seriously.
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="mt-4 font-display text-base font-semibold text-foreground/80">
            Stay tuned.
          </p>
        </Reveal>

        <Reveal delay={0.25}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] hover:bg-[var(--brand-raspberry-dark)]"
            >
              Get notified when we launch
              <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-foreground/15 bg-card px-7 py-4 text-base font-semibold text-foreground transition hover:border-primary/40 hover:bg-muted"
            >
              Back to home
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
