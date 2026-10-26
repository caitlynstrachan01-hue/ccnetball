import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Trophy } from "lucide-react";
import { Reveal } from "@/components/motion";
import {
  isCompetitionBuilderAccessAllowed,
  listMyCompetitions,
} from "@/lib/competition-builder.server";
import { NewCompetitionButton } from "@/components/competition-builder/new-competition-button";

export const metadata = {
  title: "Competition Builder",
  description:
    "Build your netball competition — courts, teams, rules, grading, and the full draw.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CompetitionBuilderPage() {
  const access = await isCompetitionBuilderAccessAllowed();
  if (!access.user) redirect("/login?next=/tools/competition-builder");

  const competitions = await listMyCompetitions();

  return (
    <section className="border-b border-border/60 bg-muted/30">
      <div className="mx-auto max-w-5xl px-6 py-10 lg:px-10 lg:py-14">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Tools
          </p>
          <div className="mt-2 flex flex-wrap items-start justify-between gap-6">
            <div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
                <span className="gradient-text">Competition Builder</span>
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                Build the full season fixture — courts, teams, grading rounds,
                an unlimited rules engine, and the draw. One licence per
                competition.
              </p>
            </div>
            <NewCompetitionButton
              hasLicence={access.unusedLicenceCount > 0 || access.isAdmin}
              isAdmin={access.isAdmin}
            />
          </div>
          {access.isAdmin && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-primary">
              <Trophy className="size-3.5" />
              Admin — unlimited competitions during build
            </div>
          )}
        </Reveal>

        <div className="mt-10">
          {competitions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/70 bg-card p-10 text-center">
              <Trophy className="mx-auto size-10 text-muted-foreground" />
              <p className="mt-4 font-display text-lg font-bold">
                No competitions yet.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Hit <strong>New competition</strong> above to start your first
                draw.
              </p>
            </div>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {competitions.map((comp) => {
                const start = new Date(comp.startDate).toLocaleDateString(
                  "en-AU",
                  { day: "numeric", month: "long", year: "numeric" },
                );
                return (
                  <li key={comp.id}>
                    <Link
                      href={`/tools/competition-builder/${comp.id}`}
                      className="group flex h-full flex-col rounded-2xl border border-border/70 bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
                    >
                      <p className="font-display text-lg font-bold">
                        {comp.name}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Starts {start}
                      </p>
                      <p className="mt-3 text-xs text-muted-foreground">
                        {comp.lockedAt
                          ? "Locked — fixture is live."
                          : "Draft — still editable."}
                      </p>
                      <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-primary transition group-hover:gap-2.5">
                        Open <ArrowRight className="size-3.5" />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
