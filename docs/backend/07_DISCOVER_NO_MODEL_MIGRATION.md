# Discover migration without model artifacts

## Purpose

This runbook keeps Discover useful when the catalog is available in the
Coolify-hosted FastAPI/MySQL environment but the trained model artifact and
`scored_catalog.csv` are unavailable. It preserves data provenance: observed
catalog facts remain visible, while model-derived metrics remain unavailable.

This is a migration plan, not a replacement model. It must not retrain,
recalibrate, infer a numeric Success Score, or change Decision Risk weights.

## Source of truth

Use the processed catalog CSV as the import source. The canonical taxonomy is
the second element of the product category path (`categories[1]`), not
`main_category`. `main_category` is known to contain marketplace placement and
unrelated values.

The canonical categories are:

1. `Hair Care`
2. `Skin Care`
3. `Foot, Hand & Nail Care`
4. `Makeup`
5. `Tools & Accessories`
6. `Fragrance`
7. `Shave & Hair Removal`
8. `Personal Care`

Before running an import, verify that the configured processed CSV and its
category-statistics output exist in the deployment environment. The raw CSV is
only a fallback source; it must be processed with the existing parsing rules
before it is imported.

## Phase 1: migrate the catalog taxonomy

1. Snapshot the MySQL `products` and `product_categories` row counts.
2. Parse each processed row, preserve its `parent_asin`, and extract only a
   canonical category from `categories[1]` when it belongs to the list above.
3. Upsert the category association by `(parent_asin, category_name)`.
4. Add or verify an index on `(category_name, parent_asin)`.
5. Exclude malformed and promotional category paths from Discover; log their
   count in the import report instead of assigning a guessed category.

The import must be idempotent. A rerun cannot create duplicate category links.

## Phase 2: expose server-side catalog pages

FastAPI owns category and product filtering:

```text
GET /v1/datasets/product-categories
GET /v1/datasets/products?category=Skin%20Care&limit=12&skip=0
```

`product-categories` must return the canonical categories sorted
deterministically. `products` must use a parameterized exact match, return a
single product per `parent_asin`, and include `{items, skip, limit, total}`.
Next.js proxies these endpoints and resets `skip` to zero after a category
selection; it does not filter an already-loaded page in the browser.

## Phase 3: historical label, not model metrics

The established dataset rule can create an auditable historical binary label:

```text
average_rating >= subcategory median
AND log1p(review_count) >= subcategory 60th percentile
```

Store it with the dataset version and computation timestamp, for example in a
dedicated `catalog_historical_labels` table keyed by `parent_asin` and
`dataset_version`. The label may be shown as `Historical success label: Met` or
`Not met`.

It must never be renamed to `Success Score`, converted to a percentage, or
used to populate `decision_risk`. Ratings and review count are historical
outcomes, not pre-launch user inputs.

## Phase 4: selectable cards and persistence

Cards may be selected whenever they have a stable `parent_asin` and observed
price, even while model metrics are unavailable. Persist shortlist data through
the FastAPI/Coolify MySQL service, rather than treating the Supabase Store
tables as a dependency for Discover availability.

A shortlist item stores the product identity, observed price, source payload,
historical-label status, and a `score_status` value:

- `historical_label_only`
- `model_metrics_available`

If remote persistence temporarily fails, preserve the item in browser storage
and show a non-blocking `Saved locally` state. On recovery, synchronize it
without replacing observed catalog facts.

## Phase 5: card display rules

| Card value | Before model restoration | Required label |
|---|---|---|
| Sell at | Observed catalog price only | `Sell at` |
| Rating and reviews | Observed catalog facts | `Observed` or neutral field labels |
| Success label | Threshold-derived binary label | `Historical success label` |
| Success Score | Unavailable | `Model score pending` |
| Decision Risk | Unavailable | Do not render a numeric risk value |
| Graph and “Could make about” | Deterministic UI scenario | `Simulated scenario — not observed sales data` |

Profit, monthly sales, and real trend remain unavailable until independently
sourced and documented. The simulated graph stays visible because it supports
the scenario interaction, but it must not be described as a dataset trend.

## Phase 6: later metric backfill

When the compatible trained model, calibrator, feature matrix, and supporting
artifacts are restored:

1. Run the existing artifact-only catalog export; do not retrain.
2. Validate every emitted metric row has the expected `parent_asin`, a score
   and risk within 0–100, versions, and `computed_at`.
3. Upsert the results into versioned `product_metrics`.
4. Configure the active model and dataset versions in FastAPI.
5. Verify cards receive and display the returned score and risk unchanged.

Only then may Discover replace the pending state with `Success Score — model
output` and `Decision Risk — decision index` plus its component breakdown.

## Validation gates

| Gate | Pass condition |
|---|---|
| Taxonomy | Exactly the eight canonical categories are exposed; no `main_category` values are used. |
| Filtering | An exact category query returns no duplicates and an accurate `total` across pages. |
| Facts | Price, rating, and review count match the imported catalog source. |
| Truthfulness | No numeric score/risk, sales, or profit is rendered without its documented source. |
| Selection | A selected product survives refresh locally and persists remotely when FastAPI/MySQL is reachable. |
| Backfill | Restored artifact outputs match the existing metric functions before activation. |
