import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.modules.auth.dependencies import get_current_user, require_role
from app.modules.users.models import User
from app.modules.volunteers import schemas, service

router = APIRouter(prefix="/api", tags=["volunteers"])

COORD_ROLES = ("junta", "coordinador_reus", "coordinador_tarragona")


# ─── Shifts ───
@router.get("/shifts", response_model=list[schemas.ShiftRead])
async def list_shifts(
    site: str | None = Query(None, pattern="^(reus|tarragona)$"),
    target_date: date | None = Query(None),
    role: str | None = Query(
        None, pattern="^(vehiculo|clasificacion|cestas|puerta)$"
    ),
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    return await service.list_shifts(db, site, target_date, role)


@router.post(
    "/shifts",
    response_model=schemas.ShiftRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_shift(
    payload: schemas.ShiftCreate,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_role(*COORD_ROLES)),
):
    try:
        return await service.create_shift(db, payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/shifts/{shift_id}", response_model=schemas.ShiftRead)
async def get_shift(
    shift_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    shift = await service.get_shift(db, shift_id)
    if shift is None:
        raise HTTPException(status_code=404, detail="Turno no encontrado")
    return shift


@router.patch("/shifts/{shift_id}", response_model=schemas.ShiftRead)
async def update_shift(
    shift_id: uuid.UUID,
    payload: schemas.ShiftUpdate,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_role(*COORD_ROLES)),
):
    try:
        shift = await service.update_shift(db, shift_id, payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if shift is None:
        raise HTTPException(status_code=404, detail="Turno no encontrado")
    return shift


@router.delete("/shifts/{shift_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_shift(
    shift_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_role("junta")),
):
    ok = await service.delete_shift(db, shift_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Turno no encontrado")
    return None


# ─── Assignments ───
@router.post(
    "/shifts/{shift_id}/assign",
    response_model=schemas.AssignmentRead,
    status_code=status.HTTP_201_CREATED,
)
async def assign(
    shift_id: uuid.UUID,
    payload: schemas.AssignMe,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # si no viene user_id, se asigna a sí mismo
    target_user_id = payload.user_id or user.id
    # si intenta asignar a otro, necesita ser coordinador
    if target_user_id != user.id:
        # comprobar rol
        role = None
        if user.role_id:
            from app.modules.users.models import Role
            r = await db.get(Role, user.role_id)
            role = r.name if r else None
        if role not in COORD_ROLES:
            raise HTTPException(
                status_code=403,
                detail="Solo coordinadores pueden asignar a otros",
            )
    try:
        return await service.assign_to_shift(
            db, shift_id, target_user_id, payload.notes
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete(
    "/shifts/{shift_id}/assign/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def unassign(
    shift_id: uuid.UUID,
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # el propio voluntario puede desapuntarse; coordinadores pueden a cualquiera
    if user_id != current_user.id:
        role = None
        if current_user.role_id:
            from app.modules.users.models import Role
            r = await db.get(Role, current_user.role_id)
            role = r.name if r else None
        if role not in COORD_ROLES:
            raise HTTPException(
                status_code=403,
                detail="Solo coordinadores pueden desasignar a otros",
            )
    ok = await service.unassign_from_shift(db, shift_id, user_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Asignación no encontrada")
    return None


@router.patch(
    "/assignments/{assignment_id}/attendance",
    response_model=schemas.AssignmentRead,
)
async def mark_attendance(
    assignment_id: uuid.UUID,
    payload: schemas.MarkAttendance,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_role(*COORD_ROLES)),
):
    assignment = await service.mark_attendance(
        db, assignment_id, payload.attended, payload.hours
    )
    if assignment is None:
        raise HTTPException(status_code=404, detail="Asignación no encontrada")
    return assignment


# ─── Hours / Gamification ───
@router.get("/volunteers/hours/me", response_model=schemas.VolunteerHours)
async def my_hours(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return await service.my_hours(db, user.id)


@router.get("/volunteers/hours/summary", response_model=schemas.HoursSummary)
async def hours_summary(
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_role("junta")),
):
    return await service.hours_summary(db, limit)
