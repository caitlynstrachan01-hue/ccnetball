"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Globe2, Loader2 } from "lucide-react";
import type { AdminCourtPlannerRow } from "@/lib/court-planner-admin.server";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatLocation(country: string | null, city: string | null): string {
  if (!country) return "—";
  return city ? `${city}, ${country}` : country;
}

export function AdminCourtPlanner({ rows }: { rows: AdminCourtPlannerRow[] }) {
  const active = rows.filter((r) => r.suspendedAt === null);
  const suspended = rows.filter((r) => r.suspendedAt !== null);

  return (
    <div className="space-y-10">
      <Section
        title="Active subscriptions"
        icon={<CheckCircle2 className="size-5 text-primary" />}
        count={active.length}
        empty="No active subscriptions right now."
      >
        {active.map((r) => (
          <RowCard key={r.id} row={r} />
        ))}
      </Section>

      <Section
        title="Suspended"
        icon={<AlertTriangle className="size-5 text-amber-600" />}
        count={suspended.length}
        empty="Nothing suspended."
      >
        {suspended.map((r) => (
          <RowCard key={r.id} row={r} />
        ))}
      </Section>
    </div>
  );
}

function Section({
  title,
  icon,
  count,
  empty,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  empty: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
        {icon}
        {title}
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
          {count}
        </span>
      </h2>
      {count === 0 ? (
        <p className="mt-3 rounded-xl border border-border/70 bg-card p-6 text-sm text-muted-foreground">
          {empty}
        </p>
      ) : (
        <ul className="mt-4 space-y-4">{children}</ul>
      )}
    </section>
  );
}

function RowCard({ row }: { row: AdminCourtPlannerRow }) {
  const [busy, setBusy] = useState<"suspend" | "reactivate" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function act(action: "suspend" | "reactivate") {
    let reason: string | undefined;
    if (action === "suspend") {
      const promptReason = window.prompt(
        "Reason for suspension (optional) — e.g. 'Account shared across different cities':",
        "",
      );
      if (promptReason === null) return; // user cancelled
      reason = promptReason.trim() || undefined;
    } else {
      if (
        !window.confirm(
          `Reactivate ${row.userEmail ?? "this subscription"}? The user gets access back immediately.`,
        )
      )
        return;
    }
    setBusy(action);
    setError(null);
    try {
      const res = await fetch("/api/shop/admin/court-planner/suspend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessId: row.id, action, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(null);
    }
  }

  const isSuspended = row.suspendedAt !== null;

  return (
    <li
      id={row.id}
      className="rounded-2xl border border-border/70 bg-card p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-sm font-bold">
            {row.userEmail ?? "(email unavailable)"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Purchased {formatDate(row.purchasedAt)} · expires{" "}
            {formatDate(row.expiresAt)}
          </p>
        </div>
        {isSuspended ? (
          <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
            Suspended
          </span>
        ) : (
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            Active
          </span>
        )}
      </div>

      <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
            Last seen
          </p>
          <p className="mt-1 flex items-center gap-1.5">
            <Globe2 className="size-4 text-muted-foreground" />
            {formatLocation(row.lastSeenCountry, row.lastSeenCity)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatDate(row.lastSeenAt)}
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
            Country history
          </p>
          <p className="mt-1">
            Alerted country:{" "}
            <span className="font-semibold">
              {row.lastAlertedCountry ?? "None yet"}
            </span>
          </p>
          {isSuspended && row.suspendedReason && (
            <p className="mt-1 text-xs text-muted-foreground">
              Reason: {row.suspendedReason}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {isSuspended ? (
          <button
            type="button"
            onClick={() => act("reactivate")}
            disabled={busy !== null}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-md transition hover:scale-[1.01] disabled:opacity-50"
          >
            {busy === "reactivate" && (
              <Loader2 className="size-3 animate-spin" />
            )}
            Reactivate
          </button>
        ) : (
          <button
            type="button"
            onClick={() => act("suspend")}
            disabled={busy !== null}
            className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-500/20 disabled:opacity-50"
          >
            {busy === "suspend" && (
              <Loader2 className="size-3 animate-spin" />
            )}
            Suspend
          </button>
        )}
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
      </div>
    </li>
  );
}
