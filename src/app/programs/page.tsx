import Link from "next/link";
import { ArrowRight, Clock, Users, Star } from "lucide-react";
import { PROGRAMS } from "@/lib/site-content";
import { Reveal } from "@/components/motion";

export const metadata = {
  title: "Netball Coaching Programs — 1-on-1, team and video analysis",
  description:
    "Netball coaching programs delivered by former Australian Diamond Caitlyn Strachan: 1-on-1 training, small group, team training, video game analysis, online mentoring and coach development. Across Australia.",
  alternates: { canonical: "https://ccnetball.com/programs" },
};

const FAQS: { q: string; a: string }[] = [
  {
    q: "Who are your sessions for?",
    a: "Our programs cover club athletes through to representative, state pathway and premier league players, plus the coaches behind them. Each program lists who it suits best, so you can match your athlete to the right fit.",
  },
  {
    q: "How do I know which program is right for my child?",
    a: "As a general guide: 1-on-1 is for athletes targeting selection or working on specific gaps. Small group training suits friends or clubmates at the same level who want sharp coaching with squad energy. Team training installs structures across a whole squad. Video analysis is for players serious about self-review. If you're not sure, send an enquiry and I'll help you pick.",
  },
  {
    q: "Can my child train with a friend to split the cost?",
    a: "Yes. A 1-on-1 session can be booked as a 2-on-1 for the same session fee, so two athletes can share the cost. It's a popular option for siblings and close friends.",
  },
  {
    q: "What's the difference between video analysis and in-person coaching?",
    a: "In-person coaching builds skills on the court. Video analysis builds the eye for the game — I review your match footage frame-by-frame and send back positioning, decision-making and the exact corrections to work on. Many athletes use both.",
  },
  {
    q: "Do you work with regional athletes?",
    a: "Yes. Online Mentoring is the best option for regular touch points, however I do travel to various locations throughout Australia to also provide in-person coaching sessions.",
  },
  {
    q: "Do you offer coaching for coaches, not just players?",
    a: "Yes. The Coach the Coaches program is professional development for club, school and representative coaches — session design, drill libraries, athlete management, and the systems behind elite teams.",
  },
  {
    q: "Can parents watch during sessions?",
    a: "Yes absolutely — my preference is for parents to be present and watch quietly from the sideline.",
  },
  {
    q: "Where are sessions held, and do you travel?",
    a: "Sessions are most commonly held in South East Queensland. Feel free to send through an enquiry about a particular location.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export default function ProgramsPage() {
  return (
    <>
      <section className="border-b border-border/60 bg-card">
        <div className="mx-auto max-w-4xl px-6 py-20 lg:px-10 lg:py-24">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Programs
            </p>
            <h1 className="mt-3 font-display text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              Coaching built for{" "}
              <span className="gradient-text">your game</span>.
            </h1>
            <p className="mt-6 max-w-2xl text-xl text-muted-foreground">
              Six programs. Individual technical work, small-group development,
              team systems, video analysis, online mentoring, and coach
              development. Every session designed and delivered by Caitlyn.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl space-y-10 px-6 lg:px-10">
          {PROGRAMS.filter((p) => !p.hidden).map((program, i) => (
            <Reveal key={program.id} delay={i * 0.04}>
              <article
                id={program.id}
                className="grid scroll-mt-24 gap-8 rounded-3xl border border-border/70 bg-card p-8 transition hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 md:grid-cols-3 md:p-10"
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
                      <span className="font-semibold">
                        {program.durationMinutes} min
                      </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-muted px-4 py-3 text-sm">
                      <Users className="size-4 text-primary" />
                      <span className="font-semibold">
                        {program.capacity}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-muted px-4 py-3 text-xs">
                      <Star className="size-4 shrink-0 text-primary" />
                      <span className="font-semibold">
                        {program.bestFor}
                      </span>
                    </div>
                  </dl>

                  <Link
                    href={`/book?program=${program.id}`}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:scale-[1.02]"
                  >
                    Book {program.name} <ArrowRight className="size-4" />
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-border/60 bg-muted/40 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-10">
          <Reveal>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              Not sure which program fits?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Every athlete and team is different. Get in touch and Caitlyn
              will recommend the right fit based on your level, goals and
              timeline.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-secondary px-7 py-4 text-base font-semibold text-secondary-foreground transition hover:bg-primary"
              >
                Get a recommendation <ArrowRight className="size-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-border/60 py-20">
        <div className="mx-auto max-w-3xl px-6 lg:px-10">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              FAQs
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
              Common questions
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              If you don't see your question here, send an enquiry above and I'll
              get back to you personally.
            </p>
          </Reveal>

          <div className="mt-10 divide-y divide-border/70 rounded-2xl border border-border/70 bg-card">
            {FAQS.map((item, i) => (
              <Reveal key={item.q} delay={i * 0.03}>
                <details className="group px-6 py-5 open:bg-muted/30 md:px-8">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 font-display text-lg font-semibold tracking-tight text-foreground">
                    <span>{item.q}</span>
                    <span
                      aria-hidden
                      className="mt-1 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-4 text-base leading-relaxed text-foreground/85">
                    {item.a}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
  );
}
