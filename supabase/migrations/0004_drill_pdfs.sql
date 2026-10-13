-- Drills library: optional downloadable PDF skill sheet per drill.
-- Run this once in the Supabase SQL Editor: New query → paste → Run.
-- PDFs live in the existing private 'drill-videos' bucket under pdfs/.

alter table public.drills
  add column if not exists pdf_path text;
