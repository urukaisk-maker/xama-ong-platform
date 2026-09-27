from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.modules.metrics import service as metrics_service
from app.modules.public import schemas

router = APIRouter(prefix="/api/public", tags=["public"])


@router.get("/stats", response_model=schemas.PublicStats)
async def public_stats(db: AsyncSession = Depends(get_db)):
    """Estadísticas públicas. Sin autenticación."""
    impact = await metrics_service.get_impact(db)
    return schemas.PublicStats(
        total_kg_recovered=impact.total_kg_recovered,
        co2_avoided_kg=impact.co2_avoided_kg,
        nevera_served=impact.nevera_served,
        total_families=impact.total_families,
        total_people=impact.total_people,
        total_volunteers=impact.total_volunteers,
        total_volunteer_hours=impact.total_volunteer_hours,
        active_families=impact.active_families,
        reus_families=impact.reus_families,
        tarragona_families=impact.tarragona_families,
    )
