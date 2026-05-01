"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { ANALYTICS, isTrackingEnabled } from "@/lib/analytics-config";
import { useConsent } from "@/lib/use-consent";

let initialised = false;

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const consent = useConsent();

  useEffect(() => {
    if (initialised || !isTrackingEnabled || !ANALYTICS.posthogKey) return;
    if (consent !== "all") return;
    posthog.init(ANALYTICS.posthogKey, {
      api_host: ANALYTICS.posthogHost,
      capture_pageview: true,
      capture_pageleave: true,
      person_profiles: "identified_only",
    });
    initialised = true;
  }, [consent]);

  return <>{children}</>;
}
