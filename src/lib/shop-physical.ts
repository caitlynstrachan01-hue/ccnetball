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

export const POSTAGE_OPTIONS: PostageOption[] = [
  {
    id: "standard",
    label: "Standard post",
    description: "Australia Post regular — typically 3-7 business days.",
    priceCents: 1200,
  },
  {
    id: "express",
    label: "Express post",
    description: "Australia Post Express — typically 1-3 business days.",
    priceCents: 2000,
  },
];

export function formatPriceCents(cents: number): string {
  const dollars = cents / 100;
  return `$${dollars.toFixed(2)}`;
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
