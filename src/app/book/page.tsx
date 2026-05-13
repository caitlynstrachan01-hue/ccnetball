import Link from "next/link";
import { ArrowRight, Check, MapPin, Plane, Laptop } from "lucide-react";
import { Reveal } from "@/components/motion";
import { CalEmbed } from "@/components/cal-embed";
import { BookingForm } from "@/components/booking-form";

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
              Pick the program, choose a time, and lock it in.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-border/60 bg-background">
        <div className="mx-auto grid max-w-6xl gap-4 px-6 py-8 sm:grid-cols-3 lg:px-10">
          <Reveal className="flex items-start gap-4 rounded-2xl border border-border/70 bg-card p-5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MapPin className="size-5" />
            </div>
            <div>
              <p className="font-display text-sm font-bold">Based in Brisbane</p>
              <p className="mt-0.5 text-sm text-muted-foreground">QLD home base for 1-on-1 and small group sessions.</p>
            </div>
          </Reveal>
          <Reveal delay={0.06} className="flex items-start gap-4 rounded-2xl border border-border/70 bg-card p-5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Plane className="size-5" />
            </div>
            <div>
              <p className="font-display text-sm font-bold">Across Australia</p>
              <p className="mt-0.5 text-sm text-muted-foreground">Caitlyn travels Australia-wide for team and clinic bookings.</p>
            </div>
          </Reveal>
          <Reveal delay={0.12} className="flex items-start gap-4 rounded-2xl border border-border/70 bg-card p-5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Laptop className="size-5" />
            </div>
            <div>
              <p className="font-display text-sm font-bold">Online from anywhere</p>
              <p className="mt-0.5 text-sm text-muted-foreground">Mentoring and video analysis run from any postcode.</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-12 lg:gap-10 lg:px-10">
          {/* Booking widget — hero on the left, takes 8/12 cols on desktop */}
          <Reveal className="lg:col-span-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Step 1 — pick a time
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">
              Book a time
            </h2>
            <p className="mt-3 text-xs italic leading-relaxed text-muted-foreground">
              Please note: the booking time and location is not guaranteed upon
              selection. A confirmation email will be supplied once the session
              time and location is locked in. Payment is required 48 hours prior
              to the session.
            </p>
            <div className="mt-6 h-[680px]">
              <CalEmbed />
            </div>
          </Reveal>

          {/* What to expect — sits next to Book a time on desktop, stacks below on mobile */}
          <Reveal delay={0.08} className="lg:col-span-4">
            <h2 className="font-display text-2xl font-bold tracking-tight">
              What to expect
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              What every session looks like, regardless of program.
            </p>
            <ul className="mt-6 space-y-3 rounded-2xl border border-border/70 bg-card p-6">
              {[
                "A program designed around you, not a template",
                "Direct coaching from a former Australian Diamond",
                "Sharp, demanding, and genuinely fun",
                "Clear takeaways and homework after every session",
                "Flexible booking across Australia or online",
                "All ages and skill levels, juniors to opens",
              ].map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm leading-snug">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Athlete intake form — collects everything Caitlyn needs once a time is picked */}
      <section className="border-t border-border/60 bg-background py-16">
        <div className="mx-auto max-w-4xl px-6 lg:px-10">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Step 2 — athlete details
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
              Tell Caitlyn about your athlete
            </h2>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground">
              Once you&apos;ve picked a time above, fill this in so Caitlyn has
              everything she needs to make the session count.
            </p>
          </Reveal>
          <Reveal delay={0.08} className="mt-8">
            <BookingForm />
          </Reveal>
        </div>
      </section>

      {/* Program enquiry — single simplified CTA below the booking + what to expect */}
      <section className="bg-muted/40 py-16">
        <div className="mx-auto max-w-4xl px-6 lg:px-10">
          <Reveal>
            <div className="rounded-3xl bg-card p-8 ring-1 ring-border md:p-10">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-10">
                <div className="md:max-w-2xl">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                    Program enquiry
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">
                    Want to chat about a program first?
                  </h2>
                  <p className="mt-3 text-base text-muted-foreground">
                    Send Caitlyn an enquiry and pick the program (1-on-1,
                    small group, team training, video analysis, online
                    mentoring or coach development) on the next page. Reply
                    within one business day.
                  </p>
                </div>

                <Link
                  href="/contact"
                  className="group inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] hover:bg-[var(--brand-raspberry-dark)] md:self-auto"
                >
                  Start an enquiry
                  <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
