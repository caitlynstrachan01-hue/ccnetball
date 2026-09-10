"use client";

import { useMemo, useState } from "react";
import {
  ChevronRight,
  Clock,
  Layers,
  Lock,
  PlayCircle,
  Target as TargetIcon,
} from "lucide-react";
import {
  DRILL_CATEGORIES,
  type Drill,
  type DrillCategory,
} from "@/lib/drills-library-content";

export function DrillsLibraryPreview() {
  const [categorySlug, setCategorySlug] = useState<string>(
    DRILL_CATEGORIES[0].slug,
  );
  const [drillSlug, setDrillSlug] = useState<string>(
    DRILL_CATEGORIES[0].drills[0].slug,
  );

  const category = useMemo<DrillCategory>(
    () =>
      DRILL_CATEGORIES.find((c) => c.slug === categorySlug) ??
      DRILL_CATEGORIES[0],
    [categorySlug],
  );

  const activeDrill = useMemo<Drill>(
    () => category.drills.find((d) => d.slug === drillSlug) ?? category.drills[0],
    [category, drillSlug],
  );

  const drillIndex = category.drills.findIndex((d) => d.slug === activeDrill.slug);
  const upNextInCategory = category.drills.filter(
    (d) => d.slug !== activeDrill.slug,
  );

  function selectCategory(slug: string) {
    setCategorySlug(slug);
    const cat = DRILL_CATEGORIES.find((c) => c.slug === slug);
    if (cat && cat.drills[0]) setDrillSlug(cat.drills[0].slug);
  }

  return (
    <div className="rounded-3xl border border-border/70 bg-card p-4 md:p-6">
      {/* PLAYER + UP-NEXT */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Video player mockup */}
        <div className="lg:col-span-8">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--brand-raspberry)] via-primary to-[var(--brand-coral)]">
            <div className="absolute -top-16 -right-16 size-56 rounded-full bg-white/15 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 size-56 rounded-full bg-white/10 blur-3xl" />

            {/* Play badge */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-white">
              <div className="flex size-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <PlayCircle className="size-12" />
              </div>
              <p className="max-w-xs px-6 text-sm font-semibold opacity-90">
                Preview mode — real videos load here once you subscribe.
              </p>
            </div>

            {/* Locked chip */}
            <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              <Lock className="size-3.5" />
              Members only
            </div>
          </div>

          {/* Title + meta */}
          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              {category.name}
            </p>
            <h3 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">
              {activeDrill.title}
            </h3>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4" />
                {activeDrill.durationMinutes} min
              </span>
              <span className="text-border">·</span>
              <LevelChip level={activeDrill.level} />
              <span className="text-border">·</span>
              <span className="inline-flex items-center gap-1.5">
                <TargetIcon className="size-4" />
                {activeDrill.focus}
              </span>
              <span className="text-border">·</span>
              <span className="inline-flex items-center gap-1.5">
                <Layers className="size-4" />
                Video {drillIndex + 1} of {category.displayCount ?? category.drills.length}
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              A short written summary of the drill sits here — what it&apos;s
              for, how to set it up, and the coaching cues Caitlyn uses on the
              court. Your real drill descriptions will replace this text.
            </p>
          </div>
        </div>

        {/* Up next in this category */}
        <aside className="lg:col-span-4">
          <div className="rounded-2xl bg-muted/40 p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Up next
              </p>
              <p className="text-xs font-semibold text-muted-foreground">
                {category.name}
              </p>
            </div>
            <ul className="mt-4 space-y-2">
              {upNextInCategory.slice(0, 6).map((drill, i) => (
                <li key={drill.slug}>
                  <button
                    type="button"
                    onClick={() => setDrillSlug(drill.slug)}
                    className="group flex w-full items-center gap-3 rounded-xl bg-background p-3 text-left transition hover:bg-primary/5"
                  >
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition group-hover:bg-primary/15">
                      <PlayCircle className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground/90">
                        {drill.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {drill.durationMinutes} min · {drill.level}
                      </p>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                  </button>
                </li>
              ))}
              {upNextInCategory.length === 0 && (
                <li className="rounded-xl bg-background p-3 text-sm text-muted-foreground">
                  You&apos;ve reached the end of this category.
                </li>
              )}
            </ul>
          </div>
        </aside>
      </div>

      {/* CATEGORY TABS */}
      <div className="mt-10">
        <div className="flex flex-wrap gap-2">
          {DRILL_CATEGORIES.map((cat) => {
            const active = cat.slug === category.slug;
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => selectCategory(cat.slug)}
                className={
                  active
                    ? "inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm"
                    : "inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-4 py-2 text-xs font-semibold text-foreground/80 transition hover:border-primary/40 hover:bg-muted"
                }
              >
                {cat.name}
                <span
                  className={
                    active
                      ? "rounded-full bg-white/20 px-1.5 text-[10px] font-bold"
                      : "rounded-full bg-muted px-1.5 text-[10px] font-bold text-muted-foreground"
                  }
                >
                  {cat.displayCount ?? cat.drills.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* CATEGORY GRID */}
        <div className="mt-6">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <h4 className="font-display text-xl font-bold tracking-tight md:text-2xl">
                {category.name}
              </h4>
              <p className="mt-1 text-sm text-muted-foreground">
                {category.short}
              </p>
            </div>
            <p className="whitespace-nowrap text-xs font-semibold text-muted-foreground">
              {category.displayCount ?? category.drills.length} drills · in order
            </p>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {category.drills.map((drill, i) => {
              const active = drill.slug === activeDrill.slug;
              return (
                <button
                  key={drill.slug}
                  type="button"
                  onClick={() => setDrillSlug(drill.slug)}
                  className={
                    active
                      ? "flex flex-col rounded-2xl border border-primary bg-primary/5 p-4 text-left ring-2 ring-primary/20 transition"
                      : "flex flex-col rounded-2xl border border-border/70 bg-background p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                  }
                >
                  {/* Thumbnail */}
                  <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[var(--brand-raspberry)] via-primary to-[var(--brand-coral)]">
                    <PlayCircle className="size-10 text-white drop-shadow-md" />
                    <span className="absolute right-2 top-2 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-bold text-white">
                      {drill.durationMinutes}m
                    </span>
                    <span className="absolute left-2 top-2 rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                      #{i + 1}
                    </span>
                  </div>
                  <div className="mt-3 flex-1">
                    <p className="text-sm font-bold leading-snug text-foreground">
                      {drill.title}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <LevelChip level={drill.level} />
                      <span className="text-muted-foreground">
                        · {drill.focus}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function LevelChip({ level }: { level: Drill["level"] }) {
  const styles: Record<Drill["level"], string> = {
    Beginner: "bg-emerald-100 text-emerald-800",
    Intermediate: "bg-amber-100 text-amber-800",
    Advanced: "bg-rose-100 text-rose-800",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles[level]}`}
    >
      {level}
    </span>
  );
}
