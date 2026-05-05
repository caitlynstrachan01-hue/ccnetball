import { MapPin } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { SITE } from "@/lib/site-content";
import { Reveal } from "@/components/motion";
import { InstagramIcon, FacebookIcon } from "@/components/social-icons";

export const metadata = {
  title: "Contact",
  description:
    "Coaching enquiries, team bookings, or general questions. Reply within one business day.",
};

export default function ContactPage() {
  return (
    <>
      <section className="border-b border-border/60 bg-card">
        <div className="mx-auto max-w-4xl px-6 py-20 lg:px-10 lg:py-24">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Contact
            </p>
            <h1 className="mt-3 font-display text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              Let&apos;s <span className="gradient-text">talk netball</span>.
            </h1>
            <p className="mt-6 max-w-2xl text-xl text-muted-foreground">
              Coaching enquiries, team bookings, or general questions. Drop a
              message and Caitlyn will get back to you within one business
              day.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 lg:grid-cols-3 lg:px-10">
          <Reveal className="space-y-6 lg:col-span-1">
            <div className="rounded-2xl bg-secondary p-6 text-secondary-foreground">
              <MapPin className="size-6 text-[color:var(--brand-coral)]" />
              <h3 className="mt-4 font-display text-lg font-bold leading-snug">
                Based in South East Queensland (QLD)
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/80">
                Offering coaching across QLD, NSW, VIC, and anywhere online.
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card p-6">
              <div className="flex items-center gap-2 text-primary">
                <InstagramIcon className="size-5" />
                <FacebookIcon className="size-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold">
                Follow us
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Behind-the-scenes coaching, athlete spotlights and updates.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold">
                <a
                  href={SITE.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-primary transition hover:bg-primary hover:text-primary-foreground"
                >
                  <InstagramIcon className="size-4" /> Instagram
                </a>
                <a
                  href={SITE.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-primary transition hover:bg-primary hover:text-primary-foreground"
                >
                  <FacebookIcon className="size-4" /> Facebook
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="lg:col-span-2">
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
