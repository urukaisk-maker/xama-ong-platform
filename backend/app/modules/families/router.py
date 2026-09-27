import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.modules.families import schemas, service

router = APIRouter(prefix="/api", tags=["families"])


@router.get("/families", response_model=list[schemas.FamilyRead])
async def list_families(
    site: str | None = Query(None, pattern="^(reus|tarragona)$"),
    active: bool | None = None,
    db: AsyncSession = Depends(get_db),
):
    return await service.list_families(db, site, active)


@router.post(
    "/families",
    response_model=schemas.FamilyRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_family(
    payload: schemas.FamilyCreate, db: AsyncSession = Depends(get_db)
):
    try:
        return await service.create_family(db, payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.get("/families/{family_id}", response_model=schemas.FamilyRead)
async def get_family(family_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    family = await service.get_family(db, family_id)
    if family is None:
        raise HTTPException(status_code=404, detail="Familia no encontrada")
    return family


@router.patch("/families/{family_id}", response_model=schemas.FamilyRead)
async def update_family(
    family_id: uuid.UUID,
    payload: schemas.FamilyUpdate,
    db: AsyncSession = Depends(get_db),
):
    family = await service.update_family(db, family_id, payload)
    if family is None:
        raise HTTPException(status_code=404, detail="Familia no encontrada")
    return family


@router.get("/families-summary", response_model=schemas.FamilySummary)
async def family_summary(db: AsyncSession = Depends(get_db)):
    return await service.get_family_summary(db)


@router.get("/deliveries", response_model=list[schemas.DeliveryRead])
async def list_deliveries(
    site: str | None = Query(None, pattern="^(reus|tarragona)$"),
    target_date: date | None = Query(None),
    status_filter: str | None = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
):
    return await service.list_deliveries(db, site, target_date, status_filter)


@router.post(
    "/deliveries",
    response_model=schemas.DeliveryRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_delivery(
    payload: schemas.DeliveryCreate, db: AsyncSession = Depends(get_db)
):
    try:
        return await service.create_delivery(db, payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.patch("/deliveries/{delivery_id}/check-in", response_model=schemas.DeliveryRead)
async def check_in(
    delivery_id: uuid.UUID,
    payload: schemas.DeliveryCheckIn,
    db: AsyncSession = Depends(get_db),
):
    try:
        delivery = await service.check_in_delivery(db, delivery_id, payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    if delivery is None:
        raise HTTPException(status_code=404, detail="Entrega no encontrada")
    return delivery


# ─── Import CSV ───
from fastapi import File, UploadFile  # noqa: E402
from app.modules.auth.dependencies import get_current_user, require_role  # noqa: E402
from app.modules.users.models import User  # noqa: E402

COORD_ROLES = ("junta", "coordinador_reus", "coordinador_tarragona")


@router.post("/families/import/preview", response_model=schemas.ImportPreview)
async def import_preview(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_role(*COORD_ROLES)),
):
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="El archivo debe ser .csv")
    content = (await file.read()).decode("utf-8-sig")
    return await service.import_csv_preview(db, content)


@router.post("/families/import", response_model=schemas.ImportPreview)
async def import_families(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_role(*COORD_ROLES)),
):
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="El archivo debe ser .csv")
    content = (await file.read()).decode("utf-8-sig")
    return await service.import_csv(db, content)


@router.get("/families/template.csv")
async def families_template(
    _user: User = Depends(require_role(*COORD_ROLES)),
):
    csv_text = (
        "reference_code,site,adults,minors,address,phone,"
        "dietary_restrictions,notes\n"
        "FAM-001,reus,2,3,Carrer Major 12,600111222,Sin gluten,\n"
        "FAM-002,tarragona,1,0,Avinguda Roma 45,600333444,,\n"
        "FAM-003,reus,3,1,,600555666,Vegetariana,Familia monoparental\n"
    )
    return Response(
        content=csv_text,
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": 'attachment; filename="xama-familias-plantilla.csv"'
        },
    )


from app.modules.audit.service import log_action  # noqa: E402


@router.delete("/families/{family_id}", status_code=204)
async def delete_family_endpoint(
    family_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role(*COORD_ROLES)),
):
    family, status = await service.delete_family(db, family_id)
    if family is None:
        raise HTTPException(status_code=404, detail="Familia no encontrada")
    action = "soft_delete" if status == "soft" else "delete"
    await log_action(
        db,
        user,
        action=action,
        resource_type="family",
        resource_id=str(family_id),
        description=f"Familia {family.reference_code} "
        + ("desactivada (tenía entregas)" if status == "soft" else "borrada"),
    )
    await db.commit()
    return None


@router.delete("/deliveries/{delivery_id}", status_code=204)
async def delete_delivery_endpoint(
    delivery_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role(*COORD_ROLES)),
):
    delivery = await service.delete_delivery(db, delivery_id)
    if delivery is None:
        raise HTTPException(status_code=404, detail="Entrega no encontrada")
    await log_action(
        db,
        user,
        action="delete",
        resource_type="delivery",
        resource_id=str(delivery_id),
        description=f"Entrega borrada ({delivery.delivery_date})",
    )
    await db.commit()
    return None
