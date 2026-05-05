import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Award,
  Trophy,
  Target,
  Sparkles,
  Quote,
  Star,
} from "lucide-react";
import {
  CREDENTIALS,
  PROGRAMS,
  TESTIMONIALS,
  FAQ,
} from "@/lib/site-content";
import { ProofBar } from "@/components/proof-bar";
import { ResultsSection } from "@/components/results-section";
import {
  Reveal,
  StaggerGroup,
  StaggerItem,
} from "@/components/motion";

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 -right-40 size-[40rem] rounded-full bg-[var(--brand-coral)]/30 blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 size-[40rem] rounded-full bg-[var(--brand-raspberry)]/20 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-32">
          <div className="grid items-center gap-14 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Reveal>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  <Sparkles className="size-3.5" />
                  Now coaching across Australia
                </div>
              </Reveal>

              <Reveal delay={0.05}>
                <h1 className="mt-6 font-display text-[2.75rem] font-extrabold leading-[1.02] tracking-tight text-balance md:text-7xl lg:text-[5.5rem]">
                  Train with a
                  <br />
                  <span className="gradient-text">Diamond</span>.
                  <br />
                  Play like one.
                </h1>
              </Reveal>

              <Reveal delay={0.15}>
                <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                  Caitlyn Strachan played for the Australian Diamonds. Won
                  three premierships with the Melbourne Vixens and Queensland
                  Firebirds. Now she coaches the next generation, one athlete
                  at a time.
                </p>
              </Reveal>

              <Reveal delay={0.25}>
                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <Link
                    href="/book"
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-xl shadow-primary/30 transition-all hover:scale-[1.02] hover:bg-[var(--brand-raspberry-dark)]"
                  >
                    Book a session
                    <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/programs"
                    className="inline-flex items-center justify-center rounded-full border border-foreground/15 bg-card px-7 py-4 text-base font-semibold text-foreground transition hover:border-primary/40 hover:bg-muted"
                  >
                    See the programs
                  </Link>
                </div>
              </Reveal>

              <Reveal delay={0.35}>
                <div className="mt-10 flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className="size-4 fill-primary text-primary"
                      />
                    ))}
                  </div>
                  <span>
                    <span className="font-semibold text-foreground">5.0</span>
                    {" "}from every athlete and team coached.
                  </span>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.2} className="lg:col-span-5">
              <div className="relative">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl shadow-2xl shadow-primary/20">
                  <Image
                    src="/gallery/01-diamonds-wa-action.jpg"
                    alt="Caitlyn Strachan in the Australian Diamonds gold dress at Wing Attack, releasing a pass mid-court"
                    fill
                    priority
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/10 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[color:var(--brand-coral)]">
                      The coach
                    </p>
                    <p className="mt-1 font-display text-2xl font-extrabold text-white md:text-3xl">
                      Caitlyn Strachan
                    </p>
                    <p className="mt-1 text-sm text-white/85">
                      Wing Attack · Australian Diamonds
                    </p>
                  </div>
                </div>

                <div className="absolute -bottom-5 -left-5 hidden rounded-2xl bg-card px-5 py-4 shadow-xl shadow-primary/15 ring-1 ring-border md:block">
                  <p className="font-display text-2xl font-extrabold gradient-text leading-none">3×</p>
                  <p className="mt-1 text-xs font-semibold text-foreground">Premiership winner</p>
                </div>

                <div className="absolute -top-5 -right-5 hidden rounded-2xl bg-secondary px-5 py-4 text-secondary-foreground shadow-xl ring-1 ring-white/10 md:block">
                  <p className="font-display text-2xl font-extrabold leading-none">2017</p>
                  <p className="mt-1 text-xs font-semibold text-white/80">Diamonds debut</p>
                </div>
              </div>

              <div className="mt-8 grid gap-3 rounded-2xl bg-card p-5 ring-1 ring-border sm:grid-cols-2">
                {CREDENTIALS.map((c, i) => (
                  <div
                    key={c.label}
                    className="flex items-start gap-3"
                  >
                      <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        {i === 0 && <Award className="size-4" />}
                        {i === 1 && <Trophy className="size-4" />}
                        {i === 2 && <Sparkles className="size-4" />}
                        {i === 3 && <Target className="size-4" />}
                      </div>
                      <div>
                        <p className="font-display text-sm font-bold text-foreground">
                          {c.label}
                        </p>
                        <p className="text-xs text-muted-foreground">{c.detail}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <ProofBar />

      <ResultsSection />

      {/* PROGRAMS */}
      <section className="bg-card py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Programs
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
              Coaching built for{" "}
              <span className="gradient-text">your game</span>.
            </h2>
            <p className="mt-5 text-lg text-muted-foreground">
              Six programs covering individual technical work, small-group
              development, team systems, video analysis, online mentoring, and
              coach development. Every session designed and delivered by
              Caitlyn.
            </p>
          </Reveal>

          <StaggerGroup
            className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            staggerChildren={0.06}
          >
            {PROGRAMS.map((program) => (
              <StaggerItem key={program.id}>
                <article className="group flex h-full flex-col rounded-2xl border border-border/70 bg-background p-7 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
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
                    className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-primary transition group-hover:gap-2.5"
                  >
                    Read more <ArrowRight className="size-3.5" />
                  </Link>
                </article>
              </StaggerItem>
            ))}
          </StaggerGroup>

          <Reveal className="mt-14 text-center">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 rounded-full bg-secondary px-7 py-4 text-base font-semibold text-secondary-foreground transition hover:bg-primary"
            >
              Book a session <ArrowRight className="size-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              How it runs
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
              No filler. No templates.{" "}
              <span className="gradient-text">Just the work</span>.
            </h2>
          </Reveal>

          <StaggerGroup
            className="mt-16 grid gap-8 md:grid-cols-3"
            staggerChildren={0.12}
          >
            {[
              {
                step: "01",
                title: "We map your game",
                body: "Before the first session, Caitlyn reviews where you are: position, level, goals, recent footage if you have it. Every drill from there has a purpose.",
              },
              {
                step: "02",
                title: "We train at game pace",
                body: "Sessions are sharp and demanding. Decision-making under pressure, not lap drills. You leave knowing exactly what improved and what to drill solo.",
              },
              {
                step: "03",
                title: "You see it on court",
                body: "The work shows up in the games that matter. Selections, contracts, premierships. The same path Caitlyn took to the Diamonds.",
              },
            ].map((item) => (
              <StaggerItem key={item.step}>
                <div className="flex h-full flex-col rounded-2xl border border-border/70 bg-card p-8">
                  <span className="font-display text-5xl font-extrabold gradient-text">
                    {item.step}
                  </span>
                  <h3 className="mt-4 font-display text-xl font-bold">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* ABOUT PREVIEW */}
      <section className="bg-muted/40 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                The coach
              </p>
              <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
                A career built on{" "}
                <span className="gradient-text">resilience</span>.
                <br />
                A coach built on results.
              </h2>
              <div className="mt-6 space-y-5 text-lg leading-relaxed text-muted-foreground">
                <p>
                  Caitlyn grew up in Echuca, Victoria, and worked through
                  every layer of Australian netball: Northern Zone Academy,
                  underage state teams, the Australian Netball Championship,
                  Super Netball, then the Diamonds.
                </p>
                <p>
                  An ACL injury and a league restructure delayed her elite
                  selection. She rebuilt and earned her debut against the
                  Silver Ferns in 2017. Three premierships followed.
                </p>
              </div>
              <Link
                href="/about"
                className="mt-8 inline-flex items-center gap-2 text-base font-semibold text-primary"
              >
                Read Caitlyn&apos;s full story{" "}
                <ArrowRight className="size-4" />
              </Link>
            </Reveal>

            <StaggerGroup className="grid gap-4" staggerChildren={0.08}>
              <StaggerItem>
                <div className="rounded-2xl bg-gradient-to-br from-primary to-[color:var(--brand-raspberry-dark)] p-8 text-primary-foreground shadow-xl shadow-primary/20">
                  <Trophy className="size-10" />
                  <p className="mt-6 font-display text-5xl font-extrabold">
                    3×
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    Premiership winner
                  </p>
                  <p className="mt-1 text-sm opacity-90">
                    Vixens and Firebirds
                  </p>
                </div>
              </StaggerItem>
              <div className="grid gap-4 sm:grid-cols-2">
                <StaggerItem>
                  <div className="rounded-2xl border border-border/70 bg-card p-6">
                    <Award className="size-8 text-primary" />
                    <p className="mt-4 font-display text-3xl font-bold">
                      2017
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Diamonds debut
                    </p>
                  </div>
                </StaggerItem>
                <StaggerItem>
                  <div className="rounded-2xl border border-border/70 bg-card p-6">
                    <Target className="size-8 text-primary" />
                    <p className="mt-4 font-display text-3xl font-bold">
                      100s
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Athletes coached
                    </p>
                  </div>
                </StaggerItem>
              </div>
            </StaggerGroup>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              From the families and coaches who&apos;ve trained with her
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
              Results that{" "}
              <span className="gradient-text">speak for themselves</span>.
            </h2>
          </Reveal>

          {/* Featured testimonial */}
          {(() => {
            const featured = TESTIMONIALS.find((t) => t.featured);
            if (!featured) return null;
            return (
              <Reveal delay={0.1} className="mt-14">
                <figure className="mx-auto max-w-4xl rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/5 via-card to-card p-10 md:p-14">
                  <Quote className="size-10 text-primary" />
                  <blockquote className="mt-6 font-display text-2xl font-semibold leading-snug text-foreground md:text-3xl">
                    &ldquo;{featured.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-8 flex items-center gap-4 border-t border-border pt-6">
                    <div className="flex size-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                      {featured.name
                        .split(" ")
                        .map((p) => p[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="font-display text-base font-bold">
                        {featured.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {featured.role} · {featured.program}
                      </p>
                    </div>
                  </figcaption>
                </figure>
              </Reveal>
            );
          })()}

          <StaggerGroup
            className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            staggerChildren={0.08}
          >
            {TESTIMONIALS.filter((t) => !t.featured).map((t) => (
              <StaggerItem key={t.name}>
                <figure className="flex h-full flex-col rounded-2xl border border-border/70 bg-card p-7 transition hover:border-primary/30 hover:shadow-lg">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className="size-3.5 fill-primary text-primary"
                      />
                    ))}
                  </div>
                  <blockquote className="mt-4 flex-1 text-base leading-relaxed text-foreground/90">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-6 border-t border-border/70 pt-4">
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {t.role} · {t.program}
                    </p>
                  </figcaption>
                </figure>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-card py-24">
        <div className="mx-auto max-w-4xl px-6 lg:px-10">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Common questions
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
              Before you book.
            </h2>
          </Reveal>

          <StaggerGroup className="mt-12 space-y-4" staggerChildren={0.06}>
            {FAQ.map((item) => (
              <StaggerItem key={item.q}>
                <details className="group rounded-2xl border border-border/70 bg-background p-6 transition hover:border-primary/40 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 font-display text-lg font-semibold text-foreground">
                    {item.q}
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition group-open:rotate-45">
                      <span className="text-xl leading-none">+</span>
                    </span>
                  </summary>
                  <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                    {item.a}
                  </p>
                </details>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-6 lg:px-10">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-secondary p-10 text-secondary-foreground md:p-16">
              <div className="absolute -top-20 -right-20 size-80 rounded-full bg-primary/30 blur-[100px]" />
              <div className="absolute -bottom-20 -left-20 size-80 rounded-full bg-[var(--brand-coral)]/30 blur-[100px]" />

              <div className="relative">
                <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
                  Ready to train at the{" "}
                  <span className="gradient-text">next level</span>?
                </h2>
                <p className="mt-4 max-w-2xl text-lg text-white/80">
                  Whether you&apos;re chasing rep selection or rebuilding a
                  club squad, every session is designed personally by
                  Caitlyn. Real coaching, no shortcuts.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href="/book"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground transition hover:scale-[1.02]"
                  >
                    Book your session <ArrowRight className="size-4" />
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
          </Reveal>
        </div>
      </section>
    </>
  );
}
