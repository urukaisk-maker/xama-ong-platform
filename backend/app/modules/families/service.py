import uuid
from datetime import UTC, date, datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.families import models, schemas


async def list_families(
    db: AsyncSession,
    site: str | None = None,
    active: bool | None = None,
) -> list[models.Family]:
    stmt = select(models.Family).order_by(models.Family.reference_code)
    if site is not None:
        stmt = stmt.where(models.Family.site == site)
    if active is not None:
        stmt = stmt.where(models.Family.active == active)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_family(db: AsyncSession, family_id: uuid.UUID) -> models.Family | None:
    return await db.get(models.Family, family_id)


async def create_family(
    db: AsyncSession, data: schemas.FamilyCreate
) -> models.Family:
    family = models.Family(**data.model_dump())
    db.add(family)
    await db.commit()
    return family


async def update_family(
    db: AsyncSession, family_id: uuid.UUID, data: schemas.FamilyUpdate
) -> models.Family | None:
    family = await db.get(models.Family, family_id)
    if family is None:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(family, field, value)
    await db.commit()
    return family


async def list_deliveries(
    db: AsyncSession,
    site: str | None = None,
    target_date: date | None = None,
    status: str | None = None,
) -> list[models.Delivery]:
    stmt = select(models.Delivery).order_by(models.Delivery.delivery_date)
    if site:
        stmt = stmt.where(models.Delivery.site == site)
    if target_date:
        stmt = stmt.where(models.Delivery.delivery_date == target_date)
    if status:
        stmt = stmt.where(models.Delivery.status == status)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def create_delivery(
    db: AsyncSession, data: schemas.DeliveryCreate
) -> models.Delivery:
    delivery = models.Delivery(**data.model_dump())
    db.add(delivery)
    await db.commit()
    return delivery


async def check_in_delivery(
    db: AsyncSession,
    delivery_id: uuid.UUID,
    payload: schemas.DeliveryCheckIn,
) -> models.Delivery | None:
    delivery = await db.get(models.Delivery, delivery_id)
    if delivery is None:
        return None
    if delivery.status == "entregada":
        raise ValueError("La entrega ya estaba marcada como entregada")
    delivery.status = "entregada"
    delivery.checked_in_at = datetime.now(UTC)
    if payload.volunteer_id is not None:
        delivery.volunteer_id = payload.volunteer_id
    if payload.notes is not None:
        delivery.notes = payload.notes
    await db.commit()
    return delivery


async def get_family_summary(db: AsyncSession) -> schemas.FamilySummary:
    total = await db.scalar(select(func.count(models.Family.id))) or 0
    active = await db.scalar(
        select(func.count(models.Family.id)).where(models.Family.active.is_(True))
    ) or 0
    reus = await db.scalar(
        select(func.count(models.Family.id)).where(models.Family.site == "reus")
    ) or 0
    tgn = await db.scalar(
        select(func.count(models.Family.id)).where(models.Family.site == "tarragona")
    ) or 0
    people = await db.scalar(
        select(func.coalesce(func.sum(models.Family.adults + models.Family.minors), 0))
        .where(models.Family.active.is_(True))
    ) or 0

    return schemas.FamilySummary(
        total_families=int(total),
        active_families=int(active),
        reus_families=int(reus),
        tarragona_families=int(tgn),
        total_people=int(people),
    )
