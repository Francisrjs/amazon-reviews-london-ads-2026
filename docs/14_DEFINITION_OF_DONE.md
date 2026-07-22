# Definition of Done - MVP

> **Status as of 20 July 2026:** The calibrated model, validation battery, local FastAPI inference endpoints, and HTML live-model integration are implemented. The unchecked items below remain the authoritative closure checklist; the MVP is not complete until persistence, profit, Power BI export, production deployment, security, and reproducible artifacts are delivered. See [18_BACKEND_RUNBOOK.md](18_BACKEND_RUNBOOK.md) for the current local workflow.

## Data

- [ ] Datasets A, B, and C built and versioned.
- [ ] Real taxonomy validated.
- [ ] Target documented and sensitivity calculated.
- [ ] Leakage audit approved.
- [ ] Power BI dataset exported.

## ML

- [ ] Simple baseline trained.
- [ ] Candidate model compared.
- [ ] Final isolated test.
- [ ] Calibration approved.
- [ ] Comparables and saturation validated.
- [ ] Risk and profit covered by unit tests.
- [ ] Model card published.

## Backend

- [ ] FastAPI deployed.
- [ ] P0 endpoints documented.
- [ ] Artifacts loaded from storage.
- [ ] Logs and request ids available.
- [ ] Supabase RLS approved.

## Frontend

- [ ] Production analyze form.
- [ ] Success, risk, and profit clearly separated.
- [ ] Interactive price scenario.
- [ ] Comparables visible.
- [ ] Error, loading, and empty states.
- [ ] Responsive and accessible contrast.
- [ ] Demo data labeled.

## Product

- [ ] Analysis history.
- [ ] Visible disclaimer.
- [ ] Visible model and data version.
- [ ] End-to-end presentation with an unseen product.
- [ ] Git documentation updated.

## Final criterion

The MVP is complete when a person can enter a product, receive a real analysis backed by a versioned model, understand its limitations, and retrieve the same result later, with no main KPI depending on simulated values.
