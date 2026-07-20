# Supabase runbook

## Prerequisites

- Node.js 20.9 or newer.
- pnpm and Docker Desktop or another Docker-compatible runtime.
- A Supabase personal access token for remote login.

The repository pins Supabase CLI `2.109.1`. On Windows use `pnpm.cmd` if script
execution blocks `pnpm.ps1`.

## Local database

```powershell
pnpm.cmd install
$env:SUPABASE_TELEMETRY_DISABLED = "1"
pnpm.cmd supabase start
pnpm.cmd supabase db reset
pnpm.cmd supabase db lint
pnpm.cmd supabase test db
```

`db reset` is destructive only to the local development database. It replays
all migrations and `supabase/seed.sql`.

## Link the remote project

```powershell
pnpm.cmd supabase login
pnpm.cmd supabase link --project-ref yqljvtrlojcqadbxzbrc
pnpm.cmd supabase migration list
```

The project is assumed to have no application tables. If history or tables
already exist, stop and reconcile with `supabase db pull`; do not repair or
overwrite remote history without reviewing the diff.

## Deploy migrations

```powershell
pnpm.cmd supabase db push --dry-run
pnpm.cmd supabase db push
pnpm.cmd supabase migration list
```

Do not apply later schema changes through the remote Dashboard. Never pass
`--include-seed` to production without reviewing the seed file.

## Environment

FastAPI requires `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`. Next.js requires
the corresponding `NEXT_PUBLIC_*` values and server-only `FASTAPI_URL`. Neither
application needs a service-role key for user operations.
