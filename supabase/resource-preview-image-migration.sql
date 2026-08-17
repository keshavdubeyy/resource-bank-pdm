-- Stores the scraped og:image for a resource's primary link (when the site
-- exposes one publicly) so cards/detail views can show it in place of a
-- plain favicon. Best-effort — many sites (LinkedIn included) block
-- scraping and this stays null for them; UI already falls back to a
-- favicon/icon whenever it's null.

alter table public.resources
  add column if not exists preview_image_url text;
