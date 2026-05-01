import { Mail, MapPin, MessageSquare } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { SITE } from "@/lib/site-content";

export const metadata = {
  title: "Contact",
  description:
    "Get in touch with CCNetball. Coaching enquiries, team bookings, or general questions — we reply within 24 hours.",
};

export default function ContactPage() {
  return (
    <>
      <section className="border-b border-border/60 bg-card">
        <div className="mx-auto max-w-4xl px-6 py-20 lg:px-10 lg:py-24">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Contact
          </p>
          <h1 className="mt-3 font-display text-5xl font-extrabold leading-tight tracking-tight md:text-6xl">
            Let's <span className="gradient-text">talk netball.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-xl text-muted-foreground">
            Coaching enquiries, team bookings, or general questions — drop a
            message and Caitlyn will get back to you within 24 hours.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 lg:grid-cols-3 lg:px-10">
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-2xl bg-secondary p-6 text-secondary-foreground">
              <Mail className="size-6 text-[color:var(--brand-coral)]" />
              <h3 className="mt-4 font-display text-lg font-bold">Email</h3>
              <p className="mt-1 text-sm text-white/70">
                We reply within one business day.
              </p>
              <a
                href={`mailto:${SITE.email}`}
                className="mt-3 inline-block text-sm font-semibold text-[color:var(--brand-coral)] hover:underline"
              >
                {SITE.email}
              </a>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card p-6">
              <MapPin className="size-6 text-primary" />
              <h3 className="mt-4 font-display text-lg font-bold">
                Coaching across
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Australia — VIC, QLD, NSW and online from anywhere.
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card p-6">
              <MessageSquare className="size-6 text-primary" />
              <h3 className="mt-4 font-display text-lg font-bold">DM us</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Quick questions? Slide into the DMs:
              </p>
              <a
                href={SITE.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm font-semibold text-primary hover:underline"
              >
                @coach_caitlyn
              </a>
            </div>
          </div>

          <div className="lg:col-span-2">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
