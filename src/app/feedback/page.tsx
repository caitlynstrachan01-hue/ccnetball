import { Reveal } from "@/components/motion";
import { FeedbackForm } from "@/components/feedback-form";

export const metadata = {
  title: "Session Feedback",
  description:
    "Share your feedback after a CCNetball session. Two minutes helps Caitlyn make every session better.",
};

export default function FeedbackPage() {
  return (
    <>
      <section className="border-b border-border/60 bg-card">
        <div className="mx-auto max-w-4xl px-6 py-20 lg:px-10 lg:py-24">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Session feedback
            </p>
            <h1 className="mt-3 font-display text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              Tell us how <span className="gradient-text">it went</span>.
            </h1>
            <p className="mt-6 max-w-2xl text-xl text-muted-foreground">
              Two minutes of your time helps Caitlyn make every session better.
              Star ratings: 1 = poor, 5 = excellent.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-6 lg:px-10">
          <Reveal>
            <FeedbackForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
