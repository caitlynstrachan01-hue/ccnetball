import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Compass,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion";
import { SHOP_PRODUCTS, type ShopProduct } from "@/lib/shop-content";

const ICONS: Record<ShopProduct["icon"], typeof Trophy> = {
  "clipboard-list": ClipboardList,
  trophy: Trophy,
  target: Target,
  zap: Zap,
  compass: Compass,
};

export const metadata = {
  title: "The Netball Shop",
  description:
    "Digital tools built by CC Netball — trial night, competition draws, game-day coaching and season planning apps for clubs, associations and coaches.",
};

export default function ShopPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 -right-40 size-[40rem] rounded-full bg-[var(--brand-coral)]/30 blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 size-[40rem] rounded-full bg-[var(--brand-raspberry)]/20 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-5xl px-6 py-20 text-center lg:px-10 lg:py-24">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Sparkles className="size-3.5" />
              Coming Soon
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.02] tracking-tight md:text-7xl">
              The <span className="gradient-text">Netball Shop</span>.
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              A growing suite of digital tools built by Caitlyn to make
              coaching, trials, competitions and season planning easier for
              clubs, associations and coaches.
            </p>
          </Reveal>
        </div>
      </section>

      {/* PRODUCT GRID */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              The tools
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
              Built for the way you actually{" "}
              <span className="gradient-text">run netball</span>.
            </h2>
          </Reveal>

          <StaggerGroup
            className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            staggerChildren={0.06}
          >
            {SHOP_PRODUCTS.map((product) => {
              const Icon = ICONS[product.icon];
              return (
                <StaggerItem key={product.slug}>
                  <article className="group flex h-full flex-col rounded-2xl border border-border/70 bg-card p-7 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
                    {/* Small in-tile visual — swap this block for an <Image> when app screenshots are ready. */}
                    <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary/15">
                      <Icon className="size-7" />
                    </div>
                    <h3 className="mt-5 font-display text-xl font-bold leading-snug">
                      {product.name}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {product.short}
                    </p>
                    <div className="mt-6 inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {product.bestFor}
                    </div>
                    <Link
                      href={`/shop/${product.slug}`}
                      className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-primary transition group-hover:gap-2.5"
                    >
                      See details <ArrowRight className="size-3.5" />
                    </Link>
                  </article>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </div>
      </section>

      {/* FINAL NOTE */}
      <section className="border-t border-border/60 bg-muted/40 py-16">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-10">
          <Reveal>
            <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
              Interested in bringing these tools to your club?
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              These tools are launching soon. Get in touch to be the first to
              know when they go live — early users get priority onboarding
              from Caitlyn directly.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:scale-[1.02] hover:bg-[var(--brand-raspberry-dark)]"
            >
              Get in touch <ArrowRight className="size-4" />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
