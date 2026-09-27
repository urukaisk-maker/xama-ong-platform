import uuid
from datetime import UTC, date, datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.nevera import models, schemas


# ─── Rations ───
async def list_rations(
    db: AsyncSession,
    from_date: date | None = None,
    to_date: date | None = None,
) -> list[models.NeveraRation]:
    stmt = select(models.NeveraRation).order_by(models.NeveraRation.date.desc())
    if from_date:
        stmt = stmt.where(models.NeveraRation.date >= from_date)
    if to_date:
        stmt = stmt.where(models.NeveraRation.date <= to_date)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_ration_by_date(
    db: AsyncSession, target_date: date
) -> models.NeveraRation | None:
    result = await db.execute(
        select(models.NeveraRation).where(models.NeveraRation.date == target_date)
    )
    return result.scalar_one_or_none()


async def upsert_ration(
    db: AsyncSession, data: schemas.RationCreate
) -> models.NeveraRation:
    existing = await get_ration_by_date(db, data.date)
    if existing:
        existing.target_rations = data.target_rations
        existing.served_rations = data.served_rations
        existing.notes = data.notes
        await db.commit()
        await db.refresh(existing)
        return existing

    ration = models.NeveraRation(**data.model_dump())
    db.add(ration)
    await db.commit()
    await db.refresh(ration)
    return ration


async def update_ration(
    db: AsyncSession, ration_id: uuid.UUID, data: schemas.RationUpdate
) -> models.NeveraRation | None:
    ration = await db.get(models.NeveraRation, ration_id)
    if ration is None:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(ration, field, value)
    await db.commit()
    await db.refresh(ration)
    return ration


async def ration_summary(
    db: AsyncSession,
    from_date: date | None = None,
    to_date: date | None = None,
) -> schemas.RationSummary:
    stmt = select(
        func.count(models.NeveraRation.id),
        func.coalesce(func.sum(models.NeveraRation.served_rations), 0),
        func.coalesce(func.sum(models.NeveraRation.target_rations), 0),
    )
    if from_date:
        stmt = stmt.where(models.NeveraRation.date >= from_date)
    if to_date:
        stmt = stmt.where(models.NeveraRation.date <= to_date)
    row = (await db.execute(stmt)).one()
    total_days, total_served, target_total = int(row[0]), int(row[1]), int(row[2])
    avg = total_served / total_days if total_days else 0.0
    compliance = (total_served / target_total * 100) if target_total else 0.0
    return schemas.RationSummary(
        total_days=total_days,
        total_served=total_served,
        avg_served=round(avg, 2),
        target_total=target_total,
        compliance_pct=round(compliance, 1),
    )


# ─── Derivations ───
async def list_derivations(
    db: AsyncSession,
    status: str | None = None,
) -> list[models.Derivation]:
    stmt = select(models.Derivation).order_by(models.Derivation.created_at.desc())
    if status:
        stmt = stmt.where(models.Derivation.status == status)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def create_derivation(
    db: AsyncSession, data: schemas.DerivationCreate
) -> models.Derivation:
    derivation = models.Derivation(**data.model_dump())
    db.add(derivation)
    await db.commit()
    await db.refresh(derivation)
    return derivation


async def serve_derivation(
    db: AsyncSession, derivation_id: uuid.UUID
) -> models.Derivation | None:
    derivation = await db.get(models.Derivation, derivation_id)
    if derivation is None:
        return None
    if derivation.status == "servida":
        raise ValueError("La derivación ya estaba marcada como servida")
    derivation.status = "servida"
    derivation.served_at = datetime.now(UTC)
    await db.commit()
    await db.refresh(derivation)
    return derivation
