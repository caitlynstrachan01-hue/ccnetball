import { createHash } from "crypto";

/**
 * Bunny Stream — hosts the drill videos. Needs these Vercel env vars:
 *   BUNNY_STREAM_LIBRARY_ID  — Stream → library → API → "Video Library ID"
 *   BUNNY_STREAM_API_KEY     — same page, "API Key" (server-only)
 *   BUNNY_STREAM_TOKEN_KEY   — Security → "Token Authentication Key"
 */
export function bunnyConfig() {
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
  const apiKey = process.env.BUNNY_STREAM_API_KEY;
  if (!libraryId || !apiKey) return null;
  return {
    libraryId,
    apiKey,
    tokenKey: process.env.BUNNY_STREAM_TOKEN_KEY || null,
  };
}

function sha256(text: string) {
  return createHash("sha256").update(text).digest("hex");
}

const API = "https://video.bunnycdn.com/library";

/** Signed player link — expires, so a copied link stops working. */
export function bunnyEmbedUrl(videoId: string, ttlSeconds: number) {
  const cfg = bunnyConfig();
  if (!cfg) return undefined;
  const params = new URLSearchParams({ autoplay: "false", preload: "true", responsive: "true" });
  if (cfg.tokenKey) {
    const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
    params.set("token", sha256(cfg.tokenKey + videoId + expires));
    params.set("expires", String(expires));
  }
  return `https://iframe.mediadelivery.net/embed/${cfg.libraryId}/${videoId}?${params}`;
}

/** Create an empty video and the signature the browser needs to upload it. */
export async function createBunnyUpload(title: string) {
  const cfg = bunnyConfig();
  if (!cfg) throw new Error("Bunny Stream isn't configured.");
  const res = await fetch(`${API}/${cfg.libraryId}/videos`, {
    method: "POST",
    headers: { AccessKey: cfg.apiKey, "content-type": "application/json" },
    body: JSON.stringify({ title: title.slice(0, 200) || "Drill video" }),
  });
  if (!res.ok) throw new Error(`Bunny refused the upload (${res.status}).`);
  const { guid } = (await res.json()) as { guid: string };
  const expire = Math.floor(Date.now() / 1000) + 60 * 60 * 6;
  return {
    videoId: guid,
    libraryId: cfg.libraryId,
    expire,
    signature: sha256(cfg.libraryId + cfg.apiKey + expire + guid),
  };
}

export async function deleteBunnyVideo(videoId: string) {
  const cfg = bunnyConfig();
  if (!cfg) return;
  await fetch(`${API}/${cfg.libraryId}/videos/${encodeURIComponent(videoId)}`, {
    method: "DELETE",
    headers: { AccessKey: cfg.apiKey },
  });
}
