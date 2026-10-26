"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Loader2,
  Package,
  Truck,
} from "lucide-react";
import type { AdminShopOrder } from "@/lib/shop-admin.server";
import { formatPriceCents } from "@/lib/shop-physical";

function formatAddress(order: AdminShopOrder) {
  return [
    order.postalLine1,
    order.postalLine2 || null,
    `${order.postalSuburb} ${order.postalState} ${order.postalPostcode}`,
    "Australia",
  ]
    .filter(Boolean)
    .join(", ");
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function AdminOrders({ orders }: { orders: AdminShopOrder[] }) {
  const paid = orders.filter((o) => o.status === "paid");
  const fulfilled = orders.filter((o) => o.status === "fulfilled");
  const other = orders.filter(
    (o) => o.status !== "paid" && o.status !== "fulfilled",
  );

  return (
    <div className="space-y-10">
      <section>
        <h2 className="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
          <Package className="size-5 text-primary" />
          To ship
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
            {paid.length}
          </span>
        </h2>
        {paid.length === 0 ? (
          <p className="mt-3 rounded-xl border border-border/70 bg-card p-6 text-sm text-muted-foreground">
            No orders waiting to ship right now.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {paid.map((order) => (
              <OrderRow key={order.id} order={order} canShip />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
          <Truck className="size-5 text-primary" />
          Shipped
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
            {fulfilled.length}
          </span>
        </h2>
        {fulfilled.length === 0 ? (
          <p className="mt-3 rounded-xl border border-border/70 bg-card p-6 text-sm text-muted-foreground">
            Nothing shipped yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {fulfilled.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </ul>
        )}
      </section>

      {other.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-muted-foreground">
            Other
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold">
              {other.length}
            </span>
          </h2>
          <ul className="mt-4 space-y-4">
            {other.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function OrderRow({
  order,
  canShip = false,
}: {
  order: AdminShopOrder;
  canShip?: boolean;
}) {
  const [open, setOpen] = useState(canShip);
  const [tracking, setTracking] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!tracking.trim()) {
      setError("Please paste a tracking number first.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/shop/admin/mark-shipped", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          trackingNumber: tracking.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  const postageLabel =
    order.postageType === "express" ? "Express post" : "Standard post";

  return (
    <li className="overflow-hidden rounded-2xl border border-border/70 bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-muted/40"
      >
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-bold">
            {order.orderNumber}{" "}
            <span className="font-normal text-muted-foreground">·</span>{" "}
            <span className="font-semibold">{order.customerName}</span>
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {order.items.map((i) => `${i.quantity} × ${i.name}`).join(", ")}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatPriceCents(order.totalCents)} · {postageLabel} ·{" "}
            {formatDate(order.paidAt || order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusChip status={order.status} />
          {open ? (
            <ChevronDown className="size-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {open && (
        <div className="border-t border-border/60 bg-background/30 px-5 py-5">
          <div className="grid gap-4 text-sm md:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                Customer
              </p>
              <p className="mt-1 font-semibold">{order.customerName}</p>
              <p className="mt-0.5">
                <a
                  href={`mailto:${order.customerEmail}`}
                  className="text-primary hover:underline"
                >
                  {order.customerEmail}
                </a>
              </p>
              {order.customerPhone && (
                <p className="mt-0.5">
                  <a
                    href={`tel:${order.customerPhone}`}
                    className="text-primary hover:underline"
                  >
                    {order.customerPhone}
                  </a>
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                Delivery address
              </p>
              <p className="mt-1">{formatAddress(order)}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                via {postageLabel}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
              Items
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              {order.items.map((i) => (
                <li
                  key={i.product_id}
                  className="flex items-center justify-between"
                >
                  <span>
                    <span className="font-semibold">{i.quantity}</span> ×{" "}
                    {i.name}
                  </span>
                  <span className="font-semibold">
                    {formatPriceCents(i.line_total_cents)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 border-t border-border/60 pt-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Postage ({postageLabel})</span>
                <span>{formatPriceCents(order.postageCents)}</span>
              </div>
              <div className="mt-1 flex items-end justify-between font-display text-base font-bold">
                <span>Total paid</span>
                <span className="text-primary">
                  {formatPriceCents(order.totalCents)}
                </span>
              </div>
            </div>
          </div>

          {order.status === "fulfilled" && order.trackingNumber && (
            <div className="mt-5 rounded-xl bg-primary/5 p-4 text-sm">
              <p className="flex items-center gap-2 font-semibold text-primary">
                <CheckCircle2 className="size-4" />
                Shipped {formatDate(order.shippedAt)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Tracking:{" "}
                <a
                  href={`https://auspost.com.au/mypost/track/#/details/${encodeURIComponent(
                    order.trackingNumber,
                  )}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-semibold text-primary hover:underline"
                >
                  {order.trackingNumber}
                </a>
              </p>
            </div>
          )}

          {canShip && (
            <form
              onSubmit={submit}
              className="mt-5 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4"
            >
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                  Tracking number
                </span>
                <input
                  type="text"
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                  placeholder="e.g. 7A1234567890"
                  className="mt-1 w-full rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm font-mono shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <button
                type="submit"
                disabled={submitting}
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:scale-[1.01] disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                {submitting ? "Sending…" : "Mark as shipped & email customer"}
              </button>
              {error && (
                <p className="mt-2 text-xs text-destructive">{error}</p>
              )}
              <p className="mt-2 text-[11px] text-muted-foreground">
                Fires a branded {postageLabel.toLowerCase()} email to{" "}
                {order.customerEmail}, BCC&apos;d to you.
              </p>
            </form>
          )}
        </div>
      )}
    </li>
  );
}

function StatusChip({ status }: { status: AdminShopOrder["status"] }) {
  const styles: Record<AdminShopOrder["status"], string> = {
    pending: "bg-muted text-muted-foreground",
    paid: "bg-amber-100 text-amber-800",
    fulfilled: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    refunded: "bg-blue-100 text-blue-800",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles[status]}`}
    >
      {status === "paid" ? "To ship" : status}
    </span>
  );
}
