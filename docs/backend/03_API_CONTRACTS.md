# API contracts

All `/v1` data endpoints require `Authorization: Bearer <supabase-access-token>`.
`GET /health` and `GET /v1/models/current` remain public.

## Discover catalog

| Method | Path | Behavior |
|---|---|---|
| GET | `/v1/datasets/products?skip=0&limit=12&category=Skin%20Care` | Returns a paginated catalog page, optionally filtered by one exact leaf category. |
| GET | `/v1/datasets/product-categories` | Returns alphabetically sorted leaf categories, excluding `Beauty & Personal Care`. |

`GET /v1/datasets/products` returns `{items, skip, limit, total}`. `category` is
an exact, parameterized category match; products are returned once even where
their category path has multiple entries. Each item may include the active
precomputed metric version:

```json
{
  "success_score": 78.42,
  "decision_risk": 31,
  "risk_downside": 21.58,
  "risk_saturation": 48.2,
  "risk_uncertainty": 17.1,
  "model_version": "success-rf-0.1.0",
  "dataset_version": "beauty-master-2026-07",
  "computed_at": "2026-07-22T12:00:00Z"
}
```

The fields are absent or `null` when the matching batch has not been loaded or
the model artifact is unavailable. They are never synthesized by the API or
browser. In that state, a separately documented historical binary label may be
returned for audit/display purposes, but it is not a replacement for either
model metric.

## Analysis

`POST /v1/analyses` accepts:

```json
{
  "request_id": "7a40cc60-cc59-47a9-8ca4-b067db385fc5",
  "subcategory": "Skin Care",
  "title": "Hydrating Vitamin C Serum",
  "description": "Vegan, lightweight and fast absorbing serum",
  "market": "US",
  "currency": "USD",
  "selling_price": 30,
  "unit_cost": 8,
  "fulfilment_cost": 4,
  "marketplace_fee_pct": 15,
  "advertising_cost_per_unit": 3,
  "return_allowance": 1,
  "expected_units_monthly": 100,
  "risk_preference": "balanced"
}
```

`price` remains a compatibility alias for `selling_price`. The response adds
`analysis_id`, `request_id`, `status`, and `profit`. Profit contains
`marketplace_fee`, `per_sale`, optional `expected_monthly`, `is_complete`,
`missing_costs`, and `source_type=formula`.

`GET /v1/analyses?limit=20&cursor=...` uses opaque keyset pagination over
`(created_at, id)`. `GET /v1/analyses/{id}` returns only caller-owned data.

## Store and shortlist

| Method | Path | Behavior |
|---|---|---|
| GET | `/v1/store` | Return `{store, shortlist}` |
| PUT | `/v1/store` | Replace store metadata and products |
| DELETE | `/v1/store` | Delete the store and catalog links |
| GET/POST | `/v1/store/products` | Read or append a store product |
| DELETE | `/v1/store/products/{id}` | Remove one product |
| GET/POST | `/v1/shortlist` | Read or append a shortlist product |
| DELETE | `/v1/shortlist/{id}` | Remove one shortlist product |
| POST | `/v1/store/import` | Atomically import store and shortlist |

Store products retain `successScore`, `monthlyProfit`, and `startupCost` at the
API boundary. Persistence maps them to snake_case. `sourceType` prevents demo
financials from being presented as model output.

## Errors

- `401`: missing, invalid, expired, or wrong-role token.
- `404`: owned resource not found.
- `409`: unmergeable idempotency or constraint conflict.
- `422`: invalid product, costs, taxonomy, or cursor.
- `502/503`: Supabase, artifacts, or backend dependency unavailable.

Responses include `X-Request-ID` and disable shared caching.
