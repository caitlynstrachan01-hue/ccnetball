import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Crown, Lock } from "lucide-react";
import { Reveal } from "@/components/motion";
import { DrillsLibraryPreview } from "@/components/drills-library-preview";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Netball Drills Library — Members",
  description:
    "Browse the CC Netball drills library — organised by focus area and filmed by Caitlyn.",
};

export default async function LibraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/library");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, full_name")
    .eq("id", user.id)
    .maybeSingle();

  const isAdmin = profile?.is_admin === true;

  const { data: entitlement } = await supabase
    .from("entitlements")
    .select("expires_at")
    .eq("user_id", user.id)
    .eq("product_slug", "drills-library")
    .eq("status", "active")
    .maybeSingle();

  const hasSubscription = Boolean(entitlement);
  const hasAccess = isAdmin || hasSubscription;

  if (!hasAccess) {
    return (
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 -right-40 size-[35rem] rounded-full bg-[var(--brand-coral)]/25 blur-[120px]" />
        </div>
        <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 py-20 text-center lg:px-10">
          <Reveal>
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Lock className="size-8" />
            </div>
            <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
              A subscription is needed to open the library.
            </h1>
            <p className="mt-4 text-base text-muted-foreground">
              The Netball Drills Library is a members-only area. Subscribe for
              $49 / month to unlock every focus area.
            </p>
            <Link
              href="/shop/drills-library"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:scale-[1.02]"
            >
              Subscribe to unlock
            </Link>
          </Reveal>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="border-b border-border/60 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
          <Reveal>
            <Link
              href="/account"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition hover:text-primary"
            >
              <ArrowLeft className="size-4" /> Back to my account
            </Link>
          </Reveal>

          <Reveal delay={0.03}>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Netball Drills Library
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
              <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
                Welcome to the{" "}
                <span className="gradient-text">library</span>.
              </h1>
              {isAdmin && !hasSubscription && (
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  <Crown className="size-3.5" />
                  Admin view
                </div>
              )}
            </div>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              Pick a focus area, tap a drill, and the &quot;up next&quot; list
              stays inside the same area so you can move through a whole
              session in one sitting.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-10 lg:py-14">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <DrillsLibraryPreview />
        </div>
      </section>
    </>
  );
}
