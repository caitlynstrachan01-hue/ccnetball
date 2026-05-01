"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { ANALYTICS, isTrackingEnabled } from "@/lib/analytics-config";

let initialised = false;

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (initialised || !isTrackingEnabled || !ANALYTICS.posthogKey) return;
    posthog.init(ANALYTICS.posthogKey, {
      api_host: ANALYTICS.posthogHost,
      capture_pageview: true,
      capture_pageleave: true,
      person_profiles: "identified_only",
    });
    initialised = true;
  }, []);

  return <>{children}</>;
}
