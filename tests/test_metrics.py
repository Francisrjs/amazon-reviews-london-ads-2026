"""
test_metrics.py — Unit tests for the formula module (metrics.py).

Verifies each statistical/ML formula against known-good values, so we trust the
building blocks before trusting the model. Run with:

    cd REPO && python -m pytest tests/test_metrics.py -v
    (or:    python tests/test_metrics.py   for a no-pytest fallback)
"""
import sys
from pathlib import Path

import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src" / "ml"))
import metrics as M


# ---------- Parte I: descriptiva y outliers ----------

def test_descriptive_stats_known_values():
    x = pd.Series([1, 2, 3, 4, 5])
    d = M.descriptive_stats(x)
    assert d["n"] == 5
    assert d["mean"] == 3.0
    assert d["median"] == 3.0
    assert abs(d["std"] - np.std([1, 2, 3, 4, 5], ddof=1)) < 1e-9
    assert d["IQR"] == 2.0            # Q3=4, Q1=2


def test_skewness_sign():
    right = pd.Series([1, 1, 1, 2, 3, 10, 50])   # cola derecha
    assert M.descriptive_stats(right)["skewness"] > 0


def test_log1p_reduces_skew():
    x = pd.Series(np.random.default_rng(0).lognormal(3, 1.5, 5000))
    from scipy.stats import skew
    assert skew(np.log1p(x)) < skew(x)


def test_tukey_detects_obvious_outlier():
    x = pd.Series([10, 11, 12, 13, 14, 1000])
    mask = M.tukey_outliers(x)
    assert bool(mask.iloc[-1]) is True
    assert mask.iloc[:-1].sum() == 0


def test_modified_zscore_robust():
    # MAD debe ser > 0 (si toda la mayoría es idéntica, MAD=0 y no hay escala robusta)
    x = pd.Series([5, 6, 5, 6, 5, 6, 500])
    assert int(M.modified_zscore_outliers(x).sum()) >= 1


# ---------- Parte II: relaciones ----------

def test_correlation_perfect_positive():
    x = pd.Series(np.arange(100.0))
    y = 2 * x + 1
    r = M.correlations(x, y)
    assert abs(r["pearson_r"] - 1.0) < 1e-9
    assert abs(r["spearman_rho"] - 1.0) < 1e-9


def test_spearman_captures_monotone_nonlinear():
    x = pd.Series(np.arange(1, 100.0))
    y = x ** 3                       # monótona no lineal
    r = M.correlations(x, y)
    assert r["spearman_rho"] > 0.999      # Spearman ~1
    assert r["pearson_r"] < r["spearman_rho"]


def test_normality_flags_nonnormal():
    x = pd.Series(np.random.default_rng(1).lognormal(0, 1, 3000))
    assert not M.normality_test(x)["is_normal"]     # numpy bool -> evitar 'is False'


def test_cohens_d_direction():
    a = np.array([10, 11, 12, 13, 14.0])
    b = np.array([1, 2, 3, 4, 5.0])
    assert M.cohens_d(a, b) > 0


# ---------- Parte III: target ----------

def test_label_success_requires_both_conditions():
    df = pd.DataFrame({
        "subcategory": ["A"] * 6,
        "average_rating": [5, 5, 1, 1, 5, 1],
        "rating_number": [1000, 1, 1000, 1, 1000, 1],
    })
    thr = M.subcategory_thresholds(
        df.assign(price=1.0))
    y = M.label_success(df, thr)
    # solo filas con rating alto Y volumen alto pueden ser éxito
    assert set(np.unique(y)).issubset({0, 1})
    # una fila con rating alto pero volumen 1 no debe ser éxito
    assert y.iloc[4] in (0, 1)


def test_class_balance_counts():
    y = pd.Series([1, 1, 0, 0, 0, 0])
    b = M.class_balance(y)
    assert abs(b["positive_rate"] - 2 / 6) < 1e-9
    assert b["counts"][0] == 4 and b["counts"][1] == 2


# ---------- Parte IV: features ----------

def test_price_fit_zero_at_median():
    assert M.price_fit(15.0, median_c=15.0, iqr_c=10.0) == 0.0
    assert M.price_fit(25.0, median_c=15.0, iqr_c=10.0) == 1.0     # +1 IQR


# ---------- Parte VI: métricas de evaluación ----------

def test_perfect_classifier_metrics():
    y = np.array([0, 0, 1, 1])
    proba = np.array([0.01, 0.02, 0.99, 0.98])
    rep = M.classification_report_full(y, proba)
    assert rep["roc_auc"] == 1.0
    assert rep["f1"] == 1.0
    assert rep["confusion"]["FP"] == 0 and rep["confusion"]["FN"] == 0


def test_ece_perfectly_calibrated_is_low():
    rng = np.random.default_rng(3)
    proba = rng.uniform(0, 1, 20000)
    y = (rng.uniform(0, 1, 20000) < proba).astype(int)   # P(y=1)=proba exacto
    assert M.expected_calibration_error(y, proba) < 0.02


def test_ece_miscalibrated_is_high():
    y = np.array([0] * 100)              # nunca ocurre
    proba = np.array([0.9] * 100)        # pero el modelo dice 90%
    assert M.expected_calibration_error(y, proba) > 0.8


# ---------- Parte VIII: dashboard ----------

def test_success_score_rounds_to_0_100():
    assert M.success_score(0.815) == 82
    assert M.success_score(0.0) == 0
    assert M.success_score(1.0) == 100


def test_wilson_interval_bounds():
    lo, hi = M.wilson_interval(3, 4)
    assert 0.0 <= lo < 0.75 < hi <= 1.0
    assert M.wilson_interval(0, 0) == (0.0, 0.0)


def test_wilson_wider_for_small_n():
    lo1, hi1 = M.wilson_interval(8, 10)
    lo2, hi2 = M.wilson_interval(80, 100)      # misma proporción, más datos
    assert (hi1 - lo1) > (hi2 - lo2)           # menos datos => intervalo más ancho


def test_risk_index_range():
    r = M.risk_index(0.5, 0.5, 0.5)
    assert 0 <= r <= 100


if __name__ == "__main__":
    # Fallback sin pytest: corre cada test y reporta.
    import traceback
    fns = [v for k, v in sorted(globals().items()) if k.startswith("test_") and callable(v)]
    passed = failed = 0
    for fn in fns:
        try:
            fn()
            passed += 1
            print(f"PASS  {fn.__name__}")
        except Exception:
            failed += 1
            print(f"FAIL  {fn.__name__}")
            traceback.print_exc()
    print(f"\n{passed} passed, {failed} failed of {len(fns)}")
    sys.exit(1 if failed else 0)
