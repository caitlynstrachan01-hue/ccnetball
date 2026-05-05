import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Calendar, Clock } from "lucide-react";
import {
  BLOG_POSTS,
  getPostBySlug,
  getPublishedPosts,
  isPublished,
} from "@/lib/blog-posts";
import { Reveal } from "@/components/motion";

// Revalidate hourly so scheduled posts auto-publish on their date.
export const revalidate = 3600;

const dateFormat = new Intl.DateTimeFormat("en-AU", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

type RouteParams = { slug: string };

export function generateStaticParams() {
  return getPublishedPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt },
  };
}

function renderParagraph(paragraph: string, index: number) {
  if (paragraph.startsWith("## ")) {
    return (
      <h2
        key={index}
        className="mt-10 font-display text-2xl font-bold tracking-tight text-foreground"
      >
        {paragraph.replace(/^##\s+/, "")}
      </h2>
    );
  }
  if (paragraph.startsWith("- ")) {
    const items = paragraph.split("\n").map((line) => line.replace(/^-\s+/, ""));
    return (
      <ul key={index} className="mt-4 list-disc space-y-2 pl-6">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }
  if (paragraph.startsWith('"') && paragraph.endsWith('"')) {
    return (
      <blockquote
        key={index}
        className="my-8 rounded-2xl border-l-4 border-primary bg-muted/60 p-6 font-display text-xl font-semibold not-italic"
      >
        {paragraph}
      </blockquote>
    );
  }
  return <p key={index}>{paragraph}</p>;
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post || !isPublished(post)) notFound();

  const related = getPublishedPosts()
    .filter((p) => p.slug !== slug && p.category === post.category)
    .slice(0, 2);

  return (
    <>
      <section className="border-b border-border/60 bg-card">
        <div className="mx-auto max-w-3xl px-6 py-16 lg:px-10 lg:py-24">
          <Reveal>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
            >
              <ArrowLeft className="size-4" /> All articles
            </Link>
            <span className="mt-6 inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              {post.category}
            </span>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
              {post.title}
            </h1>
            <div className="mt-6 flex items-center gap-5 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-4" />
                {dateFormat.format(new Date(post.date))}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4" />
                {post.readMinutes} min read
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      <article className="py-16">
        <div className="mx-auto max-w-3xl px-6 lg:px-10">
          <Reveal>
            <div className="space-y-5 text-lg leading-relaxed text-foreground/90">
              {post.body.map(renderParagraph)}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-14 rounded-3xl bg-gradient-to-br from-primary/10 via-card to-card p-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Train with Caitlyn
              </p>
              <h3 className="mt-3 font-display text-2xl font-bold tracking-tight">
                Apply this in a real session.
              </h3>
              <p className="mt-2 text-base text-muted-foreground">
                Six coaching programs covering individual, group, team, video
                analysis and online mentoring. Every session designed by a
                former Diamond.
              </p>
              <Link
                href="/book"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:scale-[1.02]"
              >
                Book a session <ArrowRight className="size-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-border/60 bg-muted/30 py-16">
          <div className="mx-auto max-w-5xl px-6 lg:px-10">
            <h3 className="font-display text-2xl font-bold tracking-tight">
              Keep reading
            </h3>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group flex flex-col rounded-2xl border border-border/70 bg-card p-7 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
                >
                  <span className="inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                    {p.category}
                  </span>
                  <h4 className="mt-4 font-display text-lg font-bold leading-snug">
                    {p.title}
                  </h4>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {p.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
