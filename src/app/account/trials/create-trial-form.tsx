"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function CreateTrialForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [club, setClub] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !club.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please fill in all three fields with a valid email.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/trials/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          trial: { name, club, club_email: email },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.id) {
        throw new Error(data.error || "Could not create the trial.");
      }
      router.push(`/account/trials/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Trial name" value={name} onChange={setName} placeholder="e.g. 2027 Rep Trials" />
      <Field label="Club / association" value={club} onChange={setClub} placeholder="e.g. Brisbane Budgies Netball Club" />
      <Field label="Contact email (for invoices + notifications)" type="email" value={email} onChange={setEmail} placeholder="you@yourclub.com.au" />
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:scale-[1.01] disabled:opacity-60"
      >
        {submitting && <Loader2 className="size-4 animate-spin" />}
        {submitting ? "Creating…" : "Create trial"}
      </button>
      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}
