import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Reveal } from "@/components/motion";
import {
  getLibraryAccess,
  loadDrillCategories,
} from "@/lib/drills-store.server";
import { createAdminClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Admin — Drill popularity",
  description: "Which drills members watch and star most.",
  robots: { index: false, follow: false },
};

type Sort = "views" | "people" | "favourites";

/** Every row of a table, a page at a time (Supabase returns 1,000 max). */
async function fetchAll<T>(
  db: SupabaseClient,
  table: string,
  columns: string,
): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db
      .from(table)
      .select(columns)
      .range(from, from + 999);
    if (error) throw error;
    out.push(...((data ?? []) as T[]));
    if (!data || data.length < 1000) return out;
  }
}

async function loadActivity(session: SupabaseClient) {
  const attempt = async (db: SupabaseClient) => ({
    views: await fetchAll<{ drill_id: string; user_id: string; viewed_at: string }>(
      db,
      "drill_views",
      "drill_id, user_id, viewed_at",
    ),
    favourites: await fetchAll<{ drill_id: string }>(
      db,
      "drill_favourites",
      "drill_id",
    ),
  });
  try {
    return await attempt(createAdminClient());
  } catch {
    // Service-role key missing — admins can still read through their session.
  }
  try {
    return await attempt(session);
  } catch {
    return null; // Tables not set up yet (migration 0021).
  }
}

export default async function DrillInsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { supabase, user, isAdmin } = await getLibraryAccess();
  if (!user) redirect("/login?next=/admin/drill-insights");
  if (!isAdmin) redirect("/account");

  const { sort: sortParam } = await searchParams;
  const sort: Sort =
    sortParam === "people" || sortParam === "favourites" ? sortParam : "views";

  const [categories, activity] = await Promise.all([
    loadDrillCategories({ includeUnpublished: true }),
    loadActivity(supabase),
  ]);

  const stats = new Map<
    string,
    { views: number; people: Set<string>; favourites: number }
  >();
  const entry = (id: string) => {
    let s = stats.get(id);
    if (!s) stats.set(id, (s = { views: 0, people: new Set(), favourites: 0 }));
    return s;
  };
  for (const v of activity?.views ?? []) {
    const s = entry(v.drill_id);
    s.views += 1;
    s.people.add(v.user_id);
  }
  for (const f of activity?.favourites ?? []) entry(f.drill_id).favourites += 1;

  const rows = categories
    .flatMap((cat) =>
      cat.drills
        .filter((d) => d.id && d.videoPath)
        .map((d) => {
          const s = stats.get(d.id!);
          return {
            id: d.id!,
            label: `${cat.name} #${d.number}`,
            title: d.title,
            views: s?.views ?? 0,
            people: s?.people.size ?? 0,
            favourites: s?.favourites ?? 0,
          };
        }),
    )
    .sort(
      (a, b) =>
        b[sort] - a[sort] ||
        b.views - a.views ||
        a.label.localeCompare(b.label),
    );

  const totalViews = activity?.views.length ?? 0;
  const totalPeople = new Set(activity?.views.map((v) => v.user_id)).size;
  const since = activity?.views.reduce<string | null>(
    (min, v) => (!min || v.viewed_at < min ? v.viewed_at : min),
    null,
  );

  const sortLink = (id: Sort, label: string) => (
    <Link
      href={id === "views" ? "/admin/drill-insights" : `/admin/drill-insights?sort=${id}`}
      className={
        sort === id
          ? "rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background"
          : "rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground/80 transition hover:border-primary/40"
      }
    >
      {label}
    </Link>
  );

  return (
    <section className="border-b border-border/60 bg-muted/40">
      <div className="mx-auto max-w-5xl px-6 py-10 lg:px-10 lg:py-14">
        <Reveal>
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition hover:text-primary"
          >
            <ArrowLeft className="size-4" /> Back to my account
          </Link>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Admin — drill popularity
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            What members are <span className="gradient-text">watching</span>.
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
            Only you can see this page. A view is counted each time a member
            presses play on a drill&apos;s video. &quot;People&quot; counts
            each member once, however often they watch. Your own viewing
            isn&apos;t counted.
          </p>
        </Reveal>

        {!activity ? (
          <p className="mt-8 rounded-2xl bg-amber-50 px-5 py-4 text-sm text-amber-900">
            Tracking isn&apos;t switched on yet — the database needs its latest
            setup step (0021) run in Supabase.
          </p>
        ) : (
          <>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ["Total views", totalViews],
                ["Members watching", totalPeople],
                ["Drills starred", activity.favourites.length],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-card p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-1 font-display text-3xl font-extrabold">
                    {value}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {since
                ? `Counting since ${new Date(since).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}.`
                : "No views yet — numbers appear as members start watching."}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                Most popular by:
              </span>
              {sortLink("views", "Total views")}
              {sortLink("people", "People watching")}
              {sortLink("favourites", "Favourites")}
            </div>

            <div className="mt-4 overflow-x-auto rounded-2xl bg-card shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border/60 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-bold">#</th>
                    <th className="px-4 py-3 font-bold">Drill</th>
                    <th className="px-4 py-3 text-right font-bold">Views</th>
                    <th className="px-4 py-3 text-right font-bold">People</th>
                    <th className="px-4 py-3 text-right font-bold">Starred</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={r.id} className="border-b border-border/40 last:border-0">
                      <td className="px-4 py-2.5 text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-2.5">
                        <p className="font-semibold text-foreground">{r.title}</p>
                        <p className="text-xs text-muted-foreground">{r.label}</p>
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold">{r.views}</td>
                      <td className="px-4 py-2.5 text-right">{r.people}</td>
                      <td className="px-4 py-2.5 text-right">{r.favourites}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
