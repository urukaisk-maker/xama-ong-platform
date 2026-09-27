"""Lógica de notificaciones: qué avisar y a quién."""
from datetime import date, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.inventory.models import Batch, Product
from app.modules.notifications.email_service import send_email
from app.modules.notifications.templates import expiring_email
from app.modules.users.models import Role, User


async def _coordinators_for_site(
    db: AsyncSession, site: str
) -> list[str]:
    """Devuelve los emails de junta + coordinadores de la sede."""
    role_names = ["junta", f"coordinador_{site}"]
    stmt = (
        select(User.email)
        .join(Role, Role.id == User.role_id)
        .where(Role.name.in_(role_names), User.active.is_(True))
    )
    result = await db.execute(stmt)
    return [r[0] for r in result.all()]


async def _expiring_batches(
    db: AsyncSession, days: int = 3
) -> dict[str, list[dict]]:
    """Agrupa los lotes próximos a caducar por sede.

    Como los lotes no tienen 'site' directamente, se asume que
    'origin' + 'location' determinan la sede. Por ahora:
      - si no hay location, se asume reus (default)
      - si location contiene 'tarragona', se asigna a tarragona
    """
    today = date.today()
    limit = today + timedelta(days=days)

    stmt = (
        select(Batch, Product)
        .join(Product, Product.id == Batch.product_id)
        .where(
            Batch.status == "disponible",
            Batch.expiry_date <= limit,
            Batch.quantity > 0,
        )
        .order_by(Batch.expiry_date)
    )
    result = await db.execute(stmt)
    rows = result.all()

    by_site: dict[str, list[dict]] = {"reus": [], "tarragona": []}

    for batch, product in rows:
        site = "reus"
        if batch.location and "tarragona" in batch.location.lower():
            site = "tarragona"

        by_site[site].append(
            {
                "product": product.name,
                "quantity": float(batch.quantity),
                "unit": product.unit or "kg",
                "expiry": batch.expiry_date.isoformat(),
                "days": (batch.expiry_date - today).days,
            }
        )

    return by_site


async def notify_expiring_batches(
    db: AsyncSession,
    days: int = 3,
    inventory_url: str = "http://localhost:3100/inventory",
) -> dict:
    """Comprueba lotes que caducan y envía emails por sede.

    Devuelve un resumen: {site: {emails_sent: [...], count: N}, ...}
    """
    by_site = await _expiring_batches(db, days)
    result = {}

    for site, batches in by_site.items():
        if not batches:
            result[site] = {"count": 0, "sent": [], "skipped": "sin lotes"}
            continue

        recipients = await _coordinators_for_site(db, site)
        if not recipients:
            result[site] = {
                "count": len(batches),
                "sent": [],
                "skipped": "sin destinatarios",
            }
            continue

        subject, body_text, body_html = expiring_email(
            site, batches, inventory_url
        )
        send_result = send_email(recipients, subject, body_text, body_html)

        result[site] = {
            "count": len(batches),
            "sent": recipients if send_result["sent"] else [],
            "dryrun": send_result["mode"] == "dryrun",
            "error": send_result["error"],
        }

    return result
