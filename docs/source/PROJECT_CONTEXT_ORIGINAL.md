# Product Success Predictor
### Estimating market viability before launch using public e-commerce data

This file preserves the original project context in a clean English form so the repository stays consistent with the rest of the documentation.

## 1. Core idea

Entrepreneurs and small businesses often decide to launch a new product based on intuition or limited competitor research, without access to expensive market studies. Marketplaces like Amazon already contain thousands of similar products with measurable outcomes such as ratings, review volume, and sentiment that reveal what actually works.

The project builds a data-driven framework that estimates the likely success of a new product before launch, using patterns learned from existing comparable products.

## 2. Research question

Can measurable characteristics of a proposed product, such as price, category, description, and positioning, be used to estimate its likelihood of market success based on patterns observed in similar existing products?

## 3. Hypothesis

Products whose price, category positioning, and description align with the patterns of currently successful products in the same category will show a higher predicted success score than products that deviate from those patterns.

A valid outcome is also that no strong predictive signal exists, meaning success in this market is driven more by factors outside the available data, such as marketing spend or brand trust, than by product attributes alone. The project is designed so either conclusion is informative.

## 4. Target user

A small business or individual entrepreneur deciding whether to invest in launching a new product, without budget for formal market research.

## 5. Final deliverable

A live web page, not a static report. The dashboard is the product. For any product a user inputs, it displays:

- Viability score from 0 to 100
- Key factors driving the score
- Comparison against similar existing products
- Suggested price range
- Confidence and limitations of the estimate

## 6. Scope decisions

- **Data source:** `meta_Beauty_and_Personal_Care.json` from Amazon Reviews'23, McAuley Lab, UCSD. It is JSON Lines format despite the `.json` extension.
- **Category:** Beauty and Personal Care, all 8 real subcategories, combined into a single dataset, using subcategory as a categorical feature in one unified model rather than 8 separate models.
- **Reviews file:** not yet downloaded. It is not required for the core pipeline because `average_rating` and `rating_number` in the metadata file are already Amazon-computed aggregates and serve as the market-outcome signal. Sentiment analysis on raw review text is a stretch layer, not a blocker.

## 7. Dataset profile

Profiled from a 5 percent systematic sample of 51,445 records out of 1,028,914 total records.

### Volume

- 1,028,914 products total

### Numeric fields

| Field | Finding |
|---|---|
| `price` | 63.1 percent null, consistent across subcategories. When present: median 16 USD, mean 28.18 USD, range 0.01 to 2,699 USD, heavily right-skewed |
| `average_rating` | 100 percent present. Median 4.2, mean 4.06, range 1 to 5 |
| `rating_number` | 100 percent present, heavily right-skewed: median 19, mean 233.5, max 99,553, requires log transform |

### Category taxonomy

- `main_category` is noise and not usable.
- `categories` at level 2 is the real taxonomy.
- 8 real subcategories cover about 98 percent of products:

| Subcategory | Share | Price null rate |
|---|---|---|
| Hair Care | 30.0 percent | 64.7 percent |
| Skin Care | 19.2 percent | 60.0 percent |
| Foot, Hand & Nail Care | 12.3 percent | 63.7 percent |
| Makeup | 11.8 percent | 64.9 percent |
| Tools & Accessories | 11.2 percent | 66.0 percent |
| Fragrance | 5.2 percent | 60.4 percent |
| Shave & Hair Removal | 4.3 percent | 57.7 percent |
| Personal Care | 4.0 percent | 61.1 percent |

The remainder is promotional or junk tagging and is filtered out.

### Text fields

| Field | Finding |
|---|---|
| `title` | Always present |
| `features` | 27.7 percent empty |
| `description` | 45.5 percent empty, less reliable than `features` |

### Specs

The `details` dictionary is sparse and inconsistent. The most relevant fields include Manufacturer, Brand, UPC, Package Dimensions, Item Form, Product Dimensions, Color, Material, Age Range, Hair Type, Unit Count, Scent, Skin Type, Product Benefits, and Special Feature, but most appear in fewer than 75 percent of products.

### Unusable fields

- `videos` is not useful for the core pipeline.
- `bought_together` is empty.

## 8. Tooling and architecture

The final result should be a real deployed web page, so the project is split across three tools:

- **Google Colab:** heavy iterative compute for data cleaning, EDA, NLP feature engineering, and model training.
- **GitHub:** code, notebooks, and lightweight artifacts such as the serialized model, percentile tables, and comparable-product index.
- **Streamlit Community Cloud:** deployment target for the live web page.

If a transformer-based sentiment model is used, it should run once offline in Colab and only the precomputed output should be shipped to the deployed app.

## 9. Project phases

1. Scope
2. Data collection and cleaning
3. Exploratory data analysis
4. Success target design
5. Modeling
6. Dashboard and deployment
7. Validation and limitations

## 10. Known limitations

- No real sales data.
- Success is a proxy built from rating and review volume, not actual revenue or units sold.
- 63 percent of products have no recorded price.
- `main_category` is unreliable and should not be used as truth.
- Most specs are sparse, so they should be treated as optional features.
- The framework would likely fail on a genuinely novel subcategory with no comparable historical products.
