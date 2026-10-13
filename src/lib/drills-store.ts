import {
  AGE_GROUPS,
  DRILL_CATEGORIES,
  SESSION_SLOTS,
  type AgeGroupId,
  type Drill,
  type DrillCategory,
  type SessionSlotId,
} from "@/lib/drills-library-content";

export const DRILL_VIDEO_BUCKET = "drill-videos";

/** video_path prefix for videos hosted on Bunny Stream. */
export const BUNNY_PREFIX = "bunny:";

/** Bunny videos play in Bunny's player iframe rather than a <video> tag. */
export function isEmbedUrl(url: string | undefined) {
  return Boolean(url?.startsWith("https://iframe.mediadelivery.net/"));
}

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
  sort_order: number;
  published: boolean;
  equipment: string | null;
  group_size: string | null;
  tags: string[];
  age_groups: string[];
  age_notes: Record<string, string> | null;
  session_slot: string | null;
  hidden: boolean;
  pdf_path?: string | null;
  coaching_points?: string[];
};

export const DRILL_ROW_COLUMNS =
  "category_slug, slug, title, description, make_it_easier, make_it_harder, variations, video_path, duration_minutes, level, focus, sort_order, published, equipment, group_size, tags, age_groups, age_notes, session_slot, hidden";

/** Columns added by migration 0004 — loaded separately so older databases still work. */
export const DRILL_ROW_COLUMNS_WITH_PDF = `${DRILL_ROW_COLUMNS}, pdf_path`;

/** Newest columns first — the loader falls back if a migration hasn't run. */
export const DRILL_ROW_COLUMN_SETS = [
  `${DRILL_ROW_COLUMNS_WITH_PDF}, coaching_points`, // 0007
  DRILL_ROW_COLUMNS_WITH_PDF, // 0004
  DRILL_ROW_COLUMNS,
];

/** Storage folder (inside DRILL_VIDEO_BUCKET) for downloadable skill sheets. */
export const DRILL_PDF_FOLDER = "pdfs";

function rowKey(category: string, slug: string) {
  return `${category}/${slug}`;
}

function nonEmpty(list: string[] | null | undefined) {
  const clean = (list ?? []).filter((s) => s.trim());
  return clean.length ? clean : undefined;
}

const AGE_IDS = new Set<string>(AGE_GROUPS.map((a) => a.id));
const SLOT_IDS = new Set<string>(SESSION_SLOTS.map((s) => s.id));

function applyRow(
  base: Drill,
  row: DrillRow,
  videoUrls: Record<string, string>,
): Drill {
  const ageNotes: Partial<Record<AgeGroupId, string>> = {};
  for (const [k, v] of Object.entries(row.age_notes ?? {})) {
    if (AGE_IDS.has(k) && v?.trim()) ageNotes[k as AgeGroupId] = v;
  }
  return {
    ...base,
    title: row.title || base.title,
    description: row.description ?? undefined,
    coachingPoints: nonEmpty(row.coaching_points),
    makeItEasier: nonEmpty(row.make_it_easier),
    makeItHarder: nonEmpty(row.make_it_harder),
    variations: nonEmpty(row.variations),
    // A saved row is the source of truth — blank means Caitlyn cleared it.
    durationMinutes: row.duration_minutes ?? 0,
    focus: row.focus ?? base.focus,
    equipment: row.equipment ?? undefined,
    groupSize: row.group_size ?? undefined,
    tags: row.tags ?? [],
    ageGroups: (row.age_groups ?? []).filter((a) =>
      AGE_IDS.has(a),
    ) as AgeGroupId[],
    ageNotes,
    sessionSlot:
      row.session_slot && SLOT_IDS.has(row.session_slot)
        ? (row.session_slot as SessionSlotId)
        : base.sessionSlot,
    pdfPath: row.pdf_path ?? undefined,
    pdfUrl: row.pdf_path ? videoUrls[row.pdf_path] : undefined,
    videoPath: row.video_path ?? undefined,
    videoUrl: row.video_path ? videoUrls[row.video_path] : base.videoUrl,
  };
}

/**
 * Overlay saved rows from the database on top of the built-in drill list,
 * so drills Caitlyn hasn't edited yet still show with their default details.
 * Drills she added on the admin page are appended; removed drills drop out.
 */
export function mergeDrills(
  rows: DrillRow[],
  videoUrls: Record<string, string> = {},
): DrillCategory[] {
  const byKey = new Map(rows.map((r) => [rowKey(r.category_slug, r.slug), r]));
  return DRILL_CATEGORIES.map((cat) => {
    const builtIn = new Set(cat.drills.map((d) => d.slug));
    const drills = cat.drills.map((d) => {
      const row = byKey.get(rowKey(cat.slug, d.slug));
      return { drill: row ? applyRow(d, row, videoUrls) : d, row };
    });
    const added = rows
      .filter((r) => r.category_slug === cat.slug && !builtIn.has(r.slug))
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((row) => ({
        row,
        drill: applyRow(
          {
            slug: row.slug,
            title: row.title,
            durationMinutes: row.duration_minutes ?? 0,
            focus: "",
            custom: true,
          },
          row,
          videoUrls,
        ),
      }));
    return {
      ...cat,
      // Real counts once the library is live — the demo numbers no longer apply.
      displayCount: undefined,
      drills: [...drills, ...added]
        .filter(({ row }) => !row?.hidden)
        .map(({ drill }) => drill),
    };
  });
}

/** The slot a drill fills in a session — its own override or its category's. */
export function drillSlot(
  drill: Drill,
  category: DrillCategory,
): SessionSlotId {
  return drill.sessionSlot ?? category.defaultSlot;
}
