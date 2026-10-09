import {
  DRILL_CATEGORIES,
  type Drill,
  type DrillCategory,
} from "@/lib/drills-library-content";

export const DRILL_VIDEO_BUCKET = "drill-videos";

/** A row from the public.drills table. */
export type DrillRow = {
  category_slug: string;
  slug: string;
  title: string;
  description: string | null;
  make_it_easier: string[];
  make_it_harder: string[];
  variations: string[];
  video_path: string | null;
  duration_minutes: number | null;
  level: string | null;
  focus: string | null;
  published: boolean;
};

export const DRILL_ROW_COLUMNS =
  "category_slug, slug, title, description, make_it_easier, make_it_harder, variations, video_path, duration_minutes, level, focus, published";

function rowKey(category: string, slug: string) {
  return `${category}/${slug}`;
}

function nonEmpty(list: string[] | null | undefined) {
  const clean = (list ?? []).filter((s) => s.trim());
  return clean.length ? clean : undefined;
}

/**
 * Overlay saved rows from the database on top of the built-in drill list,
 * so drills Caitlyn hasn't edited yet still show with their default details.
 */
export function mergeDrills(
  rows: DrillRow[],
  videoUrls: Record<string, string> = {},
): DrillCategory[] {
  const byKey = new Map(rows.map((r) => [rowKey(r.category_slug, r.slug), r]));
  return DRILL_CATEGORIES.map((cat) => ({
    ...cat,
    drills: cat.drills.map((d): Drill => {
      const row = byKey.get(rowKey(cat.slug, d.slug));
      if (!row) return d;
      return {
        ...d,
        title: row.title || d.title,
        description: row.description || d.description,
        makeItEasier: nonEmpty(row.make_it_easier) ?? d.makeItEasier,
        makeItHarder: nonEmpty(row.make_it_harder) ?? d.makeItHarder,
        variations: nonEmpty(row.variations) ?? d.variations,
        durationMinutes: row.duration_minutes ?? d.durationMinutes,
        level: (row.level as Drill["level"]) ?? d.level,
        focus: row.focus ?? d.focus,
        videoPath: row.video_path ?? undefined,
        videoUrl: row.video_path ? videoUrls[row.video_path] : d.videoUrl,
      };
    }),
  }));
}
