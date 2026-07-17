# HTML MVP to production mapping

## 1. Diagnosis

`AmazonProject.html` is a complete and useful front-end prototype that works as a visual specification. It includes 4 main experiences, plus connectors and modals. However, the core `computeAnalysis()` function calculates values using category constants, positive and negative keywords, manual formulas, and deterministic randomness. Therefore, the current numbers are mock data, not machine-learning outputs.

## 2. Detected screens

| HTML area | Visible components | State | Production replacement |
|---|---|---|---|
| Analyze a product | Category, price, description, risk preference | Functional UI | React validation + API |
| Results | Profit, success, risk, verdict | Simulated | Model inference + finance engine |
| Recommendation | Most profit, safest bet, market/store/rival | Simulated/hardcoded | Price sweep + comparables + channel data |
| Price curve | Slider and curve | Functional UI with mock data | `/price-scenarios` |
| Full breakdown | Forecast, price, saturation, age, topics | Simulated | Independent services |
| Similar products | Product cards | Mock | k-NN index |
| Reviews insights | Sentiment, ratings, keywords | Mock | NLP batch outputs |
| Discover trending | Cards, filters, cart | Mock | Trend datasets |
| My Store | Portfolio/KPIs/automation | Local JS | Supabase persistence |
| Trend Radar | Category/product trends | Mock | Real temporal source |
| Google Trends modal | Configurable endpoint | Mock | Secure backend integration |
| Amazon Store modal | Seller input | Mock | Official OAuth/API |

## 3. Rules that must be replaced

| HTML result | Current implementation | Required implementation |
|---|---|---|
| Success chance | Sum of price-fit, keywords, competition, and baseline | Calibrated classifier probability |
| Decision risk | Manual mix of success and category risk | Versioned formula with saturation + uncertainty |
| Profit per sale | Constant-based function | Price - COGS - fees - fulfilment - ads - returns |
| Monthly profit | Unit heuristic | Demand model or explicit scenario |
| Saturation | `cat.comp` + noise | k-NN similarity percentile |
| Age bars | Normalized random vector | Audience model or aggregated NameAge lookup |
| Topics | Fixed category tags | Review topic extraction |
| Similar products | Embedded JS catalog | Vector index over the real catalog |
| Forecast | Simulated series | Reviews by date + trend source |
| Best market | Fixed "United States" | Market-specific data or remove from MVP |
| Best store | Fixed "Amazon" | Fee/channel comparison or remove |

## 4. Required form changes

The HTML asks for price, description, and risk tolerance. To calculate profit credibly, the form must also include:

- Product title.
- Unit cost or COGS.
- Fulfilment and shipping cost.
- Marketplace fee or channel.
- Advertising cost per unit or percentage.
- Return allowance.
- Country/market and currency.
- Optional: brand, item form, skin type, hair type, benefits.

## 5. Proposed componentization

```text
src/frontend/
├── app/
│   ├── analyze/
│   ├── discover/
│   ├── store/
│   └── trends/
├── components/
│   ├── ProductForm.tsx
│   ├── SuccessCard.tsx
│   ├── RiskCard.tsx
│   ├── ProfitCard.tsx
│   ├── RecommendationPanel.tsx
│   ├── PriceScenarioChart.tsx
│   ├── ComparableProducts.tsx
│   ├── ReviewInsights.tsx
│   ├── AudienceChart.tsx
│   └── ModelDisclosure.tsx
└── lib/
    ├── api.ts
    ├── validation.ts
    └── types.ts
```

## 6. Migration acceptance criteria

- No production KPI uses `Math.random`, seeded randomness, or hardcoded values.
- Every result includes `source_type`: `model`, `formula`, `external_data`, or `simulation`.
- Demo mode remains available, but with a visible "Demo data" label.
- The UI keeps the current design with AA contrast and mobile support.
