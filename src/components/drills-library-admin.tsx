"use client";

import { useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronRight,
  Clock,
  Dumbbell,
  Film,
  Layers,
  PlayCircle,
  Plus,
  Save,
  Tag,
  Target as TargetIcon,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import {
  AGE_GROUPS,
  SESSION_SLOTS,
  type AgeGroupId,
  type Drill,
  type DrillCategory,
  type SessionSlotId,
} from "@/lib/drills-library-content";
import * as tus from "tus-js-client";
import {
  BUNNY_PREFIX,
  DRILL_VIDEO_BUCKET,
  isEmbedUrl,
} from "@/lib/drills-store";
import { createClient } from "@/lib/supabase/client";

type EditableDrill = Drill & {
  description: string;
  equipment: string;
  groupSize: string;
  makeItEasier: string[];
  makeItHarder: string[];
  variations: string[];
  tags: string[];
  ageGroups: AgeGroupId[];
  ageNotes: Partial<Record<AgeGroupId, string>>;
  sessionSlot: SessionSlotId;
  videoUrl: string;
  /** Created on this page and not saved yet. */
  unsaved?: boolean;
};

type ListKey = "variations" | "makeItHarder" | "makeItEasier";

function toEditable(d: Drill, cat: DrillCategory): EditableDrill {
  return {
    ...d,
    description: d.description ?? "",
    equipment: d.equipment ?? "",
    groupSize: d.groupSize ?? "",
    makeItEasier: d.makeItEasier?.length ? d.makeItEasier : [""],
    makeItHarder: d.makeItHarder?.length ? d.makeItHarder : [""],
    variations: d.variations?.length ? d.variations : [""],
    tags: d.tags ?? [],
    ageGroups: d.ageGroups ?? [],
    ageNotes: d.ageNotes ?? {},
    sessionSlot: d.sessionSlot ?? cat.defaultSlot,
    videoUrl: d.videoUrl ?? "",
  };
}

/** Drills per category, in display order. */
type Library = Record<string, EditableDrill[]>;

type SaveState =
  | { status: "idle" }
  | { status: "saving"; message: string }
  | { status: "saved" }
  | { status: "error"; message: string };

function friendlyError(message: string) {
  if (/maximum allowed size|too large|payload/i.test(message)) {
    return "This video is too big to upload on the current plan (50MB limit). Try a shorter clip or record at 1080p.";
  }
  if (/column|schema cache/i.test(message)) {
    return "The database needs its latest update before this can save. Run the newest setup step in Supabase, then try again.";
  }
  return `Couldn't save: ${message}`;
}

function buildInitialLibrary(categories: DrillCategory[]): Library {
  const lib: Library = {};
  for (const cat of categories) {
    lib[cat.slug] = cat.drills.map((d) => toEditable(d, cat));
  }
  return lib;
}

/** Unique-enough suffix for new drill slugs and video file names. */
function stamp() {
  return Date.now().toString(36);
}

/**
 * Send a video straight from the browser to Bunny Stream. The upload is
 * resumable, so a patchy phone connection doesn't lose progress.
 */
async function uploadToBunny(
  file: File,
  title: string,
  onProgress: (percent: number) => void,
): Promise<string> {
  const res = await fetch("/api/admin/drill-video", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title }),
  });
  const ticket = await res.json();
  if (!res.ok) throw new Error(ticket.error ?? "Couldn't start the upload.");

  await new Promise<void>((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint: "https://video.bunnycdn.com/tusupload",
      retryDelays: [0, 3000, 5000, 10000, 20000, 60000],
      chunkSize: 25 * 1024 * 1024,
      headers: {
        AuthorizationSignature: ticket.signature,
        AuthorizationExpire: String(ticket.expire),
        VideoId: ticket.videoId,
        LibraryId: String(ticket.libraryId),
      },
      metadata: { filetype: file.type || "video/mp4", title },
      onProgress: (sent, total) => onProgress(Math.round((sent / total) * 100)),
      onError: reject,
      onSuccess: () => resolve(),
    });
    upload.start();
  });
  return ticket.videoId as string;
}

async function removeOldVideo(path: string) {
  if (path.startsWith(BUNNY_PREFIX)) {
    await fetch("/api/admin/drill-video", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ videoId: path.slice(BUNNY_PREFIX.length) }),
    });
  } else {
    await createClient().storage.from(DRILL_VIDEO_BUCKET).remove([path]);
  }
}

function normaliseTag(raw: string) {
  return raw.trim().replace(/\s+/g, " ").toLowerCase();
}

export function DrillsLibraryAdmin({
  categories,
  videoHost,
}: {
  categories: DrillCategory[];
  /** Where new uploads go — Bunny Stream once it's configured. */
  videoHost: "bunny" | "supabase";
}) {
  const [library, setLibrary] = useState<Library>(() =>
    buildInitialLibrary(categories),
  );
  const [categorySlug, setCategorySlug] = useState<string>(
    categories[0].slug,
  );
  const [drillSlug, setDrillSlug] = useState<string | undefined>(
    categories[0].drills[0]?.slug,
  );
  // Videos picked but not yet uploaded, keyed by "category/drill".
  const [pendingVideos, setPendingVideos] = useState<Record<string, File>>({});
  const [saveState, setSaveState] = useState<SaveState>({ status: "idle" });
  const [notice, setNotice] = useState<string | null>(null);
  const [tagDraft, setTagDraft] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);

  const category = useMemo<DrillCategory>(
    () => categories.find((c) => c.slug === categorySlug) ?? categories[0],
    [categories, categorySlug],
  );

  const drills = library[categorySlug] ?? [];
  const drill = drills.find((d) => d.slug === drillSlug);
  const drillKey = `${categorySlug}/${drillSlug}`;
  const pendingVideo = pendingVideos[drillKey];

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const list of Object.values(library))
      for (const d of list) for (const t of d.tags) set.add(t);
    return [...set].sort();
  }, [library]);

  function updateDrill(patch: Partial<EditableDrill>) {
    setLibrary((prev) => ({
      ...prev,
      [categorySlug]: prev[categorySlug].map((d) =>
        d.slug === drillSlug ? { ...d, ...patch } : d,
      ),
    }));
  }

  function updateListItem(key: ListKey, index: number, value: string) {
    const next = [...(drill?.[key] ?? [])];
    next[index] = value;
    updateDrill({ [key]: next } as Partial<EditableDrill>);
  }

  function addListItem(key: ListKey) {
    updateDrill({
      [key]: [...(drill?.[key] ?? []), ""],
    } as Partial<EditableDrill>);
  }

  function removeListItem(key: ListKey, index: number) {
    const next = (drill?.[key] ?? []).filter((_, i) => i !== index);
    updateDrill({
      [key]: next.length ? next : [""],
    } as Partial<EditableDrill>);
  }

  function toggleAgeGroup(id: AgeGroupId) {
    if (!drill) return;
    const has = drill.ageGroups.includes(id);
    updateDrill({
      ageGroups: has
        ? drill.ageGroups.filter((a) => a !== id)
        : AGE_GROUPS.map((a) => a.id).filter(
            (a) => a === id || drill.ageGroups.includes(a),
          ),
    });
  }

  function addTag(raw: string) {
    if (!drill) return;
    const tag = normaliseTag(raw);
    if (tag && !drill.tags.includes(tag)) {
      updateDrill({ tags: [...drill.tags, tag] });
    }
    setTagDraft("");
  }

  function handleVideoPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateDrill({ videoUrl: url });
    setPendingVideos((prev) => ({ ...prev, [drillKey]: file }));
    setSaveState({ status: "idle" });
    event.target.value = "";
  }

  async function handleSave() {
    if (!drill || saveState.status === "saving") return;
    if (!drill.title.trim()) {
      setSaveState({ status: "error", message: "Give the drill a title first." });
      return;
    }
    if (drill.ageGroups.length === 0) {
      setSaveState({
        status: "error",
        message: "Pick at least one age group (NetSetGo, Junior or Senior).",
      });
      return;
    }

    const supabase = createClient();
    const key = drillKey;
    const previousPath = drill.videoPath;
    let videoPath = previousPath;

    setNotice(null);
    if (pendingVideo && videoHost === "bunny") {
      setSaveState({ status: "saving", message: "Uploading video… 0%" });
      try {
        const videoId = await uploadToBunny(pendingVideo, drill.title, (pct) =>
          setSaveState({ status: "saving", message: `Uploading video… ${pct}%` }),
        );
        videoPath = `${BUNNY_PREFIX}${videoId}`;
      } catch (e) {
        setSaveState({
          status: "error",
          message: friendlyError(e instanceof Error ? e.message : String(e)),
        });
        return;
      }
    } else if (pendingVideo) {
      setSaveState({ status: "saving", message: "Uploading video…" });
      const ext = pendingVideo.name.split(".").pop()?.toLowerCase() || "mp4";
      videoPath = `${categorySlug}/${drill.slug}-${stamp()}.${ext}`;
      const { error } = await supabase.storage
        .from(DRILL_VIDEO_BUCKET)
        .upload(videoPath, pendingVideo, {
          contentType: pendingVideo.type || "video/mp4",
        });
      if (error) {
        setSaveState({ status: "error", message: friendlyError(error.message) });
        return;
      }
    }

    setSaveState({ status: "saving", message: "Saving drill…" });
    const clean = (list: string[]) => list.map((s) => s.trim()).filter(Boolean);
    const ageNotes: Record<string, string> = {};
    for (const id of drill.ageGroups) {
      const note = drill.ageNotes[id]?.trim();
      if (note) ageNotes[id] = note;
    }
    const { error } = await supabase.from("drills").upsert(
      {
        category_slug: categorySlug,
        slug: drill.slug,
        title: drill.title.trim(),
        description: drill.description.trim() || null,
        equipment: drill.equipment.trim() || null,
        group_size: drill.groupSize.trim() || null,
        make_it_easier: clean(drill.makeItEasier),
        make_it_harder: clean(drill.makeItHarder),
        variations: clean(drill.variations),
        tags: drill.tags,
        age_groups: drill.ageGroups,
        age_notes: ageNotes,
        session_slot: drill.sessionSlot,
        video_path: videoPath ?? null,
        duration_minutes: drill.durationMinutes,
        level: drill.level,
        focus: drill.focus,
        sort_order: drills.findIndex((d) => d.slug === drill.slug),
        published: true,
        hidden: false,
      },
      { onConflict: "category_slug,slug" },
    );
    if (error) {
      setSaveState({ status: "error", message: friendlyError(error.message) });
      return;
    }

    // Replaced video — tidy up the old file so storage doesn't fill up.
    if (pendingVideo && previousPath && previousPath !== videoPath) {
      await removeOldVideo(previousPath).catch(() => {});
    }
    if (pendingVideo && videoHost === "bunny") {
      setNotice(
        "Video uploaded. Bunny is preparing it for streaming — members can watch it in a few minutes.",
      );
    }

    updateDrill({ videoPath, unsaved: false });
    setPendingVideos((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setSaveState({ status: "saved" });
    setTimeout(
      () =>
        setSaveState((s) => (s.status === "saved" ? { status: "idle" } : s)),
      2500,
    );
  }

  function handleAddDrill() {
    const slug = `drill-${stamp()}`;
    const fresh = toEditable(
      {
        slug,
        title: "New drill",
        durationMinutes: 10,
        level: "Intermediate",
        focus: "",
        custom: true,
      },
      category,
    );
    fresh.unsaved = true;
    setLibrary((prev) => ({
      ...prev,
      [categorySlug]: [...(prev[categorySlug] ?? []), fresh],
    }));
    selectDrill(slug);
  }

  async function handleRemoveDrill() {
    if (!drill) return;
    if (!window.confirm(`Remove "${drill.title}" from the library?`)) return;

    if (!drill.unsaved) {
      setSaveState({ status: "saving", message: "Removing…" });
      const supabase = createClient();
      const { error } = await supabase.from("drills").upsert(
        {
          category_slug: categorySlug,
          slug: drill.slug,
          title: drill.title.trim() || "Removed drill",
          hidden: true,
          published: false,
        },
        { onConflict: "category_slug,slug" },
      );
      if (error) {
        setSaveState({ status: "error", message: friendlyError(error.message) });
        return;
      }
    }

    const remaining = drills.filter((d) => d.slug !== drill.slug);
    setLibrary((prev) => ({ ...prev, [categorySlug]: remaining }));
    setDrillSlug(remaining[0]?.slug);
    setSaveState({ status: "idle" });
  }

  // On phones the drill list sits above the editor, so jump down to it.
  function selectDrill(slug: string) {
    setDrillSlug(slug);
    setSaveState({ status: "idle" });
    setNotice(null);
    setTagDraft("");
    if (window.matchMedia("(max-width: 1023px)").matches) {
      editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function selectCategory(slug: string) {
    setCategorySlug(slug);
    setSaveState({ status: "idle" });
    setDrillSlug(library[slug]?.[0]?.slug);
  }

  const saveButton = (
    <button
      type="button"
      onClick={handleSave}
      disabled={saveState.status === "saving"}
      className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:scale-[1.02] disabled:opacity-70"
    >
      <SaveLabel state={saveState} />
    </button>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* LEFT — category + drill picker */}
      <aside className="lg:col-span-4">
        <div className="rounded-2xl border border-border/70 bg-card p-4 md:sticky md:top-24">
          <p className="px-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Categories
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((cat) => {
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
            {drills.map((d, i) => {
              const active = d.slug === drillSlug;
              const hasVideo = Boolean(d.videoPath);
              const hasPending = Boolean(
                pendingVideos[`${categorySlug}/${d.slug}`],
              );
              return (
                <li key={d.slug}>
                  <button
                    type="button"
                    onClick={() => selectDrill(d.slug)}
                    className={
                      active
                        ? "flex w-full items-center gap-3 rounded-xl bg-primary/10 px-3 py-2.5 text-left transition"
                        : "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-muted"
                    }
                  >
                    <span
                      className={
                        active
                          ? "flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground"
                          : "flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground"
                      }
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-foreground">
                        {d.title}
                      </span>
                      <span className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{d.durationMinutes} min</span>
                        <span>·</span>
                        <span
                          className={
                            hasPending || d.unsaved
                              ? "font-semibold text-rose-700"
                              : hasVideo
                                ? "font-semibold text-emerald-700"
                                : "text-amber-700"
                          }
                        >
                          {hasPending || d.unsaved
                            ? "Not saved yet"
                            : hasVideo
                              ? "Video saved"
                              : "No video yet"}
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
          <button
            type="button"
            onClick={handleAddDrill}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border px-3 py-2.5 text-sm font-semibold text-foreground/80 transition hover:border-primary/40 hover:bg-muted"
          >
            <Plus className="size-4" /> Add a drill to {category.name}
          </button>
        </div>
      </aside>

      {/* RIGHT — edit form */}
      <div ref={editorRef} className="scroll-mt-24 lg:col-span-8">
        {!drill ? (
          <div className="rounded-2xl border border-border/70 bg-card p-10 text-center text-sm text-muted-foreground">
            No drills in {category.name} yet. Use &quot;Add a drill&quot; to
            create the first one.
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-border/70 bg-card p-6 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                    {category.name}
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight">
                    {drill.title || "Untitled drill"}
                  </h2>
                </div>
                {saveButton}
              </div>

              {saveState.status === "error" && (
                <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {saveState.message}
                </p>
              )}
              {notice && (
                <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                  {notice}
                </p>
              )}
              {pendingVideo && saveState.status !== "error" && (
                <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  New video picked — press <strong>Save drill</strong> to upload
                  it.
                </p>
              )}

              {/* Video */}
              <div className="mt-6">
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted">
                  {isEmbedUrl(drill.videoUrl) ? (
                    <iframe
                      src={drill.videoUrl}
                      title={drill.title}
                      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 h-full w-full border-0"
                    />
                  ) : drill.videoUrl ? (
                    <video
                      src={drill.videoUrl}
                      controls
                      playsInline
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
                        {videoHost === "bunny"
                          ? "MP4, MOV or WebM · any size — big phone videos are fine"
                          : "MP4, MOV or WebM · up to 50MB on the current plan"}
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

              {/* Basics */}
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <Field
                  label="Drill title"
                  value={drill.title}
                  onChange={(v) => updateDrill({ title: v })}
                />
                <SelectField
                  label="Session slot"
                  value={drill.sessionSlot}
                  onChange={(v) =>
                    updateDrill({ sessionSlot: v as SessionSlotId })
                  }
                  options={SESSION_SLOTS.map((s) => ({
                    value: s.id,
                    label: s.label,
                  }))}
                  iconLeft={<Layers className="size-4" />}
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
                  onChange={(v) => updateDrill({ level: v as Drill["level"] })}
                  options={["Beginner", "Intermediate", "Advanced"].map(
                    (o) => ({ value: o, label: o }),
                  )}
                  iconLeft={<TargetIcon className="size-4" />}
                />
              </div>

              {/* Age groups */}
              <div className="mt-8">
                <p className="text-sm font-bold text-foreground">Age groups</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Pick 1–3. Members only see this drill suggested for these
                  age groups.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {AGE_GROUPS.map((a) => {
                    const on = drill.ageGroups.includes(a.id);
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => toggleAgeGroup(a.id)}
                        aria-pressed={on}
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
              </div>

              {/* Description */}
              <TextArea
                label="Description"
                hint="What the drill is, how to set it up, and the coaching cue members should focus on."
                value={drill.description}
                onChange={(v) => updateDrill({ description: v })}
                rows={5}
              />

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <Field
                  label="Equipment"
                  value={drill.equipment}
                  placeholder="e.g. 1 ball, 4 cones, bibs"
                  onChange={(v) => updateDrill({ equipment: v })}
                  iconLeft={<Dumbbell className="size-4" />}
                />
                <Field
                  label="Group size"
                  value={drill.groupSize}
                  placeholder="e.g. 3–4 players, or whole team"
                  onChange={(v) => updateDrill({ groupSize: v })}
                  iconLeft={<Users className="size-4" />}
                />
              </div>

              <ListEditor
                title="Drill variations"
                hint="Each bullet is a fresh way to run the drill so it doesn't get stale."
                values={drill.variations}
                onChange={(i, v) => updateListItem("variations", i, v)}
                onAdd={() => addListItem("variations")}
                onRemove={(i) => removeListItem("variations", i)}
              />
              <ListEditor
                title="How to make it harder"
                hint="Each bullet is one way to progress the drill for more advanced players."
                values={drill.makeItHarder}
                onChange={(i, v) => updateListItem("makeItHarder", i, v)}
                onAdd={() => addListItem("makeItHarder")}
                onRemove={(i) => removeListItem("makeItHarder", i)}
              />
              <ListEditor
                title="How to make it easier"
                hint="Each bullet is one way to scale the drill down for less experienced players."
                values={drill.makeItEasier}
                onChange={(i, v) => updateListItem("makeItEasier", i, v)}
                onAdd={() => addListItem("makeItEasier")}
                onRemove={(i) => removeListItem("makeItEasier", i)}
              />

              {/* Execution by age */}
              {drill.ageGroups.length > 0 && (
                <div className="mt-8">
                  <p className="text-sm font-bold text-foreground">
                    Execution by age group{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Same skill, different execution — note what changes for
                    each age group.
                  </p>
                  <div className="mt-3 space-y-3">
                    {AGE_GROUPS.filter((a) =>
                      drill.ageGroups.includes(a.id),
                    ).map((a) => (
                      <label key={a.id} className="block">
                        <span className="text-xs font-semibold text-foreground/80">
                          {a.label} ({a.range})
                        </span>
                        <textarea
                          value={drill.ageNotes[a.id] ?? ""}
                          onChange={(e) =>
                            updateDrill({
                              ageNotes: {
                                ...drill.ageNotes,
                                [a.id]: e.target.value,
                              },
                            })
                          }
                          rows={2}
                          placeholder={`How this runs with ${a.label} athletes…`}
                          className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              <div className="mt-8">
                <p className="text-sm font-bold text-foreground">Tags</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Type a tag and press Enter. Tags help the session planner
                  match drills to what a coach asks for.
                </p>
                {drill.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {drill.tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                      >
                        {t}
                        <button
                          type="button"
                          aria-label={`Remove tag ${t}`}
                          onClick={() =>
                            updateDrill({
                              tags: drill.tags.filter((x) => x !== t),
                            })
                          }
                          className="rounded-full p-0.5 hover:bg-primary/20"
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="relative mt-3 flex gap-2">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Tag className="size-4" />
                  </span>
                  <input
                    type="text"
                    value={tagDraft}
                    onChange={(e) => setTagDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        addTag(tagDraft);
                      }
                    }}
                    placeholder="e.g. leads, timing, fun"
                    className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => addTag(tagDraft)}
                    className="shrink-0 rounded-xl border border-border/70 bg-card px-4 text-sm font-semibold text-foreground/90 transition hover:border-primary/40 hover:bg-muted"
                  >
                    Add
                  </button>
                </div>
                {allTags.filter((t) => !drill.tags.includes(t)).length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-muted-foreground">
                      Used before:
                    </span>
                    {allTags
                      .filter((t) => !drill.tags.includes(t))
                      .map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => addTag(t)}
                          className="rounded-full border border-border/70 px-2.5 py-0.5 text-[11px] font-semibold text-foreground/70 transition hover:border-primary/40 hover:text-primary"
                        >
                          + {t}
                        </button>
                      ))}
                  </div>
                )}
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
                <button
                  type="button"
                  onClick={handleRemoveDrill}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition hover:text-red-600"
                >
                  <Trash2 className="size-3.5" /> Remove this drill
                </button>
                <div className="flex items-center gap-4">
                  <p className="hidden text-xs text-muted-foreground sm:block">
                    Saving publishes to the members library.
                  </p>
                  {saveButton}
                </div>
              </div>
            </div>

            <MemberPreview drill={drill} />
          </>
        )}
      </div>
    </div>
  );
}

/** Mirrors how the drill reads inside the members library. */
function MemberPreview({ drill }: { drill: EditableDrill }) {
  return (
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
            {drill.durationMinutes} min · {drill.level}
            {drill.ageGroups.length > 0 &&
              ` · ${AGE_GROUPS.filter((a) => drill.ageGroups.includes(a.id))
                .map((a) => a.label)
                .join(", ")}`}
          </p>
        </div>
      </div>
      {drill.description && (
        <p className="mt-4 text-sm leading-relaxed text-foreground/90">
          {drill.description}
        </p>
      )}
      {(drill.equipment || drill.groupSize) && (
        <p className="mt-3 text-xs text-muted-foreground">
          {drill.equipment && (
            <>
              <strong className="text-foreground/80">Equipment:</strong>{" "}
              {drill.equipment}
            </>
          )}
          {drill.equipment && drill.groupSize && " · "}
          {drill.groupSize && (
            <>
              <strong className="text-foreground/80">Group size:</strong>{" "}
              {drill.groupSize}
            </>
          )}
        </p>
      )}
      <PreviewList title="Drill variations" items={drill.variations} />
      <PreviewList title="How to make it harder" items={drill.makeItHarder} />
      <PreviewList title="How to make it easier" items={drill.makeItEasier} />
    </div>
  );
}

function SaveLabel({ state }: { state: SaveState }) {
  if (state.status === "saving") return <>{state.message}</>;
  if (state.status === "saved")
    return (
      <>
        <Check className="size-4" /> Saved
      </>
    );
  return (
    <>
      <Save className="size-4" /> Save drill
    </>
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

function TextArea({
  label,
  hint,
  value,
  onChange,
  rows,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  rows: number;
}) {
  return (
    <div className="mt-8">
      <label className="block">
        <span className="text-sm font-bold text-foreground">{label}</span>
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder="Write it here…"
          className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </label>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  iconLeft,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
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
          placeholder={placeholder}
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
  options: { value: string; label: string }[];
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
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
}
