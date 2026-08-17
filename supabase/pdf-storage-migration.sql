-- PDF attachment support — run this once in the Supabase Studio SQL Editor,
-- after supabase/migration.sql has already been applied.

-- ============================================================================
-- Bucket: resource-files
-- PDF only, 5 MB max (enforced by Storage itself, independent of client-side
-- checks). Public so uploaded PDFs are readable without authentication, same
-- as everything else in the hub.
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('resource-files', 'resource-files', true, 5242880, array['application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ============================================================================
-- Row Level Security on storage.objects
-- Files are stored under `${auth.uid()}/${filename}` so ownership can be
-- checked from the path itself, mirroring the created_by pattern used for
-- resources and resource_links.
-- ============================================================================

-- Not "alter table storage.objects enable row level security" here: that table
-- is owned by supabase_storage_admin, not the postgres role the SQL Editor
-- runs as, so the ALTER fails with "must be owner of table objects". RLS is
-- already enabled on storage.objects by default in every Supabase project —
-- creating policies below doesn't require ownership, only the ALTER does.

drop policy if exists "Public can view resource files" on storage.objects;
create policy "Public can view resource files"
  on storage.objects for select
  using (bucket_id = 'resource-files');

drop policy if exists "Authenticated users can upload their own resource files" on storage.objects;
create policy "Authenticated users can upload their own resource files"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'resource-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Owners can update their own resource files" on storage.objects;
create policy "Owners can update their own resource files"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'resource-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'resource-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Owners can delete their own resource files" on storage.objects;
create policy "Owners can delete their own resource files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'resource-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
