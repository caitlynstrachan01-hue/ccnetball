"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock,
  ExternalLink,
  FileDown,
  History,
  PencilLine,
  Star,
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
  DEFAULT_PRESET_ID,
  MAX_SKILLS,
  PROGRESS_OPTIONS,
  STRUCTURE_PRESETS,
  blankPlan,
  buildCatalog,
  candidateSlots,
  normaliseBlocks,
  renumberSkills,
  totalMinutes,
  type BlockSpec,
  type CatalogDrill,
  type PlanBlock,
  type Progress,
  type SavedPlan,
} from "@/lib/session-planner";
import { createClient } from "@/lib/supabase/client";

const PLAN_COLUMNS =
  "id, title, brief, age_group, duration_minutes, plan, created_at";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function withNormalisedBlocks(p: SavedPlan): SavedPlan {
  return { ...p, plan: { ...p.plan, blocks: normaliseBlocks(p.plan.blocks) } };
}

export function SessionPlanner({
  categories,
  initialPlans,
}: {
  categories: DrillCategory[];
  initialPlans: SavedPlan[];
}) {
  const [plans, setPlans] = useState<SavedPlan[]>(() =>
    initialPlans.map(withNormalisedBlocks),
  );
  const [viewingId, setViewingId] = useState<string | null>(null);

  // Form state
  const last = initialPlans[0];
  const [ageGroup, setAgeGroup] = useState<AgeGroupId | "">(
    (last?.age_group as AgeGroupId) ?? "",
  );
  const [squad, setSquad] = useState("");
  const [brief, setBrief] = useState("");
  const [fullMatch, setFullMatch] = useState<boolean>(
    last?.plan.fullMatch ?? false,
  );
  const [presetId, setPresetId] = useState(DEFAULT_PRESET_ID);
  const [blocks, setBlocks] = useState<BlockSpec[]>(
    STRUCTURE_PRESETS.find((p) => p.id === DEFAULT_PRESET_ID)!.blocks,
  );
  const [previousPlanId, setPreviousPlanId] = useState<string>(last?.id ?? "");
  const [progress, setProgress] = useState<Progress | null>(null);
  const [progressNote, setProgressNote] = useState("");
  const [busy, setBusy] = useState<"ai" | "manual" | null>(null);
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
      minutes: 10,
    });
    editBlocks(next);
  }

  function openPlan(saved: SavedPlan) {
    setPlans((prev) => [withNormalisedBlocks(saved), ...prev]);
    setViewingId(saved.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleBuild() {
    setError(null);
    if (!ageGroup) {
      setError("Pick the age group you're coaching.");
      return;
    }
    setBusy("ai");
    try {
      const res = await fetch("/api/session-planner", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          brief,
          ageGroup,
          squad,
          blocks,
          fullMatch,
          previousPlanId: previousPlanId || null,
          progress: previousPlanId ? progress : null,
          progressNote: previousPlanId ? progressNote : "",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Couldn't build the plan.");
      openPlan(
        json.saved ?? {
          id: `unsaved-${Date.now()}`,
          title: json.plan.title,
          brief,
          age_group: ageGroup,
          duration_minutes: totalMinutes(blocks),
          plan: json.plan,
          created_at: new Date().toISOString(),
        },
      );
      setPreviousPlanId(json.saved?.id ?? "");
      setProgress(null);
      setProgressNote("");
      setBrief("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(null);
    }
  }

  async function handleBuildMyself() {
    setError(null);
    if (!ageGroup) {
      setError("Pick the age group you're coaching.");
      return;
    }
    setBusy("manual");
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    const plan = {
      ...blankPlan(
        blocks,
        `My session — ${formatDate(new Date().toISOString())}`,
      ),
      fullMatch,
    };
    const { data, error: insertError } = await supabase
      .from("session_plans")
      .insert({
        user_id: auth.user?.id,
        title: plan.title,
        brief: brief || null,
        age_group: ageGroup,
        duration_minutes: totalMinutes(blocks),
        plan,
      })
      .select(PLAN_COLUMNS)
      .single();
    setBusy(null);
    if (insertError || !data) {
      setError(
        `Couldn't start your plan: ${insertError?.message ?? "unknown error"}`,
      );
      return;
    }
    openPlan(data as SavedPlan);
    setBrief("");
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

  const lastSkills = previousPlan
    ? previousPlan.plan.blocks
        .filter((b) => b.slot === "skill")
        .flatMap((b) =>
          b.drills.map((d) => d.custom?.title || drillTitle(categories, d.key)),
        )
        .join(" · ")
    : "";

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
            <Step n={1} title="Who are you coaching?">
              <div className="flex flex-wrap gap-2">
                {AGE_GROUPS.map((a) => (
                  <Chip
                    key={a.id}
                    on={ageGroup === a.id}
                    onClick={() => setAgeGroup(a.id)}
                  >
                    {a.label}
                    <span
                      className={
                        ageGroup === a.id
                          ? "opacity-80"
                          : "text-muted-foreground"
                      }
                    >
                      {a.range}
                    </span>
                  </Chip>
                ))}
              </div>
              <input
                type="text"
                value={squad}
                onChange={(e) => setSquad(e.target.value)}
                placeholder="Squad size and level (optional), e.g. 10 players, Div 2"
                className="mt-3 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </Step>

            <Step n={2} title="What do you want out of this session?">
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                rows={4}
                placeholder="e.g. Our attackers keep getting stuck at the top of the circle and we lose the ball on the centre pass. I'd like to work on leading into space and holding the ball under pressure."
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </Step>

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
                    {lastSkills && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {lastSkills}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {PROGRESS_OPTIONS.map((o) => (
                        <Chip
                          key={o.id}
                          small
                          on={progress === o.id}
                          onClick={() => setProgress(o.id)}
                        >
                          {o.label}
                        </Chip>
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
                    {b.slot === "skill" ? (
                      <button
                        type="button"
                        aria-label={`Remove ${b.label}`}
                        disabled={skillCount <= 1}
                        onClick={() =>
                          editBlocks(blocks.filter((_, j) => j !== i))
                        }
                        className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                      >
                        <X className="size-4" />
                      </button>
                    ) : (
                      <span className="size-7 shrink-0" />
                    )}
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={addSkill}
                  disabled={skillCount >= MAX_SKILLS}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 py-1.5 text-xs font-semibold text-foreground/90 transition hover:border-primary/40 hover:bg-muted disabled:opacity-40"
                >
                  <Plus className="size-3.5" /> Add skill
                </button>
                <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <Clock className="size-4 text-primary" />
                  {totalMinutes(blocks)} min total
                </p>
              </div>

              <div className="mt-5">
                <p className="text-sm font-semibold text-foreground">
                  Can your team play a full match at training?
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Chip
                    small
                    on={!fullMatch}
                    onClick={() => setFullMatch(false)}
                  >
                    No — half court
                  </Chip>
                  <Chip small on={fullMatch} onClick={() => setFullMatch(true)}>
                    Yes — full match
                  </Chip>
                </div>
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
              disabled={busy !== null}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:scale-[1.01] disabled:opacity-70"
            >
              {busy === "ai" ? (
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
            <button
              type="button"
              onClick={handleBuildMyself}
              disabled={busy !== null}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-7 py-3 text-sm font-semibold text-foreground/90 transition hover:border-primary/40 hover:bg-muted disabled:opacity-60"
            >
              <PencilLine className="size-4" />
              {busy === "manual" ? "Starting…" : "I'll pick the drills myself"}
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
              Your session plans are saved here, season after season, so you can
              look back and the next one can build on them.
            </p>
          ) : (
            <ul className="mt-4 max-h-[70vh] space-y-1 overflow-y-auto">
              {plans.map((p, idx) => (
                <li key={p.id}>
                  {(idx === 0 ||
                    new Date(plans[idx - 1].created_at).getFullYear() !==
                      new Date(p.created_at).getFullYear()) && (
                    <p className="px-3 pb-1 pt-3 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground first:pt-0">
                      {new Date(p.created_at).getFullYear()} season
                    </p>
                  )}
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
                        {p.duration_minutes
                          ? ` · ${p.duration_minutes} min`
                          : ""}
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

function drillTitle(categories: DrillCategory[], key: string) {
  const [cat, slug] = key.split("/");
  return (
    categories.find((c) => c.slug === cat)?.drills.find((d) => d.slug === slug)
      ?.title ?? "Removed drill"
  );
}

function Chip({
  on,
  small,
  onClick,
  children,
}: {
  on: boolean;
  small?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const size = small ? "px-3.5 py-1.5 text-xs" : "px-4 py-2 text-sm";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={
        on
          ? `inline-flex items-center gap-2 rounded-full bg-primary font-semibold text-primary-foreground ${size}`
          : `inline-flex items-center gap-2 rounded-full border border-border bg-background font-semibold text-foreground/80 transition hover:border-primary/40 hover:bg-muted ${size}`
      }
    >
      {on && !small && <Check className="size-4" />}
      {children}
    </button>
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

export function PlanView({
  plan,
  categories,
  mode = "own",
  badge,
  actions,
  onClose,
  onPlanNext,
  onDelete,
  onSaved,
}: {
  plan: SavedPlan;
  categories: DrillCategory[];
  /** "own" — the coach's plan, editable. "view" — read-only. */
  mode?: "own" | "view";
  badge?: string;
  /** Replaces the footer buttons in "view" mode. */
  actions?: React.ReactNode;
  onClose: () => void;
  onPlanNext?: () => void;
  onDelete?: () => void;
  onSaved?: (plan: SavedPlan) => void;
}) {
  const editable = mode === "own";
  const [title, setTitle] = useState(plan.title);
  const [blocks, setBlocks] = useState<PlanBlock[]>(plan.plan.blocks);
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
  const inUse = new Set(blocks.flatMap((b) => b.drills.map((d) => d.key)));
  const isEmpty = blocks.every((b) => b.drills.length === 0);

  function changeBlock(i: number, patch: Partial<PlanBlock>) {
    setBlocks(blocks.map((b, j) => (j === i ? { ...b, ...patch } : b)));
    setDirty(true);
  }

  function optionsFor(b: PlanBlock, current?: string): CatalogDrill[] {
    const slots = candidateSlots(b.slot);
    return catalog.filter(
      (c) => slots.includes(c.slot) && (c.key === current || !inUse.has(c.key)),
    );
  }

  async function save() {
    setSaving(true);
    const updatedPlan = { ...plan.plan, title, blocks };
    const { error } = await createClient()
      .from("session_plans")
      .update({ plan: updatedPlan, title })
      .eq("id", plan.id);
    setSaving(false);
    if (error) {
      window.alert(`Couldn't save: ${error.message}`);
      return;
    }
    setDirty(false);
    onSaved?.({ ...plan, title, plan: updatedPlan });
  }

  return (
    <div className="rounded-3xl border border-border/70 bg-card p-6 md:p-8 print:border-0 print:p-0">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {badge && (
            <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
              <Star className="size-3.5" /> {badge}
            </p>
          )}
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            {formatDate(plan.created_at)}
            {plan.age_group && ` · ${ageGroupLabel(ageGroup)}`}
            {plan.duration_minutes && ` · ${plan.duration_minutes} min`}
          </p>
          {!editable ? (
            <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight md:text-3xl">
              {title}
            </h2>
          ) : (
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setDirty(true);
              }}
              aria-label="Session title"
              className="mt-2 w-full rounded-lg border border-transparent bg-transparent font-display text-2xl font-extrabold tracking-tight outline-none transition hover:border-border focus:border-primary md:text-3xl"
            />
          )}
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
      {isEmpty && editable && (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 print:hidden">
          In each part of the session, add a drill from the library or write
          your own, then press <strong>Save changes</strong>.
        </p>
      )}

      <ol className="mt-8 space-y-4">
        {blocks.map((b, i) => {
          const addOptions = optionsFor(b);
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

              {b.drills.length === 0 && (
                <p className="mt-2 text-sm text-muted-foreground">
                  No drill chosen yet.
                </p>
              )}

              <ul className="mt-2 divide-y divide-border/60">
                {b.drills.map((d, k) => {
                  if (d.custom) {
                    const setCustom = (
                      patch: Partial<{ title: string; notes: string }>,
                    ) =>
                      changeBlock(i, {
                        drills: b.drills.map((x, y) =>
                          y === k
                            ? { ...x, custom: { ...x.custom!, ...patch } }
                            : x,
                        ),
                      });
                    return (
                      <li key={`${d.key}-${k}`} className="py-3 first:pt-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              {d.part ? `${d.part} · ` : ""}Your own drill
                            </p>
                            {editable ? (
                              <>
                                <input
                                  value={d.custom.title}
                                  onChange={(e) =>
                                    setCustom({ title: e.target.value })
                                  }
                                  placeholder="Drill name"
                                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                                <textarea
                                  value={d.custom.notes}
                                  onChange={(e) =>
                                    setCustom({ notes: e.target.value })
                                  }
                                  rows={3}
                                  placeholder="How it runs — set-up, players, coaching points…"
                                  className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                              </>
                            ) : (
                              <>
                                <h3 className="font-display text-base font-bold leading-snug">
                                  {d.custom.title || "Untitled drill"}
                                </h3>
                                {d.custom.notes && (
                                  <p className="mt-1 whitespace-pre-line text-sm text-foreground/90">
                                    {d.custom.notes}
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                          {editable && (
                            <button
                              type="button"
                              aria-label="Remove drill"
                              onClick={() =>
                                changeBlock(i, {
                                  drills: b.drills.filter((_, x) => x !== k),
                                })
                              }
                              className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-red-50 hover:text-red-600 print:hidden"
                            >
                              <X className="size-4" />
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  }
                  const pick = byKey.get(d.key);
                  const swapOptions = optionsFor(b, d.key);
                  return (
                    <li key={`${d.key}-${k}`} className="py-3 first:pt-1">
                      {d.part && (
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {d.part}
                        </p>
                      )}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-display text-base font-bold leading-snug">
                            {pick?.drill.title ?? "Removed drill"}
                          </h3>
                          {pick && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {[
                                pick.categoryName,
                                pick.drill.equipment,
                                pick.drill.groupSize,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          )}
                        </div>
                        {editable && (
                          <button
                            type="button"
                            aria-label="Remove drill"
                            onClick={() =>
                              changeBlock(i, {
                                drills: b.drills.filter((_, x) => x !== k),
                              })
                            }
                            className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-red-50 hover:text-red-600 print:hidden"
                          >
                            <X className="size-4" />
                          </button>
                        )}
                      </div>
                      {pick?.drill.ageNotes?.[ageGroup] && (
                        <p className="mt-2 text-sm text-foreground/90">
                          <strong>For this age group:</strong>{" "}
                          {pick.drill.ageNotes[ageGroup]}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-3 print:hidden">
                        {pick && (
                          <Link
                            href={`/library?drill=${encodeURIComponent(pick.key)}`}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                          >
                            Watch the drill{" "}
                            <ExternalLink className="size-3.5" />
                          </Link>
                        )}
                        {pick?.drill.pdfUrl && (
                          <a
                            href={pick.drill.pdfUrl}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                          >
                            Skill sheet (PDF) <FileDown className="size-3.5" />
                          </a>
                        )}
                        {editable && swapOptions.length > 1 && (
                          <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                            Swap for
                            <select
                              value={d.key}
                              onChange={(e) =>
                                changeBlock(i, {
                                  drills: b.drills.map((x, y) =>
                                    y === k ? { ...x, key: e.target.value } : x,
                                  ),
                                })
                              }
                              className="max-w-56 rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground outline-none focus:border-primary"
                            >
                              {swapOptions.map((o) => (
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
              </ul>

              {editable && (
                <div className="mt-2 flex flex-wrap items-center gap-2 print:hidden">
                  {addOptions.length > 0 && (
                    <select
                      value=""
                      onChange={(e) => {
                        if (!e.target.value) return;
                        changeBlock(i, {
                          drills: [...b.drills, { key: e.target.value }],
                        });
                      }}
                      className="rounded-lg border border-dashed border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground/80 outline-none focus:border-primary"
                    >
                      <option value="">+ Add a drill from the library…</option>
                      {addOptions.map((o) => (
                        <option key={o.key} value={o.key}>
                          {o.drill.title} — {o.categoryName}
                        </option>
                      ))}
                    </select>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      changeBlock(i, {
                        drills: [
                          ...b.drills,
                          {
                            key: `custom-${Date.now().toString(36)}`,
                            custom: { title: "", notes: "" },
                          },
                        ],
                      })
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground/80 transition hover:border-primary/40 hover:bg-muted"
                  >
                    <PencilLine className="size-3.5" /> Write your own drill
                  </button>
                </div>
              )}

              {b.coachingFocus && (
                <p className="mt-3 text-sm text-foreground/90">
                  <strong>Coaching focus:</strong> {b.coachingFocus}
                </p>
              )}
              {b.why && (
                <p className="mt-2 text-xs italic text-muted-foreground">
                  {b.why}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {plan.plan.nextTime && (
        <div className="mt-8 rounded-2xl bg-primary/5 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Next session
          </p>
          <p className="mt-2 text-sm text-foreground/90">
            {plan.plan.nextTime}
          </p>
        </div>
      )}

      {!editable ? (
        actions && (
          <div className="mt-8 flex flex-wrap items-center justify-end gap-3 border-t border-border pt-6 print:hidden">
            {actions}
          </div>
        )
      ) : (
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
                <Check className="size-4" />{" "}
                {saving ? "Saving…" : "Save changes"}
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
      )}
    </div>
  );
}
