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
 * - Posters (wall chart + prints) ship in a tube: higher rate.
 * - Card packs ship as a letter: lower rate.
 * - Mixed cart: the poster rate applies (the tube drives the cost).
 */
export type PostageCategory = "poster" | "card";

const POSTAGE_RATES: Record<
  PostageCategory,
  { standardCents: number; expressCents: number }
> = {
  poster: { standardCents: 1430, expressCents: 1810 },
  card: { standardCents: 480, expressCents: 1020 },
};

const POSTAGE_TURNAROUND: Record<"standard" | "express", string> = {
  standard: "6-10 business days (longer for rural and regional).",
  express: "2-4 business days (longer for rural and regional).",
};

export function getPostageCategory(slug: string): PostageCategory {
  return isGreetingCardProduct(slug) ? "card" : "poster";
}

export function getCartPostageCategory(
  items: Array<{ slug: string }>,
): PostageCategory {
  return items.some((i) => getPostageCategory(i.slug) === "poster")
    ? "poster"
    : "card";
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
