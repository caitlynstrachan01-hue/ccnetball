import { Reveal } from "@/components/motion";
import { DrillsLibraryAdmin } from "@/components/drills-library-admin";

export const metadata = {
  title: "Admin — Drills Library",
  description:
    "Upload and edit drills for the CC Netball drills library.",
  robots: { index: false, follow: false },
};

export default function DrillsLibraryAdminPage() {
  return (
    <section className="border-b border-border/60 bg-muted/40">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Admin — drills library
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            Upload &amp; edit your <span className="gradient-text">drills</span>
            .
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
            Pick a drill on the left, upload the video, write the description,
            and add your Make It Easier / Make It Harder / Variations bullet
            points. Save keeps your changes in this browser tab for the demo.
          </p>
        </Reveal>

        <Reveal delay={0.05} className="mt-4">
          <div className="rounded-2xl border border-amber-300/60 bg-amber-50 px-5 py-3 text-sm text-amber-900">
            <strong>Preview only.</strong> Changes save in your browser for
            this session. The permanent database + video hosting hook up in
            the next step, once you&apos;re happy with the interface.
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mt-8">
          <DrillsLibraryAdmin />
        </Reveal>
      </div>
    </section>
  );
}
