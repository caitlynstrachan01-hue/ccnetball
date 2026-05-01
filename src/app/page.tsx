import Link from "next/link";
import { ArrowRight, Award, Trophy, Target, Sparkles } from "lucide-react";
import { CREDENTIALS, PROGRAMS, TESTIMONIALS } from "@/lib/site-content";

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 -right-40 size-[36rem] rounded-full bg-[var(--brand-coral)]/30 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 size-[36rem] rounded-full bg-[var(--brand-raspberry)]/20 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-32">
          <div className="grid items-center gap-14 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                <Sparkles className="size-3.5" />
                Now coaching across Australia
              </div>

              <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-balance md:text-6xl lg:text-7xl">
                Train with a <span className="gradient-text">Diamond.</span>
                <br />
                Play like one.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                Elite netball coaching from <strong className="text-foreground">Caitlyn Strachan</strong> — former
                Australian Diamond, three-time premiership winner with the
                Melbourne Vixens and Queensland Firebirds, and qualified
                mentor to Australia's next generation of athletes.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/book"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] hover:bg-[var(--brand-raspberry-dark)]"
                >
                  Book Your Session
                  <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/programs"
                  className="inline-flex items-center justify-center rounded-full border border-foreground/15 bg-card px-7 py-4 text-base font-semibold text-foreground transition hover:border-primary/40 hover:bg-muted"
                >
                  Explore Programs
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-3xl bg-secondary p-8 text-secondary-foreground shadow-2xl shadow-primary/10 md:p-10">
                <div className="absolute -top-4 -right-4 rounded-full bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg">
                  Credentials
                </div>
                <div className="space-y-6">
                  {CREDENTIALS.map((c, i) => (
                    <div
                      key={c.label}
                      className="flex items-start gap-4 border-b border-white/10 pb-5 last:border-0 last:pb-0"
                    >
                      <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[color:var(--brand-coral)]">
                        {i === 0 && <Award className="size-5" />}
                        {i === 1 && <Trophy className="size-5" />}
                        {i === 2 && <Sparkles className="size-5" />}
                        {i === 3 && <Target className="size-5" />}
                      </div>
                      <div>
                        <p className="font-display text-lg font-bold text-white">
                          {c.label}
                        </p>
                        <p className="text-sm text-white/70">{c.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section className="bg-card py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Programs
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
              Coaching built around{" "}
              <span className="gradient-text">your game.</span>
            </h2>
            <p className="mt-5 text-lg text-muted-foreground">
              From individual technical work to whole-team systems —
              every program is designed and delivered personally by
              Caitlyn.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {PROGRAMS.map((program) => (
              <article
                key={program.id}
                className="group flex flex-col rounded-2xl border border-border/70 bg-background p-7 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-display text-xl font-bold leading-snug">
                    {program.name}
                  </h3>
                  <div className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                    ${program.price}
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {program.short}
                </p>
                <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium text-foreground/70">
                  <span className="rounded-full bg-muted px-3 py-1">
                    {program.durationMinutes} min
                  </span>
                  <span className="rounded-full bg-muted px-3 py-1">
                    {program.capacity}
                  </span>
                </div>
                <Link
                  href={`/programs#${program.id}`}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition group-hover:gap-2.5"
                >
                  Learn more <ArrowRight className="size-3.5" />
                </Link>
              </article>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 rounded-full bg-secondary px-7 py-4 text-base font-semibold text-secondary-foreground transition hover:bg-primary"
            >
              Book a session <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ABOUT PREVIEW */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                The Coach
              </p>
              <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
                A career built on{" "}
                <span className="gradient-text">resilience.</span>{" "}
                A coach built on results.
              </h2>
              <div className="mt-6 space-y-5 text-lg leading-relaxed text-muted-foreground">
                <p>
                  Caitlyn Strachan grew up in Echuca, Victoria, and rose
                  through every level of Australian netball — Northern
                  Zone Academy, underage state teams, the Australian
                  Netball Championship, and Super Netball — before
                  earning her place in the green and gold.
                </p>
                <p>
                  Three premierships and a Diamond debut later, she's
                  applying that same standard to the next generation:
                  designing the kind of training programs she wishes
                  she'd had on the way up.
                </p>
              </div>
              <Link
                href="/about"
                className="mt-8 inline-flex items-center gap-2 text-base font-semibold text-primary"
              >
                Read Caitlyn's full story <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="grid gap-4">
              <div className="rounded-2xl bg-gradient-to-br from-primary to-[color:var(--brand-raspberry-dark)] p-8 text-primary-foreground shadow-xl shadow-primary/20">
                <Trophy className="size-10" />
                <p className="mt-6 font-display text-5xl font-extrabold">3×</p>
                <p className="mt-2 text-lg font-semibold">
                  Premiership Winner
                </p>
                <p className="mt-1 text-sm opacity-90">
                  Melbourne Vixens & Queensland Firebirds
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/70 bg-card p-6">
                  <Award className="size-8 text-primary" />
                  <p className="mt-4 font-display text-3xl font-bold">2017</p>
                  <p className="text-sm text-muted-foreground">
                    Diamonds debut
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-card p-6">
                  <Target className="size-8 text-primary" />
                  <p className="mt-4 font-display text-3xl font-bold">100s</p>
                  <p className="text-sm text-muted-foreground">
                    Athletes coached
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-muted/40 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              What athletes & coaches say
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
              Results that{" "}
              <span className="gradient-text">speak for themselves.</span>
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.name}
                className="flex flex-col rounded-2xl border border-border/70 bg-card p-7"
              >
                <blockquote className="flex-1 text-base leading-relaxed text-foreground/90">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 border-t border-border/70 pt-4">
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {t.role} · {t.program}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-6 lg:px-10">
          <div className="relative overflow-hidden rounded-3xl bg-secondary p-10 text-secondary-foreground md:p-16">
            <div className="absolute -top-20 -right-20 size-72 rounded-full bg-primary/30 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 size-72 rounded-full bg-[var(--brand-coral)]/30 blur-3xl" />

            <div className="relative">
              <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
                Ready to train at the{" "}
                <span className="gradient-text">next level?</span>
              </h2>
              <p className="mt-4 max-w-2xl text-lg text-white/80">
                Whether you're chasing rep selection or rebuilding a club
                squad, every session is designed personally by Caitlyn —
                premium coaching, no shortcuts.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/book"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground transition hover:scale-[1.02]"
                >
                  Book Your Session <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-4 text-base font-semibold text-white transition hover:bg-white/10"
                >
                  Get in touch
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
