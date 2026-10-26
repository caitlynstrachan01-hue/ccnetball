import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "@/components/motion";
import { CompetitionWizard } from "@/components/competition-builder/competition-wizard";
import {
  getCompetition,
  isCompetitionBuilderAccessAllowed,
} from "@/lib/competition-builder.server";

export const metadata = {
  title: "Competition Builder",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CompetitionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const access = await isCompetitionBuilderAccessAllowed();
  if (!access.user)
    redirect(`/login?next=/tools/competition-builder/${id}`);

  const data = await getCompetition(id);
  if (!data) notFound();
  if (data.competition.ownerUserId !== access.user.id && !access.isAdmin) {
    redirect("/tools/competition-builder");
  }

  return (
    <section className="border-b border-border/60 bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10 lg:py-14">
        <Reveal>
          <Link
            href="/tools/competition-builder"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition hover:text-primary"
          >
            <ArrowLeft className="size-4" /> All competitions
          </Link>
          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            {data.competition.name}
          </h1>
        </Reveal>

        <div className="mt-8">
          <CompetitionWizard
            competition={data.competition}
            courts={data.courts}
            timeslots={data.timeslots}
            divisions={data.divisions}
            teams={data.teams}
            rules={data.rules}
          />
        </div>
      </div>
    </section>
  );
}
