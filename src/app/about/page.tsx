import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Trophy, Award, Sparkles, MapPin } from "lucide-react";
import { CREDENTIALS } from "@/lib/site-content";
import { Reveal } from "@/components/motion";
import { CareerPathway } from "@/components/career-pathway";

export const metadata = {
  title: "About Caitlyn Strachan",
  description:
    "Former Australian Diamond and triple premiership winner. Caitlyn Strachan now coaches the next generation of netball talent across Australia.",
};

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-border/60 bg-card">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-10 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                About the coach
              </p>
              <h1 className="mt-3 font-display text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
                Meet <span className="gradient-text">Caitlyn Strachan</span>.
              </h1>
              <p className="mt-6 max-w-2xl text-xl text-muted-foreground">
                Former Australian Diamond. Triple premiership winner. Now
                coaching the next generation.
              </p>
            </Reveal>

            <Reveal delay={0.1} className="lg:col-span-5">
              <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-3xl shadow-2xl shadow-primary/15 ring-1 ring-border lg:ml-auto">
                <Image
                  src="/gallery/09-firebirds-medal-portrait.jpg"
                  alt="Close-up portrait of Caitlyn Strachan smiling and holding up her ANZ Champions medal in a Firebirds polo"
                  fill
                  priority
                  sizes="(min-width: 1024px) 35vw, 100vw"
                  quality={95}
                  className="object-cover"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-3 lg:px-10">
          <Reveal as="article" className="lg:col-span-2">
            <div className="space-y-6 text-lg leading-relaxed text-foreground/90">
              <p>
                Caitlyn grew up in Echuca, Victoria, and worked her way
                through every level of Australian netball. Northern Zone
                Academy, underage state teams, the Australian Netball
                Championship, Super Netball League. Then the green and gold.
              </p>
              <p>
                Her path was not a straight line. An ACL injury and a league
                restructure delayed her elite selection. The setback became
                the story. Through years of methodical rebuild and consistent
                work, Caitlyn earned her debut against the Silver Ferns in
                2017, becoming the second-oldest player in Diamonds history
                to make her debut.
              </p>
              <p>
                Across her career she lifted three premierships with the
                Melbourne Vixens and Queensland Firebirds, learning the game
                inside the highest-performing programs in the country.
              </p>
              <p>
                She retired from elite competition in 2020 and immediately
                turned the lens. Today she coaches developing athletes across
                Australia, designing the kind of training programs she
                wishes she&apos;d had on her own way up.
              </p>
              <p>
                Caitlyn is currently completing her elite coaching
                accreditation, with a clear long-term goal: to coach in the
                Suncorp Super Netball competition.
              </p>

              <blockquote className="!my-10 rounded-2xl border-l-4 border-primary bg-muted/60 p-6 not-italic text-foreground">
                <p className="font-display text-xl font-semibold leading-snug">
                  &ldquo;Netball is my passion. We are forever students of
                  the game, regardless of experience level. Opportunities to
                  learn, grow and improve always exist.&rdquo;
                </p>
                <footer className="mt-4 text-sm font-medium text-muted-foreground">
                  Caitlyn Strachan
                </footer>
              </blockquote>

              <h2 className="font-display text-3xl font-bold tracking-tight">
                Coaching philosophy
              </h2>
              <p>
                Every athlete is different. Every session is built around
                the player in front of her. Caitlyn creates a safe, positive
                training environment that gives athletes the confidence,
                self-reliance and decision-making tools to think for
                themselves on court.
              </p>
              <p>
                Her programs are <strong>fun, challenging and personal</strong>.
                Whether you&apos;re chasing rep selection or learning the
                basics, you get coaching that meets you where you are and
                pulls you forward.
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
          </Reveal>

          <Reveal as="div" delay={0.1} className="space-y-4 lg:col-span-1">
            <div className="rounded-2xl bg-secondary p-6 text-secondary-foreground">
              <h3 className="font-display text-xs font-bold uppercase tracking-[0.18em]">
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

          </Reveal>
        </div>
      </section>

      <CareerPathway />
    </>
  );
}
