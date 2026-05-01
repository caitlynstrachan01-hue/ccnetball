import Link from "next/link";
import { ArrowRight, Trophy, Award, Sparkles, MapPin } from "lucide-react";
import { CREDENTIALS } from "@/lib/site-content";

export const metadata = {
  title: "About Caitlyn Strachan",
  description:
    "Former Australian Diamond and triple premiership winner Caitlyn Strachan now coaches the next generation of netball talent across Australia.",
};

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-border/60 bg-card">
        <div className="mx-auto max-w-4xl px-6 py-20 lg:px-10 lg:py-28">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            About the Coach
          </p>
          <h1 className="mt-3 font-display text-5xl font-extrabold leading-tight tracking-tight md:text-6xl">
            Meet <span className="gradient-text">Caitlyn Strachan</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-xl text-muted-foreground">
            Former Australian Diamond. Triple premiership winner. Now coaching
            the next generation of elite netball talent.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-3 lg:px-10">
          <article className="prose prose-lg max-w-none lg:col-span-2">
            <div className="space-y-6 text-lg leading-relaxed text-foreground/90">
              <p>
                Caitlyn grew up in Echuca, Victoria, and worked her way through
                every layer of Australian netball — Northern Zone Academy,
                underage state teams, the Australian Netball Championship and
                Super Netball League — before pulling on the green and gold for
                the Diamonds.
              </p>
              <p>
                Her path wasn't a straight line. An ACL injury and a league
                restructure delayed her elite selection. The setback became the
                story: through years of methodical rebuild and unrelenting work
                ethic, Caitlyn earned her debut against the Silver Ferns in 2017
                — becoming the second-oldest player in Diamonds history to make
                her debut.
              </p>
              <p>
                Across her career she lifted three premierships with the
                Melbourne Vixens and Queensland Firebirds, learning the game
                inside the highest-performing programs in the country.
              </p>
              <p>
                She retired from elite competition in 2020 — and immediately
                turned the lens. Today she coaches developing athletes across
                Australia, designing the kind of training programs she wishes
                she'd had on her own way up.
              </p>
              <p>
                Caitlyn is currently completing her elite coaching
                accreditation, with a clear long-term goal: to coach in the
                Suncorp Super Netball competition.
              </p>

              <blockquote className="!my-10 rounded-2xl border-l-4 border-primary bg-muted/60 p-6 not-italic text-foreground">
                <p className="font-display text-xl font-semibold leading-snug">
                  &ldquo;Netball is my passion. We are forever students of the
                  game — regardless of experience level. Opportunities to
                  learn, grow and improve always exist.&rdquo;
                </p>
                <footer className="mt-4 text-sm font-medium text-muted-foreground">
                  — Caitlyn Strachan
                </footer>
              </blockquote>

              <h2 className="font-display text-3xl font-bold tracking-tight">
                Coaching philosophy
              </h2>
              <p>
                Every athlete is different. Every session is built around the
                player in front of her. Caitlyn creates a safe, positive
                training environment that empowers athletes to grow with
                confidence, self-reliance and critical thinking on court.
              </p>
              <p>
                Her programs are <strong>fun, challenging and personalised</strong>
                . Whether you're chasing a rep selection or learning the basics,
                you'll get coaching that meets you where you are — and pulls you
                forward.
              </p>
            </div>

            <div className="mt-10">
              <Link
                href="/book"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:scale-[1.02]"
              >
                Train with Caitlyn <ArrowRight className="size-4" />
              </Link>
            </div>
          </article>

          <aside className="space-y-4 lg:col-span-1">
            <div className="rounded-2xl bg-secondary p-6 text-secondary-foreground">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider">
                Career highlights
              </h3>
              <ul className="mt-4 space-y-4">
                {CREDENTIALS.map((c, i) => (
                  <li key={c.label} className="flex items-start gap-3">
                    <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[color:var(--brand-coral)]">
                      {i === 0 && <Award className="size-4" />}
                      {i === 1 && <Trophy className="size-4" />}
                      {i === 2 && <Sparkles className="size-4" />}
                      {i === 3 && <MapPin className="size-4" />}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{c.label}</p>
                      <p className="text-xs text-white/70">{c.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card p-6">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-primary">
                Quick facts
              </h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Hometown</dt>
                  <dd className="font-semibold">Echuca, VIC</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Diamond debut</dt>
                  <dd className="font-semibold">29 Jan 2017</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Clubs</dt>
                  <dd className="font-semibold text-right">Vixens, Firebirds</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Premierships</dt>
                  <dd className="font-semibold">3</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Retired</dt>
                  <dd className="font-semibold">2020</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
