import uuid
from datetime import date, datetime, timezone

from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.users.models import User
from app.modules.volunteers import models, schemas


# ─── Shifts ───
async def list_shifts(
    db: AsyncSession,
    site: str | None = None,
    target_date: date | None = None,
    role: str | None = None,
) -> list[models.Shift]:
    stmt = (
        select(models.Shift)
        .options(selectinload(models.Shift.assignments))
        .order_by(models.Shift.shift_date, models.Shift.start_time)
    )
    if site:
        stmt = stmt.where(models.Shift.site == site)
    if target_date:
        stmt = stmt.where(models.Shift.shift_date == target_date)
    if role:
        stmt = stmt.where(models.Shift.role == role)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_shift(db: AsyncSession, shift_id: uuid.UUID) -> models.Shift | None:
    stmt = (
        select(models.Shift)
        .options(selectinload(models.Shift.assignments))
        .where(models.Shift.id == shift_id)
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def create_shift(db: AsyncSession, data: schemas.ShiftCreate) -> models.Shift:
    if data.end_time <= data.start_time:
        raise ValueError("La hora de fin debe ser posterior a la de inicio")
    shift = models.Shift(**data.model_dump())
    db.add(shift)
    await db.commit()
    return await get_shift(db, shift.id)


async def update_shift(
    db: AsyncSession, shift_id: uuid.UUID, data: schemas.ShiftUpdate
) -> models.Shift | None:
    shift = await db.get(models.Shift, shift_id)
    if shift is None:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(shift, field, value)
    await db.commit()
    return await get_shift(db, shift_id)


async def delete_shift(db: AsyncSession, shift_id: uuid.UUID) -> bool:
    shift = await db.get(models.Shift, shift_id)
    if shift is None:
        return False
    await db.delete(shift)
    await db.commit()
    return True


async def assign_to_shift(
    db: AsyncSession,
    shift_id: uuid.UUID,
    user_id: uuid.UUID,
    notes: str | None = None,
) -> models.ShiftAssignment:
    shift = await get_shift(db, shift_id)
    if shift is None:
        raise ValueError("Turno no encontrado")
    if len(shift.assignments) >= shift.capacity:
        raise ValueError("El turno ya está completo")
    existing = next((a for a in shift.assignments if a.user_id == user_id), None)
    if existing is not None:
        raise ValueError("Ya estás asignado a este turno")
    assignment = models.ShiftAssignment(
        shift_id=shift_id, user_id=user_id, notes=notes
    )
    db.add(assignment)
    await db.commit()
    await db.refresh(assignment)
    return assignment


async def unassign_from_shift(
    db: AsyncSession, shift_id: uuid.UUID, user_id: uuid.UUID
) -> bool:
    stmt = select(models.ShiftAssignment).where(
        models.ShiftAssignment.shift_id == shift_id,
        models.ShiftAssignment.user_id == user_id,
    )
    result = await db.execute(stmt)
    assignment = result.scalar_one_or_none()
    if assignment is None:
        return False
    await db.delete(assignment)
    await db.commit()
    return True


async def mark_attendance(
    db: AsyncSession,
    assignment_id: uuid.UUID,
    attended: bool,
    hours: float | None,
) -> models.ShiftAssignment | None:
    assignment = await db.get(models.ShiftAssignment, assignment_id)
    if assignment is None:
        return None
    assignment.attended = attended
    if hours is not None:
        assignment.hours = hours
    await db.commit()
    await db.refresh(assignment)
    return assignment


async def my_hours(db: AsyncSession, user_id: uuid.UUID) -> schemas.VolunteerHours:
    user = await db.get(User, user_id)
    if user is None:
        raise ValueError("Usuario no encontrado")

    total_hours = await db.scalar(
        select(func.coalesce(func.sum(models.ShiftAssignment.hours), 0)).where(
            models.ShiftAssignment.user_id == user_id,
            models.ShiftAssignment.attended.is_(True),
        )
    ) or 0
    total_shifts = await db.scalar(
        select(func.count(models.ShiftAssignment.id)).where(
            models.ShiftAssignment.user_id == user_id
        )
    ) or 0
    attended = await db.scalar(
        select(func.count(models.ShiftAssignment.id)).where(
            models.ShiftAssignment.user_id == user_id,
            models.ShiftAssignment.attended.is_(True),
        )
    ) or 0

    return schemas.VolunteerHours(
        user_id=user_id,
        full_name=user.full_name,
        total_hours=float(total_hours),
        total_shifts=int(total_shifts),
        shifts_attended=int(attended),
    )


async def hours_summary(db: AsyncSession, limit: int = 20) -> schemas.HoursSummary:
    attended_case = case(
        (models.ShiftAssignment.attended.is_(True), 1), else_=0
    )
    stmt = (
        select(
            User.id,
            User.full_name,
            func.coalesce(func.sum(models.ShiftAssignment.hours), 0).label(
                "total_hours"
            ),
            func.count(models.ShiftAssignment.id).label("total_shifts"),
            func.coalesce(func.sum(attended_case), 0).label("attended_shifts"),
        )
        .join(
            models.ShiftAssignment,
            models.ShiftAssignment.user_id == User.id,
            isouter=True,
        )
        .group_by(User.id, User.full_name)
        .order_by(func.coalesce(func.sum(models.ShiftAssignment.hours), 0).desc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    rows = result.all()

    ranking = [
        schemas.VolunteerHours(
            user_id=r._mapping["id"],
            full_name=r._mapping["full_name"],
            total_hours=float(r._mapping["total_hours"] or 0),
            total_shifts=int(r._mapping["total_shifts"] or 0),
            shifts_attended=int(r._mapping["attended_shifts"] or 0),
        )
        for r in rows
    ]

    total_hours = sum(v.total_hours for v in ranking)
    total_shifts = sum(v.total_shifts for v in ranking)

    return schemas.HoursSummary(
        total_volunteers=len(ranking),
        total_hours=round(total_hours, 2),
        total_shifts_assigned=total_shifts,
        ranking=ranking,
    )


async def certificate_data(
    db: AsyncSession, user_id: uuid.UUID
) -> dict:
    """Recopila todos los datos necesarios para el certificado."""
    user = await db.get(User, user_id)
    if user is None:
        raise ValueError("Usuario no encontrado")

    hours_data = await my_hours(db, user_id)

    # Fecha del primer turno asignado
    first_shift = await db.scalar(
        select(func.min(models.Shift.shift_date))
        .select_from(models.Shift)
        .join(
            models.ShiftAssignment,
            models.ShiftAssignment.shift_id == models.Shift.id,
        )
        .where(models.ShiftAssignment.user_id == user_id)
    )

    # Número de certificado único por usuario y año
    year = datetime.now(timezone.utc).year
    short_id = str(user_id).replace("-", "")[:6].upper()
    cert_number = f"XAMA-{year}-{short_id}"

    return {
        "full_name": user.full_name,
        "dni": None,  # se añadirá si se crea el campo
        "site": user.site,
        "total_hours": hours_data.total_hours,
        "total_shifts": hours_data.total_shifts,
        "shifts_attended": hours_data.shifts_attended,
        "first_shift_date": first_shift,
        "certificate_number": cert_number,
    }
