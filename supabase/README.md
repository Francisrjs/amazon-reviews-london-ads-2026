# Supabase

Versioned SQL migrations, RLS policies, Power BI views, development seeds, and
pgTAP tests for Launchly. Raw datasets, review corpora, embeddings, model files,
and credentials must never be stored here.

Run from the repository root with Node.js 20.9 or newer:

```powershell
pnpm.cmd install
pnpm.cmd supabase start
pnpm.cmd supabase db reset
pnpm.cmd supabase db lint
pnpm.cmd supabase test db
```

See `docs/backend/04_SUPABASE_RUNBOOK.md` before linking or pushing to a remote
project.
