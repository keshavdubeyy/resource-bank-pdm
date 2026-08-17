-- Reverses the "any signed-in user" folder policy from folders-migration.sql —
-- rename/move/delete now require ownership, matching how resources already work.
-- Run after folders-migration.sql.

drop policy if exists "Authenticated users can rename or move folders" on public.folders;
create policy "Owners can rename or move their folders"
  on public.folders for update
  to authenticated
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

drop policy if exists "Authenticated users can delete folders" on public.folders;
create policy "Owners can delete their folders"
  on public.folders for delete
  to authenticated
  using (auth.uid() = created_by);

-- Select and insert are unchanged: browsing stays public, and any signed-in
-- user can still create a folder (including subfolders) anywhere in the tree.
