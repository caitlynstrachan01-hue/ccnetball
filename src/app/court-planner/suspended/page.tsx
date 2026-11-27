import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Account suspended — Netball Court - Drawing",
  robots: { index: false, follow: false },
};

export default function CourtPlannerSuspendedPage() {
  return (
    <section className="py-20">
      <div className="mx-auto flex max-w-xl flex-col items-center px-6 text-center lg:px-10">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
          <AlertTriangle className="size-9" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          Your access is on hold.
        </h1>
        <p className="mt-4 max-w-md text-base text-muted-foreground">
          Your Netball Court - Drawing access has been temporarily suspended.
          If you think this is a mistake, email Caitlyn and she&apos;ll
          reactivate it for you.
        </p>

        <div className="mt-8 flex w-full flex-col items-center gap-3">
          <a
            href="mailto:info.ccnetball@gmail.com?subject=Court%20Drawing%20access%20on%20hold"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:scale-[1.01]"
          >
            Email Caitlyn
          </a>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="size-4" /> Back to the shop
          </Link>
        </div>
      </div>
    </section>
  );
}
