# Power BI - data and model validation

## 1. Objective

Power BI does not train the main model. It is used to:

- Validate data quality and coverage.
- Analyze the target.
- Compare models and versions.
- Audit predictions.
- Present business results.

## 2. Sources for Power BI

### Local phase

- `output/powerbi/data_quality.csv`
- `output/powerbi/model_predictions.csv`
- `output/powerbi/price_scenarios.csv`
- `output/powerbi/comparables.csv`

### Deployed phase

- Read-only PostgreSQL connection to Supabase views.
- Or a scheduled export from Supabase or R2.

## 3. Page 1 - Data Quality

KPIs:

- Total products.
- Products with and without price.
- Products by subcategory.
- Total reviews.
- Join coverage.
- Missing description and features.

Visuals:

- Missing values matrix.
- Price distribution.
- Log review distribution.
- Products removed by rule.

## 4. Page 2 - Target Validation

- Global and per-subcategory positive rate.
- Median rating and review p60.
- Sensitivity for p50/p50, p50/p60, and p50/p75.
- Products that change label.
- Comparison of successful and unsuccessful groups.

## 5. Page 3 - Model Performance

- PR-AUC, ROC-AUC, F1, precision, and recall.
- Brier, ECE, and log loss.
- Confusion matrix.
- Calibration bins.
- Lift by decile.
- Metrics by subcategory.

## 6. Page 4 - Prediction Audit

- Score distribution.
- Uncertainty distribution.
- Risk vs success.
- Saturation vs errors.
- False positives and false negatives.
- Aggregated feature importance and SHAP.

## 7. Page 5 - Pricing

- Price vs calibrated score.
- Price vs expected profit.
- Recommended vs current price.
- Recommendations outside historical support.

## 8. Page 6 - Product Experience

- Analyses per day.
- Latency.
- Error rate.
- Saved products.
- Confidence level distribution.

## 9. Minimum prediction schema

```text
analysis_id
product_id
subcategory
split
actual_success
predicted_probability
calibrated_probability
predicted_label
uncertainty
saturation
risk_index
current_price
recommended_price
profit_per_sale
model_version
dataset_version
created_at
```
