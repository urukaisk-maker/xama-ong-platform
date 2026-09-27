"""Tareas de limpieza y mantenimiento."""
from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import delete, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.modules.audit.service import log_action
from app.modules.auth.dependencies import require_role
from app.modules.families.models import Delivery, Family
from app.modules.inventory.models import Batch
from app.modules.users.models import User

router = APIRouter(prefix="/api/admin/maintenance", tags=["admin"])


class CleanupParams(BaseModel):
    dry_run: bool = True
    batches_expired_days: int = 30
    deliveries_before_days: int = 365
    families_inactive_months: int = 6


class CleanupResult(BaseModel):
    dry_run: bool
    batches_deleted: int
    deliveries_deleted: int
    families_deactivated: int
    details: dict


async def _find_expired_batches(
    db: AsyncSession, days_ago: int
) -> list[Batch]:
    limit = date.today() - timedelta(days=days_ago)
    stmt = select(Batch).where(
        Batch.expiry_date < limit,
        Batch.quantity > 0,
    )
    return list((await db.execute(stmt)).scalars().all())


async def _find_old_deliveries(
    db: AsyncSession, days_ago: int
) -> list[Delivery]:
    limit = date.today() - timedelta(days=days_ago)
    stmt = select(Delivery).where(Delivery.delivery_date < limit)
    return list((await db.execute(stmt)).scalars().all())


async def _find_inactive_families(
    db: AsyncSession, months: int
) -> list[Family]:
    limit = datetime.now(timezone.utc) - timedelta(days=months * 30)
    # Familias activas sin entregas desde X meses
    subq = (
        select(Delivery.family_id)
        .where(Delivery.created_at >= limit)
        .distinct()
    )
    stmt = select(Family).where(
        Family.active.is_(True),
        Family.id.not_in(subq),
        Family.created_at < limit,
    )
    return list((await db.execute(stmt)).scalars().all())


@router.get("/preview")
async def preview_cleanup(
    batches_expired_days: int = Query(30, ge=1, le=365),
    deliveries_before_days: int = Query(365, ge=30, le=3650),
    families_inactive_months: int = Query(6, ge=1, le=60),
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_role("junta")),
):
    batches = await _find_expired_batches(db, batches_expired_days)
    deliveries = await _find_old_deliveries(db, deliveries_before_days)
    families = await _find_inactive_families(db, families_inactive_months)

    return {
        "dry_run": True,
        "batches": [
            {
                "id": str(b.id),
                "quantity": float(b.quantity),
                "expiry_date": b.expiry_date.isoformat(),
                "days_expired": (date.today() - b.expiry_date).days,
            }
            for b in batches[:100]  # muestra max 100
        ],
        "batches_count": len(batches),
        "deliveries": [
            {
                "id": str(d.id),
                "delivery_date": d.delivery_date.isoformat(),
                "site": d.site,
                "status": d.status,
            }
            for d in deliveries[:100]
        ],
        "deliveries_count": len(deliveries),
        "families": [
            {
                "id": str(f.id),
                "reference_code": f.reference_code,
                "site": f.site,
            }
            for f in families[:100]
        ],
        "families_count": len(families),
    }


@router.post("/cleanup", response_model=CleanupResult)
async def run_cleanup(
    params: CleanupParams,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("junta")),
):
    batches = await _find_expired_batches(db, params.batches_expired_days)
    deliveries = await _find_old_deliveries(db, params.deliveries_before_days)
    families = await _find_inactive_families(db, params.families_inactive_months)

    if params.dry_run:
        return CleanupResult(
            dry_run=True,
            batches_deleted=len(batches),
            deliveries_deleted=len(deliveries),
            families_deactivated=len(families),
            details={
                "batches_preview": len(batches),
                "deliveries_preview": len(deliveries),
                "families_preview": len(families),
            },
        )

    # Ejecutar de verdad
    batch_ids = [b.id for b in batches]
    delivery_ids = [d.id for d in deliveries]
    family_ids = [f.id for f in families]

    if batch_ids:
        await db.execute(delete(Batch).where(Batch.id.in_(batch_ids)))
    if delivery_ids:
        await db.execute(delete(Delivery).where(Delivery.id.in_(delivery_ids)))
    if family_ids:
        await db.execute(
            update(Family).where(Family.id.in_(family_ids)).values(active=False)
        )

    await log_action(
        db,
        user,
        action="maintenance_cleanup",
        resource_type="system",
        resource_id=None,
        description=(
            f"Limpieza: {len(batch_ids)} lotes, {len(delivery_ids)} entregas, "
            f"{len(family_ids)} familias desactivadas"
        ),
    )
    await db.commit()

    return CleanupResult(
        dry_run=False,
        batches_deleted=len(batch_ids),
        deliveries_deleted=len(delivery_ids),
        families_deactivated=len(family_ids),
        details={
            "batches_expired_days": params.batches_expired_days,
            "deliveries_before_days": params.deliveries_before_days,
            "families_inactive_months": params.families_inactive_months,
        },
    )
