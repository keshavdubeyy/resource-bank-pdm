# PDM Resource Bank

A Next.js resource hub for Product Design and Management placement preparation. The app lets users browse curated resources, submit new material, manage personal resources, and explore interview-prep tracks.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Add your Supabase values:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Scripts

```bash
npm run dev        # Start the local development server
npm run build      # Create a production build
npm run start      # Start the production server
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript checks
npm run format     # Format TypeScript and React files
```

## Project Structure

```text
app/                 Next.js routes and pages
components/          Shared UI, resource, and layout components
hooks/               Reusable React hooks
lib/                 Auth, resource queries, actions, and utilities
supabase/            SQL migrations and database setup scripts
utils/supabase/      Supabase client, server, and middleware helpers
```

## Supabase Setup

Run the SQL files in `supabase/` in your Supabase project as needed for tables, storage, folders, previews, and permissions. Keep `.env.local` private and do not commit Supabase secrets.

### Usage Indicator

Run `supabase/usage-summary-migration.sql` to enable the profile-menu usage indicator. The app fetches only aggregate live byte counts through `get_usage_summary()`:

- database bytes from Postgres size metadata
- storage bytes from `storage.objects` file-size metadata

Supabase plan verification is not available from the public browser/server Supabase client. The menu compares usage against Supabase Free plan limits, but it does not claim the current project plan is verified unless a separate server-only Management API integration is added later.
