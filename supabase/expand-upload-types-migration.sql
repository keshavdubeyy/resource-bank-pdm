-- Widens resource-files to also accept spreadsheets (xls/xlsx/csv) and
-- documents (doc/docx/txt) — previously PDF + images only. Size limit stays
-- at 5 MB. Run once in the Supabase Studio SQL Editor.
--
-- Storage enforces allowed_mime_types itself, independent of the client-side
-- checks in lib/resources/storage.ts — without this, uploads of the new
-- file types will be accepted by the app's own validation but then rejected
-- by Storage with a generic error.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resource-files', 'resource-files', true, 5242880,
  array[
    'application/pdf',
    'image/png', 'image/jpeg', 'image/webp', 'image/gif',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
