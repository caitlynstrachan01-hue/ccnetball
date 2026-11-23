/**
 * Only allow redirects to a page on this site, e.g. "/library". Anything
 * else ("//evil.com", "@evil.com", "https://…", "/\\evil.com") falls back,
 * so a sign-in link can't bounce people to a look-alike site.
 */
export function safeNextPath(next: string | null | undefined, fallback = "/account") {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\"))
    return fallback;
  return next;
}
