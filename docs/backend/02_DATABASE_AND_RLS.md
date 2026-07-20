# Database and RLS

## Data model

| Table | Responsibility |
|---|---|
| `profiles` | One application profile per Auth user |
| `stores` | One named portfolio per owner |
| `portfolio_products` | Complete product snapshots plus `source_payload` |
| `shortlist_items` | Ordered shortlist relations |
| `store_products` | Ordered store catalog relations |
| `analyses` | Ownership, idempotency, versions, status, and raw result |
| `product_inputs` | Product, market, currency, and financial inputs |
| `analysis_metrics` | Success, risk, saturation, price, and profit summaries |
| `price_scenarios` | Model price curve with formula profit |
| `analysis_comparables` | Ranked comparable products |
| `model_versions` | Model registry and validation metadata |
| `dataset_versions` | Dataset snapshot registry |
| `audit_events` | Security-sensitive and idempotent actions |

Money uses `numeric`, dates use `timestamptz`, internal IDs use `bigint
identity`, and ownership/request IDs use UUIDs.

`portfolio_products` preserves every frontend `StoreProduct` field in typed
columns. `source_payload` retains future attributes. Composite foreign keys
prevent shortlist and store relations from referencing another user's product.

## RLS policy

- Every user-owned public table has RLS enabled.
- Anonymous users receive no table privileges or policies.
- Policies are separated by operation and target `authenticated`.
- Ownership uses `(select auth.uid()) = owner_id` on indexed columns.
- Model and dataset registries are read-only for authenticated clients.
- RPCs are `security invoker`; public and anonymous execution is revoked.

RPCs never accept an owner ID. They derive it from `auth.uid()`, and all inserts
remain subject to RLS.

## Power BI

`analytics.analysis_export_v1` is a versioned, PII-free summary. It is not
exposed to browser roles. Production BI access must use a controlled server-side
credential or export job; credentials must never be committed to Git.
