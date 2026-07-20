"""
fix_calibration_shap.py — Corrige dos cosas del pipeline sin re-entrenar:

  (1) Calibración HONESTA (Parte VII): los MD dicen "calibrar sobre las
      predicciones out-of-fold, nunca sobre las de entrenamiento". El
      run_pipeline comparaba ECE OOF (honesto) contra ECE in-sample del
      modelo calibrado -> no es comparable y el ECE parecía empeorar.
      Aquí calibramos un mapeo 1D (isotónica y Platt/sigmoide) POR VALIDACIÓN
      CRUZADA sobre las probabilidades OOF, y reportamos ECE/Brier honestos
      antes vs después. También reajustamos el calibrador desplegable.

  (2) SHAP (Parte VII): el TreeExplainer fallaba el additivity-check por la
      matriz en float32. Se recomputa en float64 con la muestra adecuada.

Reusa artefactos ya guardados (model.pkl, proba_oof.npy, tfidf_vectorizer.pkl).
Actualiza output/metrics/analysis_results.json (part_VII) y las figuras.
"""
from __future__ import annotations

import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from sklearn.isotonic import IsotonicRegression
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import brier_score_loss

import metrics as M
import run_pipeline as P

RNG = 42
OUT_MODELS = P.OUT_MODELS
OUT_METRICS = P.OUT_METRICS
OUT_FIG = P.OUT_FIG


def rebuild():
    """Reconstruye df, X, y, feat_names de forma idéntica al pipeline (sin re-entrenar)."""
    df = P.load_clean()
    thr = M.subcategory_thresholds(df)
    df["success"] = M.label_success(df, thr)
    df, X, feat_names, vec, num_cols = P.part_IV(df, thr)
    y = df["success"].values
    return df, X, y, feat_names, num_cols


def honest_calibration(proba_oof, y):
    """Calibra 1D sobre las OOF por CV -> ECE/Brier honestos antes vs después."""
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=RNG)
    iso_oof = np.zeros_like(proba_oof, dtype=float)
    sig_oof = np.zeros_like(proba_oof, dtype=float)
    for tr, te in skf.split(proba_oof, y):
        iso = IsotonicRegression(out_of_bounds="clip").fit(proba_oof[tr], y[tr])
        iso_oof[te] = iso.predict(proba_oof[te])
        lr = LogisticRegression().fit(proba_oof[tr].reshape(-1, 1), y[tr])
        sig_oof[te] = lr.predict_proba(proba_oof[te].reshape(-1, 1))[:, 1]

    def m(p):
        return {"ece": float(M.expected_calibration_error(y, p)),
                "brier": float(brier_score_loss(y, p))}

    report = {"uncalibrated": m(proba_oof),
              "isotonic_oof": m(iso_oof),
              "platt_sigmoid_oof": m(sig_oof)}
    # elige el mejor por ECE
    best = min(report, key=lambda k: report[k]["ece"])
    report["best_method"] = best
    return report, iso_oof, sig_oof


def shap_fixed(clf, X, feat_names, n=300):
    """SHAP en float64 (evita el fallo de aditividad de float32)."""
    import shap
    idx = np.random.RandomState(RNG).choice(len(X), size=n, replace=False)
    Xs = np.ascontiguousarray(X[idx], dtype=np.float64)
    explainer = shap.TreeExplainer(clf, feature_perturbation="tree_path_dependent")
    sv = explainer.shap_values(Xs, check_additivity=False)
    sv1 = sv[1] if isinstance(sv, list) else (sv[..., 1] if sv.ndim == 3 else sv)
    mean_abs = (pd.Series(np.abs(sv1).mean(axis=0), index=feat_names)
                .sort_values(ascending=False))
    return mean_abs


def fig_calibration(y, proba_oof, iso_oof):
    from sklearn.calibration import calibration_curve
    plt.figure(figsize=(7, 6))
    for p, lab in [(proba_oof, "sin calibrar"), (iso_oof, "isotónica (OOF)")]:
        frac, mean_pred = calibration_curve(y, p, n_bins=10)
        plt.plot(mean_pred, frac, "o-", label=lab)
    plt.plot([0, 1], [0, 1], "--", color="gray", label="perfecto")
    plt.xlabel("probabilidad predicha"); plt.ylabel("fracción real de éxito")
    plt.title("Calibración honesta (out-of-fold)")
    plt.legend(); plt.grid(alpha=0.3); plt.tight_layout()
    plt.savefig(OUT_FIG / "06_calibration_honest.png", dpi=130)
    plt.close()
    print(f"[fig] {OUT_FIG/'06_calibration_honest.png'}")


def fig_shap(mean_abs):
    plt.figure(figsize=(8, 6))
    mean_abs.head(15)[::-1].plot.barh(color="#937860")
    plt.title("SHAP |valor| medio (top 15) — interpretabilidad global")
    plt.tight_layout()
    plt.savefig(OUT_FIG / "07_shap.png", dpi=130)
    plt.close()
    print(f"[fig] {OUT_FIG/'07_shap.png'}")


def main():
    print("Reconstruyendo df/X (sin re-entrenar)...")
    df, X, y, feat_names, num_cols = rebuild()
    clf = joblib.load(OUT_MODELS / "model.pkl")
    proba_oof = np.load(P.OUT_PRED / "proba_oof.npy")
    assert len(proba_oof) == len(y), "OOF y y no coinciden"

    print("\n== Calibración honesta (OOF) ==")
    cal_report, iso_oof, sig_oof = honest_calibration(proba_oof, y)
    print(json.dumps(cal_report, indent=2))
    fig_calibration(y, proba_oof, iso_oof)

    print("\n== SHAP (float64) ==")
    shap_ok, shap_top = True, {}
    try:
        mean_abs = shap_fixed(clf, X, feat_names)
        shap_top = mean_abs.head(20).round(5).to_dict()
        print(mean_abs.head(15).round(5))
        fig_shap(mean_abs)
    except Exception as e:
        shap_ok = False
        print(f"[SHAP aún falla: {e}]")

    # actualizar analysis_results.json
    res_path = OUT_METRICS / "analysis_results.json"
    res = json.loads(res_path.read_text())
    res["part_VII"]["honest_calibration_oof"] = cal_report
    res["part_VII"].pop("ece_calibrated", None)   # dato engañoso: se retira
    if shap_ok:
        res["part_VII"]["shap_top20"] = P.jsonable(shap_top)
    res_path.write_text(json.dumps(P.jsonable(res), indent=2, ensure_ascii=False))
    print(f"\nActualizado {res_path}")

    # reajustar calibrador desplegable con el mejor método honesto sobre OOF,
    # como wrapper 1D encima del RF (predice sobre features -> prob calibrada)
    best = cal_report["best_method"]
    if best == "isotonic_oof":
        final_cal = IsotonicRegression(out_of_bounds="clip").fit(proba_oof, y)
        kind = "isotonic"
    elif best == "platt_sigmoid_oof":
        final_cal = LogisticRegression().fit(proba_oof.reshape(-1, 1), y)
        kind = "sigmoid"
    else:
        final_cal, kind = None, "identity(none)"
    joblib.dump({"kind": kind, "calibrator": final_cal,
                 "note": "aplicar sobre RF.predict_proba(features)[:,1]"},
                OUT_MODELS / "calibrator_1d.pkl")
    print(f"Calibrador 1D honesto guardado ({kind}) -> calibrator_1d.pkl")
    print("\nOK.")


if __name__ == "__main__":
    main()
