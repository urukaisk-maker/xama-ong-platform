from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.modules.auth.dependencies import get_current_user, require_role
from app.modules.metrics import schemas, service
from app.modules.users.models import User

router = APIRouter(prefix="/api/metrics", tags=["metrics"])


@router.get("/impact", response_model=schemas.ImpactMetrics)
async def impact(
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    return await service.get_impact(db)


@router.get("/monthly", response_model=schemas.MonthlySeries)
async def monthly(
    year: int = Query(default_factory=lambda: datetime.now(timezone.utc).year),
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_role("junta", "coordinador_reus", "coordinador_tarragona")),
):
    return await service.get_monthly(db, year)
