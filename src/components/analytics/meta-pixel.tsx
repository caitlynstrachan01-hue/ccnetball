"use client";

import Script from "next/script";
import { ANALYTICS, isTrackingEnabled } from "@/lib/analytics-config";
import { useConsent } from "@/lib/use-consent";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function MetaPixel() {
  const consent = useConsent();
  if (!isTrackingEnabled || !ANALYTICS.metaPixelId) return null;
  if (consent !== "all") return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${ANALYTICS.metaPixelId}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${ANALYTICS.metaPixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

export function trackMetaEvent(
  event: string,
  params: Record<string, unknown> = {},
) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", event, params);
  }
}
