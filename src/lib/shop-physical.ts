export type PhysicalProduct = {
  id: string;
  slug: string;
  name: string;
  short: string;
  description: string;
  priceCents: number;
  stock: number;
  isLimitedEdition: boolean;
  photos: string[];
  isActive: boolean;
  sortOrder: number;
};

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  quantity: number;
  photo: string | null;
  stockAtAdd: number;
};

export type PostageOption = {
  id: "standard" | "express";
  label: string;
  description: string;
  priceCents: number;
};

/**
 * Postage rates depend on what's in the cart.
 * - Posters (wall chart + prints) ship in a tube.
 * - Card packs ship as a letter.
 * - Mixed cart (both): a separate combined rate.
 */
export type PostageCategory = "poster" | "card" | "mixed";

const POSTAGE_RATES: Record<
  PostageCategory,
  { standardCents: number; expressCents: number }
> = {
  poster: { standardCents: 1430, expressCents: 1810 },
  card: { standardCents: 480, expressCents: 1020 },
  mixed: { standardCents: 1730, expressCents: 2210 },
};

const POSTAGE_TURNAROUND: Record<"standard" | "express", string> = {
  standard: "6-10 business days (longer for rural and regional).",
  express: "2-4 business days (longer for rural and regional).",
};

export function getPostageCategory(slug: string): "poster" | "card" {
  return isGreetingCardProduct(slug) ? "card" : "poster";
}

export function getCartPostageCategory(
  items: Array<{ slug: string }>,
): PostageCategory {
  const hasPoster = items.some((i) => getPostageCategory(i.slug) === "poster");
  const hasCard = items.some((i) => getPostageCategory(i.slug) === "card");
  if (hasPoster && hasCard) return "mixed";
  return hasPoster ? "poster" : "card";
}

export function getPostageOptions(
  items: Array<{ slug: string }>,
): PostageOption[] {
  const category = getCartPostageCategory(items);
  const rates = POSTAGE_RATES[category];
  return [
    {
      id: "standard",
      label: "Standard post",
      description: POSTAGE_TURNAROUND.standard,
      priceCents: rates.standardCents,
    },
    {
      id: "express",
      label: "Express post",
      description: POSTAGE_TURNAROUND.express,
      priceCents: rates.expressCents,
    },
  ];
}

export function formatPriceCents(cents: number): string {
  const dollars = cents / 100;
  return `$${dollars.toFixed(2)}`;
}

export function isWallChartProduct(slug: string): boolean {
  return /-wall-chart$/.test(slug);
}

export function isGreetingCardProduct(slug: string): boolean {
  return /-cards-pk\d+$/.test(slug);
}

const RELEASE_DATES: Record<string, string> = {
  "abc-netball-wall-chart": "2026-11-04",
  "eat-sleep-netball-repeat-poster": "2026-11-04",
};

export function getReleaseDate(slug: string): Date | null {
  const dateStr = RELEASE_DATES[slug];
  if (!dateStr) return null;
  const d = new Date(`${dateStr}T00:00:00+10:00`);
  if (Number.isNaN(d.getTime())) return null;
  if (Date.now() >= d.getTime()) return null;
  return d;
}

export function formatReleaseDate(date: Date): string {
  return date.toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Australia/Brisbane",
  });
}

export function formatReleaseDateShort(date: Date): string {
  return date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    timeZone: "Australia/Brisbane",
  });
}

export function stockMessage(stock: number): {
  message: string | null;
  tone: "available" | "low" | "sold-out";
} {
  if (stock <= 0) return { message: "Sold out", tone: "sold-out" };
  if (stock <= 5)
    return {
      message:
        stock === 1
          ? "Only 1 left — limited edition"
          : `Only ${stock} left — limited edition`,
      tone: "low",
    };
  return { message: null, tone: "available" };
}
