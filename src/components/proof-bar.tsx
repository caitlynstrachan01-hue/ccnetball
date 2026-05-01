import { PROOF_TEAMS } from "@/lib/site-content";

export function ProofBar() {
  return (
    <section
      aria-label="Career affiliations"
      className="border-y border-border/60 bg-card/60 backdrop-blur"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-6 py-7 lg:flex-row lg:gap-10 lg:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Career inside
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 lg:flex-1">
          {PROOF_TEAMS.map((team) => (
            <li
              key={team}
              className="font-display text-sm font-bold uppercase tracking-wider text-foreground/80 sm:text-base"
            >
              {team}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
