import type { Metadata } from "next";
import { CourtPlannerApp } from "./court-planner-app";

export const metadata: Metadata = {
  title: "Netball Court Planner",
  description:
    "Interactive netball court for coaches — place players, draw lead runs and passes, and save plays to folders. Built for iPad sideline use.",
  alternates: { canonical: "https://ccnetball.com/court-planner" },
};

export default function CourtPlannerPage() {
  return <CourtPlannerApp />;
}
