import { redirect } from "next/navigation";
import { Reveal } from "@/components/motion";
import { DrillsLibraryAdmin } from "@/components/drills-library-admin";
import { loadDrillCategories } from "@/lib/drills-store.server";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Admin — Drills Library",
  description:
    "Upload and edit drills for the CC Netball drills library.",
  robots: { index: false, follow: false },
};

export default async function DrillsLibraryAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/drills-library");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.is_admin !== true) redirect("/account");

  const categories = await loadDrillCategories({ includeUnpublished: true });

  return (
    <section className="border-b border-border/60 bg-muted/40">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Admin — drills library
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            Upload &amp; edit your <span className="gradient-text">drills</span>
            .
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
            Pick a drill on the left, upload the video, write the description,
            and add your Make It Easier / Make It Harder / Variations bullet
            points, then press Save. Members see your changes straight away.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-8">
          <DrillsLibraryAdmin categories={categories} />
        </Reveal>
      </div>
    </section>
  );
}
