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
      className="relative overflow-hidden border-y border-border/60 bg-card py-12 md:py-16"
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-32 right-[-15%] size-[20rem] rounded-full bg-[var(--brand-coral)]/25 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] size-[20rem] rounded-full bg-[var(--brand-raspberry)]/12 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-4xl px-6 lg:px-10">
        <Reveal className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
            The full pathway
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">
            Every level of Australian netball,{" "}
            <span className="gradient-text">in order</span>.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground md:text-base">
            From junior nationals to the green and gold.
          </p>
        </Reveal>

        <StaggerGroup className="mt-8 space-y-3" staggerChildren={0.06}>
          {CAREER_PATHWAY.map((tier, i) => {
            const Icon = ICONS[i] ?? Award;
            const isPrimary = tier.tier === "primary";
            const isSecondary = tier.tier === "secondary";
            const onDark = isPrimary || isSecondary;

            const cardClass = isPrimary
              ? "group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--brand-raspberry)] via-[var(--brand-raspberry)] to-[var(--brand-coral)] p-5 text-primary-foreground shadow-lg shadow-primary/20 ring-1 ring-white/15"
              : isSecondary
                ? "group relative overflow-hidden rounded-2xl bg-secondary p-5 text-secondary-foreground shadow-md shadow-primary/10 ring-1 ring-white/10"
                : "group relative rounded-2xl bg-background p-5 ring-1 ring-border transition hover:ring-primary/40 hover:shadow-md hover:shadow-primary/5";

            const iconBox = isPrimary
              ? "bg-white/15 text-white ring-white/30"
              : isSecondary
                ? "bg-[var(--brand-coral)]/20 text-[color:var(--brand-coral)] ring-[var(--brand-coral)]/30"
                : "bg-primary/10 text-primary ring-primary/20";

            const stepText = isPrimary
              ? "text-white/60"
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
                    <div className="absolute -top-8 -right-8 size-32 rounded-full bg-white/15 blur-2xl" />
                  )}

                  <div className="relative flex items-start gap-4">
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-lg ring-1 ${iconBox}`}
                    >
                      <Icon className="size-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-[10px] font-bold uppercase tracking-[0.2em] ${eyebrowText}`}
                        >
                          {tier.eyebrow}
                        </p>
                        <span className={`text-xs font-bold ${stepText}`}>
                          · {tier.step}
                        </span>
                      </div>
                      <h3 className="mt-1 font-display text-lg font-extrabold leading-tight tracking-tight md:text-xl">
                        {tier.competition}
                      </h3>

                      {tier.teams.length > 0 && (
                        <ul className="mt-2 flex flex-wrap gap-1.5">
                          {tier.teams.map((team) => (
                            <li
                              key={team}
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${chipClass}`}
                            >
                              {team}
                            </li>
                          ))}
                        </ul>
                      )}

                      <p className={`mt-2 text-xs leading-relaxed md:text-sm ${detailText}`}>
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
