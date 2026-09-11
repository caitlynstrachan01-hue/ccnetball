"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  className?: string;
  label?: string;
};

export function SubscribeButton({ className, label = "Subscribe" }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setBusy(true);

    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      router.push(
        `/login?next=${encodeURIComponent("/shop/drills-library")}`,
      );
      return;
    }

    try {
      const res = await fetch("/api/checkout/drills-library", {
        method: "POST",
      });
      const json = await res.json();
      if (json.redirect) {
        window.location.href = json.redirect;
        return;
      }
      if (!json.url) throw new Error(json.error ?? "Checkout failed.");
      window.location.href = json.url;
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Something went wrong. Please try again.",
      );
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className={
          className ??
          "inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
        }
      >
        <ShoppingCart className="size-5" />
        {busy ? "Redirecting to checkout…" : label}
      </button>
      {error && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
