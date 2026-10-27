import Image from "next/image";
import { Reveal } from "@/components/motion";

export const metadata = {
  title: "About Caitlyn Strachan — Australian Diamond and Elite Netball Coach",
  description:
    "Meet Caitlyn Strachan, founder of CC Netball — former Australian Diamond, triple ANZ Championship premiership winner, Queensland State Selector, Elite Accredited Netball Coach, and Queensland Firebirds Reserves Head Coach in 2027.",
  alternates: { canonical: "https://ccnetball.com/about" },
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
                Former Australian Diamond. Triple ANZ Championship premiership
                winner. Queensland State Netball Team Selector. Elite Netball
                Accreditation. Queensland Firebirds Reserves Head Coach (2027).
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
        <div className="mx-auto max-w-3xl px-6 lg:px-10">
          <Reveal as="article">
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
                She stepped away from playing in 2020 and immediately
                turned the lens. Today she coaches developing athletes across
                Australia, designing the kind of training programs she
                wishes she&apos;d had on her own way up.
              </p>
              <p>
                Caitlyn holds her Elite Netball Accreditation, is a Queensland
                State Netball Team Selector, and in 2027 steps in as Queensland
                Firebirds Reserves Head Coach. Alongside her in-person coaching
                across Australia, she&apos;s built CC Netball into a complete
                platform — video game analysis for athletes anywhere, the
                Netball Drills Library, the Competition Builder for
                associations, and the Netball Shop. The long-term goal:
                coaching in the Suncorp Super Netball competition.
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
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
