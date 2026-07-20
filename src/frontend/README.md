# Launchly Next.js frontend

Production-structured migration of `AmazonProject.html`. The application preserves the four prototype experiences—Analyze, Discover, My Store, and Trend Radar—while separating real FastAPI model outputs from formula estimates and deterministic demonstration data.

## Requirements

- Node.js 20.9 or newer.
- A Supabase project with Email authentication enabled.
- The existing FastAPI service from `src/api/` and its generated model artifacts for live inference.

## Setup

```bash
cd src/frontend
pnpm install
Copy-Item .env.example .env.local
pnpm dev
```

Open `http://localhost:3000`. Configure these values in `.env.local`:

| Variable | Exposure | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Browser-safe | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser-safe | Supabase publishable key |
| `NEXT_PUBLIC_SITE_URL` | Browser-safe | Confirmation and recovery redirect origin |
| `FASTAPI_URL` | Server only | Existing FastAPI origin |
| `NEXT_PUBLIC_ENABLE_DEMO_MODE` | Browser-safe | Deterministic fallback; use `false` in production |

Never place a Supabase secret/service-role key in this project.

## Supabase Auth configuration

1. Enable Email provider in Supabase Authentication.
2. Set the Site URL to `http://localhost:3000` for local development.
3. Add `http://localhost:3000/auth/confirm` and `http://localhost:3000/reset-password` to allowed redirect URLs.
4. For token-hash confirmation emails, point the template to:

```text
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/analyze
```

The app implements sign-up, confirmation, sign-in, sign-out, recovery, password update, SSR cookie refresh, and protected dashboard routes. It does not create database tables or RLS policies in this milestone.

## FastAPI flow

The browser calls `POST /api/analyses`. This Next.js Route Handler checks the Supabase session, validates the request, and forwards it to `POST {FASTAPI_URL}/v1/analyses`. The browser never needs the FastAPI origin and does not make a cross-origin request.

The current FastAPI service is not itself protected by Supabase JWT validation. The Next.js proxy protects access through Launchly, but direct API hardening remains backend work.

## Data honesty

- **Model:** success, Decision Risk, saturation, price curve, comparables, confidence, uncertainty, and versions.
- **Formula estimate:** illustrative profit per sale and scenario profit.
- **Simulation:** trends, audience, review insights, Amazon automation, and local store projections.
- If `NEXT_PUBLIC_ENABLE_DEMO_MODE=true`, a failed model request uses a deterministic fallback and displays `Demo data`.

My Store is held in user-keyed browser storage. It is not a Supabase-backed portfolio yet.

## Commands

```bash
pnpm dev
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
```

See [`docs/19_NEXTJS_FRONTEND.md`](../../docs/19_NEXTJS_FRONTEND.md) and [`docs/20_SUPABASE_AUTH_DATABASE.md`](../../docs/20_SUPABASE_AUTH_DATABASE.md).
