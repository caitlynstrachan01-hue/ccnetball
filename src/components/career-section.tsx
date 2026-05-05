import { Award, Star, Target, Trophy } from "lucide-react";
import { CAREER } from "@/lib/site-content";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion";

export function CareerSection() {
  return (
    <section
      aria-label="Inside the career"
      className="relative overflow-hidden border-y border-border/60 bg-background py-12 md:py-16"
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-32 right-[-10%] size-[24rem] rounded-full bg-[var(--brand-coral)]/25 blur-[120px]" />
        <div className="absolute -bottom-32 left-[-10%] size-[24rem] rounded-full bg-[var(--brand-raspberry)]/12 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
            Inside the career
          </p>
          <h2 className="mt-2 font-display text-xl font-bold tracking-tight md:text-2xl">
            From Country Victoria to the{" "}
            <span className="gradient-text">gold dress</span>.
          </h2>
        </Reveal>

        <StaggerGroup
          className="mt-8 grid gap-3 lg:grid-cols-12 lg:gap-4"
          staggerChildren={0.08}
        >
          {/* Diamonds hero card */}
          <StaggerItem className="lg:col-span-5">
            <article className="relative h-full overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--brand-raspberry)] via-[var(--brand-raspberry)] to-[var(--brand-coral)] p-5 text-primary-foreground shadow-lg shadow-primary/20 ring-1 ring-white/15 md:p-6">
              <div className="absolute -top-8 -right-8 size-32 rounded-full bg-white/15 blur-2xl" />

              <div className="relative flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                  <Star className="size-5 fill-white text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
                    {CAREER.international.eyebrow}
                  </p>
                  <h3 className="mt-0.5 font-display text-xl font-extrabold leading-tight tracking-tight md:text-2xl">
                    {CAREER.international.name}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-white/90 md:text-sm">
                    {CAREER.international.detail}
                  </p>
                </div>
                <Trophy className="hidden size-6 shrink-0 text-white/70 md:block" />
              </div>
            </article>
          </StaggerItem>

          {/* Clubs + Competitions grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:col-span-7 lg:gap-4">
            {CAREER.clubs.map((club) => (
              <StaggerItem key={club.name}>
                <article className="group flex h-full items-center gap-3 rounded-2xl bg-card p-4 ring-1 ring-border transition-all hover:-translate-y-0.5 hover:ring-primary/40 hover:shadow-md hover:shadow-primary/5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Award className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                      Club
                    </p>
                    <h3 className="mt-0.5 font-display text-base font-extrabold leading-tight tracking-tight md:text-lg">
                      {club.name}
                    </h3>
                    <p className="text-xs font-semibold text-muted-foreground">
                      {club.years}
                    </p>
                  </div>
                </article>
              </StaggerItem>
            ))}

            {CAREER.competitions.map((comp) => (
              <StaggerItem key={comp.name}>
                <article className="group flex h-full items-center gap-3 rounded-2xl bg-card p-4 ring-1 ring-border transition-all hover:-translate-y-0.5 hover:ring-primary/40 hover:shadow-md hover:shadow-primary/5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Target className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                      Competition
                    </p>
                    <h3 className="mt-0.5 font-display text-base font-extrabold leading-tight tracking-tight md:text-lg">
                      {comp.name}
                    </h3>
                    <p className="text-xs font-semibold text-muted-foreground">
                      {comp.years}
                    </p>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </div>
        </StaggerGroup>
      </div>
    </section>
  );
}
