import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCourtPlannerAccess } from "@/lib/court-planner-access.server";
import { CourtPlannerApp } from "./court-planner-app";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Netball Court - Drawing",
  description:
    "A simple drawing tool for phones and tablets. Draw drills in seconds, give feedback at quarter time and half time, and save your drills and set plays into folders.",
  alternates: { canonical: "https://ccnetball.com/court-planner" },
};

export default async function CourtPlannerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/court-planner")}`);
  }

  const access = await getCourtPlannerAccess();
  if (!access) {
    redirect("/shop/court-planner?checkout=required");
  }

  if (access.suspended) {
    redirect("/court-planner/suspended");
  }

  return (
    <CourtPlannerApp
      expiresAt={access.expiresAt}
      daysRemaining={access.daysRemaining}
    />
  );
}
