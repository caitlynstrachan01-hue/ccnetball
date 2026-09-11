import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Lock,
  PlayCircle,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import { Reveal } from "@/components/motion";
import { getProductBySlug } from "@/lib/shop-content";
import { DRILL_CATEGORIES } from "@/lib/drills-library-content";

export const metadata = {
  title: "Netball Drills Library — The Netball Shop",
  description:
    "A members-only library of elite netball drills, filmed and coached by Caitlyn Strachan.",
};

export default function DrillsLibraryPage() {
  const product = getProductBySlug("drills-library");
  if (!product) return null;

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 -right-40 size-[35rem] rounded-full bg-[var(--brand-coral)]/25 blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 size-[35rem] rounded-full bg-[var(--brand-raspberry)]/20 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-5xl px-6 py-16 lg:px-10 lg:py-20">
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
              <PlayCircle className="size-8" />
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Sparkles className="size-3.5" />
              Members only
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

          <Reveal delay={0.25}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="rounded-2xl bg-card px-6 py-4 shadow-md">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                  Monthly subscription
                </p>
                <p className="mt-1 font-display text-3xl font-extrabold text-foreground md:text-4xl">
                  $49
                  <span className="ml-1 text-base font-semibold text-muted-foreground">
                    / month AUD
                  </span>
                </p>
              </div>
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition disabled:cursor-not-allowed disabled:opacity-70"
              >
                <ShoppingCart className="size-5" />
                Subscribe — coming soon
              </button>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-6 py-4 text-sm font-semibold text-foreground/90 transition hover:border-primary/40 hover:bg-muted"
              >
                Members log in
              </Link>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Cancel any time from your account. No lock-in.
            </p>
          </Reveal>
        </div>
      </section>

      {/* WHAT'S INSIDE — categories only, no drill titles */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6 lg:px-10">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              What&apos;s inside
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
              170+ drills across{" "}
              <span className="gradient-text">
                {DRILL_CATEGORIES.length} focus areas
              </span>
              .
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Every drill filmed and coached by Caitlyn. New drills added
              regularly.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DRILL_CATEGORIES.map((cat) => (
              <Reveal key={cat.slug} delay={0.03}>
                <article className="relative flex h-full flex-col rounded-2xl border border-border/70 bg-card p-6">
                  <div className="flex items-center gap-3">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Lock className="size-5" />
                    </span>
                    <h3 className="font-display text-lg font-bold leading-snug">
                      {cat.name}
                    </h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {cat.short}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-t border-border/60 bg-muted/40 py-16">
        <div className="mx-auto max-w-4xl px-6 lg:px-10">
          <Reveal>
            <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
              What&apos;s included
            </h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
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

          <Reveal delay={0.1} className="mt-10">
            <div className="rounded-2xl bg-card p-6 text-center shadow-md md:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Ready to train?
              </p>
              <h3 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">
                Unlock the full library for $49 / month
              </h3>
              <button
                type="button"
                disabled
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition disabled:cursor-not-allowed disabled:opacity-70"
              >
                <ShoppingCart className="size-5" />
                Subscribe — coming soon
              </button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
