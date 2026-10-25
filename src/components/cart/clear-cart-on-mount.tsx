"use client";

import { useEffect } from "react";
import { useCart } from "./cart-context";

/** Clears the cart as soon as it renders — used on the order success page. */
export function ClearCartOnMount() {
  const { clear } = useCart();
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
