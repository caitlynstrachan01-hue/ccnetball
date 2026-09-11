import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";
import { Reveal } from "@/components/motion";

export const metadata = {
  title: "Sign in",
  description:
    "Sign in to CC Netball to access your subscriptions and coaching apps.",
};

export default function LoginPage() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-40 size-[35rem] rounded-full bg-[var(--brand-coral)]/25 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 size-[35rem] rounded-full bg-[var(--brand-raspberry)]/20 blur-[120px]" />
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-lg flex-col justify-center px-6 py-20 lg:px-10">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Sign in
          </p>
          <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
            Welcome <span className="gradient-text">back</span>.
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            Type your email and we&apos;ll send you a link to sign in — no
            password required.
          </p>
        </Reveal>

        <Reveal delay={0.05} className="mt-8">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </Reveal>
      </div>
    </section>
  );
}
