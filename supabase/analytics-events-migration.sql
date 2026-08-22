-- Lightweight product analytics for the admin dashboard.
-- Records anonymous page views and successful logins without storing IP
-- addresses or raw request headers.

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('page_view', 'login')),
  anonymous_id text not null check (char_length(anonymous_id) between 8 and 128),
  user_id uuid references auth.users (id) on delete set null,
  user_name text,
  user_email text,
  path text not null default '/',
  occurred_at timestamptz not null default now()
);

create index if not exists analytics_events_occurred_at_idx
  on public.analytics_events (occurred_at desc);

create index if not exists analytics_events_event_type_occurred_at_idx
  on public.analytics_events (event_type, occurred_at desc);

create index if not exists analytics_events_user_id_idx
  on public.analytics_events (user_id)
  where user_id is not null;

alter table public.analytics_events enable row level security;

drop policy if exists "Clients can record analytics events" on public.analytics_events;
create policy "Clients can record analytics events"
  on public.analytics_events for insert
  to anon, authenticated
  with check (
    event_type in ('page_view', 'login')
    and char_length(anonymous_id) between 8 and 128
    and (user_id is null or auth.uid() = user_id)
  );

drop policy if exists "Authenticated users can read analytics events" on public.analytics_events;
create policy "Authenticated users can read analytics events"
  on public.analytics_events for select
  to authenticated
  using (true);
