# Product Requirements

## 1. Functional requirements

| ID | Requirement | Priority | Acceptance criteria | Initial state |
|---|---|---:|---|---|
| FR-001 | The user can select a valid subcategory | P0 | Only approved taxonomy is accepted; unknown values trigger a controlled error | Prototype |
| FR-002 | The user can enter title and description | P0 | Length, character, and empty-field validation are applied | Prototype |
| FR-003 | The user can enter price and costs | P0 | Price > 0; costs are non-negative; currency and market are visible | Costs missing |
| FR-004 | The system generates a Success Score | P0 | Response includes score, model, date, and data quality | Simulated |
| FR-005 | The system generates a Decision Risk | P0 | Components are shown and it is clearly labeled as not being a probability | Simulated |
| FR-006 | The system calculates Profit per Sale | P0 | Formula is broken down and editable | Partial/simulated |
| FR-007 | The system finds comparable products | P0 | Returns k products, similarity, and relevant fields | Simulated |
| FR-008 | The system calculates saturation | P0 | Percentile within the subcategory, excluding self-neighbor | Simulated |
| FR-009 | The system simulates a price grid | P0 | Returns score, risk, and profit for each valid price | Prototype |
| FR-010 | The system explains the recommendation | P0 | At least two positive and negative factors based on the model or rules | Prototype |
| FR-011 | The user can save an analysis | P0 | Input, output, model version, and user are persisted | Not started |
| FR-012 | The system exports results for Power BI | P0 | CSV/Parquet or stable SQL view with versioned schema | Not started |
| FR-013 | The system shows limitations | P0 | Visible disclaimer and no causal claims | Partial |
| FR-014 | The system analyzes comparable sentiment | P1 | Positive/neutral/negative with sample size | Simulated |
| FR-015 | The system extracts review topics and keywords | P1 | Shows frequency and polarity with minimum evidence | Simulated |
| FR-016 | The system shows temporal demand | P1 | Source and period are visible; simulated values are not presented as real | Simulated |
| FR-017 | The user can discover trending products | P1 | Filters and cards backed by updated data | Prototype |
| FR-018 | The user can create a store portfolio | P1 | Add/remove products and view aggregated metrics | Prototype |
| FR-019 | The system generates a probable audience | P1 | Aggregate segment with confidence and evidence | Simulated |
| FR-020 | The system estimates age by first name | P2 | Only with explicit name, US source, and full distribution | Not started |
| FR-021 | Google Trends integration | P2 | Credentials, fallbacks, and identified source | Mock |
| FR-022 | Amazon Seller integration | P2 | OAuth, minimum scopes, and confirmation before publishing | Mock |
| FR-023 | Automated listing publication | P2 | Never publishes without confirmation; audit log required | Mock |

## 2. Data requirements

| ID | Requirement | Priority | Validation |
|---|---|---:|---|
| DR-001 | Keep the general dataset without filtering by success | P0 | Includes low- and high-performing products |
| DR-002 | Split out a priced subset | P0 | `price_available = true`; does not replace the general dataset |
| DR-003 | Split out an NLP subset with enough reviews | P0 | Documented threshold, text insights only |
| DR-004 | Preserve `price_is_missing` | P0 | Do not impute price without justification |
| DR-005 | Use the real `categories` taxonomy | P0 | Do not rely on `main_category` as truth |
| DR-006 | Avoid leakage | P0 | Rating/reviews are not available to the launch-time feature set |
| DR-007 | Version snapshots and schemas | P0 | Each output has `dataset_version` and date |
| DR-008 | Partition heavy data | P1 | Parquet by category/year |

## 3. Non-functional requirements

| ID | Requirement | Priority | Target |
|---|---|---:|---|
| NFR-001 | Performance | P0 | Prediction p95 < 5 s |
| NFR-002 | Availability | P1 | 99 percent monthly uptime for the deployed MVP |
| NFR-003 | Security | P0 | RLS, secrets outside Git, HTTPS |
| NFR-004 | Privacy | P0 | Do not store unnecessary personal inferences |
| NFR-005 | Traceability | P0 | Model version + data version + request id |
| NFR-006 | Reproducibility | P0 | Pipeline runnable from scripts, not only notebooks |
| NFR-007 | Observability | P1 | Logs, latency, errors, basic drift |
| NFR-008 | Accessibility | P1 | AA contrast, keyboard support, labels, responsive layout |
| NFR-009 | Maintainability | P0 | Types, tests, lint, and documentation |
| NFR-010 | Portability | P1 | S3-compatible storage and open formats |

## 4. Business rules

1. `Success Score` comes from a calibrated model.
2. `Decision Risk` is an explainable formula; it is not presented as a probability.
3. `Profit per Sale` is not shown as real if costs are missing; default it to an estimate.
4. `Expected Monthly Profit` requires a unit estimate and must show assumptions.
5. Suggested price is restricted to historical support, minimum margin, and category percentiles.
6. Name-based estimation never claims an exact individual age.
