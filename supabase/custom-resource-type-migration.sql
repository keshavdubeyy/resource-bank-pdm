-- Lets contributors name their own resource type from the Add Resource form
-- (instead of only picking from the fixed list) — run after
-- resource-redesign-migration.sql. Widens the type check constraint from a
-- fixed enum-style list to "any non-empty text", since the app now enforces
-- the value client-side via a creatable combobox instead.

alter table public.resources drop constraint if exists resources_type_check;
alter table public.resources add constraint resources_type_check
  check (char_length(trim(type)) > 0);
