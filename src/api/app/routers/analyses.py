from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.concurrency import run_in_threadpool

import inference
from app.api import get_repository
from app.core.auth import AuthenticatedUser, get_current_user
from app.repositories.launchly import LaunchlyRepository
from app.schemas.analysis import AnalysisHistoryPage, AnalysisRequest
from app.services.analysis import AnalysisService


router = APIRouter(prefix="/v1", tags=["analyses"])


def _history_item(row: dict[str, object]) -> dict[str, object]:
    return {
        "analysis_id": row["id"], "request_id": row["request_id"], "status": row["status"],
        "source": row["source_type"], "model_version": row["model_version"],
        "dataset_version": row["dataset_version"], "created_at": row["created_at"], "result": row["raw_result"],
    }


def _guard_subcategory(value: str) -> None:
    if value not in inference.REAL_SUBCATS:
        raise HTTPException(status_code=422, detail=f"subcategory must be one of: {inference.REAL_SUBCATS}")


@router.post("/predict/success")
async def predict_success(request: AnalysisRequest, _user: AuthenticatedUser = Depends(get_current_user)) -> dict[str, object]:
    _guard_subcategory(request.subcategory)
    artifacts = inference.get_artifacts()
    text = f"{request.title} {request.description}".strip()
    vector = artifacts.build_vector(request.subcategory, text, request.selling_price, request.inference_flags())
    calibrated, raw = await run_in_threadpool(artifacts.calibrated_proba, vector)
    uncertainty = await run_in_threadpool(artifacts.uncertainty, vector)
    return {
        "score": int(round(100 * calibrated)), "probability": round(calibrated, 4),
        "raw_probability": round(raw, 4), "uncertainty": round(uncertainty, 4),
        "confidence": "high" if uncertainty < 0.20 else "medium" if uncertainty < 0.30 else "low",
        "model_version": inference.MODEL_VERSION, "source_type": "model",
    }


@router.post("/comparables")
async def comparables(request: AnalysisRequest, _user: AuthenticatedUser = Depends(get_current_user)) -> dict[str, object]:
    _guard_subcategory(request.subcategory)
    artifacts = inference.get_artifacts()
    text = f"{request.title} {request.description}".strip()
    vector = artifacts.build_vector(request.subcategory, text, request.selling_price, request.inference_flags())
    products = await run_in_threadpool(artifacts.comparables, vector, 5)
    saturation = await run_in_threadpool(artifacts.saturation, vector)
    successes = sum(item["success"] for item in products)
    return {
        "comparables": products, "saturation": round(saturation, 1),
        "comparables_success": {"successes": successes, "n": len(products), "wilson_ci_95": inference.wilson_interval(successes, len(products))},
        "source_type": "model",
    }


@router.post("/price-scenarios")
async def price_scenarios(request: AnalysisRequest, _user: AuthenticatedUser = Depends(get_current_user)) -> dict[str, object]:
    _guard_subcategory(request.subcategory)
    artifacts = inference.get_artifacts()
    text = f"{request.title} {request.description}".strip()
    curve = await run_in_threadpool(artifacts.price_curve, request.subcategory, text, request.inference_flags())
    best = max(curve, key=lambda point: point["score"])
    return {
        "price_curve": curve, "recommended_price": best["price"],
        "recommended_score": best["score"], "current_price": request.selling_price,
        "source_type": "model",
    }


@router.post("/analyses")
async def create_analysis(request: AnalysisRequest, repository: LaunchlyRepository = Depends(get_repository)) -> dict[str, object]:
    _guard_subcategory(request.subcategory)
    try:
        return await AnalysisService(repository).run(request)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/analyses", response_model=AnalysisHistoryPage)
async def list_analyses(
    limit: int = Query(20, ge=1, le=100), cursor: str | None = Query(None),
    repository: LaunchlyRepository = Depends(get_repository),
) -> AnalysisHistoryPage:
    try:
        rows, next_cursor = await repository.list_analyses(limit=limit, cursor=cursor)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return AnalysisHistoryPage(items=[_history_item(row) for row in rows], next_cursor=next_cursor)


@router.get("/analyses/{analysis_id}")
async def get_analysis(analysis_id: int, repository: LaunchlyRepository = Depends(get_repository)) -> dict[str, object]:
    row = await repository.get_analysis(analysis_id)
    if not row:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    return _history_item(row)
