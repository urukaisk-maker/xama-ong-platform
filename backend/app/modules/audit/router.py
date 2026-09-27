from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.modules.audit import models
from app.modules.auth.dependencies import require_role
from app.modules.users.models import User

router = APIRouter(prefix="/api/audit", tags=["audit"])


@router.get("/log")
async def list_audit(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    action: str | None = Query(None),
    resource_type: str | None = Query(None),
    user_email: str | None = Query(None),
    days: int | None = Query(None, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_role("junta")),
):
    stmt = select(models.AuditLog).order_by(models.AuditLog.created_at.desc())

    if action:
        stmt = stmt.where(models.AuditLog.action == action)
    if resource_type:
        stmt = stmt.where(models.AuditLog.resource_type == resource_type)
    if user_email:
        stmt = stmt.where(models.AuditLog.user_email.ilike(f"%{user_email}%"))
    if days:
        limit_date = datetime.now(timezone.utc) - timedelta(days=days)
        stmt = stmt.where(models.AuditLog.created_at >= limit_date)

    # Total antes de paginar
    from sqlalchemy import func
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = await db.scalar(count_stmt) or 0

    stmt = stmt.offset(offset).limit(limit)
    result = await db.execute(stmt)
    entries = list(result.scalars().all())

    return {
        "total": int(total),
        "limit": limit,
        "offset": offset,
        "entries": [
            {
                "id": str(e.id),
                "user_email": e.user_email,
                "action": e.action,
                "resource_type": e.resource_type,
                "resource_id": e.resource_id,
                "description": e.description,
                "created_at": e.created_at.isoformat() if e.created_at else None,
            }
            for e in entries
        ],
    }


@router.get("/summary")
async def audit_summary(
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_role("junta")),
):
    """Resumen de acciones por tipo en los últimos N días."""
    from sqlalchemy import func

    limit_date = datetime.now(timezone.utc) - timedelta(days=days)

    # Acciones por tipo
    stmt = (
        select(
            models.AuditLog.action,
            func.count(models.AuditLog.id).label("count"),
        )
        .where(models.AuditLog.created_at >= limit_date)
        .group_by(models.AuditLog.action)
    )
    by_action = [
        {"action": r._mapping["action"], "count": int(r._mapping["count"])}
        for r in (await db.execute(stmt)).all()
    ]

    # Top usuarios
    stmt2 = (
        select(
            models.AuditLog.user_email,
            func.count(models.AuditLog.id).label("count"),
        )
        .where(models.AuditLog.created_at >= limit_date)
        .where(models.AuditLog.user_email.isnot(None))
        .group_by(models.AuditLog.user_email)
        .order_by(func.count(models.AuditLog.id).desc())
        .limit(10)
    )
    top_users = [
        {"email": r._mapping["user_email"], "count": int(r._mapping["count"])}
        for r in (await db.execute(stmt2)).all()
    ]

    # Recursos más afectados
    stmt3 = (
        select(
            models.AuditLog.resource_type,
            func.count(models.AuditLog.id).label("count"),
        )
        .where(models.AuditLog.created_at >= limit_date)
        .group_by(models.AuditLog.resource_type)
        .order_by(func.count(models.AuditLog.id).desc())
    )
    by_resource = [
        {"resource": r._mapping["resource_type"], "count": int(r._mapping["count"])}
        for r in (await db.execute(stmt3)).all()
    ]

    return {
        "days": days,
        "by_action": by_action,
        "top_users": top_users,
        "by_resource": by_resource,
    }
