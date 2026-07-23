# Discover card data requirements

## Current evidence

The Amazon catalog supplies `parent_asin`, title, category path, description,
image, observed price, average rating, and review count. The ML pipeline derives
the historical binary `success` label from rating and review-volume thresholds.

Before this change, Discover fetched only one unfiltered page and filtered those
12 products in the browser. It also generated fallback price, success score,
monthly profit, trend percentage, and a simulated sparkline. Those values were
not dataset facts and must not be presented as such.

### Current deployment state

The current workspace does not contain the trained model artifact or the
generated `scored_catalog.csv`. Therefore no catalog card can currently claim
to have a model-derived Success Score or Decision Risk. A missing metric row is
an explicit unavailable state, not permission to calculate a browser fallback.
The staged migration for this state is documented in
[`07_DISCOVER_NO_MODEL_MIGRATION.md`](07_DISCOVER_NO_MODEL_MIGRATION.md).

## Card contract

| Value | Source | Display rule |
|---|---|---|
| Title, image, category, description | Catalog tables | Show when supplied by the catalog. |
| Selling price | `products.price` | Show only when populated; otherwise display `Unavailable`. |
| Success Score | `product_metrics.success_score` | Existing model output for the matching product and active versions. Label it `Success Score`. |
| Decision Risk | `product_metrics.decision_risk` | Existing risk index. Never call it failure probability. |
| Risk breakdown | `risk_downside`, `risk_saturation`, `risk_uncertainty` | Show only after the user requests risk details. |
| Historical success label | Derived from catalog rating and review-volume thresholds | Available for audits; do not present it as sales or a model score. |
| Monthly profit, sales, trend, forecast | No current catalog source | Hide. |

## Metric batch and storage

The ML batch writes `output/predictions/scored_catalog.csv` with one row per
`parent_asin`: observed facts, Success Score, Decision Risk and components,
`model_version`, `dataset_version`, and `computed_at`. Its initial artifact
build also stores the exact catalog feature matrix. Subsequent metric exports
use that matrix and the established trained/calibrated model artifact as-is;
they do not retrain, recalibrate, or change risk weights for Discover.

Apply `src/api/sql/20260722_add_product_metrics.sql`, then load the CSV from
`src/api`:

```powershell
python src/ml/export_catalog_metrics.py
cd src/api
python scripts/load_product_metrics.py --input ../../output/predictions/scored_catalog.csv
```

`product_metrics` is versioned by `(parent_asin, model_version,
dataset_version)`. The API joins only the configured active model and dataset
versions. A card with no matching row must show metrics as unavailable and may
not fabricate fallback values.

Until the model artifacts are restored, the catalog migration may persist the
historical binary label separately. It must not populate `success_score`,
`decision_risk`, or risk components from that label.

## Acceptance requirements

- Selecting a category requests page 1 from the API and returns all catalog
  products with that exact leaf category across pagination.
- A card renders backend score and risk values unchanged; both remain within
  0–100.
- Risk details retain the three components and the index disclaimer.
- Catalog price is not replaced by a generated number.
- No card claims profit, sales, trend, or forecast until an independently
  sourced contract and validation evidence exist.
