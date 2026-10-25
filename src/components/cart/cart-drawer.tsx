"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "./cart-context";
import { formatPriceCents } from "@/lib/shop-physical";

export function CartDrawer() {
  const { isDrawerOpen, closeDrawer, items, subtotalCents, setQuantity, removeItem } =
    useCart();

  useEffect(() => {
    if (!isDrawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen, closeDrawer]);

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] print:hidden" aria-modal="true" role="dialog">
      <button
        type="button"
        onClick={closeDrawer}
        aria-label="Close cart"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background shadow-2xl">
        <header className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="size-5 text-primary" />
            <h2 className="font-display text-lg font-bold">Your cart</h2>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close cart"
            className="rounded-full p-2 text-muted-foreground transition hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingBag className="size-10 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                Your cart is empty.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.productId}
                  className="flex gap-3 rounded-xl border border-border/70 bg-card p-3"
                >
                  <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                    {item.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.photo}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ShoppingBag className="size-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="truncate font-display text-sm font-bold">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatPriceCents(item.priceCents)} each
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-full border border-border/70">
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(item.productId, item.quantity - 1)
                          }
                          aria-label="Decrease quantity"
                          className="rounded-full p-1 text-muted-foreground hover:bg-muted"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(item.productId, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.stockAtAdd}
                          aria-label="Increase quantity"
                          className="rounded-full p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        aria-label="Remove from cart"
                        className="rounded-full p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="border-t border-border/60 px-5 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-display text-base font-bold">
                {formatPriceCents(subtotalCents)}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Postage calculated at checkout.
            </p>
            <Link
              href="/checkout"
              onClick={closeDrawer}
              className="mt-4 flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:scale-[1.01]"
            >
              Checkout
            </Link>
          </footer>
        )}
      </aside>
    </div>
  );
}
