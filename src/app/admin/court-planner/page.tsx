import { redirect } from "next/navigation";
import { Reveal } from "@/components/motion";
import { AdminCourtPlanner } from "@/components/admin-court-planner";
import { listCourtPlannerAccess } from "@/lib/court-planner-admin.server";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Admin — Court Drawing subscriptions",
  description: "Monitor and manage Netball Court - Drawing subscriptions.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminCourtPlannerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/court-planner");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.is_admin !== true) redirect("/account");

  const rows = await listCourtPlannerAccess();

  return (
    <section className="border-b border-border/60 bg-muted/40">
      <div className="mx-auto max-w-5xl px-6 py-10 lg:px-10 lg:py-14">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Admin — Netball Court - Drawing
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            Active <span className="gradient-text">subscriptions</span>.
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            New-country sign-ins trigger an email alert. If anything looks like
            account sharing, hit <b>Suspend</b> on the row — the user is
            immediately locked out and shown a &ldquo;contact Caitlyn&rdquo;
            page. <b>Reactivate</b> puts them straight back in.
          </p>
        </Reveal>

        <div className="mt-10">
          <AdminCourtPlanner rows={rows} />
        </div>
      </div>
    </section>
  );
}
