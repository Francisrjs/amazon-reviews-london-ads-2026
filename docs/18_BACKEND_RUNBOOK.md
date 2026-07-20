# Backend Runbook

## 1. Purpose

This document explains how to prepare, start, verify, and connect the Launchly FastAPI backend to the HTML dashboard.

The current backend is a local development service. It serves the calibrated product-success model and derived outputs, but it does not yet persist analyses in Supabase or provide a production deployment.

## 2. Current implementation status

### Implemented

- FastAPI application in `src/api/main.py`.
- Lazy loading of model artifacts in `src/api/inference.py`.
- Product success score with isotonic calibration.
- Model uncertainty and confidence band.
- Comparable products and local saturation.
- Price-versus-score scenarios.
- Full analysis endpoint consumed by `AmazonProject.html`.
- Model and dataset version disclosure through `/v1/models/current`.

### Not implemented or not production-ready

- Profit per sale and expected profit in the real API response.
- Supabase persistence and analysis history.
- Power BI export.
- Authentication, RLS, rate limiting, request IDs, and production observability.
- Production hosting and HTTPS.
- Complete validation of frontend loading, error, empty, accessibility, and responsive states.

## 3. Prerequisites

Use Python 3.10 or newer and install the API dependencies:

```bash
python -m venv .venv
```

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r src/api/requirements.txt
```

Git Bash or macOS/Linux:

```bash
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r src/api/requirements.txt
```

## 4. Required local artifacts

The API cannot start successfully until these files exist:

```text
output/models/model.pkl
output/models/calibrator_1d.pkl
output/models/knn_index.pkl
output/models/tfidf_vectorizer.pkl
output/models/feature_names.json
output/models/subcategory_stats.json
output/models/density_reference.npy
output/predictions/scored_catalog.csv
```

At the current repository revision, Git contains only `.gitkeep` files in `output/models/` and `output/predictions/`. A clean clone therefore needs the artifacts regenerated or supplied through the project artifact-storage process.

The current pipeline also expects `Master_Beauty_Dataset.csv` at the repository root. Confirm that location before running it. The local processed-data folder is `data/processed/`, so the dataset location must be reconciled before a reproducible rebuild.

## 5. Generate model artifacts

From the repository root, after placing the expected dataset at the location required by `src/ml/run_pipeline.py`:

```bash
python src/ml/run_pipeline.py
python src/ml/fix_calibration_shap.py
```

Then verify that the files listed in Section 4 exist. Do not start the API if `model.pkl`, `calibrator_1d.pkl`, or `scored_catalog.csv` is missing.

## 6. Start the API

From the repository root:

```bash
cd src/api
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The API will be available at:

- Health check: `http://127.0.0.1:8000/health`
- Swagger UI: `http://127.0.0.1:8000/docs`
- OpenAPI JSON: `http://127.0.0.1:8000/openapi.json`

The API module uses a local import (`import inference`), so the documented command must be executed from `src/api`.

## 7. Verify the backend

Health check:

```bash
curl http://127.0.0.1:8000/health
```

Model metadata:

```bash
curl http://127.0.0.1:8000/v1/models/current
```

Full analysis:

```bash
curl -X POST http://127.0.0.1:8000/v1/analyses \
  -H "Content-Type: application/json" \
  -d '{"subcategory":"Skin Care","title":"Hydrating Vitamin C Serum","description":"Vegan, lightweight and fast absorbing","price":30,"risk_preference":"balanced"}'
```

Expected behavior:

- `/health` returns status `ok` and the model version.
- `/v1/models/current` returns model version, dataset version, features, calibration, and validation metadata.
- `/v1/analyses` returns success, risk, saturation, price scenarios, comparables, versions, and limitations.
- An unknown subcategory returns HTTP `422`.

## 8. Start the HTML dashboard

Keep the API running and open a second terminal from the repository root:

```bash
python -m http.server 8080
```

Open `http://127.0.0.1:8080/AmazonProject.html` in a browser.

When the API responds, the page displays the `Live model` badge. If the API is unavailable, the page falls back to demo data and displays the `Demo data` badge. This fallback must not be treated as production model output.

Optional browser configuration:

```javascript
localStorage.setItem('MODEL_API_BASE', 'http://127.0.0.1:8000')
localStorage.removeItem('MODEL_API_OFF')
```

To force demo mode:

```javascript
localStorage.setItem('MODEL_API_OFF', '1')
```

## 9. Troubleshooting

### `FileNotFoundError` for `output/models/model.pkl`

The model artifacts are missing. Regenerate them using Section 5 or obtain the approved artifact bundle.

### `FileNotFoundError` for `Master_Beauty_Dataset.csv`

The pipeline currently expects the dataset at the project-root path hardcoded in `src/ml/run_pipeline.py`. Place the approved dataset there or update the pipeline path as a separate implementation change.

### The browser shows `Demo data`

Check that the API is running on port 8000, that the dashboard is served through HTTP on port 8080, and that `MODEL_API_OFF` is not set to `1`.

### CORS or connection errors

Use `python -m http.server 8080` for the dashboard instead of opening the HTML directly with `file://`. The current development API allows all origins; this must be restricted before production.

## 10. Reproducibility note

The model report documents the claimed test results in `MODEL_TESTING_REPORT.md`. A future production handoff should additionally publish the exact dataset artifact, generated model bundle, checksums, environment lockfile, and a successful clean-clone run.
