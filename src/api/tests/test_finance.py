from app.schemas.analysis import AnalysisRequest
from app.services.finance import calculate_profit


def test_complete_profit_uses_all_costs() -> None:
    request = AnalysisRequest(
        subcategory="Skin Care",
        title="Vitamin C Serum",
        description="A lightweight brightening serum",
        selling_price=30,
        unit_cost=8,
        fulfilment_cost=4,
        marketplace_fee_pct=15,
        advertising_cost_per_unit=3,
        return_allowance=1,
        expected_units_monthly=100,
    )

    result = calculate_profit(request)

    assert result.marketplace_fee == 4.5
    assert result.per_sale == 9.5
    assert result.expected_monthly == 950
    assert result.is_complete is True
    assert result.missing_costs == []


def test_incomplete_profit_is_explicit_estimate() -> None:
    request = AnalysisRequest(
        subcategory="Skin Care",
        title="Vitamin C Serum",
        description="A lightweight brightening serum",
        price=30,
    )

    result = calculate_profit(request)

    assert result.per_sale == 30
    assert result.is_complete is False
    assert set(result.missing_costs) == {
        "unit_cost",
        "fulfilment_cost",
        "marketplace_fee_pct",
        "advertising_cost_per_unit",
        "return_allowance",
    }
