import { Award, Star, Target, Trophy } from "lucide-react";
import { CAREER } from "@/lib/site-content";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion";

export function CareerSection() {
  return (
    <section
      aria-label="Inside the career"
      className="relative overflow-hidden bg-background py-20 md:py-28"
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 right-[-10%] size-[34rem] rounded-full bg-[var(--brand-coral)]/30 blur-[140px]" />
        <div className="absolute -bottom-40 left-[-10%] size-[34rem] rounded-full bg-[var(--brand-raspberry)]/15 blur-[140px]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Inside the career
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
            From state league to the{" "}
            <span className="gradient-text">gold dress</span>.
          </h2>
        </Reveal>

        <StaggerGroup
          className="mt-14 grid gap-5 lg:grid-cols-12 lg:gap-6"
          staggerChildren={0.1}
        >
          {/* Diamonds hero card */}
          <StaggerItem className="lg:col-span-5">
            <article className="relative h-full overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--brand-raspberry)] via-[var(--brand-raspberry)] to-[var(--brand-coral)] p-8 text-primary-foreground shadow-2xl shadow-primary/25 ring-1 ring-white/15 md:p-10">
              <div className="absolute -top-10 -right-10 size-44 rounded-full bg-white/15 blur-2xl" />

              <div className="relative flex h-full flex-col">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white">
                    <Star className="size-3.5 fill-white" />
                    {CAREER.international.eyebrow}
                  </span>
                  <Trophy className="size-7 text-white/80" />
                </div>

                <div className="mt-12 md:mt-16">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
                    Played for
                  </p>
                  <h3 className="mt-2 font-display text-4xl font-extrabold leading-[1.05] tracking-tight md:text-5xl lg:text-[3.25rem]">
                    {CAREER.international.name}
                  </h3>
                  <p className="mt-4 text-sm font-medium text-white/90 md:text-base">
                    {CAREER.international.detail}
                  </p>
                </div>

                <div className="mt-auto flex items-center gap-4 border-t border-white/20 pt-6">
                  <div className="flex size-10 items-center justify-center rounded-full bg-white/15">
                    <Award className="size-5 text-white" />
                  </div>
                  <p className="text-sm leading-snug text-white/85">
                    Selected to wear the green and gold for Australia&apos;s
                    national netball team.
                  </p>
                </div>
              </div>
            </article>
          </StaggerItem>

          {/* Clubs + Competitions grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
            {CAREER.clubs.map((club) => (
              <StaggerItem key={club.name}>
                <article className="group h-full rounded-2xl bg-card p-7 ring-1 ring-border transition-all hover:-translate-y-0.5 hover:ring-primary/40 hover:shadow-xl hover:shadow-primary/5">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
                      Club
                    </span>
                    <Award className="size-5 text-primary/70 transition-colors group-hover:text-primary" />
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-extrabold leading-tight tracking-tight md:text-[1.65rem]">
                    {club.name}
                  </h3>
                  <p className="mt-2 text-sm font-semibold text-muted-foreground">
                    {club.years}
                  </p>
                </article>
              </StaggerItem>
            ))}

            {CAREER.competitions.map((comp) => (
              <StaggerItem key={comp.name}>
                <article className="group h-full rounded-2xl bg-card p-7 ring-1 ring-border transition-all hover:-translate-y-0.5 hover:ring-primary/40 hover:shadow-xl hover:shadow-primary/5">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
                      Competition
                    </span>
                    <Target className="size-5 text-primary/70 transition-colors group-hover:text-primary" />
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-extrabold leading-tight tracking-tight md:text-[1.65rem]">
                    {comp.name}
                  </h3>
                  <p className="mt-2 text-sm font-semibold text-muted-foreground">
                    {comp.years}
                  </p>
                </article>
              </StaggerItem>
            ))}
          </div>
        </StaggerGroup>
      </div>
    </section>
  );
}
