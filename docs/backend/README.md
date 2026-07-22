# Launchly backend documentation

This directory is the implementation reference for the authenticated Launchly
backend. The master product truth remains [`../01_PRD_MASTER.md`](../01_PRD_MASTER.md).

## Documents

1. [`01_ARCHITECTURE.md`](01_ARCHITECTURE.md) — runtime boundaries and request flow.
2. [`02_DATABASE_AND_RLS.md`](02_DATABASE_AND_RLS.md) — schema, ownership, RLS, and Power BI view.
3. [`03_API_CONTRACTS.md`](03_API_CONTRACTS.md) — authenticated HTTP contracts.
4. [`04_SUPABASE_RUNBOOK.md`](04_SUPABASE_RUNBOOK.md) — local and remote migration workflow.
5. [`05_TESTING_OPERATIONS.md`](05_TESTING_OPERATIONS.md) — validation and failure handling.

## Implemented boundary

- Supabase Auth supplies the user session.
- Next.js verifies the session and forwards the access token server-side.
- FastAPI validates the JWT and owns domain orchestration.
- PostgREST receives the same user JWT, so PostgreSQL RLS remains authoritative.
- The Python inference engine remains the only source of model scores.
- PostgreSQL stores application inputs, summarized results, portfolio state, and
  version metadata. It never stores raw reviews or model artifacts.
