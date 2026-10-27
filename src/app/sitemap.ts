import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/blog-posts";
import { listActivePhysicalProducts } from "@/lib/shop-physical.server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://ccnetball.com";
  const now = new Date();

  const routes = [
    "",
    "/about",
    "/programs",
    "/book",
    "/shop",
    "/shop/drills-library",
    "/shop/trial-app",
    "/library",
    "/gallery",
    "/blog",
    "/contact",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const posts = getPublishedPosts().map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Shop product pages — fetched from Supabase. Guarded so a Supabase hiccup
  // can't break the sitemap build.
  let shopProducts: MetadataRoute.Sitemap = [];
  try {
    const products = await listActivePhysicalProducts();
    shopProducts = products.map((p) => ({
      url: `${base}/shop/${p.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch {
    // ignore — sitemap still serves the static + blog routes
  }

  return [...routes, ...posts, ...shopProducts];
}
