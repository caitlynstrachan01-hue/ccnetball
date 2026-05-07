import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { CAREER } from "@/lib/site-content";
import { Reveal } from "@/components/motion";

export function CareerSection() {
  return (
    <section
      aria-label="Inside the career"
      className="relative overflow-hidden border-y border-border/60 bg-background py-16 md:py-20"
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 right-[-12%] size-[28rem] rounded-full bg-[var(--brand-coral)]/22 blur-[140px]" />
        <div className="absolute -bottom-40 left-[-12%] size-[28rem] rounded-full bg-[var(--brand-raspberry)]/12 blur-[140px]" />
      </div>

      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Photo — left column on desktop. No Reveal wrap so it's always visible. */}
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl shadow-2xl shadow-primary/15 ring-1 ring-border">
              <Image
                src="/gallery/07-firebirds-vs-vixens.jpg"
                alt="Caitlyn Strachan playing Wing Attack for Queensland Firebirds in Suncorp Super Netball"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-secondary/80 via-secondary/15 to-transparent p-5 md:p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[color:var(--brand-coral)]">
                  Wing Attack
                </p>
                <p className="mt-0.5 font-display text-base font-extrabold text-white md:text-lg">
                  Queensland Firebirds
                </p>
              </div>
            </div>
          </div>

          {/* Career content — right column on desktop */}
          <Reveal delay={0.1} className="lg:col-span-7">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
              Inside the career
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-[2.5rem]">
              From Country Victoria to the{" "}
              <span className="gradient-text">gold dress</span>.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              Caitlyn climbed every rung of Australian netball, from the
              local courts in Echuca to representing Australia in the green
              and gold.
            </p>

            <div className="mt-8 space-y-3">
              {/* Diamonds — featured */}
              <article className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--brand-raspberry)] via-[var(--brand-raspberry)] to-[var(--brand-coral)] p-5 text-primary-foreground shadow-lg shadow-primary/20 ring-1 ring-white/15">
                <div className="absolute -top-8 -right-8 size-32 rounded-full bg-white/15 blur-2xl" />
                <div className="relative flex items-center gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                    <Star className="size-5 fill-white text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/85">
                      {CAREER.international.eyebrow}
                    </p>
                    <h3 className="mt-0.5 font-display text-lg font-extrabold leading-tight tracking-tight md:text-xl">
                      {CAREER.international.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-white/85 md:text-sm">
                      {CAREER.international.detail}
                    </p>
                  </div>
                </div>
              </article>

              {/* Clubs row */}
              <div className="grid gap-3 sm:grid-cols-2">
                {CAREER.clubs.map((club) => (
                  <article
                    key={club.name}
                    className="rounded-2xl bg-card p-4 ring-1 ring-border transition hover:ring-primary/40"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
                      Club
                    </p>
                    <h3 className="mt-0.5 font-display text-base font-extrabold leading-tight tracking-tight md:text-lg">
                      {club.name}
                    </h3>
                    <p className="text-xs font-semibold text-muted-foreground">
                      {club.years}
                    </p>
                  </article>
                ))}
              </div>

              {/* Competitions inline */}
              <div className="rounded-2xl bg-card p-4 ring-1 ring-border">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
                  Competitions
                </p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {CAREER.competitions.map((comp) => (
                    <li
                      key={comp.name}
                      className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                    >
                      <span className="font-display font-bold">
                        {comp.name}
                      </span>
                      <span className="text-primary/70">{comp.years}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Link
              href="/about"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:gap-3"
            >
              Read the full athlete pathway
              <ArrowRight className="size-4" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
