import { notFound } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { Reveal } from "@/components/motion";
import { getTrialBySlug } from "@/lib/trials.server";
import { RegistrationForm } from "./registration-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const trial = await getTrialBySlug(slug);
  return {
    title: trial ? `Register — ${trial.name}` : "Trial registration",
    description: trial
      ? `Register for ${trial.name} with ${trial.club}.`
      : undefined,
    robots: { index: false, follow: false },
  };
}

export default async function TrialRegistrationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const trial = await getTrialBySlug(slug);
  if (!trial) notFound();

  const open =
    trial.registrationOpen &&
    trial.status === "open" &&
    trial.divisions.length > 0;

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 -right-40 size-[35rem] rounded-full bg-[var(--brand-coral)]/25 blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 size-[35rem] rounded-full bg-[var(--brand-raspberry)]/20 blur-[120px]" />
        </div>
        <div className="mx-auto max-w-4xl px-6 py-14 lg:px-10 lg:py-16">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <CalendarDays className="size-3.5" />
              Trial registration
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">
              {trial.name}
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              {trial.club}
            </p>
          </Reveal>
        </div>
      </section>

      {/* FORM */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          {open ? (
            <RegistrationForm trial={trial} />
          ) : (
            <div className="mx-auto max-w-xl rounded-3xl border border-border/70 bg-card p-10 text-center">
              <h2 className="font-display text-xl font-bold">
                Registration isn&apos;t open right now
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                This trial isn&apos;t accepting registrations at the moment.
                Please check with {trial.club}.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
