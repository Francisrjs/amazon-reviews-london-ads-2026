from __future__ import annotations

from typing import Literal
from uuid import UUID, uuid4
from pydantic import BaseModel, ConfigDict, Field


class StoreProduct(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="allow")
    id: int | str
    persisted_id: int | None = Field(None, alias="persistedId")
    key: str = Field(min_length=1, max_length=80)
    category: str | None = Field(None, max_length=120)
    name: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=2000)
    price: float = Field(ge=0)
    success_score: float = Field(alias="successScore", ge=0, le=100)
    monthly_profit: float = Field(alias="monthlyProfit")
    startup_cost: float = Field(alias="startupCost", ge=0)
    image: str | None = None
    trend: float = 0
    currency: str = Field("USD", pattern=r"^[A-Z]{3}$")
    source_type: Literal["model", "formula", "external_data", "simulation"] = Field("simulation", alias="sourceType")


class DemoStore(BaseModel):
    brand: str = Field(min_length=1, max_length=120)
    description: str = Field(default="", max_length=1000)
    currency: str = Field("USD", pattern=r"^[A-Z]{3}$")
    products: list[StoreProduct] = Field(default_factory=list, max_length=100)


class StoreImportRequest(BaseModel):
    request_id: UUID = Field(default_factory=uuid4)
    store: DemoStore | None = None
    shortlist: list[StoreProduct] = Field(default_factory=list, max_length=100)


class StoreState(BaseModel):
    store: DemoStore | None = None
    shortlist: list[StoreProduct] = Field(default_factory=list)


class ProductMutation(BaseModel):
    request_id: UUID = Field(default_factory=uuid4)
    product: StoreProduct
