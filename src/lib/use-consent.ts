"use client";

import { useEffect, useState } from "react";
import { getConsent, type ConsentValue } from "@/lib/consent";

export function useConsent() {
  const [value, setValue] = useState<ConsentValue>(null);

  useEffect(() => {
    setValue(getConsent());
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as ConsentValue;
      setValue(detail);
    };
    window.addEventListener("ccn-consent-change", handler);
    return () => window.removeEventListener("ccn-consent-change", handler);
  }, []);

  return value;
}
