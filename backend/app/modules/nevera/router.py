import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.modules.auth.dependencies import get_current_user, require_role
from app.modules.nevera import schemas, service
from app.modules.users.models import User

router = APIRouter(prefix="/api/nevera", tags=["nevera"])

COORD_ROLES = ("junta", "coordinador_reus", "coordinador_tarragona")


@router.get("/rations", response_model=list[schemas.RationRead])
async def list_rations(
    from_date: date | None = Query(None),
    to_date: date | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    return await service.list_rations(db, from_date, to_date)


@router.post(
    "/rations",
    response_model=schemas.RationRead,
    status_code=status.HTTP_201_CREATED,
)
async def upsert_ration(
    payload: schemas.RationCreate,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_role(*COORD_ROLES, "voluntario")),
):
    return await service.upsert_ration(db, payload)


@router.patch("/rations/{ration_id}", response_model=schemas.RationRead)
async def update_ration(
    ration_id: uuid.UUID,
    payload: schemas.RationUpdate,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_role(*COORD_ROLES, "voluntario")),
):
    ration = await service.update_ration(db, ration_id, payload)
    if ration is None:
        raise HTTPException(status_code=404, detail="Registro no encontrado")
    return ration


@router.get("/rations/summary", response_model=schemas.RationSummary)
async def ration_summary(
    from_date: date | None = Query(None),
    to_date: date | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    return await service.ration_summary(db, from_date, to_date)


@router.get("/derivations", response_model=list[schemas.DerivationRead])
async def list_derivations(
    status_filter: str | None = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    return await service.list_derivations(db, status_filter)


@router.post(
    "/derivations",
    response_model=schemas.DerivationRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_derivation(
    payload: schemas.DerivationCreate,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_role(*COORD_ROLES, "servicios_sociales")),
):
    try:
        return await service.create_derivation(db, payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.patch(
    "/derivations/{derivation_id}/serve",
    response_model=schemas.DerivationRead,
)
async def serve_derivation(
    derivation_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_role(*COORD_ROLES, "voluntario")),
):
    try:
        derivation = await service.serve_derivation(db, derivation_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    if derivation is None:
        raise HTTPException(status_code=404, detail="Derivación no encontrada")
    return derivation
