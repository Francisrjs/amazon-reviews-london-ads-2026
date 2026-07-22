from __future__ import annotations

import json
from fastapi import APIRouter
import inference


router = APIRouter(tags=["system"])


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "model_version": inference.MODEL_VERSION}


@router.get("/v1/models/current")
def models_current() -> dict[str, object]:
    artifacts = inference.get_artifacts()
    metrics = artifacts.metrics.get("part_V_VI", {})
    validation: dict[str, object] = {}
    try:
        path = inference.METRICS / "model_validation.json"
        if path.exists():
            validation = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        validation = {}
    return {
        "model_version": inference.MODEL_VERSION,
        "dataset_version": inference.DATASET_VERSION,
        "algorithm": "RandomForest (300) + isotonic calibration",
        "features": len(artifacts.feature_names),
        "subcategories": inference.REAL_SUBCATS,
        "cv_metrics": metrics.get("report_oof", {}),
        "calibration": artifacts.metrics.get("part_VII", {}).get("honest_calibration_oof", {}),
        "validation": {key: validation.get(key) for key in ("T1_holdout", "T3_label_permutation", "T4_stability") if key in validation},
    }
