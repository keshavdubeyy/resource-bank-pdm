-- Shows who created a folder in the UI. Folders only stored created_by (a raw
-- auth.users id) — mirrors resources.recommended_by by denormalizing a
-- display name onto the row at creation time instead of joining auth.users
-- on every read.

alter table public.folders
  add column if not exists created_by_name text;

-- Backfill existing folders using the same name-resolution order as the app's
-- toAppUser() (full_name -> name -> email).
update public.folders f
set created_by_name = coalesce(
  u.raw_user_meta_data ->> 'full_name',
  u.raw_user_meta_data ->> 'name',
  u.email
)
from auth.users u
where f.created_by = u.id
  and f.created_by_name is null;
