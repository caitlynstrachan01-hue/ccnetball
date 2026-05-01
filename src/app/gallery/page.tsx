import { Camera } from "lucide-react";

export const metadata = {
  title: "Gallery",
  description:
    "Career and coaching moments from Caitlyn Strachan. Diamonds, Vixens, Firebirds, and CCNetball coaching sessions.",
};

const PLACEHOLDER_TILES = [
  { title: "Diamonds debut", year: "2017", color: "from-primary to-[color:var(--brand-raspberry-dark)]" },
  { title: "Premiership #1", year: "Vixens", color: "from-secondary to-primary" },
  { title: "Premiership #2", year: "Vixens", color: "from-primary to-[color:var(--brand-coral)]" },
  { title: "Premiership #3", year: "Firebirds", color: "from-secondary to-[color:var(--brand-raspberry-dark)]" },
  { title: "Coaching session", year: "2024", color: "from-[color:var(--brand-coral)] to-primary" },
  { title: "Specialist clinic", year: "2024", color: "from-primary to-secondary" },
  { title: "Junior development", year: "2024", color: "from-secondary to-[color:var(--brand-coral)]" },
  { title: "Team training", year: "2024", color: "from-[color:var(--brand-raspberry-dark)] to-primary" },
];

export default function GalleryPage() {
  return (
    <>
      <section className="border-b border-border/60 bg-card">
        <div className="mx-auto max-w-4xl px-6 py-20 lg:px-10 lg:py-24">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Gallery
          </p>
          <h1 className="mt-3 font-display text-5xl font-extrabold leading-tight tracking-tight md:text-6xl">
            Career & coaching{" "}
            <span className="gradient-text">moments.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-xl text-muted-foreground">
            Highlights from Caitlyn's playing career and coaching work across
            Australia.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PLACEHOLDER_TILES.map((tile) => (
              <div
                key={tile.title}
                className={`relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br ${tile.color}`}
              >
                <div className="absolute inset-0 flex flex-col justify-end p-5 text-white">
                  <Camera className="mb-2 size-5 opacity-70" />
                  <p className="font-display text-lg font-bold leading-tight">
                    {tile.title}
                  </p>
                  <p className="text-sm opacity-80">{tile.year}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
            Photos coming soon. Caitlyn is curating high-resolution images
            from her playing career and recent coaching sessions.
          </div>
        </div>
      </section>
    </>
  );
}
