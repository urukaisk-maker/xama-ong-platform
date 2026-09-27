from datetime import datetime

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
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_role("junta")),
):
    stmt = (
        select(models.AuditLog)
        .order_by(models.AuditLog.created_at.desc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    entries = list(result.scalars().all())
    return [
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
    ]
