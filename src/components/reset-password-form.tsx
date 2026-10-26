"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    // Supabase picks up the recovery token from the URL hash automatically
    // and emits a session with "recovery" aud. Wait for that session before
    // allowing the form to submit.
    supabase.auth.getSession().then(({ data }) => {
      setReady(Boolean(data.session));
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setReady(Boolean(session));
      setChecking(false);
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password needs to be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });
    setSubmitting(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDone(true);
    setTimeout(() => {
      router.push("/account");
      router.refresh();
    }, 1500);
  }

  if (checking) {
    return (
      <div className="rounded-3xl border border-border/70 bg-card p-10 text-center">
        <Loader2 className="mx-auto size-6 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">
          Checking your reset link…
        </p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="rounded-3xl border border-border/70 bg-card p-10 text-center">
        <h3 className="font-display text-xl font-bold">
          This link isn&apos;t valid.
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Reset links expire after a short time. Head back to{" "}
          <a href="/login" className="font-semibold text-primary hover:underline">
            sign in
          </a>{" "}
          and request a new one.
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-border/70 bg-card p-10 text-center md:p-12">
        <CheckCircle2 className="size-14 text-primary" />
        <h3 className="mt-4 font-display text-2xl font-bold">
          Password set — you&apos;re in.
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Taking you to your account…
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
          New password
        </span>
        <div className="relative mt-2">
          <Lock className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-border bg-background py-3 pl-12 pr-4 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          At least 8 characters.
        </p>
      </label>

      <label className="mt-4 block">
        <span className="text-sm font-semibold text-foreground/90">
          Confirm new password
        </span>
        <div className="relative mt-2">
          <Lock className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
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
        {submitting ? "Saving…" : "Save password and sign in"}
      </button>
    </form>
  );
}
