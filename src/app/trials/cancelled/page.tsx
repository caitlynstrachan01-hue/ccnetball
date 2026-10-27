import Link from "next/link";
import { XCircle } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Registration not completed — CC Netball Trials",
  robots: { index: false, follow: false },
};

export default async function TrialCancelledPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  let slug: string | null = null;
  if (session_id) {
    const supabase = createAdminClient();
    const { data: p } = await supabase
      .from("trial_participants")
      .select("trial_id")
      .eq("stripe_session_id", session_id)
      .maybeSingle();
    if (p) {
      const { data: trial } = await supabase
        .from("trials")
        .select("slug")
        .eq("id", p.trial_id)
        .maybeSingle();
      slug = trial?.slug ?? null;
    }
  }

  return (
    <section className="py-20">
      <div className="mx-auto flex max-w-xl flex-col items-center px-6 text-center lg:px-10">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <XCircle className="size-10" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          Registration not completed
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          No payment was taken and your spot wasn&apos;t saved. You can head back
          and try again any time.
        </p>
        {slug && (
          <Link
            href={`/trials/${slug}`}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:scale-[1.02]"
          >
            Back to registration
          </Link>
        )}
      </div>
    </section>
  );
}
