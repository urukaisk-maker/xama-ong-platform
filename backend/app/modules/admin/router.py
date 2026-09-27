from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.modules.audit.service import log_action
from app.modules.auth.dependencies import require_role
from app.modules.families.models import Delivery, Family
from app.modules.users.models import Role, User

router = APIRouter(prefix="/api/admin/trash", tags=["admin"])


@router.get("")
async def list_trash(
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_role("junta")),
):
    """Lista todo lo soft-borrado: familias y usuarios inactivos."""
    # Familias inactivas
    fam_stmt = (
        select(Family).where(Family.active.is_(False)).order_by(Family.created_at.desc())
    )
    families = list((await db.execute(fam_stmt)).scalars().all())

    families_data = []
    for f in families:
        # Contar entregas asociadas
        count = await db.scalar(
            select(select(Delivery.id).where(Delivery.family_id == f.id).exists())
        )
        count_num = await db.scalar(
            select(__import__("sqlalchemy").func.count(Delivery.id)).where(
                Delivery.family_id == f.id
            )
        ) or 0
        families_data.append({
            "id": str(f.id),
            "reference_code": f.reference_code,
            "site": f.site,
            "adults": f.adults,
            "minors": f.minors,
            "address": f.address,
            "phone": f.phone,
            "created_at": f.created_at.isoformat() if f.created_at else None,
            "deliveries_count": int(count_num),
            "has_deliveries": bool(count),
        })

    # Usuarios inactivos
    user_stmt = (
        select(User, Role)
        .join(Role, Role.id == User.role_id, isouter=True)
        .where(User.active.is_(False))
        .order_by(User.created_at.desc())
    )
    user_rows = (await db.execute(user_stmt)).all()
    users_data = [
        {
            "id": str(u.User.id),
            "email": u.User.email,
            "full_name": u.User.full_name,
            "site": u.User.site,
            "role_name": u.Role.name if u.Role else None,
            "created_at": u.User.created_at.isoformat() if u.User.created_at else None,
        }
        for u in user_rows
    ]

    return {
        "families": families_data,
        "users": users_data,
    }


@router.post("/restore/family/{family_id}")
async def restore_family(
    family_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("junta")),
):
    import uuid as _uuid

    try:
        fid = _uuid.UUID(family_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID inválido") from None

    family = await db.get(Family, fid)
    if family is None:
        raise HTTPException(status_code=404, detail="Familia no encontrada")
    if family.active:
        raise HTTPException(status_code=400, detail="La familia ya está activa")

    family.active = True
    await log_action(
        db,
        user,
        action="restore",
        resource_type="family",
        resource_id=str(fid),
        description=f"Familia {family.reference_code} restaurada",
    )
    await db.commit()
    return {"ok": True, "id": str(family.id)}


@router.post("/restore/user/{user_id}")
async def restore_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_role("junta")),
):
    import uuid as _uuid

    try:
        uid = _uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID inválido") from None

    user = await db.get(User, uid)
    if user is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if user.active:
        raise HTTPException(status_code=400, detail="El usuario ya está activo")

    user.active = True
    await log_action(
        db,
        admin,
        action="restore",
        resource_type="user",
        resource_id=str(uid),
        description=f"Usuario {user.email} restaurado",
    )
    await db.commit()
    return {"ok": True, "id": str(user.id)}
