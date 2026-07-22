from uuid import uuid4
from fastapi import APIRouter, Depends, Response, status

from app.api import get_repository
from app.repositories.launchly import LaunchlyRepository
from app.schemas.store import DemoStore, ProductMutation, StoreImportRequest, StoreState


router = APIRouter(prefix="/v1", tags=["store"])


@router.get("/store", response_model=StoreState)
async def get_store(repository: LaunchlyRepository = Depends(get_repository)) -> StoreState:
    return await repository.get_store_state()


@router.put("/store", response_model=StoreState)
async def put_store(store: DemoStore, repository: LaunchlyRepository = Depends(get_repository)) -> StoreState:
    current = await repository.get_store_state()
    await repository.import_store(StoreImportRequest(request_id=uuid4(), store=store, shortlist=current.shortlist))
    return await repository.get_store_state()


@router.delete("/store", status_code=status.HTTP_204_NO_CONTENT)
async def delete_store(repository: LaunchlyRepository = Depends(get_repository)) -> Response:
    await repository.delete_store()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/store/import", response_model=StoreState)
async def import_store(payload: StoreImportRequest, repository: LaunchlyRepository = Depends(get_repository)) -> StoreState:
    await repository.import_store(payload)
    return await repository.get_store_state()


@router.get("/store/products", response_model=list)
async def get_store_products(repository: LaunchlyRepository = Depends(get_repository)) -> list:
    state = await repository.get_store_state()
    return state.store.products if state.store else []


@router.post("/store/products", response_model=StoreState)
async def add_store_product(mutation: ProductMutation, repository: LaunchlyRepository = Depends(get_repository)) -> StoreState:
    state = await repository.get_store_state()
    store = state.store or DemoStore(brand="My Launchly Store", products=[])
    store.products = [item for item in store.products if str(item.id) != str(mutation.product.id)] + [mutation.product]
    await repository.import_store(StoreImportRequest(request_id=mutation.request_id, store=store, shortlist=state.shortlist))
    return await repository.get_store_state()


@router.delete("/store/products/{product_id}", response_model=StoreState)
async def remove_store_product(product_id: str, repository: LaunchlyRepository = Depends(get_repository)) -> StoreState:
    state = await repository.get_store_state()
    if not state.store:
        return state
    state.store.products = [
        item for item in state.store.products
        if str(item.persisted_id) != product_id and str(item.id) != product_id
    ]
    await repository.import_store(StoreImportRequest(request_id=uuid4(), store=state.store, shortlist=state.shortlist))
    return await repository.get_store_state()


@router.get("/shortlist", response_model=list)
async def get_shortlist(repository: LaunchlyRepository = Depends(get_repository)) -> list:
    return (await repository.get_store_state()).shortlist


@router.post("/shortlist", response_model=StoreState)
async def add_shortlist_product(mutation: ProductMutation, repository: LaunchlyRepository = Depends(get_repository)) -> StoreState:
    state = await repository.get_store_state()
    shortlist = [item for item in state.shortlist if str(item.id) != str(mutation.product.id)] + [mutation.product]
    await repository.import_store(StoreImportRequest(request_id=mutation.request_id, store=state.store, shortlist=shortlist))
    return await repository.get_store_state()


@router.delete("/shortlist/{product_id}", response_model=StoreState)
async def remove_shortlist_product(product_id: str, repository: LaunchlyRepository = Depends(get_repository)) -> StoreState:
    state = await repository.get_store_state()
    shortlist = [
        item for item in state.shortlist
        if str(item.persisted_id) != product_id and str(item.id) != product_id
    ]
    await repository.import_store(StoreImportRequest(request_id=uuid4(), store=state.store, shortlist=shortlist))
    return await repository.get_store_state()
