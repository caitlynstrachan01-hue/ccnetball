type Program = {
  key: string;
  type: "6-Week Program" | "Shooting Program";
  ageLabel: string;
  ageSub: string;
  short: string;
  priceLabel: string;
  learnings?: string[];
  isShooting?: boolean;
};

const PROGRAMS: Program[] = [
  {
    key: "6w-u5-u6",
    type: "6-Week Program",
    ageLabel: "Under 5 – Under 6",
    ageSub: "years",
    short: "U5 – U6",
    priceLabel: "$39",
    learnings: [
      "Ball work",
      "Pivoting",
      "Basic defence concepts",
      "Basic shooting concepts",
    ],
  },
  {
    key: "6w-u7-u8",
    type: "6-Week Program",
    ageLabel: "Under 7 – Under 8",
    ageSub: "years",
    short: "U7 – U8",
    priceLabel: "$39",
    learnings: ["General attack", "Defence", "Passing skills"],
  },
  {
    key: "6w-u9-u10",
    type: "6-Week Program",
    ageLabel: "Under 9 – Under 10",
    ageSub: "years",
    short: "U9 – U10",
    priceLabel: "$39",
  },
  {
    key: "6w-u11-u12",
    type: "6-Week Program",
    ageLabel: "Under 11 – Under 12",
    ageSub: "years",
    short: "U11 – U12",
    priceLabel: "$39",
  },
  {
    key: "6w-u13-u15",
    type: "6-Week Program",
    ageLabel: "Under 13 – Under 15",
    ageSub: "years",
    short: "U13 – U15",
    priceLabel: "$39",
  },
  {
    key: "sh-u10-u12",
    type: "Shooting Program",
    ageLabel: "Under 10 – Under 12",
    ageSub: "years",
    short: "U10 – U12",
    priceLabel: "$39",
    isShooting: true,
  },
  {
    key: "sh-u13-open",
    type: "Shooting Program",
    ageLabel: "Under 13 – Open",
    ageSub: "age",
    short: "U13 – Open",
    priceLabel: "$39",
    isShooting: true,
  },
];

export function CoachingProgramsGrid() {
  return (
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {PROGRAMS.map((p) => (
        <article
          key={p.key}
          tabIndex={0}
          className="group relative aspect-[4/5] cursor-pointer overflow-hidden rounded-2xl border border-border/70 bg-card transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div
            className={`absolute inset-0 flex items-center justify-center p-3 text-center ${
              p.isShooting
                ? "bg-gradient-to-br from-[#1A0E14] to-[var(--brand-raspberry)]"
                : "bg-gradient-to-br from-primary via-[var(--brand-raspberry)] to-[var(--brand-coral)]"
            }`}
          >
            <div className="font-display text-[22px] font-black leading-none tracking-tight text-white">
              {p.short}
              <small className="mt-2 block font-sans text-[9px] font-semibold uppercase tracking-[0.14em] opacity-85">
                {p.type}
              </small>
            </div>
          </div>

          {p.isShooting && (
            <span className="absolute left-2.5 top-2.5 z-30 rounded-md bg-white px-2 py-0.5 text-[9px] font-extrabold tracking-[0.12em] text-[var(--brand-raspberry)] shadow-md">
              SHOOTING
            </span>
          )}

          <span className="pointer-events-none absolute -right-1.5 top-3.5 z-40 rotate-[8deg] rounded-md bg-red-600 px-3 py-1.5 font-display text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-lg ring-2 ring-red-600/20">
            Coming soon
          </span>

          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/95 via-black/70 to-transparent px-3 pb-3 pt-2.5 text-white">
            <div className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.14em] opacity-85">
              {p.type}
            </div>
            <h3 className="font-display text-sm font-extrabold leading-tight">
              {p.ageLabel}
              <span className="mt-0.5 block font-sans text-[11px] font-semibold opacity-90">
                {p.ageSub}
              </span>
            </h3>
            <div className="absolute bottom-3 right-3 font-display text-base font-black">
              {p.priceLabel}
            </div>
          </div>

          <div className="absolute inset-0 z-20 flex translate-y-full flex-col gap-1.5 bg-gradient-to-br from-[var(--brand-raspberry)] to-primary p-3.5 text-white transition-transform duration-300 ease-out group-hover:translate-y-0 group-focus-within:translate-y-0">
            <div className="text-[9px] font-bold uppercase tracking-[0.14em] opacity-85">
              In this program
            </div>
            <h4 className="mb-0.5 font-display text-sm font-extrabold leading-tight">
              {p.ageLabel} {p.ageSub}
            </h4>
            {p.learnings ? (
              <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
                {p.learnings.map((l) => (
                  <li
                    key={l}
                    className="relative pl-3 text-[11px] leading-snug before:absolute before:left-0 before:top-[6px] before:h-[5px] before:w-[5px] before:rounded-full before:bg-white"
                  >
                    {l}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-[11px] italic opacity-90">
                Key focus areas to be released.
              </p>
            )}
            <span className="mt-auto inline-flex w-fit items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-primary">
              Notify me when ready
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
