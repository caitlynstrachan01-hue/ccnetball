"use client";

import { RESULTS } from "@/lib/site-content";
import { AnimatedCounter } from "@/components/animated-counter";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion";

function parseValue(raw: string): { number: number | null; rest: string } {
  const match = raw.match(/^(\d+)(.*)$/);
  if (!match) return { number: null, rest: raw };
  return { number: Number(match[1]), rest: match[2] };
}

export function ResultsSection() {
  return (
    <section className="relative overflow-hidden bg-secondary py-24 text-secondary-foreground">
      <div className="absolute -top-40 right-1/3 size-[28rem] rounded-full bg-primary/30 blur-[120px]" />
      <div className="absolute -bottom-40 left-1/3 size-[28rem] rounded-full bg-[var(--brand-coral)]/25 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-coral)]">
            The receipts
          </p>
          <h2 className="mt-3 font-display text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
            Built on a career
            <br />
            most coaches only watch.
          </h2>
        </Reveal>

        <StaggerGroup
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          staggerChildren={0.1}
        >
          {RESULTS.map((r) => {
            const parsed = parseValue(r.value);
            return (
              <StaggerItem
                key={r.label}
                className="rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur transition hover:border-[color:var(--brand-coral)]/40 hover:bg-white/10"
              >
                <div className="font-display text-6xl font-extrabold tracking-tight text-white">
                  {parsed.number !== null ? (
                    <>
                      <AnimatedCounter to={parsed.number} />
                      <span>{parsed.rest}</span>
                      <span className="text-[color:var(--brand-coral)]">
                        {r.suffix}
                      </span>
                    </>
                  ) : (
                    <span>{r.value}</span>
                  )}
                </div>
                <p className="mt-4 font-display text-lg font-semibold text-white">
                  {r.label}
                </p>
                <p className="mt-1 text-sm text-white/60">{r.detail}</p>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}
