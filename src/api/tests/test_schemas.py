import pytest
from pydantic import ValidationError

from app.schemas.analysis import AnalysisRequest
from app.schemas.store import StoreProduct


def test_legacy_price_alias_is_accepted() -> None:
    request = AnalysisRequest(
        subcategory="Hair Care",
        title="Rosemary Hair Oil",
        description="A hydrating pre-wash rosemary treatment",
        price=28,
    )
    assert request.selling_price == 28


def test_store_product_preserves_frontend_object_names() -> None:
    product = StoreProduct.model_validate({
        "id": 1,
        "key": "skin",
        "category": "Skin Care",
        "name": "Vitamin C Serum",
        "description": "Brightening serum",
        "price": 32,
        "successScore": 82,
        "monthlyProfit": 2180,
        "startupCost": 326,
        "image": "https://example.com/product.jpg",
        "trend": 31,
    })
    payload = product.model_dump(by_alias=True)
    assert payload["successScore"] == 82
    assert payload["monthlyProfit"] == 2180
    assert payload["sourceType"] == "simulation"


def test_negative_cost_is_rejected() -> None:
    with pytest.raises(ValidationError):
        AnalysisRequest(
            subcategory="Makeup",
            title="Liquid Lipstick",
            description="A long-lasting clean beauty lipstick",
            price=22,
            unit_cost=-1,
        )
