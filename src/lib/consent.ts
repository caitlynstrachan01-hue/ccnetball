export type ConsentValue = "all" | "essential" | null;

const STORAGE_KEY = "ccn:consent";

export function getConsent(): ConsentValue {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (v === "all" || v === "essential") return v;
  return null;
}

export function setConsent(value: "all" | "essential") {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, value);
  window.dispatchEvent(new CustomEvent("ccn-consent-change", { detail: value }));
}

export function hasAnalyticsConsent(): boolean {
  return getConsent() === "all";
}
