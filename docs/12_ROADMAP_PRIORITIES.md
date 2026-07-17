# Roadmap and priorities

## Sprint 0 - Repository consolidation

- Create the structure and `.gitignore`.
- Move the HTML prototype to `prototype/`.
- Move the current notebook to `notebooks/01_data_cleaning_current.ipynb`.
- Define dataset manifests.
- Separate reusable code from the notebook.

## P0 - Demonstrable MVP

### P0.1 Data foundation

1. Reprocess taxonomy using `categories[1]`.
2. Build Dataset A, B, and C separately.
3. Create the target and its sensitivity analysis.
4. Generate fake data for development.
5. Export Power BI datasets.

### P0.2 Machine Learning

1. Logistic Regression baseline.
2. Random Forest baseline.
3. CatBoost candidate.
4. Calibration.
5. k-NN comparables and saturation.
6. Risk, profit, and price scenario engine.

### P0.3 Product

1. Migrate Analyze and Results to Next.js.
2. FastAPI `/analyses`.
3. Supabase tables and RLS.
4. History.
5. Power BI validation.
6. Disclosure and limitations.

## P1 - Enriched product

- Review sentiment and topics.
- Demand scenarios and forecasting.
- Discover Trending.
- My Store portfolio.
- Local SHAP.
- Monitoring and drift.

## P2 - Integrations and experiments

- NameAge lookup.
- Google Trends connector.
- Amazon Seller connector.
- Automated listing with confirmation.
- Multi-market support.

## Critical dependencies

| Milestone | Depends on |
|---|---|
| Success model | Dataset A without survivorship bias |
| Real profit | Cost inputs |
| Monthly profit | Units or demand scenario |
| Sentiment | Dataset C of reviews |
| NameAge | Explicit first name or external source |
| Trend radar | Real temporal source |
| Amazon publish | OAuth/API and legal review |

## Recommended execution order

```text
Data split -> Target -> Baselines -> Calibration -> Comparables
-> Risk/Profit -> FastAPI -> Next.js -> Supabase -> Power BI
-> NLP -> Trends -> Portfolio -> NameAge/Integrations
```
