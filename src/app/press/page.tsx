import { ArrowRight, Sparkles } from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion";
import { PRESS_ITEMS, PRESS_LOGOS } from "@/lib/press";

export const metadata = {
  title: "Press & Media — Caitlyn Strachan",
  description:
    "Articles, interviews and features covering Caitlyn Strachan's playing career with the Diamonds, Vixens and Firebirds, her coaching work, and the CC Netball platform.",
  alternates: { canonical: "https://ccnetball.com/press" },
};

export default function PressPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/60 bg-card">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 -left-40 size-[32rem] rounded-full bg-primary/15 blur-[120px]" />
          <div className="absolute -bottom-40 -right-40 size-[36rem] rounded-full bg-[var(--brand-coral)]/25 blur-[120px]" />
        </div>
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-10 lg:py-28">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Sparkles className="size-3.5" />
              In the media
            </div>
            <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              Caitlyn in the <span className="gradient-text">press</span>.
            </h1>
            <p className="mt-6 max-w-2xl text-xl text-muted-foreground">
              A collection of the articles, interviews and features that have
              covered Caitlyn&apos;s playing career with the Diamonds, Vixens
              and Firebirds, her coaching work, and the CC Netball platform.
            </p>
          </Reveal>
        </div>
      </section>

      {/* AS FEATURED IN */}
      <section className="border-b border-border/60 bg-muted/40 py-10">
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <p className="text-center text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            As featured in
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {PRESS_LOGOS.map((logo) => (
              <span
                key={logo}
                className="font-display text-sm font-extrabold text-foreground/70"
              >
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* PRESS LIST */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-5xl px-6 lg:px-10">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Features &amp; articles
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
              Latest coverage.
            </h2>
          </Reveal>

          <StaggerGroup className="mt-10 flex flex-col gap-5">
            {PRESS_ITEMS.map((item) => (
              <StaggerItem key={item.id}>
                <article className="grid gap-6 rounded-2xl border border-border/70 bg-card p-6 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 md:grid-cols-[200px_1fr] md:gap-8 md:p-7">
                  <div className="flex flex-col gap-2">
                    <div className="font-display text-sm font-extrabold leading-tight text-primary">
                      {item.source}
                    </div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                      {item.date}
                    </div>
                    <span className="inline-flex self-start rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                      {item.tag}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-extrabold leading-snug md:text-xl">
                      {item.headline}
                    </h3>
                    {item.quote && (
                      <blockquote className="mt-3 border-l-2 border-[color:var(--brand-coral)] pl-4 text-sm italic text-foreground/90 md:text-base">
                        &ldquo;{item.quote}&rdquo;
                        {item.attribution && (
                          <span className="mt-2 block text-xs font-medium not-italic text-muted-foreground">
                            — {item.attribution}
                          </span>
                        )}
                      </blockquote>
                    )}
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
                    >
                      {item.linkLabel} <ArrowRight className="size-3.5" />
                    </a>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[color:var(--brand-raspberry)] to-[color:var(--brand-coral)] py-16 text-white">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-10">
          <Reveal>
            <h2 className="font-display text-3xl font-extrabold leading-tight tracking-tight md:text-4xl">
              Media &amp; interview enquiries.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base opacity-90 md:text-lg">
              Available for coaching features, athlete development pieces,
              Super Netball commentary and podcast appearances.
            </p>
            <a
              href="/contact"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-bold text-primary transition hover:scale-[1.02]"
            >
              Get in touch <ArrowRight className="size-4" />
            </a>
          </Reveal>
        </div>
      </section>
    </>
  );
}
