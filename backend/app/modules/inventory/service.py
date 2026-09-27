import uuid
from datetime import date, timedelta
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.inventory import models, schemas


async def list_products(db: AsyncSession) -> list[models.Product]:
    result = await db.execute(select(models.Product).order_by(models.Product.name))
    return list(result.scalars().all())


async def create_product(
    db: AsyncSession, data: schemas.ProductCreate
) -> models.Product:
    product = models.Product(**data.model_dump())
    db.add(product)
    await db.commit()
    return product


async def list_batches(db: AsyncSession) -> list[models.Batch]:
    result = await db.execute(
        select(models.Batch).order_by(models.Batch.expiry_date.asc())
    )
    return list(result.scalars().all())


async def create_batch(db: AsyncSession, data: schemas.BatchCreate) -> models.Batch:
    batch = models.Batch(**data.model_dump())
    db.add(batch)
    await db.commit()
    return batch


async def list_expiring_soon(
    db: AsyncSession, days: int = 7
) -> list[models.Batch]:
    limit = date.today() + timedelta(days=days)
    result = await db.execute(
        select(models.Batch)
        .where(models.Batch.status == "disponible")
        .where(models.Batch.expiry_date <= limit)
        .order_by(models.Batch.expiry_date.asc())
    )
    return list(result.scalars().all())


async def consume_batch(
    db: AsyncSession, batch_id: uuid.UUID, quantity: Decimal
) -> models.Batch | None:
    batch = await db.get(models.Batch, batch_id)
    if batch is None:
        return None
    if quantity > batch.quantity:
        raise ValueError(
            f"Cantidad solicitada ({quantity}) mayor que la disponible ({batch.quantity})"
        )
    batch.quantity = batch.quantity - quantity
    if batch.quantity == 0:
        batch.status = "agotado"
    await db.commit()
    return batch


async def get_summary(db: AsyncSession, days: int = 7) -> schemas.InventorySummary:
    total_products = await db.scalar(select(func.count(models.Product.id))) or 0
    total_batches = await db.scalar(select(func.count(models.Batch.id))) or 0
    total_qty = await db.scalar(
        select(func.coalesce(func.sum(models.Batch.quantity), 0))
        .where(models.Batch.status == "disponible")
    ) or 0

    limit = date.today() + timedelta(days=days)
    exp_count = await db.scalar(
        select(func.count(models.Batch.id))
        .where(models.Batch.status == "disponible")
        .where(models.Batch.expiry_date <= limit)
    ) or 0
    exp_qty = await db.scalar(
        select(func.coalesce(func.sum(models.Batch.quantity), 0))
        .where(models.Batch.status == "disponible")
        .where(models.Batch.expiry_date <= limit)
    ) or 0

    return schemas.InventorySummary(
        total_products=int(total_products),
        total_batches=int(total_batches),
        total_quantity_kg=float(total_qty),
        expiring_soon_count=int(exp_count),
        expiring_soon_kg=float(exp_qty),
    )


async def delete_batch(db: AsyncSession, batch_id: uuid.UUID) -> models.Batch | None:
    batch = await db.get(models.Batch, batch_id)
    if batch is None:
        return None
    await db.delete(batch)
    await db.commit()
    return batch


async def delete_product(
    db: AsyncSession, product_id: uuid.UUID
) -> tuple[models.Product | None, str | None]:
    """Devuelve (product, error). No borra si tiene lotes asociados."""
    product = await db.get(models.Product, product_id)
    if product is None:
        return None, None

    count = await db.scalar(
        select(func.count(models.Batch.id)).where(
            models.Batch.product_id == product_id
        )
    ) or 0

    if count > 0:
        return None, f"El producto tiene {count} lote(s) asociados"

    await db.delete(product)
    await db.commit()
    return product, None


async def delete_batch(db: AsyncSession, batch_id: uuid.UUID) -> models.Batch | None:
    batch = await db.get(models.Batch, batch_id)
    if batch is None:
        return None
    await db.delete(batch)
    await db.commit()
    return batch


async def delete_product(
    db: AsyncSession, product_id: uuid.UUID
) -> tuple[models.Product | None, str | None]:
    """Devuelve (product, error). No borra si tiene lotes asociados."""
    product = await db.get(models.Product, product_id)
    if product is None:
        return None, None

    count = await db.scalar(
        select(func.count(models.Batch.id)).where(
            models.Batch.product_id == product_id
        )
    ) or 0

    if count > 0:
        return None, f"El producto tiene {count} lote(s) asociados"

    await db.delete(product)
    await db.commit()
    return product, None
