import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { getPublishedPosts } from "@/lib/blog-posts";

// Revalidate hourly so scheduled posts auto-publish on their date without
// needing a manual redeploy.
export const revalidate = 3600;

export const metadata = {
  title: "Blog",
  description:
    "Athlete interviews, position deep-dives, mindset and recovery, from a coach who has lived it at the highest level.",
};

const dateFormat = new Intl.DateTimeFormat("en-AU", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default function BlogPage() {
  const posts = getPublishedPosts();
  return (
    <>
      <section className="border-b border-border/60 bg-card">
        <div className="mx-auto max-w-4xl px-6 py-20 lg:px-10 lg:py-24">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Blog
          </p>
          <h1 className="mt-3 font-display text-5xl font-extrabold leading-tight tracking-tight md:text-6xl">
            Inside the <span className="gradient-text">elite game.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-xl text-muted-foreground">
            Athlete interviews, position deep-dives, mindset and recovery.
            Written by a coach who&apos;s lived it at the highest level.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6 lg:px-10">
          <div className="grid gap-6 md:grid-cols-2">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col rounded-2xl border border-border/70 bg-card p-7 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
              >
                <span className="inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                  {post.category}
                </span>
                <h2 className="mt-4 font-display text-xl font-bold leading-snug">
                  {post.title}
                </h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {post.excerpt}
                </p>
                <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="size-3.5" />
                    {dateFormat.format(new Date(post.date))}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-3.5" />
                    {post.readMinutes} min read
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
