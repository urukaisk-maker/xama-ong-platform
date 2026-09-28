"""add enum check constraints for site and delivery status

Revision ID: f1a2b3c4d5e6
Revises: 36df62e9921e
Create Date: 2026-09-28
"""
from alembic import op


revision = "f1a2b3c4d5e6"
down_revision = "36df62e9921e"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Normalizar por si hubiera mayúsculas o espacios residuales
    op.execute("UPDATE families   SET site   = LOWER(TRIM(site))   WHERE site   <> LOWER(TRIM(site))")
    op.execute("UPDATE deliveries SET site   = LOWER(TRIM(site))   WHERE site   <> LOWER(TRIM(site))")
    op.execute("UPDATE deliveries SET status = LOWER(TRIM(status)) WHERE status <> LOWER(TRIM(status))")

    op.create_check_constraint(
        "ck_families_site", "families",
        "site IN ('reus', 'tarragona')",
    )
    op.create_check_constraint(
        "ck_deliveries_site", "deliveries",
        "site IN ('reus', 'tarragona')",
    )
    op.create_check_constraint(
        "ck_deliveries_status", "deliveries",
        "status IN ('pendiente', 'entregada', 'cancelada')",
    )


def downgrade() -> None:
    op.drop_constraint("ck_deliveries_status", "deliveries", type_="check")
    op.drop_constraint("ck_deliveries_site", "deliveries", type_="check")
    op.drop_constraint("ck_families_site", "families", type_="check")
