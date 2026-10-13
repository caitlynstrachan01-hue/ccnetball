import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "@/components/motion";
import { SessionPlansReview } from "@/components/session-plans-review";
import {
  getLibraryAccess,
  loadDrillCategories,
} from "@/lib/drills-store.server";
import { loadPlansForReview } from "@/lib/session-plans.server";

export const metadata = {
  title: "Admin — Session Plans",
  description: "Review coaches' session plans and recommend the best ones.",
  robots: { index: false, follow: false },
};

export default async function SessionPlansAdminPage() {
  const { user, isAdmin } = await getLibraryAccess();
  if (!user) redirect("/login?next=/admin/session-plans");
  if (!isAdmin) redirect("/account");

  const [categories, plans] = await Promise.all([
    loadDrillCategories({ includeUnpublished: true }),
    loadPlansForReview().catch(() => []),
  ]);

  return (
    <section className="border-b border-border/60 bg-muted/40">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
        <Reveal>
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition hover:text-primary"
          >
            <ArrowLeft className="size-4" /> Back to my account
          </Link>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Admin — session plans
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            Coaches&apos; <span className="gradient-text">session plans</span>.
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
            Every plan coaches create is saved here. Open one and tap
            &quot;Recommend&quot; to share it with other coaches in the same
            age group.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-8">
          <SessionPlansReview categories={categories} initialPlans={plans} />
        </Reveal>
      </div>
    </section>
  );
}
