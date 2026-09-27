import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from fastapi.responses import Response

from app.modules.audit.service import log_action
from app.modules.auth.dependencies import require_role
from app.modules.donations import schemas
from app.modules.donations.exporters.certificate_pdf import (
    build_donation_certificate,
)
from app.db.session import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.users.models import User

router = APIRouter(prefix="/api/donations", tags=["donations"])


@router.post("/certificate.pdf")
async def donation_certificate(
    payload: schemas.DonationCertificateRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("junta", "coordinador_reus", "coordinador_tarragona")),
):
    """Genera un certificado de donación PDF (Ley 49/2002)."""
    year = datetime.now(timezone.utc).year
    short_id = uuid.uuid4().hex[:6].upper()
    cert_number = f"XAMA-DON-{year}-{short_id}"

    pdf = build_donation_certificate(
        donor_name=payload.donor_name,
        donor_tax_id=payload.donor_tax_id,
        amount=payload.amount,
        donation_date=payload.donation_date,
        concept=payload.concept,
        donor_address=payload.donor_address,
        recurring=payload.recurring,
        certificate_number=cert_number,
    )

    await log_action(
        db,
        user,
        action="donation_certificate",
        resource_type="donation",
        resource_id=cert_number,
        description=f"Certificado emitido a {payload.donor_name} por {payload.amount:.2f} €",
    )
    await db.commit()

    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                f'attachment; filename="certificado-donacion-{cert_number}.pdf"'
            )
        },
    )
