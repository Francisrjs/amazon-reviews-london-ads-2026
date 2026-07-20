from decimal import Decimal, ROUND_HALF_UP
from app.schemas.analysis import AnalysisRequest, FinanceResult


_COST_FIELDS = ("unit_cost", "fulfilment_cost", "marketplace_fee_pct", "advertising_cost_per_unit", "return_allowance")


def _money(value: Decimal) -> float:
    return float(value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


def calculate_profit(request: AnalysisRequest, *, price: float | None = None) -> FinanceResult:
    selling_price = Decimal(str(price if price is not None else request.selling_price))
    missing = [name for name in _COST_FIELDS if getattr(request, name) is None]
    marketplace_fee = selling_price * Decimal(str(request.marketplace_fee_pct or 0)) / Decimal("100")
    costs = sum(
        (Decimal(str(getattr(request, field) or 0)) for field in ("unit_cost", "fulfilment_cost", "advertising_cost_per_unit", "return_allowance")),
        Decimal("0"),
    )
    per_sale = selling_price - marketplace_fee - costs
    expected = per_sale * Decimal(request.expected_units_monthly) if request.expected_units_monthly is not None else None
    return FinanceResult(
        marketplace_fee=_money(marketplace_fee),
        per_sale=_money(per_sale),
        expected_monthly=_money(expected) if expected is not None else None,
        is_complete=not missing,
        missing_costs=missing,
    )
