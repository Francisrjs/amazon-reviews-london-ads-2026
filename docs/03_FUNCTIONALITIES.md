# Functional Inventory

## A. Analyze a Product

| ID | Function | Description | Data/service | Priority | Expected outcome |
|---|---|---|---|---:|---|
| FUN-A01 | Category selection | Choose one of the clean subcategories | Taxonomy catalog | P0 | Valid `subcategory_id` |
| FUN-A02 | Product brief | Title, description, benefits, and ingredients | Form | P0 | Text ready for features |
| FUN-A03 | Price and costs | Price, COGS, shipping, fees, ads, and returns | Form/rules | P0 | Transparent margin |
| FUN-A04 | Risk preference | Cautious/Balanced/Bold | UX preference | P1 | Changes wording, not probability |
| FUN-A05 | Success Score | Calibrated proxy probability | Classifier | P0 | 0-100 score + confidence |
| FUN-A06 | Decision Risk | Downside + saturation + uncertainty | Formula | P0 | 0-100 index with breakdown |
| FUN-A07 | Profit per Sale | Price minus all costs | Formula | P0 | Per-unit margin |
| FUN-A08 | Expected Profit | Margin x expected units | Demand model/assumption | P1 | Monthly or annual scenario |

## B. Full Breakdown

| ID | Function | Description | Data/service | Priority | Expected outcome |
|---|---|---|---|---:|---|
| FUN-B01 | Price simulation | Grid sweep | Model + rules | P0 | Best price and curve |
| FUN-B02 | Similar products | k-NN by cosine similarity | Embeddings/index | P0 | Comparable list |
| FUN-B03 | Saturation | Local density | k-NN | P0 | Saturation percentile |
| FUN-B04 | Confidence | Dispersion or ensemble | Model | P0 | Low/medium/high |
| FUN-B05 | Explanations | Positive/negative factors | SHAP or rules | P1 | Explainable text |
| FUN-B06 | Demand forecast | Time series | Temporal module | P1 | Period scenario |
| FUN-B07 | Audience age | Aggregate segment | NameAge/lookup | P2 | Probable distribution |

## C. Discover Trending

| ID | Function | Description | Data/service | Priority |
|---|---|---|---|---:|
| FUN-C01 | Filters | Subcategory, price, rating, trend | Catalog | P1 |
| FUN-C02 | Trending cards | Featured products | Snapshot | P1 |
| FUN-C03 | Add to store | Save to portfolio | Supabase | P1 |

## D. My Store

| ID | Function | Description | Data/service | Priority |
|---|---|---|---|---:|
| FUN-D01 | Portfolio CRUD | Add/remove products | Supabase | P1 |
| FUN-D02 | Aggregated KPIs | Total score, profit, risk | Calculation | P1 |
| FUN-D03 | Internal comparison | Product A vs B | Model/rules | P1 |
| FUN-D04 | Export | CSV/Power BI | Export | P1 |

## E. Trend Radar and integrations

| ID | Function | Description | Data/service | Priority |
|---|---|---|---|---:|
| FUN-E01 | Trend Radar | Trends by category | Temporal source | P2 |
| FUN-E02 | Google Trends modal | Search external trend data | External API | P2 |
| FUN-E03 | Amazon Seller modal | Connect account | OAuth/API | P2 |
| FUN-E04 | Publish listing | Publish with confirmation | API | P2 |

## F. Cross-cutting features

- Authentication and session handling.
- Persisted analysis states.
- Demo vs production labels.
- Model/version disclosure.
- Error, loading, and empty states.
- Responsive design.
- Basic accessibility.
