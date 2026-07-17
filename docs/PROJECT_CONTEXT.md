# Product Success Predictor
### Estimating Market Viability Before Launch Using Public E-commerce Data

---

## 1. Core Idea

Entrepreneurs and small businesses often decide to launch a new product based on intuition or limited competitor research, without access to expensive market studies. Meanwhile, marketplaces like Amazon already contain thousands of similar products with measurable outcomes (ratings, review volume, sentiment) that reveal what actually works.

This project builds a data-driven framework that estimates the likely success of a new product **before** it's launched, using patterns learned from existing, comparable products.

## 2. Research Question

Can measurable characteristics of a proposed product (price, category, description, positioning) be used to estimate its likelihood of market success, based on patterns observed in similar existing products?

## 3. Hypothesis

Products whose price, category positioning, and description align with the patterns of currently successful products in the same category will show a higher predicted success score than products that deviate from those patterns.

A valid outcome is also: **no strong predictive signal exists**, meaning success in this market is driven more by factors outside the available data (marketing spend, brand trust) than by product attributes alone. The project is designed so either conclusion is informative.

## 4. Target User

A small business or individual entrepreneur deciding whether to invest in launching a new product, without budget for formal market research.

## 5. Final Deliverable

**A live web page**, not a static report. The dashboard is the product. For any product a user inputs, it displays:

- Viability score (0–100)
- Key factors driving the score (feature importance / SHAP)
- Comparison against similar existing products
- Suggested price range
- Confidence/limitations of the estimate

---

## 6. Scope Decisions

- **Data source:** `meta_Beauty_and_Personal_Care.json` (Amazon Reviews'23 dataset, McAuley Lab, UCSD). JSON Lines format despite the `.json` extension.
- **Category:** Beauty & Personal Care, **all 8 real subcategories**, combined into a single dataset, using subcategory as a categorical feature in one unified model (not 8 separate models). This also satisfies the "works across 2-3+ categories" success criterion from the original project brief.
- **Reviews file (individual review text):** not yet downloaded. Not required for the core pipeline: `average_rating` and `rating_number` in the metadata file are already Amazon-computed aggregates and serve as the market-outcome signal. Sentiment analysis on raw review text is a stretch/enrichment layer, not a blocker.

---

## 7. Dataset Profile (measured directly, not assumed)

Profiled from a 5% systematic sample (51,445 of 1,028,914 total records).

**Volume:** 1,028,914 products total.

**Numeric fields:**

| Field | Finding |
|---|---|
| `price` | **63.1% null**, consistent across subcategories (57–66% null everywhere). When present: median $16, mean $28.18, range $0.01–$2,699 (heavily right-skewed) |
| `average_rating` | 100% present. Median 4.2, mean 4.06, range 1–5 |
| `rating_number` | 100% present, **heavily right-skewed**: median 19, mean 233.5, max 99,553 → requires log-transform |

**Category taxonomy:**

- `main_category` is **noise, not usable**: 71.7% generic "All Beauty," 10% null, and unrelated values ("Amazon Home," "Toys & Games," "Grocery"). This field reflects site placement, not product taxonomy.
- `categories` (list, level 2) is the real taxonomy. 8 real subcategories cover ~98% of products:

| Subcategory | Share | Price null rate |
|---|---|---|
| Hair Care | 30.0% | 64.7% |
| Skin Care | 19.2% | 60.0% |
| Foot, Hand & Nail Care | 12.3% | 63.7% |
| Makeup | 11.8% | 64.9% |
| Tools & Accessories | 11.2% | 66.0% |
| Fragrance | 5.2% | 60.4% |
| Shave & Hair Removal | 4.3% | 57.7% |
| Personal Care | 4.0% | 61.1% |

The remainder is promotional/junk tagging ("National Lipstick Day," "Beauty Markdowns," "Gift Sets") and is filtered out.

**Text fields:**

| Field | Finding |
|---|---|
| `title` | Always present |
| `features` (bullets) | 27.7% empty |
| `description` | 45.5% empty, less reliable than `features` |

**Specs (`details` dict), sparse and inconsistent:**

| Key | Coverage |
|---|---|
| Manufacturer | 74.4% |
| Brand | 69.5% |
| UPC | 50.9% |
| Package Dimensions | 46.5% |
| Item Form | 38.8% |
| Product Dimensions | 36.4% |
| Item model number | 33.8% |
| Color | 29.6% |
| Material | 22.7% |
| Age Range (Description) | 19.3% |
| Hair Type | 18.5% |
| Unit Count | 17.1% |
| Scent | 15.5% |
| Number of Items | 15.2% |
| Date First Available | 14.2% |
| Item Weight | 14.0% |
| Skin Type | 13.7% |
| Product Benefits | 10.2% |
| Special Feature | 10.2% |

**Effectively unusable fields:** `videos` (28% populated, not useful), `bought_together` (0% populated).

---

## 8. Tooling & Architecture

Split across three tools, matching how the final result needs to be a real deployed web page:

- **Google Colab**, heavy/iterative compute: data cleaning, EDA, NLP feature engineering, model training. The raw 2.8GB metadata file is processed here (mounted from Google Drive), never pushed to GitHub.
- **GitHub**, holds the code (cleaning scripts, training notebook/scripts, the Streamlit app source) and lightweight output artifacts only: the serialized model (`.pkl`/`.joblib`), precomputed subcategory percentile tables, the comparables (k-NN) index. Colab is cloned/connected to the repo so commits can be pushed directly from Colab sessions.
- **Streamlit Community Cloud** (share.streamlit.io), connects directly to the GitHub repo and auto-redeploys on every push to main. This is what turns the dashboard into an actual live web page, at no hosting cost.

**Constraint to respect:** if using a transformer-based sentiment model (DistilBERT/RoBERTa), run it once offline in Colab and ship the precomputed sentiment score as a column, don't load a transformer model inside the deployed Streamlit app (resource-limited).

---

## 9. Project Phases

**Phase 1: Scope** *(closed)*
Category, target user, research question, hypothesis, and variables defined. GitHub repo structure set up and connected to Colab.

**Phase 2: Data collection & cleaning** *(Colab)*
Load the JSONL file, type `price` (nulls preserved, not coerced), clean the taxonomy (`categories[1]`, drop promotional noise, drop `main_category`), compute population-level percentiles per subcategory, build a stratified working sample (~20-30k, proportional per subcategory).

**Phase 3: Exploratory Data Analysis (EDA)** *(Colab)*
Distributions of price/rating/volume per subcategory, correlations (Pearson/Spearman), hypothesis tests (Mann-Whitney U / t-test) comparing high- vs. low-performing products, text features (TF-IDF/embeddings on `title`+`features`).

**Phase 4: Target ("success") design** *(Colab)*
Define the success proxy as a percentile threshold within subcategory (e.g., `average_rating > subcategory median AND log1p(rating_number) > subcategory p60`), validate against manually-inspected known products, check class balance.

**Phase 5: Modeling** *(Colab)*
Train Random Forest / XGBoost, stratified k-fold cross-validation, evaluate with F1/precision/recall/ROC-AUC/confusion matrix, compute feature importance (Gini/permutation) and SHAP values.

**Phase 6: Dashboard & web deployment** *(GitHub + Streamlit Community Cloud)*
Comparables engine (k-NN/cosine similarity), suggested-price engine (quantile regression on the priced subset), score calibration to 0–100 (Platt/isotonic), build `app.py`, push to GitHub, connect and deploy on Streamlit Community Cloud.

**Phase 7: Validation & limitations** *(folded into the close)*
Sensitivity of the proxy threshold, false positives, stated assumptions, documented limitations (63% null price, no real sales data, proxy target only), failure modes (e.g., a genuinely new subcategory with no comparable history).

---

## 10. Analysis Methods by Phase

| Phase | Method | What it does |
|---|---|---|
| Cleaning | Outlier detection (IQR, z-score); missing value handling | Corrupted prices/ratings are common in this dataset |
| EDA | Descriptive statistics (mean, median, skewness, kurtosis); percentiles by category | Understand the distribution of price/rating/volume |
| EDA | Pearson/Spearman correlation | Relationship between price↔rating, volume↔rating |
| EDA | Hypothesis testing (Mann-Whitney U, t-test, chi-square) | Statistically compare "successful" vs "unsuccessful" groups |
| NLP | Sentiment analysis (VADER or a fine-tuned transformer) on review text | Review sentiment as a predictive feature (stretch/optional) |
| NLP | TF-IDF / embeddings on `title` + `features` + `description` | Convert product text into numeric features |
| Target design | Percentile/median threshold within subcategory | Define "success" defensibly and comparably across subcategories |
| Modeling | Random Forest / XGBoost; stratified k-fold validation | Success/no-success classification with balanced classes |
| Modeling | Metrics: F1, precision/recall, ROC-AUC, confusion matrix | Robust evaluation (accuracy alone misleads under imbalance) |
| Interpretability | Feature importance (Gini/permutation) + SHAP values | The "why" behind the score, not just the score |
| Scoring | Probability calibration (Platt scaling / isotonic) | So a "score of 80" actually means ~80% of similar cases succeed |
| Comparables | k-NN or cosine similarity in feature space | Find "similar products" for the dashboard comparison |
| Suggested price | Quantile regression on price given subcategory/features | A price range (p25–p75), computed only on the priced subset |
| Validation | Sensitivity of the proxy threshold (2-3 alternate definitions) | Check whether conclusions fragilely depend on the success definition |

---

## 11. Timeline

| Day | Date | Phase | Tasks |
|---|---|---|---|
| Today (half day) | Tue, Jul 14 | Close Phase 1 | GitHub repo structure; clone repo into Colab; ingestion script; taxonomy cleanup |
| Day 1 | Wed, Jul 15 | Phase 2 | Population-level percentiles per subcategory; stratified sample; data-quality note |
| Day 2 (half day) | Thu, Jul 16 | Phase 3 (essentials) | Price/rating/volume distributions; key correlations |
| Day 3 | Mon, Jul 20 | Close Phase 3 + Phase 4 | Hypothesis tests; TF-IDF/embeddings; final feature engineering; define and validate the success proxy |
| Day 4 | Tue, Jul 21 | Phase 5 | Train RF/XGBoost; evaluate; feature importance + SHAP |
| Day 5 | Wed, Jul 22 | Phase 6 + Phase 7 | Comparables engine; pricing engine; score calibration; build and finish `app.py`; push to GitHub → deploy on Streamlit Cloud; short validation writeup |

**Note:** Friday, Jul 17 was removed from the schedule (no availability). This compresses the timeline to 5 effective working days. Wednesday, Jul 22 is the tightest day, carrying the full dashboard build, deployment, and validation writeup, worth watching, and worth adding a buffer day or trimming scope (e.g., a simpler rule-based price suggestion instead of quantile regression) if it turns out to be too much for one day.

---

## 12. Known Limitations (to state explicitly in the final deliverable)

- **No real sales data.** "Success" is a proxy built from rating + review volume, not actual revenue or units sold.
- **63% of products have no price recorded.** Price-dependent parts of the framework (price-fit feature, suggested price range) only use the ~37% subset with real price data.
- **`main_category` is unreliable** and was excluded in favor of `categories[1]`.
- **Specs (`details`) are sparse.** Most differentiating fields (Skin Type, Hair Type, Scent) are present in under 20% of products, so they're used as optional/sparse features, not core inputs.
- **The framework would likely fail on a genuinely novel subcategory** with no comparable historical products to learn from.
