import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.modules.inventory import schemas, service

router = APIRouter(prefix="/api/inventory", tags=["inventory"])


# ─── Products ───
@router.get("/products", response_model=list[schemas.ProductRead])
async def list_products(db: AsyncSession = Depends(get_db)):
    return await service.list_products(db)


@router.post(
    "/products",
    response_model=schemas.ProductRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_product(
    payload: schemas.ProductCreate, db: AsyncSession = Depends(get_db)
):
    return await service.create_product(db, payload)


# ─── Batches ───
@router.get("/batches", response_model=list[schemas.BatchRead])
async def list_batches(db: AsyncSession = Depends(get_db)):
    return await service.list_batches(db)


@router.post(
    "/batches",
    response_model=schemas.BatchRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_batch(
    payload: schemas.BatchCreate, db: AsyncSession = Depends(get_db)
):
    return await service.create_batch(db, payload)


@router.get("/batches/expiring-soon", response_model=list[schemas.BatchRead])
async def expiring_soon(
    days: int = Query(7, ge=1, le=60), db: AsyncSession = Depends(get_db)
):
    return await service.list_expiring_soon(db, days)


@router.patch("/batches/{batch_id}/consume", response_model=schemas.BatchRead)
async def consume_batch(
    batch_id: uuid.UUID,
    payload: schemas.BatchConsume,
    db: AsyncSession = Depends(get_db),
):
    try:
        batch = await service.consume_batch(db, batch_id, payload.quantity)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if batch is None:
        raise HTTPException(status_code=404, detail="Lote no encontrado")
    return batch


# ─── Summary ───
@router.get("/summary", response_model=schemas.InventorySummary)
async def summary(
    days: int = Query(7, ge=1, le=60), db: AsyncSession = Depends(get_db)
):
    return await service.get_summary(db, days)
