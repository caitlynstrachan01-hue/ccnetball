import type { Metadata } from "next";
import { CourtPlannerApp } from "./court-planner-app";

export const metadata: Metadata = {
  title: "Netball Court - Drawing",
  description:
    "A simple drawing tool for phones and tablets. Draw drills in seconds, give feedback at quarter time and half time, and save your drills and set plays into folders.",
  alternates: { canonical: "https://ccnetball.com/court-planner" },
};

export default function CourtPlannerPage() {
  return <CourtPlannerApp />;
}
