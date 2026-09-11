"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Send, CheckCircle2, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/account";

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const supabase = createClient();
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    });

    setSubmitting(false);
    if (authError) {
      setError(authError.message || "Something went wrong. Try again.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-border/70 bg-card p-10 text-center md:p-12">
        <CheckCircle2 className="size-14 text-primary" />
        <h3 className="mt-4 font-display text-2xl font-bold">
          Check your inbox
        </h3>
        <p className="mt-2 max-w-sm text-muted-foreground">
          We&apos;ve sent a sign-in link to <strong>{email}</strong>. Click it
          from this device to sign in.
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          Can&apos;t find it? Check your spam folder.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-border/70 bg-card p-8 md:p-10"
    >
      <label className="block">
        <span className="text-sm font-semibold text-foreground/90">
          Email address
        </span>
        <div className="relative mt-2">
          <Mail className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-border bg-background py-3 pl-12 pr-4 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </label>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:scale-[1.01] disabled:opacity-60"
      >
        {submitting ? "Sending link…" : "Send me a sign-in link"}
        <Send className="size-4" />
      </button>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        No password required. First time here? A sign-in link creates your
        account automatically.
      </p>
    </form>
  );
}
