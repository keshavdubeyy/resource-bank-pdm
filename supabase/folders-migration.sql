-- Real user-created folders, replacing the Category/Topic-based "folders" view.
-- Run after all previous migrations. Category/Topic columns are left in place
-- (existing seed data and /resources' filters keep working) but stop being
-- populated by new resource submissions going forward.

-- ============================================================================
-- Folders — arbitrary nesting via a self-referencing parent_folder_id.
-- ON DELETE RESTRICT on both FKs below is a deliberate hard stop: a folder
-- with subfolders or resources inside it cannot be deleted at the DB level
-- even if an application check has a bug. The app pre-checks emptiness and
-- shows a friendly error; this constraint is the safety net.
-- ============================================================================

create table if not exists public.folders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  parent_folder_id uuid references public.folders (id) on delete restrict,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists folders_parent_folder_id_idx on public.folders (parent_folder_id);

alter table public.resources
  add column if not exists folder_id uuid references public.folders (id) on delete restrict;

create index if not exists resources_folder_id_idx on public.resources (folder_id);

-- Category is no longer collected by the new folder-based Add Resource flow.
-- Leaving the column and its check constraint in place for existing data.
alter table public.resources alter column category drop not null;

-- ============================================================================
-- Row Level Security
-- Folders are a shared, collaborative structure: any signed-in user can
-- rename, move, or delete any folder (not just ones they created). Resource
-- moves go through the EXISTING resources update policy (auth.uid() =
-- created_by) — no new resource policy needed here — so a drag-and-drop or
-- Move action on a resource you don't own will simply fail.
-- ============================================================================

alter table public.folders enable row level security;

drop policy if exists "Public can view folders" on public.folders;
create policy "Public can view folders"
  on public.folders for select
  using (true);

drop policy if exists "Authenticated users can create folders" on public.folders;
create policy "Authenticated users can create folders"
  on public.folders for insert
  to authenticated
  with check (auth.uid() = created_by);

drop policy if exists "Authenticated users can rename or move folders" on public.folders;
create policy "Authenticated users can rename or move folders"
  on public.folders for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users can delete folders" on public.folders;
create policy "Authenticated users can delete folders"
  on public.folders for delete
  to authenticated
  using (true);
