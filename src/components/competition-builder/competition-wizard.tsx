"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Clock3, Lock, PanelRight } from "lucide-react";
import type {
  Competition,
  CompetitionCourt,
  CompetitionDivision,
  CompetitionTeam,
  CompetitionTimeslot,
} from "@/lib/competition-builder";
import { SetupStep } from "./setup-step";
import { TeamsStep } from "./teams-step";

type Step = {
  id: string;
  title: string;
  blurb: string;
  status: "done" | "available" | "coming-soon";
};

export function CompetitionWizard({
  competition,
  courts,
  timeslots,
  divisions,
  teams,
}: {
  competition: Competition;
  courts: CompetitionCourt[];
  timeslots: CompetitionTimeslot[];
  divisions: CompetitionDivision[];
  teams: CompetitionTeam[];
}) {
  const [activeStep, setActiveStep] = useState<string>("setup");

  const setupDone = courts.length > 0 && timeslots.length > 0;
  const teamsDone =
    teams.length > 0 &&
    divisions.length > 0 &&
    teams.every((t) => t.divisionId);
  const matchCellsPerRound = courts.length * timeslots.length;

  const steps: Step[] = useMemo(
    () => [
      {
        id: "setup",
        title: "1. Setup",
        blurb: "Name, start date, courts, timeslots",
        status: setupDone ? "done" : "available",
      },
      {
        id: "teams",
        title: "2. Teams & divisions",
        blurb: "Drag teams into divisions",
        status: teamsDone ? "done" : setupDone ? "available" : "coming-soon",
      },
      {
        id: "grading",
        title: "3. Grading rounds",
        blurb: "Choose weeks, shape each one, record results",
        status: "coming-soon",
      },
      {
        id: "rules",
        title: "4. Rules",
        blurb: "Unlimited plain-English constraints",
        status: "coming-soon",
      },
      {
        id: "draw",
        title: "5. The draw",
        blurb: "Generate the fixture, export to a spreadsheet",
        status: "coming-soon",
      },
    ],
    [setupDone, teamsDone],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="rounded-3xl border border-border/70 bg-card p-4">
        <p className="px-2 pb-2 text-xs font-bold uppercase tracking-[0.14em] text-primary">
          Steps
        </p>
        <ol className="space-y-1">
          {steps.map((step) => (
            <li key={step.id}>
              <button
                type="button"
                onClick={() =>
                  step.status !== "coming-soon" && setActiveStep(step.id)
                }
                aria-current={activeStep === step.id ? "step" : undefined}
                className={`flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition ${
                  activeStep === step.id
                    ? "bg-primary/10"
                    : step.status === "coming-soon"
                      ? "cursor-not-allowed opacity-60"
                      : "hover:bg-muted"
                }`}
              >
                <StepIcon status={step.status} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.blurb}</p>
                </div>
              </button>
            </li>
          ))}
        </ol>
      </aside>

      <main className="rounded-3xl border border-border/70 bg-card p-6 md:p-8">
        {activeStep === "setup" && (
          <SetupStep
            competition={competition}
            courts={courts}
            timeslots={timeslots}
          />
        )}
        {activeStep === "teams" && (
          <TeamsStep
            competitionId={competition.id}
            courts={courts}
            divisions={divisions}
            teams={teams}
            matchCellsPerRound={matchCellsPerRound}
          />
        )}
        {activeStep !== "setup" && activeStep !== "teams" && (
          <ComingSoon stepId={activeStep} />
        )}
      </main>
    </div>
  );
}

function StepIcon({ status }: { status: Step["status"] }) {
  if (status === "done")
    return (
      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
    );
  if (status === "available")
    return (
      <PanelRight className="mt-0.5 size-5 shrink-0 text-foreground/70" />
    );
  return <Lock className="mt-0.5 size-5 shrink-0 text-muted-foreground" />;
}

function ComingSoon({ stepId }: { stepId: string }) {
  const title =
    stepId === "teams"
      ? "Teams & divisions"
      : stepId === "grading"
        ? "Grading rounds"
        : stepId === "rules"
          ? "Rules"
          : "The draw";
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-muted/40 p-12 text-center">
      <Clock3 className="size-10 text-muted-foreground" />
      <h3 className="mt-4 font-display text-xl font-bold">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        This step is in build. Phase 1 is live now — Setup. Phases 2 & 3 land
        over the next session or two: drag-drop teams, grading engine, the
        rules engine, and fixture generation.
      </p>
    </div>
  );
}
