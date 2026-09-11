import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ClipboardList,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import { Reveal } from "@/components/motion";
import { TrialAppPreview } from "@/components/trial-app-preview";
import { getProductBySlug } from "@/lib/shop-content";

export const metadata = {
  title: "Trial App — The Netball Shop",
  description:
    "Run smoother netball trials — shareable registration, live attendance, unbiased team allocation, and clean exports.",
};

export default function TrialAppPage() {
  const product = getProductBySlug("trial-app");
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
              <ClipboardList className="size-8" />
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              <Sparkles className="size-3.5" />
              Live now
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
                  Pricing
                </p>
                <p className="mt-1 font-display text-3xl font-extrabold text-foreground md:text-4xl">
                  $2.20
                  <span className="ml-1 text-base font-semibold text-muted-foreground">
                    per participant
                  </span>
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:scale-[1.02]"
              >
                <ShoppingCart className="size-5" />
                Set up your trial
              </Link>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Pay per participant or invoice the association at the end.
              Participant data is deleted 1 month after trials finish.
            </p>
          </Reveal>
        </div>
      </section>

      {/* INTERACTIVE DEMO */}
      <section className="py-14">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              A full walkthrough
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
              Six steps, one <span className="gradient-text">app</span>.
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Click through the flow with a real sample trial —{" "}
              <strong>Underwood Netball Association U15 rep trials</strong> —
              and see exactly how the app runs on the night.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-10">
            <TrialAppPreview />
          </Reveal>
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
        </div>
      </section>
    </>
  );
}
