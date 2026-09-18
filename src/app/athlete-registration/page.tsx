import { BookingForm } from "@/components/booking-form";
import { Reveal } from "@/components/motion";

export const metadata = {
  title: "Athlete registration — CC Netball",
  description:
    "Registration form for CC Netball athletes — medical history, emergency contact and consent.",
  robots: { index: false, follow: false },
};

export default function AthleteRegistrationPage() {
  return (
    <>
      <section className="border-b border-border/60 bg-card">
        <div className="mx-auto max-w-4xl px-6 py-16 lg:px-10 lg:py-20">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Athlete registration
            </p>
            <h1 className="mt-3 font-display text-4xl font-extrabold leading-[1.05] tracking-tight md:text-5xl">
              Tell Caitlyn about your{" "}
              <span className="gradient-text">athlete</span>.
            </h1>
            <p className="mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
              Fill this in so Caitlyn has everything she needs — health,
              emergency contact and consent — before the session runs.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-4xl px-6 lg:px-10">
          <Reveal>
            <BookingForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
