# Repository Guidelines

## Project Structure

Launchly is a Beauty and Personal Care product decision-support MVP. It combines calibrated machine-learning scores, risk indices, profitability assumptions, comparable products, market saturation, and price scenarios.

- `src/ml/`: feature engineering, training, validation, leakage audits, and metrics.
- `src/api/`: FastAPI service that serves the calibrated model.
- `tests/`: formula and model tests.
- `docs/`: PRD, requirements, architecture, API, validation, and risk documentation.
- `data/`: raw and processed datasets; keep large local data out of Git.
- `output/`: generated metrics, figures, predictions, and model artifacts.
- `prototype/`, `outputs/`, and `notebooks/`: HTML prototypes, mockups, and research work.

Read `docs/01_PRD_MASTER.md` and `docs/00_INDEX.md` before changing product behavior or model assumptions.

## Setup and Development

Install the shared Python dependencies with:

```bash
pip install -r requirements.txt
```

Run the test suite or its dependency-light fallback with:

```bash
python -m pytest tests/test_metrics.py -v
python tests/test_metrics.py
```

Run the API from `src/api/` with `uvicorn main:app --reload --port 8000`. Serve the static prototype from the repository root with `python -m http.server 8080`.

## Coding and Documentation Style

Use four-space indentation, clear Python type hints where practical, `snake_case` for functions and modules, and `PascalCase` for classes. Keep modules focused and preserve deterministic seeds in ML experiments. Write all repository documentation, comments, and user-facing technical notes in English.

## Testing and Validation

Add focused tests for changed formulas, API behavior, and data transformations. Model changes should preserve out-of-fold validation, calibration checks, leakage audits, and baseline comparisons. Keep the distinction explicit: Success Score is a calibrated historical proxy, Decision Risk is an index, and profit is valid only when cost assumptions are complete.

## Data, Security, and Artifacts

Never commit raw datasets, large CSV/Parquet files, serialized models, embeddings, secrets, credentials, or private environment files. Follow `.gitignore` and use `.env.example` for documented configuration. Restrict API CORS before production deployment.

## Commits and Pull Requests

Use short, imperative, descriptive commit subjects, such as `Add calibrated model validation`. Keep commits focused. Pull requests should explain the change, list validation commands and results, identify model or data impacts, link relevant issues or requirements, and include screenshots for UI changes.
