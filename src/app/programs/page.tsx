import Link from "next/link";
import { ArrowRight, Check, Clock, Users, Star } from "lucide-react";
import { PROGRAMS } from "@/lib/site-content";

export const metadata = {
  title: "Programs",
  description:
    "Six tailored coaching programs from Coach Caitlyn — 1-on-1, small group, team, video analysis, online mentoring, and coach-the-coaches development.",
};

export default function ProgramsPage() {
  return (
    <>
      <section className="border-b border-border/60 bg-card">
        <div className="mx-auto max-w-4xl px-6 py-20 lg:px-10 lg:py-24">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Programs
          </p>
          <h1 className="mt-3 font-display text-5xl font-extrabold leading-tight tracking-tight md:text-6xl">
            Coaching built around{" "}
            <span className="gradient-text">your game.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-xl text-muted-foreground">
            Six programs covering individual technical work, small-group
            development, team systems, video analysis, online mentoring, and
            professional development for coaches. Every session is designed and
            delivered personally by Caitlyn.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl space-y-10 px-6 lg:px-10">
          {PROGRAMS.map((program) => (
            <article
              key={program.id}
              id={program.id}
              className="grid scroll-mt-24 gap-8 rounded-3xl border border-border/70 bg-card p-8 md:grid-cols-3 md:p-10"
            >
              <header className="md:col-span-1">
                <h2 className="font-display text-3xl font-bold leading-tight tracking-tight">
                  {program.name}
                </h2>
                <p className="mt-3 text-base text-muted-foreground">
                  {program.short}
                </p>
                <div className="mt-6 inline-flex items-baseline gap-1">
                  <span className="font-display text-4xl font-extrabold gradient-text">
                    ${program.price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {program.unit}
                  </span>
                </div>
              </header>

              <div className="md:col-span-2">
                <p className="text-base leading-relaxed text-foreground/90">
                  {program.description}
                </p>

                <dl className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="flex items-center gap-2 rounded-xl bg-muted px-4 py-3 text-sm">
                    <Clock className="size-4 text-primary" />
                    <span className="font-semibold">{program.durationMinutes} min</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-muted px-4 py-3 text-sm">
                    <Users className="size-4 text-primary" />
                    <span className="font-semibold">{program.capacity}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-muted px-4 py-3 text-sm">
                    <Star className="size-4 text-primary" />
                    <span className="font-semibold text-xs">{program.bestFor}</span>
                  </div>
                </dl>

                <Link
                  href="/book"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:scale-[1.02]"
                >
                  Book {program.name} <ArrowRight className="size-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-border/60 bg-muted/40 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-10">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Not sure which program fits?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Every athlete and team is different. Get in touch and Caitlyn will
            recommend the right fit based on your level, goals and timeline.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-secondary px-7 py-4 text-base font-semibold text-secondary-foreground transition hover:bg-primary"
            >
              Get a recommendation <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
