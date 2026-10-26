"use client";

import { useState } from "react";
import { FileText, Paperclip, Plus, Trash2, Upload } from "lucide-react";
import {
  DRILL_VIDEO_BUCKET,
  RESOURCE_FOLDER,
  type LibraryResource,
} from "@/lib/drills-store";
import { createClient } from "@/lib/supabase/client";

/** Admin panel: add or remove the files shown on the library's first screen. */
export function LibraryResourcesAdmin({
  initialResources,
}: {
  initialResources: LibraryResource[];
}) {
  const [resources, setResources] = useState(initialResources);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add() {
    setError(null);
    if (!file) {
      setError("Choose a file to upload.");
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const safeName =
      file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") ||
      "resource";
    const path = `${RESOURCE_FOLDER}/${Date.now().toString(36)}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from(DRILL_VIDEO_BUCKET)
      .upload(path, file, { contentType: file.type || undefined });
    if (uploadError) {
      setBusy(false);
      setError(`Couldn't upload: ${uploadError.message}`);
      return;
    }
    const { data, error: insertError } = await supabase
      .from("library_resources")
      .insert({
        title: title.trim() || file.name,
        file_path: path,
        file_name: file.name,
        sort_order: resources.length,
      })
      .select("id, title, file_path, file_name")
      .single();
    setBusy(false);
    if (insertError || !data) {
      await supabase.storage.from(DRILL_VIDEO_BUCKET).remove([path]);
      setError(
        /relation|schema cache|does not exist/i.test(insertError?.message ?? "")
          ? "The database needs its latest update first — run the newest setup step in Supabase."
          : `Couldn't save: ${insertError?.message ?? "unknown error"}`,
      );
      return;
    }
    setResources((prev) => [
      ...prev,
      {
        id: data.id,
        title: data.title,
        filePath: data.file_path,
        fileName: data.file_name,
      },
    ]);
    setTitle("");
    setFile(null);
  }

  async function remove(r: LibraryResource) {
    if (!window.confirm(`Remove "${r.title}" from the library?`)) return;
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("library_resources")
      .delete()
      .eq("id", r.id);
    if (deleteError) {
      setError(`Couldn't remove: ${deleteError.message}`);
      return;
    }
    await supabase.storage.from(DRILL_VIDEO_BUCKET).remove([r.filePath]);
    setResources((prev) => prev.filter((x) => x.id !== r.id));
  }

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 md:p-6">
      <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
        <Paperclip className="size-4" /> Library resources
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Files shown in the right-hand column of the library&apos;s first screen
        — season planners, rule sheets, guides.
      </p>

      {resources.length > 0 && (
        <ul className="mt-4 divide-y divide-border/60">
          {resources.map((r) => (
            <li key={r.id} className="flex items-center gap-3 py-2.5">
              <FileText className="size-4 shrink-0 text-primary" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">
                  {r.title}
                </span>
                {r.fileName && (
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {r.fileName}
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => remove(r)}
                aria-label={`Remove ${r.title}`}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title, e.g. 2027 season planner"
          className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border/70 bg-background px-4 py-2 text-xs font-semibold transition hover:border-primary/40 hover:bg-muted">
          <Upload className="size-3.5" />
          <span className="max-w-40 truncate">
            {file ? file.name : "Choose file"}
          </span>
          <input
            type="file"
            className="sr-only"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
          />
        </label>
        <button
          type="button"
          onClick={add}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
        >
          <Plus className="size-3.5" /> {busy ? "Uploading…" : "Add resource"}
        </button>
      </div>
      {error && (
        <p className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
