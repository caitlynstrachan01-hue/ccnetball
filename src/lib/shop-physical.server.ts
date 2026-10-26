import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { PhysicalProduct } from "./shop-physical";

type Row = {
  id: string;
  slug: string;
  name: string;
  short: string;
  description: string;
  price_cents: number;
  stock: number;
  is_limited_edition: boolean;
  photos: string[];
  is_active: boolean;
  sort_order: number;
};

function toProduct(row: Row): PhysicalProduct {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    short: row.short,
    description: row.description,
    priceCents: row.price_cents,
    stock: row.stock,
    isLimitedEdition: row.is_limited_edition,
    photos: row.photos ?? [],
    isActive: row.is_active,
    sortOrder: row.sort_order,
  };
}

export async function listActivePhysicalProducts(): Promise<PhysicalProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shop_physical_products")
    .select(
      "id, slug, name, short, description, price_cents, stock, is_limited_edition, photos, is_active, sort_order",
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("listActivePhysicalProducts failed:", error);
    return [];
  }
  return (data as Row[]).map(toProduct);
}

export async function getPhysicalProductBySlug(
  slug: string,
): Promise<PhysicalProduct | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shop_physical_products")
    .select(
      "id, slug, name, short, description, price_cents, stock, is_limited_edition, photos, is_active, sort_order",
    )
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    console.error("getPhysicalProductBySlug failed:", error);
    return null;
  }
  if (!data) return null;
  return toProduct(data as Row);
}

export async function getPhysicalProductsByIds(
  ids: string[],
): Promise<PhysicalProduct[]> {
  if (!ids.length) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shop_physical_products")
    .select(
      "id, slug, name, short, description, price_cents, stock, is_limited_edition, photos, is_active, sort_order",
    )
    .in("id", ids);
  if (error) {
    console.error("getPhysicalProductsByIds failed:", error);
    return [];
  }
  return (data as Row[]).map(toProduct);
}
