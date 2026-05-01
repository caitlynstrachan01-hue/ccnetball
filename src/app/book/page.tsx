import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { PROGRAMS } from "@/lib/site-content";
import { Reveal } from "@/components/motion";

export const metadata = {
  title: "Book a Session",
  description:
    "Book your CCNetball coaching session. 1-on-1, small group, team training, video analysis or online mentoring with Caitlyn Strachan.",
};

export default function BookPage() {
  return (
    <>
      <section className="border-b border-border/60 bg-card">
        <div className="mx-auto max-w-4xl px-6 py-20 lg:px-10 lg:py-24">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Book a session
            </p>
            <h1 className="mt-3 font-display text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              Train with a <span className="gradient-text">Diamond</span>.
            </h1>
            <p className="mt-6 max-w-2xl text-xl text-muted-foreground">
              Pick the program, choose a time, and lock it in. Sessions run
              across Australia and online.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6 lg:px-10">
          <Reveal>
            <h2 className="font-display text-2xl font-bold tracking-tight">
              Pick a program to book
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {PROGRAMS.map((program) => (
                <Link
                  key={program.id}
                  href={`/contact?program=${encodeURIComponent(program.name)}`}
                  className="group flex items-center justify-between rounded-2xl border border-border/70 bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
                >
                  <div>
                    <h3 className="font-display text-lg font-bold">
                      {program.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      ${program.price} {program.unit} ·{" "}
                      {program.durationMinutes} min
                    </p>
                  </div>
                  <ArrowRight className="size-5 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-muted/40 py-16">
        <div className="mx-auto max-w-4xl px-6 lg:px-10">
          <Reveal>
            <div className="rounded-3xl border border-border/70 bg-card p-10">
              <h2 className="font-display text-2xl font-bold tracking-tight">
                What to expect
              </h2>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  "A program designed around you, not a template",
                  "Direct coaching from a former Australian Diamond",
                  "Sharp, demanding, and genuinely fun",
                  "Clear takeaways and homework after every session",
                  "Flexible booking across Australia or online",
                  "All ages and skill levels, juniors to opens",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-3 text-base">
                    <Check className="mt-1 size-5 shrink-0 text-primary" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
