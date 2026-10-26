"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCircle2, Loader2, Mail } from "lucide-react";
import type { WaitlistEntry } from "@/lib/shop-admin.server";

type Grouped = {
  productId: string;
  productSlug: string;
  productName: string;
  productStock: number;
  pending: WaitlistEntry[];
  notified: WaitlistEntry[];
};

export function AdminWaitlist({ entries }: { entries: WaitlistEntry[] }) {
  const groups = new Map<string, Grouped>();
  for (const e of entries) {
    const key = e.productId;
    if (!groups.has(key)) {
      groups.set(key, {
        productId: e.productId,
        productSlug: e.productSlug,
        productName: e.productName,
        productStock: e.productStock,
        pending: [],
        notified: [],
      });
    }
    const group = groups.get(key)!;
    if (e.notifiedAt) {
      group.notified.push(e);
    } else {
      group.pending.push(e);
    }
  }

  const sorted = Array.from(groups.values()).sort(
    (a, b) => b.pending.length - a.pending.length,
  );

  if (sorted.length === 0) {
    return (
      <p className="rounded-xl border border-border/70 bg-card p-6 text-sm text-muted-foreground">
        No one on the waitlist yet.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {sorted.map((group) => (
        <ProductGroup key={group.productId} group={group} />
      ))}
    </div>
  );
}

function ProductGroup({ group }: { group: Grouped }) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function notifyAll() {
    const confirmed = window.confirm(
      `Email all ${group.pending.length} people on the waitlist for "${group.productName}" that it's back in stock?`,
    );
    if (!confirmed) return;
    setSending(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/shop/admin/waitlist-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: group.productId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not send.");
      setResult(
        `Sent to ${data.sent}${data.failed ? ` (${data.failed} failed)` : ""}.`,
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSending(false);
    }
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-border/70 bg-card">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 px-5 py-4">
        <div>
          <h3 className="font-display text-base font-bold">
            {group.productName}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Stock on hand:{" "}
            <strong className="text-foreground">{group.productStock}</strong> ·{" "}
            {group.pending.length} waiting · {group.notified.length} already
            notified
          </p>
        </div>
        {group.pending.length > 0 && (
          <button
            type="button"
            onClick={notifyAll}
            disabled={sending || group.productStock <= 0}
            title={
              group.productStock <= 0
                ? "Add stock in Supabase first"
                : undefined
            }
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Bell className="size-4" />
            )}
            {sending
              ? "Sending…"
              : `Notify everyone (${group.pending.length})`}
          </button>
        )}
      </header>

      {group.productStock <= 0 && group.pending.length > 0 && (
        <p className="border-b border-border/60 bg-amber-50 px-5 py-3 text-xs text-amber-900">
          This product is sold out — add stock in Supabase before you can send
          the back-in-stock email.
        </p>
      )}

      {result && (
        <p className="border-b border-border/60 bg-primary/5 px-5 py-3 text-xs text-primary">
          {result}
        </p>
      )}
      {error && (
        <p className="border-b border-border/60 bg-red-50 px-5 py-3 text-xs text-red-700">
          {error}
        </p>
      )}

      {group.pending.length > 0 && (
        <section className="px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
            Waiting
          </p>
          <ul className="mt-2 divide-y divide-border/60">
            {group.pending.map((e) => (
              <WaitlistRow key={e.id} entry={e} />
            ))}
          </ul>
        </section>
      )}

      {group.notified.length > 0 && (
        <section className="border-t border-border/60 px-5 py-4">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            <CheckCircle2 className="size-3.5" />
            Already notified
          </p>
          <ul className="mt-2 divide-y divide-border/60">
            {group.notified.map((e) => (
              <WaitlistRow key={e.id} entry={e} />
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

function WaitlistRow({ entry }: { entry: WaitlistEntry }) {
  const when = new Date(entry.createdAt).toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-sm">
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">
          {entry.name || "No name"}{" "}
          <span className="font-normal text-muted-foreground">·</span>{" "}
          <a
            href={`mailto:${entry.email}`}
            className="text-primary hover:underline"
          >
            {entry.email}
          </a>
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Mail className="size-3.5" />
        <span>{when}</span>
      </div>
    </li>
  );
}
