"use client";

import { useMemo, useState } from "react";
import {
  Check,
  ChevronRight,
  Clock,
  Film,
  Layers,
  PlayCircle,
  Plus,
  Save,
  Target as TargetIcon,
  Trash2,
  Upload,
} from "lucide-react";
import {
  DRILL_CATEGORIES,
  type Drill,
  type DrillCategory,
} from "@/lib/drills-library-content";

type EditableDrill = Drill & {
  makeItEasier: string[];
  makeItHarder: string[];
  variations: string[];
  description: string;
  videoUrl: string;
};

function toEditable(d: Drill): EditableDrill {
  return {
    ...d,
    description: d.description ?? "",
    makeItEasier: d.makeItEasier ?? [""],
    makeItHarder: d.makeItHarder ?? [""],
    variations: d.variations ?? [""],
    videoUrl: d.videoUrl ?? "",
  };
}

type Library = Record<string, Record<string, EditableDrill>>;

function buildInitialLibrary(): Library {
  const lib: Library = {};
  for (const cat of DRILL_CATEGORIES) {
    lib[cat.slug] = {};
    for (const d of cat.drills) {
      lib[cat.slug][d.slug] = toEditable(d);
    }
  }
  return lib;
}

export function DrillsLibraryAdmin() {
  const [library, setLibrary] = useState<Library>(buildInitialLibrary);
  const [categorySlug, setCategorySlug] = useState<string>(
    DRILL_CATEGORIES[0].slug,
  );
  const [drillSlug, setDrillSlug] = useState<string>(
    DRILL_CATEGORIES[0].drills[0].slug,
  );
  const [savedFlash, setSavedFlash] = useState(false);

  const category = useMemo<DrillCategory>(
    () =>
      DRILL_CATEGORIES.find((c) => c.slug === categorySlug) ??
      DRILL_CATEGORIES[0],
    [categorySlug],
  );

  const drill = library[categorySlug]?.[drillSlug];

  function updateDrill(patch: Partial<EditableDrill>) {
    setLibrary((prev) => ({
      ...prev,
      [categorySlug]: {
        ...prev[categorySlug],
        [drillSlug]: { ...prev[categorySlug][drillSlug], ...patch },
      },
    }));
  }

  function updateListItem(
    key: "makeItEasier" | "makeItHarder" | "variations",
    index: number,
    value: string,
  ) {
    const current = drill?.[key] ?? [];
    const next = [...current];
    next[index] = value;
    updateDrill({ [key]: next } as Partial<EditableDrill>);
  }

  function addListItem(
    key: "makeItEasier" | "makeItHarder" | "variations",
  ) {
    const current = drill?.[key] ?? [];
    updateDrill({ [key]: [...current, ""] } as Partial<EditableDrill>);
  }

  function removeListItem(
    key: "makeItEasier" | "makeItHarder" | "variations",
    index: number,
  ) {
    const current = drill?.[key] ?? [];
    const next = current.filter((_, i) => i !== index);
    updateDrill({
      [key]: next.length ? next : [""],
    } as Partial<EditableDrill>);
  }

  function handleVideoPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateDrill({ videoUrl: url });
  }

  function handleSave() {
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1800);
  }

  function selectCategory(slug: string) {
    setCategorySlug(slug);
    const cat = DRILL_CATEGORIES.find((c) => c.slug === slug);
    if (cat?.drills[0]) setDrillSlug(cat.drills[0].slug);
  }

  if (!drill) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* LEFT — category + drill picker */}
      <aside className="lg:col-span-4">
        <div className="rounded-2xl border border-border/70 bg-card p-4 md:sticky md:top-24">
          <p className="px-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Categories
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {DRILL_CATEGORIES.map((cat) => {
              const active = cat.slug === category.slug;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => selectCategory(cat.slug)}
                  className={
                    active
                      ? "inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                      : "inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-1.5 text-xs font-semibold text-foreground/80 transition hover:border-primary/40 hover:bg-muted"
                  }
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          <p className="mt-6 px-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Drills in {category.name}
          </p>
          <ul className="mt-3 space-y-1">
            {category.drills.map((d, i) => {
              const active = d.slug === drill.slug;
              const editable = library[categorySlug]?.[d.slug];
              const hasVideo = Boolean(editable?.videoUrl);
              return (
                <li key={d.slug}>
                  <button
                    type="button"
                    onClick={() => setDrillSlug(d.slug)}
                    className={
                      active
                        ? "flex w-full items-center gap-3 rounded-xl bg-primary/10 px-3 py-2.5 text-left transition"
                        : "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-muted"
                    }
                  >
                    <span
                      className={
                        active
                          ? "flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold"
                          : "flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground"
                      }
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-foreground">
                        {editable?.title ?? d.title}
                      </span>
                      <span className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{editable?.durationMinutes ?? d.durationMinutes} min</span>
                        <span>·</span>
                        <span>{editable?.level ?? d.level}</span>
                        <span>·</span>
                        <span
                          className={
                            hasVideo
                              ? "font-semibold text-emerald-700"
                              : "text-amber-700"
                          }
                        >
                          {hasVideo ? "Video ready" : "No video yet"}
                        </span>
                      </span>
                    </span>
                    <ChevronRight
                      className={
                        active
                          ? "size-4 text-primary"
                          : "size-4 text-muted-foreground"
                      }
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      {/* RIGHT — edit form */}
      <div className="lg:col-span-8">
        <div className="rounded-2xl border border-border/70 bg-card p-6 md:p-8">
          {/* Video upload area */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                {category.name}
              </p>
              <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight">
                {drill.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:scale-[1.02]"
            >
              {savedFlash ? (
                <>
                  <Check className="size-4" /> Saved
                </>
              ) : (
                <>
                  <Save className="size-4" /> Save drill
                </>
              )}
            </button>
          </div>

          {/* Video area */}
          <div className="mt-6">
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted">
              {drill.videoUrl ? (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video
                  src={drill.videoUrl}
                  controls
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-[var(--brand-raspberry)] via-primary to-[var(--brand-coral)] text-white">
                  <Film className="size-10 opacity-80" />
                  <p className="text-sm font-semibold opacity-90">
                    No video uploaded yet
                  </p>
                </div>
              )}
            </div>

            <label className="mt-4 flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-dashed border-border bg-background px-5 py-4 transition hover:border-primary/40 hover:bg-muted">
              <span className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Upload className="size-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-foreground">
                    {drill.videoUrl ? "Replace video" : "Upload video"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    MP4, MOV or WebM · any resolution
                  </span>
                </span>
              </span>
              <span className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
                Choose file
              </span>
              <input
                type="file"
                accept="video/*"
                className="sr-only"
                onChange={handleVideoPick}
              />
            </label>
          </div>

          {/* Title + meta */}
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <Field
              label="Drill title"
              value={drill.title}
              onChange={(v) => updateDrill({ title: v })}
            />
            <Field
              label="Focus"
              value={drill.focus}
              onChange={(v) => updateDrill({ focus: v })}
              iconLeft={<TargetIcon className="size-4" />}
            />
            <Field
              label="Duration (minutes)"
              type="number"
              value={String(drill.durationMinutes)}
              onChange={(v) =>
                updateDrill({ durationMinutes: Number(v) || 0 })
              }
              iconLeft={<Clock className="size-4" />}
            />
            <SelectField
              label="Level"
              value={drill.level}
              onChange={(v) =>
                updateDrill({ level: v as Drill["level"] })
              }
              options={["Beginner", "Intermediate", "Advanced"]}
              iconLeft={<Layers className="size-4" />}
            />
          </div>

          {/* Description */}
          <div className="mt-8">
            <label className="block">
              <span className="text-sm font-semibold text-foreground/90">
                Drill description
              </span>
              <p className="mt-1 text-xs text-muted-foreground">
                A short paragraph — what the drill is, how to set it up, and
                the coaching cue you want members to focus on.
              </p>
              <textarea
                value={drill.description}
                onChange={(e) =>
                  updateDrill({ description: e.target.value })
                }
                rows={5}
                placeholder="Write the description here…"
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
          </div>

          {/* Make it easier */}
          <ListEditor
            title="Make It Easier"
            hint="Each bullet is one way to scale the drill down for less experienced players."
            values={drill.makeItEasier}
            onChange={(i, v) => updateListItem("makeItEasier", i, v)}
            onAdd={() => addListItem("makeItEasier")}
            onRemove={(i) => removeListItem("makeItEasier", i)}
          />

          {/* Make it harder */}
          <ListEditor
            title="Make It Harder"
            hint="Each bullet is one way to progress the drill for more advanced players."
            values={drill.makeItHarder}
            onChange={(i, v) => updateListItem("makeItHarder", i, v)}
            onAdd={() => addListItem("makeItHarder")}
            onRemove={(i) => removeListItem("makeItHarder", i)}
          />

          {/* Variations */}
          <ListEditor
            title="Variations"
            hint="Each bullet is a fresh way to run the drill so it doesn't get stale."
            values={drill.variations}
            onChange={(i, v) => updateListItem("variations", i, v)}
            onAdd={() => addListItem("variations")}
            onRemove={(i) => removeListItem("variations", i)}
          />

          {/* Preview link + final save */}
          <div className="mt-10 flex items-center justify-between gap-4 border-t border-border pt-6">
            <p className="text-xs text-muted-foreground">
              Preview mode — this drill will show your edits inside the
              library once we hook the database up.
            </p>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:scale-[1.02]"
            >
              {savedFlash ? (
                <>
                  <Check className="size-4" /> Saved
                </>
              ) : (
                <>
                  <Save className="size-4" /> Save drill
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live preview mimicking the public library layout */}
        <div className="mt-8 rounded-2xl border border-border/70 bg-background p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            How members will see it
          </p>
          <div className="mt-4 flex items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <PlayCircle className="size-7" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold leading-snug">
                {drill.title}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {drill.durationMinutes} min · {drill.level} · {drill.focus}
              </p>
            </div>
          </div>
          {drill.description && (
            <p className="mt-4 text-sm leading-relaxed text-foreground/90">
              {drill.description}
            </p>
          )}
          {drill.makeItEasier.filter((s) => s.trim()).length > 0 && (
            <PreviewList title="Make it easier" items={drill.makeItEasier} />
          )}
          {drill.makeItHarder.filter((s) => s.trim()).length > 0 && (
            <PreviewList title="Make it harder" items={drill.makeItHarder} />
          )}
          {drill.variations.filter((s) => s.trim()).length > 0 && (
            <PreviewList title="Variations" items={drill.variations} />
          )}
        </div>
      </div>
    </div>
  );
}

function ListEditor({
  title,
  hint,
  values,
  onChange,
  onAdd,
  onRemove,
}: {
  title: string;
  hint: string;
  values: string[];
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-foreground">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 py-1.5 text-xs font-semibold text-foreground/90 transition hover:border-primary/40 hover:bg-muted"
        >
          <Plus className="size-3.5" /> Add bullet
        </button>
      </div>
      <ul className="mt-3 space-y-2">
        {values.map((value, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
              {i + 1}
            </span>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(i, e.target.value)}
              placeholder="Type a bullet point…"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={() => onRemove(i)}
              aria-label="Remove bullet"
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PreviewList({ title, items }: { title: string; items: string[] }) {
  const clean = items.filter((s) => s.trim());
  if (clean.length === 0) return null;
  return (
    <div className="mt-5">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
        {title}
      </p>
      <ul className="mt-2 space-y-1.5 text-sm">
        {clean.map((s, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
            <span className="text-foreground/90">{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  iconLeft,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  iconLeft?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-foreground/90">{label}</span>
      <div className="relative mt-2">
        {iconLeft && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {iconLeft}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-xl border border-border bg-background py-2.5 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${
            iconLeft ? "pl-10" : "pl-3"
          }`}
        />
      </div>
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  iconLeft,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  iconLeft?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-foreground/90">{label}</span>
      <div className="relative mt-2">
        {iconLeft && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {iconLeft}
          </span>
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-xl border border-border bg-background py-2.5 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${
            iconLeft ? "pl-10" : "pl-3"
          }`}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
}
