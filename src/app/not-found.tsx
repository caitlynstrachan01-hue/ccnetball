import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";

export default function NotFound() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-40 size-[36rem] rounded-full bg-[var(--brand-coral)]/30 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 size-[36rem] rounded-full bg-[var(--brand-raspberry)]/20 blur-[120px]" />
      </div>

      <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 py-24 text-center lg:px-10">
        <p className="font-display text-[10rem] font-extrabold leading-none gradient-text md:text-[14rem]">
          404
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-5xl">
          That page is off court.
        </h1>
        <p className="mt-4 max-w-md text-lg text-muted-foreground">
          The page you&apos;re looking for has either moved or never existed.
          Let&apos;s get you back to where the action is.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:scale-[1.02]"
          >
            <Home className="size-4" />
            Back to home
          </Link>
          <Link
            href="/programs"
            className="inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-card px-6 py-3 text-base font-semibold text-foreground transition hover:border-primary/40 hover:bg-muted"
          >
            See programs
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
