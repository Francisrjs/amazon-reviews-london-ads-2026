# Model Testing Report — Product Success Predictor
### Beauty & Personal Care (Amazon Reviews'23) · Data Scientist role (Person 2)

**Purpose.** Independently verify that the trained model reflects a **real, generalizable
signal** — not overfitting, leakage, or a statistical artifact. This report documents the test
suite, the results, and what each test *proves*.

**Date:** 2026-07-17 · **Dataset:** `Master_Beauty_Dataset.csv` (46,435 products, 8 real
subcategories, 0% null price) · **Target base rate:** 26.1% "success".

**How to reproduce**
```bash
cd REPO
python tests/test_metrics.py                 # 1) unit tests for every formula
cd src/ml
python leakage_audit.py                       # 2) data-leakage audit
python model_validation.py                    # 3) model veracity battery
```
Machine-readable results: `output/metrics/model_validation.json`, `output/metrics/leakage_audit.json`.

---

## 1. Unit tests of the formula module — **19 / 19 passed**

Before trusting the model we verify the building blocks (`metrics.py`) against known-good
values. File: [`REPO/tests/test_metrics.py`](REPO/tests/test_metrics.py).

| Area | What is asserted |
|---|---|
| Descriptive stats | mean/median/IQR/std on a known series; skewness sign on a right‑tailed series |
| `log1p` | reduces skew of a lognormal variable |
| Outliers | Tukey flags an obvious outlier and nothing else; MAD is robust |
| Correlation | Pearson=1 on a linear relation; Spearman≈1 on a monotone **non‑linear** one |
| Normality | lognormal flagged **not normal** |
| Effect size | Cohen's d sign is correct |
| Target | `success` requires **both** rating **and** volume conditions; class balance counts |
| `price_fit` | 0 at the category median, +1 at +1 IQR |
| Evaluation | perfect classifier → ROC‑AUC=1, F1=1; ECE≈0 when perfectly calibrated, high when not |
| Dashboard | `success_score` rounds 0–100; Wilson interval bounds; Wilson **wider for small n** |

**Result:** `19 passed, 0 failed`. Two initial failures were **test‑data bugs** (a `numpy.bool`
identity check and a degenerate MAD=0 case), not formula errors; both were fixed.

---

## 2. Data‑leakage audit — **negligible leakage**

We re‑ran 5‑fold cross‑validation with **all cross‑row feature engineering (TF‑IDF and the
`price_fit` per‑subcategory statistics) fit only on the training fold** and applied to the test
fold. The success target stays a fixed population‑percentile definition (a business rule, not a
learned feature). File: [`REPO/src/ml/leakage_audit.py`](REPO/src/ml/leakage_audit.py).

| Metric | Leaky (global fit) | **Leak‑free (in‑fold fit)** | Δ |
|---|---|---|---|
| ROC‑AUC | 0.7151 | **0.7149** | −0.0002 |
| PR‑AUC | 0.4717 | **0.4713** | −0.0004 |
| Brier | 0.1862 | 0.1862 | 0 |
| ECE (isotonic) | 0.0029 | **0.0017** | better |

**Proves:** the reported AUC is **not inflated by leakage**. Removing every feature‑level leak
moves ROC‑AUC by 0.0002.

---

## 3. Model veracity battery

File: [`REPO/src/ml/model_validation.py`](REPO/src/ml/model_validation.py). All features fit on
train only (no leakage inside the tests).

### T1 — Generalization on an unseen holdout (80/20 stratified)

| Metric | Value |
|---|---|
| Test set size | 9,287 products (never seen in training) |
| **ROC‑AUC** | **0.707** |
| PR‑AUC | 0.462 (vs 0.261 base rate → **1.77× lift**) |
| Brier (raw → calibrated) | 0.188 → **0.172** |
| **ECE (raw → calibrated)** | 0.120 → **0.0066** |

**Proves:** performance holds on data the model never saw (0.707 ≈ the CV 0.715). After
**out‑of‑fold isotonic calibration**, a "score of 80" means ~80% real success (ECE 0.007).

> Note: calibration must be fit on out‑of‑fold / held‑out predictions, never on the model's own
> training predictions (those are overconfident). An earlier draft calibrated on training
> predictions and calibration looked *worse* — corrected here.

### T2 — Baseline comparison (same holdout, ROC‑AUC)

| Model | ROC‑AUC | Reading |
|---|---|---|
| Dummy (most frequent) | 0.500 | chance floor |
| Dummy (stratified) | 0.504 | chance floor |
| Logistic — `price_fit` only | 0.554 | one feature already beats chance |
| Logistic — structured only (no text) | 0.567 | numeric + one‑hot, no text |
| **Random Forest — full (num + text)** | **0.707** | **text + non‑linearity add ~0.14 AUC** |

**Proves:** the model is **well above trivial baselines**, and the text (TF‑IDF) + non‑linear
interactions contribute real predictive value beyond price and category alone.

### T3 — Label‑permutation test (negative control)

Shuffle the training labels, retrain, evaluate on the **real** test labels (3 repeats):

| | ROC‑AUC |
|---|---|
| Permuted labels (mean of 3) | **0.496 ± 0.002** |
| Real labels | **0.707** |

**Proves (the strongest test):** when the label is destroyed, the model drops **exactly to
chance (0.50)**. The 0.707 comes from a genuine feature→outcome relationship, not from
memorization or a pipeline artifact. Gap = **+0.21 AUC**.

### T4 — Stability across data splits

ROC‑AUC over 5 different train/test partitions: `[0.707, 0.726, 0.710, 0.715, 0.710]`
→ **mean 0.714, std 0.0066**.

**Proves:** the result is **stable** (std < 0.01), not a lucky split.

### T5 — Per‑subcategory performance (does it work across categories?)

| Subcategory | n (test) | ROC‑AUC |
|---|---|---|
| Shave & Hair Removal | 615 | **0.765** |
| Hair Care | 2,818 | 0.729 |
| Foot, Hand & Nail Care | 1,169 | 0.712 |
| Makeup | 1,058 | 0.712 |
| Skin Care | 1,811 | 0.703 |
| Tools & Accessories | 902 | 0.700 |
| Fragrance | 451 | 0.670 |
| Personal Care | 463 | 0.627 |

**Proves:** the model works **across all 8 subcategories** (every one beats chance), satisfying
the "works across 2–3+ categories" criterion. It is **weakest on the two smallest**
subcategories (Personal Care 0.63, Fragrance 0.67) — expected, fewer examples to learn from,
and a limitation to state in the dashboard.

---

## 4. Verdict

| Test | Question | Result |
|---|---|---|
| Unit tests | Are the formulas correct? | ✅ 19/19 |
| Leakage audit | Is the AUC inflated by leakage? | ✅ No (Δ −0.0002) |
| T1 Holdout | Does it generalize to unseen data? | ✅ AUC 0.707, ECE 0.007 |
| T2 Baselines | Does it beat trivial models? | ✅ +0.14 over logistic |
| T3 Permutation | Is the signal real, not an artifact? | ✅ real 0.707 vs permuted 0.50 |
| T4 Stability | Is it robust to the split? | ✅ 0.714 ± 0.007 |
| T5 Per‑category | Does it work across categories? | ✅ all 8 beat chance |

**Conclusion.** The model is **verified as truthful**: it encodes a **real but modest** signal
(ROC‑AUC ≈ 0.71, ~1.8× lift over base rate), it **generalizes** to unseen products, it is
**well‑calibrated** after out‑of‑fold isotonic calibration (ECE 0.007), it is **not driven by
leakage or artifacts** (permutation AUC = 0.50), and it is **stable and consistent across
subcategories**.

This is the intended, publishable outcome per the project hypothesis: product attributes carry
**genuine but limited** predictive power over market success — so the dashboard must present
scores as **calibrated probabilities with uncertainty (ranges)**, never as certainties. The two
smallest subcategories (Fragrance, Personal Care) are the weakest and should be flagged.
