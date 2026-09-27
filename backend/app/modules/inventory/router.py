import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.modules.audit.service import log_action
from app.modules.auth.dependencies import require_role
from app.modules.inventory import schemas, service
from app.modules.users.models import User

router = APIRouter(prefix="/api/inventory", tags=["inventory"])

COORD_ROLES = ("junta", "coordinador_reus", "coordinador_tarragona")


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


@router.delete("/products/{product_id}", status_code=204)
async def delete_product_endpoint(
    product_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role(*COORD_ROLES)),
):
    product, error = await service.delete_product(db, product_id)
    if error:
        raise HTTPException(status_code=400, detail=error)
    if product is None:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    await log_action(
        db,
        user,
        action="delete",
        resource_type="product",
        resource_id=str(product_id),
        description=f"Producto borrado: {product.name}",
    )
    await db.commit()
    return None


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


@router.delete("/batches/{batch_id}", status_code=204)
async def delete_batch_endpoint(
    batch_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role(*COORD_ROLES)),
):
    batch = await service.delete_batch(db, batch_id)
    if batch is None:
        raise HTTPException(status_code=404, detail="Lote no encontrado")
    await log_action(
        db,
        user,
        action="delete",
        resource_type="batch",
        resource_id=str(batch_id),
        description=f"Lote borrado: {batch.quantity} (cad. {batch.expiry_date})",
    )
    await db.commit()
    return None


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
        raise HTTPException(status_code=400, detail=str(e)) from e
    if batch is None:
        raise HTTPException(status_code=404, detail="Lote no encontrado")
    return batch


@router.get("/summary", response_model=schemas.InventorySummary)
async def summary(
    days: int = Query(7, ge=1, le=60), db: AsyncSession = Depends(get_db)
):
    return await service.get_summary(db, days)
