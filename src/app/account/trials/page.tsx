import Link from "next/link";
import { ArrowRight, CalendarDays, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CreateTrialForm } from "./create-trial-form";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Your trials — CC Netball",
  robots: { index: false, follow: false },
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  open: "Open for registration",
  closed: "Closed",
  finalised: "Finalised",
};

export default async function TrialsDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: trials } = user
    ? await supabase
        .from("trials")
        .select("id, name, club, status, registration_open, created_at")
        .eq("owner_user_id", user.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <section className="mx-auto max-w-4xl px-6 py-14 lg:px-10 lg:py-16">
      <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        <CalendarDays className="size-3.5" />
        Trial App
      </div>
      <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
        Your trials
      </h1>
      <p className="mt-3 text-muted-foreground">
        Set up and run your club or association&apos;s trials — registration,
        teams and exports, all in one place.
      </p>

      {/* Existing trials */}
      {trials && trials.length > 0 && (
        <ul className="mt-10 space-y-3">
          {trials.map((t) => (
            <li key={t.id}>
              <Link
                href={`/account/trials/${t.id}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card p-5 transition hover:border-primary/40"
              >
                <div className="min-w-0">
                  <p className="truncate font-display text-lg font-bold">
                    {t.name}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {t.club}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      t.status === "open"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {STATUS_LABEL[t.status] ?? t.status}
                  </span>
                  <ArrowRight className="size-5 text-muted-foreground" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Create new */}
      <div className="mt-10 rounded-3xl border border-border/70 bg-card p-6 lg:p-8">
        <div className="flex items-center gap-2 text-primary">
          <Plus className="size-5" />
          <h2 className="font-display text-xl font-bold">Start a new trial</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Give it a name and your club/association details — you&apos;ll add age
          groups, fees and sessions on the next screen.
        </p>
        <div className="mt-6">
          <CreateTrialForm />
        </div>
      </div>
    </section>
  );
}
