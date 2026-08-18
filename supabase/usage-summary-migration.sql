-- Supabase usage summary support.
-- Run this once in the Supabase Studio SQL Editor.
--
-- This exposes only aggregate byte counts to authenticated users. It does not
-- expose object names, bucket contents, service-role credentials, or Management
-- API credentials.

create or replace function public.get_usage_summary()
returns table (
  database_bytes bigint,
  storage_bytes bigint
)
language sql
security definer
set search_path = public, storage, pg_catalog
as $$
  select
    pg_database_size(current_database())::bigint as database_bytes,
    coalesce((
      select sum(
        case
          when metadata ? 'size' and (metadata->>'size') ~ '^[0-9]+$'
            then (metadata->>'size')::bigint
          else 0
        end
      )::bigint
      from storage.objects
    ), 0)::bigint as storage_bytes;
$$;

revoke all on function public.get_usage_summary() from public;
grant execute on function public.get_usage_summary() to authenticated;
