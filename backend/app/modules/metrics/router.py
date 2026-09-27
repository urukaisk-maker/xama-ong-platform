from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.modules.auth.dependencies import get_current_user, require_role
from app.modules.metrics import schemas, service
from app.modules.metrics.exporters.csv_export import build_csv
from app.modules.metrics.exporters.pdf_export import build_pdf
from app.modules.users.models import User

router = APIRouter(prefix="/api/metrics", tags=["metrics"])

REPORT_ROLES = ("junta", "coordinador_reus", "coordinador_tarragona")


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
    _user: User = Depends(require_role(*REPORT_ROLES)),
):
    return await service.get_monthly(db, year)


@router.get("/export.csv")
async def export_csv(
    year: int = Query(default_factory=lambda: datetime.now(timezone.utc).year),
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_role(*REPORT_ROLES)),
):
    data = await service.export_csv_data(db, year)
    csv_text = build_csv(data)
    return Response(
        content=csv_text,
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": f'attachment; filename="xama-informe-{year}.csv"'
        },
    )


@router.get("/report.pdf")
async def export_pdf(
    year: int = Query(default_factory=lambda: datetime.now(timezone.utc).year),
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_role(*REPORT_ROLES)),
):
    data = await service.export_pdf_data(db, year)
    pdf_bytes = build_pdf(data)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="xama-informe-{year}.pdf"'
        },
    )
