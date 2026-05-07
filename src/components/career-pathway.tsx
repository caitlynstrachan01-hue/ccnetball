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
      className="relative overflow-hidden border-y border-border/60 bg-card py-8 md:py-10"
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-20 right-[-15%] size-[16rem] rounded-full bg-[var(--brand-coral)]/20 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        <Reveal className="text-center">
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-primary">
            Athlete pathway
          </p>
          <h2 className="mt-1 font-display text-base font-bold tracking-tight md:text-lg">
            Every level, in order.
          </h2>
        </Reveal>

        <StaggerGroup className="mt-5 space-y-2" staggerChildren={0.04}>
          {CAREER_PATHWAY.map((tier, i) => {
            const Icon = ICONS[i] ?? Award;
            const isPrimary = tier.tier === "primary";
            const isSecondary = tier.tier === "secondary";

            const cardClass = isPrimary
              ? "group relative overflow-hidden rounded-lg bg-gradient-to-r from-[var(--brand-raspberry)] to-[var(--brand-coral)] p-3 text-primary-foreground shadow-sm shadow-primary/15 ring-1 ring-white/15"
              : isSecondary
                ? "group relative overflow-hidden rounded-lg bg-secondary p-3 text-secondary-foreground shadow-sm shadow-primary/10 ring-1 ring-white/10"
                : "group relative rounded-lg bg-background p-3 ring-1 ring-border transition hover:ring-primary/40";

            const iconBox = isPrimary
              ? "bg-white/15 text-white"
              : isSecondary
                ? "bg-[var(--brand-coral)]/20 text-[color:var(--brand-coral)]"
                : "bg-primary/10 text-primary";

            const eyebrowText = isPrimary
              ? "text-white/85"
              : isSecondary
                ? "text-[color:var(--brand-coral)]"
                : "text-primary";

            const chipClass = isPrimary
              ? "bg-white/15 text-white"
              : isSecondary
                ? "bg-white/10 text-white"
                : "bg-primary/10 text-primary";

            return (
              <StaggerItem key={tier.step}>
                <article className={cardClass}>
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-md ${iconBox}`}
                    >
                      <Icon className="size-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <p
                          className={`text-[9px] font-bold uppercase tracking-[0.18em] ${eyebrowText}`}
                        >
                          {tier.eyebrow}
                        </p>
                        <h3 className="font-display text-sm font-extrabold leading-tight tracking-tight md:text-[15px]">
                          {tier.competition}
                        </h3>
                      </div>

                      {tier.teams.length > 0 && (
                        <ul className="mt-1.5 flex flex-wrap gap-1">
                          {tier.teams.map((team) => (
                            <li
                              key={team}
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${chipClass}`}
                            >
                              {team}
                            </li>
                          ))}
                        </ul>
                      )}
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
