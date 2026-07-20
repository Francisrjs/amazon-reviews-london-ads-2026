# API and database

> **Current implementation status:** The local FastAPI service currently implements `/health`, `/v1/models/current`, `/v1/predict/success`, `/v1/comparables`, `/v1/price-scenarios`, and `/v1/analyses`. The proposed persistence, history, profit, and Supabase behavior in this document are not implemented yet. Use [18_BACKEND_RUNBOOK.md](18_BACKEND_RUNBOOK.md) to run the current service.

## 1. Proposed endpoints

| Method | Endpoint | Priority | Function |
|---|---|---:|---|
| POST | `/v1/analyses` | P0 | Run the full analysis; persistence is planned |
| GET | `/v1/analyses/{id}` | P0 | Retrieve an analysis |
| GET | `/v1/analyses` | P0 | User history |
| POST | `/v1/predict/success` | P0 | Calibrated score |
| POST | `/v1/comparables` | P0 | k-NN and saturation |
| POST | `/v1/price-scenarios` | P0 | Price curve |
| POST | `/v1/profit/calculate` | P0 | Margin and scenarios |
| GET | `/v1/models/current` | P0 | Model and data version disclosure |
| POST | `/v1/reviews/insights` | P1 | Sentiment and topics |
| POST | `/v1/audience/estimate` | P1 | Product audience segment |
| POST | `/v1/name-age/estimate` | P2 | Distribution by first name |
| GET | `/v1/trends` | P1/P2 | Trends by category or product |
| POST | `/v1/stores` | P1 | Create portfolio |
| POST | `/v1/stores/{id}/products` | P1 | Add product |
| DELETE | `/v1/stores/{id}/products/{id}` | P1 | Remove product |

## 2. Analysis contract

### Request summary

```json
{
  "subcategory": "Skin Care",
  "title": "Hydrating Vitamin C Serum",
  "description": "Vegan, lightweight and fast absorbing",
  "market": "US",
  "currency": "USD",
  "selling_price": 30,
  "unit_cost": 8,
  "fulfilment_cost": 4,
  "marketplace_fee_pct": 15,
  "advertising_cost_per_unit": 3,
  "risk_preference": "balanced"
}
```

### Response summary

```json
{
  "analysis_id": "uuid",
  "success": {"score": 79, "uncertainty": 18, "confidence": "medium"},
  "risk": {"index": 32, "components": {"downside": 21, "saturation": 54, "uncertainty": 18}},
  "profit": {"per_sale": 10.5, "monthly_scenario": 1260},
  "saturation": 54,
  "recommended_price": 30,
  "price_range": [27, 34],
  "comparables": [],
  "model_version": "success-0.1.0",
  "dataset_version": "beauty-2026-07-01",
  "limitations": []
}
```

## 3. Supabase tables

| Table | Use |
|---|---|
| `profiles` | User profile |
| `product_inputs` | Normalized inputs |
| `analyses` | Header, status, and versions |
| `analysis_metrics` | Success, risk, profit, saturation |
| `price_scenarios` | Price curve |
| `analysis_comparables` | Similar products |
| `review_insights` | Aggregated sentiment and topics |
| `audience_estimates` | Aggregated distribution |
| `stores` | User portfolio |
| `store_products` | Portfolio items |
| `model_versions` | Model registry and metrics |
| `dataset_versions` | Snapshots and checksums |
| `jobs` | Async and batch processes |
| `audit_events` | Sensitive actions and integrations |

## 4. Security

- RLS: each user can only read and write their own analyses and stores.
- Service role only in the backend.
- Requests validated with Pydantic schemas.
- Rate limit on expensive endpoints.
- Text sanitization.
- Audit log for publishing and integrations.

## 5. Asynchronous jobs

Large sentiment, topics, or forecast jobs can return `202 Accepted` with a `job_id`. The UI can poll status or receive a later update.
