import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ClipboardList,
  Compass,
  ShoppingCart,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { Reveal } from "@/components/motion";
import {
  SHOP_PRODUCTS,
  getProductBySlug,
  type ShopProduct,
} from "@/lib/shop-content";

const ICONS: Record<ShopProduct["icon"], typeof Trophy> = {
  "clipboard-list": ClipboardList,
  trophy: Trophy,
  target: Target,
  zap: Zap,
  compass: Compass,
};

export function generateStaticParams() {
  return SHOP_PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: `${product.name} — The Netball Shop`,
    description: product.short,
  };
}

export default async function ShopProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

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
            {/* Small hero visual — swap for an app screenshot when ready. */}
            <div className="mt-8 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon className="size-8" />
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Sparkles className="size-3.5" />
              Coming Soon
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

      {/* DETAIL */}
      <section className="py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-12 lg:px-10">
          {/* Description + features */}
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

          {/* Sticky purchase card */}
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
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
