import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { PROGRAMS } from "@/lib/site-content";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion";

const HOMEPAGE_PROGRAM_IDS = [
  "video-analysis",
  "1on1",
  "small-group",
  "team",
  "online",
];

const HOMEPAGE_PROGRAMS = HOMEPAGE_PROGRAM_IDS
  .map((id) => PROGRAMS.find((p) => p.id === id))
  .filter((p): p is NonNullable<typeof p> => Boolean(p));

const HOMEPAGE_CREDENTIALS = [
  "Australian Diamond",
  "Triple ANZ Premiership Player",
  "Elite Accredited Netball Coach",
  "Queensland State Selector",
  "Queensland Firebirds Reserve Head Coach",
];

const SHOP_FEATURES = [
  {
    slug: "abc-netball-wall-chart",
    name: "ABC Netball Wall Chart",
    price: 50,
    image: "/shop/abc-netball-wall-chart/1.jpg",
  },
  {
    slug: "eat-sleep-netball-repeat-poster",
    name: "Eat Sleep Netball Repeat Poster",
    price: 40,
    image: "/shop/eat-sleep-netball-repeat-poster/1.jpg",
  },
  {
    slug: "netball-christmas-cards-pk10",
    name: "Netball Christmas Cards (pk10)",
    price: 35,
    image: "/shop/netball-christmas-cards-pk10/1.jpg",
  },
  {
    slug: "netball-birthday-cards-pk10",
    name: "Netball Birthday Cards (pk10)",
    price: 35,
    image: "/shop/netball-birthday-cards-pk10/1.jpg",
  },
];

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 -right-40 size-[40rem] rounded-full bg-[var(--brand-coral)]/30 blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 size-[40rem] rounded-full bg-[var(--brand-raspberry)]/20 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
          <div className="grid items-center gap-14 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Reveal>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  <Sparkles className="size-3.5" />
                  The complete netball platform
                </div>
              </Reveal>

              <Reveal delay={0.05}>
                <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.02] tracking-tight text-balance md:text-6xl lg:text-7xl">
                  Everything you need
                  <br />
                  for{" "}
                  <span className="gradient-text italic">netball</span>.
                </h1>
              </Reveal>

              <Reveal delay={0.15}>
                <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                  Coaching, programs, products and the digital tools to run
                  your season — all built by former Diamond Caitlyn Strachan.
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
                    href="/shop"
                    className="inline-flex items-center justify-center rounded-full border border-foreground/15 bg-card px-7 py-4 text-base font-semibold text-foreground transition hover:border-primary/40 hover:bg-muted"
                  >
                    Explore THE SHOP
                  </Link>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.2} className="lg:col-span-5">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl shadow-2xl shadow-primary/20">
                <Image
                  src="/gallery/01-diamonds-wa-action.jpg"
                  alt="Caitlyn Strachan in the Australian Diamonds gold dress at Wing Attack, releasing a pass mid-court"
                  fill
                  priority
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  quality={95}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[color:var(--brand-coral)]">
                    Founder &amp; head coach
                  </p>
                  <p className="mt-1 font-display text-2xl font-extrabold text-white md:text-3xl">
                    Caitlyn Strachan
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CREDENTIAL BAND */}
      <section className="bg-secondary text-secondary-foreground">
        <div className="mx-auto max-w-7xl px-6 py-5 lg:px-10">
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-center text-[11px] font-bold uppercase tracking-[0.14em] md:text-xs">
            {HOMEPAGE_CREDENTIALS.map((label, i) => (
              <li key={label} className="flex items-center gap-3">
                {i > 0 && (
                  <Star
                    aria-hidden
                    className="size-2.5 fill-primary text-primary"
                  />
                )}
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--brand-coral)]/25 via-primary/15 to-[var(--brand-raspberry)]/30 py-20 md:py-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-10 -left-10 size-96 rounded-full bg-[var(--brand-coral)]/30 blur-[100px]" />
          <div className="absolute -bottom-10 -right-10 size-96 rounded-full bg-primary/30 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 lg:px-10">

          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Coaching philosophy
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <blockquote className="mt-6 text-balance font-display text-2xl font-medium italic leading-tight text-foreground md:text-4xl lg:text-[2.75rem]">
              Netball is a thinking game. I develop{" "}
              <span className="not-italic bg-gradient-to-r from-primary to-[color:var(--brand-coral)] bg-clip-text font-extrabold text-transparent">
                smart players
              </span>{" "}
              — athletes with the tools, the know-how and the confidence to
              take their game to new heights.
            </blockquote>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mt-8 text-right text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
              — Caitlyn Strachan
            </p>
          </Reveal>
        </div>
      </section>

      {/* COACHING */}
      <section className="bg-background py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Coaching · in person &amp; online
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
              Coaching built around{" "}
              <span className="gradient-text italic">the player in front of me</span>.
            </h2>
            <p className="mt-5 text-lg text-muted-foreground">
              Every athlete gets a program mapped to their strengths, the gaps
              to close and the next level they&apos;re chasing. No filler.
              Delivered right across Australia.
            </p>
          </Reveal>

          <StaggerGroup
            className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            staggerChildren={0.06}
          >
            {HOMEPAGE_PROGRAMS.map((program) => {
              const navy = program.id === "video-analysis";
              return (
                <StaggerItem key={program.id}>
                  <article
                    className={`group flex h-full flex-col rounded-2xl border p-7 transition-all hover:-translate-y-1 hover:shadow-xl ${
                      navy
                        ? "border-white/10 bg-secondary hover:border-[color:var(--brand-coral)]/50 hover:shadow-primary/20"
                        : "border-border/70 bg-card hover:border-primary/40 hover:shadow-primary/5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h3
                        className={`font-display text-xl font-bold leading-snug ${
                          navy ? "text-white" : ""
                        }`}
                      >
                        {program.name}
                      </h3>
                      <div
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                          navy
                            ? "bg-primary text-white"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        ${program.price}
                      </div>
                    </div>
                    <p
                      className={`mt-3 text-sm leading-relaxed ${
                        navy ? "text-white/75" : "text-muted-foreground"
                      }`}
                    >
                      {program.short}
                    </p>
                    <div
                      className={`mt-6 flex flex-wrap gap-2 text-xs font-medium ${
                        navy ? "text-white/85" : "text-foreground/70"
                      }`}
                    >
                      <span
                        className={`rounded-full px-3 py-1 ${
                          navy ? "bg-white/10" : "bg-muted"
                        }`}
                      >
                        {program.durationMinutes} min
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 ${
                          navy ? "bg-white/10" : "bg-muted"
                        }`}
                      >
                        {program.capacity}
                      </span>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-4 pt-6">
                      <Link
                        href={`/book?program=${program.id}`}
                        className={`inline-flex items-center gap-1.5 text-sm font-semibold transition group-hover:gap-2.5 ${
                          navy
                            ? "text-[color:var(--brand-coral)]"
                            : "text-primary"
                        }`}
                      >
                        Book this program <ArrowRight className="size-3.5" />
                      </Link>
                      <Link
                        href={`/programs#${program.id}`}
                        className={`text-xs font-semibold transition ${
                          navy
                            ? "text-white/60 hover:text-white"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Read more
                      </Link>
                    </div>
                  </article>
                </StaggerItem>
              );
            })}
          </StaggerGroup>

          <Reveal className="mt-12 text-center">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 rounded-full bg-secondary px-7 py-4 text-base font-semibold text-secondary-foreground transition hover:bg-primary"
            >
              See all programs <ArrowRight className="size-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* COACH SUPPORT */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--brand-coral)]/15 via-background to-primary/10 py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -right-32 size-[32rem] rounded-full bg-[var(--brand-coral)]/20 blur-[120px]" />
          <div className="absolute -bottom-32 -left-32 size-[32rem] rounded-full bg-primary/15 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Coach support
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
              Support for your{" "}
              <span className="gradient-text italic">coaching journey</span>.
            </h2>
            <p className="mt-5 text-lg text-muted-foreground">
              Three digital tools built for Australian netball — plus Coach the
              Coaches, delivered in person for your coaching group.
            </p>
          </Reveal>

          <StaggerGroup
            className="mt-14 grid gap-6 md:grid-cols-2"
            staggerChildren={0.08}
          >
            {/* Drill Library — navy accent card */}
            <StaggerItem>
              <article className="group flex h-full flex-col rounded-2xl border border-white/10 bg-secondary p-7 transition-all hover:-translate-y-1 hover:border-[color:var(--brand-coral)]/50 hover:shadow-xl hover:shadow-primary/20">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-display text-xl font-bold leading-snug text-white">
                    Drill Library
                  </h3>
                  <div className="shrink-0 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
                    $299
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white/75">
                  Hundreds of elite-level drills, searchable by skill, position
                  and age group. Written by Caitlyn, used in every CC Netball
                  session.
                </p>
                <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium text-white/85">
                  <span className="rounded-full bg-white/10 px-3 py-1">
                    Per year
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1">
                    The Art of Netball
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1">
                    Launching Jan 2027
                  </span>
                </div>
                <div className="mt-auto pt-6">
                  <Link
                    href="/shop/drills-library"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--brand-coral)] transition group-hover:gap-2.5"
                  >
                    Sign up <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </article>
            </StaggerItem>

            {/* Netball Trials */}
            <StaggerItem>
              <article className="group flex h-full flex-col rounded-2xl border border-border/70 bg-card p-7 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-display text-xl font-bold leading-snug">
                    Netball Trials
                  </h3>
                  <div className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                    $2.20
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Run netball trials end-to-end — registrations, assessments,
                  scoring and selections — all from one simple app.
                </p>
                <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium text-foreground/70">
                  <span className="rounded-full bg-muted px-3 py-1">
                    Per participant
                  </span>
                </div>
                <div className="mt-auto pt-6">
                  <Link
                    href="/shop/trial-app"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition group-hover:gap-2.5"
                  >
                    Sign up <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </article>
            </StaggerItem>

            {/* Competition */}
            <StaggerItem>
              <article className="group flex h-full flex-col rounded-2xl border border-border/70 bg-card p-7 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-display text-xl font-bold leading-snug">
                    Competition Builder
                  </h3>
                  <div className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                    $19.99
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Unlimited rules and team conflicts, made easy. The only draw
                  builder in Australia that handles locked courts, forced byes
                  and your real-world constraints on the first pass.
                </p>
                <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium text-foreground/70">
                  <span className="rounded-full bg-muted px-3 py-1">
                    Per competition
                  </span>
                </div>
                <div className="mt-auto pt-6">
                  <Link
                    href="/tools/competition-builder"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition group-hover:gap-2.5"
                  >
                    Sign up <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </article>
            </StaggerItem>

            {/* Coach the Coaches - In person */}
            <StaggerItem>
              <article className="group flex h-full flex-col rounded-2xl border border-border/70 bg-card p-7 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-display text-xl font-bold leading-snug">
                    Coach the Coaches
                  </h3>
                  <div className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                    $80
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Session design, drill libraries, athlete management, and the
                  systems behind winning programs. Delivered by Caitlyn with
                  your coaching group.
                </p>
                <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium text-foreground/70">
                  <span className="rounded-full bg-muted px-3 py-1">
                    In person
                  </span>
                  <span className="rounded-full bg-muted px-3 py-1">
                    Min 4 coaches
                  </span>
                </div>
                <div className="mt-auto pt-6">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition group-hover:gap-2.5"
                  >
                    Enquire <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </article>
            </StaggerItem>
          </StaggerGroup>
        </div>
      </section>

      {/* THE SHOP */}
      <section className="bg-background py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              THE SHOP
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
              Netball products{" "}
              <span className="gradient-text italic">made for the game</span>.
            </h2>
            <p className="mt-5 text-lg text-muted-foreground">
              Limited-edition posters and greeting cards, designed by Caitlyn.
              Shipped Australia-wide.
            </p>
          </Reveal>

          <StaggerGroup
            className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            staggerChildren={0.06}
          >
            {SHOP_FEATURES.map((item) => (
              <StaggerItem key={item.slug}>
                <Link
                  href={`/shop/${item.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 100vw"
                      className="object-cover transition group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <h3 className="font-display text-base font-bold leading-snug">
                      {item.name}
                    </h3>
                    <p className="font-display text-xl font-extrabold text-primary">
                      ${item.price}
                    </p>
                    <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-semibold text-primary">
                      Shop now <ArrowRight className="size-3.5" />
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerGroup>

          <Reveal className="mt-12 text-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-secondary px-7 py-4 text-base font-semibold text-secondary-foreground transition hover:bg-primary"
            >
              Visit THE SHOP <ArrowRight className="size-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* FOUNDER */}
      <section className="bg-muted/40 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <Reveal delay={0.1} className="lg:col-span-5">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl shadow-2xl shadow-primary/15">
                <Image
                  src="/gallery/09-firebirds-medal-portrait.jpg"
                  alt="Caitlyn Strachan smiling with her ANZ Championship medal in a Firebirds polo"
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  quality={95}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/70 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[color:var(--brand-coral)]">
                    Founder
                  </p>
                  <p className="mt-1 font-display text-xl font-extrabold text-white">
                    Caitlyn Strachan
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal className="lg:col-span-7">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Meet the coach and founder
              </p>
              <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
                Taught by a Diamond.{" "}
                <span className="gradient-text italic">Delivered by an elite coach</span>.
              </h2>
              <div className="mt-6 space-y-5 text-lg leading-relaxed text-muted-foreground">
                <p>
                  A resilient player with a fierce work ethic and a sharp
                  tactical mind — Caitlyn Strachan turned a career of setbacks
                  and comebacks into three ANZ Championship premierships and
                  the Australian Diamonds jersey.
                </p>
                <p>
                  Today she&apos;s one of the country&apos;s most sought-after
                  netball coaches. Every program on this site — the coaching,
                  the Drill Library, the Competition Builder, the shop — is
                  built by Caitlyn herself. Elite-level thinking, in the hands
                  of the players, parents and coaches who want it.
                </p>
              </div>
              <Link
                href="/about"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:scale-[1.02]"
              >
                Read Caitlyn&apos;s story <ArrowRight className="size-4" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-[var(--brand-raspberry-dark)] py-24 text-primary-foreground">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 right-10 size-80 rounded-full bg-white/15 blur-[100px]" />
          <div className="absolute -bottom-20 left-10 size-80 rounded-full bg-[var(--brand-coral)]/40 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 text-center lg:px-10">
          <Reveal>
            <h2 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
              Where do you want to start?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-white/90">
              Pick a path. Everything on CC Netball is designed to work on its
              own — or stack together as your athlete grows.
            </p>
          </Reveal>

          <StaggerGroup
            className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            staggerChildren={0.06}
          >
            {[
              {
                href: "/book",
                label: "Book a session",
                meta: "Train with Caitlyn",
              },
              {
                href: "/shop",
                label: "Visit THE SHOP",
                meta: "Posters, cards & tools",
              },
              {
                href: "/tools/competition-builder",
                label: "Build a competition",
                meta: "$19.99 / competition",
              },
              {
                href: "/contact",
                label: "Get in touch",
                meta: "Reply within 1 business day",
              },
            ].map((item) => (
              <StaggerItem key={item.href}>
                <Link
                  href={item.href}
                  className="flex h-full flex-col gap-1 rounded-2xl border border-white/25 bg-white/15 p-5 text-left backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/25"
                >
                  <span className="font-display text-lg font-bold">
                    {item.label} →
                  </span>
                  <span className="text-xs text-white/85">{item.meta}</span>
                </Link>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>
    </>
  );
}
