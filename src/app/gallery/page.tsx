import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import { Camera } from "lucide-react";

export const metadata = {
  title: "Gallery",
  description:
    "Career and coaching moments from Caitlyn Strachan. Diamonds, Vixens, Firebirds, and CCNetball coaching sessions.",
};

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

type GalleryItem = {
  src: string;
  alt: string;
  caption?: string;
};

function loadGalleryItems(): GalleryItem[] {
  const galleryDir = path.join(process.cwd(), "public", "gallery");
  if (!fs.existsSync(galleryDir)) return [];

  const captionsPath = path.join(galleryDir, "captions.json");
  let captions: Record<string, { alt: string; caption?: string }> = {};
  if (fs.existsSync(captionsPath)) {
    try {
      captions = JSON.parse(fs.readFileSync(captionsPath, "utf-8"));
    } catch {
      captions = {};
    }
  }

  return fs
    .readdirSync(galleryDir)
    .filter((f) => IMAGE_EXTENSIONS.has(path.extname(f).toLowerCase()))
    .sort()
    .map((file) => {
      const meta = captions[file];
      return {
        src: `/gallery/${file}`,
        alt: meta?.alt ?? file.replace(/[-_]/g, " ").replace(/\.[^.]+$/, ""),
        caption: meta?.caption,
      };
    });
}

export default function GalleryPage() {
  const items = loadGalleryItems();

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
            Highlights from Caitlyn&apos;s playing career and coaching work
            across Australia.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-10 text-center text-sm text-muted-foreground">
              <Camera className="mx-auto mb-3 size-6 opacity-60" />
              Photos coming soon. Caitlyn is curating high-resolution images
              from her playing career and recent coaching sessions.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <figure
                  key={item.src}
                  className="group relative overflow-hidden rounded-2xl bg-muted"
                >
                  <div className="relative aspect-[4/5]">
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  {item.caption && (
                    <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-5 pt-16 text-white">
                      <p className="font-display text-base font-semibold leading-tight">
                        {item.caption}
                      </p>
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
