"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import {
  formatPriceCents,
  getPostageOptions,
  type PostageOption,
} from "@/lib/shop-physical";

type FieldErrors = Partial<Record<string, string>>;

const AU_STATES = ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"];

export function CheckoutForm() {
  const { items, subtotalCents } = useCart();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [postalLine1, setPostalLine1] = useState("");
  const [postalLine2, setPostalLine2] = useState("");
  const [postalSuburb, setPostalSuburb] = useState("");
  const [postalState, setPostalState] = useState("QLD");
  const [postalPostcode, setPostalPostcode] = useState("");

  const [billingSame, setBillingSame] = useState(true);
  const [billingLine1, setBillingLine1] = useState("");
  const [billingLine2, setBillingLine2] = useState("");
  const [billingSuburb, setBillingSuburb] = useState("");
  const [billingState, setBillingState] = useState("QLD");
  const [billingPostcode, setBillingPostcode] = useState("");

  const [postageId, setPostageId] = useState<PostageOption["id"]>("standard");
  const postageOptions = useMemo(() => getPostageOptions(items), [items]);
  const postage =
    postageOptions.find((p) => p.id === postageId) ?? postageOptions[0];

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const totalCents = useMemo(
    () => subtotalCents + postage.priceCents,
    [subtotalCents, postage.priceCents],
  );

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-border/70 bg-card p-10 text-center">
        <ShoppingBag className="size-10 text-muted-foreground" />
        <h2 className="mt-4 font-display text-xl font-bold">
          Your cart is empty.
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Head back to the shop to add a few things first.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:scale-[1.02]"
        >
          Back to the shop
        </Link>
      </div>
    );
  }

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!name.trim()) next.name = "Your name is needed.";
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email.";
    if (!phone.trim() || phone.replace(/\D/g, "").length < 8)
      next.phone = "Enter a phone we can call if there's a delivery issue.";
    if (!postalLine1.trim()) next.postalLine1 = "Delivery address is needed.";
    if (!postalSuburb.trim()) next.postalSuburb = "Suburb is needed.";
    if (!/^\d{4}$/.test(postalPostcode))
      next.postalPostcode = "Enter a 4-digit postcode.";
    if (!billingSame) {
      if (!billingLine1.trim()) next.billingLine1 = "Billing address needed.";
      if (!billingSuburb.trim()) next.billingSuburb = "Billing suburb needed.";
      if (!/^\d{4}$/.test(billingPostcode))
        next.billingPostcode = "Enter a 4-digit postcode.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/shop/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
          customer: {
            name,
            email,
            phone,
          },
          postal: {
            line1: postalLine1,
            line2: postalLine2 || null,
            suburb: postalSuburb,
            state: postalState,
            postcode: postalPostcode,
          },
          billing: billingSame
            ? null
            : {
                line1: billingLine1,
                line2: billingLine2 || null,
                suburb: billingSuburb,
                state: billingState,
                postcode: billingPostcode,
              },
          postageType: postageId,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Checkout could not be started.");
      }
      window.location.href = data.url;
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-12">
      <div className="space-y-8 lg:col-span-7">
        {/* Contact */}
        <fieldset className="space-y-4 rounded-3xl border border-border/70 bg-card p-6">
          <legend className="px-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Your details
          </legend>
          <TextField
            label="Full name"
            value={name}
            onChange={setName}
            error={errors.name}
            required
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            error={errors.email}
            required
          />
          <TextField
            label="Phone"
            type="tel"
            value={phone}
            onChange={setPhone}
            error={errors.phone}
            required
          />
        </fieldset>

        {/* Postal */}
        <fieldset className="space-y-4 rounded-3xl border border-border/70 bg-card p-6">
          <legend className="px-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Delivery address
          </legend>
          <TextField
            label="Street address"
            value={postalLine1}
            onChange={setPostalLine1}
            error={errors.postalLine1}
            required
          />
          <TextField
            label="Apartment / unit (optional)"
            value={postalLine2}
            onChange={setPostalLine2}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Suburb"
              value={postalSuburb}
              onChange={setPostalSuburb}
              error={errors.postalSuburb}
              required
            />
            <SelectField
              label="State"
              value={postalState}
              onChange={setPostalState}
              options={AU_STATES.map((s) => ({ value: s, label: s }))}
            />
          </div>
          <TextField
            label="Postcode"
            value={postalPostcode}
            onChange={setPostalPostcode}
            error={errors.postalPostcode}
            required
          />
        </fieldset>

        {/* Billing */}
        <fieldset className="space-y-4 rounded-3xl border border-border/70 bg-card p-6">
          <legend className="px-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Billing address
          </legend>
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={billingSame}
              onChange={(e) => setBillingSame(e.target.checked)}
              className="mt-0.5 size-4"
            />
            <span>Same as delivery address.</span>
          </label>
          {!billingSame && (
            <div className="space-y-4">
              <TextField
                label="Street address"
                value={billingLine1}
                onChange={setBillingLine1}
                error={errors.billingLine1}
                required
              />
              <TextField
                label="Apartment / unit (optional)"
                value={billingLine2}
                onChange={setBillingLine2}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Suburb"
                  value={billingSuburb}
                  onChange={setBillingSuburb}
                  error={errors.billingSuburb}
                  required
                />
                <SelectField
                  label="State"
                  value={billingState}
                  onChange={setBillingState}
                  options={AU_STATES.map((s) => ({ value: s, label: s }))}
                />
              </div>
              <TextField
                label="Postcode"
                value={billingPostcode}
                onChange={setBillingPostcode}
                error={errors.billingPostcode}
                required
              />
            </div>
          )}
        </fieldset>

        {/* Postage */}
        <fieldset className="space-y-3 rounded-3xl border border-border/70 bg-card p-6">
          <legend className="px-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Postage
          </legend>
          {postageOptions.map((p) => (
            <label
              key={p.id}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                postageId === p.id
                  ? "border-primary bg-primary/5"
                  : "border-border/70 hover:border-primary/30"
              }`}
            >
              <input
                type="radio"
                name="postage"
                checked={postageId === p.id}
                onChange={() => setPostageId(p.id)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-display text-sm font-bold">{p.label}</p>
                  <p className="font-display text-sm font-bold text-primary">
                    {formatPriceCents(p.priceCents)}
                  </p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {p.description}
                </p>
              </div>
            </label>
          ))}
        </fieldset>
      </div>

      {/* Order summary */}
      <aside className="lg:col-span-5">
        <div className="sticky top-24 rounded-3xl border border-border/70 bg-card p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Order summary
          </p>
          <ul className="mt-4 space-y-3">
            {items.map((i) => (
              <li
                key={i.productId}
                className="flex items-start justify-between gap-3 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{i.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Qty {i.quantity} · {formatPriceCents(i.priceCents)} each
                  </p>
                </div>
                <p className="font-semibold">
                  {formatPriceCents(i.priceCents * i.quantity)}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-5 space-y-2 border-t border-border/70 pt-5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">
                {formatPriceCents(subtotalCents)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Postage ({postage.label.toLowerCase()})
              </span>
              <span className="font-semibold">
                {formatPriceCents(postage.priceCents)}
              </span>
            </div>
            <div className="flex items-end justify-between border-t border-border/70 pt-3">
              <span className="font-display text-base font-bold">Total</span>
              <span className="font-display text-xl font-extrabold text-primary">
                {formatPriceCents(totalCents)}
              </span>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:scale-[1.01] disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            {submitting ? "Starting checkout…" : "Pay securely with Stripe"}
          </button>
          {serverError && (
            <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {serverError}
            </p>
          )}
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            You&apos;ll be redirected to Stripe to complete payment.
          </p>
        </div>
      </aside>
    </form>
  );
}

function TextField({
  label,
  value,
  onChange,
  error,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
        {required && <span className="ml-0.5 text-primary">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
