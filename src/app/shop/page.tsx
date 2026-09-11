import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Compass,
  PlayCircle,
  ShoppingBag,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { Reveal } from "@/components/motion";
import { SHOP_PRODUCTS, type ShopProduct } from "@/lib/shop-content";

const ICONS: Record<ShopProduct["icon"], typeof Trophy> = {
  "clipboard-list": ClipboardList,
  trophy: Trophy,
  target: Target,
  zap: Zap,
  compass: Compass,
  "play-circle": PlayCircle,
};

export const metadata = {
  title: "The Netball Shop",
  description:
    "Subscriptions and digital tools built by CC Netball — the Netball Drills Library, Trial App and Competition Builder.",
};

export default function ShopPage() {
  const visibleProducts = SHOP_PRODUCTS.filter((p) => !p.hidden);

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
              The Netball Shop
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.02] tracking-tight md:text-7xl">
              The <span className="gradient-text">Netball Shop</span>.
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              Subscriptions and digital tools built by Caitlyn — with more on
              the way.
            </p>
          </Reveal>
        </div>
      </section>

      {/* TWO-COLUMN LAYOUT */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
            {/* LEFT — coming soon area */}
            <Reveal className="lg:col-span-7">
              <div className="flex h-full min-h-[500px] flex-col items-center justify-center rounded-3xl border border-border/70 bg-card p-10 text-center md:p-16">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ShoppingBag className="size-8" />
                </div>
                <p className="mt-8 font-display text-2xl font-bold tracking-[0.18em] text-muted-foreground md:text-3xl">
                  PRODUCTS COMING SOON...
                </p>
              </div>
            </Reveal>

            {/* RIGHT — subscription tiles stacked */}
            <div className="space-y-5 lg:col-span-5">
              {visibleProducts.map((product, i) => {
                const Icon = ICONS[product.icon];
                return (
                  <Reveal key={product.slug} delay={0.05 + i * 0.04}>
                    <article className="group flex flex-col rounded-2xl border border-border/70 bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary/15">
                          <Icon className="size-6" />
                        </div>
                        {product.price && (
                          <p className="text-right font-display text-sm font-bold text-primary">
                            {product.price.replace(" AUD", "")}
                          </p>
                        )}
                      </div>
                      <h3 className="mt-4 font-display text-lg font-bold leading-snug">
                        {product.name}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {product.short}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {product.highlights.slice(0, 3).map((h) => (
                          <span
                            key={h}
                            className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                      <Link
                        href={`/shop/${product.slug}`}
                        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition group-hover:gap-2.5"
                      >
                        See details <ArrowRight className="size-3.5" />
                      </Link>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL NOTE */}
      <section className="border-t border-border/60 bg-muted/40 py-16">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-10">
          <Reveal>
            <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
              Want to be first to know when a product launches?
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Get in touch and Caitlyn will let you know the moment a new tool
              or subscription goes live.
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
