"use client";

import { useState } from "react";
import { Bell, CheckCircle2, Loader2 } from "lucide-react";

export function WaitlistForm({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/shop/waitlist/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, email, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <p className="font-display text-base font-bold">
              You&apos;re on the list.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              We&apos;ll email you the moment the {productName} is back in stock
              — usually within a few days of restocking.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-primary/20 bg-primary/5 p-5"
    >
      <div className="flex items-center gap-2 text-primary">
        <Bell className="size-4" />
        <p className="font-display text-base font-bold">
          Notify me when it&apos;s back
        </p>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        We&apos;ll email you the moment the {productName} is back in stock. No
        spam, no updates — just the one message.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Your name (optional)
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Email <span className="text-primary">*</span>
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:scale-[1.01] disabled:opacity-60"
      >
        {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
        {submitting ? "Adding you…" : "Add me to the waitlist"}
      </button>

      {error && (
        <p className="mt-3 text-xs text-destructive">{error}</p>
      )}
    </form>
  );
}
