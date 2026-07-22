from __future__ import annotations

from typing import Annotated, Any, Literal
from uuid import UUID, uuid4
from pydantic import AliasChoices, BaseModel, ConfigDict, Field, field_validator


Money = Annotated[float, Field(ge=0, le=10_000_000)]


class DetailFlags(BaseModel):
    has_brand: int = Field(0, ge=0, le=1)
    has_item_form: int = Field(0, ge=0, le=1)
    has_color: int = Field(0, ge=0, le=1)
    has_scent: int = Field(0, ge=0, le=1)
    has_skin_type: int = Field(0, ge=0, le=1)
    has_hair_type: int = Field(0, ge=0, le=1)


class AnalysisRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="forbid")
    request_id: UUID = Field(default_factory=uuid4)
    subcategory: str = Field(min_length=1, max_length=80)
    title: str = Field(min_length=2, max_length=120)
    description: str = Field(min_length=10, max_length=2000)
    market: str = Field("US", pattern=r"^[A-Z]{2}$")
    currency: str = Field("USD", pattern=r"^[A-Z]{3}$")
    selling_price: float = Field(validation_alias=AliasChoices("selling_price", "price"), gt=0, le=10_000_000)
    unit_cost: Money | None = None
    fulfilment_cost: Money | None = None
    marketplace_fee_pct: float | None = Field(None, ge=0, le=100)
    advertising_cost_per_unit: Money | None = None
    return_allowance: Money | None = None
    expected_units_monthly: int | None = Field(None, ge=0, le=100_000_000)
    risk_preference: Literal["cautious", "balanced", "bold"] = "balanced"
    detail_flags: DetailFlags | None = None

    @field_validator("title", "description")
    @classmethod
    def trim_text(cls, value: str) -> str:
        return value.strip()

    def inference_flags(self) -> dict[str, int] | None:
        return self.detail_flags.model_dump() if self.detail_flags else None


class FinanceResult(BaseModel):
    marketplace_fee: float
    per_sale: float
    expected_monthly: float | None
    is_complete: bool
    missing_costs: list[str]
    source_type: Literal["formula"] = "formula"


class AnalysisHistoryItem(BaseModel):
    analysis_id: int
    request_id: UUID
    status: str
    source: str
    model_version: str
    dataset_version: str
    created_at: str
    result: dict[str, Any]


class AnalysisHistoryPage(BaseModel):
    items: list[AnalysisHistoryItem]
    next_cursor: str | None = None
