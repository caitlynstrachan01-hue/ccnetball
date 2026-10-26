"use client";

import { useState } from "react";
import { ArrowRight, Loader2, ShoppingCart } from "lucide-react";

export function CompetitionBuilderBuyButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function buy() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/competition-builder", {
        method: "POST",
      });
      const data = await res.json();
      if (data.redirect) {
        window.location.href = data.redirect;
        return;
      }
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Could not start payment.");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={buy}
        disabled={loading}
        className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <ShoppingCart className="size-5" />
        )}
        {loading ? "Starting checkout…" : "Buy a licence — $19.99"}
        {!loading && <ArrowRight className="size-4" />}
      </button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        One flat payment covers one competition. You&apos;ll go to Stripe to
        pay, then land in the builder with your licence attached.
      </p>
      {error && (
        <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}
    </>
  );
}
