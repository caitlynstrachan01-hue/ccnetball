"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "./cart-context";

export function CartTrigger({ className = "" }: { className?: string }) {
  const { itemCount, openDrawer } = useCart();
  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-label={`Open cart (${itemCount} items)`}
      className={`relative inline-flex items-center justify-center rounded-full p-2 text-foreground transition hover:bg-muted ${className}`}
    >
      <ShoppingBag className="size-5" />
      {itemCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
          {itemCount}
        </span>
      )}
    </button>
  );
}
