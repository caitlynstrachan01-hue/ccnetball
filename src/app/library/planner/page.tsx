import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "@/components/motion";
import { SessionPlanner } from "@/components/session-planner";
import {
  getLibraryAccess,
  loadDrillCategories,
} from "@/lib/drills-store.server";
import type { SavedPlan } from "@/lib/session-planner";

export const metadata = {
  title: "Session Planner — Drills Library",
  description:
    "Describe what you want from training and get a full netball session plan from the CC Netball drills library.",
  robots: { index: false, follow: false },
};

export default async function PlannerPage() {
  const { supabase, user, hasAccess } = await getLibraryAccess();
  if (!user) redirect("/login?next=/library/planner");
  if (!hasAccess) redirect("/library");

  const [categories, { data: plans }] = await Promise.all([
    loadDrillCategories(),
    supabase
      .from("session_plans")
      .select("id, title, brief, age_group, duration_minutes, plan, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  return (
    <>
      <section className="border-b border-border/60 bg-muted/30 print:hidden">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
          <Reveal>
            <Link
              href="/library"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition hover:text-primary"
            >
              <ArrowLeft className="size-4" /> Back to the library
            </Link>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Session planner
            </p>
            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
              Plan your next <span className="gradient-text">session</span>.
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              Tell us who you&apos;re coaching and what you want out of
              training. We&apos;ll build the session from Caitlyn&apos;s
              drills and remember it, so the next one can build on it.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-10 lg:py-14 print:py-0">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <SessionPlanner
            categories={categories}
            initialPlans={(plans ?? []) as SavedPlan[]}
          />
        </div>
      </section>
    </>
  );
}
