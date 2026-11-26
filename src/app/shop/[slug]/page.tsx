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
import { PhysicalProductDetail } from "@/components/physical-product-detail";
import {
  getProductBySlug,
  type ShopProduct,
} from "@/lib/shop-content";
import { getPhysicalProductBySlug } from "@/lib/shop-physical.server";

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

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 -right-40 size-[35rem] rounded-full bg-[var(--brand-coral)]/25 blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 size-[35rem] rounded-full bg-[var(--brand-raspberry)]/20 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-4xl px-6 py-16 lg:px-10 lg:py-20">
          <Reveal>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition hover:text-primary"
            >
              <ArrowLeft className="size-4" /> Back to the shop
            </Link>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="mt-8 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon className="size-8" />
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Sparkles className="size-3.5" />
              {product.launchUrl ? "Now Live" : "Coming Soon"}
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
              {product.name}
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mt-5 max-w-2xl text-lg text-muted-foreground md:text-xl">
              {product.short}
            </p>
          </Reveal>
        </div>
      </section>

      {/* PREVIEW GALLERY */}
      {product.previewImages && product.previewImages.length > 0 && (
        <section className="border-b border-border/60 py-14 lg:py-16">
          <div className="mx-auto max-w-6xl px-6 lg:px-10">
            <Reveal>
              <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
                See it in action
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Straight from Caitlyn&apos;s own iPhone.
              </p>
            </Reveal>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {product.previewImages.map((img, i) => (
                <Reveal key={img.src} delay={0.05 + i * 0.06}>
                  <figure className="group overflow-hidden rounded-2xl border border-border/70 bg-card shadow-lg shadow-primary/5 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
                    <div className="relative aspect-[9/16] overflow-hidden bg-[#0F1012]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.src}
                        alt={img.alt}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    </div>
                    {img.caption && (
                      <figcaption className="px-4 py-3 text-sm font-semibold text-foreground/80">
                        {img.caption}
                      </figcaption>
                    )}
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* DETAIL */}
      <section className="py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-12 lg:px-10">
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
            <div className="rounded-3xl border border-border/70 bg-card p-8 shadow-lg shadow-primary/5 md:sticky md:top-24">
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
