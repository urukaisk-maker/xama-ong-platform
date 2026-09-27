import csv
import io
import uuid
from datetime import date, datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.families import models, schemas


# ─── Families ───
async def list_families(
    db: AsyncSession,
    site: str | None = None,
    active: bool | None = None,
) -> list[models.Family]:
    stmt = select(models.Family).order_by(models.Family.reference_code)
    if site is not None:
        stmt = stmt.where(models.Family.site == site)
    if active is not None:
        stmt = stmt.where(models.Family.active == active)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_family(db: AsyncSession, family_id: uuid.UUID) -> models.Family | None:
    return await db.get(models.Family, family_id)


async def create_family(db: AsyncSession, data: schemas.FamilyCreate) -> models.Family:
    family = models.Family(**data.model_dump())
    db.add(family)
    await db.commit()
    return family


async def update_family(
    db: AsyncSession, family_id: uuid.UUID, data: schemas.FamilyUpdate
) -> models.Family | None:
    family = await db.get(models.Family, family_id)
    if family is None:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(family, field, value)
    await db.commit()
    return family


async def list_deliveries(
    db: AsyncSession,
    site: str | None = None,
    target_date: date | None = None,
    status: str | None = None,
) -> list[models.Delivery]:
    stmt = select(models.Delivery).order_by(models.Delivery.delivery_date)
    if site:
        stmt = stmt.where(models.Delivery.site == site)
    if target_date:
        stmt = stmt.where(models.Delivery.delivery_date == target_date)
    if status:
        stmt = stmt.where(models.Delivery.status == status)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def create_delivery(
    db: AsyncSession, data: schemas.DeliveryCreate
) -> models.Delivery:
    delivery = models.Delivery(**data.model_dump())
    db.add(delivery)
    await db.commit()
    return delivery


async def check_in_delivery(
    db: AsyncSession,
    delivery_id: uuid.UUID,
    payload: schemas.DeliveryCheckIn,
) -> models.Delivery | None:
    delivery = await db.get(models.Delivery, delivery_id)
    if delivery is None:
        return None
    if delivery.status == "entregada":
        raise ValueError("La entrega ya estaba marcada como entregada")
    delivery.status = "entregada"
    delivery.checked_in_at = datetime.now(timezone.utc)
    if payload.volunteer_id is not None:
        delivery.volunteer_id = payload.volunteer_id
    if payload.notes is not None:
        delivery.notes = payload.notes
    await db.commit()
    return delivery


async def get_family_summary(db: AsyncSession) -> schemas.FamilySummary:
    total = await db.scalar(select(func.count(models.Family.id))) or 0
    active = await db.scalar(
        select(func.count(models.Family.id)).where(models.Family.active.is_(True))
    ) or 0
    reus = await db.scalar(
        select(func.count(models.Family.id)).where(models.Family.site == "reus")
    ) or 0
    tgn = await db.scalar(
        select(func.count(models.Family.id)).where(models.Family.site == "tarragona")
    ) or 0
    people = await db.scalar(
        select(func.coalesce(func.sum(models.Family.adults + models.Family.minors), 0))
        .where(models.Family.active.is_(True))
    ) or 0

    return schemas.FamilySummary(
        total_families=int(total),
        active_families=int(active),
        reus_families=int(reus),
        tarragona_families=int(tgn),
        total_people=int(people),
    )


# ─── Import CSV ───
REQUIRED_FIELDS = {"reference_code", "site"}


def parse_csv(content: str) -> tuple[list[dict], list[str]]:
    """Parsea el CSV y devuelve (filas, errores_de_estructura)."""
    errors: list[str] = []
    rows: list[dict] = []

    try:
        reader = csv.DictReader(io.StringIO(content))
        if reader.fieldnames is None:
            return [], ["CSV vacío o sin cabecera"]

        headers = {h.strip() for h in reader.fieldnames}
        missing = REQUIRED_FIELDS - headers
        if missing:
            return [], [
                f"Faltan columnas obligatorias: {', '.join(sorted(missing))}"
            ]

        for i, row in enumerate(reader, start=2):  # línea 2 = primera de datos
            clean = {k.strip(): (v.strip() if isinstance(v, str) else v)
                     for k, v in row.items() if k}
            clean["_line"] = i
            rows.append(clean)
    except Exception as e:
        errors.append(f"Error parseando CSV: {e}")

    return rows, errors


def validate_row(row: dict) -> tuple[dict | None, str | None]:
    """Valida una fila. Devuelve (data, error)."""
    ref = row.get("reference_code", "").strip()
    if not ref:
        return None, "reference_code vacío"

    site = row.get("site", "").strip().lower()
    if site not in ("reus", "tarragona"):
        return None, f"site inválido: '{site}' (debe ser 'reus' o 'tarragona')"

    try:
        adults = int(row.get("adults", "0") or 0)
        if adults < 0:
            raise ValueError
    except (ValueError, TypeError):
        return None, "adults debe ser un número entero ≥ 0"

    try:
        minors = int(row.get("minors", "0") or 0)
        if minors < 0:
            raise ValueError
    except (ValueError, TypeError):
        return None, "minors debe ser un número entero ≥ 0"

    data = {
        "reference_code": ref,
        "site": site,
        "adults": adults,
        "minors": minors,
        "address": (row.get("address") or "").strip() or None,
        "phone": (row.get("phone") or "").strip() or None,
        "dietary_restrictions": (row.get("dietary_restrictions") or "").strip()
        or None,
        "notes": (row.get("notes") or "").strip() or None,
        "active": True,
    }
    return data, None


async def import_csv_preview(
    db: AsyncSession, content: str
) -> dict:
    """Analiza el CSV y devuelve un informe sin tocar la DB."""
    rows, struct_errors = parse_csv(content)

    if struct_errors:
        return {
            "total_rows": 0,
            "valid": 0,
            "invalid": 0,
            "duplicates": 0,
            "imported": 0,
            "errors": struct_errors,
            "rows": [],
        }

    # Reference codes existentes
    existing = await db.execute(select(models.Family.reference_code))
    existing_refs = {r[0] for r in existing.all()}

    seen_in_csv: set[str] = set()
    rows_report = []
    valid = 0
    invalid = 0
    duplicates = 0

    for row in rows:
        line = row.pop("_line")
        data, err = validate_row(row)
        status = "valid"
        message = None

        if err:
            status = "invalid"
            message = err
            invalid += 1
        else:
            ref = data["reference_code"]
            if ref in existing_refs:
                status = "duplicate"
                message = "Ya existe en la base de datos"
                duplicates += 1
            elif ref in seen_in_csv:
                status = "duplicate"
                message = "Duplicado en el propio CSV"
                duplicates += 1
            else:
                valid += 1
                seen_in_csv.add(ref)

        rows_report.append(
            {
                "line": line,
                "reference_code": row.get("reference_code", ""),
                "status": status,
                "message": message,
                "data": data,
            }
        )

    return {
        "total_rows": len(rows),
        "valid": valid,
        "invalid": invalid,
        "duplicates": duplicates,
        "imported": 0,
        "errors": [],
        "rows": rows_report,
    }


async def import_csv(
    db: AsyncSession, content: str
) -> dict:
    """Importa realmente. Omite duplicados y filas inválidas."""
    preview = await import_csv_preview(db, content)

    if preview["errors"]:
        return preview

    imported = 0
    for row in preview["rows"]:
        if row["status"] == "valid" and row["data"]:
            family = models.Family(**row["data"])
            db.add(family)
            imported += 1

    await db.commit()
    preview["imported"] = imported
    return preview
