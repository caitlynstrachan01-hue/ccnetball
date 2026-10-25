"use client";

import { useState } from "react";
import { ArrowLeft, Minus, Plus, ShoppingBag, Sparkles } from "lucide-react";
import Link from "next/link";
import { useCart } from "./cart/cart-context";
import {
  type PhysicalProduct,
  formatPriceCents,
  stockMessage,
} from "@/lib/shop-physical";

export function PhysicalProductDetail({ product }: { product: PhysicalProduct }) {
  const [activePhoto, setActivePhoto] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addItem, openDrawer } = useCart();

  const stockInfo = stockMessage(product.stock);
  const soldOut = product.stock <= 0;

  const photo = product.photos[activePhoto] ?? null;

  function handleAddToCart() {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      priceCents: product.priceCents,
      quantity,
      photo: product.photos[0] ?? null,
      stockAtAdd: product.stock,
    });
    openDrawer();
  }

  return (
    <section className="py-10 lg:py-14">
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition hover:text-primary"
        >
          <ArrowLeft className="size-4" /> Back to shop
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <div>
            <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-border/70 bg-muted">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <ShoppingBag className="size-14" />
                  <p className="text-xs uppercase tracking-[0.2em]">
                    Photo coming soon
                  </p>
                </div>
              )}
              {product.isLimitedEdition && (
                <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-[var(--brand-raspberry)] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                  <Sparkles className="size-3" /> Limited edition
                </span>
              )}
            </div>
            {product.photos.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {product.photos.map((p, i) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setActivePhoto(i)}
                    aria-label={`View photo ${i + 1}`}
                    className={`size-16 shrink-0 overflow-hidden rounded-xl border transition ${
                      i === activePhoto
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border/70"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight md:text-4xl">
              {product.name}
            </h1>
            <p className="mt-3 text-base text-muted-foreground">
              {product.short}
            </p>

            <div className="mt-6 flex items-end gap-3">
              <span className="font-display text-3xl font-extrabold text-primary">
                {formatPriceCents(product.priceCents)}
              </span>
              <span className="pb-1 text-sm text-muted-foreground">
                + postage
              </span>
            </div>

            {stockInfo.message && (
              <p
                className={`mt-3 text-sm font-semibold ${
                  stockInfo.tone === "sold-out"
                    ? "text-destructive"
                    : "text-[var(--brand-raspberry)]"
                }`}
              >
                {stockInfo.message}
              </p>
            )}

            <div className="mt-8 space-y-6">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {product.description}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-card">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={soldOut}
                  aria-label="Decrease quantity"
                  className="rounded-full p-2 text-muted-foreground hover:bg-muted disabled:opacity-30"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-8 text-center font-semibold">{quantity}</span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stock, q + 1))
                  }
                  disabled={soldOut || quantity >= product.stock}
                  aria-label="Increase quantity"
                  className="rounded-full p-2 text-muted-foreground hover:bg-muted disabled:opacity-30"
                >
                  <Plus className="size-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={soldOut}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingBag className="size-4" />
                {soldOut ? "Sold out" : "Add to cart"}
              </button>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
              Postage calculated at checkout. Shipped from Brisbane, Australia.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
