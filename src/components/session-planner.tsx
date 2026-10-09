"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock,
  ExternalLink,
  History,
  Plus,
  Printer,
  RefreshCw,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import {
  AGE_GROUPS,
  ageGroupLabel,
  type AgeGroupId,
  type DrillCategory,
} from "@/lib/drills-library-content";
import {
  PROGRESS_OPTIONS,
  STRUCTURE_PRESETS,
  buildCatalog,
  renumberSkills,
  totalMinutes,
  type BlockSpec,
  type Progress,
  type SavedPlan,
} from "@/lib/session-planner";
import { createClient } from "@/lib/supabase/client";

const MAX_SKILLS = 4;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function SessionPlanner({
  categories,
  initialPlans,
}: {
  categories: DrillCategory[];
  initialPlans: SavedPlan[];
}) {
  const [plans, setPlans] = useState<SavedPlan[]>(initialPlans);
  const [viewingId, setViewingId] = useState<string | null>(null);

  // Form state
  const last = initialPlans[0];
  const [ageGroup, setAgeGroup] = useState<AgeGroupId | "">(
    (last?.age_group as AgeGroupId) ?? "",
  );
  const [squad, setSquad] = useState("");
  const [brief, setBrief] = useState("");
  const [presetId, setPresetId] = useState("60");
  const [blocks, setBlocks] = useState<BlockSpec[]>(
    STRUCTURE_PRESETS.find((p) => p.id === "60")!.blocks,
  );
  const [previousPlanId, setPreviousPlanId] = useState<string>(last?.id ?? "");
  const [progress, setProgress] = useState<Progress | null>(null);
  const [progressNote, setProgressNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const viewing = plans.find((p) => p.id === viewingId) ?? null;
  const previousPlan = plans.find((p) => p.id === previousPlanId) ?? null;
  const skillCount = blocks.filter((b) => b.slot === "skill").length;

  function choosePreset(id: string) {
    const preset = STRUCTURE_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setPresetId(id);
    setBlocks(preset.blocks);
  }

  function editBlocks(next: BlockSpec[]) {
    setPresetId("custom");
    setBlocks(renumberSkills(next));
  }

  function addSkill() {
    const at = blocks.findIndex((b) => b.slot === "scrimmage");
    const next = [...blocks];
    next.splice(at === -1 ? next.length : at, 0, {
      slot: "skill",
      label: "Skill",
      minutes: 12,
    });
    editBlocks(next);
  }

  function addTeamDrill() {
    const at = blocks.findIndex((b) => b.slot === "skill");
    const next = [...blocks];
    next.splice(at === -1 ? next.length : at, 0, {
      slot: "team-drill",
      label: "Team drill",
      minutes: 10,
    });
    editBlocks(next);
  }

  async function handleBuild() {
    setError(null);
    if (!ageGroup) {
      setError("Pick the age group you're coaching.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/session-planner", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          brief,
          ageGroup,
          squad,
          blocks,
          previousPlanId: previousPlanId || null,
          progress: previousPlanId ? progress : null,
          progressNote: previousPlanId ? progressNote : "",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Couldn't build the plan.");
      const saved: SavedPlan = json.saved ?? {
        id: `unsaved-${Date.now()}`,
        title: json.plan.title,
        brief,
        age_group: ageGroup,
        duration_minutes: totalMinutes(blocks),
        plan: json.plan,
        created_at: new Date().toISOString(),
      };
      setPlans((prev) => [saved, ...prev]);
      setViewingId(saved.id);
      setPreviousPlanId(saved.id);
      setProgress(null);
      setProgressNote("");
      setBrief("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  function planNextFrom(plan: SavedPlan) {
    setPreviousPlanId(plan.id);
    if (plan.age_group) setAgeGroup(plan.age_group as AgeGroupId);
    setProgress(null);
    setViewingId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deletePlan(plan: SavedPlan) {
    if (!window.confirm(`Delete "${plan.title}"?`)) return;
    if (!plan.id.startsWith("unsaved-")) {
      const { error } = await createClient()
        .from("session_plans")
        .delete()
        .eq("id", plan.id);
      if (error) {
        window.alert(`Couldn't delete: ${error.message}`);
        return;
      }
    }
    setPlans((prev) => prev.filter((p) => p.id !== plan.id));
    if (viewingId === plan.id) setViewingId(null);
    if (previousPlanId === plan.id) setPreviousPlanId("");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-8">
        {viewing ? (
          <PlanView
            key={viewing.id}
            plan={viewing}
            categories={categories}
            onClose={() => setViewingId(null)}
            onPlanNext={() => planNextFrom(viewing)}
            onDelete={() => deletePlan(viewing)}
            onSaved={(updated) =>
              setPlans((prev) =>
                prev.map((p) => (p.id === updated.id ? updated : p)),
              )
            }
          />
        ) : (
          <div className="rounded-3xl border border-border/70 bg-card p-6 md:p-8 print:hidden">
            {/* 1. Age group */}
            <Step n={1} title="Who are you coaching?">
              <div className="flex flex-wrap gap-2">
                {AGE_GROUPS.map((a) => {
                  const on = ageGroup === a.id;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setAgeGroup(a.id)}
                      className={
                        on
                          ? "inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                          : "inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground/80 transition hover:border-primary/40 hover:bg-muted"
                      }
                    >
                      {on && <Check className="size-4" />}
                      {a.label}
                      <span className={on ? "opacity-80" : "text-muted-foreground"}>
                        {a.range}
                      </span>
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                value={squad}
                onChange={(e) => setSquad(e.target.value)}
                placeholder="Squad size and level (optional), e.g. 10 players, Div 2"
                className="mt-3 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </Step>

            {/* 2. Brief */}
            <Step n={2} title="What do you want out of this session?">
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                rows={4}
                placeholder="e.g. Our attackers keep getting stuck at the top of the circle and we lose the ball on the centre pass. I'd like to work on leading into space and holding the ball under pressure."
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </Step>

            {/* 3. Build on last session */}
            {plans.length > 0 && (
              <Step n={3} title="Build on a previous session?">
                <select
                  value={previousPlanId}
                  onChange={(e) => {
                    setPreviousPlanId(e.target.value);
                    setProgress(null);
                  }}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">No — start fresh</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {formatDate(p.created_at)} — {p.title}
                    </option>
                  ))}
                </select>

                {previousPlan && (
                  <div className="mt-4 rounded-2xl bg-muted/50 p-4">
                    <p className="text-sm font-semibold text-foreground">
                      How did the athletes go with last session&apos;s skills?
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {previousPlan.plan.blocks
                        .filter((b) => b.slot === "skill" && b.drillKey)
                        .map((b) => drillTitle(categories, b.drillKey))
                        .join(" · ") || previousPlan.title}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {PROGRESS_OPTIONS.map((o) => (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => setProgress(o.id)}
                          className={
                            progress === o.id
                              ? "rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground"
                              : "rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-semibold text-foreground/80 transition hover:border-primary/40"
                          }
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={progressNote}
                      onChange={(e) => setProgressNote(e.target.value)}
                      placeholder="Anything else from last session? (optional)"
                      className="mt-3 w-full rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                )}
              </Step>
            )}

            {/* 4. Structure */}
            <Step n={plans.length > 0 ? 4 : 3} title="Session structure">
              <div className="flex flex-wrap gap-2">
                {STRUCTURE_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => choosePreset(p.id)}
                    className={
                      presetId === p.id
                        ? "rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background"
                        : "rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground/80 transition hover:border-primary/40"
                    }
                  >
                    {p.label}
                  </button>
                ))}
                {presetId === "custom" && (
                  <span className="rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background">
                    Custom
                  </span>
                )}
              </div>

              <ul className="mt-4 space-y-2">
                {blocks.map((b, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 rounded-xl border border-border/70 bg-background px-3 py-2"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                      {b.label}
                    </span>
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <input
                        type="number"
                        min={1}
                        max={90}
                        value={b.minutes}
                        onChange={(e) =>
                          editBlocks(
                            blocks.map((x, j) =>
                              j === i
                                ? { ...x, minutes: Number(e.target.value) || 0 }
                                : x,
                            ),
                          )
                        }
                        className="w-14 rounded-lg border border-border bg-background px-2 py-1 text-right text-sm text-foreground outline-none focus:border-primary"
                      />
                      min
                    </label>
                    <button
                      type="button"
                      aria-label={`Remove ${b.label}`}
                      disabled={blocks.length <= 1}
                      onClick={() => editBlocks(blocks.filter((_, j) => j !== i))}
                      className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                    >
                      <X className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={addSkill}
                    disabled={skillCount >= MAX_SKILLS}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 py-1.5 text-xs font-semibold text-foreground/90 transition hover:border-primary/40 hover:bg-muted disabled:opacity-40"
                  >
                    <Plus className="size-3.5" /> Add skill
                  </button>
                  {!blocks.some((b) => b.slot === "team-drill") && (
                    <button
                      type="button"
                      onClick={addTeamDrill}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 py-1.5 text-xs font-semibold text-foreground/90 transition hover:border-primary/40 hover:bg-muted"
                    >
                      <Plus className="size-3.5" /> Add team drill
                    </button>
                  )}
                </div>
                <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <Clock className="size-4 text-primary" />
                  {totalMinutes(blocks)} min total
                </p>
              </div>
            </Step>

            {error && (
              <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleBuild}
              disabled={busy}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:scale-[1.01] disabled:opacity-70"
            >
              {busy ? (
                <>
                  <RefreshCw className="size-5 animate-spin" /> Building your
                  session…
                </>
              ) : (
                <>
                  <Sparkles className="size-5" /> Build my session plan
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Saved sessions */}
      <aside className="lg:col-span-4 print:hidden">
        <div className="rounded-2xl border border-border/70 bg-card p-5 lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              <History className="size-4" /> Your sessions
            </p>
            {viewing && (
              <button
                type="button"
                onClick={() => setViewingId(null)}
                className="text-xs font-semibold text-muted-foreground hover:text-primary"
              >
                + New
              </button>
            )}
          </div>
          {plans.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Your session plans will be saved here, so the next one can build
              on them.
            </p>
          ) : (
            <ul className="mt-4 space-y-1">
              {plans.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setViewingId(p.id)}
                    className={
                      p.id === viewingId
                        ? "flex w-full items-start gap-3 rounded-xl bg-primary/10 px-3 py-2.5 text-left"
                        : "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-muted"
                    }
                  >
                    <CalendarDays className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">
                        {p.title}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {formatDate(p.created_at)}
                        {p.duration_minutes ? ` · ${p.duration_minutes} min` : ""}
                        {p.age_group
                          ? ` · ${AGE_GROUPS.find((a) => a.id === p.age_group)?.label ?? ""}`
                          : ""}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}

function drillTitle(categories: DrillCategory[], key: string | null) {
  if (!key) return "";
  const [cat, slug] = key.split("/");
  return (
    categories
      .find((c) => c.slug === cat)
      ?.drills.find((d) => d.slug === slug)?.title ?? "Removed drill"
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-8 first:mt-0">
      <p className="flex items-center gap-3 text-sm font-bold text-foreground">
        <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {n}
        </span>
        {title}
      </p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function PlanView({
  plan,
  categories,
  onClose,
  onPlanNext,
  onDelete,
  onSaved,
}: {
  plan: SavedPlan;
  categories: DrillCategory[];
  onClose: () => void;
  onPlanNext: () => void;
  onDelete: () => void;
  onSaved: (plan: SavedPlan) => void;
}) {
  const [blocks, setBlocks] = useState(plan.plan.blocks);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const ageGroup = (plan.age_group as AgeGroupId) ?? "senior";
  const catalog = useMemo(
    () => buildCatalog(categories, ageGroup),
    [categories, ageGroup],
  );
  const byKey = useMemo(
    () => new Map(catalog.map((c) => [c.key, c])),
    [catalog],
  );

  async function save() {
    setSaving(true);
    const updatedPlan = { ...plan.plan, blocks };
    const { error } = await createClient()
      .from("session_plans")
      .update({ plan: updatedPlan })
      .eq("id", plan.id);
    setSaving(false);
    if (error) {
      window.alert(`Couldn't save: ${error.message}`);
      return;
    }
    setDirty(false);
    onSaved({ ...plan, plan: updatedPlan });
  }

  return (
    <div className="rounded-3xl border border-border/70 bg-card p-6 md:p-8 print:border-0 print:p-0">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            {formatDate(plan.created_at)}
            {plan.age_group && ` · ${ageGroupLabel(ageGroup)}`}
            {plan.duration_minutes && ` · ${plan.duration_minutes} min`}
          </p>
          <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight md:text-3xl">
            {plan.title}
          </h2>
        </div>
        <div className="flex gap-2 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 py-1.5 text-xs font-semibold transition hover:border-primary/40 hover:bg-muted"
          >
            <Printer className="size-3.5" /> Print
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close plan"
            className="flex size-8 items-center justify-center rounded-full border border-border/70 transition hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {plan.plan.summary && (
        <p className="mt-4 text-sm leading-relaxed text-foreground/90">
          {plan.plan.summary}
        </p>
      )}
      {plan.brief && (
        <p className="mt-3 rounded-xl bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
          <strong className="text-foreground/80">Your brief:</strong>{" "}
          {plan.brief}
        </p>
      )}

      <ol className="mt-8 space-y-4">
        {blocks.map((b, i) => {
          const pick = b.drillKey ? byKey.get(b.drillKey) : undefined;
          const options = catalog.filter(
            (c) =>
              c.slot === b.slot &&
              (c.key === b.drillKey ||
                !blocks.some((x) => x.drillKey === c.key)),
          );
          return (
            <li
              key={i}
              className="rounded-2xl border border-border/70 bg-background p-5 print:break-inside-avoid"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  {b.label}
                </p>
                <p className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                  <Clock className="size-3.5" /> {b.minutes} min
                </p>
              </div>
              <h3 className="mt-1.5 font-display text-lg font-bold leading-snug">
                {pick?.drill.title ??
                  (b.drillKey ? "Removed drill" : "No drill in the library yet")}
              </h3>
              {pick && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {pick.categoryName} · {pick.drill.level}
                  {pick.drill.equipment && ` · ${pick.drill.equipment}`}
                  {pick.drill.groupSize && ` · ${pick.drill.groupSize}`}
                </p>
              )}
              {b.coachingFocus && (
                <p className="mt-3 text-sm text-foreground/90">
                  <strong>Coaching focus:</strong> {b.coachingFocus}
                </p>
              )}
              {pick?.drill.ageNotes?.[ageGroup] && (
                <p className="mt-2 text-sm text-foreground/90">
                  <strong>For this age group:</strong>{" "}
                  {pick.drill.ageNotes[ageGroup]}
                </p>
              )}
              {b.why && (
                <p className="mt-2 text-xs italic text-muted-foreground">
                  {b.why}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-3 print:hidden">
                {pick && (
                  <Link
                    href={`/library?drill=${encodeURIComponent(pick.key)}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    Watch the drill <ExternalLink className="size-3.5" />
                  </Link>
                )}
                {options.length > 1 && (
                  <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                    Swap for
                    <select
                      value={b.drillKey ?? ""}
                      onChange={(e) => {
                        setBlocks(
                          blocks.map((x, j) =>
                            j === i
                              ? {
                                  ...x,
                                  drillKey: e.target.value,
                                  why: "Swapped in by you.",
                                }
                              : x,
                          ),
                        );
                        setDirty(true);
                      }}
                      className="max-w-56 rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground outline-none focus:border-primary"
                    >
                      {options.map((o) => (
                        <option key={o.key} value={o.key}>
                          {o.drill.title}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {plan.plan.nextTime && (
        <div className="mt-8 rounded-2xl bg-primary/5 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Next session
          </p>
          <p className="mt-2 text-sm text-foreground/90">{plan.plan.nextTime}</p>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 print:hidden">
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition hover:text-red-600"
        >
          <Trash2 className="size-3.5" /> Delete session
        </button>
        <div className="flex flex-wrap gap-3">
          {dirty && (
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full border border-primary px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/5 disabled:opacity-60"
            >
              <Check className="size-4" /> {saving ? "Saving…" : "Save changes"}
            </button>
          )}
          <button
            type="button"
            onClick={onPlanNext}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:scale-[1.02]"
          >
            Plan the next session <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
