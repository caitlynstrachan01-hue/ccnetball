"use client";

import { useEffect } from "react";
import Link from "next/link";
import { MonitorSmartphone } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/** Shown when a member's device was signed out by the device limit. */
export function DeviceSignedOut({ limit }: { limit: number }) {
  useEffect(() => {
    // End the session on this device so it stops counting as signed in.
    createClient().auth.signOut();
  }, []);

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 py-20 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <MonitorSmartphone className="size-8" />
      </div>
      <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight">
        You&apos;ve been signed out on this device.
      </h1>
      <p className="mt-4 text-base text-muted-foreground">
        A CC Netball membership can be used on up to {limit} devices at a
        time, and this account was signed in on another device.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Signing in again here will sign out the device you used least
        recently.
      </p>
      <Link
        href="/login?next=/library"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:scale-[1.02]"
      >
        Sign in again
      </Link>
    </section>
  );
}
