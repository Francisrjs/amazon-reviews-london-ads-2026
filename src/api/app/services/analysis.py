from __future__ import annotations

from typing import Any
from fastapi.concurrency import run_in_threadpool

import inference
from app.repositories.launchly import LaunchlyRepository
from app.schemas.analysis import AnalysisRequest
from app.services.finance import calculate_profit


class AnalysisService:
    def __init__(self, repository: LaunchlyRepository) -> None:
        self.repository = repository

    async def run(self, request: AnalysisRequest) -> dict[str, Any]:
        result = await run_in_threadpool(
            inference.analyze, request.subcategory, request.title, request.description,
            request.selling_price, request.risk_preference, request.inference_flags(),
        )
        result["profit"] = calculate_profit(request).model_dump()
        result["source"] = "model"
        for point in result.get("price_curve", []):
            point["profit_per_sale"] = calculate_profit(request, price=float(point["price"])).per_sale
        input_payload = request.model_dump(mode="json", exclude={"request_id"})
        analysis_id = await self.repository.persist_analysis(request.request_id, input_payload, result)
        return {**result, "analysis_id": analysis_id, "request_id": str(request.request_id), "status": "completed"}
