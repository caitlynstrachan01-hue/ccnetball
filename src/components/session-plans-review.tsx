"use client";

import { useState } from "react";
import { CalendarDays, Star } from "lucide-react";
import { PlanView } from "@/components/session-planner";
import {
  AGE_GROUPS,
  type AgeGroupId,
  type DrillCategory,
} from "@/lib/drills-library-content";
import type { ReviewPlan } from "@/lib/session-plans.server";

type Filter = "all" | "recommended";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const SOURCE_LABEL: Record<string, string> = {
  ai: "Planner",
  matcher: "Planner",
  coach: "Coach-built",
};

export function SessionPlansReview({
  categories,
  initialPlans,
}: {
  categories: DrillCategory[];
  initialPlans: ReviewPlan[];
}) {
  const [plans, setPlans] = useState(initialPlans);
  const [filter, setFilter] = useState<Filter>("all");
  const [age, setAge] = useState<AgeGroupId | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [titleDraft, setTitleDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visible = plans.filter(
    (p) =>
      (filter === "all" || p.recommended) &&
      (age === "all" || p.age_group === age),
  );
  const open = plans.find((p) => p.id === openId) ?? null;

  function openPlan(p: ReviewPlan) {
    setOpenId(p.id);
    setTitleDraft(p.title);
    setError(null);
  }

  async function update(p: ReviewPlan, recommended: boolean) {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/session-plans", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: p.id, recommended, title: titleDraft }),
    });
    setBusy(false);
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(
        /column/i.test(json.error ?? "")
          ? "The database needs its latest update first — run the newest setup step in Supabase."
          : (json.error ?? "Couldn't update the plan."),
      );
      return;
    }
    setPlans((prev) =>
      prev.map((x) =>
        x.id === p.id
          ? { ...x, recommended, title: titleDraft.trim() || x.title }
          : x,
      ),
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <aside className="lg:col-span-4">
        <div className="rounded-2xl border border-border/70 bg-card p-4 lg:sticky lg:top-24">
          <div className="flex flex-wrap gap-2">
            {(["all", "recommended"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={
                  filter === f
                    ? "rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                    : "rounded-full border border-border/70 bg-background px-3 py-1.5 text-xs font-semibold text-foreground/80 transition hover:border-primary/40"
                }
              >
                {f === "all" ? "All plans" : "Recommended"}
              </button>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {[{ id: "all" as const, label: "Every age" }, ...AGE_GROUPS].map(
              (a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAge(a.id)}
                  className={
                    age === a.id
                      ? "rounded-full bg-foreground px-3 py-1 text-[11px] font-semibold text-background"
                      : "rounded-full border border-border/70 bg-background px-3 py-1 text-[11px] font-semibold text-foreground/80 transition hover:border-primary/40"
                  }
                >
                  {a.label}
                </button>
              ),
            )}
          </div>

          {visible.length === 0 ? (
            <p className="mt-6 px-2 text-sm text-muted-foreground">
              No session plans here yet. They&apos;ll appear as coaches use
              the planner.
            </p>
          ) : (
            <ul className="mt-4 max-h-[70vh] space-y-1 overflow-y-auto">
              {visible.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => openPlan(p)}
                    className={
                      p.id === openId
                        ? "flex w-full items-start gap-3 rounded-xl bg-primary/10 px-3 py-2.5 text-left"
                        : "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-muted"
                    }
                  >
                    {p.recommended ? (
                      <Star className="mt-0.5 size-4 shrink-0 fill-primary text-primary" />
                    ) : (
                      <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">
                        {p.title}
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {[
                          p.coach,
                          formatDate(p.created_at),
                          AGE_GROUPS.find((a) => a.id === p.age_group)?.label,
                          SOURCE_LABEL[p.plan.source] ?? "",
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      <div className="lg:col-span-8">
        {open ? (
          <PlanView
            key={open.id}
            plan={open}
            categories={categories}
            mode="view"
            badge={`${open.coach} · ${SOURCE_LABEL[open.plan.source] ?? ""}`}
            onClose={() => setOpenId(null)}
            actions={
              <div className="w-full">
                <label className="block">
                  <span className="text-xs font-semibold text-foreground/80">
                    Title other coaches will see
                  </span>
                  <input
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>
                <p className="mt-2 text-xs text-muted-foreground">
                  Recommended plans show to coaches in the same age group,
                  without this coach&apos;s name, brief or notes.
                </p>
                {error && (
                  <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap justify-end gap-3">
                  {open.recommended ? (
                    <>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => update(open, false)}
                        className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground/80 transition hover:bg-muted disabled:opacity-60"
                      >
                        Stop recommending
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => update(open, true)}
                        className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md disabled:opacity-60"
                      >
                        Save title
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => update(open, true)}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:scale-[1.02] disabled:opacity-60"
                    >
                      <Star className="size-4" />
                      {busy ? "Saving…" : "Recommend to other coaches"}
                    </button>
                  )}
                </div>
              </div>
            }
          />
        ) : (
          <div className="rounded-3xl border border-border/70 bg-card p-10 text-center text-sm text-muted-foreground">
            Pick a session plan on the left to review it.
          </div>
        )}
      </div>
    </div>
  );
}
