# Validation and QA

## 1. Data tests

- Schema and types.
- Null thresholds.
- Key uniqueness.
- Rating range 1-5.
- Positive price when present.
- Parseable timestamps.
- Approved taxonomy.
- Reproducible counts.

## 2. Leakage tests

The pipeline fails if these appear in the features:

- `average_rating`.
- `rating_number`.
- `review_count` after launch.
- Sentiment from the same product after launch.
- Variables derived directly from the target.

## 3. Model tests

- Baseline comparison.
- Stratified cross-validation.
- Isolated final test.
- Calibration report.
- Slice metrics by category.
- Robustness to empty text and rare categories.
- Basic drift between snapshots.

## 4. API tests

- Unit tests for profit and risk.
- JSON contract tests.
- Invalid price or cost inputs.
- Model service timeout.
- Missing model artifact.
- Idempotent retry.
- Authorization and RLS.

## 5. UX tests

- Mobile and desktop form.
- Contrast and readable light or dark text.
- Loading, error, and empty states.
- Simulated values are clearly labeled.
- Explanation of uncertainty.
- Risk is not confused with probability.

## 6. NameAge tests

- Name found or not found.
- Case insensitive.
- Base year.
- Age range.
- Monotonic quartiles.
- No exact-age claim.
- Country and source are required.

## 7. Acceptance test for the example

Demo input:

```text
Skin Care
Hydrating Vitamin C Serum
Price: 30
COGS: 8
Fulfilment: 4
Fee: 15%
Ads/unit: 3
```

The test does not expect a fixed score; it checks that:

- Score is within [0, 100].
- Risk is within [0, 100].
- Profit matches the formula.
- Comparables belong to the category.
- The price curve has at least 20 points.
- Versions and disclaimers are present.
