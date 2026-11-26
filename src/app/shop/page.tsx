import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Compass,
  PlayCircle,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { Reveal } from "@/components/motion";
import { CoachingProgramsGrid } from "@/components/coaching-programs-grid";
import { PhysicalProductsGrid } from "@/components/physical-products-grid";
import { listActivePhysicalProducts } from "@/lib/shop-physical.server";
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
  title: "The Netball Shop — posters, cards and coaching tools",
  description:
    "Netball posters, wall charts, card packs and digital coaching tools designed by former Australian Diamond Caitlyn Strachan. Shipped from Brisbane across Australia.",
  alternates: { canonical: "https://ccnetball.com/shop" },
};

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const [physicalProducts, visibleDigital] = await Promise.all([
    listActivePhysicalProducts(),
    Promise.resolve(SHOP_PRODUCTS.filter((p) => !p.hidden)),
  ]);

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
              Netball-themed posters, wall charts and card packs — plus digital
              coaching tools built by Caitlyn.
            </p>
          </Reveal>
        </div>
      </section>

      {/* TWO-COLUMN LAYOUT */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-10">
            {/* LEFT — physical products grid */}
            <div className="lg:col-span-7">
              <Reveal>
                <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
                  Shop <span className="gradient-text">netball gifts</span>.
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Limited edition prints and cards. Shipped from Brisbane.
                </p>
              </Reveal>
              <div className="mt-6">
                <PhysicalProductsGrid products={physicalProducts} />
              </div>
            </div>

            {/* RIGHT — subscription tiles stacked */}
            <div className="lg:col-span-5">
              <Reveal>
                <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
                  Digital <span className="gradient-text">tools</span>.
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Subscriptions and apps built by Caitlyn.
                </p>
              </Reveal>
              <div className="mt-6 space-y-5">
                {visibleDigital.map((product, i) => {
                  const Icon = ICONS[product.icon];
                  const isLive = product.status === "live";
                  const isLaunchingSoon =
                    product.status === "launching-soon";
                  const priceDisplay = product.price
                    ? product.price.replace(" AUD", "")
                    : null;
                  return (
                    <Reveal key={product.slug} delay={0.05 + i * 0.04}>
                      <article
                        className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-xl ${
                          isLive
                            ? "border-primary/30 shadow-md shadow-primary/5 hover:border-primary/60 hover:shadow-primary/10"
                            : "border-border/70 hover:border-primary/40 hover:shadow-primary/5"
                        }`}
                      >
                        {isLaunchingSoon && (
                          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-background/55 backdrop-blur-[1px]">
                            <p className="rotate-[-6deg] rounded-xl bg-red-600 px-5 py-2 text-center font-display text-xl font-extrabold uppercase tracking-wide text-white shadow-xl ring-4 ring-red-600/30 md:text-2xl">
                              Launching
                              <br />
                              {product.launchDate ?? "soon"}
                            </p>
                          </div>
                        )}

                        {/* Status + audience eyebrow row */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            {isLive && (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-600 ring-1 ring-inset ring-emerald-500/30">
                                <span className="relative flex size-1.5">
                                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
                                  <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500"></span>
                                </span>
                                Live
                              </span>
                            )}
                            {product.audience && (
                              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                                {product.audience}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 flex items-start justify-between gap-4">
                          <div
                            className={`flex size-12 shrink-0 items-center justify-center rounded-xl text-primary transition ${
                              isLive
                                ? "bg-gradient-to-br from-primary/15 to-[var(--brand-coral)]/15 group-hover:from-primary/25 group-hover:to-[var(--brand-coral)]/25"
                                : "bg-primary/10 group-hover:bg-primary/15"
                            }`}
                          >
                            <Icon className="size-6" />
                          </div>
                          {priceDisplay &&
                            product.slug !== "drills-library" && (
                              <div className="text-right">
                                <p className="font-display text-xl font-extrabold leading-none text-foreground md:text-2xl">
                                  {priceDisplay}
                                </p>
                                <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                                  AUD
                                </p>
                              </div>
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
                        {isLive ? (
                          <Link
                            href={`/shop/${product.slug}`}
                            className="mt-5 inline-flex items-center justify-center gap-1.5 self-start rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition hover:scale-[1.02] hover:shadow-primary/30"
                          >
                            See details{" "}
                            <ArrowRight className="size-3.5" />
                          </Link>
                        ) : (
                          <Link
                            href={`/shop/${product.slug}`}
                            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition group-hover:gap-2.5"
                          >
                            See details <ArrowRight className="size-3.5" />
                          </Link>
                        )}
                      </article>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COACHING PROGRAMS */}
      <section className="border-t border-border/60 py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
              Shop netball <span className="gradient-text">programs</span>.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">Coming soon…</p>
          </Reveal>
          <div className="mt-6">
            <CoachingProgramsGrid />
          </div>
        </div>
      </section>
    </>
  );
}
