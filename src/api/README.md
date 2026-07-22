# Launchly FastAPI backend

FastAPI is the authenticated domain backend for Launchly. It preserves the
calibrated ML engine in `inference.py` and adds Supabase JWT verification,
user-scoped PostgREST persistence, financial formulas, analysis history, and My
Store/shortlist operations.

Read [`docs/backend/README.md`](../../docs/backend/README.md) for architecture,
database, API, migration, and operations documentation.

## Setup

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Configure `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`. A service-role key is
not required for user operations and must never be exposed to Next.js.

The model artifacts documented in [`docs/18_BACKEND_RUNBOOK.md`](../../docs/18_BACKEND_RUNBOOK.md)
must exist before an inference endpoint can succeed.

## Run

```powershell
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

- Health: `http://127.0.0.1:8000/health`
- OpenAPI: `http://127.0.0.1:8000/docs`

`main.py` is a compatibility wrapper; the application implementation is under
`app/`.

## Test

```powershell
python -m pytest tests -q
```

Database and frontend validation commands are documented in
[`docs/backend/05_TESTING_OPERATIONS.md`](../../docs/backend/05_TESTING_OPERATIONS.md).
