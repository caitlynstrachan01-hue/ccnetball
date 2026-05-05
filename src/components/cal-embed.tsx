"use client";

import { useEffect } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";
import { SITE } from "@/lib/site-content";

export function CalEmbed({ slug }: { slug?: string }) {
  useEffect(() => {
    (async () => {
      const cal = await getCalApi({ namespace: "ccnetball" });
      cal("ui", {
        theme: "light",
        cssVarsPerTheme: {
          light: { "cal-brand": "#E63B7A" },
          dark: { "cal-brand": "#E63B7A" },
        },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, []);

  // No slug = show Caitlyn's full Cal.com profile with every event type listed.
  const calLink = slug
    ? `${SITE.calcomUsername}/${slug}`
    : SITE.calcomUsername;

  return (
    <div className="overflow-hidden rounded-3xl border border-border/70 bg-card">
      <Cal
        namespace="ccnetball"
        calLink={calLink}
        style={{ width: "100%", height: "100%", overflow: "scroll" }}
        config={{ layout: "month_view", theme: "light" }}
      />
    </div>
  );
}
