import sys
from types import ModuleType
from uuid import uuid4

from fastapi.testclient import TestClient


fake_inference = ModuleType("inference")
fake_inference.MODEL_VERSION = "success-rf-0.1.0"
fake_inference.DATASET_VERSION = "beauty-master-2026-07"
fake_inference.REAL_SUBCATS = ["Skin Care"]


def fake_analyze(*_args, **_kwargs):
    return {
        "success": {"score": 79, "probability": 0.79, "uncertainty": 0.18, "confidence": "high", "source_type": "model"},
        "risk": {"index": 31, "components": {"downside": 21, "saturation": 47, "uncertainty": 18}, "source_type": "model"},
        "saturation": {"value": 47, "source_type": "model"},
        "recommended_price": 30,
        "price_range": [27, 34],
        "price_curve": [{"price": 30, "score": 79}],
        "comparables": [],
        "model_version": fake_inference.MODEL_VERSION,
        "dataset_version": fake_inference.DATASET_VERSION,
        "limitations": ["Historical proxy, not a sales guarantee."],
    }


fake_inference.analyze = fake_analyze
sys.modules.setdefault("inference", fake_inference)

from app.api import get_repository  # noqa: E402
from app.main import app  # noqa: E402


class FakeRepository:
    async def persist_analysis(self, _request_id, _request, _result):
        return 42


def test_analysis_requires_authentication() -> None:
    response = TestClient(app).post("/v1/analyses", json={})
    assert response.status_code == 401


def test_analysis_returns_persisted_profit_result() -> None:
    app.dependency_overrides[get_repository] = lambda: FakeRepository()
    try:
        response = TestClient(app).post("/v1/analyses", json={
            "request_id": str(uuid4()),
            "subcategory": "Skin Care",
            "title": "Vitamin C Serum",
            "description": "A lightweight brightening serum",
            "price": 30,
            "unit_cost": 8,
            "fulfilment_cost": 4,
            "marketplace_fee_pct": 15,
            "advertising_cost_per_unit": 3,
            "return_allowance": 1,
            "expected_units_monthly": 100,
        })
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    payload = response.json()
    assert payload["analysis_id"] == 42
    assert payload["profit"]["per_sale"] == 9.5
    assert payload["profit"]["expected_monthly"] == 950
    assert payload["profit"]["is_complete"] is True
