import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { getCourtPlannerAccess } from "@/lib/court-planner-access.server";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "You're in — Netball Court - Drawing",
  robots: { index: false, follow: false },
};

function formatExpiry(iso: string): string {
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function CourtPlannerSuccessPage() {
  const access = await getCourtPlannerAccess();

  return (
    <section className="py-20">
      <div className="mx-auto flex max-w-xl flex-col items-center px-6 text-center lg:px-10">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <CheckCircle2 className="size-10" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          You&apos;re in.
        </h1>
        <p className="mt-4 max-w-md text-base text-muted-foreground">
          Thanks — you&apos;ve got full access to Netball Court - Drawing on
          any phone or tablet
          {access
            ? ` until ${formatExpiry(access.expiresAt)}.`
            : " for the next 12 months."}
        </p>
        <Link
          href="/court-planner"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:scale-[1.01]"
        >
          Launch Netball Court - Drawing
          <ArrowRight className="size-5" />
        </Link>
        <p className="mt-6 text-xs text-muted-foreground">
          A receipt has been sent to the email you used at checkout. We&apos;ll
          remind you a couple of weeks before your access expires.
        </p>
      </div>
    </section>
  );
}
