import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.modules.auth.dependencies import get_current_user, require_role
from app.modules.users.models import Role, User
from app.modules.volunteers import schemas, service
from app.modules.volunteers.exporters.certificate_pdf import build_certificate

router = APIRouter(prefix="/api", tags=["volunteers"])

COORD_ROLES = ("junta", "coordinador_reus", "coordinador_tarragona")


async def _role_of(db: AsyncSession, user: User) -> str | None:
    if user.role_id is None:
        return None
    r = await db.get(Role, user.role_id)
    return r.name if r else None


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


@router.post("/shifts", response_model=schemas.ShiftRead, status_code=201)
async def create_shift(
    payload: schemas.ShiftCreate,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_role(*COORD_ROLES)),
):
    try:
        return await service.create_shift(db, payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


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
        raise HTTPException(status_code=400, detail=str(e)) from e
    if shift is None:
        raise HTTPException(status_code=404, detail="Turno no encontrado")
    return shift


@router.delete("/shifts/{shift_id}", status_code=204)
async def delete_shift(
    shift_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_role("junta")),
):
    ok = await service.delete_shift(db, shift_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Turno no encontrado")
    return None


@router.post(
    "/shifts/{shift_id}/assign",
    response_model=schemas.AssignmentRead,
    status_code=201,
)
async def assign(
    shift_id: uuid.UUID,
    payload: schemas.AssignMe,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    target_user_id = payload.user_id or user.id
    if target_user_id != user.id:
        role = await _role_of(db, user)
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
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.delete("/shifts/{shift_id}/assign/{user_id}", status_code=204)
async def unassign(
    shift_id: uuid.UUID,
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if user_id != current_user.id:
        role = await _role_of(db, current_user)
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


# ─── Hours ───
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


# ─── Certificate ───
@router.get("/volunteers/me/certificate.pdf")
async def my_certificate(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        data = await service.certificate_data(db, user.id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    pdf = build_certificate(**data)
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                f'attachment; filename="certificado-{data["certificate_number"]}.pdf"'
            )
        },
    )


@router.get("/volunteers/{user_id}/certificate.pdf")
async def certificate_for_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_role(*COORD_ROLES)),
):
    try:
        data = await service.certificate_data(db, user_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    pdf = build_certificate(**data)
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                f'attachment; filename="certificado-{data["certificate_number"]}.pdf"'
            )
        },
    )
