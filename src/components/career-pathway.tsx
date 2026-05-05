import {
  Award,
  Flag,
  GraduationCap,
  Map,
  Sprout,
  Star,
  Target,
  Trophy,
} from "lucide-react";
import { CAREER_PATHWAY } from "@/lib/site-content";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion";

const ICONS = [Star, Flag, Trophy, Award, Target, Map, GraduationCap, Sprout];

export function CareerPathway() {
  return (
    <section
      aria-label="Career pathway"
      className="relative overflow-hidden border-y border-border/60 bg-card py-20 md:py-24"
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-32 right-[-15%] size-[28rem] rounded-full bg-[var(--brand-coral)]/30 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] size-[28rem] rounded-full bg-[var(--brand-raspberry)]/15 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-5xl px-6 lg:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            The full pathway
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
            Every level of Australian netball,{" "}
            <span className="gradient-text">in order</span>.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            From junior nationals to the green and gold. The pathway Caitlyn
            walked, and the one she now teaches to athletes climbing it.
          </p>
        </Reveal>

        <StaggerGroup
          className="relative mt-14 space-y-5"
          staggerChildren={0.1}
        >
          {/* Vertical connecting line */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-7 top-6 bottom-6 hidden w-px bg-gradient-to-b from-primary via-[var(--brand-coral)] to-primary/20 md:block"
          />

          {CAREER_PATHWAY.map((tier, i) => {
            const Icon = ICONS[i] ?? Award;
            const isPrimary = tier.tier === "primary";
            const isSecondary = tier.tier === "secondary";

            const cardClass = isPrimary
              ? "group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--brand-raspberry)] via-[var(--brand-raspberry)] to-[var(--brand-coral)] p-7 text-primary-foreground shadow-2xl shadow-primary/25 ring-1 ring-white/15 md:p-9"
              : isSecondary
                ? "group relative overflow-hidden rounded-3xl bg-secondary p-7 text-secondary-foreground shadow-xl shadow-primary/15 ring-1 ring-white/10 md:p-9"
                : "group relative rounded-3xl bg-background p-7 ring-1 ring-border transition hover:ring-primary/40 hover:shadow-xl hover:shadow-primary/5 md:p-9";

            const onDark = isPrimary || isSecondary;

            const iconBox = isPrimary
              ? "bg-white/15 text-white ring-white/30"
              : isSecondary
                ? "bg-[var(--brand-coral)]/20 text-[color:var(--brand-coral)] ring-[var(--brand-coral)]/30"
                : "bg-primary/10 text-primary ring-primary/20";

            const stepText = isPrimary
              ? "text-white/70"
              : isSecondary
                ? "text-white/40"
                : "text-primary/40";

            const eyebrowText = isPrimary
              ? "text-white/80"
              : isSecondary
                ? "text-[color:var(--brand-coral)]"
                : "text-primary";

            const chipClass = isPrimary
              ? "bg-white/15 text-white ring-1 ring-white/20"
              : isSecondary
                ? "bg-white/10 text-white ring-1 ring-white/15"
                : "bg-primary/10 text-primary";

            const detailText = onDark
              ? "text-white/85"
              : "text-muted-foreground";

            return (
              <StaggerItem key={tier.step}>
                <article className={cardClass}>
                  {isPrimary && (
                    <div className="absolute -top-12 -right-12 size-44 rounded-full bg-white/15 blur-2xl" />
                  )}

                  <div className="relative grid gap-6 md:grid-cols-[auto_1fr] md:items-start md:gap-8">
                    <div className="flex items-center gap-4 md:flex-col md:items-start md:gap-3">
                      <div
                        className={`relative flex size-14 shrink-0 items-center justify-center rounded-2xl ring-1 ${iconBox}`}
                      >
                        <Icon className="size-6" />
                      </div>
                      <p
                        className={`font-display text-xl font-extrabold leading-none md:text-2xl ${stepText}`}
                      >
                        {tier.step}
                      </p>
                    </div>

                    <div>
                      <p
                        className={`text-[10px] font-bold uppercase tracking-[0.22em] ${eyebrowText}`}
                      >
                        {tier.eyebrow}
                      </p>
                      <h3 className="mt-2 font-display text-2xl font-extrabold leading-tight tracking-tight md:text-[1.85rem]">
                        {tier.competition}
                      </h3>

                      {tier.teams.length > 0 && (
                        <ul className="mt-4 flex flex-wrap gap-2">
                          {tier.teams.map((team) => (
                            <li
                              key={team}
                              className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${chipClass}`}
                            >
                              {team}
                            </li>
                          ))}
                        </ul>
                      )}

                      <p
                        className={`mt-5 max-w-2xl text-sm leading-relaxed md:text-base ${detailText}`}
                      >
                        {tier.detail}
                      </p>
                    </div>
                  </div>
                </article>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}
