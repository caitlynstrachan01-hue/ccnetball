import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { Reveal } from "@/components/motion";

export const metadata = {
  title: "Set your password",
  description: "Choose a new password for your CC Netball account.",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-40 size-[35rem] rounded-full bg-[var(--brand-coral)]/25 blur-[120px]" />
      </div>
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-lg flex-col justify-center px-6 py-20 lg:px-10">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Set your password
          </p>
          <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
            Choose a <span className="gradient-text">password</span>.
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            Enter a new password below. From then on you can sign in with just
            email and password — no more link juggling.
          </p>
        </Reveal>
        <Reveal delay={0.05} className="mt-8">
          <Suspense fallback={null}>
            <ResetPasswordForm />
          </Suspense>
        </Reveal>
      </div>
    </section>
  );
}
