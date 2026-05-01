"use client";

import Script from "next/script";
import { ANALYTICS, isTrackingEnabled } from "@/lib/analytics-config";
import { useConsent } from "@/lib/use-consent";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function GoogleAnalytics() {
  const consent = useConsent();
  if (!isTrackingEnabled || !ANALYTICS.ga4MeasurementId) return null;
  if (consent !== "all") return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${ANALYTICS.ga4MeasurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${ANALYTICS.ga4MeasurementId}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}

export function trackGAEvent(
  event: string,
  params: Record<string, unknown> = {},
) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", event, params);
  }
}
