-- Redesigned contribution flow — run after migration.sql and pdf-storage-migration.sql
-- have been applied. Safe to run even if pdf-storage-migration.sql was skipped, since the
-- storage bucket step below re-creates the bucket from scratch if needed.

-- ============================================================================
-- Topics — the community-extensible half of the Category -> Topic hierarchy.
-- Category stays a small controlled list (unchanged); Topic is optional and
-- any authenticated contributor can create a new one inline.
-- ============================================================================

create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  category text not null check (
    category in ('Product', 'Design', 'Business', 'Dev', 'AI', 'General')
  ),
  name text not null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (category, name)
);

alter table public.topics enable row level security;

drop policy if exists "Public can view topics" on public.topics;
create policy "Public can view topics"
  on public.topics for select
  using (true);

drop policy if exists "Authenticated users can create topics" on public.topics;
create policy "Authenticated users can create topics"
  on public.topics for insert
  to authenticated
  with check (auth.uid() = created_by);

-- ============================================================================
-- Resources — add topic_id, backfill from the legacy topics[] array, then
-- drop the array column. Widen category/type check constraints. Make
-- level/cost/purpose nullable since the contribution form no longer collects
-- them (they're deferred to a future admin/moderation feature).
-- ============================================================================

alter table public.resources
  add column if not exists topic_id uuid references public.topics (id) on delete set null;

-- Backfill: create a topic from each resource's first legacy topic, then link it.
insert into public.topics (category, name)
select distinct on (r.category, r.topics[1])
  r.category, r.topics[1]
from public.resources r
where r.topics is not null
  and array_length(r.topics, 1) > 0
on conflict (category, name) do nothing;

update public.resources r
set topic_id = t.id
from public.topics t
where r.topics is not null
  and array_length(r.topics, 1) > 0
  and t.category = r.category
  and t.name = r.topics[1]
  and r.topic_id is null;

alter table public.resources drop column if exists topics;

alter table public.resources drop constraint if exists resources_category_check;
alter table public.resources add constraint resources_category_check
  check (category in ('Product', 'Design', 'Business', 'Dev', 'AI', 'General'));

alter table public.resources drop constraint if exists resources_type_check;
alter table public.resources add constraint resources_type_check
  check (
    type in (
      'Article', 'Video', 'Course', 'Book', 'Template', 'Podcast', 'Tool',
      'Case Study', 'Community', 'PDF', 'Image', 'Repository'
    )
  );

alter table public.resources alter column level drop not null;
alter table public.resources alter column cost drop not null;
alter table public.resources alter column purpose drop not null;

create index if not exists resources_topic_id_idx on public.resources (topic_id);

-- ============================================================================
-- Storage — widen resource-files to also accept images (PDF-only previously).
-- Re-creating from scratch here so this migration works standalone even if
-- pdf-storage-migration.sql was never run.
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resource-files', 'resource-files', true, 5242880,
  array['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

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
