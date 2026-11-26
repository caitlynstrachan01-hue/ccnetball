import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardList,
  Compass,
  PlayCircle,
  ShoppingCart,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { Reveal } from "@/components/motion";
import { CompetitionBuilderBuyButton } from "@/components/competition-builder-buy-button";
import { CourtPlannerBuyButton } from "@/components/court-planner-buy-button";
import { PhysicalProductDetail } from "@/components/physical-product-detail";
import { ShopPreviewCarousel } from "@/components/shop-preview-carousel";
import {
  getProductBySlug,
  type ShopProduct,
} from "@/lib/shop-content";
import { getPhysicalProductBySlug } from "@/lib/shop-physical.server";
import { getCourtPlannerAccess } from "@/lib/court-planner-access.server";

const ICONS: Record<ShopProduct["icon"], typeof Trophy> = {
  "clipboard-list": ClipboardList,
  trophy: Trophy,
  target: Target,
  zap: Zap,
  compass: Compass,
  "play-circle": PlayCircle,
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const url = `https://ccnetball.com/shop/${slug}`;
  const digital = getProductBySlug(slug);
  if (digital) {
    return {
      title: `${digital.name} — The Netball Shop`,
      description: digital.short,
      alternates: { canonical: url },
      openGraph: {
        title: digital.name,
        description: digital.short,
        type: "website",
        url,
      },
    };
  }
  const physical = await getPhysicalProductBySlug(slug);
  if (physical) {
    return {
      title: `${physical.name} — The Netball Shop`,
      description: physical.short,
      alternates: { canonical: url },
      openGraph: {
        title: physical.name,
        description: physical.short,
        type: "website",
        url,
        images: physical.photos?.[0]
          ? [{ url: `https://ccnetball.com${physical.photos[0]}` }]
          : undefined,
      },
    };
  }
  return { title: "Product not found" };
}

export default async function ShopProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const digital = getProductBySlug(slug);
  if (!digital) {
    const physical = await getPhysicalProductBySlug(slug);
    if (!physical) notFound();
    return <PhysicalProductDetail product={physical} />;
  }

  const product = digital;
  const Icon = ICONS[product.icon];

  const courtPlannerAccess =
    product.slug === "court-planner"
      ? await getCourtPlannerAccess()
      : null;

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-br from-[var(--brand-coral)]/15 via-background to-[var(--brand-raspberry)]/10">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 -right-40 size-[40rem] rounded-full bg-[var(--brand-coral)]/30 blur-[140px]" />
          <div className="absolute -bottom-40 -left-40 size-[40rem] rounded-full bg-[var(--brand-raspberry)]/25 blur-[140px]" />
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        <div className="mx-auto max-w-6xl px-6 pb-16 pt-10 lg:px-10 lg:pb-20 lg:pt-14">
          <Reveal>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition hover:text-primary"
            >
              <ArrowLeft className="size-4" /> Back to the shop
            </Link>
          </Reveal>

          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-10">
            <div className="flex flex-col lg:col-span-7">
              <Reveal delay={0.05}>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-[var(--brand-coral)]/20 text-primary shadow-md shadow-primary/10">
                    <Icon className="size-7" />
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                    <Sparkles className="size-3" />
                    {product.launchUrl || product.slug === "court-planner"
                      ? "Now Live"
                      : "Coming Soon"}
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
                  Designed by Caitlyn Strachan · Elite accredited netball coach
                </p>
              </Reveal>

              <Reveal delay={0.15}>
                <h1 className="mt-3 font-display text-[2.5rem] font-extrabold leading-[1.02] tracking-tight md:text-[3.5rem]">
                  {product.name}
                </h1>
              </Reveal>

              <Reveal delay={0.2}>
                <a
                  href="#pricing"
                  className="group mt-7 inline-flex w-fit items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:scale-[1.02] hover:shadow-primary/35"
                >
                  {product.slug === "court-planner" && courtPlannerAccess
                    ? "Launch now"
                    : product.slug === "court-planner"
                      ? "Buy now"
                      : product.launchUrl
                        ? "Launch now"
                        : "Buy now"}
                  <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                </a>
              </Reveal>

              <Reveal delay={0.25}>
                <p className="mt-7 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                  {product.short}
                </p>
              </Reveal>

              {product.highlights.length > 0 && (
                <Reveal delay={0.3}>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {product.highlights.slice(0, 4).map((h) => (
                      <span
                        key={h}
                        className="rounded-full border border-border/70 bg-background/60 px-3 py-1 text-xs font-semibold text-foreground/80 backdrop-blur-sm"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </Reveal>
              )}

              {product.features.length > 0 && (
                <Reveal delay={0.35}>
                  <div className="mt-auto pt-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      In the app
                    </p>
                    <ul className="mt-4 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                      {product.features.slice(0, 6).map((f) => (
                        <li
                          key={f}
                          className="flex items-start gap-2 text-sm text-foreground/85"
                        >
                          <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              )}
            </div>

            {product.previewImages && product.previewImages.length > 0 && (
              <Reveal delay={0.1} className="lg:col-span-5">
                <div className="mx-auto max-w-[340px] lg:max-w-none">
                  <ShopPreviewCarousel slides={product.previewImages} />
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* DETAIL */}
      <section className="py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-12 lg:gap-14 lg:px-10">
          <Reveal className="lg:col-span-7">
            <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
              About this app
            </h2>
            <p className="mt-4 text-base leading-relaxed text-foreground/90 md:text-lg">
              {product.description}
            </p>

            <h3 className="mt-10 font-display text-xl font-bold tracking-tight">
              What&apos;s included
            </h3>
            <ul className="mt-5 space-y-3">
              {product.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="mt-0.5 size-5 shrink-0 text-primary" />
                  <span className="text-base text-foreground/90">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-5">
            <div
              id="pricing"
              className="scroll-mt-24 rounded-3xl border border-border/70 bg-card p-8 shadow-lg shadow-primary/5 md:sticky md:top-24"
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Pricing
              </p>
              {product.price ? (
                <p className="mt-2 font-display text-3xl font-extrabold text-foreground md:text-4xl">
                  {product.price}
                </p>
              ) : (
                <>
                  <p className="mt-2 font-display text-3xl font-extrabold text-foreground md:text-4xl">
                    Coming soon
                  </p>
                  <p className="mt-2 text-sm italic text-muted-foreground">
                    Final pricing is being locked in.
                  </p>
                </>
              )}

              {product.pricingTiers && (
                <div className="mt-5 space-y-2">
                  {product.pricingTiers.map((tier) => (
                    <div
                      key={tier.label}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {tier.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tier.detail}
                        </p>
                      </div>
                      <p className="font-display text-lg font-extrabold text-primary">
                        {tier.price}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {product.pricingNote && (
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                  {product.pricingNote}
                </p>
              )}

              <div className="mt-6 border-t border-border pt-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Highlights
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.highlights.map((h) => (
                    <span
                      key={h}
                      className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              {product.slug === "competition-builder" ? (
                <CompetitionBuilderBuyButton />
              ) : product.slug === "court-planner" && courtPlannerAccess ? (
                <>
                  <Link
                    href="/court-planner"
                    className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:scale-[1.01]"
                  >
                    Launch {product.name}
                    <ArrowRight className="size-5" />
                  </Link>
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    Your access expires in {courtPlannerAccess.daysRemaining}{" "}
                    {courtPlannerAccess.daysRemaining === 1 ? "day" : "days"}.
                  </p>
                </>
              ) : product.slug === "court-planner" ? (
                <CourtPlannerBuyButton />
              ) : product.launchUrl ? (
                <>
                  <Link
                    href={product.launchUrl}
                    className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:scale-[1.01]"
                  >
                    Launch {product.name}
                    <ArrowRight className="size-5" />
                  </Link>
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    Opens in the same tab. Works in any browser on your phone
                    or tablet.
                  </p>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    disabled
                    className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <ShoppingCart className="size-5" />
                    Add to cart
                  </button>
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    Checkout goes live at launch.
                  </p>
                  <Link
                    href="/contact"
                    className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-foreground/15 bg-background px-7 py-3.5 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:bg-muted"
                  >
                    Notify me at launch
                  </Link>
                </>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
