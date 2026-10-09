import { NextResponse } from "next/server";
import { createBunnyUpload, deleteBunnyVideo } from "@/lib/bunny.server";
import { getLibraryAccess } from "@/lib/drills-store.server";

async function requireAdmin() {
  const { isAdmin } = await getLibraryAccess();
  return isAdmin;
}

/** Start a Bunny upload — returns what the browser needs to send the file. */
export async function POST(request: Request) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  const { title } = (await request.json().catch(() => ({}))) as { title?: string };
  try {
    return NextResponse.json(await createBunnyUpload(String(title ?? "")));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 500 },
    );
  }
}

/** Remove a video that's been replaced. */
export async function DELETE(request: Request) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  const { videoId } = (await request.json().catch(() => ({}))) as { videoId?: string };
  if (videoId) await deleteBunnyVideo(videoId);
  return NextResponse.json({ ok: true });
}
