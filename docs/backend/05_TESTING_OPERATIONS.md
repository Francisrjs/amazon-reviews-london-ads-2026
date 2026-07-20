# Testing and operations

## Validation commands

```powershell
# Database
pnpm.cmd supabase db reset
pnpm.cmd supabase db lint
pnpm.cmd supabase test db

# FastAPI, from src/api
python -m pytest tests -q

# Frontend, from repository root
pnpm.cmd --dir src/frontend typecheck
pnpm.cmd --dir src/frontend lint
pnpm.cmd --dir src/frontend test
pnpm.cmd --dir src/frontend build
pnpm.cmd --dir src/frontend test:e2e
```

Database tests verify schema, indexes, policies, RPC signatures, and the export
view. API tests cover finance formulas, compatibility, authentication headers,
and Store object preservation. Frontend tests cover validation, deterministic
demo output, and the one-time localStorage import contract.

## Operational signals

- Carry `X-Request-ID` through Next.js, FastAPI, logs, and audit events.
- Measure inference and persistence latency separately.
- Log stable error codes, never tokens or product descriptions.
- Alert on JWT failures, PostgREST 5xx responses, artifact-load failures, and
  p95 analysis latency above five seconds.
- Keep demo fallback disabled in production.

## Failure behavior

- A model failure does not create a completed analysis.
- An RPC failure rolls back every child insert.
- A failed browser import keeps the local copy and restores previous UI state.
- Local copies are removed only after a valid remote response.
- Deployment is blocked until migration, pgTAP, API, frontend, and build checks
  pass.
