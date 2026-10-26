"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, KeyRound, Lock, Mail, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Mode = "password" | "magic" | "reset";

export function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const nextPath = searchParams.get("next") || "/account";

  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setSubmitting(false);
    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "That email and password don't match. Try again or set a password below."
          : authError.message,
      );
      return;
    }
    router.push(nextPath);
    router.refresh();
  }

  async function handleMagicSubmit(e: React.FormEvent) {
    e.preventDefault();
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
      setError(authError.message);
      return;
    }
    setMagicSent(true);
  }

  async function handleResetSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const supabase = createClient();
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const { error: authError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: `${origin}/auth/reset` },
    );
    setSubmitting(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    setResetSent(true);
  }

  if (magicSent) {
    return (
      <ConfirmPanel
        title="Check your inbox"
        body={
          <>
            We&apos;ve sent a sign-in link to <strong>{email}</strong>. Click it
            from this device to sign in.
          </>
        }
      />
    );
  }

  if (resetSent) {
    return (
      <ConfirmPanel
        title="Reset link sent"
        body={
          <>
            We&apos;ve emailed a password-setup link to{" "}
            <strong>{email}</strong>. Click it, choose a password, and you&apos;re
            in.
          </>
        }
      />
    );
  }

  return (
    <div className="rounded-3xl border border-border/70 bg-card p-8 md:p-10">
      {mode === "password" && (
        <form onSubmit={handlePasswordSubmit}>
          <EmailField value={email} onChange={setEmail} />
          <label className="mt-4 block">
            <span className="text-sm font-semibold text-foreground/90">
              Password
            </span>
            <div className="relative mt-2">
              <Lock className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-background py-3 pl-12 pr-4 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </label>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:scale-[1.01] disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>

          <div className="mt-6 flex flex-col items-center gap-2 text-xs text-muted-foreground">
            <button
              type="button"
              onClick={() => {
                setMode("reset");
                setError(null);
              }}
              className="font-semibold text-primary hover:underline"
            >
              Set up a password / forgot it?
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("magic");
                setError(null);
              }}
              className="hover:underline"
            >
              Or email me a one-time sign-in link
            </button>
          </div>
        </form>
      )}

      {mode === "magic" && (
        <form onSubmit={handleMagicSubmit}>
          <EmailField value={email} onChange={setEmail} />

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:scale-[1.01] disabled:opacity-60"
          >
            {submitting ? "Sending link…" : "Send me a sign-in link"}
            <Send className="size-4" />
          </button>

          <div className="mt-6 flex flex-col items-center gap-2 text-xs text-muted-foreground">
            <button
              type="button"
              onClick={() => {
                setMode("password");
                setError(null);
              }}
              className="font-semibold text-primary hover:underline"
            >
              Prefer a password?
            </button>
          </div>
        </form>
      )}

      {mode === "reset" && (
        <form onSubmit={handleResetSubmit}>
          <p className="mb-4 flex items-start gap-2 rounded-xl bg-primary/5 p-3 text-xs text-foreground/80">
            <KeyRound className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>
              Type your email and we&apos;ll send you a link to set (or reset)
              your password. You only need to do this once.
            </span>
          </p>
          <EmailField value={email} onChange={setEmail} />

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:scale-[1.01] disabled:opacity-60"
          >
            {submitting ? "Sending link…" : "Send password reset link"}
          </button>

          <div className="mt-6 flex flex-col items-center gap-2 text-xs text-muted-foreground">
            <button
              type="button"
              onClick={() => {
                setMode("password");
                setError(null);
              }}
              className="font-semibold text-primary hover:underline"
            >
              Back to sign in
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function EmailField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
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
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-border bg-background py-3 pl-12 pr-4 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </label>
  );
}

function ErrorMessage({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
      {children}
    </p>
  );
}

function ConfirmPanel({
  title,
  body,
}: {
  title: string;
  body: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-border/70 bg-card p-10 text-center md:p-12">
      <CheckCircle2 className="size-14 text-primary" />
      <h3 className="mt-4 font-display text-2xl font-bold">{title}</h3>
      <p className="mt-2 max-w-sm text-muted-foreground">{body}</p>
      <p className="mt-4 text-xs text-muted-foreground">
        Can&apos;t find it? Check your spam folder.
      </p>
    </div>
  );
}
