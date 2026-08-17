-- One-time cleanup of test data created while testing the folders feature.
-- Scoped to the single test user + folders/resources created today
-- (2026-08-17) — the original 30-resource seed catalog (created_by is null)
-- is untouched.

-- Resources first (resources.folder_id is `on delete restrict`, so the
-- folders below can't be deleted while these still reference them).
-- resource_links cascade automatically via `on delete cascade`.
delete from public.resources
where created_by = '9fa4b273-cdb5-4c69-9299-86534bed97c3';

-- Folders: leaf before parent (folders.parent_folder_id is also `on delete
-- restrict`). "dfgdgdfgdgdfdfg" is nested inside "hdhhhdhd".
delete from public.folders where name = 'dfgdgdfgdgdfdfg';
delete from public.folders where name in ('hdhhhdhd', 'Hello', 'hall');
