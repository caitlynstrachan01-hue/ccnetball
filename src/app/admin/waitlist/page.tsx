import { redirect } from "next/navigation";
import { Reveal } from "@/components/motion";
import { AdminWaitlist } from "@/components/admin-waitlist";
import { listWaitlistEntries } from "@/lib/shop-admin.server";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Admin — Waitlist",
  description: "People waiting for a sold-out product to come back in stock.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminWaitlistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/waitlist");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.is_admin !== true) redirect("/account");

  const entries = await listWaitlistEntries();

  return (
    <section className="border-b border-border/60 bg-muted/40">
      <div className="mx-auto max-w-5xl px-6 py-10 lg:px-10 lg:py-14">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Admin — waitlist
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            Back-in-stock <span className="gradient-text">waitlist</span>.
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Everyone who signed up to be notified when a sold-out product comes
            back. Restock in Supabase first, then click <strong>Notify
            everyone</strong> on the product below — a branded email with a
            direct link to the product fires to each person, and the entry
            moves to &quot;Already notified&quot;.
          </p>
        </Reveal>

        <div className="mt-8">
          <AdminWaitlist entries={entries} />
        </div>
      </div>
    </section>
  );
}
