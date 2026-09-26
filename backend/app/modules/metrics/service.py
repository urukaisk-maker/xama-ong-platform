from datetime import datetime, timezone

from sqlalchemy import case, extract, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.families.models import Delivery, Family
from app.modules.inventory.models import Batch, Product
from app.modules.metrics import schemas
from app.modules.nevera.models import Derivation, NeveraRation
from app.modules.users.models import User
from app.modules.volunteers.models import Shift, ShiftAssignment

CO2_FACTOR = 2.5  # kg CO2 evitado por kg de alimento recuperado


async def get_impact(db: AsyncSession) -> schemas.ImpactMetrics:
    total_products = await db.scalar(select(func.count(Product.id))) or 0
    total_batches = await db.scalar(select(func.count(Batch.id))) or 0
    total_kg = await db.scalar(
        select(func.coalesce(func.sum(Batch.quantity), 0))
    ) or 0

    today = datetime.now(timezone.utc).date()
    expiring_kg = await db.scalar(
        select(func.coalesce(func.sum(Batch.quantity), 0)).where(
            Batch.expiry_date <= today,
            Batch.status == "disponible",
        )
    ) or 0

    total_fam = await db.scalar(select(func.count(Family.id))) or 0
    active_fam = await db.scalar(
        select(func.count(Family.id)).where(Family.active.is_(True))
    ) or 0
    total_people = await db.scalar(
        select(func.coalesce(func.sum(Family.adults + Family.minors), 0)).where(
            Family.active.is_(True)
        )
    ) or 0
    reus_fam = await db.scalar(
        select(func.count(Family.id)).where(Family.site == "reus")
    ) or 0
    tgn_fam = await db.scalar(
        select(func.count(Family.id)).where(Family.site == "tarragona")
    ) or 0

    total_del = await db.scalar(select(func.count(Delivery.id))) or 0
    done_del = await db.scalar(
        select(func.count(Delivery.id)).where(Delivery.status == "entregada")
    ) or 0
    pending_del = total_del - done_del

    nevera_served = await db.scalar(
        select(func.coalesce(func.sum(NeveraRation.served_rations), 0))
    ) or 0
    nevera_target = await db.scalar(
        select(func.coalesce(func.sum(NeveraRation.target_rations), 0))
    ) or 0
    compliance = (nevera_served / nevera_target * 100) if nevera_target else 0.0

    deriv_total = await db.scalar(select(func.count(Derivation.id))) or 0
    deriv_served = await db.scalar(
        select(func.count(Derivation.id)).where(Derivation.status == "servida")
    ) or 0

    total_vol = await db.scalar(select(func.count(User.id))) or 0
    total_hours = await db.scalar(
        select(func.coalesce(func.sum(ShiftAssignment.hours), 0)).where(
            ShiftAssignment.attended.is_(True)
        )
    ) or 0
    total_shifts = await db.scalar(select(func.count(Shift.id))) or 0

    co2 = float(total_kg) * CO2_FACTOR

    return schemas.ImpactMetrics(
        total_products=int(total_products),
        total_batches=int(total_batches),
        total_kg_recovered=float(total_kg),
        expiring_soon_kg=float(expiring_kg),
        total_families=int(total_fam),
        active_families=int(active_fam),
        total_people=int(total_people),
        reus_families=int(reus_fam),
        tarragona_families=int(tgn_fam),
        total_deliveries=int(total_del),
        deliveries_done=int(done_del),
        deliveries_pending=int(pending_del),
        nevera_served=int(nevera_served),
        nevera_target=int(nevera_target),
        nevera_compliance_pct=round(compliance, 1),
        derivations_total=int(deriv_total),
        derivations_served=int(deriv_served),
        total_volunteers=int(total_vol),
        total_volunteer_hours=float(total_hours),
        total_shifts=int(total_shifts),
        co2_avoided_kg=round(co2, 1),
        generated_at=datetime.now(timezone.utc).isoformat(),
    )


async def get_monthly(db: AsyncSession, year: int) -> schemas.MonthlySeries:
    # kg recuperados por mes
    kg_stmt = (
        select(
            extract("month", Batch.created_at).label("m"),
            func.coalesce(func.sum(Batch.quantity), 0).label("kg"),
        )
        .where(extract("year", Batch.created_at) == year)
        .group_by("m")
    )
    kg_rows = {int(r.m): float(r.kg) for r in (await db.execute(kg_stmt)).all()}

    # entregas por mes
    del_stmt = (
        select(
            extract("month", Delivery.created_at).label("m"),
            func.count(Delivery.id).label("c"),
        )
        .where(extract("year", Delivery.created_at) == year)
        .group_by("m")
    )
    del_rows = {int(r.m): int(r.c) for r in (await db.execute(del_stmt)).all()}

    # nevera por mes
    nev_stmt = (
        select(
            extract("month", NeveraRation.date).label("m"),
            func.coalesce(func.sum(NeveraRation.served_rations), 0).label("c"),
        )
        .where(extract("year", NeveraRation.date) == year)
        .group_by("m")
    )
    nev_rows = {int(r.m): int(r.c) for r in (await db.execute(nev_stmt)).all()}

    # horas por mes
    hrs_stmt = (
        select(
            extract("month", ShiftAssignment.created_at).label("m"),
            func.coalesce(func.sum(ShiftAssignment.hours), 0).label("h"),
        )
        .where(extract("year", ShiftAssignment.created_at) == year)
        .group_by("m")
    )
    hrs_rows = {int(r.m): float(r.h) for r in (await db.execute(hrs_stmt)).all()}

    points = [
        schemas.MonthlyPoint(
            month=m,
            year=year,
            kg_recovered=kg_rows.get(m, 0.0),
            deliveries=del_rows.get(m, 0),
            nevera_served=nev_rows.get(m, 0),
            volunteer_hours=hrs_rows.get(m, 0.0),
        )
        for m in range(1, 13)
    ]

    return schemas.MonthlySeries(year=year, points=points)
